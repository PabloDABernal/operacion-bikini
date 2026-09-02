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

// --- La extracción buena (spec 090) --------------------------------------
//
// La spec 089 usaba ingredienteDeLinea() (spec 068), hecha para líneas cortas
// como "200 g de lentejas". Las recetas transcritas son otra cosa —"1 lata
// redonda pequeña de atún, enlatado al natural, escurrido (50 g)"— y allí solo
// se quitaba el número y la unidad: quedaba "redonda pequeña de atún, enlatado
// al natural, escurrido", y eso acabó en la despensa del usuario. 114 entradas
// ilegibles de 181 creadas.
//
// El cambio de idea: DEJAR DE PARTIR Y EMPEZAR A BUSCAR. La despensa ya trae
// 133 nombres limpios, y el ingrediente de una línea casi siempre es uno de
// ellos. Se recorta para quitar la paja y luego se busca cuál cabe dentro.
//
// Medido contra las 373 líneas reales: 306 enlazan a los 133, se crean 22 y
// solo 9 son de cuatro palabras o más. La suite lo comprueba y falla si empeora.

// Palabras que son cantidad, envase, tamaño o artículo: nunca el ingrediente.
const CUANTIA = new Set(
  ("g gr gramo gramos kg kilo kilos ml cl l litro litros " +
    "cucharada cucharadas cucharadita cucharaditas cuchara " +
    "lata latas bote botes vaso vasos taza tazas " +
    "diente dientes rodaja rodajas loncha lonchas filete filetes " +
    "unidad unidades trozo trozos ramita ramitas pizca pizcas " +
    "punado punados racion raciones porcion porciones guarnicion " +
    "chorrito chorro sobre sobres paquete bolsa " +
    "sopera soperas postre cafe " +
    "redonda redondo pequena pequeno mediana mediano grande grandes " +
    "individual individuales medio media doble " +
    "un una unos unas el la los las").split(" ")
);

const esCantidad = (palabra) => /^[\d]+([.,/-][\d]+)*(gr|g|kg|ml|cl|l)?$/.test(palabra);

function sinAdornos(texto) {
  return String(texto ?? "")
    // El paréntesis PRIMERO. Si se normaliza antes, ya se ha convertido en
    // espacios y el "(50 g)" se queda dentro como si fuera parte del nombre.
    // Este fallo salió en el banco de pruebas, no leyendo el código.
    .replace(/\([^)]*\)/g, " ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9/ -]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// De la línea entera al nombre pelado del ingrediente.
export function recortarLinea(linea) {
  // La coma separa el ingrediente de como viene —"atun, enlatado al natural"—
  // y hay que cortar ANTES de normalizar: normalizar convierte la coma en un
  // espacio, y entonces ya no hay por donde cortar.
  //
  // Esto estaba mal desde el banco de pruebas y no se veia: los enlaces salian
  // bien igualmente porque la BUSQUEDA rescataba el recorte malo. Lo destapo un
  // caso de la suite que miraba el recorte en si.
  const bruto = String(linea ?? "").replace(/\([^)]*\)/g, " ");
  let texto = sinAdornos(bruto.split(",")[0]);

  // La barra separa alternativas y se queda la primera: "plátano/banana".
  // SOLO entre letras: "1/2 cucharada" es una fracción, y partirla por ahí se
  // lleva la línea entera. También salió en el banco: los enlaces cayeron de
  // 306 a 254 hasta verlo.
  texto = texto.replace(/([a-z])\/[a-z].*$/, "$1").trim();

  // Coletillas del final que no dicen qué es (spec 068).
  texto = texto.replace(/\s+(al|a)\s+gusto$/, "").replace(/\s+opcional$/, "").trim();

  const palabras = texto.split(" ");
  let i = 0;
  // Se para SIEMPRE con al menos una palabra viva. En "1 taza de cafe" todo es
  // cuantia y sin este tope se lo comeria entero, devolviendo la linea de
  // vuelta; asi queda "cafe", que es lo que es.
  while (i < palabras.length - 1) {
    const palabra = palabras[i];
    if (esCantidad(palabra) || CUANTIA.has(palabra)) { i++; continue; }
    // El "de" solo se come detrás de una cantidad: en "aceite de oliva" es
    // parte del nombre y quitarlo dejaría "aceite".
    if (palabra === "de" && i > 0) { i++; continue; }
    break;
  }

  return palabras.slice(i).join(" ").trim() || texto;
}

// ¿Cabe este nombre de ingrediente dentro del recorte? Palabra a palabra —así
// "sal" no aparece dentro de "salmón" (spec 059)— y con singular y plural
// contando como lo mismo (spec 072).
function cabeEn(recorte, nombre) {
  const dentro = recorte.split(" ");
  const plural = (uno, otro) => uno === `${otro}s` || uno === `${otro}es`;
  return sinAdornos(nombre)
    .split(" ")
    .every((parte) => dentro.some((q) => q === parte || plural(q, parte) || plural(parte, q)));
}

// El ingrediente de una línea: su recorte, y el nombre bueno si se encuentra.
//
// `conocidos` es la despensa ENTERA, no solo los 133: los que crea la propia
// reparación tienen que encontrarse en la siguiente pasada, o cada pulsación
// los volvería a crear. Lo avisó revisor-specs.
export function ingredienteDeReceta(linea, conocidos, sinonimos) {
  const recorte = recortarLinea(linea);

  // Los más largos primero: "pechuga de pollo" gana a "pollo".
  const ordenados = [...conocidos].sort(
    (uno, otro) => sinAdornos(otro.nombre).split(" ").length - sinAdornos(uno.nombre).split(" ").length
  );

  const hallado = ordenados.find((ingrediente) => cabeEn(recorte, ingrediente.nombre));
  if (hallado) return { recorte, nombre: hallado.nombre, ingrediente: hallado };

  // La tabla revisada a mano, para lo que se escribe de otra forma: "aove" es
  // "aceite de oliva virgen extra".
  const bueno = sinonimos.get(recorte);
  if (bueno) {
    const porSinonimo = ordenados.find((i) => sinAdornos(i.nombre) === sinAdornos(bueno));
    return { recorte, nombre: bueno, ingrediente: porSinonimo || null };
  }

  return { recorte, nombre: recorte, ingrediente: null };
}

// --- El plan de reparación (spec 090) ------------------------------------
//
// Dos tratamientos, porque hay dos situaciones distintas:
//
//   - Las recetas SEMBRADAS se reconstruyen enteras desde el texto original de
//     js/datos-iniciales.js, que es el unico sitio donde sobrevive: la 089 se
//     llevo por delante el que habia en Firestore.
//   - Las recetas DEL USUARIO no tienen original al que volver, asi que no se
//     les toca el texto. Solo el enlace, para que dejen de apuntar a basura.
//
// Y despues se borra lo que quede huerfano, con tres condiciones a la vez.

const clave = (texto) =>
  String(texto ?? "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Devuelve { recetas, ingredientesNuevos, aBorrar, resumen }.
export function planDeReparacion(recetas, despensa, iniciales, ingredientesDeLaApp, sinonimos, nuevoId) {
  const cambios = [];
  const ingredientesNuevos = [];

  // La despensa entera, no solo los 133: lo que cree esta pasada tiene que
  // encontrarse dentro de ella misma, o se duplicaria en cada pulsacion.
  const conocidos = (despensa || []).map((i) => ({ id: i.id, nombre: i.nombre }));

  const dePlan = (linea) => {
    const hallado = ingredienteDeReceta(linea, conocidos, sinonimos);
    if (hallado.ingrediente) return hallado;

    const creado = { id: nuevoId(), nombre: hallado.nombre };
    conocidos.push(creado);
    ingredientesNuevos.push(creado);
    return { ...hallado, ingrediente: creado };
  };

  // Cuantas recetas del usuario llevan cada nombre sembrado. Con dos, no se
  // toca ninguna: no hay forma de saber cual vino de la siembra, y sobrescribir
  // una receta escrita a mano es el peor resultado posible.
  const cuantasConEseNombre = new Map();
  (recetas || []).forEach((receta) => {
    const k = clave(receta.nombre);
    cuantasConEseNombre.set(k, (cuantasConEseNombre.get(k) || 0) + 1);
  });

  const porNombre = new Map((iniciales || []).map((r) => [clave(r.nombre), r]));

  let reconstruidas = 0;
  let reenlazadas = 0;
  let ambiguas = 0;

  (recetas || []).forEach((receta) => {
    const k = clave(receta.nombre);
    const original = porNombre.get(k);
    const repetida = (cuantasConEseNombre.get(k) || 0) > 1;

    if (original && repetida) {
      ambiguas++;
      return;
    }

    // --- Sembrada: se reconstruye entera desde el texto original ---
    if (original) {
      const lineas = (original.ingredientes || []).map((linea) => {
        const { ingrediente, recorte } = dePlan(linea);
        return {
          ingredienteId: ingrediente.id,
          ingredienteNombre: ingrediente.nombre,
          cantidad: cantidadDeLinea(sinAdornos(linea).split(",")[0], recorte),
          preparacion: ""
        };
      });

      // Solo si de verdad cambia algo. Sin esta comparacion, cada pulsacion
      // reescribiria las ~61 recetas sembradas con exactamente el mismo
      // contenido, y el mensaje de "ya estaba todo bien" no saldria nunca.
      // Lo cazo revisor-codigo EJECUTANDO el codigo, no leyendolo: la suite
      // comparaba el contenido de la segunda pasada, pero no que no escribiera.
      const distinta =
        JSON.stringify(lineas) !== JSON.stringify(receta.ingredientes || []);

      if (lineas.length && distinta) {
        cambios.push({ id: receta.id, ingredientes: lineas });
        reconstruidas++;
      }
      return;
    }

    // --- Del usuario: solo se le arregla el enlace ---
    //
    // El ingredienteNombre se queda como esta, feo pero suyo: es lo unico que
    // queda de lo que escribio, y lo puede editar a mano. La cantidad y la
    // preparacion, igual.
    let tocada = false;
    const lineas = (receta.ingredientes || []).map((linea) => {
      if (!esLineaEstructurada(linea)) return linea;

      const hallado = ingredienteDeReceta(linea.ingredienteNombre, conocidos, sinonimos);
      // Si no encuentra nada, se queda con el enlace que tenia: no se le
      // inventa uno ni se le crea un ingrediente.
      if (!hallado.ingrediente || hallado.ingrediente.id === linea.ingredienteId) return linea;

      tocada = true;
      return { ...linea, ingredienteId: hallado.ingrediente.id };
    });

    if (tocada) {
      cambios.push({ id: receta.id, ingredientes: lineas });
      reenlazadas++;
    }
  });

  // --- Que se borra ---
  //
  // Las TRES condiciones a la vez, y ante la duda no se borra.
  // Los 133 que trae la app: esos no se borran nunca, aunque queden huerfanos.
  // Quitarlos seria robarle a la despensa algo que siempre estuvo ahi.
  const nombresDeLaApp = new Set((ingredientesDeLaApp || []).map(clave));

  // Los que usan las recetas DESPUES de reparar: las cambiadas con sus enlaces
  // nuevos, y las no tocadas con los suyos de siempre.
  const enUso = new Set();
  const porId = new Map(cambios.map((c) => [c.id, c]));
  (recetas || []).forEach((receta) => {
    const lineas = (porId.get(receta.id) || receta).ingredientes || [];
    lineas.forEach((linea) => {
      if (esLineaEstructurada(linea) && linea.ingredienteId) enUso.add(linea.ingredienteId);
    });
  });

  const aBorrar = (despensa || []).filter(
    (ingrediente) =>
      !nombresDeLaApp.has(clave(ingrediente.nombre)) &&
      !enUso.has(ingrediente.id) &&
      !ingrediente.tengo
  );

  return {
    recetas: cambios,
    ingredientesNuevos,
    aBorrar,
    resumen: {
      reconstruidas,
      reenlazadas,
      ambiguas,
      ingredientesCreados: ingredientesNuevos.length,
      ingredientesBorrados: aBorrar.length
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

// Escribe la reparación (spec 090). Mismo orden y mismas cautelas que
// escribirNormalizacion(), más el borrado al final.
export async function escribirReparacion(uid, plan) {
  // 1. Los ingredientes que falten, que son documentos NUEVOS: set().
  await porLotes(plan.ingredientesNuevos, (lote, ingrediente) => {
    lote.set(doc(db, "usuarios", uid, "despensa", ingrediente.id), {
      nombre: ingrediente.nombre,
      tengo: false,
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp()
    });
  });

  // 2. Las recetas, que YA EXISTEN: update(), nunca set(). Solo se manda
  // `ingredientes`, así que el `alias` que les puso la spec 089 se queda donde
  // está.
  await porLotes(plan.recetas, (lote, receta) => {
    lote.update(doc(db, "usuarios", uid, "recetas", receta.id), {
      ingredientes: receta.ingredientes,
      editadoEn: serverTimestamp()
    });
  });

  // 3. Y AL FINAL el borrado, nunca antes: si se cortara entre el borrado y el
  // reenlace, las recetas se quedarían apuntando a ingredientes que ya no
  // existen. Haciéndolo al revés, un corte a mitad solo deja basura de más, que
  // se limpia volviendo a pulsar.
  await porLotes(plan.aBorrar, (lote, ingrediente) => {
    lote.delete(doc(db, "usuarios", uid, "despensa", ingrediente.id));
  });
}
