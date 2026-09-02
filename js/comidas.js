// Alta, edición, listado y borrado de comidas.

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

import { db } from "./firebase-config.js";
import { errorDeFecha, errorDeHora, compararPorFechaYCreacion } from "./fechas.js";
import { campoHora } from "./pesajes.js";

const MAX_CARACTERES = 500;

// Los acompañamientos de una comida (spec 063): "3 trozos de pan", "un biscote".
// Van DENTRO de la comida y no como registro aparte, que es el motivo entero de
// la spec: apuntarlos al lado le dice a la IA que picaste entre horas, que es lo
// contrario de lo que pasó.
export const MAX_ACOMPANAMIENTOS = 5;
export const MAX_ACOMPANAMIENTO = 60;

// Solo para comparar duplicados. Se guarda tal y como se escribe.
function clave(texto) {
  return String(texto ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Mn}/gu, "");
}

// Devuelve { texto } o { error }. Lo usa el formulario al añadir un chip, antes
// de que la comida exista.
export function validarAcompanamiento(bruto, yaPuestos = []) {
  const texto = String(bruto ?? "").trim();

  if (texto === "") return { error: "Escribe con qué lo acompañaste." };
  if (texto.length > MAX_ACOMPANAMIENTO) {
    return { error: `Máximo ${MAX_ACOMPANAMIENTO} caracteres.` };
  }
  if (yaPuestos.length >= MAX_ACOMPANAMIENTOS) {
    return {
      error: `Como mucho ${MAX_ACOMPANAMIENTOS}. Si son más, es otra comida.`
    };
  }
  if (yaPuestos.some((puesto) => clave(puesto) === clave(texto))) {
    return { error: `"${texto}" ya está.` };
  }

  return { texto };
}

// Lo que llegue de fuera se deja utilizable: las comidas de antes de la spec 063
// no tienen el campo, y un documento tocado a mano podría traer cualquier cosa.
export function acompanamientosDe(comida) {
  if (!Array.isArray(comida?.acompanamientos)) return [];
  return comida.acompanamientos
    .map((uno) => String(uno ?? "").trim().slice(0, MAX_ACOMPANAMIENTO))
    .filter(Boolean)
    .slice(0, MAX_ACOMPANAMIENTOS);
}

// El orden importa: es el orden natural del día y el que se usa para ordenar
// la lista. Firestore ordenaría alfabéticamente (cena, comida, desayuno...),
// que no es lo que queremos, así que esto se resuelve aquí.
export const MOMENTOS = [
  { valor: "desayuno", etiqueta: "Desayuno" },
  { valor: "comida", etiqueta: "Comida" },
  { valor: "merienda", etiqueta: "Merienda" },
  { valor: "cena", etiqueta: "Cena" },
  { valor: "picoteo", etiqueta: "Picoteo" }
];

export const MOMENTO_POR_DEFECTO = "comida";

export function etiquetaDeMomento(valor) {
  const momento = MOMENTOS.find((m) => m.valor === valor);
  return momento ? momento.etiqueta : valor;
}

function ordenDeMomento(valor) {
  const indice = MOMENTOS.findIndex((m) => m.valor === valor);
  return indice === -1 ? MOMENTOS.length : indice;
}

function coleccionDe(uid) {
  return collection(db, "usuarios", uid, "comidas");
}

// Devuelve { texto, momento, fecha, ingredienteId } o { error }.
//
// `ingredienteId` (spec 084) es opcional: viene puesto cuando la comida se
// apuntó eligiendo un ingrediente de la despensa (modo "Elegir de mi
// despensa"), y vacío cuando se escribió a mano. Es un id de Firestore que
// ya viene validado por quien construye el desplegable: no hace falta
// comprobar su forma aquí.
// `recetaIds` va AL FINAL y con valor por defecto (spec 093): los llamadores de
// siempre —"lo de siempre" (013), el alta a mano, apuntar de la dieta— siguen
// llamando con los argumentos que ya pasaban y no se enteran de nada.
export function validarComida(
  textoBruto,
  momento,
  fecha,
  hora,
  acompanamientos = [],
  ingredienteId = "",
  recetaIds = []
) {
  const texto = String(textoBruto ?? "").trim();

  if (texto === "") {
    return { error: "Escribe qué has comido." };
  }
  if (texto.length > MAX_CARACTERES) {
    return { error: `Máximo ${MAX_CARACTERES} caracteres.` };
  }

  const errorFecha = errorDeFecha(fecha);
  if (errorFecha) {
    return { error: errorFecha };
  }
  const errorHora = errorDeHora(hora);
  if (errorHora) {
    return { error: errorHora };
  }

  return {
    texto,
    momento,
    fecha,
    hora: hora || "",
    acompanamientos: acompanamientosDe({ acompanamientos }),
    ingredienteId: String(ingredienteId ?? "").trim(),
    // Se llama igual que en la dieta (spec 088) a proposito: es lo mismo, y asi
    // idsDeRecetaDe() sirve para las dos sin tocarla.
    recetaIds: (Array.isArray(recetaIds) ? recetaIds : []).filter(Boolean)
  };
}

// ¿Ya está apuntada esta comida hoy? (spec 094)
//
// Mismo día, mismo momento y mismo texto. Se compara normalizado, sin tildes ni
// mayúsculas, porque el plan y lo apuntado pueden venir escritos distinto.
//
// Sirve para PREGUNTAR, no para impedir: repetir plato puede ser verdad.
export function yaApuntada(comidas, fecha, momento, texto) {
  const clave = (t) =>
    String(t || "").trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  return (comidas || []).some(
    (comida) =>
      comida.fecha === fecha &&
      comida.momento === momento &&
      clave(comida.texto) === clave(texto)
  );
}

export function guardarComida(
  uid,
  texto,
  momento,
  fecha,
  hora,
  acompanamientos = [],
  ingredienteId = "",
  recetaIds = []
) {
  const comida = { texto, momento, fecha, creadoEn: serverTimestamp() };
  if (hora) comida.hora = hora;
  // Solo si hay algo: una comida sin acompañamientos se guarda exactamente como
  // se guardaba antes de la spec 063, sin un array vacío de relleno.
  const lista = acompanamientosDe({ acompanamientos });
  if (lista.length) comida.acompanamientos = lista;
  // Igual con el enlace (spec 084): una comida escrita a mano se guarda
  // exactamente como antes, sin el campo.
  if (ingredienteId) comida.ingredienteId = ingredienteId;
  // Y lo mismo con las recetas (spec 093): una comida escrita a mano se guarda
  // byte a byte como antes, sin un array vacio de relleno.
  const recetas = (Array.isArray(recetaIds) ? recetaIds : []).filter(Boolean);
  if (recetas.length) comida.recetaIds = recetas;
  return addDoc(coleccionDe(uid), comida);
}

// creadoEn no se toca al editar: es lo que desempata el orden entre dos
// registros del mismo día y momento.
export function actualizarComida(
  uid,
  comidaId,
  texto,
  momento,
  fecha,
  hora,
  acompanamientos = []
) {
  return updateDoc(doc(db, "usuarios", uid, "comidas", comidaId), {
    texto,
    momento,
    fecha,
    hora: campoHora(hora),
    // Aquí SÍ se escribe siempre, aunque quede vacío: al editar hay que poder
    // quitarlos todos, y omitir el campo dejaría los de antes puestos.
    acompanamientos: acompanamientosDe({ acompanamientos }),
    editadoEn: serverTimestamp()
  });
}

// Firestore solo ordena por fecha (índice de un campo, sin índice compuesto);
// el momento del día y el desempate se ordenan aquí.
export async function listarComidas(uid) {
  const consulta = query(coleccionDe(uid), orderBy("fecha", "desc"));
  const instantanea = await getDocs(consulta);

  const comidas = instantanea.docs.map((documento) => ({
    id: documento.id,
    ...documento.data()
  }));

  comidas.sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha < b.fecha ? 1 : -1;
    const orden = ordenDeMomento(a.momento) - ordenDeMomento(b.momento);
    if (orden !== 0) return orden;
    return compararPorFechaYCreacion(a, b);
  });

  return comidas;
}

export function borrarComida(uid, comidaId) {
  return deleteDoc(doc(db, "usuarios", uid, "comidas", comidaId));
}
