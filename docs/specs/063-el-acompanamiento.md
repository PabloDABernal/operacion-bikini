# 063 — El acompañamiento de la comida

- **Estado:** cerrada el 29 de agosto de 2026 (las dos decisiones abiertas, resueltas con el usuario). Lista para implementar.
- **Fecha:** 2026-08-29
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v9)", tercera spec de las tres.

## 1. Objetivo

Que al apuntar una comida se pueda decir con qué la acompañaste —"3 trozos de
pan", "un biscote"— sin inventarse un registro aparte, y que la IA lo vea como
**una sola ingesta** y no como dos.

## 2. Por qué existe

El usuario lo pidió el 28 de agosto: *"si tomas 3 trozos de pan, un biscote o lo
que sea con las comidas"*.

Hoy hay dos formas de apuntarlo y las dos mienten:

- Escribirlo dentro del texto de la comida ("lentejas y 3 trozos de pan") lo
  mezcla con el plato, y luego el chip de comida frecuente y la dieta arrastran
  el pan pegado al nombre del plato.
- Apuntarlo como **picoteo** aparte lo convierte en una segunda ingesta. La IA lo
  lee como que picaste entre horas, que es justo lo contrario de lo que pasó.

## 3. Criterio de "esto funciona"

1. Al apuntar una comida se pueden añadir **varios acompañamientos**, uno a uno.
2. Cada uno se puede **quitar** antes de guardar.
3. Una comida sin acompañamientos se apunta y se ve **exactamente como hoy**. Es
   el caso mayoritario y no puede volverse más incómodo.
4. En la lista del día, la comida enseña sus acompañamientos **sin parecer otra
   entrada**.
5. Se pueden **editar** los acompañamientos de una comida ya apuntada.
6. La IA los recibe **pegados a su comida**: lo que ve es "lentejas con verduras
   + 3 trozos de pan" en un solo registro, no dos líneas.
7. Las comidas apuntadas antes de esta spec siguen viéndose y funcionando igual.

## 4. Alcance

### Entra

- Añadir y quitar acompañamientos al apuntar y al editar una comida.
- Cómo se ven en la lista del día y en Hoy.
- Cómo viajan dentro del bloque de registros que va a la IA
  (`describirRegistros()` en `api/_ia.js`).

### NO entra (explícitamente fuera)

- **El análisis nutricional.** Es la **spec 070**, que sale de la misma
  conversación: el usuario decidió que el acompañamiento **sí** entre en el
  análisis, y de paso las bebidas. Eso toca `api/analisis.js` y se hace aparte
  para poder probar una cosa y luego la otra.
- **Un catálogo de acompañamientos** o chips de acompañamiento frecuente. Idea.
- **Cantidades estructuradas** ("3 × pan"). Texto libre, como el resto.

## 5. Comportamiento detallado

### Al apuntar

Debajo del texto de la comida, un bloque **"¿Con qué lo acompañaste?"**: un campo
corto y un botón de añadir. Lo añadido aparece como **chips**, cada uno con su
aspa para quitarlo.

- Máximo **60 caracteres** por acompañamiento. Es "3 trozos de pan", no una
  frase.
- Máximo **5 acompañamientos** por comida. Por encima de eso ya no es un
  acompañamiento, es otra comida.
- Vacío o repetido (comparado sin tildes ni mayúsculas) no se añade.
- **El bloque no estorba si no se usa**: el campo está ahí, pero una comida sin
  acompañamientos se guarda igual que siempre, sin tocar nada.

### En la lista del día

La comida enseña sus acompañamientos en su **segunda línea**, junto al momento y
la hora, con el formato que ya usan las filas del diario desde la spec 043. Nunca
como una entrada aparte: son parte de esa comida.

### Al editar

La fila en edición trae los mismos chips, con su campo para añadir y sus aspas
para quitar.

### Lo que ve la IA

En `describirRegistros()`, pegados a su comida y en la misma línea:

```
- 2026-08-29 (comida): lentejas con verduras + 3 trozos de pan
```

**Nunca en una línea propia.** Es el motivo entero de la spec: una línea aparte
se lee como otra ingesta.

## 6. Modelo de datos

Un campo nuevo dentro de los documentos de `comidas` que ya existen:

| Campo | Tipo | Qué es |
|---|---|---|
| `acompanamientos` | array de string | Hasta 5, de 1 a 60 caracteres cada uno. Ausente o vacío en las comidas de antes. |

**Sin colección nueva y sin migración**: las comidas viejas simplemente no lo
tienen, y todo lo que lo lee usa `|| []`.

Se eligió lista y no un solo campo de texto por decisión del usuario del 29 de
agosto. El coste es un formulario algo más vivo; la ventaja es que cada
acompañamiento es un dato y no una frase que luego hay que interpretar — lo que
importa cuando la spec 070 se los pase al análisis.

## 7. Casos límite

- **Comida sin acompañamientos**: todo igual que antes de esta spec.
- **Comida vieja sin el campo**: `|| []`, no revienta.
- **Añadir un repetido**: no se añade, y se dice.
- **Más de 5**: el campo deja de aceptar y lo dice.
- **Guardar con texto a medias en el campo de acompañamiento**: se añade solo lo
  que se haya confirmado con el botón. El texto suelto no se guarda, para que no
  entre a medias sin que el usuario lo vea como chip.
- **Editar y quitarlos todos**: se guarda la comida sin ellos, con el campo
  vacío.

## 8. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/comidas.js` | `acompanamientos` en `validarComida()`, `guardarComida()` y `actualizarComida()`. |
| `index.html` | El bloque de acompañamientos en el formulario de comida. |
| `js/app.js` | Los chips al apuntar y al editar, y la segunda línea de la fila. |
| `api/_ia.js` | `describirRegistros()`, pegados a su comida. |
| `styles.css` | Los chips con su aspa. |

Estimación: **200-250 líneas**.

## 9. Decisiones tomadas

- **Va DENTRO de la comida, no al lado** (usuario, 28 de agosto). No es un
  picoteo: apuntarlo aparte le dice a la IA que picaste entre horas, que es lo
  contrario de lo que pasó.
- **Una lista de varios, no un campo de texto** (usuario, 29 de agosto).
- **El análisis nutricional se hace aparte, en la spec 070** (Claude, al cerrar
  esta): el usuario dijo que sí entren, y eso toca `api/analisis.js`, que hoy
  funciona. Dos specs para poder probar una cosa y luego la otra.

## 10. Fuera de spec: ideas apuntadas

- Chips de acompañamiento frecuente, como los de ejercicio (spec 042).

## ✅ Para probar a mano

(Lo afina el agente `qa-manual` antes de la prueba.)
