// Proxy hacia Gemini para las consultas especializadas (spec 017).
//
// A diferencia de api/consulta.js, aquí no hay conversación: se pide una cosa
// concreta y se devuelve en una sola vuelta.

const { peticionAutorizada, describirRegistros, generarJson } = require("./_ia");

const COMUN = `Eres un nutricionista y entrenador personal que atiende a una persona concreta.

Hablas SIEMPRE en español, tuteando, en tono cercano y directo.
No des diagnósticos médicos. Si algo te parece preocupante, recomienda consultar a un médico.
No inventes datos que no te hayan dado: si algo no lo sabes, da la pauta de forma general.`;

const INSTRUCCIONES = {
  ejercicio: `${COMUN}

Te piden una TABLA DE EJERCICIO. Devuélvela en el campo "ejercicio" y deja "nutricion" vacío.

- Si te piden la tabla PARA HOY, devuelve SOLO la sesión de hoy: un único entrenamiento, sin repartir nada por días de la semana y sin mencionar otros días.
- Si te la piden PARA LA SEMANA, entonces sí: una línea por día, empezando cada línea con el día.
- En cada ejercicio, series y repeticiones, o duración e intensidad.
- Respeta el material del que dispone y sus limitaciones. Si no sabes qué material tiene, propón cosas que se puedan hacer en casa sin nada.
- En la tabla de la semana, marca los días de descanso como descanso, que también son parte del plan. En la de hoy no menciones descansos de otros días.
- Máximo 250 palabras.`,

  dieta: `${COMUN}

Te piden una DIETA DETALLADA. Devuélvela en el campo "nutricion" y deja "ejercicio" vacío.

- Organizada por días, y dentro de cada día por comidas: desayuno, comida, merienda y cena.
- Raciones aproximadas y caseras ("un plato hondo", "un puñado"), NUNCA calorías exactas ni gramos al detalle: sería precisión fingida.
- Respeta sus gustos, aversiones, alergias e intolerancias. Si no las sabes, evita los alergenos más habituales y dilo.
- Comida normal y de supermercado español, nada exótico ni caro.
- Máximo 300 palabras.`
};

const ALCANCES = {
  hoy: "solo para hoy, una única sesión",
  semana: "para los próximos siete días",
  "3dias": "para los próximos tres días",
  "7dias": "para los próximos siete días"
};

// Los dos campos son obligatorios aunque solo se rellene uno: con campos
// opcionales, Gemini se los salta (aprendido en la spec 004).
const ESQUEMA = {
  type: "OBJECT",
  properties: {
    nutricion: { type: "STRING" },
    ejercicio: { type: "STRING" }
  },
  required: ["nutricion", "ejercicio"]
};

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

  const cuerpo = req.body || {};
  const tipo = cuerpo.tipo;
  const alcance = cuerpo.alcance;

  if (!INSTRUCCIONES[tipo] || !ALCANCES[alcance]) {
    return res.status(400).json({ error: "peticion-invalida" });
  }

  const queEs = tipo === "ejercicio" ? "una tabla de ejercicio" : "una dieta detallada";

  const respuesta = await generarJson(
    res,
    {
      systemInstruction: { parts: [{ text: INSTRUCCIONES[tipo] }] },
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                `Quiero ${queEs} ${ALCANCES[alcance]}.\n\n` +
                "Estos son mis registros de los últimos 14 días:\n\n" +
                describirRegistros(cuerpo.registros || {}) +
                contexto(cuerpo.nombre, cuerpo.perfil)
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: ESQUEMA
      }
    },
    `Plan especializado (${tipo}, ${alcance})`
  );

  // generarJson ya ha respondido si algo falló.
  if (!respuesta) return;

  // Se guarda lo que venga en el campo que toca según lo pedido: si la IA se
  // equivoca de campo, es como si no hubiera contestado.
  const contenido = tipo === "ejercicio" ? respuesta.ejercicio : respuesta.nutricion;

  if (!contenido) {
    console.error(`Plan especializado sin contenido en el campo de ${tipo}.`);
    return res.status(502).json({ error: "respuesta-ilegible" });
  }

  return res.status(200).json({
    nutricion: tipo === "dieta" ? contenido : "",
    ejercicio: tipo === "ejercicio" ? contenido : ""
  });
};
