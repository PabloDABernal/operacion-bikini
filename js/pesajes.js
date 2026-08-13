// Alta, edición, listado y borrado de pesajes. Cada usuario solo toca su
// subcolección.

import {
  collection,
  addDoc,
  deleteDoc,
  deleteField,
  updateDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-config.js";
import { errorDeFecha, errorDeHora, compararPorFechaYCreacion } from "./fechas.js";

// Vaciar la hora tiene que BORRAR el campo, no guardar cadena vacía: dos
// formas de decir "sin hora" acaban siempre en un if olvidado.
export function campoHora(hora) {
  return hora ? hora : deleteField();
}

const PESO_MIN = 20;
const PESO_MAX = 300;

function coleccionDe(uid) {
  return collection(db, "usuarios", uid, "pesajes");
}

// Devuelve { pesoKg, fecha } o { error } con el mensaje exacto de la spec.
export function validarPesaje(pesoTexto, fecha, hora) {
  const limpio = String(pesoTexto ?? "").trim().replace(",", ".");
  const peso = Number(limpio);

  if (limpio === "" || !Number.isFinite(peso)) {
    return { error: "Introduce un peso válido." };
  }
  if (peso < PESO_MIN || peso > PESO_MAX) {
    return { error: `El peso debe estar entre ${PESO_MIN} y ${PESO_MAX} kg.` };
  }
  const errorFecha = errorDeFecha(fecha);
  if (errorFecha) {
    return { error: errorFecha };
  }
  const errorHora = errorDeHora(hora);
  if (errorHora) {
    return { error: errorHora };
  }

  // Más de un decimal se redondea en silencio: 82,44 -> 82,4
  return { pesoKg: Math.round(peso * 10) / 10, fecha, hora: hora || "" };
}

export function guardarPesaje(uid, pesoKg, fecha, hora) {
  const pesaje = { pesoKg, fecha, creadoEn: serverTimestamp() };
  if (hora) pesaje.hora = hora;
  return addDoc(coleccionDe(uid), pesaje);
}

// creadoEn no se toca al editar: es lo que desempata el orden entre dos
// registros del mismo día.
export function actualizarPesaje(uid, pesajeId, pesoKg, fecha, hora) {
  return updateDoc(doc(db, "usuarios", uid, "pesajes", pesajeId), {
    pesoKg,
    fecha,
    hora: campoHora(hora),
    editadoEn: serverTimestamp()
  });
}

// Ordena por fecha descendente en Firestore (índice automático de un campo) y
// desempata por creadoEn aquí, para no necesitar un índice compuesto.
export async function listarPesajes(uid) {
  const consulta = query(coleccionDe(uid), orderBy("fecha", "desc"));
  const instantanea = await getDocs(consulta);

  const pesajes = instantanea.docs.map((documento) => ({
    id: documento.id,
    ...documento.data()
  }));

  pesajes.sort(compararPorFechaYCreacion);

  return pesajes;
}

export function borrarPesaje(uid, pesajeId) {
  return deleteDoc(doc(db, "usuarios", uid, "pesajes", pesajeId));
}
