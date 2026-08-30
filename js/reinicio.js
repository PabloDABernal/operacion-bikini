// Borrado en bloque de los datos del usuario.
//
// Operación irreversible y sin papelera. Todo lo de aquí está escrito para que
// nunca borre más de lo que se le ha pedido: cada tipo de dato conoce sus
// colecciones y no toca ninguna otra.
//
// El documento de ajustes tampoco se borra: lo que hace la casilla "lo que la
// IA sabe de mí" (spec 055) es vaciar cinco campos suyos, no el documento. La
// regla vieja era que reiniciar es "empezar de cero con el mismo objetivo, no
// olvidar quién eres"; sigue siendo el comportamiento por defecto, pero ahora
// hay una casilla aparte para olvidar también eso, porque sin ella una
// entrevista de bienvenida arrancaba con el perfil de la etapa anterior.

import {
  collection,
  doc,
  deleteDoc,
  getDocs,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-config.js";
import { borrarFoto, borrarDeCloudinary } from "./fotos.js";
import { leerAjustes, guardarAjustes } from "./ajustes.js";
import { COLECCIONES } from "./operaciones.js";

// Un lote de Firestore admite 500 operaciones. Con dos usuarios no se llegará,
// pero el código no debe romperse si algún día se llega.
const MAXIMO_POR_LOTE = 500;

// El orden manda: es el de las casillas en pantalla y el de la frase de aviso.
export const TIPOS = [
  { clave: "pesajes", etiqueta: "pesajes", colecciones: ["pesajes"] },
  { clave: "comidas", etiqueta: "comidas", colecciones: ["comidas"] },
  // Las bebidas (spec 062). Casilla propia y OBLIGATORIA, por lo mismo que el
  // agua en la 061: borrarOperacion() nunca toca las colecciones de primer
  // nivel, que es donde vive la operación en curso.
  { clave: "bebidas", etiqueta: "bebidas", colecciones: ["bebidas"] },
  { clave: "ejercicios", etiqueta: "ejercicios", colecciones: ["ejercicios"] },
  { clave: "consejos", etiqueta: "consejos", colecciones: ["consejos"] },
  {
    clave: "consultas",
    etiqueta: "consultas y planes",
    colecciones: ["consultas", "planes"]
  },
  { clave: "fotos", etiqueta: "fotos", colecciones: ["fotos"] },
  {
    clave: "analisis",
    etiqueta: "análisis nutricionales",
    colecciones: ["analisis"]
  },
  // El agua del día (spec 061). Casilla propia y OBLIGATORIA: el agua se
  // archiva con la operación, pero borrarOperacion() solo vacía
  // operaciones/{id}/{colección} — nunca las colecciones de primer nivel, que
  // es donde vive todo lo de la operación en curso. Sin esta entrada, el agua
  // de la operación en marcha no la borraría ninguna casilla y se quedaría
  // huérfana sin que nadie se entere.
  //
  // Propia y no metida en la de comidas: borrar lo que comiste no tiene por qué
  // borrar lo que bebiste.
  { clave: "agua", etiqueta: "vasos de agua", colecciones: ["agua"] },
  // Las recetas no se archivan con la operación (spec 026), así que esta
  // casilla es la única forma de borrarlas.
  {
    clave: "recetas",
    etiqueta: "recetas y dietas",
    colecciones: ["recetas", "dietas"]
  },
  // La despensa (spec 058). Casilla propia y no metida en la de arriba: no se
  // archiva con la operación, así que esta es la única forma de borrarla, y
  // juntarla con "recetas y dietas" obligaría a borrar las tres para borrar una.
  { clave: "despensa", etiqueta: "despensa", colecciones: ["despensa"] },
  // La lista de la compra (spec 073). Casilla propia y OBLIGATORIA, por lo mismo
  // que el agua y las bebidas: borrarOperacion() nunca toca las colecciones de
  // primer nivel, así que sin ella se quedaría huérfana. Y separada de la
  // despensa porque son cosas distintas: lo que tienes y lo que hay que comprar.
  { clave: "compra", etiqueta: "lista de la compra", colecciones: ["compra"] },
  // Lo mismo para entrenar (spec 029). La etiqueta evita a propósito la
  // palabra suelta "ejercicios", que es la casilla de arriba y borra el
  // diario: equivocarse aquí borra datos.
  {
    clave: "catalogoEjercicios",
    etiqueta: "catálogo de ejercicios y tabla",
    colecciones: ["ejerciciosCatalogo", "tablas"]
  },
  // Los materiales (spec 074). Casilla propia, igual que la despensa: no se
  // archiva con la operación, así que es la única forma de borrarla.
  { clave: "materiales", etiqueta: "materiales", colecciones: ["materiales"] },
  // Las operaciones van aparte: no son una colección del día a día, sino los
  // ciclos con todo lo que llevan dentro (spec 019). Desde la spec 056 incluye
  // también la que esté en marcha, que se tira sin archivar.
  { clave: "operaciones", etiqueta: "operaciones", colecciones: [] },
  // Lo que la IA sabe de ti (spec 055). Tampoco es una colección: son campos
  // sueltos del documento de ajustes, que hasta ahora no se podía vaciar por
  // ninguna vía. Eso hacía que una entrevista de bienvenida arrancara con el
  // perfil de la etapa anterior delante y cerrara a la primera dando por
  // sabido lo que el usuario no había contado.
  { clave: "perfil", etiqueta: "lo que la IA sabe de mí", colecciones: [] }
];

// Los campos del documento de ajustes que forman ese retrato. `proveedorIa` NO
// está: es una preferencia de la app, no algo que la IA sepa de ti.
const CAMPOS_DEL_PERFIL = [
  "nombre",
  "perfil",
  "alturaCm",
  "pesoObjetivoKg",
  "fechaObjetivo"
];

async function documentosDe(uid, nombreColeccion) {
  const instantanea = await getDocs(collection(db, "usuarios", uid, nombreColeccion));
  return instantanea.docs;
}

// Todas: las archivadas y la que esté en marcha (spec 056).
//
// Antes esto filtraba por `estado === "archivada"`, con el argumento de que
// llevarse la operación en curso al marcar una casilla sería una trampa y que
// para cerrarla está "Finalizar operación bikini". La trampa resultó ser la
// contraria: la casilla "Consultas y planes" SÍ borra la entrevista que abre
// una operación, así que se podía dejar un ciclo en marcha sin principio, con
// la app tratándote como si estuvieras dentro y sin más salida que archivar
// una operación que nunca existió. Ahora "operaciones" son todas.
async function todasLasOperaciones(uid) {
  return documentosDe(uid, "operaciones");
}

// Cuántos de los campos del retrato tienen algo. Se cuentan uno a uno para que
// el número diga cuánto hay que perder, y salga (0) cuando ya no queda nada.
async function camposDelPerfilConAlgo(uid) {
  const ajustes = await leerAjustes(uid);
  return CAMPOS_DEL_PERFIL.filter((campo) => {
    const valor = ajustes[campo];
    return valor !== null && valor !== undefined && valor !== "";
  }).length;
}

// Vacía el retrato sin borrar el documento: dentro vive también proveedorIa,
// que no se toca. `null` es lo que leerAjustes() ya devuelve cuando no hay nada.
async function borrarPerfil(uid) {
  await guardarAjustes(
    uid,
    Object.fromEntries(CAMPOS_DEL_PERFIL.map((campo) => [campo, null]))
  );
}

// Cuántos registros hay de cada tipo, para enseñarlo antes de borrar.
export async function contarTodo(uid) {
  const recuentos = {};

  await Promise.all(
    TIPOS.map(async (tipo) => {
      if (tipo.clave === "operaciones") {
        recuentos[tipo.clave] = (await todasLasOperaciones(uid)).length;
        return;
      }

      if (tipo.clave === "perfil") {
        recuentos[tipo.clave] = await camposDelPerfilConAlgo(uid);
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

// Borra una operación entera: todas sus subcolecciones y luego su documento.
// Las fotos van primero a Cloudinary, o quedarían archivos gastando cuota que
// ya no se pueden alcanzar desde ninguna pantalla.
//
// Sirve igual para una operación en curso (spec 056): sus subcolecciones están
// vacías, porque sus registros viven en las colecciones del día a día hasta que
// se archiva. Por eso no hace falta un camino aparte para ella.
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

async function borrarOperaciones(uid) {
  for (const documento of await todasLasOperaciones(uid)) {
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
      await borrarOperaciones(uid);
      continue;
    }

    if (tipo.clave === "perfil") {
      await borrarPerfil(uid);
      continue;
    }

    for (const nombre of tipo.colecciones) {
      await borrarColeccion(uid, nombre);
    }
  }
}
