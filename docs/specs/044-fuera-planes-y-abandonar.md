# 044 — Fuera los planes y fuera "Abandonar consulta"

- **Estado:** 📝 pendiente de implementar.
- **Fecha:** 2026-08-22
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v5: la consulta como revisión periódica, decidida el 22 de agosto de 2026)", puntos **"Abandonar consulta desaparece"** y **"Los planes desaparecen como concepto"**.
- **Primera de tres.** La v5 se reparte desde el principio en 044 (esta: quitar lo que sobra y cambiar lo que produce una consulta), 045 (la consulta como revisión de lo hecho desde la anterior) y 046 (que proponga dieta o tabla). No se parte más a posteriori.

## 1. Objetivo

Consulta arrastra el modelo de cuando no existían la dieta ni la tabla
semanales: una consulta termina pariendo un "plan" de texto que duplica, peor,
lo que ya viven en Comidas y en Ejercicio. Y para salir de una consulta a
medias hay un botón de "Abandonar consulta" que además **falla** (el usuario
lo vio el 22 de agosto).

Al terminar esta spec, la consulta termina con **su propio cierre** —el repaso
y lo que toca, leído en el hilo—, la sección "Mis planes" ya no existe, y el
botón de abandonar tampoco.

## 2. Criterio de "esto funciona"

1. En **Consulta** ya no aparece por ninguna parte el botón **"Abandonar
   consulta"**, ni con una consulta a medias ni sin ella.
2. En **Consulta** ya no aparece la sección **"Mis planes"** ni el texto "Aún
   no tienes ningún plan".
3. Una consulta a medias se puede **retomar**: sales de la sección, vuelves, y
   la conversación sigue donde estaba, con su formulario de respuesta.
4. Al terminar una consulta, lo último que dice la IA **se lee en el propio
   hilo**, como un mensaje más, y ya no se crea ninguna tarjeta de plan.
5. Ese cierre incluye el repaso y lo que toca hacer, en prosa. No es un menú
   comida a comida ni una rutina día a día: para eso ya están la dieta y la
   tabla.
6. Terminada la consulta, el formulario de respuesta desaparece y el botón
   vuelve a decir **"Empezar otra consulta"**, con su aviso de cupo. Eso lo
   decide `pintarEstadoConsulta()` a partir de `consultasCargadas`, que esta
   spec no toca.
7. **El cupo de dietas y tablas sigue funcionando**: pide dos dietas el mismo
   día y comprueba que el botón se deshabilita a la tercera. Y al abrir el
   formulario de pedir, las instrucciones siguen viniendo rellenas con las
   últimas (spec 040).
8. **La entrevista de bienvenida sigue funcionando igual de principio a fin**:
   sin operación en marcha, "Iniciar operación bikini" entrevista, deja los
   ajustes y el perfil rellenos, y abre la operación.
9. La **conversación** (el hilo que dura toda la operación, con sus 20 mensajes
   al día) sigue funcionando exactamente igual.
10. Los planes que ya había guardados **no se borran** de Firestore: solo dejan
   de enseñarse.
11. Los cupos no cambian: 2 consultas al día, 20 mensajes de conversación, 2
    dietas y 2 tablas.

## 3. Alcance

### Entra

- Quitar `#btn-abandonar` de `index.html` y todo su código en `js/app.js` y
  `js/consulta.js` (`abandonarConsulta()`).
- Quitar la sección "Mis planes": **su HTML y `pintarPlanes()`, y nada más**.
  `listarPlanes()` y el estado `planesCargados` **se quedan**: ver la trampa de
  abajo, es lo más importante de esta spec.
- Cambiar lo que la IA devuelve al cerrar una consulta: de `{tipo: "plan",
  nutricion, ejercicio}` a un cierre en un solo texto, que se guarda como
  último mensaje del hilo en vez de como documento de `planes`.

### NO entra (explícitamente fuera)

- **Que la consulta repase lo hecho desde la anterior.** Es la spec 045.
- **Que la consulta proponga dieta o tabla.** Es la spec 046.
- **Borrar los documentos de `planes` de Firestore.** Decidido explícitamente
  en contra (ver sección 8).
- **Quitar la colección `planes` de las reglas de Firestore ni del reinicio de
  datos.** Los documentos siguen ahí, así que sus reglas y su casilla de
  borrado siguen haciendo falta.
- **`listarPlanes()`, `planesCargados`, `guardarMarcaDePlan()`, `pedidosHoy()`
  y `quedanPlanesHoy()`.** Pese al nombre, no son los planes que se retiran:
  son el **cupo diario de dietas y tablas** (spec 027) y el autorrelleno de
  instrucciones (spec 040). Tocarlos rompe las dos. Ver la sección 6.
- **Ningún cambio en la conversación ni en la entrevista de bienvenida**, más
  allá de lo que arrastre el cambio de formato de cierre.
- **Ningún cambio en Comidas ni en Ejercicio.**

## 4. Comportamiento detallado

### Lo que la IA devuelve (`api/consulta.js`)

Hoy el esquema tiene `tipo: ["pregunta", "plan"]` y dos campos de salida,
`nutricion` y `ejercicio`. Pasa a tener `tipo: ["pregunta", "cierre"]` y un
solo campo nuevo, `cierre`.

- `nutricion` y `ejercicio` **se quedan en el esquema**, vacíos siempre, hasta
  la spec 046. Quitarlos ahora obligaría a tocar `guardarLoAveriguado()` y el
  modo de bienvenida en la misma spec; se hace de una vez en la 046, que es la
  que vuelve a mover ese esquema. Está escrito en las instrucciones que deben
  ir vacíos.
- Regla del proyecto que aquí manda: **todos los campos van como `required`,
  aunque estén vacíos**. Con campos opcionales, Gemini se los salta.
- Las instrucciones (`INSTRUCCIONES`) dejan de pedir un plan y pasan a pedir un
  cierre: qué ha ido bien, qué se ha torcido y qué toca ahora, en prosa y como
  máximo 200 palabras. Se dice explícitamente que **no** haga un menú comida a
  comida ni una rutina día a día, porque de eso se encargan la dieta y la tabla.

### El reintento del campo que falta (`api/consulta.js`)

Hoy, cuando la IA manda `tipo: "plan"` con `nutricion` pero sin `ejercicio`,
hay un reintento que pide solo el bloque que falta antes de tirar la entrevista
a la basura. **Ese bloque se borra entero**: con un solo campo de salida
(`cierre`) ya no hay dos partes que puedan llegar a medias. Un `cierre` vacío
se trata como respuesta ilegible, que es el camino que ya existe para eso. No
se sustituye por un reintento equivalente: reintentar un texto en prosa que ha
llegado vacío es gastar otra llamada de cuota para el mismo resultado.

### El cierre de la consulta (`js/consulta.js`)

En `responder()`, la rama `respuesta.tipo === "plan"` pasa a ser
`respuesta.tipo === "cierre"` y cambia lo que hace:

- **Ya no** hace `addDoc(planesDe(uid), …)`.
- El texto del cierre se guarda como **un mensaje más de la IA** al final del
  hilo, para que se lea en su sitio: `mensajes: [...mensajes, {de: "ia", texto:
  respuesta.cierre}]`, y la consulta pasa a `estado: "terminada"` con su
  `terminadaEn`.
- La parte de la entrevista de bienvenida (`guardarLoAveriguado()` y
  `crearOperacion()`) **se queda intacta**: sigue disparándose cuando el modo
  es `inicial` o `reinicio`.

`abandonarConsulta()` se borra entera.

### La pantalla (`index.html` y `js/app.js`)

- Fuera `#btn-abandonar` y su listener.
- Fuera el bloque de "Mis planes" y `pintarPlanes()`, **y solo eso**.
- `refrescarConsulta()` **sigue llamando a `listarPlanes()` y sigue llenando
  `planesCargados`**. Lo único que desaparece es la llamada a `pintarPlanes()`.
  No hay una lectura menos de Firestore: esa lectura la necesitan el cupo y el
  autorrelleno.
- `pintarEstadoConsulta()` pierde la línea del botón de abandonar. El resto de
  su lógica de tres estados no cambia.
- El aviso "Consulta terminada. Tu plan es el primero de la lista." deja de ser
  cierto: pasa a "Consulta terminada. Lo que te ha dicho está al final de la
  conversación."

## 5. Modelo de datos

- **No se borra nada.** La colección `usuarios/{uid}/planes` sigue existiendo,
  con sus documentos, sus reglas y su casilla en el reinicio de datos.
- Los documentos de consulta no cambian de forma: el cierre es un mensaje más
  dentro del array `mensajes` que ya existe.
- `firestore.rules` **no se toca**, así que esta spec no necesita publicarlas.

## 6. Casos límite

- **La trampa del nombre `planes`, que es la que puede hundir esta spec.** En
  esa colección conviven dos cosas distintas: los planes que se retiran, y las
  **marcas de cupo** de dietas y tablas que escribe `guardarMarcaDePlan()` con
  `esPlanSemanal: true` (spec 027). El array `planesCargados` **no alimenta
  solo la sección que se quita**: lo leen también

  | Quién | Dónde (`js/app.js`) | Para qué |
  |---|---|---|
  | `generarDieta()` | ~1792 | ¿me queda cupo de dieta hoy? |
  | `generarTabla()` | ~2323 | ¿me queda cupo de tabla hoy? |
  | `pintarEspecializadas()` | ~2882 | el texto de cupo y si el botón se puede pulsar |
  | El autorrelleno de la spec 040 | ~2896 | las últimas instrucciones que usaste |

  Y solo se llena en un sitio: `refrescarConsulta()` (~2969), justo después de
  `listarPlanes()` (~2958). **Si se borran `listarPlanes()` o `planesCargados`,
  el cupo de dietas y tablas pasa a estar siempre entero (nunca se agota) y el
  autorrelleno de instrucciones deja de funcionar.** Se quedan las dos.
- **Consultas terminadas antes de esta spec.** Su cierre está en un documento
  de `planes`, no en el hilo, así que al mirarlas no se verá el final. Es
  aceptado: son consultas viejas y ya se leyeron en su día.
- **Consultas a medias en el momento del despliegue.** Siguen `en-curso` y se
  pueden retomar; cuando terminen, lo harán con el formato nuevo.
- **La IA devuelve `tipo: "plan"`** (por caché del modelo o por un despliegue a
  medias): no encaja en ninguna rama y la consulta se quedaría colgada. Se
  trata como respuesta ilegible, que es el camino que ya existe.
- **La entrevista de bienvenida.** Es la que más puede romperse, porque
  `guardarLoAveriguado()` lee campos de la misma respuesta. Hay que probarla
  entera, no solo la consulta normal.

## 7. Archivos afectados

| Archivo | Qué cambia |
|---|---|
| `api/consulta.js` | `tipo` pasa de `plan` a `cierre`, campo `cierre` nuevo, instrucciones reescritas. |
| `js/consulta.js` | `responder()` guarda el cierre en el hilo; fuera `abandonarConsulta()`. **`listarPlanes()` se queda.** |
| `js/app.js` | Fuera el listener de abandonar y `pintarPlanes()`; aviso de consulta terminada reescrito. **`planesCargados` y su carga se quedan.** |
| `index.html` | Fuera `#btn-abandonar` y el bloque de "Mis planes". |
| `docs/PRODUCTO.md` | Ya actualizado (apartado v5). |
| `docs/ESTADO.md`, `docs/BACKLOG.md` | Al terminar. |

No se toca `firestore.rules`, ni `js/reinicio.js`, ni Comidas, ni Ejercicio.

Tamaño estimado: ~180 líneas, la mayoría borradas. Por debajo del límite de 300.

## 8. Decisiones tomadas

Decisiones de producto confirmadas por el usuario el 22 de agosto de 2026:

- **Los planes se retiran, no se borran.** Quitar la sección es reversible;
  borrar documentos de Firestore no. Y el histórico de lo que la IA fue
  diciendo no molesta a nadie donde está.
- **"Abandonar consulta" no se arregla: se quita.** El usuario lo vio fallar
  con "No se ha podido abandonar la consulta. Comprueba tu conexión.". La causa
  exacta **no se ha confirmado**: el `catch` del listener traga por igual un
  fallo de red y un `TypeError` de `consultaAbierta.id` sobre `null`, y el
  botón no se deshabilita durante el `await` (a diferencia del resto de
  formularios de la app), así que una doble pulsación también lo explicaría. No
  se ha investigado más porque arreglarlo sería trabajo tirado: la acción no
  tiene sentido en el modelo nuevo. Una consulta a medias se retoma.
- **El cierre se lee en el hilo, no en una tarjeta aparte.** Es lo que hace un
  nutricionista: te lo dice al final de la consulta. Una tarjeta separada era
  justo lo que hacía que el plan pareciera un documento y no una conversación.
- **`nutricion` y `ejercicio` siguen en el esquema, vacíos, hasta la 046.**
  Vaciar el esquema y a la vez cambiar el modo de bienvenida en la misma spec
  es meter dos cambios delicados en el mismo sitio. La 046 vuelve a tocar ese
  esquema de todas formas.

## 9. Fuera de spec: ideas apuntadas

- Poder releer las consultas anteriores enteras, no solo la última.
- Limpiar de verdad los documentos de `planes` cuando se confirme que nadie los
  echa de menos.

## ✅ Para probar a mano

En producción (https://operacion-bikini.vercel.app), con una operación en
marcha. **Ojo: pasar una consulta gasta cupo de IA y no se puede deshacer.**

### Lo que tiene que haber desaparecido

1. Ve a **Consulta**. Ya no está la sección **"Mis planes"** ni el texto "Aún
   no tienes ningún plan" del final.
2. No se ve por ninguna parte el botón **"Abandonar consulta"**.

### La consulta, de principio a fin

3. Dale a **"Empezar consulta"**. La IA te hace una pregunta.
4. Responde. Sal de Consulta (vete a Hoy) y vuelve: la conversación **sigue
   donde estaba**, con su formulario de respuesta. Eso es "retomarla".
5. Sigue respondiendo hasta que la IA cierre. **Lo último que dice se lee en el
   propio hilo**, como un mensaje más, y no aparece ninguna tarjeta de plan.
6. Ese cierre tiene que hablarte de pautas y de qué toca, en prosa. **No debe
   ser un menú comida a comida ni una rutina día a día**: si sale eso, las
   instrucciones de la IA no han cogido.
7. Terminada, el formulario de respuesta desaparece y el botón dice **"Empezar
   otra consulta"**, con el aviso de cuántas te quedan hoy.

### Que no se haya roto el cupo (lo más importante)

8. **Comidas → Mi dieta → "Pedírsela a la IA"**: comprueba que el formulario se
   abre con las **instrucciones de la última vez ya escritas** (spec 040).
9. Pide una dieta. Vuelve a abrir el formulario: sigue diciendo cuántas te
   quedan hoy, y el número ha bajado.
10. Pide la segunda. A la tercera, el botón tiene que estar **deshabilitado**
    con su aviso. Si te deja pedir una tercera, el cupo está roto y eso es el
    fallo que había que evitar.
11. Lo mismo en **Ejercicio → Mi tabla**, que lleva su propio cupo.

### La conversación y la entrevista

12. **Consulta → la conversación de abajo**: manda un mensaje. Responde igual
    que siempre y el contador de "Te quedan N mensajes hoy" baja.
13. **La entrevista de bienvenida** (esto solo si vas a cerrar la operación de
    verdad, o con otra cuenta): finaliza la operación en **Ajustes →
    Operación**, y en Consulta dale a **"Iniciar operación bikini"**.
    Contéstala entera. Al cerrarse tiene que: dejarte el cierre en el hilo,
    **rellenar Ajustes** (nombre, altura, peso objetivo, fecha) y **abrir la
    operación** para que puedas volver a apuntar. Es lo que más fácil se rompe
    con este cambio.
