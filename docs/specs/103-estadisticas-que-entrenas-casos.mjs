// Casos de "qué entrenas" (spec 103).
// Se ejecuta con: node docs/specs/103-estadisticas-que-entrenas-casos.mjs
import fs from "node:fs";

const fuente = fs
  .readFileSync("js/estadisticas.js", "utf8")
  .replace(/^import[\s\S]*?from\s+"\.\/grafica\.js";\s*$/gm, "")
  .replace(/^import[\s\S]*?from\s+"\.\/fechas\.js";\s*$/gm, "")
  .replace(/export function estadisticasDePeso[\s\S]*$/m, "")
  .replace(/^function variacion[\s\S]*?\n}/m, "");

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
  "data:text/javascript;base64," + Buffer.from(cabecera + fuente, "utf8").toString("base64")
);

const { estadisticasDeEjercicios } = m;

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

const HOY = "2026-09-07";

const CATALOGO = {
  e1: { id: "e1", nombre: "Sentadillas búlgaras" },
  e2: { id: "e2", nombre: "Zancadas" }
};

const ejercicioPorId = (id) => CATALOGO[id];
const calcular = (ejercicios, hoy = HOY) =>
  estadisticasDeEjercicios(ejercicios, hoy, ejercicioPorId);

// --- Las cuentas -----------------------------------------------------------

comprobar("sin ejercicios, todo a cero", calcular([]).total, { sesiones: 0, enlazadas: 0 });

comprobar(
  "un ejercicio escrito a mano NO cuenta como enlazado",
  calcular([{ fecha: HOY, texto: "bici" }]).hoy,
  { sesiones: 1, enlazadas: 0 }
);

comprobar(
  "uno con ejercicioIds sí",
  calcular([{ fecha: HOY, texto: "x", ejercicioIds: ["e1"] }]).hoy,
  { sesiones: 1, enlazadas: 1 }
);

comprobar(
  "una lista de ejercicioIds VACÍA no cuenta como enlazada",
  calcular([{ fecha: HOY, texto: "x", ejercicioIds: [] }]).hoy,
  { sesiones: 1, enlazadas: 0 }
);

// --- Las ventanas ------------------------------------------------------------

const variasFechas = [
  { fecha: HOY, texto: "a", ejercicioIds: ["e1"] },
  { fecha: "2026-09-05", texto: "b", ejercicioIds: ["e1"] },
  { fecha: "2026-08-25", texto: "c", ejercicioIds: ["e2"] },
  { fecha: "2026-06-01", texto: "d", ejercicioIds: ["e2"] }
];

comprobar("la ventana de hoy solo coge hoy", calcular(variasFechas).hoy.sesiones, 1);
comprobar("la de 7 días coge dos", calcular(variasFechas).siete.sesiones, 2);
comprobar("la de 30 coge tres", calcular(variasFechas).treinta.sesiones, 3);
comprobar("y el total, las cuatro", calcular(variasFechas).total.sesiones, 4);

// --- Lo que más repites ------------------------------------------------------

const repetidas = [
  { fecha: HOY, texto: "a", ejercicioIds: ["e1"] },
  { fecha: HOY, texto: "b", ejercicioIds: ["e1"] },
  { fecha: HOY, texto: "c", ejercicioIds: ["e2"] }
];

comprobar(
  "los ejercicios se ordenan por veces",
  calcular(repetidas).ejercicios,
  [
    { nombre: "Sentadillas búlgaras", veces: 2 },
    { nombre: "Zancadas", veces: 1 }
  ]
);

comprobar(
  "un registro con dos enlaces al mismo ejercicio lo cuenta dos veces",
  calcular([{ fecha: HOY, texto: "x", ejercicioIds: ["e1", "e1"] }]).ejercicios,
  [{ nombre: "Sentadillas búlgaras", veces: 2 }]
);

comprobar(
  "un registro con varios ejercicios distintos suma a cada uno",
  calcular([{ fecha: HOY, texto: "x", ejercicioIds: ["e1", "e2"] }]).ejercicios,
  [
    { nombre: "Sentadillas búlgaras", veces: 1 },
    { nombre: "Zancadas", veces: 1 }
  ]
);

// --- Lo que NO se puede contar ------------------------------------------------

comprobar(
  "un ejercicio BORRADO del catálogo no aporta nada, pero la sesión sigue enlazada",
  calcular([{ fecha: HOY, texto: "x", ejercicioIds: ["fantasma"] }]),
  {
    hoy: { sesiones: 1, enlazadas: 1 },
    siete: { sesiones: 1, enlazadas: 1 },
    treinta: { sesiones: 1, enlazadas: 1 },
    total: { sesiones: 1, enlazadas: 1 },
    ejercicios: []
  }
);

// --- Casos límite --------------------------------------------------------

comprobar(
  "la lista solo mira los ultimos 30 dias",
  calcular([{ fecha: "2026-06-01", texto: "x", ejercicioIds: ["e1"] }]).ejercicios,
  []
);

comprobar(
  "aunque el total sí lo cuente",
  calcular([{ fecha: "2026-06-01", texto: "x", ejercicioIds: ["e1"] }]).total,
  { sesiones: 1, enlazadas: 1 }
);

comprobar(
  "como mucho salen cinco",
  (() => {
    const catalogoGrande = Object.fromEntries(
      Array.from({ length: 6 }, (_, i) => [`n${i}`, { id: `n${i}`, nombre: `Ejercicio ${i}` }])
    );
    const seis = Array.from({ length: 6 }, (_, i) => ({
      fecha: HOY,
      texto: "x",
      ejercicioIds: [`n${i}`]
    }));
    return estadisticasDeEjercicios(seis, HOY, (id) => catalogoGrande[id]).ejercicios.length;
  })(),
  5
);

comprobar(
  "un ejercicio con fecha futura no entra en las ventanas",
  calcular([{ fecha: "2026-12-25", texto: "x", ejercicioIds: ["e1"] }]).treinta.sesiones,
  0
);

comprobar("sin la lista puesta no revienta", calcular(undefined).total.sesiones, 0);

console.log(mal === 0 ? "\nTodos los casos de qué entrenas pasan." : `\n${mal} fallos.`);
process.exit(mal === 0 ? 0 : 1);
