// Casos de la reparación (spec 090).
// Se ejecuta con: node docs/specs/090-reparacion-casos.mjs
//
// LO IMPORTANTE DE ESTA SUITE no son los casos inventados: es la MEDIDA contra
// las 373 líneas de receta REALES, al final. La spec 089 se desplegó con sus 25
// casos en verde y estropeó la despensa del usuario, porque los casos decían
// que el código hacía lo que se le pidió, no que se le hubiera pedido lo
// correcto. Aquí, si la extracción empeora, la suite falla.
import fs from "node:fs";

const sinImports = (ruta) =>
  fs
    .readFileSync(ruta, "utf8")
    .replace(/^import[\s\S]*?from\s+"https:[^"]+";\s*$/gm, "")
    .replace(/^import[\s\S]*?from\s+"\.\/[^"]+";\s*$/gm, "");

const despensa = sinImports("js/despensa.js");
const trozo = (nombre) =>
  despensa.match(new RegExp(`export function ${nombre}[\\s\\S]*?\\n}`, "m"))[0];

const piezas = [
  despensa.match(/const UNIDADES = [\s\S]*?\n\];/m)[0],
  despensa.match(/const COLETILLAS = .*$/m)[0],
  trozo("normalizar"),
  trozo("mismoIngrediente"),
  trozo("ingredienteDeLinea"),
  trozo("esLineaEstructurada"),
  sinImports("js/normalizacion.js")
];

const m = await import(
  "data:text/javascript;base64," + Buffer.from(piezas.join("\n"), "utf8").toString("base64")
);

const datos = await import("../../js/datos-iniciales.js");
const { sinonimos: TABLA } = JSON.parse(
  fs.readFileSync("docs/menus/sinonimos-ingredientes.json", "utf8")
);
const SINONIMOS = new Map(Object.entries(TABLA));

const { recortarLinea, ingredienteDeReceta, planDeReparacion } = m;

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

// --- El recorte, con las líneas que rompieron la 089 ---------------------

comprobar(
  "LA LINEA DE LA 089: se queda en 'atun'",
  recortarLinea("1 lata redonda pequeña de atún, enlatado al natural, escurrido (50 g)"),
  "atun"
);

comprobar(
  "el parentesis no se cuela en el nombre",
  recortarLinea("1 cucharada de postre de aceite de oliva, virgen (5 g)"),
  "aceite de oliva"
);

comprobar(
  "una fraccion NO parte la linea por la barra",
  recortarLinea("1/2 cucharada de café de pimentón, en polvo (2 g)"),
  "pimenton"
);

comprobar(
  "pero la barra entre letras si separa alternativas",
  recortarLinea("1 plátano/banana"),
  "platano"
);

comprobar(
  "el 'de' de 'aceite de oliva' no se toca",
  recortarLinea("aceite de oliva"),
  "aceite de oliva"
);

comprobar("las coletillas del final se van", recortarLinea("Canela al gusto"), "canela");
comprobar("y el opcional tambien", recortarLinea("Perejil opcional"), "perejil");
comprobar("un articulo por delante tampoco cuenta", recortarLinea("Un puñado de repollo"), "repollo");
comprobar("una linea ya limpia se queda igual", recortarLinea("sal"), "sal");
comprobar("y una vacia no revienta", recortarLinea(""), "");

// --- La búsqueda ---------------------------------------------------------

const conocidos = [
  { id: "a", nombre: "atún" },
  { id: "b", nombre: "huevos" },
  { id: "c", nombre: "pechuga de pollo" },
  { id: "d", nombre: "pollo" },
  { id: "e", nombre: "aceite de oliva virgen extra" }
];

comprobar(
  "encuentra el ingrediente dentro de la frase",
  ingredienteDeReceta("1 lata de atún al natural (50 g)", conocidos, SINONIMOS).nombre,
  "atún"
);

comprobar(
  "el singular encuentra tu plural (spec 072)",
  ingredienteDeReceta("2 unidades medianas de huevo de gallina, crudo", conocidos, SINONIMOS).nombre,
  "huevos"
);

comprobar(
  "gana el mas especifico: 'pechuga de pollo' antes que 'pollo'",
  ingredienteDeReceta("130gr de pechuga de pollo a la plancha", conocidos, SINONIMOS).nombre,
  "pechuga de pollo"
);

comprobar(
  "la tabla de sinonimos resuelve lo que se escribe de otra forma",
  ingredienteDeReceta("1 cucharada de aceite de oliva, virgen (5 g)", conocidos, SINONIMOS).nombre,
  "aceite de oliva virgen extra"
);

comprobar(
  "lo que no encuentra se queda con su recorte",
  ingredienteDeReceta("200 g de quinoa", conocidos, SINONIMOS).nombre,
  "quinoa"
);

// --- El plan de reparación -----------------------------------------------

const iniciales = [
  { nombre: "Tortilla de atún", ingredientes: ["1 lata de atún (50 g)", "2 huevos"] }
];
const cuenta = () => {
  let n = 0;
  return () => "nuevo" + ++n;
};
const LOS_133 = ["atún", "huevos"];

// Como quedó una receta sembrada tras la 089: enlazada a basura.
const sembradaRota = {
  id: "r1",
  nombre: "Tortilla de atún",
  ingredientes: [
    { ingredienteId: "basura1", ingredienteNombre: "de atún", cantidad: "1 lata", preparacion: "" },
    { ingredienteId: "b", ingredienteNombre: "huevos", cantidad: "2", preparacion: "" }
  ]
};
const despensaRota = [
  { id: "a", nombre: "atún", tengo: false },
  { id: "b", nombre: "huevos", tengo: false },
  { id: "basura1", nombre: "de atún", tengo: false }
];

const plan = planDeReparacion(
  [sembradaRota],
  despensaRota,
  iniciales,
  LOS_133,
  SINONIMOS,
  cuenta()
);

comprobar(
  "una receta sembrada se reconstruye desde el texto original",
  plan.recetas[0].ingredientes.map((l) => l.ingredienteNombre),
  ["atún", "huevos"]
);

comprobar(
  "y su enlace deja de apuntar a la basura",
  plan.recetas[0].ingredientes[0].ingredienteId,
  "a"
);

comprobar("la basura huerfana se borra", plan.aBorrar.map((i) => i.id), ["basura1"]);

comprobar(
  "los 133 de la app NO se borran, aunque queden huerfanos",
  planDeReparacion([], despensaRota, iniciales, LOS_133, SINONIMOS, cuenta()).aBorrar.map((i) => i.id),
  ["basura1"]
);

comprobar(
  "un ingrediente MARCADO no se borra nunca, aunque sea ilegible",
  planDeReparacion(
    [],
    [{ id: "basura1", nombre: "de atún", tengo: true }],
    iniciales,
    LOS_133,
    SINONIMOS,
    cuenta()
  ).aBorrar,
  []
);

// --- Las recetas del usuario ---------------------------------------------

const mia = {
  id: "r9",
  nombre: "Mi invento",
  ingredientes: [
    { ingredienteId: "basura1", ingredienteNombre: "sopera de atún", cantidad: "1", preparacion: "picado" }
  ]
};

const planMia = planDeReparacion([mia], despensaRota, iniciales, LOS_133, SINONIMOS, cuenta());

comprobar(
  "a una receta mia NO se le toca el texto",
  planMia.recetas[0].ingredientes[0].ingredienteNombre,
  "sopera de atún"
);

comprobar(
  "ni la cantidad ni la preparacion",
  [planMia.recetas[0].ingredientes[0].cantidad, planMia.recetas[0].ingredientes[0].preparacion],
  ["1", "picado"]
);

comprobar("pero su enlace si se arregla", planMia.recetas[0].ingredientes[0].ingredienteId, "a");

comprobar(
  "y entonces la basura que usaba se queda huerfana y se borra",
  planMia.aBorrar.map((i) => i.id),
  ["basura1"]
);

comprobar(
  "una receta mia cuyo ingrediente no se encuentra se queda como esta",
  planDeReparacion(
    [{ id: "r9", nombre: "Otra", ingredientes: [{ ingredienteId: "x", ingredienteNombre: "cosa rara", cantidad: "", preparacion: "" }] }],
    [{ id: "x", nombre: "cosa rara", tengo: false }],
    iniciales,
    LOS_133,
    SINONIMOS,
    cuenta()
  ).recetas,
  []
);

// --- El nombre repetido: no se toca nada ---------------------------------

comprobar(
  "con DOS recetas del mismo nombre sembrado, no se repara ninguna",
  planDeReparacion(
    [sembradaRota, { ...sembradaRota, id: "r2" }],
    despensaRota,
    iniciales,
    LOS_133,
    SINONIMOS,
    cuenta()
  ).resumen,
  { reconstruidas: 0, reenlazadas: 0, ambiguas: 2, ingredientesCreados: 0, ingredientesBorrados: 0 }
);

// --- Pulsarlo dos veces --------------------------------------------------

const yaReparada = { ...sembradaRota, ingredientes: plan.recetas[0].ingredientes };
const despensaLimpia = despensaRota.filter((i) => i.id !== "basura1");
const segunda = planDeReparacion(
  [yaReparada],
  despensaLimpia,
  iniciales,
  LOS_133,
  SINONIMOS,
  cuenta()
);

comprobar("la segunda pasada no crea ingredientes", segunda.ingredientesNuevos, []);
comprobar("ni borra nada", segunda.aBorrar, []);

// El caso que faltaba. La primera version comprobaba el CONTENIDO de lo que
// escribiria la segunda pasada, y como era identico daba OK — pero escribia. Lo
// cazo revisor-codigo ejecutando el codigo. Lo que hay que comprobar es que NO
// TOCA NADA, no que lo que tocaria estaria bien.
comprobar("Y NO ESCRIBE: no manda ninguna receta", segunda.recetas, []);
comprobar(
  "asi que el resumen sale entero a cero",
  segunda.resumen,
  { reconstruidas: 0, reenlazadas: 0, ambiguas: 0, ingredientesCreados: 0, ingredientesBorrados: 0 }
);

// --- LA MEDIDA CONTRA LAS 373 LINEAS REALES ------------------------------
//
// Esto es lo que faltaba en la 089.

const catalogo133 = datos.INGREDIENTES.map((nombre, i) => ({ id: "d" + i, nombre }));
const lineasReales = datos.RECETAS.flatMap((r) => r.ingredientes).filter(
  (l) => typeof l === "string"
);

const creados = new Set();
let enCatalogo = 0;
for (const linea of lineasReales) {
  const hallado = ingredienteDeReceta(linea, catalogo133, SINONIMOS);
  if (hallado.ingrediente) enCatalogo++;
  else creados.add(hallado.nombre);
}
const ilegibles = [...creados].filter((s) => s.split(" ").length >= 4);

console.log("");
console.log(`     ${lineasReales.length} lineas reales: ${enCatalogo} enlazadas, ${creados.size} nuevas, ${ilegibles.length} ilegibles`);

comprobar(
  "MEDIDA REAL: al menos 300 de las 373 lineas enlazan con los 133",
  enCatalogo >= 300,
  true
);

comprobar(
  "MEDIDA REAL: no se crean mas de 25 ingredientes nuevos (la 089 creo 181)",
  creados.size <= 25,
  true
);

comprobar(
  "MEDIDA REAL: no mas de 15 ilegibles (la 089 dejo 114)",
  ilegibles.length <= 15,
  true
);

if (ilegibles.length) {
  console.log("\n     Los que se crearian con 4+ palabras, para vigilarlos:");
  ilegibles.forEach((s) => console.log("       - " + s));
}

console.log(
  mal === 0 ? "\nTodos los casos de reparación pasan." : `\n${mal} fallos.`
);
process.exit(mal === 0 ? 0 : 1);
