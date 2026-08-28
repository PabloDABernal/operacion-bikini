// El agua del día (spec 061).
//
// Un documento por DÍA, con la fecha como id, igual que `analisis` (spec 030).
// No hay un documento por vaso: lo único que se guarda es cuántos llevas. Sin
// hora, sin tamaño y sin historial vaso a vaso — es un contador, no un diario.
// Nadie va a mirar a qué hora se bebió el tercero.
//
// El agua NO da puntos, no mantiene la racha y no sale en el calendario de
// constancia. Decisión del usuario (29 de agosto): la racha cuenta lo mismo que
// el calendario, y si el agua contara habría que meterla también ahí o el
// calendario pintaría un día vacío que la racha da por bueno.

import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-config.js";

export const VASOS_OBJETIVO_POR_DEFECTO = 8;
export const VASOS_OBJETIVO_MIN = 1;
export const VASOS_OBJETIVO_MAX = 20;

// Tope contra el toque atascado y el bolsillo, no un límite de salud. Beberse
// treinta vasos de agua en un día no es un caso real.
export const MAXIMO_VASOS = 30;

function documentoDe(uid, fecha) {
  return doc(db, "usuarios", uid, "agua", fecha);
}

export function coleccionDeAgua(uid) {
  return collection(db, "usuarios", uid, "agua");
}

export async function leerVasosDe(uid, fecha) {
  const instantanea = await getDoc(documentoDe(uid, fecha));
  if (!instantanea.exists()) return 0;
  return normalizarVasos(instantanea.data().vasos);
}

// Lo que llegue de Firestore puede ser cualquier cosa si alguien tocó el
// documento a mano. Nada de NaN ni de negativos llegando a la pantalla.
export function normalizarVasos(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return 0;
  return Math.min(MAXIMO_VASOS, Math.max(0, Math.trunc(numero)));
}

// Se escribe el TOTAL, no un incremento. Es lo que hace que tocar ocho veces
// seguidas funcione: cada escritura manda el número que se ve en pantalla, así
// que no hay que esperar a que vuelva la anterior para calcular la siguiente.
//
// `merge: true` porque el documento puede no existir todavía: el primer vaso del
// día lo crea, y los siguientes solo tocan el campo.
export function guardarVasos(uid, fecha, vasos) {
  return setDoc(
    documentoDe(uid, fecha),
    { vasos: normalizarVasos(vasos), actualizadoEn: serverTimestamp() },
    { merge: true }
  );
}

export function objetivoDeVasos(ajustes) {
  const numero = Number(ajustes?.vasosObjetivo);
  if (!Number.isInteger(numero)) return VASOS_OBJETIVO_POR_DEFECTO;
  if (numero < VASOS_OBJETIVO_MIN || numero > VASOS_OBJETIVO_MAX) {
    return VASOS_OBJETIVO_POR_DEFECTO;
  }
  return numero;
}

// Devuelve { objetivo } o { error }. Vacío NO es válido: para volver al valor de
// siempre se escribe 8, que es lo que ya sale puesto.
export function validarObjetivo(bruto) {
  const texto = String(bruto ?? "").trim();
  if (texto === "") {
    return { error: "Pon cuántos vasos quieres beber al día." };
  }

  const numero = Number(texto);
  if (
    !Number.isInteger(numero) ||
    numero < VASOS_OBJETIVO_MIN ||
    numero > VASOS_OBJETIVO_MAX
  ) {
    return {
      error: `El objetivo tiene que estar entre ${VASOS_OBJETIVO_MIN} y ${VASOS_OBJETIVO_MAX} vasos.`
    };
  }

  return { objetivo: numero };
}
