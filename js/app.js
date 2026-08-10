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
  validarPesaje,
  guardarPesaje,
  listarPesajes,
  borrarPesaje
} from "./pesajes.js";

import {
  MOMENTOS,
  MOMENTO_POR_DEFECTO,
  etiquetaDeMomento,
  validarComida,
  guardarComida,
  listarComidas,
  borrarComida
} from "./comidas.js";

import {
  INTENSIDADES,
  INTENSIDAD_POR_DEFECTO,
  etiquetaDeIntensidad,
  validarEjercicio,
  guardarEjercicio,
  listarEjercicios,
  borrarEjercicio
} from "./ejercicios.js";

import {
  pedirConsejo,
  listarConsejos,
  mensajeDeErrorDeConsejo
} from "./consejos.js";

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

const PESTANA_INICIAL = "peso";

function abrirPestana(nombre) {
  document.querySelectorAll(".pestana").forEach((boton) => {
    boton.classList.toggle("activa", boton.dataset.seccion === nombre);
  });
  document.querySelectorAll(".seccion").forEach((seccion) => {
    seccion.classList.toggle("activa", seccion.dataset.seccion === nombre);
  });
}

document.querySelectorAll(".pestana").forEach((boton) => {
  boton.addEventListener("click", () => abrirPestana(boton.dataset.seccion));
});

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

// --- Listas de registros -------------------------------------------------

// Las tres listas (pesajes, comidas, ejercicios) se comportan igual: cargan,
// pintan filas, permiten borrar y avisan si falla la conexión. Esto monta una.
function crearLista(config) {
  const lista = id(config.lista);
  const estado = id(config.estado);
  const reintentar = id(config.reintentar);
  const error = id(config.error);

  function pintar(registros) {
    lista.innerHTML = "";
    estado.textContent = registros.length ? "" : config.textoVacio;

    registros.forEach((registro) => {
      const fila = document.createElement("li");

      const botonBorrar = document.createElement("button");
      botonBorrar.type = "button";
      botonBorrar.textContent = "Borrar";
      botonBorrar.addEventListener("click", () => borrar(registro.id, botonBorrar));

      fila.append(...config.celdas(registro), botonBorrar);
      lista.appendChild(fila);
    });
  }

  async function refrescar() {
    reintentar.classList.add("oculta");
    try {
      pintar(await config.cargar(uidActual));
    } catch {
      lista.innerHTML = "";
      estado.textContent = config.errorCarga;
      reintentar.classList.remove("oculta");
    }
  }

  async function borrar(registroId, boton) {
    if (!confirm(config.confirmacionBorrado)) return;

    boton.disabled = true;
    try {
      await config.borrar(uidActual, registroId);
      await refrescar();
    } catch {
      error.textContent = "No se ha podido borrar. Comprueba tu conexión.";
      boton.disabled = false;
    }
  }

  reintentar.addEventListener("click", refrescar);

  return { refrescar };
}

function celda(texto, clase) {
  const elemento = document.createElement("span");
  elemento.className = clase;
  elemento.textContent = texto;
  return elemento;
}

// --- Peso ----------------------------------------------------------------

const listaPeso = crearLista({
  lista: "lista-pesajes",
  estado: "estado-lista",
  reintentar: "btn-reintentar",
  error: "error-pesaje",
  textoVacio: "Aún no has apuntado ningún pesaje.",
  errorCarga: "No se han podido cargar tus pesajes. Comprueba tu conexión.",
  confirmacionBorrado: "¿Borrar este pesaje?",
  cargar: listarPesajes,
  borrar: borrarPesaje,
  celdas: (pesaje) => [
    celda(formatearFecha(pesaje.fecha), "pesaje-fecha"),
    celda(`${pesaje.pesoKg.toFixed(1).replace(".", ",")} kg`, "pesaje-peso")
  ]
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

const listaComidas = crearLista({
  lista: "lista-comidas",
  estado: "estado-comidas",
  reintentar: "btn-reintentar-comidas",
  error: "error-comida",
  textoVacio: "Aún no has apuntado ninguna comida.",
  errorCarga: "No se han podido cargar tus comidas. Comprueba tu conexión.",
  confirmacionBorrado: "¿Borrar esta comida?",
  cargar: listarComidas,
  borrar: borrarComida,
  celdas: (comida) => [
    celda(formatearFecha(comida.fecha), "pesaje-fecha"),
    celda(etiquetaDeMomento(comida.momento), "registro-detalle"),
    celda(comida.texto, "registro-texto")
  ]
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
  lista: "lista-ejercicios",
  estado: "estado-ejercicios",
  reintentar: "btn-reintentar-ejercicios",
  error: "error-ejercicio",
  textoVacio: "Aún no has apuntado ningún ejercicio.",
  errorCarga: "No se han podido cargar tus ejercicios. Comprueba tu conexión.",
  confirmacionBorrado: "¿Borrar este ejercicio?",
  cargar: listarEjercicios,
  borrar: borrarEjercicio,
  celdas: (ejercicio) => [
    celda(formatearFecha(ejercicio.fecha), "pesaje-fecha"),
    celda(ejercicio.texto, "registro-texto"),
    celda(`${ejercicio.minutos} min`, "registro-detalle"),
    celda(etiquetaDeIntensidad(ejercicio.intensidad), "registro-detalle")
  ]
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
  ["error-pesaje", "error-comida", "error-ejercicio", "error-consejo"].forEach(
    (campo) => {
      id(campo).textContent = "";
    }
  );
  id("estado-consejo").textContent = "";
}

observarSesion(
  (usuario) => {
    if (!usuario) {
      uidActual = null;
      mostrar("login");
      return;
    }

    uidActual = usuario.uid;
    emailUsuario.textContent = usuario.email;
    limpiarFormularios();
    errorLogin.textContent = "";
    inputPassword.value = "";
    abrirPestana(PESTANA_INICIAL);
    mostrar("principal");

    listaPeso.refrescar();
    listaComidas.refrescar();
    listaEjercicios.refrescar();
    refrescarConsejos();
  },
  () => {
    uidActual = null;
    mostrar("login");
    errorLogin.textContent = mensajeDeError(ERROR_NO_AUTORIZADO);
  }
);
