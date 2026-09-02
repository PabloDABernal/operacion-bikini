// Casos de "me lo he comido" (spec 094).
// Se ejecuta con: node docs/specs/094-me-lo-he-comido-casos.mjs
import fs from "node:fs";

const fuente = fs
  .readFileSync("js/comidas.js", "utf8")
  .replace(/^import[\s\S]*?from\s+"https:[^"]+";\s*$/gm, "")
  .replace(/^import[\s\S]*?from\s+"\.\/[^"]+";\s*$/gm, "")
  .replace(/export function guardarComida[\s\S]*$/m, "")
  .replace(/^function coleccionDe[\s\S]*?\n}/m, "");

const cabecera = `
const errorDeFecha = (f) => (f ? "" : "Falta la fecha.");
const errorDeHora = () => "";
`;

const m = await import(
  "data:text/javascript;base64," + Buffer.from(cabecera + fuente, "utf8").toString("base64")
);

const { yaApuntada } = m;

let mal = 0;
const comprobar = (nombre, real, esperado) => {
  const bien = JSON.stringify(real) === JSON.stringify(esperado);
  if (!bien) mal++;
  console.log(
    `${bien ? "OK  " : "FALLA"} ${nombre}` +
      (bien ? "" : `\n      esperado: ${JSON.stringify(esperado)}\n      real: ${JSON.stringify(real)}`)
  );
};

const HOY = "2026-09-02";
const AYER = "2026-09-01";

const apuntadas = [
  { fecha: HOY, momento: "cena", texto: "Tortilla de atún" },
  { fecha: AYER, momento: "comida", texto: "Lentejas" }
];

comprobar(
  "la misma comida de hoy se reconoce",
  yaApuntada(apuntadas, HOY, "cena", "Tortilla de atún"),
  true
);

comprobar(
  "sin tildes ni mayúsculas cuenta igual",
  yaApuntada(apuntadas, HOY, "cena", "TORTILLA DE ATUN"),
  true
);

comprobar(
  "otro momento del mismo día NO es la misma",
  yaApuntada(apuntadas, HOY, "comida", "Tortilla de atún"),
  false
);

comprobar(
  "el mismo plato de OTRO día no cuenta",
  yaApuntada(apuntadas, HOY, "comida", "Lentejas"),
  false
);

comprobar("otro plato no cuenta", yaApuntada(apuntadas, HOY, "cena", "Merluza"), false);
comprobar("sin nada apuntado, nunca", yaApuntada([], HOY, "cena", "Lo que sea"), false);
comprobar("ni con la lista sin poner", yaApuntada(undefined, HOY, "cena", "Lo que sea"), false);

comprobar(
  "los espacios de sobra no engañan",
  yaApuntada(apuntadas, HOY, "cena", "  Tortilla de atún  "),
  true
);

console.log(mal === 0 ? "\nTodos los casos de me lo he comido pasan." : `\n${mal} fallos.`);
process.exit(mal === 0 ? 0 : 1);
