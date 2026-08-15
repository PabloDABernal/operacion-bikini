// HERRAMIENTA TEMPORAL DE PRUEBAS — no forma parte del producto.
//
// Rellena la app con datos falsos para poder verla como si llevara meses en
// uso: una operación en curso con dos meses de registros, y otra anterior ya
// archivada para que el histórico tenga contenido.
//
// Escribe con las mismas funciones que la app siempre que puede, así que pasa
// por las mismas validaciones y por las mismas reglas de Firestore: solo puede
// tocar los datos del usuario que tenga la sesión abierta.

import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-config.js";
import { observarSesion } from "./auth.js";
import { hoyISO, sumarDias } from "./fechas.js";
import { guardarPesaje } from "./pesajes.js";
import { guardarComida } from "./comidas.js";
import { guardarEjercicio } from "./ejercicios.js";
import { leerAjustes, guardarAjustes } from "./ajustes.js";
import { listarOperaciones, operacionActiva } from "./operaciones.js";

const DIAS = 60;

// Generador con semilla: la misma semilla da los mismos datos, así que lo que
// veas se puede reproducir.
function generador(semilla) {
  let estado = semilla;
  return () => {
    estado |= 0;
    estado = (estado + 0x6d2b79f5) | 0;
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DESAYUNOS = [
  "café con leche y tostada con aceite",
  "café con leche y tostada con aceite",
  "café con leche y tostada con aceite",
  "café con leche y dos galletas",
  "yogur con avena y plátano"
];

const COMIDAS = [
  "lentejas con verduras",
  "ensalada y pollo a la plancha",
  "macarrones con tomate y atún",
  "garbanzos con espinacas",
  "merluza al horno con patata",
  "arroz con verduras y huevo",
  "ensalada y pollo a la plancha"
];

const MERIENDAS = ["yogur y un plátano", "café solo", "un puñado de almendras"];

const CENAS = [
  "tortilla francesa y ensalada",
  "crema de verduras y jamón york",
  "pescado a la plancha con verduras",
  "tortilla francesa y ensalada",
  "revuelto de setas y pan"
];

const PICOTEOS = ["una onza de chocolate negro", "un puñado de almendras"];

const EJERCICIOS = [
  { texto: "paseo con el carro", minutos: 45, intensidad: "suave" },
  { texto: "bici estática", minutos: 30, intensidad: "media" },
  { texto: "pesas en casa", minutos: 35, intensidad: "fuerte" },
  { texto: "correr por el parque", minutos: 25, intensidad: "media" },
  { texto: "paseo con el carro", minutos: 60, intensidad: "suave" }
];

const elegir = (lista, azar) => lista[Math.floor(azar() * lista.length)];

const hora = (azar, desde, hasta) => {
  const h = desde + Math.floor(azar() * (hasta - desde));
  const m = Math.floor(azar() * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

// Devuelve la lista de días a sembrar, sin tocar la red.
function planDeSiembra({ ultimoDia, pesoInicial, pesoFinal, semilla }) {
  const azar = generador(semilla);
  const dias = [];

  for (let i = DIAS - 1; i >= 0; i -= 1) {
    const fecha = sumarDias(ultimoDia, -i);
    const avance = (DIAS - 1 - i) / (DIAS - 1);

    // Tendencia a la baja con ruido diario: el peso real sube y baja aunque
    // vayas bien, y sin eso la media móvil no tendría nada que suavizar.
    const tendencia = pesoInicial + (pesoFinal - pesoInicial) * avance;
    const pesoKg = Math.round((tendencia + (azar() - 0.5) * 0.9) * 10) / 10;

    // Días sin pesarse y algún día en blanco: dos meses perfectos no se
    // parecen a la realidad y el calendario saldría plano.
    const sinPesaje = azar() < 0.12;
    const enBlanco = azar() < 0.06;

    const comidas = [];
    if (!enBlanco) {
      comidas.push({
        texto: elegir(DESAYUNOS, azar),
        momento: "desayuno",
        hora: hora(azar, 7, 10)
      });
      comidas.push({
        texto: elegir(COMIDAS, azar),
        momento: "comida",
        hora: hora(azar, 13, 16)
      });
      if (azar() < 0.55) {
        comidas.push({
          texto: elegir(MERIENDAS, azar),
          momento: "merienda",
          hora: hora(azar, 17, 19)
        });
      }
      comidas.push({
        texto: elegir(CENAS, azar),
        momento: "cena",
        hora: hora(azar, 20, 23)
      });
      if (azar() < 0.25) {
        comidas.push({
          texto: elegir(PICOTEOS, azar),
          momento: "picoteo",
          hora: hora(azar, 16, 23)
        });
      }
    }

    const ejercicios = [];
    if (!enBlanco && azar() < 0.5) {
      ejercicios.push({ ...elegir(EJERCICIOS, azar), hora: hora(azar, 8, 21) });
    }

    dias.push({
      fecha,
      pesaje:
        sinPesaje || enBlanco ? null : { pesoKg, hora: hora(azar, 7, 10) },
      comidas,
      ejercicios
    });
  }

  return dias;
}

// --- Sembrar la operación en curso ---------------------------------------

async function sembrarEnCurso(uid, avisar) {
  const operaciones = await listarOperaciones(uid);
  if (operacionActiva(operaciones)) {
    throw new Error("Ya tienes una operación en curso. Finalízala antes.");
  }

  const ultimoDia = hoyISO();
  const dias = planDeSiembra({
    ultimoDia,
    pesoInicial: 84.2,
    pesoFinal: 81.4,
    semilla: 20260815
  });

  let escritos = 0;
  for (const dia of dias) {
    const tareas = [];
    if (dia.pesaje) {
      tareas.push(guardarPesaje(uid, dia.pesaje.pesoKg, dia.fecha, dia.pesaje.hora));
    }
    dia.comidas.forEach((comida) => {
      tareas.push(guardarComida(uid, comida.texto, comida.momento, dia.fecha, comida.hora));
    });
    dia.ejercicios.forEach((ejercicio) => {
      tareas.push(
        guardarEjercicio(
          uid,
          ejercicio.texto,
          ejercicio.minutos,
          ejercicio.intensidad,
          dia.fecha,
          ejercicio.hora
        )
      );
    });

    await Promise.all(tareas);
    escritos += tareas.length;
    avisar(`${dia.fecha} — ${escritos} registros`);
  }

  // La operación empieza el primer día sembrado, no hoy: si no, el histórico
  // diría que duró un día.
  await addDoc(collection(db, "usuarios", uid, "operaciones"), {
    estado: "activa",
    numero: operaciones.length + 1,
    inicio: dias[0].fecha,
    creadaEn: serverTimestamp()
  });

  // Sin peso objetivo no hay línea en la gráfica ni "para el objetivo" en las
  // estadísticas. Solo se pone si no había ninguno: no se pisa lo tuyo.
  const ajustes = await leerAjustes(uid);
  if (ajustes.pesoObjetivoKg == null) {
    await guardarAjustes(uid, { pesoObjetivoKg: 78 });
  }

  return escritos;
}

// --- Sembrar una operación anterior, ya archivada -------------------------

async function sembrarArchivada(uid, avisar) {
  const operaciones = await listarOperaciones(uid);

  // Termina justo antes de que empiece la más antigua que haya, para que las
  // dos operaciones no se solapen en el tiempo.
  const masAntigua = operaciones.reduce(
    (menor, operacion) =>
      !menor || operacion.inicio < menor ? operacion.inicio : menor,
    null
  );
  const ultimoDia = sumarDias(masAntigua || hoyISO(), -1);

  const dias = planDeSiembra({
    ultimoDia,
    pesoInicial: 88.0,
    pesoFinal: 84.3,
    semilla: 20260601
  });

  const referencia = await addDoc(collection(db, "usuarios", uid, "operaciones"), {
    estado: "archivada",
    numero: 0,
    inicio: dias[0].fecha,
    fin: ultimoDia,
    creadaEn: serverTimestamp(),
    cerradaEn: serverTimestamp()
  });

  const archivo = (nombre) =>
    collection(db, "usuarios", uid, "operaciones", referencia.id, nombre);

  let escritos = 0;
  let pesajes = 0;
  const fechasConAlgo = new Set();

  for (const dia of dias) {
    const tareas = [];

    if (dia.pesaje) {
      tareas.push(
        addDoc(archivo("pesajes"), {
          pesoKg: dia.pesaje.pesoKg,
          fecha: dia.fecha,
          hora: dia.pesaje.hora,
          creadoEn: serverTimestamp()
        })
      );
      pesajes += 1;
    }
    dia.comidas.forEach((comida) => {
      tareas.push(
        addDoc(archivo("comidas"), {
          texto: comida.texto,
          momento: comida.momento,
          fecha: dia.fecha,
          hora: comida.hora,
          creadoEn: serverTimestamp()
        })
      );
    });
    dia.ejercicios.forEach((ejercicio) => {
      tareas.push(
        addDoc(archivo("ejercicios"), {
          texto: ejercicio.texto,
          minutos: ejercicio.minutos,
          intensidad: ejercicio.intensidad,
          fecha: dia.fecha,
          hora: ejercicio.hora,
          creadoEn: serverTimestamp()
        })
      );
    });

    if (tareas.length) fechasConAlgo.add(dia.fecha);

    await Promise.all(tareas);
    escritos += tareas.length;
    avisar(`${dia.fecha} — ${escritos} registros`);
  }

  // Un plan, para que la vista del histórico tenga algo más que listas.
  await addDoc(archivo("planes"), {
    nutricion:
      "Prioriza verdura en comida y cena, proteína en cada ingesta y fruta " +
      "entera en vez de zumo. Reduce el picoteo de la tarde y bebe agua antes " +
      "de cada comida.",
    ejercicio:
      "Lunes: pesas en casa 35 min.\nMartes: paseo 45 min.\nMiércoles: bici 30 min.\n" +
      "Jueves: descanso.\nViernes: pesas 35 min.\nSábado: paseo largo 60 min.\n" +
      "Domingo: descanso.",
    tipo: "entrevista",
    creadoEn: serverTimestamp()
  });

  const conPeso = dias.filter((dia) => dia.pesaje);

  // El número y el resumen se ponen al final, cuando ya se sabe qué hay.
  await setDoc(
    doc(db, "usuarios", uid, "operaciones", referencia.id),
    {
      numero: 1,
      resumen: {
        pesoInicial: conPeso.length ? conPeso[0].pesaje.pesoKg : null,
        pesoFinal: conPeso.length ? conPeso[conPeso.length - 1].pesaje.pesoKg : null,
        diasRegistrados: fechasConAlgo.size,
        registros: escritos
      }
    },
    { merge: true }
  );

  // La operación en curso, si existe, pasa a ser la número 2.
  const activa = operacionActiva(operaciones);
  if (activa) {
    await setDoc(
      doc(db, "usuarios", uid, "operaciones", activa.id),
      { numero: 2 },
      { merge: true }
    );
  }

  return escritos + 1;
}

// --- Página --------------------------------------------------------------

const estado = document.getElementById("estado");
const quien = document.getElementById("quien");
const botones = [...document.querySelectorAll("button[data-accion]")];

let uidActual = null;

function sinSesion() {
  uidActual = null;
  quien.textContent = "(sin sesión)";
  botones.forEach((boton) => {
    boton.disabled = true;
  });
  estado.textContent = "No hay sesión abierta. Entra primero en la app y vuelve aquí.";
}

// observarSesion llama al primer callback con null cuando no hay sesión, y al
// segundo solo si el usuario no está en la lista blanca.
observarSesion((usuario) => {
  if (!usuario) {
    sinSesion();
    return;
  }
  uidActual = usuario.uid;
  quien.textContent = usuario.email;
  botones.forEach((boton) => {
    boton.disabled = false;
  });
  estado.textContent = "";
}, sinSesion);

const ACCIONES = {
  "en-curso": {
    confirmar: "Vas a añadir dos meses de datos y una operación en curso. ¿Seguir?",
    sembrar: sembrarEnCurso
  },
  archivada: {
    confirmar: "Vas a añadir una operación anterior ya archivada. ¿Seguir?",
    sembrar: sembrarArchivada
  }
};

botones.forEach((boton) => {
  boton.addEventListener("click", async () => {
    const accion = ACCIONES[boton.dataset.accion];
    if (!confirm(`${accion.confirmar}\n\nUsuario: ${quien.textContent}`)) return;

    botones.forEach((otro) => {
      otro.disabled = true;
    });

    try {
      const total = await accion.sembrar(uidActual, (texto) => {
        estado.textContent = texto;
      });
      estado.textContent = `Listo: ${total} registros. Vuelve a la app y recarga.`;
    } catch (error) {
      estado.textContent = `Ha fallado: ${error.message}`;
    } finally {
      botones.forEach((otro) => {
        otro.disabled = false;
      });
    }
  });
});
