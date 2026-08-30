// La siembra: meter en la cuenta del usuario las recetas y los ingredientes que
// la app trae puestos (spec 075).
//
// Se copian a SU cuenta en vez de vivir en una colección común de solo lectura.
// Decisión del usuario el 30 de agosto, y el motivo es que así el recetario, el
// cruce con la despensa (059), la lista de la compra (073) y la dieta siguen
// leyendo de un solo sitio: cero cambios en cuatro pantallas. A cambio, cada uno
// tiene su copia y puede editarla y borrarla, que es justo lo que se quiere.
//
// Ocurre UNA vez por cuenta. La marca es `datosInicialesVersion` en los ajustes.

import {
  collection,
  doc,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-config.js";
import { VERSION, RECETAS, INGREDIENTES } from "./datos-iniciales.js";
import { normalizar, mismoIngrediente } from "./despensa.js";

// Firestore admite 500 escrituras por lote. Se dejan 400 de margen.
//
// Por lotes y no de una en una: son unas 206 escrituras la primera vez, y con un
// await por cada una la app se queda cerca de un minuto sembrando mientras el
// usuario la tiene en la mano.
const POR_LOTE = 400;

// ¿Hay algo que sembrar? Se responde solo con los ajustes, que ya se leen al
// arrancar: comprobarlo no cuesta ni una lectura de más.
export function hayQueSembrar(ajustes) {
  const sembrada = Number(ajustes?.datosInicialesVersion ?? 0);
  return sembrada < VERSION;
}

// Las recetas que faltan. La del usuario manda siempre: si ya tiene una con ese
// nombre, la de los menús no entra. Nunca se pisa lo que alguien escribió.
export function recetasQueFaltan(recetasDelUsuario) {
  const suyas = new Set(
    (recetasDelUsuario || []).map((receta) => normalizar(receta.nombre))
  );
  return RECETAS.filter((receta) => !suyas.has(normalizar(receta.nombre)));
}

// Los ingredientes que faltan, comparando con la regla de la spec 072: si ya
// tienes "tomates", no entra "tomate".
export function ingredientesQueFaltan(despensaDelUsuario) {
  const faltan = [];

  const yaEsta = (nombre) =>
    (despensaDelUsuario || []).some((i) => mismoIngrediente(i.nombre, nombre)) ||
    faltan.some((i) => mismoIngrediente(i, nombre));

  for (const nombre of INGREDIENTES) {
    if (!yaEsta(nombre)) faltan.push(nombre);
  }

  return faltan;
}

// Escribe en tandas. Cada `operacion` recibe el lote y añade lo suyo.
async function porLotes(cosas, operacion) {
  for (let desde = 0; desde < cosas.length; desde += POR_LOTE) {
    const lote = writeBatch(db);
    cosas.slice(desde, desde + POR_LOTE).forEach((cosa) => operacion(lote, cosa));
    await lote.commit();
  }
}

// Siembra lo que falte y deja la marca puesta.
//
// La marca se guarda AL FINAL y solo si todo fue bien: si se corta a medias, el
// siguiente arranque lo reintenta, y lo que ya entró no se duplica porque se
// vuelve a comparar contra lo que hay.
//
// Devuelve cuántas cosas entraron, para poder decirlo por consola.
export async function sembrar(uid, recetasDelUsuario, despensaDelUsuario) {
  const recetas = recetasQueFaltan(recetasDelUsuario);
  const ingredientes = ingredientesQueFaltan(despensaDelUsuario);

  await porLotes(recetas, (lote, receta) => {
    lote.set(doc(collection(db, "usuarios", uid, "recetas")), {
      nombre: receta.nombre,
      raciones: receta.raciones,
      ingredientes: receta.ingredientes,
      preparacion: receta.preparacion,
      creadoEn: serverTimestamp()
    });
  });

  // SIN marcar, como decidió la spec 068: que el ingrediente esté apuntado no
  // significa que lo tengas en casa. Meterlos marcados haría que la app
  // afirmase tener 133 cosas que nadie ha comprado.
  await porLotes(ingredientes, (lote, nombre) => {
    lote.set(doc(collection(db, "usuarios", uid, "despensa")), {
      nombre,
      tengo: false,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp()
    });
  });

  const marca = writeBatch(db);
  marca.set(
    doc(db, "usuarios", uid),
    { datosInicialesVersion: VERSION, actualizadoEn: serverTimestamp() },
    { merge: true }
  );
  await marca.commit();

  return { recetas: recetas.length, ingredientes: ingredientes.length };
}
