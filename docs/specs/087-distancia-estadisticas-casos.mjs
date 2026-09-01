// Casos de "cuánto llevas andado" (spec 087).
// Se ejecuta con: node docs/specs/087-distancia-estadisticas-casos.mjs
//
// js/estadisticas.js no importa nada que toque la red, así que se importa
// directo: solo hay que recortarle compararVentanas, que arrastra js/grafica.js
// y solo la usan las estadísticas de peso.
import fs from "node:fs";

const fuente = fs
  .readFileSync("js/estadisticas.js", "utf8")
  .replace(/^import[\s\S]*?from\s+"\.\/grafica\.js";\s*$/gm, "")
  .replace(/^import[\s\S]*?from\s+"\.\/fechas\.js";\s*$/gm, "")
  .replace(/export function estadisticasDePeso[\s\S]*$/m, "")
  .replace(/^function variacion[\s\S]*?\n}/m, "");

// sumarDias venía de js/fechas.js, recortado. Es el de verdad, copiado: el
// truco del mediodía existe para que el cambio de hora no mueva un día.
const cabecera = `
function sumarDias(iso, dias) {
  const [anio, mes, dia] = iso.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia, 12);
  fecha.setDate(fecha.getDate() + dias);
  const mesNuevo = String(fecha.getMonth() + 1).padStart(2, "0");
  const diaNuevo = String(fecha.getDate()).padStart(2, "0");
  return \`\${fecha.getFullYear()}-\${mesNuevo}-\${diaNuevo}\`;
}
`;

const m = await import(
  "data:text/javascript;base64," +
    Buffer.from(cabecera + fuente, "utf8").toString("base64")
);

const { estadisticasDeDistancia } = m;

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

const HOY = "2026-09-01";
const ej = (fecha, distanciaKm) =>
  distanciaKm === undefined ? { fecha, texto: "gimnasio" } : { fecha, distanciaKm };

// --- Lo básico ------------------------------------------------------------

comprobar(
  "sin ejercicios, todo a cero y ninguna sesión",
  estadisticasDeDistancia([], HOY).total,
  { km: 0, sesiones: 0 }
);

comprobar(
  "un ejercicio SIN distancia no cuenta como sesión",
  estadisticasDeDistancia([ej(HOY)], HOY).total,
  { km: 0, sesiones: 0 }
);

comprobar(
  "lo de hoy suma en 'de hoy'",
  estadisticasDeDistancia([ej(HOY, 5.2)], HOY).hoy,
  { km: 5.2, sesiones: 1 }
);

comprobar(
  "dos paseos el mismo día se suman",
  estadisticasDeDistancia([ej(HOY, 5.2), ej(HOY, 3.1)], HOY).hoy,
  { km: 8.3, sesiones: 2 }
);

// --- Las ventanas ---------------------------------------------------------

const semana = [
  ej(HOY, 5),
  ej("2026-08-30", 4),
  ej("2026-08-26", 3), // dentro de los 7 días (26 de agosto al 1 de septiembre)
  ej("2026-08-25", 8), // fuera de los 7, dentro de los 30
  ej("2026-07-01", 9) // fuera de los 30
];

comprobar(
  "la ventana de 7 días llega justo hasta el séptimo, incluido",
  estadisticasDeDistancia(semana, HOY).siete,
  { km: 12, sesiones: 3, media: 4 }
);

comprobar(
  "la de 30 coge también el que se cae de los 7",
  estadisticasDeDistancia(semana, HOY).treinta,
  { km: 20, sesiones: 4, media: 5 }
);

comprobar(
  "y el total lo coge todo",
  estadisticasDeDistancia(semana, HOY).total,
  { km: 29, sesiones: 5 }
);

// --- La media -------------------------------------------------------------

comprobar(
  "un ejercicio SIN distancia no hunde la media",
  estadisticasDeDistancia([ej(HOY, 6), ej(HOY), ej(HOY)], HOY).siete.media,
  6
);

comprobar(
  "sin sesiones en la ventana no hay media, hay null",
  estadisticasDeDistancia([ej("2026-01-01", 5)], HOY).siete,
  { km: 0, sesiones: 0, media: null }
);

comprobar(
  "pero el total sí lo cuenta",
  estadisticasDeDistancia([ej("2026-01-01", 5)], HOY).total,
  { km: 5, sesiones: 1 }
);

// --- Casos límite ---------------------------------------------------------

comprobar(
  "se suma primero y se redondea al final: 0,1 + 0,2 son 0,3",
  estadisticasDeDistancia([ej(HOY, 0.1), ej(HOY, 0.2)], HOY).hoy.km,
  0.3
);

comprobar(
  "una fecha futura queda fuera de las ventanas",
  estadisticasDeDistancia([ej("2026-12-25", 10)], HOY).treinta.sesiones,
  0
);

comprobar(
  "pero cuenta en el total, para no perderla de vista",
  estadisticasDeDistancia([ej("2026-12-25", 10)], HOY).total.sesiones,
  1
);

comprobar(
  "un 0 tocado a mano es una sesión de 0 km, no un ejercicio sin apuntar",
  estadisticasDeDistancia([ej(HOY, 0)], HOY).total,
  { km: 0, sesiones: 1 }
);

comprobar(
  "el día de hoy no se cuela en 'de hoy' si es de ayer",
  estadisticasDeDistancia([ej("2026-08-31", 5)], HOY).hoy,
  { km: 0, sesiones: 0 }
);

console.log(
  mal === 0 ? "\nTodos los casos de distancia acumulada pasan." : `\n${mal} fallos.`
);
process.exit(mal === 0 ? 0 : 1);
