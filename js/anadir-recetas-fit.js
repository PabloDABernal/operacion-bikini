// Añade el lote de recetas "fit" (js/datos-recetas-fit.js) al recetario
// compartido, con el admin como autor. Pedido por el usuario el 23 de
// septiembre de 2026: búsqueda web de recetas altas en proteína (queso
// cottage, tiramisús fit...) para tener contenido de sobra en el recetario.
//
// Idempotente por nombre: si una receta de la lista ya existe en el
// recetario compartido (nombre normalizado igual), se salta — pulsar el
// botón dos veces no duplica nada.

import {
  collection,
  doc,
  getDocs,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-config.js";
import { normalizar, mismoIngrediente } from "./despensa.js";
import { RECETAS_FIT } from "./datos-recetas-fit.js";

const POR_LOTE = 400;

async function documentosDe(coleccion) {
  const instantanea = await getDocs(coleccion);
  return instantanea.docs.map((documento) => ({ id: documento.id, ...documento.data() }));
}

async function porLotes(cosas, operacion) {
  for (let desde = 0; desde < cosas.length; desde += POR_LOTE) {
    const lote = writeBatch(db);
    cosas.slice(desde, desde + POR_LOTE).forEach((cosa) => operacion(lote, cosa));
    await lote.commit();
  }
}

export async function anadirRecetasFit(uid, autorNombre) {
  const [recetasCompartidas, catalogoCompartido] = await Promise.all([
    documentosDe(collection(db, "recetas")),
    documentosDe(collection(db, "ingredientes"))
  ]);

  const nombresYaPuestos = new Set(
    recetasCompartidas.map((receta) => normalizar(receta.nombre))
  );

  const porAnadir = RECETAS_FIT.filter(
    (receta) => !nombresYaPuestos.has(normalizar(receta.nombre))
  );

  if (porAnadir.length === 0) {
    return { recetas: 0, ingredientes: 0 };
  }

  // El catálogo, ampliándose según se van necesitando ingredientes nuevos:
  // dos recetas de esta misma lista que comparten un ingrediente ("Miel")
  // no pueden crear dos entradas.
  const catalogo = [...catalogoCompartido];
  const ingredientesNuevos = [];

  const idDeIngrediente = (nombre) => {
    const encontrado = catalogo.find((ingrediente) => mismoIngrediente(ingrediente.nombre, nombre));
    if (encontrado) return encontrado.id;

    const nuevoId = doc(collection(db, "ingredientes")).id;
    catalogo.push({ id: nuevoId, nombre });
    ingredientesNuevos.push({ id: nuevoId, nombre });
    return nuevoId;
  };

  const recetasAEscribir = porAnadir.map((receta) => ({
    id: doc(collection(db, "recetas")).id,
    nombre: receta.nombre,
    raciones: receta.raciones,
    preparacion: receta.preparacion,
    alias: receta.alias || [],
    categorias: receta.categorias || [],
    ingredientes: receta.ingredientesEnPiezas.map((pieza) => ({
      ingredienteId: idDeIngrediente(pieza.ingrediente),
      ingredienteNombre: pieza.ingrediente,
      cantidad: pieza.cantidad || "",
      preparacion: pieza.preparacion || ""
    }))
  }));

  await porLotes(ingredientesNuevos, (lote, ingrediente) => {
    lote.set(doc(db, "ingredientes", ingrediente.id), {
      nombre: ingrediente.nombre,
      autorUid: uid,
      autorNombre,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp()
    });
  });

  await porLotes(recetasAEscribir, (lote, receta) => {
    const { id, ...campos } = receta;
    lote.set(doc(db, "recetas", id), {
      ...campos,
      autorUid: uid,
      autorNombre,
      creadoEn: serverTimestamp()
    });
  });

  return { recetas: recetasAEscribir.length, ingredientes: ingredientesNuevos.length };
}
