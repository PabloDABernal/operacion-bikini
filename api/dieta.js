// Proxy hacia Gemini para la dieta de la semana (spec 028).
//
// A diferencia de api/plan.js, que devuelve un texto para leer, aquí la semana
// viene estructurada: siete días con sus cuatro comidas, más las recetas de
// los platos principales. Sin eso no se podría editar ni apuntar con un toque.

const { peticionAutorizada, describirRegistros, generarJson } = require("./_ia");

const MAXIMO_INSTRUCCIONES = 500;

const DIAS = [
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
  "domingo"
];

const INSTRUCCIONES = `Eres un nutricionista que le prepara la semana a una persona concreta.

Hablas SIEMPRE en español, tuteando, en tono cercano y directo.
No des diagnósticos médicos. Si algo te parece preocupante, recomienda consultar a un médico.

Te piden la dieta de una semana entera, de lunes a domingo:
- CADA día lleva desayuno, comida, merienda y cena. Ninguno puede quedarse vacío.
- Cada comida es el nombre del plato, corto: "lentejas con verduras", "yogur con nueces". NO pongas cantidades ni explicaciones ahí.
- Comida normal y de supermercado español, nada exótico ni caro.
- Respeta sus gustos, aversiones, alergias e intolerancias. Si no las sabes, evita los alergenos más habituales.
- NUNCA calorías exactas ni gramos al detalle: sería precisión fingida.

Además, devuelve las RECETAS de los platos que haya que cocinar (comidas y cenas, no el yogur ni la fruta):
- Como mucho ocho recetas, las de los platos que más se repitan.
- De cada una: nombre exacto tal y como lo has escrito en la semana, para cuántas personas, ingredientes (uno por línea) y preparación en dos o tres frases.
- El nombre de la receta tiene que coincidir LETRA POR LETRA con el que has puesto en la semana, o no se podrán enlazar.`;

// Todos los campos obligatorios: con campos opcionales, Gemini se los salta
// (aprendido en la spec 004).
const ESQUEMA = {
  type: "OBJECT",
  properties: {
    dias: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          dia: { type: "STRING" },
          desayuno: { type: "STRING" },
          comida: { type: "STRING" },
          merienda: { type: "STRING" },
          cena: { type: "STRING" }
        },
        required: ["dia", "desayuno", "comida", "merienda", "cena"]
      }
    },
    recetas: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          nombre: { type: "STRING" },
          raciones: { type: "STRING" },
          ingredientes: { type: "STRING" },
          preparacion: { type: "STRING" }
        },
        required: ["nombre", "raciones", "ingredientes", "preparacion"]
      }
    },
    aviso: { type: "STRING" }
  },
  required: ["dias", "recetas", "aviso"]
};

function contexto(nombre, perfil) {
  if (!nombre && !perfil) return "";
  return (
    "\n\n" +
    (nombre ? `Me llamo ${nombre}.` : "") +
    (perfil ? ` Esto es lo que ya sabes de mí: ${perfil}` : "")
  );
}

// Lo que pide el usuario a mano manda sobre lo que la IA propondría sola.
function loQuePide(instrucciones) {
  const texto = String(instrucciones || "").trim().slice(0, MAXIMO_INSTRUCCIONES);
  if (!texto) return "";

  return (
    "\n\nAdemás, te pido expresamente lo siguiente y tienes que respetarlo:\n" +
    texto +
    '\n\nSi algo de lo que te pido no es razonable, hazlo igualmente y dilo en el campo "aviso".'
  );
}

// La IA a veces devuelve seis días, o los nombra raro. La semana siempre tiene
// siete: los que falten se completan en blanco y se ordenan de lunes a domingo.
function semanaCompleta(dias) {
  const porNombre = new Map();

  (Array.isArray(dias) ? dias : []).forEach((dia) => {
    const nombre = String(dia.dia || "").trim().toLowerCase();
    porNombre.set(nombre, dia);
  });

  return DIAS.map((nombre) => {
    const dia = porNombre.get(nombre) || {};
    return {
      dia: nombre,
      desayuno: String(dia.desayuno || ""),
      comida: String(dia.comida || ""),
      merienda: String(dia.merienda || ""),
      cena: String(dia.cena || "")
    };
  });
}

module.exports = async (req, res) => {
  if (!(await peticionAutorizada(req, res))) return;

  const cuerpo = req.body || {};

  const respuesta = await generarJson(
    res,
    {
      systemInstruction: { parts: [{ text: INSTRUCCIONES }] },
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                "Quiero la dieta de la semana, de lunes a domingo.\n\n" +
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
    "Dieta de la semana"
  );

  // generarJson ya ha respondido si algo falló.
  if (!respuesta) return;

  const dias = semanaCompleta(respuesta.dias);

  // Una semana entera en blanco significa que no ha entendido nada.
  const algoDentro = dias.some(
    (dia) => dia.desayuno || dia.comida || dia.merienda || dia.cena
  );
  if (!algoDentro) {
    console.error("La dieta llegó vacía.");
    return res.status(502).json({ error: "respuesta-ilegible" });
  }

  return res.status(200).json({
    dias,
    recetas: Array.isArray(respuesta.recetas) ? respuesta.recetas : [],
    aviso: String(respuesta.aviso || "")
  });
};
