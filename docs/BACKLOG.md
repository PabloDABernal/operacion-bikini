# Backlog

Ideas surgidas durante la implementación, no implementadas. Una línea cada una.

## Producto / UX

- **Propuesta v2 completa** (usabilidad, gráficas, gamificación) en `docs/propuestas/v2-usabilidad-y-gamificacion.md`, redactada el 2026-08-11 a petición del usuario. Pendiente de debatir: hay 5 decisiones suyas al final del documento, una de ellas obliga a tocar `PRODUCTO.md`.

- PRODUCTO.md llama "collage de evolución" (líneas 17 y 34) a lo que la spec 005 implementó como cuadrícula cronológica de miniaturas. No es deriva —la spec lo decidió a conciencia— pero conviene ajustar la palabra en PRODUCTO.md o decidir si el collage de verdad (una sola imagen compuesta) entra en v2. Detectado en la auditoría del 2026-08-11.
- Alta múltiple / botón "repetir en otra fecha" para rellenar varios días de golpe (útil para probar y para el "lo de siempre" de v2). Surgió al decidir la spec 007; se dejó fuera porque el alta con fecha pasada, una a una, ya cubre el caso.
- Editar la fecha de una foto de progreso: hoy la fecha es el ID del documento en Firestore y el nombre del archivo en Cloudinary, así que cambiarla obliga a mover ambos. Fuera de la spec 007.
- Selector de rango temporal en la gráfica de peso (30 días / 90 días / todo), cuando haya meses de historial que enseñar. Fuera de la spec 008 por eso mismo.
- Tocar un punto de la gráfica de peso para ver su fecha y su peso exactos. Fuera de la spec 008.
- Elegir el encuadre de la foto de perfil al subirla (la spec 011 recorta centrado, sin editor).
- Quitar la foto de perfil y volver a la inicial del email (la spec 011 solo deja sustituirla).
- Repetir un ejercicio de los habituales, como "lo de siempre" hace con las comidas. Fuera de la spec 010 porque un ejercicio repetido casi nunca dura lo mismo.
- Que la pantalla "Hoy" se actualice sola al pasar la medianoche con la app abierta. Fuera de la spec 010: no se monta un temporizador para eso.
- Iconos en la barra de navegación inferior (la spec 009 la deja solo con texto).
- Ocultar la barra inferior automáticamente al abrir el teclado en Android, si al usarla resulta molesta. Detectado como riesgo en la spec 009.
- Repasar el aspecto general de la app (tipografía, espaciados, versión móvil) cuando v1 esté funcionalmente completa — la v1 prioriza que funcione sobre que esté pulido.

## Técnico

- La cascada de modelos de `api/_ia.js` se reordenó para que `gemini-flash-latest` vaya primero (2026-08-10): con la clave actual, `gemini-2.5-flash` da 404 y gastaba una llamada fallida en cada turno. Si algún día cambia la clave o Google renombra los modelos, hay que revisar ese orden.

## Seguridad / operativa

- Los emails autorizados están en texto plano en un repo público. Alternativas si algún día molesta: lista blanca por UID o por hash SHA-256. Decisión consciente del usuario el 2026-08-10.

## De la spec 018 (operaciones)

- Comparar dos operaciones entre sí ("en la primera perdiste más que en la segunda").
- Reabrir o borrar una operación archivada. Hoy lo archivado no se puede editar ni deshacer.
