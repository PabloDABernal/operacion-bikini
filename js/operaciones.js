// Operaciones: cada ciclo con principio y fin, y el archivado de lo apuntado
// durante ese ciclo (spec 018).
//
// El archivado MUEVE los documentos de verdad, de las subcolecciones del día a
// día a las de la operación. Se hace por lotes en los que copiar y borrar van
// en la misma escritura atómica: así ningún registro se borra sin estar ya
// copiado, y un corte a media se puede reanudar sin perder ni duplicar nada.

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-config.js";
import { hoyISO } from "./fechas.js";

// Cada lote lleva 200 documentos y cada documento gasta dos operaciones
// (escribir la copia y borrar el original): 400 de las 500 que permite
// Firestore por lote, con margen de sobra.
const POR_LOTE = 200;

// El orden importa poco, pero se archiva primero lo que más pesa.
export const COLECCIONES = [
  "comidas",
  "ejercicios",
  "pesajes",
  "consejos",
  "consultas",
  "planes",
  "fotos",
  "analisis"
];

export const NOMBRES = {
  comidas: "comidas",
  ejercicios: "ejercicio",
  pesajes: "pesajes",
  consejos: "consejos",
  consultas: "consultas",
  planes: "planes",
  fotos: "fotos",
  analisis: "análisis nutricionales"
};

function operacionesDe(uid) {
  return collection(db, "usuarios", uid, "operaciones");
}

export async function listarOperaciones(uid) {
  const consulta = query(operacionesDe(uid), orderBy("numero", "desc"));
  const instantanea = await getDocs(consulta);

  return instantanea.docs.map((documento) => ({
    id: documento.id,
    ...documento.data()
  }));
}

export function operacionActiva(operaciones) {
  return operaciones.find((operacion) => operacion.estado === "activa") || null;
}

// Una operación a medio archivar sigue teniendo colecciones pendientes de
// mover. No bloquea empezar otra, pero hay que poder reintentarlo.
export function operacionAMedias(operaciones) {
  return (
    operaciones.find(
      (operacion) => operacion.archivando && operacion.archivando.length > 0
    ) || null
  );
}

// Se crea al TERMINAR la entrevista, no al empezarla: una entrevista
// abandonada no debe dejar una operación coja.
export function crearOperacion(uid, operaciones) {
  return addDoc(operacionesDe(uid), {
    estado: "activa",
    numero: operaciones.length + 1,
    inicio: hoyISO(),
    creadaEn: serverTimestamp()
  });
}

// Lo que se enseña en la tarjeta del histórico. Se calcula ANTES de mover
// nada, mientras los registros siguen donde estaban.
export async function calcularResumen(uid) {
  const leer = async (nombre) => {
    const instantanea = await getDocs(collection(db, "usuarios", uid, nombre));
    return instantanea.docs.map((documento) => documento.data());
  };

  // Las fotos cuentan como registro de ese día: un día con solo foto es un día
  // en que apuntaste algo.
  const [pesajes, comidas, ejercicios, fotos] = await Promise.all([
    leer("pesajes"),
    leer("comidas"),
    leer("ejercicios"),
    leer("fotos")
  ]);

  const porFecha = [...pesajes].sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
  const dias = new Set(
    [...pesajes, ...comidas, ...ejercicios, ...fotos].map(
      (registro) => registro.fecha
    )
  );

  return {
    pesoInicial: porFecha.length ? porFecha[0].pesoKg : null,
    pesoFinal: porFecha.length ? porFecha[porFecha.length - 1].pesoKg : null,
    diasRegistrados: dias.size,
    registros: pesajes.length + comidas.length + ejercicios.length + fotos.length
  };
}

// Marca la operación como archivada y deja anotado todo lo que queda por
// mover. A partir de aquí la app ya no la considera activa.
export async function cerrarOperacion(uid, operacionId, resumen) {
  await updateDoc(doc(db, "usuarios", uid, "operaciones", operacionId), {
    estado: "archivada",
    fin: hoyISO(),
    resumen,
    archivando: [...COLECCIONES],
    cerradaEn: serverTimestamp()
  });
}

// Mueve una colección entera, por lotes. Devuelve cuántos documentos movió.
async function moverColeccion(uid, operacionId, nombre) {
  const origen = collection(db, "usuarios", uid, nombre);
  const instantanea = await getDocs(origen);
  const documentos = instantanea.docs;

  for (let i = 0; i < documentos.length; i += POR_LOTE) {
    const lote = writeBatch(db);

    documentos.slice(i, i + POR_LOTE).forEach((documento) => {
      const destino = doc(
        db,
        "usuarios",
        uid,
        "operaciones",
        operacionId,
        nombre,
        documento.id
      );
      // Copiar y borrar en la misma escritura atómica: o se mueven los dos
      // pasos, o no se mueve ninguno.
      lote.set(destino, documento.data());
      lote.delete(documento.ref);
    });

    await lote.commit();
  }

  return documentos.length;
}

// Mueve lo que quede pendiente. Es reanudable: si falla a media, las
// colecciones ya movidas están fuera de la lista y no se vuelven a tocar.
export async function archivar(uid, operacionId, avisar) {
  const referencia = doc(db, "usuarios", uid, "operaciones", operacionId);
  const instantanea = await getDoc(referencia);
  let pendientes = instantanea.exists()
    ? instantanea.data().archivando || []
    : [];

  for (const nombre of [...pendientes]) {
    avisar(NOMBRES[nombre] || nombre);
    await moverColeccion(uid, operacionId, nombre);

    pendientes = pendientes.filter((otra) => otra !== nombre);
    await updateDoc(referencia, { archivando: pendientes });
  }
}

// Los registros de una operación ya archivada, para verlos en solo lectura.
export async function leerArchivo(uid, operacionId, nombre) {
  const instantanea = await getDocs(
    collection(db, "usuarios", uid, "operaciones", operacionId, nombre)
  );

  return instantanea.docs.map((documento) => ({
    id: documento.id,
    ...documento.data()
  }));
}
