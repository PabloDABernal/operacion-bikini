// Proxy hacia Gemini para el botón "Consejos" (spec 003).
// La validación de credenciales y la llamada a Gemini viven en api/_ia.js.

const { peticionAutorizada, describirRegistros, generarJson } = require("./_ia");

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

// Lo que la IA ya sabe de esta persona, para no dar consejos genéricos.
function contexto(nombre, perfil) {
  if (!nombre && !perfil) return "";
  return (
    "\n\n" +
    (nombre ? `Me llamo ${nombre}.` : "") +
    (perfil ? ` Esto es lo que ya sabes de mí: ${perfil}` : "")
  );
}

module.exports = async (req, res) => {
  if (!(await peticionAutorizada(req, res))) return;

  const registros = (req.body && req.body.registros) || {};
  const pesajes = registros.pesajes || [];
  const comidas = registros.comidas || [];
  const ejercicios = registros.ejercicios || [];

  if (!pesajes.length && !comidas.length && !ejercicios.length) {
    return res.status(400).json({ error: "sin-datos" });
  }

  const consejo = await generarJson(
    res,
    {
      systemInstruction: { parts: [{ text: INSTRUCCIONES }] },
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                "Estos son mis datos de los últimos 14 días:\n\n" +
                describirRegistros({ pesajes, comidas, ejercicios }) +
                // Lo que salió de la entrevista de bienvenida (spec 016): el
                // consejo deja de ser genérico y tiene en cuenta a quién se lo
                // está dando.
                contexto(req.body.nombre, req.body.perfil)
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
    },
    "Consejo"
  );

  // generarJson ya ha respondido si algo falló.
  if (!consejo) return;

  if (!consejo.queVeo || !consejo.queHacer || !consejo.ojoCon) {
    return res.status(502).json({ error: "respuesta-ilegible" });
  }

  return res.status(200).json({
    queVeo: consejo.queVeo,
    queHacer: consejo.queHacer,
    ojoCon: consejo.ojoCon
  });
};
