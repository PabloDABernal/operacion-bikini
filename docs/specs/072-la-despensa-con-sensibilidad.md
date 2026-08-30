# 072 — La despensa con sensibilidad, y la receta con su icono

- **Estado:** implementada y desplegada el 30 de agosto de 2026. **Pendiente de que el usuario la pruebe**.
- **Fecha:** 2026-08-30
- **Referencia en PRODUCTO.md:** apartado "Qué hará (ampliación de la v8)", segunda tanda del 30 de agosto.

## 1. Objetivo

Dos cosas que pidió el usuario el 30 de agosto:

1. Que el plato con receta **se vea como los demás**, y que la receta se abra con
   un icono.
2. Que al llegar una receta, sus ingredientes entren en la despensa **con
   sensibilidad**: uniendo los parecidos, o preguntando si no está seguro.

## 2. Por qué existe

> *"No me gusta cómo se ve lo que ya tengo la receta, igual mejor que salga un
> icono para darle y que se vea igual que el resto. […] cuando obtenga una
> receta, necesito que me ponga todos los ingredientes separados y que salgan
> marcados los que ya tenga y que me dé de alta los que no. Teniendo sensibilidad
> y uniendo los parecidos o preguntando si no está seguro."*

Lo primero venía arrastrándose: entre las specs 060 y 071, el nombre del plato
era un `<button>` subrayado cuando había receta. Se veía distinto del resto de la
semana **y** fue la causa de tres intentos fallidos de arreglar un descuadre,
porque un `<button>` no gobierna su propio ancho mínimo.

Lo segundo es el hueco que dejó la 068: mete los ingredientes limpios, pero **sin
ninguna sensibilidad**. "tomate" y "tomates" entraban como dos cosas distintas.

## 3. Criterio de "esto funciona"

**El icono:**

1. Todos los platos de la semana se ven **igual**, tengan receta o no.
2. Una comida con receta enseña un **icono de libro** que la abre y la cierra.
3. Los iconos de todas las filas siguen **alineados en columna**.

**La despensa:**

4. Si ya tienes "tomate" y la receta trae "2 tomates", **no se añade nada**.
5. Si tienes "tomate" y llega "tomate triturado", **te pregunta** si es lo mismo.
6. Un ingrediente que no se parece a nada tuyo **entra directo**, sin marcar.
7. "Es el mismo" no añade nada. "Son distintos" lo añade como uno más.
8. **"salmón" no se pregunta contra tu "sal"**, ni "pimienta" contra "pimiento".
9. Dos recetas de la misma dieta con el mismo ingrediente **preguntan una vez**.
10. El panel desaparece al contestar todo.

## 4. Alcance

### Entra

- El nombre del plato como texto normal y el icono de receta en su columna.
- Emparejado por singular y plural.
- Detección de parecidos y el panel para preguntarlos.

### NO entra (explícitamente fuera)

- **Unir "tomate" con "tomate triturado" automáticamente.** Decisión del usuario:
  solo se une el singular/plural. Ver apartado 9.
- **Renombrar el ingrediente al resolver la duda.** Solo "es el mismo" o "son
  distintos". Se apunta como idea.
- **Recordar las dudas entre recargas.** Ver casos límite.
- **Preguntar por recetas ya guardadas**, de antes de esta spec.

## 5. Comportamiento detallado

### El icono de la receta

La fila de la semana pasa a **cinco columnas**: momento, plato, ver receta,
comido, editar. La columna de la receta está **siempre reservada**, aunque esa
comida no tenga: si apareciera y desapareciera, los iconos de las filas de al
lado no coincidirían entre sí, que es lo que la rejilla vino a arreglar.

En 320 px, 4,5rem de momento más tres iconos de 44 px dejan **116 px** para el
nombre del plato. Con dos líneas, de sobra.

### Qué se une solo, y qué se pregunta

**Solo el singular y el plural**: `tomate` = `tomates`, `coliflor` =
`coliflores`, `lenteja` = `lentejas`. Es la única regla que casi nunca se
equivoca en español.

**Todo lo demás se pregunta.** Un ingrediente "se parece" a otro si **uno
contiene al otro como palabra entera**, con la misma regla del cruce de la spec
059 — la de los lookarounds. Así:

- "tomate triturado" se parece a tu "tomate" → **pregunta**.
- "leche de avena" se parece a tu "leche" → **pregunta**. Y menos mal: unirlos
  automáticamente habría sido un error.
- "salmón" **no** se parece a tu "sal", ni "pimienta" a "pimiento". La regla del
  cruce ya lo resolvía y aquí se reutiliza tal cual.

Unir por contención automáticamente se descartó a propósito: parece listo hasta
que junta la leche con la leche de avena.

### El panel de dudas

Sale **al terminar de crearse la dieta**, encima de la semana: es lo que hay que
atender antes de ponerse a mirar los menús. Por cada duda, la pregunta y dos
botones: **"Es el mismo"** y **"Son distintos"**.

- "Es el mismo" **no guarda nada**: ya lo tienes con otro nombre.
- "Son distintos" lo añade como uno más, **sin marcar**, igual que cualquier alta
  desde la spec 068.

Mientras hay dudas pendientes, esos ingredientes **no están en la despensa**.

## 6. Modelo de datos

Ninguno. Las dudas viven en memoria mientras se contestan.

## 7. Casos límite

- **Recargar sin contestar**: las dudas se pierden y esos ingredientes no entran.
  **Es a propósito**: no se guarda una lista de preguntas pendientes en Firestore
  por algo que se resuelve en dos toques, y la alternativa —meterlos por si
  acaso— es justo el duplicado que la spec viene a evitar.
- **Dos recetas con el mismo ingrediente dudoso**: se pregunta una vez. Lo
  pendiente cuenta como despensa para la receta siguiente.
- **"1 tomate" y "2 tomates" en la misma receta**: entra uno. Esto arregla el
  caso que la 068 dejó aceptado como duplicado.
- **La despensa falla al guardar**: se avisa por consola y la dieta sigue en pie.
  No puede tumbar lo que la llamó.
- **Receta cuyos ingredientes son todos conocidos**: no sale panel.

## 8. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/despensa.js` | `mismoIngrediente()`, `parecidoEnLaDespensa()`, `clasificarIngredientes()`. |
| `js/app.js` | El icono de receta, el panel de dudas y su resolución. |
| `index.html` | El panel de dudas y la columna del icono. |
| `styles.css` | La rejilla de cinco columnas y el panel. |
| `docs/specs/068-limpieza-casos.mjs` | Los casos nuevos, con el módulo de verdad. |

## 9. Decisiones tomadas

- **Solo se une singular y plural** (usuario, 30 de agosto). Lo demás se
  pregunta: unir por contención junta "leche" con "leche de avena".
- **Se pregunta al terminar la dieta** (usuario), no en la Despensa: es cuando
  acaba de pasar y se resuelve de una vez.
- **Dos opciones, sin renombrar** (usuario): "es el mismo" o "son distintos".
- **El plato deja de ser un botón** (usuario): además de verse mejor, mata de
  raíz el problema que costó tres intentos de arreglar.

## 10. Fuera de spec: ideas apuntadas

- Renombrar el ingrediente al resolver una duda.
- Repasar las recetas ya guardadas para poblar la despensa con lo que falte.

## ✅ Para probar a mano

(Lo afina el agente `qa-manual` antes de la prueba.)
