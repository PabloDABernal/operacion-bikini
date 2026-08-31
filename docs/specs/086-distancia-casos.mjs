// Casos de la distancia opcional (spec 086).
// Se ejecuta con: node docs/specs/086-distancia-casos.mjs
//
// Ejecuta js/ejercicios.js de verdad, recortándole los imports que necesitan
// red. Mismo enfoque que 059-cruce-casos.mjs.
import fs from "node:fs";

const fuente = fs
  .readFileSync("js/ejercicios.js", "utf8")
  .replace(/^import[\s\S]*?from\s+"https:[^"]+";\s*$/gm, "")
  .replace(/^import[\s\S]*?from\s+"\.\/[^"]+";\s*$/gm, "")
  // Todo lo que toca Firestore fuera: aquí sólo se prueba qué decide.
  .replace(/export function guardarEjercicio[\s\S]*$/m, "");

// errorDeFecha y errorDeHora venían de js/fechas.js, que se ha recortado. Se
// sustituyen por los mínimos que hacen falta: aquí se prueba la distancia.
const cabecera = `
const errorDeFecha = (f) => (f ? "" : "Falta la fecha.");
const errorDeHora = () => "";
`;

const m = await import(
  "data:text/javascript;base64," +
    Buffer.from(cabecera + fuente, "utf8").toString("base64")
);

const { validarDistancia, validarEjercicio } = m;

let mal = 0;
const comprobar = (nombre, real, esperado) => {
  const bien = JSON.stringify(real) === JSON.stringify(esperado);
  if (!bien) {
    mal++;
    console.log(`MAL  ${nombre}: ${JSON.stringify(real)} (esperado ${JSON.stringify(esperado)})`);
  } else {
    console.log(`OK   ${nombre}`);
  }
};

// --- Lo que vale ---------------------------------------------------------

comprobar("un número normal", validarDistancia("5.2"), { distanciaKm: 5.2 });
comprobar("con coma, como se teclea", validarDistancia("5,2"), { distanciaKm: 5.2 });
comprobar("entero", validarDistancia("10"), { distanciaKm: 10 });
comprobar("con espacios alrededor", validarDistancia("  5,2  "), { distanciaKm: 5.2 });
comprobar("el mínimo", validarDistancia("0,1"), { distanciaKm: 0.1 });
comprobar("el máximo", validarDistancia("500"), { distanciaKm: 500 });

// Un decimal: más precisión es ruido en un paseo.
comprobar("se redondea a un decimal", validarDistancia("5,25"), { distanciaKm: 5.3 });
comprobar("y hacia abajo también", validarDistancia("5,24"), { distanciaKm: 5.2 });

// --- Vacío es VÁLIDO, y devuelve null -----------------------------------
//
// Es lo que distingue "no lo apunté" de "anduve cero". El campo no se guarda
// cuando esto devuelve null.

comprobar("vacío no es un error", validarDistancia(""), { distanciaKm: null });
comprobar("solo espacios tampoco", validarDistancia("   "), { distanciaKm: null });
comprobar("undefined tampoco", validarDistancia(undefined), { distanciaKm: null });
comprobar("null tampoco", validarDistancia(null), { distanciaKm: null });

// --- Lo que no vale ------------------------------------------------------

const esError = (v) => Boolean(validarDistancia(v).error);

comprobar("cero se rechaza", esError("0"), true);
comprobar("cero con decimal también", esError("0,0"), true);
comprobar("por debajo del mínimo", esError("0,05"), true);
comprobar("negativo", esError("-3"), true);
comprobar("pasado de largo", esError("900"), true);
comprobar("texto", esError("abc"), true);
comprobar("un guión suelto", esError("-"), true);

// --- Y el ejercicio entero ----------------------------------------------

const ejercicio = (distancia) =>
  validarEjercicio("andar", "45", "media", "2026-08-31", "", distancia);

comprobar(
  "un ejercicio con distancia la trae",
  ejercicio("5,2").distanciaKm,
  5.2
);

comprobar(
  "y sin distancia la trae en null",
  ejercicio("").distanciaKm,
  null
);

comprobar(
  "sin pasar el parámetro siquiera",
  validarEjercicio("andar", "45", "media", "2026-08-31", "").distanciaKm,
  null
);

comprobar(
  "una distancia mala tumba el ejercicio entero",
  Boolean(ejercicio("900").error),
  true
);

// El texto y los minutos siguen mandando: sus errores saltan antes.
comprobar(
  "sin texto, el error es el del texto",
  validarEjercicio("", "45", "media", "2026-08-31", "", "900").error,
  "Escribe qué ejercicio has hecho."
);

comprobar(
  "sin minutos, el error es el de los minutos",
  validarEjercicio("andar", "", "media", "2026-08-31", "", "5,2").error,
  "Introduce los minutos."
);

// Regresión: lo de siempre sigue funcionando igual.
comprobar(
  "un ejercicio de toda la vida se valida igual",
  validarEjercicio("bici", "45,6", "fuerte", "2026-08-31", "").minutos,
  46
);

console.log(mal === 0 ? "\nTodos los casos de distancia pasan." : `\n${mal} fallos.`);
process.exit(mal === 0 ? 0 : 1);
