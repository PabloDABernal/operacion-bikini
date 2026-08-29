// Lo que bebes que no es agua: café, cerveza, refresco, zumo (spec 062).
//
// Colección propia y NO un momento más de `comidas`, que era la opción barata.
// El motivo es concreto: `comidasDeHoy()` en `js/app.js` filtra las comidas del
// día solo por fecha y las manda enteras al análisis nutricional. Con las
// bebidas dentro de `comidas`, cada cerveza entraría en ese análisis — que es
// justo lo que la v9 decidió que no pasara— y habría que acordarse de
// excluirlas en cada sitio nuevo que lea comidas.
//
// Aquí quedan fuera por construcción, que es la lección que dejó la spec 061:
// lo que no puede pasar es mejor que lo que hay que cuidar que no pase.
//
// El agua no está aquí: es un contador y vive en `js/agua.js` (spec 061).

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

// Una bebida es "caña con Jose", no un relato. Más corto que una comida a
// propósito.
const MAX_CARACTERES = 200;

function coleccionDe(uid) {
  return collection(db, "usuarios", uid, "bebidas");
}

// Devuelve { texto, fecha, hora } o { error }.
//
// Sin "momento del día", al revés que una comida: una bebida no es un desayuno
// ni una cena, es algo que te tomaste a una hora.
export function validarBebida(textoBruto, fecha, hora) {
  const texto = String(textoBruto ?? "").trim();

  if (texto === "") {
    return { error: "Escribe qué has bebido." };
  }
  if (texto.length > MAX_CARACTERES) {
    return { error: `Máximo ${MAX_CARACTERES} caracteres.` };
  }

  const errorFecha = errorDeFecha(fecha);
  if (errorFecha) return { error: errorFecha };

  const errorHora = errorDeHora(hora);
  if (errorHora) return { error: errorHora };

  return { texto, fecha, hora: hora || "" };
}

export function guardarBebida(uid, texto, fecha, hora) {
  const bebida = { texto, fecha, creadoEn: serverTimestamp() };
  if (hora) bebida.hora = hora;
  return addDoc(coleccionDe(uid), bebida);
}

// creadoEn no se toca al editar: es lo que desempata el orden entre dos bebidas
// del mismo día, igual que en las comidas.
export function actualizarBebida(uid, bebidaId, texto, fecha, hora) {
  return updateDoc(doc(db, "usuarios", uid, "bebidas", bebidaId), {
    texto,
    fecha,
    hora: hora || "",
    editadoEn: serverTimestamp()
  });
}

// Firestore solo ordena por fecha; dentro del día desempata compararPorFechaYCreacion.
export async function listarBebidas(uid) {
  const consulta = query(coleccionDe(uid), orderBy("fecha", "desc"));
  const instantanea = await getDocs(consulta);

  const bebidas = instantanea.docs.map((documento) => ({
    id: documento.id,
    ...documento.data()
  }));

  bebidas.sort((a, b) => {
    if (a.fecha !== b.fecha) return a.fecha < b.fecha ? 1 : -1;
    return compararPorFechaYCreacion(a, b);
  });

  return bebidas;
}

export function borrarBebida(uid, bebidaId) {
  return deleteDoc(doc(db, "usuarios", uid, "bebidas", bebidaId));
}
