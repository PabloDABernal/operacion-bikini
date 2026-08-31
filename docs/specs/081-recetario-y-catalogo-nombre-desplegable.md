# 081 — Recetario y Catálogo: el nombre se despliega dentro de la cabecera

- **Estado:** 🚧 implementada y desplegada el 31 de agosto de 2026 (commit `0bd2cda`), revisada por `revisor-specs` y `revisor-codigo`. **Pendiente de que el usuario la pruebe.**
- **Fecha:** 2026-08-31
- **Referencia en PRODUCTO.md:** "Qué hará (evolutivos de la fase productiva, desde el 31 de agosto de 2026)"

## 1. Objetivo

En Comidas → Recetario y Ejercicio → Catálogo de ejercicios, el nombre de una
receta o ejercicio largo, hoy cortado a una línea en la cabecera de su
tarjeta, se puede desplegar entero al tocarlo, sin que eso abra o cierre la
tarjeta (que sigue siendo tocable con el resto de la cabecera, como hoy).

Es la hermana de la spec 080 (mismo comportamiento, mismo criterio de
"esto funciona"), separada porque aquí hay un problema técnico extra: el
nombre vive DENTRO de un `<button>` que ya hace otra cosa al tocarlo.

## 2. El problema, y la solución elegida

Hoy la cabecera de cada tarjeta (`tarjetaDeReceta()` / `tarjetaDeEjercicio()`
en `js/app.js`) es un `<button>` nativo (creado con `botonDeFila()`), y el
nombre es un `<span>` sin comportamiento propio dentro de ese botón.

Meter un segundo elemento tocable (otro `<button>`) dentro de un `<button>`
es HTML inválido: el navegador cierra el botón exterior en cuanto encuentra
el anidado, y la cabecera dejaría de abrir/cerrar la tarjeta.

**Decisión del usuario, tras la revisión:** la cabecera deja de ser un
`<button>` nativo y pasa a ser un `<div>` con `role="button"`,
`tabindex="0"` y su propio manejo de teclado (Enter y Espacio activan lo
mismo que el click, igual que hace un `<button>` de serie). Dentro de ese
div, el nombre pasa a ser un `<button>` de verdad, tocable por separado.

## 3. Criterio de "esto funciona"

1. En Comidas → Recetario, busca una receta con nombre largo. Su cabecera se
   ve cortada a una línea, tanto con la tarjeta cerrada como abierta.
2. Toca el nombre: se despliega entero, sin abrir ni cerrar la tarjeta.
   Tócalo otra vez: vuelve a recortarse.
3. Toca el resto de la cabecera (fuera del nombre): abre o cierra la tarjeta
   entera, exactamente igual que hoy.
4. La cabecera sigue funcionando con teclado: se puede llegar a ella con
   Tab, y Enter (o Espacio) abre/cierra la tarjeta igual que un click.
5. Dentro de la cabecera, el nombre también se puede alcanzar con Tab por
   separado, y Enter lo despliega/contrae.
6. Repite los puntos 1 a 5 en Ejercicio → Catálogo de ejercicios, con un
   ejercicio de nombre largo.
7. Pueden estar varios nombres desplegados a la vez (en distintas tarjetas,
   o una tarjeta abierta con su nombre desplegado) sin interferir entre sí.

## 4. Alcance

### Entra
- Comidas → Recetario: `tarjetaDeReceta()` en `js/app.js`.
- Ejercicio → Catálogo de ejercicios: `tarjetaDeEjercicio()` en `js/app.js`.
- Cambiar la cabecera de ambas de `<button>` (vía `botonDeFila()`) a
  `<div role="button">` con manejo de teclado propio.
- El nombre (`.receta-nombre`), de `<span>` a `<button>` tocable con su
  propio estado de desplegado/contraído.

### NO entra (explícitamente fuera)
- Mi dieta, Mi tabla, Histórico: spec 080, sin este conflicto de anidamiento.
- Cualquier otro sitio que use `botonDeFila()`: el cambio de `<button>` a
  `<div role="button">` es solo para estas dos cabeceras, no un cambio al
  patrón `botonDeFila()` en general.
- Cambiar qué se ve dentro de la tarjeta abierta (ingredientes, pasos, cómo
  se hace): sigue igual.

## 5. Comportamiento detallado

- La cabecera (`<div role="button" tabindex="0">`) escucha click, Enter y
  Espacio para abrir/cerrar la tarjeta, igual que hacía el `<button>` nativo.
  Espacio debe evitar el scroll de página que hace por defecto en un
  elemento no nativo.
- El nombre, dentro de la cabecera, es un `<button>` con su propio
  `stopPropagation()` en el click (y en el keydown de Enter/Espacio) para
  que activarlo no dispare también el toggle de la cabecera.
- Desplegado: se quita el recorte de una línea y el texto se parte en tantas
  líneas como haga falta. Contraído (estado inicial): vuelve a una línea.
- El estado de "nombre desplegado" es independiente del estado de "tarjeta
  abierta": cerrar la tarjeta no tiene por qué contraer el nombre, y
  viceversa. Si al reabrir la tarjeta el nombre seguía marcado como
  desplegado, se enseña desplegado.
- Identidad de cada nombre en el Set de desplegados: el `id` de la receta o
  del ejercicio, igual que ya usan `recetaAbierta`/`ejercicioAbierto`.

## 6. Modelo de datos

Ninguno. Estado de interfaz en memoria: un Set de ids desplegados por
pantalla (Recetario y Catálogo, cada uno el suyo).

## 7. Casos límite

- Nombre que ya cabe sin recortarse: tocarlo no cambia nada visible.
- Activar la cabecera con teclado (Enter/Espacio) estando el foco en el
  nombre: no debe pasar — el foco en el botón del nombre solo activa el
  nombre, gracias al `stopPropagation()`.
- Lector de pantalla: la cabecera anuncia su rol de botón y su estado
  (`aria-expanded`) igual que antes; el nombre, al ser ahora un `<button>`
  propio, se anuncia como un control aparte con su propio `aria-expanded`.

## 8. Archivos afectados

- `js/app.js`: `tarjetaDeReceta()`, `tarjetaDeEjercicio()`, y el estado nuevo
  (dos Sets, uno por pantalla).
- `styles.css`: `.receta-cabecera` (ajustar para que un `<div role="button">`
  se vea y se comporte igual que el `<button>` de antes), `.receta-nombre`, y
  la clase de "desplegado" (puede reutilizarse la misma que cree la 080 si
  encaja).

## 9. Decisiones tomadas

- **La cabecera pasa de `<button>` nativo a `<div role="button">`** con
  manejo de teclado propio, para poder meter el nombre como botón
  independiente dentro. Decisión del usuario, tras la revisión de
  `revisor-specs`.
- Todo lo demás (interruptor al tocar, varios desplegados a la vez) es igual
  que la spec 080: mismas decisiones, misma razón.

## 10. Fuera de spec: ideas apuntadas

Ninguna.

## ✅ Para probar a mano

(Lo afina el agente `qa-manual` antes de la prueba; guion provisional.)

1. En Comidas → Recetario, busca una receta de nombre largo. Toca el nombre:
   debe desplegarse sin abrir la tarjeta.
2. Toca el resto de la cabecera: debe abrir la tarjeta (el nombre, si no lo
   tocaste, sigue recortado).
3. Con la tarjeta abierta, toca el nombre: debe desplegarse sin cerrar la
   tarjeta.
4. Con el teclado (Tab + Enter), comprueba que se puede abrir/cerrar la
   tarjeta y, por separado, desplegar/contraer el nombre.
5. Repite los cuatro pasos en Ejercicio → Catálogo de ejercicios.
