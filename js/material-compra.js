// Los apuntes a mano de "el material que te falta" (spec 078).
//
// SOLO los apuntes a mano. Lo que falta de la tabla no se guarda en ningún
// sitio: se calcula al vuelo cruzando los ejercicios de tu tabla activa con
// tu armario (`loQueFalta()` en js/material.js), igual que el cruce de la
// spec 059/077. Guardarlo obligaría a mantenerlo al día cada vez que cambia
// la tabla, el catálogo o el armario.
//
// Y colección propia, NO el armario. Mismo motivo que la lista de la compra
// (spec 073) con la despensa: el armario se le manda a la IA al pedir tabla
// con "aprovechar mi material", así que un apunte suelto tipo "comprar un
// banco nuevo" acabaría en el prompt como si ya lo tuvieras.

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-config.js";
import { normalizar } from "./despensa.js";

export const MAX_APUNTE = 60;
export const MAXIMO_APUNTES = 50;

function coleccionDe(uid) {
  return collection(db, "usuarios", uid, "materialCompra");
}

// Devuelve { texto } o { error }.
export function validarApunte(bruto, yaApuntados = []) {
  const texto = String(bruto ?? "").trim();

  if (texto === "") return { error: "Escribe qué material te falta." };
  if (texto.length > MAX_APUNTE) {
    return { error: `Máximo ${MAX_APUNTE} caracteres.` };
  }
  if (yaApuntados.length >= MAXIMO_APUNTES) {
    return { error: `Como mucho ${MAXIMO_APUNTES} apuntes.` };
  }
  if (yaApuntados.some((apunte) => normalizar(apunte.texto) === normalizar(texto))) {
    return { error: `"${texto}" ya está en la lista.` };
  }

  return { texto };
}

export function guardarApunte(uid, texto) {
  return addDoc(coleccionDe(uid), { texto, creadoEn: serverTimestamp() });
}

export function borrarApunte(uid, apunteId) {
  return deleteDoc(doc(db, "usuarios", uid, "materialCompra", apunteId));
}

export async function listarMaterialCompra(uid) {
  const instantanea = await getDocs(query(coleccionDe(uid), orderBy("creadoEn")));
  return instantanea.docs.map((documento) => ({
    id: documento.id,
    ...documento.data()
  }));
}
