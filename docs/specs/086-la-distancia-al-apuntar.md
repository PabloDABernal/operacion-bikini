# 086 — La distancia, al apuntar

- **Estado:** 🚧 implementada y desplegada el 31 de agosto de 2026. **Pendiente de que el usuario la pruebe.**
- **Fecha:** 2026-08-31
- **Referencia en PRODUCTO.md:** apartado "Qué hará (evolutivos de la fase productiva, desde el 31 de agosto de 2026)", el evolutivo de los kilómetros.

## 1. Objetivo

Que al apuntar un ejercicio se pueda decir **cuántos kilómetros** has hecho, sin
que sea obligatorio.

## 2. Por qué existe

Es lo primero que salió del uso real, el día que arrancó la operación bikini de
verdad: apuntas "andar por el paseo, 45 minutos" y la app no guarda lo que más
te interesa mirar al cabo de un mes, que es cuánto has andado.

La spec **087** hará las estadísticas. Esta solo guarda el dato, y va primero a
propósito: un contador de "0 km este mes" el primer día no dice nada. Primero se
apunta, luego se cuenta.

## 3. Criterio de "esto funciona"

1. En **Ejercicio → Apuntar**, junto a los minutos, hay un campo
   **"Distancia (km)"**, marcado como opcional.
2. Apuntas `andar por el paseo`, 45 minutos y `5,2` km: se guarda y la fila del
   diario dice los kilómetros.
3. Apuntas un ejercicio **sin distancia**: se guarda exactamente como hoy, y su
   fila **no menciona** kilómetros.
4. Se admite la **coma** como separador decimal: `5,2` y `5.2` valen igual.
5. Un valor imposible (`0`, `-3`, `abc`, `900`) **no se guarda** y lo dice.
6. **Editas** un ejercicio ya guardado y le pones distancia: se guarda.
7. Editas uno que la tenía y **vacías** el campo: la distancia **desaparece**.
8. Los ejercicios de antes de esta spec siguen viéndose bien, sin distancia.
9. Los **chips de ejercicios frecuentes** (spec 042) siguen funcionando: al
   pulsar uno rellena el formulario como siempre.

## 4. Alcance

### Entra

- Campo `Distancia (km)` en el alta de ejercicio, opcional.
- El mismo campo al editar una fila del diario.
- La distancia en la fila del diario, cuando la haya.
- Validación: número, con coma o punto, entre 0,1 y 500.

### NO entra (explícitamente fuera)

- **Las estadísticas.** Es la spec 087.
- **Ritmo, calorías o velocidad.** No se calcula nada a partir de la distancia.
- **Puntos ni racha por kilómetros.** La gamificación (spec 031) cuenta días con
  actividad, no cuánto. Meter la distancia ahí cambiaría lo que premia la app.
- **Distancia en la tabla de ejercicio** (specs 029 y 064). La tabla es el plan;
  esto es el diario. Son cosas distintas, como la dieta y las comidas.
- **Que la IA vea los kilómetros.** El contexto que se le manda no cambia. Si
  algún día interesa, es una decisión aparte.
- **Otras unidades.** Kilómetros y ya. Millas no las pide nadie aquí, y metros
  serían el mismo dato con más ceros.
- **Distancia en las comidas ni en el peso.** Solo ejercicio.

## 5. Comportamiento detallado

### El campo

Va **junto a los minutos**, no plegado: se rellena de un vistazo y no hay que
descubrirlo. Decisión del usuario.

```
Minutos        Distancia (km)
[ 45 ]         [ 5,2        ]  ← opcional
```

La etiqueta dice **"Distancia (km)"** y, debajo y en pequeño, **"opcional"**.
Sin esa palabra, un campo vacío junto a uno obligatorio parece que falta
rellenarlo.

> **Arreglado al probarlo.** Se puso primero como `Distancia (km) — opcional`,
> todo en la misma línea. Dos cosas salieron mal y las vio el usuario en la
> primera captura:
>
> 1. **La etiqueta partía en dos líneas** y eso bajaba su campo un renglón, así
>    que los dos campos quedaban a distinta altura. Se arregla con
>    `align-items: end` en la fila —alinea los campos, no las cajas— y sacando
>    "opcional" a su propia línea en pequeño.
> 2. **El campo se salía de la columna** y se montaba encima de la de al lado.
>    Los `input` de este formulario se estiran porque son hijos de un `form` en
>    `flex-column`; metidos en un `div` normal dejan de serlo y se quedan con su
>    ancho por defecto. La fila pasa a ser `flex-column` también.

`inputmode="decimal"`, para que en el móvil salga el teclado numérico con coma.

### La validación

Se hace en `validarEjercicio()`, con los minutos, y sigue su forma: devuelve
`{ ...datos }` o `{ error }`.

- **Vacío o solo espacios**: es válido. No hay distancia y punto.
- La **coma se convierte en punto** antes de leer el número, igual que ya se hace
  con los minutos y con el peso.
- **Fuera de 0,1 – 500 km**, o no numérico → error
  `La distancia debe estar entre 0,1 y 500 km.`
- Se guarda con **un decimal**: `5,25` → `5,3`. Más precisión que esa es ruido
  en un paseo.

### Cómo se guarda

El campo **solo existe si hay distancia**. Un ejercicio sin ella se guarda como
hoy, sin el campo puesto a cero ni a `null`.

Es el mismo criterio que ya usa `hora` en `guardarEjercicio()`: *"si no lo has
dicho, no está"*. Un `0` mentiría —diría que anduviste cero kilómetros— y las
estadísticas de la 087 tendrían que aprender a distinguirlo de "no lo apunté".

**Al editar** hay que hacer lo contrario y borrarlo de verdad: si vacías el
campo, la distancia se va. Se usa `deleteField()` de Firestore, porque
`updateDoc` con `undefined` no borra nada.

### En la fila del diario

La distancia se añade a la línea de detalle que ya existe (spec 043), junto a
los minutos y la intensidad:

```
Andar por el paseo
45 min · 5,2 km · Media
```

Si no hay distancia, esa línea sale **exactamente como hoy**.

## 6. Modelo de datos

`usuarios/{uid}/ejercicios/{id}`, campo nuevo:

| Campo | Tipo | Qué |
|---|---|---|
| `distanciaKm` | number, **opcional** | Kilómetros, con un decimal. Si no está, no se apuntó. |

`firestore.rules`: **sin cambios**. Es un campo más de una colección que ya está
permitida.

`js/reinicio.js`: **sin cambios**. Se borra con los ejercicios.

## 7. Casos límite

- **Ejercicios de antes de esta spec**: no tienen el campo. Se ven igual que
  siempre. La 087 los contará como "sin distancia", no como cero.
- **Distancia sin minutos**: no puede pasar. Los minutos siguen siendo
  obligatorios y su error salta primero.
- **`0` y `0,0`**: se rechazan. Un ejercicio de cero kilómetros no es un dato, es
  un despiste; quien no anduvo deja el campo vacío.
- **`5,25`**: se guarda `5,3`. Igual que los minutos, que ya redondean en
  silencio.
- **Un número con espacios** (` 5,2 `): se limpia y vale.
- **Sin conexión al guardar**: sale el error de siempre y no se guarda nada. La
  distancia no cambia eso.
- **Un chip de ejercicio frecuente** (spec 042): rellena texto, minutos e
  intensidad como hasta ahora, y **deja la distancia vacía**. Los chips salen de
  lo que repites, y los kilómetros de un paseo no se repiten.

## 8. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| **Visible junto a los minutos**, no plegado | Se rellena de un vistazo. Decisión del usuario el 31 de agosto. |
| **Opcional, y dicho en la etiqueta** | Un campo vacío al lado de uno obligatorio parece un olvido si nadie aclara que no lo es. |
| **Si no hay distancia, no hay campo** | Un `0` diría que anduviste cero kilómetros. Mismo criterio que `hora`. |
| **Un decimal** | Más precisión es ruido en un paseo. |
| **Entre 0,1 y 500 km** | Por debajo no es un ejercicio; por encima es un dedo que ha resbalado. |
| **Solo kilómetros** | Millas no las pide nadie; metros es el mismo dato con más ceros. |
| **Las estadísticas van aparte** (087) | Un "0 km este mes" el primer día no dice nada. Primero se apunta. |
| **Ni puntos ni racha por kilómetros** | Cambiaría lo que la app premia, que son días con actividad. |

## 9. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/ejercicios.js` | Validar la distancia; guardarla solo si la hay; borrarla al vaciar el campo. |
| `index.html` | El campo en el alta de ejercicio. |
| `js/app.js` | Leerlo al guardar, pintarlo en la fila y meterlo en la fila en edición. |
| `styles.css` | Los dos campos en una fila, si hace falta. |
| `docs/specs/086-distancia-casos.mjs` | **Nuevo.** Casos de la validación. |

Estimación: **muy por debajo de las 300 líneas**.

## 10. Fuera de spec: ideas apuntadas

- Ritmo (min/km) a partir de minutos y distancia.
- Enseñar la distancia también en el resumen de Hoy, que hoy dice solo
  "texto · N min". Se dejó fuera: primero se ve si el dato se usa.
- Que la IA vea los kilómetros al pasar consulta.
- Distancia en la tabla de ejercicio, como objetivo de la semana.

## ✅ Para probar a mano

Guion completo: lo afina `qa-manual`. En corto, los nueve puntos del apartado 3,
con especial atención al **7** —vaciar la distancia de un ejercicio que la tenía
tiene que borrarla de verdad— y al **8**, que es la regresión sobre todo lo que
ya tienes apuntado.
