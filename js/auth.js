// Login (email/contraseña y Google), lista blanca y cierre de sesión.

import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { auth, estaAutorizado } from "./firebase-config.js";

// Error propio: el login de Firebase fue bien pero el email no está autorizado.
export const ERROR_NO_AUTORIZADO = "no-autorizado";

const MENSAJES = {
  "auth/invalid-credential": "Email o contraseña incorrectos.",
  "auth/invalid-email": "Email o contraseña incorrectos.",
  "auth/user-not-found": "Email o contraseña incorrectos.",
  "auth/wrong-password": "Email o contraseña incorrectos.",
  "auth/network-request-failed": "No se ha podido conectar. Inténtalo de nuevo.",
  "auth/account-exists-with-different-credential":
    "Esta cuenta usa email y contraseña. Entra por ahí.",
  [ERROR_NO_AUTORIZADO]: "Acceso no autorizado."
};

// Errores que no merecen mensaje: el usuario cerró la ventana de Google a propósito.
const SILENCIOSOS = [
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
  "auth/user-cancelled"
];

export function mensajeDeError(codigo) {
  if (SILENCIOSOS.includes(codigo)) return "";
  return MENSAJES[codigo] || "No se ha podido conectar. Inténtalo de nuevo.";
}

// Si el usuario recién logueado no está en la lista blanca, lo echamos.
async function exigirAutorizacion(usuario) {
  if (estaAutorizado(usuario.email)) return usuario;
  await signOut(auth);
  const error = new Error("Email no autorizado");
  error.code = ERROR_NO_AUTORIZADO;
  throw error;
}

export async function entrarConEmail(email, password) {
  const credencial = await signInWithEmailAndPassword(auth, email, password);
  return exigirAutorizacion(credencial.user);
}

export async function entrarConGoogle() {
  const proveedor = new GoogleAuthProvider();
  const credencial = await signInWithPopup(auth, proveedor);
  return exigirAutorizacion(credencial.user);
}

export function salir() {
  return signOut(auth);
}

// Llama a `alCambiar(usuario | null)` en cada cambio de sesión y al arrancar.
// Un usuario con sesión válida pero fuera de la lista blanca (p. ej. porque se
// le ha quitado el acceso) se trata como si no tuviera sesión: fuera.
export function observarSesion(alCambiar, alRechazar) {
  onAuthStateChanged(auth, async (usuario) => {
    if (usuario && !estaAutorizado(usuario.email)) {
      await signOut(auth);
      alRechazar();
      return;
    }
    alCambiar(usuario);
  });
}
