# Backlog

Ideas surgidas durante la implementación, no implementadas. Una línea cada una.

**Limpiado el 25 de agosto de 2026**, con la v7 recién cerrada. Se quitaron tres
entradas caducadas y seis descartadas; lo que queda está agrupado por lo que es
de verdad, no por la spec de la que salió. Lo borrado está al final, para que no
vuelva a proponerse sin saber que ya se descartó.

## Huecos que se notan usando la app

- **Guardar varias dietas y varias tablas**, y poder recuperar una anterior. Hoy
  solo hay una activa de cada (specs 028 y 029): pedir otra pisa la que tenías.
- **Lista de la compra** de la semana, a partir de la dieta y sus recetas
  (specs 026 y 028).
- **Borrar una operación concreta del histórico** desde su tarjeta. La spec 019
  borra el histórico entero o nada, y la 056 le añadió la operación en curso,
  pero sigue sin haber un borrado de una sola.
- **Marcar ejercicios sueltos dentro de una sesión**, en vez de la sesión entera
  (spec 029).
- **Registrar los pesos levantados y ver la progresión de cargas** (spec 029).
  De aquí cuelga también el chip de series y repeticiones de la spec 042: sin
  cargas registradas no hay nada que enseñar.
- **Que el análisis nutricional del día alimente el contexto de la conversación**
  (spec 030). Hoy se calcula y no se le cuenta a nadie: la IA no lo ve.
- **Evolución de los grupos de alimentos a lo largo de la semana** (spec 030:
  solo el día de hoy, sin histórico).
- **Que la semana de dieta y de tabla marquen qué has cumplido hoy.**
  ⚠️ Contradice `docs/PRODUCTO.md`: se descartó a propósito en la v4 para no
  chocar con la spec 028. Si se retoma, **hay que cambiar PRODUCTO.md primero**.

## Cosas que rozan lo roto

- **Acotar el bloque de registros del prompt por caracteres**, no solo por
  número de registros (spec 049). Es el 413 de Groq a medio cerrar: hoy el texto
  de una comida no tiene límite de longitud, así que alguien escribiendo
  párrafos puede seguir engordando la petición. Cortar el texto de un usuario es
  una decisión propia y por eso no se hizo sobre la marcha.
- **El desplazamiento de 52 px de la barra inferior en Ejercicio, en móvil**
  (aceptado el 21 de agosto, spec 038): el navegador mide ahí un hueco entre
  `innerHeight` y `visualViewport.height` que no aparece en las demás secciones.
  Si se retoma, **medir primero con el panel de diagnóstico del commit
  `5829e91`**, no a ciegas.
- **"Hoy" no se actualiza sola al pasar la medianoche** con la app abierta.
  Fuera de la spec 010: no se montó un temporizador para eso.

## Pulido visual

- Iconos en la barra de navegación inferior (la spec 009 la dejó solo con texto,
  y sigue así).
- Llevar el formato de dos líneas con iconos de la spec 043 a las recetas, al
  catálogo de ejercicios y al histórico de operaciones. La 043 solo cambió las
  tres listas del diario.
- Que el chip de ejercicio frecuente enseñe cuántas veces lo has hecho
  ("bici · 45 min · ×9") (spec 042).
- Etiquetas de mes encima del calendario de constancia cuando el rango es largo
  (spec 021).
- Tocar un mes del mapa de calor para verlo como calendario (spec 025).
- Elegir el encuadre de la foto de perfil al subirla (la spec 011 recorta
  centrado, sin editor).
- El aviso de guardado dura 3 segundos fijos y desaparece solo; valorar si algún
  caso pide que se quede hasta cerrarlo.

## Vigilancia, no tareas

Cosas que no hay que hacer, pero que conviene no olvidar.

- **El orden de la cascada de modelos de `api/_ia.js`.** Se reordenó el 10 de
  agosto para que `gemini-flash-latest` vaya primero: con la clave actual,
  `gemini-2.5-flash` da 404 y gastaba una llamada fallida en cada turno. Si
  cambia la clave o Google renombra los modelos, hay que revisarlo.
- **Los emails autorizados están en texto plano en un repo público.**
  Alternativas si algún día molesta: lista blanca por UID o por hash SHA-256.
  Decisión consciente del usuario el 10 de agosto.
- **Un tercer proveedor de IA** si Gemini y Groq se quedan cortos.
- **Resumir los registros por día en el prompt** ("3 comidas, 45 min de bici")
  en vez de listarlos uno a uno cuando el periodo es largo (spec 049): diría más
  con menos texto, pero cambia lo que la IA ve.
- **El cierre del alta y la dieta que no pediste.** El prompt de la entrevista
  dice que "esta persona ya tiene en la app una dieta semanal y una tabla de
  ejercicio". Desde la spec 057 eso es **verdad** si dejas marcadas las casillas
  del comité, así que el problema se ha encogido: solo queda el caso de
  desmarcarlas y que el cierre siga prometiéndolas.

## Descartado el 25 de agosto de 2026

No volver a proponerlo sin un motivo nuevo.

- **La propuesta v2 completa** (`docs/propuestas/v2-usabilidad-y-gamificacion.md`,
  del 10 de agosto). Sus cinco decisiones pendientes se resolvieron por el
  camino en la v2, la v3 y la v4. El documento se conserva como historia, pero
  ya no es una tarea.
- **Repasar el aspecto general de la app cuando la v1 esté completa.** Fue la v3
  (paleta violeta) y la v4 (colocación y escritorio).
- **Alta múltiple / botón "repetir en otra fecha"** para rellenar varios días de
  golpe. El alta con fecha pasada, una a una, ya cubre el caso.
- **Editar la fecha de una foto de progreso.** La fecha es el ID del documento
  en Firestore y el nombre del archivo en Cloudinary: cambiarla obliga a mover
  los dos.
- **Ocultar la barra inferior al abrir el teclado en Android.** Se detectó como
  riesgo en la spec 009 y nunca ha molestado al usarla.
- **Comparar dos operaciones entre sí** ("en la primera perdiste más que en la
  segunda").
- **Reabrir una operación archivada.** Lo archivado no se edita ni se deshace; y
  desde la spec 056 lo que sí se puede es borrarla.
