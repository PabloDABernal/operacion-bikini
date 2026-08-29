# 065 — Iconos en las acciones de fila

- **Estado:** implementada y desplegada el 29 de agosto de 2026. **Pendiente de que el usuario la pruebe**.
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

## 8 bis. Lo que salió al implementarla

**El descuadre no era lo que decía la spec 064.** Esta spec se escribió creyendo
que la causa era el ancho variable de los botones. Al ver la captura del usuario
quedó claro que era otra cosa, y más concreta: el plato con receta se pinta como
`<button>` desde la spec 060, y **un `<button>` no puede recortar su propio
texto**. El navegador mete el contenido del botón en una caja anónima cuyo ancho
mínimo es el del contenido y que ignora el `text-overflow` del botón. Resultado:
ese plato no se encogía, la fila crecía y los botones se salían del recuadro.

Por eso solo se descuadraba **la fila que tenía receta**, que es lo que se ve en
la captura: las demás son `<span>` y se recortan bien.

Arreglado metiendo el texto en un `<span>` dentro del botón, con el recorte en el
span y el botón como contenedor flexible. El ancho fijo de los iconos sigue
valiendo —ahora las filas miden todas igual—, pero **no era la causa**.

**`responderEnBoton()` tuvo que aprender de iconos.** Cambiaba el `textContent`
para decir "✓ Guardado", lo que en un botón de icono habría borrado el dibujo y
lo habría devuelto como texto suelto. Ahora, si el botón tiene un SVG dentro, el
aviso es solo el color: el icono ya es una marca de visto.

## 8 ter. El cuarto intento, que es el bueno

Tres arreglos no bastaron, y los tres compartían el mismo error de fondo:
**intentar que el texto se portara bien** para que los iconos no se movieran.

1. Recortar con puntos suspensivos. No funcionó en la fila con receta.
2. Meter el texto en un `<span>` dentro del botón. Tampoco.
3. Partirlo en dos líneas con `overflow-wrap: anywhere`. Arregló las filas
   normales, pero **la de la receta seguía saliéndose**.

El patrón estaba claro: siempre fallaba la misma fila, la única cuyo plato es un
`<button>` (spec 060). Un `<button>` no gobierna su propio ancho mínimo, y cada
intento era otra forma de pedirle que lo hiciera.

**La fila de la dieta pasa a ser una rejilla** de cuatro columnas fijas: momento,
plato, comido, editar. Las columnas de los iconos miden 44 px pase lo que pase, y
la del texto es `minmax(0, 1fr)`, que no puede crecer por encima de su sitio. El
texto se parte o se recorta dentro de su columna, pero **ya no puede empujar
nada**, porque no es él quien coloca los iconos.

La lección, para la próxima: cuando algo se sale de su sitio, es más barato
fijarle el sitio que convencer al contenido de que no crezca.

## 9. Decisiones tomadas

- **Solo las acciones que se repiten en cada fila, y la barra** (usuario, 29 de
  agosto). Los botones únicos se quedan en texto.

## 10. Fuera de spec: ideas apuntadas

- Ninguna todavía.

## ✅ Para probar a mano

(Lo afina el agente `qa-manual` antes de la prueba.)
