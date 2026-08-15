// Entrevista guiada con la IA y planes resultantes.

import {
  collection,
  addDoc,
  doc,
  updateDoc,
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
import { leerAjustes, guardarLoAveriguado } from "./ajustes.js";
import { listarOperaciones, crearOperacion } from "./operaciones.js";

const DIAS_DE_HISTORIAL = 14;
const MAXIMO_CONSULTAS_DIARIAS = 2;
export const MAXIMO_CARACTERES_RESPUESTA = 1000;
const ESPERA_MAXIMA_MS = 30000;

const URL_PROXY = "/api/consulta";

const MENSAJES = {
  "ia-saturada":
    "La IA está saturada ahora mismo. Espera un minuto y vuelve a intentarlo.",
  "limite-diario": "Ya has pasado consulta 2 veces hoy. Vuelve mañana.",
  "cuota-agotada": "La IA ha alcanzado su límite diario gratuito. Prueba mañana.",
  "respuesta-ilegible": "La IA no ha sabido responder. Inténtalo de nuevo."
};

const MENSAJE_GENERICO = "No se ha podido continuar la consulta. Inténtalo de nuevo.";

// Un fallo de Gemini que no sea de los conocidos llega con el estado HTTP que
// devolvió Google: enseñarlo es lo único que distingue "está saturado" de
// "algo va mal de verdad".
function mensajeDeFalloDeIa(codigo) {
  if (!codigo || !codigo.startsWith("gemini")) return null;
  return `La IA no ha respondido (${codigo}). Vuelve a intentarlo en un momento.`;
}

export function mensajeDeErrorDeConsulta(codigo) {
  return MENSAJES[codigo] || mensajeDeFalloDeIa(codigo) || MENSAJE_GENERICO;
}

function consultasDe(uid) {
  return collection(db, "usuarios", uid, "consultas");
}

function planesDe(uid) {
  return collection(db, "usuarios", uid, "planes");
}

function desdeCuando() {
  const limite = new Date();
  limite.setDate(limite.getDate() - (DIAS_DE_HISTORIAL - 1));
  const mes = String(limite.getMonth() + 1).padStart(2, "0");
  const dia = String(limite.getDate()).padStart(2, "0");
  return `${limite.getFullYear()}-${mes}-${dia}`;
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

export async function listarConsultas(uid) {
  const consulta = query(consultasDe(uid), orderBy("creadaEn", "desc"));
  const instantanea = await getDocs(consulta);

  return instantanea.docs.map((documento) => ({
    id: documento.id,
    ...documento.data()
  }));
}

export async function listarPlanes(uid) {
  const consulta = query(planesDe(uid), orderBy("creadoEn", "desc"));
  const instantanea = await getDocs(consulta);

  return instantanea.docs.map((documento) => ({
    id: documento.id,
    ...documento.data()
  }));
}

// De todas las consultas, la que sigue abierta (si hay dos por una carrera
// entre pestañas, la más reciente gana).
export function consultaEnCurso(consultas) {
  return consultas.find((consulta) => consulta.estado === "en-curso") || null;
}

// Las consultas abandonadas también cuentan: si no, se podría reiniciar sin fin.
export function empezadasHoy(consultas) {
  const hoy = hoyISO();
  return consultas.filter((consulta) => {
    if (!consulta.creadaEn) return true;
    const fecha = consulta.creadaEn.toDate();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${fecha.getFullYear()}-${mes}-${dia}` === hoy;
  }).length;
}

export function quedanConsultasHoy(consultas) {
  return empezadasHoy(consultas) < MAXIMO_CONSULTAS_DIARIAS;
}

function errorConCodigo(codigo, mensaje) {
  const error = new Error(mensaje);
  error.codigo = codigo;
  return error;
}

// Manda el hilo al proxy y devuelve { tipo: "pregunta" | "plan", ... }.
async function turnoDeIa(mensajes, registros, extra) {
  const idToken = await auth.currentUser.getIdToken();

  let respuesta;
  try {
    respuesta = await fetch(URL_PROXY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({ mensajes, registros, ...extra }),
      signal: AbortSignal.timeout(ESPERA_MAXIMA_MS)
    });
  } catch {
    throw errorConCodigo("red", "Proxy inalcanzable");
  }

  if (!respuesta.ok) {
    let codigo = "red";
    try {
      const datos = await respuesta.json();
      if (datos.error) codigo = datos.error;
      // Gemini manda además el estado HTTP con el que respondió Google: sin
      // eso, un fallo suyo es indistinguible de un problema de red.
      if (datos.estado) codigo = `${datos.error}-${datos.estado}`;
    } catch {
      // Respuesta sin JSON: nos quedamos con el mensaje genérico.
    }
    throw errorConCodigo(codigo, `El proxy respondió ${respuesta.status}`);
  }

  return respuesta.json();
}

// La entrevista de bienvenida abre cada operación (spec 018): la primera vez
// pregunta de todo, y a partir de la segunda solo lo que cambia.
export function modoDeBienvenida(operaciones) {
  return operaciones.length === 0 ? "inicial" : "reinicio";
}

// Lo que la IA ya sabe de esta persona, para no volver a preguntarlo.
async function contextoDelUsuario(uid) {
  try {
    const ajustes = await leerAjustes(uid);
    return { nombre: ajustes.nombre || "", perfil: ajustes.perfil || "" };
  } catch {
    // Sin contexto la consulta funciona igual, solo que más genérica.
    return {};
  }
}

// Crea la consulta con la primera pregunta ya dentro.
export async function empezarConsulta(uid, consultas) {
  if (!quedanConsultasHoy(consultas)) {
    throw errorConCodigo("limite-diario", "Límite diario de consultas alcanzado");
  }

  const [registros, contexto, operaciones] = await Promise.all([
    recogerRegistros(uid),
    contextoDelUsuario(uid),
    listarOperaciones(uid)
  ]);

  // Sin operación activa, esta consulta es la entrevista que abre una nueva.
  const abriendo = !operaciones.some((operacion) => operacion.estado === "activa");
  const modo = abriendo ? modoDeBienvenida(operaciones) : "normal";

  const respuesta = await turnoDeIa([], registros, { ...contexto, modo });

  if (respuesta.tipo !== "pregunta") {
    throw errorConCodigo("respuesta-ilegible", "La IA no empezó con una pregunta");
  }

  await addDoc(consultasDe(uid), {
    estado: "en-curso",
    modo,
    mensajes: [{ de: "ia", texto: respuesta.pregunta }],
    creadaEn: serverTimestamp(),
    terminadaEn: null
  });
}

// Añade la respuesta del usuario y el siguiente turno de la IA. Si la IA
// devuelve el plan, cierra la consulta y guarda el plan.
export async function responder(uid, consulta, texto) {
  const [registros, contexto] = await Promise.all([
    recogerRegistros(uid),
    contextoDelUsuario(uid)
  ]);
  const mensajes = [...consulta.mensajes, { de: "usuario", texto }];

  const respuesta = await turnoDeIa(mensajes, registros, {
    ...contexto,
    modo: consulta.modo || "normal"
  });
  const referencia = doc(db, "usuarios", uid, "consultas", consulta.id);

  if (respuesta.tipo === "plan") {
    await updateDoc(referencia, {
      mensajes,
      estado: "terminada",
      terminadaEn: serverTimestamp()
    });

    await addDoc(planesDe(uid), {
      nutricion: respuesta.nutricion,
      ejercicio: respuesta.ejercicio,
      consultaId: consulta.id,
      creadoEn: serverTimestamp()
    });

    // La entrevista de bienvenida deja los ajustes rellenos y el perfil
    // guardado, sin que el usuario tenga que copiarlos a mano, y arranca la
    // operación: hasta aquí no había ninguna, y por eso no se podía apuntar.
    const bienvenida = consulta.modo === "inicial" || consulta.modo === "reinicio";
    if (bienvenida) {
      await guardarLoAveriguado(uid, respuesta);
      const operaciones = await listarOperaciones(uid);
      if (!operaciones.some((operacion) => operacion.estado === "activa")) {
        await crearOperacion(uid, operaciones);
      }
    }

    return { termino: true, inicial: bienvenida };
  }

  await updateDoc(referencia, {
    mensajes: [...mensajes, { de: "ia", texto: respuesta.pregunta }]
  });

  return { termino: false };
}

// --- Consultas especializadas (spec 017) ---------------------------------

const URL_PLAN = "/api/plan";

export const TIPOS_ESPECIALIZADOS = {
  ejercicio: {
    etiqueta: "Tabla de ejercicio",
    alcances: [
      { valor: "hoy", etiqueta: "Para hoy" },
      { valor: "semana", etiqueta: "Para la semana" }
    ]
  },
  dieta: {
    etiqueta: "Dieta detallada",
    alcances: [
      { valor: "3dias", etiqueta: "3 días" },
      { valor: "7dias", etiqueta: "7 días" }
    ]
  }
};

export function etiquetaDePlan(plan) {
  const tipo = TIPOS_ESPECIALIZADOS[plan.tipo];
  if (!tipo) return "Plan completo";

  const alcance = tipo.alcances.find((a) => a.valor === plan.alcance);
  return alcance ? `${tipo.etiqueta} · ${alcance.etiqueta}` : tipo.etiqueta;
}

// Pide algo concreto y lo guarda como un plan más. Sin conversación: una
// petición, una respuesta.
export async function pedirPlanEspecializado(uid, consultas, tipo, alcance) {
  if (!quedanConsultasHoy(consultas)) {
    throw errorConCodigo("limite-diario", "Límite diario de consultas alcanzado");
  }

  const [registros, contexto] = await Promise.all([
    recogerRegistros(uid),
    contextoDelUsuario(uid)
  ]);

  const idToken = await auth.currentUser.getIdToken();

  let respuesta;
  try {
    respuesta = await fetch(URL_PLAN, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({ tipo, alcance, registros, ...contexto }),
      signal: AbortSignal.timeout(ESPERA_MAXIMA_MS)
    });
  } catch {
    throw errorConCodigo("red", "Proxy inalcanzable");
  }

  if (!respuesta.ok) {
    let codigo = "red";
    try {
      const datos = await respuesta.json();
      if (datos.error) codigo = datos.error;
      // Gemini manda además el estado HTTP con el que respondió Google: sin
      // eso, un fallo suyo es indistinguible de un problema de red.
      if (datos.estado) codigo = `${datos.error}-${datos.estado}`;
    } catch {
      // Respuesta sin JSON: nos quedamos con el mensaje genérico.
    }
    throw errorConCodigo(codigo, `El proxy respondió ${respuesta.status}`);
  }

  const plan = await respuesta.json();

  await addDoc(planesDe(uid), {
    nutricion: plan.nutricion,
    ejercicio: plan.ejercicio,
    tipo,
    alcance,
    creadoEn: serverTimestamp()
  });

  // El cupo se apunta DESPUÉS de que la IA haya respondido bien: un fallo suyo
  // no debe costarte una de las dos consultas del día.
  await addDoc(consultasDe(uid), {
    estado: "terminada",
    modo: "especializada",
    mensajes: [],
    creadaEn: serverTimestamp(),
    terminadaEn: serverTimestamp()
  });
}

export function abandonarConsulta(uid, consultaId) {
  return updateDoc(doc(db, "usuarios", uid, "consultas", consultaId), {
    estado: "abandonada",
    terminadaEn: serverTimestamp()
  });
}
