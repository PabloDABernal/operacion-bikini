// Puntos, racha y emblemas de la operación en curso (spec 031).
//
// Todo se calcula al vuelo a partir de lo que ya está guardado (pesajes,
// comidas, ejercicios, fotos y consultas): no hay colección nueva ni campo
// que escribir, igual que calcularResumen() en operaciones.js ya calcula
// "días registrados" sin guardar nada aparte. Borrar datos o editar una
// fecha pasada recalcula solo, sin dejar restos.
//
// La racha cuenta los mismos tipos que el calendario de constancia (peso,
// comida, ejercicio): las fotos no cuentan, para no contradecir lo que el
// propio calendario pinta justo encima.

import { sumarDias, diaDeLaSemana, rangoDeFechas } from "./fechas.js";

const TOPE_COMIDAS_AL_DIA = 3;
const PUNTOS_DIA_COMPLETO = 3;
const PUNTOS_SEMANA_COMPLETA = 10;
const DIAS_PARA_PARON = 5;

function agregarPorDia(pesajes, comidas, ejercicios) {
  const dias = new Map();
  const sumar = (lista, clave) => {
    lista.forEach((registro) => {
      const dia = dias.get(registro.fecha) ?? { pesajes: 0, comidas: 0, ejercicios: 0 };
      dia[clave]++;
      dias.set(registro.fecha, dia);
    });
  };
  sumar(pesajes, "pesajes");
  sumar(comidas, "comidas");
  sumar(ejercicios, "ejercicios");
  return dias;
}

function lunesDeLaSemana(fecha) {
  return sumarDias(fecha, -diaDeLaSemana(fecha));
}

function tieneRegistro(dias, fecha) {
  const dia = dias.get(fecha);
  return Boolean(dia && (dia.pesajes > 0 || dia.comidas > 0 || dia.ejercicios > 0));
}

// Lunes de cada semana natural que toca la operación, desde la que contiene
// el inicio hasta la que contiene hoy. Una semana con días fuera de ese rango
// (antes de empezar, o que aún no han llegado) nunca puede salir "completa":
// esos días no tienen registro por construcción, no hace falta un caso aparte.
function semanasDeLaOperacion(inicio, hoy) {
  const semanas = [];
  let cursor = lunesDeLaSemana(inicio);
  const ultima = lunesDeLaSemana(hoy);
  while (cursor <= ultima) {
    semanas.push(cursor);
    cursor = sumarDias(cursor, 7);
  }
  return semanas;
}

function semanaCompleta(dias, lunes) {
  return rangoDeFechas(lunes, sumarDias(lunes, 6)).every((fecha) => tieneRegistro(dias, fecha));
}

function calcularPuntos(dias, semanasCompletas) {
  let puntos = 0;
  dias.forEach((dia) => {
    puntos += dia.pesajes;
    puntos += Math.min(dia.comidas, TOPE_COMIDAS_AL_DIA);
    puntos += dia.ejercicios * 2;
    if (dia.pesajes > 0 && dia.comidas > 0 && dia.ejercicios > 0) {
      puntos += PUNTOS_DIA_COMPLETO;
    }
  });
  return puntos + semanasCompletas.length * PUNTOS_SEMANA_COMPLETA;
}

// Recorre día a día desde el inicio de la operación hasta hoy, llevando la
// racha con su día de gracia semanal. Hoy solo cuenta si ya tiene registro:
// el día no ha acabado, así que su ausencia no rompe ni consume gracia
// todavía (se resuelve solo, en cuanto se recargue mañana).
//
// De paso guarda la racha más larga alcanzada alguna vez (para "Primera
// semana" y "Mes de hierro", que no se pierden si la racha se rompe después)
// y cuántas veces se ha retomado tras 5 o más días seguidos sin nada.
function recorrerHistoria(dias, inicio, hoy) {
  let racha = 0;
  let rachaMaxima = 0;
  let diasSeguidosSinRegistro = 0;
  let vueltasAlRuedo = 0;
  const semanasConGracia = new Set();

  rangoDeFechas(inicio, hoy).forEach((fecha) => {
    const tiene = tieneRegistro(dias, fecha);

    if (fecha === hoy && !tiene) return;

    if (tiene) {
      if (diasSeguidosSinRegistro >= DIAS_PARA_PARON) vueltasAlRuedo++;
      diasSeguidosSinRegistro = 0;
      racha++;
    } else {
      diasSeguidosSinRegistro++;
      const lunes = lunesDeLaSemana(fecha);
      if (!semanasConGracia.has(lunes)) {
        semanasConGracia.add(lunes);
      } else {
        racha = 0;
      }
    }

    rachaMaxima = Math.max(rachaMaxima, racha);
  });

  return { racha, rachaMaxima, vueltasAlRuedo };
}

// El día de gracia de esta semana natural: si ya faltó algún día entre el
// lunes y ayer, está gastado. Hoy no cuenta todavía, por lo mismo de arriba.
function graciaDisponibleEstaSemana(dias, inicio, hoy) {
  const lunes = lunesDeLaSemana(hoy);
  const diasPasados = rangoDeFechas(lunes, sumarDias(hoy, -1)).filter(
    (fecha) => fecha >= inicio
  );
  return diasPasados.every((fecha) => tieneRegistro(dias, fecha));
}

const EMBLEMAS = [
  {
    clave: "primeraSemana",
    etiqueta: "Primera semana",
    condicion: "Llega a una racha de 7 días",
    conseguido: ({ rachaMaxima }) => rachaMaxima >= 7
  },
  {
    clave: "mesDeHierro",
    etiqueta: "Mes de hierro",
    condicion: "Llega a una racha de 30 días",
    conseguido: ({ rachaMaxima }) => rachaMaxima >= 30
  },
  {
    clave: "centenario",
    etiqueta: "Centenario",
    condicion: "Llega a 100 registros en la operación",
    conseguido: ({ totalRegistros }) => totalRegistros >= 100
  },
  {
    clave: "primeraConsulta",
    etiqueta: "Primera consulta",
    condicion: "Completa una consulta",
    conseguido: ({ huboConsulta }) => huboConsulta
  },
  {
    clave: "semanaRedonda",
    etiqueta: "Semana redonda",
    condicion: "Apunta algo los 7 días de una semana",
    conseguido: ({ semanasCompletas }) => semanasCompletas.length >= 1
  },
  {
    clave: "vueltaAlRuedo",
    etiqueta: "Vuelta al ruedo",
    condicion: "Retoma tras 5 días seguidos sin apuntar nada",
    conseguido: ({ vueltasAlRuedo }) => vueltasAlRuedo >= 1
  }
];

// pesajes, comidas, ejercicios, fotos y consultas son los registros de la
// operación en curso (los mismos arrays ya cargados en memoria para el resto
// de "Hoy"). inicio es la fecha en que empezó esa operación.
export function calcularGamificacion({
  pesajes,
  comidas,
  ejercicios,
  fotos,
  consultas,
  inicio,
  hoy
}) {
  const dias = agregarPorDia(pesajes, comidas, ejercicios);
  const semanasCompletas = semanasDeLaOperacion(inicio, hoy).filter((lunes) =>
    semanaCompleta(dias, lunes)
  );
  const { racha, rachaMaxima, vueltasAlRuedo } = recorrerHistoria(dias, inicio, hoy);

  const contexto = {
    rachaMaxima,
    vueltasAlRuedo,
    semanasCompletas,
    totalRegistros: pesajes.length + comidas.length + ejercicios.length + fotos.length,
    huboConsulta: consultas.length > 0
  };

  return {
    puntos: calcularPuntos(dias, semanasCompletas),
    racha,
    graciaDisponible: graciaDisponibleEstaSemana(dias, inicio, hoy),
    emblemas: EMBLEMAS.map((emblema) => ({
      clave: emblema.clave,
      etiqueta: emblema.etiqueta,
      condicion: emblema.condicion,
      conseguido: emblema.conseguido(contexto)
    }))
  };
}
