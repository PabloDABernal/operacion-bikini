// Configuración e inicialización de Firebase.
//
// La apiKey de Firebase es pública por diseño (viaja en el JS del navegador).
// Lo que protege los datos son las reglas de firestore.rules, no esta clave.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCLYCIknr0aJDO0E8Sp4YmAMW3Hpnxo8Bw",
  authDomain: "operacion-bikini-be8c9.firebaseapp.com",
  projectId: "operacion-bikini-be8c9",
  storageBucket: "operacion-bikini-be8c9.firebasestorage.app",
  messagingSenderId: "549368037762",
  appId: "1:549368037762:web:0f3644c6e5c1068ac84f9b",
  measurementId: "G-LZ8NWYKJKL"
};

// Lista blanca de emails autorizados, SIEMPRE en minúsculas.
//
// IMPORTANTE: esta lista está duplicada en firestore.rules y en api/_auth.js
// a propósito. Aquí sirve para dar un mensaje claro al usuario; en las reglas
// está la barrera de los datos, y en el servidor la de la cuota de IA y fotos.
// Al añadir o quitar a alguien hay que tocar LOS TRES sitios, desplegar en
// Vercel y publicar las reglas (npx firebase-tools deploy --only firestore:rules).
export const EMAILS_AUTORIZADOS = [
  "pantonbernal@gmail.com",
  "angels_recio@hotmail.com"
];

export function estaAutorizado(email) {
  if (!email) return false;
  return EMAILS_AUTORIZADOS.includes(email.toLowerCase());
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
