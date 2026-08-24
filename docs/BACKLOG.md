# Backlog

Ideas surgidas durante la implementación, no implementadas. Una línea cada una.

## Producto / UX

- **Propuesta v2 completa** (usabilidad, gráficas, gamificación) en `docs/propuestas/v2-usabilidad-y-gamificacion.md`, redactada el 2026-08-11 a petición del usuario. Pendiente de debatir: hay 5 decisiones suyas al final del documento, una de ellas obliga a tocar `PRODUCTO.md`.

- Alta múltiple / botón "repetir en otra fecha" para rellenar varios días de golpe (útil para probar y para el "lo de siempre" de v2). Surgió al decidir la spec 007; se dejó fuera porque el alta con fecha pasada, una a una, ya cubre el caso.
- Editar la fecha de una foto de progreso: hoy la fecha es el ID del documento en Firestore y el nombre del archivo en Cloudinary, así que cambiarla obliga a mover ambos. Fuera de la spec 007.
- Elegir el encuadre de la foto de perfil al subirla (la spec 011 recorta centrado, sin editor).
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
- Borrar una operación concreta del histórico desde su tarjeta (la spec 019 borra el histórico entero o nada).
- Un tercer proveedor de IA si Gemini y Groq se quedan cortos.
- Etiquetas de mes encima del calendario de constancia cuando el rango es largo (spec 021).
- Lista de la compra a partir de las recetas de una semana (spec 026).
- Escalar los ingredientes de una receta al cambiar las raciones (spec 026).
- Tocar un mes del mapa de calor para verlo como calendario (spec 025).
- Guardar varias dietas y poder recuperar una anterior (spec 028: solo hay una activa).
- Lista de la compra de la semana a partir de la dieta (spec 028).
- Guardar varias tablas de ejercicio y poder recuperar una anterior (spec 029: solo hay una activa).
- Registrar los pesos levantados y ver la progresión de cargas (spec 029).
- Marcar ejercicios sueltos dentro de una sesión, en vez de la sesión entera (spec 029).
- Ver la evolución de los grupos de alimentos a lo largo de la semana (spec 030: solo el día de hoy, sin histórico).
- Que el análisis nutricional del día alimente el contexto de la conversación con la IA (spec 030).

## De la auditoría de usabilidad (20 de agosto de 2026, v4)

- El aviso de guardado dura 3 segundos fijos y desaparece solo; valorar si algún caso pide que se quede hasta que lo cierres.
- Que la semana de dieta y de tabla marquen qué has cumplido hoy. Descartado a propósito en la v4 para no contradecir la spec 028; si algún día se quiere, hay que cambiar PRODUCTO.md primero.
- Pulir el desplazamiento de 52 px de la barra de navegación en Ejercicio en móvil (aceptado el 21 de agosto, spec 038): el navegador mide ahí un hueco entre `innerHeight` y `visualViewport.height` que no aparece en las demás secciones. Si se retoma, medir primero con el panel de diagnóstico del historial de git (commit `5829e91`), no a ciegas.

## De la spec 042 (chips de ejercicios frecuentes)

- Que el chip enseñe también cuántas veces lo has hecho ("bici · 45 min · ×9").
- Un chip para las series y repeticiones, si algún día se registran cargas.

## De la spec 043 (filas del diario en dos líneas)

- Llevar el mismo formato de dos líneas y los mismos iconos a las recetas, al
  catálogo de ejercicios y al histórico de operaciones. La 043 solo cambió las
  tres listas del diario.

## De la spec 049 (el 413 de Groq)

- Acotar el bloque de registros del prompt por **caracteres** y no solo por
  número de registros: hoy el texto de una comida no tiene límite de longitud,
  así que alguien escribiendo párrafos podría seguir haciendo crecer la
  petición. Cortar el texto de un usuario es una decisión propia.
- Resumir los registros por día ("3 comidas, 45 min de bici") en vez de
  listarlos uno a uno cuando el periodo es largo: diría más con menos texto,
  pero cambia lo que la IA ve.

## Pedido por el usuario el 24 de agosto de 2026

- **"Reiniciar datos" (Zona de peligro) no borra el objetivo/perfil, y el
  usuario piensa que debería poder hacerlo.** Hoy, por diseño (comentario en
  `js/reinicio.js`: "el documento de ajustes del usuario NO está en esta
  lista a propósito: reiniciar es empezar de cero con el mismo objetivo, no
  olvidar quién eres"), ninguna de las casillas de Ajustes → Zona de peligro
  toca el documento de ajustes (nombre, altura, peso objetivo, fecha
  objetivo, perfil que usa la IA, etc.). El usuario, tras hacer pruebas en la
  app, quiere una forma de borrar también eso — un reinicio de verdad "de
  cero", no solo del diario y los planes. Es un cambio de producto (contradice
  la decisión documentada en el comentario de `reinicio.js` y probablemente en
  `docs/PRODUCTO.md`), así que antes de tocar código hay que decidir con él
  **cómo** quiere que funcione: ¿una casilla más en la lista existente
  ("objetivo y perfil"), o un botón aparte tipo "borrar todo, incluido quién
  eres" con su propia confirmación por ser el más destructivo de todos? Ver
  regla 1 del proyecto: PARAR y actualizar `docs/PRODUCTO.md` antes de
  implementar.
