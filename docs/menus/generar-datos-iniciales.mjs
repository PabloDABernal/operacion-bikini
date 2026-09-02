// Convierte docs/menus/recetas-transcritas.json en js/datos-iniciales.js
// (spec 075). Se ejecuta con:
//
//   node docs/menus/generar-datos-iniciales.mjs
//
// Vive aquí y no se borra para poder rehacer el módulo si algún día se corrige
// una transcripción: el JSON es la fuente, js/datos-iniciales.js es el
// resultado y NO se edita a mano.
import fs from "node:fs";

// La extraccion de la spec 090, la de verdad: se carga js/normalizacion.js
// recortandole los imports que necesitan red. Con una copia aqui, el generador
// y la app harian cosas distintas sin que nadie se enterara.
const sinImports = (ruta) =>
  fs
    .readFileSync(ruta, "utf8")
    .replace(/^import[\s\S]*?from\s+"https:[^"]+";\s*$/gm, "")
    .replace(/^import[\s\S]*?from\s+"\.\/[^"]+";\s*$/gm, "");

const fuenteDespensa = sinImports("js/despensa.js");
const trozoDe = (nombre) =>
  fuenteDespensa.match(new RegExp(`export function ${nombre}[\\s\\S]*?\\n}`, "m"))[0];

const extraccion = await import(
  "data:text/javascript;base64," +
    Buffer.from(
      [
        fuenteDespensa.match(/const UNIDADES = [\s\S]*?\n\];/m)[0],
        fuenteDespensa.match(/const COLETILLAS = .*$/m)[0],
        trozoDe("normalizar"),
        trozoDe("mismoIngrediente"),
        trozoDe("ingredienteDeLinea"),
        trozoDe("esLineaEstructurada"),
        sinImports("js/normalizacion.js")
      ].join("\n"),
      "utf8"
    ).toString("base64")
);

const datos = JSON.parse(
  fs.readFileSync("docs/menus/recetas-transcritas.json", "utf8")
);

// Los alias, revisados a mano (spec 089). Los propone
// docs/menus/proponer-alias.mjs, pero lo que vale es la revisión: un alias
// equivocado es una mentira en pantalla (spec 076).
const ALIAS = JSON.parse(
  fs.readFileSync("docs/menus/alias-recetas.json", "utf8")
).alias;

// Los sinonimos de ingredientes, revisados a mano (spec 090). Del recorte de
// una linea de receta al nombre bueno de la despensa.
const SINONIMOS = JSON.parse(
  fs.readFileSync("docs/menus/sinonimos-ingredientes.json", "utf8")
).sinonimos;

// Mayuscula inicial, respetando el resto: "aceite de oliva virgen extra" pasa a
// "Aceite de oliva virgen extra", no a "Aceite De Oliva Virgen Extra".
const conMayuscula = (texto) =>
  texto ? texto[0].toUpperCase() + texto.slice(1) : texto;

const clave = (texto) =>
  String(texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Singular y plural son el mismo ingrediente (spec 072).
const mismo = (uno, otro) => {
  const a = clave(uno);
  const b = clave(otro);
  return a === b || a === `${b}s` || b === `${a}s` || a === `${b}es` || b === `${a}es`;
};

// --- La lista maestra de ingredientes (spec 092) -------------------------
//
// Los 133 del PDF, mas lo que salga de las lineas de las recetas, sin duplicar
// y todos con mayuscula inicial. Antes de esto, la siembra escribia las lineas
// como texto y cada cuenta acababa adivinando el ingrediente por su cuenta.
const maestro = [];
const meterEnMaestro = (nombre) => {
  const ya = maestro.find((otro) => mismo(otro, nombre));
  if (ya) return ya;
  const puesto = conMayuscula(nombre);
  maestro.push(puesto);
  return puesto;
};

datos.ingredientes.forEach(meterEnMaestro);

// El catalogo contra el que busca la extraccion: los 133 de partida.
const catalogoDePartida = datos.ingredientes.map((nombre, i) => ({ id: "i" + i, nombre }));

const SINONIMOS_MAPA = new Map(Object.entries(SINONIMOS));

// De una linea de texto a { ingrediente, cantidad, preparacion }, con el
// ingrediente ya metido en la lista maestra.
// Quita tildes CONSERVANDO LA LONGITUD: cada caracter sigue ocupando uno, para
// poder buscar en el texto plegado y cortar en el original.
//
// Hace falta porque el recorte viene sin tildes ("atun") y la linea si las lleva
// ("...de atún, enlatado..."): sin esto, indexOf no encuentra nada y la cantidad
// se queda vacia en todas las lineas cuyo ingrediente lleve tilde.
const plegado = (texto) =>
  [...String(texto || "")]
    .map((c) => c.normalize("NFD")[0].toLowerCase())
    .join("");

function cantidadDe(linea, recorte) {
  const texto = String(linea).replace(/\([^)]*\)/g, " ").split(",")[0].trim();
  const donde = plegado(texto).indexOf(plegado(recorte));
  if (donde <= 0) return "";
  return texto.slice(0, donde).trim().replace(/\s+de$/i, "").trim();
}

function enPiezas(linea) {
  const hallado = extraccion.ingredienteDeReceta(linea, catalogoDePartida, SINONIMOS_MAPA);
  return {
    ingrediente: meterEnMaestro(hallado.nombre),
    cantidad: cantidadDe(linea, hallado.recorte),
    // Vacia, por lo mismo que decidio la 089: adivinar que coma separa la
    // preparacion del nombre ensucia el nombre del ingrediente.
    preparacion: ""
  };
}

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
    // Los ingredientes ya en piezas (spec 092). Campo NUEVO, al lado del de
    // texto: `ingredientes` se queda como esta porque es la unica copia del
    // texto original que queda, y de ahi lo lee la reparacion de la spec 090.
    ingredientesEnPiezas: (receta.ingredientes || []).map(enPiezas),
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
export const INGREDIENTES = ${JSON.stringify(maestro, null, 2)};

// Del recorte de una linea de receta al nombre bueno de la despensa (spec 090).
// Sale de docs/menus/sinonimos-ingredientes.json, revisado a mano.
export const SINONIMOS = new Map(Object.entries(${JSON.stringify(SINONIMOS, null, 2)}));

// Ya con los siete días montados. Ver el comentario del generador sobre de
// dónde sale cada uno.
export const MENUS = ${JSON.stringify(menus, null, 2)};
`;

fs.writeFileSync("js/datos-iniciales.js", salida, "utf8");

console.log(
  `js/datos-iniciales.js: ${recetas.length} recetas, ` +
    `${datos.ingredientes.length} ingredientes, ${menus.length} menús`
);
