// Petición de consejo al proxy de IA, y guardado/listado en Firestore.

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db, auth } from "./firebase-config.js";
import { hoyISO } from "./fechas.js";
import { listarPesajes } from "./pesajes.js";
import { listarComidas } from "./comidas.js";
import { listarEjercicios } from "./ejercicios.js";
import { leerAjustes } from "./ajustes.js";

const DIAS_DE_HISTORIAL = 14;
const MAXIMO_POR_DIA = 5;
// Justo por debajo de los 60 s que tiene la función en Vercel: así, cuando
// algo va mal, llega SU mensaje de error en vez de un corte del navegador que
// no distingue "la IA está saturada" de "no hay internet".
const ESPERA_MAXIMA_MS = 55000;

// La web y la función se sirven desde el mismo dominio, así que basta la ruta.
const URL_PROXY = "/api/consejo";

const MENSAJES = {
  tardanza:
    "La IA está tardando demasiado. Espera un momento y vuelve a intentarlo.",
  "ia-saturada":
    "La IA está saturada ahora mismo. Espera un minuto y vuelve a intentarlo.",
  "sin-datos": "Apunta al menos un pesaje, una comida o un ejercicio antes de pedir consejo.",
  "limite-diario": "Ya has pedido consejos 5 veces hoy. Vuelve mañana.",
  "cuota-agotada": "La IA ha alcanzado su límite diario gratuito. Prueba mañana.",
  "respuesta-ilegible": "La IA no ha sabido responder. Inténtalo de nuevo."
};

const MENSAJE_GENERICO = "No se ha podido pedir el consejo. Inténtalo de nuevo.";

// Un fallo de Gemini que no sea de los conocidos llega con el estado HTTP que
// devolvió Google: enseñarlo es lo único que distingue "está saturado" de
// "algo va mal de verdad".
// El código puede traer pegado el motivo de que la reserva no funcionara.
function mensajeConReserva(codigo) {
  if (!codigo) return null;
  const [base, motivo] = codigo.split(" · reserva: ");
  const mensaje = MENSAJES[base];
  if (!mensaje) return null;
  return motivo ? `${mensaje} (reserva: ${motivo})` : mensaje;
}

function mensajeDeFalloDeIa(codigo) {
  if (!codigo || !codigo.startsWith("gemini")) return null;
  return `La IA no ha respondido (${codigo}). Vuelve a intentarlo en un momento.`;
}

export function mensajeDeErrorDeConsejo(codigo) {
  return mensajeConReserva(codigo) || mensajeDeFalloDeIa(codigo) || MENSAJE_GENERICO;
}

function coleccionDe(uid) {
  return collection(db, "usuarios", uid, "consejos");
}

// Fecha de hace 14 días (hoy incluido) en formato AAAA-MM-DD.
function desdeCuando() {
  const limite = new Date();
  limite.setDate(limite.getDate() - (DIAS_DE_HISTORIAL - 1));
  const mes = String(limite.getMonth() + 1).padStart(2, "0");
  const dia = String(limite.getDate()).padStart(2, "0");
  return `${limite.getFullYear()}-${mes}-${dia}`;
}

export async function listarConsejos(uid) {
  const consulta = query(coleccionDe(uid), orderBy("creadoEn", "desc"));
  const instantanea = await getDocs(consulta);

  return instantanea.docs.map((documento) => ({
    id: documento.id,
    ...documento.data()
  }));
}

// Cuenta los consejos de hoy sobre la lista ya cargada, para no gastar lecturas.
// Un consejo recién creado puede tener creadoEn null un instante: cuenta como de hoy.
function pedidosHoy(consejos) {
  const hoy = hoyISO();
  return consejos.filter((consejo) => {
    if (!consejo.creadoEn) return true;
    const fecha = consejo.creadoEn.toDate();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${fecha.getFullYear()}-${mes}-${dia}` === hoy;
  }).length;
}

async function recogerRegistros(uid) {
  const limite = desdeCuando();
  const recientes = (registros) => registros.filter((r) => r.fecha >= limite);

  const [pesajes, comidas, ejercicios] = await Promise.all([
    listarPesajes(uid),
    listarComidas(uid),
    listarEjercicios(uid)
  ]);

  return {
    pesajes: recientes(pesajes).map(({ fecha, pesoKg }) => ({ fecha, pesoKg })),
    comidas: recientes(comidas).map(({ fecha, momento, texto }) => ({ fecha, momento, texto })),
    ejercicios: recientes(ejercicios).map(({ fecha, texto, minutos, intensidad }) => ({
      fecha,
      texto,
      minutos,
      intensidad
    }))
  };
}

// Pide el consejo y lo guarda. Lanza un Error con .codigo si algo falla,
// para que la pantalla elija el mensaje.
export async function pedirConsejo(uid, consejosActuales) {
  if (pedidosHoy(consejosActuales) >= MAXIMO_POR_DIA) {
    const error = new Error("Límite diario alcanzado");
    error.codigo = "limite-diario";
    throw error;
  }

  const registros = await recogerRegistros(uid);
  if (!registros.pesajes.length && !registros.comidas.length && !registros.ejercicios.length) {
    const error = new Error("Sin datos");
    error.codigo = "sin-datos";
    throw error;
  }

  // Lo que la IA sabe de esta persona (spec 016): con esto el consejo deja de
  // ser genérico. Si no se puede leer, se pide igual, solo que sin contexto.
  const ajustes = await leerAjustes(uid).catch(() => ({}));

  const idToken = await auth.currentUser.getIdToken();

  // El navegador corta antes que la función (60 s), así que un corte siempre
  // se ve como error limpio aquí y no como una petición colgada.
  const cancelar = AbortSignal.timeout(ESPERA_MAXIMA_MS);

  let respuesta;
  try {
    respuesta = await fetch(URL_PROXY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({
        registros,
        nombre: ajustes.nombre || "",
        perfil: ajustes.perfil || ""
      }),
      signal: cancelar
    });
  } catch (fallo) {
    // Quedarse sin tiempo y no tener internet no son lo mismo, y el consejo
    // que hay que darle al usuario tampoco.
    const error = new Error("Proxy inalcanzable");
    error.codigo = fallo.name === "TimeoutError" ? "tardanza" : "red";
    throw error;
  }

  if (!respuesta.ok) {
    let codigo = "red";
    try {
      const datos = await respuesta.json();
      if (datos.error) codigo = datos.error;
      // Gemini manda además el estado HTTP con el que respondió Google: sin
      // eso, un fallo suyo es indistinguible de un problema de red.
      if (datos.estado) codigo = `${datos.error}-${datos.estado}`;
      // Por qué la reserva no salvó la petición (spec 020). Sin esto, "la IA
      // está saturada" no distingue que falte la clave de Groq de que Groq
      // también haya fallado.
      if (datos.reserva && datos.reserva !== "no-hacia-falta") {
        codigo = `${codigo} · reserva: ${datos.reserva}`;
      }
    } catch {
      // Respuesta sin JSON: nos quedamos con el mensaje genérico.
    }
    const error = new Error(`El proxy respondió ${respuesta.status}`);
    error.codigo = codigo;
    throw error;
  }

  const consejo = await respuesta.json();

  await addDoc(coleccionDe(uid), {
    queVeo: consejo.queVeo,
    queHacer: consejo.queHacer,
    ojoCon: consejo.ojoCon,
    creadoEn: serverTimestamp()
  });
}
