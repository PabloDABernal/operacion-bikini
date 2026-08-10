// Proxy hacia Gemini. Es la única pieza del proyecto que ve la clave de la IA.
//
// El repositorio es público, así que la URL de esta función es conocida: sin
// validar quién llama, cualquiera podría agotar la cuota gratuita diaria.
// Por eso se exige un ID token de Firebase válido y de un email autorizado
// ANTES de llamar a Gemini.

// Los nombres de la familia Flash cambian con las versiones y no todos están
// disponibles para todas las claves: Google responde 404 al que no existe.
// Se prueban en orden de preferencia y se usa el primero que conteste.
const MODELOS = [
  "gemini-2.5-flash",
  "gemini-flash-latest",
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

const INSTRUCCIONES = `Eres un nutricionista y entrenador personal que hace seguimiento a una persona concreta.

Analiza sus datos de los últimos 14 días y responde SIEMPRE en español, tuteando, en tono cercano y directo.

Reglas:
- Usa exclusivamente los datos que te paso. No inventes pesos, comidas ni ejercicios que no estén.
- Si hay pocos datos, dilo con naturalidad y ajusta el consejo a lo que hay.
- No des diagnósticos médicos ni hables de enfermedades. Si algo te parece preocupante, recomienda consultar a un médico.
- Sé breve: entre los tres apartados, no pases de 200 palabras.

Devuelve un JSON con exactamente estas tres claves:
- "queVeo": qué observas en sus datos (tendencia de peso, patrones de comida, constancia con el ejercicio).
- "queHacer": dos o tres pautas concretas y realizables para esta semana.
- "ojoCon": un aviso o riesgo concreto al que prestar atención.`;

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

function describirRegistros({ pesajes, comidas, ejercicios }) {
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

async function llamarAModelo(modelo, registros) {
  const respuesta = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: INSTRUCCIONES }] },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Estos son mis datos de los últimos 14 días:\n\n${describirRegistros(registros)}`
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              queVeo: { type: "STRING" },
              queHacer: { type: "STRING" },
              ojoCon: { type: "STRING" }
            },
            required: ["queVeo", "queHacer", "ojoCon"]
          }
        }
      })
    }
  );

  return respuesta;
}

// Prueba los modelos en orden. Un 404 significa "ese nombre no existe para
// esta clave": se pasa al siguiente. Cualquier otra respuesta se devuelve tal
// cual, porque ya no es un problema de nombre (cuota, permisos, etc.).
async function pedirConsejoAGemini(registros) {
  let ultimaRespuesta;

  for (const modelo of MODELOS) {
    ultimaRespuesta = await llamarAModelo(modelo, registros);

    if (ultimaRespuesta.status !== 404) {
      if (ultimaRespuesta.ok) console.log(`Consejo generado con ${modelo}.`);
      return ultimaRespuesta;
    }

    console.error(`El modelo ${modelo} no existe para esta clave, probando el siguiente.`);
  }

  await registrarModelosDisponibles();
  return ultimaRespuesta;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "metodo-no-permitido" });
  }

  const cabecera = req.headers.authorization || "";
  const idToken = cabecera.startsWith("Bearer ") ? cabecera.slice(7) : "";

  if (!idToken) {
    return res.status(401).json({ error: "sin-token" });
  }

  let email;
  try {
    email = await emailDelToken(idToken);
  } catch {
    return res.status(401).json({ error: "token-no-verificable" });
  }

  if (!email || !EMAILS_AUTORIZADOS.includes(email)) {
    return res.status(401).json({ error: "no-autorizado" });
  }

  const registros = (req.body && req.body.registros) || {};
  const pesajes = registros.pesajes || [];
  const comidas = registros.comidas || [];
  const ejercicios = registros.ejercicios || [];

  if (!pesajes.length && !comidas.length && !ejercicios.length) {
    return res.status(400).json({ error: "sin-datos" });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error("Falta la variable de entorno GEMINI_API_KEY en este despliegue.");
    return res.status(502).json({ error: "gemini-error" });
  }

  let respuestaGemini;
  try {
    respuestaGemini = await pedirConsejoAGemini({ pesajes, comidas, ejercicios });
  } catch (fallo) {
    console.error(`No se pudo llamar a Gemini: ${fallo.message}`);
    return res.status(502).json({ error: "gemini-inalcanzable" });
  }

  if (respuestaGemini.status === 429) {
    return res.status(429).json({ error: "cuota-agotada" });
  }
  if (!respuestaGemini.ok) {
    // El detalle solo va a los logs de Vercel, nunca al navegador: el mensaje
    // de error de Google puede incluir parte de la petición.
    const detalle = await respuestaGemini.text().catch(() => "(sin cuerpo)");
    console.error(`Gemini respondió ${respuestaGemini.status}: ${detalle}`);
    // Se devuelve solo el código HTTP, nunca el cuerpo del error: el mensaje de
    // Google puede incluir parte de la petición. El código basta para diagnosticar.
    return res.status(502).json({ error: "gemini-error", estado: respuestaGemini.status });
  }

  let consejo;
  try {
    const datos = await respuestaGemini.json();
    const texto = datos.candidates[0].content.parts[0].text;
    consejo = JSON.parse(texto);
  } catch {
    return res.status(502).json({ error: "respuesta-ilegible" });
  }

  if (!consejo.queVeo || !consejo.queHacer || !consejo.ojoCon) {
    return res.status(502).json({ error: "respuesta-ilegible" });
  }

  return res.status(200).json({
    queVeo: consejo.queVeo,
    queHacer: consejo.queHacer,
    ojoCon: consejo.ojoCon
  });
};
