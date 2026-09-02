// Normalizar las recetas que trae la app (spec 089).
//
// Las 73 recetas se transcribieron en la spec 075, ANTES de que la 082 hiciera
// estructurados los ingredientes. Así que sus líneas son texto —"1 lata redonda
// pequeña de atún, enlatado al natural, escurrido (50 g)"— y el cruce con la
// despensa tiene que adivinar qué parte de esa frase es el ingrediente.
//
// Esto las pasa a la forma estructurada, con cada línea enlazada de verdad.
//
// CÁLCULO PURO: decide qué hay que escribir, pero no escribe. Ni DOM ni red, y
// por eso se puede probar entero. Quien escribe es js/app.js, por lotes.

import {
  collection,
  doc,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-config.js";
import { ingredienteDeLinea, mismoIngrediente, esLineaEstructurada } from "./despensa.js";

// Los mismos lotes de 400 que la siembra (spec 075) y por lo mismo: son decenas
// de escrituras y de una en una la app se queda un minuto colgada.
const POR_LOTE = 400;

// Lo que la línea decía por delante del ingrediente: "200 g", "1 lata pequeña".
//
// No se calcula aparte: es lo que ingredienteDeLinea() ha quitado. Se busca
// dónde empieza lo que ha devuelto y se coge lo de antes. Así la cantidad y el
// ingrediente no pueden contradecirse, porque salen del mismo recorte.
//
// Si no encuentra el trozo —ingredienteDeLinea() también quita paréntesis por
// el medio— la cantidad queda vacía. Vacío es correcto; inventado, no.
export function cantidadDeLinea(linea, ingrediente) {
  const texto = String(linea ?? "").trim();
  if (!ingrediente || ingrediente === texto) return "";

  const donde = texto.indexOf(ingrediente);
  if (donde <= 0) return "";

  return texto.slice(0, donde).trim().replace(/\s+de$/i, "").trim();
}

// Qué hacer con las recetas del usuario, sin escribir nada todavía.
//
// Devuelve:
//   ingredientesNuevos: [{ id, nombre }]  los que hay que crear en la despensa
//   recetas:            [{ id, ingredientes, alias }]  las que hay que guardar
//   resumen:            los números que se le enseñan al usuario
//
// `nuevoId` lo pasa quien llama, porque generar un id de Firestore es cosa suya
// (doc(collection(...))). Aquí no se importa nada de la red.
export function planDeNormalizacion(recetas, despensa, aliasPorNombre, nuevoId) {
  const ingredientesNuevos = [];
  const cambios = [];

  // El registro ÚNICO de toda la pasada: arranca con tu despensa y crece con
  // cada ingrediente que se decide crear, ANTES de escribir nada.
  //
  // Sin esto, "huevo" y "sal" —que salen en decenas de recetas— se crearían una
  // vez por receta: la primera lo crea, la segunda no lo encuentra (aún no está
  // escrito) y lo crea otra vez. Una sola pulsación dejaría la despensa con
  // "huevo" repetido diez veces, y eso no se ve el primer día: se descubre
  // semanas después al abrir la despensa.
  const conocidos = (despensa || []).map((ingrediente) => ({
    id: ingrediente.id,
    nombre: ingrediente.nombre
  }));

  // Con mismoIngrediente() y no por igualdad, para que "huevos" encuentre el
  // "huevo" que se acaba de decidir crear (spec 072).
  const buscar = (nombre) =>
    conocidos.find((ingrediente) => mismoIngrediente(ingrediente.nombre, nombre));

  let lineasEnlazadas = 0;

  (recetas || []).forEach((receta) => {
    const lineas = receta.ingredientes || [];
    let tocada = false;

    const nuevas = lineas.map((linea) => {
      // Ya estructurada: NO se toca. Es lo que protege lo que el usuario haya
      // escrito o editado, y lo que hace que pulsar dos veces sea inofensivo.
      if (esLineaEstructurada(linea)) return linea;

      const texto = String(linea ?? "").trim();
      if (!texto) return linea;

      const nombre = ingredienteDeLinea(texto) || texto;

      let ingrediente = buscar(nombre);
      if (!ingrediente) {
        ingrediente = { id: nuevoId(), nombre };
        conocidos.push(ingrediente);
        ingredientesNuevos.push(ingrediente);
      }

      tocada = true;
      lineasEnlazadas++;

      return {
        ingredienteId: ingrediente.id,
        ingredienteNombre: ingrediente.nombre,
        cantidad: cantidadDeLinea(texto, nombre),
        // Vacía siempre: adivinar cuál de las comas de "atún, enlatado al
        // natural, escurrido" separa la preparación del nombre ensucia el
        // nombre del ingrediente, que es justo lo que se cruza con la despensa.
        preparacion: ""
      };
    });

    // Los alias llegan de los datos iniciales, buscando por nombre. Se escriben
    // aunque la receta ya estuviera estructurada: son cosas independientes.
    const alias = aliasPorNombre.get(receta.nombre) || [];
    const aliasNuevos =
      alias.length > 0 &&
      JSON.stringify(alias) !== JSON.stringify(receta.alias || []);

    if (tocada || aliasNuevos) {
      cambios.push({
        id: receta.id,
        // Solo los campos que cambian: quien escribe usa update(), NUNCA set(),
        // o una receta se quedaría sin nombre, raciones ni preparación.
        ...(tocada ? { ingredientes: nuevas } : {}),
        ...(aliasNuevos ? { alias } : {})
      });
    }
  });

  return {
    ingredientesNuevos,
    recetas: cambios,
    resumen: {
      revisadas: (recetas || []).length,
      normalizadas: cambios.length,
      lineasEnlazadas,
      ingredientesCreados: ingredientesNuevos.length
    }
  };
}

// El mapa de nombre de receta a sus alias, desde los datos iniciales.
export function aliasDeLosDatos(recetasIniciales) {
  return new Map(
    (recetasIniciales || [])
      .filter((receta) => (receta.alias || []).length > 0)
      .map((receta) => [receta.nombre, receta.alias])
  );
}

// --- Lo que escribe ------------------------------------------------------
//
// Separado del cálculo de arriba a propósito, como en js/siembra.js: lo de
// arriba se puede probar entero porque no toca la red.

// Un id de ingrediente, generado POR ADELANTADO. Hace falta para poder enlazar
// las líneas de las recetas antes de que el lote se escriba. Mismo truco que la
// siembra.
export function nuevoIdDeIngrediente(uid) {
  return doc(collection(db, "usuarios", uid, "despensa")).id;
}

async function porLotes(cosas, operacion) {
  for (let desde = 0; desde < cosas.length; desde += POR_LOTE) {
    const lote = writeBatch(db);
    cosas.slice(desde, desde + POR_LOTE).forEach((cosa) => operacion(lote, cosa));
    await lote.commit();
  }
}

// Escribe el plan. Si se corta a medias, lo hecho se queda hecho y no pasa
// nada: volver a pulsarlo se salta lo que ya está y termina lo que falte.
export async function escribirNormalizacion(uid, plan) {
  // PRIMERO los ingredientes nuevos: las líneas de las recetas ya llevan su id
  // puesto y ese documento tiene que existir.
  await porLotes(plan.ingredientesNuevos, (lote, ingrediente) => {
    lote.set(doc(db, "usuarios", uid, "despensa", ingrediente.id), {
      nombre: ingrediente.nombre,
      // Sin marcar: que esté apuntado no significa que lo tengas (spec 075).
      tengo: false,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp()
    });
  });

  // DESPUÉS las recetas, con update() y NUNCA set().
  //
  // Estos documentos YA EXISTEN, con su nombre, sus raciones, su preparación y
  // su creadoEn. Un set() sin merge los dejaría solo con los campos que se
  // reescriben y se llevaría el resto por delante, en silencio y sin vuelta
  // atrás. Lo avisó revisor-specs, porque la spec remitía al patrón de la
  // siembra, que usa set() por escribir documentos nuevos.
  await porLotes(plan.recetas, (lote, receta) => {
    const { id, ...campos } = receta;
    lote.update(doc(db, "usuarios", uid, "recetas", id), {
      ...campos,
      editadoEn: serverTimestamp()
    });
  });
}
