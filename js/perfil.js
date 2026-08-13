// Subida de la foto de perfil a Cloudinary.
//
// Aquí solo se habla con Cloudinary: quien escribe en usuarios/{uid} es
// js/ajustes.js, que es el único sitio que toca ese documento.

import { auth } from "./firebase-config.js";

const LADO_MAXIMO = 512;
const CALIDAD = 0.85;
const TAMANO_MAXIMO = 15 * 1024 * 1024;

const URL_FIRMA = "/api/cloudinary";

// Recorte cuadrado hecho por Cloudinary, el mismo que usan las miniaturas de
// las fotos de progreso: el círculo de la cabecera no descarga la foto entera.
export function recorteRedondo(url) {
  return url.replace("/upload/", "/upload/c_fill,g_face,w_200,h_200,q_auto,f_auto/");
}

function errorConCodigo(codigo, mensaje) {
  const error = new Error(mensaje);
  error.codigo = codigo;
  return error;
}

// Se redimensiona antes de subir: una foto de móvil son varios MB y la cuota
// gratuita se gasta en transferencia.
async function prepararImagen(archivo) {
  if (!archivo.type.startsWith("image/")) {
    throw errorConCodigo("no-es-imagen", "El archivo no es una imagen");
  }
  if (archivo.size > TAMANO_MAXIMO) {
    throw errorConCodigo("demasiado-grande", "La imagen pesa demasiado");
  }

  let imagen;
  try {
    // Sin imageOrientation, las fotos verticales del móvil salen giradas.
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

// Sube la foto y devuelve su URL. Siempre la misma ruta en Cloudinary, así que
// la anterior se sobrescribe y no se acumulan huérfanas.
export async function subirFotoDePerfil(archivo) {
  const blob = await prepararImagen(archivo);

  const idToken = await auth.currentUser.getIdToken();
  const respuestaFirma = await fetch(URL_FIRMA, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify({ accion: "perfil" })
  });

  if (!respuestaFirma.ok) {
    throw errorConCodigo("firma", `La firma falló con ${respuestaFirma.status}`);
  }

  const firma = await respuestaFirma.json();

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
  return subida.secure_url;
}
