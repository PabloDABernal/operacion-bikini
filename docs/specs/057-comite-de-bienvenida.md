# 057 — El comité de bienvenida

- **Estado:** ✅ revisada por `revisor-specs` (25 de agosto); lista para
  implementar.
- **Fecha:** 2026-08-25
- **Referencia en PRODUCTO.md:** apartado **"Qué hará (v7: el comité de
  bienvenida)"**, añadido el 25 de agosto (el texto está también en el anexo).
- **Primera y única de la v7.** El usuario decidió el 25 de agosto no partirla,
  avisado de que pasa de 300 líneas (ver sección 10).

## 1. Objetivo

El usuario hizo la entrevista de bienvenida limpia (specs 052-056) y dijo lo
que se veía venir: *"estamos tardando para cosas estándar"*. La IA le preguntó
el nombre, luego la altura, luego el peso, luego el objetivo — una pregunta por
turno, un viaje al proxy por cada una, para datos que caben en un formulario.

Al terminar esta spec, abrir una operación es rellenar **un formulario con todo
de serie** y darle a un botón. La IA solo repregunta si falta algo o algo no
cuadra; si no tiene dudas, va directa a los primeros consejos y deja creadas la
dieta de la semana y la tabla de ejercicio.

## 2. Criterio de "esto funciona"

1. **Sin operación en marcha**, en Consulta hay un **formulario** con todos los
   campos, no un botón que abre un chat.
2. Con el formulario **entero relleno**, al enviarlo la IA **no pregunta nada**:
   contesta directamente con los primeros consejos, y ahí acaba el alta.
3. La operación queda abierta y **Ajustes relleno** con lo del formulario:
   nombre, altura, peso objetivo y fecha objetivo.
4. El **peso actual** del formulario aparece como **pesaje de hoy** en Peso, y
   la gráfica arranca ya con un punto.
5. Con las dos casillas marcadas (lo están por defecto), al terminar el alta hay
   **una dieta de la semana en Comidas** y **una tabla en Ejercicio**, hechas a
   partir de lo que has contado.
6. El cierre **lo dice**: menciona que te ha dejado la dieta y la tabla listas,
   y no las menciona si no las creó.
7. Enviando el formulario **con huecos** (por ejemplo, sin aversiones), la IA
   pregunta por lo que falta, **de una en una**, en el hilo de siempre y con la
   caja de siempre. Como mucho **tres** veces; después cierra con lo que tenga.
8. El hilo de la operación **empieza por el alta**, con su separador
   **"Entrevista de bienvenida · fecha"** (spec 052), y dentro se lee lo que
   rellenaste y lo que te contestó.
9. Al abrir una **operación nueva** (segunda, tercera…) sale **el mismo
   formulario, prerrellenado** con lo que la IA ya sabía de ti. Cambias lo que
   haya cambiado y envías.
10. Sin cupo de mensajes, el formulario **no deja enviar** y lo dice, igual que
    hoy hace el botón.

## 3. Alcance

### Entra
- El formulario de alta, con sus campos y sus dos casillas.
- La llamada al proxy con todo de golpe, y las repreguntas (máximo 3).
- Guardar el peso actual como pesaje del día.
- Crear la dieta y la tabla al cerrar el alta, si las casillas están marcadas.
- Que el cierre mencione lo que ha creado.
- Que el formulario sirva también para las operaciones siguientes,
  prerrellenado.

### NO entra (explícitamente fuera)
- **La revisión periódica y la conversación.** Siguen siendo chat, y no se
  tocan. Esto es solo el alta.
- **El hilo, la caja y el cupo** de las specs 050-054. Se usan tal cual.
- **Cambiar la dieta y la tabla** ni cómo se piden desde Comidas y Ejercicio.
  Aquí se llaman las mismas funciones que usa el botón de cada sección.
- **Cambiar `PLANES_POR_DIA`** (2 al día de cada tipo). La dieta y la tabla del
  alta gastan de ese cupo como cualquier otra.
- **Que el alta gaste cupo de mensajes.** Sigue sin gastar (decisión de la spec
  055), aunque sigue bloqueada si el cupo está a 0.
- **Editar el formulario una vez enviado.** Lo que se corrige después se corrige
  en Ajustes, como hasta ahora.

## 4. Comportamiento detallado

### 4.1 El formulario

Vive en Consulta, donde hoy está el botón "Iniciar operación bikini", y solo se
ve **sin operación en marcha**. Campos, en este orden:

| Campo | Tipo | Obligatorio |
|---|---|---|
| Cómo quieres que te llame | texto | sí |
| Altura (cm) | número | sí |
| Peso actual (kg) | número | sí |
| Peso objetivo (kg) | número | sí |
| Para cuándo | fecha | no |
| Comidas que te gustan | texto largo | no |
| Comidas que no soportas | texto largo | no |
| Alergias e intolerancias | texto largo | no |
| Ejercicio que disfrutas | texto largo | no |
| Material con el que cuentas | texto largo | no |
| Lesiones o limitaciones | texto largo | no |

Los cuatro obligatorios son los que alimentan la gráfica y las estadísticas:
sin ellos la app no puede hacer su trabajo. El resto son del retrato, y su hueco
es justo lo que la IA repregunta.

**Ojo con la validación, que hoy vive en dos sitios.** El nombre, la altura, el
peso objetivo y la fecha objetivo los valida `validarAjustes()` (`js/ajustes.js`).
El **peso actual no**: ese campo no existe en esa función, y su equivalente es
`validarPesaje()` (`js/pesajes.js`), que comprueba el rango de 20 a 300 kg. Que
los rangos coincidan es casualidad, no diseño.

El formulario valida **antes de llamar a la IA**, con esas dos funciones y sus
límites de siempre: `validarAjustes()` para los cuatro de ajustes y
`validarPesaje()` para el peso actual. Un valor fuera de rango no llega al
proxy: se marca en el campo y no se envía. Que la IA "repregunte si no cuadra"
es para lo que un número no puede decidir —un objetivo imposible en el plazo—,
no para una altura de 900 cm.

Debajo, dos casillas **marcadas por defecto**:

- ☑ Créame ya una dieta de la semana
- ☑ Créame ya una tabla de ejercicio

Y el botón: **"Empezar mi operación bikini"**.

### 4.2 Lo que viaja al proxy

Una llamada, modo `inicial` (o `reinicio`, ver 4.6). El formulario se convierte
en un **primer mensaje de usuario** en prosa, no en campos sueltos del cuerpo:

> Me llamo Pau. Mido 164 cm y peso 81 kg. Quiero llegar a 67 kg para el
> 2027-06-01. Me gustan las cremas y los purés. No soporto el pescado azul.
> Alergias: ninguna. Disfruto caminando y jugando al pádel. Tengo mancuernas en
> casa. Sin lesiones.

Los campos vacíos **se omiten de la frase**: no se escribe "Alergias: (vacío)",
porque entonces la IA no sabría distinguir "no tengo" de "no lo he dicho", que
es justo lo que tiene que repreguntar.

Ese mensaje se guarda como el **primer mensaje del hilo** (`de: "usuario"`), así
que la entrevista de bienvenida se lee entera en el hilo (spec 052) y se ve qué
contaste.

### 4.3 Las repreguntas

`INSTRUCCIONES_INICIAL` cambia de forma: deja de ser "entrevista de una en una"
y pasa a ser "te dan una ficha, mira qué falta".

> Esta persona acaba de rellenar su ficha de alta y te la ha mandado entera.
> NO la entrevistes desde cero: ya te ha contado lo que ves.
> Si te falta algo importante para poder aconsejarla —gustos, aversiones,
> alergias, ejercicio, material o limitaciones— pregúntaselo, UNA cosa por
> turno. Si el dato está pero no cuadra (un objetivo imposible en el plazo que
> dice, una altura o un peso que no puede ser), dilo y pregúntale.
> Si no te falta nada, NO preguntes: cierra directamente con tus primeros
> consejos.

El tope: **3 repreguntas** en modo alta. Se implementa como el suelo de la spec
055, pero al revés y en la misma línea de código: `debeCerrar` pasa a ser cierto
también cuando el alta lleva ya 3 preguntas hechas, y entonces se le manda la
instrucción de cerrar que ya existe.

El **suelo** de 8 preguntas de la spec 055 **desaparece**: existía porque la
entrevista tenía que sacar los datos a base de preguntas, y ahora los recibe de
golpe. Cerrar sin preguntar nada pasa de ser un fallo a ser el caso bueno.

Quitarlo son **dos cosas, no una**: la constante `MINIMO_PREGUNTAS` y la
variable `puedeCerrar`, pero también **el bloque de reintento entero** que
cuelga de ella (el que, si la IA cerraba antes de tiempo, le pedía otro turno
insistiendo en que preguntara). Borrar solo la constante deja ese bloque
huérfano. Está comprobado que `MINIMO_PREGUNTAS` y `puedeCerrar` no se usan
fuera de `api/consulta.js`, así que el borrado es limpio.

### 4.4 El cierre y lo que se guarda

**Los cuatro campos duros NO viajan por la IA.** Este es el cambio de fondo
respecto a la entrevista conversada, y hay que entender por qué.

Antes, `nombre`, `alturaCm`, `pesoObjetivoKg` y `fechaObjetivo` solo existían
dentro de la respuesta de la IA: se los había sacado hablando, así que no había
otra forma de conocerlos. Con el formulario, **el navegador ya los tiene
tecleados por el usuario antes de llamar al proxy**. Hacerlos ir y volver por la
IA es un viaje que solo puede estropearlos: reescribir 164 cm como 163, redondear
el peso, reformatear la fecha. Y hay algo peor: si `guardarLoAveriguado()`
considera que un campo no vale, **lo descarta en silencio** (`js/ajustes.js`), de
modo que un dato bien escrito por el usuario podría no llegar nunca a Ajustes.
Eso rompería el criterio 3.

Por tanto, al cerrar el alta:

- **Del formulario, directo:** `nombre`, `alturaCm`, `pesoObjetivoKg` y
  `fechaObjetivo`, ya validados en 4.1. Se guardan con `guardarAjustes()`.
- **De la IA:** el `perfil` (el retrato en prosa) y el `cierre`. Son lo único
  que ella sabe escribir y que el formulario no puede recoger.

`guardarLoAveriguado()` se sigue usando **solo para el perfil**, o se le pasan
los campos duros ya buenos: da igual cuál de las dos, mientras el valor que
acabe en Firestore sea el del formulario y no el que la IA haya repetido.

El esquema de respuesta del proxy (`ESQUEMA` en `api/consulta.js`) **no se
toca**: sus campos son obligatorios por una limitación de Gemini documentada en
el proyecto, así que la IA los seguirá devolviendo. Simplemente se ignoran los
cuatro duros en el modo alta.

`crearOperacion()` se llama igual que hoy.

Dos añadidos, **en este orden**, después de crear la operación:

1. **El pesaje.** El peso actual del formulario se guarda como pesaje con la
   fecha de hoy. Va **después** de `crearOperacion()` a la fuerza: sin operación
   en marcha la app no deja apuntar nada, y escribirlo antes dejaría un registro
   fuera de ciclo.
2. **La dieta y la tabla**, si sus casillas estaban marcadas.

### 4.5 La dieta y la tabla

Se piden con las mismas funciones que el botón de Comidas y el de Ejercicio, sin
instrucciones propias del usuario: la IA ya tiene el perfil recién guardado, que
es de donde tiene que salir la semana.

Reglas:

- **Van después del cierre y no lo bloquean.** El alta se da por terminada en
  cuanto hay operación y ajustes; la dieta y la tabla se piden a continuación,
  con el hilo ya pintado y un aviso de "Montando tu dieta y tu tabla…".
- **Si una falla, el alta NO se cae.** Se avisa de que esa no se pudo crear y se
  puede pedir luego desde su sección, como siempre. Una operación abierta sin
  dieta es un inconveniente; un alta rota es perder la entrevista entera.
- **Gastan del cupo de planes** (`PLANES_POR_DIA`, 2 al día de cada tipo). Si no
  queda cupo, se salta esa creación y se dice, sin tratarlo como error.

### 4.6 La segunda operación en adelante

El mismo formulario, con los campos **prerrellenados** con lo que hay en Ajustes
y en el perfil. El modo que se manda al proxy sigue siendo `reinicio`, y sus
instrucciones cambian igual que las de `inicial`: ficha entera, repreguntas solo
si falta o no cuadra.

El perfil **sí** se le sigue mandando en `reinicio` (spec 055): ahí conocerte es
la gracia. En `inicial` sigue sin mandarse.

Los campos de texto largo no se pueden prerrellenar tal cual, porque el perfil
es un retrato en prosa y no campos sueltos. Se prerrellenan **los cinco duros**
(nombre, altura, peso objetivo, fecha objetivo — y el peso actual, con el último
pesaje si lo hay) y los de texto se dejan vacíos con un aviso encima:

> Ya sabe lo que le contaste la última vez. Rellena solo lo que haya cambiado.

## 5. Modelo de datos

Sin colecciones nuevas ni campos nuevos.

La consulta de alta se guarda como hasta ahora (`modo: "inicial"` o
`"reinicio"`, `estado`, `mensajes`, `creadaEn`, `terminadaEn`). Lo único que
cambia es que su **primer mensaje es del usuario**, no de la IA — hasta ahora
todas las consultas empezaban con una pregunta de la IA.

**Comprobado en la revisión del 25 de agosto, y no rompe nada:** `enviadosHoy()`
descarta los modos `inicial` y `reinicio` vía `esRevision()`, así que un mensaje
de usuario más en el alta no toca el contador; y `hiloCompleto()` pone el
separador en el índice 0 del array, sin mirar de quién es el mensaje. Queda
anotado igualmente porque es el sitio donde un descuido futuro se convertiría en
un contador mal.

No hacen falta reglas nuevas de Firestore.

## 6. Casos límite

- **Sin cupo de mensajes.** El botón del formulario sale deshabilitado y lo
  dice, como hoy el de empezar consulta.
- **Sin cupo de planes.** El alta termina igual; se avisa de que la dieta o la
  tabla no se han creado y que se pueden pedir mañana desde su sección.
- **La IA falla al enviar el formulario.** No se crea nada: ni consulta, ni
  operación, ni pesaje. El formulario se queda relleno para reintentar de un
  clic, como hace hoy la conversación con lo escrito.
- **La IA repregunta las tres veces y sigue sin cerrar.** A la tercera se le
  fuerza el cierre con la instrucción que ya existe (`debeCerrar`).
- **Peso actual igual al objetivo, o objetivo por encima del peso.** No se
  bloquea: es un caso real (mantener, o coger masa). Es justo lo que la IA puede
  repreguntar si le parece raro.
- **Recargar con el alta a medias** (repregunta sin contestar). La consulta está
  en curso en Firestore, así que se retoma en el hilo con su caja, igual que una
  revisión a medias. El formulario ya no vuelve a salir.
- **Corte de red a mitad del primer turno.** No queda nada a medias: hoy
  `empezarConsulta()` no escribe en Firestore hasta tener la respuesta del
  proxy, y `empezarAlta()` mantiene ese orden. Se reintenta con el formulario
  tal como lo dejaste.
- **Valor fuera de rango en el formulario** (altura de 900 cm, peso de 5 kg). No
  llega a la IA: lo para la validación de 4.1 y se marca en el campo.
- **Dos pestañas abiertas.** La segunda ve la operación ya creada al refrescar y
  el formulario desaparece. No se crean dos operaciones: `responder()` ya
  comprueba que no haya una activa antes de crearla.

## 7. Archivos afectados

| Archivo | Qué |
|---|---|
| `index.html` | El formulario de alta en Consulta, con sus campos y casillas. |
| `js/app.js` | Pintar y validar el formulario; enviarlo; el pesaje inicial; encadenar dieta y tabla; los avisos. |
| `js/pesajes.js` | Se usa `validarPesaje()` y la función de guardar; **no se modifica**. |
| `js/consulta.js` | `empezarAlta()` nueva (sustituye a `empezarConsulta()` en el camino de bienvenida); el primer mensaje en prosa; el tope de 3 repreguntas. |
| `api/consulta.js` | `INSTRUCCIONES_INICIAL` e `INSTRUCCIONES_REINICIO` reescritas; fuera el suelo de 8 preguntas (`MINIMO_PREGUNTAS`); tope de repreguntas del alta. |
| `js/estilos.css` (o donde vivan los estilos del formulario) | Lo justo para que el formulario largo se lea en móvil. |
| `docs/PRODUCTO.md` | El apartado v7 del anexo. **Antes de implementar.** |
| `docs/ESTADO.md` | Al terminar. |

Tamaño estimado: **300-350 líneas**.

## 8. Decisiones tomadas

Todas del usuario, el 25 de agosto de 2026:

- **Formulario con todo de serie, y la IA solo repregunta si hay dudas.** Su
  frase: *"se rellena todo de serie. Si te dejas algo, imagina que te dejas las
  aversiones, te puede preguntar '¿te gusta cualquier comida o ejercicio?'"*.
- **Dos casillas marcadas por defecto** para la dieta y la tabla, en vez de
  crearlas siempre o no crearlas nunca. Quien tenga prisa las desmarca.
- **Máximo 3 repreguntas.** Sin tope, un formulario medio vacío devuelve a la
  entrevista larga que esta spec viene a quitar.
- **El peso actual se apunta como pesaje de hoy**, para que la gráfica no esté
  vacía desde el primer día.
- **El formulario también en las operaciones siguientes**, prerrellenado: un
  solo camino de alta que mantener.
- **Una sola spec**, avisado de que pasa de 300 líneas (regla 4). Ver sección 10.

Y una decisión técnica tomada al corregir la spec tras `revisor-specs`:

- **Los cuatro campos duros se guardan del formulario, no de lo que devuelva la
  IA** (ver 4.4). No es una preferencia: es la única forma de cumplir el criterio
  3, que el usuario ya aprobó. Pasarlos por la IA los expone a que los reescriba,
  y a que `guardarLoAveriguado()` descarte en silencio uno que el usuario había
  escrito bien.

## 9. Fuera de spec: ideas apuntadas

- Prerrellenar los campos de texto largo en la segunda operación pidiéndole a la
  IA que descomponga el perfil en campos. Es una llamada más y una fuente de
  invenciones; se apunta y no se hace.

## 10. Aviso de tamaño (regla 4)

La regla 4 del proyecto dice que una spec de más de ~300 líneas de cambios se
avise y se proponga dividir. Se propuso dividirla en dos (057: formulario y
alta; 058: dieta y tabla) y **el usuario eligió una sola**. Queda anotado aquí
para que, si la implementación se tuerce, se sepa que el aviso se dio y cuál era
el corte natural: **todo lo de la sección 4.5** se puede sacar sin tocar el
resto.

## Anexo — texto propuesto para `docs/PRODUCTO.md`

A añadir después del apartado "Qué hará (v6…)":

> ## Qué hará (v7: el comité de bienvenida, decidida el 25 de agosto de 2026)
>
> Sale de hacer la entrevista de bienvenida ya arreglada y ver que preguntar de
> una en una el nombre, la altura, el peso y el objetivo es lento para datos que
> caben en un formulario.
>
> - **Un formulario de alta con todo de serie.** Abrir una operación deja de ser
>   un chat de diez preguntas: se rellena una ficha —nombre, altura, peso actual,
>   peso objetivo, plazo, gustos, aversiones, alergias, ejercicio que disfrutas,
>   material y limitaciones— y se envía de una vez.
> - **La IA solo repregunta si tiene dudas.** Si la ficha está completa, no
>   pregunta nada y contesta directamente con sus primeros consejos. Si falta
>   algo o algo no cuadra, lo pregunta de una en una, hasta tres veces.
> - **El comité te deja la casa montada.** Al terminar el alta, si lo has
>   pedido, ya tienes creadas tu **dieta de la semana** y tu **tabla de
>   ejercicio**, hechas con lo que acabas de contar. El cierre te lo dice.
> - **Tu peso de partida cuenta desde el minuto uno.** El peso que pones en la
>   ficha se apunta como tu primer pesaje, así que la gráfica arranca con un
>   punto en vez de estar vacía.
> - **Las operaciones siguientes usan la misma ficha**, ya rellena con lo que la
>   IA sabía de ti: cambias lo que haya cambiado y envías.

Y en el apartado de fases, al final:

> - **v7 (desde el 25 de agosto de 2026, sin fecha límite)**: lo descrito en
>   "Qué hará (v7)". Sale de usar la entrevista de bienvenida ya arreglada
>   (specs 052-056) y ver que es lenta para datos que caben en un formulario. Va
>   en la spec 057, sin partir, por decisión del usuario.

## ✅ Para probar a mano

Se afina con el agente `qa-manual` cuando la implementación esté revisada.
