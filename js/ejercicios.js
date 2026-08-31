// Alta, edición, listado y borrado de ejercicios.

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
import { campoHora } from "./pesajes.js";

const MAX_CARACTERES = 200;
const MINUTOS_MIN = 1;
const MINUTOS_MAX = 600;

// La distancia, opcional (spec 086). Por debajo de 0,1 no es un ejercicio; por
// encima de 500 es un dedo que ha resbalado.
const DISTANCIA_MIN = 0.1;
const DISTANCIA_MAX = 500;

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

// La distancia en kilómetros (spec 086). Devuelve { distanciaKm } o { error }.
//
// VACÍO ES VÁLIDO y devuelve `null`: el campo es opcional, y no haberlo
// rellenado no es equivocarse. Quien llama distingue null (no lo apuntó) de un
// número, y por eso el campo no se guarda cuando no hay distancia: un 0 diría
// que anduvo cero kilómetros, que es otra cosa.
export function validarDistancia(distanciaBruta) {
  const limpio = String(distanciaBruta ?? "").trim().replace(",", ".");
  if (limpio === "") return { distanciaKm: null };

  const distancia = Number(limpio);
  if (
    !Number.isFinite(distancia) ||
    distancia < DISTANCIA_MIN ||
    distancia > DISTANCIA_MAX
  ) {
    return {
      error: `La distancia debe estar entre ${String(DISTANCIA_MIN).replace(".", ",")} y ${DISTANCIA_MAX} km.`
    };
  }

  // Un decimal: más precisión que esa es ruido en un paseo. Se redondea en
  // silencio, igual que ya se hace con los minutos.
  return { distanciaKm: Math.round(distancia * 10) / 10 };
}

// Devuelve { texto, minutos, intensidad, fecha, distanciaKm } o { error }.
export function validarEjercicio(
  textoBruto,
  minutosBruto,
  intensidad,
  fecha,
  hora,
  distanciaBruta
) {
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
  const errorHora = errorDeHora(hora);
  if (errorHora) {
    return { error: errorHora };
  }

  const distancia = validarDistancia(distanciaBruta);
  if (distancia.error) {
    return { error: distancia.error };
  }

  // Los decimales se redondean en silencio: 45,6 -> 46
  return {
    texto,
    minutos: Math.round(minutos),
    intensidad,
    fecha,
    hora: hora || "",
    distanciaKm: distancia.distanciaKm
  };
}

export function guardarEjercicio(
  uid,
  texto,
  minutos,
  intensidad,
  fecha,
  hora,
  distanciaKm
) {
  const ejercicio = { texto, minutos, intensidad, fecha, creadoEn: serverTimestamp() };
  if (hora) ejercicio.hora = hora;
  // Si no hay distancia, no hay campo. Mismo criterio que la hora: lo que no has
  // dicho, no está. Un 0 sería una afirmación falsa, y las estadísticas de la
  // spec 087 tendrían que distinguirlo de "no lo apunté".
  if (distanciaKm != null) ejercicio.distanciaKm = distanciaKm;
  return addDoc(coleccionDe(uid), ejercicio);
}

// creadoEn no se toca al editar: es lo que desempata el orden entre dos
// registros del mismo día.
export function actualizarEjercicio(
  uid,
  ejercicioId,
  texto,
  minutos,
  intensidad,
  fecha,
  hora,
  distanciaKm
) {
  return updateDoc(doc(db, "usuarios", uid, "ejercicios", ejercicioId), {
    texto,
    minutos,
    intensidad,
    fecha,
    hora: campoHora(hora),
    // Vaciar el campo tiene que BORRAR la distancia, no dejarla como estaba.
    // deleteField() y no undefined: updateDoc ignora undefined, así que el dato
    // viejo sobreviviría a una edición que quería quitarlo.
    distanciaKm: distanciaKm == null ? deleteField() : distanciaKm,
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
