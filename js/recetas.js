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

const MAX_NOMBRE = 80;
const MAX_PREPARACION = 2000;
const RACIONES_MIN = 1;
const RACIONES_MAX = 20;
export const RACIONES_POR_DEFECTO = 2;

function coleccionDe(uid) {
  return collection(db, "usuarios", uid, "recetas");
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

  // Un ingrediente por línea. Las líneas en blanco sobran.
  const ingredientes = String(ingredientesBruto ?? "")
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean);

  if (ingredientes.length === 0) {
    return { error: "Escribe al menos un ingrediente." };
  }

  return {
    nombre: nombre.slice(0, MAX_NOMBRE),
    raciones,
    ingredientes,
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
