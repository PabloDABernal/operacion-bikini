# 052 — La entrevista de alta, también en el hilo

- **Estado:** 📝 pendiente de implementar (después de la 050 y la 051). Revisada
  por `revisor-specs` el 24 de agosto: corregidos tres puntos técnicos (dónde
  vive de verdad el filtro del hilo, la condición de visibilidad de la caja, y
  el orden real del hilo tras la 051). Ver secciones 2 y 4.
- **Fecha:** 2026-08-23
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v6…)", punto **"La entrevista que abre una operación también vive ahí"**.
- **Tercera de tres.** Cierra la v6.

## 1. Objetivo

Tras la 050 y la 051 hay un solo hilo con la conversación y las revisiones, y
una sola caja de texto, pero la
**entrevista que abre una operación** sigue siendo un hilo aparte que se ve a
solas y desaparece de la vista en cuanto la operación arranca. El usuario
decidió el 23 de agosto que también debe vivir en el hilo: es el principio de
la conversación con su nutricionista, no un trámite.

Al terminar esta spec, la entrevista con la que empezó la operación forma
parte del hilo de esa operación, igual que las revisiones. **Ojo con el
orden:** desde la 051 el hilo se pinta invertido (lo más reciente arriba), así
que la entrevista queda **al final del hilo, abajo del todo** — es lo más
antiguo, no lo primero que se lee al entrar.

## 2. Criterio de "esto funciona"

1. **Sin operación en marcha**, en Consulta sigue estando el botón **"Iniciar
   operación bikini"** con su explicación, y la caja de texto para contestar.
2. La entrevista se desarrolla **en el hilo**, con el mismo aspecto que el
   resto: nada de una pantalla aparte.
3. Al terminar la entrevista, la operación se abre y los ajustes se rellenan
   **exactamente como hasta ahora** (nombre, altura, peso objetivo, fecha
   objetivo y el perfil que la IA usará después).
4. Una vez abierta la operación, la entrevista **cierra el hilo por abajo**
   (es el mensaje más antiguo del hilo invertido de la 051): las dudas y las
   revisiones más recientes se leen encima, y bajando del todo se llega a la
   entrevista con la que empezó.
5. La entrevista queda marcada en el hilo, igual que las revisiones, para que se
   sepa qué fue: **"Entrevista de bienvenida · 12 de junio"**.
6. Al **reabrir** una operación (modo `reinicio`), su entrevista abre el hilo
   nuevo de esa etapa.
7. El cupo sigue siendo uno: 20 mensajes al día, y empezar la entrevista gasta
   uno, igual que empezar una revisión (spec 051).
8. Las operaciones anteriores no se mezclan: el hilo es el de la etapa en curso.

## 3. Alcance

### Entra

- Que los mensajes de la entrevista (`modo` `inicial` y `reinicio`) entren en el
  hilo que pinta `hiloCompleto()`.
- Su separador propio.
- Que la caja de texto única de la spec 051 también sirva para contestar a la
  entrevista.

### NO entra (explícitamente fuera)

- **Cambiar lo que la entrevista pregunta ni lo que averigua.** Ni
  `INSTRUCCIONES_INICIAL`, ni `INSTRUCCIONES_REINICIO`, ni
  `guardarLoAveriguado()`, ni `crearOperacion()`.
- **Migrar datos.** Como en la 050: se pintan juntos, no se mueven.
- **Que se pueda charlar durante la entrevista.** Mientras está en marcha, lo
  que escribes le contesta a ella. Es lo mismo que hace una revisión.
- **Enseñar entrevistas de operaciones anteriores.**

## 4. Comportamiento detallado

### El filtro que decide qué entra en el hilo (`js/app.js`)

`hiloCompleto()` (en `js/conversacion.js`) no filtra por `modo`: pinta
cualquier lista de consultas que le pasen. Quien excluye hoy `inicial` y
`reinicio` es el llamador, dentro de `pintarConversacion()` en `js/app.js`:

```js
const revisiones = consultasCargadas.filter(esRevision);
```

Ese filtro pasa de `esRevision` a incluir también las entrevistas, por
ejemplo `consulta => consulta.modo !== "conversacion"`. A partir de ahí se
mezclan como una revisión más, con la fecha de su consulta y su marca de
inicio.

### El separador (`js/conversacion.js` y/o `js/app.js`)

Hoy `separadorDeRevision()` (en `js/app.js`) escribe siempre el texto
"Revisión", sin mirar el `modo`. Para las tres etiquetas hace falta que el
`modo` de la consulta llegue hasta ese marcador (`hiloCompleto()` ya expone
`empiezaRevision` con la fecha; hay que llevar también el `modo`) y que
`separadorDeRevision()` ramifique por él:

| `modo` | Separador |
|---|---|
| `inicial` | Entrevista de bienvenida |
| `reinicio` | Entrevista de una etapa nueva |
| `normal` | Revisión |

### La pantalla (`js/app.js`)

`pintarEstadoConsulta()` esconde hoy la caja única con algo equivalente a
`!hayOperacion` sin más: sin operación en marcha, la caja queda oculta
**incluso mientras la entrevista está en curso**, que es justo cuando hace
falta para contestarla. Es el mismo tipo de fallo que arregló la spec 047 (un
control escondido por una condición que vivía en el sitio equivocado). La
condición tiene que pasar a **no ocultar la caja si hay una entrevista en
curso**, aunque no haya operación — equivalente a `!hayOperacion &&
!enCurso` — para que la etiqueta "Tu respuesta" que ya se pone en ese estado
no quede escrita en un elemento invisible.

El resto no cambia: la caja de texto de la 051 manda a `responder()` cuando
hay una entrevista en curso, que es el mismo camino que ya usa para una
revisión, así que no hay una rama nueva.

**Comprobación previa recomendada:** antes de dar esto por un efecto nuevo de
la 052, comprobar en producción si esta ocultación ya afecta hoy a alguien sin
operación que esté a medio empezar la entrevista (por ejemplo el alta de
`jrecio0086@gmail.com`, del 22 de agosto). El usuario confirmó el 24 de agosto
que su cuñado ya entró y probó la app sin problema, así que no hay indicio de
que esto sea una regresión activa — pero si esta spec efectivamente corrige el
`!hayOperacion` a `!hayOperacion && !enCurso`, es un arreglo que la 052 hereda
de rebote, no solo un cambio de "dónde se pinta".

### El riesgo, y cómo se acota

La entrevista es el único sitio de la app que, al terminar, **escribe en
Ajustes y crea la operación**. Un fallo aquí deja a alguien sin poder empezar a
usar la app.

Por eso esta spec **no toca nada de eso**: ni `guardarLoAveriguado()`, ni
`crearOperacion()`, ni las instrucciones del proxy, ni el esquema. Solo cambia
**dónde se pintan** los mensajes y de qué caja salen. Si algo se rompe, se
verá en la pantalla, no en los datos.

El guion de prueba tiene que recorrer una entrevista **entera**, hasta ver los
ajustes rellenos y la operación abierta.

## 5. Modelo de datos

Sin cambios. No se toca Firestore ni `firestore.rules`.

## 6. Casos límite

- **Entrevista a medias y recarga.** Se retoma, como hoy.
- **Entrevista abandonada a medias y operación nunca abierta.** Sus mensajes se
  quedan en el hilo. Es correcto: pasó, y al empezar otra se lee encima.
- **Segunda operación.** Su entrevista (`reinicio`) abre el hilo de la etapa
  nueva; las consultas de la anterior ya no están (las movió `archivar()`).
- **Sin cupo de mensajes.** No se puede empezar la entrevista. **Es el caso
  delicado**: alguien nuevo con el cupo gastado no podría abrir su operación
  hasta el día siguiente. Hay que comprobar que el mensaje lo explica y no
  parece un error.

## 7. Archivos afectados

| Archivo | Qué cambia |
|---|---|
| `js/app.js` | El filtro de `pintarConversacion()` deja de excluir `inicial`/`reinicio`; `separadorDeRevision()` ramifica por `modo`; `pintarEstadoConsulta()` deja de ocultar la caja cuando hay una entrevista en curso. |
| `js/conversacion.js` | `hiloCompleto()` hace viajar también el `modo` de la consulta que abre cada bloque, para que el separador pueda distinguirlo. |
| `docs/PRODUCTO.md` | Ya actualizado (apartado v6). |

No se toca `api/`, ni `firestore.rules`, ni `guardarLoAveriguado()`, ni
`crearOperacion()`.

Tamaño estimado: ~90 líneas.

## 8. Decisiones tomadas

- **La entrevista va al hilo.** Decisión del usuario el 23 de agosto, en contra
  de la recomendación de dejarla aparte. Queda anotado que el motivo de la
  recomendación era el riesgo, no el diseño: sobre el papel es más coherente
  tenerlo todo junto.
- **Va en su propia spec.** Justo por ese riesgo: si algo sale mal, se sabe qué
  cambio lo rompió y se revierte solo esto.
- **No se toca nada de lo que la entrevista guarda.** Solo dónde se pinta.

## 9. Fuera de spec: ideas apuntadas

- Que el hilo de una operación archivada se pueda leer entero desde el
  histórico, empezando por su entrevista.

## ✅ Para probar a mano

Lo escribe el agente `qa-manual` cuando la implementación esté revisada.
