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
    // Y los relativos: js/dietas.js tira de js/recetas.js, que a su vez tira de
    // Firebase. Aquí sólo interesan las funciones puras.
    .replace(/^import[\s\S]*?from\s+"\.\/[^"]+";\s*$/gm, "");
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
  "el domingo descansa: se queda vacío",
  datos.MENUS.every((m) => {
    const domingo = m.dias.find((d) => d.dia === "domingo");
    return domingo.comidas.every((c) => c.texto === "");
  }),
  true
);

comprobar(
  "los otros seis días están llenos",
  datos.MENUS.every((m) =>
    m.dias
      .filter((d) => d.dia !== "domingo")
      .every((d) => d.comidas.every((c) => c.texto))
  ),
  true
);

// Lunes, martes y miércoles salen de la página 1 del PDF, no de repetir el
// jueves: la primera transcripción se saltó esa página y hubo que corregirlo.
comprobar(
  "lunes no es una copia del jueves",
  datos.MENUS.every((m) => {
    const lunes = m.dias.find((d) => d.dia === "lunes");
    const jueves = m.dias.find((d) => d.dia === "jueves");
    return JSON.stringify(lunes.comidas) !== JSON.stringify(jueves.comidas);
  }),
  true
);

comprobar(
  "y martes y miércoles tampoco",
  datos.MENUS.every((m) => {
    const textos = m.dias
      .filter((d) => ["lunes", "martes", "miércoles"].includes(d.dia))
      .map((d) => JSON.stringify(d.comidas));
    return new Set(textos).size === 3;
  }),
  true
);

// --- Elegir un menú enlaza sus platos con las recetas (spec 076) --------
//
// Se ejecuta semanaDesdeMenu() de verdad, la misma que usa el botón.

const dietas = await cargar(
  "js/dietas.js",
  /export async function pedirDietaALaIa[\s\S]*$/m
);

// Las recetas como las tiene el usuario tras la siembra: con id.
const recetasConId = datos.RECETAS.map((r, i) => ({ id: `r${i}`, nombre: r.nombre }));

const semanas = datos.MENUS.map((m) =>
  dietas.semanaDesdeMenu(m.dias, recetasConId)
);

comprobar(
  "cada menú da una semana de siete días",
  semanas.every((s) => s.length === 7),
  true
);

comprobar(
  "y cada día sus cuatro momentos",
  semanas.every((s) => s.every((d) => d.comidas.length === 4)),
  true
);

comprobar(
  "el domingo sigue vacío y sin receta",
  semanas.every((s) => {
    const domingo = s.find((d) => d.dia === "domingo");
    return domingo.comidas.every((c) => c.texto === "" && c.recetaId === "");
  }),
  true
);

const enlazados = semanas.flatMap((s) =>
  s.flatMap((d) => d.comidas.filter((c) => c.recetaId))
).length;

// Emparejando por nombre exacto salían 4 de 96, que hacía inútil poder abrir
// la receta desde la dieta. Por contención salen unos 50. El umbral está en 40
// para que se note si alguien vuelve a la comparación estricta.
comprobar("enlaza bastantes platos con su receta", enlazados >= 40, true);

comprobar(
  "sin recetas no revienta, sólo no enlaza",
  dietas.semanaDesdeMenu(datos.MENUS[0].dias, []).every((d) =>
    d.comidas.every((c) => c.recetaId === "")
  ),
  true
);

comprobar(
  "un plato que no es receta se queda como texto",
  semanas.some((s) =>
    s.some((d) => d.comidas.some((c) => c.texto && !c.recetaId))
  ),
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
