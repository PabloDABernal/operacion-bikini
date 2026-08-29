// La despensa: los ingredientes con los que sueles cocinar (spec 058).
//
// Vive en usuarios/{uid}/despensa, FUERA de las operaciones, por el mismo
// motivo que las recetas (spec 026) y las dietas (spec 028): lo que tienes en
// la cocina no es el diario de una etapa. Empezar otra operación bikini no te
// deja sin tomates.
//
// NO es un inventario: no guarda cuánto queda de cada cosa ni cuándo caduca.
// Decisión del usuario al escribir la spec, y el motivo importa: un inventario
// que hay que actualizar después de cada comida acaba mintiendo, y una despensa
// que miente es peor que no tenerla. Todo el mantenimiento que pide es marcar y
// desmarcar.

import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-config.js";

export const MAX_NOMBRE = 60;

function coleccionDe(uid) {
  return collection(db, "usuarios", uid, "despensa");
}

// Para COMPARAR, nunca para guardar: el nombre se guarda tal y como lo escribe
// el usuario. "Tomate", "tomate" y "  TOMATE " son el mismo ingrediente.
//
// Esta función es la semilla del cruce despensa/receta de la spec 059, y por eso
// vive aquí y no dentro del código de pantalla.
export function normalizar(texto) {
  return String(texto ?? "")
    .toLowerCase()
    .normalize("NFD")
    // \p{Mn} son las marcas que no ocupan hueco propio: justo las tildes y
    // diéresis que NFD acaba de separar de su letra. Se escribe así, y no con
    // un rango de caracteres, porque ese rango son tildes sueltas —invisibles
    // en el editor y fáciles de romper al copiar el archivo.
    .replace(/\p{Mn}/gu, "")
    .trim();
}

// Devuelve { nombre } o { error }.
export function validarIngrediente(nombreBruto) {
  const nombre = String(nombreBruto ?? "").trim();

  if (nombre === "") {
    return { error: "Escribe un ingrediente." };
  }
  if (nombre.length > MAX_NOMBRE) {
    return { error: `Máximo ${MAX_NOMBRE} caracteres.` };
  }

  return { nombre };
}

// El ingrediente de la lista que es "el mismo" que este nombre, o undefined.
//
// `exceptoId` existe para editar: una fila no es duplicada de sí misma, así que
// cambiarle solo las mayúsculas o una tilde tiene que poder guardarse.
export function ingredienteIgual(ingredientes, nombre, exceptoId = null) {
  const buscado = normalizar(nombre);
  return ingredientes.find(
    (ingrediente) =>
      ingrediente.id !== exceptoId && normalizar(ingrediente.nombre) === buscado
  );
}

// Nace SIN marcar (spec 068, revierte la decisión de la 058).
//
// La 058 los creaba marcados, con el argumento de que lo escribes cuando lo
// compras. Al usarlo resultó falso: se escribe la lista de golpe —o la rellena
// una receta— y entonces la despensa afirmaba tener cosas que no había. El
// usuario lo dijo así el 29 de agosto: "realmente solo tengo sal, así que no
// debería salir como que lo tengo".
//
// Ahora la lista es "con esto cocino" y la casilla es "y ahora mismo lo tengo".
// Escribir no afirma nada sobre la nevera; marcar sí, y es un acto aparte.
export function guardarIngrediente(uid, nombre) {
  return addDoc(coleccionDe(uid), {
    nombre,
    tengo: false,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp()
  });
}

// Mete de golpe los ingredientes de una receta (spec 068). Sin marcar, como
// cualquier alta: que una receta mencione el azafrán no significa que lo tengas.
//
// Devuelve cuántos entraron. Los que ya estaban no se tocan —ni se duplican ni
// se les cambia la marca—, así que llamar a esto dos veces con la misma receta
// no hace nada la segunda.
export async function guardarIngredientesDeReceta(uid, receta, despensa) {
  const nuevos = ingredientesNuevosDe(receta, despensa);
  for (const nombre of nuevos) {
    await guardarIngrediente(uid, nombre);
  }
  return nuevos.length;
}

export function renombrarIngrediente(uid, ingredienteId, nombre) {
  return updateDoc(doc(db, "usuarios", uid, "despensa", ingredienteId), {
    nombre,
    actualizadoEn: serverTimestamp()
  });
}

export function marcarIngrediente(uid, ingredienteId, tengo) {
  return updateDoc(doc(db, "usuarios", uid, "despensa", ingredienteId), {
    tengo,
    actualizadoEn: serverTimestamp()
  });
}

export function borrarIngrediente(uid, ingredienteId) {
  return deleteDoc(doc(db, "usuarios", uid, "despensa", ingredienteId));
}

// El orden se calcula aquí y no con un orderBy de Firestore porque ordena por
// dos cosas a la vez —primero lo que tienes, luego alfabético— y la segunda
// tiene que ignorar tildes y mayúsculas, cosa que Firestore no hace.
//
// Se llama al ENTRAR en la sub-pestaña, no al marcar: si la lista se recolocara
// en cada toque, la fila recién marcada saltaría bajo el dedo y la siguiente
// ocuparía su sitio. Marcar cinco cosas seguidas se volvería una trampa.
export function ordenar(ingredientes) {
  return [...ingredientes].sort((a, b) => {
    if (a.tengo !== b.tengo) return a.tengo ? -1 : 1;
    return normalizar(a.nombre).localeCompare(normalizar(b.nombre), "es");
  });
}

// --- De línea de receta a ingrediente de despensa (spec 068) --------------
//
// Una receta escribe "200 g de lentejas" o "2 dientes de ajo". En la despensa
// eso tiene que quedar como "lentejas" y "ajo": lo que se guarda ahí es con qué
// cocinas, no cuánto pedía aquella receta.
//
// Es una heurística y puede equivocarse, así que está escrita para equivocarse
// del lado seguro: **ante la duda, se deja la línea entera**. Un ingrediente con
// una cantidad pegada es feo pero se entiende y se puede editar; uno recortado
// de más ("aceite" en vez de "aceite de oliva") es información perdida.

// Unidades que aparecen entre el número y el ingrediente. Solo se quitan cuando
// van DETRÁS de un número: "diente" suelto no es una unidad, es un ajo.
const UNIDADES = [
  "g", "gr", "gramo", "gramos", "kg", "kilo", "kilos",
  "ml", "cl", "l", "litro", "litros",
  "cucharada", "cucharadas", "cucharadita", "cucharaditas",
  "diente", "dientes", "taza", "tazas", "pizca", "pizcas",
  "lata", "latas", "bote", "botes", "puñado", "puñados",
  "rodaja", "rodajas", "loncha", "lonchas", "filete", "filetes",
  "unidad", "unidades", "trozo", "trozos", "ramita", "ramitas"
];

// Coletillas del final que no dicen qué es el ingrediente.
const COLETILLAS = ["al gusto", "a gusto", "opcional", "para decorar", "al final"];

export function ingredienteDeLinea(linea) {
  let texto = String(linea ?? "").trim();
  if (!texto) return "";

  // El paréntesis suele llevar la aclaración, no el ingrediente:
  // "pollo (pechuga)" -> "pollo".
  texto = texto.replace(/\s*\([^)]*\)\s*/g, " ").trim();

  for (const coletilla of COLETILLAS) {
    const sobra = new RegExp(`[,\\s]+${coletilla}$`, "i");
    texto = texto.replace(sobra, "").trim();
  }

  // El número de delante, con sus fracciones y sus rangos: "1/2", "1,5", "2-3".
  const conNumero = texto.match(/^[\d/.,-]+\s+(.*)$/);
  if (conNumero) {
    let resto = conNumero[1].trim();

    // Y si justo después venía una unidad, también: "200 g de lentejas".
    const primera = resto.split(/\s+/)[0].toLowerCase().replace(/[.,]$/, "");
    if (UNIDADES.includes(primera)) {
      resto = resto.slice(resto.indexOf(" ") + 1).trim();
      // El "de" que une la unidad con el ingrediente sobra: "de lentejas".
      // OJO: esto solo se hace tras quitar una unidad. Un "de" suelto NO se
      // toca, o "aceite de oliva" se quedaría en "aceite".
      resto = resto.replace(/^de\s+/i, "").trim();
    }

    if (resto) texto = resto;
  }

  return texto;
}

// Los ingredientes de una receta, listos para la despensa: limpios, sin
// repetidos entre sí y sin los que ya tienes apuntados.
export function ingredientesNuevosDe(receta, despensa) {
  const vistos = new Set(despensa.map((ingrediente) => normalizar(ingrediente.nombre)));
  const nuevos = [];

  (receta.ingredientes || []).forEach((linea) => {
    const nombre = ingredienteDeLinea(linea).slice(0, MAX_NOMBRE);
    if (!nombre) return;

    const clave = normalizar(nombre);
    if (!clave || vistos.has(clave)) return;

    vistos.add(clave);
    nuevos.push(nombre);
  });

  return nuevos;
}

// --- El cruce despensa/receta (spec 059) ---------------------------------
//
// Decide si una línea de ingredientes de una receta ("2 tomates maduros") es
// algo que tienes en la despensa ("tomate").
//
// Se hace AQUÍ, en el navegador y al abrir la receta, y no se lo pedimos a la
// IA al generar la dieta. La IA entiende mejor los sinónimos, pero su respuesta
// se guarda y una receta se mira días después: la marca quedaría congelada en
// cómo estaba tu despensa el día que se generó. Preferimos una marca que nunca
// miente sobre el presente, aunque falle algún cruce raro.

// Un ingrediente es texto del usuario y puede traer paréntesis, puntos o
// asteriscos. Sin escapar, "aceite (virgen)" es una expresión regular rota.
function escaparParaRegex(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// La regla, y por qué es exactamente esta:
//
// - Por la izquierda, el ingrediente no puede empezar a media palabra: impide
//   que tu "lechuga" acierte dentro de "leche entera".
// - Por la derecha se tolera SOLO una "s" o un "es" de plural. Eso salva el caso
//   normal —tu "tomate" acierta en "2 tomates maduros", tu "coliflor" en "2
//   coliflores"— sin abrir la puerta al desastre: a tu "sal" le seguiría "món",
//   que no es ninguno de los dos, así que NO se come el "salmón a la plancha".
//
// Las dos mitades se sostienen entre sí. Relajar la izquierda o ampliar el
// sufijo rompe uno de los dos casos.
//
// Los límites van con lookarounds y no con \b, que es lo que se probó primero:
// \b exige una letra a un lado y algo que no lo sea al otro, así que un
// ingrediente acabado en signo —"aceite (virgen extra)"— no se encontraba ni a
// sí mismo. El lookaround solo pregunta si al lado hay letra o número, que es lo
// que de verdad importa aquí.
//
// Los casos que prueban todo esto están en docs/specs/059-cruce-casos.mjs.
const LETRA_O_NUMERO = "\\p{L}\\p{N}";

export function lineaTieneIngrediente(linea, nombre) {
  const buscado = normalizar(nombre);
  if (!buscado) return false;

  const patron = new RegExp(
    `(?<![${LETRA_O_NUMERO}])${escaparParaRegex(buscado)}(es|s)?(?![${LETRA_O_NUMERO}])`,
    "u"
  );

  return patron.test(normalizar(linea));
}

// Devuelve la lista de ingredientes de una receta, cada uno con si lo tienes.
//
// Solo cuentan los ingredientes marcados: la despensa guarda también lo que
// sueles usar pero se te ha acabado, y eso es justo lo que NO tienes.
//
// Un ingrediente tuyo se gasta al primer acierto y no vale para dos líneas de la
// misma receta: si la receta pide tomate dos veces, tu tomate no cuenta dos.
//
// Ante la duda, "te falta". Mandarte al súper a por algo que ya tenías es una
// molestia; dejarte sin cenar porque te dijo que lo tenías, no.
export function cruzarConLaDespensa(lineas, despensa) {
  const disponibles = despensa.filter((ingrediente) => ingrediente.tengo);
  const gastados = new Set();

  return (lineas || []).map((linea) => {
    const encontrado = disponibles.find(
      (ingrediente) =>
        !gastados.has(ingrediente.id) &&
        lineaTieneIngrediente(linea, ingrediente.nombre)
    );

    if (encontrado) gastados.add(encontrado.id);
    return { texto: linea, tengo: Boolean(encontrado) };
  });
}

// Lo que se le manda a la IA al pedir la dieta: solo los nombres de lo que
// tienes ahora en casa.
export function loQueTengo(despensa) {
  return despensa
    .filter((ingrediente) => ingrediente.tengo)
    .map((ingrediente) => ingrediente.nombre);
}

export async function listarDespensa(uid) {
  const instantanea = await getDocs(coleccionDe(uid));

  return ordenar(
    instantanea.docs.map((documento) => ({
      id: documento.id,
      ...documento.data()
    }))
  );
}
