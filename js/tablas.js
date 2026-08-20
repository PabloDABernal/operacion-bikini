// La tabla de ejercicio de la semana (spec 029).
//
// Una semana son siete días, cada uno con UNA sesión: título, minutos,
// intensidad y su lista de ejercicios. Se guarda entera en un documento.
//
// A diferencia de la dieta (spec 028), un día puede no tener sesión: eso es
// descanso, y se guarda como null. No hay etiqueta de "descanso" porque un día
// vacío ya lo dice.
//
// Vive fuera de las operaciones, como el recetario y la dieta.

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
import {
  validarEjercicioCatalogo,
  guardarEjercicioCatalogo
} from "./ejercicios-catalogo.js";

const ESPERA_MAXIMA_MS = 55000;
const URL_TABLA = "/api/tabla";

// Los mismos límites que validarEjercicio (js/ejercicios.js): "Lo he hecho"
// manda estos minutos a un registro que sí los valida, así que si aquí se
// colara un 0 o un 9000, el atajo fallaría en el último paso.
const MINUTOS_MIN = 1;
const MINUTOS_MAX = 600;

export const DIAS = [
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
  "domingo"
];

function coleccionDe(uid) {
  return collection(db, "usuarios", uid, "tablas");
}

function errorConCodigo(codigo, mensaje) {
  const error = new Error(mensaje);
  error.codigo = codigo;
  return error;
}

// Siete días sin sesión: descanso total, listo para rellenar a mano.
export function semanaEnBlanco() {
  return DIAS.map((dia) => ({ dia, sesion: null }));
}

// Devuelve { titulo, minutos, intensidad, ejercicios } o { error }.
//
// Vaciar el título borra la sesión: se devuelve { vacia: true } y quien llama
// deja el día en blanco.
export function validarSesion(tituloBruto, minutosBruto, intensidadBruta, ejerciciosBruto) {
  const titulo = String(tituloBruto ?? "").trim();
  if (titulo === "") return { vacia: true };

  const limpio = String(minutosBruto ?? "").trim().replace(",", ".");
  const minutos = Number(limpio);

  if (limpio === "" || !Number.isFinite(minutos)) {
    return { error: "Introduce los minutos." };
  }
  if (minutos < MINUTOS_MIN || minutos > MINUTOS_MAX) {
    return { error: `Los minutos deben estar entre ${MINUTOS_MIN} y ${MINUTOS_MAX}.` };
  }

  // Un ejercicio por línea, como los ingredientes de una receta. Las líneas en
  // blanco sobran. Repetir el mismo ejercicio está permitido: tres bloques de
  // sentadillas en momentos distintos son tres líneas.
  const lineas = Array.isArray(ejerciciosBruto)
    ? ejerciciosBruto
    : String(ejerciciosBruto ?? "").split("\n");

  const ejercicios = lineas
    .map((linea) =>
      typeof linea === "string"
        ? { texto: linea.trim(), ejercicioId: "" }
        : { texto: String(linea.texto || "").trim(), ejercicioId: linea.ejercicioId || "" }
    )
    .filter((ejercicio) => ejercicio.texto !== "");

  return {
    titulo,
    minutos: Math.round(minutos),
    intensidad: intensidadBruta,
    ejercicios
  };
}

// De todas las tablas guardadas, la que está en uso. Solo hay una.
export async function leerTablaActiva(uid) {
  const instantanea = await getDocs(coleccionDe(uid));
  const tablas = instantanea.docs.map((documento) => ({
    id: documento.id,
    ...documento.data()
  }));

  return tablas.find((tabla) => tabla.activa) || null;
}

export function guardarTabla(uid, dias, instrucciones) {
  return addDoc(coleccionDe(uid), {
    activa: true,
    dias,
    instrucciones: instrucciones || "",
    creadoEn: serverTimestamp()
  });
}

export function actualizarTabla(uid, tablaId, dias) {
  return updateDoc(doc(db, "usuarios", uid, "tablas", tablaId), {
    dias,
    editadoEn: serverTimestamp()
  });
}

export function borrarTabla(uid, tablaId) {
  return deleteDoc(doc(db, "usuarios", uid, "tablas", tablaId));
}

// Para comparar nombres: "Sentadillas  búlgaras" y "sentadillas búlgaras" son
// el mismo ejercicio.
function clave(texto) {
  return String(texto || "").trim().toLowerCase().replace(/\s+/g, " ");
}

// Guarda los ejercicios que propone la IA, sin duplicar los que ya tienes, y
// devuelve un mapa de nombre a identificador para poder enlazarlos.
export async function guardarEjerciciosPropuestos(uid, propuestas, catalogoActual) {
  const porNombre = new Map(
    catalogoActual.map((ejercicio) => [clave(ejercicio.nombre), ejercicio.id])
  );

  for (const propuesta of propuestas) {
    const id = clave(propuesta.nombre);
    if (!id || porNombre.has(id)) continue;

    const ejercicio = validarEjercicioCatalogo(
      propuesta.nombre,
      propuesta.comoSeHace,
      propuesta.material
    );
    // Un ejercicio mal formado de la IA no debe tirar la tabla entera: se salta.
    if (ejercicio.error) continue;

    const referencia = await guardarEjercicioCatalogo(uid, ejercicio);
    porNombre.set(id, referencia.id);
  }

  return porNombre;
}

// Convierte la semana que devuelve la IA al formato que se guarda, enlazando
// cada línea con su ejercicio del catálogo cuando el nombre coincide.
//
// La IA devuelve cada línea como "Sentadillas búlgaras 4×12": el nombre del
// ejercicio va delante, así que se busca el catálogo que empiece la línea.
export function semanaDesdeLaIa(dias, porNombre) {
  return dias.map((dia) => {
    const titulo = String(dia.titulo || "").trim();
    if (!titulo) return { dia: dia.dia, sesion: null };

    return {
      dia: dia.dia,
      sesion: {
        titulo,
        minutos: dia.minutos,
        intensidad: dia.intensidad,
        ejercicios: (dia.ejercicios || []).map((texto) => {
          const limpio = String(texto || "").trim();
          let ejercicioId = "";

          for (const [nombre, id] of porNombre) {
            if (clave(limpio).startsWith(nombre)) {
              ejercicioId = id;
              break;
            }
          }

          return { texto: limpio, ejercicioId };
        })
      }
    };
  });
}

export async function pedirTablaALaIa(uid, instrucciones, registros, contexto) {
  const idToken = await auth.currentUser.getIdToken();

  let respuesta;
  try {
    respuesta = await fetch(URL_TABLA, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      },
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
