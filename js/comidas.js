// Alta, listado y borrado de comidas.

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-config.js";
import { errorDeFecha, compararPorFechaYCreacion } from "./fechas.js";

const MAX_CARACTERES = 500;

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

// Devuelve { texto, momento, fecha } o { error }.
export function validarComida(textoBruto, momento, fecha) {
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

  return { texto, momento, fecha };
}

export function guardarComida(uid, texto, momento, fecha) {
  return addDoc(coleccionDe(uid), {
    texto,
    momento,
    fecha,
    creadoEn: serverTimestamp()
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
