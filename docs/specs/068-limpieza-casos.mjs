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

const { ingredienteDeLinea, clasificarIngredientes, mismoIngrediente } = m;
const ingredientesNuevosDe = (receta, despensa) =>
  clasificarIngredientes(receta, despensa).nuevos;

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

// --- Singular y plural, y los parecidos (spec 072) ------------------------

const mismo = (a, b) => mismoIngrediente(a, b);

comprobar("tomate = tomates", mismo("tomate", "tomates"), true);
comprobar("coliflor = coliflores", mismo("coliflor", "coliflores"), true);
comprobar("al reves tambien", mismo("lentejas", "lenteja"), true);
comprobar("sin tildes ni mayusculas", mismo("  JAMON ", "jamon"), true);
comprobar("tomate NO es tomate triturado", mismo("tomate", "tomate triturado"), false);
comprobar("leche NO es leche de avena", mismo("leche", "leche de avena"), false);
comprobar("pimiento NO es pimienta", mismo("pimiento", "pimienta"), false);
comprobar("sal NO es salmon", mismo("sal", "salmon"), false);

// Lo que se pregunta en vez de unirse solo.
const conTomate = [{ id: "1", nombre: "tomate", tengo: true }];

comprobar(
  "el plural no molesta: tomates ya lo tienes",
  clasificarIngredientes({ ingredientes: ["2 tomates"] }, conTomate),
  { nuevos: [], dudas: [] }
);

comprobar(
  "tomate triturado se PREGUNTA, no se une",
  clasificarIngredientes({ ingredientes: ["tomate triturado"] }, conTomate),
  { nuevos: [], dudas: [{ nombre: "tomate triturado", parecido: "tomate" }] }
);

comprobar(
  "lo que no se parece a nada entra directo",
  clasificarIngredientes({ ingredientes: ["1 cebolla"] }, conTomate),
  { nuevos: ["cebolla"], dudas: [] }
);

comprobar(
  "leche de avena se pregunta contra leche",
  clasificarIngredientes(
    { ingredientes: ["leche de avena"] },
    [{ id: "1", nombre: "leche", tengo: true }]
  ),
  { nuevos: [], dudas: [{ nombre: "leche de avena", parecido: "leche" }] }
);

comprobar(
  "salmon NO se pregunta contra sal",
  clasificarIngredientes(
    { ingredientes: ["salmon"] },
    [{ id: "1", nombre: "sal", tengo: true }]
  ),
  { nuevos: ["salmon"], dudas: [] }
);

comprobar(
  "dentro de la misma receta, tomate y tomates no entran los dos",
  clasificarIngredientes({ ingredientes: ["1 tomate", "2 tomates"] }, []).nuevos,
  ["tomate"]
);
