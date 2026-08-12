// Alta, edición, listado y borrado de ejercicios.

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
import { errorDeFecha, compararPorFechaYCreacion } from "./fechas.js";

const MAX_CARACTERES = 200;
const MINUTOS_MIN = 1;
const MINUTOS_MAX = 600;

export const INTENSIDADES = [
  { valor: "suave", etiqueta: "Suave" },
  { valor: "media", etiqueta: "Media" },
  { valor: "fuerte", etiqueta: "Fuerte" }
];

export const INTENSIDAD_POR_DEFECTO = "media";

export function etiquetaDeIntensidad(valor) {
  const intensidad = INTENSIDADES.find((i) => i.valor === valor);
  return intensidad ? intensidad.etiqueta : valor;
}

function coleccionDe(uid) {
  return collection(db, "usuarios", uid, "ejercicios");
}

// Devuelve { texto, minutos, intensidad, fecha } o { error }.
export function validarEjercicio(textoBruto, minutosBruto, intensidad, fecha) {
  const texto = String(textoBruto ?? "").trim();

  if (texto === "") {
    return { error: "Escribe qué ejercicio has hecho." };
  }
  if (texto.length > MAX_CARACTERES) {
    return { error: `Máximo ${MAX_CARACTERES} caracteres.` };
  }

  const limpio = String(minutosBruto ?? "").trim().replace(",", ".");
  const minutos = Number(limpio);

  if (limpio === "" || !Number.isFinite(minutos)) {
    return { error: "Introduce los minutos." };
  }
  if (minutos < MINUTOS_MIN || minutos > MINUTOS_MAX) {
    return { error: `Los minutos deben estar entre ${MINUTOS_MIN} y ${MINUTOS_MAX}.` };
  }

  const errorFecha = errorDeFecha(fecha);
  if (errorFecha) {
    return { error: errorFecha };
  }

  // Los decimales se redondean en silencio: 45,6 -> 46
  return { texto, minutos: Math.round(minutos), intensidad, fecha };
}

export function guardarEjercicio(uid, texto, minutos, intensidad, fecha) {
  return addDoc(coleccionDe(uid), {
    texto,
    minutos,
    intensidad,
    fecha,
    creadoEn: serverTimestamp()
  });
}

// creadoEn no se toca al editar: es lo que desempata el orden entre dos
// registros del mismo día.
export function actualizarEjercicio(uid, ejercicioId, texto, minutos, intensidad, fecha) {
  return updateDoc(doc(db, "usuarios", uid, "ejercicios", ejercicioId), {
    texto,
    minutos,
    intensidad,
    fecha,
    editadoEn: serverTimestamp()
  });
}

export async function listarEjercicios(uid) {
  const consulta = query(coleccionDe(uid), orderBy("fecha", "desc"));
  const instantanea = await getDocs(consulta);

  const ejercicios = instantanea.docs.map((documento) => ({
    id: documento.id,
    ...documento.data()
  }));

  ejercicios.sort(compararPorFechaYCreacion);

  return ejercicios;
}

export function borrarEjercicio(uid, ejercicioId) {
  return deleteDoc(doc(db, "usuarios", uid, "ejercicios", ejercicioId));
}
