// Cálculo puro para la pantalla "Hoy": el resumen del día y el ranking de
// "lo de siempre". Nada de esto toca el DOM.

import { sumarDias } from "./fechas.js";

export const DIAS_LO_DE_SIEMPRE = 30;
export const MAXIMO_LO_DE_SIEMPRE = 5;

// Qué hay apuntado hoy. Devuelve null en peso si no hay ninguno; comidas y
// minutos son números.
export function resumenDelDia(registros, hoy) {
  const deHoy = (lista) => lista.filter((registro) => registro.fecha === hoy);

  // La lista ya viene ordenada de más reciente a más antiguo, así que si hay
  // varios pesajes hoy el primero es el último apuntado.
  const pesajes = deHoy(registros.pesajes);

  return {
    pesoKg: pesajes.length ? pesajes[0].pesoKg : null,
    comidas: deHoy(registros.comidas).length,
    minutos: deHoy(registros.ejercicios).reduce(
      (suma, ejercicio) => suma + ejercicio.minutos,
      0
    )
  };
}

// Para agrupar, "Lentejas  " y "lentejas" son la misma comida. Para enseñar,
// se respeta cómo se escribió la última vez.
function clave(texto) {
  return texto.trim().toLowerCase().replace(/\s+/g, " ");
}

// Las comidas que más se repiten en los últimos 30 días. De cada una se
// devuelve el texto y el momento de la vez más reciente, que es lo que se
// repetirá al tocarla.
export function loDeSiempre(comidas, hoy, maximo = MAXIMO_LO_DE_SIEMPRE) {
  const desde = sumarDias(hoy, -(DIAS_LO_DE_SIEMPRE - 1));
  const recientes = comidas.filter((comida) => comida.fecha >= desde);

  const porTexto = new Map();

  recientes.forEach((comida) => {
    const id = clave(comida.texto);
    const acumulado = porTexto.get(id);

    if (!acumulado) {
      porTexto.set(id, {
        texto: comida.texto,
        momento: comida.momento,
        fecha: comida.fecha,
        veces: 1
      });
      return;
    }

    acumulado.veces += 1;
    // Nos quedamos con la aparición más reciente: es la que decide con qué
    // texto y con qué momento se repite.
    if (comida.fecha > acumulado.fecha) {
      acumulado.texto = comida.texto;
      acumulado.momento = comida.momento;
      acumulado.fecha = comida.fecha;
    }
  });

  return [...porTexto.values()]
    .sort((a, b) => {
      if (a.veces !== b.veces) return b.veces - a.veces;
      return a.fecha < b.fecha ? 1 : -1;
    })
    .slice(0, maximo);
}
