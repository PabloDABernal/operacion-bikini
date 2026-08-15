// Fotos de progreso: preparación en el navegador, subida a Cloudinary y
// listado desde Firestore.

import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { db, auth } from "./firebase-config.js";
import { hoyISO } from "./fechas.js";

const LADO_MAXIMO = 1280;
const CALIDAD = 0.8;
const TAMANO_MAXIMO = 15 * 1024 * 1024;

const URL_FIRMA = "/api/cloudinary";

const MENSAJES = {
  "no-es-imagen": "Elige una imagen.",
  "demasiado-grande": "La imagen es demasiado grande.",
  "formato-ilegible": "No se ha podido leer esa imagen. Prueba con otra."
};

const MENSAJE_GENERICO = "No se ha podido subir la foto. Inténtalo de nuevo.";

export function mensajeDeErrorDeFoto(codigo) {
  return MENSAJES[codigo] || MENSAJE_GENERICO;
}

function coleccionDe(uid) {
  return collection(db, "usuarios", uid, "fotos");
}

function errorConCodigo(codigo, mensaje) {
  const error = new Error(mensaje);
  error.codigo = codigo;
  return error;
}

// Miniatura recortada al cuadrado, generada por Cloudinary: la cuadrícula no
// se descarga las fotos a tamaño completo.
export function miniaturaDe(url) {
  return url.replace("/upload/", "/upload/c_fill,g_auto,w_400,h_400,q_auto,f_auto/");
}

// Redimensiona y comprime antes de subir. La cuota gratuita se gasta en
// almacenamiento y transferencia, y en el móvil también en tiempo de subida.
async function prepararImagen(archivo) {
  if (!archivo.type.startsWith("image/")) {
    throw errorConCodigo("no-es-imagen", "El archivo no es una imagen");
  }
  if (archivo.size > TAMANO_MAXIMO) {
    throw errorConCodigo("demasiado-grande", "La imagen pesa demasiado");
  }

  let imagen;
  try {
    // imageOrientation "from-image" respeta la orientación que guarda el móvil.
    // Sin esto, las fotos verticales salen giradas 90 grados.
    imagen = await createImageBitmap(archivo, { imageOrientation: "from-image" });
  } catch {
    throw errorConCodigo("formato-ilegible", "El navegador no sabe leer esta imagen");
  }

  const escala = Math.min(1, LADO_MAXIMO / Math.max(imagen.width, imagen.height));
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(imagen.width * escala);
  lienzo.height = Math.round(imagen.height * escala);
  lienzo.getContext("2d").drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
  imagen.close();

  const blob = await new Promise((resolver) =>
    lienzo.toBlob(resolver, "image/jpeg", CALIDAD)
  );

  if (!blob) {
    throw errorConCodigo("formato-ilegible", "No se pudo convertir la imagen");
  }

  return blob;
}

async function pedirFirma(peticion) {
  const idToken = await auth.currentUser.getIdToken();

  const respuesta = await fetch(URL_FIRMA, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify(peticion)
  });

  if (!respuesta.ok) {
    throw errorConCodigo("firma", `La firma falló con ${respuesta.status}`);
  }

  return respuesta.json();
}

export async function listarFotos(uid) {
  const consulta = query(coleccionDe(uid), orderBy("fecha", "desc"));
  const instantanea = await getDocs(consulta);

  return instantanea.docs.map((documento) => ({
    id: documento.id,
    ...documento.data()
  }));
}

export function hayFotoDeHoy(fotos) {
  return fotos.some((foto) => foto.fecha === hoyISO());
}

// Sube la foto de hoy. Si ya había una, Cloudinary la sobrescribe: el nombre
// del archivo es la fecha, así que no quedan archivos huérfanos.
export async function subirFotoDeHoy(uid, archivo) {
  const fecha = hoyISO();
  const blob = await prepararImagen(archivo);
  const firma = await pedirFirma({ accion: "subir", fecha });

  const formulario = new FormData();
  formulario.append("file", blob);
  formulario.append("api_key", firma.apiKey);
  formulario.append("timestamp", firma.timestamp);
  formulario.append("public_id", firma.publicId);
  formulario.append("overwrite", "true");
  formulario.append("signature", firma.firma);

  let respuesta;
  try {
    respuesta = await fetch(
      `https://api.cloudinary.com/v1_1/${firma.cloudName}/image/upload`,
      { method: "POST", body: formulario }
    );
  } catch {
    throw errorConCodigo("red", "No se pudo contactar con Cloudinary");
  }

  if (!respuesta.ok) {
    throw errorConCodigo("cloudinary", `Cloudinary respondió ${respuesta.status}`);
  }

  const subida = await respuesta.json();

  // El identificador del documento es la fecha: una foto por día por diseño,
  // sin comprobaciones que se puedan olvidar.
  await setDoc(doc(db, "usuarios", uid, "fotos", fecha), {
    fecha,
    url: subida.secure_url,
    publicId: subida.public_id,
    creadoEn: serverTimestamp()
  });
}

// Solo el archivo de Cloudinary. Aparte porque las fotos archivadas (spec 019)
// tienen su ficha en otra ruta, pero el mismo publicId.
export async function borrarDeCloudinary(publicId) {
  const firma = await pedirFirma({ accion: "borrar", publicId });

  const formulario = new FormData();
  formulario.append("api_key", firma.apiKey);
  formulario.append("timestamp", firma.timestamp);
  formulario.append("public_id", firma.publicId);
  formulario.append("signature", firma.firma);

  await fetch(`https://api.cloudinary.com/v1_1/${firma.cloudName}/image/destroy`, {
    method: "POST",
    body: formulario
  });
}

// Primero Firestore y después Cloudinary: si falla lo segundo queda un archivo
// huérfano gastando algo de cuota, pero nunca una miniatura rota en pantalla.
export async function borrarFoto(uid, foto) {
  await deleteDoc(doc(db, "usuarios", uid, "fotos", foto.id));

  try {
    await borrarDeCloudinary(foto.publicId);
  } catch (fallo) {
    // La foto ya no se ve, que es lo que le importa al usuario. Queda el
    // archivo suelto en Cloudinary.
    console.warn("La foto se borró de la app pero no de Cloudinary:", fallo.message);
  }
}
