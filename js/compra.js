// Los apuntes a mano de la lista de la compra (spec 073).
//
// SOLO los apuntes a mano. Lo que falta de la dieta no se guarda en ningún
// sitio: se calcula al vuelo cruzando tus recetas con tu despensa
// (`loQueFalta()` en js/despensa.js), igual que el cruce de la spec 059.
// Guardarlo obligaría a mantenerlo al día cada vez que cambia la dieta, la
// despensa o una receta, y a resolver qué pasa cuando se contradicen.
//
// Y colección propia, NO la despensa. Fue lo primero que se pensó y está mal: la
// despensa se le manda a la IA al pedir dieta (`loQueTengo()`), así que el papel
// higiénico acabaría en el prompt como un ingrediente que tienes en casa.

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-config.js";
import { normalizar, mismoIngrediente } from "./despensa.js";

// Firestore admite 500 escrituras por lote; se dejan 400 de margen, como la
// siembra (spec 075).
const POR_LOTE = 400;

export const MAX_APUNTE = 60;
export const MAXIMO_APUNTES = 50;

function coleccionDe(uid) {
  return collection(db, "usuarios", uid, "compra");
}

// Devuelve { texto } o { error }.
export function validarApunte(bruto, yaApuntados = []) {
  const texto = String(bruto ?? "").trim();

  if (texto === "") return { error: "Escribe qué hay que comprar." };
  if (texto.length > MAX_APUNTE) {
    return { error: `Máximo ${MAX_APUNTE} caracteres.` };
  }
  if (yaApuntados.length >= MAXIMO_APUNTES) {
    return { error: `Como mucho ${MAXIMO_APUNTES} apuntes.` };
  }
  if (yaApuntados.some((apunte) => normalizar(apunte.texto) === normalizar(texto))) {
    return { error: `"${texto}" ya está en la lista.` };
  }

  return { texto };
}

export function guardarApunte(uid, texto) {
  return addDoc(coleccionDe(uid), { texto, creadoEn: serverTimestamp() });
}

export function borrarApunte(uid, apunteId) {
  return deleteDoc(doc(db, "usuarios", uid, "compra", apunteId));
}

export async function listarCompra(uid) {
  const instantanea = await getDocs(query(coleccionDe(uid), orderBy("creadoEn")));
  return instantanea.docs.map((documento) => ({
    id: documento.id,
    ...documento.data()
  }));
}

// --- Comprado todo (spec 096) --------------------------------------------
//
// Al volver del super no marcas veinte cosas: has comprado todo. Esto reparte la
// lista en tres montones y luego se escriben por lotes.
//
// CALCULO PURO: decide, pero no escribe ni genera ids. Asi se puede probar
// entero sin tocar la red, igual que planDeNormalizacion() en la spec 090.
//
// `lista` es lo que pinta la compra: { nombre, ingredienteId, apunteId }.
export function repartoDeLaCompra(lista, despensa) {
  const marcar = [];
  const crear = [];
  const borrarApuntes = [];

  const yaMarcado = (nombre) =>
    marcar.some((otro) => mismoIngrediente(otro.nombre, nombre)) ||
    crear.some((otro) => mismoIngrediente(otro, nombre));

  (lista || []).forEach((cosa) => {
    if (cosa.apunteId) borrarApuntes.push(cosa.apunteId);

    // Lo que falta de la dieta ya trae el id de tu despensa cuando esta ahi.
    if (cosa.ingredienteId) {
      if (!yaMarcado(cosa.nombre)) marcar.push({ id: cosa.ingredienteId, nombre: cosa.nombre });
      return;
    }

    // Un APUNTE A MANO no trae id, pero puede ser algo que ya tienes: "huevos"
    // apuntado a mano y "Huevos" en la despensa. Hoy marcarlo solo borra el
    // apunte y deja el ingrediente sin marcar —o crea uno repetido—, que es un
    // fallo de la spec 073 que en lote se multiplicaria por catorce.
    const enDespensa = (despensa || []).find((ingrediente) =>
      mismoIngrediente(ingrediente.nombre, cosa.nombre)
    );
    if (enDespensa) {
      if (!yaMarcado(enDespensa.nombre)) {
        marcar.push({ id: enDespensa.id, nombre: enDespensa.nombre });
      }
      return;
    }

    // No esta en ningun sitio: se crea. Y NACE MARCADO, que es la unica alta que
    // lo hace desde la spec 068 y aqui si es verdad que lo tienes.
    if (!yaMarcado(cosa.nombre)) crear.push(cosa.nombre);
  });

  return { marcar, crear, borrarApuntes, cuantas: marcar.length + crear.length };
}

// Escribe el reparto. Los ids de lo que se crea se generan AQUI, no en el
// reparto: asi aquel sigue siendo puro y se puede probar sin red.
export async function comprarTodo(uid, reparto) {
  const porLotes = async (cosas, operacion) => {
    for (let desde = 0; desde < cosas.length; desde += POR_LOTE) {
      const lote = writeBatch(db);
      cosas.slice(desde, desde + POR_LOTE).forEach((cosa) => operacion(lote, cosa));
      await lote.commit();
    }
  };

  // 1. Lo nuevo, ya marcado. No se usa guardarIngrediente() + marcarIngrediente()
  // porque serian DOS escrituras por ingrediente, y ademas la primera crea
  // siempre con tengo:false. Se escribe de una, como en las specs 090 y 092.
  await porLotes(reparto.crear, (lote, nombre) => {
    lote.set(doc(collection(db, "usuarios", uid, "despensa")), {
      nombre,
      tengo: true,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp()
    });
  });

  // 2. Lo que ya estaba.
  await porLotes(reparto.marcar, (lote, ingrediente) => {
    lote.update(doc(db, "usuarios", uid, "despensa", ingrediente.id), {
      tengo: true,
      actualizadoEn: serverTimestamp()
    });
  });

  // 3. Y los apuntes AL FINAL: si se corta a mitad, mejor que sobre un apunte
  // —que se ve y se vuelve a pulsar— a que desaparezca sin haberse marcado nada.
  // Misma razon por la que la spec 090 borra al final.
  await porLotes(reparto.borrarApuntes, (lote, apunteId) => {
    lote.delete(doc(db, "usuarios", uid, "compra", apunteId));
  });
}
