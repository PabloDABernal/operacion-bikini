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

// Ordena de más reciente a más antiguo por fecha y, a igualdad, por creadoEn.
// creadoEn es null en el instante en que el servidor aún no ha resuelto
// serverTimestamp(); ese documento se considera el más reciente.
export function compararPorFechaYCreacion(a, b) {
  if (a.fecha !== b.fecha) return a.fecha < b.fecha ? 1 : -1;
  const msA = a.creadoEn ? a.creadoEn.toMillis() : Infinity;
  const msB = b.creadoEn ? b.creadoEn.toMillis() : Infinity;
  return msB - msA;
}
