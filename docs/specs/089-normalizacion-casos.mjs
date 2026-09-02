// Casos de la normalización de recetas (spec 089).
// Se ejecuta con: node docs/specs/089-normalizacion-casos.mjs
//
// Ejecuta js/normalizacion.js de verdad, con las funciones reales de
// js/despensa.js pegadas: probar el enlazado con una copia de mentira de
// mismoIngrediente() no probaría lo que importa.
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

const { cantidadDeLinea, planDeNormalizacion, aliasDeLosDatos } = m;

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

// Un generador de ids de mentira, para poder comprobar cuáles se crean.
const contador = () => {
  let n = 0;
  return () => `nuevo${++n}`;
};
const sinAlias = new Map();

// --- La cantidad ---------------------------------------------------------

comprobar(
  "la cantidad es lo que se quitó por delante",
  cantidadDeLinea("200 g de lentejas", "lentejas"),
  "200 g"
);

comprobar(
  "sin cantidad, queda vacía",
  cantidadDeLinea("sal", "sal"),
  ""
);

comprobar(
  "el 'de' que unía la unidad no se queda pegado",
  cantidadDeLinea("2 dientes de ajo", "ajo"),
  "2 dientes"
);

comprobar(
  "si el ingrediente no se encuentra dentro, vacío antes que inventado",
  cantidadDeLinea("pollo (pechuga) asado", "pollo asado"),
  ""
);

// --- El plan -------------------------------------------------------------

const recetaTexto = {
  id: "r1",
  nombre: "Tortilla de atún",
  ingredientes: ["200 g de lentejas", "2 dientes de ajo"]
};

comprobar(
  "una receta de texto se normaliza entera",
  planDeNormalizacion([recetaTexto], [], sinAlias, contador()).recetas[0].ingredientes,
  [
    { ingredienteId: "nuevo1", ingredienteNombre: "lentejas", cantidad: "200 g", preparacion: "" },
    { ingredienteId: "nuevo2", ingredienteNombre: "ajo", cantidad: "2 dientes", preparacion: "" }
  ]
);

comprobar(
  "y crea en la despensa lo que falta",
  planDeNormalizacion([recetaTexto], [], sinAlias, contador()).ingredientesNuevos,
  [
    { id: "nuevo1", nombre: "lentejas" },
    { id: "nuevo2", nombre: "ajo" }
  ]
);

comprobar(
  "si el ingrediente ya está en tu despensa, se enlaza al tuyo",
  planDeNormalizacion(
    [recetaTexto],
    [{ id: "mio", nombre: "Lentejas", tengo: true }],
    sinAlias,
    contador()
  ).recetas[0].ingredientes[0].ingredienteId,
  "mio"
);

comprobar(
  "el plural cuenta como el mismo (spec 072): no se duplica",
  planDeNormalizacion(
    [{ id: "r1", nombre: "x", ingredientes: ["1 diente de ajos"] }],
    [{ id: "mio", nombre: "ajo", tengo: false }],
    sinAlias,
    contador()
  ).ingredientesNuevos,
  []
);

// --- EL BLOQUEANTE: no duplicar entre recetas distintas -------------------

const dosRecetasConHuevo = [
  { id: "r1", nombre: "Una", ingredientes: ["2 huevos"] },
  { id: "r2", nombre: "Otra", ingredientes: ["1 huevo"] },
  { id: "r3", nombre: "Tercera", ingredientes: ["3 huevos", "sal"] }
];

comprobar(
  "EL BLOQUEANTE: 'huevo' en tres recetas se crea UNA sola vez",
  planDeNormalizacion(dosRecetasConHuevo, [], sinAlias, contador()).ingredientesNuevos,
  [
    { id: "nuevo1", nombre: "huevos" },
    { id: "nuevo2", nombre: "sal" }
  ]
);

comprobar(
  "y las tres recetas apuntan al mismo id",
  planDeNormalizacion(dosRecetasConHuevo, [], sinAlias, contador()).recetas.map(
    (r) => r.ingredientes[0].ingredienteId
  ),
  ["nuevo1", "nuevo1", "nuevo1"]
);

// --- Lo que NO se toca ---------------------------------------------------

const yaEstructurada = {
  id: "r9",
  nombre: "Mía",
  ingredientes: [
    { ingredienteId: "abc", ingredienteNombre: "tomate", cantidad: "2", preparacion: "en rodajas" }
  ]
};

comprobar(
  "una receta ya estructurada no se toca",
  planDeNormalizacion([yaEstructurada], [], sinAlias, contador()).recetas,
  []
);

comprobar(
  "ni crea ingredientes por ella",
  planDeNormalizacion([yaEstructurada], [], sinAlias, contador()).ingredientesNuevos,
  []
);

comprobar(
  "una receta a medias normaliza solo sus líneas de texto",
  planDeNormalizacion(
    [{ id: "r1", nombre: "x", ingredientes: [yaEstructurada.ingredientes[0], "1 cebolla"] }],
    [],
    sinAlias,
    contador()
  ).recetas[0].ingredientes,
  [
    { ingredienteId: "abc", ingredienteNombre: "tomate", cantidad: "2", preparacion: "en rodajas" },
    { ingredienteId: "nuevo1", ingredienteNombre: "cebolla", cantidad: "1", preparacion: "" }
  ]
);

// --- Pulsarlo dos veces --------------------------------------------------

const primera = planDeNormalizacion([recetaTexto], [], sinAlias, contador());
const yaNormalizada = { ...recetaTexto, ingredientes: primera.recetas[0].ingredientes };
const despensaDespues = primera.ingredientesNuevos.map((i) => ({ ...i, tengo: false }));

comprobar(
  "la segunda pasada no cambia nada",
  planDeNormalizacion([yaNormalizada], despensaDespues, sinAlias, contador()).recetas,
  []
);

comprobar(
  "ni crea ingredientes de nuevo",
  planDeNormalizacion([yaNormalizada], despensaDespues, sinAlias, contador()).ingredientesNuevos,
  []
);

// --- Los alias -----------------------------------------------------------

const alias = aliasDeLosDatos([
  { nombre: "Tortilla de atún", alias: ["Tortilla de 2 huevos con 1 lata de atún al natural"] },
  { nombre: "Otra", alias: [] }
]);

comprobar("solo entran las recetas con alias", [...alias.keys()], ["Tortilla de atún"]);

comprobar(
  "una receta recibe su alias al normalizar",
  planDeNormalizacion([recetaTexto], [], alias, contador()).recetas[0].alias,
  ["Tortilla de 2 huevos con 1 lata de atún al natural"]
);

comprobar(
  "una receta YA estructurada se guarda solo para ponerle el alias",
  planDeNormalizacion(
    [{ ...yaEstructurada, nombre: "Tortilla de atún" }],
    [],
    alias,
    contador()
  ).recetas,
  [{ id: "r9", alias: ["Tortilla de 2 huevos con 1 lata de atún al natural"] }]
);

comprobar(
  "y si ya lo tenía, no se vuelve a guardar",
  planDeNormalizacion(
    [{ ...yaEstructurada, nombre: "Tortilla de atún", alias: ["Tortilla de 2 huevos con 1 lata de atún al natural"] }],
    [],
    alias,
    contador()
  ).recetas,
  []
);

// --- El resumen ----------------------------------------------------------

comprobar(
  "el resumen cuenta lo que ha pasado",
  planDeNormalizacion(dosRecetasConHuevo, [], sinAlias, contador()).resumen,
  { revisadas: 3, normalizadas: 3, lineasEnlazadas: 4, ingredientesCreados: 2 }
);

comprobar(
  "y con nada que hacer, todo a cero",
  planDeNormalizacion([yaEstructurada], [], sinAlias, contador()).resumen,
  { revisadas: 1, normalizadas: 0, lineasEnlazadas: 0, ingredientesCreados: 0 }
);

// --- Casos límite --------------------------------------------------------

comprobar(
  "una receta sin ingredientes se salta",
  planDeNormalizacion([{ id: "r1", nombre: "x", ingredientes: [] }], [], sinAlias, contador()).recetas,
  []
);

comprobar(
  "sin recetas no revienta",
  planDeNormalizacion([], [], sinAlias, contador()).resumen,
  { revisadas: 0, normalizadas: 0, lineasEnlazadas: 0, ingredientesCreados: 0 }
);

comprobar(
  "dos líneas de la MISMA receta con el mismo ingrediente lo crean una vez",
  planDeNormalizacion(
    [{ id: "r1", nombre: "x", ingredientes: ["2 huevos", "1 huevo"] }],
    [],
    sinAlias,
    contador()
  ).ingredientesNuevos.length,
  1
);

comprobar(
  "una línea que no se sabe recortar se queda entera, que es el lado seguro",
  planDeNormalizacion(
    [{ id: "r1", nombre: "x", ingredientes: ["sal y pimienta al gusto"] }],
    [],
    sinAlias,
    contador()
  ).recetas[0].ingredientes[0].ingredienteNombre,
  "sal y pimienta"
);

console.log(
  mal === 0 ? "\nTodos los casos de normalización pasan." : `\n${mal} fallos.`
);
process.exit(mal === 0 ? 0 : 1);
