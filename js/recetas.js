// El recetario, COMPARTIDO entre todo el grupo (spec 104, v18).
//
// Vive en recetas/, top-level y fuera de usuarios/{uid}: es la única
// excepción a "datos separados por uid" del proyecto (ver docs/PRODUCTO.md,
// apartado "Para quién"). Antes vivía en usuarios/{uid}/recetas (spec 026);
// esa colección se retiró con la migración de la 104. Sigue fuera de las
// operaciones por el mismo motivo de siempre: una receta es conocimiento
// acumulado, no el diario de una etapa.
//
// Cada receta lleva `autorUid` (+ `autorNombre`, para no resolver el uid al
// pintar la lista). Solo el autor o el admin fijo (EMAIL_ADMIN en
// firebase-config.js) puede editar o borrar — lo hace cumplir
// firestore.rules; aquí solo se decide qué botones se enseñan.

import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db, auth, esAdmin } from "./firebase-config.js";
import { MAX_NOMBRE as MAX_NOMBRE_INGREDIENTE } from "./despensa.js";

const ESPERA_MAXIMA_MS = 55000;
const URL_RECETA_DESDE_TEXTO = "/api/receta-desde-texto";

// `docs/menus/recetas-transcritas.json` (y por tanto `js/datos-iniciales.js`,
// spec 075) guarda `preparacion` como un ARRAY de pasos, pero toda la app
// trata `receta.preparacion` como texto plano (`.textContent =`, `.value =`
// en js/app.js). Fallo de antes de la spec 104, anotado en docs/BACKLOG.md.
// Se normaliza AQUÍ, al escribir (js/siembra.js, js/migracion-104.js), para
// no obligar a cada lector de la app a comprobar si es array o string.
export function textoDePreparacion(preparacion) {
  if (Array.isArray(preparacion)) return preparacion.filter(Boolean).join(" ");
  return String(preparacion || "");
}

function errorConCodigo(codigo, mensaje) {
  const error = new Error(mensaje);
  error.codigo = codigo;
  return error;
}

const MAX_NOMBRE = 80;
const MAX_PREPARACION = 2000;
const RACIONES_MIN = 1;
const RACIONES_MAX = 20;
export const RACIONES_POR_DEFECTO = 2;

// Categorías (spec 105): lista cerrada, para que el filtro no se ensucie
// con variantes del mismo tag. Las etiquetas que se ven en pantalla viven
// en js/app.js (CATEGORIAS_RECETA); aquí solo hace falta saber qué claves
// son válidas, para no guardar cualquier cosa.
export const CATEGORIAS_VALIDAS = ["comida", "postre", "fit", "snack", "desayuno", "otros"];

// Topes de las líneas de ingrediente estructuradas (spec 082): la cantidad y
// la preparación son texto libre corto, no hace falta el margen de la
// preparación de la receta entera (`MAX_PREPARACION`, de arriba, que es otra
// cosa — cómo se hace la receta, no el matiz de un ingrediente).
const MAX_CANTIDAD_LINEA = 40;
const MAX_PREPARACION_LINEA = 200;

function coleccion() {
  return collection(db, "recetas");
}

// ¿Puede este usuario editar/borrar esta receta? Solo decide qué botón se
// enseña: el permiso de verdad lo aplican las reglas de Firestore.
export function puedeEditar(receta, uid, email) {
  return Boolean(receta) && (receta.autorUid === uid || esAdmin(email));
}

// Las líneas de ingredientes llegan en dos formas (spec 082):
// - un `string` de texto libre, un ingrediente por línea — el que sigue
//   mandando `guardarRecetasPropuestas()` (js/dietas.js) con las recetas que
//   propone la IA, que no conoce los `id` de la despensa del usuario;
// - un `Array` de líneas YA enlazadas a un ingrediente real de la despensa
//   — el que manda el editor del Recetario.
// Se distingue por el tipo de lo que llega, y se devuelve en la MISMA forma
// que se recibió: nunca se convierte de una a otra aquí.
function ingredientesValidados(ingredientesBruto) {
  if (Array.isArray(ingredientesBruto)) {
    if (ingredientesBruto.length === 0) {
      return { error: "Añade al menos un ingrediente." };
    }
    // TODAS las líneas tienen que estar enlazadas para poder guardar: una
    // línea a medio escribir (sin confirmar ni una sugerencia existente ni
    // "crear nuevo") no se descarta en silencio, bloquea el guardado entero
    // — igual que si fuera una línea vieja sin migrar todavía.
    if (ingredientesBruto.some((linea) => !linea || !linea.ingredienteId)) {
      return { error: "Cada línea necesita un ingrediente. Enlázalo o créalo antes de guardar." };
    }

    return {
      ingredientes: ingredientesBruto.map((linea) => ({
        ingredienteId: String(linea.ingredienteId),
        ingredienteNombre: String(linea.ingredienteNombre ?? "")
          .trim()
          .slice(0, MAX_NOMBRE_INGREDIENTE),
        cantidad: String(linea.cantidad ?? "").trim().slice(0, MAX_CANTIDAD_LINEA),
        preparacion: String(linea.preparacion ?? "").trim().slice(0, MAX_PREPARACION_LINEA)
      }))
    };
  }

  // Un ingrediente por línea. Las líneas en blanco sobran.
  const ingredientes = String(ingredientesBruto ?? "")
    .split("\n")
    .map((linea) => linea.trim())
    .filter(Boolean);

  if (ingredientes.length === 0) {
    return { error: "Escribe al menos un ingrediente." };
  }

  return { ingredientes };
}

// Devuelve { nombre, raciones, ingredientes, preparacion, categorias } o
// { error }. `categoriasBruto` es opcional: sin ella, se guarda sin
// categorías (spec 105) — pensado para los sitios que todavía no piden
// categoría (guardarRecetasPropuestas, la siembra).
export function validarReceta(
  nombreBruto,
  racionesBruto,
  ingredientesBruto,
  preparacionBruto,
  categoriasBruto = []
) {
  const nombre = String(nombreBruto ?? "").trim();
  if (nombre === "") {
    return { error: "Ponle nombre a la receta." };
  }

  const racionesLimpio = String(racionesBruto ?? "").trim();
  let raciones = RACIONES_POR_DEFECTO;
  if (racionesLimpio !== "") {
    raciones = Number(racionesLimpio);
    if (
      !Number.isInteger(raciones) ||
      raciones < RACIONES_MIN ||
      raciones > RACIONES_MAX
    ) {
      return { error: `Las raciones deben estar entre ${RACIONES_MIN} y ${RACIONES_MAX}.` };
    }
  }

  const resultadoIngredientes = ingredientesValidados(ingredientesBruto);
  if (resultadoIngredientes.error) {
    return { error: resultadoIngredientes.error };
  }

  // Solo las claves de la lista cerrada: cualquier otra cosa que llegue
  // (un valor viejo, un experimento) se descarta en silencio en vez de
  // ensuciar el filtro.
  const categorias = (Array.isArray(categoriasBruto) ? categoriasBruto : []).filter((clave) =>
    CATEGORIAS_VALIDAS.includes(clave)
  );

  return {
    nombre: nombre.slice(0, MAX_NOMBRE),
    raciones,
    ingredientes: resultadoIngredientes.ingredientes,
    preparacion: String(preparacionBruto ?? "").trim().slice(0, MAX_PREPARACION),
    categorias
  };
}

// `autorUid`/`autorNombre` van SIEMPRE al crear: la receta nace de alguien.
// La siembra (js/siembra.js) es la única que pasa autorUid: "sistema".
export function guardarReceta(uid, autorNombre, receta) {
  return addDoc(coleccion(), {
    ...receta,
    autorUid: uid,
    autorNombre,
    creadoEn: serverTimestamp()
  });
}

// `uid` es quien pide la edición (para que las reglas de Firestore puedan
// comprobar el permiso), no cambia el autor original de la receta.
export function actualizarReceta(uid, recetaId, receta) {
  return updateDoc(doc(db, "recetas", recetaId), {
    ...receta,
    editadoEn: serverTimestamp()
  });
}

// Por nombre: un recetario se busca con los ojos, y alfabético es como se
// encuentra. El orden de creación no le importa a nadie. Ya no recibe `uid`:
// el recetario es el mismo para todo el grupo.
export async function listarRecetas() {
  const consulta = query(coleccion(), orderBy("nombre"));
  const instantanea = await getDocs(consulta);

  return instantanea.docs.map((documento) => ({
    id: documento.id,
    ...documento.data()
  }));
}

export function borrarReceta(recetaId) {
  return deleteDoc(doc(db, "recetas", recetaId));
}

// Pega el texto de una receta y la IA la divide en nombre, raciones,
// ingredientes (uno por línea, texto libre — se validan y enlazan con
// validarReceta()/el editor, igual que una receta escrita a mano) y
// preparación (spec 104). No consume el cupo diario de 20 mensajes de la
// conversación: es una acción de utilidad aparte, como pedir la dieta.
export async function dividirRecetaConIa(texto) {
  const idToken = await auth.currentUser.getIdToken();

  let respuesta;
  try {
    respuesta = await fetch(URL_RECETA_DESDE_TEXTO, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({ texto }),
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
      if (datos.proveedor) codigo = `${codigo} (${datos.proveedor})`;
    } catch {
      // Respuesta sin JSON: nos quedamos con el mensaje genérico.
    }
    throw errorConCodigo(codigo, `El proxy respondió ${respuesta.status}`);
  }

  return respuesta.json();
}
