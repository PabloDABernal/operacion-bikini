// Cálculo puro para la gráfica de peso, el comparador semanal y el calendario
// de constancia. Nada de esto toca el DOM: eso es cosa de grafica-svg.js.
//
// Todas las fechas van como texto "AAAA-MM-DD", igual que en el resto de la
// app (ver js/fechas.js).

import { sumarDias, rangoDeFechas, diaDeLaSemana } from "./fechas.js";

export const VENTANA_MEDIA_MOVIL = 7;
export const SEMANAS_CALENDARIO = 12;

// El peso de un día es la media de los pesajes de ese día: si te pesas tres
// veces un martes, el martes sigue siendo un solo día. Devuelve la lista
// ordenada de más antiguo a más reciente.
export function pesosPorDia(pesajes) {
  const porDia = new Map();

  pesajes.forEach(({ fecha, pesoKg }) => {
    const acumulado = porDia.get(fecha) ?? { suma: 0, cuenta: 0 };
    acumulado.suma += pesoKg;
    acumulado.cuenta += 1;
    porDia.set(fecha, acumulado);
  });

  return [...porDia.entries()]
    .map(([fecha, { suma, cuenta }]) => ({ fecha, peso: suma / cuenta }))
    .sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
}

// Media móvil de los últimos 7 días naturales, no de los últimos 7 pesajes:
// los días sin pesaje no cuentan, pero sí consumen ventana. Se calcula desde
// el primer día, aunque todavía no haya 7 días de historia: con pocos datos la
// línea es casi igual a los puntos, y esperar una semana para ver algo sería
// peor.
export function mediaMovil(diarios, ventana = VENTANA_MEDIA_MOVIL) {
  return diarios.map((dia, indice) => {
    const desde = sumarDias(dia.fecha, -(ventana - 1));

    let suma = 0;
    let cuenta = 0;
    for (let i = indice; i >= 0 && diarios[i].fecha >= desde; i -= 1) {
      suma += diarios[i].peso;
      cuenta += 1;
    }

    return { fecha: dia.fecha, peso: dia.peso, media: suma / cuenta };
  });
}

// Media de los días con pesaje dentro de un tramo de fechas, o null si no hay
// ninguno. Promedia por días, igual que la media móvil.
function mediaDelTramo(diarios, desde, hasta) {
  const dentro = diarios.filter((dia) => dia.fecha >= desde && dia.fecha <= hasta);
  if (dentro.length === 0) return null;
  return dentro.reduce((suma, dia) => suma + dia.peso, 0) / dentro.length;
}

// Compara los 7 días que terminan hoy con los 7 anteriores. Devuelve null si
// falta cualquiera de los dos tramos: sin las dos mitades no hay comparación
// que valga.
export function compararSemanas(diarios, hoy) {
  const inicioActual = sumarDias(hoy, -6);
  const finAnterior = sumarDias(hoy, -7);
  const inicioAnterior = sumarDias(hoy, -13);

  const actual = mediaDelTramo(diarios, inicioActual, hoy);
  const anterior = mediaDelTramo(diarios, inicioAnterior, finAnterior);

  if (actual === null || anterior === null) return null;

  return { actual, anterior, diferencia: actual - anterior };
}

// Los tres tipos que cuentan para la constancia, en el orden en que se
// nombran en el detalle de cada día.
const TIPOS_CONSTANCIA = ["peso", "comida", "ejercicio"];

// Una casilla por día de las últimas 12 semanas, terminando hoy. El nivel es
// cuántos de los tres tipos se apuntaron ese día (0 a 3).
//
// La cuadrícula empieza el lunes de la semana más antigua, para que cada
// columna sea una semana natural y las filas cuadren con los días.
export function calendarioDeConstancia(registros, hoy, semanas = SEMANAS_CALENDARIO) {
  const diasConTipo = new Map();

  const marcar = (lista, tipo) => {
    lista.forEach(({ fecha }) => {
      const tipos = diasConTipo.get(fecha) ?? new Set();
      tipos.add(tipo);
      diasConTipo.set(fecha, tipos);
    });
  };

  marcar(registros.pesajes, "peso");
  marcar(registros.comidas, "comida");
  marcar(registros.ejercicios, "ejercicio");

  // La cuadrícula termina el domingo de la semana en curso (los días que aún
  // no han llegado salen vacíos) y desde ahí se cuentan 12 semanas exactas
  // hacia atrás, que caen siempre en lunes. Retroceder al lunes y avanzar al
  // domingo por separado daría 13 columnas todos los días menos el domingo.
  const fin = sumarDias(hoy, 6 - diaDeLaSemana(hoy));
  const inicio = sumarDias(fin, -(semanas * 7 - 1));

  return rangoDeFechas(inicio, fin).map((fecha) => {
    const tipos = diasConTipo.get(fecha) ?? new Set();
    return {
      fecha,
      nivel: tipos.size,
      tipos: TIPOS_CONSTANCIA.filter((tipo) => tipos.has(tipo))
    };
  });
}
