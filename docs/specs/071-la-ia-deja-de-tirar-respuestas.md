# 071 — La IA deja de tirar respuestas buenas

- **Estado:** ✅ completada (probada y confirmada por el usuario el 2026-08-30).
- **Fecha:** 2026-08-30
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v11)", primera spec.

## 1. Objetivo

Que la conversación deje de fallar cuando la IA **sí ha contestado**, y que
cuando falle de verdad el mensaje diga qué pasó y qué hacer.

## 2. Por qué existe

El usuario, el 29 de agosto, con una captura: escribió *"me cuesta esto, no sé si
tirar la toalla"* y la app respondió **"La IA no ha sabido responder"**. Y añadió:
*"no me funciona del todo bien, o no contesta o me pone cosas así"*.

**No era que la IA no supiera responder.** Ese mensaje es el código
`respuesta-ilegible`, y significa algo muy concreto: la IA devolvió **JSON
válido**, pero el texto venía en un campo que el proxy no miraba, así que se tiró
la respuesta entera.

En modo conversación, el prompt le exige poner su respuesta en `pregunta` y dejar
`cierre` vacío. Ante un mensaje emotivo como el suyo, el modelo escribe algo que
suena a despedida y lo mete en `cierre`. **Había una respuesta buena y se
descartó.**

Y había un segundo agujero, más grave: como el JSON era válido, `generarJson()`
lo daba por **éxito**. Así que la reserva **no llegaba a intentarse**: el usuario
veía un error teniendo el otro proveedor disponible y sin tocar.

## 3. Criterio de "esto funciona"

1. Un mensaje emotivo o poco concreto **recibe respuesta**, no un error.
2. Si un proveedor contesta vacío, **se le pregunta al otro** antes de dar error.
3. Una conversación **nunca se cierra**: si el modelo devuelve un "cierre" en
   mitad de una charla, se enseña como un mensaje más.
4. Una **entrevista de alta** sigue cerrándose cuando debe, ni antes ni después.
5. Cuando de verdad falla, el mensaje dice **qué pasó y qué hacer**: si sirve
   reintentar, o si hay que esperar a mañana, o cambiar de proveedor.
6. Nada de lo que ya funcionaba cambia: los cupos, la dieta, la tabla y el
   análisis siguen igual.

## 4. Alcance

### Entra

- El rescate del texto en `api/consulta.js`.
- Que un JSON válido pero inservible cuente como fallo de ese proveedor y active
  la reserva (`generarJson()` en `api/_ia.js`).
- Mensajes de error que digan qué hacer.

### NO entra (explícitamente fuera)

- **Un tercer proveedor.** Decisión del usuario del 29 de agosto: primero
  exprimir los dos que hay. Si después sigue fallando, se añade **sabiendo por
  qué**, y no a ciegas.
- **Reintentar la misma llamada.** Con el rescate y la reserva, reintentar sería
  una tercera llamada para un caso que ya está cubierto. Queda apuntado por si
  hace falta.
- **Cambiar los prompts.** El problema no era lo que se le pide, sino qué se hace
  con lo que devuelve.

## 5. Comportamiento detallado

### El rescate

El texto se coge **de donde venga**: `cierre` o `pregunta`, el primero que traiga
algo.

**Se respeta el `tipo` que declara el modelo** y solo se rellena el campo que
falta con el otro. Deducir el tipo del campo que traiga texto sería peor:
**cerraría una entrevista de alta antes de tiempo**, y eso es más dañino que un
error, porque el usuario no puede deshacerlo.

### La conversación no se cierra nunca

Si en modo conversación el modelo devuelve `tipo: "cierre"` con texto, se le
devuelve al navegador como `pregunta`: un mensaje más del hilo. La conversación
que dura (spec 023) no tiene final, y un cierre inventado a mitad de una charla
la daría por terminada.

### El validador de la cascada

`generarJson()` acepta ahora una función opcional que mira el JSON ya parseado y
dice si sirve. En la consulta, **sirve si trae texto en alguno de los dos
campos** — no se mira el `tipo`, porque los modelos se equivocan de campo con
facilidad y lo que hace falta para seguir es que haya algo escrito.

Una respuesta que no sirve se trata como lo que es: **un fallo de ese proveedor**,
con `mereceReserva`, así que se le pregunta al otro.

Es opcional a propósito: sin ella, cualquier JSON válido se da por bueno, que es
como se comportan la dieta, la tabla y el análisis, que ya tienen sus propias
comprobaciones más abajo.

### Los mensajes

Un mensaje útil dice tres cosas: **qué falló, si sirve reintentar, y qué hacer si
no**. "Inténtalo de nuevo" a secas, cuando lo que pasa es que se acabó la cuota
del día, manda al usuario a chocarse contra la misma pared.

- Cuota agotada → dice que **no** sirve reintentar, y ofrece cambiar de proveedor.
- Saturada → dice que la reserva tampoco pudo, y que espere un minuto.
- Sin nada dentro → dice que **se han probado los dos** proveedores.
- Sin clave → manda a Ajustes.

## 6. Modelo de datos

Ninguno.

## 7. Casos límite

- **Los dos proveedores contestan vacío**: error, y el mensaje lo dice tal cual.
  Es el único caso en que `respuesta-ilegible` sigue apareciendo, y ahora
  significa de verdad lo que dice.
- **El modelo devuelve "cierre" en una entrevista de alta**: se cierra, como
  siempre. El rescate no toca eso.
- **El modelo devuelve "pregunta" con el texto en "cierre"** durante una
  entrevista: se enseña como pregunta y la entrevista sigue. Es el lado seguro.
- **Un proveedor sin clave**: cuenta como fallo con reserva, como ya hacía.

## 8. Archivos afectados

| Archivo | Qué |
|---|---|
| `api/_ia.js` | `generarJson()` acepta un validador y trata lo inservible como fallo. |
| `api/consulta.js` | El rescate del texto y la conversación que no se cierra. |
| `js/consulta.js` | Los mensajes de error. |

## 9. Decisiones tomadas

- **Rescatar el texto de donde venga** (usuario, 29 de agosto): es gratis, no
  gasta cuota y convierte un error en una respuesta buena.
- **Primero exprimir los dos proveedores que hay**, antes de añadir un tercero
  (usuario, misma conversación). El problema era de forma, no de cuota: un
  tercero no habría arreglado nada de lo que estaba pasando.
- **Mensajes que digan qué hacer** (usuario, misma conversación).
- **El `tipo` que declara el modelo se respeta** (Claude): deducirlo del campo
  que traiga texto cerraría entrevistas antes de tiempo.

## 10. Fuera de spec: ideas apuntadas

- Un tercer proveedor, si con estos dos sigue fallando.
- Reintentar la misma llamada cuando los dos proveedores vienen vacíos.
- Enseñar el código técnico junto al mensaje, para diagnosticar sin adivinar.

## ✅ Para probar a mano

(Lo afina el agente `qa-manual` antes de la prueba.)
