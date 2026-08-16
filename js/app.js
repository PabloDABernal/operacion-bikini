// Arranque de la app, pestañas y conexión de los tres registros.

import {
  entrarConEmail,
  entrarConGoogle,
  salir,
  observarSesion,
  mensajeDeError,
  ERROR_NO_AUTORIZADO
} from "./auth.js";

import {
  hoyISO,
  horaActual,
  sumarDias,
  formatearFecha,
  formatearHora,
  formatearFechaConHora,
  compararPorFechaYCreacion
} from "./fechas.js";

import { pesosPorDia, mediaMovil, calendarioDeConstancia } from "./grafica.js";

import { estadisticasDePeso } from "./estadisticas.js";

import {
  dibujarGrafica,
  dibujarCalendario,
  textoDeCasilla
} from "./grafica-svg.js";

import {
  dibujarCalendarioMes,
  MAXIMO_SEMANAS_CALENDARIO
} from "./calendario.js";

import { loDeSiempre } from "./hoy.js";

import {
  validarPesaje,
  guardarPesaje,
  actualizarPesaje,
  listarPesajes,
  borrarPesaje
} from "./pesajes.js";

import {
  validarReceta,
  guardarReceta,
  actualizarReceta,
  listarRecetas,
  borrarReceta
} from "./recetas.js";

import {
  MOMENTOS,
  MOMENTO_POR_DEFECTO,
  etiquetaDeMomento,
  validarComida,
  guardarComida,
  actualizarComida,
  listarComidas,
  borrarComida
} from "./comidas.js";

import {
  INTENSIDADES,
  INTENSIDAD_POR_DEFECTO,
  etiquetaDeIntensidad,
  validarEjercicio,
  guardarEjercicio,
  actualizarEjercicio,
  listarEjercicios,
  borrarEjercicio
} from "./ejercicios.js";

import {
  MENSAJES_POR_DIA,
  MAXIMO_CARACTERES,
  hiloDeConversacion,
  quedanMensajesHoy,
  hiloCompleto,
  enviarMensaje,
  consejosAntiguos
} from "./conversacion.js";

import {
  MAXIMO_CARACTERES_RESPUESTA,
  listarConsultas,
  listarPlanes,
  consultaEnCurso,
  quedanConsultasHoy,
  empezarConsulta,
  responder,
  abandonarConsulta,
  TIPOS_ESPECIALIZADOS,
  etiquetaDePlan,
  pedirPlanEspecializado,
  quedanPlanesHoy,
  PLANES_POR_DIA,
  mensajeDeErrorDeConsulta
} from "./consulta.js";

import {
  listarFotos,
  subirFotoDeHoy,
  borrarFoto,
  hayFotoDeHoy,
  miniaturaDe,
  mensajeDeErrorDeFoto
} from "./fotos.js";

import {
  validarAjustes,
  leerAjustes,
  guardarAjustes,
  guardarFotoPerfil
} from "./ajustes.js";

import { subirFotoDePerfil, recorteRedondo } from "./perfil.js";

import {
  listarOperaciones,
  operacionActiva,
  operacionAMedias,
  calcularResumen,
  cerrarOperacion,
  archivar,
  leerArchivo,
  COLECCIONES,
  NOMBRES
} from "./operaciones.js";

import {
  TIPOS,
  contarTodo,
  describirSeleccion,
  borrarSeleccion
} from "./reinicio.js";

const pantallas = {
  cargando: document.getElementById("pantalla-cargando"),
  login: document.getElementById("pantalla-login"),
  principal: document.getElementById("pantalla-principal")
};

const formLogin = document.getElementById("form-login");
const inputEmail = document.getElementById("email");
const inputPassword = document.getElementById("password");
const btnEntrar = document.getElementById("btn-entrar");
const btnGoogle = document.getElementById("btn-google");
const errorLogin = document.getElementById("error-login");

const emailUsuario = document.getElementById("email-usuario");
const btnSalir = document.getElementById("btn-salir");

let uidActual = null;

function mostrar(nombre) {
  Object.entries(pantallas).forEach(([clave, elemento]) => {
    elemento.classList.toggle("oculta", clave !== nombre);
  });
}

function id(nombre) {
  return document.getElementById(nombre);
}

// --- Pestañas ------------------------------------------------------------

const PESTANA_INICIAL = "hoy";

function abrirPestana(nombre) {
  document.querySelectorAll(".seccion").forEach((seccion) => {
    seccion.classList.toggle("activa", seccion.dataset.seccion === nombre);
  });

  document.querySelectorAll(".nav-boton").forEach((boton) => {
    boton.classList.toggle("activa", boton.dataset.seccion === nombre);
  });

  // Desde arriba: al cambiar de sección se ve el principio, no donde te
  // quedaste en la sección anterior.
  window.scrollTo(0, 0);
}

// La barra y los atajos provisionales de Ajustes hacen lo mismo: llevar a una
// sección. El botón lo dice en su data-seccion.
document.querySelectorAll(".nav-boton, .atajo").forEach((boton) => {
  boton.addEventListener("click", () => abrirPestana(boton.dataset.seccion));
});

// Confirmación breve al guardar: sin esto, guardar un pesaje no produce
// ninguna señal visible más allá de que el campo se vacía.
function avisarGuardado(elementoId) {
  const aviso = id(elementoId);
  aviso.textContent = "Guardado";
  setTimeout(() => {
    aviso.textContent = "";
  }, 3000);
}

// --- Login ---------------------------------------------------------------

formLogin.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  errorLogin.textContent = "";

  const email = inputEmail.value.trim();
  const password = inputPassword.value;

  if (!email || !password) {
    errorLogin.textContent = "Rellena email y contraseña.";
    return;
  }

  btnEntrar.disabled = true;
  try {
    await entrarConEmail(email, password);
  } catch (error) {
    errorLogin.textContent = mensajeDeError(error.code);
  } finally {
    btnEntrar.disabled = false;
  }
});

btnGoogle.addEventListener("click", async () => {
  errorLogin.textContent = "";
  btnGoogle.disabled = true;
  try {
    await entrarConGoogle();
  } catch (error) {
    errorLogin.textContent = mensajeDeError(error.code);
  } finally {
    btnGoogle.disabled = false;
  }
});

btnSalir.addEventListener("click", () => salir());

// --- Foto de perfil ------------------------------------------------------

// Sin foto se enseña la inicial del email. El email siempre viene de Firebase
// Auth, pero por si acaso queda un interrogante en vez de un círculo mudo.
// El email del usuario, para cuando aún no ha dicho cómo quiere que le llamen.
let emailActual = "";

// La cabecera enseña el nombre si lo hay. Un email largo partido en tres
// líneas quedaba fatal, y además nadie quiere que su app le llame por su
// correo.
function pintarNombre(nombre) {
  emailUsuario.textContent = nombre || emailActual;
}

function pintarAvatar(url, email) {
  [id("btn-perfil"), id("avatar-ajustes")].forEach((avatar) => {
    avatar.innerHTML = "";

    if (url) {
      const imagen = document.createElement("img");
      imagen.src = recorteRedondo(url);
      imagen.alt = "";
      avatar.appendChild(imagen);
      return;
    }

    avatar.textContent = (email || "?").charAt(0).toUpperCase();
  });
}

// El avatar es la puerta de Ajustes desde la spec 024: la barra se quedó con
// cinco botones para que cupiera Consulta.
id("btn-perfil").addEventListener("click", () => abrirPestana("ajustes"));
id("btn-cambiar-foto").addEventListener("click", () => id("archivo-perfil").click());

id("archivo-perfil").addEventListener("change", async (evento) => {
  const archivo = evento.target.files[0];
  if (!archivo) return;

  const estado = id("estado-perfil");
  const boton = id("btn-cambiar-foto");

  estado.textContent = "Subiendo…";
  boton.disabled = true;

  try {
    const url = await subirFotoDePerfil(archivo);
    await guardarFotoPerfil(uidActual, url);
    pintarAvatar(url, emailActual);
    estado.textContent = "";
  } catch {
    estado.textContent = "No se ha podido subir la foto. Comprueba tu conexión.";
  } finally {
    boton.disabled = false;
    // Sin esto, elegir el mismo archivo dos veces seguidas no dispara nada.
    evento.target.value = "";
  }
});

// --- Listas de registros -------------------------------------------------

// Cuántos registros (o días, en comidas y ejercicio) se ven sin desplegar.
const RECORTE = 3;

// Las tres listas (pesajes, comidas, ejercicios) se comportan igual: cargan,
// pintan filas, permiten editar y borrar, y avisan si falla la conexión. Esto
// monta una.
//
// Los registros cargados se guardan aquí en memoria y `pintar()` trabaja solo
// con ellos: abrir, cancelar o cambiar de fila en edición no vuelve a llamar a
// Firestore. Solo `refrescar()` (guardar, borrar, reintentar) va a la red.
function crearLista(config) {
  const lista = id(config.lista);
  const estado = id(config.estado);
  const reintentar = id(config.reintentar);
  const error = id(config.error);

  const filtro = id(config.filtro);
  const botonQuitarFiltro = id(config.quitarFiltro);
  const botonDesplegar = id(config.desplegar);

  let registros = [];
  let editandoId = null;
  let desplegada = false;

  // Qué se ve de todo lo cargado: el filtro manda sobre el recorte, y con
  // filtro puesto se enseña el día entero.
  function visibles() {
    if (filtro.value) {
      return registros.filter((registro) => registro.fecha === filtro.value);
    }
    if (desplegada) return registros;

    // En peso se recortan registros; en comidas y ejercicio, días: un día con
    // cinco comidas no debe comerse la lista entera.
    if (config.recortarPorDias) {
      const dias = [...new Set(registros.map((registro) => registro.fecha))];
      const ultimos = dias.slice(0, RECORTE);
      return registros.filter((registro) => ultimos.includes(registro.fecha));
    }
    return registros.slice(0, RECORTE);
  }

  function pintar() {
    const aPintar = visibles();

    lista.innerHTML = "";
    estado.textContent = aPintar.length
      ? ""
      : filtro.value
        ? config.textoSinEseDia
        : config.textoVacio;

    aPintar.forEach((registro) => {
      lista.appendChild(
        registro.id === editandoId ? filaEditable(registro) : filaDeLectura(registro)
      );
    });

    botonQuitarFiltro.classList.toggle("oculta", !filtro.value);

    // El botón de desplegar sobra si no hay nada escondido, y con filtro
    // puesto se enseña el día entero, así que tampoco pinta nada.
    const hayEscondidos = !filtro.value && aPintar.length < registros.length;
    botonDesplegar.classList.toggle("oculta", !hayEscondidos && !desplegada);
    botonDesplegar.textContent = desplegada
      ? "Ver menos"
      : `Ver todos (${registros.length})`;
  }

  filtro.addEventListener("change", () => {
    editandoId = null;
    pintar();
  });

  botonQuitarFiltro.addEventListener("click", () => {
    filtro.value = "";
    // Vuelve a recortada, no a como estuviera antes: un solo estado.
    desplegada = false;
    pintar();
  });

  botonDesplegar.addEventListener("click", () => {
    desplegada = !desplegada;
    pintar();
  });

  function filaDeLectura(registro) {
    const fila = document.createElement("li");

    const botonEditar = botonDeFila("Editar", () => {
      // Solo una fila en edición a la vez: abrir esta cierra la anterior y
      // descarta lo que hubiera escrito, sin preguntar.
      editandoId = registro.id;
      error.textContent = "";
      pintar();
    });

    const botonBorrar = botonDeFila("Borrar", () => borrar(registro.id, botonBorrar));

    fila.append(...config.celdas(registro), botonEditar, botonBorrar);
    return fila;
  }

  function filaEditable(registro) {
    const fila = document.createElement("li");
    fila.className = "fila-edicion";

    const campos = config.campos(registro);

    const botonGuardar = botonDeFila("Guardar", () =>
      guardar(registro.id, campos, botonGuardar)
    );
    const botonCancelar = botonDeFila("Cancelar", () => {
      editandoId = null;
      error.textContent = "";
      pintar();
    });

    fila.append(...campos.elementos, botonGuardar, botonCancelar);
    return fila;
  }

  async function guardar(registroId, campos, botonGuardar) {
    error.textContent = "";

    // Los mismos validadores y los mismos mensajes que el formulario de alta.
    const resultado = campos.validar();
    if (resultado.error) {
      error.textContent = resultado.error;
      return;
    }

    botonGuardar.disabled = true;
    try {
      await config.actualizar(uidActual, registroId, resultado);
      // refrescar() recarga y reordena: si ha cambiado la fecha, la fila se
      // coloca sola donde le toca.
      await refrescar();
    } catch {
      error.textContent = "No se ha podido guardar. Comprueba tu conexión.";
      botonGuardar.disabled = false;
    }
  }

  async function refrescar() {
    reintentar.classList.add("oculta");
    // Una recarga cierra cualquier edición abierta: puede venir de otra parte
    // de la app (un reinicio de datos desde Ajustes) y los datos ya no valen.
    editandoId = null;
    try {
      registros = await config.cargar(uidActual);
      pintar();
    } catch {
      registros = [];
      lista.innerHTML = "";
      estado.textContent = config.errorCarga;
      reintentar.classList.remove("oculta");
    }
    // La gráfica se alimenta de estos mismos datos, sin volver a leerlos de
    // Firestore. Se avisa también cuando la carga falla: así se repinta vacía
    // en vez de quedarse enseñando lo de antes.
    if (config.alRefrescar) config.alRefrescar();
  }

  async function borrar(registroId, botonBorrar) {
    if (!confirm(config.confirmacionBorrado)) return;

    botonBorrar.disabled = true;
    try {
      await config.borrar(uidActual, registroId);
      await refrescar();
    } catch {
      error.textContent = "No se ha podido borrar. Comprueba tu conexión.";
      botonBorrar.disabled = false;
    }
  }

  reintentar.addEventListener("click", refrescar);

  return { refrescar, obtenerRegistros: () => registros };
}

function celda(texto, clase) {
  const elemento = document.createElement("span");
  elemento.className = clase;
  elemento.textContent = texto;
  return elemento;
}

function botonDeFila(texto, alPulsar) {
  const elemento = document.createElement("button");
  elemento.type = "button";
  elemento.textContent = texto;
  elemento.addEventListener("click", alPulsar);
  return elemento;
}

// --- Campos de una fila en edición ---------------------------------------

function campoFecha(valor) {
  const elemento = document.createElement("input");
  elemento.type = "date";
  elemento.value = valor;
  elemento.className = "edicion-fecha";
  return elemento;
}

function campoHoraEdicion(valor) {
  const elemento = document.createElement("input");
  elemento.type = "time";
  elemento.value = valor || "";
  elemento.className = "edicion-hora";
  return elemento;
}

function campoTexto(valor, clase, modo) {
  const elemento = document.createElement("input");
  elemento.type = "text";
  elemento.value = valor;
  elemento.className = clase;
  if (modo) elemento.inputMode = modo;
  return elemento;
}

function campoArea(valor, clase) {
  const elemento = document.createElement("textarea");
  elemento.rows = 2;
  elemento.value = valor;
  elemento.className = clase;
  return elemento;
}

// rellenarDesplegable() no sirve aquí: siempre selecciona el valor por
// defecto, y al editar hay que dejar puesto el del registro.
function campoDesplegable(opciones, valorActual, clase) {
  const elemento = document.createElement("select");
  elemento.className = clase;
  opciones.forEach(({ valor, etiqueta }) => {
    const opcion = document.createElement("option");
    opcion.value = valor;
    opcion.textContent = etiqueta;
    elemento.appendChild(opcion);
  });
  elemento.value = valorActual;
  return elemento;
}

// --- Gráfica de peso -----------------------------------------------------

// El peso objetivo vive en Ajustes; se cachea aquí para que la gráfica no
// tenga que volver a leerlo de Firestore cada vez que se repinta.
let pesoObjetivoActual = null;

// --- Estadísticas de peso ------------------------------------------------

// Ni verde ni rojo: se premia la conducta, no los kilos (PRODUCTO.md).
function conSigno(kg) {
  const signo = kg > 0 ? "+" : "−";
  return `${signo}${Math.abs(kg).toFixed(1).replace(".", ",")} kg`;
}

function lineaDeEstadistica(etiqueta, valor, detalle) {
  const fila = document.createElement("li");
  fila.append(celda(etiqueta, "resumen-etiqueta"), celda(valor, "resumen-valor"));
  if (detalle) fila.appendChild(celda(detalle, "registro-detalle"));
  return fila;
}

function pintarEstadisticas(diarios) {
  const { semana, mes, total, objetivo } = estadisticasDePeso(
    diarios,
    hoyISO(),
    pesoObjetivoActual
  );
  const lista = id("estadisticas");
  const sinDatos = "Aún no hay datos suficientes";

  const variacion = (valor, textoIgual) => {
    if (valor === null) return sinDatos;
    return valor === 0 ? textoIgual : conSigno(valor);
  };

  lista.innerHTML = "";
  lista.append(
    lineaDeEstadistica(
      "Últimos 7 días",
      variacion(semana, "Igual que la semana pasada")
    ),
    lineaDeEstadistica("Últimos 30 días", variacion(mes, "Igual que hace un mes")),
    lineaDeEstadistica(
      "Desde que empezaste",
      total ? conSigno(total.diferencia) : "Necesitas al menos dos pesajes",
      total ? `en ${total.dias} ${total.dias === 1 ? "día" : "días"}` : ""
    ),
    lineaDeEstadistica(
      "Para el objetivo",
      !objetivo
        ? "Ponte un peso objetivo en Ajustes"
        : objetivo.alcanzado
          ? "¡Objetivo alcanzado!"
          : `Te faltan ${objetivo.faltan.toFixed(1).replace(".", ",")} kg`
    )
  );
}

const RANGOS_GRAFICA = [
  { etiqueta: "1 sem", dias: 7 },
  { etiqueta: "1 mes", dias: 30 },
  { etiqueta: "3 meses", dias: 90 },
  { etiqueta: "6 meses", dias: 180 },
  { etiqueta: "1 año", dias: 365 },
  { etiqueta: "Todo", dias: null }
];

let diasGrafica = 30;

function pintarRangosGrafica() {
  const contenedor = id("rangos-grafica");
  contenedor.innerHTML = "";

  RANGOS_GRAFICA.forEach(({ etiqueta, dias }) => {
    const boton = botonDeFila(etiqueta, () => {
      diasGrafica = dias;
      refrescarGrafica();
    });
    boton.className = "rango";
    boton.classList.toggle("activa", dias === diasGrafica);
    contenedor.appendChild(boton);
  });
}

function refrescarGrafica() {
  const pesajes = listaPeso.obtenerRegistros();

  // La media móvil se calcula con TODOS los pesajes y solo después se recorta
  // la ventana que se pinta: si se calculara sobre lo visible, los primeros
  // días de cada rango enseñarían una media inventada.
  const todos = mediaMovil(pesosPorDia(pesajes));
  const desde = diasGrafica === null ? null : sumarDias(hoyISO(), -(diasGrafica - 1));
  const diarios = desde ? todos.filter((dia) => dia.fecha >= desde) : todos;

  const contenedor = id("grafica-peso");
  const vacia = id("grafica-vacia");
  contenedor.innerHTML = "";

  pintarRangosGrafica();

  const svg = dibujarGrafica(diarios, pesoObjetivoActual, diarios.length);
  if (svg) {
    contenedor.appendChild(svg);
    vacia.textContent = "";
  } else {
    vacia.textContent = "Apunta algún pesaje más para ver la evolución.";
  }

  // Las estadísticas miran siempre todo el historial: si cambiaran con el
  // rango, "últimos 7 días" significaría cosas distintas según un botón.
  pintarEstadisticas(todos);
}

// --- Hoy -----------------------------------------------------------------

const FORMATO_FECHA_LARGA = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long"
});

function fechaLarga(iso) {
  const [anio, mes, dia] = iso.split("-").map(Number);
  return FORMATO_FECHA_LARGA.format(new Date(anio, mes - 1, dia, 12));
}

// Una línea del resumen: la etiqueta, lo último apuntado hoy (si hay algo) y
// un + que lleva a la pantalla donde se apunta. Sin nada apuntado, solo el +.
function conHora(registro, texto) {
  return registro.hora ? `${texto} · ${formatearHora(registro.hora)}` : texto;
}

function lineaDeResumen(etiqueta, ultimo, seccion) {
  const fila = document.createElement("li");
  fila.append(celda(etiqueta, "resumen-etiqueta"), celda(ultimo ?? "", "resumen-valor"));

  const mas = botonDeFila("+", () => abrirPestana(seccion));
  mas.className = "boton-mas";
  mas.setAttribute("aria-label", `Apuntar en ${etiqueta}`);
  fila.appendChild(mas);

  return fila;
}

function pintarResumen(registros) {
  const hoy = hoyISO();
  const lista = id("hoy-resumen");

  // Las listas vienen de más reciente a más antigua, así que lo último de hoy
  // es lo primero que aparece con la fecha de hoy.
  const ultimoDeHoy = (registros) => registros.find((r) => r.fecha === hoy);

  const pesaje = ultimoDeHoy(registros.pesajes);
  const comida = ultimoDeHoy(registros.comidas);
  const ejercicio = ultimoDeHoy(registros.ejercicios);

  lista.innerHTML = "";
  lista.append(
    lineaDeResumen(
      "Peso",
      pesaje
        ? conHora(pesaje, `${pesaje.pesoKg.toFixed(1).replace(".", ",")} kg`)
        : null,
      "peso"
    ),
    lineaDeResumen(
      "Comidas",
      comida ? conHora(comida, comida.texto) : null,
      "comidas"
    ),
    lineaDeResumen(
      "Ejercicio",
      ejercicio ? conHora(ejercicio, `${ejercicio.texto} · ${ejercicio.minutos} min`) : null,
      "ejercicio"
    )
  );
}

// --- Calendario de constancia --------------------------------------------

const RANGOS_CALENDARIO = [
  { etiqueta: "1 sem", semanas: 1 },
  { etiqueta: "2 sem", semanas: 2 },
  { etiqueta: "1 mes", semanas: 4 },
  { etiqueta: "3 meses", semanas: 13 },
  { etiqueta: "6 meses", semanas: 26 },
  { etiqueta: "12 meses", semanas: 52 }
];

const SEMANAS_POR_DEFECTO = 4;

let semanasCalendario = SEMANAS_POR_DEFECTO;

function pintarRangos() {
  const contenedor = id("rangos-calendario");
  contenedor.innerHTML = "";

  RANGOS_CALENDARIO.forEach(({ etiqueta, semanas }) => {
    const boton = botonDeFila(etiqueta, () => {
      semanasCalendario = semanas;
      refrescarHoy();
    });
    boton.className = "rango";
    boton.classList.toggle("activa", semanas === semanasCalendario);
    contenedor.appendChild(boton);
  });
}

function pintarCalendario(registros) {
  const contenedor = id("calendario");
  const detalle = id("calendario-detalle");

  contenedor.innerHTML = "";
  // Al cambiar de rango, la casilla que se estaba mirando puede haber
  // desaparecido, así que el detalle vuelve a empezar.
  detalle.textContent = "Toca un día para ver qué apuntaste.";

  const casillas = calendarioDeConstancia(registros, hoyISO(), semanasCalendario);
  const alTocar = (casilla) => {
    // Con el ratón basta el <title>; en el móvil no hay hover, así que el
    // toque escribe el detalle aquí debajo.
    detalle.textContent = textoDeCasilla(casilla);
  };

  // Cada rango pide una forma distinta: un mapa de calor de dos columnas no
  // comunica nada, y un calendario de 52 semanas no cabe en ninguna pantalla.
  if (semanasCalendario <= MAXIMO_SEMANAS_CALENDARIO) {
    contenedor.style.width = "";
    contenedor.appendChild(dibujarCalendarioMes(casillas, hoyISO(), alTocar));
  } else {
    // El SVG ocupa el 100% del ancho: se le da su tamaño real (12 px por
    // columna) y ese 100% pasa a ser el límite, no el tamaño.
    contenedor.style.width = `${semanasCalendario * 12}px`;
    contenedor.appendChild(dibujarCalendario(casillas, alTocar));
  }
}

function refrescarHoy() {
  const registros = {
    pesajes: listaPeso.obtenerRegistros(),
    comidas: listaComidas.obtenerRegistros(),
    ejercicios: listaEjercicios.obtenerRegistros()
  };

  id("hoy-fecha").textContent = fechaLarga(hoyISO());
  pintarResumen(registros);
  pintarRangos();
  pintarCalendario(registros);
  pintarLoDeSiempre(registros.comidas);
}

// Las tres listas avisan aquí cuando cargan, guardan, editan o borran. Todo
// sale de lo que ya trajeron: ninguna consulta nueva a Firestore.
function refrescarPantallas() {
  refrescarGrafica();
  refrescarHoy();
}

// --- Peso ----------------------------------------------------------------

const listaPeso = crearLista({
  alRefrescar: () => refrescarPantallas(),
  lista: "lista-pesajes",
  estado: "estado-lista",
  reintentar: "btn-reintentar",
  error: "error-pesaje",
  filtro: "filtro-pesajes",
  quitarFiltro: "btn-quitar-filtro-pesajes",
  desplegar: "btn-desplegar-pesajes",
  textoSinEseDia: "No hay pesajes de ese día.",
  textoVacio:
    "Aún no has apuntado ningún pesaje. Pésate al levantarte, antes de desayunar: es el momento más comparable.",
  errorCarga: "No se han podido cargar tus pesajes. Comprueba tu conexión.",
  confirmacionBorrado: "¿Borrar este pesaje?",
  cargar: listarPesajes,
  borrar: borrarPesaje,
  celdas: (pesaje) => [
    celda(formatearFechaConHora(pesaje.fecha, pesaje.hora), "pesaje-fecha"),
    celda(`${pesaje.pesoKg.toFixed(1).replace(".", ",")} kg`, "pesaje-peso")
  ],
  campos: (pesaje) => {
    const fecha = campoFecha(pesaje.fecha);
    const hora = campoHoraEdicion(pesaje.hora);
    const peso = campoTexto(
      pesaje.pesoKg.toFixed(1).replace(".", ","),
      "edicion-peso",
      "decimal"
    );
    return {
      elementos: [fecha, hora, peso],
      validar: () => validarPesaje(peso.value, fecha.value, hora.value)
    };
  },
  actualizar: (uid, pesajeId, valores) =>
    actualizarPesaje(uid, pesajeId, valores.pesoKg, valores.fecha, valores.hora)
});

id("form-pesaje").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const error = id("error-pesaje");
  error.textContent = "";

  const resultado = validarPesaje(
    id("peso").value,
    id("fecha").value,
    id("hora").value
  );
  if (resultado.error) {
    error.textContent = resultado.error;
    return;
  }

  const boton = id("btn-guardar");
  boton.disabled = true;
  try {
    await guardarPesaje(uidActual, resultado.pesoKg, resultado.fecha, resultado.hora);
    avisarGuardado("guardado-pesaje");
    id("peso").value = "";
    id("fecha").value = hoyISO();
    id("hora").value = horaActual();
    await listaPeso.refrescar();
  } catch {
    error.textContent = "No se ha podido guardar. Comprueba tu conexión.";
  } finally {
    boton.disabled = false;
  }
});

// --- Recetas (spec 026) --------------------------------------------------
//
// No usa crearLista(): una receta se pliega y se despliega, y no tiene fecha
// por la que filtrar.

const RECETAS_SIN_DESPLEGAR = 3;

let recetasCargadas = [];
let recetaAbierta = null;
let recetaEditando = null;
let recetasDesplegadas = false;

function pintarRecetas() {
  const contenedor = id("lista-recetas");
  const boton = id("btn-desplegar-recetas");

  contenedor.innerHTML = "";
  id("estado-recetas").textContent = recetasCargadas.length
    ? ""
    : "Aún no tienes recetas. Guarda las que cocinas a menudo y podrás montar dietas con ellas.";

  const visibles = recetasDesplegadas
    ? recetasCargadas
    : recetasCargadas.slice(0, RECETAS_SIN_DESPLEGAR);

  visibles.forEach((receta) => contenedor.appendChild(tarjetaDeReceta(receta)));

  const hayEscondidas = visibles.length < recetasCargadas.length;
  boton.classList.toggle("oculta", !hayEscondidas && !recetasDesplegadas);
  boton.textContent = recetasDesplegadas
    ? "Ver menos"
    : `Ver todas (${recetasCargadas.length})`;
}

function tarjetaDeReceta(receta) {
  const tarjeta = document.createElement("article");
  tarjeta.className = "receta";

  const cabecera = botonDeFila("", () => {
    // Tocar la tarjeta la abre; volver a tocarla la cierra.
    recetaAbierta = recetaAbierta === receta.id ? null : receta.id;
    pintarRecetas();
  });
  cabecera.className = "receta-cabecera";
  cabecera.append(
    celda(receta.nombre, "receta-nombre"),
    celda(`para ${receta.raciones}`, "registro-detalle")
  );
  tarjeta.appendChild(cabecera);

  if (recetaAbierta !== receta.id) return tarjeta;

  const ingredientes = document.createElement("ul");
  ingredientes.className = "receta-ingredientes";
  (receta.ingredientes || []).forEach((ingrediente) => {
    const linea = document.createElement("li");
    linea.textContent = ingrediente;
    ingredientes.appendChild(linea);
  });
  tarjeta.appendChild(ingredientes);

  if (receta.preparacion) {
    const preparacion = document.createElement("p");
    preparacion.className = "receta-preparacion";
    preparacion.textContent = receta.preparacion;
    tarjeta.appendChild(preparacion);
  }

  const acciones = document.createElement("div");
  acciones.className = "receta-acciones";
  acciones.append(
    botonDeFila("Editar", () => editarReceta(receta)),
    botonDeFila("Borrar", () => borrarLaReceta(receta))
  );
  tarjeta.appendChild(acciones);

  return tarjeta;
}

function abrirFormularioDeReceta(receta) {
  recetaEditando = receta ? receta.id : null;

  id("receta-nombre").value = receta ? receta.nombre : "";
  id("receta-raciones").value = receta ? receta.raciones : "";
  id("receta-ingredientes").value = receta ? (receta.ingredientes || []).join("\n") : "";
  id("receta-preparacion").value = receta ? receta.preparacion || "" : "";

  id("error-receta").textContent = "";
  id("form-receta").classList.remove("oculta");
  id("btn-nueva-receta").classList.add("oculta");
  id("receta-nombre").focus();
}

function cerrarFormularioDeReceta() {
  recetaEditando = null;
  id("form-receta").classList.add("oculta");
  id("btn-nueva-receta").classList.remove("oculta");
  id("error-receta").textContent = "";
}

function editarReceta(receta) {
  abrirFormularioDeReceta(receta);
  id("form-receta").scrollIntoView({ block: "center" });
}

async function borrarLaReceta(receta) {
  if (!confirm(`¿Borrar la receta "${receta.nombre}"?`)) return;

  try {
    await borrarReceta(uidActual, receta.id);
    if (recetaAbierta === receta.id) recetaAbierta = null;
    await refrescarRecetas();
  } catch {
    id("error-receta").textContent = "No se ha podido borrar. Comprueba tu conexión.";
  }
}

async function refrescarRecetas() {
  try {
    recetasCargadas = await listarRecetas(uidActual);
  } catch {
    recetasCargadas = [];
    id("estado-recetas").textContent =
      "No se han podido cargar tus recetas. Comprueba tu conexión.";
    return;
  }
  pintarRecetas();
}

id("btn-nueva-receta").addEventListener("click", () => abrirFormularioDeReceta(null));
id("btn-cancelar-receta").addEventListener("click", cerrarFormularioDeReceta);

id("btn-desplegar-recetas").addEventListener("click", () => {
  recetasDesplegadas = !recetasDesplegadas;
  pintarRecetas();
});

id("form-receta").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const error = id("error-receta");
  error.textContent = "";

  const resultado = validarReceta(
    id("receta-nombre").value,
    id("receta-raciones").value,
    id("receta-ingredientes").value,
    id("receta-preparacion").value
  );

  if (resultado.error) {
    error.textContent = resultado.error;
    return;
  }

  const boton = id("btn-guardar-receta");
  boton.disabled = true;

  try {
    if (recetaEditando) {
      await actualizarReceta(uidActual, recetaEditando, resultado);
    } else {
      await guardarReceta(uidActual, resultado);
    }
    avisarGuardado("guardado-receta");
    cerrarFormularioDeReceta();
    await refrescarRecetas();
  } catch {
    error.textContent = "No se ha podido guardar. Comprueba tu conexión.";
  } finally {
    boton.disabled = false;
  }
});

// --- Comidas -------------------------------------------------------------

// "Lo de siempre": las comidas que más repites, para apuntarlas de un toque.
// Vive aquí y no en "Hoy" (donde estuvo en la spec 010) porque su sitio es la
// pantalla donde se apuntan comidas.
function pintarLoDeSiempre(comidas) {
  const bloque = id("bloque-lo-de-siempre");
  const contenedor = id("lo-de-siempre");
  const habituales = loDeSiempre(comidas, hoyISO());

  bloque.classList.toggle("oculta", habituales.length === 0);
  contenedor.innerHTML = "";

  habituales.forEach((habitual) => {
    const boton = botonDeFila(
      `${etiquetaDeMomento(habitual.momento)} · ${habitual.texto}`,
      () => repetirComida(habitual, boton)
    );
    boton.className = "boton-repetir";
    contenedor.appendChild(boton);
  });
}

async function repetirComida(habitual, boton) {
  const error = id("error-repetir");
  error.textContent = "";
  boton.disabled = true;

  try {
    await guardarComida(uidActual, habitual.texto, habitual.momento, hoyISO());
    avisarGuardado("guardado-repetir");
    await listaComidas.refrescar();
  } catch {
    error.textContent = "No se ha podido guardar. Comprueba tu conexión.";
    boton.disabled = false;
  }
}

const listaComidas = crearLista({
  alRefrescar: () => refrescarPantallas(),
  lista: "lista-comidas",
  estado: "estado-comidas",
  reintentar: "btn-reintentar-comidas",
  error: "error-comida",
  filtro: "filtro-comidas",
  quitarFiltro: "btn-quitar-filtro-comidas",
  desplegar: "btn-desplegar-comidas",
  textoSinEseDia: "No hay comidas de ese día.",
  recortarPorDias: true,
  textoVacio:
    'Aún no has apuntado ninguna comida. No hace falta detalle: "lentejas y una manzana" vale.',
  errorCarga: "No se han podido cargar tus comidas. Comprueba tu conexión.",
  confirmacionBorrado: "¿Borrar esta comida?",
  cargar: listarComidas,
  borrar: borrarComida,
  celdas: (comida) => [
    celda(formatearFechaConHora(comida.fecha, comida.hora), "pesaje-fecha"),
    celda(etiquetaDeMomento(comida.momento), "registro-detalle"),
    celda(comida.texto, "registro-texto")
  ],
  campos: (comida) => {
    const fecha = campoFecha(comida.fecha);
    const hora = campoHoraEdicion(comida.hora);
    const momento = campoDesplegable(MOMENTOS, comida.momento, "edicion-momento");
    const texto = campoArea(comida.texto, "edicion-texto");
    return {
      elementos: [fecha, hora, momento, texto],
      validar: () => validarComida(texto.value, momento.value, fecha.value, hora.value)
    };
  },
  actualizar: (uid, comidaId, valores) =>
    actualizarComida(
      uid,
      comidaId,
      valores.texto,
      valores.momento,
      valores.fecha,
      valores.hora
    )
});

id("form-comida").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const error = id("error-comida");
  error.textContent = "";

  const resultado = validarComida(
    id("comida-texto").value,
    id("comida-momento").value,
    id("comida-fecha").value,
    id("comida-hora").value
  );
  if (resultado.error) {
    error.textContent = resultado.error;
    return;
  }

  const boton = id("btn-guardar-comida");
  boton.disabled = true;
  try {
    await guardarComida(
      uidActual,
      resultado.texto,
      resultado.momento,
      resultado.fecha,
      resultado.hora
    );
    avisarGuardado("guardado-comida");
    id("comida-texto").value = "";
    id("comida-momento").value = MOMENTO_POR_DEFECTO;
    id("comida-fecha").value = hoyISO();
    id("comida-hora").value = horaActual();
    await listaComidas.refrescar();
  } catch {
    error.textContent = "No se ha podido guardar. Comprueba tu conexión.";
  } finally {
    boton.disabled = false;
  }
});

// --- Ejercicio -----------------------------------------------------------

const listaEjercicios = crearLista({
  alRefrescar: () => refrescarPantallas(),
  lista: "lista-ejercicios",
  estado: "estado-ejercicios",
  reintentar: "btn-reintentar-ejercicios",
  error: "error-ejercicio",
  filtro: "filtro-ejercicios",
  quitarFiltro: "btn-quitar-filtro-ejercicios",
  desplegar: "btn-desplegar-ejercicios",
  textoSinEseDia: "No hay ejercicios de ese día.",
  recortarPorDias: true,
  textoVacio:
    'Aún no has apuntado ningún ejercicio. Cuenta también andar: "paseo con el carro, 40 minutos".',
  errorCarga: "No se han podido cargar tus ejercicios. Comprueba tu conexión.",
  confirmacionBorrado: "¿Borrar este ejercicio?",
  cargar: listarEjercicios,
  borrar: borrarEjercicio,
  celdas: (ejercicio) => [
    celda(formatearFechaConHora(ejercicio.fecha, ejercicio.hora), "pesaje-fecha"),
    celda(ejercicio.texto, "registro-texto"),
    celda(`${ejercicio.minutos} min`, "registro-detalle"),
    celda(etiquetaDeIntensidad(ejercicio.intensidad), "registro-detalle")
  ],
  campos: (ejercicio) => {
    const fecha = campoFecha(ejercicio.fecha);
    const hora = campoHoraEdicion(ejercicio.hora);
    const texto = campoTexto(ejercicio.texto, "edicion-texto");
    const minutos = campoTexto(String(ejercicio.minutos), "edicion-minutos", "numeric");
    const intensidad = campoDesplegable(
      INTENSIDADES,
      ejercicio.intensidad,
      "edicion-intensidad"
    );
    return {
      elementos: [fecha, hora, texto, minutos, intensidad],
      validar: () =>
        validarEjercicio(
          texto.value,
          minutos.value,
          intensidad.value,
          fecha.value,
          hora.value
        )
    };
  },
  actualizar: (uid, ejercicioId, valores) =>
    actualizarEjercicio(
      uid,
      ejercicioId,
      valores.texto,
      valores.minutos,
      valores.intensidad,
      valores.fecha,
      valores.hora
    )
});

id("form-ejercicio").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const error = id("error-ejercicio");
  error.textContent = "";

  const resultado = validarEjercicio(
    id("ejercicio-texto").value,
    id("ejercicio-minutos").value,
    id("ejercicio-intensidad").value,
    id("ejercicio-fecha").value,
    id("ejercicio-hora").value
  );
  if (resultado.error) {
    error.textContent = resultado.error;
    return;
  }

  const boton = id("btn-guardar-ejercicio");
  boton.disabled = true;
  try {
    await guardarEjercicio(
      uidActual,
      resultado.texto,
      resultado.minutos,
      resultado.intensidad,
      resultado.fecha,
      resultado.hora
    );
    avisarGuardado("guardado-ejercicio");
    id("ejercicio-texto").value = "";
    id("ejercicio-minutos").value = "";
    id("ejercicio-intensidad").value = INTENSIDAD_POR_DEFECTO;
    id("ejercicio-fecha").value = hoyISO();
    id("ejercicio-hora").value = horaActual();
    await listaEjercicios.refrescar();
  } catch {
    error.textContent = "No se ha podido guardar. Comprueba tu conexión.";
  } finally {
    boton.disabled = false;
  }
});

// --- Consejos ------------------------------------------------------------

function formatearFechaYHora(creadoEn) {
  if (!creadoEn) return "";
  const fecha = creadoEn.toDate();
  const dosDigitos = (numero) => String(numero).padStart(2, "0");
  return (
    `${dosDigitos(fecha.getDate())}/${dosDigitos(fecha.getMonth() + 1)}/` +
    `${fecha.getFullYear()} ${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`
  );
}

// --- Conversación con el nutricionista (spec 023) ------------------------
//
// "Consejos" ya no es una sección: los de antes se enseñan aquí dentro, como
// mensajes suyos, y lo nuevo se habla en este hilo.

let hiloAbierto = null;
let consejosDeAntes = [];

function pintarBurbuja(mensaje) {
  const burbuja = document.createElement("div");
  burbuja.className = mensaje.de === "ia" ? "mensaje mensaje-ia" : "mensaje mensaje-usuario";

  if (mensaje.esConsejoAntiguo && mensaje.fecha) {
    const fecha = document.createElement("p");
    fecha.className = "consejo-fecha";
    fecha.textContent = `Consejo del ${formatearFecha(mensaje.fecha)}`;
    burbuja.appendChild(fecha);
  }

  const texto = document.createElement("p");
  texto.textContent = mensaje.texto;
  burbuja.appendChild(texto);

  return burbuja;
}

function pintarConversacion() {
  const contenedor = id("hilo-conversacion");
  const mensajes = hiloCompleto(hiloAbierto, consejosDeAntes);

  contenedor.innerHTML = "";
  mensajes.forEach((mensaje) => contenedor.appendChild(pintarBurbuja(mensaje)));

  if (!mensajes.length) {
    const vacio = document.createElement("p");
    vacio.className = "explicacion";
    vacio.textContent =
      "Cuéntale cómo vas y te responderá con lo que vea en tus registros.";
    contenedor.appendChild(vacio);
  }

  const quedan = quedanMensajesHoy(hiloAbierto);
  id("cupo-conversacion").textContent = quedan
    ? `Te quedan ${quedan} ${quedan === 1 ? "mensaje" : "mensajes"} hoy.`
    : `Has gastado tus ${MENSAJES_POR_DIA} mensajes de hoy. Vuelve mañana.`;

  id("conversacion-texto").disabled = quedan === 0;
  id("btn-enviar-conversacion").disabled = quedan === 0;

  // Lo último dicho es lo que interesa ver.
  contenedor.scrollTop = contenedor.scrollHeight;
}

id("form-conversacion").addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const campo = id("conversacion-texto");
  const error = id("error-conversacion");
  const estado = id("estado-conversacion");
  const texto = campo.value.trim();

  error.textContent = "";
  if (!texto) return;

  if (texto.length > MAXIMO_CARACTERES) {
    error.textContent = `Máximo ${MAXIMO_CARACTERES} caracteres.`;
    return;
  }

  estado.textContent = "Pensando…";
  id("btn-enviar-conversacion").disabled = true;

  try {
    await enviarMensaje(uidActual, hiloAbierto, texto);
    // El mensaje solo se borra del campo si ha llegado: si falla, se reintenta
    // sin volver a escribirlo.
    campo.value = "";
    await refrescarConsulta();
  } catch (fallo) {
    error.textContent = mensajeDeErrorDeConsulta(fallo.codigo);
  } finally {
    estado.textContent = "";
    id("btn-enviar-conversacion").disabled = false;
  }
});

// --- Consulta ------------------------------------------------------------

let consultasCargadas = [];
let planesCargados = [];
let consultaAbierta = null;

// Id de la consulta que se acaba de terminar en esta sesión. Sirve para el
// tercer estado de la pantalla: hilo completo a la vista y botón "Empezar
// otra consulta". Se pierde al recargar, y entonces la pestaña vuelve al
// estado inicial con el plan ya en el historial.
let consultaReciénTerminada = null;

function pintarHilo(consulta) {
  const hilo = id("hilo-consulta");
  hilo.innerHTML = "";
  if (!consulta) return;

  consulta.mensajes.forEach((mensaje) => {
    const burbuja = document.createElement("div");
    burbuja.className = `mensaje mensaje-${mensaje.de}`;
    burbuja.textContent = mensaje.texto;
    hilo.appendChild(burbuja);
  });
}

function pintarPlanes(planes) {
  const contenedor = id("lista-planes");
  contenedor.innerHTML = "";
  id("estado-planes").textContent = planes.length
    ? ""
    : "Aún no tienes ningún plan.";

  planes.forEach((plan) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "plan";

    const fecha = document.createElement("p");
    fecha.className = "consejo-fecha";
    // Los planes de antes de la spec 017 no tienen tipo: son planes completos.
    fecha.textContent = `${etiquetaDePlan(plan)} · ${formatearFechaYHora(plan.creadoEn)}`;
    tarjeta.appendChild(fecha);

    [
      ["Nutrición", plan.nutricion],
      ["Ejercicio", plan.ejercicio]
    ].forEach(([titulo, texto]) => {
      const encabezado = document.createElement("h3");
      encabezado.textContent = titulo;
      const parrafo = document.createElement("p");
      parrafo.textContent = texto;
      tarjeta.append(encabezado, parrafo);
    });

    contenedor.appendChild(tarjeta);
  });
}

// Los tres estados de la pantalla: consulta en curso, recién terminada, y
// sin consulta (con o sin cupo para hoy).
function pintarEstadoConsulta() {
  const enCurso = Boolean(consultaAbierta);
  const quedanHoy = quedanConsultasHoy(consultasCargadas);
  const terminada = enCurso
    ? null
    : consultasCargadas.find((consulta) => consulta.id === consultaReciénTerminada);

  // Sin operación activa, la consulta que toca es la entrevista que abre una
  // nueva (specs 016 y 018).
  const primeraVez = !hayOperacion;

  id("form-respuesta").classList.toggle("oculta", !enCurso);
  id("btn-abandonar").classList.toggle("oculta", !enCurso);
  id("btn-empezar-consulta").classList.toggle("oculta", enCurso);
  id("explicacion-inicial").classList.toggle("oculta", enCurso || !primeraVez);

  // Con operación en marcha se charla; sin ella, lo que toca es la entrevista
  // que la abre. Y mientras la entrevista está a medias, manda ella.
  id("bloque-entrevista").classList.toggle("oculta", hayOperacion && !enCurso);
  id("bloque-conversacion").classList.toggle("oculta", !hayOperacion || enCurso);

  if (enCurso) {
    id("aviso-consulta").textContent = "";
  } else {
    id("btn-empezar-consulta").disabled = !quedanHoy;
    id("btn-empezar-consulta").textContent = primeraVez
      ? "Iniciar operación bikini"
      : terminada
        ? "Empezar otra consulta"
        : "Empezar consulta";
    id("aviso-consulta").textContent = quedanHoy
      ? terminada
        ? "Consulta terminada. Tu plan es el primero de la lista."
        : ""
      : "Ya has pasado consulta 2 veces hoy.";
  }

  pintarHilo(consultaAbierta || terminada);
}

// --- Dietas y tablas de ejercicio (specs 024 y 027) ----------------------
//
// Cada plan vive en su sección: la dieta en Comidas y la tabla en Ejercicio.
// Son siempre la semana entera, con un campo para pedir lo que haga falta y
// su propio cupo diario.
function pintarEspecializadas() {
  Object.keys(TIPOS_ESPECIALIZADOS).forEach((tipo) => {
    const contenedor = id(`pedir-${tipo}`);
    const config = TIPOS_ESPECIALIZADOS[tipo];
    const quedan = quedanPlanesHoy(planesCargados, tipo);

    contenedor.innerHTML = "";
    contenedor.classList.remove("oculta");

    const boton = botonDeFila(`Pedir ${config.etiqueta.toLowerCase()}`, () => {
      id(`form-${tipo}`).classList.remove("oculta");
      contenedor.classList.add("oculta");
      id(`instrucciones-${tipo}`).focus();
    });
    boton.className = "atajo";
    boton.disabled = quedan === 0 || !hayOperacion;
    contenedor.appendChild(boton);

    id(`form-${tipo}`).classList.add("oculta");
    id(`cupo-${tipo}`).textContent = quedan
      ? `Te ${quedan === 1 ? "queda" : "quedan"} ${quedan} de hoy.`
      : `Has pedido tus ${PLANES_POR_DIA} de hoy. Vuelve mañana.`;
  });
}

// Lo último pedido, aquí mismo. Antes esto te mandaba a Consulta, que es
// donde viven los planes, y saltar de pantalla al pedir algo desconcierta.
function pintarUltimoPlan(tipo) {
  const contenedor = id(`ultimo-${tipo}`);
  contenedor.innerHTML = "";

  const plan = planesCargados.find((otro) => otro.tipo === tipo);
  if (!plan) return;

  const tarjeta = document.createElement("article");
  tarjeta.className = "plan";

  const titulo = document.createElement("p");
  titulo.className = "consejo-fecha";
  titulo.textContent = `${etiquetaDePlan(plan)} · ${formatearFechaYHora(plan.creadoEn)}`;
  tarjeta.appendChild(titulo);

  const texto = document.createElement("p");
  texto.textContent = tipo === "dieta" ? plan.nutricion : plan.ejercicio;
  tarjeta.appendChild(texto);

  contenedor.appendChild(tarjeta);
}

Object.keys(TIPOS_ESPECIALIZADOS).forEach((tipo) => {
  id(`btn-cancelar-${tipo}`).addEventListener("click", () => pintarEspecializadas());

  id(`form-${tipo}`).addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const error = id(`error-${tipo}`);
    const estado = id(`estado-${tipo}`);
    error.textContent = "";
    estado.textContent = "Pensando…";
    id(`btn-pedir-${tipo}`).disabled = true;

    try {
      await pedirPlanEspecializado(
        uidActual,
        planesCargados,
        tipo,
        id(`instrucciones-${tipo}`).value
      );
      id(`instrucciones-${tipo}`).value = "";
      await refrescarConsulta();
      // Sin saltar de pantalla: te ha traído lo que pediste, no te manda a
      // otro sitio. El plan se lee desde aquí.
      pintarUltimoPlan(tipo);
    } catch (fallo) {
      error.textContent = mensajeDeErrorDeConsulta(fallo.codigo);
    } finally {
      estado.textContent = "";
      id(`btn-pedir-${tipo}`).disabled = false;
      pintarEspecializadas();
    }
  });
});

async function refrescarConsulta() {
  try {
    const [consultas, planes, consejos] = await Promise.all([
      listarConsultas(uidActual),
      listarPlanes(uidActual),
      consejosAntiguos(uidActual)
    ]);
    consultasCargadas = consultas;
    consejosDeAntes = consejos;
    hiloAbierto = hiloDeConversacion(consultas);
    // La entrevista de bienvenida es un hilo aparte: la conversación no cuenta
    // como "consulta en curso", o su formulario saldría por encima.
    consultaAbierta = consultaEnCurso(
      consultas.filter((consulta) => consulta.modo !== "conversacion")
    );
    planesCargados = planes;
    pintarPlanes(planes);
    pintarEstadoConsulta();
    pintarConversacion();
    pintarEspecializadas();
  } catch {
    id("error-consulta").textContent =
      "No se ha podido cargar tu consulta. Comprueba tu conexión.";
  }
}

// Envuelve las llamadas a la IA: bloquea la pantalla, muestra "Pensando…" y
// traduce el error. Devuelve true si fue bien.
async function conEspera(accion) {
  const error = id("error-consulta");
  error.textContent = "";
  id("estado-consulta").textContent = "Pensando…";
  id("btn-empezar-consulta").disabled = true;
  id("btn-responder").disabled = true;

  try {
    await accion();
    return true;
  } catch (fallo) {
    error.textContent = mensajeDeErrorDeConsulta(fallo.codigo);
    return false;
  } finally {
    id("estado-consulta").textContent = "";
    id("btn-responder").disabled = false;
    id("btn-empezar-consulta").disabled = false;
  }
}

id("btn-empezar-consulta").addEventListener("click", async () => {
  consultaReciénTerminada = null;
  const fueBien = await conEspera(() => empezarConsulta(uidActual, consultasCargadas));
  if (fueBien) await refrescarConsulta();
  else pintarEstadoConsulta();
});

id("form-respuesta").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const campo = id("respuesta-texto");
  const error = id("error-consulta");
  const texto = campo.value.trim();

  if (!texto) {
    error.textContent = "Escribe una respuesta.";
    return;
  }
  if (texto.length > MAXIMO_CARACTERES_RESPUESTA) {
    error.textContent = `Máximo ${MAXIMO_CARACTERES_RESPUESTA} caracteres.`;
    return;
  }

  // La respuesta solo se borra si se ha enviado bien: si falla, se reintenta.
  const idDeLaConsulta = consultaAbierta.id;
  let termino = false;
  let inicial = false;

  const fueBien = await conEspera(async () => {
    ({ termino, inicial } = await responder(uidActual, consultaAbierta, texto));
  });

  if (fueBien) {
    campo.value = "";
    if (termino) consultaReciénTerminada = idDeLaConsulta;
    await refrescarConsulta();
    // La entrevista de bienvenida ha dejado ajustes y perfil guardados: hay
    // que releerlos para que la cabecera y el formulario los enseñen.
    if (termino && inicial) {
      await refrescarAjustes();
      // La entrevista ha creado la operación: hasta ahora no se podía apuntar.
      await refrescarOperaciones();
    }
  }
});

id("btn-abandonar").addEventListener("click", async () => {
  if (!confirm("¿Abandonar esta consulta? Se perderá la conversación.")) return;

  try {
    await abandonarConsulta(uidActual, consultaAbierta.id);
    id("respuesta-texto").value = "";
    await refrescarConsulta();
  } catch {
    id("error-consulta").textContent =
      "No se ha podido abandonar la consulta. Comprueba tu conexión.";
  }
});

// --- Fotos ---------------------------------------------------------------

let fotosCargadas = [];
let fotoEnVisor = null;

function pintarFotos(fotos) {
  const rejilla = id("rejilla-fotos");
  rejilla.innerHTML = "";
  id("estado-fotos").textContent = fotos.length
    ? ""
    : "Aún no has subido ninguna foto.";

  fotos.forEach((foto) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "foto";

    const imagen = document.createElement("img");
    imagen.src = miniaturaDe(foto.url);
    imagen.alt = `Foto del ${formatearFecha(foto.fecha)}`;
    imagen.loading = "lazy";

    const fecha = document.createElement("span");
    fecha.textContent = formatearFecha(foto.fecha);

    boton.append(imagen, fecha);
    boton.addEventListener("click", () => abrirVisor(foto));
    rejilla.appendChild(boton);
  });
}

async function refrescarFotos() {
  try {
    fotosCargadas = await listarFotos(uidActual);
    pintarFotos(fotosCargadas);
  } catch {
    id("estado-fotos").textContent =
      "No se han podido cargar tus fotos. Comprueba tu conexión.";
  }
}

function abrirVisor(foto) {
  fotoEnVisor = foto;
  id("visor-imagen").src = foto.url;
  id("visor-fecha").textContent = formatearFecha(foto.fecha);
  id("visor").classList.remove("oculta");
}

function cerrarVisor() {
  fotoEnVisor = null;
  id("visor").classList.add("oculta");
  id("visor-imagen").src = "";
}

id("btn-cerrar-visor").addEventListener("click", cerrarVisor);

// Cerrar tocando el fondo, pero no al tocar la foto o los botones.
id("visor").addEventListener("click", (evento) => {
  if (evento.target === id("visor")) cerrarVisor();
});

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && fotoEnVisor) cerrarVisor();
});

id("btn-borrar-foto").addEventListener("click", async () => {
  if (!confirm("¿Borrar esta foto?")) return;

  const foto = fotoEnVisor;
  const boton = id("btn-borrar-foto");
  boton.disabled = true;

  try {
    await borrarFoto(uidActual, foto);
    cerrarVisor();
    await refrescarFotos();
  } catch {
    // El visor se queda abierto: la foto sigue ahí y se puede reintentar.
    id("visor-fecha").textContent = "No se ha podido borrar la foto. Inténtalo de nuevo.";
  } finally {
    boton.disabled = false;
  }
});

id("btn-subir-foto").addEventListener("click", () => {
  id("error-foto").textContent = "";

  if (hayFotoDeHoy(fotosCargadas) && !confirm("Ya tienes una foto de hoy. ¿La sustituyes?")) {
    return;
  }

  id("archivo-foto").click();
});

id("archivo-foto").addEventListener("change", async (evento) => {
  const archivo = evento.target.files[0];
  if (!archivo) return;

  const boton = id("btn-subir-foto");
  const estado = id("estado-foto");
  id("error-foto").textContent = "";
  estado.textContent = "Subiendo…";
  boton.disabled = true;

  try {
    await subirFotoDeHoy(uidActual, archivo);
    await refrescarFotos();
  } catch (fallo) {
    id("error-foto").textContent = mensajeDeErrorDeFoto(fallo.codigo);
  } finally {
    estado.textContent = "";
    boton.disabled = false;
    // Sin esto, elegir el mismo archivo dos veces seguidas no dispara nada.
    evento.target.value = "";
  }
});

// Refresca todas las listas de la app. Se usa al entrar y después de un
// borrado, para que ninguna pestaña siga enseñando datos que ya no existen.
function refrescarTodo() {
  return Promise.all([
    listaPeso.refrescar(),
    listaComidas.refrescar(),
    listaEjercicios.refrescar(),
    refrescarConsulta(),
    refrescarFotos(),
    refrescarRecetas()
  ]);
}

// --- Operaciones (spec 018) ----------------------------------------------

let operacionesCargadas = [];
let hayOperacion = false;

// Sin operación activa la app no deja apuntar nada: solo iniciar una. Las
// pantallas de registro enseñan un aviso en lugar de su contenido.
function pintarPuerta() {
  const pendiente = operacionAMedias(operacionesCargadas);

  id("bloque-iniciar").classList.toggle("oculta", hayOperacion);
  id("bloque-hoy").classList.toggle("oculta", !hayOperacion);

  // Empezar otra operación con la anterior a medio archivar mezclaría los
  // registros de las dos: los que quedan sin mover se verían como si fueran
  // de la nueva, y acabarían archivados en la que no toca.
  id("aviso-archivado-pendiente").classList.toggle("oculta", !pendiente);
  id("btn-iniciar-operacion").disabled = Boolean(pendiente);

  document.querySelectorAll(".aviso-sin-operacion").forEach((aviso) => {
    aviso.classList.toggle("oculta", hayOperacion);
  });
  document.querySelectorAll(".contenido-operacion").forEach((contenido) => {
    contenido.classList.toggle("oculta", !hayOperacion);
  });

  // Finalizar solo tiene sentido con una operación en marcha.
  id("bloque-finalizar").classList.toggle("oculta", !hayOperacion);
}

function kg(valor) {
  return `${valor.toFixed(1).replace(".", ",")} kg`;
}

function pintarHistorico() {
  const contenedor = id("lista-historico");
  const archivadas = operacionesCargadas.filter(
    (operacion) => operacion.estado === "archivada"
  );

  contenedor.innerHTML = "";
  id("estado-historico").textContent = archivadas.length
    ? ""
    : "Aún no has cerrado ninguna operación.";

  archivadas.forEach((operacion) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "plan";

    const titulo = document.createElement("h3");
    titulo.textContent = `Operación ${operacion.numero}`;
    tarjeta.appendChild(titulo);

    const fechas = document.createElement("p");
    fechas.className = "consejo-fecha";
    fechas.textContent = `${formatearFecha(operacion.inicio)} → ${formatearFecha(
      operacion.fin
    )}`;
    tarjeta.appendChild(fechas);

    const resumen = operacion.resumen || {};
    const linea = document.createElement("p");

    if (resumen.pesoInicial === null || resumen.pesoInicial === undefined) {
      linea.textContent = "Sin pesajes en esta operación.";
    } else {
      const cambio = Math.round((resumen.pesoFinal - resumen.pesoInicial) * 10) / 10;
      const signo = cambio > 0 ? "+" : "−";
      linea.textContent =
        `${signo}${Math.abs(cambio).toFixed(1).replace(".", ",")} kg · ` +
        `de ${kg(resumen.pesoInicial)} a ${kg(resumen.pesoFinal)}`;
    }
    tarjeta.appendChild(linea);

    const dias = document.createElement("p");
    dias.className = "consejo-fecha";
    dias.textContent = `${resumen.diasRegistrados || 0} días registrados · ${
      resumen.registros || 0
    } registros`;
    tarjeta.appendChild(dias);

    // Una operación a medio archivar no se puede enseñar entera todavía.
    if (operacion.archivando && operacion.archivando.length) {
      const aviso = document.createElement("p");
      aviso.className = "advertencia";
      aviso.textContent = "Archivado sin terminar. Reintenta desde arriba.";
      tarjeta.appendChild(aviso);
    } else {
      tarjeta.appendChild(botonDeFila("Ver", () => abrirArchivo(operacion)));
    }

    contenedor.appendChild(tarjeta);
  });
}

// Los registros de una operación archivada, en solo lectura: ni editar ni
// borrar. Lo movido, movido está.
async function abrirArchivo(operacion) {
  const caja = id("archivo");
  const contenido = id("archivo-contenido");
  const grafica = id("archivo-grafica");

  id("archivo-titulo").textContent = `Operación ${operacion.numero}`;
  id("archivo-estado").textContent = "Cargando…";
  contenido.innerHTML = "";
  grafica.innerHTML = "";
  caja.classList.remove("oculta");

  try {
    const listas = await Promise.all(
      COLECCIONES.map((nombre) => leerArchivo(uidActual, operacion.id, nombre))
    );
    const porNombre = Object.fromEntries(
      COLECCIONES.map((nombre, i) => [nombre, listas[i]])
    );

    id("archivo-estado").textContent = "";

    const pesajes = porNombre.pesajes || [];
    const svg = dibujarGrafica(
      mediaMovil(pesosPorDia(pesajes)),
      null,
      pesajes.length
    );
    if (svg) grafica.appendChild(svg);

    const titular = (texto) => {
      const titulo = document.createElement("h3");
      titulo.textContent = texto;
      contenido.appendChild(titulo);
    };

    ["pesajes", "comidas", "ejercicios"].forEach((nombre) => {
      const registros = [...(porNombre[nombre] || [])].sort(
        compararPorFechaYCreacion
      );
      if (!registros.length) return;

      titular(NOMBRES[nombre]);

      const lista = document.createElement("ul");
      lista.className = "lista-archivo";

      registros.forEach((registro) => {
        const fila = document.createElement("li");
        const detalle =
          nombre === "pesajes"
            ? kg(registro.pesoKg)
            : nombre === "comidas"
              ? registro.texto
              : `${registro.texto} · ${registro.minutos} min`;
        fila.append(
          celda(formatearFechaConHora(registro.fecha, registro.hora), "pesaje-fecha"),
          celda(detalle, "registro-texto")
        );
        lista.appendChild(fila);
      });

      contenido.appendChild(lista);
    });

    // Las fotos siguen en Cloudinary: al archivar solo se movió su documento,
    // así que se ven igual desde aquí.
    const fotos = [...(porNombre.fotos || [])].sort((a, b) =>
      a.fecha < b.fecha ? 1 : -1
    );
    if (fotos.length) {
      titular("fotos");
      const rejilla = document.createElement("div");
      rejilla.className = "rejilla-archivo";
      fotos.forEach((foto) => {
        const figura = document.createElement("figure");
        const imagen = document.createElement("img");
        imagen.src = miniaturaDe(foto.url);
        imagen.alt = `Foto del ${formatearFecha(foto.fecha)}`;
        imagen.loading = "lazy";
        const pie = document.createElement("figcaption");
        pie.textContent = formatearFecha(foto.fecha);
        figura.append(imagen, pie);
        rejilla.appendChild(figura);
      });
      contenido.appendChild(rejilla);
    }

    // Consejos y planes: el texto tal cual, que es lo que vale de ellos.
    [
      ["consejos", "consejos", (documento) => documento.texto],
      [
        "planes",
        "planes",
        (documento) =>
          [documento.nutricion, documento.ejercicio].filter(Boolean).join("\n\n")
      ]
    ].forEach(([nombre, titulo, sacarTexto]) => {
      const documentos = porNombre[nombre] || [];
      if (!documentos.length) return;

      titular(titulo);
      documentos.forEach((documento) => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "consejo";
        const parrafo = document.createElement("p");
        parrafo.textContent = sacarTexto(documento) || "(sin texto)";
        tarjeta.appendChild(parrafo);
        contenido.appendChild(tarjeta);
      });
    });

    // Las consultas no se pintan una a una: son conversaciones largas y lo
    // que queda de ellas es el plan, que sí está arriba. Se dice cuántas hubo.
    const consultas = porNombre.consultas || [];
    if (consultas.length) {
      const nota = document.createElement("p");
      nota.className = "explicacion";
      nota.textContent = `${consultas.length} ${
        consultas.length === 1 ? "consulta guardada" : "consultas guardadas"
      } en esta operación.`;
      contenido.appendChild(nota);
    }
  } catch {
    id("archivo-estado").textContent =
      "No se ha podido cargar el archivo. Comprueba tu conexión.";
  }
}

id("btn-cerrar-archivo").addEventListener("click", () => {
  id("archivo").classList.add("oculta");
});

id("btn-iniciar-operacion").addEventListener("click", () => {
  abrirPestana("consulta");
});

id("btn-finalizar").addEventListener("click", () => {
  id("confirmar-finalizar").classList.remove("oculta");
  id("btn-finalizar").classList.add("oculta");
});

id("btn-finalizar-no").addEventListener("click", () => {
  id("confirmar-finalizar").classList.add("oculta");
  id("btn-finalizar").classList.remove("oculta");
});

id("btn-finalizar-si").addEventListener("click", async () => {
  const estado = id("estado-operacion");
  const error = id("error-operacion");
  error.textContent = "";

  const operacion = operacionActiva(operacionesCargadas);
  if (!operacion) return;

  id("btn-finalizar-si").disabled = true;
  id("btn-finalizar-no").disabled = true;

  try {
    // El resumen se calcula ANTES de mover nada, mientras los registros
    // siguen donde estaban.
    estado.textContent = "Calculando el resumen…";
    const resumen = await calcularResumen(uidActual);

    await cerrarOperacion(uidActual, operacion.id, resumen);
    await archivarPendiente(operacion.id);
  } catch {
    error.textContent =
      "No se ha podido archivar del todo. Puedes reintentarlo sin perder nada.";
  } finally {
    estado.textContent = "";
    id("btn-finalizar-si").disabled = false;
    id("btn-finalizar-no").disabled = false;
    id("confirmar-finalizar").classList.add("oculta");
    id("btn-finalizar").classList.remove("oculta");
    await refrescarOperaciones();
    await refrescarTodo();
  }
});

async function archivarPendiente(operacionId) {
  await archivar(uidActual, operacionId, (queVa) => {
    id("estado-operacion").textContent = `Archivando… (${queVa})`;
  });
  id("estado-operacion").textContent = "Operación finalizada.";
  setTimeout(() => {
    id("estado-operacion").textContent = "";
  }, 4000);
}

id("btn-reintentar-archivado").addEventListener("click", async () => {
  const aMedias = operacionAMedias(operacionesCargadas);
  if (!aMedias) return;

  id("error-operacion").textContent = "";
  id("btn-reintentar-archivado").disabled = true;

  try {
    await archivarPendiente(aMedias.id);
  } catch {
    id("error-operacion").textContent =
      "Sigue sin poder archivarse. Comprueba tu conexión.";
  } finally {
    id("btn-reintentar-archivado").disabled = false;
    await refrescarOperaciones();
    await refrescarTodo();
  }
});

async function refrescarOperaciones() {
  try {
    operacionesCargadas = await listarOperaciones(uidActual);
  } catch {
    operacionesCargadas = [];
  }

  hayOperacion = Boolean(operacionActiva(operacionesCargadas));
  id("btn-reintentar-archivado").classList.toggle(
    "oculta",
    !operacionAMedias(operacionesCargadas)
  );

  pintarPuerta();
  pintarHistorico();

  // La pantalla de Consulta depende de si hay operación: sin esto, al terminar
  // la entrevista de bienvenida seguía enseñando el botón de empezarla en vez
  // de abrir la conversación, hasta recargar la página.
  if (consultasCargadas.length) pintarEstadoConsulta();
}

// --- Ajustes -------------------------------------------------------------

async function refrescarAjustes() {
  try {
    const ajustes = await leerAjustes(uidActual);
    pesoObjetivoActual = ajustes.pesoObjetivoKg ?? null;
    pintarAvatar(ajustes.fotoPerfil, emailActual);
    pintarNombre(ajustes.nombre);
    refrescarGrafica();
    id("nombre").value = ajustes.nombre || "";
    id("perfil").value = ajustes.perfil || "";
    id("peso-objetivo").value =
      ajustes.pesoObjetivoKg == null
        ? ""
        : String(ajustes.pesoObjetivoKg).replace(".", ",");
    id("altura").value = ajustes.alturaCm == null ? "" : ajustes.alturaCm;
    id("fecha-objetivo").value = ajustes.fechaObjetivo || "";
  } catch {
    id("error-ajustes").textContent =
      "No se han podido cargar los ajustes. Comprueba tu conexión.";
  }
}

id("form-ajustes").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const error = id("error-ajustes");
  const aviso = id("aviso-ajustes");
  error.textContent = "";
  aviso.textContent = "";

  const resultado = validarAjustes(
    id("peso-objetivo").value,
    id("altura").value,
    id("fecha-objetivo").value,
    id("nombre").value,
    id("perfil").value
  );

  if (resultado.error) {
    error.textContent = resultado.error;
    return;
  }

  const boton = id("btn-guardar-ajustes");
  boton.disabled = true;
  try {
    await guardarAjustes(uidActual, resultado);
    // La línea de objetivo de la gráfica sale de aquí.
    pesoObjetivoActual = resultado.pesoObjetivoKg ?? null;
    pintarNombre(resultado.nombre);
    refrescarGrafica();
    aviso.textContent = "Ajustes guardados.";
    setTimeout(() => {
      aviso.textContent = "";
    }, 4000);
  } catch {
    error.textContent = "No se han podido guardar los ajustes. Comprueba tu conexión.";
  } finally {
    boton.disabled = false;
  }
});

// --- Reiniciar datos -----------------------------------------------------

let recuentos = {};

// La selección exacta que se le enseñó al usuario en el aviso. Se borra ESTA,
// no lo que digan las casillas en el momento de pulsar: si algo cambiara por
// medio, se borraría algo que el usuario no llegó a leer.
let seleccionAvisada = [];

function seleccionActual() {
  return TIPOS.map((tipo) => tipo.clave).filter(
    (clave) => id(`casilla-${clave}`).checked
  );
}

// Cualquier cambio en las casillas vuelve al principio: no se puede marcar una
// cosa, confirmar, y que acabe borrándose otra.
function reiniciarConfirmacion() {
  seleccionAvisada = [];
  id("confirmacion-reinicio").classList.add("oculta");
  id("palabra-borrar").value = "";
  id("btn-borrar-definitivo").disabled = true;
  id("btn-borrar-seleccion").disabled = seleccionActual().length === 0;
}

function pintarCasillas() {
  const contenedor = id("casillas-reinicio");
  contenedor.innerHTML = "";

  TIPOS.forEach((tipo) => {
    const etiqueta = document.createElement("label");
    etiqueta.className = "casilla-reinicio";

    const casilla = document.createElement("input");
    casilla.type = "checkbox";
    casilla.id = `casilla-${tipo.clave}`;
    casilla.addEventListener("change", reiniciarConfirmacion);

    const texto = document.createElement("span");
    texto.textContent = tipo.etiqueta.charAt(0).toUpperCase() + tipo.etiqueta.slice(1);

    const cuenta = document.createElement("span");
    cuenta.className = "cuenta";
    cuenta.textContent = `(${recuentos[tipo.clave] ?? 0})`;

    etiqueta.append(casilla, texto, cuenta);
    contenedor.appendChild(etiqueta);
  });
}

async function refrescarRecuentos() {
  try {
    recuentos = await contarTodo(uidActual);
    pintarCasillas();
    reiniciarConfirmacion();
  } catch {
    id("error-reinicio").textContent =
      "No se han podido contar tus datos. Comprueba tu conexión.";
  }
}

// Paso 1: enseñar exactamente qué se va a borrar, con números.
id("btn-borrar-seleccion").addEventListener("click", () => {
  const seleccion = seleccionActual();
  if (!seleccion.length) return;

  seleccionAvisada = seleccion;
  const resumen = describirSeleccion(seleccion, recuentos);
  id("error-reinicio").textContent = "";
  id("aviso-reinicio").textContent = resumen
    ? `Vas a borrar para siempre: ${resumen}.`
    : "No hay nada que borrar de lo que has marcado.";
  id("confirmacion-reinicio").classList.remove("oculta");
});

// Paso 2: la palabra exacta, en mayúsculas.
id("palabra-borrar").addEventListener("input", (evento) => {
  id("btn-borrar-definitivo").disabled = evento.target.value !== "BORRAR";
});

// Paso 3: la confirmación del navegador, y solo entonces se borra.
id("btn-borrar-definitivo").addEventListener("click", async () => {
  const seleccion = seleccionAvisada;
  if (!seleccion.length) return;

  if (!confirm("¿Seguro? Esta acción no se puede deshacer.")) return;

  const estado = id("estado-reinicio");
  const error = id("error-reinicio");

  error.textContent = "";
  estado.textContent = "Borrando…";
  id("btn-borrar-definitivo").disabled = true;
  id("btn-borrar-seleccion").disabled = true;

  try {
    await borrarSeleccion(uidActual, seleccion);
    estado.textContent = "Datos borrados.";
    await refrescarRecuentos();
    await refrescarTodo();
  } catch {
    // Las casillas y la palabra se quedan como están, para reintentar de un
    // clic. Los recuentos sí se actualizan: enseñan qué llegó a borrarse.
    estado.textContent = "";
    error.textContent = "No se han podido borrar todos los datos. Vuelve a intentarlo.";
    recuentos = await contarTodo(uidActual).catch(() => recuentos);
    pintarCasillas();
    seleccion.forEach((clave) => {
      id(`casilla-${clave}`).checked = true;
    });
    id("btn-borrar-definitivo").disabled = false;
    id("btn-borrar-seleccion").disabled = false;
  }
});

// --- Arranque ------------------------------------------------------------

function rellenarDesplegable(elementoId, opciones, porDefecto) {
  const select = id(elementoId);
  select.innerHTML = "";
  opciones.forEach(({ valor, etiqueta }) => {
    const opcion = document.createElement("option");
    opcion.value = valor;
    opcion.textContent = etiqueta;
    select.appendChild(opcion);
  });
  select.value = porDefecto;
}

function limpiarFormularios() {
  ["peso", "comida-texto", "ejercicio-texto", "ejercicio-minutos"].forEach(
    (campo) => {
      id(campo).value = "";
    }
  );
  ["fecha", "comida-fecha", "ejercicio-fecha"].forEach((campo) => {
    id(campo).value = hoyISO();
  });
  // La hora se propone, no se impone: viene rellena y se puede vaciar.
  ["hora", "comida-hora", "ejercicio-hora"].forEach((campo) => {
    id(campo).value = horaActual();
  });
  rellenarDesplegable("comida-momento", MOMENTOS, MOMENTO_POR_DEFECTO);
  rellenarDesplegable("ejercicio-intensidad", INTENSIDADES, INTENSIDAD_POR_DEFECTO);
  [
    "error-pesaje",
    "error-comida",
    "error-ejercicio",
    "error-consulta",
    "error-conversacion",
    "error-foto",
    "error-ajustes",
    "aviso-ajustes",
    "error-reinicio",
    "estado-reinicio"
  ].forEach((campo) => {
    id(campo).textContent = "";
  });
  id("estado-consulta").textContent = "";
  id("estado-foto").textContent = "";
  cerrarVisor();
  id("respuesta-texto").value = "";
  consultaReciénTerminada = null;
}

observarSesion(
  (usuario) => {
    if (!usuario) {
      uidActual = null;
      mostrar("login");
      return;
    }

    uidActual = usuario.uid;
    emailActual = usuario.email;
    // El email y la inicial mientras llegan los ajustes; si hay nombre o foto,
    // los pinta encima refrescarAjustes() en cuanto los lee.
    pintarNombre("");
    pintarAvatar(null, usuario.email);
    limpiarFormularios();
    errorLogin.textContent = "";
    inputPassword.value = "";
    abrirPestana(PESTANA_INICIAL);
    mostrar("principal");

    id("email-ajustes").textContent = usuario.email;
    // Con await: refrescarTodo() pinta la pestaña Consulta, que necesita saber
    // si hay operación activa. Sin esperar aquí, se pintaba con el valor de
    // antes de leerlo.
    refrescarOperaciones().then(refrescarTodo);
    refrescarAjustes();
    refrescarRecuentos();
  },
  () => {
    uidActual = null;
    mostrar("login");
    errorLogin.textContent = mensajeDeError(ERROR_NO_AUTORIZADO);
  }
);
