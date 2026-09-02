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

import { estadisticasDePeso, estadisticasDeDistancia } from "./estadisticas.js";

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
  semanaDesdeMenu,
  idsDeRecetaDe,
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
  borrarEjercicioCatalogo,
  cruzarConElArmario
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
  loQueTengo,
  guardarIngredientesDeReceta,
  normalizar as normalizarIngrediente,
  mismoIngrediente,
  loQueFalta,
  esLineaEstructurada,
  nombreDeLinea
} from "./despensa.js";

import {
  validarApunte,
  guardarApunte,
  borrarApunte,
  listarCompra
} from "./compra.js";

import {
  MAX_NOMBRE as MAX_NOMBRE_MATERIAL,
  validarMaterial,
  materialIgual,
  guardarMaterial,
  renombrarMaterial,
  marcarMaterial,
  borrarMaterial,
  listarMaterial,
  ordenar as ordenarMaterial,
  loQueTengo as loQueTengoDelArmario,
  materialQueFalta
} from "./material.js";

import { hayQueSembrar, sembrar, olvidarLaSiembra } from "./siembra.js";
import {
  VERSION as VERSION_DATOS_INICIALES,
  MENUS,
  RECETAS as RECETAS_INICIALES
} from "./datos-iniciales.js";
import {
  planDeNormalizacion,
  aliasDeLosDatos,
  nuevoIdDeIngrediente,
  escribirNormalizacion
} from "./normalizacion.js";

// Ingredientes de una receta recién creada que se parecen a algo que ya tenías
// (spec 072). Se preguntan al terminar la dieta; hasta que se contesten, no se
// guardan.
let dudasDeDespensa = [];

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
  MAX_ACOMPANAMIENTOS,
  validarAcompanamiento,
  acompanamientosDe,
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

  // Antes esto colgaba del clic en el avatar. Desde la spec 066 Ajustes se abre
  // desde la barra, y también desde otros sitios, así que vive aquí: se entre
  // por donde se entre, los recuentos se releen.
  if (nombre === "ajustes") refrescarRecuentos();

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

  // El Recetario aterriza SIEMPRE en el panel Recetas (spec 085): sea la
  // pestaña misma, o editarRecetaDesdeElDia() de la spec 083. Quien quiera
  // Ingredientes en concreto (volver de la compra) lo pide DESPUÉS, con
  // mostrarPanelDeRecetario() — esta llamada no se lo puede comer porque las
  // dos son síncronas y en orden.
  if (seccion === "comidas" && nombre === "recetas") {
    mostrarPanelDeRecetario("recetas");
  }

  // El armario, igual y por lo mismo (spec 074).
  if (seccion === "ejercicio" && nombre === "material") {
    reordenarMaterialCargado();
  }

  // El catálogo se repinta al entrar porque su "Tienes 2 de 3" se cruza con el
  // armario al vuelo (spec 077): marcas unas mancuernas en Mi material, vuelves
  // aquí, y tiene que estar al día. Es lo mismo que hace la compra al entrar, y
  // cuesta lo mismo: cálculo sobre lo que ya está en memoria.
  if (seccion === "ejercicio" && nombre === "catalogo") {
    pintarCatalogo();
  }

  // La compra se recalcula al entrar, no se guarda: es la despensa cruzada con
  // las recetas de la dieta (spec 073).
  if (seccion === "comidas" && nombre === "compra") {
    pintarCompra();
  }
}

// El interruptor Recetas/Ingredientes dentro del Recetario (spec 085, fusión
// de las sub-pestañas Recetas y Despensa). No es una sub-pestaña de primer
// nivel: abrirSubpestana() no sabe nada de esto, y viceversa.
function mostrarPanelDeRecetario(modo) {
  id("panel-recetario-recetas").classList.toggle("oculta", modo !== "recetas");
  id("panel-recetario-ingredientes").classList.toggle("oculta", modo !== "ingredientes");

  document.querySelectorAll(".panel-recetario-boton").forEach((boton) => {
    const puesta = boton.dataset.panelRecetario === modo;
    boton.classList.toggle("activa", puesta);
    if (puesta) {
      boton.setAttribute("aria-current", "true");
    } else {
      boton.removeAttribute("aria-current");
    }
  });

  // La despensa recoloca sus filas AL ENTRAR en Ingredientes, y en ningún
  // otro momento (spec 058): antes este hook colgaba de la sub-pestaña
  // "despensa", que la spec 085 se lleva por delante al fundirla aquí.
  // Marcar no reordena: la fila saltaría bajo el dedo justo cuando estás
  // marcando varias seguidas.
  if (modo === "ingredientes") {
    reordenarDespensa();
  }
}

document.querySelectorAll(".panel-recetario-boton").forEach((boton) => {
  boton.addEventListener("click", () => mostrarPanelDeRecetario(boton.dataset.panelRecetario));
});

// La compra ya no tiene botón en la barra (spec 079): se llega desde
// Ingredientes y se vuelve a Ingredientes. `abrirSubpestana` no necesita que
// exista el botón, solo la subsección, así que esto basta.
id("btn-ir-a-compra").addEventListener("click", () => {
  abrirSubpestana("comidas", "compra");
});

id("btn-volver-despensa").addEventListener("click", () => {
  // Al Recetario primero (aterriza en Recetas por defecto, ver arriba), y
  // LUEGO a Ingredientes: el orden importa, si no el reseteo de arriba se
  // comería este paso.
  abrirSubpestana("comidas", "recetas");
  mostrarPanelDeRecetario("ingredientes");
});

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

// El avatar FUE la puerta de Ajustes entre las specs 024 y 066. Ya no: desde la
// 066 hay un engranaje en la barra, y dos caminos a la misma pantalla son justo
// la duplicidad que la v4 se dedicó a quitar. Ahora es solo tu foto, y en el
// HTML es un <span>, no un botón que promete algo que no hace.
//
// Los recuentos de "Reiniciar datos" solo se leían una vez, al iniciar sesión:
// si apuntabas algo después, salían desactualizados hasta recargar la página
// entera. Por eso se refrescan al entrar en Ajustes, ahora desde la barra.
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

// Un texto que se recorta se despliega entero al tocarlo, y se vuelve a
// recortar si se vuelve a tocar (spec 080). `desplegados` es el Set de la
// pantalla que lo llama (puede haber varios desplegados a la vez, cada uno
// independiente); `clave` identifica a ESTE texto dentro de ese Set;
// `repintar` es la función que vuelve a pintar la pantalla tras el cambio.
//
// Es un <button> y no un <span> con listener, para que entre con el
// tabulador y se active con Enter — pero sin marcador visual de que
// reacciona, más allá del cursor: la clase `texto-desplegable` le quita todo
// lo que un botón trae de serie.
//
// El click no se propaga (spec 081): en el Recetario y el Catálogo este
// botón vive dentro de la cabecera de una tarjeta, que es OTRO elemento
// tocable (abre/cierra la tarjeta); sin cortar la propagación, tocar el
// nombre activaría también la cabecera. En las demás pantallas no hay nada
// escuchando por encima, así que cortarla ahí no cambia nada.
function celdaDesplegable(texto, clase, clave, desplegados, repintar) {
  const elemento = document.createElement("button");
  elemento.type = "button";
  elemento.className = `${clase} texto-desplegable`;
  elemento.textContent = texto;

  const desplegado = desplegados.has(clave);
  elemento.classList.toggle("desplegado", desplegado);
  elemento.setAttribute("aria-expanded", String(desplegado));

  elemento.addEventListener("click", (evento) => {
    evento.stopPropagation();
    if (desplegados.has(clave)) desplegados.delete(clave);
    else desplegados.add(clave);
    repintar();
  });

  return elemento;
}

// La cabecera de una tarjeta de receta/ejercicio se toca para abrirla o
// cerrarla (Recetario, Catálogo). Desde la spec 081 ya no es un <button>
// nativo: el nombre de dentro es TAMBIÉN tocable por su cuenta
// (celdaDesplegable), y un <button> no puede llevar otro <button> anidado
// dentro — es HTML inválido y el navegador cierra el de fuera al toparse con
// el de dentro.
//
// `role="button"` y `tabindex="0"` la anuncian y la hacen alcanzable con el
// tabulador igual que un botón nativo; el keydown reproduce a mano su
// activación con Enter y Espacio. El guardia `evento.target !== cabecera`
// es lo que evita que pulsar Enter con el foco en el nombre (un <button> de
// verdad, que gestiona su propio Enter) dispare TAMBIÉN el toggle de la
// cabecera: el keydown burbujea igual que cualquier evento, así que sin este
// guardia un solo Enter haría las dos cosas a la vez.
function cabeceraDesplegable(alPulsar) {
  const cabecera = document.createElement("div");
  cabecera.setAttribute("role", "button");
  cabecera.tabIndex = 0;
  cabecera.addEventListener("click", alPulsar);
  cabecera.addEventListener("keydown", (evento) => {
    if (evento.target !== cabecera) return;
    if (evento.key !== "Enter" && evento.key !== " ") return;
    // Espacio hace scroll de página por defecto en un elemento que no es un
    // <button> de verdad; Enter no, pero da igual prevenirlo en los dos.
    evento.preventDefault();
    alPulsar();
  });
  return cabecera;
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
  anadir: ["M12 5v14", "M5 12h14"],
  // El libro de la receta (spec 072). Antes el nombre del plato era un botón
  // subrayado; ahora el nombre es texto normal como los demás y lo que se toca
  // es este icono.
  receta: ["M4 4h9a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4Z", "M20 4h-4a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h5Z"],
  // Los de la barra de navegación (spec 066). Trazos simples a propósito: a
  // 24 px de alto, un dibujo con detalle se convierte en una mancha.
  peso: ["M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9Z", "M12 12 15 8", "M3 12v7h18v-7"],
  comidas: ["M4 3v8a3 3 0 0 0 6 0V3", "M7 11v10", "M17 3c-2 2-2 6-2 8h4V3", "M17 11v10"],
  ejercicio: ["M6 8v8", "M18 8v8", "M3 10v4", "M21 10v4", "M6 12h12"],
  fotos: ["M3 8h4l2-3h6l2 3h4v12H3Z", "M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"],
  consulta: ["M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12Z"],
  // Los de las sub-pestañas de Comidas (spec 079). Mismo criterio que los de la
  // barra: a 24 px, un dibujo con detalle es una mancha.
  apuntar: ["M12 20h9", "M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"],
  dieta: ["M3 5h18v16H3Z", "M3 9h18", "M8 3v4", "M16 3v4"],
  recetas: ["M4 4h9a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4Z", "M20 4h-4a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h5Z"],
  despensa: ["M5 3h14v18H5Z", "M5 12h14", "M9 7v2", "M9 16v2"],
  compra: ["M3 4h2l2.4 11.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6", "M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z", "M18 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"],
  ajustes: [
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    "M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"
  ]
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

// Los dibujos de la barra (spec 066). Se pintan una vez al cargar, desde
// TRAZOS_DE_ICONO, para no repetir los SVG a mano en el HTML. El botón sin
// data-icono se queda con su texto: es "Hoy", a propósito.
//
// OJO CON EL SITIO: esto TIENE que ir después de TRAZOS_DE_ICONO. Se escribió
// arriba del todo, junto a los demás listeners de la barra, y tumbó la app
// entera: `const` no se puede leer antes de su declaración (zona muerta
// temporal), así que iconoDeAccion() lanzaba un ReferenceError al evaluar el
// módulo y la app se quedaba en "Cargando…" sin más pista. 29 de agosto de 2026.
//
// Y va envuelto en try/catch por lo mismo: esto es decoración, y la decoración
// no puede impedir que la app arranque. Sin iconos la barra sigue funcionando;
// sin app no funciona nada.
try {
  document.querySelectorAll(".nav-boton[data-icono]").forEach((boton) => {
    boton.appendChild(iconoDeAccion(boton.dataset.icono));
    boton.title = boton.getAttribute("aria-label");
  });

  // Las sub-pestañas de Comidas (spec 079). El dibujo va DELANTE del texto, que
  // sigue en el HTML dentro de un <span class="etiqueta">: el CSS lo esconde en
  // el móvil, pero el lector de pantalla lo lee siempre y en escritorio sale
  // sin que JavaScript tenga que ponerlo.
  document.querySelectorAll(".subpestana[data-icono]").forEach((boton) => {
    const etiqueta = boton.querySelector(".etiqueta");
    boton.insertBefore(iconoDeAccion(boton.dataset.icono), boton.firstChild);
    // El title es lo único que dice qué es cuando solo se ve el dibujo.
    if (etiqueta) boton.title = etiqueta.textContent;
  });
} catch (fallo) {
  console.error("No se han podido pintar los iconos:", fallo);
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

// Las bebidas de hoy, para el análisis nutricional (spec 070).
function bebidasDeHoy() {
  const hoy = hoyISO();
  return listaBebidas.obtenerRegistros().filter((bebida) => bebida.fecha === hoy);
}

function pintarAnalisis(comidas) {
  const deHoy = comidasDeHoy(comidas);
  const boton = id("btn-analizar");
  const quedan = quedanAnalisisHoy(analisisDeHoy);
  // Comidas Y bebidas: desde la spec 070 el análisis mira las dos cosas, así
  // que apuntar una caña también lo deja viejo.
  const viejo = estaViejo(analisisDeHoy, deHoy.length + bebidasDeHoy().length);

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
      // Los acompañamientos viajan con su comida (spec 070): el pan que te
      // comiste con las lentejas son calorías, y hasta ahora el análisis hacía
      // como que no existía.
      deHoy.map(({ momento, texto, acompanamientos }) => ({
        momento,
        texto,
        acompanamientos: acompanamientos || []
      })),
      proveedorIaActual,
      // Y las bebidas del día, en su bloque. El agua no: es un contador y no se
      // apunta como registro (spec 061).
      bebidasDeHoy().map(({ texto }) => ({ texto }))
    );

    await guardarAnalisis(
      uidActual,
      hoyISO(),
      respuesta,
      deHoy.length + bebidasDeHoy().length,
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
//
// Lo comparten las cuatro listas, así que los kilómetros (spec 087) se
// recalculan también al guardar un pesaje o una comida. Es correcto y no es un
// efecto raro: pasa ya con la gráfica, no cuesta nada porque es cálculo sobre
// memoria, y evita cuatro enganches donde basta uno.
function refrescarPantallas() {
  refrescarGrafica();
  refrescarHoy();
  pintarDistanciaRecorrida();
}

// Cuánto llevas andado (spec 087).
//
// obtenerRegistros() devuelve el array COMPLETO: `recortarPorDias` solo decide
// qué se PINTA, no qué se guarda. Es lo mismo de lo que ya tira refrescarGrafica()
// para el historial entero de pesajes, así que aquí no hay lectura nueva.
function pintarDistanciaRecorrida() {
  const lista = id("distancia-estadisticas");
  const vacio = id("distancia-vacia");
  const { hoy, siete, treinta, total } = estadisticasDeDistancia(
    listaEjercicios.obtenerRegistros(),
    hoyISO()
  );

  lista.innerHTML = "";

  // Sin un solo kilómetro apuntado, cuatro ceros no informan de nada y hacen
  // pensar que la app está rota. Una frase y ya.
  if (total.sesiones === 0) {
    vacio.textContent =
      "Cuando apuntes kilómetros en un ejercicio, aquí verás cuánto llevas.";
    return;
  }
  vacio.textContent = "";

  // Dentro de una ventana, un cero SÍ dice algo: que esta semana no has salido.
  const km = (valor) => `${valor.toFixed(1).replace(".", ",")} km`;
  const media = (ventana) =>
    ventana.media === null ? "" : `${km(ventana.media)} de media`;

  lista.append(
    lineaDeEstadistica("De hoy", km(hoy.km)),
    lineaDeEstadistica("Últimos 7 días", km(siete.km), media(siete)),
    lineaDeEstadistica("Últimos 30 días", km(treinta.km), media(treinta)),
    lineaDeEstadistica(
      "Desde que empezaste",
      km(total.km),
      `en ${total.sesiones} ${total.sesiones === 1 ? "sesión" : "sesiones"}`
    )
  );
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

// Qué nombres de receta están desplegados enteros dentro de su cabecera, por
// id (spec 081). Independiente de `recetaAbierta`: cerrar la tarjeta no
// contrae el nombre, y viceversa.
let nombresRecetaDesplegados = new Set();

// Lo escrito en el buscador de recetas (spec 079). Filtra lo que se pinta, no
// lo que hay.
let busquedaRecetas = "";

// Las recetas que coinciden, cada una con POR QUÉ ha entrado.
//
// Busca en el nombre y en los ingredientes a la vez, normalizado —sin tildes ni
// mayúsculas— con la misma función que usan la despensa, el armario y el cruce.
//
// El "porqué" no es un adorno: ver "Crema de calabaza" al buscar "pollo" parece
// un error hasta que la tarjeta dice que lleva pollo.
function recetasQueCoinciden() {
  if (!busquedaRecetas) {
    return recetasCargadas.map((receta) => ({ receta, porIngrediente: "" }));
  }

  const buscado = normalizarIngrediente(busquedaRecetas);
  const encontradas = [];

  recetasCargadas.forEach((receta) => {
    if (normalizarIngrediente(receta.nombre).includes(buscado)) {
      encontradas.push({ receta, porIngrediente: "" });
      return;
    }
    // nombreDeLinea() lee el nombre sea cual sea el formato de la línea
    // (spec 082): una línea vieja es texto, una nueva es un objeto
    // enlazado, y comparar el objeto entero como texto daría
    // "[object Object]".
    const ingrediente = (receta.ingredientes || []).find((linea) =>
      normalizarIngrediente(nombreDeLinea(linea)).includes(buscado)
    );
    if (ingrediente) encontradas.push({ receta, porIngrediente: nombreDeLinea(ingrediente) });
  });

  return encontradas;
}

function pintarRecetas() {
  const contenedor = id("lista-recetas");
  const boton = id("btn-desplegar-recetas");
  const botonArriba = id("btn-desplegar-recetas-arriba");

  contenedor.innerHTML = "";
  id("estado-recetas").textContent = recetasCargadas.length
    ? ""
    : "Aún no tienes recetas. Guarda las que cocinas a menudo y podrás montar dietas con ellas.";

  // El buscador solo aparece cuando hay lista que buscar, igual que el de la
  // despensa (spec 069): con cinco recetas es un campo que sobra.
  id("bloque-buscar-recetas").classList.toggle(
    "oculta",
    recetasCargadas.length < MINIMO_PARA_BUSCAR
  );

  const coinciden = recetasQueCoinciden();

  const visibles = recetasDesplegadas
    ? coinciden
    : coinciden.slice(0, RECETAS_SIN_DESPLEGAR);

  visibles.forEach(({ receta, porIngrediente }) => {
    const tarjeta = tarjetaDeReceta(receta);
    // Solo cuando ha entrado por un ingrediente: si coincide el nombre, ya se ve.
    if (porIngrediente) {
      tarjeta.appendChild(celda(`lleva ${porIngrediente}`, "explicacion"));
    }
    contenedor.appendChild(tarjeta);
  });

  // Buscar algo que no está no es un error, pero hay que decirlo: si no, la
  // lista se queda vacía sin explicación.
  if (busquedaRecetas && coinciden.length === 0) {
    contenedor.appendChild(
      celda(`Ninguna receta contiene "${busquedaRecetas}".`, "explicacion")
    );
  }

  const hayEscondidas = visibles.length < coinciden.length;
  boton.classList.toggle("oculta", !hayEscondidas && !recetasDesplegadas);
  boton.textContent = recetasDesplegadas
    ? "Ver menos"
    : `Ver todas (${coinciden.length})`;
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
  // `cruzados` es paralelo a `receta.ingredientes`: mismo orden, misma
  // longitud (cruzarConLaDespensa() mapea uno a uno). El texto que se lee
  // sale de la línea de verdad, no del campo `texto` de `cruzados` (spec
  // 082): ese campo solo dice si la tienes, no cómo se enseña.
  cruzados.forEach(({ tengo }, indice) => {
    const linea = receta.ingredientes[indice];
    const elemento = document.createElement("li");

    if (esLineaEstructurada(linea)) {
      const principal = document.createElement("span");
      principal.textContent = linea.cantidad
        ? `${nombreDeLinea(linea)} (${linea.cantidad})`
        : nombreDeLinea(linea);
      elemento.appendChild(principal);

      // La preparación ("triturado", "en rodajas") va aparte, nunca pegada
      // al nombre del ingrediente: es justo lo que pedía esta spec.
      if (linea.preparacion) {
        const preparacionLinea = document.createElement("span");
        preparacionLinea.className = "receta-ingrediente-preparacion";
        preparacionLinea.textContent = linea.preparacion;
        elemento.appendChild(preparacionLinea);
      }
    } else {
      elemento.textContent = linea;
    }

    // Sin despensa, la receta se ve exactamente como antes de la spec 059.
    if (marcando) {
      elemento.classList.add(tengo ? "lo-tengo" : "me-falta");
      // El "✓" lo pone el CSS y la opacidad no la lee nadie: sin este título,
      // quien no ve la pantalla no se entera de la despensa.
      elemento.title = tengo ? "Lo tienes en casa" : "Te falta";
    }
    ingredientes.appendChild(elemento);
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

  const cabecera = cabeceraDesplegable(() => {
    // Tocar la tarjeta la abre; volver a tocarla la cierra.
    recetaAbierta = recetaAbierta === receta.id ? null : receta.id;
    pintarRecetas();
  });
  cabecera.className = "receta-cabecera";
  cabecera.setAttribute("aria-expanded", String(recetaAbierta === receta.id));
  cabecera.append(
    celdaDesplegable(receta.nombre, "receta-nombre", receta.id, nombresRecetaDesplegados, pintarRecetas),
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

// Las líneas del editor mientras se rellena el formulario (spec 082). Cada
// una: { ingredienteId, ingredienteNombre, cantidad, preparacion }.
// `ingredienteId` es `null` mientras no está enlazada a nada de la despensa
// —una línea recién añadida, o una línea vieja (texto libre) todavía sin
// migrar—, y eso es lo que impide guardar (ver `validarReceta()`).
let lineasRecetaEnEdicion = [];

function lineaRecetaVacia() {
  return { ingredienteId: null, ingredienteNombre: "", cantidad: "", preparacion: "" };
}

// El desplegable de sugerencias del campo de ingrediente: las opciones de un
// <datalist> se leen contra la despensa cada vez que esta cambia, para que
// crear un ingrediente nuevo lo deje disponible sin recargar la página.
function actualizarSugerenciasDespensa() {
  const lista = id("sugerencias-despensa");
  lista.innerHTML = "";
  ordenarDespensa(despensaCargada).forEach((ingrediente) => {
    const opcion = document.createElement("option");
    opcion.value = ingrediente.nombre;
    lista.appendChild(opcion);
  });
}

function pintarLineasReceta() {
  const contenedor = id("receta-lineas");
  contenedor.innerHTML = "";
  lineasRecetaEnEdicion.forEach((linea, indice) => {
    contenedor.appendChild(filaDeIngredienteReceta(linea, indice));
  });
}

// Una fila del editor. El campo de ingrediente se resuelve al SALIR de él
// (evento "change", que en un <input> de texto dispara al perder el foco o
// al pulsar Enter): repintar en cada tecla perdería el foco de las demás
// filas a cada pulsación, así que solo se repinta cuando hace falta —al
// añadir/quitar una línea, o al crear un ingrediente nuevo.
function filaDeIngredienteReceta(linea, indice) {
  const fila = document.createElement("div");
  fila.className = "receta-linea-editor";

  const campoIngrediente = document.createElement("input");
  campoIngrediente.type = "text";
  campoIngrediente.placeholder = "ingrediente";
  campoIngrediente.setAttribute("list", "sugerencias-despensa");
  campoIngrediente.setAttribute("aria-label", "Ingrediente");
  campoIngrediente.maxLength = MAX_NOMBRE_INGREDIENTE;
  campoIngrediente.value = linea.ingredienteNombre;
  // Una línea recién añadida y vacía no está "mal": solo lo está una que
  // tiene texto (típicamente una línea vieja precargada) sin enlazar.
  campoIngrediente.classList.toggle(
    "linea-sin-enlazar",
    !linea.ingredienteId && Boolean(linea.ingredienteNombre)
  );

  const crear = document.createElement("button");
  crear.type = "button";
  crear.className = "enlace receta-linea-crear oculta";

  const resolverIngrediente = () => {
    const texto = campoIngrediente.value.trim();
    linea.ingredienteNombre = texto;
    linea.ingredienteId = null;
    crear.classList.add("oculta");
    campoIngrediente.classList.toggle("linea-sin-enlazar", Boolean(texto));

    if (!texto) return;

    const existente = despensaCargada.find((ingrediente) =>
      mismoIngrediente(ingrediente.nombre, texto)
    );
    if (existente) {
      linea.ingredienteId = existente.id;
      linea.ingredienteNombre = existente.nombre;
      campoIngrediente.value = existente.nombre;
      campoIngrediente.classList.remove("linea-sin-enlazar");
      return;
    }

    crear.textContent = `Crear "${texto}" en tu despensa`;
    crear.classList.remove("oculta");
  };

  campoIngrediente.addEventListener("change", resolverIngrediente);
  // Enter en un campo de texto envía el formulario entero por defecto: aquí
  // solo tiene que resolver la línea, como al perder el foco.
  campoIngrediente.addEventListener("keydown", (evento) => {
    if (evento.key !== "Enter") return;
    evento.preventDefault();
    resolverIngrediente();
  });

  crear.addEventListener("click", async () => {
    const validado = validarIngrediente(linea.ingredienteNombre);
    if (validado.error) {
      id("error-receta").textContent = validado.error;
      return;
    }
    crear.disabled = true;
    try {
      const referencia = await guardarIngrediente(uidActual, validado.nombre);
      await refrescarDespensa();
      linea.ingredienteId = referencia.id;
      linea.ingredienteNombre = validado.nombre;
      id("error-receta").textContent = "";
      pintarLineasReceta();
    } catch {
      id("error-receta").textContent =
        "No se ha podido crear el ingrediente. Comprueba tu conexión.";
      crear.disabled = false;
    }
  });

  const campoCantidad = document.createElement("input");
  campoCantidad.type = "text";
  campoCantidad.placeholder = "cantidad";
  campoCantidad.setAttribute("aria-label", "Cantidad");
  campoCantidad.maxLength = 40;
  campoCantidad.value = linea.cantidad;
  campoCantidad.addEventListener("input", () => {
    linea.cantidad = campoCantidad.value;
  });

  const campoPreparacion = document.createElement("input");
  campoPreparacion.type = "text";
  campoPreparacion.placeholder = "preparación (opcional)";
  campoPreparacion.setAttribute("aria-label", "Preparación");
  campoPreparacion.maxLength = 200;
  campoPreparacion.value = linea.preparacion;
  campoPreparacion.addEventListener("input", () => {
    linea.preparacion = campoPreparacion.value;
  });

  const quitar = botonDeIcono("papelera", "Quitar este ingrediente", () => {
    lineasRecetaEnEdicion.splice(indice, 1);
    pintarLineasReceta();
  });

  fila.append(campoIngrediente, crear, campoCantidad, campoPreparacion, quitar);
  return fila;
}

id("btn-anadir-linea-receta").addEventListener("click", () => {
  lineasRecetaEnEdicion.push(lineaRecetaVacia());
  pintarLineasReceta();
});

// Si el editor de receta se abrió desde el botón "Editar" de Mi dieta (spec
// 083), guardar/cancelar tiene que volver ahí en vez de dejarte en Recetas.
//
// Es un booleano, NO el día que se estaba viendo: `diaDietaAbierto` también
// vale `null` en la vista de "semana entera", así que guardarlo ahí
// confundiría los dos casos. No hace falta: nada cambia `diaDietaAbierto`
// mientras el formulario sigue VISIBLE, así que `pintarDieta()` ya respeta
// lo que hubiera al volver.
//
// Se apaga en dos sitios, no solo al terminar la edición: al abrir CUALQUIER
// formulario de receta (para que una edición abandonada no "contamine" una
// posterior y distinta), y en refrescarTodo() (para que las acciones
// disruptivas de Ajustes —que sí pueden cambiar `diaDietaAbierto` de fondo,
// vía refrescarDieta()— no dejen el recordatorio apuntando a un día que ya
// no es el que se miraba).
let volverAMiDietaTrasEditar = false;

function abrirFormularioDeReceta(receta) {
  // Cualquier apertura del formulario —nueva, o editar desde el Recetario o
  // desde Mi dieta— empieza "de cero": solo el botón nuevo de Mi dieta la
  // vuelve a encender, y lo hace DESPUÉS de esta llamada.
  volverAMiDietaTrasEditar = false;
  recetaEditando = receta ? receta.id : null;

  id("receta-nombre").value = receta ? receta.nombre : "";
  id("receta-raciones").value = receta ? receta.raciones : "";
  id("receta-preparacion").value = receta ? receta.preparacion || "" : "";

  // Una receta nueva empieza con una línea vacía, lista para escribir. Una
  // receta que ya tiene ingredientes recupera una fila por cada uno: si es
  // vieja (texto libre), cada línea entra SIN ingredienteId, precargada con
  // su texto tal cual — editar una receta vieja es, de paso, la forma de
  // migrarla (spec 082).
  const ingredientesDeReceta = receta ? receta.ingredientes || [] : [];
  lineasRecetaEnEdicion = ingredientesDeReceta.length
    ? ingredientesDeReceta.map((linea) =>
        esLineaEstructurada(linea)
          ? { ...linea }
          : { ...lineaRecetaVacia(), ingredienteNombre: nombreDeLinea(linea) }
      )
    : [lineaRecetaVacia()];

  actualizarSugerenciasDespensa();
  pintarLineasReceta();

  id("error-receta").textContent = "";
  id("form-receta").classList.remove("oculta");
  id("btn-nueva-receta").classList.add("oculta");
  id("receta-nombre").focus();
}

function cerrarFormularioDeReceta() {
  recetaEditando = null;
  lineasRecetaEnEdicion = [];
  id("receta-lineas").innerHTML = "";
  id("form-receta").classList.add("oculta");
  id("btn-nueva-receta").classList.remove("oculta");
  id("error-receta").textContent = "";

  // El submit de form-receta llama a esta función al guardar con éxito, así
  // que cubre Guardar y Cancelar a la vez: no hace falta comprobarlo en el
  // submit por separado (spec 083).
  if (volverAMiDietaTrasEditar) {
    volverAMiDietaTrasEditar = false;
    abrirPestana("comidas", "dieta");
    pintarDieta();
  }
}

function editarReceta(receta) {
  abrirFormularioDeReceta(receta);
  id("form-receta").scrollIntoView({ block: "center" });
}

// El botón "Editar" de la receta desplegada en Mi dieta (spec 083): abre el
// mismo editor que el Recetario, cambiando de sub-pestaña, y deja dicho que
// hay que volver aquí al terminar.
function editarRecetaDesdeElDia(receta) {
  abrirPestana("comidas", "recetas");
  editarReceta(receta);
  // Después de editarReceta(): abrirFormularioDeReceta(), que llama por
  // dentro, apaga esta variable al principio. Ponerla antes se la comería.
  volverAMiDietaTrasEditar = true;
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
  // Y la lista de la compra, que sale de los ingredientes de esas recetas.
  pintarCompra();
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

id("btn-desplegar-despensa").addEventListener("click", () => {
  despensaDesplegada = !despensaDesplegada;
  pintarDespensa();
  if (!despensaDesplegada) {
    id("btn-desplegar-despensa").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
});

id("btn-desplegar-despensa-arriba").addEventListener("click", () => {
  despensaDesplegada = !despensaDesplegada;
  pintarDespensa();
});

id("form-receta").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const error = id("error-receta");
  error.textContent = "";

  // El editor manda SIEMPRE el array estructurado (spec 082), nunca el texto
  // libre de antes: cada línea ya viene enlazada (o no) a un ingrediente
  // real de la despensa. validarReceta() rechaza cualquier línea sin
  // ingredienteId — igual una recién añadida y vacía que una vieja que
  // todavía no se ha enlazado.
  const resultado = validarReceta(
    id("receta-nombre").value,
    id("receta-raciones").value,
    lineasRecetaEnEdicion.map((linea) => ({
      ingredienteId: linea.ingredienteId,
      ingredienteNombre: linea.ingredienteNombre,
      cantidad: linea.cantidad,
      preparacion: linea.preparacion
    })),
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
    // Ya NO se llama a llenarDespensaDesde() aquí (spec 082): con el editor
    // nuevo, cada ingrediente quedó enlazado o creado línea a línea MIENTRAS
    // se editaba, así que volver a analizar la receta guardada sería
    // trabajo repetido — y con líneas ya estructuradas, esa llamada
    // esperaba texto y habría roto la despensa con basura tipo
    // "[object Object]". Sigue haciendo falta para las recetas que
    // propone la IA (texto libre): eso pasa por generarDieta(), no por
    // aquí.
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

// --- La lista de la compra (spec 073) ------------------------------------
//
// Dos cosas en una sola lista: lo que falta de tu dieta —calculado al vuelo,
// cruzando las recetas de la semana con tu despensa— y lo que hayas apuntado a
// mano, que sí se guarda.
//
// Marcar como comprado hace cosas distintas según qué sea, pero desde fuera se
// ve igual: desaparece de la lista. Un ingrediente se marca en la despensa
// —comprar algo es tenerlo—; un apunte a mano se borra.

let apuntesDeCompra = [];

// Las recetas enlazadas a las comidas de la dieta activa, sin repetir.
function recetasDeLaDieta() {
  if (!dietaActiva) return [];

  const ids = new Set();
  dietaActiva.dias.forEach((dia) => {
    dia.comidas.forEach((comida) => {
      // Todas las de la comida, no una (spec 088): si la cena lleva ensalada y
      // tortilla, los ingredientes de las dos tienen que llegar a la compra.
      idsDeRecetaDe(comida).forEach((id) => ids.add(id));
    });
  });

  return recetasCargadas.filter((receta) => ids.has(receta.id));
}

// Las comidas de la semana que NO tienen receta enlazada, por su nombre.
//
// La lista no se limita a avisar de que no lo sabe todo: dice cuáles son, para
// que el usuario pueda crearles una receta y enlazarla (specs 026 y 028). Un
// aviso genérico no sirve de nada; tres nombres concretos sí.
function comidasSinReceta() {
  if (!dietaActiva) return [];

  const nombres = [];
  dietaActiva.dias.forEach((dia) => {
    dia.comidas.forEach((comida) => {
      if (!comida.texto) return;
      // Con la lista vacía es cuando no hay nada que mirar. Una comida con una
      // sola receta viva sigue callando, igual que antes de la spec 088.
      if (recetasDeLaComida(comida).length) return;
      if (!nombres.includes(comida.texto)) nombres.push(comida.texto);
    });
  });

  return nombres;
}

// El botón que lleva a la compra desde la despensa (spec 079), con lo que falta.
//
// Se ve SIEMPRE, también con la lista vacía: esconder el sitio donde se mira es
// peor que enseñarlo vacío. Sin nada que comprar dice solo "Ver lista de la
// compra", sin un "(0)" que parece un error.
function pintarBotonDeCompra() {
  const cuantas =
    loQueFalta(recetasDeLaDieta(), despensaCargada).length + apuntesDeCompra.length;
  id("btn-ir-a-compra").textContent = cuantas
    ? `Ver lista de la compra (${cuantas})`
    : "Ver lista de la compra";
}

function pintarCompra() {
  // El botón vive en la despensa pero cuenta lo mismo que esta lista, así que se
  // repinta con ella y nunca se quedan diciendo cosas distintas.
  pintarBotonDeCompra();

  const contenedor = id("lista-compra");
  const estado = id("estado-compra");
  const aviso = id("sin-receta-compra");

  contenedor.innerHTML = "";

  const faltan = loQueFalta(recetasDeLaDieta(), despensaCargada);
  const todo = [
    ...faltan.map((falta) => ({ ...falta, apunteId: null })),
    ...apuntesDeCompra.map((apunte) => ({
      nombre: apunte.texto,
      ingredienteId: null,
      apunteId: apunte.id
    }))
  ];

  estado.textContent = todo.length
    ? ""
    : dietaActiva
      ? "No te falta nada de tu dieta. Puedes apuntar aquí lo que necesites."
      : "Aún no tienes dieta, así que aquí solo saldrá lo que apuntes a mano.";

  todo.forEach((cosa) => contenedor.appendChild(filaDeCompra(cosa)));

  // Lo que la lista NO sabe, dicho por su nombre.
  const sinReceta = comidasSinReceta();
  aviso.classList.toggle("oculta", sinReceta.length === 0);
  if (sinReceta.length) {
    const cuantas =
      sinReceta.length === 1
        ? "esta comida de tu semana no tiene receta"
        : "estas comidas de tu semana no tienen receta";
    aviso.textContent =
      `Ojo: ${cuantas}, así que no sé qué llevan — ${sinReceta.join(", ")}. ` +
      "Si les creas una receta y la enlazas al editar la comida, sus " +
      "ingredientes saldrán aquí.";
  }
}

function filaDeCompra(cosa) {
  const fila = document.createElement("div");
  fila.className = "ingrediente";

  const comprado = botonDeIcono("comido", `Ya lo tengo: ${cosa.nombre}`, () =>
    marcarComprado(cosa)
  );
  comprado.classList.add("boton-comido");

  const acciones = document.createElement("div");
  acciones.className = "ingrediente-acciones";

  // Solo los apuntes a mano se quitan a mano: lo que falta de la dieta no se
  // borra, se deja de necesitar.
  if (cosa.apunteId) {
    acciones.appendChild(
      botonDeIcono("papelera", `Quitar ${cosa.nombre} de la lista`, () =>
        quitarApunte(cosa)
      )
    );
  }

  fila.append(comprado, celda(cosa.nombre, "ingrediente-nombre"), acciones);
  return fila;
}

// Comprar algo es tenerlo. Un ingrediente se marca en la despensa; un apunte a
// mano se borra. Los dos desaparecen de la lista, que es lo que se espera.
async function marcarComprado(cosa) {
  id("error-compra").textContent = "";

  try {
    if (cosa.apunteId) await borrarApunte(uidActual, cosa.apunteId);

    if (cosa.ingredienteId) {
      await marcarIngrediente(uidActual, cosa.ingredienteId, true);
    } else if (!cosa.apunteId) {
      // Está en una receta pero no en tu despensa todavía. Entra YA MARCADO,
      // porque acabas de comprarlo: es la única alta que nace marcada desde la
      // spec 068, y aquí sí es verdad que lo tienes.
      const referencia = await guardarIngrediente(uidActual, cosa.nombre);
      await marcarIngrediente(uidActual, referencia.id, true);
    }

    await refrescarCompra();
    await refrescarDespensa();
  } catch {
    id("error-compra").textContent =
      "No se ha podido guardar. Comprueba tu conexión.";
  }
}

async function quitarApunte(cosa) {
  id("error-compra").textContent = "";
  try {
    await borrarApunte(uidActual, cosa.apunteId);
    await refrescarCompra();
  } catch {
    id("error-compra").textContent =
      "No se ha podido borrar. Comprueba tu conexión.";
  }
}

async function refrescarCompra() {
  try {
    apuntesDeCompra = await listarCompra(uidActual);
  } catch {
    apuntesDeCompra = [];
    id("error-compra").textContent =
      "No se ha podido cargar la lista de la compra.";
  }
  pintarCompra();
}

id("form-apunte").addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const campo = id("apunte-texto");
  const error = id("error-compra");
  error.textContent = "";

  const resultado = validarApunte(campo.value, apuntesDeCompra);
  if (resultado.error) {
    error.textContent = resultado.error;
    return;
  }

  const boton = id("btn-anadir-apunte");
  boton.disabled = true;
  try {
    await guardarApunte(uidActual, resultado.texto);
  } catch {
    error.textContent = "No se ha podido guardar. Comprueba tu conexión.";
    return;
  } finally {
    boton.disabled = false;
  }

  campo.value = "";
  await refrescarCompra();
  campo.focus();
});

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
// Lo que se ha escrito en el buscador (spec 069). Filtra lo que se pinta, no lo
// que hay: el recuento sigue hablando de la despensa entera.
let busquedaDespensa = "";

// Por debajo de esto, buscar no ayuda: la lista entera cabe de un vistazo y el
// campo solo estorba.
const MINIMO_PARA_BUSCAR = 8;

// La lista deja de salir entera de golpe (spec 085): mismo patrón que las
// recetas (RECETAS_SIN_DESPLEGAR), con más margen porque una fila de
// ingrediente es mucho más compacta que una tarjeta de receta.
const DESPENSA_SIN_DESPLEGAR = 10;
let despensaDesplegada = false;

function pintarDespensa() {
  const contenedor = id("lista-despensa");
  const recuento = id("recuento-despensa");
  const boton = id("btn-desplegar-despensa");
  const botonArriba = id("btn-desplegar-despensa-arriba");

  contenedor.innerHTML = "";

  id("estado-despensa").textContent = despensaCargada.length
    ? ""
    : "Aquí van los ingredientes con los que sueles cocinar. Márcalos según los tengas en casa y la dieta podrá aprovecharlos.";

  const enCasa = despensaCargada.filter((ingrediente) => ingrediente.tengo).length;
  recuento.textContent = despensaCargada.length
    ? `${enCasa} de ${despensaCargada.length} ingredientes en casa`
    : "";

  // El buscador solo aparece cuando hay lista que buscar. Con cinco
  // ingredientes es un campo que sobra en pantalla.
  id("bloque-buscar-despensa").classList.toggle(
    "oculta",
    despensaCargada.length < MINIMO_PARA_BUSCAR
  );

  // El buscador filtra sobre TODOS los ingredientes, no solo los visibles:
  // mismo criterio que ya usa el buscador de recetas con recetasDesplegadas.
  const coinciden = ingredientesQueCoinciden();
  const visibles = despensaDesplegada
    ? coinciden
    : coinciden.slice(0, DESPENSA_SIN_DESPLEGAR);

  visibles.forEach((ingrediente) =>
    contenedor.appendChild(filaDeIngrediente(ingrediente))
  );

  // Buscar algo que no está no es un error, pero hay que decirlo: si no, la
  // lista se queda vacía sin explicación.
  if (busquedaDespensa && coinciden.length === 0) {
    contenedor.appendChild(
      celda(`Ningún ingrediente contiene "${busquedaDespensa}".`, "explicacion")
    );
  }

  const hayEscondidos = visibles.length < coinciden.length;
  boton.classList.toggle("oculta", !hayEscondidos && !despensaDesplegada);
  boton.textContent = despensaDesplegada
    ? "Ver menos"
    : `Ver todos (${coinciden.length})`;
  botonArriba.classList.toggle("oculta", !hayEscondidos && !despensaDesplegada);
  botonArriba.textContent = boton.textContent;
}

// Se compara normalizado, como todo lo demás de la despensa: buscar "jamon"
// tiene que encontrar "Jamón".
function ingredientesQueCoinciden() {
  if (!busquedaDespensa) return despensaCargada;
  const buscado = normalizarIngrediente(busquedaDespensa);
  return despensaCargada.filter((ingrediente) =>
    normalizarIngrediente(ingrediente.nombre).includes(buscado)
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

// Mete en la despensa los ingredientes de unas recetas recién guardadas (spec
// 068). Sin marcar: que una receta mencione el azafrán no significa que lo
// tengas. Los que ya estaban no se tocan.
//
// Nunca puede tumbar lo que la llamó: si la despensa falla, la receta y la dieta
// ya están guardadas y eso es lo que importa. Se avisa por consola y punto.
async function llenarDespensaDesde(recetas) {
  let metidos = 0;
  const dudas = [];

  try {
    for (const receta of recetas) {
      const salida = await guardarIngredientesDeReceta(
        uidActual,
        receta,
        // La despensa cargada MÁS lo que está pendiente de preguntar: si dos
        // recetas mencionan "tomate triturado", se pregunta una vez.
        [...despensaCargada, ...dudas.map((duda) => ({ nombre: duda.nombre }))]
      );
      metidos += salida.metidos;
      dudas.push(...salida.dudas);

      // Se relee entre recetas para que dos recetas con el mismo ingrediente no
      // lo metan dos veces.
      if (salida.metidos) await refrescarDespensa();
    }
  } catch (fallo) {
    console.error("No se han podido añadir ingredientes a la despensa:", fallo);
  }

  dudasDeDespensa = dudas;
  pintarDudasDeDespensa();
  return metidos;
}

// El panel de dudas (spec 072). Sale al terminar de crearse la dieta y
// desaparece en cuanto se contestan todas.
//
// Si se recarga la página sin contestar, las dudas se pierden y esos
// ingredientes no entran. Es a propósito: no se guarda una lista de preguntas
// pendientes en Firestore por algo que se resuelve en dos toques, y la
// alternativa —meterlos por si acaso— es justo el duplicado que se quiere
// evitar.
function pintarDudasDeDespensa() {
  const bloque = id("dudas-despensa");
  const lista = id("lista-dudas");

  bloque.classList.toggle("oculta", dudasDeDespensa.length === 0);
  lista.innerHTML = "";
  if (!dudasDeDespensa.length) return;

  id("dudas-titulo").textContent =
    dudasDeDespensa.length === 1
      ? "1 ingrediente por revisar"
      : `${dudasDeDespensa.length} ingredientes por revisar`;

  dudasDeDespensa.forEach((duda) => {
    const fila = document.createElement("div");
    fila.className = "duda-despensa";

    const pregunta = document.createElement("p");
    pregunta.className = "duda-pregunta";
    pregunta.textContent = `«${duda.nombre}» ¿es lo mismo que tu «${duda.parecido}»?`;
    fila.appendChild(pregunta);

    const acciones = document.createElement("div");
    acciones.className = "duda-acciones";

    const esElMismo = botonDeFila("Es el mismo", () => resolverDuda(duda, false));
    const sonDistintos = botonDeFila("Son distintos", () => resolverDuda(duda, true));
    sonDistintos.className = "accion-principal";

    acciones.append(esElMismo, sonDistintos);
    fila.appendChild(acciones);
    lista.appendChild(fila);
  });
}

// "Es el mismo" no guarda nada: ya lo tienes con otro nombre. "Son distintos"
// lo mete como uno más, sin marcar, igual que cualquier alta.
async function resolverDuda(duda, esNuevo) {
  dudasDeDespensa = dudasDeDespensa.filter((otra) => otra !== duda);
  pintarDudasDeDespensa();

  if (!esNuevo) return;

  try {
    await guardarIngrediente(uidActual, duda.nombre);
    await refrescarDespensa();
  } catch (fallo) {
    console.error("No se ha podido añadir el ingrediente:", fallo);
  }
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
  // La lista de la compra sale de cruzar la despensa con las recetas, así que
  // cambiar la despensa la cambia (spec 073).
  pintarCompra();
  // Y las sugerencias del editor de receta (spec 082): un ingrediente nuevo
  // tiene que poder sugerirse sin recargar la página.
  actualizarSugerenciasDespensa();
  // Y el modo "Elegir de mi despensa" al apuntar una comida (spec 084): la
  // lista de marcados, y si hay alguno, pueden cambiar sin recargar.
  actualizarModoComida();
}

id("buscar-recetas").addEventListener("input", (evento) => {
  busquedaRecetas = evento.target.value.trim();
  pintarRecetas();
});

id("btn-limpiar-busqueda-recetas").addEventListener("click", () => {
  busquedaRecetas = "";
  id("buscar-recetas").value = "";
  pintarRecetas();
  id("buscar-recetas").focus();
});

// La bebida, plegada (spec 079). Mismo patrón que "Cambiar fecha y hora": el
// botón desaparece al abrirla, porque una vez abierta ya no hay nada que pulsar.
id("btn-desplegar-bebida").addEventListener("click", () => {
  id("bloque-bebida").classList.remove("oculta");
  id("btn-desplegar-bebida").classList.add("oculta");
});

id("buscar-despensa").addEventListener("input", (evento) => {
  busquedaDespensa = evento.target.value.trim();
  pintarDespensa();
});

id("btn-limpiar-busqueda").addEventListener("click", () => {
  busquedaDespensa = "";
  id("buscar-despensa").value = "";
  pintarDespensa();
  id("buscar-despensa").focus();
});

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
      // Volver a escribirlo no es equivocarse, así que el aviso va en el hueco
      // de "Guardado" y no en el de error. Pero YA NO LO MARCA (spec 068):
      // desde que los ingredientes nacen sin marcar, escribir no dice nada
      // sobre lo que hay en la nevera. Marcar es un acto aparte.
      aviso = `"${repetido.nombre}" ya está en tu despensa.`;
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
  // Si había una búsqueda puesta, lo recién añadido podría no coincidir con ella
  // y parecería que no se ha guardado. Se limpia.
  busquedaDespensa = "";
  id("buscar-despensa").value = "";
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

// --- El armario: el material que tienes (spec 074) ------------------------
//
// Espejo de la despensa, y a propósito: mismo patrón, mismos aciertos. La lista
// NO se reordena al marcar (se reordena al entrar), y añadir algo repetido no es
// un error del usuario sino su forma de decir "esto ya lo tengo".
//
// Lo único que se aparta de la despensa está en js/material.js: una pieza nace
// MARCADA. Allí está el porqué, y en resumen es que el armario no se llena solo.

let materialCargado = [];
let materialEditando = null;

function pintarMaterial() {
  const contenedor = id("lista-material");

  contenedor.innerHTML = "";

  id("estado-material").textContent = materialCargado.length
    ? ""
    : "Aquí va el material con el que entrenas. Márcalo según lo tengas y tus tablas podrán aprovecharlo.";

  actualizarRecuentoMaterial();

  materialCargado.forEach((pieza) =>
    contenedor.appendChild(filaDeMaterial(pieza))
  );

  // Lo que falta cuelga de lo que tienes, así que se repinta con ello: así
  // cubre de una vez el alta, el renombrado y el borrado, que pasan todos por
  // aquí. El único camino que NO pasa es marcarEnElArmario(), que a propósito
  // no repinta el armario para no mover la fila bajo el dedo; ese llama solo a
  // pintarMaterialQueFalta().
  pintarMaterialQueFalta();
}

// Lo que pide tu tabla y no tienes (spec 078).
//
// Cálculo SÍNCRONO sobre lo que ya está en memoria —`tablaActiva`,
// `catalogoCargado` y `materialCargado`—, sin ninguna lectura nueva a
// Firestore. Es lo mismo que hace pintarCompra(), y por lo mismo: un fallo al
// cargar la tabla ya se cuenta donde se carga, en refrescarTabla().
function pintarMaterialQueFalta() {
  const contenedor = id("lista-material-falta");
  const estado = id("estado-material-falta");

  contenedor.innerHTML = "";

  const faltan = materialQueFalta(tablaActiva, catalogoCargado, materialCargado);

  estado.textContent = faltan.length
    ? "Lo que pide tu tabla y no tienes marcado. Tócalo cuando lo consigas."
    : tablaActiva
      ? "Tienes todo lo que pide tu tabla."
      : "Cuando tengas una tabla, aquí sale el material que te pide y no tienes.";

  faltan.forEach((falta) => contenedor.appendChild(filaDeMaterialQueFalta(falta)));
}

function filaDeMaterialQueFalta(falta) {
  const fila = document.createElement("div");
  fila.className = "ingrediente";

  const tengo = botonDeIcono("comido", `Ya lo tengo: ${falta.nombre}`, () =>
    conseguirMaterial(falta, tengo)
  );
  tengo.classList.add("boton-comido");

  fila.append(
    tengo,
    celda(falta.nombre, "ingrediente-nombre"),
    document.createElement("div")
  );
  return fila;
}

// "Ya lo tengo": si la pieza está en tu armario desmarcada, se marca; si no
// está, se crea — y nace marcada, que es lo que hace guardarMaterial() desde la
// spec 074. Tocar el botón ya es decir que lo tienes; pedir un segundo gesto
// para marcarlo sería la incoherencia que esa spec evita.
async function conseguirMaterial(falta, boton) {
  limpiarAvisosMaterial();
  // Solo el botón tocado: son N botones independientes y bloquear los demás
  // sería castigar al que va con prisa.
  boton.disabled = true;

  try {
    // El armario puede llevar rato cargado: si mientras tanto la pieza ya
    // existe, se marca la que hay en vez de crear una gemela. Misma defensa
    // que el alta a mano.
    const yaEstaba =
      (falta.materialId &&
        materialCargado.find((pieza) => pieza.id === falta.materialId)) ||
      materialIgual(materialCargado, falta.nombre);

    if (yaEstaba) {
      await marcarMaterial(uidActual, yaEstaba.id, true);
    } else {
      await guardarMaterial(uidActual, falta.nombre);
    }
  } catch {
    // Se queda en la lista: no se pinta como conseguido algo que no se guardó.
    boton.disabled = false;
    errorEnMaterial("No se ha podido guardar. Comprueba tu conexión.");
    return;
  }

  await refrescarMaterial();
}

function filaDeMaterial(pieza) {
  if (materialEditando === pieza.id) return filaDeMaterialEnEdicion(pieza);

  const fila = document.createElement("div");
  fila.className = "ingrediente";
  fila.classList.toggle("sin-existencias", !pieza.tengo);

  const casilla = document.createElement("input");
  casilla.type = "checkbox";
  casilla.checked = Boolean(pieza.tengo);
  casilla.id = `material-casilla-${pieza.id}`;
  casilla.addEventListener("change", () => marcarEnElArmario(pieza, casilla));

  // La etiqueta envuelve el nombre para que tocar el texto también marque, como
  // en la despensa: en el móvil, apuntar a una casilla de 20 px es pedirle
  // demasiado al pulgar.
  const etiqueta = document.createElement("label");
  etiqueta.className = "ingrediente-nombre";
  etiqueta.htmlFor = casilla.id;
  etiqueta.textContent = pieza.nombre;

  const acciones = document.createElement("div");
  acciones.className = "ingrediente-acciones";
  acciones.append(
    botonDeIcono("lapiz", "Editar", () => {
      materialEditando = pieza.id;
      limpiarAvisosMaterial();
      pintarMaterial();
    }),
    botonDeIcono("papelera", "Borrar", () => borrarLaPieza(pieza))
  );

  fila.append(casilla, etiqueta, acciones);
  return fila;
}

function filaDeMaterialEnEdicion(pieza) {
  const fila = document.createElement("form");
  fila.className = "ingrediente ingrediente-editando";

  const campo = document.createElement("input");
  campo.type = "text";
  campo.maxLength = MAX_NOMBRE_MATERIAL;
  campo.value = pieza.nombre;

  const guardar = document.createElement("button");
  guardar.type = "submit";
  guardar.textContent = "Guardar";

  const cancelar = botonDeFila("Cancelar", () => {
    materialEditando = null;
    limpiarAvisosMaterial();
    pintarMaterial();
  });
  cancelar.className = "enlace";

  fila.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    await renombrarLaPieza(pieza, campo.value, guardar);
  });

  fila.append(campo, guardar, cancelar);
  // Al final de la cola de pintado: antes de que la fila esté en el documento,
  // focus() no hace nada.
  setTimeout(() => campo.focus(), 0);
  return fila;
}

async function marcarEnElArmario(pieza, casilla) {
  const antes = Boolean(pieza.tengo);
  const ahora = casilla.checked;

  // Optimista, y sin tocar el ORDEN a propósito.
  pieza.tengo = ahora;
  casilla.closest(".ingrediente").classList.toggle("sin-existencias", !ahora);
  limpiarAvisosMaterial();
  actualizarRecuentoMaterial();
  // Solo el bloque de lo que falta, NO pintarMaterial(): repintar el armario
  // aquí movería la fila bajo el dedo, que es justo lo que evita esta función
  // desde la spec 074. Pero marcar "banco" tiene que sacarlo de la lista de lo
  // que te falta en el momento (spec 078).
  pintarMaterialQueFalta();

  try {
    await marcarMaterial(uidActual, pieza.id, ahora);
  } catch {
    // Nunca dejar la casilla enseñando algo que no se guardó.
    pieza.tengo = antes;
    casilla.checked = antes;
    casilla.closest(".ingrediente").classList.toggle("sin-existencias", !antes);
    actualizarRecuentoMaterial();
    pintarMaterialQueFalta();
    errorEnMaterial("No se ha podido guardar. Comprueba tu conexión.");
  }
}

// Los dos avisos son excluyentes, por lo mismo que en la despensa: enseñar
// "Guardado" y "no se ha podido guardar" a la vez no deja saber cuál es verdad.
function limpiarAvisosMaterial() {
  id("error-material").textContent = "";
  id("guardado-material").textContent = "";
}

function errorEnMaterial(texto) {
  id("guardado-material").textContent = "";
  id("error-material").textContent = texto;
}

function avisarEnMaterial(texto) {
  const aviso = id("guardado-material");
  // El error de antes deja de aplicar en cuanto algo sale bien.
  id("error-material").textContent = "";
  aviso.textContent = texto;
  setTimeout(() => {
    aviso.textContent = "";
  }, 3000);
}

// Solo el número: repintar la lista entera aquí la reordenaría, que es justo lo
// que no debe pasar al marcar.
function actualizarRecuentoMaterial() {
  const tengo = materialCargado.filter((pieza) => pieza.tengo).length;
  id("recuento-material").textContent = materialCargado.length
    ? `${tengo} de ${materialCargado.length} cosas en el armario`
    : "";
}

async function renombrarLaPieza(pieza, nombreBruto, boton) {
  limpiarAvisosMaterial();

  const resultado = validarMaterial(nombreBruto);
  if (resultado.error) {
    errorEnMaterial(resultado.error);
    return;
  }

  // Editar hasta chocar con otra RECHAZA, no fusiona: fusionar haría
  // desaparecer una fila que nadie ha pedido borrar, y aquí no hay deshacer.
  // Al añadir sí se fusiona, porque allí no desaparece nada.
  const choque = materialIgual(materialCargado, resultado.nombre, pieza.id);
  if (choque) {
    errorEnMaterial(`"${choque.nombre}" ya está en tu armario.`);
    return;
  }

  boton.disabled = true;
  try {
    await renombrarMaterial(uidActual, pieza.id, resultado.nombre);
  } catch {
    errorEnMaterial("No se ha podido guardar. Comprueba tu conexión.");
    return;
  } finally {
    boton.disabled = false;
  }

  // Fuera del try a propósito: lo que se escribe y lo que se pinta son dos
  // cosas, y meterlas en el mismo catch fue el fallo del estreno de la 058.
  materialEditando = null;
  await refrescarMaterial();
}

async function borrarLaPieza(pieza) {
  if (!confirm(`¿Quitar "${pieza.nombre}" de tu material?`)) return;

  try {
    await borrarMaterial(uidActual, pieza.id);
  } catch {
    errorEnMaterial("No se ha podido borrar. Comprueba tu conexión.");
    return;
  }

  if (materialEditando === pieza.id) materialEditando = null;
  await refrescarMaterial();
}

// Se llama al entrar en la sub-pestaña. Reordena lo ya cargado, sin ir a la red.
function reordenarMaterialCargado() {
  // Con el armario vacío no hay nada que reordenar, pero "lo que te falta" sí
  // tiene algo que decir —de hecho, entonces te falta TODO lo de tu tabla—, así
  // que se pinta igual (spec 078).
  if (!materialCargado.length) {
    pintarMaterialQueFalta();
    return;
  }
  materialCargado = ordenarMaterial(materialCargado);
  pintarMaterial();
}

async function refrescarMaterial() {
  try {
    materialCargado = await listarMaterial(uidActual);
  } catch {
    materialCargado = [];
    id("estado-material").textContent =
      "No se ha podido cargar tu material. Comprueba tu conexión.";
    return;
  }
  pintarMaterial();
}

id("form-material").addEventListener("submit", async (evento) => {
  evento.preventDefault();

  const campo = id("material-nombre");
  limpiarAvisosMaterial();

  const resultado = validarMaterial(campo.value);
  if (resultado.error) {
    errorEnMaterial(resultado.error);
    return;
  }

  const boton = id("btn-anadir-material");
  boton.disabled = true;

  // Solo la escritura va en el try. El repintado se hace después, fuera: si se
  // rompe al pintar, el dato YA está guardado y decir "comprueba tu conexión"
  // sería mentira. Es la lección del estreno de la spec 058.
  let aviso;
  try {
    const repetido = materialIgual(materialCargado, resultado.nombre);

    if (repetido) {
      // Volver a escribirlo no es equivocarse: es decir "esto lo tengo". Por eso
      // el aviso va en el hueco de "Guardado" y no en el de error, y por eso SÍ
      // lo marca — al revés que la despensa desde la 068, donde escribir no
      // dice nada sobre la nevera porque la llenan las recetas. El armario lo
      // escribes tú.
      if (!repetido.tengo) {
        await marcarMaterial(uidActual, repetido.id, true);
      }
      aviso = `"${repetido.nombre}" ya está en tu armario.`;
    } else {
      await guardarMaterial(uidActual, resultado.nombre);
      aviso = "Guardado";
    }
  } catch {
    errorEnMaterial("No se ha podido guardar. Comprueba tu conexión.");
    return;
  } finally {
    boton.disabled = false;
  }

  avisarEnMaterial(aviso);
  campo.value = "";
  await refrescarMaterial();
  // Lo normal al estrenar esto es meter cinco o seis seguidas.
  campo.focus();
});

// --- La dieta de la semana (spec 028) ------------------------------------
//
// La dieta es el plan; las comidas apuntadas son el diario. Que hayas comido
// el lunes lo que ponía el jueves es asunto tuyo: aquí no se marca nada.

let dietaActiva = null;
let celdaEditando = null;

// Qué receta de la semana está desplegada, como "indiceDia-indiceComida" (spec
// 060). Una sola, igual que `recetaAbierta` en el recetario.
let recetaDeDietaAbierta = null;

// Qué nombres de plato están desplegados enteros, como "indiceDia-indiceComida"
// (spec 080). Un Set y no una sola clave: aquí, a diferencia de la receta, no
// hay coste de pantalla en tener varios a la vez.
let platosDesplegados = new Set();

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
  // `fila-plato` la convierte en una REJILLA de cuatro columnas fijas (etiqueta,
  // plato, comido, editar). Antes era flexible, y con un plato largo los iconos
  // salían disparados fuera del recuadro: tres intentos de que el texto se
  // portara bien —recortar, meterlo en un span, partirlo en dos líneas— y en la
  // fila con receta seguía escapándose, porque ahí el plato es un <button> y un
  // button no gobierna su propio ancho mínimo.
  //
  // Con rejilla da igual lo que haga el texto: las columnas de los iconos miden
  // 44 px y no se mueven. El texto se recorta contra su columna o se parte, pero
  // nunca empuja nada.
  fila.className = "comida-dieta fila-plato";

  fila.append(
    celda(etiquetaDeMomento(comida.momento), "resumen-etiqueta"),
    nombreDelPlato(comida, `${indiceDia}-${indiceComida}`)
  );

  // El icono de la receta, en su columna fija (spec 072). Solo si esa comida
  // tiene alguna y sigue existiendo. UNO aunque haya varias (spec 088): abre la
  // fila con todas las tarjetas dentro.
  if (recetasDeLaComida(comida).length > 0) {
    const clave = `${indiceDia}-${indiceComida}`;
    const abierta = recetaDeDietaAbierta === clave;

    const verReceta = botonDeIcono(
      "receta",
      abierta ? "Cerrar la receta" : "Ver la receta",
      () => {
        // Solo una abierta a la vez: con veintiocho comidas en pantalla, varias
        // desplegadas convierten la semana en un scroll sin fondo.
        recetaDeDietaAbierta = abierta ? null : clave;
        pintarDieta();
      }
    );
    verReceta.classList.add("col-receta");
    if (abierta) verReceta.classList.add("receta-abierta");
    verReceta.setAttribute("aria-expanded", String(abierta));
    fila.appendChild(verReceta);
  }

  if (comida.texto) {
    // Iconos y no texto (spec 065): los botones de texto tenían ancho variable
    // -"Me lo he comido" solo sale con texto, y el otro dice "Editar" o "+"-,
    // así que la columna del plato acababa en un sitio distinto en cada fila.
    // Con iconos todos miden lo mismo y las filas se alinean solas.
    const apuntar = botonDeIcono("comido", "Me lo he comido", () =>
      apuntarDeLaDieta(comida, apuntar)
    );
    apuntar.classList.add("boton-comido", "col-comido");
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
  // La columna se fija a mano: una comida vacía no tiene botón de comido, y sin
  // esto el lápiz se subiría a su hueco y dejaría de alinearse con los demás.
  editar.classList.add("col-editar");
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
// El nombre del plato: texto normal, siempre (spec 072).
//
// Entre las specs 060 y 071 esto era un <button> subrayado cuando la comida
// tenía receta. Se veía distinto del resto de la semana y el usuario lo dijo:
// "no me gusta cómo se ve lo que ya tengo la receta". Y de paso arrastró tres
// intentos de arreglar un descuadre, porque un <button> no gobierna su propio
// ancho mínimo.
//
// Ahora todos los platos se ven igual y lo que se toca para abrir la receta es
// un icono aparte, en su columna. Menos listo y mucho más predecible.
//
// Vuelve a ser un <button> desde la spec 080, pero sin el subrayado de
// entonces: el toque despliega el nombre recortado, no abre la receta —eso lo
// sigue haciendo solo el icono aparte— así que no hace falta distinguirlo.
// Un plato vacío ("—") nunca se recorta: no hace falta que sea tocable.
function nombreDelPlato(comida, clave) {
  if (!comida.texto) return celda("—", "plato-nombre");
  return celdaDesplegable(comida.texto, "plato-nombre", clave, platosDesplegados, pintarDieta);
}

// Las recetas enlazadas a una comida de la semana, las que sigan existiendo.
//
// Devuelve una LISTA desde la spec 088: una comida puede llevar varias. Se
// saltan los enlaces a recetas ya borradas desde el recetario —el enlace se
// guarda en la dieta y nadie lo limpia al borrar—, porque si no el nombre
// saldría tocable y al tocarlo no se abriría nada.
function recetasDeLaComida(comida) {
  if (!comida.texto) return [];
  return idsDeRecetaDe(comida)
    .map((id) => recetasCargadas.find((receta) => receta.id === id))
    .filter(Boolean);
}

// Las recetas abiertas bajo su fila, una tarjeta por receta (spec 088). Solo se
// leen: para cambiarlas está el recetario, al que lleva cada botón Editar.
function recetaDesplegada(comida) {
  const caja = document.createElement("div");
  caja.className = "receta-en-dieta";

  const recetas = recetasDeLaComida(comida);

  // No debería pasar —el nombre solo se vuelve tocable si queda alguna viva—,
  // pero si se borran con la dieta abierta en otra pestaña, mejor decirlo que
  // enseñar un hueco. La frase sale solo cuando NO queda ninguna.
  if (recetas.length === 0) {
    caja.appendChild(celda("Esta receta ya no existe.", "explicacion"));
    return caja;
  }

  recetas.forEach((receta) => caja.appendChild(tarjetaDeRecetaEnDieta(receta)));

  return caja;
}

function tarjetaDeRecetaEnDieta(receta) {
  const tarjeta = document.createElement("div");
  tarjeta.className = "receta-en-dieta-plato";

  const cabecera = document.createElement("p");
  cabecera.className = "receta-en-dieta-cabecera";
  cabecera.textContent = `${receta.nombre} · para ${receta.raciones}`;
  tarjeta.appendChild(cabecera);

  tarjeta.appendChild(cuerpoDeReceta(receta));

  const acciones = document.createElement("div");
  acciones.className = "receta-acciones";
  acciones.appendChild(botonDeFila("Editar", () => editarRecetaDesdeElDia(receta)));
  tarjeta.appendChild(acciones);

  return tarjeta;
}

function filaEnEdicion(indiceDia, indiceComida, comida) {
  const fila = document.createElement("div");
  fila.className = "comida-dieta fila-edicion";

  const texto = campoTexto(comida.texto, "edicion-texto");

  // Las recetas enlazadas mientras dura la edición. Viven aquí y no en la dieta
  // hasta que se guarda, para que Cancelar deje las cosas como estaban.
  let enlazadas = idsDeRecetaDe(comida);

  const chips = document.createElement("div");
  chips.className = "chips-receta";

  // El desplegable SUMA, no sustituye (spec 088): elegir una receta engancha su
  // nombre al final del texto y la añade a la lista. Antes reemplazaba el texto
  // entero, y por eso una comida solo podía llevar una.
  const recetas = campoDesplegable([], "", "edicion-momento");

  function pintarOpciones() {
    recetas.innerHTML = "";
    // Las ya enlazadas no se ofrecen: enlazar dos veces la misma no dice nada.
    [
      { valor: "", etiqueta: "añadir una receta tuya…" },
      ...recetasCargadas
        .filter((receta) => !enlazadas.includes(receta.id))
        .map((receta) => ({ valor: receta.id, etiqueta: receta.nombre }))
    ].forEach((opcion) => {
      const elemento = document.createElement("option");
      elemento.value = opcion.valor;
      elemento.textContent = opcion.etiqueta;
      recetas.appendChild(elemento);
    });
    recetas.value = "";
  }

  function pintarChips() {
    chips.innerHTML = "";
    enlazadas.forEach((id) => {
      const receta = recetasCargadas.find((otra) => otra.id === id);
      const chip = document.createElement("span");
      chip.className = "chip-receta";
      // Una receta borrada del recetario sigue enlazada hasta que la sueltes:
      // se dice, en vez de enseñar un chip en blanco.
      chip.append(celda(receta ? receta.nombre : "(receta borrada)", "chip-nombre"));

      const quitar = document.createElement("button");
      quitar.type = "button";
      quitar.className = "chip-quitar";
      quitar.setAttribute("aria-label", `Soltar ${receta ? receta.nombre : "esta receta"}`);
      quitar.textContent = "×";
      quitar.addEventListener("click", () => {
        // Se suelta el enlace y NO se toca el texto: lo escrito es del usuario,
        // y borrarle media frase por soltar un enlace es peor que dejarle una
        // línea de más que puede editar a mano.
        enlazadas = enlazadas.filter((otro) => otro !== id);
        pintarChips();
        pintarOpciones();
      });
      chip.appendChild(quitar);
      chips.appendChild(chip);
    });
  }

  recetas.addEventListener("change", () => {
    const receta = recetasCargadas.find((otra) => otra.id === recetas.value);
    if (!receta) return;

    enlazadas = [...enlazadas, receta.id];
    // Los platos de la nutricionista vienen escritos así, con punto: "Ensalada
    // de repollo y manzana. Tortilla de 2 huevos".
    texto.value = texto.value.trim()
      ? `${texto.value.trim()}. ${receta.nombre}`
      : receta.nombre;

    pintarChips();
    pintarOpciones();
  });

  pintarOpciones();
  pintarChips();

  fila.append(
    celda(etiquetaDeMomento(comida.momento), "resumen-etiqueta"),
    texto,
    recetas,
    botonDeFila("Guardar", () =>
      guardarCelda(indiceDia, indiceComida, texto.value, enlazadas)
    ),
    botonDeFila("Cancelar", () => {
      celdaEditando = null;
      pintarDieta();
    }),
    chips
  );

  return fila;
}

async function guardarCelda(indiceDia, indiceComida, texto, recetaIds) {
  const error = id("error-semana");
  error.textContent = "";

  // Se copia la semana entera y se cambia la celda: así, si falla el guardado,
  // lo que hay en pantalla sigue siendo lo que hay en la base de datos.
  const dias = dietaActiva.dias.map((dia, i) => ({
    ...dia,
    comidas: dia.comidas.map((comida, j) =>
      i === indiceDia && j === indiceComida
        // `recetaId` se pone a "" a propósito: la comida pasa a la forma nueva
        // (spec 088) y no se quedan dos verdades en el documento. Es la
        // migración, y pasa sola al guardar cualquier celda.
        ? { ...comida, texto: texto.trim(), recetaIds: recetaIds || [], recetaId: "" }
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

// --- Elegir un menú en vez de pedírselo a la IA (spec 076) ---------------
//
// Los menús viven en js/datos-iniciales.js, ya con sus siete días montados: la
// spec 075 los dejó así para que aquí no hubiera que convertir nada.
//
// Ni cupo, ni proxy, ni prompt. Elegir un menú es una escritura en Firestore.

function rellenarMenus() {
  const select = id("menu-elegido");
  if (select.options.length) return;

  const vacia = document.createElement("option");
  vacia.value = "";
  vacia.textContent = "Elige un menú…";
  select.appendChild(vacia);

  MENUS.forEach((menu) => {
    const opcion = document.createElement("option");
    opcion.value = String(menu.numero);
    opcion.textContent = menu.nombre;
    select.appendChild(opcion);
  });
}

id("menu-elegido").addEventListener("change", (evento) => {
  // El botón no se enciende hasta elegir: un desplegable es demasiado fácil de
  // tocar sin querer como para que pise una dieta de un solo gesto.
  id("btn-usar-menu").disabled = !evento.target.value;
});

id("btn-usar-menu").addEventListener("click", async () => {
  const numero = Number(id("menu-elegido").value);
  const menu = MENUS.find((m) => m.numero === numero);
  if (!menu) return;

  if (
    dietaActiva &&
    !confirm(`Esto sustituye tu dieta de la semana por el ${menu.nombre}. ¿Seguir?`)
  ) {
    return;
  }

  const error = id("error-semana");
  const boton = id("btn-usar-menu");
  error.textContent = "";
  boton.disabled = true;

  try {
    // Primero la nueva y luego se borra la vieja, como en los otros dos
    // caminos: al revés queda un instante sin ninguna dieta.
    const anterior = dietaActiva;
    await guardarDieta(
      uidActual,
      semanaDesdeMenu(menu.dias, recetasCargadas),
      menu.nombre
    );
    if (anterior) await borrarDieta(uidActual, anterior.id);
    await refrescarDieta();
    avisarGuardado("guardado-dieta");
  } catch {
    error.textContent = "No se ha podido poner el menú. Comprueba tu conexión.";
  } finally {
    boton.disabled = false;
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

  // Los ingredientes de lo que acaba de crearse, a la despensa (spec 068). Va
  // aquí y no dentro de guardarRecetasPropuestas() para no meterle la despensa
  // a js/dietas.js, que no tiene por qué saber que existe.
  await llenarDespensaDesde(respuesta.recetas || []);

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
      ({ fecha, momento, texto, acompanamientos }) => ({
        fecha,
        momento,
        texto,
        acompanamientos: acompanamientos || []
      })
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
  // El desplegable de menús (spec 076) se llena una sola vez: los menús son
  // estáticos, vienen del módulo y no dependen de la cuenta.
  rellenarMenus();

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
  // Otra dieta, otras recetas, otra lista de la compra.
  pintarCompra();
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

// Qué nombres de ejercicio están desplegados enteros dentro de su cabecera,
// por id (spec 081). Hermano de `nombresRecetaDesplegados` en el Recetario.
let nombresEjercicioDesplegados = new Set();

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

  const cabecera = cabeceraDesplegable(() => {
    // Tocar la tarjeta la abre; volver a tocarla la cierra.
    ejercicioAbierto = ejercicioAbierto === ejercicio.id ? null : ejercicio.id;
    pintarCatalogo();
  });
  cabecera.className = "receta-cabecera";
  cabecera.setAttribute("aria-expanded", String(ejercicioAbierto === ejercicio.id));
  // El material, cruzado con tu armario (spec 077). En la cabecera solo cabe
  // el resumen, que es una línea; la lista pieza a pieza va en el cuerpo.
  const cruce = cruzarConElArmario(ejercicio.material, materialCargado);

  cabecera.append(
    celdaDesplegable(ejercicio.nombre, "receta-nombre", ejercicio.id, nombresEjercicioDesplegados, pintarCatalogo),
    celda(
      cruce.total === 0 ? "Sin material" : `Tienes ${cruce.tengo} de ${cruce.total}`,
      "registro-detalle"
    )
  );
  tarjeta.appendChild(cabecera);

  if (ejercicioAbierto !== ejercicio.id) return tarjeta;

  // "Tienes 0 de 0" no dice nada, así que sin piezas no hay bloque: la cabecera
  // ya ha dicho "Sin material".
  if (cruce.total > 0) {
    const bloque = document.createElement("div");
    bloque.className = "material-del-ejercicio";

    const titulo = document.createElement("p");
    titulo.className = "registro-detalle";
    titulo.textContent = `Material · Tienes ${cruce.tengo} de ${cruce.total}`;
    bloque.appendChild(titulo);

    const lista = document.createElement("ul");
    lista.className = "material-piezas";
    cruce.piezas.forEach((pieza) => {
      const fila = document.createElement("li");
      // Una pieza apuntada pero DESMARCADA cuenta como que te falta: tenerla
      // escrita no es tenerla.
      fila.className = pieza.tengo ? "pieza-tengo" : "pieza-falta";
      fila.textContent = `${pieza.tengo ? "✅" : "⬜"} ${pieza.nombre}`;
      lista.appendChild(fila);
    });
    bloque.appendChild(lista);
    tarjeta.appendChild(bloque);
  }

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

// Qué títulos de sesión están desplegados enteros, por índice de día (spec
// 080). Hermano de `platosDesplegados` en la dieta.
let sesionesDesplegadas = new Set();

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
    celdaDesplegable(sesion.titulo, "registro-texto", indiceDia, sesionesDesplegadas, pintarTabla),
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
// `aprovechar` llega solo desde el formulario de "Pedir" (spec 077), igual que
// en generarDieta(): la propuesta de una revisión y el comité de bienvenida
// generan tabla sin pasar por ahí, no tienen casilla que leer, y por eso el
// parámetro es opcional. En esos caminos no se le menciona el material a la IA.
async function generarTabla(instrucciones, aprovechar = false) {
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
    proveedor: ajustes.proveedorIa || "automatico",
    // Se lee AQUÍ y no al pintar la casilla, por lo mismo que la despensa: el
    // número de al lado puede ir retrasado si has ido a Mi material y has
    // vuelto, pero lo que se manda es siempre lo que hay marcado ahora.
    material: aprovechar ? loQueTengoDelArmario(materialCargado) : []
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

// --- Acompañamientos de una comida (spec 063) ----------------------------
//
// Lo que va CON la comida: "3 trozos de pan", "un biscote". Dentro de la comida
// y no como registro aparte, que es el motivo entero de la spec.
//
// Se guardan aquí mientras se rellena el formulario, porque la comida todavía no
// existe: solo viajan a Firestore al guardar.
let acompanamientosNuevos = [];

// Pinta una lista de acompañamientos como chips. `alQuitar` la hace editable;
// sin ella son solo etiquetas, que es lo que hace falta al enseñarlos.
function pintarChipsDeAcompanamiento(contenedor, lista, alQuitar) {
  contenedor.innerHTML = "";

  lista.forEach((texto, indice) => {
    const chip = botonDeFila(`${texto} ✕`, () => alQuitar(indice));
    chip.className = "chip chip-quitable";
    chip.setAttribute("aria-label", `Quitar ${texto}`);
    chip.title = `Quitar ${texto}`;
    contenedor.appendChild(chip);
  });
}

function pintarAcompanamientosNuevos() {
  pintarChipsDeAcompanamiento(
    id("acompanamientos-comida"),
    acompanamientosNuevos,
    (indice) => {
      acompanamientosNuevos.splice(indice, 1);
      pintarAcompanamientosNuevos();
    }
  );
  // El campo se apaga al llegar al tope, en vez de dejarte escribir para luego
  // decirte que no.
  id("comida-acompanamiento").disabled =
    acompanamientosNuevos.length >= MAX_ACOMPANAMIENTOS;
}

id("btn-anadir-acompanamiento").addEventListener("click", () => {
  const campo = id("comida-acompanamiento");
  const error = id("error-comida");

  const resultado = validarAcompanamiento(campo.value, acompanamientosNuevos);
  if (resultado.error) {
    error.textContent = resultado.error;
    return;
  }

  error.textContent = "";
  acompanamientosNuevos.push(resultado.texto);
  campo.value = "";
  pintarAcompanamientosNuevos();
  campo.focus();
});

// Enter en el campo añade el chip, no envía la comida entera: dentro de un
// <form>, un input suelto dispara el submit y guardaría la comida a medias.
id("comida-acompanamiento").addEventListener("keydown", (evento) => {
  if (evento.key !== "Enter") return;
  evento.preventDefault();
  id("btn-anadir-acompanamiento").click();
});

// El editor de acompañamientos de una fila en edición (spec 063). Devuelve la
// caja para meterla entre los campos, y el propio campo de texto para que quien
// valide pueda descartar lo que quedó escrito sin confirmar.
//
// Muta la lista que recibe: es la misma que se le pasará a validarComida(), así
// que quitar o añadir un chip ya queda reflejado sin pasar nada más.
function editorDeAcompanamientos(lista) {
  const caja = document.createElement("div");
  caja.className = "edicion-acompanamientos";

  const campo = document.createElement("input");
  campo.type = "text";
  campo.maxLength = 60;
  campo.placeholder = "3 trozos de pan";
  campo.className = "edicion-texto";

  const chips = document.createElement("div");
  chips.className = "chips";

  const repintar = () => {
    pintarChipsDeAcompanamiento(chips, lista, (indice) => {
      lista.splice(indice, 1);
      repintar();
    });
    campo.disabled = lista.length >= MAX_ACOMPANAMIENTOS;
  };

  const anadir = botonDeFila("Añadir", () => {
    const resultado = validarAcompanamiento(campo.value, lista);
    // El error se enseña en el propio campo y no en el hueco de error de la
    // lista: aquí hay una fila en edición y el error de arriba hablaría de otra
    // cosa.
    campo.setCustomValidity(resultado.error || "");
    campo.reportValidity();
    if (resultado.error) return;

    lista.push(resultado.texto);
    campo.value = "";
    repintar();
    campo.focus();
  });
  anadir.className = "enlace";

  campo.addEventListener("input", () => campo.setCustomValidity(""));
  campo.addEventListener("keydown", (evento) => {
    if (evento.key !== "Enter") return;
    evento.preventDefault();
    anadir.click();
  });

  const fila = document.createElement("div");
  fila.className = "fila-alta";
  fila.append(campo, anadir);

  caja.append(fila, chips);
  repintar();
  return { caja, campo };
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
  fila: (comida) => {
    const conQue = acompanamientosDe(comida);
    return {
      que: comida.texto,
      // Los acompañamientos van en la MISMA segunda línea que la hora y el
      // momento, con un "+" delante: son parte de esa comida, no otra entrada.
      detalles: [
        formatearFechaConHora(comida.fecha, comida.hora),
        etiquetaDeMomento(comida.momento),
        conQue.length ? `+ ${conQue.join(", ")}` : ""
      ]
    };
  },
  campos: (comida) => {
    const fecha = campoFecha(comida.fecha);
    const hora = campoHoraEdicion(comida.hora);
    const momento = campoDesplegable(MOMENTOS, comida.momento, "edicion-momento");
    const texto = campoArea(comida.texto, "edicion-texto");

    // Copia: si se cancela la edición, la comida original no debe haber
    // cambiado. `acompanamientosDe` ya devuelve un array nuevo.
    const conQue = acompanamientosDe(comida);
    const { caja, campo } = editorDeAcompanamientos(conQue);

    return {
      elementos: [fecha, hora, momento, texto, caja],
      validar: () => {
        // Lo que quedó escrito sin confirmar se descarta, igual que en el alta:
        // si no es un chip, no es un acompañamiento.
        campo.value = "";
        return validarComida(
          texto.value,
          momento.value,
          fecha.value,
          hora.value,
          conQue
        );
      }
    };
  },
  actualizar: (uid, comidaId, valores) =>
    actualizarComida(
      uid,
      comidaId,
      valores.texto,
      valores.momento,
      valores.fecha,
      valores.hora,
      valores.acompanamientos
    )
});

// Fecha y hora plegadas (spec 037): casi siempre es "ahora", así que no
// hace falta verlas para guardar. Una vez desplegadas no hace falta volver
// a plegarlas para guardar: solo se replegán al guardar con éxito.
id("btn-fecha-hora-comida").addEventListener("click", () => {
  id("campos-fecha-hora-comida").classList.remove("oculta");
  id("btn-fecha-hora-comida").classList.add("oculta");
});

// --- Apuntar con un ingrediente suelto de la despensa (spec 084) ---------
//
// "Escribir" es el modo de siempre; "Elegir de mi despensa" enlaza la
// comida a un ingrediente real, sin tener que montar una receta de uno
// solo. No es una sub-pestaña ni un panel del Recetario: es un interruptor
// propio de este formulario, con el mismo aspecto (reutiliza
// `.panel-recetario-boton`, spec 085).
let modoComida = "escribir";

function ingredientesMarcados() {
  return despensaCargada.filter((ingrediente) => ingrediente.tengo);
}

// Repinta el interruptor y el panel activo. Se llama al cargar, al cambiar
// de modo, y cada vez que la despensa se refresca (un ingrediente puede
// dejar de estar marcado, o dejar de haber ninguno, sin recargar la
// página).
function actualizarModoComida() {
  const marcados = ingredientesMarcados();
  const botonDespensa = id("btn-modo-comida-despensa");

  // Sin ningún ingrediente marcado, el modo se deshabilita y se fuerza
  // "Escribir": nunca hay un modo activo en el que no se pueda guardar.
  botonDespensa.disabled = marcados.length === 0;
  botonDespensa.title = marcados.length
    ? ""
    : "No tienes ningún ingrediente marcado en tu despensa.";
  if (marcados.length === 0) modoComida = "escribir";

  document.querySelectorAll("[data-modo-comida]").forEach((boton) => {
    const puesta = boton.dataset.modoComida === modoComida;
    boton.classList.toggle("activa", puesta);
    if (puesta) {
      boton.setAttribute("aria-current", "true");
    } else {
      boton.removeAttribute("aria-current");
    }
  });

  id("panel-comida-escribir").classList.toggle("oculta", modoComida !== "escribir");
  id("panel-comida-despensa").classList.toggle("oculta", modoComida !== "despensa");

  if (modoComida === "despensa") {
    const select = id("comida-ingrediente");
    select.innerHTML = "";
    ordenarDespensa(marcados).forEach((ingrediente) => {
      const opcion = document.createElement("option");
      opcion.value = ingrediente.id;
      opcion.textContent = ingrediente.nombre;
      select.appendChild(opcion);
    });
  }
}

document.querySelectorAll("[data-modo-comida]").forEach((boton) => {
  boton.addEventListener("click", () => {
    if (boton.disabled) return;
    modoComida = boton.dataset.modoComida;
    actualizarModoComida();
  });
});

// Estado inicial: despensaCargada aún puede estar vacía (nadie ha entrado
// todavía), así que esto se repite al refrescar la despensa. Sin esta
// llamada, el botón se vería habilitado un instante antes de la primera
// carga.
actualizarModoComida();

id("form-comida").addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const error = id("error-comida");
  error.textContent = "";

  // En modo "Elegir de mi despensa", el texto se construye aquí
  // ("Ingrediente (cantidad)", o solo el nombre sin cantidad) y se manda
  // además el id del ingrediente elegido (spec 084). En "Escribir" es
  // exactamente lo de siempre.
  let textoBruto = id("comida-texto").value;
  let ingredienteId = "";
  if (modoComida === "despensa") {
    const select = id("comida-ingrediente");
    const nombre = select.options[select.selectedIndex]?.textContent || "";
    const cantidad = id("comida-cantidad").value.trim();
    textoBruto = cantidad ? `${nombre} (${cantidad})` : nombre;
    ingredienteId = select.value;
  }

  const resultado = validarComida(
    textoBruto,
    id("comida-momento").value,
    id("comida-fecha").value,
    id("comida-hora").value,
    acompanamientosNuevos,
    ingredienteId
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
      resultado.hora,
      resultado.acompanamientos,
      resultado.ingredienteId
    );
    avisarGuardado("guardado-comida");
    id("comida-texto").value = "";
    id("comida-cantidad").value = "";
    // Vuelve a "Escribir" tras guardar: elegir un ingrediente es la
    // excepción, no lo que se espera la próxima vez que se abre el
    // formulario (spec 084).
    modoComida = "escribir";
    actualizarModoComida();
    // El campo de acompañamiento se vacía con la comida: son de esa comida, no
    // de la siguiente.
    acompanamientosNuevos = [];
    id("comida-acompanamiento").value = "";
    pintarAcompanamientosNuevos();
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
      // La distancia solo si la hay (spec 086): un ejercicio sin ella se ve
      // exactamente como antes. filter(Boolean) quita el hueco.
      ejercicio.distanciaKm != null
        ? `${String(ejercicio.distanciaKm).replace(".", ",")} km`
        : "",
      etiquetaDeIntensidad(ejercicio.intensidad)
    ].filter(Boolean)
  }),
  campos: (ejercicio) => {
    const fecha = campoFecha(ejercicio.fecha);
    const hora = campoHoraEdicion(ejercicio.hora);
    const texto = campoTexto(ejercicio.texto, "edicion-texto");
    const minutos = campoTexto(String(ejercicio.minutos), "edicion-minutos", "numeric");
    // Vacío si no la tenía. Vaciarlo a mano BORRA la distancia (spec 086).
    const distancia = campoTexto(
      ejercicio.distanciaKm == null ? "" : String(ejercicio.distanciaKm).replace(".", ","),
      "edicion-distancia",
      "decimal"
    );
    const intensidad = campoDesplegable(
      INTENSIDADES,
      ejercicio.intensidad,
      "edicion-intensidad"
    );
    return {
      elementos: [fecha, hora, texto, minutos, distancia, intensidad],
      validar: () =>
        validarEjercicio(
          texto.value,
          minutos.value,
          intensidad.value,
          fecha.value,
          hora.value,
          distancia.value
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
      valores.hora,
      valores.distanciaKm
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
    id("ejercicio-hora").value,
    id("ejercicio-distancia").value
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
      resultado.hora,
      resultado.distanciaKm
    );
    avisarGuardado("guardado-ejercicio");
    id("ejercicio-texto").value = "";
    id("ejercicio-minutos").value = "";
    id("ejercicio-distancia").value = "";
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

// La casilla "aprovechar el material que tengo" (spec 077). Gemela de la de
// arriba, con UNA diferencia deliberada: con el armario sin nada marcado, la de
// la dieta esconde el bloque y esta lo deja visible y DESACTIVADO.
//
// No es un descuido. La despensa se llena sola desde las recetas, así que quien
// pide dieta ya la tiene delante; el armario se escribe a mano y hay que
// descubrirlo. Una casilla gris que dice dónde llenarlo lo enseña; esconderla
// haría que no se descubriera nunca. Decisión del usuario del 1 de septiembre,
// misma forma que el botón "Elegir de mi despensa" de la spec 084.
function pintarAprovecharMaterial() {
  const casilla = id("tabla-aprovechar");
  const cuantos = loQueTengoDelArmario(materialCargado).length;

  casilla.disabled = cuantos === 0;
  casilla.checked = false;

  id("aprovechar-material-cuantos").textContent =
    cuantos === 0
      ? "No tienes material marcado. Márcalo en Mi material."
      : cuantos === 1
        ? "1 cosa marcada"
        : `${cuantos} cosas marcadas`;
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
      if (tipo === "ejercicio") pintarAprovecharMaterial();

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
        await generarTabla(
          id(`instrucciones-${tipo}`).value,
          id("tabla-aprovechar").checked
        );
      }
      id(`instrucciones-${tipo}`).value = "";
      // La casilla NO se recuerda entre peticiones, al revés que las
      // instrucciones (spec 040): un texto cuesta reescribirlo, una casilla es
      // un clic. Recordarla haría que un día te saliera una dieta condicionada
      // por tu despensa sin que supieras por qué.
      if (tipo === "dieta") id("dieta-aprovechar").checked = false;
      if (tipo === "ejercicio") id("tabla-aprovechar").checked = false;
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
  // Solo la llaman tres acciones disruptivas de Ajustes/Consulta (finalizar
  // operación, reintentar archivado, borrar datos) y el login: las tres
  // cambian de raíz lo que hay que ver en Mi dieta, así que un "volver a
  // donde estabas editando" ya no tiene sentido (spec 083).
  volverAMiDietaTrasEditar = false;

  return Promise.all([
    listaPeso.refrescar(),
    listaComidas.refrescar(),
    listaEjercicios.refrescar(),
    listaBebidas.refrescar(),
    refrescarConsulta(),
    refrescarFotos(),
    refrescarRecetas(),
    refrescarDespensa(),
    refrescarCompra(),
    refrescarMaterial(),
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

    // Qué comidas/ejercicios de este archivo están desplegados enteros, por
    // `registro.id` (spec 080). Propio de esta apertura del histórico: no
    // hace falta que sobreviva a cerrar y volver a abrir.
    const desplegadosArchivo = new Set();

    ["pesajes", "comidas", "ejercicios"].forEach((nombre) => {
      const registros = [...(porNombre[nombre] || [])].sort(
        compararPorFechaYCreacion
      );
      if (!registros.length) return;

      titular(NOMBRES[nombre]);

      const lista = document.createElement("ul");
      lista.className = "lista-archivo";

      // Repinta solo esta lista, no el archivo entero: no hace falta volver a
      // leer Firestore para desplegar un texto.
      const pintarFilas = () => {
        lista.innerHTML = "";
        registros.forEach((registro) => {
          const fila = document.createElement("li");
          const detalle =
            nombre === "pesajes"
              ? kg(registro.pesoKg)
              : nombre === "comidas"
                ? registro.texto
                : `${registro.texto} · ${registro.minutos} min`;
          // El peso es un número corto que nunca se recorta: no hace falta
          // que sea tocable.
          const celdaTexto =
            nombre === "pesajes"
              ? celda(detalle, "registro-texto")
              : celdaDesplegable(
                  detalle,
                  "registro-texto",
                  registro.id,
                  desplegadosArchivo,
                  pintarFilas
                );
          fila.append(
            celda(formatearFechaConHora(registro.fecha, registro.hora), "pesaje-fecha"),
            celdaTexto
          );
          lista.appendChild(fila);
        });
      };
      pintarFilas();

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

  // "Todo", arriba y separada. Marcar catorce casillas a mano para vaciar la
  // cuenta era el camino largo para lo que más se hace aquí. NO borra nada por
  // su cuenta: solo marca las demás, así que sigue haciendo falta escribir la
  // palabra y pulsar el botón.
  const todo = document.createElement("label");
  todo.className = "casilla-reinicio casilla-todo";

  const casillaTodo = document.createElement("input");
  casillaTodo.type = "checkbox";
  casillaTodo.id = "casilla-todo";
  casillaTodo.addEventListener("change", () => {
    TIPOS.forEach((tipo) => {
      id(`casilla-${tipo.clave}`).checked = casillaTodo.checked;
    });
    reiniciarConfirmacion();
  });

  const textoTodo = document.createElement("span");
  textoTodo.textContent = "Todo";

  todo.append(casillaTodo, textoTodo);
  contenedor.appendChild(todo);

  TIPOS.forEach((tipo) => {
    const etiqueta = document.createElement("label");
    etiqueta.className = "casilla-reinicio";

    const casilla = document.createElement("input");
    casilla.type = "checkbox";
    casilla.id = `casilla-${tipo.clave}`;
    casilla.addEventListener("change", () => {
      // Si destildas una suelta, "Todo" deja de ser verdad y se destilda sola.
      id("casilla-todo").checked = TIPOS.every(
        (otro) => id(`casilla-${otro.clave}`).checked
      );
      reiniciarConfirmacion();
    });

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
    // Borrar las recetas o la despensa quita la marca de la siembra (spec 075),
    // así que lo que la app trae puesto VUELVE al siguiente arranque. Es lo que
    // pidió el usuario el 30 de agosto, y revierte lo que decía aquella spec:
    // vaciar la cuenta es dejarla como recién estrenada, y una cuenta recién
    // estrenada trae sus recetas y sus ingredientes.
    //
    // Solo esas dos casillas: borrar los pesajes no tiene por qué resucitar un
    // recetario que nadie ha tocado.
    if (seleccion.includes("recetas") || seleccion.includes("despensa")) {
      await olvidarLaSiembra(uidActual);
      if (ajustesActuales) delete ajustesActuales.datosInicialesVersion;
    }
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
    // Con la marca quitada, esto vuelve a dejar puestas las recetas y los
    // ingredientes sin que haya que recargar la página.
    await sembrarSiHaceFalta();
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

// Las recetas y los ingredientes que la app trae puestos (spec 075). Ocurre una
// vez por cuenta: la marca es `datosInicialesVersion` en los ajustes.
//
// NUNCA puede tumbar el arranque. Si falla, se avisa por consola y la app sigue:
// esto es un extra, no el diario del usuario. Es la misma regla que
// llenarDespensaDesde() de la spec 068, y por el mismo motivo.
//
// Como la marca se guarda al final, un fallo a medias la deja sin poner y el
// siguiente arranque lo reintenta. Lo que ya entró no se duplica, porque se
// vuelve a comparar contra lo que hay.
async function sembrarSiHaceFalta() {
  // `ajustesActuales` lo deja puesto refrescarAjustes(), a la que se ha
  // esperado antes de llamar aquí. Si aun así no está, es que su lectura falló:
  // no se siembra, y se reintenta al siguiente arranque.
  if (!ajustesActuales || !hayQueSembrar(ajustesActuales)) return;

  try {
    const metidos = await sembrar(uidActual, recetasCargadas, despensaCargada);
    if (metidos.recetas || metidos.ingredientes) {
      // Lo sembrado no se ve hasta repintar: las listas en memoria son de antes.
      await Promise.all([refrescarRecetas(), refrescarDespensa()]);
    }
    ajustesActuales.datosInicialesVersion = VERSION_DATOS_INICIALES;
    console.info(
      `Datos iniciales: ${metidos.recetas} recetas y ${metidos.ingredientes} ingredientes.`
    );
  } catch (fallo) {
    console.error("No se han podido sembrar los datos iniciales:", fallo);
  }
}


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
  acompanamientosNuevos = [];
  pintarAcompanamientosNuevos();
  modoComida = "escribir";
  actualizarModoComida();
  [
    "peso",
    "comida-texto",
    "comida-cantidad",
    "comida-acompanamiento",
    "ejercicio-texto",
    "ejercicio-minutos",
    "bebida-texto"
  ].forEach((campo) => {
    id(campo).value = "";
  });
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
    // El bloque de normalizar solo se pinta para una cuenta (spec 089), y el
    // email no se sabe hasta aqui.
    pintarZonaDeNormalizar();
    // Con await: refrescarTodo() pinta la pestaña Consulta, que necesita saber
    // si hay operación activa. Sin esperar aquí, se pintaba con el valor de
    // antes de leerlo.
    // La siembra (spec 075) necesita las DOS cosas: los ajustes, que traen la
    // marca de si ya se sembró, y las listas cargadas, contra las que compara
    // para no duplicar. Por eso espera a las dos ramas en vez de colgarse de
    // una: colgada solo de refrescarTodo() se encontraba los ajustes a medio
    // leer y no sembraba hasta el segundo arranque.
    Promise.all([
      refrescarOperaciones().then(refrescarTodo),
      refrescarAjustes()
    ]).then(sembrarSiHaceFalta);
    refrescarRecuentos();
  },
  () => {
    uidActual = null;
    mostrar("login");
    errorLogin.textContent = mensajeDeError(ERROR_NO_AUTORIZADO);
  }
);

// --- Normalizar las recetas (spec 089) -----------------------------------
//
// Pasa los ingredientes de las recetas sembradas de texto a piezas enlazadas
// con la despensa, y les pone sus alias. Las 73 recetas llegaron en el formato
// viejo porque son anteriores a la spec 082.
//
// Se pinta SOLO para una cuenta: se prueba ahí y, si va bien, se abre a las
// demás quitando esta constante. No es una medida de seguridad —las reglas de
// Firestore ya impiden escribir en los datos de otro—: es para no tocar las
// recetas de los demás sin haberlo probado antes.
const CUENTA_QUE_NORMALIZA = "pantonbernal@gmail.com";

function pintarZonaDeNormalizar() {
  id("zona-normalizar").classList.toggle(
    "oculta",
    String(emailActual || "").toLowerCase() !== CUENTA_QUE_NORMALIZA
  );
}

// La misma confirmación por escrito que el reinicio: no borra, pero escribe en
// las 73 recetas de una vez y no se deshace.
id("palabra-normalizar").addEventListener("input", (evento) => {
  id("btn-normalizar").disabled =
    evento.target.value.trim().toUpperCase() !== "NORMALIZAR";
});

id("btn-normalizar").addEventListener("click", async () => {
  const estado = id("estado-normalizar");
  const error = id("error-normalizar");

  error.textContent = "";
  estado.textContent = "Normalizando…";
  id("btn-normalizar").disabled = true;

  try {
    const plan = planDeNormalizacion(
      recetasCargadas,
      despensaCargada,
      aliasDeLosDatos(RECETAS_INICIALES),
      () => nuevoIdDeIngrediente(uidActual)
    );

    if (plan.recetas.length === 0 && plan.ingredientesNuevos.length === 0) {
      // Con otras palabras y no el mismo texto lleno de ceros: así se ve que no
      // ha hecho nada en vez de parecer que ha fallado.
      estado.textContent = "Ya estaba todo normalizado: no ha hecho falta cambiar nada.";
      id("palabra-normalizar").value = "";
      return;
    }

    await escribirNormalizacion(uidActual, plan);
    await refrescarRecetas();
    await refrescarDespensa();

    const { revisadas, normalizadas, lineasEnlazadas, ingredientesCreados } =
      plan.resumen;
    estado.textContent =
      `Listo: ${revisadas} recetas revisadas, ${normalizadas} normalizadas, ` +
      `${lineasEnlazadas} líneas enlazadas y ${ingredientesCreados} ` +
      `ingredientes nuevos en tu despensa.`;
    id("palabra-normalizar").value = "";
  } catch {
    // Lo escrito hasta aquí se queda hecho, y no pasa nada: volver a pulsarlo
    // se salta lo que ya está y termina lo que falte.
    estado.textContent = "";
    error.textContent =
      "No se ha podido terminar. Comprueba tu conexión y vuelve a pulsarlo: " +
      "lo que ya se hizo no se repite.";
  } finally {
    // Vuelve a pedir la palabra: cada pasada se confirma entera.
    id("btn-normalizar").disabled = true;
  }
});
