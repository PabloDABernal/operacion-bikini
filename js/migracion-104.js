// Puesta en marcha del recetario compartido (spec 104/v18): un solo botón,
// solo para el admin.
//
// Decisión del usuario tras implementar y revisar una fusión completa entre
// las tres cuentas: las otras dos no usan el recetario, así que no compensa
// fundir nada entre ellas. Se empieza casi de cero: se vacía el recetario
// compartido y el recetario/despensa viejos del admin, se resiembran los 4
// menús de la nutricionista (spec 075) y se reenlaza por nombre la dieta
// activa y el diario de comidas del admin a lo recién sembrado. Las recetas
// propias del admin de antes de esta spec, si las había fuera de los 4
// menús, se pierden a propósito. Las otras dos cuentas no se tocan: su
// recetario viejo por cuenta queda huérfano y sin usar.
//
// Seguro de pulsar más de una vez: cada pasada vacía primero, así que no
// duplica nada.

import {
  collection,
  doc,
  getDocs,
  setDoc,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-config.js";
import { normalizar, mismoIngrediente } from "./despensa.js";
import { VERSION, RECETAS, INGREDIENTES } from "./datos-iniciales.js";

const AUTOR_SISTEMA = "sistema";
const NOMBRE_AUTOR_SISTEMA = "Menús de la nutricionista";

// Como en siembra.js/normalizacion.js: 400 de margen sobre el límite real de
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

async function vaciarColeccion(referenciaColeccion) {
  const documentos = await documentosDe(referenciaColeccion);
  await porLotes(documentos, (lote, documento) =>
    lote.delete(doc(referenciaColeccion, documento.id))
  );
  return documentos;
}

// Mismo truco que la siembra: el id de cada ingrediente se genera POR
// ADELANTADO, para que las líneas de las recetas puedan enlazar a él antes
// de que el lote se escriba.
function lineasEnlazadas(receta, buscar) {
  return (receta.ingredientesEnPiezas || []).map((pieza) => {
    const enCatalogo = buscar(pieza.ingrediente);
    return {
      ingredienteId: enCatalogo ? enCatalogo.id : "",
      ingredienteNombre: enCatalogo ? enCatalogo.nombre : pieza.ingrediente,
      cantidad: pieza.cantidad || "",
      preparacion: pieza.preparacion || ""
    };
  });
}

async function resembrar() {
  const nuevosIngredientes = INGREDIENTES.map((nombre) => ({
    id: doc(collection(db, "ingredientes")).id,
    nombre
  }));

  const buscar = (nombre) =>
    nuevosIngredientes.find((ingrediente) => mismoIngrediente(ingrediente.nombre, nombre));

  await porLotes(nuevosIngredientes, (lote, ingrediente) => {
    lote.set(doc(db, "ingredientes", ingrediente.id), {
      nombre: ingrediente.nombre,
      autorUid: AUTOR_SISTEMA,
      autorNombre: NOMBRE_AUTOR_SISTEMA,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp()
    });
  });

  const nuevasRecetas = RECETAS.map((receta) => ({
    id: doc(collection(db, "recetas")).id,
    nombre: receta.nombre,
    raciones: receta.raciones,
    ingredientes: lineasEnlazadas(receta, buscar),
    preparacion: receta.preparacion,
    alias: receta.alias || []
  }));

  await porLotes(nuevasRecetas, (lote, receta) => {
    const { id, ...campos } = receta;
    lote.set(doc(db, "recetas", id), {
      ...campos,
      autorUid: AUTOR_SISTEMA,
      autorNombre: NOMBRE_AUTOR_SISTEMA,
      creadoEn: serverTimestamp()
    });
  });

  await setDoc(doc(db, "sistema", "datosIniciales"), {
    version: VERSION,
    actualizadoEn: serverTimestamp()
  });

  return { recetas: nuevasRecetas.length, ingredientes: nuevosIngredientes.length, nuevasRecetas };
}

// --- Reenlazar por nombre la dieta/diario del admin ------------------------
//
// Los ids nuevos no tienen nada que ver con los viejos: sin esto, cada plato
// de la dieta activa y cada comida del diario que apuntaba a una receta
// vieja se quedaría con un enlace roto, aunque el texto siga siendo el
// mismo plato de siempre.

function mapaPorNombre(recetas) {
  const mapa = new Map();
  recetas.forEach((receta) => mapa.set(normalizar(receta.nombre), receta.id));
  return mapa;
}

// Devuelve el nuevo id si el nombre coincide con una receta recién sembrada,
// o null si no (una receta propia del admin, fuera de los 4 menús: se deja
// sin enlazar, nunca se inventa un enlace aproximado).
function idNuevoPorNombreDeReceta(nombreDeReceta, mapaPorNombreNuevo) {
  return mapaPorNombreNuevo.get(normalizar(nombreDeReceta)) || null;
}

async function reenlazarDietas(uid, recetasViejasPorId, mapaPorNombreNuevo) {
  const dietas = await documentosDe(collection(db, "usuarios", uid, "dietas"));
  let tocadas = 0;

  await porLotes(dietas, (lote, dieta) => {
    let cambio = false;

    const dias = (dieta.dias || []).map((dia) => ({
      ...dia,
      comidas: (dia.comidas || []).map((comida) => {
        const idsViejos =
          Array.isArray(comida.recetaIds) && comida.recetaIds.length
            ? comida.recetaIds
            : comida.recetaId
              ? [comida.recetaId]
              : [];
        if (!idsViejos.length) return comida;

        const idsNuevos = idsViejos
          .map((idViejo) => {
            const nombre = recetasViejasPorId.get(idViejo);
            return nombre ? idNuevoPorNombreDeReceta(nombre, mapaPorNombreNuevo) : null;
          })
          .filter(Boolean);

        cambio = true;
        // Se guarda SIEMPRE como recetaIds (lista), igual que hace el resto
        // de la app al tocar una celda (js/dietas.js, idsDeRecetaDe()): el
        // campo viejo `recetaId` no se vuelve a escribir. `undefined` no es
        // un valor válido para Firestore, así que se QUITA la clave entera
        // en vez de ponerla a undefined.
        const { recetaId, ...comidaSinRecetaId } = comida;
        return { ...comidaSinRecetaId, recetaIds: idsNuevos };
      })
    }));

    if (!cambio) return;
    tocadas += 1;
    lote.update(doc(db, "usuarios", uid, "dietas", dieta.id), { dias });
  });

  return tocadas;
}

async function reenlazarComidas(uid, recetasViejasPorId, mapaPorNombreNuevo) {
  const comidas = await documentosDe(collection(db, "usuarios", uid, "comidas"));
  let tocadas = 0;

  await porLotes(comidas, (lote, comida) => {
    const idsViejos =
      Array.isArray(comida.recetaIds) && comida.recetaIds.length
        ? comida.recetaIds
        : comida.recetaId
          ? [comida.recetaId]
          : [];
    if (!idsViejos.length) return;

    const idsNuevos = idsViejos
      .map((idViejo) => {
        const nombre = recetasViejasPorId.get(idViejo);
        return nombre ? idNuevoPorNombreDeReceta(nombre, mapaPorNombreNuevo) : null;
      })
      .filter(Boolean);

    tocadas += 1;
    lote.update(doc(db, "usuarios", uid, "comidas", comida.id), {
      recetaId: null,
      recetaIds: idsNuevos
    });
  });

  return tocadas;
}

// --- La operación entera ---------------------------------------------------

export async function reiniciarRecetarioCompartido(uid) {
  // ANTES de vaciar nada: los nombres de las recetas viejas del admin, para
  // poder reenlazar su dieta/diario por nombre una vez estén las nuevas.
  const recetasViejas = await documentosDe(collection(db, "usuarios", uid, "recetas"));
  const recetasViejasPorId = new Map(
    recetasViejas.map((receta) => [receta.id, receta.nombre])
  );

  // 1. Vaciar el recetario compartido entero (por si algo llegó a crearse) y
  // el recetario/despensa viejos del propio admin.
  await vaciarColeccion(collection(db, "recetas"));
  await vaciarColeccion(collection(db, "ingredientes"));
  await vaciarColeccion(collection(db, "usuarios", uid, "recetas"));
  await vaciarColeccion(collection(db, "usuarios", uid, "despensa"));

  // 2. Resembrar los 4 menús desde cero.
  const { recetas, ingredientes, nuevasRecetas } = await resembrar();
  const mapaPorNombreNuevo = mapaPorNombre(nuevasRecetas);

  // 3. Reenlazar por nombre la dieta activa y el diario de comidas del admin.
  const [dietasTocadas, comidasTocadas] = await Promise.all([
    reenlazarDietas(uid, recetasViejasPorId, mapaPorNombreNuevo),
    reenlazarComidas(uid, recetasViejasPorId, mapaPorNombreNuevo)
  ]);

  return { recetas, ingredientes, dietasTocadas, comidasTocadas };
}
