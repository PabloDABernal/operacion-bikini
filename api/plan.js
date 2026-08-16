// Proxy hacia Gemini para las dietas y las tablas de ejercicio (specs 017 y
// 027).
//
// A diferencia de api/consulta.js, aquí no hay conversación: se pide una cosa
// concreta y se devuelve en una sola vuelta. Siempre la semana entera, de
// lunes a domingo, y respetando lo que el usuario haya pedido a mano.

const { peticionAutorizada, describirRegistros, generarJson } = require("./_ia");

// Lo que el usuario escriba en "¿algo que deba tener en cuenta?".
const MAXIMO_INSTRUCCIONES = 500;

const COMUN = `Eres un nutricionista y entrenador personal que atiende a una persona concreta.

Hablas SIEMPRE en español, tuteando, en tono cercano y directo.
No des diagnósticos médicos. Si algo te parece preocupante, recomienda consultar a un médico.
No inventes datos que no te hayan dado: si algo no lo sabes, da la pauta de forma general.`;

const INSTRUCCIONES = {
  ejercicio: `${COMUN}

Te piden una TABLA DE EJERCICIO para la semana. Devuélvela en el campo "ejercicio" y deja "nutricion" vacío.

- SIEMPRE los siete días, de lunes a domingo, una línea por día que empieza por el nombre del día.
- En cada ejercicio, series y repeticiones, o duración e intensidad.
- Respeta el material del que dispone y sus limitaciones. Si no sabes qué material tiene, propón cosas que se puedan hacer en casa sin nada.
- Marca los días de descanso como descanso, que también son parte del plan.
- Máximo 250 palabras.`,

  dieta: `${COMUN}

Te piden una DIETA para la semana. Devuélvela en el campo "nutricion" y deja "ejercicio" vacío.

- SIEMPRE los siete días, de lunes a domingo, y dentro de cada día: desayuno, comida, merienda y cena.
- Raciones aproximadas y caseras ("un plato hondo", "un puñado"), NUNCA calorías exactas ni gramos al detalle: sería precisión fingida.
- Respeta sus gustos, aversiones, alergias e intolerancias. Si no las sabes, evita los alergenos más habituales y dilo.
- Comida normal y de supermercado español, nada exótico ni caro.
- Máximo 350 palabras.`
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

// Lo que pide el usuario a mano manda sobre lo que la IA propondría por su
// cuenta: si le dice que el jueves sale a comer, el jueves va libre.
function loQuePide(instrucciones) {
  const texto = String(instrucciones || "").trim().slice(0, MAXIMO_INSTRUCCIONES);
  if (!texto) return "";

  return (
    "\n\nAdemás, te pido expresamente lo siguiente y tienes que respetarlo:\n" +
    texto +
    "\n\nSi algo de lo que te pido no es razonable, hazlo igualmente pero dilo " +
    "en una línea al final, en vez de ignorarlo sin avisar."
  );
}

module.exports = async (req, res) => {
  if (!(await peticionAutorizada(req, res))) return;

  const cuerpo = req.body || {};
  const tipo = cuerpo.tipo;

  if (!INSTRUCCIONES[tipo]) {
    return res.status(400).json({ error: "peticion-invalida" });
  }

  const queEs =
    tipo === "ejercicio" ? "una tabla de ejercicio" : "una dieta detallada";

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
                `Quiero ${queEs} para la semana, de lunes a domingo.\n\n` +
                "Estos son mis registros de los últimos 14 días:\n\n" +
                describirRegistros(cuerpo.registros || {}) +
                contexto(cuerpo.nombre, cuerpo.perfil) +
                loQuePide(cuerpo.instrucciones)
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: ESQUEMA
      }
    },
    `Plan (${tipo})`
  );

  // generarJson ya ha respondido si algo falló.
  if (!respuesta) return;

  // Se guarda lo que venga en el campo que toca según lo pedido: si la IA se
  // equivoca de campo, es como si no hubiera contestado.
  const contenido = tipo === "ejercicio" ? respuesta.ejercicio : respuesta.nutricion;

  if (!contenido) {
    console.error(`Plan sin contenido en el campo de ${tipo}.`);
    return res.status(502).json({ error: "respuesta-ilegible" });
  }

  return res.status(200).json({
    nutricion: tipo === "dieta" ? contenido : "",
    ejercicio: tipo === "ejercicio" ? contenido : ""
  });
};
