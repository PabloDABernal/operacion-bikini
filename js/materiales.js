// Los materiales: con qué entrenas en casa (spec 074).
//
// Es la despensa (spec 058) trasladada a Ejercicio: una lista de materiales
// ("mancuernas", "banda elástica") que se marca o se desmarca según lo tengas
// ahora mismo. Mismo motivo, mismas reglas: un inventario con cantidades o
// variantes acaba mintiendo, y esto solo pide marcar y desmarcar.
//
// Vive en usuarios/{uid}/materiales, FUERA de las operaciones, por el mismo
// motivo que el catálogo de ejercicios (spec 029): no es el diario de una
// etapa.
//
// La normalización para comparar ("Mancuernas" = "mancuernas" = "  MANCUERNAS
// ") es la misma que usa la despensa, y se reutiliza desde allí en vez de
// copiarse: es la misma regla para el mismo propósito, y la spec 075 la
// necesitará también para cruzar con el material del catálogo de ejercicios.

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
import { normalizar } from "./despensa.js";

export const MAX_NOMBRE = 60;

function coleccionDe(uid) {
  return collection(db, "usuarios", uid, "materiales");
}

// Devuelve { nombre } o { error }.
export function validarMaterial(nombreBruto) {
  const nombre = String(nombreBruto ?? "").trim();

  if (nombre === "") {
    return { error: "Escribe un material." };
  }
  if (nombre.length > MAX_NOMBRE) {
    return { error: `Máximo ${MAX_NOMBRE} caracteres.` };
  }

  return { nombre };
}

// El material de la lista que es "el mismo" que este nombre, o undefined.
//
// `exceptoId` existe para editar: una fila no es duplicada de sí misma, así
// que cambiarle solo las mayúsculas o una tilde tiene que poder guardarse.
export function materialIgual(materiales, nombre, exceptoId = null) {
  const buscado = normalizar(nombre);
  return materiales.find(
    (material) =>
      material.id !== exceptoId && normalizar(material.nombre) === buscado
  );
}

// Nace SIN marcar, igual que la despensa desde la spec 068: escribir la lista
// no afirma nada sobre lo que hay en casa.
export function guardarMaterial(uid, nombre) {
  return addDoc(coleccionDe(uid), {
    nombre,
    tengo: false,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp()
  });
}

export function renombrarMaterial(uid, materialId, nombre) {
  return updateDoc(doc(db, "usuarios", uid, "materiales", materialId), {
    nombre,
    actualizadoEn: serverTimestamp()
  });
}

export function marcarMaterial(uid, materialId, tengo) {
  return updateDoc(doc(db, "usuarios", uid, "materiales", materialId), {
    tengo,
    actualizadoEn: serverTimestamp()
  });
}

export function borrarMaterial(uid, materialId) {
  return deleteDoc(doc(db, "usuarios", uid, "materiales", materialId));
}

// El orden se calcula aquí y no con un orderBy de Firestore, por el mismo
// motivo que la despensa: ordena por dos cosas a la vez —primero lo que
// tienes, luego alfabético sin tildes ni mayúsculas— y Firestore no hace lo
// segundo.
//
// Se llama al ENTRAR en la sub-pestaña, no al marcar: si la lista se
// recolocara en cada toque, la fila recién marcada saltaría bajo el dedo.
export function ordenar(materiales) {
  return [...materiales].sort((a, b) => {
    if (a.tengo !== b.tengo) return a.tengo ? -1 : 1;
    return normalizar(a.nombre).localeCompare(normalizar(b.nombre), "es");
  });
}

export async function listarMateriales(uid) {
  const instantanea = await getDocs(coleccionDe(uid));

  return ordenar(
    instantanea.docs.map((documento) => ({
      id: documento.id,
      ...documento.data()
    }))
  );
}
