// Validación de credenciales compartida por todas las funciones de servidor.
//
// El repositorio es público, así que las URLs de estas funciones son conocidas:
// sin validar quién llama, cualquiera podría agotar la cuota de Gemini o llenar
// la cuenta de Cloudinary. Todo lo de aquí gira alrededor de exigir un ID token
// de Firebase válido y de un email autorizado.
//
// El prefijo "_" evita que Vercel publique este archivo como una ruta más.

// apiKey pública del proyecto Firebase (la misma que js/firebase-config.js).
// No es un secreto: solo sirve para identificar el proyecto al validar el token.
const FIREBASE_API_KEY = "AIzaSyCLYCIknr0aJDO0E8Sp4YmAMW3Hpnxo8Bw";

// Tercera copia de la lista blanca, en minúsculas (cliente y firestore.rules
// tienen las otras dos). Al añadir a alguien hay que tocar las tres.
const EMAILS_AUTORIZADOS = [
  "pantonbernal@gmail.com",
  "angels_recio@hotmail.com"
];

// Valida el ID token contra el endpoint público de Google Identity Toolkit.
// No hace falta el SDK de Firebase Admin ni una cuenta de servicio.
async function datosDelToken(idToken) {
  const respuesta = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken })
    }
  );

  if (!respuesta.ok) return null;

  const datos = await respuesta.json();
  const usuario = datos.users && datos.users[0];
  if (!usuario || !usuario.email || !usuario.localId) return null;

  return { uid: usuario.localId, email: usuario.email.toLowerCase() };
}

// Comprueba método y credenciales. Si algo falla, responde e indica que la
// petición ya está contestada; quien llama solo tiene que dejar de trabajar.
//
// Devuelve { uid, email } si se puede continuar, o false. Ojo al cambiar esto:
// api/consulta.js y api/plan.js lo usan como `if (!(await ...)) return;`.
async function peticionAutorizada(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "metodo-no-permitido" });
    return false;
  }

  const cabecera = req.headers.authorization || "";
  const idToken = cabecera.startsWith("Bearer ") ? cabecera.slice(7) : "";

  if (!idToken) {
    res.status(401).json({ error: "sin-token" });
    return false;
  }

  let sesion;
  try {
    sesion = await datosDelToken(idToken);
  } catch {
    res.status(401).json({ error: "token-no-verificable" });
    return false;
  }

  if (!sesion || !EMAILS_AUTORIZADOS.includes(sesion.email)) {
    res.status(401).json({ error: "no-autorizado" });
    return false;
  }

  return sesion;
}

module.exports = { peticionAutorizada };
