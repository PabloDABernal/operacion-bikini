// Ranking de comidas habituales ("lo de siempre"). Cálculo puro, sin DOM.
//
// Desde la spec 012 el resumen del día sale directamente del primer registro
// de hoy de cada lista, que ya vienen ordenadas de más reciente a más antigua:
// para eso no hacía falta una función aquí.

import { sumarDias } from "./fechas.js";

export const DIAS_LO_DE_SIEMPRE = 30;
export const MAXIMO_LO_DE_SIEMPRE = 5;

// Para agrupar, "Lentejas  " y "lentejas" son la misma comida. Para enseñar,
// se respeta cómo se escribió la última vez.
function clave(texto) {
  return texto.trim().toLowerCase().replace(/\s+/g, " ");
}

// Los registros que más se repiten en los últimos 30 días, agrupados por su
// texto. De cada grupo se devuelve el registro completo de la aparición MÁS
// RECIENTE: es el que decide con qué valores se repite.
//
// Sirve para comidas y para ejercicios (spec 042). Lo único que le importa de
// un registro es que tenga `texto` y `fecha`; el resto de campos viaja dentro
// de `registro` y ya decide cada pantalla con cuáles se queda.
export function masRepetidos(registros, hoy, maximo = MAXIMO_LO_DE_SIEMPRE) {
  const desde = sumarDias(hoy, -(DIAS_LO_DE_SIEMPRE - 1));
  const recientes = registros.filter((registro) => registro.fecha >= desde);

  const porTexto = new Map();

  recientes.forEach((registro) => {
    const id = clave(registro.texto);
    const acumulado = porTexto.get(id);

    if (!acumulado) {
      porTexto.set(id, { texto: registro.texto, fecha: registro.fecha, veces: 1, registro });
      return;
    }

    acumulado.veces += 1;
    if (registro.fecha > acumulado.fecha) {
      acumulado.texto = registro.texto;
      acumulado.fecha = registro.fecha;
      acumulado.registro = registro;
    }
  });

  return [...porTexto.values()]
    .sort((a, b) => {
      if (a.veces !== b.veces) return b.veces - a.veces;
      return a.fecha < b.fecha ? 1 : -1;
    })
    .slice(0, maximo);
}

// Las comidas que más se repiten. De cada una, el texto y el momento de la vez
// más reciente, que es con lo que se repetirá al tocarla.
export function loDeSiempre(comidas, hoy, maximo = MAXIMO_LO_DE_SIEMPRE) {
  return masRepetidos(comidas, hoy, maximo).map((habitual) => ({
    texto: habitual.texto,
    momento: habitual.registro.momento,
    fecha: habitual.fecha,
    veces: habitual.veces
  }));
}
