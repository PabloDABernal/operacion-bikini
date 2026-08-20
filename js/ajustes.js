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
export const MAX_NOMBRE = 30;
export const MAX_PERFIL = 2000;

export function validarAjustes(pesoTexto, alturaTexto, fecha, nombreTexto, perfilTexto) {
  const ajustes = {
    // Cadena vacía, no null: "no quiero que me llames de ninguna manera" es
    // una respuesta válida y hay que poder volver a ella.
    nombre: String(nombreTexto ?? "").trim().slice(0, MAX_NOMBRE),
    perfil: String(perfilTexto ?? "").trim().slice(0, MAX_PERFIL),
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
      nombre: "",
      perfil: "",
      pesoObjetivoKg: null,
      alturaCm: null,
      fechaObjetivo: null,
      fotoPerfil: null,
      proveedorIa: "automatico"
    };
  }
  return { nombre: "", perfil: "", fotoPerfil: null, proveedorIa: "automatico", ...instantanea.data() };
}

// Preferencia de qué proveedor de IA probar primero (spec 032). Va por su
// lado, como la foto de perfil: así no depende del formulario "Mi objetivo" y
// se guarda al momento, sin botón "Guardar" propio.
export function guardarProveedorIa(uid, proveedorIa) {
  return setDoc(referenciaDe(uid), { proveedorIa, actualizadoEn: serverTimestamp() }, { merge: true });
}

// Lo que la entrevista de bienvenida (spec 016) saca de la conversación. Cada
// dato pasa por las mismas validaciones que el formulario: la IA se equivoca, y
// un peso objetivo de 5 kg no puede entrar por la puerta de atrás. Lo que no
// valga se ignora en silencio y ese ajuste se queda como estaba.
export function guardarLoAveriguado(uid, datos) {
  const validados = validarAjustes(
    datos.pesoObjetivoKg,
    datos.alturaCm,
    datos.fechaObjetivo,
    datos.nombre,
    datos.perfil
  );

  const aGuardar = {};
  if (!validados.error) {
    if (validados.nombre) aGuardar.nombre = validados.nombre;
    if (validados.perfil) aGuardar.perfil = validados.perfil;
    if (validados.pesoObjetivoKg !== null) {
      aGuardar.pesoObjetivoKg = validados.pesoObjetivoKg;
    }
    if (validados.alturaCm !== null) aGuardar.alturaCm = validados.alturaCm;
    if (validados.fechaObjetivo) aGuardar.fechaObjetivo = validados.fechaObjetivo;
  } else {
    // Un solo campo malo no debe tirar los demás: se reintenta sin los
    // numéricos, que son los que suele inventarse.
    const soloTexto = validarAjustes("", "", "", datos.nombre, datos.perfil);
    if (soloTexto.nombre) aGuardar.nombre = soloTexto.nombre;
    if (soloTexto.perfil) aGuardar.perfil = soloTexto.perfil;
  }

  if (Object.keys(aGuardar).length === 0) return Promise.resolve();
  return guardarAjustes(uid, aGuardar);
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
