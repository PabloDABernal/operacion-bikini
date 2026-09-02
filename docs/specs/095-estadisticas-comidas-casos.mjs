// Casos de "qué comes" (spec 095).
// Se ejecuta con: node docs/specs/095-estadisticas-comidas-casos.mjs
import fs from "node:fs";

const fuente = fs
  .readFileSync("js/estadisticas.js", "utf8")
  .replace(/^import[\s\S]*?from\s+"\.\/grafica\.js";\s*$/gm, "")
  .replace(/^import[\s\S]*?from\s+"\.\/fechas\.js";\s*$/gm, "")
  .replace(/export function estadisticasDePeso[\s\S]*$/m, "")
  .replace(/^function variacion[\s\S]*?\n}/m, "");

// El sumarDias de verdad, copiado: el truco del mediodía existe para que el
// cambio de hora no mueva un día.
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

const { estadisticasDeComidas } = m;

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

const HOY = "2026-09-02";

const RECETAS = {
  r1: {
    id: "r1",
    nombre: "Tortilla de atún",
    ingredientes: [
      { ingredienteId: "atun", ingredienteNombre: "Atún" },
      { ingredienteId: "huevos", ingredienteNombre: "Huevos" }
    ]
  },
  r2: {
    id: "r2",
    nombre: "Ensalada de repollo",
    ingredientes: [{ ingredienteId: "repollo", ingredienteNombre: "Col repollo" }]
  },
  // Como las guarda la IA al proponer dieta: líneas de TEXTO, sin enlazar.
  rIA: { id: "rIA", nombre: "Lo que propuso la IA", ingredientes: ["200 g de lentejas"] }
};
const NOMBRES = { atun: "Atún", huevos: "Huevos", repollo: "Col repollo", yogur: "Yogur" };

const receta = (id) => RECETAS[id];
const ingrediente = (id) => NOMBRES[id] || "";
const calcular = (comidas, hoy = HOY) =>
  estadisticasDeComidas(comidas, hoy, receta, ingrediente);

// --- Las cuentas ---------------------------------------------------------

comprobar(
  "sin comidas, todo a cero",
  calcular([]).total,
  { comidas: 0, enlazadas: 0 }
);

comprobar(
  "una comida escrita a mano NO cuenta como enlazada",
  calcular([{ fecha: HOY, texto: "lentejas" }]).hoy,
  { comidas: 1, enlazadas: 0 }
);

comprobar(
  "una con receta sí",
  calcular([{ fecha: HOY, texto: "x", recetaIds: ["r1"] }]).hoy,
  { comidas: 1, enlazadas: 1 }
);

comprobar(
  "y una con ingrediente suelto también (spec 084)",
  calcular([{ fecha: HOY, texto: "x", ingredienteId: "yogur" }]).hoy,
  { comidas: 1, enlazadas: 1 }
);

comprobar(
  "una lista de recetas VACÍA no cuenta como enlazada",
  calcular([{ fecha: HOY, texto: "x", recetaIds: [] }]).hoy,
  { comidas: 1, enlazadas: 0 }
);

// --- Las ventanas --------------------------------------------------------

const variasFechas = [
  { fecha: HOY, texto: "a", recetaIds: ["r1"] },
  { fecha: "2026-08-30", texto: "b", recetaIds: ["r1"] },
  { fecha: "2026-08-20", texto: "c", recetaIds: ["r2"] },
  { fecha: "2026-06-01", texto: "d", recetaIds: ["r2"] }
];

comprobar("la ventana de hoy solo coge hoy", calcular(variasFechas).hoy.comidas, 1);
comprobar("la de 7 días coge dos", calcular(variasFechas).siete.comidas, 2);
comprobar("la de 30 coge tres", calcular(variasFechas).treinta.comidas, 3);
comprobar("y el total, las cuatro", calcular(variasFechas).total.comidas, 4);

// --- Lo que más repites --------------------------------------------------

const repetidas = [
  { fecha: HOY, texto: "a", recetaIds: ["r1"] },
  { fecha: HOY, texto: "b", recetaIds: ["r1"] },
  { fecha: HOY, texto: "c", recetaIds: ["r2"] }
];

comprobar(
  "las recetas se ordenan por veces",
  calcular(repetidas).recetas,
  [
    { nombre: "Tortilla de atún", veces: 2 },
    { nombre: "Ensalada de repollo", veces: 1 }
  ]
);

comprobar(
  "los ingredientes salen de las recetas, contando cada aparición",
  calcular(repetidas).ingredientes,
  [
    { nombre: "Atún", veces: 2 },
    { nombre: "Huevos", veces: 2 },
    { nombre: "Col repollo", veces: 1 }
  ]
);

comprobar(
  "el ingrediente suelto también entra en la cuenta",
  calcular([{ fecha: HOY, texto: "x", ingredienteId: "yogur" }]).ingredientes,
  [{ nombre: "Yogur", veces: 1 }]
);

comprobar(
  "una comida con dos recetas que comparten ingrediente lo cuenta dos veces",
  calcular([{ fecha: HOY, texto: "x", recetaIds: ["r1", "r1"] }]).ingredientes,
  [
    { nombre: "Atún", veces: 2 },
    { nombre: "Huevos", veces: 2 }
  ]
);

// --- Lo que NO se puede contar -------------------------------------------

comprobar(
  "una receta BORRADA no aporta nada, pero la comida sigue enlazada",
  calcular([{ fecha: HOY, texto: "x", recetaIds: ["fantasma"] }]),
  {
    hoy: { comidas: 1, enlazadas: 1 },
    siete: { comidas: 1, enlazadas: 1 },
    treinta: { comidas: 1, enlazadas: 1 },
    total: { comidas: 1, enlazadas: 1 },
    recetas: [],
    ingredientes: []
  }
);

comprobar(
  "una receta con los ingredientes en TEXTO (las de la IA) no aporta ingredientes",
  calcular([{ fecha: HOY, texto: "x", recetaIds: ["rIA"] }]).ingredientes,
  []
);

comprobar(
  "pero sí cuenta en lo que más repites",
  calcular([{ fecha: HOY, texto: "x", recetaIds: ["rIA"] }]).recetas,
  [{ nombre: "Lo que propuso la IA", veces: 1 }]
);

comprobar(
  "un ingrediente borrado de la despensa no se cuenta",
  calcular([{ fecha: HOY, texto: "x", ingredienteId: "fantasma" }]).ingredientes,
  []
);

// --- Casos límite --------------------------------------------------------

comprobar(
  "las listas solo miran los ultimos 30 dias",
  calcular([{ fecha: "2026-06-01", texto: "x", recetaIds: ["r1"] }]).recetas,
  []
);

comprobar(
  "aunque el total sí las cuente",
  calcular([{ fecha: "2026-06-01", texto: "x", recetaIds: ["r1"] }]).total,
  { comidas: 1, enlazadas: 1 }
);

comprobar(
  "como mucho salen cinco",
  calcular(
    Array.from({ length: 8 }, (_, i) => ({
      fecha: HOY,
      texto: "x",
      ingredienteId: `otro${i}`
    })).concat([{ fecha: HOY, texto: "y", recetaIds: ["r1"] }])
  ).ingredientes.length,
  2
);

comprobar(
  "una comida con fecha futura no entra en las ventanas",
  calcular([{ fecha: "2026-12-25", texto: "x", recetaIds: ["r1"] }]).treinta.comidas,
  0
);

comprobar("sin la lista puesta no revienta", calcular(undefined).total.comidas, 0);

console.log(mal === 0 ? "\nTodos los casos de qué comes pasan." : `\n${mal} fallos.`);
process.exit(mal === 0 ? 0 : 1);
