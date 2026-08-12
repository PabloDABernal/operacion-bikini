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

// Devuelve el mensaje de error, o null si la fecha vale.
export function errorDeFecha(fecha) {
  if (!fecha) return "Introduce una fecha.";
  if (fecha > hoyISO()) return "La fecha no puede ser futura.";
  return null;
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

// Ordena de más reciente a más antiguo por fecha y, a igualdad, por creadoEn.
// creadoEn es null en el instante en que el servidor aún no ha resuelto
// serverTimestamp(); ese documento se considera el más reciente.
export function compararPorFechaYCreacion(a, b) {
  if (a.fecha !== b.fecha) return a.fecha < b.fecha ? 1 : -1;
  const msA = a.creadoEn ? a.creadoEn.toMillis() : Infinity;
  const msB = b.creadoEn ? b.creadoEn.toMillis() : Infinity;
  return msB - msA;
}
