// Propone los alias de las recetas (spec 089).
//
//     node docs/menus/proponer-alias.mjs
//
// Escribe docs/menus/alias-recetas.json con lo que encuentra, y por pantalla
// deja las dudas y lo que no ha sabido proponer.
//
// SE EJECUTA A MANO Y SU RESULTADO SE REVISA A MANO. No lo llama la app, no
// corre en ningún despliegue y lo que propone NO es fiable: un alias equivocado
// es una mentira en pantalla, que es lo que avisó la spec 076. El fichero que
// vale es el revisado, no el que sale de aquí.
//
// Por qué hace falta: una receta se llama "Tortilla de atún" y el plato del
// menú es "Tortilla de 2 huevos con 1 lata de atún al natural". El enlazado
// busca el nombre literalmente dentro del texto, así que ahí no engancha.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, "..", "..");
const SALIDA = path.join(AQUI, "alias-recetas.json");

const { RECETAS, MENUS } = await import(
  "file:///" + path.join(RAIZ, "js", "datos-iniciales.js").replace(/\\/g, "/")
);

// Las mismas reglas del enlazado (js/dietas.js): sin tildes, sin mayúsculas, y
// nada de menos de 8 letras, que acertaría dentro de cualquier frase.
const MINIMO = 8;
const clave = (t) =>
  String(t || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");

// Palabras que no distinguen un plato de otro. Sin quitarlas, "de" y "con"
// harían que casi todo se pareciera a casi todo.
const VACIAS = new Set(
  ("de la el los las con y a al en un una unos unas o u sin para por su sus " +
    "gramos gramo gr kg ml cl taza tazas unidad unidades medio media mediana " +
    "mediano pieza piezas lata latas cucharada cucharadas puñado punado " +
    "aprox opcional gusto").split(" ")
);

const palabras = (t) =>
  clave(t)
    .split(/[^a-z0-9]+/)
    .filter((p) => p && !VACIAS.has(p) && !/^\d+$/.test(p));

// Los trozos de un texto de plato. Un texto puede llevar dos platos —"Ensalada
// de repollo y manzana. Tortilla de 2 huevos"— y el alias tiene que ser SOLO el
// suyo: si fuera la frase entera se comería las palabras del vecino y la regla
// de no solapar de la spec 088 dejaría al vecino fuera.
// El ", o " separa DOS PLATOS ALTERNATIVOS —"...queso de cabra, o ensalada de
// alubias con atun"—, y los dos pueden tener receta. Cada uno necesita su
// propio trozo: con el texto entero como alias de los dos, el primero ocuparia
// el tramo y la regla de no solapar de la spec 088 dejaria al otro fuera.
//
// Solo ", o " con coma delante. Un " o " suelto parte cosas que no son platos
// distintos ("pollo o pavo", "asado o a la plancha").
const trozos = (texto) =>
  String(texto || "")
    .split(/\.\s+|\s+\/\/\s+|,\s+o\s+/)
    .map((t) => t.trim().replace(/[.,;]+$/, ""))
    .filter(Boolean);

const recetas = RECETAS.map((r) => ({
  nombre: r.nombre,
  clave: clave(r.nombre),
  palabras: new Set(palabras(r.nombre))
}));

// Todos los trozos de plato distintos de los cuatro menús.
const todos = new Set();
MENUS.forEach((menu) =>
  menu.dias.forEach((dia) =>
    dia.comidas.forEach((comida) => {
      if (comida.texto) trozos(comida.texto).forEach((t) => todos.add(t));
    })
  )
);

const alias = {};
const dudosos = [];
const sinPropuesta = [];
let yaEnlazaban = 0;

for (const trozo of [...todos].sort()) {
  const enTrozo = palabras(trozo);

  // Si ya enlaza literal, no hace falta alias: el enlazado lo encuentra solo.
  if (recetas.some((r) => r.clave.length >= MINIMO && clave(trozo).includes(r.clave))) {
    yaEnlazaban++;
    continue;
  }

  // Se propone cuando TODAS las palabras del nombre de la receta están en el
  // trozo. Es una condición fuerte a propósito: proponer de menos se arregla
  // añadiendo una línea a mano; proponer de más se cuela sin que nadie lo vea.
  const candidatas = recetas.filter(
    (r) => r.palabras.size >= 2 && [...r.palabras].every((p) => enTrozo.includes(p))
  );

  if (candidatas.length === 0) {
    sinPropuesta.push(trozo);
    continue;
  }

  // Con varias candidatas, la de más palabras es la más específica. Pero se
  // marca como duda: aquí es donde el script se equivoca.
  candidatas.sort((a, b) => b.palabras.size - a.palabras.size);
  const elegida = candidatas[0];

  if (candidatas.length > 1) {
    dudosos.push({ trozo, elegida: elegida.nombre, otras: candidatas.slice(1).map((c) => c.nombre) });
  }

  (alias[elegida.nombre] ??= []).push(trozo);
}

fs.writeFileSync(
  SALIDA,
  JSON.stringify(
    {
      _nota:
        "Alias de las recetas (spec 089). Otros nombres por los que se reconoce " +
        "una receta dentro del texto de un plato del menú. PROPUESTO por " +
        "docs/menus/proponer-alias.mjs y REVISADO A MANO: lo que vale es la " +
        "revisión. Un alias equivocado es una mentira en pantalla (spec 076). " +
        "Al cambiarlo hay que regenerar js/datos-iniciales.js.",
      alias
    },
    null,
    2
  ) + "\n",
  "utf8"
);

console.log(`Trozos de plato distintos: ${todos.size}`);
console.log(`  ya enlazaban solos:      ${yaEnlazaban}`);
console.log(`  con alias propuesto:     ${Object.values(alias).flat().length}`);
console.log(`  sin propuesta:           ${sinPropuesta.length}`);
console.log(`\nEscrito en ${path.relative(RAIZ, SALIDA)}\n`);

if (dudosos.length) {
  console.log("REVISAR — encajaba más de una receta:\n");
  dudosos.forEach((d) => {
    console.log(`  "${d.trozo}"`);
    console.log(`      elegida: ${d.elegida}`);
    console.log(`      otras:   ${d.otras.join(" | ")}\n`);
  });
}

if (sinPropuesta.length) {
  console.log("SIN PROPUESTA — o no son recetas, o hay que ponerles el alias a mano:\n");
  sinPropuesta.forEach((t) => console.log(`  "${t}"`));
}
