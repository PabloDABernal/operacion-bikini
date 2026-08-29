# 065 — Iconos en las acciones de fila

- **Estado:** borrador
- **Fecha:** 2026-08-29
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v10)", segunda spec de las tres.

## 1. Objetivo

Que los botones que se repiten en cada fila —"Me lo he comido", "Editar",
"Borrar", el "+" de una comida vacía— pasen a ser iconos de ancho fijo.

## 2. Por qué existe

Es la otra mitad del descuadre de la spec 064. Los botones de texto tienen ancho
variable, así que la columna del plato acaba en un sitio distinto en cada fila.
Con iconos, todos miden lo mismo y las filas se alinean solas.

No es un adorno: **es el arreglo**.

## 3. Criterio de "esto funciona"

1. En la semana de la dieta, "Me lo he comido" y "Editar" son iconos.
2. Las filas de la semana quedan **alineadas entre sí**: la columna del plato
   empieza y acaba a la misma altura en todas.
3. Una comida vacía enseña un icono de añadir en vez del "+".
4. Se sigue entendiendo qué hace cada botón sin tocarlo: al pasar el ratón sale
   su nombre, y un lector de pantalla lo lee.
5. Los iconos son lo bastante grandes para acertar con el dedo en el móvil.
6. Todo sigue funcionando igual: marcar comido, editar y abrir la receta.

## 4. Alcance

### Entra

- Los botones de fila de la semana de la dieta: comido, editar, añadir.
- Los de la semana de la tabla de ejercicio, que son los mismos.
- Que cada uno tenga `aria-label` y `title` con su nombre de siempre.

### NO entra (explícitamente fuera)

- **Los botones únicos**: Guardar, Cancelar, Pedir dieta, Analizar, Reintentar.
  Una acción que aparece una vez se explica mejor con su palabra.
- **La barra de navegación.** Es la spec 066.
- **Las filas del diario** (comidas, ejercicios, pesajes, bebidas), que ya usan
  iconos desde la spec 043. Nada que hacer ahí.

## 5. Comportamiento detallado

Los iconos se añaden a `TRAZOS_DE_ICONO` en `js/app.js`, que es donde ya viven
`lapiz` y `papelera`, y se pintan con `botonDeIcono()`, que ya pone el
`aria-label` y el `title`.

Iconos nuevos: **comido** (una marca de verificación) y **anadir** (un más).

**Toda etiqueta que hoy es texto pasa a ser el `aria-label`**, palabra por
palabra: "Me lo he comido" no se convierte en "Comido". Lo que cambia es cómo se
ve, no lo que dice.

### Zona táctil

Los iconos de fila ya tienen su tamaño mínimo definido en `.icono-accion`
(spec 043). Se reutiliza tal cual, sin inventar otro.

## 6. Modelo de datos

Ninguno.

## 7. Casos límite

- **Icono con nombre desconocido**: `iconoDeAccion()` ya devuelve un botón sin
  dibujo y lo grita por consola en vez de tumbar el pintado. Se arregló al
  estrenar la spec 058, cuando un nombre mal escrito vació una lista entera.
- **Sin ratón**: el `title` no se ve en el móvil. Por eso el `aria-label` es
  obligatorio y por eso los botones únicos se quedan en texto.

## 8. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/app.js` | Dos trazos nuevos en `TRAZOS_DE_ICONO`, y las filas de las dos semanas. |
| `styles.css` | Lo justo, si hace falta ajustar la fila. |

Estimación: **60-100 líneas**.

## 9. Decisiones tomadas

- **Solo las acciones que se repiten en cada fila, y la barra** (usuario, 29 de
  agosto). Los botones únicos se quedan en texto.

## 10. Fuera de spec: ideas apuntadas

- Ninguna todavía.

## ✅ Para probar a mano

(Lo afina el agente `qa-manual` antes de la prueba.)
