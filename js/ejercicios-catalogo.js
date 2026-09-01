// El catálogo de ejercicios del usuario (spec 029).
//
// Vive en usuarios/{uid}/ejerciciosCatalogo, FUERA de las operaciones: saber
// cómo se hace una sentadilla es conocimiento acumulado, no el diario de una
// etapa. Misma razón que el recetario de la spec 026.
//
// OJO con el nombre: la colección "ejercicios" (js/ejercicios.js) son los
// registros de actividad hecha, el diario. Esto es el catálogo, el plan.
// Mezclarlas borraría el diario al vaciar el catálogo.

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
// partesDeLinea() ya parte un texto en piezas por comas y por "y"/"e"
// (spec 059, corrección del "sal y pimienta"): se reutiliza tal cual en
// vez de escribir otra función igual (spec 077).
import { partesDeLinea } from "./despensa.js";

const MAX_NOMBRE = 80;
const MAX_COMO_SE_HACE = 1000;
const MAX_MATERIAL = 200;

function coleccionDe(uid) {
  return collection(db, "usuarios", uid, "ejerciciosCatalogo");
}

// El material de un ejercicio, ya en piezas (spec 077): antes de esta
// spec se guardaba como una frase libre; ahora es una lista. Acepta las
// dos formas de entrada —un array (de la IA, o ya normalizado al leer) o
// un string (del formulario manual, o una entrada vieja)— y siempre
// devuelve una lista limpia, recortada pieza a pieza, sin vacíos.
//
// Ojo con partesDeLinea(""): devuelve [""], no [] — es su comportamiento
// normal para una línea de receta, que siempre existe. Aquí hace falta el
// .filter(Boolean) de más para que un material vacío quede en [], no [""].
function materialEnPiezas(materialBruto) {
  const piezas = Array.isArray(materialBruto)
    ? materialBruto
    : partesDeLinea(String(materialBruto ?? ""));

  return piezas
    .map((pieza) => String(pieza ?? "").trim().slice(0, MAX_MATERIAL))
    .filter(Boolean);
}

// Devuelve { nombre, comoSeHace, material } o { error }.
export function validarEjercicioCatalogo(nombreBruto, comoSeHaceBruto, materialBruto) {
  const nombre = String(nombreBruto ?? "").trim();
  if (nombre === "") {
    return { error: "Ponle nombre al ejercicio." };
  }
  if (nombre.length > MAX_NOMBRE) {
    return { error: `Máximo ${MAX_NOMBRE} caracteres.` };
  }

  return {
    nombre,
    comoSeHace: String(comoSeHaceBruto ?? "").trim().slice(0, MAX_COMO_SE_HACE),
    material: materialEnPiezas(materialBruto)
  };
}

export function guardarEjercicioCatalogo(uid, ejercicio) {
  return addDoc(coleccionDe(uid), { ...ejercicio, creadoEn: serverTimestamp() });
}

export function actualizarEjercicioCatalogo(uid, ejercicioId, ejercicio) {
  return updateDoc(doc(db, "usuarios", uid, "ejerciciosCatalogo", ejercicioId), {
    ...ejercicio,
    editadoEn: serverTimestamp()
  });
}

// Por nombre, como el recetario: un catálogo se busca con los ojos.
export async function listarEjerciciosCatalogo(uid) {
  const consulta = query(coleccionDe(uid), orderBy("nombre"));
  const instantanea = await getDocs(consulta);

  return instantanea.docs.map((documento) => {
    const datos = documento.data();
    return {
      id: documento.id,
      ...datos,
      // Un ejercicio guardado antes de la spec 077 trae `material` como
      // string. Se normaliza al leer, sin tocar Firestore: queda en el
      // formato nuevo la próxima vez que se guarde (editado a mano, o
      // vuelto a proponer por la IA).
      material: materialEnPiezas(datos.material)
    };
  });
}

export function borrarEjercicioCatalogo(uid, ejercicioId) {
  return deleteDoc(doc(db, "usuarios", uid, "ejerciciosCatalogo", ejercicioId));
}
