// Casos del aviso de receta enlazada que no aparece en el texto (spec 091).
// Se ejecuta con: node docs/specs/091-aviso-casos.mjs
import fs from "node:fs";

const fuente = fs
  .readFileSync("js/dietas.js", "utf8")
  .replace(/^import[\s\S]*?from\s+"https:[^"]+";\s*$/gm, "")
  .replace(/^import[\s\S]*?from\s+"\.\/[^"]+";\s*$/gm, "")
  .replace(/export async function leerDietaActiva[\s\S]*?\n}/m, "")
  .replace(/export function guardarDieta[\s\S]*?\n}/m, "")
  .replace(/export function actualizarDieta[\s\S]*?\n}/m, "")
  .replace(/export function borrarDieta[\s\S]*?\n}/m, "")
  .replace(/export async function guardarRecetasPropuestas[\s\S]*?\n}/m, "")
  .replace(/export async function pedirDietaALaIa[\s\S]*$/m, "")
  .replace(/^function coleccionDe[\s\S]*?\n}/m, "");

const m = await import(
  "data:text/javascript;base64," + Buffer.from(fuente, "utf8").toString("base64")
);

const { recetasQueNoAparecen } = m;

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

const nombres = (lista) => lista.map((r) => r.nombre);

const ensalada = { id: "e", nombre: "Ensalada de repollo y manzana", alias: [] };
const tortilla = {
  id: "t",
  nombre: "Tortilla de atún",
  alias: ["Tortilla de 2 huevos con 1 lata de atún al natural"]
};

// --- EL CASO QUE MOTIVÓ LA SPEC -----------------------------------------

comprobar(
  "EL CASO: el texto solo nombra una y la otra sigue enlazada",
  nombres(recetasQueNoAparecen("Tortilla de atún", [ensalada, tortilla])),
  ["Ensalada de repollo y manzana"]
);

comprobar(
  "si el texto las nombra las dos, no avisa de nada",
  recetasQueNoAparecen(
    "Ensalada de repollo y manzana. Tortilla de atún",
    [ensalada, tortilla]
  ),
  []
);

comprobar(
  "con el texto vacío avisa de todas",
  nombres(recetasQueNoAparecen("", [ensalada, tortilla])),
  ["Ensalada de repollo y manzana", "Tortilla de atún"]
);

// --- LOS ALIAS, que es lo que evita 24 avisos en falso -------------------

comprobar(
  "EL ALIAS CUENTA: el plato del menú no nombra la receta pero sí su alias",
  recetasQueNoAparecen(
    "Tortilla de 2 huevos con 1 lata de atún al natural",
    [tortilla]
  ),
  []
);

comprobar(
  "y una receta sin alias que tampoco aparece, sí avisa",
  nombres(
    recetasQueNoAparecen("Tortilla de 2 huevos con 1 lata de atún al natural", [
      ensalada
    ])
  ),
  ["Ensalada de repollo y manzana"]
);

// --- Cómo se compara -----------------------------------------------------

comprobar(
  "sin tildes ni mayúsculas: cuenta igual",
  recetasQueNoAparecen("ENSALADA DE REPOLLO Y MANZANA de cena", [ensalada]),
  []
);

comprobar(
  "el nombre dentro de una frase mas larga cuenta",
  recetasQueNoAparecen("hoy toca Tortilla de atún con pan", [tortilla]),
  []
);

// --- Casos límite --------------------------------------------------------

comprobar("sin recetas enlazadas no avisa", recetasQueNoAparecen("lo que sea", []), []);
comprobar("ni con la lista sin poner", recetasQueNoAparecen("lo que sea", undefined), []);

comprobar(
  "una receta sin campo alias no revienta",
  nombres(recetasQueNoAparecen("otra cosa", [{ id: "x", nombre: "Lentejas" }])),
  ["Lentejas"]
);

comprobar(
  "un alias vacío no cuenta como que aparece",
  nombres(recetasQueNoAparecen("otra cosa", [{ id: "x", nombre: "Lentejas", alias: [""] }])),
  ["Lentejas"]
);

console.log(mal === 0 ? "\nTodos los casos del aviso pasan." : `\n${mal} fallos.`);
process.exit(mal === 0 ? 0 : 1);
