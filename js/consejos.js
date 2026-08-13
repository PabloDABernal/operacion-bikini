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
const ESPERA_MAXIMA_MS = 30000;

// La web y la función se sirven desde el mismo dominio, así que basta la ruta.
const URL_PROXY = "/api/consejo";

const MENSAJES = {
  "sin-datos": "Apunta al menos un pesaje, una comida o un ejercicio antes de pedir consejo.",
  "limite-diario": "Ya has pedido consejos 5 veces hoy. Vuelve mañana.",
  "cuota-agotada": "La IA ha alcanzado su límite diario gratuito. Prueba mañana.",
  "respuesta-ilegible": "La IA no ha sabido responder. Inténtalo de nuevo."
};

const MENSAJE_GENERICO = "No se ha podido pedir el consejo. Inténtalo de nuevo.";

export function mensajeDeErrorDeConsejo(codigo) {
  return MENSAJES[codigo] || MENSAJE_GENERICO;
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
  } catch {
    const error = new Error("Proxy inalcanzable");
    error.codigo = "red";
    throw error;
  }

  if (!respuesta.ok) {
    let codigo = "red";
    try {
      const datos = await respuesta.json();
      if (datos.error) codigo = datos.error;
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
