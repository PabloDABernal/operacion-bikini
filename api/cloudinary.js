// Firma las subidas y los borrados de fotos en Cloudinary.
//
// Las claves de Cloudinary viven solo aquí, en variables de entorno de Vercel.
// El archivo pesado NO pasa por esta función: va del navegador a Cloudinary
// directamente. Por aquí solo pasa la firma, que autoriza esa operación
// concreta y nada más.

const crypto = require("crypto");
const { peticionAutorizada } = require("./_auth");

// Cloudinary firma así: los parámetros ordenados alfabéticamente, unidos por
// "&", con el secreto pegado al final, todo en SHA-1.
function firmar(parametros, secreto) {
  const cadena = Object.keys(parametros)
    .sort()
    .map((clave) => `${clave}=${parametros[clave]}`)
    .join("&");

  return crypto.createHash("sha1").update(cadena + secreto).digest("hex");
}

function carpetaDe(uid) {
  return `usuarios/${uid}/fotos`;
}

module.exports = async (req, res) => {
  const sesion = await peticionAutorizada(req, res);
  if (!sesion) return;

  const secreto = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  if (!secreto || !apiKey || !cloudName) {
    console.error("Faltan variables de entorno de Cloudinary en este despliegue.");
    return res.status(502).json({ error: "cloudinary-sin-configurar" });
  }

  const cuerpo = req.body || {};
  const timestamp = Math.round(Date.now() / 1000);
  const carpeta = carpetaDe(sesion.uid);

  if (cuerpo.accion === "subir") {
    // La fecha es el nombre del archivo: subir dos veces el mismo día
    // sobrescribe, que es justo lo que pide la spec.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(cuerpo.fecha || "")) {
      return res.status(400).json({ error: "fecha-invalida" });
    }

    // La fecha la calcula el navegador, así que aquí solo se comprueba que
    // esté cerca de hoy. El margen de un día es a propósito: el servidor va en
    // UTC y el móvil en hora española, así que de madrugada no coinciden.
    const diferenciaEnDias = Math.abs(
      (Date.parse(`${cuerpo.fecha}T12:00:00Z`) - Date.now()) / 86400000
    );

    if (diferenciaEnDias > 1.5) {
      return res.status(400).json({ error: "fecha-invalida" });
    }

    const parametros = {
      overwrite: "true",
      public_id: `${carpeta}/${cuerpo.fecha}`,
      timestamp
    };

    return res.status(200).json({
      cloudName,
      apiKey,
      timestamp,
      publicId: parametros.public_id,
      firma: firmar(parametros, secreto)
    });
  }

  if (cuerpo.accion === "borrar") {
    const publicId = cuerpo.publicId;

    // Sin esta comprobación, un usuario autorizado podría pedir la firma para
    // borrar las fotos del otro.
    if (typeof publicId !== "string" || !publicId.startsWith(`${carpeta}/`)) {
      return res.status(403).json({ error: "no-es-tuya" });
    }

    return res.status(200).json({
      cloudName,
      apiKey,
      timestamp,
      publicId,
      firma: firmar({ public_id: publicId, timestamp }, secreto)
    });
  }

  return res.status(400).json({ error: "accion-desconocida" });
};
