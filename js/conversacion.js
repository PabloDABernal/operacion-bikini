// La conversación con el nutricionista (spec 023).
//
// Una por operación, siempre abierta: no se empieza ni se termina. Vive en la
// misma colección que la entrevista de bienvenida, distinguida por su modo,
// para que el archivado de la spec 018 se la lleve sin saber que existe.

import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db, auth } from "./firebase-config.js";
import { hoyISO } from "./fechas.js";
// El cupo vive en consulta.js porque necesita esRevision(); aquí solo se usa
// (spec 051). La dependencia va en un solo sentido, para no crear un ciclo.
import { quedanMensajesHoy } from "./consulta.js";
import { listarPesajes } from "./pesajes.js";
import { listarComidas } from "./comidas.js";
import { listarEjercicios } from "./ejercicios.js";
import { leerAjustes } from "./ajustes.js";
import { listarConsejos } from "./consejos.js";

const DIAS_DE_HISTORIAL = 14;
export const MAXIMO_CARACTERES = 1000;
const ESPERA_MAXIMA_MS = 55000;

const URL_PROXY = "/api/consulta";

function consultasDe(uid) {
  return collection(db, "usuarios", uid, "consultas");
}

function errorConCodigo(codigo, mensaje) {
  const error = new Error(mensaje);
  error.codigo = codigo;
  return error;
}

// De todos los hilos, el de la conversación abierta. Puede no existir todavía:
// se crea con el primer mensaje.
export function hiloDeConversacion(consultas) {
  return consultas.find((consulta) => consulta.modo === "conversacion") || null;
}

// Los consejos guardan cuándo se pidieron como marca de tiempo del servidor,
// no como texto: hay que traducirla para poder ordenarlos con los mensajes.
function fechaDeConsejo(consejo) {
  if (!consejo.creadoEn || !consejo.creadoEn.toDate) return "";
  const fecha = consejo.creadoEn.toDate();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

// Los mensajes de una revisión no llevan fecha propia: solo los de la
// conversación la llevan, desde la spec 023. Heredan la de su consulta, que es
// lo que permite intercalarlas en el hilo (spec 050).
function fechaDeConsulta(consulta) {
  const marca = consulta.terminadaEn || consulta.creadaEn;
  return marca && marca.toDate ? fechaDeConsejo({ creadoEn: marca }) : "";
}

// El hilo que se pinta, todo junto y por fecha (spec 050): la conversación, los
// consejos de antes de la spec 023 y las revisiones. No se migra ni se copia
// nada; solo se muestran juntos.
//
// El orden de concatenación decide los empates dentro de un mismo día, porque
// el sort es estable: consejos (lo más viejo), revisiones, y la conversación.
export function hiloCompleto(hilo, consejos, revisiones = []) {
  const deConsejos = consejos.map((consejo) => ({
    de: "ia",
    // Los tres bloques del consejo, seguidos: en una conversación no pintan
    // tres apartados con sus títulos.
    texto: [consejo.queVeo, consejo.queHacer, consejo.ojoCon]
      .filter(Boolean)
      .join("\n\n"),
    fecha: fechaDeConsejo(consejo),
    esConsejoAntiguo: true
  }));

  const deLasRevisiones = revisiones.flatMap((revision) => {
    const fecha = fechaDeConsulta(revision);
    return (revision.mensajes || []).map((mensaje, indice) => ({
      ...mensaje,
      fecha,
      // Solo el primero: es donde va el separador que marca dónde empezó. El
      // modo viaja con él (spec 052) para que el separador distinga una
      // revisión de la entrevista que abre o reabre la operación.
      empiezaRevision: indice === 0 ? { fecha, modo: revision.modo } : undefined
    }));
  });

  const deLaConversacion = hilo ? hilo.mensajes : [];

  // Los que no tienen fecha van primero: son los más viejos.
  return [...deConsejos, ...deLasRevisiones, ...deLaConversacion].sort((a, b) =>
    (a.fecha || "") < (b.fecha || "") ? -1 : (a.fecha || "") > (b.fecha || "") ? 1 : 0
  );
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
    comidas: recientes(comidas).map(({ fecha, momento, texto }) => ({
      fecha,
      momento,
      texto
    })),
    ejercicios: recientes(ejercicios).map(({ fecha, texto, minutos, intensidad }) => ({
      fecha,
      texto,
      minutos,
      intensidad
    }))
  };
}

// Manda el hilo entero y devuelve lo que responda la IA.
async function turnoDeIa(mensajes, registros, contexto) {
  const idToken = await auth.currentUser.getIdToken();

  let respuesta;
  try {
    respuesta = await fetch(URL_PROXY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({
        mensajes: mensajes.map(({ de, texto }) => ({ de, texto })),
        registros,
        modo: "conversacion",
        ...contexto
      }),
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

// Añade tu mensaje, pide respuesta y guarda las dos cosas. Si la IA falla, no
// se escribe nada: el mensaje se queda en el campo para reintentar.
export async function enviarMensaje(uid, consultas, hilo, texto) {
  // El cupo ya no se puede calcular solo con el hilo: desde la spec 051 cuenta
  // también las revisiones, que viven en otros documentos.
  if (quedanMensajesHoy(consultas) === 0) {
    throw errorConCodigo("cupo-diario", "Cupo diario de mensajes agotado");
  }

  const [registros, ajustes] = await Promise.all([
    recogerRegistros(uid),
    leerAjustes(uid).catch(() => ({}))
  ]);

  const mio = { de: "usuario", texto, fecha: hoyISO() };
  const mensajes = [...(hilo ? hilo.mensajes : []), mio];

  const respuesta = await turnoDeIa(mensajes, registros, {
    nombre: ajustes.nombre || "",
    perfil: ajustes.perfil || "",
    proveedor: ajustes.proveedorIa || "automatico"
  });

  if (!respuesta.pregunta) {
    throw errorConCodigo("respuesta-ilegible", "La IA no ha dicho nada");
  }

  const suyo = { de: "ia", texto: respuesta.pregunta, fecha: hoyISO() };

  if (hilo) {
    await updateDoc(doc(db, "usuarios", uid, "consultas", hilo.id), {
      mensajes: [...mensajes, suyo]
    });
    return;
  }

  // Primer mensaje de la operación: aquí nace el hilo.
  await addDoc(consultasDe(uid), {
    estado: "en-curso",
    modo: "conversacion",
    mensajes: [...mensajes, suyo],
    creadaEn: serverTimestamp(),
    terminadaEn: null
  });
}

// Sin los consejos antiguos la conversación funciona igual, así que un fallo
// al leerlos no debe dejar la pantalla en blanco.
export function consejosAntiguos(uid) {
  return listarConsejos(uid).catch(() => []);
}
