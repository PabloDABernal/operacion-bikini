// Casos de "me lo he comido" en cualquier día (spec 097).
// Se ejecuta con: node docs/specs/097-marcar-cualquier-dia-casos.mjs
import fs from "node:fs";

const fuenteFechas = fs
  .readFileSync("js/fechas.js", "utf8")
  .replace(/^export /gm, "");

const fuenteComidas = fs
  .readFileSync("js/comidas.js", "utf8")
  .replace(/^import[\s\S]*?from\s+"https:[^"]+";\s*$/gm, "")
  .replace(/^import[\s\S]*?from\s+"\.\/[^"]+";\s*$/gm, "")
  .replace(/export function guardarComida[\s\S]*$/m, "")
  .replace(/^function coleccionDe[\s\S]*?\n}/m, "");

const m = await import(
  "data:text/javascript;base64," +
    Buffer.from(fuenteFechas + fuenteComidas, "utf8").toString("base64")
);

const { apunteDesdeDieta } = m;

let mal = 0;
const comprobar = (nombre, real, esperado) => {
  const bien = JSON.stringify(real) === JSON.stringify(esperado);
  if (!bien) mal++;
  console.log(
    `${bien ? "OK  " : "FALLA"} ${nombre}` +
      (bien ? "" : `\n      esperado: ${JSON.stringify(esperado)}\n      real: ${JSON.stringify(real)}`)
  );
};

// Jueves 2026-09-03 (índice 3, lunes=0).
const HOY = "2026-09-03";
const LUNES = 0;
const JUEVES = 3;
const VIERNES = 4;

comprobar(
  "día pasado de esta semana: fecha del día + franja fija",
  apunteDesdeDieta(LUNES, "comida", HOY, new Date(2026, 8, 3, 16, 0)),
  { fecha: "2026-08-31", hora: "14:00", esFuturo: false }
);

comprobar(
  "hoy, franja ya pasada: fecha de hoy + franja fija, no la hora real",
  apunteDesdeDieta(JUEVES, "desayuno", HOY, new Date(2026, 8, 3, 20, 0)),
  { fecha: HOY, hora: "09:00", esFuturo: false }
);

comprobar(
  "hoy, justo en el minuto de la franja: cuenta como pasado",
  apunteDesdeDieta(JUEVES, "comida", HOY, new Date(2026, 8, 3, 14, 0)),
  { fecha: HOY, hora: "14:00", esFuturo: false }
);

comprobar(
  "hoy, franja aún no llegada: futuro, hora real de ahora",
  apunteDesdeDieta(JUEVES, "cena", HOY, new Date(2026, 8, 3, 10, 15)),
  { fecha: HOY, hora: "10:15", esFuturo: true }
);

comprobar(
  "día futuro de esta semana: futuro, fecha y hora de hoy, no del viernes",
  apunteDesdeDieta(VIERNES, "desayuno", HOY, new Date(2026, 8, 3, 10, 15)),
  { fecha: HOY, hora: "10:15", esFuturo: true }
);

console.log(
  mal === 0 ? "\nTodos los casos de marcar cualquier día pasan." : `\n${mal} fallos.`
);
process.exit(mal === 0 ? 0 : 1);
