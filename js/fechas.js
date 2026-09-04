// Utilidades de fecha compartidas por pesajes, comidas y ejercicios.
//
// Las fechas se manejan siempre como texto "AAAA-MM-DD" en hora local.
// Nada de toISOString(): eso convierte a UTC y en España puede restar un día.

export function hoyISO() {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");
  return `${ahora.getFullYear()}-${mes}-${dia}`;
}

export function formatearFecha(iso) {
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio}`;
}

// La hora va como texto "HH:MM" en hora local, igual que las fechas: no se
// convierte a ninguna zona horaria ni se guarda como instante.
export function horaDe(momento) {
  const horas = String(momento.getHours()).padStart(2, "0");
  const minutos = String(momento.getMinutes()).padStart(2, "0");
  return `${horas}:${minutos}`;
}

export function horaActual() {
  return horaDe(new Date());
}

// Devuelve el mensaje de error, o null si la hora vale. Vacía es válida: la
// hora es opcional en todos los registros.
export function errorDeHora(hora) {
  if (!hora) return null;
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(hora) ? null : "La hora no es válida.";
}

// Sin cero delante: "8:34", no "08:34".
export function formatearHora(hora) {
  const [horas, minutos] = hora.split(":");
  return `${Number(horas)}:${minutos}`;
}

// Fecha y hora juntas para las listas. Sin hora, solo la fecha.
export function formatearFechaConHora(fecha, hora) {
  return hora ? `${formatearFecha(fecha)} ${formatearHora(hora)}` : formatearFecha(fecha);
}

// Devuelve el mensaje de error, o null si la fecha vale.
export function errorDeFecha(fecha) {
  if (!fecha) return "Introduce una fecha.";
  if (fecha > hoyISO()) return "La fecha no puede ser futura.";
  return null;
}

// Fecha ISO + hora "HH:MM" como instante local, para comparar contra `new
// Date()` (spec 097: saber si una franja fija ya pasó o está en el futuro).
export function instanteDe(fecha, hora) {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const [horas, minutos] = hora.split(":").map(Number);
  return new Date(anio, mes - 1, dia, horas, minutos);
}

// Suma (o resta, con días negativos) días naturales a una fecha ISO y devuelve
// otra fecha ISO. Se construye la fecha a mediodía: así un cambio de horario de
// verano no puede empujar el resultado al día anterior o al siguiente.
export function sumarDias(iso, dias) {
  const [anio, mes, dia] = iso.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia, 12);
  fecha.setDate(fecha.getDate() + dias);
  const mesNuevo = String(fecha.getMonth() + 1).padStart(2, "0");
  const diaNuevo = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mesNuevo}-${diaNuevo}`;
}

// Días naturales entre dos fechas ISO (b - a). Mismo truco del mediodía.
export function diasEntre(isoA, isoB) {
  const aMedianoche = (iso) => {
    const [anio, mes, dia] = iso.split("-").map(Number);
    return new Date(anio, mes - 1, dia, 12).getTime();
  };
  return Math.round((aMedianoche(isoB) - aMedianoche(isoA)) / 86400000);
}

// Lista de fechas ISO desde `desde` hasta `hasta`, ambas incluidas.
export function rangoDeFechas(desde, hasta) {
  const fechas = [];
  for (let dia = desde; dia <= hasta; dia = sumarDias(dia, 1)) {
    fechas.push(dia);
  }
  return fechas;
}

// Día de la semana con el lunes como 0 y el domingo como 6, que es como se
// pinta el calendario. getDay() usa el domingo como 0, de ahí el ajuste.
export function diaDeLaSemana(iso) {
  const [anio, mes, dia] = iso.split("-").map(Number);
  return (new Date(anio, mes - 1, dia, 12).getDay() + 6) % 7;
}

// Ordena de más reciente a más antiguo por fecha, luego por hora y, a
// igualdad, por creadoEn.
//
// Los registros sin hora van DESPUÉS de los que la tienen: si no, uno antiguo
// sin hora se colaría por delante de los de esta mañana.
//
// creadoEn es null en el instante en que el servidor aún no ha resuelto
// serverTimestamp(); ese documento se considera el más reciente.
export function compararPorFechaYCreacion(a, b) {
  if (a.fecha !== b.fecha) return a.fecha < b.fecha ? 1 : -1;

  if (a.hora !== b.hora) {
    if (!a.hora) return 1;
    if (!b.hora) return -1;
    return a.hora < b.hora ? 1 : -1;
  }

  const msA = a.creadoEn ? a.creadoEn.toMillis() : Infinity;
  const msB = b.creadoEn ? b.creadoEn.toMillis() : Infinity;
  return msB - msA;
}
