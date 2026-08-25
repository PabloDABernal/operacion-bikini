# 054 — La caja deja de hablar de más durante una consulta

- **Estado:** ✅ completada. Implementada y desplegada el 2026-08-24; probada y confirmada por el usuario el 2026-08-25.
- **Fecha:** 2026-08-24
- **Referencia en PRODUCTO.md:** no añade nada. Afina la caja única que
  describe el apartado "Qué hará (v6…)", punto **"Una sola caja de texto,
  arriba del todo"**.

## 1. Objetivo

Al probar la spec 052 el usuario vio la entrevista de bienvenida con la caja
puesta y dos cosas debajo que no pintaban nada ahí:

- el placeholder **"esta semana he picado más de la cuenta"**, que es una
  sugerencia para charlar, no para contestar "¿Cómo prefieres que te llame?";
- la línea **"Te quedan 20 mensajes hoy."**, que en la entrevista además
  **miente**: la entrevista no gasta cupo (spec 052, criterio 7), así que ese
  número no se va a mover conteste lo que conteste.

La caja es una sola desde la spec 051, pero seguía vestida siempre de
conversación. Al terminar esta spec, mientras hablas con una consulta —la
entrevista de alta o una revisión— la caja va desnuda: solo la etiqueta "Tu
respuesta" y el botón.

## 2. Criterio de "esto funciona"

1. **Durante la entrevista de bienvenida**, la caja de texto está **vacía, sin
   placeholder**, y **no** aparece debajo la línea de mensajes restantes.
2. **Durante una revisión**, lo mismo: ni placeholder ni línea de cupo.
3. **El resto del tiempo** (conversación normal), todo sigue exactamente igual
   que hoy: el placeholder "esta semana he picado más de la cuenta" y la línea
   **"Te quedan N mensajes hoy."**.
4. Con el cupo agotado y **sin** consulta en marcha, sigue saliendo **"Has
   gastado tus 20 mensajes de hoy. Vuelve mañana."** y la caja sigue bloqueada.
5. Nada más cambia: el hilo, los separadores, el contador en sí y a quién le
   habla la caja se quedan como están.

## 3. Alcance

### Entra
- Vaciar el `placeholder` de `#conversacion-texto` mientras hay una consulta en
  curso, y devolverlo cuando no la hay.
- Esconder `#cupo-conversacion` mientras hay una consulta en curso.

### NO entra (explícitamente fuera)
- **Cambiar el cupo, ni cómo se cuenta.** `enviadosHoy()` no se toca. Lo que
  cambia es cuándo se enseña el número, no el número.
- **Bloquear o desbloquear la caja de otra manera.** Con el cupo a 0 sigue
  bloqueada igual, y empezar una consulta sigue necesitando cupo.
- **La etiqueta de la caja** ("Tu respuesta" / "Cuéntale cómo vas"), que ya
  distingue bien los dos estados desde la spec 051.
- Poner un placeholder distinto durante la consulta. Se decidió dejarlo vacío:
  la pregunta que hay que contestar ya está arriba, en el hilo.

## 4. Comportamiento detallado

Todo ocurre en `pintarConversacion()` (`js/app.js`), que ya sabe si hay consulta
en curso porque `consultaAbierta` es una variable de módulo.

| Estado | Placeholder | Línea de cupo |
|---|---|---|
| Consulta en curso (entrevista o revisión) | vacío | escondida |
| Conversación normal | "esta semana he picado más de la cuenta" | "Te quedan N mensajes hoy." |
| Conversación normal, cupo a 0 | el de siempre | "Has gastado tus 20 mensajes de hoy. Vuelve mañana." |

El placeholder de la conversación deja de vivir en el atributo de `index.html` y
pasa a una constante de `js/app.js`, porque ahora hay que poder quitarlo y
devolverlo. En el HTML se queda el atributo vacío, para que no parpadee el texto
viejo antes del primer pintado.

La línea de cupo se esconde con la clase `oculta`, como el resto de la app; no
se vacía su texto. Así, al cerrarse la consulta vuelve con el número que toque
sin depender de que nadie lo recalcule.

**Lo que se pierde, y por qué se acepta:** durante una revisión, contestar sí
gasta un mensaje, así que esconder el contador ahí quita un dato cierto. Se
esconde igual por decisión del usuario del 24 de agosto: entre ver un número
correcto y no ver un número que en la entrevista miente, prefiere lo segundo.
El aviso no desaparece del todo — al terminar la consulta el contador vuelve, ya
actualizado.

## 5. Modelo de datos

Sin cambios.

## 6. Casos límite

- **Quedarse sin cupo contestando a una revisión.** La revisión en curso se
  puede terminar igual (contestarla no se bloquea a medias hoy, y esta spec no
  lo cambia). Al cerrarse, el contador reaparece diciendo que no quedan.
- **Recargar con una consulta a medias.** `consultaAbierta` se recalcula al
  leer de Firestore, así que la caja vuelve desnuda sola.
- **Entrevista terminada.** `pintarConversacion()` corre otra vez desde
  `refrescarOperaciones()` (spec 052): placeholder y contador vuelven.

## 7. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/app.js` | `pintarConversacion()`: placeholder y visibilidad del cupo. |
| `index.html` | El `placeholder` de `#conversacion-texto` se vacía. |
| `docs/ESTADO.md` | Al terminar. |

Tamaño estimado: ~15 líneas.

## 8. Decisiones tomadas

- **Que no salga ni en entrevistas ni en consultas, solo en los mensajes
  normales.** Decisión del usuario el 24 de agosto, viendo la entrevista en
  producción.
- **Placeholder vacío en vez de uno propio** → la pregunta a la que contestas
  está justo arriba en el hilo; sugerir algo distinto solo puede despistar.
- **Se esconde, no se vacía** → un elemento oculto vuelve solo; uno vaciado
  depende de que alguien se acuerde de rellenarlo.

## 9. Fuera de spec: ideas apuntadas

Ninguna.

## ✅ Para probar a mano

Se afina con el agente `qa-manual`.
