// Convierte docs/menus/recetas-transcritas.json en js/datos-iniciales.js
// (spec 075). Se ejecuta con:
//
//   node docs/menus/generar-datos-iniciales.mjs
//
// Vive aquí y no se borra para poder rehacer el módulo si algún día se corrige
// una transcripción: el JSON es la fuente, js/datos-iniciales.js es el
// resultado y NO se edita a mano.
import fs from "node:fs";

const datos = JSON.parse(
  fs.readFileSync("docs/menus/recetas-transcritas.json", "utf8")
);

// Los alias, revisados a mano (spec 089). Los propone
// docs/menus/proponer-alias.mjs, pero lo que vale es la revisión: un alias
// equivocado es una mentira en pantalla (spec 076).
const ALIAS = JSON.parse(
  fs.readFileSync("docs/menus/alias-recetas.json", "utf8")
).alias;

// --- Recetas: una por nombre --------------------------------------------
//
// Diez recetas salen en varios menús (las tortitas, en los cuatro). Se queda la
// primera: son la misma receta repetida, no variantes.
const recetas = [];
const yaEsta = (nombre) =>
  recetas.some((r) => r.nombre.toLowerCase() === nombre.toLowerCase());

for (const receta of datos.recetas) {
  if (yaEsta(receta.nombre)) continue;
  recetas.push({
    nombre: receta.nombre,
    raciones: receta.raciones,
    ingredientes: receta.ingredientes,
    preparacion: receta.preparacion,
    // Otros nombres por los que se la reconoce dentro del texto de un plato.
    // Lista vacía si no tiene: así todas las recetas tienen la misma forma y
    // nadie que la lea tiene que comprobar si el campo existe.
    alias: ALIAS[receta.nombre] || []
  });
}

// --- Menús: de tres bloques a siete días --------------------------------
//
// El papel trae los días repartidos en dos páginas: lunes, martes y miércoles en
// la primera, y jueves, viernes y "fin de semana" en la segunda. La app quiere
// lunes a domingo, así que la conversión se hace AQUÍ, al generar, y no en el
// navegador: el módulo sale con la semana ya montada.
//
// "Fin de semana" va en el SÁBADO. El domingo se queda VACÍO a propósito: es el
// día de descanso, y rellenarlo con lo del sábado sería inventarse una comida
// que el papel no manda.
const DIAS = [
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
  "domingo"
];
const MOMENTOS = ["desayuno", "comida", "merienda", "cena"];

const DE_DONDE_SALE = {
  lunes: "lunes",
  martes: "martes",
  "miércoles": "miércoles",
  jueves: "jueves",
  viernes: "viernes",
  "sábado": "finDeSemana",
  // El domingo descansa: sin bloque del que salir, se queda en blanco.
  domingo: null
};

// Para enlazar cada plato con su receta hace falta que el texto del plato sea
// EXACTAMENTE el nombre de la receta: así lo empareja semanaDesdeLaIa() de
// js/dietas.js, que compara por nombre. Cuando el menú nombra un plato que es
// una receta, se usa el nombre de la receta tal cual.
const menus = datos.menus.map((menu) => ({
  numero: menu.numero,
  nombre: `Menú ${menu.numero}`,
  dias: DIAS.map((dia) => {
    const deDonde = DE_DONDE_SALE[dia];
    const bloque = deDonde ? menu.dias[deDonde] : null;
    return {
      dia,
      comidas: MOMENTOS.map((momento) => ({
        momento,
        texto: bloque ? bloque[momento] || "" : ""
      }))
    };
  })
}));

const salida = `// Las recetas, los ingredientes y los menús que trae la app puestos (spec 075).
//
// ARCHIVO GENERADO. No se edita a mano: sale de
// docs/menus/recetas-transcritas.json con
//
//     node docs/menus/generar-datos-iniciales.mjs
//
// Los datos son los cuatro menús de la nutricionista del usuario. Las recetas y
// los ingredientes se COPIAN a la cuenta de cada uno la primera vez que entra
// (js/siembra.js), así que a partir de ahí son suyos y puede editarlos y
// borrarlos. Los menús NO se copian: se leen de aquí.

// Subir esto hace que la siembra se vuelva a ejecutar en cuentas ya sembradas,
// metiendo solo lo que falte. Hoy nadie lo sube; existe para cuando haga falta.
export const VERSION = 1;

export const RECETAS = ${JSON.stringify(recetas, null, 2)};

// El nombre pelado, sin cantidades ni formatos: en la despensa marcas
// "lentejas", y la receta ya dice "150 gramos de lenteja, en conserva".
export const INGREDIENTES = ${JSON.stringify(datos.ingredientes, null, 2)};

// Ya con los siete días montados. Ver el comentario del generador sobre de
// dónde sale cada uno.
export const MENUS = ${JSON.stringify(menus, null, 2)};
`;

fs.writeFileSync("js/datos-iniciales.js", salida, "utf8");

console.log(
  `js/datos-iniciales.js: ${recetas.length} recetas, ` +
    `${datos.ingredientes.length} ingredientes, ${menus.length} menús`
);
