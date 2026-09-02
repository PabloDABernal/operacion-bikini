// Casos de una comida con varias recetas (spec 088).
// Se ejecuta con: node docs/specs/088-varias-recetas-casos.mjs
//
// Ejecuta js/dietas.js de verdad, recortándole los imports que necesitan red.
// Mismo enfoque que 075-siembra-casos.mjs.
import fs from "node:fs";

const fuente = fs
  .readFileSync("js/dietas.js", "utf8")
  .replace(/^import[\s\S]*?from\s+"https:[^"]+";\s*$/gm, "")
  .replace(/^import[\s\S]*?from\s+"\.\/[^"]+";\s*$/gm, "")
  // Todo lo que toca Firestore o la red fuera: aquí solo se prueba qué decide.
  .replace(/export async function leerDietaActiva[\s\S]*?\n}/m, "")
  .replace(/export function guardarDieta[\s\S]*?\n}/m, "")
  .replace(/export function actualizarDieta[\s\S]*?\n}/m, "")
  .replace(/export function borrarDieta[\s\S]*?\n}/m, "")
  .replace(/export async function guardarRecetasPropuestas[\s\S]*?\n}/m, "")
  .replace(/export async function pedirDietaALaIa[\s\S]*$/m, "")
  .replace(/^function coleccionDe[\s\S]*?\n}/m, "");

const m = await import(
  "data:text/javascript;base64," + Buffer.from(fuente, "utf8").toString("base64")
);

const { idsDeRecetaDe, semanaDesdeMenu, semanaEnBlanco, semanaDesdeLaIa } = m;

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

// --- Leer las dos formas, que es lo que evita migrar ---------------------

comprobar(
  "una comida de antes de la 088 devuelve su única receta",
  idsDeRecetaDe({ texto: "Lentejas", recetaId: "r1" }),
  ["r1"]
);

comprobar(
  "una comida vieja SIN receta devuelve lista vacía",
  idsDeRecetaDe({ texto: "Pieza de fruta", recetaId: "" }),
  []
);

comprobar(
  "una comida nueva devuelve las suyas",
  idsDeRecetaDe({ texto: "Ensalada. Tortilla", recetaIds: ["r1", "r2"] }),
  ["r1", "r2"]
);

comprobar(
  "la forma nueva manda sobre la vieja si estuvieran las dos",
  idsDeRecetaDe({ texto: "x", recetaIds: ["r9"], recetaId: "r1" }),
  ["r9"]
);

comprobar(
  "una lista vacía es vacía, aunque quede el campo viejo puesto",
  idsDeRecetaDe({ texto: "x", recetaIds: [], recetaId: "r1" }),
  []
);

comprobar("una comida sin nada no revienta", idsDeRecetaDe({}), []);
comprobar("ni undefined", idsDeRecetaDe(undefined), []);

comprobar(
  "los huecos de una lista sucia se tiran",
  idsDeRecetaDe({ texto: "x", recetaIds: ["r1", "", null] }),
  ["r1"]
);

// --- La semana en blanco y la de la IA nacen con la forma nueva ----------

comprobar(
  "la semana en blanco nace con recetaIds",
  semanaEnBlanco()[0].comidas[0],
  { momento: "desayuno", texto: "", recetaIds: [] }
);

comprobar(
  "la IA enlaza por nombre exacto, así que una o ninguna",
  semanaDesdeLaIa(
    [{ dia: "lunes", desayuno: "Tortitas de avena" }],
    new Map([["tortitas de avena", "r1"]])
  )[0].comidas[0],
  { momento: "desayuno", texto: "Tortitas de avena", recetaIds: ["r1"] }
);

// --- Enlazar VARIAS desde un menú, que es el motivo de la spec -----------

const menu = (texto) => [
  {
    dia: "lunes",
    comidas: [{ momento: "cena", texto }]
  }
];
const cena = (texto, recetas) => semanaDesdeMenu(menu(texto), recetas)[0].comidas[3];

const dosRecetas = [
  { id: "r1", nombre: "Ensalada de repollo y manzana" },
  { id: "r2", nombre: "Tortilla de 2 huevos" }
];

comprobar(
  "EL CASO DE LA SPEC: una cena de dos platos enlaza las dos recetas",
  cena("Ensalada de repollo y manzana. Tortilla de 2 huevos", dosRecetas).recetaIds,
  ["r1", "r2"]
);

comprobar(
  "y si solo está una, enlaza una",
  cena("Ensalada de repollo y manzana. Pan", dosRecetas).recetaIds,
  ["r1"]
);

comprobar(
  "un plato que no es receta se queda sin enlazar",
  cena("125 gramos de kéfir con canela", dosRecetas).recetaIds,
  []
);

comprobar(
  "enlaza sin tildes ni mayúsculas, como antes de la 088",
  cena("ENSALADA DE REPOLLO Y MANZANA", dosRecetas).recetaIds,
  ["r1"]
);

// --- El no-solapamiento, por posiciones reales ---------------------------

const solapadas = [
  { id: "larga", nombre: "Ensalada de repollo y manzana" },
  { id: "corta", nombre: "Ensalada de repollo" }
];

comprobar(
  "dos recetas que se pisan: gana la larga y la corta se descarta",
  cena("Ensalada de repollo y manzana", solapadas).recetaIds,
  ["larga"]
);

comprobar(
  "pero si el texto las lleva las DOS veces, entran las dos",
  cena("Ensalada de repollo y manzana. Ensalada de repollo", solapadas).recetaIds,
  ["larga", "corta"]
);

comprobar(
  "una receta repetida en el texto solo se enlaza una vez",
  cena("Tortilla de 2 huevos. Tortilla de 2 huevos", dosRecetas).recetaIds,
  ["r2"]
);

// --- Las cautelas de la 076 siguen en pie -------------------------------

comprobar(
  "un nombre de menos de 8 letras no se enlaza (spec 076)",
  cena("Sopa de verduras", [{ id: "r1", nombre: "Sopa" }]).recetaIds,
  []
);

comprobar(
  "sin recetas no revienta, solo no enlaza",
  cena("Ensalada de repollo y manzana", []).recetaIds,
  []
);

comprobar(
  "un plato vacío no enlaza nada",
  cena("", dosRecetas).recetaIds,
  []
);

console.log(
  mal === 0 ? "\nTodos los casos de varias recetas pasan." : `\n${mal} fallos.`
);
process.exit(mal === 0 ? 0 : 1);
