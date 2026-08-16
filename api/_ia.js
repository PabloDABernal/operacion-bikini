// Piezas compartidas por las funciones de IA (api/consejo.js, api/consulta.js).
//
// La validación de credenciales vive ahora en api/_auth.js, porque la comparte
// con la función de fotos. Se re-exporta desde aquí para que consejo.js y
// consulta.js no tengan que cambiar: son las dos piezas ya probadas en
// producción y no compensa tocarlas por una reorganización interna.
//
// El prefijo "_" del nombre evita que Vercel publique este archivo como una
// ruta más de la API.

const { peticionAutorizada } = require("./_auth");

// Los nombres de la familia Flash cambian con las versiones y no todos están
// disponibles para todas las claves: Google responde 404 al que no existe.
// Se prueban en orden de preferencia y se usa el primero que conteste.
// gemini-flash-latest va primero porque es el que responde con la clave del
// proyecto; probar antes 2.5-flash gastaba una llamada fallida en cada turno.
const MODELOS = [
  "gemini-flash-latest",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash"
];

// Resumen de los registros del usuario, en texto plano para el prompt.
function describirRegistros({ pesajes = [], comidas = [], ejercicios = [] }) {
  const lineas = [];

  lineas.push("PESAJES (kg):");
  lineas.push(
    pesajes.length
      ? pesajes.map((p) => `- ${p.fecha}: ${p.pesoKg} kg`).join("\n")
      : "- sin registros"
  );

  lineas.push("\nCOMIDAS:");
  lineas.push(
    comidas.length
      ? comidas.map((c) => `- ${c.fecha} (${c.momento}): ${c.texto}`).join("\n")
      : "- sin registros"
  );

  lineas.push("\nEJERCICIO:");
  lineas.push(
    ejercicios.length
      ? ejercicios
          .map((e) => `- ${e.fecha}: ${e.texto}, ${e.minutos} min, intensidad ${e.intensidad}`)
          .join("\n")
      : "- sin registros"
  );

  return lineas.join("\n");
}

// Deja en los logs qué modelos acepta esta clave, para no volver a adivinar.
async function registrarModelosDisponibles() {
  try {
    const respuesta = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
    );
    const datos = await respuesta.json();
    const nombres = (datos.models || []).map((modelo) => modelo.name).join(", ");
    console.error(`Modelos disponibles para esta clave: ${nombres || "(ninguno)"}`);
  } catch (fallo) {
    console.error(`No se pudo listar los modelos: ${fallo.message}`);
  }
}

// Prueba los modelos en orden. Un 404 significa "ese nombre no existe para
// esta clave": se pasa al siguiente. Cualquier otra respuesta se devuelve tal
// cual, porque ya no es un problema de nombre (cuota, permisos, etc.).
//
// `cuerpo` es el JSON de la petición a generateContent, sin el modelo.
async function llamarAGemini(cuerpo, etiqueta) {
  let ultimaRespuesta;

  for (const modelo of MODELOS) {
    // Margen de salida amplio para que quepan los dos bloques del plan.
    //
    // Aquí hubo un intento de desactivar el razonamiento con thinkingConfig
    // para ahorrar tokens: gemini-flash-latest lo rechaza con un 400, así que
    // se quitó. Si algún día se vuelve a intentar, hay que probarlo modelo a
    // modelo antes de darlo por bueno.
    const cuerpoDelModelo = {
      ...cuerpo,
      generationConfig: {
        ...cuerpo.generationConfig,
        maxOutputTokens: 8192
      }
    };

    ultimaRespuesta = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpoDelModelo)
      }
    );

    if (ultimaRespuesta.status !== 404) {
      if (ultimaRespuesta.ok) console.log(`${etiqueta} generado con ${modelo}.`);
      return ultimaRespuesta;
    }

    console.error(`El modelo ${modelo} no existe para esta clave, probando el siguiente.`);
  }

  await registrarModelosDisponibles();
  return ultimaRespuesta;
}

// --- Proveedor de reserva: Groq (spec 020) -------------------------------
//
// Cuando Google dice que está saturado o sin cuota, se le pregunta a otro. Es
// otra empresa, con otra infraestructura y otra cuota gratuita, así que un mal
// día suyo no tiene por qué ser un mal día nuestro.
//
// Gemini sigue siendo el primero: es el que mejor respeta el esquema JSON, y
// aquí eso importa (en la spec 004 llegaban planes sin rutina de ejercicio).

// Como con Gemini: los nombres de los modelos abiertos cambian a menudo y no
// todas las claves tienen los mismos. Se usa el primero que conteste.
const MODELOS_GROQ = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "openai/gpt-oss-120b"
];

// Groq no acepta un esquema de respuesta, así que el formato se le pide por
// escrito. Con "json_object" a secas devuelve JSON válido pero con las claves
// que le apetezcan.
function describirEsquema(esquema) {
  if (!esquema || !esquema.properties) return "";

  const claves = esquema.required || Object.keys(esquema.properties);
  const detalles = claves.map((clave) => {
    const propiedad = esquema.properties[clave] || {};
    return propiedad.enum ? `"${clave}" (uno de: ${propiedad.enum.join(", ")})` : `"${clave}"`;
  });

  return (
    "\n\nResponde SOLO con un objeto JSON, sin texto alrededor y sin markdown. " +
    `Tiene que llevar estas claves, TODAS obligatorias y de tipo texto: ${detalles.join(", ")}. ` +
    "Las que no apliquen, déjalas como cadena vacía."
  );
}

// La app habla en formato Gemini; Groq usa el de OpenAI. La traducción vive
// aquí y solo aquí, para no tocar consejo.js, consulta.js ni plan.js.
function aFormatoGroq(cuerpo, modelo) {
  const sistema =
    (cuerpo.systemInstruction && cuerpo.systemInstruction.parts
      ? cuerpo.systemInstruction.parts.map((parte) => parte.text).join("\n")
      : "") + describirEsquema(cuerpo.generationConfig && cuerpo.generationConfig.responseSchema);

  const mensajes = (cuerpo.contents || []).map((entrada) => ({
    role: entrada.role === "model" ? "assistant" : "user",
    content: (entrada.parts || []).map((parte) => parte.text).join("\n")
  }));

  return {
    model: modelo,
    messages: sistema ? [{ role: "system", content: sistema }, ...mensajes] : mensajes,
    response_format: { type: "json_object" },
    max_tokens: 4096
  };
}

// Copiar y pegar una clave en el panel de Vercel se lleva a veces un espacio,
// un salto de línea o las comillas. Groq responde 401 y parece que la clave
// esté mal cuando solo está sucia.
function claveDeGroq() {
  return String(process.env.GROQ_API_KEY || "")
    .trim()
    .replace(/^["']|["']$/g, "");
}

async function llamarAGroq(cuerpo, etiqueta) {
  let ultimaRespuesta;
  const clave = claveDeGroq();

  for (const modelo of MODELOS_GROQ) {
    ultimaRespuesta = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${clave}`
      },
      body: JSON.stringify(aFormatoGroq(cuerpo, modelo))
    });

    // 404 y 400 con "model" suelen significar que ese nombre no existe para
    // esta clave; el resto ya no es un problema de nombre.
    if (ultimaRespuesta.status !== 404) {
      if (ultimaRespuesta.ok) console.log(`${etiqueta} generado con Groq (${modelo}).`);
      return ultimaRespuesta;
    }

    console.error(`El modelo ${modelo} no existe en Groq para esta clave, probando el siguiente.`);
  }

  return ultimaRespuesta;
}

// Saca el JSON de la respuesta de Groq y lo completa: los modelos abiertos se
// saltan campos, y el resto del código da por hecho que están todos.
function jsonDeGroq(datos, esquema) {
  const mensaje = datos.choices && datos.choices[0] && datos.choices[0].message;
  if (!mensaje || typeof mensaje.content !== "string") return null;

  let objeto;
  try {
    objeto = JSON.parse(mensaje.content);
  } catch {
    return null;
  }

  const claves = (esquema && esquema.required) || [];
  claves.forEach((clave) => {
    if (typeof objeto[clave] !== "string") objeto[clave] = "";
  });

  return objeto;
}

// Llama a Gemini y devuelve el JSON ya parseado, o null con la respuesta ya
// enviada si algo ha fallado. Centraliza el mapeo de errores para que las dos
// funciones den exactamente los mismos códigos.
async function generarJson(res, cuerpo, etiqueta) {
  if (!process.env.GEMINI_API_KEY) {
    console.error("Falta la variable de entorno GEMINI_API_KEY en este despliegue.");
    res.status(502).json({ error: "gemini-error" });
    return null;
  }

  let respuesta;
  try {
    respuesta = await llamarAGemini(cuerpo, etiqueta);
  } catch (fallo) {
    console.error(`No se pudo llamar a Gemini: ${fallo.message}`);
    res.status(502).json({ error: "gemini-inalcanzable" });
    return null;
  }

  // Si Google está saturado, sin cuota o roto, se le pregunta a Groq. Un 400
  // NO salta de proveedor: significa que la petición está mal formada, y
  // mandársela a otro solo escondería el fallo.
  const mereceReserva =
    respuesta.status === 429 || respuesta.status === 503 || respuesta.status >= 500;

  // Por qué la reserva no salvó la petición. Va al navegador junto al error
  // para no tener que bucear en los logs: sin esto, "la IA está saturada" no
  // distingue "falta la clave de Groq" de "Groq también ha fallado".
  let reserva = "no-hacia-falta";

  if (mereceReserva) {
    if (!process.env.GROQ_API_KEY) {
      reserva = "sin-clave";
      console.error("Gemini falló y no hay GROQ_API_KEY: no hay reserva posible.");
    } else {
      console.error(`Gemini respondió ${respuesta.status}: se prueba con Groq.`);
      const esquema = cuerpo.generationConfig && cuerpo.generationConfig.responseSchema;

      try {
        const deGroq = await llamarAGroq(cuerpo, etiqueta);

        if (deGroq && deGroq.ok) {
          const objeto = jsonDeGroq(await deGroq.json(), esquema);
          if (objeto) return objeto;
          reserva = "json-ilegible";
          console.error("Groq devolvió algo que no es el JSON esperado.");
        } else if (deGroq) {
          reserva = `http-${deGroq.status}`;
          const detalle = await deGroq.text().catch(() => "(sin cuerpo)");
          console.error(`Groq respondió ${deGroq.status}: ${detalle.slice(0, 300)}`);

          // Un 401 casi siempre es la clave mal pegada. Se registra su forma,
          // nunca su contenido, para poder descartarlo sin verla.
          if (deGroq.status === 401) {
            // La forma de la clave (cuánto mide y su prefijo) no es secreta y
            // resuelve el 401 de un vistazo: una clave truncada o de otro
            // sitio se ve enseguida. El contenido no sale nunca de aquí.
            const clave = claveDeGroq();
            // Todas las claves de Groq miden 56 y empiezan por "gsk_", así que
            // la forma no distingue una clave de otra. La huella sí: son los
            // primeros caracteres de su SHA-256, que se pueden calcular
            // también en el equipo del usuario y comparar. No permite
            // reconstruir la clave.
            const huella = require("crypto")
              .createHash("sha256")
              .update(clave)
              .digest("hex")
              .slice(0, 8);

            reserva = `http-401 · clave de ${clave.length} car., huella ${huella}`;
            console.error(
              `La clave de Groq mide ${clave.length} caracteres, empieza por ` +
                `"${clave.slice(0, 4)}" y su huella SHA-256 empieza por ${huella}.`
            );
          }
        }
      } catch (fallo) {
        reserva = "inalcanzable";
        console.error(`No se pudo llamar a Groq: ${fallo.message}`);
      }
    }
    // Si Groq tampoco puede, se sigue abajo y gana el error de Gemini, que es
    // el que mejor explica qué pasa (cuota agotada o saturación).
  }

  if (respuesta.status === 429) {
    res.status(429).json({ error: "cuota-agotada", reserva });
    return null;
  }

  if (respuesta.status === 503) {
    console.error("Gemini saturado y sin reserva disponible.");
    res.status(503).json({ error: "ia-saturada", reserva });
    return null;
  }

  if (!respuesta.ok) {
    // El detalle solo va a los logs de Vercel, nunca al navegador: el mensaje
    // de error de Google puede incluir parte de la petición. Al navegador va
    // solo el código HTTP, que basta para diagnosticar.
    const detalle = await respuesta.text().catch(() => "(sin cuerpo)");
    console.error(`Gemini respondió ${respuesta.status}: ${detalle}`);
    res.status(502).json({ error: "gemini-error", estado: respuesta.status });
    return null;
  }

  let datos;
  try {
    datos = await respuesta.json();
  } catch {
    console.error("Gemini devolvió algo que no es JSON.");
    res.status(502).json({ error: "respuesta-ilegible" });
    return null;
  }

  const candidato = datos.candidates && datos.candidates[0];
  const parte = candidato && candidato.content && candidato.content.parts
    ? candidato.content.parts[0]
    : null;

  if (!parte || typeof parte.text !== "string") {
    // finishReason dice si se cortó por longitud (MAX_TOKENS) o por filtros
    // de seguridad (SAFETY), que son problemas muy distintos.
    console.error(
      `Respuesta sin texto. finishReason=${candidato ? candidato.finishReason : "(sin candidato)"}, ` +
        `promptFeedback=${JSON.stringify(datos.promptFeedback || null)}`
    );
    res.status(502).json({ error: "respuesta-ilegible" });
    return null;
  }

  // STOP es el final normal. Cualquier otra cosa (MAX_TOKENS, SAFETY) explica
  // por qué el JSON puede venir a medias o con campos ausentes.
  if (candidato.finishReason && candidato.finishReason !== "STOP") {
    console.error(`Generación terminada por ${candidato.finishReason}, la respuesta puede venir incompleta.`);
  }

  try {
    return JSON.parse(parte.text);
  } catch {
    console.error(
      `JSON ilegible (finishReason=${candidato.finishReason}, ${parte.text.length} caracteres): ` +
        parte.text.slice(0, 300)
    );
    res.status(502).json({ error: "respuesta-ilegible" });
    return null;
  }
}

module.exports = {
  peticionAutorizada,
  describirRegistros,
  generarJson
};
