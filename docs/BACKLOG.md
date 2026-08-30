# Backlog

Ideas surgidas durante la implementación, no implementadas. Una línea cada una.

## Vacío desde el 27 de agosto de 2026

**Está vacío a propósito, no por descuido.** La app lleva en uso diario desde el
11 de agosto, las specs 001 a 057 están cerradas y lo próximo serán evolutivos
nuevos. Un backlog de veintidós entradas dejó de ser una lista de tareas para
ser un armario: la mitad eran ideas de futuro, un cuarto eran trampas que
conviene recordar y el resto ya se había decidido no hacerlo.

Así que se repartió cada cosa donde se lee cuando hace falta:

| Qué había | Dónde está ahora |
|---|---|
| 8 ideas de funcionalidad (varias dietas, lista de la compra, cargas levantadas…) | `docs/PRODUCTO.md`, apartado "Ideas para más adelante" |
| 7 de pulido visual (iconos en la nav, el ×9 del chip, etiquetas de mes…) | `docs/PRODUCTO.md`, mismo apartado, sección "Pulido visual" |
| 4 de vigilancia (orden de la cascada de modelos, emails en claro, tercer proveedor…) | `docs/ESTADO.md`, "Cosas que hay que saber antes de tocar nada" |
| 2 aceptadas a conciencia (los 52 px de la barra, "Hoy" y la medianoche) | Abajo, en "Cerrado el 27 de agosto" |
| 1 arreglada ese mismo día (el cierre del alta prometía planes que nadie iba a crear) | Arreglada en el código; el porqué, en `docs/ESTADO.md` |

## Cómo se usa a partir de ahora

Una idea que salga a mitad de una spec **se sigue anotando aquí**, en una línea,
y se sigue con la spec: eso no cambia (`CLAUDE.md`, "Anti scope-creep"). Lo que
cambia es el final del viaje: cuando se cierre una versión, lo que quede aquí se
reparte otra vez entre `PRODUCTO.md` (si es una idea) y `ESTADO.md` (si es una
trampa), y esto vuelve a quedarse vacío. Este archivo es un buzón, no un almacén.

## En el buzón

- **Que el día abierto de la dieta se recuerde** al volver a la pestaña
  (spec 064). Hoy siempre se abre en el día de hoy, a propósito.


Ideas surgidas al escribir las specs 058 y 059 (28 de agosto). No se implementan
ahora: se reparten cuando se cierre la v8.

- Sugerir ingredientes para la despensa a partir de los que más se repiten en
  tus recetas ya guardadas (spec 058).
- Categorías de ingredientes en la despensa (verduras, carnes, especias), si la
  lista se hace larga de verdad (spec 058).
- Un botón en la receta para meter en la despensa, de un toque, lo que te falta
  (spec 059).

## Hechas ya (limpieza del 30 de agosto de 2026)

Estaban en el buzón y **ya estaban implementadas**: el buzón se había quedado
por detrás del código. Se anotan aquí para que nadie las vuelva a proponer.

- **La misma tira de siete días para la tabla de ejercicio.** La hizo la
  **spec 067**: `dias-tabla` en `index.html` y la misma función de `js/app.js`
  que pinta la de la dieta.
- **Lista de la compra de la semana.** La hizo la **spec 073** (v12).

## Cerrado el 27 de agosto de 2026

No volver a proponerlo sin un motivo nuevo.

- **Acotar el bloque de registros del prompt por caracteres**, no solo por número
  de registros (spec 049). Era el 413 de Groq a medio cerrar. Desde la spec 049,
  el 23 de agosto, el 413 no ha vuelto a aparecer: recortar el texto que escribe
  el usuario es una pérdida real de información para arreglar algo que hoy no se
  rompe. **Si el 413 vuelve, esto es exactamente lo que falta por hacer** — está
  anotado como vigilancia en `docs/ESTADO.md`.
- **El desplazamiento de 52 px de la barra inferior en Ejercicio, en móvil**
  (spec 038). El usuario lo vio el 21 de agosto y decidió dejarlo antes que
  seguir tocando algo que ya funciona. Si algún día se retoma, **medir primero
  con el panel de diagnóstico del commit `5829e91`**, no a ciegas.
- **"Hoy" no se actualiza sola al pasar la medianoche** con la app abierta. Fuera
  de la spec 010, y en dos semanas de uso diario no ha molestado nunca: quien
  deja la app abierta cruzando la medianoche recarga y ya.
- **`sembrar.html` y `js/sembrar.js`**, la herramienta de datos de prueba.
  **Borrados el 27 de agosto**: ya no los enlazaba nada, pero seguían desplegados
  y funcionando en producción, así que entrando a mano en `/sembrar.html` se
  podía llenar de datos falsos una cuenta con dos meses de datos reales. Están en
  el historial de git si alguna vez hacen falta.

## Descartado el 30 de agosto de 2026

El usuario las repasó al elegir la v13 y las descartó en bloque: **"residuos del
pasado"**. Salen de "Ideas para más adelante" de `docs/PRODUCTO.md` y se anotan
aquí. No volver a proponerlas sin un motivo nuevo.

- **Guardar varias dietas y varias tablas**, y recuperar una anterior.
- **Borrar una operación concreta del histórico** desde su tarjeta.
- **Registrar los pesos levantados y ver la progresión de cargas.** Con esto cae
  también el chip de series y repeticiones de la spec 042, que colgaba de ello.
- **Que el análisis nutricional del día alimente el contexto de la conversación.**

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
