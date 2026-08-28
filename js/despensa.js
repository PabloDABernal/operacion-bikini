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

// Nace marcado a propósito: si te molestas en escribirlo es porque lo acabas de
// comprar.
export function guardarIngrediente(uid, nombre) {
  return addDoc(coleccionDe(uid), {
    nombre,
    tengo: true,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp()
  });
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

export async function listarDespensa(uid) {
  const instantanea = await getDocs(coleccionDe(uid));

  return ordenar(
    instantanea.docs.map((documento) => ({
      id: documento.id,
      ...documento.data()
    }))
  );
}
