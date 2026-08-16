// Dibujo de la gráfica de peso y del calendario de constancia.
//
// SVG construido a mano, sin librerías: son unas pocas formas y así el stack
// sigue sin dependencias ni peso de descarga (ver ARQUITECTURA.md).
//
// Aquí no hay ni un color: cada forma lleva su clase y el color lo pone
// styles.css con las variables de la paleta (spec 009). Si no, la paleta
// viviría en dos sitios y uno de los dos acabaría mintiendo.

import { diasEntre, formatearFecha } from "./fechas.js";

const NS = "http://www.w3.org/2000/svg";

// Ancho de la banda de margen a cada lado del objetivo.
export const MARGEN_OBJETIVO_KG = 1;

// Lienzo de la gráfica. El hueco de la izquierda es para las etiquetas de
// peso y el de abajo para las de fecha.
const ANCHO = 320;
const ALTO = 180;
const MARGEN = { arriba: 10, derecha: 8, abajo: 20, izquierda: 36 };

function elemento(nombre, atributos) {
  const nodo = document.createElementNS(NS, nombre);
  Object.entries(atributos).forEach(([clave, valor]) => {
    nodo.setAttribute(clave, valor);
  });
  return nodo;
}

function texto(contenido, atributos) {
  const nodo = elemento("text", atributos);
  nodo.textContent = contenido;
  return nodo;
}

function kg(valor) {
  return `${valor.toFixed(1).replace(".", ",")} kg`;
}

// Si el rango cruza un cambio de año, DD/MM no dice de qué año habla.
function etiquetaDeFecha(iso, conAnio) {
  const [anio, mes, dia] = iso.split("-");
  return conAnio ? `${dia}/${mes}/${anio.slice(2)}` : `${dia}/${mes}`;
}

// --- Gráfica de peso -----------------------------------------------------

// `diarios` viene de mediaMovil(): [{ fecha, peso, media }], de más antiguo a
// más reciente. `totalPesajes` es cuántos pesajes hay de verdad, antes de
// agruparlos por día: con dos pesajes del mismo día sí hay algo que enseñar
// (una línea plana), aunque `diarios` tenga un solo elemento.
//
// Devuelve null si no hay suficientes datos para decir nada.
export function dibujarGrafica(diarios, pesoObjetivo, totalPesajes) {
  if (diarios.length === 0 || totalPesajes < 2) return null;

  const primera = diarios[0].fecha;
  const ultima = diarios[diarios.length - 1].fecha;
  const totalDias = diasEntre(primera, ultima);

  const valores = diarios.flatMap((dia) => [dia.peso, dia.media]);
  if (pesoObjetivo !== null) {
    valores.push(pesoObjetivo - MARGEN_OBJETIVO_KG, pesoObjetivo + MARGEN_OBJETIVO_KG);
  }

  let minimo = Math.min(...valores);
  let maximo = Math.max(...valores);

  // Todos los pesos iguales y sin objetivo: sin esto el rango sería cero y
  // habría que dividir por cero al escalar.
  if (maximo - minimo < 0.1) {
    minimo -= 1;
    maximo += 1;
  } else {
    const margen = (maximo - minimo) * 0.05;
    minimo -= margen;
    maximo += margen;
  }

  const anchoUtil = ANCHO - MARGEN.izquierda - MARGEN.derecha;
  const altoUtil = ALTO - MARGEN.arriba - MARGEN.abajo;

  // Con todos los pesajes el mismo día no hay rango que repartir: se pinta esa
  // única columna en el centro.
  const x = (fecha) =>
    totalDias === 0
      ? MARGEN.izquierda + anchoUtil / 2
      : MARGEN.izquierda + (diasEntre(primera, fecha) / totalDias) * anchoUtil;

  const y = (peso) =>
    MARGEN.arriba + (1 - (peso - minimo) / (maximo - minimo)) * altoUtil;

  const svg = elemento("svg", {
    viewBox: `0 0 ${ANCHO} ${ALTO}`,
    class: "grafica-peso",
    role: "img",
    "aria-label": `Evolución del peso entre el ${formatearFecha(primera)} y el ${formatearFecha(ultima)}`
  });

  // Banda de margen y línea de objetivo, debajo de todo lo demás.
  if (pesoObjetivo !== null) {
    const arriba = y(pesoObjetivo + MARGEN_OBJETIVO_KG);
    const abajo = y(pesoObjetivo - MARGEN_OBJETIVO_KG);
    svg.appendChild(
      elemento("rect", {
        x: MARGEN.izquierda,
        y: arriba,
        width: anchoUtil,
        height: Math.max(abajo - arriba, 0),
        class: "grafica-banda"
      })
    );
    svg.appendChild(
      elemento("line", {
        x1: MARGEN.izquierda,
        y1: y(pesoObjetivo),
        x2: MARGEN.izquierda + anchoUtil,
        y2: y(pesoObjetivo),
        class: "grafica-objetivo",
        "stroke-dasharray": "4 3"
      })
    );
  }

  // Pesajes reales: se ven, pero no mandan.
  diarios.forEach((dia) => {
    svg.appendChild(
      elemento("circle", {
        cx: x(dia.fecha),
        cy: y(dia.peso),
        r: "2",
        class: "grafica-punto"
      })
    );
  });

  // Media móvil: la línea que dice la verdad. Con todos los pesajes en un solo
  // día, una polilínea de un punto no dibujaría nada, así que se estira plana
  // de lado a lado.
  const puntosLinea =
    totalDias === 0
      ? [
          `${MARGEN.izquierda},${y(diarios[0].media)}`,
          `${MARGEN.izquierda + anchoUtil},${y(diarios[0].media)}`
        ]
      : diarios.map((dia) => `${x(dia.fecha)},${y(dia.media)}`);

  svg.appendChild(
    elemento("polyline", {
      points: puntosLinea.join(" "),
      class: "grafica-media",
      "stroke-linejoin": "round",
      "stroke-linecap": "round"
    })
  );

  // Etiquetas: los dos extremos de cada eje, sin amontonar más.
  const ejes = { class: "grafica-eje" };
  svg.appendChild(
    texto(kg(maximo), { ...ejes, x: MARGEN.izquierda - 4, y: MARGEN.arriba + 4, "text-anchor": "end" })
  );
  svg.appendChild(
    texto(kg(minimo), { ...ejes, x: MARGEN.izquierda - 4, y: ALTO - MARGEN.abajo, "text-anchor": "end" })
  );

  const conAnio = primera.slice(0, 4) !== ultima.slice(0, 4);
  svg.appendChild(
    texto(etiquetaDeFecha(primera, conAnio), {
      ...ejes,
      x: MARGEN.izquierda,
      y: ALTO - 6,
      "text-anchor": "start"
    })
  );
  if (totalDias > 0) {
    svg.appendChild(
      texto(etiquetaDeFecha(ultima, conAnio), {
        ...ejes,
        x: ANCHO - MARGEN.derecha,
        y: ALTO - 6,
        "text-anchor": "end"
      })
    );
  }

  return svg;
}

// --- Calendario de constancia --------------------------------------------

const LADO = 10;
const HUECO = 2;
const PASO = LADO + HUECO;

const NOMBRE_DE_TIPO = { peso: "peso", comida: "comida", ejercicio: "ejercicio" };

export function textoDeCasilla(casilla) {
  const fecha = formatearFecha(casilla.fecha);
  if (casilla.tipos.length === 0) return `${fecha} — sin registros`;
  return `${fecha} — ${casilla.tipos.map((tipo) => NOMBRE_DE_TIPO[tipo]).join(", ")}`;
}

const MESES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic"
];

// Alto que se reserva encima para los nombres de los meses.
const ALTO_MESES = 12;

// `casillas` viene de calendarioDeConstancia(), en orden cronológico y en
// bloques de 7 que empiezan en lunes: cada bloque es una columna.
export function dibujarCalendario(casillas, alTocar) {
  const columnas = Math.ceil(casillas.length / 7);

  const svg = elemento("svg", {
    viewBox: `0 0 ${columnas * PASO - HUECO} ${7 * PASO - HUECO + ALTO_MESES}`,
    class: "calendario-constancia",
    role: "img",
    "aria-label": "Días en los que has apuntado algo"
  });

  // Un nombre de mes encima de la primera columna que lo estrena: sin esto,
  // un año de cuadraditos no dice de cuándo es cada trozo.
  let mesAnterior = "";
  for (let columna = 0; columna < columnas; columna += 1) {
    const primera = casillas[columna * 7];
    if (!primera) break;

    const mes = primera.fecha.slice(5, 7);
    if (mes === mesAnterior) continue;
    mesAnterior = mes;

    svg.appendChild(
      texto(MESES[Number(mes) - 1], {
        x: columna * PASO,
        y: ALTO_MESES - 4,
        class: "grafica-eje"
      })
    );
  }

  casillas.forEach((casilla, indice) => {
    const rect = elemento("rect", {
      x: Math.floor(indice / 7) * PASO,
      y: (indice % 7) * PASO + ALTO_MESES,
      width: LADO,
      height: LADO,
      rx: "2",
      class: `casilla nivel-${casilla.nivel}`
    });

    // El <title> hace de tooltip con el ratón y lo leen los lectores de
    // pantalla; en el móvil hace falta además el toque.
    const titulo = elemento("title", {});
    titulo.textContent = textoDeCasilla(casilla);
    rect.appendChild(titulo);
    rect.addEventListener("click", () => alTocar(casilla));

    svg.appendChild(rect);
  });

  return svg;
}
