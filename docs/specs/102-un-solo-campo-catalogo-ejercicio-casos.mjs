// Casos del campo único con sugerencias del catálogo (spec 102).
// Se ejecuta con: node docs/specs/102-un-solo-campo-catalogo-ejercicio-casos.mjs
import fs from "node:fs";

const fuente = fs
  .readFileSync("js/ejercicios.js", "utf8")
  .replace(/^import[\s\S]*?from\s+"https:[^"]+";\s*$/gm, "")
  .replace(/^import[\s\S]*?from\s+"\.\/[^"]+";\s*$/gm, "")
  .replace(/export function guardarEjercicio[\s\S]*$/m, "");

const cabecera = `
const errorDeFecha = (f) => (f ? "" : "Falta la fecha.");
const errorDeHora = () => "";
`;

const m = await import(
  "data:text/javascript;base64," + Buffer.from(cabecera + fuente, "utf8").toString("base64")
);

const { validarEjercicio } = m;

let mal = 0;
const comprobar = (nombre, real, esperado) => {
  const bien = JSON.stringify(real) === JSON.stringify(esperado);
  if (!bien) mal++;
  console.log(
    `${bien ? "OK  " : "FALLA"} ${nombre}` +
      (bien ? "" : `\n      esperado: ${JSON.stringify(esperado)}\n      real: ${JSON.stringify(real)}`)
  );
};

const HOY = "2026-09-07";

comprobar(
  "un ejercicio con un enlace del catálogo lo guarda",
  validarEjercicio("Sentadillas búlgaras", "20", "media", HOY, "", "", ["e1"]).ejercicioIds,
  ["e1"]
);

comprobar(
  "y con dos, los dos",
  validarEjercicio("Sentadillas. Zancadas", "20", "media", HOY, "", "", ["e1", "e2"]).ejercicioIds,
  ["e1", "e2"]
);

comprobar(
  "los huecos de una lista sucia se tiran",
  validarEjercicio("x", "10", "media", HOY, "", "", ["e1", "", null]).ejercicioIds,
  ["e1"]
);

comprobar(
  "si no es una lista, se ignora sin romper",
  validarEjercicio("x", "10", "media", HOY, "", "", "e1").ejercicioIds,
  []
);

comprobar(
  "un ejercicio escrito a mano no lleva enlaces",
  validarEjercicio("bici por el paseo", "30", "suave", HOY, "").ejercicioIds,
  []
);

comprobar(
  "y su texto, minutos e intensidad no cambian",
  (() => {
    const { texto, minutos, intensidad } = validarEjercicio("bici", "30", "suave", HOY, "");
    return { texto, minutos, intensidad };
  })(),
  { texto: "bici", minutos: 30, intensidad: "suave" }
);

comprobar(
  "sin texto, el error es el del texto aunque haya enlaces",
  validarEjercicio("", "10", "media", HOY, "", "", ["e1"]).error,
  "Escribe qué ejercicio has hecho."
);

console.log(mal === 0 ? "\nTodos los casos del campo único de ejercicio pasan." : `\n${mal} fallos.`);
process.exit(mal === 0 ? 0 : 1);
