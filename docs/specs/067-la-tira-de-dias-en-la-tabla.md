# 067 — La tira de días, también en la tabla de ejercicio

- **Estado:** ✅ completada (probada y confirmada por el usuario el 2026-08-29).
- **Fecha:** 2026-08-29
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v10)", ampliación del 29 de agosto.

## 1. Objetivo

Que la semana de la tabla de ejercicio se lea igual que la de la dieta: una tira
de siete recuadros **L M X J V S D**, con el día de hoy marcado, y la sesión del
día elegido debajo.

## 2. Por qué existe

El usuario, el 29 de agosto, después de probar la spec 064: *"sí que me gustan
los iconos y cómo ha quedado lo del tema de la dieta, hazlo igual para
ejercicio"*.

Estaba anotado como idea en `docs/BACKLOG.md` desde que se escribió la 064,
precisamente para hacerlo **después** de saber si funcionaba. Funciona.

## 3. Criterio de "esto funciona"

1. En **Ejercicio → Mi tabla**, encima de la semana hay una tira de **siete
   recuadros** con las letras L M X J V S D.
2. El **día de hoy se ve marcado** y es el que sale abierto al entrar.
3. Tocar un recuadro abre ese día: debajo sale **solo su sesión**.
4. Un día **sin sesión puesta** se distingue de uno que sí, sin abrirlo.
5. Se ve el **nombre completo** del día abierto.
6. Hay un enlace para **ver la semana entera**, como en la dieta.
7. Sigue funcionando todo: **"Lo he hecho"**, **editar el día** y la lista de
   ejercicios de la sesión.
8. Sin tabla, la pantalla dice lo mismo que hoy y no enseña recuadros vacíos.

## 4. Alcance

### Entra

- La tira de días en la tabla, con los mismos tres estados que la de la dieta.
- Abrir un día y pintar solo su sesión.
- El modo "ver la semana entera".

### NO entra (explícitamente fuera)

- **Cambiar nada del modelo de datos** de la tabla.
- **Tocar la dieta.** La 064 ya está probada y no se toca.
- **Unificar el código de las dos semanas** más allá de lo que salga solo. La
  tira sí se comparte; el resto de las dos pantallas se parece pero no es igual,
  y forzar una función común que sirva para las dos sería más frágil que dos
  pantallas parecidas.

## 5. Comportamiento detallado

Lo mismo que la spec 064, con dos diferencias que salen del propio dato:

- Un día de la tabla tiene **una sesión**, no cuatro comidas. El punto de "este
  día tiene algo" mira `dia.sesion`, no una lista.
- Un día de descanso es un día **sin sesión**, y eso es normal, no un hueco por
  rellenar. Se ve igual que un día vacío de la dieta: sin punto.

**La tira se saca a una función común** que sirve a las dos pantallas: son
literalmente el mismo componente, y duplicarlo garantizaría que un arreglo se
aplique en una y no en la otra. La función recibe qué días tienen algo, cuál está
abierto y qué hacer al tocar.

## 6. Modelo de datos

Ninguno.

## 7. Casos límite

Los mismos que la 064: sin tabla no hay tira; una semana guardada con un número
raro de días no deja la pantalla en blanco; y editar un día no cambia el día
abierto. Cambiar de día cierra el formulario de edición.

## 8. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/app.js` | La tira sacada a función común, y `pintarTabla()` usándola. |
| `index.html` | El contenedor de la tira y el enlace, en Mi tabla. |
| `styles.css` | Nada nuevo: se reutilizan las clases de la 064. |

Estimación: **100-150 líneas**, contando lo que se ahorra al compartir la tira.

## 9. Decisiones tomadas

- **Se hace después de probar la 064** (usuario, 29 de agosto), no a la vez: era
  una idea del backlog precisamente para decidirla con la de la dieta ya en uso.
- **La tira se comparte, el resto no.** Las dos pantallas se parecen, pero
  forzar una función común para todo sería más frágil que dos pantallas
  parecidas.

## 10. Fuera de spec: ideas apuntadas

- Ninguna todavía.

## ✅ Para probar a mano

(Lo afina el agente `qa-manual` antes de la prueba.)
