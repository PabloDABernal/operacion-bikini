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
  setDoc,
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

// Las líneas de una receta, en la forma estructurada de la spec 082 y enlazadas
// a la despensa del usuario (spec 092).
//
// El nombre que se guarda es el de SU despensa, no el de los datos iniciales: si
// él tiene "Tomates" y la receta dice "Tomate", manda el suyo. Mismo criterio
// que loQueFalta() de la spec 073.
//
// Si no se encuentra —no debería pasar, porque la lista maestra se construye de
// las propias recetas— la línea se guarda SIN enlazar. Una línea coja se lee y
// se arregla; un enlace a un documento que no existe es un fallo silencioso.
function lineasEnlazadas(receta, buscar) {
  return (receta.ingredientesEnPiezas || []).map((pieza) => {
    const enDespensa = buscar(pieza.ingrediente);
    return {
      ingredienteId: enDespensa ? enDespensa.id : "",
      ingredienteNombre: enDespensa ? enDespensa.nombre : pieza.ingrediente,
      cantidad: pieza.cantidad || "",
      preparacion: pieza.preparacion || ""
    };
  });
}

// Escribe en tandas. Cada `operacion` recibe el lote y añade lo suyo.
async function porLotes(cosas, operacion) {
  for (let desde = 0; desde < cosas.length; desde += POR_LOTE) {
    const lote = writeBatch(db);
    cosas.slice(desde, desde + POR_LOTE).forEach((cosa) => operacion(lote, cosa));
    await lote.commit();
  }
}

// Quita la marca, para que la próxima siembra vuelva a poner lo que falte.
//
// La llama el reinicio de datos al borrar las recetas o la despensa: vaciar la
// cuenta la deja como recién estrenada, y una cuenta recién estrenada trae sus
// recetas y sus ingredientes. Decisión del usuario el 30 de agosto, que
// revierte lo que decía la spec 075 sobre que lo borrado no vuelve.
export function olvidarLaSiembra(uid) {
  return setDoc(
    doc(db, "usuarios", uid),
    { datosInicialesVersion: 0, actualizadoEn: serverTimestamp() },
    { merge: true }
  );
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

  // PRIMERO la despensa, y con el id generado POR ADELANTADO (spec 092): las
  // líneas de las recetas necesitan ese id para enlazar, y lo necesitan antes
  // de que el lote se escriba. Mismo truco que nuevoIdDeIngrediente() en la 090.
  const nuevos = ingredientes.map((nombre) => ({
    id: doc(collection(db, "usuarios", uid, "despensa")).id,
    nombre
  }));

  // Todo lo que habrá en la despensa: lo que el usuario ya tenía y lo que se
  // acaba de decidir crear.
  const enLaDespensa = [
    ...(despensaDelUsuario || []).map((i) => ({ id: i.id, nombre: i.nombre })),
    ...nuevos
  ];

  // Con mismoIngrediente() y NO por igualdad de texto: así los "tomates" del
  // usuario absorben el "tomate" de la receta, que es la regla de la spec 072.
  // Un mapa por clave literal crearía duplicados.
  const buscar = (nombre) =>
    enLaDespensa.find((ingrediente) => mismoIngrediente(ingrediente.nombre, nombre));

  // SIN marcar, como decidió la spec 068: que el ingrediente esté apuntado no
  // significa que lo tengas en casa. Meterlos marcados haría que la app
  // afirmase tener 138 cosas que nadie ha comprado.
  await porLotes(nuevos, (lote, ingrediente) => {
    lote.set(doc(db, "usuarios", uid, "despensa", ingrediente.id), {
      nombre: ingrediente.nombre,
      tengo: false,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp()
    });
  });

  // DESPUÉS las recetas, ya enlazadas.
  await porLotes(recetas, (lote, receta) => {
    lote.set(doc(collection(db, "usuarios", uid, "recetas")), {
      nombre: receta.nombre,
      raciones: receta.raciones,
      ingredientes: lineasEnlazadas(receta, buscar),
      preparacion: receta.preparacion,
      // Los otros nombres por los que se reconoce la receta (spec 089). Antes se
      // quedaban aquí por el camino, así que los platos de los menús no
      // encontraban su receta en una cuenta recién sembrada.
      alias: receta.alias || [],
      creadoEn: serverTimestamp()
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
