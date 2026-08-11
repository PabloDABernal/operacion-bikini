# Backlog

Ideas surgidas durante la implementación, no implementadas. Una línea cada una.

## Producto / UX

- **Propuesta v2 completa** (usabilidad, gráficas, gamificación) en `docs/propuestas/v2-usabilidad-y-gamificacion.md`, redactada el 2026-08-11 a petición del usuario. Pendiente de debatir: hay 5 decisiones suyas al final del documento, una de ellas obliga a tocar `PRODUCTO.md`.

- Pulir la pantalla de login: el botón "Entrar con Google" queda encogido y pegado a la izquierda (está fuera del `<form>`, no hereda el ancho), y el separador "o" es casi invisible. Detectado 2026-08-10 al desplegar la spec 001.
- Probar la app en el móvil: las tres pestañas y los formularios de la spec 002 no se han verificado en pantalla pequeña (2026-08-10).
- Repasar el aspecto general de la app (tipografía, espaciados, versión móvil) cuando v1 esté funcionalmente completa — la v1 prioriza que funcione sobre que esté pulido.

## Técnico

- La cascada de modelos de `api/_ia.js` se reordenó para que `gemini-flash-latest` vaya primero (2026-08-10): con la clave actual, `gemini-2.5-flash` da 404 y gastaba una llamada fallida en cada turno. Si algún día cambia la clave o Google renombra los modelos, hay que revisar ese orden.

## Seguridad / operativa

- Los emails autorizados están en texto plano en un repo público. Alternativas si algún día molesta: lista blanca por UID o por hash SHA-256. Decisión consciente del usuario el 2026-08-10.
