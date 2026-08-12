// Borrado en bloque de los datos del usuario.
//
// Operación irreversible y sin papelera. Todo lo de aquí está escrito para que
// nunca borre más de lo que se le ha pedido: cada tipo de dato conoce sus
// colecciones y no toca ninguna otra. El documento de ajustes del usuario NO
// está en esta lista a propósito: reiniciar es empezar de cero con el mismo
// objetivo, no olvidar quién eres.

import {
  collection,
  getDocs,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-config.js";
import { borrarFoto } from "./fotos.js";

// Un lote de Firestore admite 500 operaciones. Con dos usuarios no se llegará,
// pero el código no debe romperse si algún día se llega.
const MAXIMO_POR_LOTE = 500;

// El orden manda: es el de las casillas en pantalla y el de la frase de aviso.
export const TIPOS = [
  { clave: "pesajes", etiqueta: "pesajes", colecciones: ["pesajes"] },
  { clave: "comidas", etiqueta: "comidas", colecciones: ["comidas"] },
  { clave: "ejercicios", etiqueta: "ejercicios", colecciones: ["ejercicios"] },
  { clave: "consejos", etiqueta: "consejos", colecciones: ["consejos"] },
  {
    clave: "consultas",
    etiqueta: "consultas y planes",
    colecciones: ["consultas", "planes"]
  },
  { clave: "fotos", etiqueta: "fotos", colecciones: ["fotos"] }
];

async function documentosDe(uid, nombreColeccion) {
  const instantanea = await getDocs(collection(db, "usuarios", uid, nombreColeccion));
  return instantanea.docs;
}

// Cuántos registros hay de cada tipo, para enseñarlo antes de borrar.
export async function contarTodo(uid) {
  const recuentos = {};

  await Promise.all(
    TIPOS.map(async (tipo) => {
      const porColeccion = await Promise.all(
        tipo.colecciones.map(async (nombre) => (await documentosDe(uid, nombre)).length)
      );
      recuentos[tipo.clave] = porColeccion.reduce((suma, n) => suma + n, 0);
    })
  );

  return recuentos;
}

// "8 pesajes, 14 comidas y 3 fotos". Los tipos vacíos no se nombran.
export function describirSeleccion(clavesSeleccionadas, recuentos) {
  const partes = TIPOS.filter(
    (tipo) => clavesSeleccionadas.includes(tipo.clave) && recuentos[tipo.clave] > 0
  ).map((tipo) => `${recuentos[tipo.clave]} ${tipo.etiqueta}`);

  if (partes.length === 0) return "";
  if (partes.length === 1) return partes[0];

  return `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`;
}

async function borrarColeccion(uid, nombreColeccion) {
  const documentos = await documentosDe(uid, nombreColeccion);

  for (let inicio = 0; inicio < documentos.length; inicio += MAXIMO_POR_LOTE) {
    const lote = writeBatch(db);
    documentos
      .slice(inicio, inicio + MAXIMO_POR_LOTE)
      .forEach((documento) => lote.delete(documento.ref));
    await lote.commit();
  }
}

// Las fotos van aparte: hay que borrarlas también de Cloudinary, una a una.
async function borrarFotos(uid) {
  const documentos = await documentosDe(uid, "fotos");

  for (const documento of documentos) {
    await borrarFoto(uid, { id: documento.id, ...documento.data() });
  }
}

// Borra solo los tipos indicados. Si algo falla, lo ya borrado se queda
// borrado: se propaga el error para avisar, y repetir la operación sobre lo
// que quede es inofensivo.
export async function borrarSeleccion(uid, clavesSeleccionadas) {
  for (const tipo of TIPOS) {
    if (!clavesSeleccionadas.includes(tipo.clave)) continue;

    if (tipo.clave === "fotos") {
      await borrarFotos(uid);
      continue;
    }

    for (const nombre of tipo.colecciones) {
      await borrarColeccion(uid, nombre);
    }
  }
}
