# 062 — Las bebidas, apuntadas

- **Estado:** borrador
- **Fecha:** 2026-08-29
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v9)", segunda spec de las tres.
- **Depende de:** nada. Se puede implementar antes o después de la 061; van juntas en la v9 porque son el mismo tema, no porque una necesite a la otra.

## 1. Objetivo

Que el usuario pueda apuntar lo que bebe que **no es agua** —café, cerveza,
refresco, zumo— como una línea con su hora, y verlo en el diario del día.

El agua no entra aquí: es un contador y es la spec 061.

## 2. Criterio de "esto funciona"

1. En **Comidas → Apuntar** se puede apuntar una bebida: qué era y cuándo.
2. La bebida aparece en la lista del día, distinguible de una comida a simple
   vista.
3. Se puede **editar y borrar** una bebida ya apuntada, igual que una comida.
4. Las bebidas aparecen en **Hoy**, en el resumen del día.
5. Hay **chips de bebidas frecuentes** que la apuntan de un toque, como los de
   ejercicio (spec 042).
6. La IA ve las bebidas en el contexto de la conversación y de la revisión: si le
   preguntas cómo vas, puede mencionarlas.
7. Nada de lo que ya existe cambia: comidas, ejercicios y pesajes se apuntan y se
   ven igual que antes.

## 3. Alcance

### Entra

- Alta, edición y borrado de bebidas.
- Su sitio en la lista del día y en el resumen de Hoy.
- Chips de bebidas frecuentes.
- Las bebidas dentro del bloque de registros que va a la IA.

### NO entra (explícitamente fuera)

- **El agua.** Es la 061, y es un contador, no un registro escrito.
- **El análisis nutricional.** Las bebidas se quedan fuera de los seis grupos y
  de la horquilla de calorías. Decisión del usuario del 29 de agosto; la deuda
  está escrita en `docs/PRODUCTO.md`.
- **Cantidades, graduación o calorías** de la bebida. Es una línea de texto, como
  una comida.
- **Puntos y racha.** La v9 no toca la gamificación. *(A confirmar al escribir
  esta spec de verdad: una bebida SÍ es un registro escrito, al revés que el
  agua, así que el argumento de la 061 no le aplica igual. Ver apartado 5.)*

## 4. Pendiente de decidir con el usuario

**Esta spec está a medias a propósito.** Se escribe ahora, con la v9, para que el
reparto en tres quede fijado desde el inicio y no haya que partir nada a
posteriori. Pero tiene dos decisiones abiertas que no se rellenan con
suposiciones:

1. **¿Una bebida es un tipo de registro nuevo, o un momento más de las comidas?**
   `MOMENTOS` (`js/comidas.js`) ya tiene desayuno, comida, merienda, cena y
   picoteo. Añadir "bebida" ahí es casi gratis y sale sola en las listas, en Hoy
   y en el prompt de la IA. Pero mezcla dos cosas distintas: un momento del día
   con un tipo de cosa, y ensucia el análisis nutricional, que lee comidas.
   Una colección propia `bebidas` es más limpia y más cara: lista, edición,
   borrado, Hoy, prompt, reglas, archivado y reinicio.
2. **¿Las bebidas dan puntos?** El argumento que dejó al agua fuera fue que es el
   registro más barato de la app. Una bebida escrita cuesta lo mismo que una
   comida, así que ahí no vale el mismo razonamiento. Pero meterlas en la racha
   obliga otra vez a mirar el calendario de constancia.

Hasta que eso se decida, **el apartado 5 y el 6 no se pueden escribir**.

## 5. Modelo de datos

Pendiente de la decisión 1 del apartado 4.

## 6. Casos límite

Pendientes de la decisión 1 del apartado 4.

## 7. Archivos afectados (estimación)

Depende de la decisión 1. Como momento nuevo: `js/comidas.js`, `index.html` y
poco más. Como colección propia: lo mismo que costó cualquier registro del
diario, más las reglas, el archivado y el reinicio.

## 8. Decisiones tomadas

- **El agua va aparte, en la 061** (usuario, 29 de agosto): es un contador porque
  se bebe ocho veces al día y nadie lo escribiría ocho veces. Una cerveza sí se
  escribe.
- **Fuera del análisis nutricional** (usuario, misma conversación).

## 9. Fuera de spec: ideas apuntadas

- Que la cerveza y el refresco cuenten calorías. Anotado como deuda en
  `docs/PRODUCTO.md`.

## ✅ Para probar a mano

(Cuando la spec esté cerrada.)
