# 078 — El material que te falta

- **Estado:** ✅ completada, dada por buena por el usuario el 2 de septiembre de 2026.
- **Fecha:** 2026-09-01
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v13: el material, decidida el 30 de agosto de 2026)", tercer punto.

## 1. Objetivo

Que veas **de un vistazo qué material te pide tu tabla y no tienes**, en una
lista, y que puedas decir "ya lo tengo" desde ahí mismo.

## 2. Por qué existe

Es la lista de la compra (spec 073), pero de gimnasio. Con la **074** apuntas lo
que tienes y con la **077** ves ejercicio a ejercicio qué te falta; lo que no
hay es la pregunta que de verdad se hace uno: **"¿qué me tengo que comprar para
poder hacer esta tabla?"**. Hoy hay que abrir los siete días, mirar cada
ejercicio y llevar la cuenta a mano.

Cierra la v13: con esto el armario ya sirve en los tres momentos — apuntar,
pedir tabla y comprar.

## 3. Criterio de "esto funciona"

1. En **Ejercicio → Material**, debajo de tu armario, hay un bloque **"Lo que te
   falta"**.
2. Con una tabla que pide mancuernas, banco y barra, y tú solo tienes
   mancuernas marcadas: la lista dice **banco** y **barra**, y no dice
   mancuernas.
3. **Tocas "banco"**: pasa a tu armario **marcado**, desaparece de la lista y el
   recuento de arriba sube.
4. Si **"banco" ya estaba en tu armario pero desmarcado**, tocarlo lo **marca**;
   no se crea una pieza duplicada.
5. **Sin tabla activa**: el bloque lo dice ("Cuando tengas una tabla…"), sin
   lista y sin error.
6. **Con tabla, pero no te falta nada**: lo dice ("Tienes todo lo que pide tu
   tabla"), sin lista.
7. Una pieza que piden **dos ejercicios distintos** sale **una sola vez**.
8. `"mancuerna"` y `"mancuernas"` cuentan como la misma pieza, y una no aparece
   si tienes la otra.
9. Los ejercicios de la tabla que **no están enlazados al catálogo**
   (`ejercicioId` vacío) no aportan material, y no rompen nada.
10. Tu armario, tal y como lo dejaste, se sigue viendo y editando igual.

## 4. Alcance

### Entra

- El bloque "Lo que te falta" en Ejercicio → Material, debajo del armario.
- El cálculo: material de los ejercicios de la tabla activa, menos lo que tienes
  marcado.
- Tocar una pieza para pasarla a tu armario, marcada.
- Suite de casos del cálculo.

### NO entra (explícitamente fuera)

- **Comprarlo, o enlazar a ninguna tienda.** Es una lista, no un carrito.
- **Cantidades ni precios.** Lo decidió la 074.
- **Apuntes a mano**, como sí tiene la lista de la compra (`js/compra.js`). Aquí
  todo sale de la tabla; lo que quieras apuntar por tu cuenta se apunta en tu
  armario, que es un campo de texto que ya existe.
- **Guardar la lista en Firestore.** Se calcula al vuelo, como `loQueFalta()` de
  la spec 073, y por el mismo motivo: guardarla obligaría a mantenerla al día
  cada vez que cambia la tabla, el catálogo o el armario.
- **Mirar tablas viejas.** Solo la activa. Comprar material para una tabla que
  ya no haces no tiene sentido.
- **Descartar una pieza** ("esto no lo pienso comprar"). Se apuntó como idea; si
  molesta al usarlo, es una spec de dos líneas.
- **Tocar la lista de la compra de comida.** Son dos listas distintas, en dos
  secciones distintas.

## 5. Comportamiento detallado

### De dónde sale la lista

1. La **tabla activa** (`leerTablaActiva()`, spec 029). Si no hay, no hay lista.
2. Cada `dia.sesion.ejercicios[]` trae un **`ejercicioId`** cuando la línea se
   pudo enlazar con el catálogo (specs 029 y 064). Se recogen los ids.
3. De cada ejercicio del catálogo, sus piezas con **`piezasDeMaterial()`**, la
   función que estrena la spec 077.
4. Se quitan las que **tienes marcadas** en el armario, comparando con
   `mismoIngrediente` (así "mancuerna" encuentra tus "mancuernas").
5. Se quitan los **duplicados entre sí**, con la misma comparación.

El resultado es una lista de `{ nombre, materialId }`:

- `materialId` con valor: la pieza **está en tu armario, desmarcada**. Tocarla
  la **marca**.
- `materialId` a `null`: la pieza **no está**. Tocarla la **crea**, y nace
  marcada (que es lo que hace `guardarMaterial()` desde la 074).

El nombre que se enseña es **el de tu armario si la pieza está**, y el del
ejercicio si no. Mismo criterio que `loQueFalta()`: *"el nombre de TU despensa
manda sobre el de la receta"*.

### Cómo se ve

Debajo del armario, dentro de la misma sub-pestaña:

```
Lo que te falta
Lo que pide tu tabla y no tienes marcado. Tócalo cuando lo consigas.

  Banco                        [ Lo tengo ]
  Barra                        [ Lo tengo ]
```

Los tres estados vacíos, cada uno con su frase:

| Situación | Qué dice |
|---|---|
| Sin tabla activa | "Cuando tengas una tabla, aquí sale el material que te pide y no tienes." |
| Con tabla, no falta nada | "Tienes todo lo que pide tu tabla." |
| Con tabla, pero ningún ejercicio enlazado al catálogo | Lo mismo que "no falta nada": desde fuera es indistinguible, y explicar el enlace del catálogo aquí sería contar las tripas. |

### Al tocar una pieza

- **Con `materialId`**: `marcarMaterial(uid, id, true)`.
- **Sin `materialId`**: `guardarMaterial(uid, nombre)` — nace marcada.

Después se refresca el armario y se repintan las dos cosas: la lista de arriba
(con su recuento "N de M cosas en el armario") y este bloque, del que la pieza
desaparece.

**Si al crearla choca con una que ya estaba** (con `materialIgual()`, por una
carrera o por un armario cargado hace rato), se **marca la que hay** en vez de
crear otra. Es la misma defensa que ya tiene el alta a mano del armario.

### Cuándo se calcula

**Sin ninguna lectura nueva a Firestore.** `tablaActiva`, `catalogoCargado` y
`materialCargado` ya son variables globales que carga `refrescarTodo()` al
entrar en la app. El cálculo es **síncrono** sobre ellas.

Es exactamente lo que hace `pintarCompra()` con la lista de la compra, y se
copia a propósito. Lo señaló `revisor-specs` el 1 de septiembre: la primera
versión de esta spec decía que la tabla "se lee entonces" y describía un fallo
de lectura propio, y eso **habría duplicado** lo que ya hacen `refrescarTabla()`
y `refrescarCatalogo()`, cada uno con su propio estado de carga. Un fallo al
cargar la tabla ya se cuenta donde se carga; aquí el bloque simplemente sale
como "sin tabla activa", que es lo que pasa cuando no hay tabla en memoria.

**Los cinco sitios que lo repintan** —hay que tocarlos todos, y son de escritura
al armario salvo el primero:

| Cuándo | Dónde |
|---|---|
| Al entrar en la sub-pestaña Material | `abrirSubpestana()` |
| Al añadir una pieza | submit de `form-material` |
| Al renombrar una pieza | `renombrarLaPieza()` |
| Al borrar una pieza | `borrarLaPieza()` |
| **Al marcar o desmarcar una casilla del armario** | `marcarEnElArmario()` |

El último es el delicado y es el segundo hallazgo del revisor.
`marcarEnElArmario()` **no repinta el armario a propósito**, para no reordenar
la fila bajo el dedo (spec 074). Así que aquí **no se puede llamar a
`pintarMaterial()`**: se repinta **solo este bloque**, que es lo que sí ha
cambiado. Sin eso, marcar "banco" en tu armario dejaría "banco" en la lista de
lo que te falta hasta cambiar de sub-pestaña y volver.

## 6. Modelo de datos

**Ninguna colección nueva y ningún campo nuevo.** Se leen tres cosas que ya
existen: `usuarios/{uid}/tablas` (la activa), `usuarios/{uid}/ejerciciosCatalogo`
y `usuarios/{uid}/material`. Se escribe en `material`, con las funciones que ya
tiene la 074.

`firestore.rules`: **sin cambios**. `js/reinicio.js`: **sin cambios**.

## 7. Casos límite

- **Sin tabla activa**: frase, sin lista. No es un error.
- **Tabla con los siete días de descanso**: no hay ejercicios, no falta nada.
- **Ejercicio enlazado a un ejercicio del catálogo ya borrado**: el id no
  encuentra nada y se salta, sin romper.
- **Ejercicio del catálogo con `material` vacío o `"ninguno"`**: no aporta
  piezas (lo resuelve `piezasDeMaterial()`).
- **La misma pieza en dos ejercicios**: una sola línea.
- **Pieza en el armario, desmarcada**: sale en la lista y se enseña **con el
  nombre de tu armario**.
- **Pieza en el armario, marcada**: no sale.
- **Singular y plural**: `"mancuerna"` no sale si tienes `"mancuernas"`
  marcadas, por `mismoIngrediente` (spec 072).
- **Tocar dos piezas seguidas rápido**: se desactiva **solo el botón tocado**,
  no la lista entera. Son N botones independientes y cada uno escribe lo suyo;
  bloquear los demás por si acaso sería castigar al que va con prisa.
- **Tabla anterior al enlace con el catálogo** (spec 064), con todos los
  `ejercicioId` vacíos: no aporta material, así que la lista sale vacía y se
  lee "Tienes todo lo que pide tu tabla". Es indistinguible de no faltarte
  nada, y se acepta: explicar aquí lo del enlace del catálogo sería contar las
  tripas. Se anota para que al probarlo no se confunda con un fallo.
- **Sin conexión al tocar**: sale el error de siempre y la pieza **se queda en
  la lista**. No se pinta como conseguida algo que no se ha guardado.
- **Armario vacío**: sale toda la lista de la tabla. Correcto.
- **Una tabla que pide 30 piezas distintas**: se pintan todas. La tabla tiene
  siete días y el campo `material` 200 caracteres; no da para una lista
  inmanejable.

## 8. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| **En Ejercicio → Material, debajo del armario** | Decisión del usuario el 1 de septiembre. Lo que tienes y lo que te falta, en la misma pantalla, como la despensa y la compra. |
| **Se marca desde la propia lista** | Decisión del usuario. Ir al armario a buscar la pieza que acabas de ver es un paso que no aporta nada. |
| **Se calcula al vuelo, no se guarda** | Copiado de la spec 073 y por el mismo motivo: una copia guardada se desincroniza con la tabla, el catálogo y el armario. |
| **Solo la tabla activa** | Comprar para una tabla que ya no haces no tiene sentido. |
| **Nace marcada al crearla** | Tocas "Lo tengo": ya lo has dicho. Pedir un segundo gesto para marcarlo sería la misma incoherencia que evita la 074. |
| **El nombre de tu armario manda** | Igual que `loQueFalta()` con la despensa. Lo que tú escribiste es lo que reconoces. |
| **Sin apuntes a mano** | La lista de la compra los tiene porque el papel higiénico no sale de ninguna receta. Aquí, lo que quieras apuntar por tu cuenta va en el armario. |
| **Un fallo al leer la tabla no tumba el armario** | El armario es lo principal de la pantalla; esto cuelga de él. |

## 9. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/material.js` | `materialQueFalta(tabla, catalogo, armario)`: el cálculo, puro y sin DOM. |
| `index.html` | El bloque "Lo que te falta" en la sub-pestaña Material. |
| `js/app.js` | Pintar el bloque sobre los globales ya cargados y el "Lo tengo". Engancharlo en los **cinco** sitios de la tabla de arriba, con cuidado especial en `marcarEnElArmario()`, que solo repinta este bloque. |
| `styles.css` | Se reutiliza lo de la lista de la compra; solo si hace falta. |
| `docs/specs/078-material-falta-casos.mjs` | **Nuevo.** Casos del cálculo. |

Depende de la **spec 077**, que estrena `piezasDeMaterial()`. Se hace después.

Estimación: **unas 200 líneas**. Por debajo de las 300.

## 10. Fuera de spec: ideas apuntadas

- Descartar una pieza de la lista ("esto no lo voy a comprar").
- Enseñar qué ejercicios se te quedan fuera por no tener una pieza.
- Que la lista de la compra y esta se vean juntas en algún sitio.

## ✅ Para probar a mano

Guion completo: lo afina `qa-manual`. En corto, los diez puntos del apartado 3,
con especial atención al **4** (una pieza que ya estaba desmarcada se marca, no
se duplica), al **8** (singular y plural) y al **10**, que es la regresión sobre
el armario de la 074.
