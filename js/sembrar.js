// HERRAMIENTA TEMPORAL DE PRUEBAS — no forma parte del producto.
//
// Rellena un mes de datos falsos en el usuario que tenga la sesión abierta,
// para poder ver cómo se comportan la gráfica, el comparador, el calendario y
// "lo de siempre" con historial de verdad. Se borra todo desde
// Ajustes → Reiniciar datos.
//
// Escribe con las mismas funciones que la app (guardarPesaje, guardarComida,
// guardarEjercicio), así que pasa por las mismas validaciones y por las mismas
// reglas de Firestore: solo puede tocar sus propios datos.

import { observarSesion } from "./auth.js";
import { hoyISO, sumarDias } from "./fechas.js";
import { guardarPesaje } from "./pesajes.js";
import { guardarComida } from "./comidas.js";
import { guardarEjercicio } from "./ejercicios.js";

const DIAS = 30;
const PESO_INICIAL = 84.2;
const PESO_FINAL = 82.1;

// Generador con semilla: dos siembras con la misma semilla dan los mismos
// datos. Sin esto no habría forma de reproducir lo que se vio.
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

// Los desayunos y las cenas se repiten mucho más que las comidas: es lo que
// hace que "lo de siempre" tenga sentido.
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

// Devuelve la lista de escrituras a hacer, sin tocar la red. Así se puede ver
// qué se va a sembrar antes de sembrarlo.
export function planDeSiembra(hoy, semilla = 20260813) {
  const azar = generador(semilla);
  const dias = [];

  for (let i = DIAS - 1; i >= 0; i -= 1) {
    const fecha = sumarDias(hoy, -i);
    const avance = (DIAS - 1 - i) / (DIAS - 1);

    // Tendencia a la baja con ruido diario: el peso real sube y baja aunque
    // vayas bien, y sin eso la media móvil no tendría nada que suavizar.
    const tendencia = PESO_INICIAL + (PESO_FINAL - PESO_INICIAL) * avance;
    const pesoKg = Math.round((tendencia + (azar() - 0.5) * 0.9) * 10) / 10;

    // Un par de días sin pesarse y alguno sin apuntar nada: un mes perfecto no
    // se parece a la realidad y el calendario saldría plano.
    const sinPesaje = azar() < 0.12;
    const diaEnBlanco = azar() < 0.06;

    const comidas = [];
    if (!diaEnBlanco) {
      comidas.push({ texto: elegir(DESAYUNOS, azar), momento: "desayuno" });
      comidas.push({ texto: elegir(COMIDAS, azar), momento: "comida" });
      if (azar() < 0.55) {
        comidas.push({ texto: elegir(MERIENDAS, azar), momento: "merienda" });
      }
      comidas.push({ texto: elegir(CENAS, azar), momento: "cena" });
      if (azar() < 0.25) {
        comidas.push({ texto: elegir(PICOTEOS, azar), momento: "picoteo" });
      }
    }

    const ejercicios = [];
    if (!diaEnBlanco && azar() < 0.5) {
      ejercicios.push(elegir(EJERCICIOS, azar));
    }

    dias.push({
      fecha,
      pesoKg: sinPesaje || diaEnBlanco ? null : pesoKg,
      comidas,
      ejercicios
    });
  }

  return dias;
}

export async function sembrar(uid, hoy, avisar) {
  const dias = planDeSiembra(hoy);
  let escrituras = 0;

  for (const dia of dias) {
    const tareas = [];

    if (dia.pesoKg !== null) {
      tareas.push(guardarPesaje(uid, dia.pesoKg, dia.fecha));
    }
    dia.comidas.forEach((comida) => {
      tareas.push(guardarComida(uid, comida.texto, comida.momento, dia.fecha));
    });
    dia.ejercicios.forEach((ejercicio) => {
      tareas.push(
        guardarEjercicio(
          uid,
          ejercicio.texto,
          ejercicio.minutos,
          ejercicio.intensidad,
          dia.fecha
        )
      );
    });

    // Día a día, para poder ir informando del avance.
    await Promise.all(tareas);
    escrituras += tareas.length;
    avisar(`${dia.fecha} — ${escrituras} registros escritos…`);
  }

  return escrituras;
}

// --- Página --------------------------------------------------------------

const estado = document.getElementById("estado");
const boton = document.getElementById("btn-sembrar");
const quien = document.getElementById("quien");

let uidActual = null;

function sinSesion() {
  uidActual = null;
  quien.textContent = "(sin sesión)";
  boton.disabled = true;
  estado.textContent =
    "No hay sesión abierta. Entra primero en la app y vuelve aquí.";
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
  boton.disabled = false;
  estado.textContent = "";
}, sinSesion);

boton.addEventListener("click", async () => {
  if (!confirm(`Vas a añadir un mes de datos falsos a ${quien.textContent}. ¿Seguir?`)) {
    return;
  }

  boton.disabled = true;
  try {
    const total = await sembrar(uidActual, hoyISO(), (texto) => {
      estado.textContent = texto;
    });
    estado.textContent = `Listo: ${total} registros. Vuelve a la app y recarga.`;
  } catch (error) {
    estado.textContent = `Ha fallado: ${error.message}`;
    boton.disabled = false;
  }
});
