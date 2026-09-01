// Casos de "lo que te falta" del armario (spec 078).
// Se ejecuta con: node docs/specs/078-material-falta-casos.mjs
//
// Ejecuta js/material.js de verdad, recortándole los imports que necesitan red
// y pegándole las dos funciones de las que depende: mismoIngrediente (despensa)
// y piezasDeMaterial (catálogo). Mismo enfoque que 077-material-casos.mjs.
import fs from "node:fs";

const sinImports = (ruta) =>
  fs
    .readFileSync(ruta, "utf8")
    .replace(/^import[\s\S]*?from\s+"https:[^"]+";\s*$/gm, "")
    .replace(/^import[\s\S]*?from\s+"\.\/[^"]+";\s*$/gm, "");

const despensa = sinImports("js/despensa.js");
const normalizar = despensa.match(/export function normalizar[\s\S]*?\n}/m)[0];
const mismo = despensa.match(/export function mismoIngrediente[\s\S]*?\n}/m)[0];

const catalogo = sinImports("js/ejercicios-catalogo.js");
const constantes = catalogo.match(/const SIN_MATERIAL[\s\S]*?\n\];/m)[0];
const esNinguno = catalogo.match(/function esDecirNinguno[\s\S]*?\n}/m)[0];
const piezas = catalogo.match(/export function piezasDeMaterial[\s\S]*?\n}/m)[0];

const material = sinImports("js/material.js")
  // Todo lo que toca Firestore fuera: aquí solo se prueba qué decide.
  .replace(/^function coleccionDe[\s\S]*?\n}/m, "")
  .replace(/export function guardarMaterial[\s\S]*?\n}/m, "")
  .replace(/export function renombrarMaterial[\s\S]*?\n}/m, "")
  .replace(/export function marcarMaterial[\s\S]*?\n}/m, "")
  .replace(/export function borrarMaterial[\s\S]*?\n}/m, "")
  .replace(/export async function listarMaterial[\s\S]*$/m, "");

const m = await import(
  "data:text/javascript;base64," +
    Buffer.from(
      [normalizar, mismo, constantes, esNinguno, piezas, material].join("\n"),
      "utf8"
    ).toString("base64")
);

const { materialQueFalta } = m;

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

const catalogoDePrueba = [
  { id: "e1", nombre: "Press banca", material: "mancuernas, banco" },
  { id: "e2", nombre: "Sentadillas", material: "barra, discos" },
  { id: "e3", nombre: "Plancha", material: "ninguno" },
  { id: "e4", nombre: "Remo", material: "mancuerna" }
];

const tablaCon = (...ids) => ({
  dias: [
    {
      dia: "lunes",
      sesion: {
        titulo: "Torso",
        minutos: 45,
        ejercicios: ids.map((id) => ({ texto: "lo que sea", ejercicioId: id }))
      }
    },
    { dia: "martes", sesion: null }
  ]
});

// --- Lo básico ------------------------------------------------------------

comprobar(
  "sin tabla no falta nada",
  materialQueFalta(null, catalogoDePrueba, []),
  []
);

comprobar(
  "con el armario vacío, falta todo lo que pide",
  materialQueFalta(tablaCon("e1"), catalogoDePrueba, []).map((f) => f.nombre),
  ["mancuernas", "banco"]
);

comprobar(
  "lo que tienes MARCADO no falta",
  materialQueFalta(tablaCon("e1"), catalogoDePrueba, [
    { id: "m1", nombre: "Mancuernas", tengo: true }
  ]).map((f) => f.nombre),
  ["banco"]
);

comprobar(
  "lo que tienes apuntado pero DESMARCADO sí falta, y trae su id",
  materialQueFalta(tablaCon("e1"), catalogoDePrueba, [
    { id: "m1", nombre: "Mancuernas", tengo: true },
    { id: "m2", nombre: "Banco de pesas", tengo: false }
  ]),
  [{ nombre: "banco", materialId: null }]
);

comprobar(
  "y cuando el nombre casa, manda el de TU armario",
  materialQueFalta(tablaCon("e1"), catalogoDePrueba, [
    { id: "m2", nombre: "Banco", tengo: false }
  ]).find((f) => f.materialId === "m2"),
  { nombre: "Banco", materialId: "m2" }
);

// --- Duplicados y plurales ------------------------------------------------

comprobar(
  "la misma pieza en dos ejercicios sale una sola vez",
  materialQueFalta(tablaCon("e1", "e4"), catalogoDePrueba, []).map((f) => f.nombre),
  ["mancuernas", "banco"]
);

comprobar(
  "el singular del ejercicio encuentra tu plural marcado (spec 072)",
  materialQueFalta(tablaCon("e4"), catalogoDePrueba, [
    { id: "m1", nombre: "Mancuernas", tengo: true }
  ]),
  []
);

// --- Días, enlaces y descansos --------------------------------------------

comprobar(
  "un día de descanso no pide nada",
  materialQueFalta(
    { dias: [{ dia: "lunes", sesion: null }] },
    catalogoDePrueba,
    []
  ),
  []
);

comprobar(
  "una línea sin enlace al catálogo no aporta material",
  materialQueFalta(tablaCon(""), catalogoDePrueba, []),
  []
);

comprobar(
  "un enlace a un ejercicio ya borrado se salta, sin romper",
  materialQueFalta(tablaCon("fantasma"), catalogoDePrueba, []),
  []
);

comprobar(
  'un ejercicio de "ninguno" no aporta piezas',
  materialQueFalta(tablaCon("e3"), catalogoDePrueba, []),
  []
);

comprobar(
  "con todo marcado, no falta nada",
  materialQueFalta(tablaCon("e1", "e2"), catalogoDePrueba, [
    { id: "m1", nombre: "mancuernas", tengo: true },
    { id: "m2", nombre: "banco", tengo: true },
    { id: "m3", nombre: "barra", tengo: true },
    { id: "m4", nombre: "discos", tengo: true }
  ]),
  []
);

comprobar(
  "dos ejercicios en dos días distintos suman sus piezas",
  materialQueFalta(tablaCon("e1", "e2"), catalogoDePrueba, []).map((f) => f.nombre),
  ["mancuernas", "banco", "barra", "discos"]
);

console.log(
  mal === 0 ? "\nTodos los casos de lo que falta pasan." : `\n${mal} fallos.`
);
process.exit(mal === 0 ? 0 : 1);
