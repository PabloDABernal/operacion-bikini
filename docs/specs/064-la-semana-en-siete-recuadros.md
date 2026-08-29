# 064 — La semana de la dieta, en siete recuadros

- **Estado:** implementada y desplegada el 29 de agosto de 2026. **Pendiente de que el usuario la pruebe**; hasta entonces NO es completada.
- **Fecha:** 2026-08-29
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v10: la semana que se lee y la app con iconos, decidida el 29 de agosto de 2026)", primera spec de las tres.

## 1. Objetivo

Que la semana de la dieta se lea de un vistazo: una tira de siete recuadros
**L M X J V S D**, con el día de hoy marcado, y las comidas del día elegido
debajo.

## 2. Por qué existe

El usuario, el 29 de agosto: *"los días de la dieta se descuadran"*.

La causa está localizada. `.comida-dieta` es una fila flexible con la etiqueta
del momento (5rem fijos), el plato (elástico) y **dos botones de texto de ancho
variable**: "Me lo he comido" solo aparece si la comida tiene texto, y el otro
botón dice "Editar" o "+" según esté llena o vacía. Como cada fila tiene botones
de distinto ancho, **la columna del plato acaba en un sitio distinto en cada
fila** y la semana se lee torcida.

Los iconos de la spec 065 arreglan el ancho de los botones. Esta spec arregla lo
otro: veintiocho filas seguidas en pantalla son demasiado para encontrar lo de
hoy.

## 3. Criterio de "esto funciona"

1. En **Comidas → Mi dieta**, encima de las comidas hay una tira de **siete
   recuadros**, uno por día, con las letras **L M X J V S D**.
2. El **día de hoy se ve marcado**, distinto de los demás, sin tener que tocarlo.
3. Al entrar, **el día abierto es hoy**.
4. Tocar un recuadro abre ese día: debajo salen **solo sus cuatro comidas**
   (desayuno, comida, merienda y cena).
5. Solo hay **un día abierto a la vez**.
6. Encima de las comidas se ve **el nombre completo del día abierto**
   ("miércoles"), para que la letra no haya que descifrarla.
7. Un recuadro cuyo día **no tiene ninguna comida puesta** se distingue de uno
   que sí, sin tener que abrirlo.
8. Todo lo que ya funcionaba en la semana sigue igual: **"Me lo he comido"**,
   **editar una celda**, y **abrir la receta** tocando el nombre del plato
   (spec 060).
9. Hay forma de **ver la semana entera** de una vez, como hasta ahora, para
   repasarla.
10. Sin dieta, la pantalla dice lo mismo que hoy y no enseña recuadros vacíos.

## 4. Alcance

### Entra

- La tira de siete recuadros, con su letra, el día de hoy marcado y la señal de
  "este día está vacío".
- Abrir un día y pintar solo sus comidas.
- Un modo "ver la semana entera", que es lo que hay hoy.
- El nombre completo del día abierto.

### NO entra (explícitamente fuera)

- **Los iconos de "Me lo he comido" y "Editar".** Son la spec 065. Esta spec
  reorganiza la semana; aquella arregla el ancho de los botones. Las dos juntas
  cierran el descuadre, pero se prueban por separado.
- **Cambiar el modelo de datos de la dieta.** La semana sigue siendo siete días
  con sus cuatro comidas.
- **La tabla de ejercicio.** Tiene el mismo problema y no se toca aquí; si
  funciona, se hace luego con lo aprendido. Se apunta en `docs/BACKLOG.md`.
- **Marcar qué has cumplido** en la semana. Sigue descartado desde la v4 y
  contradice `docs/PRODUCTO.md`.

## 5. Comportamiento detallado

### La tira

Siete botones en fila, del lunes al domingo. Cada uno lleva:

- **La letra**: `L M X J V S D`. La equis del miércoles es la convención
  española, no una errata.
- Debajo, **un punto** si ese día tiene alguna comida puesta. Sin punto, el día
  está vacío. No se pone el número de comidas: lo que se quiere saber de un
  vistazo es si hay algo, no cuánto.

Estados, y los tres se distinguen entre sí:

- **Hoy**: marcado siempre, se esté mirando o no.
- **Abierto**: el que se está viendo.
- **Hoy y abierto a la vez**: es lo normal al entrar, así que tiene que verse
  bien, no como un choque de dos estilos.

Son `<button>` de verdad, con `aria-label` diciendo el día entero ("lunes") y
`aria-current` en el abierto: la letra sola no se la puede leer nadie que no vea
la pantalla.

### Qué día se abre al entrar

**Hoy.** `diaDeLaSemana()` de `js/fechas.js` ya da el índice, con el lunes como
0, que es justo el orden en que la dieta guarda sus días.

Si se está viendo un día y se recarga la página, vuelve a abrirse hoy. No se
recuerda: es un estado de mirar, no una preferencia.

### Las comidas del día abierto

Debajo de la tira, con el nombre completo del día como título. Las mismas cuatro
filas de siempre (`filaDeComida()`), sin tocar nada de lo que hacen: el botón de
comido, el de editar y el nombre del plato que abre la receta.

**Editar una celda no cierra el día** ni cambia el día abierto.

### Ver la semana entera

Un enlace **"Ver la semana entera"** debajo. Al pulsarlo, se pintan los siete
días seguidos, como hoy, y el enlace pasa a **"Ver un día"**. La tira sigue
visible en los dos modos.

Es lo que hay hoy, conservado: la vista de un día sirve para lo diario, y la de
la semana para repasar lo que te han mandado. Quitarla sería cambiar una pantalla
por otra en vez de mejorarla.

## 6. Modelo de datos

**Ninguno.** No se guarda nada nuevo. El día abierto y el modo de vista son
variables de módulo, como `celdaEditando` y `recetaDeDietaAbierta`.

## 7. Casos límite

- **Sin dieta**: no hay tira, y el texto de siempre invitando a montarla.
- **Día abierto sin ninguna comida puesta**: se abre igual y enseña sus cuatro
  filas vacías con su "+". No es un estado de error.
- **Editar una celda del día abierto**: el formulario sale en su sitio y al
  guardar se vuelve al mismo día.
- **Vaciar la semana y empezar de nuevo**: la tira se queda, todos los días sin
  punto, y hoy sigue marcado.
- **Una receta abierta (spec 060) y se cambia de día**: la receta se cierra.
  `recetaDeDietaAbierta` se guarda por posición (`"2-1"`), así que dejarla
  abierta al cambiar de día enseñaría la receta de otro plato.
- **Pasar la medianoche con la app abierta**: el día marcado sigue siendo el de
  cuando se cargó. Es la misma medianoche que arrastra "Hoy" entero, heredada a
  propósito (igual que en la spec 061).

## 8. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/app.js` | `pintarDieta()`: la tira, el día abierto y los dos modos de vista. |
| `index.html` | El contenedor de la tira y el enlace de cambiar de vista. |
| `styles.css` | Los recuadros y sus tres estados. |

No toca `js/dietas.js`, ni las reglas, ni `api/`: no cambia ningún dato.

Estimación: **150-200 líneas**, casi todas en `pintarDieta()` y en CSS.

## 9. Decisiones tomadas

- **Siete recuadros con L M X J V S D, y las comidas del día elegido debajo**
  (usuario, 29 de agosto).
- **El día de hoy, marcado y abierto al entrar** (usuario, misma conversación).
- **Se conserva la vista de la semana entera** (Claude, al escribir la spec): lo
  que hay hoy sirve para repasar lo que te han mandado, y cambiarla por la vista
  de un día sería sustituir una pantalla en vez de mejorarla.
- **Un punto por día con algo, no el número de comidas**: de un vistazo interesa
  si hay algo, no cuánto.

## 10. Fuera de spec: ideas apuntadas

- La misma tira para la tabla de ejercicio, que tiene el mismo problema.
- Que el día abierto se recuerde al volver a la pestaña.

## ✅ Para probar a mano

(Lo afina el agente `qa-manual` antes de la prueba.)
