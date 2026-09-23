// Categoriza retroactivamente las recetas que ya existen en el recetario
// compartido (spec 105 no lo hacía a propósito; el usuario lo pidió después,
// el 23 de septiembre de 2026, al ver que filtrar por una categoría no
// encontraba nada).
//
// Dos fuentes, dos formas de decidir la categoría:
// - Las 43 recetas fit (js/datos-recetas-fit.js) ya llevan `categorias`
//   escritas a mano: se copian tal cual.
// - Las 73 sembradas (js/datos-iniciales.js) no tienen categoría propia,
//   pero SÍ se sabe en qué momento del día aparecen en los 4 menús
//   (desayuno/comida/merienda/cena): se busca el nombre (o algún alias) de
//   cada receta dentro del texto de cada plato de MENUS, igual que hace
//   semanaDesdeMenu() en js/dietas.js para enlazar la dieta, y el momento se
//   traduce a categoría (desayuno→desayuno, merienda→snack, comida/cena→
//   comida). Una receta que aparece en varios momentos se queda con varias
//   categorías.
//
// Solo toca recetas SIN categoría todavía (`categorias` ausente o vacío):
// no pisa lo que alguien haya categorizado a mano desde el editor.

import {
  collection,
  doc,
  getDocs,
  writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-config.js";
import { normalizar } from "./despensa.js";
import { RECETAS, MENUS } from "./datos-iniciales.js";
import { RECETAS_FIT } from "./datos-recetas-fit.js";

const POR_LOTE = 400;
const MINIMO_PARA_ENLAZAR = 8;
const MOMENTO_A_CATEGORIA = {
  desayuno: "desayuno",
  merienda: "snack",
  comida: "comida",
  cena: "comida"
};

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

// En qué momentos del día aparece esta receta (por nombre o alias) dentro
// del texto de algún plato de los 4 menús.
function momentosDeLaReceta(receta) {
  const nombres = [receta.nombre, ...(receta.alias || [])]
    .map(normalizar)
    .filter((texto) => texto.length >= MINIMO_PARA_ENLAZAR);

  const momentos = new Set();
  MENUS.forEach((menu) => {
    menu.dias.forEach((dia) => {
      dia.comidas.forEach((comida) => {
        const texto = normalizar(comida.texto);
        if (nombres.some((nombre) => texto.includes(nombre))) {
          momentos.add(comida.momento);
        }
      });
    });
  });
  return momentos;
}

function categoriasDeSembrada(receta) {
  const momentos = momentosDeLaReceta(receta);
  const categorias = new Set();
  momentos.forEach((momento) => categorias.add(MOMENTO_A_CATEGORIA[momento] || "comida"));
  // No apareció en ningún plato reconocible (no debería pasar: RECETAS sale
  // de los propios platos, spec 075): se deja como "comida" antes que sin
  // categoría, para que no quede huérfana del todo.
  if (categorias.size === 0) categorias.add("comida");
  return Array.from(categorias);
}

export async function categorizarRecetasExistentes() {
  const compartidas = await documentosDe(collection(db, "recetas"));

  const porNombreSembrada = new Map(
    RECETAS.map((receta) => [normalizar(receta.nombre), receta])
  );
  const porNombreFit = new Map(
    RECETAS_FIT.map((receta) => [normalizar(receta.nombre), receta])
  );

  const actualizaciones = [];

  compartidas.forEach((receta) => {
    const yaTiene = Array.isArray(receta.categorias) && receta.categorias.length > 0;
    if (yaTiene) return;

    const clave = normalizar(receta.nombre);
    const fit = porNombreFit.get(clave);
    if (fit && fit.categorias && fit.categorias.length) {
      actualizaciones.push({ id: receta.id, categorias: fit.categorias });
      return;
    }

    const sembrada = porNombreSembrada.get(clave);
    if (sembrada) {
      actualizaciones.push({ id: receta.id, categorias: categoriasDeSembrada(sembrada) });
    }
  });

  await porLotes(actualizaciones, (lote, actualizacion) => {
    lote.update(doc(db, "recetas", actualizacion.id), { categorias: actualizacion.categorias });
  });

  return { tocadas: actualizaciones.length, total: compartidas.length };
}
