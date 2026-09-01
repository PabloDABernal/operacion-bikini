// Casos del material en piezas y su cruce con el armario (spec 077).
// Se ejecuta con: node docs/specs/077-material-casos.mjs
//
// Ejecuta js/ejercicios-catalogo.js de verdad, recortándole los imports que
// necesitan red. Mismo enfoque que 086-distancia-casos.mjs.
import fs from "node:fs";

// mismoIngrediente sí se ejecuta de verdad: es lo que decide que "mancuerna" y
// "mancuernas" son la misma pieza (spec 072), y probar el cruce con una copia
// de mentira no probaría nada.
const despensa = fs
  .readFileSync("js/despensa.js", "utf8")
  .replace(/^import[\s\S]*?from\s+"https:[^"]+";\s*$/gm, "")
  .replace(/^import[\s\S]*?from\s+"\.\/[^"]+";\s*$/gm, "");

const normalizar = despensa.match(/export function normalizar[\s\S]*?\n}/m)[0];
const mismo = despensa.match(/export function mismoIngrediente[\s\S]*?\n}/m)[0];

const catalogo = fs
  .readFileSync("js/ejercicios-catalogo.js", "utf8")
  .replace(/^import[\s\S]*?from\s+"https:[^"]+";\s*$/gm, "")
  .replace(/^import[\s\S]*?from\s+"\.\/[^"]+";\s*$/gm, "")
  // Todo lo que toca Firestore fuera: aquí solo se prueba qué decide.
  .replace(/export function guardarEjercicioCatalogo[\s\S]*$/m, "")
  .replace(/^function coleccionDe[\s\S]*?\n}/m, "");

const m = await import(
  "data:text/javascript;base64," +
    Buffer.from(normalizar + "\n" + mismo + "\n" + catalogo, "utf8").toString("base64")
);

const { piezasDeMaterial, cruzarConElArmario } = m;

let mal = 0;
const comprobar = (nombre, real, esperado) => {
  const bien = JSON.stringify(real) === JSON.stringify(esperado);
  if (!bien) mal++;
  console.log(
    `${bien ? "OK  " : "FALLA"} ${nombre}` +
      (bien ? "" : `\n      esperado: ${JSON.stringify(esperado)}\n      real:     ${JSON.stringify(real)}`)
  );
};

// --- Partir el material en piezas ---------------------------------------

comprobar("una coma parte en dos", piezasDeMaterial("mancuernas, banco"), [
  "mancuernas",
  "banco"
]);

comprobar(
  'el " y " cuenta como una coma más',
  piezasDeMaterial("mancuernas, banco y esterilla"),
  ["mancuernas", "banco", "esterilla"]
);

comprobar("el punto y coma también parte", piezasDeMaterial("barra; discos"), [
  "barra",
  "discos"
]);

comprobar(
  'pero el " y " no parte una palabra que lo lleve dentro',
  piezasDeMaterial("esterilla de yoga"),
  ["esterilla de yoga"]
);

comprobar("las comas de más se tiran", piezasDeMaterial("mancuernas , , banco"), [
  "mancuernas",
  "banco"
]);

comprobar('"ninguno" no es una pieza', piezasDeMaterial("ninguno"), []);
comprobar('"Ninguno." tampoco, con mayúscula y punto', piezasDeMaterial("Ninguno."), []);
comprobar('"peso corporal" tampoco', piezasDeMaterial("peso corporal"), []);
comprobar("el vacío da lista vacía", piezasDeMaterial(""), []);
comprobar("y un ejercicio sin campo, también", piezasDeMaterial(undefined), []);

comprobar(
  'un "ninguno" colado entre piezas de verdad se descarta solo',
  piezasDeMaterial("mancuernas, ninguno, banco"),
  ["mancuernas", "banco"]
);

comprobar(
  "el singular y el plural son la misma pieza, no dos (spec 072)",
  piezasDeMaterial("mancuerna, mancuernas"),
  ["mancuerna"]
);

// --- El cruce con el armario --------------------------------------------

const armario = [
  { id: "1", nombre: "Mancuernas", tengo: true },
  { id: "2", nombre: "Banco", tengo: true },
  { id: "3", nombre: "Barra", tengo: false }
];

comprobar(
  "tienes dos de las tres que pide",
  cruzarConElArmario("mancuernas, banco, barra", armario).tengo,
  2
);

comprobar(
  "y son tres en total",
  cruzarConElArmario("mancuernas, banco, barra", armario).total,
  3
);

comprobar(
  "una pieza apuntada pero DESMARCADA cuenta como que te falta",
  cruzarConElArmario("barra", armario).piezas,
  [{ nombre: "barra", tengo: false }]
);

comprobar(
  "el plural del ejercicio encuentra tu singular",
  cruzarConElArmario("mancuerna", armario).tengo,
  1
);

comprobar(
  "una pieza que no está en tu armario, falta",
  cruzarConElArmario("kettlebell", armario).piezas,
  [{ nombre: "kettlebell", tengo: false }]
);

comprobar(
  "sin material, ni piezas ni recuento",
  cruzarConElArmario("ninguno", armario),
  { piezas: [], tengo: 0, total: 0 }
);

comprobar(
  "con el armario vacío, todo falta",
  cruzarConElArmario("mancuernas, banco", []).tengo,
  0
);

console.log(mal === 0 ? "\nTodos los casos de material pasan." : `\n${mal} fallos.`);
process.exit(mal === 0 ? 0 : 1);
