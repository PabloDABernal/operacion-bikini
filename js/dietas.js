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
    comidas: MOMENTOS_DIETA.map((momento) => ({ momento, texto: "", enlaces: [] }))
  }));
}

// Una comida enlazaba como mucho una receta, en `recetaId` (spec 060). Desde
// la 088 enlaza varias recetas y/o ingredientes sueltos, en `enlaces`. Una
// dieta guardada antes de la 088 solo trae `recetaId`: se convierte al leer,
// sin tocar Firestore — es un solo documento por usuario, así que no hace
// falta script de migración. Queda en el formato nuevo la próxima vez que se
// guarde esa dieta (al editar una celda, o al regenerarla entera).
function normalizarComida(comida) {
  if (comida.enlaces) return comida;
  return {
    ...comida,
    enlaces: comida.recetaId ? [{ tipo: "receta", id: comida.recetaId }] : []
  };
}

function normalizarDieta(dieta) {
  return {
    ...dieta,
    dias: dieta.dias.map((dia) => ({
      ...dia,
      comidas: dia.comidas.map(normalizarComida)
    }))
  };
}

// De todas las dietas guardadas, la que está en uso. Solo hay una.
export async function leerDietaActiva(uid) {
  const instantanea = await getDocs(coleccionDe(uid));
  const dietas = instantanea.docs.map((documento) => ({
    id: documento.id,
    ...documento.data()
  }));

  const activa = dietas.find((dieta) => dieta.activa) || null;
  return activa ? normalizarDieta(activa) : null;
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
      const recetaId = porNombre.get(clave(texto)) || "";
      return { momento, texto, enlaces: recetaId ? [{ tipo: "receta", id: recetaId }] : [] };
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

export function semanaDesdeMenu(dias, recetas) {
  const porLongitud = (recetas || [])
    .map((receta) => ({ id: receta.id, clave: clave(receta.nombre) }))
    .filter((receta) => receta.clave.length >= MINIMO_PARA_ENLAZAR)
    .sort((uno, otro) => otro.clave.length - uno.clave.length);

  return dias.map((dia) => ({
    dia: dia.dia,
    comidas: MOMENTOS_DIETA.map((momento) => {
      const comida = dia.comidas.find((c) => c.momento === momento);
      const texto = String(comida?.texto || "").trim();
      const encontrada = texto
        ? porLongitud.find((receta) => clave(texto).includes(receta.clave))
        : null;
      return {
        momento,
        texto,
        enlaces: encontrada ? [{ tipo: "receta", id: encontrada.id }] : []
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
