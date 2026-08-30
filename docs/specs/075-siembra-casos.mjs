// Casos de la siembra (spec 075).
// Se ejecuta con: node docs/specs/075-siembra-casos.mjs
//
// Ejecuta los módulos de verdad recortándoles los imports de Firebase, que
// necesitan red. Mismo enfoque que 059-cruce-casos.mjs y 068-limpieza-casos.mjs.
import fs from "node:fs";

async function cargar(ruta, recorte) {
  let fuente = fs
    .readFileSync(ruta, "utf8")
    .replace(/^import[\s\S]*?from\s+"https:[^"]+";\s*$/gm, "")
    .replace(/^import[\s\S]*?from\s+"\.\/firebase-config\.js";\s*$/gm, "");
  if (recorte) fuente = fuente.replace(recorte, "");
  return import(
    "data:text/javascript;base64," + Buffer.from(fuente, "utf8").toString("base64")
  );
}

// despensa.js sin su parte de red, para sacar normalizar y mismoIngrediente.
const despensa = await cargar(
  "js/despensa.js",
  /export async function listarDespensa[\s\S]*$/m
);

const datos = await cargar("js/datos-iniciales.js");

// siembra.js: se le quitan los imports de Firebase y se le inyectan los dos
// módulos que sí queremos de verdad.
let fuenteSiembra = fs
  .readFileSync("js/siembra.js", "utf8")
  .replace(/^import[\s\S]*?from\s+"https:[^"]+";\s*$/gm, "")
  .replace(/^import[\s\S]*?from\s+"\.\/firebase-config\.js";\s*$/gm, "")
  .replace(/^import[\s\S]*?from\s+"\.\/datos-iniciales\.js";\s*$/gm, "")
  .replace(/^import[\s\S]*?from\s+"\.\/despensa\.js";\s*$/gm, "")
  // sembrar() escribe en Firestore: fuera. Aquí sólo se prueba qué decide.
  .replace(/export async function sembrar[\s\S]*$/m, "");

fuenteSiembra =
  `const VERSION = ${datos.VERSION};\n` +
  `const RECETAS = ${JSON.stringify(datos.RECETAS)};\n` +
  `const INGREDIENTES = ${JSON.stringify(datos.INGREDIENTES)};\n` +
  `const normalizar = ${despensa.normalizar.toString()};\n` +
  `const mismoIngrediente = ${despensa.mismoIngrediente.toString()};\n` +
  fuenteSiembra;

const siembra = await import(
  "data:text/javascript;base64," +
    Buffer.from(fuenteSiembra, "utf8").toString("base64")
);

const { hayQueSembrar, recetasQueFaltan, ingredientesQueFaltan } = siembra;

let mal = 0;
const comprobar = (nombre, real, esperado) => {
  const bien = JSON.stringify(real) === JSON.stringify(esperado);
  if (!bien) {
    mal++;
    console.log(`MAL  ${nombre}: ${JSON.stringify(real)} (esperado ${JSON.stringify(esperado)})`);
  } else {
    console.log(`OK   ${nombre}`);
  }
};

// --- Los datos generados -------------------------------------------------

comprobar("73 recetas", datos.RECETAS.length, 73);
comprobar("133 ingredientes", datos.INGREDIENTES.length, 133);
comprobar("4 menús", datos.MENUS.length, 4);

comprobar(
  "ninguna receta repetida por nombre",
  new Set(datos.RECETAS.map((r) => r.nombre.toLowerCase())).size,
  73
);

comprobar(
  "ningún ingrediente lleva cifras",
  datos.INGREDIENTES.filter((i) => /\d/.test(i)),
  []
);

comprobar(
  "toda receta tiene nombre e ingredientes",
  datos.RECETAS.filter((r) => !r.nombre || !r.ingredientes.length).length,
  0
);

comprobar(
  "los menús traen los siete días",
  datos.MENUS.every((m) => m.dias.length === 7),
  true
);

comprobar(
  "cada día trae los cuatro momentos de la app",
  datos.MENUS.every((m) =>
    m.dias.every(
      (d) =>
        d.comidas.length === 4 &&
        d.comidas.every((c) => ["desayuno", "comida", "merienda", "cena"].includes(c.momento))
    )
  ),
  true
);

comprobar(
  "sábado y domingo llevan lo mismo",
  datos.MENUS.every((m) => {
    const sabado = m.dias.find((d) => d.dia === "sábado");
    const domingo = m.dias.find((d) => d.dia === "domingo");
    return JSON.stringify(sabado.comidas) === JSON.stringify(domingo.comidas);
  }),
  true
);

comprobar(
  "ningún día se queda en blanco",
  datos.MENUS.every((m) => m.dias.every((d) => d.comidas.some((c) => c.texto))),
  true
);

// --- Cuándo hay que sembrar ---------------------------------------------

comprobar("cuenta nueva: se siembra", hayQueSembrar({}), true);
comprobar("sin la marca: se siembra", hayQueSembrar({ nombre: "Pau" }), true);
comprobar("ya sembrada: no se repite", hayQueSembrar({ datosInicialesVersion: 1 }), false);
comprobar("versión vieja: se resiembra", hayQueSembrar({ datosInicialesVersion: 0 }), true);
comprobar("ajustes que no llegaron", hayQueSembrar(null), true);

// --- Qué recetas faltan --------------------------------------------------

comprobar("cuenta vacía: faltan las 73", recetasQueFaltan([]).length, 73);
comprobar("sin lista: faltan las 73", recetasQueFaltan(undefined).length, 73);

comprobar(
  "la receta del usuario manda: no entra la del menú",
  recetasQueFaltan([{ nombre: "Gazpacho" }]).some((r) => r.nombre === "Gazpacho"),
  false
);

comprobar(
  "y sólo excluye esa",
  recetasQueFaltan([{ nombre: "Gazpacho" }]).length,
  72
);

comprobar(
  "compara sin tildes ni mayúsculas",
  recetasQueFaltan([{ nombre: "  GAZPACHO " }]).length,
  72
);

comprobar(
  "una receta suya que no está en los menús no quita nada",
  recetasQueFaltan([{ nombre: "Lentejas de mi madre" }]).length,
  73
);

// --- Qué ingredientes faltan --------------------------------------------

comprobar("despensa vacía: faltan los 133", ingredientesQueFaltan([]).length, 133);

comprobar(
  "lo que ya tienes no entra",
  ingredientesQueFaltan([{ nombre: "tomate" }]).includes("tomate"),
  false
);

comprobar(
  "el plural cuenta como el mismo (spec 072)",
  ingredientesQueFaltan([{ nombre: "tomates" }]).includes("tomate"),
  false
);

comprobar(
  "pero no se lleva por delante lo que sólo se parece",
  ingredientesQueFaltan([{ nombre: "sal" }]).includes("salmón"),
  true
);

comprobar(
  "lo tuyo no cuenta si no está en la lista",
  ingredientesQueFaltan([{ nombre: "azafrán" }]).length,
  133
);

console.log(mal === 0 ? "\nTodos los casos de siembra pasan." : `\n${mal} fallos.`);
process.exit(mal === 0 ? 0 : 1);
