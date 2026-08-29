// Proxy hacia Gemini para el detalle nutricional del día (spec 030).
//
// Le pasamos lo que el usuario escribió en texto libre ("dos huevos y una
// tostada") y devuelve seis grupos con su medida, una horquilla de calorías y
// un comentario corto.
//
// PRODUCTO.md prohíbe las calorías exactas: aquí solo salen horquillas, y se
// redondean a la centena para que ni siquiera parezcan medidas.

const { peticionAutorizada, generarJson } = require("./_ia");

// El orden es fijo y es el que se pinta. La IA solo reparte.
const GRUPOS = [
  "Verdura y fruta",
  "Proteína",
  "Cereales y féculas",
  "Lácteos",
  "Grasas",
  "Ultraprocesados y dulces"
];

const MEDIDAS = ["nada", "poco", "bastante", "mucho"];

// Fuera de esto no es una estimación, es un error de lectura.
const KCAL_MIN = 500;
const KCAL_MAX = 6000;

const INSTRUCCIONES = `Eres un nutricionista que lee lo que alguien ha comido hoy, escrito a su manera y sin pesar nada.

Hablas SIEMPRE en español, tuteando, en tono cercano y directo.
No des diagnósticos médicos. Si algo te parece preocupante, recomienda consultar a un médico.

Tienes que hacer dos cosas:

1. Repartir el día en estos SEIS grupos, en este orden exacto y con estos nombres:
${GRUPOS.map((grupo, i) => `   ${i + 1}. ${grupo}`).join("\n")}
   De cada uno dices cuánto pesó en el día con UNA de estas cuatro palabras, tal cual: nada, poco, bastante, mucho.
   Los seis van SIEMPRE, aunque la respuesta sea "nada".
   CUENTA TAMBIÉN lo que acompaña a cada comida (lo que va detrás de un "+": pan, biscotes, picos) y lo que ha bebido. El pan es cereales y féculas; una cerveza o un refresco son ultraprocesados y dulces. No hay un grupo para bebidas y no hace falta: cada cosa va al grupo que le toca por lo que es.

2. Estimar las calorías del día como una HORQUILLA, con un mínimo y un máximo.
   Cuentan TODAS: la comida, lo que la acompaña y lo que ha bebido. Tres cañas son calorías aunque no sean un plato.
   NUNCA un número exacto: no ha pesado nada y fingir precisión sería mentir.
   La horquilla tiene que ser ancha de verdad, del orden de 300 kcal entre mínimo y máximo.

Y un comentario de una o dos frases sobre el día: qué está bien y qué cojea. Sin regañar y sin hablar de kilos.
Si lo que ha escrito no se entiende o no es comida, dilo ahí en vez de inventarte números.`;

// Todos los campos obligatorios: con campos opcionales, Gemini se los salta
// (aprendido en la spec 004).
//
// Las calorías van como STRING igual que las raciones en api/dieta.js y los
// minutos en api/tabla.js: los modelos devuelven "1600 kcal" tan a gusto como
// 1600, y un número que llega como texto rompe menos si se espera texto.
const ESQUEMA = {
  type: "OBJECT",
  properties: {
    grupos: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          grupo: { type: "STRING" },
          medida: { type: "STRING", enum: MEDIDAS }
        },
        required: ["grupo", "medida"]
      }
    },
    caloriasMin: { type: "STRING" },
    caloriasMax: { type: "STRING" },
    comentario: { type: "STRING" }
  },
  required: ["grupos", "caloriasMin", "caloriasMax", "comentario"]
};

function normalizar(texto) {
  return String(texto || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// Lo que el usuario escribió, tal cual, con su momento.
// Los acompañamientos van PEGADOS a su comida (spec 070), igual que en el
// prompt de la conversación: lo que comió fueron lentejas CON pan, no lentejas
// y luego pan. Una línea aparte le diría al análisis que fueron dos ingestas.
function describirComidas(comidas) {
  if (!comidas.length) return "- no ha apuntado nada";

  return comidas
    .map((comida) => {
      const conQue = Array.isArray(comida.acompanamientos)
        ? comida.acompanamientos.filter(Boolean)
        : [];
      const extra = conQue.length ? ` + ${conQue.join(", ")}` : "";
      return `- ${comida.momento}: ${comida.texto}${extra}`;
    })
    .join("\n");
}

// Lo que ha bebido hoy (spec 070). Bloque aparte porque no es una ingesta de
// comida, pero SÍ cuenta: una caña son calorías, y hasta ahora el análisis hacía
// como que no existía.
//
// No hay grupo "bebidas" entre los seis, y no se añade: los seis describen
// composición, meter ahí la cerveza junto al café mezcla cosas distintas, y
// cambiar la lista desalinearía todos los análisis ya guardados. Lo que se hace
// es que las bebidas cuenten DONDE les toca —una cerveza en ultraprocesados— y
// en la horquilla de calorías.
function describirBebidas(bebidas) {
  if (!bebidas.length) return "";

  return (
    "\n\nY esto es lo que llevo bebido hoy (aparte del agua, que no se apunta):\n" +
    bebidas.map((bebida) => `- ${bebida.texto}`).join("\n")
  );
}

// Los seis grupos, emparejados por ORDEN y no por nombre, que es la lección de
// las specs 028 y 029: basta una tilde o un plural para que no cuadre ninguno.
function seisGrupos(bruto) {
  let lista = bruto;

  if (typeof lista === "string") {
    try {
      lista = JSON.parse(lista);
    } catch {
      lista = [];
    }
  }

  if (lista && !Array.isArray(lista) && typeof lista === "object") {
    lista = Object.entries(lista).map(([grupo, medida]) => ({ grupo, medida }));
  }

  if (!Array.isArray(lista)) lista = [];

  // Si los seis nombres son reconocibles, mandan ellos; si no, manda el orden.
  const normalizados = GRUPOS.map(normalizar);
  const porNombre = new Map();
  lista.forEach((entrada) => {
    const nombre = normalizar(entrada && entrada.grupo);
    if (normalizados.includes(nombre)) porNombre.set(nombre, entrada);
  });

  const porNombreVale = porNombre.size === GRUPOS.length;

  return GRUPOS.map((grupo, indice) => {
    const entrada =
      (porNombreVale ? porNombre.get(normalizar(grupo)) : lista[indice]) || {};

    // Las claves, también sin fiarse: "Medida" o "MEDIDA" son la misma.
    const campos = {};
    Object.entries(entrada).forEach(([clave, valor]) => {
      campos[normalizar(clave)] = valor;
    });

    const medida = normalizar(campos.medida);

    // Una medida inventada ("moderado", "alto") cae a "nada": la medida ES el
    // dato, así que no hay de dónde deducir otra cosa. Quedarse corto se ve en
    // pantalla; inventar al alza, no.
    return { grupo, medida: MEDIDAS.includes(medida) ? medida : "nada" };
  });
}

// "1600", "1600 kcal", "unas 1600" y 1600 tienen que acabar en 1600.
function kcalDe(bruto) {
  const encontrado = String(bruto ?? "").replace(/[.,]/g, "").match(/\d+/);
  if (!encontrado) return null;

  const kcal = Number(encontrado[0]);
  return Number.isFinite(kcal) ? kcal : null;
}

// A la centena: una horquilla al kilocalorías exactas seguiría pareciendo una
// medida, que es justo lo que PRODUCTO.md no quiere.
function aLaCentena(kcal, haciaArriba) {
  return haciaArriba ? Math.ceil(kcal / 100) * 100 : Math.floor(kcal / 100) * 100;
}

function horquilla(brutoMin, brutoMax) {
  let min = kcalDe(brutoMin);
  let max = kcalDe(brutoMax);

  // Un solo número se convierte en horquilla de ±15%: si no ha sabido dar dos,
  // desde luego no sabe el exacto.
  if (min === null && max === null) return null;
  if (min === null) min = Math.round(max * 0.85);
  if (max === null) max = Math.round(min * 1.15);

  // Al revés: se intercambian en vez de tirar la respuesta.
  if (min > max) [min, max] = [max, min];

  min = Math.min(KCAL_MAX, Math.max(KCAL_MIN, min));
  max = Math.min(KCAL_MAX, Math.max(KCAL_MIN, max));

  min = aLaCentena(min, false);
  max = aLaCentena(max, true);

  // Redondear puede dejarlos iguales (1610-1640 → 1600-1700 está bien, pero
  // 1600-1600 no): se separa una centena para que siga siendo una horquilla.
  //
  // La separación se hace hacia abajo si el máximo ya está en el tope, o un
  // 6000-6000 acabaría en 6000-6100 y se saltaría el recorte por arriba.
  if (max <= min) {
    if (max >= KCAL_MAX) min = max - 100;
    else max = min + 100;
  }

  return { caloriasMin: min, caloriasMax: max };
}

module.exports = async (req, res) => {
  if (!(await peticionAutorizada(req, res))) return;

  const cuerpo = req.body || {};
  const comidas = Array.isArray(cuerpo.comidas) ? cuerpo.comidas : [];

  // Sin comidas no hay nada que analizar: el navegador ya lo impide, pero
  // gastar una llamada a la IA para que diga "no has comido nada" sería tonto.
  if (!comidas.length) {
    return res.status(400).json({ error: "sin-comidas" });
  }

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
                "Esto es lo que llevo comido hoy:\n\n" +
                describirComidas(comidas) +
                describirBebidas(Array.isArray(cuerpo.bebidas) ? cuerpo.bebidas : [])
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: ESQUEMA
      }
    },
    "Detalle nutricional",
    cuerpo.proveedor
  );

  // generarJson ya ha respondido si algo falló.
  if (!respuesta) return;

  const kcal = horquilla(respuesta.caloriasMin, respuesta.caloriasMax);

  // Sin calorías legibles no hay análisis: los grupos solos no dicen gran cosa
  // y guardar un documento a medias sería peor que no guardar nada.
  if (!kcal) {
    console.error(
      `El análisis llegó sin calorías. Respuesta: ${JSON.stringify(respuesta).slice(0, 400)}`
    );
    return res.status(502).json({ error: "analisis-ilegible" });
  }

  return res.status(200).json({
    grupos: seisGrupos(respuesta.grupos),
    ...kcal,
    comentario: String(respuesta.comentario || "")
  });
};
