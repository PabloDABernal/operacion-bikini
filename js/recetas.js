// El recetario del usuario (spec 026).
//
// Vive en usuarios/{uid}/recetas, FUERA de las operaciones: una receta es
// conocimiento acumulado, no el diario de una etapa. Por eso no la archiva la
// spec 018 ni se pierde al empezar otra operación.

import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-config.js";
import { MAX_NOMBRE as MAX_NOMBRE_INGREDIENTE } from "./despensa.js";

const MAX_NOMBRE = 80;
const MAX_PREPARACION = 2000;
const RACIONES_MIN = 1;
const RACIONES_MAX = 20;
export const RACIONES_POR_DEFECTO = 2;

// Topes de las líneas de ingrediente estructuradas (spec 082): la cantidad y
// la preparación son texto libre corto, no hace falta el margen de la
// preparación de la receta entera (`MAX_PREPARACION`, de arriba, que es otra
// cosa — cómo se hace la receta, no el matiz de un ingrediente).
const MAX_CANTIDAD_LINEA = 40;
const MAX_PREPARACION_LINEA = 200;

function coleccionDe(uid) {
  return collection(db, "usuarios", uid, "recetas");
}

// Las líneas de ingredientes llegan en dos formas (spec 082):
// - un `string` de texto libre, un ingrediente por línea — el que sigue
//   mandando `guardarRecetasPropuestas()` (js/dietas.js) con las recetas que
//   propone la IA, que no conoce los `id` de la despensa del usuario;
// - un `Array` de líneas YA enlazadas a un ingrediente real de la despensa
//   — el que manda el editor del Recetario.
// Se distingue por el tipo de lo que llega, y se devuelve en la MISMA forma
// que se recibió: nunca se convierte de una a otra aquí.
function ingredientesValidados(ingredientesBruto) {
  if (Array.isArray(ingredientesBruto)) {
    if (ingredientesBruto.length === 0) {
      return { error: "Añade al menos un ingrediente." };
    }
    // TODAS las líneas tienen que estar enlazadas para poder guardar: una
    // línea a medio escribir (sin confirmar ni una sugerencia existente ni
    // "crear nuevo") no se descarta en silencio, bloquea el guardado entero
    // — igual que si fuera una línea vieja sin migrar todavía.
    if (ingredientesBruto.some((linea) => !linea || !linea.ingredienteId)) {
      return { error: "Cada línea necesita un ingrediente. Enlázalo o créalo antes de guardar." };
    }

    return {
      ingredientes: ingredientesBruto.map((linea) => ({
        ingredienteId: String(linea.ingredienteId),
        ingredienteNombre: String(linea.ingredienteNombre ?? "")
          .trim()
          .slice(0, MAX_NOMBRE_INGREDIENTE),
        cantidad: String(linea.cantidad ?? "").trim().slice(0, MAX_CANTIDAD_LINEA),
        preparacion: String(linea.preparacion ?? "").trim().slice(0, MAX_PREPARACION_LINEA)
      }))
    };
  }

  // Un ingrediente por línea. Las líneas en blanco sobran.
  const ingredientes = String(ingredientesBruto ?? "")
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean);

  if (ingredientes.length === 0) {
    return { error: "Escribe al menos un ingrediente." };
  }

  return { ingredientes };
}

// Devuelve { nombre, raciones, ingredientes, preparacion } o { error }.
export function validarReceta(nombreBruto, racionesBruto, ingredientesBruto, preparacionBruto) {
  const nombre = String(nombreBruto ?? "").trim();
  if (nombre === "") {
    return { error: "Ponle nombre a la receta." };
  }

  const racionesLimpio = String(racionesBruto ?? "").trim();
  let raciones = RACIONES_POR_DEFECTO;
  if (racionesLimpio !== "") {
    raciones = Number(racionesLimpio);
    if (
      !Number.isInteger(raciones) ||
      raciones < RACIONES_MIN ||
      raciones > RACIONES_MAX
    ) {
      return { error: `Las raciones deben estar entre ${RACIONES_MIN} y ${RACIONES_MAX}.` };
    }
  }

  const resultadoIngredientes = ingredientesValidados(ingredientesBruto);
  if (resultadoIngredientes.error) {
    return { error: resultadoIngredientes.error };
  }

  return {
    nombre: nombre.slice(0, MAX_NOMBRE),
    raciones,
    ingredientes: resultadoIngredientes.ingredientes,
    preparacion: String(preparacionBruto ?? "").trim().slice(0, MAX_PREPARACION)
  };
}

export function guardarReceta(uid, receta) {
  return addDoc(coleccionDe(uid), { ...receta, creadoEn: serverTimestamp() });
}

export function actualizarReceta(uid, recetaId, receta) {
  return updateDoc(doc(db, "usuarios", uid, "recetas", recetaId), {
    ...receta,
    editadoEn: serverTimestamp()
  });
}

// Por nombre: un recetario se busca con los ojos, y alfabético es como se
// encuentra. El orden de creación no le importa a nadie.
export async function listarRecetas(uid) {
  const consulta = query(coleccionDe(uid), orderBy("nombre"));
  const instantanea = await getDocs(consulta);

  return instantanea.docs.map((documento) => ({
    id: documento.id,
    ...documento.data()
  }));
}

export function borrarReceta(uid, recetaId) {
  return deleteDoc(doc(db, "usuarios", uid, "recetas", recetaId));
}
