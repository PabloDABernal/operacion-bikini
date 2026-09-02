// Estadísticas de peso: las cuatro líneas que eligió el usuario. Cálculo puro,
// sin DOM y sin tocar la red.
//
// Todo razona por días, igual que la gráfica: la hora de los pesajes (spec
// 014) no interviene.

import { diasEntre, sumarDias } from "./fechas.js";
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

// --- Los kilómetros (spec 087) -------------------------------------------
//
// Lo que se parece a las estadísticas de peso son las VENTANAS, no el
// algoritmo. compararVentanas() compara dos periodos consecutivos para sacar
// una diferencia —"cuánto has variado"—; aquí hace falta sumar dentro de UNA
// ventana —"cuánto llevas"—. Son cuentas distintas, y por eso esto no la usa.

// Solo los ejercicios que apuntaron distancia. Uno sin el campo NO existe para
// esta cuenta: no suma cero ni entra en el divisor de la media. Lo dejó escrito
// la spec 086 — "la 087 los contará como sin distancia, no como cero"—, y es lo
// que evita que un mes de gimnasio hunda la media de quien también anda.
//
// Se filtra por EXISTIR el campo, no por su valor: la 086 nunca guarda un 0,
// pero si apareciera uno tocado a mano sería una sesión de 0 km, no un ejercicio
// sin apuntar.
function conDistancia(ejercicios) {
  return (ejercicios || []).filter(
    (ejercicio) => ejercicio.distanciaKm !== undefined && ejercicio.distanciaKm !== null
  );
}

// Se suma primero y se redondea AL FINAL, para que veinte paseos de 5,25 no
// arrastren el error de redondear uno a uno.
function sumaDe(ejercicios) {
  const km = ejercicios.reduce(
    (total, ejercicio) => total + Number(ejercicio.distanciaKm || 0),
    0
  );

  return { km: Math.round(km * 10) / 10, sesiones: ejercicios.length };
}

// La ventana mira hacia atrás desde `hoy`, incluido. Un ejercicio con fecha
// futura —la app las admite al editar— se queda fuera de las ventanas y solo
// cuenta en el total.
function ventana(ejercicios, hoy, dias) {
  const desde = sumarDias(hoy, -(dias - 1));
  const dentro = ejercicios.filter(
    (ejercicio) => ejercicio.fecha >= desde && ejercicio.fecha <= hoy
  );

  const suma = sumaDe(dentro);
  return {
    ...suma,
    // Con cero sesiones no hay media que dar, y quien pinta no la enseña.
    media: suma.sesiones ? Math.round((suma.km / suma.sesiones) * 10) / 10 : null
  };
}

export function estadisticasDeDistancia(ejercicios, hoy) {
  const conKm = conDistancia(ejercicios);

  return {
    hoy: sumaDe(conKm.filter((ejercicio) => ejercicio.fecha === hoy)),
    siete: ventana(conKm, hoy, 7),
    treinta: ventana(conKm, hoy, 30),
    total: sumaDe(conKm)
  };
}

// --- Qué comes (spec 095) ------------------------------------------------
//
// El objetivo del usuario: "que todo se enlace, así puedo saber lo que como".
// Las specs 093 y 094 llenan el diario de comidas enlazadas; esto lo devuelve
// en forma de respuesta.
//
// Una comida está ENLAZADA si lleva al menos una receta (093) o un ingrediente
// suelto (084): las dos formas dicen qué comiste de verdad.

function enlazada(comida) {
  return Boolean(
    (Array.isArray(comida.recetaIds) && comida.recetaIds.length) || comida.ingredienteId
  );
}

function ventanaDeComidas(comidas, hoy, dias) {
  const desde = sumarDias(hoy, -(dias - 1));
  const dentro = comidas.filter((c) => c.fecha >= desde && c.fecha <= hoy);
  return {
    comidas: dentro.length,
    enlazadas: dentro.filter(enlazada).length
  };
}

// Los cinco más repetidos, con el empate roto por orden alfabético para que la
// lista no baile entre repintados.
function masRepetidos(cuenta) {
  return [...cuenta.entries()]
    .sort((uno, otro) => otro[1] - uno[1] || uno[0].localeCompare(otro[0], "es"))
    .slice(0, 5)
    .map(([nombre, veces]) => ({ nombre, veces }));
}

// `recetaPorId` y `ingredientePorNombre` los pasa quien llama: aquí no se toca
// ni el DOM ni la red.
export function estadisticasDeComidas(comidas, hoy, recetaPorId, ingredientePorId) {
  const todas = comidas || [];

  // Las listas se calculan sobre los últimos 30 días: interesa qué comes AHORA,
  // no qué comías hace tres meses.
  const desde = sumarDias(hoy, -29);
  const recientes = todas.filter((c) => c.fecha >= desde && c.fecha <= hoy);

  const recetas = new Map();
  const ingredientes = new Map();
  const sumar = (mapa, nombre) => {
    if (!nombre) return;
    mapa.set(nombre, (mapa.get(nombre) || 0) + 1);
  };

  recientes.forEach((comida) => {
    // El ingrediente suelto de la spec 084 cuenta una vez.
    if (comida.ingredienteId) sumar(ingredientes, ingredientePorId(comida.ingredienteId));

    (Array.isArray(comida.recetaIds) ? comida.recetaIds : []).forEach((recetaId) => {
      const receta = recetaPorId(recetaId);
      // Una receta borrada del recetario no se cuenta: no se sabe qué era.
      if (!receta) return;
      sumar(recetas, receta.nombre);

      (receta.ingredientes || []).forEach((linea) => {
        // Solo las líneas ENLAZADAS. Una línea de texto —las recetas que propone
        // la IA se guardan así— no dice qué ingrediente es, y contarla sería
        // inventarse el dato.
        if (!linea || typeof linea !== "object" || !linea.ingredienteId) return;
        sumar(ingredientes, ingredientePorId(linea.ingredienteId));
      });
    });
  });

  return {
    hoy: ventanaDeComidas(todas, hoy, 1),
    siete: ventanaDeComidas(todas, hoy, 7),
    treinta: ventanaDeComidas(todas, hoy, 30),
    total: { comidas: todas.length, enlazadas: todas.filter(enlazada).length },
    recetas: masRepetidos(recetas),
    ingredientes: masRepetidos(ingredientes)
  };
}

export function estadisticasDePeso(diarios, hoy, pesoObjetivo) {
  return {
    semana: variacion(diarios, hoy, 7),
    mes: variacion(diarios, hoy, 30),
    total: desdeElPrincipio(diarios),
    objetivo: paraElObjetivo(diarios, pesoObjetivo)
  };
}
