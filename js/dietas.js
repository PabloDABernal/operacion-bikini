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
    comidas: MOMENTOS_DIETA.map((momento) => ({ momento, texto: "", recetaIds: [] }))
  }));
}

// Las recetas de una comida, venga guardada como venga (spec 088).
//
// Hasta la 088 una comida llevaba UN `recetaId`; desde ella lleva una lista,
// `recetaIds`. NO se migra nada en Firestore: esta función lee las dos formas y
// es el único sitio del proyecto que sabe que existen las dos. Una dieta vieja
// se pasa sola a la nueva en cuanto se guarda cualquiera de sus celdas.
//
// Campo NUEVO y no `recetaId` convertido en lista, por lo mismo que se decidió
// en la spec 077 con el material del ejercicio: un campo con dos tipos posibles
// obliga a comprobar el tipo en todos los lectores, para siempre.
export function idsDeRecetaDe(comida) {
  if (Array.isArray(comida?.recetaIds)) return comida.recetaIds.filter(Boolean);
  return comida?.recetaId ? [comida.recetaId] : [];
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
  return String(texto || "")
    .trim()
    .toLowerCase()
    // Sin tildes: los menús del papel escriben "Boquerones Asados" y la receta
    // "boquerón", y una tilde de más no puede romper un enlace.
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "")
    .replace(/\s+/g, " ");
}

// El mapa de nombre a identificador con el que se enlazan los platos de una
// semana con sus recetas.
//
// Se exporta para que elegir un menú (spec 076) pueda usar semanaDesdeLaIa()
// sin pasar por la IA: allí no se guarda ninguna receta nueva —ya están todas
// desde la 075—, solo hace falta el mapa de las que hay.
export function mapaDeRecetas(recetas) {
  return new Map((recetas || []).map((receta) => [clave(receta.nombre), receta.id]));
}

// Guarda las recetas que propone la IA, sin duplicar las que ya tienes, y
// devuelve un mapa de nombre a identificador para poder enlazarlas.
export async function guardarRecetasPropuestas(uid, propuestas, recetasActuales) {
  const porNombre = mapaDeRecetas(recetasActuales);

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
      // Por nombre EXACTO, como siempre: la IA devuelve el nombre tal cual lo
      // acaba de inventar. De ahí que aquí salga una receta o ninguna, nunca
      // varias; lo de enlazar varias es cosa de los menús del papel.
      const id = porNombre.get(clave(texto)) || "";
      return { momento, texto, recetaIds: id ? [id] : [] };
    })
  }));
}

// La semana de uno de los menús de la nutricionista (spec 076).
//
// No usa semanaDesdeLaIa() aunque lo parezca, y el motivo importa: aquella
// empareja plato y receta por nombre EXACTO, porque la IA devuelve el nombre
// tal cual lo acaba de inventar. Los menús del papel no: ahí un plato es una
// frase entera, con cantidades y a veces dos cosas —"Pudding de chía y
// mermelada sin azúcar", "125gr de arroz (hervido) con verduras. Muslo de pollo
// asado"—. Comparando por igualdad enlazaban 4 de 96.
//
// Así que aquí se busca el nombre de la receta DENTRO del texto del plato. Se
// prueban de la más larga a la más corta para que "Champiñones portobello en
// salsa de soja" gane a "Champiñones", y se ignoran los nombres muy cortos, que
// acertarían dentro de cualquier frase. Con esto enlazan unos 50 de 96; el
// resto no son recetas, son cosas como "125 gramos de kéfir con canela".
//
// Ante la duda, sin enlazar: un plato sin receta se lee igual de bien, y uno
// enlazado a la receta equivocada es una mentira en pantalla.
const MINIMO_PARA_ENLAZAR = 8;

// Todas las recetas que reconoce dentro del texto de un plato (spec 088).
//
// Antes se cogía la primera y se paraba, y por eso "Ensalada de repollo y
// manzana. Tortilla de 2 huevos" solo enseñaba la ensalada —y los huevos no
// llegaban a la lista de la compra sin que nada lo avisara.
//
// Se comparan POSICIONES REALES, no "un nombre dentro de otro": se lleva la
// cuenta de qué tramos del texto se ha llevado ya cada receta, y una candidata
// que se solape con un tramo ocupado se descarta. Así "Ensalada de repollo" no
// entra si "Ensalada de repollo y manzana" ya se llevó esas palabras, y en
// cambio dos recetas distintas que solo comparten una palabra sí entran las dos.
function recetasEnElTexto(texto, porLongitud) {
  const donde = clave(texto);
  const ocupados = [];
  const ids = [];

  const pisa = (inicio, fin) =>
    ocupados.some((tramo) => inicio < tramo.fin && fin > tramo.inicio);

  porLongitud.forEach((candidato) => {
    // Una receta entra COMO MUCHO UNA VEZ (spec 089). Desde los alias, la misma
    // receta tiene varios candidatos —su nombre y cada alias— y dos podrían
    // encajar en tramos distintos de la misma frase: la comida acabaría con la
    // receta repetida y el día pintaría dos tarjetas iguales.
    if (ids.includes(candidato.id)) return;

    // TODAS las apariciones, no solo la primera: si la primera está pisada por
    // una receta más larga, más adelante puede haber un hueco libre. Con solo
    // indexOf(), "Ensalada de repollo y manzana. Ensalada de repollo" enlazaba
    // una sola. Lo cazó la suite de casos, no la lectura de la spec.
    let desde = 0;
    for (;;) {
      const inicio = donde.indexOf(candidato.clave, desde);
      if (inicio === -1) return;

      const fin = inicio + candidato.clave.length;
      if (!pisa(inicio, fin)) {
        ocupados.push({ inicio, fin });
        ids.push(candidato.id);
        return;
      }
      // Pisada: se sigue buscando desde el siguiente carácter.
      desde = inicio + 1;
    }
  });

  return ids;
}

// Cada nombre por el que se puede reconocer una receta dentro del texto de un
// plato: el suyo, y sus alias (spec 089).
//
// Los alias existen porque una receta se llama "Tortilla de atún" y el plato
// del menú dice "Tortilla de 2 huevos con 1 lata de atún al natural". Salen de
// docs/menus/alias-recetas.json, revisado a mano, y llegan aquí en la propia
// receta del usuario.
//
// Son candidatos independientes con su propia longitud, así que un alias —que
// es más largo que el nombre— se prueba antes. Es lo que se quiere: el alias
// casa con el texto del menú y el nombre corto es lo genérico.
function candidatosDeReceta(receta) {
  return [receta.nombre, ...(receta.alias || [])]
    .map((nombre) => ({ id: receta.id, clave: clave(nombre) }))
    .filter((candidato) => candidato.clave.length >= MINIMO_PARA_ENLAZAR);
}

export function semanaDesdeMenu(dias, recetas) {
  const porLongitud = (recetas || [])
    .flatMap(candidatosDeReceta)
    .sort((uno, otro) => otro.clave.length - uno.clave.length);

  return dias.map((dia) => ({
    dia: dia.dia,
    comidas: MOMENTOS_DIETA.map((momento) => {
      const comida = dia.comidas.find((c) => c.momento === momento);
      const texto = String(comida?.texto || "").trim();
      return {
        momento,
        texto,
        recetaIds: texto ? recetasEnElTexto(texto, porLongitud) : []
      };
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
