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
import { hoyISO, sumarDias } from "./fechas.js";
import { listarPesajes } from "./pesajes.js";
import { listarComidas } from "./comidas.js";
import { listarEjercicios } from "./ejercicios.js";
import { leerAjustes, guardarLoAveriguado } from "./ajustes.js";
import { listarOperaciones, crearOperacion } from "./operaciones.js";

const DIAS_DE_HISTORIAL = 14;
// Cada cuánto se espera pasar consulta. No bloquea nada: solo decide si la
// pantalla dice "aún es pronto" (spec 045).
export const DIAS_ENTRE_REVISIONES = 7;
// Tope del periodo que ve la IA en una revisión. Los registros viajan como
// texto dentro del prompt: sin tope, cuatro meses sin consulta harían una
// petición enorme, con más cuota, más latencia y riesgo de respuesta truncada.
const MAXIMO_DIAS_DE_REVISION = 30;
const MAXIMO_CONSULTAS_DIARIAS = 2;
export const MAXIMO_CARACTERES_RESPUESTA = 1000;
// Justo por debajo de los 60 s que tiene la función en Vercel: así, cuando
// algo va mal, llega SU mensaje de error en vez de un corte del navegador que
// no distingue "la IA está saturada" de "no hay internet".
const ESPERA_MAXIMA_MS = 55000;

const URL_PROXY = "/api/consulta";

const MENSAJES = {
  "dieta-vacia":
    "La IA ha respondido, pero la semana venía vacía. Vuelve a intentarlo.",
  "tabla-vacia":
    "La IA ha respondido, pero la semana venía vacía. Vuelve a intentarlo.",
  "analisis-ilegible":
    "La IA ha respondido, pero sin unas calorías que se puedan leer. Vuelve a intentarlo.",
  "sin-comidas": "No has apuntado nada hoy todavía.",
  "limite-planes":
    "Ya has pedido tus 2 de hoy. Vuelve mañana.",
  tardanza:
    "La IA está tardando demasiado. Espera un momento y vuelve a intentarlo.",
  "ia-saturada":
    "La IA está saturada ahora mismo. Espera un minuto y vuelve a intentarlo.",
  "limite-diario": "Ya has pasado consulta 2 veces hoy. Vuelve mañana.",
  "cuota-agotada": "La IA ha alcanzado su límite diario gratuito. Prueba mañana.",
  "respuesta-ilegible": "La IA no ha sabido responder. Inténtalo de nuevo."
};

const MENSAJE_GENERICO = "No se ha podido continuar la consulta. Inténtalo de nuevo.";

// Un fallo del proveedor que no sea de los conocidos llega con el estado HTTP
// que devolvió (spec 032: puede ser Gemini o Groq, según cuál se eligiera):
// enseñarlo es lo único que distingue "está saturado" de "algo va mal de
// verdad". El código puede traer pegado el motivo de que la reserva no
// funcionara.
function mensajeConReserva(codigo) {
  if (!codigo) return null;
  const [base, motivo] = codigo.split(" · reserva: ");
  const mensaje = MENSAJES[base];
  if (!mensaje) return null;
  return motivo ? `${mensaje} (reserva: ${motivo})` : mensaje;
}

function mensajeDeFalloDeIa(codigo) {
  if (!codigo || !codigo.startsWith("ia-")) return null;
  return `La IA no ha respondido (${codigo}). Vuelve a intentarlo en un momento.`;
}

export function mensajeDeErrorDeConsulta(codigo) {
  return mensajeConReserva(codigo) || mensajeDeFalloDeIa(codigo) || MENSAJE_GENERICO;
}

function consultasDe(uid) {
  return collection(db, "usuarios", uid, "consultas");
}

function planesDe(uid) {
  return collection(db, "usuarios", uid, "planes");
}

function enISO(fecha) {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function desdeCuando() {
  const limite = new Date();
  limite.setDate(limite.getDate() - (DIAS_DE_HISTORIAL - 1));
  return enISO(limite);
}

// El "desde" solo lo usa la revisión (modo normal, spec 045). La entrevista de
// bienvenida y la conversación siguen con la ventana fija de 14 días.
async function recogerRegistros(uid, desde) {
  const limite = desde || desdeCuando();
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

// Las revisiones son las consultas "de verdad": ni la conversación, que es un
// hilo aparte, ni la entrevista de bienvenida, que no repasa nada porque no hay
// nada anterior que repasar. Los dos modos de bienvenida son los mismos que
// js/gamificacion.js excluye para el emblema "Primera consulta".
export function esRevision(consulta) {
  return (
    consulta.modo !== "conversacion" &&
    consulta.modo !== "inicial" &&
    consulta.modo !== "reinicio"
  );
}

// La última revisión terminada, o null si aún no hay ninguna en esta operación.
// Las de operaciones anteriores no están: archivar() las mueve fuera al cerrar.
export function ultimaRevision(consultas) {
  const terminadas = consultas.filter(
    (consulta) => consulta.estado === "terminada" && esRevision(consulta)
  );

  let ultima = null;
  terminadas.forEach((consulta) => {
    // terminadaEn puede faltar en documentos viejos: se cae a creadaEn.
    const marca = consulta.terminadaEn || consulta.creadaEn;
    if (!marca) return;
    const actual = ultima && (ultima.terminadaEn || ultima.creadaEn);
    if (!actual || marca.toMillis() > actual.toMillis()) ultima = consulta;
  });

  return ultima;
}

// Días naturales transcurridos desde una marca de Firestore. 0 = hoy mismo.
export function diasDesde(marca) {
  if (!marca) return null;
  const desde = marca.toDate();
  desde.setHours(0, 0, 0, 0);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((hoy - desde) / 86400000);
}

// Las consultas abandonadas también cuentan: si no, se podría reiniciar sin fin.
//
// La conversación NO cuenta: es un solo hilo que dura toda la operación y
// tiene su propio cupo de mensajes (spec 023). Si contara, el primer mensaje
// del día se comería una de las dos plazas de la entrevista y los planes.
export function empezadasHoy(consultas) {
  const hoy = hoyISO();
  return consultas.filter((consulta) => {
    if (consulta.modo === "conversacion") return false;
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
  } catch (fallo) {
    // Quedarse sin tiempo y no tener internet no son lo mismo, y el consejo
    // que hay que darle al usuario tampoco.
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
      // Gemini manda además el estado HTTP con el que respondió Google: sin
      // eso, un fallo suyo es indistinguible de un problema de red.
      if (datos.estado) codigo = `${datos.error}-${datos.estado}`;
      // Con dos proveedores elegibles (spec 032), un "cuota-agotada" ya no
      // dice por sí solo si fue Gemini o Groq.
      if (datos.proveedor) codigo = `${codigo} (${datos.proveedor})`;
      // Por qué la reserva no salvó la petición (spec 020). Sin esto, "la IA
      // está saturada" no distingue que falte la clave de Groq de que Groq
      // también haya fallado.
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

// La entrevista de bienvenida abre cada operación (spec 018): la primera vez
// pregunta de todo, y a partir de la segunda solo lo que cambia.
export function modoDeBienvenida(operaciones) {
  return operaciones.length === 0 ? "inicial" : "reinicio";
}

// Lo que la IA ya sabe de esta persona, para no volver a preguntarlo.
async function contextoDelUsuario(uid) {
  try {
    const ajustes = await leerAjustes(uid);
    return {
      nombre: ajustes.nombre || "",
      perfil: ajustes.perfil || "",
      proveedor: ajustes.proveedorIa || "automatico"
    };
  } catch {
    // Sin contexto la consulta funciona igual, solo que más genérica.
    return {};
  }
}

// Crea la consulta con la primera pregunta ya dentro.
// Desde cuándo mira la IA en una revisión: desde la última consulta, o desde
// que empezó la operación si aún no ha habido ninguna. Con tope de 30 días.
function periodoDeRevision(consultas, operacionActiva) {
  const tope = sumarDias(hoyISO(), -(MAXIMO_DIAS_DE_REVISION - 1));
  const ultima = ultimaRevision(consultas);

  let desde;
  if (ultima) {
    const marca = ultima.terminadaEn || ultima.creadaEn;
    desde = marca ? enISO(marca.toDate()) : null;
  } else if (operacionActiva) {
    desde = operacionActiva.inicio || null;
  }

  if (!desde) return tope;
  // El tope manda: un periodo más largo haría crecer el prompt sin límite.
  return desde < tope ? tope : desde;
}

export async function empezarConsulta(uid, consultas) {
  if (!quedanConsultasHoy(consultas)) {
    throw errorConCodigo("limite-diario", "Límite diario de consultas alcanzado");
  }

  const [contexto, operaciones] = await Promise.all([
    contextoDelUsuario(uid),
    listarOperaciones(uid)
  ]);

  // Sin operación activa, esta consulta es la entrevista que abre una nueva.
  const activa = operaciones.find((operacion) => operacion.estado === "activa");
  const modo = activa ? "normal" : modoDeBienvenida(operaciones);

  // Una revisión mira lo hecho desde la consulta anterior, no una ventana fija
  // (spec 045). La entrevista de bienvenida no: no hay nada anterior.
  const desde = modo === "normal" ? periodoDeRevision(consultas, activa) : null;
  const registros = await recogerRegistros(uid, desde);

  const respuesta = await turnoDeIa([], registros, { ...contexto, modo, desde });

  if (respuesta.tipo !== "pregunta") {
    throw errorConCodigo("respuesta-ilegible", "La IA no empezó con una pregunta");
  }

  await addDoc(consultasDe(uid), {
    estado: "en-curso",
    modo,
    // Se guarda para que los turnos siguientes usen el mismo periodo.
    desde: desde || null,
    mensajes: [{ de: "ia", texto: respuesta.pregunta }],
    creadaEn: serverTimestamp(),
    terminadaEn: null
  });
}

// Añade la respuesta del usuario y el siguiente turno de la IA. Si la IA cierra
// la consulta, el cierre se guarda como último mensaje del hilo (spec 044).
export async function responder(uid, consulta, texto) {
  // El mismo periodo con el que se empezó, para que la IA no vea una ventana
  // distinta a mitad de conversación (spec 045).
  const desde = consulta.desde || null;
  const [registros, contexto] = await Promise.all([
    recogerRegistros(uid, desde),
    contextoDelUsuario(uid)
  ]);
  const mensajes = [...consulta.mensajes, { de: "usuario", texto }];

  const respuesta = await turnoDeIa(mensajes, registros, {
    ...contexto,
    modo: consulta.modo || "normal",
    desde
  });
  const referencia = doc(db, "usuarios", uid, "consultas", consulta.id);

  if (respuesta.tipo === "cierre") {
    // El cierre se guarda como un mensaje más de la IA (spec 044): es lo último
    // que te dice al despedirte, y su sitio es el final de la conversación. Ya
    // no se crea ningún documento en "planes".
    await updateDoc(referencia, {
      mensajes: [...mensajes, { de: "ia", texto: respuesta.cierre }],
      estado: "terminada",
      terminadaEn: serverTimestamp(),
      // Instrucciones para pedir una semana nueva, si la IA lo ha propuesto
      // (spec 046). Vacío = sin propuesta. En el documento llevan nombre
      // propio: los "nutricion"/"ejercicio" del esquema de la IA ya engañaron
      // una vez y no hay razón para arrastrarlos hasta aquí.
      propuestaDieta: respuesta.nutricion || "",
      propuestaTabla: respuesta.ejercicio || ""
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

// --- Dietas y tablas de ejercicio (specs 017 y 027) ----------------------
//
// Siempre la semana entera, de lunes a domingo, y con lo que el usuario quiera
// pedir a mano. Cada tipo tiene su propio cupo diario: que una dieta gastara
// una de las consultas de la entrevista no tenía ningún sentido.

export const PLANES_POR_DIA = 2;

export const TIPOS_ESPECIALIZADOS = {
  dieta: { etiqueta: "Dieta detallada", plural: "dietas" },
  ejercicio: { etiqueta: "Tabla de ejercicio", plural: "tablas" }
};

// El cupo se cuenta sobre los planes guardados, no sobre las consultas: es el
// dato que dice la verdad, porque un plan que falló no llegó a guardarse.
export function pedidosHoy(planes, tipo) {
  const hoy = hoyISO();
  return planes.filter((plan) => {
    if (plan.tipo !== tipo) return false;
    if (!plan.creadoEn || !plan.creadoEn.toDate) return false;
    const fecha = plan.creadoEn.toDate();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");
    return `${fecha.getFullYear()}-${mes}-${dia}` === hoy;
  }).length;
}

export function quedanPlanesHoy(planes, tipo) {
  return Math.max(0, PLANES_POR_DIA - pedidosHoy(planes, tipo));
}

// La dieta (spec 028) y la tabla (spec 029) se guardan por su cuenta, pero el
// cupo se cuenta sobre los planes: dejan aquí su marca para que cuente igual.
//
// El campo se llamaba esDietaSemanal hasta la spec 029, cuando la tabla pasó a
// dejar la misma marca. Las marcas ya guardadas conservan el nombre viejo;
// migrarlas no aportaba nada, y desde la spec 044 ya no las pinta nadie.
export function guardarMarcaDePlan(uid, tipo, instrucciones) {
  return addDoc(planesDe(uid), {
    nutricion: "",
    ejercicio: "",
    tipo,
    instrucciones: instrucciones || "",
    esPlanSemanal: true,
    creadoEn: serverTimestamp()
  });
}

