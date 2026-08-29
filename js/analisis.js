// El detalle nutricional del día (spec 030).
//
// La IA lee las comidas que ya apuntaste en texto libre y las convierte en
// seis grupos de alimentos y una horquilla de calorías. El usuario no rellena
// ningún campo nuevo.
//
// El id del documento es la fecha, así que hay uno por día por construcción:
// se lee sin consultas y rehacer es sustituirlo.
//
// Vive DENTRO de la operación, al revés que el recetario (026), la dieta (028)
// y el catálogo de ejercicios (029): esto es diario, no conocimiento.

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db, auth } from "./firebase-config.js";

const ESPERA_MAXIMA_MS = 55000;
const URL_ANALISIS = "/api/analisis";

// Dos al día: uno a media tarde para ver cómo llevas el día y otro después de
// cenar, cuando el día ya está completo.
export const ANALISIS_POR_DIA = 2;

// El orden es fijo y es el que se pinta. La IA solo reparte.
export const GRUPOS = [
  "Verdura y fruta",
  "Proteína",
  "Cereales y féculas",
  "Lácteos",
  "Grasas",
  "Ultraprocesados y dulces"
];

// Cuánto pesó ese grupo en el día. No es una cantidad.
export const MEDIDAS = ["nada", "poco", "bastante", "mucho"];

function referenciaDe(uid, fecha) {
  return doc(db, "usuarios", uid, "analisis", fecha);
}

function errorConCodigo(codigo, mensaje) {
  const error = new Error(mensaje);
  error.codigo = codigo;
  return error;
}

export async function leerAnalisisDe(uid, fecha) {
  const documento = await getDoc(referenciaDe(uid, fecha));
  return documento.exists() ? { id: documento.id, ...documento.data() } : null;
}

// El cupo NO se cuenta sobre los documentos guardados, como el resto de cupos
// del proyecto: aquí solo hay un documento por día y se sobrescribe, así que
// contarlos daría siempre 1. Se cuenta con el campo "veces" de ese documento.
export function quedanAnalisisHoy(analisis) {
  const gastados = analisis ? analisis.veces || 0 : 0;
  return Math.max(0, ANALISIS_POR_DIA - gastados);
}

// Un análisis está viejo si has apuntado comidas después de hacerlo. Se
// cuentan las comidas, no su contenido: editar una ya analizada no dispara el
// aviso, y es una imprecisión aceptada.
// El nombre del campo guardado se queda en `comidasAnalizadas` para no migrar
// los análisis que ya existen, pero desde la spec 070 cuenta también las
// bebidas: si el análisis las tiene en cuenta, apuntar una caña tiene que
// envejecerlo igual que apuntar una comida.
//
// Un análisis guardado antes de la 070 tiene ahí solo las comidas, así que la
// primera bebida del día lo dará por viejo. Es el comportamiento correcto: ese
// análisis, en efecto, no la vio.
export function estaViejo(analisis, registrosDeHoy) {
  if (!analisis) return false;
  return registrosDeHoy > (analisis.comidasAnalizadas || 0);
}

export function guardarAnalisis(uid, fecha, datos, comidasAnalizadas, vecesPrevias) {
  return setDoc(referenciaDe(uid, fecha), {
    fecha,
    grupos: datos.grupos,
    caloriasMin: datos.caloriasMin,
    caloriasMax: datos.caloriasMax,
    comentario: datos.comentario,
    comidasAnalizadas,
    veces: (vecesPrevias || 0) + 1,
    // creadoEn no se toca al rehacer, pero como el documento se sustituye
    // entero hay que volver a escribirlo: es la fecha del primer análisis solo
    // si se conserva, así que se escribe siempre y editadoEn es la que manda.
    creadoEn: serverTimestamp(),
    editadoEn: serverTimestamp()
  });
}

// `bebidas` es opcional (spec 070): si no viene, el proxy se comporta como
// antes y el análisis solo mira lo que has comido.
export async function pedirAnalisisALaIa(uid, comidas, proveedor, bebidas = []) {
  const idToken = await auth.currentUser.getIdToken();

  let respuesta;
  try {
    respuesta = await fetch(URL_ANALISIS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({ comidas, bebidas, proveedor }),
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
