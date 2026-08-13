// Ajustes del usuario: objetivo de peso, altura y fecha objetivo.
//
// Viven en el propio documento usuarios/{uid}, que hasta la spec 006 no
// existía: antes solo se usaban sus subcolecciones.

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-config.js";
import { hoyISO } from "./fechas.js";

const PESO_MIN = 20;
const PESO_MAX = 300;
const ALTURA_MIN = 100;
const ALTURA_MAX = 250;

function referenciaDe(uid) {
  return doc(db, "usuarios", uid);
}

// Devuelve { pesoObjetivoKg, alturaCm, fechaObjetivo } o { error }.
// Los tres campos son opcionales: se puede guardar solo uno.
export function validarAjustes(pesoTexto, alturaTexto, fecha) {
  const ajustes = {
    pesoObjetivoKg: null,
    alturaCm: null,
    fechaObjetivo: null
  };

  const pesoLimpio = String(pesoTexto ?? "").trim().replace(",", ".");
  if (pesoLimpio !== "") {
    const peso = Number(pesoLimpio);
    if (!Number.isFinite(peso) || peso < PESO_MIN || peso > PESO_MAX) {
      return { error: `El peso objetivo debe estar entre ${PESO_MIN} y ${PESO_MAX} kg.` };
    }
    ajustes.pesoObjetivoKg = Math.round(peso * 10) / 10;
  }

  const alturaLimpia = String(alturaTexto ?? "").trim();
  if (alturaLimpia !== "") {
    const altura = Number(alturaLimpia);
    if (
      !Number.isInteger(altura) ||
      altura < ALTURA_MIN ||
      altura > ALTURA_MAX
    ) {
      return { error: `La altura debe estar entre ${ALTURA_MIN} y ${ALTURA_MAX} cm.` };
    }
    ajustes.alturaCm = altura;
  }

  if (fecha) {
    // Hoy mismo no vale: un objetivo que vence hoy no es un objetivo.
    if (fecha <= hoyISO()) {
      return { error: "La fecha objetivo tiene que ser futura." };
    }
    ajustes.fechaObjetivo = fecha;
  }

  return ajustes;
}

export async function leerAjustes(uid) {
  const instantanea = await getDoc(referenciaDe(uid));
  if (!instantanea.exists()) {
    return {
      pesoObjetivoKg: null,
      alturaCm: null,
      fechaObjetivo: null,
      fotoPerfil: null
    };
  }
  return { fotoPerfil: null, ...instantanea.data() };
}

// La foto va por su lado y no pasa por validarAjustes(): así guardar el peso
// objetivo no puede borrar la foto, ni subir una foto tocar el objetivo.
export function guardarFotoPerfil(uid, url) {
  return setDoc(
    referenciaDe(uid),
    { fotoPerfil: url, actualizadoEn: serverTimestamp() },
    { merge: true }
  );
}

// merge para no pisar nada que otra spec añada aquí en el futuro.
export function guardarAjustes(uid, ajustes) {
  return setDoc(
    referenciaDe(uid),
    { ...ajustes, actualizadoEn: serverTimestamp() },
    { merge: true }
  );
}
