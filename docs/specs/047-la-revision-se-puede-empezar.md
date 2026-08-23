# 047 — La revisión se puede empezar de verdad

- **Estado:** 📝 pendiente de implementar.
- **Fecha:** 2026-08-23
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v5…)", punto **"Se puede pasar consulta cuando quieras, con la app avisando"**. No hay cambio de producto: PRODUCTO.md ya lo promete y el código no lo cumplía.

## 1. Objetivo

Detectado por el usuario el 23 de agosto, probando la v5 en el móvil: en
**Consulta** no salía nada, ni el botón de empezar ni el formulario para
contestar. Solo la conversación.

Causa: `#btn-empezar-consulta` vive dentro de `#bloque-entrevista`, y
`js/app.js` esconde ese bloque cuando `hayOperacion && !enCurso` — una regla de
la spec 023, de cuando con una operación en marcha lo único que existía era la
conversación. Resultado: **con una operación abierta no hay forma de empezar una
consulta**, así que la revisión que las specs 045 y 046 construyeron es
inalcanzable desde la interfaz.

Al terminar esta spec, con una operación en marcha se puede pasar consulta, y
la sección deja claro que ahí conviven dos cosas: la revisión periódica y la
conversación de todos los días.

## 2. Criterio de "esto funciona"

1. **Con una operación en marcha y sin consulta a medias**, en **Consulta** se
   ve: la línea de "Última consulta: hace N días" (spec 045), el botón para
   pasar consulta, y debajo la conversación. Las dos cosas a la vez.
2. Ese botón **se puede pulsar** y arranca una revisión.
3. Cada parte se entiende sin adivinar: la revisión lleva su título y la
   conversación el suyo.
4. **Con una consulta a medias**: se ve el hilo y el formulario **"Tu
   respuesta"**, y la conversación se esconde. Mientras hablas con el
   nutricionista en consulta, no hay dos sitios donde escribir.
5. Al terminar, vuelve a verse todo: el hilo con el cierre, sus propuestas si
   las hay (spec 046), el botón de empezar otra y la conversación.
6. **Sin operación en marcha** todo sigue como hasta ahora: manda la entrevista
   de bienvenida, con "Iniciar operación bikini" y su explicación, y la
   conversación no se ve.
7. El texto de la explicación **ya no promete un plan de nutrición y de
   ejercicio**: eso se retiró en la spec 044. Dice lo que hace de verdad.
8. Nada de lo demás cambia: los cupos (2 consultas, 20 mensajes), la
   conversación, el hilo persistente y las propuestas.

## 3. Alcance

### Entra

- Que el punto de entrada a la consulta sea visible con una operación en marcha.
- Separar en el HTML lo que hoy está mezclado en `#bloque-entrevista`: la
  explicación de la entrevista de bienvenida (que solo aplica sin operación) y
  el botón de empezar (que aplica siempre).
- Títulos que distingan la revisión de la conversación.
- Reescribir la explicación que sigue hablando de planes.

### NO entra (explícitamente fuera)

- **Cambiar cómo funciona la revisión** (specs 045 y 046): esto solo la hace
  alcanzable.
- **Cambiar la conversación**, su cupo o su sitio.
- **Cambiar los cupos** de nada.
- **Rediseñar la sección Consulta.** Se mueven bloques y se ponen dos títulos,
  no se replantea la pantalla.
- **Tocar `api/consulta.js`.** El backend ya hace lo correcto; el problema es
  que no se le llegaba a llamar.
- **Poder pasar consulta y charlar a la vez.** Con una consulta a medias la
  conversación se sigue escondiendo, como hasta ahora.

## 4. Comportamiento detallado

### El HTML (`index.html`)

`#bloque-entrevista` hace hoy dos trabajos y por eso se esconde de más: dentro
tiene la explicación de la entrevista de bienvenida **y** el botón de empezar.
Se separan:

- **`#bloque-revision`** (nuevo, sustituye a `#bloque-entrevista` como
  contenedor del botón): un `<h3>` "Revisión", `#ultima-revision`,
  `#btn-empezar-consulta`, `#aviso-consulta`, `#hilo-consulta`,
  `#propuestas-consulta` con su `#error-propuesta`, `#form-respuesta`, y
  también `#estado-consulta` y `#error-consulta`, que hoy son hermanos sueltos.
  Todo lo de la revisión dentro, para que se pueda enseñar y esconder de una
  pieza y no queden mensajes de error huérfanos flotando bajo la conversación.
- La explicación de la bienvenida (`#explicacion-inicial`) y el párrafo que
  hablaba de planes se quedan como párrafos que solo se ven **sin** operación.
- `#bloque-conversacion` gana un `<h3>` "Habla con tu nutricionista".

Los dos `<h3>` y no `<h2>`: el `<h2>` de la sección ya existe y estos son sus
dos partes, no dos secciones nuevas.

### La lógica (`js/app.js`)

En `pintarEstadoConsulta()`:

| Estado | Revisión | Conversación | Explicación de bienvenida |
|---|---|---|---|
| Sin operación | visible (es la entrevista) | oculta | visible |
| Con operación, sin consulta a medias | **visible** ← lo que falla hoy | visible | oculta |
| Con operación, consulta a medias | visible | oculta | oculta |

Es decir: el bloque de la revisión **ya no se esconde nunca**; lo que cambia es
su contenido (botón o formulario) y quién le acompaña. La regla
`hayOperacion && !enCurso` deja de aplicarse al botón y pasa a aplicarse solo a
la explicación de la bienvenida.

El `<h3>` "Revisión" se esconde sin operación en marcha: ahí lo que toca es la
entrevista de alta, y llamarla "revisión" sería mentir.

### El texto que hay que reescribir

Hoy: *"La IA te entrevista como haría un nutricionista y, cuando tiene datos
suficientes, te genera un plan de nutrición y de ejercicio."* Los planes se
retiraron en la spec 044. Pasa a explicar la entrevista de alta, que es lo
único a lo que ese párrafo aplica ahora.

## 5. Modelo de datos

Sin cambios. No se toca Firestore, ni `firestore.rules`, ni la IA.

## 6. Casos límite

- **Recién terminada una consulta.** Sigue mandando el mensaje "Consulta
  terminada…" y el botón "Empezar otra consulta" (spec 045), y ahora además se
  ve la conversación debajo. Correcto: son dos cosas distintas.
- **Sin cupo de consultas hoy.** El botón se deshabilita con su aviso, como
  hasta ahora, pero **se ve**. Antes, con operación en marcha, no se veía ni el
  aviso.
- **Sin operación en marcha.** Es el camino que hoy funciona y el que más fácil
  se rompe al mover estos bloques. Hay que probarlo entero.
- **El hilo con una consulta a medias.** Se sigue viendo el de la consulta en
  curso, no el de la última terminada (spec 046).

## 7. Archivos afectados

| Archivo | Qué cambia |
|---|---|
| `index.html` | Se reparte `#bloque-entrevista` en el bloque de la revisión y los párrafos de la bienvenida; dos `<h3>`. |
| `js/app.js` | `pintarEstadoConsulta()`: qué se esconde y cuándo. |
| `styles.css` | Solo si los dos `<h3>` piden algún ajuste de separación. |
| `docs/ESTADO.md` | Al terminar. |

No se toca `api/consulta.js`, ni `js/consulta.js`, ni `firestore.rules`.

Tamaño estimado: ~80 líneas. Muy por debajo del límite de 300.

## 8. Decisiones tomadas

- **La revisión y la conversación se ven a la vez.** Es lo que describe
  PRODUCTO.md desde la v5: un nutricionista al que preguntas dudas cuando
  quieras **y** que además te pasa consulta cada cierto tiempo. Esconder una
  para enseñar la otra era una herencia de cuando solo existía la conversación.
- **Con una consulta a medias la conversación sí se esconde.** Dos cajas de
  texto a la vez, cada una hablando con la misma IA por un camino distinto y
  con cupos distintos, es una forma segura de que el usuario escriba en la que
  no quería.
- **Esto es un arreglo, no una feature.** PRODUCTO.md ya prometía poder pasar
  consulta cuando quisieras; el código no lo cumplía porque el botón estaba
  dentro de un bloque que se escondía. No hace falta cambiar PRODUCTO.md.

## 9. Fuera de spec: ideas apuntadas

- **Sub-pestañas en Consulta** (Revisión / Conversación), como Comidas y
  Ejercicio en la spec 035. Con las dos partes a la vez la sección se hace
  larga en móvil: el hilo de la última revisión y el de la conversación se
  apilan enteros. Se deja fuera a propósito porque esta spec es un arreglo de
  algo que no se puede usar, y meterle un rediseño encima retrasa el arreglo.
  Si al probarlo el scroll molesta, esa es la spec siguiente.

## ✅ Para probar a mano

En producción (https://operacion-bikini.vercel.app), **en el móvil**, que es
donde salió el fallo. Con la operación en marcha que ya tienes.

### Que se pueda empezar (el arreglo)

1. Ve a **Consulta**. Ahora tiene que verse:
   - el título **"Revisión"**,
   - la línea **"Última consulta: hace N días"** (o "Aún no has pasado ninguna
     revisión en esta operación"),
   - el **botón** de pasar consulta,
   - y más abajo, el título **"Habla con tu nutricionista"** con la
     conversación de siempre.
   Antes de esto no salía nada de lo de arriba: ese era el fallo.
2. **Pulsa el botón.** Tiene que arrancar la revisión: la IA te hace una
   pregunta y aparece el formulario **"Tu respuesta"**.
3. Mientras la consulta está a medias, **la conversación desaparece**. Es a
   propósito: dos cajas de texto hablando con la misma IA por caminos distintos
   se prestan a escribir en la que no querías.
4. Contesta y termina la consulta. Al cerrarse vuelve a verse todo: el hilo con
   el cierre, el botón de "Empezar otra consulta" y la conversación debajo.

### Lo que ya venía de las specs 045 y 046, que hasta ahora no podías probar

5. El primer mensaje de la IA **habla de tus datos** (peso, constancia, lo
   apuntado), no de generalidades ni de preguntas de entrevista.
6. Si te propone dieta o tabla, salen los botones **"Pedir esa dieta"** /
   **"Pedir esa tabla"** debajo del hilo. Puede no proponer nada, y es lo
   normal.
7. **Recarga la página (F5)** y vuelve a Consulta: el hilo de esa consulta
   sigue ahí, con su cierre y sus botones.

### Que no se haya roto el alta

8. Esto es lo más frágil de esta spec, y como ibas a reiniciar de todas formas:
   finaliza la operación en **Ajustes → Operación** y vuelve a **Consulta**.
   Tiene que verse la explicación de la entrevista y el botón **"Iniciar
   operación bikini"**, **sin** el título "Revisión" y **sin** la conversación.
9. El texto de esa explicación **ya no debe hablar de "un plan de nutrición y
   de ejercicio"**: eso se retiró en la spec 044.
10. Haz la entrevista entera. Al terminar tiene que rellenarte Ajustes y abrir
    la operación, y la pantalla volver al estado del paso 1.

### Lo que quiero que me digas

11. Con revisión y conversación a la vez, **la sección es más larga en el
    móvil**. Dime si te molesta el scroll: si es que sí, la siguiente spec le
    pone sub-pestañas (Revisión / Conversación), como Comidas y Ejercicio.
