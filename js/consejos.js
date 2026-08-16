// Consejos guardados.
//
// Desde la spec 023 ya no se piden: "Consejos" dejó de ser una sección y todo
// pasa por la conversación con el nutricionista. Esto se queda para dos cosas:
// seguir enseñando los que ya existían (dentro del hilo, con su fecha) y que
// el archivado de la spec 018 se los lleve al cerrar la operación.

import {
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-config.js";

function coleccionDe(uid) {
  return collection(db, "usuarios", uid, "consejos");
}

export async function listarConsejos(uid) {
  const consulta = query(coleccionDe(uid), orderBy("creadoEn", "desc"));
  const instantanea = await getDocs(consulta);

  return instantanea.docs.map((documento) => ({
    id: documento.id,
    ...documento.data()
  }));
}
