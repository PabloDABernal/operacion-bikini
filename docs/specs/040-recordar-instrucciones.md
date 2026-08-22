# 040 — Recordar las últimas instrucciones al pedir dieta o tabla

- **Estado:** ✅ completada (probada y confirmada por el usuario el 2026-08-21).
- **Fecha:** 2026-08-21
- **Referencia en PRODUCTO.md:** apartado "Qué hará (ampliación de la v2, decidida el 13 de agosto de 2026)", bullet "Consultas especializadas", ampliado hoy para incluir esta spec.

## 1. Objetivo

Al abrir el formulario de "Pedir dieta detallada" o "Pedir tabla de
ejercicio", el campo de instrucciones ya viene relleno con las últimas que
se usaron para ese mismo tipo, en vez de vacío — así no hay que escribir
otra vez "nada de lácteos" o "el jueves como fuera" cada semana.

## 2. Criterio de "esto funciona"

1. En **Comidas → Mi dieta**, tras haber pedido ya una dieta alguna vez con
   instrucciones, toca "Pedir dieta detallada": el campo "¿Algo que deba
   tener en cuenta?" ya trae escrito lo que se escribió la última vez.
2. Lo mismo en **Ejercicio → Mi tabla** con "Pedir tabla de ejercicio", con
   las últimas instrucciones de tabla (no las de dieta: cada tipo recuerda
   las suyas).
3. El texto precargado se puede editar o borrar libremente antes de pedir,
   igual que si se hubiera escrito a mano.
4. Si la última vez no se escribió nada (se pidió con el campo vacío), el
   campo aparece vacío, no con un hueco en blanco raro.
5. La primera vez que se pide un tipo (nunca se pidió antes), el campo
   aparece vacío, como hasta ahora.
6. Pedir con el texto precargado sin tocarlo funciona igual que pedir con
   cualquier otro texto: no es un caso especial.

## 3. Alcance

### Entra
- Precargar `#instrucciones-dieta` y `#instrucciones-ejercicio` con las
  últimas instrucciones usadas de su tipo, al abrir el formulario.

### NO entra (explícitamente fuera)
- **Ningún campo ni colección nueva.** El texto ya se guarda hoy en cada
  plan (`instrucciones`, en `guardarMarcaDePlan()`); esta spec solo lo lee
  de ahí, no inventa un sitio nuevo para guardarlo.
- **Recordar instrucciones de la entrevista general** ("Pasar consulta"):
  esa conversación no tiene un campo de instrucciones parecido, es un chat.
- **Un historial de instrucciones anteriores para elegir entre varias**:
  solo la última, no una lista desplegable con todas.

## 4. Comportamiento detallado

- En `pintarEspecializadas()` (`js/app.js`), donde se crea el botón "Pedir
  dieta detallada"/"Pedir tabla de ejercicio" que abre `#form-plan-${tipo}`,
  al abrir el formulario se busca en `planesCargados` el primer plan cuyo
  `tipo` coincida (la lista ya viene ordenada de más reciente a más antiguo,
  `orderBy("creadoEn", "desc")` en `listarPlanes()`) y se rellena
  `id(\`instrucciones-${tipo}\`).value` con su campo `instrucciones` (o
  cadena vacía si no hay ninguno, o si el plan encontrado no tiene
  instrucciones).
- No se toca el guardado: al pedir, sigue guardándose tal cual lo que haya
  en el campo en ese momento, lo tocara el usuario o no.

## 5. Modelo de datos

Ninguno nuevo. Se lee el campo `instrucciones` que cada plan ya guarda
desde la spec 027.

## 6. Casos límite

- **Cupo agotado (`quedan === 0`)**: el botón "Pedir..." ya sale
  deshabilitado hoy; esta spec no cambia esa parte. Si se llega a abrir el
  formulario igualmente (no debería), se precarga igual — no hace daño.
- **Cancelar sin pedir**: el campo vuelve a su estado de siempre al cerrar
  el formulario (`pintarEspecializadas()` lo repinta desde cero la próxima
  vez que se abra), no queda nada raro guardado por haber precargado texto
  y no usarlo.
- **El plan más reciente de ese tipo no tiene el campo `instrucciones`**
  (planes muy antiguos, de antes de que existiera el campo): se trata igual
  que "sin instrucciones", campo vacío.

## 7. Archivos afectados

| Archivo | Qué se hace |
|---|---|
| `js/app.js` | En el botón que abre `#form-plan-${tipo}` dentro de `pintarEspecializadas()`, precarga `#instrucciones-${tipo}` con las últimas instrucciones de ese tipo. |
| `docs/PRODUCTO.md` | Ya actualizado (ver cabecera de esta spec). |
| `docs/ESTADO.md` | Al terminar, cuando el usuario la valide. |

**Tamaño estimado:** muy por debajo de las ~300 líneas — una búsqueda en un
array ya cargado y una línea que rellena un campo.

## 8. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| Solo la última instrucción, sin historial desplegable | Spec pequeña y autocontenida; un historial completo es una feature bastante más grande para el mismo beneficio |
| Se precarga al abrir el formulario, no al cargar la pantalla | Es cuando tiene sentido verlo: si se precargara antes, un campo raramente visto podría llevar a error si se olvida que ya tenía texto |
| Spec decidida por Claude, no entrevistada | El usuario dijo "te dejo decidir, vamos a limpiar el backlog" el 2026-08-21 |

## 9. Fuera de spec: ideas apuntadas

- Historial de instrucciones anteriores (más de la última) para elegir entre
  varias, si algún día se echa en falta.

## ✅ Para probar a mano

Se prueba en producción: https://operacion-bikini.vercel.app, con una
operación en marcha. Si nunca has pedido una dieta o una tabla con
instrucciones, pide una de cada con algo de texto (p. ej. "nada de lácteos"
para la dieta, "el sábado descanso" para la tabla) antes de empezar, para
tener algo que precargar.

### Camino feliz

1. En **Comidas → Mi dieta**, pulsa "Pedir dieta detallada": el campo
   "¿Algo que deba tener en cuenta?" ya trae escrito lo último que pusiste
   para una dieta, con el cursor al final.
2. Pulsa "Cancelar" y vuelve a pulsar "Pedir dieta detallada": el campo
   vuelve a traer el mismo texto (no se ha quedado vacío ni con nada raro).
3. En **Ejercicio → Mi tabla**, pulsa "Pedir tabla de ejercicio": el campo
   trae lo último que pusiste para una **tabla**, no el texto de la dieta —
   son independientes.
4. Cambia el texto precargado de la tabla, pide con ese texto nuevo (si te
   queda cupo). Se pide con normalidad, igual que si lo hubieras escrito
   desde cero.
5. Vuelve a pulsar "Pedir tabla de ejercicio": ahora trae el texto que
   acabas de pedir en el paso 4, no el de antes.

### Casos límite

6. Borra del todo el texto precargado (déjalo vacío) y pide así, sin
   instrucciones. Se pide con normalidad.
7. La próxima vez que abras ese formulario, el campo aparece vacío (la
   última vez se pidió sin texto) — no aparece "undefined" ni ningún texto
   extraño.

### Regresión

8. El cupo diario (2 dietas y 2 tablas) sigue funcionando igual: si ya
   pediste 2 de un tipo hoy, el botón de "Pedir..." de ese tipo sale
   deshabilitado, y el mensaje bajo el botón lo explica — igual que antes de
   esta spec.
9. Pedir dietas y tablas no comparte cupo entre sí: agotar el de dieta no
   afecta al de tabla, ni al revés.

Si todo lo anterior pasa, la spec 040 queda **completada**.
