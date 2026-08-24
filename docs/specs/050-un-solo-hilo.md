# 050 — Un solo hilo: ver la conversación y las revisiones juntas

- **Estado:** ✅ completada. Implementada y desplegada el 2026-08-23; probada y confirmada por el usuario el 2026-08-24.
- **Fecha:** 2026-08-23
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v6: un solo hilo, decidida el 23 de agosto de 2026)", punto **"Un solo hilo con tu nutricionista"**.
- **Primera de tres.** La v6 va en 050 (esta: verlo todo en un hilo), 051 (una sola caja de texto y un solo cupo) y 052 (la entrevista de alta, también en el hilo). Se partió en tres **antes de escribir código**, cuando `revisor-specs` avisó de que juntarlo todo pasaba de 300 líneas.

## 1. Objetivo

La spec 023 se llamaba "una sola conversación" y, tras la v5, la pantalla de
Consulta tiene **dos hilos** en la misma pantalla. El usuario lo resumió el 23
de agosto: *"es un poco lío lo de la conversación más la consulta, igual mejor
que sea todo uno, que cuando pases consulta puedas ver el histórico de
conversación"*.

Esta spec resuelve exactamente eso —**verlo todo junto**— y nada más. La caja
de texto única y el cupo único son la 051; la entrevista, la 052.

## 2. Criterio de "esto funciona"

1. En **Consulta**, con una operación en marcha, hay **un solo hilo** con todo
   lo hablado en esta operación, ordenado por fecha: tus mensajes, las
   respuestas de la IA, los consejos de antes de la spec 023 y los mensajes de
   las revisiones que hayas pasado.
2. Donde empieza una revisión, el hilo lo **marca**: una línea que dice
   **"Revisión · 15 de agosto"**, distinta de un mensaje.
3. Al pasar una consulta nueva, sus mensajes aparecen **al final de ese mismo
   hilo**, y puedes leer hacia arriba lo que hablasteis antes.
4. Una revisión **en curso** también se ve en el hilo, no en un sitio aparte.
5. Las propuestas de dieta y tabla (spec 046) siguen saliendo al cerrarse una
   revisión.
6. **Ya no hay dos hilos en pantalla.** El bloque de la conversación y el de la
   revisión pasan a enseñar el mismo y único hilo.
7. Lo que ya tenías guardado se ve, sin migrar ni borrar nada.
8. Sigue habiendo **dos cajas de texto y dos cupos**, como hasta ahora: eso lo
   arregla la 051. Las dos siguen funcionando.
9. **Sin operación en marcha** todo sigue igual que hoy.

## 3. Alcance

### Entra

- Mezclar en un único hilo, por fecha: los mensajes de la conversación, los
  consejos antiguos y los mensajes de las revisiones.
- El separador que marca dónde empieza una revisión.
- Que la pantalla pinte ese hilo en un solo sitio.

### NO entra (explícitamente fuera)

- **Unificar las cajas de texto y los cupos.** Es la spec 051.
- **La entrevista de alta.** Es la spec 052; de momento sus mensajes siguen sin
  entrar en el hilo.
- **Migrar ni borrar datos.**
- **Cambiar lo que la IA responde**, sus instrucciones o su esquema.
- **Releer operaciones anteriores.**

## 4. Comportamiento detallado

### El hilo (`js/conversacion.js`)

`hiloCompleto(hilo, consejos)` ya mezcla por fecha los consejos de antes de la
spec 023 con los mensajes de la conversación. Pasa a
`hiloCompleto(hilo, consejos, revisiones)`.

De cada revisión se sacan sus mensajes y se les pone la **fecha de la consulta**
(`terminadaEn` o `creadaEn`), porque los mensajes de una consulta no llevan
fecha propia: solo los de la conversación la llevan, desde la 023.

Al primer mensaje de cada revisión se le marca `empiezaRevision` con la fecha,
para pintar el separador delante.

**Orden de concatenación**, que decide los empates dentro de un mismo día
(el `sort` es estable): primero los consejos antiguos, luego las revisiones,
luego los mensajes de la conversación. Es el orden de lo más viejo a lo más
nuevo por naturaleza de cada cosa.

Las revisiones **en curso** también entran: el criterio 4 lo pide, y así una
revisión a medias se lee en su sitio en vez de en un hueco aparte.

Qué es una revisión lo decide `esRevision()`, que hoy es privada en
`js/consulta.js` (spec 045) y pasa a exportarse. No se duplica el filtro:
duplicarlo es cómo se acaba con dos definiciones que se separan.

### La pantalla (`js/app.js`)

Hoy hay dos funciones que pintan: `pintarHilo()` (la consulta, en
`#hilo-consulta`) y `pintarConversacion()` (en `#hilo-conversacion`). Pasan a
ser **una sola** que pinta el hilo unificado en `#hilo-conversacion`, y
`#hilo-consulta` deja de usarse.

Se mantiene el estilo de burbuja que ya tiene cada mensaje según sea de la IA o
del usuario. El separador es un elemento aparte, no una burbuja.

### El separador (`styles.css`)

Una línea centrada, en gris y pequeña, con una regla horizontal a los lados o
un fondo tenue: tiene que leerse como una marca del hilo, no como algo que haya
dicho alguien.

## 5. Modelo de datos

- **No cambia nada en Firestore.** Los documentos de `consultas` siguen igual,
  cada uno con su `modo`.
- Los mensajes de la conversación siguen llevando `fecha`; los de las consultas
  siguen sin llevarla y la heredan al pintarse.
- `firestore.rules` no se toca.

## 6. Casos límite

- **Consultas viejas sin `terminadaEn` ni `creadaEn`.** Sus mensajes van sin
  fecha y por tanto al principio, igual que ya hacen los mensajes viejos de la
  conversación.
- **Operación sin nada hablado.** El hilo sale vacío con su texto de siempre.
- **Una revisión y un consejo el mismo día.** El orden lo decide la
  concatenación descrita arriba; no hay forma de saber cuál fue antes, porque
  los consejos solo guardan el día.
- **Hilo muy largo.** Con meses de conversación más las revisiones, la lista
  crece. No se pagina en esta spec: si al probarlo pesa, se anota.
- **Revisión en curso.** Sus mensajes se ven en el hilo, y el formulario de
  respuesta sigue siendo el suyo hasta la 051.

## 7. Archivos afectados

| Archivo | Qué cambia |
|---|---|
| `js/conversacion.js` | `hiloCompleto()` acepta las revisiones y las mezcla por fecha. |
| `js/consulta.js` | `esRevision()` pasa a exportarse. |
| `js/app.js` | Una sola función que pinta el hilo unificado; `#hilo-consulta` deja de usarse. |
| `styles.css` | El separador de revisión. |
| `docs/PRODUCTO.md` | Ya actualizado (apartado v6). |

No se toca `api/`, ni `firestore.rules`, ni los cupos, ni las cajas de texto.

Tamaño estimado: ~130 líneas.

## 8. Decisiones tomadas

- **La v6 se parte en tres, decidido antes de escribir código.** `revisor-specs`
  avisó de que juntar el hilo, las cajas y el cupo pasaba de 300 líneas (regla
  4). Partirlo después habría sido lo que el proyecto ya decidió no volver a
  hacer.
- **Esta primera entrega es la que resuelve lo que el usuario pidió**: ver el
  histórico de conversación al pasar consulta. Las otras dos quitan la
  duplicidad de cajas y de cupos.
- **Las revisiones en curso también se pintan en el hilo.** Si no, al empezar
  una consulta el hilo se quedaría atrás y habría que mirar a dos sitios: justo
  el problema que se está arreglando.

## 9. Fuera de spec: ideas apuntadas

- Poder leer el hilo de operaciones ya archivadas.
- Plegar una revisión larga para saltársela al leer hacia atrás.
- Paginar el hilo si con los meses se hace pesado.

## ✅ Para probar a mano

En producción (https://operacion-bikini.vercel.app), con una operación en
marcha. **Ojo: esta entrega solo junta lo que se VE.** Sigue habiendo dos cajas
de texto y dos cupos: eso lo quita la spec 051, y que sigan ahí no es un fallo.

### El hilo junto

1. Ve a **Consulta**. Debajo de "Habla con tu nutricionista" tiene que haber
   **un solo hilo** con todo lo de esta operación en orden: tus mensajes de
   siempre y también los de las revisiones que hayas pasado.
2. Donde empezó una revisión, se ve una línea centrada que pone **"REVISIÓN ·
   15 de agosto"** (con la fecha que toque), entre dos rayas. No es un mensaje:
   es una marca.
3. Si tienes **consejos antiguos** (de antes de que "Consejos" desapareciera),
   siguen saliendo en el hilo, con su "Consejo del …", en su fecha.
4. **Lo que antes salía arriba, en su propio hilo, ya no está ahí**: el bloque
   de la revisión ya no pinta una conversación aparte.

### Pasar una consulta nueva

5. Pulsa **"Pasar consulta"**. Los mensajes de la revisión tienen que aparecer
   **al final del hilo de abajo**, con su separador delante, y desde ahí puedes
   subir leyendo lo que hablasteis antes. Eso es justo lo que pediste.
6. Contesta con la caja de **"Tu respuesta"** (la de arriba, la de la revisión):
   tu mensaje se suma al mismo hilo.
7. Termina la consulta. El cierre queda en el hilo y las **propuestas** de dieta
   o tabla (si las hay) siguen saliendo donde salían.
8. **Recarga la página.** El hilo entero sigue ahí, revisión incluida.

### Que no se haya roto nada

9. Manda un mensaje normal con la caja de abajo ("Cuéntale cómo vas"): se añade
   al final y el contador de mensajes baja.
10. Los dos contadores siguen existiendo por separado, y está bien: "Te quedan N
    mensajes hoy" y el aviso de las consultas. La 051 los funde.
11. Con una operación recién empezada y nada hablado, el hilo sale vacío con su
    texto de siempre y no aparece ningún separador suelto.

### Lo que quiero que me digas

12. Con todo junto, ¿**se entiende** qué parte fue una revisión y qué parte fue
    charla? El separador es lo único que las distingue. Si no queda claro, dilo
    y se marca más.
