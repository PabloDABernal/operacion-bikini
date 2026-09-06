// Casos de "lo que toca ahora" (spec 098).
// Se ejecuta con: node docs/specs/098-lo-que-toca-ahora-casos.mjs
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

const { momentoQueToca } = m;

let mal = 0;
const comprobar = (nombre, real, esperado) => {
  const bien = real === esperado;
  if (!bien) mal++;
  console.log(
    `${bien ? "OK  " : "FALLA"} ${nombre}` +
      (bien ? "" : `\n      esperado: ${esperado}\n      real: ${real}`)
  );
};

const hora = (h, m) => new Date(2026, 8, 3, h, m);

comprobar("03:00, de madrugada: desayuno", momentoQueToca(hora(3, 0)), "desayuno");
comprobar("07:00, antes del desayuno: desayuno", momentoQueToca(hora(7, 0)), "desayuno");
comprobar("09:00, justo en el desayuno: desayuno", momentoQueToca(hora(9, 0)), "desayuno");
comprobar("11:00, más cerca del desayuno que de la comida", momentoQueToca(hora(11, 0)), "desayuno");
comprobar("12:00, ya más cerca de la comida", momentoQueToca(hora(12, 0)), "comida");
comprobar("14:00, justo en la comida", momentoQueToca(hora(14, 0)), "comida");
comprobar("15:59, todavía más cerca de la comida", momentoQueToca(hora(15, 59)), "comida");
comprobar(
  "16:00, empate exacto comida/merienda: gana la que aún no ha llegado",
  momentoQueToca(hora(16, 0)),
  "merienda"
);
comprobar("16:01, ya más cerca de la merienda", momentoQueToca(hora(16, 1)), "merienda");
comprobar("20:00, más cerca de la cena que de la merienda", momentoQueToca(hora(20, 0)), "cena");
comprobar("23:30, de madrugada tirando a tarde: cena", momentoQueToca(hora(23, 30)), "cena");
comprobar(
  "11:30, empate exacto desayuno/comida: gana la que aún no ha llegado",
  momentoQueToca(hora(11, 30)),
  "comida"
);
comprobar(
  "19:45, empate exacto merienda/cena: gana la que aún no ha llegado",
  momentoQueToca(hora(19, 45)),
  "cena"
);

console.log(
  mal === 0 ? "\nTodos los casos de lo que toca ahora pasan." : `\n${mal} fallos.`
);
process.exit(mal === 0 ? 0 : 1);
