// Ejecuta los casos de docs/specs/059-cruce-casos.mjs contra la implementación
// de verdad de js/despensa.js, sin el import de Firebase (que necesita red).
import fs from "node:fs";

const fuente = fs.readFileSync("js/despensa.js", "utf8");

// Nos quedamos solo con las funciones puras: fuera los imports de Firebase y
// todo lo que toque la red.
const sinImports = fuente
  .replace(/^import[\s\S]*?from\s+"[^"]+";\s*$/gm, "")
  .replace(/export async function listarDespensa[\s\S]*$/m, "");

const modulo = await import(
  "data:text/javascript;base64," + Buffer.from(sinImports, "utf8").toString("base64")
);

const { lineaTieneIngrediente, cruzarConLaDespensa, normalizar, loQueTengo } = modulo;

const casos = [
  ["2 tomates maduros", "tomate", true, "plural, el caso normal"],
  ["1 tomate", "tomate", true, "singular exacto"],
  ["salmon a la plancha", "sal", false, "EL filo: sal dentro de salmon"],
  ["salmón a la plancha", "sal", false, "lo mismo con tilde"],
  ["sal al gusto", "sal", true, "sal de verdad"],
  ["100 g de lentejas", "lenteja", true, "plural en -s"],
  ["ajos tiernos", "ajo", true, "plural en -s"],
  ["aceite de oliva", "ajo", false, "ajo no esta"],
  ["pimiento rojo", "pimiento", true, "el tuyo mas corto que la linea"],
  ["2 coliflores", "coliflor", true, "plural en -es"],
  ["arroz redondo", "arroz", true, "acaba en z"],
  ["mix de verduras congelado", "verdura", true, "tu ingrediente dentro de una frase"],
  ["verduras congeladas", "mix de verduras congelado", false, "al reves no"],
  ["harina de trigo", "harina", true, "primera palabra"],
  ["leche entera", "lechuga", false, "prefijo parecido, no es"],
  ["pechuga de pollo", "pollo", true, "ultima palabra"],
  ["Tomate", "tomate", true, "mayusculas"],
  ["  TOMATES  ", "Tomate", true, "espacios y mayusculas"],
  ["aceite (virgen extra)", "aceite (virgen extra)", true, "parentesis, regex escapada"],
  ["2 dientes de ajo", "", false, "ingrediente vacio no marca nada"]
];

let mal = 0;
for (const [linea, ing, esperado, nota] of casos) {
  const r = lineaTieneIngrediente(linea, ing);
  if (r !== esperado) {
    mal++;
    console.log(`MAL  "${ing}" en "${linea}" -> ${r} (esperado ${esperado}) [${nota}]`);
  }
}
console.log(mal === 0 ? `Los ${casos.length} casos de la regla pasan.` : `${mal} fallos.`);

// --- El resto del cruce ---------------------------------------------------

const despensa = [
  { id: "1", nombre: "tomate", tengo: true },
  { id: "2", nombre: "cebolla", tengo: true },
  { id: "3", nombre: "pollo", tengo: false }
];

const salida = cruzarConLaDespensa(
  ["2 tomates", "1 cebolla", "pechuga de pollo", "3 tomates maduros"],
  despensa
);
console.log("\ncruce:", JSON.stringify(salida.map((i) => [i.texto, i.tengo])));

const comprobar = (nombre, real, esperado) => {
  const ok = JSON.stringify(real) === JSON.stringify(esperado);
  console.log(`${ok ? "OK " : "MAL"}  ${nombre}`);
  return ok;
};

comprobar("el tomate no cuenta dos veces", salida.map((i) => i.tengo), [true, true, false, false]);
comprobar("lo desmarcado no cuenta (pollo)", salida[2].tengo, false);
comprobar("receta sin ingredientes no revienta", cruzarConLaDespensa(undefined, despensa), []);
comprobar("despensa vacia: todo falta", cruzarConLaDespensa(["tomate"], []).map((i) => i.tengo), [false]);
comprobar("loQueTengo solo lo marcado", loQueTengo(despensa), ["tomate", "cebolla"]);
comprobar("normalizar", normalizar("  JAMÓN Serrano "), "jamon serrano");
