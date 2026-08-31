// Piezas compartidas por las funciones de IA (api/consulta.js, api/dieta.js,
// api/tabla.js, api/analisis.js).
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

// Topes del bloque de registros que va DENTRO del prompt (spec 049). Sin esto
// crecía sin freno: la spec 045 pasó la ventana de la revisión de 14 días
// fijos a un mes, y aquí se escribe una línea por registro, así que un mes
// apuntando cinco comidas al día son doscientas líneas. Groq responde 413
// (petición demasiado grande para su límite de tokens por minuto) mucho antes
// que Gemini, y la reserva se caía justo cuando más falta hacía.
//
// Tres constantes y no una compartida: cada bloque crece a su ritmo.
const MAXIMO_PESAJES = 30;
const MAXIMO_COMIDAS = 60;
const MAXIMO_EJERCICIOS = 30;
// Las bebidas (spec 062), con su tope como todo lo demas: la leccion del 413 de
// Groq de la spec 049.
const MAXIMO_BEBIDAS = 30;

// Se queda con los N primeros porque las listas llegan de MÁS RECIENTE a más
// antigua (así las ordenan listarPesajes/listarComidas/listarEjercicios, por
// fecha descendente). OJO: si algún día se cambiara ese orden, esto se
// quedaría con lo más viejo y no lo notaría nadie.
//
// Cuando recorta lo dice: si se callara, la IA daría por hecho que ahí empieza
// tu historial y podría echarte la bronca por dos semanas sin pesarte que en
// realidad no cabían.
function recortar(registros, maximo, describir) {
  if (!registros.length) return "- sin registros";

  const lineas = registros.slice(0, maximo).map(describir);
  const fuera = registros.length - lineas.length;
  if (fuera > 0) lineas.push(`- (y ${fuera} más antiguos, que no caben aquí)`);

  return lineas.join("\n");
}

// Resumen de los registros del usuario, en texto plano para el prompt.
function describirRegistros({ pesajes = [], comidas = [], ejercicios = [], bebidas = [] }) {
  const lineas = [];

  lineas.push("PESAJES (kg):");
  lineas.push(recortar(pesajes, MAXIMO_PESAJES, (p) => `- ${p.fecha}: ${p.pesoKg} kg`));

  lineas.push("\nCOMIDAS:");
  lineas.push(
    // Los acompañamientos van PEGADOS a su comida, en la misma línea y con un
    // "+" (spec 063). Nunca en una línea propia: eso se lee como otra ingesta,
    // que es justo lo que la spec vino a evitar. Lo que comió fueron lentejas
    // CON pan, no lentejas y luego pan.
    recortar(comidas, MAXIMO_COMIDAS, (c) => {
      const conQue = Array.isArray(c.acompanamientos) ? c.acompanamientos.filter(Boolean) : [];
      const extra = conQue.length ? ` + ${conQue.join(", ")}` : "";
      return `- ${c.fecha} (${c.momento}): ${c.texto}${extra}`;
    })
  );

  lineas.push("\nEJERCICIO:");
  lineas.push(
    recortar(
      ejercicios,
      MAXIMO_EJERCICIOS,
      (e) => `- ${e.fecha}: ${e.texto}, ${e.minutos} min, intensidad ${e.intensidad}`
    )
  );

  // Las bebidas (spec 062), en bloque propio. Solo se enseñan si hay alguna: un
  // encabezado vacío le diría a la IA que no bebes nada, que no es lo mismo que
  // no habértelo preguntado nunca.
  //
  // El agua NO está aquí: es un contador (spec 061), no un registro escrito.
  if (bebidas.length) {
    lineas.push("\nBEBIDAS (esto no incluye el agua):");
    lineas.push(recortar(bebidas, MAXIMO_BEBIDAS, (b) => `- ${b.fecha}: ${b.texto}`));
  }

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
    // Margen de salida amplio por defecto, para que quepan los dos bloques del
    // plan. Quien llama puede pedir uno más corto (la entrevista de bienvenida
    // lo hace: solo necesita un texto breve, y un margen enorme le da a
    // gemini-flash-latest más sitio para "pensar" antes de responder, lo que
    // la hace tardar más de la cuenta).
    //
    // Aquí hubo un intento de desactivar el razonamiento con thinkingConfig
    // para ahorrar tokens: gemini-flash-latest lo rechaza con un 400, así que
    // se quitó. Si algún día se vuelve a intentar, hay que probarlo modelo a
    // modelo antes de darlo por bueno.
    const cuerpoDelModelo = {
      ...cuerpo,
      generationConfig: {
        ...cuerpo.generationConfig,
        maxOutputTokens: (cuerpo.generationConfig && cuerpo.generationConfig.maxOutputTokens) || 8192
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
// Groq no acepta un esquema de respuesta, así que el formato se le describe
// por escrito. Antes esta descripción decía que TODAS las claves eran "de tipo
// texto", lo cual era mentira en cuanto una llevaba una lista dentro: la dieta
// de la spec 028 tiene siete días y sus recetas, y Groq los devolvía como
// texto plano, así que la semana llegaba vacía.
//
// Ahora se le dibuja la forma real, recursivamente.
function formaDe(propiedad) {
  if (!propiedad) return '"texto"';

  if (propiedad.type === "ARRAY") {
    return `[ ${formaDe(propiedad.items)} ]`;
  }

  if (propiedad.type === "OBJECT") {
    const claves = propiedad.required || Object.keys(propiedad.properties || {});
    const dentro = claves
      .map((clave) => `"${clave}": ${formaDe((propiedad.properties || {})[clave])}`)
      .join(", ");
    return `{ ${dentro} }`;
  }

  if (propiedad.enum) return `"uno de: ${propiedad.enum.join(" | ")}"`;

  return '"texto"';
}

function describirEsquema(esquema) {
  if (!esquema || !esquema.properties) return "";

  return (
    "\n\nResponde SOLO con un objeto JSON, sin texto alrededor y sin markdown, " +
    `con EXACTAMENTE esta forma:\n${formaDe(esquema)}\n` +
    "Todas las claves son obligatorias y tienen que llamarse así, en minúscula. " +
    "Respeta los tipos: donde hay una lista va una lista, no un texto. " +
    "Los textos que no apliquen, déjalos como cadena vacía."
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

    // Tres códigos significan lo mismo a efectos de decidir: ESTE modelo no
    // puede, otro quizá sí.
    // - 404: ese nombre no existe para esta clave.
    // - 429: ESE modelo se quedó sin cuota, no Groq entero (spec 032).
    // - 413: la petición no cabe en su límite de tokens por minuto (spec 049).
    // Los límites de Groq van POR MODELO, y el grande —el primero de la
    // lista— es el más tacaño de la capa gratuita en los tres sentidos.
    if (![404, 429, 413].includes(ultimaRespuesta.status)) {
      if (ultimaRespuesta.ok) console.log(`${etiqueta} generado con Groq (${modelo}).`);
      return ultimaRespuesta;
    }

    const motivo =
      ultimaRespuesta.status === 429
        ? "se quedó sin cuota"
        : ultimaRespuesta.status === 413
          ? "no admite una petición tan grande (límite de tokens por minuto)"
          : "no existe para esta clave";
    console.error(`El modelo ${modelo} de Groq ${motivo}, probando el siguiente.`);
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

  // Solo se rellenan los campos de TEXTO que falten. Antes se forzaba a cadena
  // vacía cualquier campo obligatorio que no fuera un string, y eso destrozaba
  // las respuestas con listas dentro: la dieta de la spec 028 llegaba entera y
  // se quedaba en nada.
  const propiedades = (esquema && esquema.properties) || {};
  ((esquema && esquema.required) || []).forEach((clave) => {
    const tipo = propiedades[clave] && propiedades[clave].type;
    if (tipo === "STRING" && typeof objeto[clave] !== "string") objeto[clave] = "";
  });

  return objeto;
}

// Un 429/503/5xx significa que el proveedor está saturado o sin cuota: se
// merece que se pruebe al otro. Un 400 NO: significa que la petición está mal
// formada, y mandársela a otro solo escondería el fallo. Se usa igual para
// los dos proveedores, en los dos sentidos (spec 032).
//
// El 413 también merece reserva (spec 049), y no solo dentro de Groq: si están
// elegidos "Groq primero" en Ajustes y los tres modelos se ahogan por tamaño,
// Gemini —que tiene mucho más margen— no llegaría a intentarse nunca.
function estadoMereceReserva(estado) {
  return estado === 429 || estado === 503 || estado === 413 || estado >= 500;
}

// Intenta Gemini e interpreta su propio formato de respuesta. Nunca escribe
// en `res`: solo informa de qué pasó, para que la decisión de qué responder
// al navegador quede en un único sitio (generarJson).
async function intentarGemini(cuerpo, etiqueta) {
  if (!process.env.GEMINI_API_KEY) {
    console.error("Falta la variable de entorno GEMINI_API_KEY en este despliegue.");
    return { ok: false, proveedor: "gemini", mereceReserva: true, motivo: "sin-clave" };
  }

  let respuesta;
  try {
    respuesta = await llamarAGemini(cuerpo, etiqueta);
  } catch (fallo) {
    console.error(`No se pudo llamar a Gemini: ${fallo.message}`);
    return { ok: false, proveedor: "gemini", mereceReserva: true, motivo: "inalcanzable" };
  }

  if (!respuesta.ok) {
    // El detalle solo va a los logs de Vercel, nunca al navegador: el mensaje
    // de error de Google puede incluir parte de la petición. Al navegador va
    // solo el código HTTP, que basta para diagnosticar.
    const detalle = await respuesta.text().catch(() => "(sin cuerpo)");
    console.error(`Gemini respondió ${respuesta.status}: ${detalle}`);
    return {
      ok: false,
      proveedor: "gemini",
      mereceReserva: estadoMereceReserva(respuesta.status),
      motivo: "http",
      estado: respuesta.status
    };
  }

  let datos;
  try {
    datos = await respuesta.json();
  } catch {
    console.error("Gemini devolvió algo que no es JSON.");
    return { ok: false, proveedor: "gemini", mereceReserva: true, motivo: "respuesta-ilegible" };
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
    return { ok: false, proveedor: "gemini", mereceReserva: true, motivo: "respuesta-ilegible" };
  }

  // STOP es el final normal. Cualquier otra cosa (MAX_TOKENS, SAFETY) explica
  // por qué el JSON puede venir a medias o con campos ausentes.
  if (candidato.finishReason && candidato.finishReason !== "STOP") {
    console.error(`Generación terminada por ${candidato.finishReason}, la respuesta puede venir incompleta.`);
  }

  try {
    return { ok: true, json: JSON.parse(parte.text) };
  } catch {
    console.error(
      `JSON ilegible (finishReason=${candidato.finishReason}, ${parte.text.length} caracteres): ` +
        parte.text.slice(0, 300)
    );
    return { ok: false, proveedor: "gemini", mereceReserva: true, motivo: "respuesta-ilegible" };
  }
}

// Intenta Groq e interpreta su propio formato de respuesta (OpenAI). Misma
// forma de resultado que intentarGemini, para que generarJson trate a los dos
// proveedores por igual.
async function intentarGroq(cuerpo, etiqueta) {
  if (!process.env.GROQ_API_KEY) {
    console.error("No hay GROQ_API_KEY: no se puede probar con Groq.");
    return { ok: false, proveedor: "groq", mereceReserva: true, motivo: "sin-clave" };
  }

  let respuesta;
  try {
    respuesta = await llamarAGroq(cuerpo, etiqueta);
  } catch (fallo) {
    console.error(`No se pudo llamar a Groq: ${fallo.message}`);
    return { ok: false, proveedor: "groq", mereceReserva: true, motivo: "inalcanzable" };
  }

  if (!respuesta.ok) {
    const detalle = await respuesta.text().catch(() => "(sin cuerpo)");
    console.error(`Groq respondió ${respuesta.status}: ${detalle.slice(0, 300)}`);

    // Un 401 casi siempre es la clave mal pegada. Se registra su forma, nunca
    // su contenido, para poder descartarlo sin verla.
    if (respuesta.status === 401) {
      // La forma de la clave (cuánto mide y su prefijo) no es secreta y
      // resuelve el 401 de un vistazo: una clave truncada o de otro sitio se
      // ve enseguida. El contenido no sale nunca de aquí. Todas las claves de
      // Groq miden 56 y empiezan por "gsk_", así que la forma no distingue
      // una clave de otra: la huella (los primeros caracteres de su
      // SHA-256) sí, y se puede calcular también en el equipo del usuario y
      // comparar sin reconstruir la clave.
      const clave = claveDeGroq();
      const huella = require("crypto")
        .createHash("sha256")
        .update(clave)
        .digest("hex")
        .slice(0, 8);

      console.error(
        `La clave de Groq mide ${clave.length} caracteres, empieza por ` +
          `"${clave.slice(0, 4)}" y su huella SHA-256 empieza por ${huella}.`
      );

      return {
        ok: false,
        proveedor: "groq",
        mereceReserva: estadoMereceReserva(respuesta.status),
        motivo: `http-401 · clave de ${clave.length} car., huella ${huella}`,
        estado: respuesta.status
      };
    }

    return {
      ok: false,
      proveedor: "groq",
      mereceReserva: estadoMereceReserva(respuesta.status),
      motivo: `http-${respuesta.status}`,
      estado: respuesta.status
    };
  }

  const esquema = cuerpo.generationConfig && cuerpo.generationConfig.responseSchema;
  const objeto = jsonDeGroq(await respuesta.json(), esquema);
  if (!objeto) {
    console.error("Groq devolvió algo que no es el JSON esperado.");
    return { ok: false, proveedor: "groq", mereceReserva: true, motivo: "json-ilegible" };
  }

  return { ok: true, json: objeto };
}

const INTENTOS = { gemini: intentarGemini, groq: intentarGroq };

// Convierte el resultado de fallo del segundo proveedor en el texto de
// "reserva" que ya se manda al navegador junto al error del primero: explica
// por qué la reserva no salvó la petición, sin tener que bucear en los logs.
function comoReserva(resultado) {
  return resultado.motivo === "http" ? `http-${resultado.estado}` : resultado.motivo;
}

// Construye la respuesta final a partir del fallo del proveedor que se
// intentó primero (el elegido): es el que mejor explica qué ha pasado. El
// campo `reserva` cuenta aparte qué le ha pasado al segundo, si se llegó a
// intentar.
function responderFalloFinal(res, primero, reserva) {
  // `proveedor` va en todas las respuestas: sin él, un "cuota-agotada" no dice
  // si fue Gemini o Groq quien la agotó, y con dos proveedores elegibles eso
  // ya no se puede dar por hecho como antes de esta spec.
  const proveedor = primero.proveedor;

  if (primero.estado === 429) {
    res.status(429).json({ error: "cuota-agotada", proveedor, reserva });
    return;
  }

  if (primero.estado === 503) {
    console.error(`${proveedor} saturado y sin reserva disponible.`);
    res.status(503).json({ error: "ia-saturada", proveedor, reserva });
    return;
  }

  if (primero.motivo === "respuesta-ilegible" || primero.motivo === "json-ilegible") {
    res.status(502).json({ error: "respuesta-ilegible", proveedor, reserva });
    return;
  }

  if (primero.motivo === "inalcanzable") {
    res.status(502).json({ error: "ia-inalcanzable", proveedor, reserva });
    return;
  }

  // sin-clave, o un HTTP que no sea 429/503/5xx (400, 401, 403, 404...).
  res.status(502).json({ error: "ia-error", proveedor, estado: primero.estado, reserva });
}

// Llama al proveedor elegido y, si hace falta, a su reserva; devuelve el JSON
// ya parseado, o null con la respuesta ya enviada si nada ha funcionado.
// `proveedor` es "automatico" (Gemini primero) o "groq-primero"; cualquier
// otro valor se trata como "automatico" (spec 032): el servidor no confía en
// lo que mande el navegador para decidir a quién preguntar.
// `esUtil` es opcional (spec 071): una función que mira el JSON ya parseado y
// dice si sirve para algo. Sin ella, cualquier JSON válido se da por bueno.
//
// Existe porque había un agujero: un proveedor podía devolver JSON perfectamente
// válido pero inservible —todos los campos de texto vacíos— y eso contaba como
// éxito, así que la reserva NO se intentaba y el usuario veía "La IA no ha
// sabido responder" teniendo el otro proveedor disponible y sin tocar.
//
// Ahora una respuesta inútil se trata como lo que es: un fallo de ese proveedor,
// y se le pregunta al otro.
async function generarJson(res, cuerpo, etiqueta, proveedor, esUtil) {
  const orden = proveedor === "groq-primero" ? ["groq", "gemini"] : ["gemini", "groq"];

  const intentar = async (cual) => {
    const salida = await INTENTOS[cual](cuerpo, etiqueta);
    if (!salida.ok) return salida;
    if (!esUtil || esUtil(salida.json)) return salida;

    console.error(
      `${cual} devolvió JSON válido pero inservible: ${JSON.stringify(salida.json).slice(0, 300)}`
    );
    return {
      ok: false,
      proveedor: cual,
      mereceReserva: true,
      motivo: "respuesta-ilegible"
    };
  };

  const primero = await intentar(orden[0]);
  if (primero.ok) return primero.json;

  let reserva = "no-hacia-falta";

  if (primero.mereceReserva) {
    const segundo = await intentar(orden[1]);
    if (segundo.ok) return segundo.json;
    reserva = comoReserva(segundo);
  }

  responderFalloFinal(res, primero, reserva);
  return null;
}

module.exports = {
  peticionAutorizada,
  describirRegistros,
  generarJson
};
