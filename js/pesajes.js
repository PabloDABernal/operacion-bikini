// Alta, listado y borrado de pesajes. Cada usuario solo toca su subcolección.

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

const PESO_MIN = 20;
const PESO_MAX = 300;

function coleccionDe(uid) {
  return collection(db, "usuarios", uid, "pesajes");
}

// Fecha de hoy en formato AAAA-MM-DD según la hora local.
// Nada de toISOString(): eso convierte a UTC y en España puede restar un día.
export function hoyISO() {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}

// Devuelve { pesoKg, fecha } o { error } con el mensaje exacto de la spec.
export function validarPesaje(pesoTexto, fecha) {
  const limpio = String(pesoTexto ?? "").trim().replace(",", ".");
  const peso = Number(limpio);

  if (limpio === "" || !Number.isFinite(peso)) {
    return { error: "Introduce un peso válido." };
  }
  if (peso < PESO_MIN || peso > PESO_MAX) {
    return { error: `El peso debe estar entre ${PESO_MIN} y ${PESO_MAX} kg.` };
  }
  if (!fecha) {
    return { error: "Introduce una fecha." };
  }
  if (fecha > hoyISO()) {
    return { error: "La fecha no puede ser futura." };
  }

  // Más de un decimal se redondea en silencio: 82,44 -> 82,4
  return { pesoKg: Math.round(peso * 10) / 10, fecha };
}

export function guardarPesaje(uid, pesoKg, fecha) {
  return addDoc(coleccionDe(uid), {
    pesoKg,
    fecha,
    creadoEn: serverTimestamp()
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

  pesajes.sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha < b.fecha ? 1 : -1;
    // creadoEn es null durante el instante en que el servidor aún no ha
    // resuelto serverTimestamp(); ese documento se considera el más reciente.
    const msA = a.creadoEn ? a.creadoEn.toMillis() : Infinity;
    const msB = b.creadoEn ? b.creadoEn.toMillis() : Infinity;
    return msB - msA;
  });

  return pesajes;
}

export function borrarPesaje(uid, pesajeId) {
  return deleteDoc(doc(db, "usuarios", uid, "pesajes", pesajeId));
}
