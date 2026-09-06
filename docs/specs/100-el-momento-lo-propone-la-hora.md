# 100 — El momento lo propone la hora

- **Estado:** borrador
- **Fecha:** 2026-09-06
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v16: registrar en un toque)", tercer punto

## 1. Objetivo

En Comidas → Apuntar → "Nueva comida", el campo "Momento" deja de salir
siempre en "Comida" y propone el momento según la hora a la que se está
apuntando, usando el mismo criterio de franja más cercana que ya usan la
spec 097 y "Lo que toca ahora" (spec 098). Sigue siendo un desplegable: se
puede cambiar a mano en cualquier momento.

## 2. Criterio de "esto funciona"

1. Son las 8:00 de la mañana. Entro en Comidas → Apuntar. El campo "Momento"
   ya sale en **Desayuno**, sin tocarlo.
2. Son las 20:00. Entro en Comidas → Apuntar. El campo sale en **Cena**.
3. Guardo una comida. El formulario se limpia para la siguiente, y el campo
   "Momento" vuelve a proponerse según la hora actual (no se queda pegado al
   que acabo de usar).
4. Toco "Cambiar fecha y hora" y pongo la hora a las 9:15. El campo
   "Momento" pasa a proponer **Desayuno**, aunque sean otra hora de verdad.
5. Sigo con la hora en 9:15 y cambio el campo "Momento" a mano, a
   **Merienda**. Después cambio la hora a las 21:00. El campo se queda en
   **Merienda**: no se pisa mi elección manual.
6. Limpio el formulario guardando esa comida. Al volver a abrirlo, el
   "Momento" se vuelve a proponer solo, según la hora de ese instante.
7. Elijo a mano "Picoteo" en el desplegable en cualquier momento del día:
   sigue estando en la lista y se puede elegir, aunque nunca se proponga
   solo.

## 3. Alcance

### Entra
- El valor inicial (y el de después de cada guardado) del campo "Momento" se
  calcula con `momentoQueToca()` (spec 098) sobre la hora del campo "Hora"
  del propio formulario —o la hora real del dispositivo si el campo "Hora"
  está vacío—, en vez de ser siempre `MOMENTO_POR_DEFECTO` ("Comida").
- **Cambiar la hora del formulario recalcula la propuesta**, mientras no se
  haya tocado el desplegable de Momento a mano desde el último formulario en
  blanco.
- **En cuanto se cambia el Momento a mano, deja de recalcularse** aunque
  después se siga cambiando la hora, hasta el siguiente formulario en blanco
  (tras guardar, o al entrar de nuevo con la sesión iniciada).
- "Picoteo" nunca se propone solo (no tiene franja fija), pero sigue en el
  desplegable para elegirlo a mano, exactamente como hoy.

### NO entra (explícitamente fuera)
- **No toca Mi dieta ni "Lo que toca ahora"** (spec 098): ninguna de las dos
  pantallas tiene un campo "Momento" que rellenar; el plato ya trae su propio
  momento fijado por la dieta.
- **No cambia las franjas fijas** ni el criterio de "franja más cercana": son
  los mismos de las specs 097/098.
- **No toca el campo "Momento" del editor de una comida ya guardada** (spec
  007): sigue mostrando el momento tal cual se guardó, sin proponer nada.
- **No toca el campo "Fecha"** del formulario ni su propuesta por defecto.

## 4. Comportamiento detallado

**Cálculo.** Se reutiliza `momentoQueToca(ahora)` (spec 098, `js/comidas.js`).
`ahora` se construye a partir del campo "Hora" del formulario si tiene un
valor válido; si está vacío, se usa la hora real del dispositivo
(`new Date()`), igual que el resto del formulario trata una hora vacía como
"ahora".

**Cuándo se propone:**
- Al limpiar el formulario (tras guardar con éxito, y al iniciar sesión).
- Cada vez que cambia el campo "Hora" (tecleado o al desplegar el selector de
  hora nativo), **mientras el desplegable de Momento no se haya tocado a
  mano** desde la última vez que se propuso.

**Cuándo se deja de proponer:** en cuanto el propio desplegable de Momento
cambia por una acción del usuario, se marca como "tocado a mano" y deja de
recalcularse con la hora hasta el siguiente formulario en blanco.

## 5. Modelo de datos

Ninguno. No se guarda ningún campo nuevo: el momento sigue siendo el mismo
valor de siempre (`comida.momento`), solo cambia qué valor propone el
desplegable antes de guardar.

## 6. Casos límite

- **Empate exacto entre dos franjas** (por ejemplo las 11:30, a 2h30 de
  desayuno y de comida): se resuelve igual que en la spec 098 — gana la que
  aún no ha llegado.
- **Hora inválida o vacía en el campo**: se trata como "ahora" (hora real del
  dispositivo), igual que el resto de la app.
- **Se cambia la fecha pero no la hora**: no afecta a la propuesta, que solo
  mira la hora del día, no la fecha (mismo criterio que `momentoQueToca()`).
- **El desplegable de Momento se toca y se vuelve a dejar en el mismo valor
  que ya tenía propuesto**: cuenta igual como "tocado a mano" y deja de
  seguir a la hora, aunque el valor visible no haya cambiado. **Limitación
  aceptada**: un `<select>` nativo no dispara su evento `change` si se
  reabre y se elige la misma opción que ya estaba puesta, así que este caso
  concreto no se puede distinguir de "no se ha tocado" sin capturar también
  la apertura del desplegable. No merece ese coste: el efecto práctico es
  el mismo (el valor se queda como estaba), solo cambia si sigue
  "enganchado" a la hora o no, y es una diferencia que no se nota usando la
  app.

## 7. Archivos afectados

- `js/app.js`: al limpiar el formulario (éxito de guardado, y
  `limpiarFormularios()`), usar `momentoQueToca()` en vez de
  `MOMENTO_POR_DEFECTO` para el valor inicial de `comida-momento`
  —**sustituyendo solo esa llamada**, no `rellenarDesplegable()` en general,
  que sigue usándose tal cual para `ejercicio-intensidad`—; nuevo listener en
  el campo `comida-hora` que recalcula el momento propuesto mientras no se
  haya tocado a mano; una bandera para saber si el desplegable de Momento se
  tocó a mano desde el último formulario en blanco, que se apaga al limpiar.

**Construir el `Date` que pide `momentoQueToca(ahora)`**: la función recibe
un `Date`, no el string "HH:MM" de `comida-hora`. Se reutiliza
`instanteDe(fecha, hora)` de `js/fechas.js` (ya usada en la spec 097), con
cualquier fecha ISO válida como primer argumento —`momentoQueToca()` solo
mira horas y minutos, así que la fecha en sí es indiferente; puede ser
`hoyISO()` sin más—. Si `comida-hora` está vacío, se usa `new Date()`
directamente en su lugar.

**Trampa conocida, con el orden invertido en el código actual**: en el
bloque de éxito del guardado (`js/app.js`, hoy fija `comida-momento` ANTES
de resetear `comida-hora` a `horaActual()`), hay que **invertir el orden**:
primero resetear `comida-hora` (o usar `new Date()` sin más), y DESPUÉS
calcular el momento propuesto — si no, la propuesta saldría calculada con la
hora de la comida que se acaba de guardar, no con la hora real de ahora, que
es justo lo que pide el paso 3 del criterio de "esto funciona"
("no se queda pegado al que acabo de usar"). `limpiarFormularios()` ya hace
el reset de la hora antes de rellenar el desplegable de momento, así que ese
sitio no tiene esta trampa.

No hace falta tocar `js/comidas.js` ni `docs/specs/098-...-casos.mjs`: las
funciones que se reutilizan (`momentoQueToca`, `instanteDe`) ya existen y ya
están probadas.

**Tamaño estimado**: pequeña, bastante por debajo de las ~300 líneas de
`CLAUDE.md` — es la más corta de las tres de la v16.

## 8. Decisiones tomadas

- **Cambiar la hora del formulario recalcula la propuesta.** Decisión del
  usuario: para la hora que se pone, ese es el momento que tiene sentido
  proponer.
- **Tocar el Momento a mano congela la propuesta** hasta el siguiente
  formulario en blanco, para no pisar una elección ya hecha por el usuario.
  Decisión del usuario.
- **"Picoteo" nunca se propone solo**, porque no tiene franja fija (spec
  097). Sigue disponible para elegirlo a mano.

## 9. Fuera de spec: ideas apuntadas

Ninguna surgida durante la escritura de esta spec.

## ✅ Para probar a mano

(la rellena/afina el agente `qa-manual` antes de la prueba)
