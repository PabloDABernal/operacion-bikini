# 063 — El acompañamiento de la comida

- **Estado:** borrador
- **Fecha:** 2026-08-29
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v9)", tercera spec de las tres.
- **Depende de:** nada técnicamente, pero va la última: es la que toca el prompt de la IA, y conviene hacerla con las otras dos ya en uso.

## 1. Objetivo

Que al apuntar una comida se pueda decir con qué la acompañaste —"3 trozos de
pan", "un biscote"— sin tener que inventarse un registro aparte, y que la IA lo
vea como **una sola ingesta** y no como dos.

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

1. Al apuntar una comida hay un campo corto, opcional, para el acompañamiento.
2. Una comida sin acompañamiento se apunta y se ve **exactamente como hoy**. Es
   el caso mayoritario y no puede volverse más incómodo.
3. En la lista del día, la comida enseña su acompañamiento sin parecer otra
   entrada.
4. Se puede editar y quitar el acompañamiento de una comida ya apuntada.
5. La IA lo recibe **pegado a su comida**, no como una línea suelta: lo que ve es
   "lentejas con verduras + 3 trozos de pan" en un solo registro.
6. Las comidas apuntadas antes de esta spec, sin acompañamiento, siguen viéndose
   y funcionando igual.

## 4. Alcance

### Entra

- Campo de acompañamiento al apuntar y al editar una comida.
- Cómo se ve en la lista del día y en Hoy.
- Cómo viaja dentro del bloque de registros que va a la IA
  (`describirRegistros()` en `api/_ia.js`).

### NO entra (explícitamente fuera)

- **El análisis nutricional.** *(A decidir: aquí el argumento es más flojo que en
  las bebidas. El pan SÍ es comida sólida y SÍ pertenece a un grupo, así que
  dejarlo fuera del análisis significa que el análisis miente sobre lo que
  comiste. Ver el apartado 5.)*
- **Un catálogo de acompañamientos** o chips de acompañamiento frecuente. Se
  apunta como idea.
- **Cantidades estructuradas** ("3 × pan"). Es texto libre, como el resto.

## 5. Pendiente de decidir con el usuario

**Esta spec está a medias a propósito**, por lo mismo que la 062: se escribe
ahora para fijar el reparto de la v9 desde el inicio, pero no se rellena con
suposiciones.

1. **¿El acompañamiento entra en el análisis nutricional?** Es la pregunta
   incómoda de la v9. Con las bebidas se decidió que no, y el argumento aguanta
   —una cerveza no encaja en seis grupos sólidos—. Aquí no aguanta igual: tres
   trozos de pan son cereales y féculas, uno de los seis grupos, y son bastantes
   calorías. Si el acompañamiento queda fuera, **el análisis del día dirá menos
   de lo que comiste**, y eso es peor que no tener acompañamiento. La
   contrapartida es tocar `api/analisis.js`, que hoy funciona.
2. **¿Un campo, o varios?** "3 trozos de pan y una copa de vino" en un solo campo
   es texto libre y ya está. Varios campos es una lista, y una lista dentro de
   cada comida es otro modelo de datos.

## 6. Modelo de datos

Un campo `acompanamiento` (string, opcional) dentro del documento de `comidas`
que ya existe. Sin colección nueva y sin migración: las comidas viejas
simplemente no lo tienen.

Esto sí está claro y no depende de las decisiones de arriba, **salvo** que se
elija la lista de la decisión 2.

## 7. Archivos afectados (estimación)

| Archivo | Qué |
|---|---|
| `js/comidas.js` | El campo en `validarComida()`, `guardarComida()` y `actualizarComida()`. |
| `index.html` | El campo en el formulario de apuntar y en el de editar. |
| `js/app.js` | La fila del diario y el resumen de Hoy. |
| `api/_ia.js` | `describirRegistros()`, para que viaje pegado a su comida. |
| `styles.css` | Cómo se ve dentro de la fila. |

## 8. Decisiones tomadas

- **Va DENTRO de la comida, no al lado** (usuario, 28 de agosto). No es un
  picoteo: apuntarlo aparte le dice a la IA que picaste entre horas, que es lo
  contrario de lo que pasó.

## 9. Fuera de spec: ideas apuntadas

- Chips de acompañamiento frecuente, como los de ejercicio (spec 042).

## ✅ Para probar a mano

(Cuando la spec esté cerrada.)
