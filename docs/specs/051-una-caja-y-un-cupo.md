# 051 — Una sola caja arriba, el hilo del revés, y un solo cupo

- **Estado:** ✅ completada. Implementada y desplegada el 2026-08-23; probada y confirmada por el usuario el 2026-08-24.
- **Fecha:** 2026-08-23
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v6…)", puntos **"Una sola caja de texto, arriba del todo"**, **"Lo último, lo primero que se ve"** y **"Un solo cupo: 20 mensajes al día"**.
- **Segunda de tres.** Va después de la 050 (que ya junta el hilo a la vista) y antes de la 052.

## 1. Objetivo

Tras la 050 se lee todo en un hilo, pero debajo siguen habiendo **dos cajas de
texto** ("Tu respuesta" y "Cuéntale cómo vas") y **dos cupos** (2 consultas y 20
mensajes al día). Y hay un tercer problema, que el usuario vio el 23 de agosto
mirándolo en el móvil: la caja está **debajo** del hilo, así que para escribir
hay que recorrer toda la conversación.

Al terminar esta spec hay **una caja, arriba del todo**, con el hilo debajo y
**del revés** —lo último primero—, y **un solo número** de cupo.

## 2. Criterio de "esto funciona"

1. En **Consulta** hay **una sola caja de texto** con un solo botón de enviar,
   **arriba del hilo**. Se puede escribir sin desplazar la pantalla.
2. El hilo va **debajo de la caja y del revés**: el mensaje más reciente es el
   primero, y hacia abajo van los más antiguos. Para ver cómo empezó la
   conversación, se baja.
3. Con una revisión en marcha, lo que escribes **le contesta a ella**; el resto
   del tiempo es una pregunta normal. La etiqueta de la caja lo dice: **"Tu
   respuesta"** durante una revisión, **"Cuéntale cómo vas"** el resto del
   tiempo.
4. **Un solo contador: "Te quedan N mensajes hoy."** Ya no aparece el aviso de
   "Ya has pasado consulta 2 veces hoy".
5. **Empezar una revisión gasta un mensaje** de esos 20.
6. **Contestar a una revisión también gasta un mensaje**, igual que escribir en
   la conversación.
7. Sin mensajes hoy, ni se puede escribir ni se puede empezar una revisión, y
   el botón lo dice.
8. Hay **un solo sitio** donde salen "Pensando…" y los errores, no dos.
9. Todo lo demás sigue igual: el hilo de la 050, las propuestas de la 046, la
   línea de "Última consulta: hace N días" y su aviso (spec 045).

## 3. Alcance

### Entra

- Fundir los dos formularios en uno, que manda a `responder()` o a
  `enviarMensaje()` según haya o no una revisión en marcha.
- Colocar esa caja **encima** del hilo, y darle la vuelta al hilo.
- Fundir los dos pares de mensajes de estado y error en uno.
- Un solo cupo de 20 mensajes al día, que cuenta también las revisiones.
- Quitar el cupo de consultas.

### NO entra (explícitamente fuera)

- **La entrevista de alta.** Es la spec 052.
- **Cambiar el número 20.**
- **Migrar ni borrar datos.**
- **El cupo de dietas y tablas.** `quedanPlanesHoy()` y `guardarMarcaDePlan()`
  son otro cupo, el de las semanas (spec 027), y se llaman "planes" por la
  colección donde escriben. Es la trampa documentada desde la 044.

## 4. Comportamiento detallado

### El cupo, que es lo delicado

`enviadosHoy(hilo)` cuenta hoy **solo** los mensajes `de: "usuario"` con la
fecha de hoy **dentro del documento de la conversación**. Eso deja fuera las
revisiones por partida doble: viven en otro documento y su mensaje de apertura
es de la IA.

`revisor-specs` lo detectó a tiempo. La primera versión de esta spec decía que
al empezar una revisión "se escribe su primer mensaje con la fecha de hoy para
que cuente", y eso no habría funcionado: ni el documento ni el autor correctos.
Y escribir un mensaje sintético de usuario en la conversación para cuadrar el
contador **habría salido pintado en el hilo** como si lo hubiera escrito el
usuario.

Solución: el contador deja de mirar un documento y pasa a mirar **todas las
consultas**. `enviadosHoy(consultas)` suma, para el día de hoy:

- los mensajes `de: "usuario"` con `fecha` de hoy del hilo de conversación (lo
  que ya contaba), **más**
- los mensajes `de: "usuario"` de las revisiones **empezadas hoy**, **más**
- **1 por cada revisión empezada hoy**, que es lo que cuesta arrancarla.

Los mensajes de una revisión no llevan fecha propia, así que se cuentan los de
las revisiones cuya `creadaEn` sea de hoy. Una revisión empezada ayer y
contestada hoy no gasta cupo hoy: es una imprecisión conocida y aceptada, a
favor del usuario, y evita escribir fechas en un sitio donde nunca las hubo.

**Dónde vive el contador, para no crear un ciclo de imports.** Hoy
`js/consulta.js` y `js/conversacion.js` no se importan entre sí.
`enviadosHoy()` necesitaría `esRevision()`, que vive en `consulta.js`; y
`empezarConsulta()`, en `consulta.js`, necesitaría el contador. Las dos cosas a
la vez es un ciclo. Lo detectó `revisor-specs`.

Se resuelve **mudando el contador**: `MENSAJES_POR_DIA`, `enviadosHoy()` y
`quedanMensajesHoy()` pasan de `js/conversacion.js` a `js/consulta.js`, que ya
es el dueño del concepto "revisión". `conversacion.js` importa el contador de
ahí; la dependencia va en un solo sentido. La alternativa —duplicar el filtro
de `modo` dentro de `conversacion.js`— se descarta: dos definiciones de qué es
una revisión acaban separándose, que es la misma trampa que costó la de
"planes".

Como consecuencia, `enviarMensaje()` pasa a recibir las consultas además del
hilo, porque el cupo ya no se puede calcular solo con el hilo.

**`responder()` también comprueba el cupo.** Hoy no lo hace: se fía de que la
caja esté deshabilitada. Con una sola caja y dos destinos, conviene la misma
defensa que ya tiene `enviarMensaje()`, por si hay dos pestañas abiertas.

`quedanConsultasHoy()`, `empezadasHoy()` y `MAXIMO_CONSULTAS_DIARIAS`
desaparecen. Comprobado que solo se usan desde `js/app.js`: la gamificación
(`js/gamificacion.js`) mira `consultas.some(...)`, no estas funciones.

### El orden del hilo (`js/app.js`)

`hiloCompleto()` sigue devolviendo los mensajes de más antiguo a más reciente:
es el orden natural del dato y el que usa el separador de revisión. Lo que se
invierte es **cómo se pinta**, con un `.reverse()` en `pintarConversacion()`.
No se toca la función que ordena: darle la vuelta al dato haría que el
separador se calculara al revés.

Dos consecuencias de invertir, que el usuario aceptó al decidirlo:

- Un intercambio se lee del revés: la respuesta de la IA aparece **encima** de
  la pregunta que la provocó.
- El separador de una revisión queda **debajo** de sus mensajes, porque va
  pegado a su primer mensaje, que ahora es el último en pintarse.

El hilo deja de tener scroll interno propio y de auto-desplazarse al final
(`contenedor.scrollTop = contenedor.scrollHeight`): con lo último arriba, ya no
hace falta y estorbaría.

### La caja (`index.html`, `js/app.js`)

Sobreviven los ids de la conversación (`#conversacion-texto`,
`#btn-enviar-conversacion`), que son los que ya llevan el contador.
`#form-respuesta`, `#respuesta-texto` y `#btn-responder` desaparecen.

**Referencias que hay que limpiar, y que ninguna spec anterior contemplaba:**

- `limpiarFormularios()` hace `id("respuesta-texto").value = ""`. Si se deja,
  revienta en cada inicio de sesión.
- `conEspera()` deshabilita y rehabilita `#btn-responder`. Pasa a hacerlo con
  el botón único.
- `aceptarPropuesta()` (spec 046) escribe "Pensando…" en `#estado-consulta`.
  Pasa a `#estado-conversacion`.
- `refrescarConsulta()` escribe su error de carga en `#error-consulta`. Pasa a
  `#error-conversacion`.
- `pintarEstadoConsulta()` hace `id("form-respuesta").classList.toggle(...)`.
  Se va con el formulario.

**Textos que quedan huérfanos del cupo viejo y hay que cambiar:**

- `"Ya has pasado consulta 2 veces hoy."` en `pintarEstadoConsulta()`: pasa a
  decir que no quedan mensajes hoy.
- El mensaje de `limite-diario` en `js/consulta.js` dice lo mismo y se reescribe
  igual.
- El código `cupo-diario` que lanza `enviarMensaje()` **no está** en el
  diccionario de mensajes, así que hoy cae al genérico. Se le añade su texto:
  el criterio 7 pide que se entienda que es el cupo del día y no un error.

Los dos límites de caracteres (`MAXIMO_CARACTERES` y
`MAXIMO_CARACTERES_RESPUESTA`) **valen los dos 1000**, así que unificarlos no
esconde ninguna decisión.

### Un solo estado y un solo error

Hoy hay dos pares: `#estado-consulta`/`#error-consulta` (que usa `conEspera()`)
y `#estado-conversacion`/`#error-conversacion` (que usa el listener de la
conversación, con su propio try/catch). Con una caja y un envío, se quedan
**los de la conversación** y desaparecen los de la consulta, porque están
debajo de la caja, que es donde se mira tras enviar.

`conEspera()` pasa a escribir ahí. Es la función que ya traduce los códigos de
error de la IA, así que el envío unificado la usa siempre, venga de una
revisión o de una pregunta normal.

## 5. Modelo de datos

Sin cambios. No se toca Firestore ni `firestore.rules`.

## 6. Casos límite

- **Empezar una revisión con un solo mensaje libre.** Se gasta en empezarla y
  te quedas sin contestarle hasta mañana. La revisión se queda a medias y se
  retoma, que es lo que ya pasa hoy con una consulta sin terminar.
- **Contestar a una revisión de ayer sin cupo hoy.** Con el conteo descrito,
  contestar sí gasta (es un mensaje que escribes hoy en un documento de
  ayer)... pero como los mensajes de las revisiones no llevan fecha, **no se
  contaría**. Aceptado y anotado: es un agujero pequeño y a favor del usuario.
  Cerrarlo obligaría a ponerle fecha a los mensajes de las consultas, que es un
  cambio de modelo de datos para ganar poco.
- **Cupo agotado con una revisión a medias.** No se puede contestar. El mensaje
  tiene que decir que es el cupo de hoy y no parecer un error de la app.
- **Hilo muy largo, del revés.** Crece hacia abajo, así que la página se hace
  larga pero lo que importa está siempre arriba. Si al probarlo pesa, se pagina
  en otra spec.
- **La entrevista de alta y el cupo.** `empezarConsulta()` es la misma función
  que arranca una revisión y la entrevista de bienvenida. Al comprobar el cupo
  ahí, sin mensajes tampoco se podrá empezar una entrevista — aunque
  `esRevision()` excluya `inicial`/`reinicio` del "+1". Se acepta: es coherente
  (toda llamada a la IA sale del mismo cupo) y la 052 lo hereda.
- **Cambio de día a medias.** El contador se recalcula al repintar; no hay
  temporizador. Igual que hoy.

## 7. Archivos afectados

| Archivo | Qué cambia |
|---|---|
| `js/consulta.js` | Recibe `MENSAJES_POR_DIA`, `enviadosHoy()` y `quedanMensajesHoy()`, que ahora cuentan sobre todas las consultas; fuera el cupo de consultas; `empezarConsulta()` y `responder()` comprueban el de mensajes. |
| `js/conversacion.js` | Pierde el contador y lo importa; `enviarMensaje()` recibe las consultas. |
| `js/app.js` | Un solo envío con dos destinos; `conEspera()` sobre el botón y los mensajes únicos; `limpiarFormularios()`. |
| `index.html` | Fuera `#form-respuesta`, `#respuesta-texto`, `#estado-consulta` y `#error-consulta`; el formulario de la conversación sube por encima del hilo. |
| `styles.css` | El hilo deja de tener alto fijo y scroll propio. |

No se toca `api/`, ni `firestore.rules`, ni el cupo de dietas y tablas.

Tamaño estimado: ~220 líneas. Sigue por debajo de las 300.

## 8. Decisiones tomadas

- **Un solo cupo de 20 mensajes**, confirmado por el usuario el 23 de agosto.
- **Empezar una revisión gasta un mensaje.** Es la lectura honesta de "un solo
  cupo": si empezar fuera gratis, nada impediría pedir diez revisiones en una
  tarde, que son diez llamadas caras. Un mensaje es poco para el usuario y
  suficiente para acotarlo.
- **El contador mira todas las consultas, no se escriben mensajes falsos.**
  Cuadrar el número inventando un mensaje de usuario lo habría hecho aparecer
  en el hilo. El contador es lo que tiene que adaptarse, no los datos.
- **Se quedan el estado y el error de la conversación**, no los de la consulta:
  van pegados a la caja, que es donde se mira después de enviar.
- **La caja arriba y el hilo del revés.** Decidido por el usuario el 23 de
  agosto, viéndolo en el móvil: *"arriba es donde escribes el mensaje y se ve
  debajo, las últimas frases. Así no hay que scrollear, solo si quieres ver el
  inicio de la conversación"*. Se le planteó la alternativa de dejar el hilo en
  orden natural con scroll propio, ya colocado al final, y eligió la inversión
  completa sabiendo que un intercambio se lee del revés y que el separador de
  revisión queda debajo de sus mensajes. **Confirmado el 24 de agosto tras
  probarlo: se queda así.** La alternativa del hilo en orden natural con scroll
  propio queda descartada.

## 9. Fuera de spec: ideas apuntadas

- Ponerle `fecha` a los mensajes de las consultas, para que el cupo sea exacto
  también al contestar a una revisión de otro día.

## ✅ Para probar a mano

En producción, **en el móvil**, que es donde se vio el problema.

### La colocación, que es lo que pediste

1. Ve a **Consulta**. La caja de escribir está **arriba**, antes del hilo: se
   puede escribir sin desplazar la pantalla.
2. Debajo de la caja, **lo último dicho es lo primero que se ve**. Bajando se
   va hacia atrás en el tiempo, hasta el principio de la conversación.
3. Hay **una sola caja** en toda la pantalla. Ya no está la de "Tu respuesta"
   por un lado y la de "Cuéntale cómo vas" por otro.

### La caja, con sus dos destinos

4. Sin ninguna revisión en marcha, la caja dice **"Cuéntale cómo vas"**. Manda
   un mensaje: aparece arriba del hilo y el contador baja.
5. Pulsa **"Pasar consulta"**. La etiqueta de la caja cambia a **"Tu
   respuesta"**, y lo que escribas le contesta a la revisión, no a la
   conversación.
6. Contesta un par de veces y termina la revisión. La etiqueta vuelve a
   "Cuéntale cómo vas".
7. **El separador de la revisión queda DEBAJO de sus mensajes**, no encima: es
   la consecuencia de darle la vuelta al hilo, y la aceptaste al decidirlo. Si
   al verlo te chirría, dilo.

### El cupo, que ahora es uno

8. Mira el contador: **"Te quedan N mensajes hoy."** Ya no hay ningún aviso de
   "Ya has pasado consulta 2 veces hoy".
9. **Empezar una revisión gasta un mensaje**: apunta el número antes de pulsar
   "Pasar consulta" y compruébalo después.
10. Contestarle también gasta uno.
11. Si te quedas sin mensajes, ni se puede escribir ni se puede empezar una
    revisión, y el aviso dice que es el cupo de hoy, no un error.

### Que no se haya roto nada

12. **"Pensando…" y los errores salen en un solo sitio**, debajo de la caja,
    tanto al mandar un mensaje normal como al contestar a una revisión.
13. Las **propuestas** de dieta o tabla (spec 046) siguen saliendo al cerrarse
    una revisión, y aceptarlas sigue funcionando.
14. La línea de **"Última consulta: hace N días"** y su aviso siguen ahí.
15. **Cierra sesión y vuelve a entrar.** Es donde reventaría si hubiera quedado
    alguna referencia a los campos que se han quitado.
16. **Sin operación en marcha** (solo si vas a reiniciar): la entrevista de alta
    sigue funcionando. Aún se contesta desde su sitio de siempre; que se meta
    en el hilo es la spec 052.
