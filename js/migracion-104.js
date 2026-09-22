// Migración de la spec 104 (v18): pasa las recetas y los ingredientes de
// ESTA cuenta al recetario compartido, y deja limpio lo viejo.
//
// Se ejecuta UNA VEZ por cuenta, desde un botón en Ajustes → Zona de peligro
// (como hizo la herramienta de reparación de las specs 089/090). Cada una de
// las tres cuentas del grupo la pulsa por su lado: no hace falta un script
// aparte con credenciales de admin porque cada cuenta solo necesita leer SUS
// PROPIOS datos viejos (usuarios/{uid}/recetas, transitorio en
// firestore.rules) y el catálogo compartido, que ya es de lectura pública
// para el grupo.
//
// Cómo funde duplicados (decisiones del usuario en la spec):
// - Ingrediente: si el catálogo compartido ya tiene uno que es "el mismo"
//   (mismoIngrediente(), singular/plural, spec 072), se REUTILIZA su id. Si
//   no, se crea uno nuevo con autorUid = esta cuenta.
// - Receta: si el catálogo compartido ya tiene una con el MISMO NOMBRE
//   EXACTO (normalizado, sin tildes/mayúsculas), sobrevive la editada más
//   recientemente: si la de esta cuenta es más nueva, se sobrescribe el
//   contenido de la compartida (mismo id, autor pasa a ser esta cuenta); si
//   no, no se toca y esta cuenta simplemente pasa a usar la que ya había.
//
// Después de fundir, reescribe los ids en las dietas y en el diario de
// comidas de ESTA cuenta (recetaId/recetaIds, ingredienteId/ingredienteIds),
// y borra lo viejo (usuarios/{uid}/recetas entero; usuarios/{uid}/despensa
// se reescribe entero con las marcas nuevas, en vez de borrarse y perderse).
//
// Ejecutarlo dos veces no duplica nada: la segunda vez usuarios/{uid}/recetas
// ya está vacío y no hay nada que migrar.

import {
  collection,
  doc,
  getDocs,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-config.js";
import { normalizar, mismoIngrediente, esLineaEstructurada } from "./despensa.js";

// Como en normalizacion.js/siembra.js: 400 de margen sobre el límite real de
// Firestore (500 escrituras por lote).
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

// El momento de la última edición, o de creación si nunca se editó. Los dos
// campos son Timestamp de Firestore; `.toMillis()` los hace comparables.
function instanteDeEdicion(receta) {
  const marca = receta.editadoEn || receta.creadoEn;
  return marca && typeof marca.toMillis === "function" ? marca.toMillis() : 0;
}

// --- Ingredientes ----------------------------------------------------------

// Funde la despensa vieja de la cuenta (formato {nombre, tengo}) con el
// catálogo compartido. Devuelve { mapaIds, marcas }: `mapaIds` traduce el id
// viejo de cada ingrediente a su id en el catálogo compartido (nuevo o
// reutilizado); `marcas` son las filas que hay que escribir en
// usuarios/{uid}/despensa (el "lo tengo" de esta cuenta, con los ids nuevos).
function fundirIngredientes(despensaVieja, catalogoCompartido) {
  const mapaIds = new Map();
  const nuevos = [];
  const marcas = [];
  // Los ya existentes MÁS los que se van creando en esta misma pasada: dos
  // ingredientes viejos que son "el mismo" (singular/plural) no pueden crear
  // dos entradas nuevas.
  const conocidos = [...catalogoCompartido];

  despensaVieja.forEach((ingrediente) => {
    const encontrado = conocidos.find((otro) => mismoIngrediente(otro.nombre, ingrediente.nombre));

    if (encontrado) {
      mapaIds.set(ingrediente.id, encontrado.id);
      if (ingrediente.tengo) marcas.push({ ingredienteId: encontrado.id, tengo: true });
      return;
    }

    const nuevoId = doc(collection(db, "ingredientes")).id;
    mapaIds.set(ingrediente.id, nuevoId);
    nuevos.push({ id: nuevoId, nombre: ingrediente.nombre });
    conocidos.push({ id: nuevoId, nombre: ingrediente.nombre });
    if (ingrediente.tengo) marcas.push({ ingredienteId: nuevoId, tengo: true });
  });

  return { mapaIds, nuevos, marcas };
}

// --- Recetas -----------------------------------------------------------

// Reescribe `ingredienteId` dentro de las líneas estructuradas de una receta,
// con el mapa de ingredientes ya fundidos. Las líneas de texto libre (no
// estructuradas, de antes de la spec 082) se dejan tal cual: no llevan id que
// reescribir.
function lineasConIdsNuevos(ingredientes, mapaIdsIngrediente) {
  return (ingredientes || []).map((linea) => {
    if (!esLineaEstructurada(linea)) return linea;
    const nuevoId = mapaIdsIngrediente.get(linea.ingredienteId);
    return nuevoId ? { ...linea, ingredienteId: nuevoId } : linea;
  });
}

// Funde las recetas viejas de la cuenta con el recetario compartido. Devuelve
// { mapaIds, nuevas, actualizaciones }: `mapaIds` traduce el id viejo de cada
// receta al id compartido (nuevo, o el de la que sobrevive si había una con
// el mismo nombre); `actualizaciones` son las recetas compartidas ya
// existentes cuyo contenido hay que sobrescribir porque la de esta cuenta es
// más reciente.
function fundirRecetas(recetasViejas, recetarioCompartido, mapaIdsIngrediente, uid, autorNombre) {
  const mapaIds = new Map();
  const nuevas = [];
  const actualizaciones = [];
  // Por nombre normalizado, de lo que YA hay compartido.
  const porNombre = new Map(
    recetarioCompartido.map((receta) => [normalizar(receta.nombre), receta])
  );

  recetasViejas.forEach((receta) => {
    const clave = normalizar(receta.nombre);
    const ingredientesNuevos = lineasConIdsNuevos(receta.ingredientes, mapaIdsIngrediente);
    const existente = porNombre.get(clave);

    if (!existente) {
      const nuevoId = doc(collection(db, "recetas")).id;
      mapaIds.set(receta.id, nuevoId);
      const nueva = {
        id: nuevoId,
        nombre: receta.nombre,
        raciones: receta.raciones,
        ingredientes: ingredientesNuevos,
        preparacion: receta.preparacion || "",
        alias: receta.alias || [],
        autorUid: uid,
        autorNombre
      };
      nuevas.push(nueva);
      // Para que una segunda receta vieja con el mismo nombre (no debería
      // pasar dentro de una misma cuenta, pero por si acaso) la encuentre.
      porNombre.set(clave, nueva);
      return;
    }

    mapaIds.set(receta.id, existente.id);

    // Los alias de las dos se unen SIEMPRE, gane quien gane el contenido
    // (sección 6 de la spec): son dos formas de reconocer la misma receta, no
    // una decisión de cuál "vale más".
    const aliasFundidos = Array.from(
      new Set([...(existente.alias || []), ...(receta.alias || [])].filter(Boolean))
    );
    const aliasCambiaron =
      aliasFundidos.length !== (existente.alias || []).length ||
      aliasFundidos.some((alias) => !(existente.alias || []).includes(alias));

    const miInstante = instanteDeEdicion(receta);
    const suInstante = instanteDeEdicion(existente);

    if (miInstante <= suInstante) {
      // Sobrevive el contenido de la existente, pero con los alias fundidos.
      if (aliasCambiaron) {
        actualizaciones.push({ id: existente.id, alias: aliasFundidos });
        porNombre.set(clave, { ...existente, alias: aliasFundidos });
      }
      return;
    }

    // La mía es más reciente: se sobrescribe el contenido, mismo id, con los
    // alias ya fundidos.
    actualizaciones.push({
      id: existente.id,
      nombre: receta.nombre,
      raciones: receta.raciones,
      ingredientes: ingredientesNuevos,
      preparacion: receta.preparacion || "",
      alias: aliasFundidos,
      autorUid: uid,
      autorNombre
    });
    // Actualiza también la copia en memoria, por si una receta MÁS de esta
    // misma cuenta comparte nombre (otro caso raro, pero cubierto).
    porNombre.set(clave, { ...existente, ...actualizaciones[actualizaciones.length - 1] });
  });

  return { mapaIds, nuevas, actualizaciones };
}

// --- Referencias: dietas y diario de comidas -------------------------------

function idsRemapeados(lista, mapaIds) {
  return (lista || []).map((id) => mapaIds.get(id) || id).filter(Boolean);
}

// Reescribe recetaId/recetaIds e ingredienteId/ingredienteIds en un documento
// de dieta o de comida del diario. Devuelve `null` si no había nada que
// tocar (para no gastar una escritura de más).
function comidaRemapeada(comida, mapaRecetas, mapaIngredientes) {
  let cambio = false;
  const nueva = { ...comida };

  if (Array.isArray(comida.recetaIds) && comida.recetaIds.length) {
    nueva.recetaIds = idsRemapeados(comida.recetaIds, mapaRecetas);
    cambio = true;
  } else if (comida.recetaId) {
    const remapeado = mapaRecetas.get(comida.recetaId);
    if (remapeado) {
      nueva.recetaId = remapeado;
      cambio = true;
    }
  }

  if (Array.isArray(comida.ingredienteIds) && comida.ingredienteIds.length) {
    nueva.ingredienteIds = idsRemapeados(comida.ingredienteIds, mapaIngredientes);
    cambio = true;
  } else if (comida.ingredienteId) {
    const remapeado = mapaIngredientes.get(comida.ingredienteId);
    if (remapeado) {
      nueva.ingredienteId = remapeado;
      cambio = true;
    }
  }

  return cambio ? nueva : null;
}

async function remaparDietas(uid, mapaRecetas) {
  const dietas = await documentosDe(collection(db, "usuarios", uid, "dietas"));
  let tocadas = 0;

  await porLotes(dietas, (lote, dieta) => {
    let cambio = false;
    const dias = (dieta.dias || []).map((dia) => ({
      ...dia,
      comidas: (dia.comidas || []).map((comida) => {
        // Igual que idsDeRecetaDe() (js/dietas.js): una celda puede llevar la
        // lista nueva (recetaIds, spec 088) o todavía el campo viejo
        // (recetaId, singular, spec 028) sin migrar.
        if (Array.isArray(comida.recetaIds) && comida.recetaIds.length) {
          cambio = true;
          return { ...comida, recetaIds: idsRemapeados(comida.recetaIds, mapaRecetas) };
        }
        if (comida.recetaId) {
          const remapeado = mapaRecetas.get(comida.recetaId);
          if (remapeado) {
            cambio = true;
            return { ...comida, recetaId: remapeado };
          }
        }
        return comida;
      })
    }));

    if (!cambio) return;
    tocadas += 1;
    lote.update(doc(db, "usuarios", uid, "dietas", dieta.id), { dias });
  });

  return tocadas;
}

async function remaparComidas(uid, mapaRecetas, mapaIngredientes) {
  const comidas = await documentosDe(collection(db, "usuarios", uid, "comidas"));
  let tocadas = 0;

  await porLotes(comidas, (lote, comida) => {
    const remapeada = comidaRemapeada(comida, mapaRecetas, mapaIngredientes);
    if (!remapeada) return;
    tocadas += 1;
    const { id, ...campos } = remapeada;
    lote.update(doc(db, "usuarios", uid, "comidas", id), campos);
  });

  return tocadas;
}

// --- La migración entera ----------------------------------------------

// Devuelve un resumen para enseñarlo en pantalla, o null si no había nada que
// migrar (usuarios/{uid}/recetas ya vacío: esta cuenta ya migró, o nunca tuvo
// recetas propias).
export async function migrarAlRecetarioCompartido(uid, autorNombre) {
  const [recetasViejas, despensaVieja] = await Promise.all([
    documentosDe(collection(db, "usuarios", uid, "recetas")),
    documentosDe(collection(db, "usuarios", uid, "despensa"))
  ]);

  if (recetasViejas.length === 0 && despensaVieja.length === 0) return null;

  const [catalogoCompartido, recetarioCompartido] = await Promise.all([
    documentosDe(collection(db, "ingredientes")),
    documentosDe(collection(db, "recetas"))
  ]);

  const { mapaIds: mapaIdsIngrediente, nuevos: ingredientesNuevos, marcas } = fundirIngredientes(
    despensaVieja,
    catalogoCompartido
  );

  const {
    mapaIds: mapaIdsReceta,
    nuevas: recetasNuevas,
    actualizaciones: recetasActualizadas
  } = fundirRecetas(recetasViejas, recetarioCompartido, mapaIdsIngrediente, uid, autorNombre);

  // 1. Ingredientes nuevos en el catálogo compartido.
  await porLotes(ingredientesNuevos, (lote, ingrediente) => {
    lote.set(doc(db, "ingredientes", ingrediente.id), {
      nombre: ingrediente.nombre,
      autorUid: uid,
      autorNombre,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp()
    });
  });

  // 2. Recetas nuevas en el recetario compartido.
  await porLotes(recetasNuevas, (lote, receta) => {
    const { id, ...campos } = receta;
    lote.set(doc(db, "recetas", id), { ...campos, creadoEn: serverTimestamp() });
  });

  // 3. Recetas compartidas ya existentes, sobrescritas por ser la mía más
  // reciente.
  await porLotes(recetasActualizadas, (lote, receta) => {
    const { id, ...campos } = receta;
    lote.update(doc(db, "recetas", id), { ...campos, editadoEn: serverTimestamp() });
  });

  // 4. Mis marcas "lo tengo", con los ids nuevos del catálogo compartido.
  await porLotes(marcas, (lote, marca) => {
    lote.set(doc(db, "usuarios", uid, "despensa", marca.ingredienteId), {
      tengo: true,
      actualizadoEn: serverTimestamp()
    });
  });

  // 5. Mis dietas y mi diario de comidas, con los ids nuevos.
  const [dietasTocadas, comidasTocadas] = await Promise.all([
    remaparDietas(uid, mapaIdsReceta),
    remaparComidas(uid, mapaIdsReceta, mapaIdsIngrediente)
  ]);

  // 6. Limpieza: fuera lo viejo. Las recetas, todo el documento (ya no se lee
  // de ahí nunca más). La despensa vieja tenía nombre+tengo mezclados en el
  // mismo documento; sus filas quedan SIEMPRE sustituidas por las marcas del
  // paso 4 (que viven en ids nuevos, nunca los mismos), así que también se
  // borran todas, tengan marca nueva o no.
  await porLotes(recetasViejas, (lote, receta) => {
    lote.delete(doc(db, "usuarios", uid, "recetas", receta.id));
  });
  await porLotes(despensaVieja, (lote, ingrediente) => {
    lote.delete(doc(db, "usuarios", uid, "despensa", ingrediente.id));
  });

  return {
    ingredientesNuevos: ingredientesNuevos.length,
    ingredientesReutilizados: despensaVieja.length - ingredientesNuevos.length,
    recetasNuevas: recetasNuevas.length,
    recetasFundidas: recetasViejas.length - recetasNuevas.length,
    recetasActualizadas: recetasActualizadas.length,
    dietasTocadas,
    comidasTocadas
  };
}
