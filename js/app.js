// Arranque de la app y conexión entre pantallas.

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
  validarPesaje,
  guardarPesaje,
  listarPesajes,
  borrarPesaje
} from "./pesajes.js";

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
const formPesaje = document.getElementById("form-pesaje");
const inputPeso = document.getElementById("peso");
const inputFecha = document.getElementById("fecha");
const btnGuardar = document.getElementById("btn-guardar");
const errorPesaje = document.getElementById("error-pesaje");
const listaPesajes = document.getElementById("lista-pesajes");
const estadoLista = document.getElementById("estado-lista");
const btnReintentar = document.getElementById("btn-reintentar");

let uidActual = null;

function mostrar(nombre) {
  Object.entries(pantallas).forEach(([clave, elemento]) => {
    elemento.classList.toggle("oculta", clave !== nombre);
  });
}

function formatearFecha(iso) {
  const [anio, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${anio}`;
}

function formatearPeso(pesoKg) {
  return `${pesoKg.toFixed(1).replace(".", ",")} kg`;
}

// --- Login ---------------------------------------------------------------

function mostrarErrorLogin(error) {
  errorLogin.textContent = mensajeDeError(error.code);
}

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
    mostrarErrorLogin(error);
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
    mostrarErrorLogin(error);
  } finally {
    btnGoogle.disabled = false;
  }
});

btnSalir.addEventListener("click", () => salir());

// --- Pesajes -------------------------------------------------------------

function pintarPesajes(pesajes) {
  listaPesajes.innerHTML = "";
  estadoLista.textContent = pesajes.length
    ? ""
    : "Aún no has apuntado ningún pesaje.";

  pesajes.forEach((pesaje) => {
    const fila = document.createElement("li");

    const fecha = document.createElement("span");
    fecha.className = "pesaje-fecha";
    fecha.textContent = formatearFecha(pesaje.fecha);

    const peso = document.createElement("span");
    peso.className = "pesaje-peso";
    peso.textContent = formatearPeso(pesaje.pesoKg);

    const botonBorrar = document.createElement("button");
    botonBorrar.type = "button";
    botonBorrar.textContent = "Borrar";
    botonBorrar.addEventListener("click", () => alBorrar(pesaje.id, botonBorrar));

    fila.append(fecha, peso, botonBorrar);
    listaPesajes.appendChild(fila);
  });
}

async function refrescarLista() {
  btnReintentar.classList.add("oculta");
  try {
    pintarPesajes(await listarPesajes(uidActual));
  } catch {
    listaPesajes.innerHTML = "";
    estadoLista.textContent =
      "No se han podido cargar tus pesajes. Comprueba tu conexión.";
    btnReintentar.classList.remove("oculta");
  }
}

btnReintentar.addEventListener("click", refrescarLista);

formPesaje.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  errorPesaje.textContent = "";

  const resultado = validarPesaje(inputPeso.value, inputFecha.value);
  if (resultado.error) {
    errorPesaje.textContent = resultado.error;
    return;
  }

  btnGuardar.disabled = true;
  try {
    await guardarPesaje(uidActual, resultado.pesoKg, resultado.fecha);
    inputPeso.value = "";
    inputFecha.value = hoyISO();
    await refrescarLista();
  } catch {
    errorPesaje.textContent = "No se ha podido guardar. Comprueba tu conexión.";
  } finally {
    btnGuardar.disabled = false;
  }
});

async function alBorrar(pesajeId, boton) {
  if (!confirm("¿Borrar este pesaje?")) return;

  boton.disabled = true;
  try {
    await borrarPesaje(uidActual, pesajeId);
    await refrescarLista();
  } catch {
    errorPesaje.textContent = "No se ha podido borrar. Comprueba tu conexión.";
    boton.disabled = false;
  }
}

// --- Arranque ------------------------------------------------------------

observarSesion(
  (usuario) => {
    if (!usuario) {
      uidActual = null;
      mostrar("login");
      return;
    }

    uidActual = usuario.uid;
    emailUsuario.textContent = usuario.email;
    inputPeso.value = "";
    inputFecha.value = hoyISO();
    errorPesaje.textContent = "";
    errorLogin.textContent = "";
    inputPassword.value = "";
    mostrar("principal");
    refrescarLista();
  },
  () => {
    uidActual = null;
    mostrar("login");
    errorLogin.textContent = mensajeDeError(ERROR_NO_AUTORIZADO);
  }
);
