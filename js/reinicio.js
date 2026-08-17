// Borrado en bloque de los datos del usuario.
//
// Operación irreversible y sin papelera. Todo lo de aquí está escrito para que
// nunca borre más de lo que se le ha pedido: cada tipo de dato conoce sus
// colecciones y no toca ninguna otra. El documento de ajustes del usuario NO
// está en esta lista a propósito: reiniciar es empezar de cero con el mismo
// objetivo, no olvidar quién eres.

import {
  collection,
  doc,
  deleteDoc,
  getDocs,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-config.js";
import { borrarFoto, borrarDeCloudinary } from "./fotos.js";
import { COLECCIONES } from "./operaciones.js";

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
  { clave: "fotos", etiqueta: "fotos", colecciones: ["fotos"] },
  // Las recetas no se archivan con la operación (spec 026), así que esta
  // casilla es la única forma de borrarlas.
  {
    clave: "recetas",
    etiqueta: "recetas y dietas",
    colecciones: ["recetas", "dietas"]
  },
  // Lo mismo para entrenar (spec 029). La etiqueta evita a propósito la
  // palabra suelta "ejercicios", que es la casilla de arriba y borra el
  // diario: equivocarse aquí borra datos.
  {
    clave: "catalogoEjercicios",
    etiqueta: "catálogo de ejercicios y tabla",
    colecciones: ["ejerciciosCatalogo", "tablas"]
  },
  // El histórico va aparte: no es una colección del día a día, sino las
  // operaciones archivadas con todo lo que llevan dentro (spec 019).
  { clave: "operaciones", etiqueta: "operaciones", colecciones: [] }
];

async function documentosDe(uid, nombreColeccion) {
  const instantanea = await getDocs(collection(db, "usuarios", uid, nombreColeccion));
  return instantanea.docs;
}

// La operación en curso NUNCA se borra por esta vía: para cerrarla está
// "Finalizar operación bikini", y llevársela por delante al marcar una casilla
// sería una trampa.
async function operacionesArchivadas(uid) {
  const documentos = await documentosDe(uid, "operaciones");
  return documentos.filter((documento) => documento.data().estado === "archivada");
}

// Cuántos registros hay de cada tipo, para enseñarlo antes de borrar.
export async function contarTodo(uid) {
  const recuentos = {};

  await Promise.all(
    TIPOS.map(async (tipo) => {
      if (tipo.clave === "operaciones") {
        recuentos[tipo.clave] = (await operacionesArchivadas(uid)).length;
        return;
      }

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

// Borra una operación archivada entera: sus siete subcolecciones y luego su
// documento. Las fotos van primero a Cloudinary, o quedarían archivos gastando
// cuota que ya no se pueden alcanzar desde ninguna pantalla.
async function borrarOperacion(uid, operacionId) {
  for (const nombre of COLECCIONES) {
    const ruta = collection(
      db,
      "usuarios",
      uid,
      "operaciones",
      operacionId,
      nombre
    );
    const documentos = (await getDocs(ruta)).docs;

    if (nombre === "fotos") {
      for (const documento of documentos) {
        const foto = documento.data();
        if (foto.publicId) {
          // Que Cloudinary falle (por ejemplo, si la imagen ya no está) no
          // debe impedir borrar la ficha.
          await borrarDeCloudinary(foto.publicId).catch(() => {});
        }
        await deleteDoc(documento.ref);
      }
      continue;
    }

    for (let inicio = 0; inicio < documentos.length; inicio += MAXIMO_POR_LOTE) {
      const lote = writeBatch(db);
      documentos
        .slice(inicio, inicio + MAXIMO_POR_LOTE)
        .forEach((documento) => lote.delete(documento.ref));
      await lote.commit();
    }
  }

  await deleteDoc(doc(db, "usuarios", uid, "operaciones", operacionId));
}

async function borrarHistorico(uid) {
  for (const documento of await operacionesArchivadas(uid)) {
    await borrarOperacion(uid, documento.id);
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

    if (tipo.clave === "operaciones") {
      await borrarHistorico(uid);
      continue;
    }

    for (const nombre of tipo.colecciones) {
      await borrarColeccion(uid, nombre);
    }
  }
}
