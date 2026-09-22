// La siembra: meter en el recetario COMPARTIDO las recetas y los ingredientes
// que la app trae puestos (spec 075, reescrita por la 104/v18).
//
// Hasta la 104 se copiaban a la cuenta de CADA usuario, porque el recetario
// era de cada uno (decisión del 30 de agosto). Con el recetario compartido
// eso duplicaría lo que ahora es común, así que la siembra pasa a ocurrir UNA
// SOLA VEZ para todo el grupo, con `autorUid: "sistema"` — no el uid de quien
// la dispara, que puede ser cualquiera de los tres al ser el primero en
// entrar tras el despliegue. Ese origen distinto es a propósito: así el
// reinicio personal de "mis recetas" (filtrado por autorUid, ver
// js/reinicio.js) nunca se lleva por delante lo sembrado, ni siquiera el del
// admin.
//
// La marca de si ya se sembró deja de ser un campo en los ajustes de cada
// usuario y pasa a un documento único y compartido: sistema/datosIniciales.

import {
  collection,
  doc,
  getDoc,
  setDoc,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-config.js";
import { VERSION, RECETAS, INGREDIENTES } from "./datos-iniciales.js";
import { normalizar, mismoIngrediente } from "./despensa.js";

// Autor de lo sembrado, tal y como se enseña junto a la receta/ingrediente.
export const AUTOR_SISTEMA = "sistema";
const NOMBRE_AUTOR_SISTEMA = "Menús de la nutricionista";

function documentoDeEstado() {
  return doc(db, "sistema", "datosIniciales");
}

// Firestore admite 500 escrituras por lote. Se dejan 400 de margen.
//
// Por lotes y no de una en una: son unas 206 escrituras la primera vez, y con un
// await por cada una la app se queda cerca de un minuto sembrando mientras el
// usuario la tiene en la mano.
const POR_LOTE = 400;

// Pura, para poder probarla sin Firestore: dada la versión ya guardada
// (o nada), ¿hace falta sembrar?
export function faltaSembrar(versionGuardada) {
  return Number(versionGuardada ?? 0) < VERSION;
}

// ¿Hay algo que sembrar? Una lectura del documento de estado compartido, no
// por usuario: si ya sembró otro miembro del grupo, nadie más lo repite.
export async function hayQueSembrar() {
  const instantanea = await getDoc(documentoDeEstado());
  return faltaSembrar(instantanea.data()?.version);
}

// Las recetas que faltan EN EL CATÁLOGO COMPARTIDO. Solo se compara contra lo
// que ya hay, sin distinguir de quién es: nunca se pisa una receta que
// alguien del grupo ya escribió con ese nombre.
export function recetasQueFaltan(recetasCompartidas) {
  const yaEstan = new Set(
    (recetasCompartidas || []).map((receta) => normalizar(receta.nombre))
  );
  return RECETAS.filter((receta) => !yaEstan.has(normalizar(receta.nombre)));
}

// Los ingredientes que faltan en el catálogo compartido, comparando con la
// regla de la spec 072: si ya está "tomates", no entra "tomate".
export function ingredientesQueFaltan(catalogoCompartido) {
  const faltan = [];

  const yaEsta = (nombre) =>
    (catalogoCompartido || []).some((i) => mismoIngrediente(i.nombre, nombre)) ||
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

// Siembra lo que falte en el catálogo COMPARTIDO y deja la marca puesta.
//
// La marca se guarda AL FINAL y solo si todo fue bien: si se corta a medias, el
// siguiente arranque lo reintenta, y lo que ya entró no se duplica porque se
// vuelve a comparar contra lo que hay. `uid` es quien la dispara (el primero
// en entrar tras el despliegue), pero lo sembrado queda a nombre de
// `autorUid: "sistema"`, no del suyo — ver la nota de arriba.
//
// Devuelve cuántas cosas entraron, para poder decirlo por consola.
export async function sembrar(recetasCompartidas, catalogoCompartido) {
  const recetas = recetasQueFaltan(recetasCompartidas);
  const ingredientes = ingredientesQueFaltan(catalogoCompartido);

  // PRIMERO los ingredientes, y con el id generado POR ADELANTADO (spec 092):
  // las líneas de las recetas necesitan ese id para enlazar, y lo necesitan
  // antes de que el lote se escriba. Mismo truco que nuevoIdDeIngrediente()
  // en la 090.
  const nuevos = ingredientes.map((nombre) => ({
    id: doc(collection(db, "ingredientes")).id,
    nombre
  }));

  // Todo lo que habrá en el catálogo: lo que ya existía y lo que se acaba de
  // decidir crear.
  const enElCatalogo = [
    ...(catalogoCompartido || []).map((i) => ({ id: i.id, nombre: i.nombre })),
    ...nuevos
  ];

  // Con mismoIngrediente() y NO por igualdad de texto: así "tomates" absorbe
  // el "tomate" de la receta, que es la regla de la spec 072. Un mapa por
  // clave literal crearía duplicados.
  const buscar = (nombre) =>
    enElCatalogo.find((ingrediente) => mismoIngrediente(ingrediente.nombre, nombre));

  // SIN marcar en la despensa de nadie, como decidió la spec 068: que el
  // ingrediente esté en el catálogo no significa que alguien lo tenga en
  // casa. El marcado sigue siendo por usuario y esto no lo toca.
  await porLotes(nuevos, (lote, ingrediente) => {
    lote.set(doc(db, "ingredientes", ingrediente.id), {
      nombre: ingrediente.nombre,
      autorUid: AUTOR_SISTEMA,
      autorNombre: NOMBRE_AUTOR_SISTEMA,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp()
    });
  });

  // DESPUÉS las recetas, ya enlazadas.
  await porLotes(recetas, (lote, receta) => {
    lote.set(doc(collection(db, "recetas")), {
      nombre: receta.nombre,
      raciones: receta.raciones,
      ingredientes: lineasEnlazadas(receta, buscar),
      preparacion: receta.preparacion,
      // Los otros nombres por los que se reconoce la receta (spec 089). Antes se
      // quedaban aquí por el camino, así que los platos de los menús no
      // encontraban su receta en una cuenta recién sembrada.
      alias: receta.alias || [],
      autorUid: AUTOR_SISTEMA,
      autorNombre: NOMBRE_AUTOR_SISTEMA,
      creadoEn: serverTimestamp()
    });
  });

  await setDoc(documentoDeEstado(), {
    version: VERSION,
    actualizadoEn: serverTimestamp()
  });

  return { recetas: recetas.length, ingredientes: ingredientes.length };
}
