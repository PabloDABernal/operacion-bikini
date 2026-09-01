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

// Para no repetir dos veces la misma pieza cuando el texto dice "mancuerna" en
// un sitio y "mancuernas" en otro. Se importa de la despensa por lo mismo que
// lo hace js/material.js: el emparejado es genérico y la spec 072 ya le metió
// el caso del plural.
import { mismoIngrediente } from "./despensa.js";

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

// El material de un ejercicio, leído como lista de piezas (spec 077).
//
// Se guarda y se edita como un string —"mancuernas, banco"— y se PARTE AL LEER.
// No se migra nada: la alternativa era que la IA lo devolviera ya en lista y
// dejar el campo con dos tipos posibles en Firestore para siempre, string en
// los ejercicios viejos y lista en los nuevos. Decisión del usuario el 1 de
// septiembre de 2026, con PRODUCTO.md corregido.
//
// Las formas de decir "ninguno" salen del prompt de api/tabla.js, que pide
// literalmente escribir "ninguno" cuando no hace falta material.
const SIN_MATERIAL = [
  "ninguno",
  "ninguna",
  "ninguno.",
  "nada",
  "sin material",
  "no",
  "peso corporal",
  "el propio peso corporal"
];

function esDecirNinguno(pieza) {
  const limpio = pieza
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[.;:]+$/, "")
    .trim();

  return SIN_MATERIAL.includes(limpio);
}

export function piezasDeMaterial(texto) {
  // El " y " se separa como una coma más: "mancuernas y banco" son dos cosas.
  // Con espacios a los lados a propósito, para no partir "yoga" por la mitad.
  const trozos = String(texto ?? "")
    .split(/[,;]| y (?=\S)/i)
    .map((trozo) => trozo.trim())
    .filter((trozo) => trozo !== "" && !esDecirNinguno(trozo));

  const piezas = [];
  trozos.forEach((trozo) => {
    if (!piezas.some((puesta) => mismoIngrediente(puesta, trozo))) {
      piezas.push(trozo);
    }
  });

  return piezas;
}

// Cuántas de las piezas que pide un ejercicio tienes MARCADAS en tu armario
// (spec 077). Devuelve { piezas: [{ nombre, tengo }], tengo, total }.
//
// Una pieza apuntada pero desmarcada cuenta como que te falta: tenerla escrita
// no es tenerla. Mismo criterio que la despensa y la lista de la compra.
export function cruzarConElArmario(texto, armario) {
  const piezas = piezasDeMaterial(texto).map((nombre) => ({
    nombre,
    tengo: (armario || []).some(
      (pieza) => pieza.tengo && mismoIngrediente(pieza.nombre, nombre)
    )
  }));

  return {
    piezas,
    tengo: piezas.filter((pieza) => pieza.tengo).length,
    total: piezas.length
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
