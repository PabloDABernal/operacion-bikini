// Casos del orden del diario de comidas.
// Se ejecuta con: node docs/specs/orden-del-diario-casos.mjs
//
// Sin número de spec a propósito: esto salió de un arreglo, no de una spec. El
// diario ordenaba los días hacia atrás pero los momentos hacia delante, así que
// debajo de lo de hoy salía el desayuno de ayer y parecía lo último comido.
import fs from "node:fs";

const fuente = fs
  .readFileSync("js/comidas.js", "utf8")
  .replace(/^import[\s\S]*?from\s+"https:[^"]+";\s*$/gm, "")
  .replace(/^import[\s\S]*?from\s+"\.\/[^"]+";\s*$/gm, "")
  // Fuera SOLO lo que toca Firestore, una por una. Cortar "desde guardarComida
  // hasta el final" se llevaba por delante compararComidas, que va después: el
  // sort se quedaba sin comparador y ordenaba por texto.
  .replace(/export function guardarComida[\s\S]*?\n}/m, "")
  .replace(/export function actualizarComida[\s\S]*?\n}/m, "")
  .replace(/export async function listarComidas[\s\S]*?\n}/m, "")
  .replace(/export function borrarComida[\s\S]*?\n}/m, "")
  .replace(/^function coleccionDe[\s\S]*?\n}/m, "");

// compararPorFechaYCreacion viene de js/fechas.js, recortado. Es el de verdad.
const cabecera = `
const errorDeFecha = () => "";
const errorDeHora = () => "";
function compararPorFechaYCreacion(a, b) {
  if (a.fecha !== b.fecha) return a.fecha < b.fecha ? 1 : -1;
  if (a.hora !== b.hora) {
    if (!a.hora) return 1;
    if (!b.hora) return -1;
    return a.hora < b.hora ? 1 : -1;
  }
  return 0;
}
`;

const m = await import(
  "data:text/javascript;base64," + Buffer.from(cabecera + fuente, "utf8").toString("base64")
);

const { compararComidas } = m;

let mal = 0;
const comprobar = (nombre, real, esperado) => {
  const bien = JSON.stringify(real) === JSON.stringify(esperado);
  if (!bien) mal++;
  console.log(
    `${bien ? "OK  " : "FALLA"} ${nombre}` +
      (bien ? "" : `\n      esperado: ${JSON.stringify(esperado)}\n      real:     ${JSON.stringify(real)}`)
  );
};

const c = (fecha, momento, hora) => ({ fecha, momento, hora, texto: `${momento} ${fecha}` });
const ordenar = (lista) => [...lista].sort(compararComidas).map((x) => `${x.fecha} ${x.momento}`);

comprobar(
  "los días, del más nuevo al más viejo",
  ordenar([c("2026-09-01", "cena", "21:00"), c("2026-09-03", "cena", "21:00")]),
  ["2026-09-03 cena", "2026-09-01 cena"]
);

comprobar(
  "EL ARREGLO: dentro del día, la cena antes que el desayuno",
  ordenar([
    c("2026-09-02", "desayuno", "09:47"),
    c("2026-09-02", "cena", "23:26"),
    c("2026-09-02", "comida", "14:34"),
    c("2026-09-02", "merienda", "18:00")
  ]),
  ["2026-09-02 cena", "2026-09-02 merienda", "2026-09-02 comida", "2026-09-02 desayuno"]
);

comprobar(
  "y el desayuno de ayer va DESPUÉS de la cena de ayer, no antes",
  ordenar([
    c("2026-09-03", "desayuno", "13:23"),
    c("2026-09-02", "desayuno", "09:47"),
    c("2026-09-02", "cena", "23:26")
  ]),
  ["2026-09-03 desayuno", "2026-09-02 cena", "2026-09-02 desayuno"]
);

comprobar(
  "dos del mismo momento: la más tarde, primero",
  ordenar([c("2026-09-02", "cena", "22:24"), c("2026-09-02", "cena", "23:26")]),
  ["2026-09-02 cena", "2026-09-02 cena"]
);

comprobar(
  "una sin hora se va al final de su momento",
  [
    { fecha: "2026-09-02", momento: "cena", hora: "" },
    { fecha: "2026-09-02", momento: "cena", hora: "22:00" }
  ]
    .sort(compararComidas)
    .map((x) => x.hora),
  ["22:00", ""]
);

comprobar(
  "un momento desconocido no rompe: se va al principio",
  ordenar([c("2026-09-02", "cena", "21:00"), c("2026-09-02", "raro", "12:00")]),
  ["2026-09-02 raro", "2026-09-02 cena"]
);

console.log(mal === 0 ? "\nTodos los casos del orden pasan." : `\n${mal} fallos.`);
process.exit(mal === 0 ? 0 : 1);
