// Casos de ingredienteDeLinea() y ingredientesNuevosDe(), spec 068.
// Se ejecuta con: node docs/specs/068-limpieza-casos.mjs
//
// Ejecuta el módulo de verdad (js/despensa.js), recortándole los imports de
// Firebase, que necesitan red. Mismo enfoque que 059-cruce-casos.mjs.
import fs from "node:fs";

const fuente = fs
  .readFileSync("js/despensa.js", "utf8")
  .replace(/^import[\s\S]*?from\s+"[^"]+";\s*$/gm, "")
  .replace(/export async function listarDespensa[\s\S]*$/m, "");

const m = await import(
  "data:text/javascript;base64," + Buffer.from(fuente, "utf8").toString("base64")
);

const { ingredienteDeLinea, ingredientesNuevosDe } = m;

let mal = 0;
const ok = (linea, esperado, nota) => {
  const real = ingredienteDeLinea(linea);
  if (real !== esperado) {
    mal++;
    console.log(`MAL  "${linea}" -> "${real}"  (esperado "${esperado}") [${nota}]`);
  }
};

// --- Lo que hay que limpiar ---
ok("200 g de lentejas", "lentejas", "numero + unidad + de");
ok("2 dientes de ajo", "ajo", "unidad en plural");
ok("1 cebolla", "cebolla", "solo numero");
ok("3 zanahorias", "zanahorias", "solo numero, plural");
ok("1/2 pimiento rojo", "pimiento rojo", "fraccion");
ok("1,5 kg de patatas", "patatas", "decimal con coma");
ok("2-3 cucharadas de aceite", "aceite", "rango");
ok("500 ml de caldo", "caldo", "mililitros");
ok("1 pizca de sal", "sal", "pizca");
ok("2 filetes de pollo", "pollo", "filetes");
ok("sal al gusto", "sal", "coletilla del final");
ok("pimienta, al gusto", "pimienta", "coletilla con coma");
ok("perejil (opcional)", "perejil", "parentesis");
ok("pollo (pechuga)", "pollo", "parentesis con aclaracion");

// --- Lo que NO se debe tocar: aqui es donde una heuristica hace dano ---
ok("aceite de oliva", "aceite de oliva", "el 'de' suelto NO se quita");
ok("leche de avena", "leche de avena", "idem");
ok("queso de cabra", "queso de cabra", "idem");
ok("tomate triturado", "tomate triturado", "sin numero, sin tocar");
ok("mix de verduras congelado", "mix de verduras congelado", "frase entera");
ok("sal", "sal", "una palabra");
ok("diente de ajo", "diente de ajo", "sin numero delante, no es unidad");
ok("", "", "vacio");
ok("   ", "", "solo espacios");

console.log(mal === 0 ? "Todos los casos de limpieza pasan." : `${mal} fallos.`);

// --- ingredientesNuevosDe ---
const comprobar = (nombre, real, esperado) => {
  const bien = JSON.stringify(real) === JSON.stringify(esperado);
  if (!bien) console.log(`MAL  ${nombre}: ${JSON.stringify(real)}`);
  else console.log(`OK   ${nombre}`);
};

const despensa = [{ id: "1", nombre: "Sal", tengo: true }];

comprobar(
  "no repite lo que ya tienes (ni con otras mayusculas)",
  ingredientesNuevosDe({ ingredientes: ["1 pizca de sal", "200 g de lentejas"] }, despensa),
  ["lentejas"]
);

comprobar(
  "no repite dentro de la misma receta",
  ingredientesNuevosDe({ ingredientes: ["1 tomate", "2 tomates"] }, []),
  ["tomate", "tomates"]
);

comprobar(
  "receta sin ingredientes no revienta",
  ingredientesNuevosDe({}, despensa),
  []
);

comprobar(
  "lineas vacias se ignoran",
  ingredientesNuevosDe({ ingredientes: ["", "   ", "1 cebolla"] }, []),
  ["cebolla"]
);
