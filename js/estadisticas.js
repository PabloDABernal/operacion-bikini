// Estadísticas de peso: las cuatro líneas que eligió el usuario. Cálculo puro,
// sin DOM y sin tocar la red.
//
// Todo razona por días, igual que la gráfica: la hora de los pesajes (spec
// 014) no interviene.

import { diasEntre } from "./fechas.js";
import { compararVentanas } from "./grafica.js";

// `diarios` viene de pesosPorDia(): un elemento por día, de más antiguo a más
// reciente.

function variacion(diarios, hoy, dias) {
  const comparacion = compararVentanas(diarios, hoy, dias);
  if (!comparacion) return null;
  // Redondeado aquí para que quien pinta no tenga que decidir cuántos
  // decimales enseña, y para que "igual que antes" sea una sola comprobación.
  return Math.round(comparacion.diferencia * 10) / 10;
}

// Del primer pesaje al último: cuánto y en cuántos días.
function desdeElPrincipio(diarios) {
  if (diarios.length < 2) return null;

  const primero = diarios[0];
  const ultimo = diarios[diarios.length - 1];

  return {
    diferencia: Math.round((ultimo.peso - primero.peso) * 10) / 10,
    dias: diasEntre(primero.fecha, ultimo.fecha)
  };
}

// Lo que falta para el objetivo, mirando el último peso apuntado. No se asume
// que se quiere adelgazar: quien quiera engordar ve lo mismo.
function paraElObjetivo(diarios, pesoObjetivo) {
  if (pesoObjetivo === null || diarios.length === 0) return null;

  const ultimo = diarios[diarios.length - 1].peso;
  const faltan = Math.round((ultimo - pesoObjetivo) * 10) / 10;

  return { faltan, alcanzado: faltan <= 0 };
}

export function estadisticasDePeso(diarios, hoy, pesoObjetivo) {
  return {
    semana: variacion(diarios, hoy, 7),
    mes: variacion(diarios, hoy, 30),
    total: desdeElPrincipio(diarios),
    objetivo: paraElObjetivo(diarios, pesoObjetivo)
  };
}
