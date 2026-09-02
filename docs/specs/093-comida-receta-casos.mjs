// Casos de apuntar una comida con receta (spec 093).
// Se ejecuta con: node docs/specs/093-comida-receta-casos.mjs
import fs from "node:fs";

const fuente = fs
  .readFileSync("js/comidas.js", "utf8")
  .replace(/^import[\s\S]*?from\s+"https:[^"]+";\s*$/gm, "")
  .replace(/^import[\s\S]*?from\s+"\.\/[^"]+";\s*$/gm, "")
  // Fuera todo lo que toca Firestore: aquí solo se prueba qué decide.
  .replace(/export function guardarComida[\s\S]*$/m, "")
  .replace(/^function coleccionDe[\s\S]*?\n}/m, "");

// errorDeFecha y errorDeHora venían de js/fechas.js, recortado.
const cabecera = `
const errorDeFecha = (f) => (f ? "" : "Falta la fecha.");
const errorDeHora = () => "";
`;

const m = await import(
  "data:text/javascript;base64," + Buffer.from(cabecera + fuente, "utf8").toString("base64")
);

const { validarComida } = m;

let mal = 0;
const comprobar = (nombre, real, esperado) => {
  const bien = JSON.stringify(real) === JSON.stringify(esperado);
  if (!bien) mal++;
  console.log(
    `${bien ? "OK  " : "FALLA"} ${nombre}` +
      (bien
        ? ""
        : `\n      esperado: ${JSON.stringify(esperado)}\n      real:     ${JSON.stringify(real)}`)
  );
};

const HOY = "2026-09-02";

// --- Las recetas ---------------------------------------------------------

comprobar(
  "una comida con una receta la guarda",
  validarComida("Tortilla de atún", "cena", HOY, "", [], "", ["r1"]).recetaIds,
  ["r1"]
);

comprobar(
  "y con dos, las dos",
  validarComida("Ensalada. Tortilla", "cena", HOY, "", [], "", ["r1", "r2"]).recetaIds,
  ["r1", "r2"]
);

comprobar(
  "los huecos de una lista sucia se tiran",
  validarComida("x", "cena", HOY, "", [], "", ["r1", "", null]).recetaIds,
  ["r1"]
);

comprobar(
  "si no es una lista, se ignora sin romper",
  validarComida("x", "cena", HOY, "", [], "", "r1").recetaIds,
  []
);

// --- LA REGRESIÓN: lo de siempre se guarda igual -------------------------

comprobar(
  "una comida escrita a mano no lleva recetas",
  validarComida("lentejas y una manzana", "comida", HOY, "").recetaIds,
  []
);

comprobar(
  "y su texto, momento, fecha y hora no cambian",
  (() => {
    const { texto, momento, fecha, hora } = validarComida(
      "lentejas y una manzana",
      "comida",
      HOY,
      "14:30"
    );
    return { texto, momento, fecha, hora };
  })(),
  { texto: "lentejas y una manzana", momento: "comida", fecha: HOY, hora: "14:30" }
);

comprobar(
  "una comida con ingrediente suelto sigue igual (spec 084)",
  (() => {
    const r = validarComida("Yogur (200 g)", "merienda", HOY, "", [], "i9");
    return { ingredienteId: r.ingredienteId, recetaIds: r.recetaIds };
  })(),
  { ingredienteId: "i9", recetaIds: [] }
);

comprobar(
  "y una con acompañamientos, también (spec 063)",
  validarComida("Lentejas", "comida", HOY, "", ["pan"], "", ["r1"]).acompanamientos,
  ["pan"]
);

// --- Los errores de siempre saltan antes ---------------------------------

comprobar(
  "sin texto, el error es el del texto aunque haya recetas",
  validarComida("", "cena", HOY, "", [], "", ["r1"]).error,
  "Escribe qué has comido."
);

comprobar(
  "sin fecha, el error es el de la fecha",
  validarComida("algo", "cena", "", "", [], "", ["r1"]).error,
  "Falta la fecha."
);

console.log(mal === 0 ? "\nTodos los casos de comida con receta pasan." : `\n${mal} fallos.`);
process.exit(mal === 0 ? 0 : 1);
