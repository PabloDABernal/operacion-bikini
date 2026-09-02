// Casos de "comprado todo" (spec 096).
// Se ejecuta con: node docs/specs/096-comprado-todo-casos.mjs
import fs from "node:fs";

const sinImports = (ruta) =>
  fs
    .readFileSync(ruta, "utf8")
    .replace(/^import[\s\S]*?from\s+"https:[^"]+";\s*$/gm, "")
    .replace(/^import[\s\S]*?from\s+"\.\/[^"]+";\s*$/gm, "");

const despensa = sinImports("js/despensa.js");
const trozo = (n) => despensa.match(new RegExp(`export function ${n}[\\s\\S]*?\\n}`, "m"))[0];

const compra = sinImports("js/compra.js")
  // Fuera lo que toca Firestore: aquí solo se prueba el reparto.
  .replace(/export function guardarApunte[\s\S]*?\n}/m, "")
  .replace(/export function borrarApunte[\s\S]*?\n}/m, "")
  .replace(/export async function listarCompra[\s\S]*?\n}/m, "")
  .replace(/export async function comprarTodo[\s\S]*$/m, "")
  .replace(/^function coleccionDe[\s\S]*?\n}/m, "");

const m = await import(
  "data:text/javascript;base64," +
    Buffer.from([trozo("normalizar"), trozo("mismoIngrediente"), compra].join("\n"), "utf8").toString("base64")
);

const { repartoDeLaCompra } = m;

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

const DESPENSA = [
  { id: "d1", nombre: "Huevos", tengo: false },
  { id: "d2", nombre: "Atún", tengo: false }
];

// --- Los tres montones ---------------------------------------------------

comprobar(
  "lo que falta de la dieta y esta en tu despensa, se MARCA",
  repartoDeLaCompra([{ nombre: "Huevos", ingredienteId: "d1", apunteId: null }], DESPENSA).marcar,
  [{ id: "d1", nombre: "Huevos" }]
);

comprobar(
  "lo que no esta en tu despensa, se CREA",
  repartoDeLaCompra([{ nombre: "Merluza", ingredienteId: null, apunteId: null }], DESPENSA).crear,
  ["Merluza"]
);

comprobar(
  "un apunte a mano se BORRA",
  repartoDeLaCompra([{ nombre: "Papel higiénico", ingredienteId: null, apunteId: "a1" }], DESPENSA)
    .borrarApuntes,
  ["a1"]
);

comprobar(
  "y ademas se crea, porque no lo tenias",
  repartoDeLaCompra([{ nombre: "Papel higiénico", ingredienteId: null, apunteId: "a1" }], DESPENSA)
    .crear,
  ["Papel higiénico"]
);

// --- EL FALLO DE LA 073 QUE SE ARREGLA AQUI ------------------------------

comprobar(
  "UN APUNTE QUE YA TIENES marca el que hay, NO crea un duplicado",
  repartoDeLaCompra([{ nombre: "huevos", ingredienteId: null, apunteId: "a1" }], DESPENSA),
  {
    marcar: [{ id: "d1", nombre: "Huevos" }],
    crear: [],
    borrarApuntes: ["a1"],
    cuantas: 1
  }
);

comprobar(
  "y cuenta el singular contra el plural (spec 072)",
  repartoDeLaCompra([{ nombre: "huevo", ingredienteId: null, apunteId: "a1" }], DESPENSA).crear,
  []
);

comprobar(
  "sin tildes ni mayusculas, tambien",
  repartoDeLaCompra([{ nombre: "ATUN", ingredienteId: null, apunteId: "a1" }], DESPENSA).marcar,
  [{ id: "d2", nombre: "Atún" }]
);

// --- Nada repetido -------------------------------------------------------

comprobar(
  "lo mismo dos veces en la lista no se marca dos veces",
  repartoDeLaCompra(
    [
      { nombre: "Huevos", ingredienteId: "d1", apunteId: null },
      { nombre: "huevos", ingredienteId: null, apunteId: "a1" }
    ],
    DESPENSA
  ).marcar,
  [{ id: "d1", nombre: "Huevos" }]
);

comprobar(
  "ni se crea dos veces lo mismo",
  repartoDeLaCompra(
    [
      { nombre: "Merluza", ingredienteId: null, apunteId: null },
      { nombre: "merluzas", ingredienteId: null, apunteId: "a2" }
    ],
    DESPENSA
  ).crear,
  ["Merluza"]
);

// --- Las cuentas y los casos limite --------------------------------------

comprobar(
  "la lista entera se reparte bien",
  repartoDeLaCompra(
    [
      { nombre: "Huevos", ingredienteId: "d1", apunteId: null },
      { nombre: "Merluza", ingredienteId: null, apunteId: null },
      { nombre: "Papel higiénico", ingredienteId: null, apunteId: "a1" }
    ],
    DESPENSA
  ),
  {
    marcar: [{ id: "d1", nombre: "Huevos" }],
    crear: ["Merluza", "Papel higiénico"],
    borrarApuntes: ["a1"],
    cuantas: 3
  }
);

comprobar(
  "una lista vacia no hace nada",
  repartoDeLaCompra([], DESPENSA),
  { marcar: [], crear: [], borrarApuntes: [], cuantas: 0 }
);

comprobar(
  "sin lista no revienta",
  repartoDeLaCompra(undefined, DESPENSA).cuantas,
  0
);

comprobar(
  "sin despensa, todo se crea",
  repartoDeLaCompra([{ nombre: "Huevos", ingredienteId: null, apunteId: "a1" }], []).crear,
  ["Huevos"]
);

console.log(mal === 0 ? "\nTodos los casos de comprado todo pasan." : `\n${mal} fallos.`);
process.exit(mal === 0 ? 0 : 1);
