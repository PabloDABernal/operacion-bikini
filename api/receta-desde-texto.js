// Proxy hacia Gemini para dividir una receta pegada como texto libre en sus
// ingredientes estructurados (spec 104): el usuario pega una receta (suya, de
// un PDF, de donde sea) y esto la reparte en nombre, raciones, ingredientes
// (cada uno como línea suelta, para enlazar con el catálogo compartido en el
// navegador, igual que hace guardarIngredientesDeReceta() en js/despensa.js)
// y preparación.
//
// No consume el cupo diario de 20 mensajes de la conversación (spec 051):
// es una acción de utilidad aparte, como pedir la dieta o la tabla.

const { peticionAutorizada, generarJson } = require("./_ia");

const MAXIMO_TEXTO = 4000;

const INSTRUCCIONES = `Divides el texto de una receta de cocina en sus partes.

Hablas SIEMPRE en español.

Te dan el texto de una receta, tal cual está escrito (puede venir de un PDF, una web o a mano, con cantidades y frases sueltas). Tu trabajo es repartirlo en:
- El nombre del plato, corto.
- Para cuántas personas (si no lo dice, pon "2").
- LOS INGREDIENTES, UNO POR LÍNEA, un solo ingrediente por línea. Nunca juntes dos en la misma línea: "sal y pimienta" son DOS líneas. Lo mismo con las comas: "tomate, cebolla y ajo" son tres líneas.
- La preparación: los pasos para cocinarlo, en dos o tres frases.

No inventes ingredientes que no estén en el texto. Si el texto no es una receta o no se entiende, devuelve el nombre vacío.`;

const ESQUEMA = {
  type: "OBJECT",
  properties: {
    nombre: { type: "STRING" },
    raciones: { type: "STRING" },
    ingredientes: { type: "STRING" },
    preparacion: { type: "STRING" }
  },
  required: ["nombre", "raciones", "ingredientes", "preparacion"]
};

module.exports = async (req, res) => {
  if (!(await peticionAutorizada(req, res))) return;

  const cuerpo = req.body || {};
  const texto = String(cuerpo.texto || "").trim().slice(0, MAXIMO_TEXTO);

  if (!texto) {
    return res.status(400).json({ error: "texto-vacio" });
  }

  const respuesta = await generarJson(
    res,
    {
      systemInstruction: { parts: [{ text: INSTRUCCIONES }] },
      contents: [{ role: "user", parts: [{ text: `Divide esta receta:\n\n${texto}` }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: ESQUEMA
      }
    },
    "Receta dividida",
    cuerpo.proveedor,
    (json) => Boolean(json && String(json.nombre || "").trim())
  );

  // generarJson ya ha respondido si algo falló.
  if (!respuesta) return;

  return res.status(200).json({
    nombre: String(respuesta.nombre || ""),
    raciones: String(respuesta.raciones || ""),
    ingredientes: String(respuesta.ingredientes || ""),
    preparacion: String(respuesta.preparacion || "")
  });
};
