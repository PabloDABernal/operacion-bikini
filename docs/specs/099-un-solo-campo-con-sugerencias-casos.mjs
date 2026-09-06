// Casos del campo único con sugerencias (spec 099).
// Se ejecuta con: node docs/specs/099-un-solo-campo-con-sugerencias-casos.mjs
import fs from "node:fs";

const fuente = fs
  .readFileSync("js/comidas.js", "utf8")
  .replace(/^import[\s\S]*?from\s+"https:[^"]+";\s*$/gm, "")
  .replace(/^import[\s\S]*?from\s+"\.\/[^"]+";\s*$/gm, "")
  .replace(/export function yaApuntada[\s\S]*$/m, "")
  .replace(/^function coleccionDe[\s\S]*?\n}/m, "");

const cabecera = `
const errorDeFecha = (f) => (f ? "" : "Falta la fecha.");
const errorDeHora = () => "";
`;

const m = await import(
  "data:text/javascript;base64," + Buffer.from(cabecera + fuente, "utf8").toString("base64")
);

const { validarComida, idsDeIngredienteDe } = m;

let mal = 0;
const comprobar = (nombre, real, esperado) => {
  const bien = JSON.stringify(real) === JSON.stringify(esperado);
  if (!bien) mal++;
  console.log(
    `${bien ? "OK  " : "FALLA"} ${nombre}` +
      (bien ? "" : `\n      esperado: ${JSON.stringify(esperado)}\n      real: ${JSON.stringify(real)}`)
  );
};

const HOY = "2026-09-06";

// --- idsDeIngredienteDe: lee las dos formas -------------------------------

comprobar(
  "comida nueva, con ingredienteIds (lista)",
  idsDeIngredienteDe({ ingredienteIds: ["i1", "i2"] }),
  ["i1", "i2"]
);

comprobar(
  "comida vieja, con ingredienteId (uno solo, spec 084)",
  idsDeIngredienteDe({ ingredienteId: "i1" }),
  ["i1"]
);

comprobar("comida escrita a mano, sin ninguno de los dos campos", idsDeIngredienteDe({}), []);

comprobar(
  "ingredienteIds gana si por lo que sea vinieran los dos campos a la vez",
  idsDeIngredienteDe({ ingredienteIds: ["i1"], ingredienteId: "i2" }),
  ["i1"]
);

comprobar(
  "una lista con huecos se limpia igual que recetaIds",
  idsDeIngredienteDe({ ingredienteIds: ["i1", "", null] }),
  ["i1"]
);

comprobar("sin comida no revienta", idsDeIngredienteDe(undefined), []);

// --- validarComida: varios ingredientes sueltos a la vez ------------------

comprobar(
  "una comida puede llevar varios ingredientes sueltos (spec 099)",
  validarComida("Tomate. Lechuga", "comida", HOY, "", [], ["i1", "i2"]).ingredienteIds,
  ["i1", "i2"]
);

comprobar(
  "y también mezclarlos con recetas",
  (() => {
    const r = validarComida("Ensalada. Tomate", "comida", HOY, "", [], ["i1"], ["r1"]);
    return { ingredienteIds: r.ingredienteIds, recetaIds: r.recetaIds };
  })(),
  { ingredienteIds: ["i1"], recetaIds: ["r1"] }
);

comprobar(
  "los huecos de una lista sucia de ingredientes se tiran",
  validarComida("x", "comida", HOY, "", [], ["i1", "", null]).ingredienteIds,
  ["i1"]
);

comprobar(
  "si no es una lista, se ignora sin romper",
  validarComida("x", "comida", HOY, "", [], "i1").ingredienteIds,
  []
);

console.log(
  mal === 0 ? "\nTodos los casos del campo único pasan." : `\n${mal} fallos.`
);
process.exit(mal === 0 ? 0 : 1);
