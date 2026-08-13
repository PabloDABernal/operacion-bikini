// Arranque de la app, pestañas y conexión de los tres registros.

import {
  entrarConEmail,
  entrarConGoogle,
  salir,
  observarSesion,
  mensajeDeError,
  ERROR_NO_AUTORIZADO
} from "./auth.js";

import { hoyISO, formatearFecha } from "./fechas.js";

import {
  pesosPorDia,
  mediaMovil,
  compararSemanas,
  calendarioDeConstancia
} from "./grafica.js";

import {
  dibujarGrafica,
  dibujarCalendario,
  textoDeCasilla
} from "./grafica-svg.js";

import { loDeSiempre } from "./hoy.js";

import {
  validarPesaje,
  guardarPesaje,
  actualizarPesaje,
  listarPesajes,
  borrarPesaje
} from "./pesajes.js";

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
  pedirConsejo,
  listarConsejos,
  mensajeDeErrorDeConsejo
} from "./consejos.js";

import {
  MAXIMO_CARACTERES_RESPUESTA,
  listarConsultas,
  listarPlanes,
  consultaEnCurso,
  quedanConsultasHoy,
  empezarConsulta,
  responder,
  abandonarConsulta,
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
  const avatar = id("btn-perfil");
  avatar.innerHTML = "";

  if (url) {
    const imagen = document.createElement("img");
    imagen.src = recorteRedondo(url);
    imagen.alt = "";
    avatar.appendChild(imagen);
    return;
  }

  avatar.textContent = (email || "?").charAt(0).toUpperCase();
}

id("btn-perfil").addEventListener("click", () => id("archivo-perfil").click());

id("archivo-perfil").addEventListener("change", async (evento) => {
  const archivo = evento.target.files[0];
  if (!archivo) return;

  const estado = id("estado-perfil");
  const avatar = id("btn-perfil");

  estado.textContent = "Subiendo…";
  avatar.disabled = true;

  try {
    const url = await subirFotoDePerfil(archivo);
    await guardarFotoPerfil(uidActual, url);
    pintarAvatar(url, emailActual);
    estado.textContent = "";
  } catch {
    estado.textContent = "No se ha podido subir la foto. Comprueba tu conexión.";
  } finally {
    avatar.disabled = false;
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

// --- Gráfica y comparador ------------------------------------------------

// El peso objetivo vive en Ajustes; se cachea aquí para que la gráfica no
// tenga que volver a leerlo de Firestore cada vez que se repinta.
let pesoObjetivoActual = null;

function pintarComparador(diarios) {
  const comparacion = compararSemanas(diarios, hoyISO());

  if (!comparacion) {
    id("comparador").textContent = "";
    id("comparador-detalle").textContent =
      "Aún no hay datos suficientes para comparar semanas.";
    return;
  }

  const { actual, anterior, diferencia } = comparacion;
  const redondeada = Math.round(diferencia * 10) / 10;

  // Ni verde ni rojo: se premia la conducta, no los kilos (PRODUCTO.md).
  id("comparador").textContent =
    redondeada === 0
      ? "Igual que la semana pasada"
      : `${redondeada > 0 ? "+" : "−"}${Math.abs(redondeada)
          .toFixed(1)
          .replace(".", ",")} kg esta semana`;

  const enKg = (valor) => `${valor.toFixed(1).replace(".", ",")} kg`;
  id("comparador-detalle").textContent =
    `media ${enKg(actual)} · semana pasada ${enKg(anterior)}`;
}

function refrescarGrafica() {
  const pesajes = listaPeso.obtenerRegistros();
  const diarios = mediaMovil(pesosPorDia(pesajes));

  const contenedor = id("grafica-peso");
  const vacia = id("grafica-vacia");
  contenedor.innerHTML = "";

  const svg = dibujarGrafica(diarios, pesoObjetivoActual, pesajes.length);
  if (svg) {
    contenedor.appendChild(svg);
    vacia.textContent = "";
  } else {
    vacia.textContent = "Apunta algún pesaje más para ver la evolución.";
  }

  pintarComparador(diarios);
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
      pesaje ? `${pesaje.pesoKg.toFixed(1).replace(".", ",")} kg` : null,
      "peso"
    ),
    lineaDeResumen("Comidas", comida ? comida.texto : null, "comidas"),
    lineaDeResumen(
      "Ejercicio",
      ejercicio ? `${ejercicio.texto} · ${ejercicio.minutos} min` : null,
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
  contenedor.appendChild(
    dibujarCalendario(
      calendarioDeConstancia(registros, hoyISO(), semanasCalendario),
      (casilla) => {
        // Con el ratón basta el <title>; en el móvil no hay hover, así que el
        // toque escribe el detalle aquí debajo.
        detalle.textContent = textoDeCasilla(casilla);
      }
    )
  );
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
    celda(formatearFecha(pesaje.fecha), "pesaje-fecha"),
    celda(`${pesaje.pesoKg.toFixed(1).replace(".", ",")} kg`, "pesaje-peso")
  ],
  campos: (pesaje) => {
    const fecha = campoFecha(pesaje.fecha);
    const peso = campoTexto(
      pesaje.pesoKg.toFixed(1).replace(".", ","),
      "edicion-peso",
      "decimal"
    );
    return {
      elementos: [fecha, peso],
      validar: () => validarPesaje(peso.value, fecha.value)
    };
  },
  actualizar: (uid, pesajeId, valores) =>
    actualizarPesaje(uid, pesajeId, valores.pesoKg, valores.fecha)
});

id("form-pesaje").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const error = id("error-pesaje");
  error.textContent = "";

  const resultado = validarPesaje(id("peso").value, id("fecha").value);
  if (resultado.error) {
    error.textContent = resultado.error;
    return;
  }

  const boton = id("btn-guardar");
  boton.disabled = true;
  try {
    await guardarPesaje(uidActual, resultado.pesoKg, resultado.fecha);
    avisarGuardado("guardado-pesaje");
    id("peso").value = "";
    id("fecha").value = hoyISO();
    await listaPeso.refrescar();
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
    celda(formatearFecha(comida.fecha), "pesaje-fecha"),
    celda(etiquetaDeMomento(comida.momento), "registro-detalle"),
    celda(comida.texto, "registro-texto")
  ],
  campos: (comida) => {
    const fecha = campoFecha(comida.fecha);
    const momento = campoDesplegable(MOMENTOS, comida.momento, "edicion-momento");
    const texto = campoArea(comida.texto, "edicion-texto");
    return {
      elementos: [fecha, momento, texto],
      validar: () => validarComida(texto.value, momento.value, fecha.value)
    };
  },
  actualizar: (uid, comidaId, valores) =>
    actualizarComida(uid, comidaId, valores.texto, valores.momento, valores.fecha)
});

id("form-comida").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const error = id("error-comida");
  error.textContent = "";

  const resultado = validarComida(
    id("comida-texto").value,
    id("comida-momento").value,
    id("comida-fecha").value
  );
  if (resultado.error) {
    error.textContent = resultado.error;
    return;
  }

  const boton = id("btn-guardar-comida");
  boton.disabled = true;
  try {
    await guardarComida(uidActual, resultado.texto, resultado.momento, resultado.fecha);
    avisarGuardado("guardado-comida");
    id("comida-texto").value = "";
    id("comida-momento").value = MOMENTO_POR_DEFECTO;
    id("comida-fecha").value = hoyISO();
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
    celda(formatearFecha(ejercicio.fecha), "pesaje-fecha"),
    celda(ejercicio.texto, "registro-texto"),
    celda(`${ejercicio.minutos} min`, "registro-detalle"),
    celda(etiquetaDeIntensidad(ejercicio.intensidad), "registro-detalle")
  ],
  campos: (ejercicio) => {
    const fecha = campoFecha(ejercicio.fecha);
    const texto = campoTexto(ejercicio.texto, "edicion-texto");
    const minutos = campoTexto(String(ejercicio.minutos), "edicion-minutos", "numeric");
    const intensidad = campoDesplegable(
      INTENSIDADES,
      ejercicio.intensidad,
      "edicion-intensidad"
    );
    return {
      elementos: [fecha, texto, minutos, intensidad],
      validar: () =>
        validarEjercicio(texto.value, minutos.value, intensidad.value, fecha.value)
    };
  },
  actualizar: (uid, ejercicioId, valores) =>
    actualizarEjercicio(
      uid,
      ejercicioId,
      valores.texto,
      valores.minutos,
      valores.intensidad,
      valores.fecha
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
    id("ejercicio-fecha").value
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
      resultado.fecha
    );
    avisarGuardado("guardado-ejercicio");
    id("ejercicio-texto").value = "";
    id("ejercicio-minutos").value = "";
    id("ejercicio-intensidad").value = INTENSIDAD_POR_DEFECTO;
    id("ejercicio-fecha").value = hoyISO();
    await listaEjercicios.refrescar();
  } catch {
    error.textContent = "No se ha podido guardar. Comprueba tu conexión.";
  } finally {
    boton.disabled = false;
  }
});

// --- Consejos ------------------------------------------------------------

// No usa crearLista(): los consejos no se borran y cada uno se pinta como
// una tarjeta con tres apartados, no como una fila.
let consejosCargados = [];

function formatearFechaYHora(creadoEn) {
  if (!creadoEn) return "";
  const fecha = creadoEn.toDate();
  const dosDigitos = (numero) => String(numero).padStart(2, "0");
  return (
    `${dosDigitos(fecha.getDate())}/${dosDigitos(fecha.getMonth() + 1)}/` +
    `${fecha.getFullYear()} ${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`
  );
}

function pintarConsejos(consejos) {
  const contenedor = id("lista-consejos");
  contenedor.innerHTML = "";
  id("estado-consejos").textContent = consejos.length
    ? ""
    : "Aún no has pedido ningún consejo.";

  consejos.forEach((consejo) => {
    const tarjeta = document.createElement("article");
    tarjeta.className = "consejo";

    const fecha = document.createElement("p");
    fecha.className = "consejo-fecha";
    fecha.textContent = formatearFechaYHora(consejo.creadoEn);
    tarjeta.appendChild(fecha);

    [
      ["Qué veo", consejo.queVeo],
      ["Qué hacer esta semana", consejo.queHacer],
      ["Ojo con esto", consejo.ojoCon]
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

async function refrescarConsejos() {
  id("btn-reintentar-consejos").classList.add("oculta");
  try {
    consejosCargados = await listarConsejos(uidActual);
    pintarConsejos(consejosCargados);
  } catch {
    consejosCargados = [];
    id("lista-consejos").innerHTML = "";
    id("estado-consejos").textContent =
      "No se han podido cargar tus consejos. Comprueba tu conexión.";
    id("btn-reintentar-consejos").classList.remove("oculta");
  }
}

id("btn-reintentar-consejos").addEventListener("click", refrescarConsejos);

id("btn-pedir-consejo").addEventListener("click", async () => {
  const boton = id("btn-pedir-consejo");
  const error = id("error-consejo");
  const estado = id("estado-consejo");

  error.textContent = "";
  estado.textContent = "Pensando…";
  boton.disabled = true;

  try {
    await pedirConsejo(uidActual, consejosCargados);
    await refrescarConsejos();
  } catch (fallo) {
    error.textContent = mensajeDeErrorDeConsejo(fallo.codigo);
  } finally {
    estado.textContent = "";
    boton.disabled = false;
  }
});

// --- Consulta ------------------------------------------------------------

let consultasCargadas = [];
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
    fecha.textContent = formatearFechaYHora(plan.creadoEn);
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

  id("form-respuesta").classList.toggle("oculta", !enCurso);
  id("btn-abandonar").classList.toggle("oculta", !enCurso);
  id("btn-empezar-consulta").classList.toggle("oculta", enCurso);

  if (enCurso) {
    id("aviso-consulta").textContent = "";
  } else {
    id("btn-empezar-consulta").disabled = !quedanHoy;
    id("btn-empezar-consulta").textContent = terminada
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

async function refrescarConsulta() {
  try {
    const [consultas, planes] = await Promise.all([
      listarConsultas(uidActual),
      listarPlanes(uidActual)
    ]);
    consultasCargadas = consultas;
    consultaAbierta = consultaEnCurso(consultas);
    pintarPlanes(planes);
    pintarEstadoConsulta();
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

  const fueBien = await conEspera(async () => {
    ({ termino } = await responder(uidActual, consultaAbierta, texto));
  });

  if (fueBien) {
    campo.value = "";
    if (termino) consultaReciénTerminada = idDeLaConsulta;
    await refrescarConsulta();
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
    refrescarConsejos(),
    refrescarConsulta(),
    refrescarFotos()
  ]);
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
    id("nombre").value
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
  rellenarDesplegable("comida-momento", MOMENTOS, MOMENTO_POR_DEFECTO);
  rellenarDesplegable("ejercicio-intensidad", INTENSIDADES, INTENSIDAD_POR_DEFECTO);
  [
    "error-pesaje",
    "error-comida",
    "error-ejercicio",
    "error-consejo",
    "error-consulta",
    "error-foto",
    "error-ajustes",
    "aviso-ajustes",
    "error-reinicio",
    "estado-reinicio"
  ].forEach((campo) => {
    id(campo).textContent = "";
  });
  id("estado-consejo").textContent = "";
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
    refrescarTodo();
    refrescarAjustes();
    refrescarRecuentos();
  },
  () => {
    uidActual = null;
    mostrar("login");
    errorLogin.textContent = mensajeDeError(ERROR_NO_AUTORIZADO);
  }
);
