# 101 — Lo que toca hoy en Apuntar, y la fecha arreglada en "Lo he hecho"

- **Estado:** borrador
- **Fecha:** 2026-09-06
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v17: lo mismo, para Ejercicio)", primer punto

## 1. Objetivo

En Ejercicio → Apuntar, ver la sesión de hoy de Mi tabla con su botón "Lo he
hecho", sin tener que ir a Mi tabla. De paso, se arregla un fallo real: el
botón "Lo he hecho" —el de Mi tabla y el de este bloque nuevo— guarda siempre
con la fecha y la hora de hoy, sin mirar qué día se tocó.

## 2. Criterio de "esto funciona"

1. Con una tabla guardada que tenga sesión para hoy, entro en Ejercicio →
   Apuntar. Arriba del todo, antes de "Nuevo ejercicio", veo un bloque con el
   título de la sesión de hoy, sus minutos e intensidad, y su botón "Lo he
   hecho".
2. Pulso "Lo he hecho" en ese bloque. Se apunta en el diario con la fecha de
   hoy y la hora real de la pulsación (igual que hoy).
3. El bloque se refresca y dice que la sesión ya está apuntada hoy.
4. Vuelvo a pulsar el botón: pregunta "¿lo apunto otra vez?" antes de
   duplicar (mismo criterio que "me lo he comido", spec 094), y si acepto lo
   apunta de nuevo.
5. Voy a Mi tabla, toco un día **pasado** de esta semana (por ejemplo lunes,
   si hoy es jueves) y pulso "Lo he hecho" en su sesión. Se apunta en el
   diario con la **fecha del lunes**, sin hora (no se inventa una hora de un
   día que ya pasó).
6. Toco un día **futuro** de esta semana (por ejemplo viernes) y pulso "Lo he
   hecho". Se apunta con la **fecha del viernes**, sin hora, igual que un día
   pasado: no hay franja horaria que decida si es pasado o futuro, así que
   los dos se tratan igual.
7. Sin tabla guardada, o con la sesión de hoy vacía (día de descanso), el
   bloque de Apuntar enseña un texto explicándolo y un atajo a Mi tabla.
8. Bajo a "Lo que llevo apuntado" y compruebo que cada sesión apuntada tiene
   la fecha correcta según los pasos anteriores.

## 3. Alcance

### Entra
- Bloque nuevo al principio de Ejercicio → Apuntar, con la sesión de **hoy**
  de Mi tabla: título, minutos, intensidad y el botón "Lo he hecho".
- Marca de "ya la tienes apuntada hoy" cuando corresponda, sin impedir
  repetir.
- Estado vacío (sin tabla, o sesión de hoy vacía) con un texto y un atajo a
  Mi tabla.
- **Arreglo de fecha en `apuntarDeLaTabla()`** (Mi tabla y el bloque nuevo
  comparten esta función): pasa a guardar con la fecha real del día que se
  tocó en la tira, no siempre con la de hoy.
  - Si el día tocado **es hoy**: fecha de hoy, hora real de la pulsación
    (sin cambios respecto a como funciona hoy).
  - Si el día tocado **no es hoy** (pasado o futuro): fecha de ese día, **sin
    hora**. No hay franjas horarias en el ejercicio (una sesión es una al
    día, no cuatro momentos con horario), así que no hay ninguna hora que
    proponer, y no se aplica el aviso de "futuro" que sí tiene la spec 097:
    aquí no se inventa ninguna hora en ningún caso que no sea hoy.
- **Aviso de repetido**: antes de guardar, si ya hay una sesión apuntada ese
  mismo día con el mismo título, se pregunta "¿la apunto otra vez?" y no se
  impide continuar. Mismo criterio que `yaApuntada()` de comidas (spec 094),
  llevado al ejercicio.

### NO entra (explícitamente fuera)
- **No se puede editar el plan desde el bloque nuevo.** Cambiar lo que pone
  la tabla se sigue haciendo en Mi tabla.
- **No enseña el resto de la semana**: una sola sesión, la de hoy.
- **No marca en Mi tabla lo cumplido.** La marca vive solo en el diario y en
  el aviso puntual del bloque nuevo; la semana de Mi tabla se queda como
  está.
- **No enlaza el diario con el catálogo de ejercicios.** Eso es la spec 102.
- **No toca el Catálogo ni el armario de material.**
- **No añade ningún concepto de "momento" ni franja horaria al ejercicio.**
  Una sesión es una al día; esto no cambia con esta spec.

## 4. Comportamiento detallado

**Dónde va.** Dentro de la sub-pestaña Apuntar de Ejercicio, como primer
hijo, por delante de "Nuevo ejercicio" — mismo patrón que la spec 098 para
Comidas.

**Cálculo de fecha/hora al pulsar "Lo he hecho" (Mi tabla o el bloque
nuevo).** Se necesita saber a qué día real corresponde la fila tocada. Igual
que en `apuntarDeLaDieta()` (spec 097): la fecha real del día `indiceDia` se
calcula a partir de hoy y de `diaDeLaSemana(hoyISO())`, con `sumarDias()`.

- `indiceDia` corresponde al día de hoy → `fecha = hoyISO()`, `hora =
  horaActual()`.
- Cualquier otro `indiceDia` → `fecha` = la calculada, `hora = ""`.

**Aviso de repetido.** Nueva función `yaApuntado(ejercicios, fecha, texto)`
en `js/ejercicios.js`, espejo de `yaApuntada()` en `js/comidas.js`: mismo
día y mismo texto (normalizado sin tildes ni mayúsculas). Si ya existe, se
pregunta con `confirm()` antes de guardar, igual que hace
`apuntarDeLaDieta()`.

**Contenido del bloque nuevo, con sesión:**
- Título de la sesión.
- Minutos e intensidad, como ya se ven en la fila de Mi tabla.
- Botón "Lo he hecho", mismo icono que hoy.
- Si ya está apuntada hoy, un texto corto que lo diga, sin ocultar el botón.

**Contenido del bloque nuevo, sin sesión** (sin tabla guardada, o la sesión
de hoy está vacía/es descanso): un texto explicándolo y un atajo a Mi tabla.

**Errores y avisos del bloque nuevo son suyos**, no los de Mi tabla, por el
mismo motivo que la spec 098: `#error-semana-tabla`/`#guardado-tabla` viven
dentro de la sub-pestaña Mi tabla, oculta desde Apuntar. `apuntarDeLaTabla()`
pasa a aceptar los ids de sus elementos de error/aviso como parámetros
opcionales, igual que `apuntarDeLaDieta()` desde la spec 098.

## 5. Modelo de datos

Ninguno nuevo. El bloque lee la tabla activa y los ejercicios ya cargados, y
escribe por el mismo camino que Mi tabla (`guardarEjercicio`). No estrena
colección ni campo, así que **las reglas de Firestore no se tocan**.

## 6. Casos límite

- **No hay operación en marcha**: Ejercicio ya no deja apuntar nada; el
  bloque no se pinta, como el resto de la pantalla.
- **La tabla guardada tiene menos de siete días**: si el día de hoy no
  existe en ella, se trata como "sin sesión".
- **Se apunta un día pasado o futuro y luego se repite**: el aviso de
  repetido compara contra la fecha real con la que se va a guardar (la del
  día tocado), no contra "hoy" a secas — mismo cuidado que tomó la spec 097
  con `yaApuntada()` de comidas.
- **Sin conexión**: el botón responde con "no se ha guardado" y el mensaje
  de error del bloque que corresponda (el del bloque nuevo, o el de Mi
  tabla, según desde dónde se pulsó).
- **Se apunta un día sin hora (pasado o futuro) y luego se repite ese mismo
  día**: el aviso de repetido compara fecha y texto, no hora —igual que
  `yaApuntada()` de comidas—, así que detecta el duplicado sin problema
  aunque ninguno de los dos registros lleve hora.

## 7. Archivos afectados

- `index.html`: el bloque nuevo al principio de la sub-pestaña Apuntar de
  Ejercicio, con sus párrafos de error y de guardado propios.
- `js/app.js`: pintar el bloque nuevo; `apuntarDeLaTabla()` recibe el índice
  del día y los ids de error/aviso (parametrizados); nueva función para
  elegir/pintar la sesión de hoy.
- `js/ejercicios.js`: nueva función `yaApuntado(ejercicios, fecha, texto)`.
- `styles.css`: el bloque nuevo (puede reutilizar los estilos de
  `#bloque-toca-ahora` de la spec 098, generalizados o duplicados según
  convenga al implementar).
- `docs/specs/101-...-casos.mjs`: casos de `yaApuntado()`.

**Trampa conocida**: `filaDeSesion()` ya pinta el botón "Lo he hecho" en los
siete días de la tira (a diferencia de `filaDeComida()`, que necesitó que la
spec 097 quitase una restricción de "solo hoy"). Aquí no hay restricción que
quitar: el único cambio de `apuntarDeLaTabla()` es CÓMO calcula fecha/hora,
no CUÁNDO se muestra el botón.

## 8. Decisiones tomadas

- **Día pasado o futuro se apunta sin hora**, nunca con una hora inventada.
  Decisión del usuario: al no existir franjas horarias en el ejercicio (una
  sesión al día, no cuatro momentos), no hay ninguna hora "correcta" que
  proponer para un día que no es hoy.
- **Se añade el aviso de "¿la apunto otra vez?"**, que "Lo he hecho" nunca
  tuvo. Decisión del usuario, aprovechando que se toca esta función.
- **Sin sesión para hoy, el bloque enseña un texto y un atajo a Mi tabla**,
  en vez de esconderse. Decisión del usuario, coherente con la spec 098.
- El texto exacto de "ya apuntada hoy" y de "¿la apunto otra vez?" queda a
  criterio de implementación (no es una decisión de producto), igual que ya
  se dejó en la spec 097 para el aviso de futuro: solo tiene que decir
  claramente lo mismo que dicen hoy sus equivalentes de comidas.

## 9. Fuera de spec: ideas apuntadas

Ninguna surgida durante la escritura de esta spec.

## ✅ Para probar a mano

(la rellena/afina el agente `qa-manual` antes de la prueba)
