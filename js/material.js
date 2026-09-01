// El armario: el material con el que entrenas (spec 074).
//
// Vive en usuarios/{uid}/material, FUERA de las operaciones, por el mismo motivo
// que la despensa (spec 058), las recetas (026) y las dietas (028): cerrar una
// operación bikini no te quita el banco.
//
// Colección PROPIA y no la despensa, aunque la forma sea la misma. La despensa
// se le manda a la IA al pedir la dieta (spec 059), y unas mancuernas ahí dentro
// entrarían en el prompt como algo que tienes para cocinar. Es el mismo motivo
// por el que la lista de la compra tiene la suya (spec 073).
//
// NO es un inventario: no guarda cuántas mancuernas ni de cuántos kilos. Lo
// mismo que decidió la 058, y por lo mismo — un inventario que hay que mantener
// acaba mintiendo.

import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db } from "./firebase-config.js";

// La normalización y el emparejado singular/plural se IMPORTAN de la despensa,
// no se reescriben: son genéricos (funcionan sobre cualquier texto) y la 072 ya
// les metió el caso de "mancuerna" contra "mancuernas", que aquí hace la misma
// falta. Tener dos copias significaría que dentro de un mes solo una está
// arreglada.
import { normalizar, mismoIngrediente } from "./despensa.js";

// El material del ejercicio, leído en piezas (spec 077). Sin esto no se puede
// decir qué te falta: "mancuernas, banco" es una frase, no dos cosas.
import { piezasDeMaterial } from "./ejercicios-catalogo.js";

export const MAX_NOMBRE = 60;

function coleccionDe(uid) {
  return collection(db, "usuarios", uid, "material");
}

// Devuelve { nombre } o { error }.
export function validarMaterial(nombreBruto) {
  const nombre = String(nombreBruto ?? "").trim();

  if (nombre === "") {
    return { error: "Escribe un material." };
  }
  if (nombre.length > MAX_NOMBRE) {
    return { error: `Máximo ${MAX_NOMBRE} caracteres.` };
  }

  return { nombre };
}

// La pieza del armario que es "la misma" que este nombre, o undefined.
//
// Se compara con `mismoIngrediente`, así que "mancuerna" encuentra tus
// "mancuernas": el plural es la única regla que casi nunca se equivoca en
// español, y aquí pasa igual que con la comida.
//
// `exceptoId` existe para editar: una fila no es duplicada de sí misma, así que
// cambiarle solo las mayúsculas o una tilde tiene que poder guardarse.
export function materialIgual(armario, nombre, exceptoId = null) {
  return armario.find(
    (pieza) => pieza.id !== exceptoId && mismoIngrediente(pieza.nombre, nombre)
  );
}

// Nace MARCADO, al revés que un ingrediente de la despensa (spec 068).
//
// No es un descuido: son dos casos distintos. La despensa se llena sola desde
// las recetas, así que escribir algo ahí no dice nada sobre lo que hay en la
// nevera. El armario lo escribes tú, pieza a pieza, y solo escribes lo que
// tienes — nadie apunta un banco que no tiene. Obligar a marcar después sería
// pedir dos gestos para decir una cosa.
export function guardarMaterial(uid, nombre) {
  return addDoc(coleccionDe(uid), {
    nombre,
    tengo: true,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp()
  });
}

export function renombrarMaterial(uid, materialId, nombre) {
  return updateDoc(doc(db, "usuarios", uid, "material", materialId), {
    nombre,
    actualizadoEn: serverTimestamp()
  });
}

export function marcarMaterial(uid, materialId, tengo) {
  return updateDoc(doc(db, "usuarios", uid, "material", materialId), {
    tengo,
    actualizadoEn: serverTimestamp()
  });
}

export function borrarMaterial(uid, materialId) {
  return deleteDoc(doc(db, "usuarios", uid, "material", materialId));
}

// El orden se calcula aquí y no con un orderBy de Firestore porque ordena por
// dos cosas a la vez —primero lo que tienes, luego alfabético— y la segunda
// tiene que ignorar tildes y mayúsculas, cosa que Firestore no hace.
//
// Se llama al ENTRAR en la sub-pestaña, no al marcar: si la lista se recolocara
// en cada toque, la fila recién marcada saltaría bajo el dedo.
export function ordenar(armario) {
  return [...armario].sort((a, b) => {
    if (a.tengo !== b.tengo) return a.tengo ? -1 : 1;
    return normalizar(a.nombre).localeCompare(normalizar(b.nombre), "es");
  });
}

// Los nombres de lo que tienes marcado, para mandárselo a la IA al pedir tabla
// (spec 077). Espejo de loQueTengo() de la despensa, que hace lo mismo para la
// dieta desde la spec 059.
export function loQueTengo(armario) {
  return armario.filter((pieza) => pieza.tengo).map((pieza) => pieza.nombre);
}

// Lo que pide tu tabla y no tienes marcado (spec 078). La lista de la compra,
// pero de gimnasio.
//
// Se calcula AL VUELO, como loQueFalta() de la spec 073 y por lo mismo:
// guardarla obligaría a mantenerla al día cada vez que cambia la tabla, el
// catálogo o el armario, y a decidir quién gana cuando se contradicen.
//
// Devuelve [{ nombre, materialId }]:
// - materialId con valor: la pieza está en tu armario, DESMARCADA. Se marca.
// - materialId a null: no está. Se crea, y nace marcada.
export function materialQueFalta(tabla, catalogo, armario) {
  if (!tabla) return [];

  const porId = new Map((catalogo || []).map((ejercicio) => [ejercicio.id, ejercicio]));
  const faltan = [];

  (tabla.dias || []).forEach((dia) => {
    // Un día sin sesión es descanso y no pide nada.
    ((dia.sesion && dia.sesion.ejercicios) || []).forEach((linea) => {
      // Sin enlace al catálogo no se sabe qué material pide: la línea es solo
      // texto ("Sentadillas 4x12"). Se salta, en vez de adivinar.
      const ejercicio = porId.get(linea.ejercicioId);
      if (!ejercicio) return;

      piezasDeMaterial(ejercicio.material).forEach((nombre) => {
        const enElArmario = (armario || []).find((pieza) =>
          mismoIngrediente(pieza.nombre, nombre)
        );

        // Marcada: no falta.
        if (enElArmario && enElArmario.tengo) return;

        // La misma pieza en dos ejercicios sale una sola vez.
        if (faltan.some((falta) => mismoIngrediente(falta.nombre, nombre))) return;

        // El nombre de TU armario manda sobre el del ejercicio, igual que en
        // loQueFalta(): lo que tú escribiste es lo que reconoces.
        faltan.push({
          nombre: enElArmario ? enElArmario.nombre : nombre,
          materialId: enElArmario ? enElArmario.id : null
        });
      });
    });
  });

  return faltan;
}

export async function listarMaterial(uid) {
  const instantanea = await getDocs(coleccionDe(uid));

  return ordenar(
    instantanea.docs.map((documento) => ({
      id: documento.id,
      ...documento.data()
    }))
  );
}
