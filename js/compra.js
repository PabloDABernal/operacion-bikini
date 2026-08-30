// Los apuntes a mano de la lista de la compra (spec 073).
//
// SOLO los apuntes a mano. Lo que falta de la dieta no se guarda en ningún
// sitio: se calcula al vuelo cruzando tus recetas con tu despensa
// (`loQueFalta()` en js/despensa.js), igual que el cruce de la spec 059.
// Guardarlo obligaría a mantenerlo al día cada vez que cambia la dieta, la
// despensa o una receta, y a resolver qué pasa cuando se contradicen.
//
// Y colección propia, NO la despensa. Fue lo primero que se pensó y está mal: la
// despensa se le manda a la IA al pedir dieta (`loQueTengo()`), así que el papel
// higiénico acabaría en el prompt como un ingrediente que tienes en casa.

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
  return collection(db, "usuarios", uid, "compra");
}

// Devuelve { texto } o { error }.
export function validarApunte(bruto, yaApuntados = []) {
  const texto = String(bruto ?? "").trim();

  if (texto === "") return { error: "Escribe qué hay que comprar." };
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
  return deleteDoc(doc(db, "usuarios", uid, "compra", apunteId));
}

export async function listarCompra(uid) {
  const instantanea = await getDocs(query(coleccionDe(uid), orderBy("creadoEn")));
  return instantanea.docs.map((documento) => ({
    id: documento.id,
    ...documento.data()
  }));
}
