// Lista los ingredientes que la reparación NO encuentra (spec 090).
//
//     node docs/menus/proponer-sinonimos.mjs
//
// NO escribe nada: solo enseña por pantalla lo que se crearía como ingrediente
// nuevo, para poder decidir a mano si alguno tiene equivalente en la despensa y
// merece una línea en docs/menus/sinonimos-ingredientes.json.
//
// La tabla de sinónimos se escribe A MANO, a propósito. Un sinónimo equivocado
// mete un ingrediente donde no toca, y eso no se nota hasta que la lista de la
// compra pide algo raro. Es la misma decisión que con los alias de la spec 089.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, "..", "..");

const { INGREDIENTES, RECETAS } = await import(
  "file:///" + path.join(RAIZ, "js", "datos-iniciales.js").replace(/\\/g, "/")
);

// Se ejecuta el módulo de verdad, recortándole lo que toca la red: si esto
// usara una copia de la extracción, mediría otra cosa distinta de la que corre.
const sinImports = (ruta) =>
  fs
    .readFileSync(path.join(RAIZ, ruta), "utf8")
    .replace(/^import[\s\S]*?from\s+"https:[^"]+";\s*$/gm, "")
    .replace(/^import[\s\S]*?from\s+"\.\/[^"]+";\s*$/gm, "");

const despensa = sinImports("js/despensa.js");
const trozo = (nombre) =>
  despensa.match(new RegExp(`export function ${nombre}[\\s\\S]*?\\n}`, "m"))[0];

const m = await import(
  "data:text/javascript;base64," +
    Buffer.from(
      [
        despensa.match(/const UNIDADES = [\s\S]*?\n\];/m)[0],
        despensa.match(/const COLETILLAS = .*$/m)[0],
        trozo("normalizar"),
        trozo("mismoIngrediente"),
        trozo("ingredienteDeLinea"),
        trozo("esLineaEstructurada"),
        sinImports("js/normalizacion.js")
      ].join("\n"),
      "utf8"
    ).toString("base64")
);

const { sinonimos } = JSON.parse(
  fs.readFileSync(path.join(AQUI, "sinonimos-ingredientes.json"), "utf8")
);
const TABLA = new Map(Object.entries(sinonimos));

const catalogo = INGREDIENTES.map((nombre, i) => ({ id: "d" + i, nombre }));
const lineas = RECETAS.flatMap((r) => r.ingredientes).filter((l) => typeof l === "string");

const sinEncontrar = new Map();
let encontradas = 0;

for (const linea of lineas) {
  const hallado = m.ingredienteDeReceta(linea, catalogo, TABLA);
  if (hallado.ingrediente) {
    encontradas++;
    continue;
  }
  if (!sinEncontrar.has(hallado.nombre)) sinEncontrar.set(hallado.nombre, []);
  sinEncontrar.get(hallado.nombre).push(linea);
}

console.log(`Lineas de receta:        ${lineas.length}`);
console.log(`  enlazadas:             ${encontradas}`);
console.log(`  se crearian nuevas:    ${sinEncontrar.size}\n`);

if (sinEncontrar.size === 0) {
  console.log("No queda ninguna sin sitio.");
} else {
  console.log("Sin equivalente en la despensa. Mira si alguna deberia llevar sinonimo:\n");
  [...sinEncontrar.entries()]
    .sort()
    .forEach(([nombre, ejemplos]) => {
      const aviso = nombre.split(" ").length >= 4 ? "  !! ILEGIBLE" : "";
      console.log(`  "${nombre}"${aviso}`);
      console.log(`      de: ${ejemplos[0]}`);
      if (ejemplos.length > 1) console.log(`      y ${ejemplos.length - 1} linea(s) mas`);
      console.log("");
    });
}
