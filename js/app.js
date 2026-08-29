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
  compararPorFechaYCreacion,
  diaDeLaSemana
} from "./fechas.js";

import { pesosPorDia, mediaMovil, calendarioDeConstancia } from "./grafica.js";

import { estadisticasDePeso } from "./estadisticas.js";

import { dibujarGrafica, dibujarCalendario } from "./grafica-svg.js";

import {
  dibujarCalendarioMes,
  MAXIMO_SEMANAS_CALENDARIO
} from "./calendario.js";

import { loDeSiempre, masRepetidos } from "./hoy.js";

import {
  validarPesaje,
  guardarPesaje,
  actualizarPesaje,
  listarPesajes,
  borrarPesaje
} from "./pesajes.js";

import {
  DIAS,
  MOMENTOS_DIETA,
  semanaEnBlanco,
  leerDietaActiva,
  guardarDieta,
  actualizarDieta,
  borrarDieta,
  guardarRecetasPropuestas,
  semanaDesdeLaIa,
  pedirDietaALaIa
} from "./dietas.js";

import {
  GRUPOS,
  MEDIDAS,
  ANALISIS_POR_DIA,
  leerAnalisisDe,
  quedanAnalisisHoy,
  estaViejo,
  guardarAnalisis,
  pedirAnalisisALaIa
} from "./analisis.js";

import {
  validarEjercicioCatalogo,
  guardarEjercicioCatalogo,
  actualizarEjercicioCatalogo,
  listarEjerciciosCatalogo,
  borrarEjercicioCatalogo
} from "./ejercicios-catalogo.js";

// Con alias: la dieta ya ocupa esos nombres y son funciones distintas.
import {
  semanaEnBlanco as semanaEnBlancoTabla,
  validarSesion,
  leerTablaActiva,
  guardarTabla,
  actualizarTabla,
  borrarTabla,
  guardarEjerciciosPropuestos,
  semanaDesdeLaIa as semanaDesdeLaIaTabla,
  pedirTablaALaIa
} from "./tablas.js";

import {
  validarReceta,
  guardarReceta,
  actualizarReceta,
  listarRecetas,
  borrarReceta
} from "./recetas.js";

import {
  MAX_NOMBRE as MAX_NOMBRE_INGREDIENTE,
  validarIngrediente,
  ingredienteIgual,
  guardarIngrediente,
  renombrarIngrediente,
  marcarIngrediente,
  borrarIngrediente,
  listarDespensa,
  ordenar as ordenarDespensa,
  cruzarConLaDespensa,
  loQueTengo
} from "./despensa.js";

import {
  VASOS_OBJETIVO_POR_DEFECTO,
  MAXIMO_VASOS,
  leerVasosDe,
  guardarVasos,
  objetivoDeVasos,
  validarObjetivo
} from "./agua.js";

import {
  validarBebida,
  guardarBebida,
  actualizarBebida,
  listarBebidas,
  borrarBebida
} from "./bebidas.js";

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
  MAXIMO_CARACTERES,
  hiloDeConversacion,
  hiloCompleto,
  enviarMensaje,
  consejosAntiguos
} from "./conversacion.js";

import {
  listarConsultas,
  listarPlanes,
  consultaEnCurso,
  MENSAJES_POR_DIA,
  quedanMensajesHoy,
  DIAS_ENTRE_REVISIONES,
  diasDesde,
  ultimaRevision,
  empezarConsulta,
  empezarAlta,
  responder,
  TIPOS_ESPECIALIZADOS,
  guardarMarcaDePlan,
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
  guardarFotoPerfil,
  guardarProveedorIa
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

import { calcularGamificacion } from "./gamificacion.js";

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

function abrirPestana(nombre, subseccion) {
  document.querySelectorAll(".seccion").forEach((seccion) => {
    seccion.classList.toggle("activa", seccion.dataset.seccion === nombre);
  });

  document.querySelectorAll(".nav-boton").forEach((boton) => {
    boton.classList.toggle("activa", boton.dataset.seccion === nombre);
  });

  // Comidas y Ejercicio tienen sub-pestañas dentro (spec 035). Sin decir cuál,
  // se abre la primera: entrar en Comidas es entrar a apuntar, que es lo que se
  // hace veinte veces al día. No se recuerda dónde estabas.
  const fila = document.querySelector(`.subpestanas[data-de="${nombre}"]`);
  if (fila) {
    abrirSubpestana(
      nombre,
      subseccion || fila.querySelector(".subpestana").dataset.subseccion
    );
  }

  // Desde arriba: al cambiar de sección se ve el principio, no donde te
  // quedaste en la sección anterior.
  requestAnimationFrame(() => {
    window.scrollTo(0, 0);
    ajustarBarraInferior();
  });
}

// Hermana de abrirPestana() para las sub-pestañas (spec 035). Se busca dentro
// de la sección y no en todo el documento: las dos secciones con sub-pestañas
// usan los mismos nombres de contenedor y la de al lado no debe enterarse.
function abrirSubpestana(seccion, nombre) {
  const caja = document.querySelector(`.seccion[data-seccion="${seccion}"]`);
  if (!caja) return;

  caja.querySelectorAll(".subseccion").forEach((bloque) => {
    bloque.classList.toggle("activa", bloque.dataset.subseccion === nombre);
  });

  caja.querySelectorAll(".subpestana").forEach((boton) => {
    const puesta = boton.dataset.subseccion === nombre;
    boton.classList.toggle("activa", puesta);
    // aria-current y no role="tab": un patrón de pestañas a medias, sin
    // tabpanel ni flechas del teclado, le promete a un lector de pantalla algo
    // que la app no hace.
    if (puesta) {
      boton.setAttribute("aria-current", "true");
    } else {
      boton.removeAttribute("aria-current");
    }
  });

  // La despensa recoloca sus filas AQUÍ, al entrar, y en ningún otro momento
  // (spec 058). Marcar no reordena: la fila saltaría bajo el dedo justo cuando
  // estás marcando varias seguidas.
  if (seccion === "comidas" && nombre === "despensa") {
    reordenarDespensa();
  }
}

// La barra de navegación desaparecía en Ejercicio, en móvil. Confirmado con
// un panel de diagnóstico en pantalla (21 de agosto): al entrar en Ejercicio,
// window.innerHeight saltaba de 681 a 733 mientras que
// window.visualViewport.height —lo que de verdad se ve— se quedaba en 681.
// Un hueco de 52 px, justo donde vive la barra: al ser position: fixed, el
// navegador la coloca contra el innerHeight "de diseño" (733), no contra lo
// que realmente se ve (681), y queda fuera de la pantalla.
//
// Se probó quitar fixed y poner sticky (spec 038), pero sticky no sirve para
// una barra que tiene que verse siempre: en una página más alta que la
// pantalla (como Ejercicio, con muchos registros) solo se pega abajo cuando
// el scroll llega cerca del final. Vuelta a fixed con este arreglo, que sí
// funciona: abrirPestana() llama a esta función tras el scrollTo(), que es
// cuando hace falta (los eventos resize/scroll de visualViewport, por sí
// solos, no saltan cuando lo que cambia es la altura del documento).
function ajustarBarraInferior() {
  const barraInferior = id("nav-inferior");
  // En escritorio la barra ya no es fixed (spec 009): no hay nada que
  // corregir, y aplicar una traslación ahí solo estorbaría.
  if (getComputedStyle(barraInferior).position !== "fixed") {
    barraInferior.style.transform = "";
    return;
  }
  const vv = window.visualViewport;
  if (!vv) return;
  const hueco = window.innerHeight - vv.height - vv.offsetTop;
  barraInferior.style.transform = hueco > 0 ? `translateY(-${hueco}px)` : "";
}

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", ajustarBarraInferior);
  window.visualViewport.addEventListener("scroll", ajustarBarraInferior);
  window.addEventListener("resize", ajustarBarraInferior);
}

// La barra y los atajos provisionales de Ajustes hacen lo mismo: llevar a una
// sección. El botón lo dice en su data-seccion, y si además trae
// data-subseccion, deja abierta esa sub-pestaña al llegar.
//
// OJO con el selector: la clase .atajo también la lleva el botón de "Pedir
// dieta"/"Pedir tabla", que se crea en tiempo de ejecución y NO navega a
// ninguna parte. Aquí no choca porque esto corre al cargar, antes de que ese
// botón exista. No convertir esto en un listener delegado ni volver a
// consultar el selector más tarde: ese botón acabaría llamando a
// abrirPestana(undefined).
document.querySelectorAll(".nav-boton, .atajo").forEach((boton) => {
  boton.addEventListener("click", () =>
    abrirPestana(boton.dataset.seccion, boton.dataset.subseccion)
  );
});

document.querySelectorAll(".subpestana").forEach((boton) => {
  boton.addEventListener("click", () => {
    abrirSubpestana(
      boton.closest(".seccion").dataset.seccion,
      boton.dataset.subseccion
    );
    // Igual que al cambiar de sección: se ve el principio del contenido.
    window.scrollTo(0, 0);
  });
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

// WeakMap y no un campo en el propio botón: pintarDieta() rehace las filas
// enteras y tira los botones viejos, que así se recogen solos.
const temporizadoresDeBoton = new WeakMap();

// Hermano de avisarGuardado() para los botones de la semana (spec 034).
//
// Apuntar desde la dieta o desde la tabla se hace pulsando un botón que puede
// estar en el primer día de siete: el párrafo de "Guardado" queda entonces a
// varias pantallas de scroll y no se ve nunca. La respuesta va aquí en el
// propio botón, el único sitio donde se sabe seguro que el usuario mira,
// porque acaba de tocar ahí.
//
// El párrafo NO se sustituye, se suma: lleva role="status" y es lo único que
// oye un lector de pantalla.
function responderEnBoton(boton, hayQueCelebrar) {
  if (!boton) return;

  // Un botón de icono no tiene texto que cambiar: si se le escribiera encima se
  // perdería el dibujo, y al restaurarlo volvería como texto suelto. En esos el
  // aviso es solo el color, que para eso el icono ya es una marca de visto
  // (spec 065).
  const esIcono = Boolean(boton.querySelector("svg"));

  // Solo la primera vez: si se vuelve a pulsar en mitad de un aviso, el texto
  // de partida ya no es el original y se quedaría congelado en "✓ Guardado".
  if (!esIcono && boton.dataset.textoOriginal === undefined) {
    boton.dataset.textoOriginal = boton.textContent;
  }

  clearTimeout(temporizadoresDeBoton.get(boton));

  if (!esIcono) {
    boton.textContent = hayQueCelebrar ? "✓ Guardado" : "✗ No se ha guardado";
  }
  boton.classList.remove("boton-confirmado", "boton-fallido");
  boton.classList.add(hayQueCelebrar ? "boton-confirmado" : "boton-fallido");
  boton.disabled = true;

  // Los mismos 3 segundos que avisarGuardado(): que dos avisos de la misma app
  // duren distinto no tiene ninguna justificación.
  temporizadoresDeBoton.set(
    boton,
    setTimeout(() => {
      if (!esIcono) boton.textContent = boton.dataset.textoOriginal;
      boton.classList.remove("boton-confirmado", "boton-fallido");
      boton.disabled = false;
      temporizadoresDeBoton.delete(boton);
    }, 3000)
  );
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
// Los recuentos de "Reiniciar datos" solo se leían una vez, al iniciar
// sesión: si apuntabas algo después, salían desactualizados hasta recargar
// la página entera. Se refrescan también al abrir Ajustes.
id("btn-perfil").addEventListener("click", () => {
  abrirPestana("ajustes");
  refrescarRecuentos();
});
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
    id("btn-quitar-foto").classList.remove("oculta");
    estado.textContent = "";
  } catch {
    estado.textContent = "No se ha podido subir la foto. Comprueba tu conexión.";
  } finally {
    boton.disabled = false;
    // Sin esto, elegir el mismo archivo dos veces seguidas no dispara nada.
    evento.target.value = "";
  }
});

// Quitar la foto de perfil (spec 039): solo borra el campo en Firestore, no
// el archivo de Cloudinary — vive en una ruta que la acción "borrar" del
// backend no puede tocar a propósito (ver api/cloudinary.js), y sobrescribir
// esa misma ruta es lo que ya hace la próxima subida. guardarFotoPerfil()
// sirve tal cual: guarda lo que se le pase, aquí null.
id("btn-quitar-foto").addEventListener("click", async () => {
  const estado = id("estado-perfil");
  const boton = id("btn-quitar-foto");

  estado.textContent = "Quitando…";
  boton.disabled = true;

  try {
    await guardarFotoPerfil(uidActual, null);
    pintarAvatar(null, emailActual);
    boton.classList.add("oculta");
    estado.textContent = "";
  } catch {
    estado.textContent = "No se ha podido quitar la foto. Comprueba tu conexión.";
  } finally {
    boton.disabled = false;
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
  // Gemelo arriba del todo (spec 035-fix): mismo estado, mismo texto, para no
  // tener que bajar hasta el final de una lista larga solo para recogerla.
  const botonDesplegarArriba = id(config.desplegarArriba);

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
    botonDesplegarArriba.classList.toggle("oculta", !hayEscondidos && !desplegada);
    botonDesplegarArriba.textContent = botonDesplegar.textContent;
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
    // Al recoger la lista, el botón (y la lista corta) suben muchas líneas:
    // sin esto la ventana se queda mirando el hueco en blanco de donde
    // colgaba la lista larga, y hay que subir a mano para volver a verla.
    if (!desplegada) botonDesplegar.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  // El de arriba no tiene ese problema: ya está donde está la vista.
  botonDesplegarArriba.addEventListener("click", () => {
    desplegada = !desplegada;
    pintar();
  });

  // Dos líneas (spec 043): arriba QUÉ fue, debajo cuándo y sus detalles. Antes
  // iba todo en una línea y el texto libre competía por el ancho con los
  // botones: en una columna estrecha se recortaba hasta desaparecer, que es
  // justo lo único que no se puede deducir mirando la fila.
  function filaDeLectura(registro) {
    const fila = document.createElement("li");
    const { que, detalles } = config.fila(registro);

    const datos = document.createElement("div");
    datos.className = "registro-datos";
    datos.append(
      celda(que || "—", "registro-que"),
      // Se filtran los vacíos: un pesaje sin hora no debe dejar un "·" suelto.
      celda(detalles.filter(Boolean).join(" · "), "registro-meta")
    );

    const botonEditar = botonDeIcono("lapiz", "Editar", () => {
      // Solo una fila en edición a la vez: abrir esta cierra la anterior y
      // descarta lo que hubiera escrito, sin preguntar.
      editandoId = registro.id;
      error.textContent = "";
      pintar();
    });

    const botonBorrar = botonDeIcono("papelera", "Borrar", () =>
      borrar(registro.id, botonBorrar)
    );

    const acciones = document.createElement("div");
    acciones.className = "registro-acciones";
    acciones.append(botonEditar, botonBorrar);

    fila.append(datos, acciones);
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

// Iconos de editar y borrar de las filas del diario (spec 043).
//
// El color va como atributo, al contrario que en js/grafica-svg.js, donde cada
// forma lleva su clase: currentColor no es un color, es "el que tenga el texto
// aquí". Sacarlo a CSS obligaría a repetir el color del botón en dos sitios y
// a mantenerlos sincronizados.
const TRAZOS_DE_ICONO = {
  lapiz: ["M12 20h9", "M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"],
  papelera: ["M3 6h18", "M8 6V4h8v2", "M19 6l-1 14H6L5 6", "M10 11v6", "M14 11v6"],
  // Spec 065. La marca es "me lo he comido" / "lo he hecho"; el más, añadir algo
  // a una celda vacía de la semana.
  comido: ["M20 6 9 17l-5-5"],
  anadir: ["M12 5v14", "M5 12h14"]
};

function iconoDeAccion(nombre) {
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "20");
  svg.setAttribute("height", "20");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  // El dibujo no se anuncia: la acción la dice el aria-label del botón.
  svg.setAttribute("aria-hidden", "true");

  // Un nombre que no existe deja el botón sin dibujo, pero NO tumba a quien
  // esté pintando. Antes reventaba aquí, y como pintar una lista es un bucle,
  // un icono mal escrito vaciaba la lista entera y el error salía a kilómetros
  // de distancia, disfrazado de fallo de conexión (estreno de la spec 058).
  // El aria-label del botón sigue diciendo la acción, así que se puede usar.
  const trazos = TRAZOS_DE_ICONO[nombre];
  if (!trazos) {
    console.error(`Icono desconocido: "${nombre}". Los que hay: ${Object.keys(TRAZOS_DE_ICONO).join(", ")}.`);
    return svg;
  }

  trazos.forEach((d) => {
    const trazo = document.createElementNS(NS, "path");
    trazo.setAttribute("d", d);
    svg.appendChild(trazo);
  });

  return svg;
}

function botonDeIcono(nombre, etiqueta, alPulsar) {
  const elemento = document.createElement("button");
  elemento.type = "button";
  elemento.className = "icono-accion";
  elemento.setAttribute("aria-label", etiqueta);
  elemento.title = etiqueta;
  elemento.appendChild(iconoDeAccion(nombre));
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
// Qué proveedor de IA probar primero (spec 032): "automatico" o
// "groq-primero". Se manda con cada petición a la IA.
let proveedorIaActual = "automatico";

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
  const detalle = id("grafica-peso-detalle");
  contenedor.innerHTML = "";
  // Al cambiar de rango, el punto que se estaba mirando puede haber
  // desaparecido, así que el detalle vuelve a empezar.
  detalle.textContent = "";

  pintarRangosGrafica();

  const svg = dibujarGrafica(diarios, pesoObjetivoActual, diarios.length, (texto) => {
    detalle.textContent = texto;
  });
  if (svg) {
    contenedor.appendChild(svg);
    vacia.textContent = "";
    detalle.textContent = "Toca un punto para ver su fecha y su peso.";
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

// Una línea de un registro: la etiqueta y el texto con su hora si la tiene.
function conHora(registro, texto) {
  return registro.hora ? `${texto} · ${formatearHora(registro.hora)}` : texto;
}

function lineaDeRegistro(etiqueta, registro, texto) {
  const fila = document.createElement("li");
  fila.append(
    celda(etiqueta, "resumen-etiqueta"),
    celda(conHora(registro, texto), "resumen-valor")
  );
  return fila;
}

// La lista completa de hoy (spec 037): antes solo se veía lo último de cada
// tipo, aunque hubiera varias comidas. Ahora se ven todos los registros de
// hoy, ordenados por su hora (la más tardía primero) y con los que no tienen
// hora al final, en el orden en que ya vienen cargados. Los "+" para apuntar
// viven aparte, en #mas-hoy: no tiene sentido uno por línea con N líneas por
// tipo.
function pintarResumen(registros) {
  const hoy = hoyISO();
  const lista = id("hoy-resumen");
  const deHoy = (regs) => regs.filter((r) => r.fecha === hoy);

  const entradas = [
    ...deHoy(registros.pesajes).map((r) => ({
      registro: r,
      etiqueta: "Peso",
      texto: `${r.pesoKg.toFixed(1).replace(".", ",")} kg`
    })),
    ...deHoy(registros.comidas).map((r) => ({
      registro: r,
      etiqueta: "Comida",
      texto: r.texto
    })),
    ...deHoy(registros.ejercicios).map((r) => ({
      registro: r,
      etiqueta: "Ejercicio",
      texto: `${r.texto} · ${r.minutos} min`
    })),
    ...deHoy(registros.bebidas || []).map((r) => ({
      registro: r,
      etiqueta: "Bebida",
      texto: r.texto
    }))
  ];

  // Comparador de tres vías: con la misma hora, Array#sort es estable y
  // conserva el orden de carga (por creadoEn), que es lo que pide la spec
  // para el empate — un "a < b ? 1 : -1" a secas invertiría ese orden.
  const conHoraEntradas = entradas
    .filter((entrada) => entrada.registro.hora)
    .sort((a, b) => {
      if (a.registro.hora === b.registro.hora) return 0;
      return a.registro.hora < b.registro.hora ? 1 : -1;
    });
  const sinHoraEntradas = entradas.filter((entrada) => !entrada.registro.hora);

  lista.innerHTML = "";
  [...conHoraEntradas, ...sinHoraEntradas].forEach(({ registro, etiqueta, texto }) => {
    lista.appendChild(lineaDeRegistro(etiqueta, registro, texto));
  });
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

// El detalle real de un día (spec 037): antes solo decía qué categorías se
// habían apuntado ("comida, ejercicio"); ahora enseña el texto de cada
// registro de ese día, sin recortar.
function detalleDelDia(fecha, registros) {
  const deEseDia = (regs) => regs.filter((r) => r.fecha === fecha);

  const lineas = [
    ...deEseDia(registros.pesajes).map(
      (r) => `Peso: ${conHora(r, `${r.pesoKg.toFixed(1).replace(".", ",")} kg`)}`
    ),
    ...deEseDia(registros.comidas).map((r) => `Comida: ${conHora(r, r.texto)}`),
    ...deEseDia(registros.ejercicios).map(
      (r) => `Ejercicio: ${conHora(r, `${r.texto} · ${r.minutos} min`)}`
    )
  ];

  if (lineas.length === 0) return `${formatearFecha(fecha)} — sin registros`;
  return `${formatearFecha(fecha)}\n${lineas.join("\n")}`;
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
    detalle.textContent = detalleDelDia(casilla.fecha, registros);
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
  // `bebidas` viaja en el mismo objeto, pero solo lo lee pintarResumen(): el
  // calendario, la gamificación y el detalle del día nombran sus colecciones a
  // mano, así que las bebidas no pueden colárseles aunque estén aquí. Es a
  // propósito: no dan puntos, no mantienen la racha y un día de solo bebidas no
  // es un día registrado.
  const registros = {
    pesajes: listaPeso.obtenerRegistros(),
    comidas: listaComidas.obtenerRegistros(),
    ejercicios: listaEjercicios.obtenerRegistros(),
    bebidas: listaBebidas.obtenerRegistros()
  };

  id("hoy-fecha").textContent = fechaLarga(hoyISO());
  pintarResumen(registros);
  pintarRangos();
  pintarCalendario(registros);
  pintarLoDeSiempre(registros.comidas);
  pintarEjerciciosFrecuentes(registros.ejercicios);
  pintarBebidasFrecuentes(registros.bebidas);
  pintarAnalisis(registros.comidas);
  pintarGamificacion(registros);
}

// --- Puntos, racha y emblemas (spec 031) ----------------------------------

function pintarGamificacion(registros) {
  const operacion = operacionActiva(operacionesCargadas);
  if (!operacion) return;

  const { puntos, racha, graciaDisponible, emblemas } = calcularGamificacion({
    pesajes: registros.pesajes,
    comidas: registros.comidas,
    ejercicios: registros.ejercicios,
    fotos: fotosCargadas,
    consultas: consultasCargadas,
    inicio: operacion.inicio,
    hoy: hoyISO()
  });

  const lista = id("gamificacion-resumen");
  lista.innerHTML = "";
  lista.appendChild(lineaDeEstadistica("Puntos", String(puntos)));
  lista.appendChild(
    lineaDeEstadistica("Racha", `${racha} ${racha === 1 ? "día" : "días"}`)
  );

  id("gamificacion-gracia").textContent = graciaDisponible
    ? "Todavía tienes el día de gracia de esta semana."
    : "Ya has gastado el día de gracia de esta semana.";

  const contenedorEmblemas = id("gamificacion-emblemas");
  contenedorEmblemas.innerHTML = "";
  emblemas.forEach((emblema) => {
    const fila = document.createElement("div");
    fila.className = "emblema";
    fila.classList.toggle("conseguido", emblema.conseguido);

    const nombre = document.createElement("span");
    nombre.className = "emblema-nombre";
    nombre.textContent = emblema.etiqueta;

    const condicion = document.createElement("span");
    condicion.className = "emblema-condicion";
    condicion.textContent = emblema.condicion;

    fila.append(nombre, condicion);
    contenedorEmblemas.appendChild(fila);
  });
}

// --- Detalle nutricional del día (spec 030) -------------------------------
//
// La IA lee las comidas que ya apuntaste y las reparte en seis grupos con una
// horquilla de calorías. Nunca un número exacto: PRODUCTO.md lo prohíbe.

let analisisDeHoy = null;

function comidasDeHoy(comidas) {
  const hoy = hoyISO();
  return comidas.filter((comida) => comida.fecha === hoy);
}

function pintarAnalisis(comidas) {
  const deHoy = comidasDeHoy(comidas);
  const boton = id("btn-analizar");
  const quedan = quedanAnalisisHoy(analisisDeHoy);
  const viejo = estaViejo(analisisDeHoy, deHoy.length);

  pintarDetalleDelDia();

  // Sin comidas no hay nada que repartir, y gastar una llamada para que la IA
  // diga que no has comido nada sería tonto.
  if (!deHoy.length) {
    boton.disabled = true;
    boton.textContent = "Analizar lo que llevo hoy";
    id("estado-analisis").textContent =
      "Apunta lo que comas y podré decirte qué llevas.";
    id("cupo-analisis").textContent = "";
    id("viejo-analisis").textContent = "";
    return;
  }

  id("estado-analisis").textContent = analisisDeHoy
    ? ""
    : "Lee lo que has apuntado y lo reparte en grupos de alimentos, con las calorías aproximadas.";

  // El aviso de desactualizado se ve aunque no quede cupo: es la explicación
  // de por qué el dato no cuadra con lo que has apuntado.
  id("viejo-analisis").textContent = viejo
    ? "Has apuntado algo después de este análisis."
    : "";

  boton.textContent = viejo ? "Volver a analizar" : "Analizar lo que llevo hoy";

  // Con el análisis al día no hay nada que pedir, aunque quede cupo.
  const nadaQuePedir = Boolean(analisisDeHoy) && !viejo;
  boton.disabled = quedan === 0 || nadaQuePedir;

  id("cupo-analisis").textContent = quedan
    ? nadaQuePedir
      ? "Ya has analizado el día de hoy."
      : `Te ${quedan === 1 ? "queda" : "quedan"} ${quedan} de hoy.`
    : `Has analizado tu día ${ANALISIS_POR_DIA} veces. Vuelve mañana.`;
}

function pintarDetalleDelDia() {
  const contenedor = id("detalle-analisis");
  contenedor.innerHTML = "";
  if (!analisisDeHoy) return;

  // Los seis grupos van siempre, aunque sean "nada": un día sin verdura se ve
  // mejor si la fila está y está vacía.
  GRUPOS.forEach((grupo, indice) => {
    const guardado = (analisisDeHoy.grupos || [])[indice] || {};
    const medida = MEDIDAS.includes(guardado.medida) ? guardado.medida : "nada";
    const escalon = MEDIDAS.indexOf(medida);

    const fila = document.createElement("div");
    fila.className = "grupo-analisis";

    const barra = document.createElement("div");
    barra.className = "grupo-barra";
    const relleno = document.createElement("span");
    relleno.style.width = `${(escalon / (MEDIDAS.length - 1)) * 100}%`;
    barra.appendChild(relleno);

    fila.append(
      celda(grupo, "grupo-nombre"),
      barra,
      celda(medida, "grupo-medida")
    );
    contenedor.appendChild(fila);
  });

  const calorias = document.createElement("p");
  calorias.className = "calorias-analisis";
  calorias.textContent = `Entre ${analisisDeHoy.caloriasMin.toLocaleString("es-ES")} y ${analisisDeHoy.caloriasMax.toLocaleString("es-ES")} kcal aproximadamente`;
  contenedor.appendChild(calorias);

  if (analisisDeHoy.comentario) {
    const comentario = document.createElement("p");
    comentario.className = "comentario-analisis";
    comentario.textContent = analisisDeHoy.comentario;
    contenedor.appendChild(comentario);
  }

  const hora = document.createElement("p");
  hora.className = "aviso-analisis";
  const cuando = analisisDeHoy.editadoEn || analisisDeHoy.creadoEn;
  hora.textContent =
    (cuando ? `Analizado a las ${horaDe(cuando)}. ` : "") +
    "Es una estimación de una IA a partir de lo que has escrito, no una medición.";
  contenedor.appendChild(hora);
}

// La marca de tiempo de Firestore llega como Timestamp, y recién guardada
// puede llegar todavía sin resolver: entonces no se enseña la hora.
function horaDe(marca) {
  if (!marca || !marca.toDate) return "";
  return marca.toDate().toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

id("btn-analizar").addEventListener("click", async () => {
  const error = id("error-analisis");
  const estado = id("estado-analisis");
  const boton = id("btn-analizar");
  const deHoy = comidasDeHoy(listaComidas.obtenerRegistros());

  if (!deHoy.length) return;

  error.textContent = "";
  estado.textContent = "Pensando…";
  boton.disabled = true;

  try {
    const respuesta = await pedirAnalisisALaIa(
      uidActual,
      deHoy.map(({ momento, texto }) => ({ momento, texto })),
      proveedorIaActual
    );

    await guardarAnalisis(
      uidActual,
      hoyISO(),
      respuesta,
      deHoy.length,
      analisisDeHoy ? analisisDeHoy.veces : 0
    );
    await refrescarAnalisis();
  } catch (fallo) {
    error.textContent = mensajeDeErrorDeConsulta(fallo.codigo);
    // Si falló, refrescarAnalisis no llegó a repintar: hay que devolverle al
    // botón su estado. Cuando va bien, ya lo ha hecho él.
    refrescarHoy();
  } finally {
    estado.textContent = "";
  }
});

async function refrescarAnalisis() {
  try {
    analisisDeHoy = await leerAnalisisDe(uidActual, hoyISO());
  } catch {
    analisisDeHoy = null;
    id("error-analisis").textContent =
      "No se ha podido cargar el análisis de hoy. Comprueba tu conexión.";
    return;
  }
  refrescarHoy();
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
  desplegarArriba: "btn-desplegar-pesajes-arriba",
  textoSinEseDia: "No hay pesajes de ese día.",
  textoVacio:
    "Aún no has apuntado ningún pesaje. Pésate al levantarte, antes de desayunar: es el momento más comparable.",
  errorCarga: "No se han podido cargar tus pesajes. Comprueba tu conexión.",
  confirmacionBorrado: "¿Borrar este pesaje?",
  cargar: listarPesajes,
  borrar: borrarPesaje,
  fila: (pesaje) => ({
    que: `${pesaje.pesoKg.toFixed(1).replace(".", ",")} kg`,
    detalles: [formatearFechaConHora(pesaje.fecha, pesaje.hora)]
  }),
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

// Fecha y hora plegadas (spec 038, mismo patrón que Comidas en la 037).
id("btn-fecha-hora-pesaje").addEventListener("click", () => {
  id("campos-fecha-hora-pesaje").classList.remove("oculta");
  id("btn-fecha-hora-pesaje").classList.add("oculta");
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
    id("campos-fecha-hora-pesaje").classList.add("oculta");
    id("btn-fecha-hora-pesaje").classList.remove("oculta");
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
  const botonArriba = id("btn-desplegar-recetas-arriba");

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
  botonArriba.classList.toggle("oculta", !hayEscondidas && !recetasDesplegadas);
  botonArriba.textContent = boton.textContent;
}

// Lo que se lee de una receta: el resumen de despensa, los ingredientes con sus
// marcas y la preparación. Sin nombre, sin raciones y sin botones — eso lo pone
// quien la enseña, que no es lo mismo en el recetario que en la dieta.
//
// Vive suelta porque la leen DOS sitios (spec 060): la tarjeta del recetario y
// la receta desplegada bajo una comida de la semana. Duplicarlo significaría que
// un arreglo del cruce se aplica en un sitio y en el otro no.
function cuerpoDeReceta(receta) {
  const trozo = document.createDocumentFragment();

  // Qué tienes y qué te falta, contra tu despensa de AHORA (spec 059). No se
  // guarda nada: se calcula al abrir la receta. Si se hubiera guardado el día
  // que se generó, a los tres días seguiría diciendo que tienes el tomate que ya
  // te comiste.
  const cruzados = cruzarConLaDespensa(receta.ingredientes, despensaCargada);
  const marcando = despensaCargada.length > 0 && cruzados.length > 0;

  if (marcando) {
    const resumen = document.createElement("p");
    resumen.className = "receta-resumen-despensa";
    const tienes = cruzados.filter((linea) => linea.tengo).length;
    resumen.textContent = `Tienes ${tienes} de ${cruzados.length}`;
    trozo.appendChild(resumen);
  }

  const ingredientes = document.createElement("ul");
  ingredientes.className = "receta-ingredientes";
  cruzados.forEach(({ texto, tengo }) => {
    const linea = document.createElement("li");
    linea.textContent = texto;
    // Sin despensa, la receta se ve exactamente como antes de la spec 059.
    if (marcando) {
      linea.classList.add(tengo ? "lo-tengo" : "me-falta");
      // El "✓" lo pone el CSS y la opacidad no la lee nadie: sin este título,
      // quien no ve la pantalla no se entera de la despensa.
      linea.title = tengo ? "Lo tienes en casa" : "Te falta";
    }
    ingredientes.appendChild(linea);
  });
  trozo.appendChild(ingredientes);

  if (receta.preparacion) {
    const preparacion = document.createElement("p");
    preparacion.className = "receta-preparacion";
    preparacion.textContent = receta.preparacion;
    trozo.appendChild(preparacion);
  }

  return trozo;
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

  tarjeta.appendChild(cuerpoDeReceta(receta));

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

  // La semana también depende de las recetas desde la spec 060: un plato solo
  // se puede tocar si la receta que enlaza existe en `recetasCargadas`.
  //
  // refrescarTodo() lanza esta función y refrescarDieta() a la vez, sin orden
  // garantizado: si la dieta llegaba primero, la semana se pintaba con la lista
  // de recetas todavía vacía y ningún plato salía tocable hasta el siguiente
  // repintado. Con dieta cargada, se vuelve a pintar aquí.
  if (dietaActiva) pintarDieta();
}

id("btn-nueva-receta").addEventListener("click", () => abrirFormularioDeReceta(null));
id("btn-cancelar-receta").addEventListener("click", cerrarFormularioDeReceta);

id("btn-desplegar-recetas").addEventListener("click", () => {
  recetasDesplegadas = !recetasDesplegadas;
  pintarRecetas();
  if (!recetasDesplegadas) {
    id("btn-desplegar-recetas").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
});

id("btn-desplegar-recetas-arriba").addEventListener("click", () => {
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

// --- El agua del día (spec 061) ------------------------------------------
//
// Un contador, no un diario: +1, -1 y el número de hoy. Sin hora, sin tamaño de
// vaso y sin historial.
//
// El agua NO da puntos, no mantiene la racha y no sale en el calendario. Y eso
// no depende de tener cuidado aquí: `calcularPuntos()` y `calcularResumen()`
// reciben sus colecciones como parámetros nombrados, así que `agua` no puede
// colarse en ellos aunque esté en COLECCIONES.

let vasosDeHoy = 0;
let vasosObjetivoActual = VASOS_OBJETIVO_POR_DEFECTO;
// El día que se pintó, para no escribir en el de hoy si la pestaña lleva abierta
// desde ayer. Ver el comentario de cambiarVasos().
let diaDelAgua = null;

function pintarAgua() {
  const progreso = id("agua-progreso");
  const cumplido = vasosDeHoy >= vasosObjetivoActual;

  progreso.textContent = cumplido
    ? `${vasosDeHoy} de ${vasosObjetivoActual} vasos · objetivo cumplido`
    : `${vasosDeHoy} de ${vasosObjetivoActual} vasos`;
  progreso.classList.toggle("cumplido", cumplido);

  // Restar con 0 no hace nada, así que el botón no se ofrece: no hay vasos
  // negativos y un botón que no hace nada es peor que no tenerlo.
  id("btn-menos-agua").classList.toggle("oculta", vasosDeHoy === 0);

  // El tope no es de salud, es contra el toque atascado. Se dice, no se esconde.
  id("btn-mas-agua").disabled = vasosDeHoy >= MAXIMO_VASOS;
}

async function cambiarVasos(cuantos) {
  const antes = vasosDeHoy;
  const ahora = Math.min(MAXIMO_VASOS, Math.max(0, antes + cuantos));
  if (ahora === antes) return;

  // La fecha es la del pintado, no hoyISO() en el momento del toque: si la
  // pestaña lleva abierta desde ayer, el número que se ve en pantalla es el de
  // ayer, y sumarle uno tiene que escribir en ayer. Escribir en hoy le añadiría
  // a hoy los vasos de ayer. Es la misma medianoche que ya arrastra "Hoy"
  // entero, heredada a propósito.
  const fecha = diaDelAgua || hoyISO();

  // Optimista, y se escribe el TOTAL, no un incremento: por eso tocar ocho veces
  // seguidas funciona sin esperar a que vuelva cada escritura.
  vasosDeHoy = ahora;
  id("error-agua").textContent = "";
  pintarAgua();

  try {
    await guardarVasos(uidActual, fecha, ahora);
  } catch {
    vasosDeHoy = antes;
    pintarAgua();
    id("error-agua").textContent = "No se ha podido guardar. Comprueba tu conexión.";
  }
}

async function refrescarAgua() {
  const fecha = hoyISO();
  try {
    vasosDeHoy = await leerVasosDe(uidActual, fecha);
    diaDelAgua = fecha;
  } catch {
    vasosDeHoy = 0;
    diaDelAgua = fecha;
    id("error-agua").textContent = "No se ha podido cargar el agua de hoy.";
  }
  pintarAgua();
}

id("btn-mas-agua").addEventListener("click", () => cambiarVasos(1));
id("btn-menos-agua").addEventListener("click", () => cambiarVasos(-1));

// --- La despensa (spec 058) ----------------------------------------------
//
// Lo que tienes en la cocina, para que la dieta pueda aprovecharlo (eso es la
// spec 059). Aquí solo se monta la lista.
//
// Dos cosas que parecen detalles y son el corazón de la spec:
//
// 1. La lista NO se reordena al marcar. `despensaCargada` conserva el orden con
//    el que se pintó al entrar, y marcar solo cambia el `tengo` de un elemento.
//    Si se reordenara en cada toque, la fila recién marcada saltaría bajo el
//    dedo y la siguiente ocuparía su sitio.
// 2. Añadir un duplicado NO es un error del usuario: es su forma de decir "he
//    vuelto a comprarlo". Por eso re-marca y avisa en el hueco de "Guardado",
//    nunca en el de error.

let despensaCargada = [];
let ingredienteEditando = null;

function pintarDespensa() {
  const contenedor = id("lista-despensa");
  const recuento = id("recuento-despensa");

  contenedor.innerHTML = "";

  id("estado-despensa").textContent = despensaCargada.length
    ? ""
    : "Aquí van los ingredientes con los que sueles cocinar. Márcalos según los tengas en casa y la dieta podrá aprovecharlos.";

  const enCasa = despensaCargada.filter((ingrediente) => ingrediente.tengo).length;
  recuento.textContent = despensaCargada.length
    ? `${enCasa} de ${despensaCargada.length} ingredientes en casa`
    : "";

  despensaCargada.forEach((ingrediente) =>
    contenedor.appendChild(filaDeIngrediente(ingrediente))
  );
}

function filaDeIngrediente(ingrediente) {
  if (ingredienteEditando === ingrediente.id) {
    return filaDeIngredienteEnEdicion(ingrediente);
  }

  const fila = document.createElement("div");
  fila.className = "ingrediente";
  fila.classList.toggle("sin-existencias", !ingrediente.tengo);

  const casilla = document.createElement("input");
  casilla.type = "checkbox";
  casilla.checked = Boolean(ingrediente.tengo);
  casilla.id = `ingrediente-casilla-${ingrediente.id}`;
  casilla.addEventListener("change", () => marcarEnDespensa(ingrediente, casilla));

  // La etiqueta envuelve el nombre para que tocar el texto también marque: en
  // el móvil, apuntar a una casilla de 20 px es pedirle demasiado al pulgar.
  const etiqueta = document.createElement("label");
  etiqueta.className = "ingrediente-nombre";
  etiqueta.htmlFor = casilla.id;
  etiqueta.textContent = ingrediente.nombre;

  const acciones = document.createElement("div");
  acciones.className = "ingrediente-acciones";
  acciones.append(
    botonDeIcono("lapiz", "Editar", () => {
      ingredienteEditando = ingrediente.id;
      limpiarAvisosDespensa();
      pintarDespensa();
    }),
    botonDeIcono("papelera", "Borrar", () => borrarElIngrediente(ingrediente))
  );

  fila.append(casilla, etiqueta, acciones);
  return fila;
}

function filaDeIngredienteEnEdicion(ingrediente) {
  const fila = document.createElement("form");
  fila.className = "ingrediente ingrediente-editando";

  const campo = document.createElement("input");
  campo.type = "text";
  campo.maxLength = MAX_NOMBRE_INGREDIENTE;
  campo.value = ingrediente.nombre;

  const guardar = document.createElement("button");
  guardar.type = "submit";
  guardar.textContent = "Guardar";

  const cancelar = botonDeFila("Cancelar", () => {
    ingredienteEditando = null;
    limpiarAvisosDespensa();
    pintarDespensa();
  });
  cancelar.className = "enlace";

  fila.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    await renombrarElIngrediente(ingrediente, campo.value, guardar);
  });

  fila.append(campo, guardar, cancelar);
  // Al final de la cola de pintado: antes de que la fila esté en el documento,
  // focus() no hace nada.
  setTimeout(() => campo.focus(), 0);
  return fila;
}

async function marcarEnDespensa(ingrediente, casilla) {
  const antes = Boolean(ingrediente.tengo);
  const ahora = casilla.checked;

  // Optimista: la casilla ya ha cambiado sola y la fila se apaga o se enciende
  // con ella. Lo que no cambia es el ORDEN, a propósito.
  ingrediente.tengo = ahora;
  casilla.closest(".ingrediente").classList.toggle("sin-existencias", !ahora);
  limpiarAvisosDespensa();
  actualizarRecuentoDespensa();

  try {
    await marcarIngrediente(uidActual, ingrediente.id, ahora);
  } catch {
    // Nunca dejar la casilla enseñando algo que no se guardó.
    ingrediente.tengo = antes;
    casilla.checked = antes;
    casilla.closest(".ingrediente").classList.toggle("sin-existencias", !antes);
    actualizarRecuentoDespensa();
    errorEnDespensa("No se ha podido guardar. Comprueba tu conexión.");
  }
}

// Los dos avisos de la despensa son excluyentes: enseñar "Guardado" y "no se ha
// podido guardar" a la vez es lo que pasó al estrenar la spec 058, y no había
// forma de saber cuál de los dos era verdad.
//
// El error no se borra solo, al revés que el aviso: si algo ha fallado, tiene
// que seguir ahí hasta que hagas otra cosa.
function limpiarAvisosDespensa() {
  id("error-despensa").textContent = "";
  id("guardado-despensa").textContent = "";
}

function errorEnDespensa(texto) {
  id("guardado-despensa").textContent = "";
  id("error-despensa").textContent = texto;
}

// Solo el número: repintar la lista entera aquí la reordenaría, que es justo lo
// que no debe pasar al marcar.
function actualizarRecuentoDespensa() {
  const enCasa = despensaCargada.filter((ingrediente) => ingrediente.tengo).length;
  id("recuento-despensa").textContent = despensaCargada.length
    ? `${enCasa} de ${despensaCargada.length} ingredientes en casa`
    : "";
}

async function renombrarElIngrediente(ingrediente, nombreBruto, boton) {
  limpiarAvisosDespensa();

  const resultado = validarIngrediente(nombreBruto);
  if (resultado.error) {
    errorEnDespensa(resultado.error);
    return;
  }

  // Editar hasta chocar con otro RECHAZA, no fusiona: fusionar haría
  // desaparecer una fila que nadie ha pedido borrar, y aquí no hay deshacer.
  // Al añadir sí se fusiona, porque allí no desaparece nada.
  const choque = ingredienteIgual(despensaCargada, resultado.nombre, ingrediente.id);
  if (choque) {
    errorEnDespensa(`"${choque.nombre}" ya está en tu despensa.`);
    return;
  }

  boton.disabled = true;
  try {
    await renombrarIngrediente(uidActual, ingrediente.id, resultado.nombre);
  } catch {
    errorEnDespensa("No se ha podido guardar. Comprueba tu conexión.");
    return;
  } finally {
    boton.disabled = false;
  }

  // Fuera del try de arriba a propósito: lo que se escribe y lo que se pinta son
  // dos cosas, y meterlas en el mismo catch fue el fallo del estreno de la spec
  // 058. Un error al pintar salía como "comprueba tu conexión" con el dato ya
  // guardado y la conexión perfecta.
  ingredienteEditando = null;
  await refrescarDespensa();
}

async function borrarElIngrediente(ingrediente) {
  if (!confirm(`¿Quitar "${ingrediente.nombre}" de tu despensa?`)) return;

  try {
    await borrarIngrediente(uidActual, ingrediente.id);
  } catch {
    errorEnDespensa("No se ha podido borrar. Comprueba tu conexión.");
    return;
  }

  if (ingredienteEditando === ingrediente.id) ingredienteEditando = null;
  await refrescarDespensa();
}

// Se llama al entrar en la sub-pestaña, desde abrirSubpestana(). Reordena lo
// que ya está cargado, sin ir a la red: es solo poner arriba lo que has marcado
// desde la última vez que entraste.
function reordenarDespensa() {
  if (!despensaCargada.length) return;
  despensaCargada = ordenarDespensa(despensaCargada);
  pintarDespensa();
}

async function refrescarDespensa() {
  try {
    despensaCargada = await listarDespensa(uidActual);
  } catch {
    despensaCargada = [];
    id("estado-despensa").textContent =
      "No se ha podido cargar tu despensa. Comprueba tu conexión.";
    return;
  }
  pintarDespensa();
}

id("form-ingrediente").addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const campo = id("ingrediente-nombre");
  limpiarAvisosDespensa();

  const resultado = validarIngrediente(campo.value);
  if (resultado.error) {
    errorEnDespensa(resultado.error);
    return;
  }

  const boton = id("btn-anadir-ingrediente");
  boton.disabled = true;

  // Solo la escritura va en el try. El repintado se hace después, fuera: si se
  // rompe al pintar, el dato YA está guardado y decir "comprueba tu conexión"
  // sería mentira. Así fue como el estreno de la spec 058 enseñó a la vez
  // "Guardado" y un error de conexión con la conexión perfecta.
  let aviso;
  try {
    const repetido = ingredienteIgual(despensaCargada, resultado.nombre);

    if (repetido) {
      // Volver a escribirlo no es equivocarse: es re-marcarlo. Por eso el aviso
      // va en el hueco de "Guardado" y no en el de error.
      if (!repetido.tengo) {
        await marcarIngrediente(uidActual, repetido.id, true);
        aviso = `"${repetido.nombre}" ya estaba en tu despensa: lo marco como que lo tienes.`;
      } else {
        aviso = `"${repetido.nombre}" ya está en tu despensa.`;
      }
    } else {
      await guardarIngrediente(uidActual, resultado.nombre);
      aviso = "Guardado";
    }
  } catch {
    errorEnDespensa("No se ha podido guardar. Comprueba tu conexión.");
    return;
  } finally {
    boton.disabled = false;
  }

  avisarEnDespensa(aviso);
  campo.value = "";
  await refrescarDespensa();
  // Lo normal al estrenar esto es meter quince seguidos.
  campo.focus();
});

// Hermano de avisarGuardado() con texto propio: aquí el aviso no siempre dice
// "Guardado", a veces explica que el ingrediente ya estaba.
function avisarEnDespensa(texto) {
  const aviso = id("guardado-despensa");
  // El error de antes deja de aplicar en cuanto algo sale bien.
  id("error-despensa").textContent = "";
  aviso.textContent = texto;
  setTimeout(() => {
    aviso.textContent = "";
  }, 3000);
}

// --- La dieta de la semana (spec 028) ------------------------------------
//
// La dieta es el plan; las comidas apuntadas son el diario. Que hayas comido
// el lunes lo que ponía el jueves es asunto tuyo: aquí no se marca nada.

let dietaActiva = null;
let celdaEditando = null;

// Qué receta de la semana está desplegada, como "indiceDia-indiceComida" (spec
// 060). Una sola, igual que `recetaAbierta` en el recetario.
let recetaDeDietaAbierta = null;

// Qué día de la semana se está mirando, 0 = lunes (spec 064). `null` significa
// "la semana entera", que es como se veía antes de esta spec y sigue estando
// disponible: la vista de un día sirve para lo diario, la de la semana para
// repasar lo que te han mandado.
//
// No se guarda en ningún sitio y no se recuerda entre recargas: es un estado de
// mirar, no una preferencia.
let diaDietaAbierto = 0;

// Las letras de la tira. La equis del miércoles es la convención española, no
// una errata: L M X J V S D.
const LETRAS_DE_DIA = ["L", "M", "X", "J", "V", "S", "D"];

function pintarDieta() {
  const contenedor = id("semana-dieta");
  const estado = id("estado-dieta");

  contenedor.innerHTML = "";

  // Sin dieta, la acción que toca es empezarla; con dieta, ese botón sustituye
  // lo que ya tienes y no debe competir con la semana.
  const boton = id("btn-semana-blanco");
  boton.classList.toggle("accion-principal", !dietaActiva);
  boton.textContent = dietaActiva
    ? "Vaciar y empezar de nuevo"
    : "Empezar una semana en blanco";

  if (!dietaActiva) {
    estado.textContent =
      "Aún no tienes dieta. Puedes montarla tú eligiendo de tus recetas —esto no gasta ninguna petición a la IA— o pedírsela a la IA aquí debajo.";
    // Sin dieta no hay tira ni modos de vista: recuadros vacíos no dicen nada.
    id("dias-dieta").innerHTML = "";
    id("btn-ver-semana").classList.add("oculta");
    return;
  }

  estado.textContent = "";

  // Una semana guardada de antes podría no tener exactamente siete días. Sin
  // esto, un día abierto fuera de rango dejaría la pantalla en blanco sin decir
  // por qué.
  if (diaDietaAbierto !== null && diaDietaAbierto >= dietaActiva.dias.length) {
    diaDietaAbierto = 0;
  }

  pintarTiraDeDias({
    contenedor: "dias-dieta",
    dias: dietaActiva.dias,
    abierto: diaDietaAbierto,
    tieneAlgo: (dia) => dia.comidas.some((comida) => comida.texto),
    alElegir: (indice) => {
      diaDietaAbierto = indice;
      // La receta abierta se guarda por posición ("2-1"), así que al cambiar de
      // día esa posición ya es otro plato.
      recetaDeDietaAbierta = null;
      celdaEditando = null;
      pintarDieta();
    }
  });

  const verSemana = id("btn-ver-semana");
  verSemana.classList.remove("oculta");
  verSemana.textContent =
    diaDietaAbierto === null ? "Ver un solo día" : "Ver la semana entera";

  dietaActiva.dias.forEach((dia, indiceDia) => {
    // Con un día abierto se pinta solo ese. Con `null`, la semana entera, que es
    // como se veía antes de la spec 064.
    if (diaDietaAbierto !== null && indiceDia !== diaDietaAbierto) return;

    const bloque = document.createElement("section");
    bloque.className = "dia-dieta";

    const titulo = document.createElement("h3");
    // El nombre entero, no la letra: la tira es para elegir, el título para
    // saber dónde estás sin descifrar una inicial.
    titulo.textContent = dia.dia;
    bloque.appendChild(titulo);

    dia.comidas.forEach((comida, indiceComida) => {
      const clave = `${indiceDia}-${indiceComida}`;

      if (celdaEditando === clave) {
        bloque.appendChild(filaEnEdicion(indiceDia, indiceComida, comida));
        return;
      }

      bloque.appendChild(filaDeComida(indiceDia, indiceComida, comida));

      // La receta, desplegada JUSTO DEBAJO de su fila (spec 060). Se pinta aquí
      // y no dentro de filaDeComida() porque es hermana de la fila, no hija: la
      // fila es una rejilla de columnas y meterle la receta dentro la
      // descuadraría.
      if (recetaDeDietaAbierta === clave) {
        bloque.appendChild(recetaDesplegada(comida));
      }
    });

    contenedor.appendChild(bloque);
  });
}

// La tira de siete recuadros (spec 064).
//
// Cada uno lleva su letra y, si ese día tiene algo puesto, un punto debajo. Un
// punto y no el número de comidas: de un vistazo interesa si hay algo, no
// cuánto.
//
// La letra sola no se la puede leer nadie que no vea la pantalla, así que el
// aria-label dice el día entero.
// La tira la usan las DOS semanas: la dieta (spec 064) y la tabla de ejercicio
// (spec 067). Es literalmente el mismo componente, y duplicarlo garantizaría que
// un arreglo se aplicara en una pantalla y en la otra no.
//
// Recibe los días, cuál está abierto, cómo saber si un día tiene algo, y qué
// hacer al tocar. Lo demás lo pone ella.
function pintarTiraDeDias({ contenedor, dias, abierto, tieneAlgo, alElegir }) {
  const tira = id(contenedor);
  tira.innerHTML = "";

  if (!dias) return;

  const hoy = diaDeLaSemana(hoyISO());

  dias.forEach((dia, indice) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "dia-recuadro";
    boton.setAttribute("aria-label", dia.dia);
    boton.title = dia.dia;

    boton.classList.toggle("es-hoy", indice === hoy);
    boton.classList.toggle("abierto", indice === abierto);
    if (indice === abierto) boton.setAttribute("aria-current", "true");

    const letra = document.createElement("span");
    letra.className = "dia-letra";
    // Con más de siete días la letra no existe; se cae al número antes que a
    // un hueco vacío.
    letra.textContent = LETRAS_DE_DIA[indice] || String(indice + 1);
    boton.appendChild(letra);

    // El punto va siempre en el DOM, encendido o apagado: si solo se añadiera
    // cuando hay comidas, los recuadros con y sin punto medirían distinto y la
    // tira quedaría descuadrada, que es justo lo que esta versión viene a
    // arreglar.
    const punto = document.createElement("span");
    punto.className = "dia-punto";
    punto.classList.toggle("con-algo", tieneAlgo(dia));
    boton.appendChild(punto);

    boton.addEventListener("click", () => alElegir(indice));

    tira.appendChild(boton);
  });
}

id("btn-ver-semana-tabla").addEventListener("click", () => {
  diaTablaAbierto = diaTablaAbierto === null ? diaDeLaSemana(hoyISO()) : null;
  diaEditando = null;
  pintarTabla();
});

id("btn-ver-semana").addEventListener("click", () => {
  // Al volver a un solo día se abre el de hoy, no el último que se estuviera
  // mirando: es el que se quiere ver el 99% de las veces.
  diaDietaAbierto = diaDietaAbierto === null ? diaDeLaSemana(hoyISO()) : null;
  recetaDeDietaAbierta = null;
  celdaEditando = null;
  pintarDieta();
});

function filaDeComida(indiceDia, indiceComida, comida) {
  const fila = document.createElement("div");
  fila.className = "comida-dieta";

  fila.append(
    celda(etiquetaDeMomento(comida.momento), "resumen-etiqueta"),
    nombreDelPlato(indiceDia, indiceComida, comida)
  );

  if (comida.texto) {
    // Iconos y no texto (spec 065): los botones de texto tenían ancho variable
    // -"Me lo he comido" solo sale con texto, y el otro dice "Editar" o "+"-,
    // así que la columna del plato acababa en un sitio distinto en cada fila.
    // Con iconos todos miden lo mismo y las filas se alinean solas.
    const apuntar = botonDeIcono("comido", "Me lo he comido", () =>
      apuntarDeLaDieta(comida, apuntar)
    );
    apuntar.classList.add("boton-comido");
    fila.appendChild(apuntar);
  }

  const editar = botonDeIcono(
    comida.texto ? "lapiz" : "anadir",
    comida.texto ? "Editar" : "Añadir comida",
    () => {
      celdaEditando = `${indiceDia}-${indiceComida}`;
      // Editar cierra la receta: el formulario ocupa el sitio de la fila y
      // dejar la receta colgando debajo la separaría de aquello a lo que
      // pertenece.
      recetaDeDietaAbierta = null;
      pintarDieta();
    }
  );
  fila.appendChild(editar);

  return fila;
}

// El nombre del plato (spec 060). Si esa comida tiene receta enlazada Y la
// receta sigue existiendo, el nombre se toca para abrirla; si no, es texto
// plano, exactamente como antes de esta spec.
//
// El aviso visual importa: un texto que reacciona al tocarlo sin decir que
// reacciona es un truco escondido. De ahí la clase, que lo subraya punteado.
//
// Es un <button> y no un <span> con listener: así entra con el tabulador, se
// activa con Enter y un lector de pantalla lo anuncia como algo que se pulsa.
function nombreDelPlato(indiceDia, indiceComida, comida) {
  const receta = recetaDeLaComida(comida);

  if (!receta) return celda(comida.texto || "—", "plato-nombre");

  const clave = `${indiceDia}-${indiceComida}`;
  const abierta = recetaDeDietaAbierta === clave;

  const boton = botonDeFila("", () => {
    // Solo una abierta a la vez: con veintiocho comidas en pantalla, varias
    // desplegadas convierten la semana en un scroll sin fondo.
    recetaDeDietaAbierta = abierta ? null : clave;
    pintarDieta();
  });
  boton.className = "plato-con-receta";
  boton.setAttribute("aria-expanded", String(abierta));
  boton.title = abierta ? "Cerrar la receta" : "Ver la receta";

  // El texto va DENTRO de un span, y no suelto en el botón. No es un capricho:
  // un <button> mete su contenido en una caja anónima cuyo ancho mínimo es el
  // del contenido, y esa caja ignora el text-overflow del botón. Con el texto
  // suelto, un plato largo no se recortaba, la fila crecía y los botones de la
  // derecha se salían del recuadro. Era el descuadre que el usuario reportó el
  // 29 de agosto, y le pasaba SOLO a los platos con receta, que son los únicos
  // que se pintan como botón (spec 060).
  boton.appendChild(celda(comida.texto, "plato-nombre plato-texto"));
  return boton;
}

// La receta enlazada a una comida de la semana, o null.
//
// Devuelve null también cuando el `recetaId` apunta a una receta que ya no
// existe —se borró desde el recetario—: el enlace se guarda en la dieta y nadie
// lo limpia al borrar. Sin esta comprobación, el nombre saldría tocable y al
// tocarlo no se abriría nada.
function recetaDeLaComida(comida) {
  if (!comida.texto || !comida.recetaId) return null;
  return recetasCargadas.find((receta) => receta.id === comida.recetaId) || null;
}

// La receta abierta bajo su fila. Solo se lee: para cambiarla está el recetario.
function recetaDesplegada(comida) {
  const caja = document.createElement("div");
  caja.className = "receta-en-dieta";

  const receta = recetaDeLaComida(comida);

  // No debería pasar —el nombre solo se vuelve tocable si la receta existe—,
  // pero si se borra la receta con la dieta abierta en otra pestaña, mejor
  // decirlo que enseñar un hueco.
  if (!receta) {
    caja.appendChild(celda("Esta receta ya no existe.", "explicacion"));
    return caja;
  }

  const cabecera = document.createElement("p");
  cabecera.className = "receta-en-dieta-cabecera";
  cabecera.textContent = `${receta.nombre} · para ${receta.raciones}`;
  caja.appendChild(cabecera);

  caja.appendChild(cuerpoDeReceta(receta));
  return caja;
}

function filaEnEdicion(indiceDia, indiceComida, comida) {
  const fila = document.createElement("div");
  fila.className = "comida-dieta fila-edicion";

  const texto = campoTexto(comida.texto, "edicion-texto");

  // El desplegable rellena el texto con el nombre de la receta y la deja
  // enlazada: escribirlo a mano y que coincida letra por letra sería absurdo.
  const recetas = campoDesplegable(
    [
      { valor: "", etiqueta: "o usa una receta tuya…" },
      ...recetasCargadas.map((receta) => ({
        valor: receta.id,
        etiqueta: receta.nombre
      }))
    ],
    comida.recetaId || "",
    "edicion-momento"
  );

  recetas.addEventListener("change", () => {
    const receta = recetasCargadas.find((otra) => otra.id === recetas.value);
    if (receta) texto.value = receta.nombre;
  });

  fila.append(
    celda(etiquetaDeMomento(comida.momento), "resumen-etiqueta"),
    texto,
    recetas,
    botonDeFila("Guardar", () =>
      guardarCelda(indiceDia, indiceComida, texto.value, recetas.value)
    ),
    botonDeFila("Cancelar", () => {
      celdaEditando = null;
      pintarDieta();
    })
  );

  return fila;
}

async function guardarCelda(indiceDia, indiceComida, texto, recetaId) {
  const error = id("error-semana");
  error.textContent = "";

  // Se copia la semana entera y se cambia la celda: así, si falla el guardado,
  // lo que hay en pantalla sigue siendo lo que hay en la base de datos.
  const dias = dietaActiva.dias.map((dia, i) => ({
    ...dia,
    comidas: dia.comidas.map((comida, j) =>
      i === indiceDia && j === indiceComida
        ? { ...comida, texto: texto.trim(), recetaId: recetaId || "" }
        : comida
    )
  }));

  try {
    await actualizarDieta(uidActual, dietaActiva.id, dias);
    dietaActiva = { ...dietaActiva, dias };
    celdaEditando = null;
    pintarDieta();
  } catch {
    error.textContent = "No se ha podido guardar. Comprueba tu conexión.";
  }
}

async function apuntarDeLaDieta(comida, boton) {
  const error = id("error-semana");
  error.textContent = "";

  try {
    await guardarComida(uidActual, comida.texto, comida.momento, hoyISO(), horaActual());
    avisarGuardado("guardado-dieta");
    responderEnBoton(boton, true);
    await listaComidas.refrescar();
  } catch {
    error.textContent = "No se ha podido apuntar. Comprueba tu conexión.";
    responderEnBoton(boton, false);
  }
}

id("btn-semana-blanco").addEventListener("click", async () => {
  if (dietaActiva && !confirm("Ya tienes una dieta. ¿La sustituyo por una en blanco?")) {
    return;
  }

  const error = id("error-semana");
  error.textContent = "";

  try {
    const anterior = dietaActiva;
    await guardarDieta(uidActual, semanaEnBlanco(), "");
    if (anterior) await borrarDieta(uidActual, anterior.id);
    await refrescarDieta();
  } catch {
    error.textContent = "No se ha podido crear la semana. Comprueba tu conexión.";
  }
});

// Pide la semana a la IA, guarda las recetas que proponga y sustituye la
// dieta que hubiera. El cupo es el mismo que el de los planes: 2 al día.
// `aprovechar` llega solo desde el formulario de "Pedir" (spec 059). Los otros
// dos caminos que generan dieta —la propuesta de una revisión y el comité de
// bienvenida— no la piden, y por eso el parámetro es opcional: ahí no hay
// casilla que leer y la despensa no se le menciona a la IA.
async function generarDieta(instrucciones, aprovechar = false) {
  if (quedanPlanesHoy(planesCargados, "dieta") === 0) {
    throw Object.assign(new Error("Sin cupo"), { codigo: "limite-planes" });
  }

  // Devuelve false si el usuario cancela: quien llama necesita distinguir
  // "cancelado" de "generado" para no dar por hecha una semana que no existe
  // (spec 046).
  if (dietaActiva && !confirm("Ya tienes una dieta. ¿La sustituyo?")) return false;

  const [registros, ajustes] = await Promise.all([
    registrosRecientes(),
    leerAjustes(uidActual).catch(() => ({}))
  ]);

  const respuesta = await pedirDietaALaIa(uidActual, instrucciones, registros, {
    nombre: ajustes.nombre || "",
    perfil: ajustes.perfil || "",
    proveedor: ajustes.proveedorIa || "automatico",
    // Se lee AQUÍ y no al pintar la casilla: el número de al lado puede ir
    // retrasado si has ido a la Despensa y has vuelto, pero lo que se manda es
    // siempre lo que hay marcado en el momento de pedir.
    despensa: aprovechar ? loQueTengo(despensaCargada) : []
  });

  // Primero las recetas: la semana las enlaza por nombre, así que tienen que
  // existir antes.
  const porNombre = await guardarRecetasPropuestas(
    uidActual,
    respuesta.recetas,
    recetasCargadas
  );
  await refrescarRecetas();

  // Primero la nueva y luego se borra la vieja: al revés queda un instante
  // sin ninguna dieta, y si algo falla en medio te quedas sin nada.
  const anterior = dietaActiva;
  await guardarDieta(
    uidActual,
    semanaDesdeLaIa(respuesta.dias, porNombre),
    instrucciones
  );
  if (anterior) await borrarDieta(uidActual, anterior.id);

  // El cupo se cuenta sobre los planes, así que la dieta deja su marca ahí.
  await guardarMarcaDePlan(uidActual, "dieta", instrucciones);

  await refrescarDieta();
  await refrescarConsulta();
  id("aviso-dieta").textContent = respuesta.aviso || "";
  return true;
}

// Los registros de los últimos 14 días, que es lo que mira la IA.
async function registrosRecientes() {
  const desde = sumarDias(hoyISO(), -13);
  const recientes = (lista) => lista.filter((registro) => registro.fecha >= desde);

  return {
    pesajes: recientes(listaPeso.obtenerRegistros()).map(({ fecha, pesoKg }) => ({
      fecha,
      pesoKg
    })),
    comidas: recientes(listaComidas.obtenerRegistros()).map(
      ({ fecha, momento, texto }) => ({ fecha, momento, texto })
    ),
    ejercicios: recientes(listaEjercicios.obtenerRegistros()).map(
      ({ fecha, texto, minutos, intensidad }) => ({
        fecha,
        texto,
        minutos,
        intensidad
      })
    ),
    // Las bebidas (spec 062). El agua no va aquí: es un contador y no un
    // registro escrito.
    bebidas: recientes(listaBebidas.obtenerRegistros()).map(({ fecha, texto }) => ({
      fecha,
      texto
    }))
  };
}

async function refrescarDieta() {
  try {
    dietaActiva = await leerDietaActiva(uidActual);
  } catch {
    dietaActiva = null;
    id("estado-dieta").textContent =
      "No se ha podido cargar tu dieta. Comprueba tu conexión.";
    return;
  }
  celdaEditando = null;
  // La receta desplegada se guarda por posición ("2-1"), no por identidad. Si la
  // semana cambia —otra dieta, o una celda editada—, esa posición ya es otro
  // plato: dejarla abierta enseñaría la receta de una comida que no es.
  recetaDeDietaAbierta = null;
  // Vuelve al día de hoy: si la semana ha cambiado, el día que se estuviera
  // mirando ya es otra cosa.
  diaDietaAbierto = diaDeLaSemana(hoyISO());
  pintarDieta();
}

// --- Catálogo de ejercicios (spec 029) -----------------------------------
//
// Hermano del recetario: lo que sabes hacer, no lo que has hecho. El diario
// de entrenamientos es otra cosa y vive en listaEjercicios.

const CATALOGO_SIN_DESPLEGAR = 3;

let catalogoCargado = [];
let ejercicioAbierto = null;
let ejercicioEditando = null;
let catalogoDesplegado = false;

function pintarCatalogo() {
  const contenedor = id("lista-catalogo");
  const boton = id("btn-desplegar-catalogo");
  const botonArriba = id("btn-desplegar-catalogo-arriba");

  contenedor.innerHTML = "";
  id("estado-catalogo").textContent = catalogoCargado.length
    ? ""
    : "Aún no tienes ejercicios guardados. Apunta los que haces a menudo y podrás montar tablas con ellos.";

  const visibles = catalogoDesplegado
    ? catalogoCargado
    : catalogoCargado.slice(0, CATALOGO_SIN_DESPLEGAR);

  visibles.forEach((ejercicio) =>
    contenedor.appendChild(tarjetaDeEjercicio(ejercicio))
  );

  const hayEscondidos = visibles.length < catalogoCargado.length;
  boton.classList.toggle("oculta", !hayEscondidos && !catalogoDesplegado);
  boton.textContent = catalogoDesplegado
    ? "Ver menos"
    : `Ver todos (${catalogoCargado.length})`;
  botonArriba.classList.toggle("oculta", !hayEscondidos && !catalogoDesplegado);
  botonArriba.textContent = boton.textContent;
}

function tarjetaDeEjercicio(ejercicio) {
  const tarjeta = document.createElement("article");
  tarjeta.className = "receta";

  const cabecera = botonDeFila("", () => {
    // Tocar la tarjeta la abre; volver a tocarla la cierra.
    ejercicioAbierto = ejercicioAbierto === ejercicio.id ? null : ejercicio.id;
    pintarCatalogo();
  });
  cabecera.className = "receta-cabecera";
  cabecera.append(
    celda(ejercicio.nombre, "receta-nombre"),
    celda(ejercicio.material || "sin material", "registro-detalle")
  );
  tarjeta.appendChild(cabecera);

  if (ejercicioAbierto !== ejercicio.id) return tarjeta;

  if (ejercicio.comoSeHace) {
    const como = document.createElement("p");
    como.className = "receta-preparacion";
    como.textContent = ejercicio.comoSeHace;
    tarjeta.appendChild(como);
  }

  const acciones = document.createElement("div");
  acciones.className = "receta-acciones";
  acciones.append(
    botonDeFila("Editar", () => editarEjercicioCatalogo(ejercicio)),
    botonDeFila("Borrar", () => borrarLoDelCatalogo(ejercicio))
  );
  tarjeta.appendChild(acciones);

  return tarjeta;
}

function abrirFormularioDeEjercicio(ejercicio) {
  ejercicioEditando = ejercicio ? ejercicio.id : null;

  id("catalogo-nombre").value = ejercicio ? ejercicio.nombre : "";
  id("catalogo-como").value = ejercicio ? ejercicio.comoSeHace || "" : "";
  id("catalogo-material").value = ejercicio ? ejercicio.material || "" : "";

  id("error-catalogo").textContent = "";
  id("form-ejercicio-catalogo").classList.remove("oculta");
  id("btn-nuevo-ejercicio-catalogo").classList.add("oculta");
  id("catalogo-nombre").focus();
}

function cerrarFormularioDeEjercicio() {
  ejercicioEditando = null;
  id("form-ejercicio-catalogo").classList.add("oculta");
  id("btn-nuevo-ejercicio-catalogo").classList.remove("oculta");
  id("error-catalogo").textContent = "";
}

function editarEjercicioCatalogo(ejercicio) {
  abrirFormularioDeEjercicio(ejercicio);
  id("form-ejercicio-catalogo").scrollIntoView({ block: "center" });
}

async function borrarLoDelCatalogo(ejercicio) {
  if (!confirm(`¿Borrar el ejercicio "${ejercicio.nombre}"?`)) return;

  try {
    await borrarEjercicioCatalogo(uidActual, ejercicio.id);
    if (ejercicioAbierto === ejercicio.id) ejercicioAbierto = null;
    await refrescarCatalogo();
    // La tabla conserva el texto de la línea y se queda sin enlace: no se
    // toca nada, pero el desplegable de edición ya no lo ofrece.
    pintarTabla();
  } catch {
    id("error-catalogo").textContent = "No se ha podido borrar. Comprueba tu conexión.";
  }
}

async function refrescarCatalogo() {
  try {
    catalogoCargado = await listarEjerciciosCatalogo(uidActual);
  } catch {
    catalogoCargado = [];
    id("estado-catalogo").textContent =
      "No se han podido cargar tus ejercicios. Comprueba tu conexión.";
    return;
  }
  pintarCatalogo();
}

id("btn-nuevo-ejercicio-catalogo").addEventListener("click", () =>
  abrirFormularioDeEjercicio(null)
);
id("btn-cancelar-ejercicio-catalogo").addEventListener(
  "click",
  cerrarFormularioDeEjercicio
);

id("btn-desplegar-catalogo").addEventListener("click", () => {
  catalogoDesplegado = !catalogoDesplegado;
  pintarCatalogo();
  if (!catalogoDesplegado) {
    id("btn-desplegar-catalogo").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
});

id("btn-desplegar-catalogo-arriba").addEventListener("click", () => {
  catalogoDesplegado = !catalogoDesplegado;
  pintarCatalogo();
});

id("form-ejercicio-catalogo").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const error = id("error-catalogo");
  error.textContent = "";

  const resultado = validarEjercicioCatalogo(
    id("catalogo-nombre").value,
    id("catalogo-como").value,
    id("catalogo-material").value
  );

  if (resultado.error) {
    error.textContent = resultado.error;
    return;
  }

  const boton = id("btn-guardar-ejercicio-catalogo");
  boton.disabled = true;

  try {
    if (ejercicioEditando) {
      await actualizarEjercicioCatalogo(uidActual, ejercicioEditando, resultado);
    } else {
      await guardarEjercicioCatalogo(uidActual, resultado);
    }
    avisarGuardado("guardado-catalogo");
    cerrarFormularioDeEjercicio();
    await refrescarCatalogo();
  } catch {
    error.textContent = "No se ha podido guardar. Comprueba tu conexión.";
  } finally {
    boton.disabled = false;
  }
});

// --- La tabla de la semana (spec 029) ------------------------------------
//
// La tabla es el plan; los entrenamientos apuntados son el diario. Igual que
// con la dieta, aquí no se marca nada: "Lo he hecho" apunta y punto.
//
// A diferencia de la dieta, un día puede no tener sesión. Eso es descanso.

let tablaActiva = null;
let diaEditando = null;

// Qué día de la tabla se está mirando, 0 = lunes (spec 067). `null` es la semana
// entera. Hermano de diaDietaAbierto, pero suyo: las dos semanas se miran por
// separado y ver el lunes en la dieta no obliga a ver el lunes en la tabla.
let diaTablaAbierto = 0;

function pintarTabla() {
  const contenedor = id("semana-tabla");
  const estado = id("estado-tabla");

  contenedor.innerHTML = "";

  const boton = id("btn-semana-blanco-tabla");
  boton.classList.toggle("accion-principal", !tablaActiva);
  boton.textContent = tablaActiva
    ? "Vaciar y empezar de nuevo"
    : "Empezar una semana en blanco";

  if (!tablaActiva) {
    estado.textContent =
      "Aún no tienes tabla. Puedes montarla tú con tus ejercicios —esto no gasta ninguna petición a la IA— o pedírsela a la IA aquí debajo.";
    id("dias-tabla").innerHTML = "";
    id("btn-ver-semana-tabla").classList.add("oculta");
    return;
  }

  estado.textContent = "";

  if (diaTablaAbierto !== null && diaTablaAbierto >= tablaActiva.dias.length) {
    diaTablaAbierto = 0;
  }

  pintarTiraDeDias({
    contenedor: "dias-tabla",
    dias: tablaActiva.dias,
    abierto: diaTablaAbierto,
    // Un día de descanso es un día sin sesión, y eso es normal: sale sin punto,
    // igual que un día vacío de la dieta.
    tieneAlgo: (dia) => Boolean(dia.sesion && dia.sesion.titulo),
    alElegir: (indice) => {
      diaTablaAbierto = indice;
      diaEditando = null;
      pintarTabla();
    }
  });

  const verSemana = id("btn-ver-semana-tabla");
  verSemana.classList.remove("oculta");
  verSemana.textContent =
    diaTablaAbierto === null ? "Ver un solo día" : "Ver la semana entera";

  tablaActiva.dias.forEach((dia, indiceDia) => {
    if (diaTablaAbierto !== null && indiceDia !== diaTablaAbierto) return;

    const bloque = document.createElement("section");
    bloque.className = "dia-dieta";

    const titulo = document.createElement("h3");
    titulo.textContent = dia.dia;
    bloque.appendChild(titulo);

    bloque.appendChild(
      diaEditando === indiceDia
        ? sesionEnEdicion(indiceDia, dia.sesion)
        : filaDeSesion(indiceDia, dia.sesion)
    );

    contenedor.appendChild(bloque);
  });
}

function filaDeSesion(indiceDia, sesion) {
  const fila = document.createElement("div");
  fila.className = "comida-dieta";

  // Sin sesión es descanso: solo el hueco y el +, como una comida vacía. Sin
  // etiquetarlo: el día ya está en el encabezado y un hueco vacío ya dice que
  // se descansa.
  if (!sesion || !sesion.titulo) {
    fila.append(
      celda("—", "registro-texto"),
      botonDeFila("+", () => {
        diaEditando = indiceDia;
        pintarTabla();
      })
    );
    return fila;
  }

  fila.append(
    celda(sesion.titulo, "registro-texto"),
    celda(
      `${sesion.minutos} min · ${etiquetaDeIntensidad(sesion.intensidad)}`,
      "registro-detalle"
    )
  );

  const hecho = botonDeIcono("comido", "Lo he hecho", () =>
    apuntarDeLaTabla(sesion, hecho)
  );
  hecho.classList.add("boton-comido");
  fila.appendChild(hecho);

  fila.appendChild(
    botonDeIcono("lapiz", "Editar", () => {
      diaEditando = indiceDia;
      pintarTabla();
    })
  );

  const lista = document.createElement("ul");
  lista.className = "receta-ingredientes";
  (sesion.ejercicios || []).forEach((ejercicio) => {
    const linea = document.createElement("li");
    linea.textContent = ejercicio.texto;
    lista.appendChild(linea);
  });

  // La lista va fuera de la fila para que no compita con los botones.
  const envoltorio = document.createElement("div");
  envoltorio.append(fila, lista);
  return envoltorio;
}

function sesionEnEdicion(indiceDia, sesion) {
  const fila = document.createElement("div");
  fila.className = "comida-dieta fila-edicion";

  const actual = sesion || { titulo: "", minutos: "", intensidad: INTENSIDAD_POR_DEFECTO, ejercicios: [] };

  const titulo = campoTexto(actual.titulo || "", "edicion-texto");
  const minutos = campoTexto(actual.minutos || "", "edicion-minutos", "numeric");

  const intensidad = campoDesplegable(
    INTENSIDADES.map(({ valor, etiqueta }) => ({ valor, etiqueta })),
    actual.intensidad || INTENSIDAD_POR_DEFECTO,
    "edicion-momento"
  );

  // Un ejercicio por línea, como los ingredientes de una receta.
  const ejercicios = campoArea(
    (actual.ejercicios || []).map((ejercicio) => ejercicio.texto).join("\n"),
    "edicion-texto"
  );

  fila.append(titulo, minutos, intensidad, ejercicios);

  // Sin catálogo no hay desplegable: un select con una sola opción que no
  // hace nada es ruido. Se escribe a mano y ya.
  if (catalogoCargado.length) {
    // Añade el nombre como línea nueva en vez de sustituir lo escrito: una
    // sesión son varios ejercicios, no uno.
    const delCatalogo = campoDesplegable(
      [
        { valor: "", etiqueta: "o usa un ejercicio tuyo…" },
        ...catalogoCargado.map((ejercicio) => ({
          valor: ejercicio.id,
          etiqueta: ejercicio.nombre
        }))
      ],
      "",
      "edicion-momento"
    );

    delCatalogo.addEventListener("change", () => {
      const ejercicio = catalogoCargado.find((otro) => otro.id === delCatalogo.value);
      if (!ejercicio) return;

      const escrito = ejercicios.value.trim();
      ejercicios.value = escrito ? `${escrito}\n${ejercicio.nombre}` : ejercicio.nombre;
      // Se vuelve a dejar en el hueco para poder añadir otro seguido.
      delCatalogo.value = "";
    });

    fila.appendChild(delCatalogo);
  }

  fila.append(
    botonDeFila("Guardar", () =>
      guardarSesion(indiceDia, titulo.value, minutos.value, intensidad.value, ejercicios.value)
    ),
    botonDeFila("Cancelar", () => {
      diaEditando = null;
      pintarTabla();
    })
  );

  return fila;
}

async function guardarSesion(indiceDia, titulo, minutos, intensidad, ejercicios) {
  const error = id("error-semana-tabla");
  error.textContent = "";

  const resultado = validarSesion(titulo, minutos, intensidad, ejercicios);
  if (resultado.error) {
    error.textContent = resultado.error;
    return;
  }

  // Vaciar el título borra la sesión: el día vuelve a ser descanso.
  const sesion = resultado.vacia
    ? null
    : {
        titulo: resultado.titulo,
        minutos: resultado.minutos,
        intensidad: resultado.intensidad,
        ejercicios: enlazarConElCatalogo(resultado.ejercicios)
      };

  // Se copia la semana entera y se cambia el día: así, si falla el guardado,
  // lo que hay en pantalla sigue siendo lo que hay en la base de datos.
  const dias = tablaActiva.dias.map((dia, i) =>
    i === indiceDia ? { ...dia, sesion } : dia
  );

  try {
    await actualizarTabla(uidActual, tablaActiva.id, dias);
    tablaActiva = { ...tablaActiva, dias };
    diaEditando = null;
    pintarTabla();
  } catch {
    error.textContent = "No se ha podido guardar. Comprueba tu conexión.";
  }
}

// Al escribir a mano, la línea se enlaza sola si empieza por el nombre de un
// ejercicio del catálogo. Así "Sentadillas 4x12" queda enlazada sin elegir
// nada en el desplegable.
function enlazarConElCatalogo(ejercicios) {
  const normalizar = (texto) =>
    String(texto || "").trim().toLowerCase().replace(/\s+/g, " ");

  return ejercicios.map((ejercicio) => {
    if (ejercicio.ejercicioId) return ejercicio;

    const encontrado = catalogoCargado.find((otro) =>
      normalizar(ejercicio.texto).startsWith(normalizar(otro.nombre))
    );

    return { ...ejercicio, ejercicioId: encontrado ? encontrado.id : "" };
  });
}

// Apunta la sesión entera como UN registro: un registro por ejercicio sería
// un follón, y a veces la sesión es simplemente andar una hora.
//
// Sin hora, igual que "me lo he comido": el botón se pulsa cuando uno se
// acuerda, no cuando entrena.
async function apuntarDeLaTabla(sesion, boton) {
  const error = id("error-semana-tabla");
  error.textContent = "";

  try {
    await guardarEjercicio(
      uidActual,
      sesion.titulo,
      sesion.minutos,
      sesion.intensidad,
      hoyISO(),
      horaActual()
    );
    avisarGuardado("guardado-tabla");
    responderEnBoton(boton, true);
    await listaEjercicios.refrescar();
  } catch {
    error.textContent = "No se ha podido apuntar. Comprueba tu conexión.";
    responderEnBoton(boton, false);
  }
}

id("btn-semana-blanco-tabla").addEventListener("click", async () => {
  if (tablaActiva && !confirm("Ya tienes una tabla. ¿La sustituyo por una en blanco?")) {
    return;
  }

  const error = id("error-semana-tabla");
  error.textContent = "";

  try {
    const anterior = tablaActiva;
    await guardarTabla(uidActual, semanaEnBlancoTabla(), "");
    if (anterior) await borrarTabla(uidActual, anterior.id);
    await refrescarTabla();
  } catch {
    error.textContent = "No se ha podido crear la semana. Comprueba tu conexión.";
  }
});

// Pide la semana a la IA, guarda los ejercicios que proponga y sustituye la
// tabla que hubiera. El cupo es el mismo que el de los planes: 2 al día.
async function generarTabla(instrucciones) {
  if (quedanPlanesHoy(planesCargados, "ejercicio") === 0) {
    throw Object.assign(new Error("Sin cupo"), { codigo: "limite-planes" });
  }

  if (tablaActiva && !confirm("Ya tienes una tabla. ¿La sustituyo?")) return;

  const [registros, ajustes] = await Promise.all([
    registrosRecientes(),
    leerAjustes(uidActual).catch(() => ({}))
  ]);

  const respuesta = await pedirTablaALaIa(uidActual, instrucciones, registros, {
    nombre: ajustes.nombre || "",
    perfil: ajustes.perfil || "",
    proveedor: ajustes.proveedorIa || "automatico"
  });

  // Primero los ejercicios: la semana los enlaza por nombre, así que tienen
  // que existir antes.
  const porNombre = await guardarEjerciciosPropuestos(
    uidActual,
    respuesta.ejercicios,
    catalogoCargado
  );
  await refrescarCatalogo();

  // Primero la nueva y luego se borra la vieja: al revés queda un instante
  // sin ninguna tabla, y si algo falla en medio te quedas sin nada.
  const anterior = tablaActiva;
  await guardarTabla(
    uidActual,
    semanaDesdeLaIaTabla(respuesta.dias, porNombre),
    instrucciones
  );
  if (anterior) await borrarTabla(uidActual, anterior.id);

  // El cupo se cuenta sobre los planes, así que la tabla deja su marca ahí.
  await guardarMarcaDePlan(uidActual, "ejercicio", instrucciones);

  await refrescarTabla();
  await refrescarConsulta();
  id("aviso-tabla").textContent = respuesta.aviso || "";
  return true;
}

async function refrescarTabla() {
  try {
    tablaActiva = await leerTablaActiva(uidActual);
  } catch {
    tablaActiva = null;
    id("estado-tabla").textContent =
      "No se ha podido cargar tu tabla. Comprueba tu conexión.";
    return;
  }
  diaEditando = null;
  // Vuelve al día de hoy: si la semana ha cambiado, el día que se estuviera
  // mirando ya es otra cosa.
  diaTablaAbierto = diaDeLaSemana(hoyISO());
  pintarTabla();
}

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
    boton.className = "chip";
    contenedor.appendChild(boton);
  });
}

async function repetirComida(habitual, boton) {
  const error = id("error-repetir");
  error.textContent = "";
  boton.disabled = true;

  try {
    await guardarComida(uidActual, habitual.texto, habitual.momento, hoyISO(), horaActual());
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
  desplegarArriba: "btn-desplegar-comidas-arriba",
  textoSinEseDia: "No hay comidas de ese día.",
  recortarPorDias: true,
  textoVacio:
    'Aún no has apuntado ninguna comida. No hace falta detalle: "lentejas y una manzana" vale.',
  errorCarga: "No se han podido cargar tus comidas. Comprueba tu conexión.",
  confirmacionBorrado: "¿Borrar esta comida?",
  cargar: listarComidas,
  borrar: borrarComida,
  fila: (comida) => ({
    que: comida.texto,
    detalles: [
      formatearFechaConHora(comida.fecha, comida.hora),
      etiquetaDeMomento(comida.momento)
    ]
  }),
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

// Fecha y hora plegadas (spec 037): casi siempre es "ahora", así que no
// hace falta verlas para guardar. Una vez desplegadas no hace falta volver
// a plegarlas para guardar: solo se replegán al guardar con éxito.
id("btn-fecha-hora-comida").addEventListener("click", () => {
  id("campos-fecha-hora-comida").classList.remove("oculta");
  id("btn-fecha-hora-comida").classList.add("oculta");
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
    id("campos-fecha-hora-comida").classList.add("oculta");
    id("btn-fecha-hora-comida").classList.remove("oculta");
    await listaComidas.refrescar();
  } catch {
    error.textContent = "No se ha podido guardar. Comprueba tu conexión.";
  } finally {
    boton.disabled = false;
  }
});

// --- Bebidas (spec 062) --------------------------------------------------
//
// Colección propia, no un momento más de `comidas`. El motivo está en
// `js/bebidas.js`: las comidas del día van enteras al análisis nutricional, y
// las bebidas tienen que quedarse fuera de ahí por construcción.
//
// Las bebidas NO dan puntos ni mantienen la racha, decisión del usuario: los
// puntos premian la conducta que te acerca al objetivo, y apuntar tres cervezas
// no es eso. Puntuarlo sería premiarte por registrarlo.
//
// Toda la lista sale de crearLista(), la misma factoría de comidas y ejercicios:
// filtro por día, "Ver todas", edición y borrado vienen de serie.

const listaBebidas = crearLista({
  alRefrescar: () => refrescarPantallas(),
  lista: "lista-bebidas",
  estado: "estado-bebidas",
  reintentar: "btn-reintentar-bebidas",
  error: "error-bebida",
  filtro: "filtro-bebidas",
  quitarFiltro: "btn-quitar-filtro-bebidas",
  desplegar: "btn-desplegar-bebidas",
  desplegarArriba: "btn-desplegar-bebidas-arriba",
  textoSinEseDia: "No hay bebidas de ese día.",
  recortarPorDias: true,
  textoVacio:
    'Aún no has apuntado ninguna bebida. El agua no va aquí: esa se cuenta en Hoy.',
  errorCarga: "No se han podido cargar tus bebidas. Comprueba tu conexión.",
  confirmacionBorrado: "¿Borrar esta bebida?",
  cargar: listarBebidas,
  borrar: borrarBebida,
  fila: (bebida) => ({
    que: bebida.texto,
    detalles: [formatearFechaConHora(bebida.fecha, bebida.hora)]
  }),
  campos: (bebida) => {
    const fecha = campoFecha(bebida.fecha);
    const hora = campoHoraEdicion(bebida.hora);
    const texto = campoTexto(bebida.texto, "edicion-texto");
    return {
      elementos: [fecha, hora, texto],
      validar: () => validarBebida(texto.value, fecha.value, hora.value)
    };
  },
  actualizar: (uid, bebidaId, valores) =>
    actualizarBebida(uid, bebidaId, valores.texto, valores.fecha, valores.hora)
});

// Las bebidas que más repites, como chips (spec 042 aplicada a bebidas).
// Rellenan el formulario y NO guardan, por lo mismo que en ejercicio: la hora
// casi nunca es la misma, y guardar de un toque apuntaría una hora heredada que
// habría que ir a corregir después.
function pintarBebidasFrecuentes(bebidas) {
  const bloque = id("bloque-bebidas-frecuentes");
  const contenedor = id("bebidas-frecuentes");
  const habituales = masRepetidos(bebidas, hoyISO());

  bloque.classList.toggle("oculta", habituales.length === 0);
  contenedor.innerHTML = "";

  habituales.forEach((habitual) => {
    const boton = botonDeFila(habitual.texto, () => {
      id("bebida-texto").value = habitual.registro.texto;
      id("error-bebida").textContent = "";
      id("bebida-texto").focus();
    });
    boton.className = "chip";
    contenedor.appendChild(boton);
  });
}

id("btn-fecha-hora-bebida").addEventListener("click", () => {
  id("campos-fecha-hora-bebida").classList.remove("oculta");
  id("btn-fecha-hora-bebida").classList.add("oculta");
});

id("form-bebida").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const error = id("error-bebida");
  error.textContent = "";

  const resultado = validarBebida(
    id("bebida-texto").value,
    id("bebida-fecha").value,
    id("bebida-hora").value
  );
  if (resultado.error) {
    error.textContent = resultado.error;
    return;
  }

  const boton = id("btn-guardar-bebida");
  boton.disabled = true;
  try {
    await guardarBebida(uidActual, resultado.texto, resultado.fecha, resultado.hora);
  } catch {
    error.textContent = "No se ha podido guardar. Comprueba tu conexión.";
    return;
  } finally {
    boton.disabled = false;
  }

  // Fuera del try del guardado: un fallo al repintar no puede salir como
  // "comprueba tu conexión" con la bebida ya guardada (lección de la spec 058).
  avisarGuardado("guardado-bebida");
  id("bebida-texto").value = "";
  id("bebida-fecha").value = hoyISO();
  id("bebida-hora").value = horaActual();
  id("campos-fecha-hora-bebida").classList.add("oculta");
  id("btn-fecha-hora-bebida").classList.remove("oculta");
  await listaBebidas.refrescar();
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
  desplegarArriba: "btn-desplegar-ejercicios-arriba",
  textoSinEseDia: "No hay ejercicios de ese día.",
  recortarPorDias: true,
  textoVacio:
    'Aún no has apuntado ningún ejercicio. Cuenta también andar: "paseo con el carro, 40 minutos".',
  errorCarga: "No se han podido cargar tus ejercicios. Comprueba tu conexión.",
  confirmacionBorrado: "¿Borrar este ejercicio?",
  cargar: listarEjercicios,
  borrar: borrarEjercicio,
  fila: (ejercicio) => ({
    que: ejercicio.texto,
    detalles: [
      formatearFechaConHora(ejercicio.fecha, ejercicio.hora),
      `${ejercicio.minutos} min`,
      etiquetaDeIntensidad(ejercicio.intensidad)
    ]
  }),
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

// Fecha y hora plegadas (spec 038, mismo patrón que Comidas en la 037).
id("btn-fecha-hora-ejercicio").addEventListener("click", () => {
  id("campos-fecha-hora-ejercicio").classList.remove("oculta");
  id("btn-fecha-hora-ejercicio").classList.add("oculta");
});

// Los ejercicios que más repites, como chips junto al alta (spec 042).
// Hermana de pintarLoDeSiempre(), con una diferencia deliberada: aquí el chip
// rellena el formulario y no guarda nada. Un ejercicio repetido casi nunca
// dura lo mismo, así que guardar de un toque apuntaría unos minutos heredados
// que habría que ir a corregir después.
function pintarEjerciciosFrecuentes(ejercicios) {
  const bloque = id("bloque-ejercicios-frecuentes");
  const contenedor = id("ejercicios-frecuentes");
  const habituales = masRepetidos(ejercicios, hoyISO());

  bloque.classList.toggle("oculta", habituales.length === 0);
  contenedor.innerHTML = "";

  habituales.forEach((habitual) => {
    const ejercicio = habitual.registro;
    // Los minutos se enseñan en el propio chip: así se ve de antemano qué va a
    // rellenar, y a veces basta con confirmar sin tocar nada.
    const etiqueta = ejercicio.minutos
      ? `${habitual.texto} · ${ejercicio.minutos} min`
      : habitual.texto;
    const boton = botonDeFila(etiqueta, () => rellenarConEjercicio(ejercicio));
    boton.className = "chip";
    contenedor.appendChild(boton);
  });
}

function rellenarConEjercicio(ejercicio) {
  id("ejercicio-texto").value = ejercicio.texto;
  id("ejercicio-minutos").value = ejercicio.minutos ?? "";
  // Sin ?? el <select> se quedaría en su primera opción, que es una intensidad
  // concreta y probablemente falsa, no un hueco vacío.
  id("ejercicio-intensidad").value = ejercicio.intensidad ?? INTENSIDAD_POR_DEFECTO;
  // Un error de un intento anterior ya no habla de lo que hay ahora en el
  // formulario.
  id("error-ejercicio").textContent = "";

  // Los minutos son justo lo que casi siempre hay que cambiar, y seleccionados
  // para poder teclear encima sin borrar antes.
  const minutos = id("ejercicio-minutos");
  minutos.focus();
  minutos.select();
}

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
    id("campos-fecha-hora-ejercicio").classList.add("oculta");
    id("btn-fecha-hora-ejercicio").classList.remove("oculta");
    await listaEjercicios.refrescar();
  } catch {
    error.textContent = "No se ha podido guardar. Comprueba tu conexión.";
  } finally {
    boton.disabled = false;
  }
});

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

// Un solo hilo (spec 050): la conversación, los consejos viejos y las
// revisiones, por fecha. Antes las revisiones se pintaban aparte en
// #hilo-consulta y había que mirar a dos sitios para seguir una misma charla.
//
// Desde la spec 052 el hilo también empieza por la entrevista que abrió la
// operación, así que el separador dice de qué fue: llamar "Revisión" a la
// entrevista de alta sería mentir, porque no repasa nada.
const TITULO_DE_CONSULTA = {
  inicial: "Entrevista de bienvenida",
  reinicio: "Entrevista de una etapa nueva"
};

function separadorDeRevision(fecha, modo) {
  const marca = document.createElement("p");
  marca.className = "separador-revision";
  const titulo = TITULO_DE_CONSULTA[modo] || "Revisión";
  marca.textContent =
    typeof fecha === "string" && fecha
      ? `${titulo} · ${formatearFecha(fecha)}`
      : titulo;
  return marca;
}

// Vive aquí y no en el atributo del HTML porque hay que poder quitarlo y
// devolverlo según se esté charlando o contestando a una consulta (spec 054).
const PLACEHOLDER_CHARLA = "esta semana he picado más de la cuenta";

function pintarConversacion() {
  const contenedor = id("hilo-conversacion");
  // Todo lo que no sea la conversación entra en el hilo: las revisiones y,
  // desde la spec 052, también las entrevistas de alta (`inicial` y
  // `reinicio`). No se usa esRevision() a propósito: esa función excluye las
  // entrevistas por diseño y la comparte js/gamificacion.js para el emblema
  // "Primera consulta". Tocarla movería ese emblema de rebote.
  const revisiones = consultasCargadas.filter(
    (consulta) => consulta.modo !== "conversacion"
  );
  const mensajes = hiloCompleto(hiloAbierto, consejosDeAntes, revisiones);

  contenedor.innerHTML = "";
  // Del revés (spec 051): lo último arriba, pegado a la caja, y lo antiguo
  // hacia abajo. Se invierte al PINTAR, no al ordenar: darle la vuelta al dato
  // haría que el separador de revisión se calculara al revés.
  [...mensajes].reverse().forEach((mensaje) => {
    // El separador no es un mensaje: es una marca del hilo que dice dónde
    // empezó una revisión, para distinguirla de la charla del día a día.
    if (mensaje.empiezaRevision) {
      contenedor.appendChild(
        separadorDeRevision(mensaje.empiezaRevision, mensaje.modoDeLaConsulta)
      );
    }
    contenedor.appendChild(pintarBurbuja(mensaje));
  });

  if (!mensajes.length) {
    const vacio = document.createElement("p");
    vacio.className = "explicacion";
    vacio.textContent = hayOperacion
      ? "Cuéntale cómo vas y te responderá con lo que vea en tus registros."
      : "Aquí saldrá tu entrevista de bienvenida en cuanto la empieces.";
    contenedor.appendChild(vacio);
  }

  const quedan = quedanMensajesHoy(consultasCargadas);
  id("cupo-conversacion").textContent = quedan
    ? `Te quedan ${quedan} ${quedan === 1 ? "mensaje" : "mensajes"} hoy.`
    : `Has gastado tus ${MENSAJES_POR_DIA} mensajes de hoy. Vuelve mañana.`;

  // Mientras contestas a una consulta, la caja va desnuda (spec 054): ni la
  // sugerencia de charlar, que no viene a cuento cuando lo que hay arriba es
  // "¿Cómo prefieres que te llame?", ni el contador, que en la entrevista
  // además miente —no gasta cupo, así que ese número no se mueve—. Se esconde,
  // no se vacía: así vuelve solo al cerrarse la consulta.
  id("conversacion-texto").placeholder = consultaAbierta ? "" : PLACEHOLDER_CHARLA;
  id("cupo-conversacion").classList.toggle("oculta", Boolean(consultaAbierta));

  // Sin operación no se charla: lo único que se puede hacer es contestar a la
  // entrevista que abre una (spec 052). Escribir suelto ahí crearía un hilo de
  // conversación antes de que exista la operación a la que pertenece.
  const puedeEscribir =
    quedan > 0 && (hayOperacion || Boolean(consultaAbierta));

  id("conversacion-texto").disabled = !puedeEscribir;
  id("btn-enviar-conversacion").disabled = !puedeEscribir;
}

// Un solo envío con dos destinos (spec 051): si hay una revisión en marcha, lo
// que escribes le contesta a ella; si no, es una pregunta normal. Antes eran
// dos formularios distintos, cada uno con su caja, su estado y su error.
id("form-conversacion").addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const campo = id("conversacion-texto");
  const error = id("error-conversacion");
  const texto = campo.value.trim();

  error.textContent = "";
  if (!texto) return;

  if (texto.length > MAXIMO_CARACTERES) {
    error.textContent = `Máximo ${MAXIMO_CARACTERES} caracteres.`;
    return;
  }

  if (consultaAbierta) {
    await contestarALaRevision(campo, texto);
    return;
  }

  const estado = id("estado-conversacion");
  estado.textContent = "Pensando…";
  id("btn-enviar-conversacion").disabled = true;

  try {
    await enviarMensaje(uidActual, consultasCargadas, hiloAbierto, texto);
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

async function contestarALaRevision(campo, texto) {
  // La respuesta solo se borra si se ha enviado bien: si falla, se reintenta.
  const idDeLaConsulta = consultaAbierta.id;
  let termino = false;
  let inicial = false;

  let ficha = null;

  const fueBien = await conEspera(async () => {
    ({ termino, inicial, ficha } = await responder(
      uidActual,
      consultasCargadas,
      consultaAbierta,
      texto
    ));
  });

  if (!fueBien) return;

  campo.value = "";
  if (termino) consultaReciénTerminada = idDeLaConsulta;
  await refrescarConsulta();

  // El alta ha dejado ajustes y perfil guardados y ha creado la operación: hay
  // que releerlo todo, apuntar el peso de la ficha y montar lo que pidiera
  // (spec 057). Es el mismo remate que cuando el alta cierra a la primera.
  if (termino && inicial) {
    if (ficha) {
      await rematarAlta(ficha, { dieta: ficha.dieta, tabla: ficha.tabla });
    } else {
      // Altas anteriores a la v7: no llevan ficha, así que solo se releen.
      await refrescarAjustes();
      await refrescarOperaciones();
    }
  }
}

// --- Consulta ------------------------------------------------------------

let consultasCargadas = [];
let planesCargados = [];
let consultaAbierta = null;

// Id de la consulta que se acaba de terminar en esta sesión. Sirve para el
// tercer estado de la pantalla: el mensaje "Consulta terminada…" y el botón
// "Empezar otra consulta", en vez del contador de "hace N días" (spec 045).
// Se pierde al recargar, y está bien que así sea: "recién terminada" es un
// estado de sesión. El HILO ya no depende de ella desde la spec 046 — ese se
// lee de Firestore y sobrevive a un F5.
let consultaReciénTerminada = null;

// Lo que la consulta te propuso al cerrarse (spec 046). Propone, no sustituye:
// hasta que no tocas el botón, tu dieta y tu tabla siguen intactas.
const PROPUESTAS = [
  {
    campo: "propuestaDieta",
    tipo: "dieta",
    etiqueta: "Pedir esa dieta",
    seccion: "comidas",
    subseccion: "dieta"
  },
  {
    campo: "propuestaTabla",
    tipo: "ejercicio",
    etiqueta: "Pedir esa tabla",
    seccion: "ejercicio",
    subseccion: "tabla"
  }
];

// Se le pasa null con una consulta en curso: mientras hablas no hay nada
// cerrado que proponer.
function pintarPropuestas(consulta) {
  const caja = id("propuestas-consulta");
  caja.innerHTML = "";
  id("error-propuesta").textContent = "";

  const pendientes = consulta
    ? PROPUESTAS.filter((propuesta) => consulta[propuesta.campo])
    : [];

  caja.classList.toggle("oculta", pendientes.length === 0);

  pendientes.forEach((propuesta) => {
    const quedan = quedanPlanesHoy(planesCargados, propuesta.tipo);
    const boton = botonDeFila(propuesta.etiqueta, () =>
      aceptarPropuesta(propuesta, consulta[propuesta.campo], boton)
    );
    boton.className = "accion-principal";
    // Sin cupo o sin operación no se puede pedir. generarDieta()/generarTabla()
    // comprueban el cupo pero NO la operación: eso lo hace hoy quien pinta el
    // botón, y aquí el que lo pinta es este.
    boton.disabled = quedan === 0 || !hayOperacion;
    caja.appendChild(boton);

    const motivo = !hayOperacion
      ? "No hay ninguna operación en marcha."
      : quedan === 0
        ? `Ya has pedido 2 ${TIPOS_ESPECIALIZADOS[propuesta.tipo].plural} hoy. ` +
          "La propuesta sigue aquí mañana."
        : "";

    if (motivo) {
      const explicacion = document.createElement("p");
      explicacion.className = "explicacion";
      explicacion.textContent = motivo;
      caja.appendChild(explicacion);
    }
  });
}

async function aceptarPropuesta(propuesta, instrucciones, boton) {
  const error = id("error-propuesta");
  error.textContent = "";
  boton.disabled = true;
  id("estado-conversacion").textContent = "Pensando…";

  try {
    // El mismo camino que "Pedírsela a la IA" de Comidas y Ejercicio: un solo
    // sitio donde se generan semanas, con su cupo y su marca.
    const generada =
      propuesta.tipo === "dieta"
        ? await generarDieta(instrucciones)
        : await generarTabla(instrucciones);

    // Cancelar el "¿la sustituyo?" no es un fallo, pero tampoco es un éxito:
    // no hay semana nueva que enseñar, así que no se navega a ninguna parte.
    if (generada) abrirPestana(propuesta.seccion, propuesta.subseccion);
  } catch (fallo) {
    error.textContent = mensajeDeErrorDeConsulta(fallo.codigo);
  } finally {
    id("estado-conversacion").textContent = "";
    // Siempre, también tras cancelar: un botón que se queda muerto no se
    // recupera hasta el siguiente repintado, y tras cancelar no hay ninguno.
    boton.disabled = false;
  }
}

// -1 significa "aún no ha habido ninguna revisión en esta operación"; null,
// que no hay que enseñar nada.
function diasDesdeLaUltimaRevision() {
  if (!hayOperacion) return null;
  const ultima = ultimaRevision(consultasCargadas);
  if (!ultima) return -1;
  const dias = diasDesde(ultima.terminadaEn || ultima.creadaEn);
  return dias === null ? -1 : dias;
}

function textoDeUltimaRevision(dias) {
  if (dias < 0) return "Aún no has pasado ninguna revisión en esta operación.";

  const cuando =
    dias === 0 ? "hoy" : dias === 1 ? "hace 1 día" : `hace ${dias} días`;
  const linea = `Última consulta: ${cuando}.`;

  return dias < DIAS_ENTRE_REVISIONES
    ? `${linea} Aún es pronto: lo normal es pasar consulta cada semana.`
    : linea;
}

// Los tres estados de la pantalla: consulta en curso, recién terminada, y
// sin consulta (con o sin cupo para hoy).
function pintarEstadoConsulta() {
  const enCurso = Boolean(consultaAbierta);
  // Un solo cupo desde la spec 051: empezar una revisión gasta un mensaje.
  const quedanHoy = quedanMensajesHoy(consultasCargadas) > 0;
  const terminada = enCurso
    ? null
    : consultasCargadas.find((consulta) => consulta.id === consultaReciénTerminada);

  // Sin operación activa, la consulta que toca es la entrevista que abre una
  // nueva (specs 016 y 018).
  const primeraVez = !hayOperacion;

  // Con una consulta a medias no hay nada que contar de la anterior.
  if (enCurso) id("ultima-revision").classList.add("oculta");

  // Sin operación en marcha, el botón lo sustituye el formulario de alta
  // (spec 057): ya no se "empieza una entrevista", se manda una ficha.
  id("btn-empezar-consulta").classList.toggle("oculta", enCurso || primeraVez);
  // La caja es la misma; lo que cambia es a quién le hablas (spec 051).
  id("etiqueta-conversacion").textContent = enCurso
    ? "Tu respuesta"
    : "Cuéntale cómo vas";

  // La explicación de la entrevista de alta solo aplica sin operación: con una
  // en marcha, pasar consulta es una revisión, no un alta.
  //
  // OJO: esta condición vivía en el contenedor del botón (spec 023, cuando con
  // una operación en marcha lo único que existía era la conversación), y eso
  // escondía el botón de empezar justo en el estado en el que hace falta: no
  // había forma de pasar consulta con una operación abierta. Ahora se queda
  // donde tiene que estar, en los párrafos (spec 047).
  const explicandoAlta = !hayOperacion && !enCurso;
  id("explicacion-entrevista").classList.toggle("oculta", !explicandoAlta);
  id("explicacion-inicial").classList.toggle("oculta", enCurso || !primeraVez);

  // Llamar "Revisión" a la entrevista que abre la operación sería mentir: no
  // hay nada anterior que revisar.
  id("titulo-revision").classList.toggle("oculta", !hayOperacion);

  // El hilo y su caja se ven SIEMPRE (spec 052).
  //
  // Esta línea escondía el bloque con `!hayOperacion || enCurso`, y era un
  // resto de cuando había dos cajas de texto: entonces tenía sentido esconder
  // la de la conversación mientras una consulta estaba a medias. Desde la 051
  // la caja es una sola y manda a `responder()` si hay consulta en curso, así
  // que esconderla dejaba sin sitio donde contestar. Y sin operación es donde
  // ahora vive la entrevista de alta.
  id("bloque-conversacion").classList.remove("oculta");

  // El título sí cambia: sin operación, lo que hay ahí es la entrevista.
  id("titulo-conversacion").textContent = primeraVez
    ? "Tu entrevista de bienvenida"
    : "Habla con tu nutricionista";

  if (enCurso) {
    id("aviso-consulta").textContent = "";
  } else {
    // Cuánto hace de la última revisión (spec 045). Solo con operación en
    // marcha: sin ella lo que toca es la entrevista, y no hay nada que repasar.
    // Y no justo después de terminar una: decirle "aún es pronto" un segundo
    // después de haber pasado consulta es obvio y suena a regañina.
    const dias = terminada || primeraVez ? null : diasDesdeLaUltimaRevision();
    // dias >= 0 no sobra: -1 es el centinela de "aún no ha habido ninguna
    // revisión", y sin esto colaría por -1 < 7. El botón diría "Pasar consulta
    // igual" (igual ¿que qué?) sin ningún aviso al lado que saltarse.
    const pronto = dias !== null && dias >= 0 && dias < DIAS_ENTRE_REVISIONES;

    id("ultima-revision").classList.toggle("oculta", dias === null);
    id("ultima-revision").textContent = dias === null ? "" : textoDeUltimaRevision(dias);

    id("btn-empezar-consulta").disabled = !quedanHoy;
    id("btn-empezar-consulta").textContent = primeraVez
      ? "Iniciar operación bikini"
      : terminada
        ? "Empezar otra consulta"
        : pronto
          ? "Pasar consulta igual"
          : "Pasar consulta";
    id("aviso-consulta").textContent = quedanHoy
      ? terminada
        ? "Consulta terminada. Lo que te ha dicho está arriba del todo."
        : ""
      : "Te has quedado sin mensajes por hoy.";
  }

  // Las revisiones ya no se pintan aquí: desde la spec 050 van dentro del hilo
  // único, con el resto de la conversación (pintarConversacion). Lo que queda
  // aquí es solo decidir de qué consulta cuelgan las propuestas.
  //
  // No depende de consultaReciénTerminada (spec 046): esa vive en memoria y se
  // perdía al recargar. Sale de la última consulta terminada, leída de
  // Firestore como todo lo demás.
  pintarPropuestas(consultaAbierta ? null : ultimaRevision(consultasCargadas));

  pintarFormularioDeAlta();
}

// --- El comité de bienvenida (spec 057) -----------------------------------
//
// Abrir una operación era un chat de diez preguntas, una por viaje al proxy,
// para datos que caben en un formulario. Ahora se teclean todos de golpe y a la
// IA solo se le deja lo que de verdad hay que hablar.

// Los campos de texto largo, que van tal cual a la ficha.
const CAMPOS_LIBRES_DEL_ALTA = [
  "gustos",
  "aversiones",
  "alergias",
  "ejercicio",
  "material",
  "limitaciones"
];

function pintarFormularioDeAlta() {
  const visible = !hayOperacion && !consultaAbierta;
  id("form-alta").classList.toggle("oculta", !visible);
  if (!visible) return;

  // A partir de la segunda operación la IA ya te conoce: los campos duros se
  // prerrellenan con lo que hay en Ajustes y con tu último pesaje. Los de texto
  // largo NO se pueden prerrellenar —el perfil es un retrato en prosa, no
  // campos sueltos—, así que se avisa en vez de dejar huecos que parezcan
  // olvidos.
  const repite = Boolean(ajustesActuales && ajustesActuales.perfil);
  const aviso = id("aviso-alta");
  aviso.classList.toggle("oculta", !repite);
  aviso.textContent = repite
    ? "Ya sabe lo que le contaste la última vez. Rellena solo lo que haya cambiado."
    : "";

  const quedan = quedanMensajesHoy(consultasCargadas);
  id("btn-alta").disabled = quedan === 0;
  id("error-alta").textContent =
    quedan === 0 ? "Te has quedado sin mensajes por hoy." : "";
}

// Se rellenan una sola vez, al cargar los ajustes: si se hiciera en cada
// pintado, escribir en un campo y que algo repintara te borraría lo tecleado.
function prerrellenarAlta(ajustes) {
  if (id("alta-nombre").value || id("alta-altura").value) return;

  id("alta-nombre").value = ajustes.nombre || "";
  id("alta-altura").value = ajustes.alturaCm == null ? "" : ajustes.alturaCm;
  id("alta-objetivo").value =
    ajustes.pesoObjetivoKg == null
      ? ""
      : String(ajustes.pesoObjetivoKg).replace(".", ",");
  id("alta-fecha").value = ajustes.fechaObjetivo || "";

  // El peso actual sale del último pesaje, no de los ajustes: ahí no vive.
  const pesajes = listaPeso.obtenerRegistros();
  const ultimo = [...pesajes].sort(compararPorFechaYCreacion).pop();
  if (ultimo) id("alta-peso").value = String(ultimo.pesoKg).replace(".", ",");
}

// Valida con las funciones de siempre y devuelve la ficha ya limpia, o el
// mensaje de error. Se valida ANTES de llamar a la IA: que ella repregunte es
// para lo que un número no puede decidir (un objetivo imposible en el plazo),
// no para una altura de 900 cm.
//
// Ojo: la validación vive en DOS sitios. validarAjustes() no conoce el peso
// actual —ese campo no existe ahí—, y su equivalente es validarPesaje(). Que
// ambos usen 20-300 kg es casualidad, no diseño.
function leerFichaDelFormulario() {
  const nombre = id("alta-nombre").value.trim();
  if (!nombre) return { error: "Dinos cómo quieres que te llame." };

  const pesoActual = validarPesaje(id("alta-peso").value, hoyISO(), "");
  if (pesoActual.error) return { error: pesoActual.error };

  const ajustes = validarAjustes(
    id("alta-objetivo").value,
    id("alta-altura").value,
    id("alta-fecha").value,
    nombre,
    ""
  );
  if (ajustes.error) return { error: ajustes.error };
  if (ajustes.alturaCm == null) return { error: "Necesitamos tu altura." };
  if (ajustes.pesoObjetivoKg == null) {
    return { error: "Necesitamos tu peso objetivo." };
  }

  const ficha = {
    nombre: ajustes.nombre,
    alturaCm: ajustes.alturaCm,
    pesoActualKg: pesoActual.pesoKg,
    pesoObjetivoKg: ajustes.pesoObjetivoKg,
    fechaObjetivo: ajustes.fechaObjetivo || ""
  };
  CAMPOS_LIBRES_DEL_ALTA.forEach((campo) => {
    ficha[campo] = id(`alta-${campo}`).value.trim();
  });

  return { ficha };
}

id("form-alta").addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const error = id("error-alta");
  const estado = id("estado-alta");
  error.textContent = "";

  const leida = leerFichaDelFormulario();
  if (leida.error) {
    error.textContent = leida.error;
    return;
  }

  const extras = {
    dieta: id("alta-quiere-dieta").checked,
    tabla: id("alta-quiere-tabla").checked
  };

  estado.textContent = "Mandándole tu ficha…";
  id("btn-alta").disabled = true;

  let resultado;
  try {
    resultado = await empezarAlta(uidActual, consultasCargadas, leida.ficha, extras);
  } catch (fallo) {
    // El formulario se queda tal cual para reintentar de un clic: nada se ha
    // escrito en Firestore si esto ha fallado.
    error.textContent = mensajeDeErrorDeConsulta(fallo.codigo);
    estado.textContent = "";
    id("btn-alta").disabled = false;
    return;
  }

  estado.textContent = "";
  id("btn-alta").disabled = false;
  await refrescarConsulta();

  // Si la IA ha preguntado, el alta sigue en el hilo y aquí no hay nada más que
  // hacer: se contesta con la caja de siempre y será responder() quien la
  // cierre. Solo se remata cuando ha cerrado a la primera.
  if (resultado.termino) await rematarAlta(leida.ficha, extras);
});

// Lo que va DESPUÉS de que el alta se cierre: el pesaje inicial y, si se
// pidieron, la dieta y la tabla. Se llama desde los dos caminos, cierre directo
// y cierre tras repreguntar.
//
// El orden importa: la operación ya está creada por cerrarAlta(), y el pesaje
// tiene que ir después a la fuerza — sin operación en marcha la app no deja
// apuntar nada, y escribirlo antes dejaría un registro fuera de ciclo.
async function rematarAlta(ficha, extras) {
  await refrescarAjustes();
  await refrescarOperaciones();

  if (ficha.pesoActualKg) {
    try {
      await guardarPesaje(uidActual, ficha.pesoActualKg, hoyISO(), "");
      await listaPeso.refrescar();
      refrescarGrafica();
    } catch {
      // Que no se apunte el pesaje no puede tirar un alta que ya está hecha: la
      // operación existe y los ajustes están guardados.
      id("error-alta").textContent =
        "Tu operación está abierta, pero no se ha podido apuntar tu peso de hoy. Apúntalo desde Peso.";
    }
  }

  await montarLoDelComite(extras);
}

// La dieta y la tabla van al final y NO bloquean el alta: si una falla, se
// avisa y se pide luego desde su sección. Una operación abierta sin dieta es un
// inconveniente; un alta rota es perder la entrevista entera.
//
// Se piden con las mismas funciones que el botón de Comidas y el de Ejercicio,
// sin instrucciones propias: la IA ya tiene el perfil recién guardado, que es
// de donde tiene que salir la semana. Gastan del cupo de planes como cualquier
// otra (PLANES_POR_DIA).
async function montarLoDelComite(extras) {
  if (!extras.dieta && !extras.tabla) return;

  const estado = id("estado-conversacion");
  const fallidas = [];
  const sinCupo = [];

  // Quedarse sin cupo de planes no es un fallo: es un límite conocido, y
  // merece un mensaje que no suene a avería.
  const montar = async (tipo, etiqueta, generar) => {
    if (quedanPlanesHoy(planesCargados, tipo) === 0) {
      sinCupo.push(etiqueta);
      return;
    }
    try {
      await generar("");
    } catch (fallo) {
      // El motivo SE GUARDA. La primera versión de esto hacía `catch {}` a
      // secas y el usuario se quedó con "no se ha podido crear la dieta" sin
      // saber si era falta de cuota, la IA saturada o un fallo de verdad —
      // y sin forma de averiguarlo salvo repetir el alta entera.
      console.error(`El comité no pudo montar ${etiqueta}:`, fallo);
      fallidas.push({ etiqueta, motivo: mensajeDeErrorDeConsulta(fallo.codigo) });
    }
  };

  estado.textContent = "Montando lo que te ha preparado el comité…";
  try {
    if (extras.dieta) await montar("dieta", "la dieta", generarDieta);
    if (extras.tabla) await montar("ejercicio", "la tabla", generarTabla);
  } finally {
    estado.textContent = "";
  }

  const avisos = [];
  fallidas.forEach(({ etiqueta, motivo }) => {
    avisos.push(`no se ha podido crear ${etiqueta} (${motivo})`);
  });
  if (sinCupo.length) {
    avisos.push(`hoy ya no te queda cupo para ${sinCupo.join(" ni ")}`);
  }

  if (avisos.length) {
    id("error-conversacion").textContent =
      `Tu operación está abierta, pero ${avisos.join("; ")}. ` +
      "Puedes pedirlo cuando quieras desde su sección.";
  }
}

// --- Dietas y tablas de ejercicio (specs 024 y 027) ----------------------
//
// Cada plan vive en su sección: la dieta en Comidas y la tabla en Ejercicio.
// Son siempre la semana entera, con un campo para pedir lo que haga falta y
// su propio cupo diario.
// La casilla "aprovechar lo que tengo en casa" (spec 059).
//
// El bloque entero se esconde si no hay NADA marcado —despensa vacía, o con
// cosas pero todas agotadas—: ofrecerte aprovechar lo que no tienes sería
// mentir, y pedir dieta vuelve a funcionar exactamente como antes de esta spec.
//
// El número que se enseña se lee AQUÍ, al abrir el formulario. Si te vas a la
// Despensa, desmarcas cosas y vuelves sin recargar, puede quedarse retrasado.
// Lo que de verdad se manda a la IA se lee en el momento de pedir, en
// generarDieta(): el número puede ir atrasado, lo que se manda nunca.
function pintarAprovecharDespensa() {
  const bloque = id("bloque-aprovechar");
  const cuantos = loQueTengo(despensaCargada).length;

  bloque.classList.toggle("oculta", cuantos === 0);
  id("aprovechar-cuantos").textContent =
    cuantos === 1 ? "1 ingrediente marcado" : `${cuantos} ingredientes marcados`;

  // Cada vez que se abre el formulario empieza desmarcada. Es lo mismo que hace
  // el submit al terminar, pero también cubre cerrar con Cancelar y volver.
  id("dieta-aprovechar").checked = false;
}

function pintarEspecializadas() {
  Object.keys(TIPOS_ESPECIALIZADOS).forEach((tipo) => {
    const contenedor = id(`pedir-${tipo}`);
    const config = TIPOS_ESPECIALIZADOS[tipo];
    const quedan = quedanPlanesHoy(planesCargados, tipo);

    contenedor.innerHTML = "";
    contenedor.classList.remove("oculta");

    const boton = botonDeFila(`Pedir ${config.etiqueta.toLowerCase()}`, () => {
      id(`form-plan-${tipo}`).classList.remove("oculta");
      contenedor.classList.add("oculta");

      // La casilla de la despensa se decide al abrir el formulario, que es
      // cuando el usuario la va a mirar (spec 059).
      if (tipo === "dieta") pintarAprovecharDespensa();

      // Las últimas instrucciones de este tipo, para no reescribirlas cada
      // vez (spec 040). planesCargados ya viene de más reciente a más
      // antiguo (orderBy("creadoEn", "desc") en listarPlanes()), así que el
      // primero que coincida en tipo es el último plan pedido de ese tipo.
      const campoInstrucciones = id(`instrucciones-${tipo}`);
      const ultimoDeEsteTipo = planesCargados.find((plan) => plan.tipo === tipo);
      campoInstrucciones.value = ultimoDeEsteTipo?.instrucciones || "";

      campoInstrucciones.focus();
      // El cursor al final: seguir escribiendo continúa el texto en vez de
      // partirlo por el principio.
      const fin = campoInstrucciones.value.length;
      campoInstrucciones.setSelectionRange(fin, fin);
    });
    boton.className = "atajo";
    boton.disabled = quedan === 0 || !hayOperacion;
    contenedor.appendChild(boton);

    id(`form-plan-${tipo}`).classList.add("oculta");
    id(`cupo-${tipo}`).textContent = quedan
      ? `Te ${quedan === 1 ? "queda" : "quedan"} ${quedan} de hoy.`
      : tipo === "dieta"
        ? `Has pedido tus ${PLANES_POR_DIA} de hoy. Puedes montar la semana a mano ahí arriba, que eso no gasta nada.`
        : `Has pedido tus ${PLANES_POR_DIA} de hoy. Vuelve mañana.`;
  });
}

// pintarUltimoPlan() se fue con la spec 029: era el hueco donde se leía la
// tabla cuando llegaba como texto. Ahora la dieta se lee en su semana y la
// tabla en la suya, así que los dos tipos tienen dónde caerse muertos.

Object.keys(TIPOS_ESPECIALIZADOS).forEach((tipo) => {
  id(`btn-cancelar-${tipo}`).addEventListener("click", () => pintarEspecializadas());

  id(`form-plan-${tipo}`).addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const error = id(`error-plan-${tipo}`);
    const estado = id(`estado-plan-${tipo}`);
    error.textContent = "";
    estado.textContent = "Pensando…";
    id(`btn-pedir-${tipo}`).disabled = true;

    try {
      // Ni la dieta ni la tabla llegan ya como texto: viene la semana
      // estructurada con sus recetas o sus ejercicios, para poder editarlas y
      // apuntar con un toque (specs 028 y 029).
      if (tipo === "dieta") {
        await generarDieta(id(`instrucciones-${tipo}`).value, id("dieta-aprovechar").checked);
      } else if (tipo === "ejercicio") {
        await generarTabla(id(`instrucciones-${tipo}`).value);
      }
      id(`instrucciones-${tipo}`).value = "";
      // La casilla NO se recuerda entre peticiones, al revés que las
      // instrucciones (spec 040): un texto cuesta reescribirlo, una casilla es
      // un clic. Recordarla haría que un día te saliera una dieta condicionada
      // por tu despensa sin que supieras por qué.
      if (tipo === "dieta") id("dieta-aprovechar").checked = false;
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
    // planesCargados NO es "los planes retirados en la spec 044": es lo que
    // alimenta el cupo diario de dietas y tablas (spec 027) y el autorrelleno
    // de instrucciones (spec 040). Se sigue leyendo aunque ya no se pinte.
    planesCargados = planes;
    pintarEstadoConsulta();
    pintarConversacion();
    pintarEspecializadas();
    // El emblema "Primera consulta" depende de consultasCargadas: en el login
    // esta función corre en paralelo con la carga de "Hoy", así que hay que
    // repintar el bloque de gamificación cuando esta llegue.
    refrescarHoy();
  } catch {
    id("error-conversacion").textContent =
      "No se ha podido cargar tu consulta. Comprueba tu conexión.";
  }
}

// Envuelve las llamadas a la IA: bloquea la pantalla, muestra "Pensando…" y
// traduce el error. Devuelve true si fue bien.
async function conEspera(accion) {
  // Un solo sitio para "Pensando…" y para los errores desde la spec 051: van
  // pegados a la caja, que es donde se mira después de enviar.
  const error = id("error-conversacion");
  error.textContent = "";
  id("estado-conversacion").textContent = "Pensando…";
  id("btn-empezar-consulta").disabled = true;
  id("btn-enviar-conversacion").disabled = true;

  try {
    await accion();
    return true;
  } catch (fallo) {
    error.textContent = mensajeDeErrorDeConsulta(fallo.codigo);
    return false;
  } finally {
    id("estado-conversacion").textContent = "";
    id("btn-enviar-conversacion").disabled = false;
    id("btn-empezar-consulta").disabled = false;
  }
}

id("btn-empezar-consulta").addEventListener("click", async () => {
  consultaReciénTerminada = null;
  const fueBien = await conEspera(() => empezarConsulta(uidActual, consultasCargadas));
  if (fueBien) await refrescarConsulta();
  else pintarEstadoConsulta();
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
    // El emblema "Centenario" cuenta las fotos: mismo motivo que en
    // refrescarConsulta(), repinta el bloque de gamificación con el dato ya
    // actualizado.
    refrescarHoy();
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
    listaBebidas.refrescar(),
    refrescarConsulta(),
    refrescarFotos(),
    refrescarRecetas(),
    refrescarDespensa(),
    refrescarDieta(),
    refrescarCatalogo(),
    refrescarTabla(),
    refrescarAnalisis(),
    refrescarAgua()
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

    // Los consejos: el texto tal cual, que es lo que vale de ellos.
    //
    // Aquí también se pintaban los "planes" hasta la spec 048. Se quitaron por
    // dos motivos: la v5 los retiró como concepto y PRODUCTO.md dice que los
    // guardados dejan de enseñarse, y además salían mal — en esa colección
    // conviven los planes viejos y las marcas de cupo de dietas y tablas
    // (spec 027), que no llevan texto, así que cada dieta pedida dejaba en el
    // histórico una tarjeta vacía con "(sin texto)".
    //
    // Se siguen ARCHIVANDO: "planes" continúa en COLECCIONES de
    // js/operaciones.js a propósito. Sacarla de ahí dejaría las marcas de cupo
    // sin archivar.
    [["consejos", "consejos", (documento) => documento.texto]].forEach(([nombre, titulo, sacarTexto]) => {
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

    // Las consultas no se pintan una a una: son conversaciones largas, y lo
    // que valía de ellas —el plan— ya no existe desde la v5. Se dice cuántas
    // hubo y con eso basta para hacerse una idea de la etapa.
    const consultas = porNombre.consultas || [];
    if (consultas.length) {
      const nota = document.createElement("p");
      nota.className = "explicacion";
      nota.textContent = `${consultas.length} ${
        consultas.length === 1 ? "consulta guardada" : "consultas guardadas"
      } en esta operación.`;
      contenido.appendChild(nota);
    }

    // Una operación sin nada que enseñar se quedaba en título y "Volver", una
    // pantalla muda (spec 053). Se mira lo que se ha llegado a pintar, y no
    // qué colecciones venían vacías: los bloques de aquí arriba han cambiado
    // ya un par de veces, y una lista paralela se habría quedado desfasada.
    if (!contenido.childElementCount && !grafica.childElementCount) {
      id("archivo-estado").textContent =
        "Esta operación no tiene ningún registro archivado.";
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
  //
  // Desde la spec 052 hay que repintar también el hilo: su caja y su título
  // dependen de `hayOperacion`, y al terminar la entrevista esto corre DESPUÉS
  // de refrescarConsulta(), que lo pintó cuando todavía no había operación.
  if (consultasCargadas.length) {
    pintarEstadoConsulta();
    pintarConversacion();
  }
}

// --- Ajustes -------------------------------------------------------------

// Lo último que se leyó de Ajustes. Lo mira el formulario de alta (spec 057)
// para saber si esta persona ya hizo el alta antes: si tiene perfil, la IA la
// conoce y el formulario avisa de que solo hay que cambiar lo que cambie.
let ajustesActuales = null;

async function refrescarAjustes() {
  try {
    const ajustes = await leerAjustes(uidActual);
    ajustesActuales = ajustes;
    pesoObjetivoActual = ajustes.pesoObjetivoKg ?? null;
    pintarAvatar(ajustes.fotoPerfil, emailActual);
    id("btn-quitar-foto").classList.toggle("oculta", !ajustes.fotoPerfil);
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
    // El objetivo del contador de agua (spec 061). Sale siempre con un número:
    // si nunca lo has tocado, el que se está usando de verdad.
    vasosObjetivoActual = objetivoDeVasos(ajustes);
    id("vasos-objetivo").value = vasosObjetivoActual;
    pintarAgua();
    proveedorIaActual = ajustes.proveedorIa || "automatico";
    id("proveedor-ia").value = proveedorIaActual;
    prerrellenarAlta(ajustes);
    if (consultasCargadas.length || !hayOperacion) pintarFormularioDeAlta();
  } catch {
    id("error-ajustes").textContent =
      "No se han podido cargar los ajustes. Comprueba tu conexión.";
  }
}

id("proveedor-ia").addEventListener("change", async (evento) => {
  proveedorIaActual = evento.target.value;
  try {
    await guardarProveedorIa(uidActual, proveedorIaActual);
    avisarGuardado("guardado-proveedor");
  } catch {
    // Párrafo propio, no el de Perfil: desde la spec 041 este bloque vive en
    // otra sub-pestaña, y un error escrito ahí no lo vería nadie.
    id("error-proveedor").textContent =
      "No se ha podido guardar el proveedor de IA. Comprueba tu conexión.";
  }
});

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

  // El objetivo de agua se valida aparte y no dentro de validarAjustes(): esa
  // función es el formulario "Mi objetivo" —peso, altura, fecha— y meterle un
  // sexto parámetro que no tiene nada que ver la convierte en un cajón.
  const agua = validarObjetivo(id("vasos-objetivo").value);
  if (agua.error) {
    error.textContent = agua.error;
    return;
  }

  const boton = id("btn-guardar-ajustes");
  boton.disabled = true;
  try {
    await guardarAjustes(uidActual, { ...resultado, vasosObjetivo: agua.objetivo });
    // La línea de objetivo de la gráfica sale de aquí.
    pesoObjetivoActual = resultado.pesoObjetivoKg ?? null;
    // Cambiar el objetivo no toca los vasos ya bebidos: cambia contra qué se
    // comparan, así que basta con repintar.
    vasosObjetivoActual = agua.objetivo;
    pintarAgua();
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

id("btn-actualizar-recuentos").addEventListener("click", refrescarRecuentos);

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
    // El histórico se pinta desde `operacionesCargadas`, la copia en memoria:
    // sin esto seguía enseñando la tarjeta de una operación ya borrada, y al
    // pulsar "Ver" se abría vacía (spec 053). Se llama siempre, sin mirar si
    // la selección incluía "operaciones": cuesta una lectura y evita que otra
    // casilla que algún día toque operaciones repita el fallo. Va antes de
    // refrescarTodo() porque fija `hayOperacion`, del que dependen varias de
    // las pantallas que aquel refresca.
    await refrescarOperaciones();
    // Y los ajustes, por lo mismo (spec 055): la casilla "lo que la IA sabe de
    // mí" vacía nombre, altura y objetivo, y sin releerlos la cabecera seguiría
    // saludándote por un nombre que ya no está guardado.
    await refrescarAjustes();
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
  ["peso", "comida-texto", "ejercicio-texto", "ejercicio-minutos", "bebida-texto"].forEach(
    (campo) => {
      id(campo).value = "";
    }
  );
  ["fecha", "comida-fecha", "ejercicio-fecha", "bebida-fecha"].forEach((campo) => {
    id(campo).value = hoyISO();
  });
  // La hora se propone, no se impone: viene rellena y se puede vaciar.
  ["hora", "comida-hora", "ejercicio-hora", "bebida-hora"].forEach((campo) => {
    id(campo).value = horaActual();
  });
  rellenarDesplegable("comida-momento", MOMENTOS, MOMENTO_POR_DEFECTO);
  rellenarDesplegable("ejercicio-intensidad", INTENSIDADES, INTENSIDAD_POR_DEFECTO);
  [
    "error-pesaje",
    "error-comida",
    "error-bebida",
    "error-ejercicio",
    "error-conversacion",
    "error-foto",
    "error-ajustes",
    "aviso-ajustes",
    "error-proveedor",
    "error-reinicio",
    "estado-reinicio"
  ].forEach((campo) => {
    id(campo).textContent = "";
  });
  id("estado-conversacion").textContent = "";
  id("estado-foto").textContent = "";
  cerrarVisor();
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
