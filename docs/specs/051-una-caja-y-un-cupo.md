# 051 — Una sola caja de texto y un solo cupo

- **Estado:** 📝 pendiente de implementar (después de la 050).
- **Fecha:** 2026-08-23
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v6…)", puntos **"Una sola caja de texto"** y **"Un solo cupo: 20 mensajes al día"**.
- **Segunda de tres.** Va después de la 050 (que ya junta el hilo a la vista) y antes de la 052.

## 1. Objetivo

Tras la 050 se lee todo en un hilo, pero debajo siguen habiendo **dos cajas de
texto** ("Tu respuesta" y "Cuéntale cómo vas") y **dos cupos** (2 consultas y 20
mensajes al día). Al terminar esta spec hay una caja y un número.

## 2. Criterio de "esto funciona"

1. En **Consulta** hay **una sola caja de texto** con un solo botón de enviar.
2. Con una revisión en marcha, lo que escribes **le contesta a ella**; el resto
   del tiempo es una pregunta normal. La etiqueta de la caja lo dice: **"Tu
   respuesta"** durante una revisión, **"Cuéntale cómo vas"** el resto del
   tiempo.
3. **Un solo contador: "Te quedan N mensajes hoy."** Ya no aparece el aviso de
   "Ya has pasado consulta 2 veces hoy".
4. **Empezar una revisión gasta un mensaje** de esos 20.
5. **Contestar a una revisión también gasta un mensaje**, igual que escribir en
   la conversación.
6. Sin mensajes hoy, ni se puede escribir ni se puede empezar una revisión, y
   el botón lo dice.
7. Hay **un solo sitio** donde salen "Pensando…" y los errores, no dos.
8. Todo lo demás sigue igual: el hilo de la 050, las propuestas de la 046, la
   línea de "Última consulta: hace N días" y su aviso (spec 045).

## 3. Alcance

### Entra

- Fundir los dos formularios en uno, que manda a `responder()` o a
  `enviarMensaje()` según haya o no una revisión en marcha.
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

`quedanConsultasHoy()`, `empezadasHoy()` y `MAXIMO_CONSULTAS_DIARIAS`
desaparecen. Comprobado que solo se usan desde `js/app.js`: la gamificación
(`js/gamificacion.js`) mira `consultas.some(...)`, no estas funciones.

### La caja (`index.html`, `js/app.js`)

Sobreviven los ids de la conversación (`#conversacion-texto`,
`#btn-enviar-conversacion`), que son los que ya llevan el contador.
`#form-respuesta`, `#respuesta-texto` y `#btn-responder` desaparecen.

**Referencias que hay que limpiar, y que ninguna spec anterior contemplaba:**

- `limpiarFormularios()` hace `id("respuesta-texto").value = ""`. Si se deja,
  revienta en cada inicio de sesión.
- `conEspera()` deshabilita y rehabilita `#btn-responder`. Pasa a hacerlo con
  el botón único.

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
- **Cambio de día a medias.** El contador se recalcula al repintar; no hay
  temporizador. Igual que hoy.

## 7. Archivos afectados

| Archivo | Qué cambia |
|---|---|
| `js/conversacion.js` | `enviadosHoy()`/`quedanMensajesHoy()` cuentan sobre todas las consultas. |
| `js/consulta.js` | Fuera el cupo de consultas; `empezarConsulta()` comprueba el de mensajes. |
| `js/app.js` | Un solo envío con dos destinos; `conEspera()` sobre el botón y los mensajes únicos; `limpiarFormularios()`. |
| `index.html` | Fuera `#form-respuesta`, `#respuesta-texto`, `#estado-consulta` y `#error-consulta`. |

No se toca `api/`, ni `firestore.rules`, ni el cupo de dietas y tablas.

Tamaño estimado: ~180 líneas.

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
  están debajo de la caja, que es donde se mira después de enviar.

## 9. Fuera de spec: ideas apuntadas

- Ponerle `fecha` a los mensajes de las consultas, para que el cupo sea exacto
  también al contestar a una revisión de otro día.

## ✅ Para probar a mano

Lo escribe el agente `qa-manual` cuando la implementación esté revisada.
