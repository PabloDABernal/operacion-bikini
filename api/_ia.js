// Piezas compartidas por las funciones de IA (api/consejo.js, api/consulta.js).
//
// El repositorio es público, así que las URLs de estas funciones son conocidas:
// sin validar quién llama, cualquiera podría agotar la cuota gratuita diaria.
// De ahí que todo lo de aquí gire alrededor de exigir un ID token válido ANTES
// de gastar una sola llamada a Gemini.
//
// El prefijo "_" del nombre evita que Vercel publique este archivo como una
// ruta más de la API.

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

// apiKey pública del proyecto Firebase (la misma que js/firebase-config.js).
// No es un secreto: solo sirve para identificar el proyecto al validar el token.
const FIREBASE_API_KEY = "AIzaSyCLYCIknr0aJDO0E8Sp4YmAMW3Hpnxo8Bw";

// Tercera copia de la lista blanca, en minúsculas (cliente y firestore.rules
// tienen las otras dos). Al añadir a alguien hay que tocar las tres.
const EMAILS_AUTORIZADOS = [
  "pantonbernal@gmail.com",
  "angels_recio@hotmail.com"
];

// Valida el ID token contra el endpoint público de Google Identity Toolkit.
// No hace falta el SDK de Firebase Admin ni una cuenta de servicio.
async function emailDelToken(idToken) {
  const respuesta = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    }
  );

  if (!respuesta.ok) return null;

  const datos = await respuesta.json();
  const usuario = datos.users && datos.users[0];
  if (!usuario || !usuario.email) return null;

  return usuario.email.toLowerCase();
}

// Comprueba método y credenciales. Si algo falla, responde e indica que la
// petición ya está contestada; quien llama solo tiene que dejar de trabajar.
// Devuelve true si se puede continuar.
async function peticionAutorizada(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "metodo-no-permitido" });
    return false;
  }

  const cabecera = req.headers.authorization || "";
  const idToken = cabecera.startsWith("Bearer ") ? cabecera.slice(7) : "";

  if (!idToken) {
    res.status(401).json({ error: "sin-token" });
    return false;
  }

  let email;
  try {
    email = await emailDelToken(idToken);
  } catch {
    res.status(401).json({ error: "token-no-verificable" });
    return false;
  }

  if (!email || !EMAILS_AUTORIZADOS.includes(email)) {
    res.status(401).json({ error: "no-autorizado" });
    return false;
  }

  return true;
}

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

  if (respuesta.status === 429) {
    res.status(429).json({ error: "cuota-agotada" });
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
