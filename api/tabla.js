// Proxy hacia Gemini para la tabla de ejercicio de la semana (spec 029).
//
// Hermana de api/dieta.js, con una vuelta de tuerca: aquí cada día lleva DENTRO
// una lista de ejercicios, así que el esquema tiene listas dentro de listas.
// Es el primer sitio del proyecto con ese anidamiento. describirEsquema() de
// api/_ia.js ya es recursivo (se arregló en la 028), así que Groq recibe la
// forma completa; lo que no se puede dar por hecho es que la respete.

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

const INTENSIDADES = ["suave", "media", "fuerte"];
const INTENSIDAD_POR_DEFECTO = "media";
const MINUTOS_MIN = 1;
const MINUTOS_MAX = 600;
const MINUTOS_POR_DEFECTO = 45;

const INSTRUCCIONES = `Eres un entrenador personal que le prepara la semana a una persona concreta.

Hablas SIEMPRE en español, tuteando, en tono cercano y directo.
No des diagnósticos médicos. Si algo te parece preocupante, recomienda consultar a un médico.

Te piden la tabla de ejercicio de una semana entera, de lunes a domingo:
- CADA día lleva una sesión, SALVO los días de descanso.
- Un día de descanso lleva el título vacío, los minutos vacíos y la lista de ejercicios vacía. No escribas "descanso" como título.
- Pon al menos un día de descanso a la semana: entrenar siete días seguidos no es buena idea.
- El título de la sesión dice qué es, corto: "Piernas y core", "Andar a paso ligero", "Torso completo".
- Los minutos son la duración estimada de la sesión entera, un número entre 1 y 600.
- La intensidad es una de estas tres, tal cual: suave, media, fuerte.
- Cada ejercicio es una línea con el nombre y sus series y repeticiones o su duración: "Sentadillas 4x12", "Plancha 3x40 segundos", "Cinta 20 minutos". El NOMBRE va siempre al principio de la línea.
- Adapta lo que propongas al material que tenga. Si no sabes de qué dispone, usa ejercicios de peso corporal.
- Respeta sus lesiones y limitaciones. Si no las sabes, evita lo más lesivo.

Además, devuelve la EXPLICACIÓN de los ejercicios que uses:
- Como mucho diez, los que más se repitan.
- De cada uno: nombre exacto tal y como lo has escrito al principio de la línea, cómo se hace en dos o tres frases, y qué material hace falta (si no hace falta ninguno, escribe "ninguno").
- El nombre tiene que coincidir LETRA POR LETRA con el que has puesto en la semana, o no se podrán enlazar.`;

// Todos los campos obligatorios: con campos opcionales, Gemini se los salta
// (aprendido en la spec 004).
//
// minutos va como STRING a propósito, igual que las raciones en api/dieta.js:
// los modelos devuelven "45 minutos" tan a gusto como 45, y un número que
// llega como texto rompe menos si se espera texto desde el principio.
const ESQUEMA = {
  type: "OBJECT",
  properties: {
    dias: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          dia: { type: "STRING" },
          titulo: { type: "STRING" },
          minutos: { type: "STRING" },
          intensidad: { type: "STRING", enum: INTENSIDADES },
          ejercicios: { type: "ARRAY", items: { type: "STRING" } }
        },
        required: ["dia", "titulo", "minutos", "intensidad", "ejercicios"]
      }
    },
    ejercicios: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          nombre: { type: "STRING" },
          comoSeHace: { type: "STRING" },
          material: { type: "STRING" }
        },
        required: ["nombre", "comoSeHace", "material"]
      }
    },
    aviso: { type: "STRING" }
  },
  required: ["dias", "ejercicios", "aviso"]
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

function normalizar(texto) {
  return String(texto || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// "45", "45 minutos", "unos 45", 45 y hasta "45-60" tienen que acabar en 45.
function minutosDe(bruto) {
  const encontrado = String(bruto ?? "").match(/\d+/);
  if (!encontrado) return MINUTOS_POR_DEFECTO;

  const minutos = Number(encontrado[0]);
  if (!Number.isFinite(minutos)) return MINUTOS_POR_DEFECTO;

  return Math.min(MINUTOS_MAX, Math.max(MINUTOS_MIN, Math.round(minutos)));
}

// La intensidad que no sea una de las tres cae a media: el registro de
// ejercicio solo entiende esas, y una inventada rompería "Lo he hecho".
function intensidadDe(bruto) {
  const limpia = normalizar(bruto);
  return INTENSIDADES.includes(limpia) ? limpia : INTENSIDAD_POR_DEFECTO;
}

// La lista de ejercicios de un día es donde más se tuerce todo: algún modelo
// la devuelve como texto JSON, otro como un párrafo con saltos de línea y otro
// como lista de objetos. Esto es la lección de la spec 028 aplicada un nivel
// más adentro.
function listaDeEjercicios(bruto) {
  let lista = bruto;

  if (typeof lista === "string") {
    const texto = lista.trim();
    try {
      lista = JSON.parse(texto);
    } catch {
      // No era JSON: un ejercicio por línea, que es la otra forma habitual.
      lista = texto.split("\n");
    }
  }

  if (!Array.isArray(lista)) return [];

  return lista
    .map((entrada) => {
      if (typeof entrada === "string") return entrada.trim();
      if (entrada && typeof entrada === "object") {
        // { nombre, series } o { texto }: se junta lo que haya.
        const campos = {};
        Object.entries(entrada).forEach(([clave, valor]) => {
          campos[normalizar(clave)] = valor;
        });
        return String(campos.texto || campos.nombre || campos.ejercicio || "").trim();
      }
      return "";
    })
    // Las viñetas que algún modelo deja pegadas delante sobran.
    .map((texto) => texto.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter(Boolean);
}

// Misma estrategia que api/dieta.js: los días se emparejan por ORDEN, que es
// lo que ningún modelo se salta. El nombre solo manda si TODOS son
// reconocibles. Casar por nombre era frágil: bastaba una tilde para vaciar la
// semana entera.
function semanaCompleta(dias) {
  let lista = dias;

  if (typeof lista === "string") {
    try {
      lista = JSON.parse(lista);
    } catch {
      lista = [];
    }
  }

  if (lista && !Array.isArray(lista) && typeof lista === "object") {
    lista = Object.entries(lista).map(([dia, resto]) => ({ dia, ...resto }));
  }

  if (!Array.isArray(lista)) lista = [];

  const normalizados = DIAS.map(normalizar);
  const porNombre = new Map();
  lista.forEach((dia) => {
    const nombre = normalizar(dia && dia.dia);
    if (normalizados.includes(nombre)) porNombre.set(nombre, dia);
  });

  const porNombreVale = porNombre.size === DIAS.length;

  return DIAS.map((nombre, indice) => {
    const dia = (porNombreVale ? porNombre.get(normalizar(nombre)) : lista[indice]) || {};

    // Las claves, también sin fiarse: "Titulo", "TÍTULO" o "titulo" son la
    // misma, y buscar solo una dejaría el día vacío.
    const campos = {};
    Object.entries(dia).forEach(([clave, valor]) => {
      campos[normalizar(clave)] = valor;
    });

    const titulo = String(campos.titulo || "").trim();

    // Sin título es descanso: se devuelve el día vacío del todo, para que el
    // navegador no tenga que decidir si media sesión cuenta como sesión.
    if (!titulo) {
      return { dia: nombre, titulo: "", minutos: 0, intensidad: "", ejercicios: [] };
    }

    return {
      dia: nombre,
      titulo,
      minutos: minutosDe(campos.minutos),
      intensidad: intensidadDe(campos.intensidad),
      ejercicios: listaDeEjercicios(campos.ejercicios)
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
                "Quiero la tabla de ejercicio de la semana, de lunes a domingo.\n\n" +
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
    "Tabla de la semana"
  );

  // generarJson ya ha respondido si algo falló.
  if (!respuesta) return;

  const dias = semanaCompleta(respuesta.dias);

  // Una semana entera sin una sola sesión significa que no ha entendido nada.
  // Descansar los siete días no es una tabla.
  const algoDentro = dias.some((dia) => dia.titulo);
  if (!algoDentro) {
    // Con el detalle en los logs: sin él, "no ha sabido responder" no dice si
    // la IA contestó otra cosa o si se perdió por el camino.
    console.error(
      `La tabla llegó vacía. Respuesta: ${JSON.stringify(respuesta).slice(0, 400)}`
    );
    return res.status(502).json({ error: "tabla-vacia" });
  }

  return res.status(200).json({
    dias,
    ejercicios: Array.isArray(respuesta.ejercicios) ? respuesta.ejercicios : [],
    aviso: String(respuesta.aviso || "")
  });
};
