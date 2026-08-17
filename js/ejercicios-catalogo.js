// El catálogo de ejercicios del usuario (spec 029).
//
// Vive en usuarios/{uid}/ejerciciosCatalogo, FUERA de las operaciones: saber
// cómo se hace una sentadilla es conocimiento acumulado, no el diario de una
// etapa. Misma razón que el recetario de la spec 026.
//
// OJO con el nombre: la colección "ejercicios" (js/ejercicios.js) son los
// registros de actividad hecha, el diario. Esto es el catálogo, el plan.
// Mezclarlas borraría el diario al vaciar el catálogo.

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
const MAX_COMO_SE_HACE = 1000;
const MAX_MATERIAL = 200;

function coleccionDe(uid) {
  return collection(db, "usuarios", uid, "ejerciciosCatalogo");
}

// Devuelve { nombre, comoSeHace, material } o { error }.
export function validarEjercicioCatalogo(nombreBruto, comoSeHaceBruto, materialBruto) {
  const nombre = String(nombreBruto ?? "").trim();
  if (nombre === "") {
    return { error: "Ponle nombre al ejercicio." };
  }
  if (nombre.length > MAX_NOMBRE) {
    return { error: `Máximo ${MAX_NOMBRE} caracteres.` };
  }

  return {
    nombre,
    comoSeHace: String(comoSeHaceBruto ?? "").trim().slice(0, MAX_COMO_SE_HACE),
    material: String(materialBruto ?? "").trim().slice(0, MAX_MATERIAL)
  };
}

export function guardarEjercicioCatalogo(uid, ejercicio) {
  return addDoc(coleccionDe(uid), { ...ejercicio, creadoEn: serverTimestamp() });
}

export function actualizarEjercicioCatalogo(uid, ejercicioId, ejercicio) {
  return updateDoc(doc(db, "usuarios", uid, "ejerciciosCatalogo", ejercicioId), {
    ...ejercicio,
    editadoEn: serverTimestamp()
  });
}

// Por nombre, como el recetario: un catálogo se busca con los ojos.
export async function listarEjerciciosCatalogo(uid) {
  const consulta = query(coleccionDe(uid), orderBy("nombre"));
  const instantanea = await getDocs(consulta);

  return instantanea.docs.map((documento) => ({
    id: documento.id,
    ...documento.data()
  }));
}

export function borrarEjercicioCatalogo(uid, ejercicioId) {
  return deleteDoc(doc(db, "usuarios", uid, "ejerciciosCatalogo", ejercicioId));
}
