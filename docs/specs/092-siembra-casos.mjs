// Casos de la siembra enlazada (spec 092).
// Se ejecuta con: node docs/specs/092-siembra-casos.mjs
//
// Igual que la 090, esto NO son casos inventados: comprueba los datos de verdad
// que se le van a meter a la cuenta del usuario. Es lo que pidió al reiniciar:
// que no haya duplicados, que las recetas estén bien y que todo vaya en
// mayúscula.
import fs from "node:fs";

const datos = await import("../../js/datos-iniciales.js");

// La siembra de verdad, recortándole lo que toca la red.
const fuente = fs
  .readFileSync("js/siembra.js", "utf8")
  .replace(/^import[\s\S]*?from\s+"https:[^"]+";\s*$/gm, "")
  .replace(/^import[\s\S]*?from\s+"\.\/[^"]+";\s*$/gm, "")
  .replace(/export function olvidarLaSiembra[\s\S]*?\n}/m, "")
  .replace(/export async function sembrar[\s\S]*$/m, "")
  .replace(/^async function porLotes[\s\S]*?\n}/m, "");

const despensa = fs
  .readFileSync("js/despensa.js", "utf8")
  .replace(/^import[\s\S]*?from\s+"https:[^"]+";\s*$/gm, "")
  .replace(/^import[\s\S]*?from\s+"\.\/[^"]+";\s*$/gm, "");
const trozo = (n) => despensa.match(new RegExp(`export function ${n}[\\s\\S]*?\\n}`, "m"))[0];

const m = await import(
  "data:text/javascript;base64," +
    Buffer.from(
      [trozo("normalizar"), trozo("mismoIngrediente"), fuente, "export { lineasEnlazadas };"].join("\n"),
      "utf8"
    ).toString("base64")
);

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

const clave = (t) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

// --- LO QUE PIDIÓ EL USUARIO, sobre los datos de verdad ------------------

comprobar(
  "ningun ingrediente repetido, ni exacto ni por singular/plural",
  datos.INGREDIENTES.filter((uno, i) =>
    datos.INGREDIENTES.some((otro, j) => {
      if (i >= j) return false;
      const a = clave(uno);
      const b = clave(otro);
      return a === b || a === `${b}s` || b === `${a}s` || a === `${b}es` || b === `${a}es`;
    })
  ),
  []
);

comprobar(
  "todos los ingredientes empiezan por mayuscula",
  datos.INGREDIENTES.filter((n) => n[0] !== n[0].toUpperCase()),
  []
);

comprobar(
  "ninguno se queda vacio ni con espacios de sobra",
  datos.INGREDIENTES.filter((n) => n !== n.trim() || n === ""),
  []
);

// --- Las recetas -----------------------------------------------------------

const enLaLista = (nombre) => datos.INGREDIENTES.some((i) => clave(i) === clave(nombre));

const sinSitio = [];
let piezas = 0;
datos.RECETAS.forEach((receta) => {
  (receta.ingredientesEnPiezas || []).forEach((pieza) => {
    piezas++;
    if (!enLaLista(pieza.ingrediente)) sinSitio.push(`${receta.nombre}: ${pieza.ingrediente}`);
  });
});

comprobar("TODA pieza de receta apunta a un ingrediente de la lista", sinSitio, []);

comprobar(
  "las 73 recetas tienen sus piezas",
  datos.RECETAS.filter((r) => (r.ingredientesEnPiezas || []).length === 0).map((r) => r.nombre),
  []
);

comprobar(
  "hay una pieza por cada linea de texto, ni una mas ni una menos",
  datos.RECETAS.every(
    (r) => (r.ingredientesEnPiezas || []).length === (r.ingredientes || []).length
  ),
  true
);

// --- Lo que NO puede cambiar ----------------------------------------------

comprobar(
  "el texto original SIGUE ahi: de el lee la reparacion de la spec 090",
  datos.RECETAS.every((r) => (r.ingredientes || []).every((l) => typeof l === "string")),
  true
);

comprobar(
  "y los alias siguen puestos (spec 089)",
  datos.RECETAS.filter((r) => !Array.isArray(r.alias)).map((r) => r.nombre),
  []
);

// --- El enlace que hace la siembra -----------------------------------------

const receta = {
  nombre: "Prueba",
  ingredientesEnPiezas: [
    { ingrediente: "Tomate", cantidad: "2", preparacion: "" },
    { ingrediente: "Perejil", cantidad: "", preparacion: "" }
  ]
};

comprobar(
  "cada pieza queda enlazada al ingrediente del usuario",
  m.lineasEnlazadas(receta, (nombre) =>
    [
      { id: "t", nombre: "Tomates" },
      { id: "p", nombre: "Perejil" }
    ].find((i) => m.mismoIngrediente(i.nombre, nombre))
  ),
  [
    { ingredienteId: "t", ingredienteNombre: "Tomates", cantidad: "2", preparacion: "" },
    { ingredienteId: "p", ingredienteNombre: "Perejil", cantidad: "", preparacion: "" }
  ]
);

comprobar(
  "y si no se encuentra, la linea va SIN enlazar en vez de apuntar al vacio",
  m.lineasEnlazadas(receta, () => undefined)[0],
  { ingredienteId: "", ingredienteNombre: "Tomate", cantidad: "2", preparacion: "" }
);

console.log("");
console.log(`     ${datos.INGREDIENTES.length} ingredientes, ${datos.RECETAS.length} recetas, ${piezas} piezas enlazadas`);
console.log(mal === 0 ? "\nTodos los casos de la siembra enlazada pasan." : `\n${mal} fallos.`);
process.exit(mal === 0 ? 0 : 1);
