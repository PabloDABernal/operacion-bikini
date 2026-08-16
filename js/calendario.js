// La constancia vista como un calendario de verdad (spec 025).
//
// Para rangos cortos (una semana, dos, un mes) el mapa de calor no dice nada:
// son cuadraditos sin fecha apretados en un rincón. Aquí se pinta como un
// calendario, con los días de la semana arriba y el número del día dentro.
//
// Va en HTML y no en SVG porque hace falta texto dentro de cada casilla.

import { textoDeCasilla } from "./grafica-svg.js";

const DIAS = ["L", "M", "X", "J", "V", "S", "D"];

// Hasta cuántas semanas se enseña como calendario. Por encima, mapa de calor:
// un calendario de 52 semanas no cabe en ninguna pantalla.
export const MAXIMO_SEMANAS_CALENDARIO = 4;

export function dibujarCalendarioMes(casillas, hoy, alTocar) {
  const rejilla = document.createElement("div");
  rejilla.className = "calendario-mes";

  DIAS.forEach((dia) => {
    const cabecera = document.createElement("span");
    cabecera.className = "dia-cabecera";
    cabecera.textContent = dia;
    rejilla.appendChild(cabecera);
  });

  casillas.forEach((casilla) => {
    const dia = document.createElement("button");
    dia.type = "button";
    dia.className = `dia nivel-${casilla.nivel}`;

    if (casilla.fecha === hoy) dia.classList.add("es-hoy");
    if (casilla.fecha > hoy) dia.classList.add("futuro");

    // El número del día, sin el cero delante.
    dia.textContent = String(Number(casilla.fecha.slice(8, 10)));
    dia.title = textoDeCasilla(casilla);
    dia.addEventListener("click", () => alTocar(casilla));

    rejilla.appendChild(dia);
  });

  return rejilla;
}
