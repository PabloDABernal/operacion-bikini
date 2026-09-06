// Casos de "lo que toca hoy" en Ejercicio (spec 101).
// Se ejecuta con: node docs/specs/101-lo-que-toca-hoy-ejercicio-casos.mjs
import fs from "node:fs";

const fuente = fs
  .readFileSync("js/ejercicios.js", "utf8")
  .replace(/^import[\s\S]*?from\s+"https:[^"]+";\s*$/gm, "")
  .replace(/^import[\s\S]*?from\s+"\.\/[^"]+";\s*$/gm, "")
  .replace(/export function guardarEjercicio[\s\S]*$/m, "")
  .replace(/^function coleccionDe[\s\S]*?\n}/m, "");

const m = await import(
  "data:text/javascript;base64," + Buffer.from(fuente, "utf8").toString("base64")
);

const { yaApuntado } = m;

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
const AYER = "2026-09-05";

const apuntados = [
  { fecha: HOY, texto: "Bici, 45 minutos" },
  { fecha: AYER, texto: "Piernas: sentadillas" }
];

comprobar(
  "el mismo ejercicio de hoy se reconoce",
  yaApuntado(apuntados, HOY, "Bici, 45 minutos"),
  true
);

comprobar(
  "sin tildes ni mayúsculas cuenta igual",
  yaApuntado(apuntados, HOY, "BICI, 45 MINUTOS"),
  true
);

comprobar(
  "el mismo ejercicio de OTRO día no cuenta",
  yaApuntado(apuntados, HOY, "Piernas: sentadillas"),
  false
);

comprobar("otro ejercicio no cuenta", yaApuntado(apuntados, HOY, "Natación"), false);
comprobar("sin nada apuntado, nunca", yaApuntado([], HOY, "Lo que sea"), false);
comprobar("ni con la lista sin poner", yaApuntado(undefined, HOY, "Lo que sea"), false);

comprobar(
  "los espacios de sobra no engañan",
  yaApuntado(apuntados, HOY, "  Bici, 45 minutos  "),
  true
);

console.log(mal === 0 ? "\nTodos los casos de lo que toca hoy pasan." : `\n${mal} fallos.`);
process.exit(mal === 0 ? 0 : 1);
