# 093 — Apuntar una comida eligiendo una receta

- **Estado:** 📝 escrita el 2 de septiembre de 2026, revisada por `revisor-specs` (tres bloqueantes, cerrados recortando el alcance). **Pendiente de implementar.**
- **Fecha:** 2026-09-02
- **Referencia en PRODUCTO.md:** apartado "Qué hará (evolutivos de la fase productiva…)", el evolutivo de saber lo que comes, primer punto.

## 1. Objetivo

Que al apuntar una comida se pueda **elegir una receta del recetario**, y que la
comida quede enlazada a ella de verdad.

## 2. Por qué existe

Es el primer paso del objetivo del usuario: **saber lo que come**.

Hoy el diario es texto libre. Desde la spec 084 se puede elegir **un ingrediente
suelto** de la despensa, pero no una receta — y las recetas son justo lo que
tiene enlazado con sus ingredientes desde la 082 y la 092. Así que la app tiene
delante toda la información de qué lleva cada plato y **no puede usarla**,
porque lo que apuntas no dice qué plato era.

Sin esto, las estadísticas de la spec 095 no tienen de dónde salir.

## 3. Criterio de "esto funciona"

1. En **Comidas → Apuntar**, el interruptor de la spec 084 pasa a tener **tres
   opciones**: `Escribir`, `Una receta mía` y `Elegir de mi despensa`.
2. En "Una receta mía" hay un desplegable con **todas tus recetas**.
3. Eliges una y guardas: la comida se apunta **con el nombre de la receta como
   texto**, y **enlazada** a ella.
4. La fila del diario **nombra las recetas** en su línea de detalle.
5. Puedes apuntar **varias recetas en la misma comida** (primer plato y segundo),
   igual que en Mi dieta desde la spec 088.
6. Al **editar** una comida, sus recetas **se conservan** aunque el editor no las
   enseñe.
7. Una comida **escrita a mano** se guarda exactamente como antes, sin campos de
   más.
8. Una comida **con ingrediente suelto** (spec 084) sigue funcionando igual.
9. Una receta **borrada del recetario** que siga enlazada no rompe el diario.
10. "Lo de siempre" (spec 013), los acompañamientos (063) y el análisis (030)
    siguen funcionando.

## 4. Alcance

### Entra

- La tercera opción del interruptor, con su desplegable y sus chips.
- El campo `recetaIds` en la comida apuntada.
- Los nombres de las recetas en la línea de detalle de la fila del diario.
- Suite de casos.

### NO entra (explícitamente fuera)

- **Cantidades ni raciones.** Una comida enlazada a una receta dice *qué*
  comiste, no *cuánto*. Ponerle raciones abre la puerta a calcular calorías, que
  es otra cosa y no está decidida.
- **Descontar de la despensa.** Comerte algo no te lo quita de casa: la despensa
  la mantienes tú (spec 058).
- **Que la IA vea las recetas enlazadas** al analizar el día (spec 030). El
  análisis sigue leyendo el texto. Cambiarlo es una decisión aparte.
- **Abrir la receta desde el diario.** `revisor-specs` avisó de que el diario no
  se pinta como Mi dieta: lo hace `crearLista()`, la fábrica que comparten Peso,
  Comidas, Bebidas y Ejercicio, con filas planas sin columna de iconos ni fila
  desplegable. Meter ahí un icono que abre la receta obliga a generalizar código
  de **cuatro listas**, y eso no es esta spec. La fila **nombra** las recetas; la
  receta se ve en el Recetario.
- **Cambiar las recetas al editar una comida.** Por lo mismo, y porque abre un
  caso que hoy no existe: una comida hecha con "Elegir de mi despensa" tiene
  `ingredienteId`, y dejar añadirle recetas al editar la dejaría con las dos
  cosas a la vez, que es justo lo que la 084 evitó. Al editar, `recetaIds` **se
  conserva** y no se toca. Si te equivocaste de receta, se borra la comida y se
  apunta otra vez.
- **Pasar el plan al diario.** Eso es la spec 094.
- **Estadísticas.** Eso es la 095.
- **Tocar Mi dieta.** Esto es el diario.

## 5. Comportamiento detallado

### El interruptor, con tres

El de la spec 084 tiene dos botones. Pasa a tres, con las mismas clases
(`panel-recetario-boton`), que ya se usan en tres sitios:

```
Qué has comido
[ Escribir ] [ Una receta mía ] [ Elegir de mi despensa ]
```

En móvil los tres caben en una fila; si no, envuelven.

### Elegir recetas

Igual que el editor de Mi dieta desde la spec 088, **y a propósito**: es el mismo
gesto y no se inventa otro.

- Un desplegable con tus recetas, ordenadas por nombre.
- Elegir una la **suma**: aparece su chip y su nombre se engancha al texto.
- Una receta **ya elegida no se ofrece**.
- La **×** de un chip la suelta, **sin tocar el texto**.

El texto sigue siendo el que se guarda como `texto` de la comida, así que el
diario se lee igual que siempre.

### Cómo se guarda

`validarComida()` y `guardarComida()` ganan un parámetro `recetaIds`, con la
misma forma que en Mi dieta (spec 088): una lista de ids.

**Solo se escribe si hay algo**, igual que hace `ingredienteId` desde la 084 y
`acompanamientos` desde la 063: una comida escrita a mano se guarda **byte a byte
como antes**.

### En el diario

La fila de una comida enlazada **nombra sus recetas** en la línea de detalle que
ya existe, junto al momento y la hora:

```
Tortilla de atún
Cena · 21:30 · Tortilla de atún
```

Sin icono y sin abrir nada: el diario lo pinta `crearLista()`, que hace filas
planas para cuatro pantallas, y la fila solo sabe de `{ que, detalles }`. Se usa
lo que hay.

Una receta borrada del recetario **no se nombra**, como en todas partes.

### Al editar

**Las recetas no se tocan.** El editor del diario sigue exactamente como está, y
`actualizarComida()` no escribe `recetaIds`, así que lo que hubiera se queda.

Es a propósito: dejar añadir recetas ahí abriría el caso de una comida con
`ingredienteId` **y** `recetaIds` a la vez, que la 084 evitó por diseño.

## 6. Modelo de datos

`usuarios/{uid}/comidas/{id}`:

| Campo | Tipo | Qué |
|---|---|---|
| `recetaIds` | lista de textos, **opcional** | Las recetas de esta comida. Si no está, la comida no lleva ninguna, que es lo normal en todo lo apuntado hasta hoy. |

Se llama **igual que en la dieta** (spec 088) a propósito: es lo mismo, y así
`idsDeRecetaDe()` sirve para las dos sin tocarla.

`firestore.rules`: **sin cambios**. `js/reinicio.js`: **sin cambios** — se borra
con las comidas.

## 7. Casos límite

- **Comida de antes de esta spec**: no tiene el campo, se ve igual que siempre.
- **Elegir una receta y borrar el texto a mano**: se guarda con el texto vacío…
  no: `validarComida()` exige texto, así que da el error de siempre. Correcto.
- **Elegir dos recetas**: las dos se enlazan y el texto lleva las dos, unidas por
  `". "`, como en la 088.
- **Soltar todas las recetas**: la comida se queda como texto suelto.
- **Receta borrada del recetario**: la fila no enseña icono si no queda ninguna
  viva; si queda alguna, enseña las que haya.
- **Ingrediente suelto y receta a la vez**: no puede pasar. Al apuntar, el
  interruptor es de uno en uno y solo se guarda lo del panel activo; y al editar
  no se tocan ni uno ni otro.
- **Editar una comida con recetas**: se le puede cambiar el texto, el momento, la
  fecha, la hora y los acompañamientos. Sus recetas siguen enlazadas.
- **"Lo de siempre"** (spec 013): rellena el texto como hasta ahora y **no**
  enlaza recetas. Los chips salen de lo que repites, y repetir un texto no dice
  qué receta era.
- **Sin recetas en el recetario**: el botón "Una receta mía" sale **desactivado**,
  como el de la despensa vacía en la 084.

## 8. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| **Mismo gesto que Mi dieta** (desplegable + chips) | Es el mismo problema y ya está resuelto y probado en la 088. Inventar otro sería dos formas de hacer lo mismo. |
| **`recetaIds`, igual que en la dieta** | Mismo nombre, misma forma, y `idsDeRecetaDe()` sirve para las dos. |
| **Solo se escribe si hay algo** | Lo apuntado hasta hoy se guarda exactamente igual. Mismo criterio que la 063 y la 084. |
| **Sin cantidades** | Dice qué comiste, no cuánto. Las raciones abren la puerta a las calorías, que es otra decisión. |
| **No descuenta de la despensa** | Comértelo no te lo quita de casa. La despensa la mantienes tú. |
| **"Lo de siempre" no enlaza** | Sale de textos repetidos, y un texto no dice qué receta era. |

## 9. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/comidas.js` | `validarComida()` y `guardarComida()` con `recetaIds`, **al final de la firma y con valor por defecto**, para que los llamadores de siempre no se enteren. `actualizarComida()` **no se toca**. |
| `index.html` | El tercer botón del interruptor y su panel. |
| `js/app.js` | El panel, el desplegable con chips, el guardado y los nombres en la línea de detalle del diario. |
| `styles.css` | Solo si el interruptor de tres necesita algo. |
| `docs/specs/093-comida-receta-casos.mjs` | **Nuevo.** Casos de la validación y el guardado. |

Estimación: **entre 130 y 170 líneas**. La primera cuenta decía 200-260 e incluía
abrir la receta desde el diario y editarla, que `revisor-specs` destapó como
mucho más caras de lo que parecían —obligan a generalizar `crearLista()`— y que
han salido del alcance.

## 10. Fuera de spec: ideas apuntadas

- **Abrir la receta desde el diario**, generalizando `crearLista()` para que sus
  cuatro listas admitan una fila desplegable. Es lo que se ha sacado de aquí.
- **Cambiar las recetas al editar una comida**, decidiendo antes qué pasa con el
  ingrediente suelto.
- Que el análisis de la IA (spec 030) use las recetas enlazadas en vez del texto.
- Raciones, y con ellas las calorías de verdad.
- Que "lo de siempre" recuerde también la receta.

## ✅ Para probar a mano

Los diez puntos del apartado 3. Los que importan: el **7** y el **8**, que son la
regresión sobre todo lo que ya tienes apuntado, y el **5**, que es lo que hace
falta para el plan de un día entero (spec 094).
