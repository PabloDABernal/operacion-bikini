// La dieta de la semana (spec 028).
//
// Una semana son siete días con cuatro comidas cada uno. Se guarda entera en un
// documento: son 28 celdas de texto corto, cabe de sobra y se lee de una vez.
//
// Vive fuera de las operaciones, como el recetario: una dieta que funcionó
// sigue sirviendo en la etapa siguiente.

import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db, auth } from "./firebase-config.js";
import { validarReceta, guardarReceta } from "./recetas.js";

const ESPERA_MAXIMA_MS = 55000;
const URL_DIETA = "/api/dieta";

export const DIAS = [
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
  "domingo"
];

// Los mismos momentos que usa el registro de comidas, para que "me lo he
// comido" apunte con el momento correcto sin traducir nada.
export const MOMENTOS_DIETA = ["desayuno", "comida", "merienda", "cena"];

function coleccionDe(uid) {
  return collection(db, "usuarios", uid, "dietas");
}

function errorConCodigo(codigo, mensaje) {
  const error = new Error(mensaje);
  error.codigo = codigo;
  return error;
}

export function semanaEnBlanco() {
  return DIAS.map((dia) => ({
    dia,
    comidas: MOMENTOS_DIETA.map((momento) => ({ momento, texto: "", recetaId: "" }))
  }));
}

// De todas las dietas guardadas, la que está en uso. Solo hay una.
export async function leerDietaActiva(uid) {
  const instantanea = await getDocs(coleccionDe(uid));
  const dietas = instantanea.docs.map((documento) => ({
    id: documento.id,
    ...documento.data()
  }));

  return dietas.find((dieta) => dieta.activa) || null;
}

export function guardarDieta(uid, dias, instrucciones) {
  return addDoc(coleccionDe(uid), {
    activa: true,
    dias,
    instrucciones: instrucciones || "",
    creadoEn: serverTimestamp()
  });
}

export function actualizarDieta(uid, dietaId, dias) {
  return updateDoc(doc(db, "usuarios", uid, "dietas", dietaId), {
    dias,
    editadoEn: serverTimestamp()
  });
}

export function borrarDieta(uid, dietaId) {
  return deleteDoc(doc(db, "usuarios", uid, "dietas", dietaId));
}

// Para comparar nombres de plato: "Lentejas  con verduras" y "lentejas con
// verduras" son la misma receta.
function clave(texto) {
  return String(texto || "").trim().toLowerCase().replace(/\s+/g, " ");
}

// Guarda las recetas que propone la IA, sin duplicar las que ya tienes, y
// devuelve un mapa de nombre a identificador para poder enlazarlas.
export async function guardarRecetasPropuestas(uid, propuestas, recetasActuales) {
  const porNombre = new Map(
    recetasActuales.map((receta) => [clave(receta.nombre), receta.id])
  );

  for (const propuesta of propuestas) {
    const id = clave(propuesta.nombre);
    if (!id || porNombre.has(id)) continue;

    const receta = validarReceta(
      propuesta.nombre,
      propuesta.raciones,
      propuesta.ingredientes,
      propuesta.preparacion
    );
    // Una receta mal formada de la IA no debe tirar la dieta entera: se salta.
    if (receta.error) continue;

    const referencia = await guardarReceta(uid, receta);
    porNombre.set(id, referencia.id);
  }

  return porNombre;
}

// Convierte la semana que devuelve la IA al formato que se guarda, enlazando
// cada plato con su receta cuando el nombre coincide.
export function semanaDesdeLaIa(dias, porNombre) {
  return dias.map((dia) => ({
    dia: dia.dia,
    comidas: MOMENTOS_DIETA.map((momento) => {
      const texto = String(dia[momento] || "").trim();
      return { momento, texto, recetaId: porNombre.get(clave(texto)) || "" };
    })
  }));
}

export async function pedirDietaALaIa(uid, instrucciones, registros, contexto) {
  const idToken = await auth.currentUser.getIdToken();

  let respuesta;
  try {
    respuesta = await fetch(URL_DIETA, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      },
      // `contexto` trae también la despensa cuando el usuario ha marcado
      // "aprovechar lo que tengo" (spec 059); si no, llega vacía y el proxy se
      // comporta como siempre.
      body: JSON.stringify({ instrucciones, registros, ...contexto }),
      signal: AbortSignal.timeout(ESPERA_MAXIMA_MS)
    });
  } catch (fallo) {
    throw errorConCodigo(
      fallo.name === "TimeoutError" ? "tardanza" : "red",
      "Proxy inalcanzable"
    );
  }

  if (!respuesta.ok) {
    let codigo = "red";
    try {
      const datos = await respuesta.json();
      if (datos.error) codigo = datos.error;
      if (datos.estado) codigo = `${datos.error}-${datos.estado}`;
      // Con dos proveedores elegibles (spec 032), un "cuota-agotada" ya no
      // dice por sí solo si fue Gemini o Groq.
      if (datos.proveedor) codigo = `${codigo} (${datos.proveedor})`;
      if (datos.reserva && datos.reserva !== "no-hacia-falta") {
        codigo = `${codigo} · reserva: ${datos.reserva}`;
      }
    } catch {
      // Respuesta sin JSON: nos quedamos con el mensaje genérico.
    }
    throw errorConCodigo(codigo, `El proxy respondió ${respuesta.status}`);
  }

  return respuesta.json();
}
