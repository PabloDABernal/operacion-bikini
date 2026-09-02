# 092 — La siembra nace enlazada y limpia

- **Estado:** 🚧 implementada y desplegada el 2 de septiembre de 2026, revisada por `revisor-specs` (bloqueada y corregida) y `revisor-codigo` (CUMPLE). **Pendiente de que el usuario borre y compruebe.**
- **Fecha:** 2026-09-02
- **Referencia en PRODUCTO.md:** apartado "Qué hará (evolutivos de la fase productiva, desde el 31 de agosto de 2026)", el evolutivo de la siembra enlazada.

## 1. Objetivo

Que las recetas y los ingredientes que trae la app **nazcan ya enlazados,
limpios y en mayúscula**, para que borrar y volver a sembrar deje la cuenta
perfecta sin tener que reparar nada después.

## 2. Por qué existe

El usuario pidió reiniciar sus recetas y su despensa de cero. Con la siembra tal
y como está, **eso le devolvería al problema del principio**:

- `sembrar()` escribe `ingredientes: receta.ingredientes`, que son **líneas de
  texto** (spec 075, anterior a que la 082 los hiciera estructurados).
- Y **no copia el campo `alias`**, así que los platos de los menús volverían a no
  encontrar su receta.

Es decir: borrar y resembrar deja la cuenta como estaba en agosto, y hay que
pulsar "Reparar" (spec 090) otra vez. Y lo mismo le pasa a **cualquier cuenta
nueva**, que ni siquiera tiene ese botón.

Lo apuntó la propia spec 090 en sus ideas: *"que la siembra escriba ya los
ingredientes estructurados, y esto no vuelva a hacer falta en cuentas nuevas"*.

## 3. Criterio de "esto funciona"

1. Se borran **Recetas y Despensa** desde Ajustes y, al recargar, vuelven
   sembradas.
2. Las recetas nacen con los ingredientes **estructurados y enlazados** a la
   despensa: se abre una receta y se leen sus piezas.
3. **Todos los ingredientes empiezan por mayúscula.**
4. **No hay ingredientes duplicados**, ni exactos ni por singular/plural.
5. **Ninguna receta apunta a un ingrediente que no exista.**
6. Las recetas nacen con sus **alias**, así que al elegir un menú los platos
   encuentran su receta sin tocar nada más.
7. **No hace falta pulsar "Reparar"** después de sembrar.
8. **No se borra nada de lo apuntado por el usuario**: pesajes, comidas,
   ejercicios y fotos siguen donde estaban.
9. Una cuenta **nueva** nace igual de bien que la reiniciada.
10. La lista de la compra, el cruce de la despensa y el Recetario funcionan
    desde el primer momento.

## 4. Alcance

### Entra

- `js/datos-iniciales.js` **regenerado**: ingredientes en mayúscula y sin
  duplicar, y recetas con los ingredientes ya estructurados.
- `generar-datos-iniciales.mjs`: hace esa transformación al generar, usando la
  extracción de la spec 090.
- `js/siembra.js`: crea primero la despensa, resuelve los enlaces y escribe las
  recetas con `alias`.
- La suite, comprobando lo de arriba contra los datos de verdad.

### NO entra (explícitamente fuera)

- **Borrar los datos del usuario.** El borrado lo hace él, desde Ajustes, con las
  casillas que ya existen. Esta spec solo se ocupa de que lo que vuelva esté
  bien.
- **Tocar lo apuntado**: pesajes, comidas, ejercicios, fotos, operaciones. La
  casilla de Recetas se lleva también las **dietas** (spec 026), y eso ya era así:
  se vuelve a elegir el menú en un toque.
- **Quitar el botón "Reparar"** de la spec 090. Sigue ahí para la cuenta que ya
  tiene datos y no quiere borrarlos.
- **Cambiar los textos de las recetas ni los menús.** Se transcribieron de los
  PDF y son los que son.
- **Subir `VERSION`** para forzar la resiembra en las cuentas que ya la tienen.
  Ver las decisiones.

## 5. Comportamiento detallado

### Los datos, ya limpios en origen

`generar-datos-iniciales.mjs` deja de copiar las líneas tal cual y hace tres
cosas:

**1. Monta la lista maestra de ingredientes.** Parte de los 133 del PDF y le
suma lo que salga de las líneas de las recetas, **sin duplicar** —comparando sin
tildes ni mayúsculas y con la regla del singular/plural de la spec 072— y
**poniendo mayúscula inicial** a todos.

Medido: queda en **138**, sin un solo duplicado. Los cinco que se añaden a los
133 son **Agua, Fruta, Café, Queso fresco y Finas hierbas**, que faltaban de
verdad en la lista original.

**2. Estructura los ingredientes de cada receta, EN UN CAMPO NUEVO.** Cada línea
pasa por `ingredienteDeReceta()` (spec 090) y se guarda en
**`ingredientesEnPiezas`**:

```json
{ "ingrediente": "Atún", "cantidad": "1 lata redonda pequeña", "preparacion": "" }
```

**Sin `ingredienteId`**: en los datos iniciales no se puede saber, porque el id
lo genera Firestore al crear la despensa de cada usuario. Va el **nombre**, y la
siembra lo resuelve.

> ### ⚠️ El campo `ingredientes` NO se toca: sigue siendo texto
>
> `revisor-specs` encontró que convertirlo **rompía la spec 090**, que está
> completada y en producción. Su reparación reconstruye las recetas sembradas
> leyendo `RECETAS[].ingredientes` **como texto crudo**; con objetos dentro,
> `String({...})` da `"[object Object]"` y el botón "Reparar mis recetas" se
> estropea en silencio. Y su suite, que filtra por `typeof l === "string"`, se
> quedaría sin líneas que medir y fallaría en rojo.
>
> Así que **se añade al lado, no se sustituye**: `ingredientes` sigue siendo el
> texto original —que es la única copia que queda de él— y `ingredientesEnPiezas`
> es lo que usa la siembra. Cero cambios en la 090, cero decisiones nuevas.

**3. Deja el `alias` de cada receta**, que ya venía de la spec 089.

### La siembra

Cambia el **orden** y lo que escribe:

1. **Primero la despensa.** Se crean los ingredientes que falten, con el **id
   generado por adelantado** —`doc(collection(...)).id`, el mismo truco que usa
   `nuevoIdDeIngrediente()` en la spec 090—, para poder enlazar las recetas antes
   de que el lote se escriba.

   Se lleva una lista de nombre e id con **todos**: los recién creados y **los
   que el usuario ya tenía**. Y se busca en ella con **`mismoIngrediente()`**, no
   por igualdad de texto: así los "Tomates" del usuario absorben el "Tomate" de
   la receta, que es la regla de la spec 072. Un `Map` por clave literal no
   valdría.
2. **Después las recetas**, leyendo `ingredientesEnPiezas` y convirtiendo cada
   línea a la forma de la spec 082:
   `{ ingredienteId, ingredienteNombre, cantidad, preparacion }`, resolviendo el
   `ingredienteId` con ese mapa.
3. Y con su **`alias`**, que hasta ahora se quedaba por el camino.

**El nombre del ingrediente que se guarda en la línea es el de la despensa del
usuario**, no el de los datos iniciales: si él ya tenía "Tomates" y la receta
dice "Tomate", manda el suyo. Es el mismo criterio de `loQueFalta()` (spec 073).

**Si un nombre no aparece en el mapa** —no debería pasar, porque la lista maestra
se construye de las propias recetas—, la línea se guarda **sin enlazar**, con su
nombre y sin `ingredienteId`. Se prefiere una receta con una línea coja a una
receta que apunta a un documento que no existe.

### Lo que no cambia

`hayQueSembrar()`, `recetasQueFaltan()` e `ingredientesQueFaltan()` siguen igual,
y la marca `datosInicialesVersion` también: la siembra sigue metiendo **solo lo
que falte** y sin pisar nada del usuario.

## 6. Modelo de datos

`usuarios/{uid}/recetas`: el campo `ingredientes` pasa a nacer **estructurado**
(spec 082) en vez de como lista de textos, y se escribe **`alias`**. Las dos
formas ya conviven desde la 082, así que nada más cambia.

`js/datos-iniciales.js` —módulo generado, no datos de usuario—: `INGREDIENTES` en
mayúscula y sin duplicar, y **un campo nuevo** `RECETAS[].ingredientesEnPiezas`.
**`RECETAS[].ingredientes` se queda como está**, con el texto original, porque es
de donde lo lee la reparación de la spec 090.

`firestore.rules`: **sin cambios**. `js/reinicio.js`: **sin cambios**.

## 7. Casos límite

- **Cuenta con la despensa a medias**: se enlaza contra los ingredientes que ya
  tenga y solo se crean los que falten.
- **El usuario tenía un ingrediente con otro nombre** ("Tomates" contra
  "Tomate"): se enlaza al suyo, por `mismoIngrediente()`. No se duplica.
- **Se corta la siembra a mitad**: la marca se guarda al final, así que el
  siguiente arranque lo reintenta y no duplica, porque vuelve a comparar contra
  lo que hay. Es como funciona desde la 075.
- **El usuario borra solo la despensa y no las recetas**: sus recetas se quedan
  apuntando a ingredientes que ya no existen. Ya pasaba antes de esta spec, y el
  cruce lo trata como "te falta" sin romperse (specs 059 y 073).
- **Una receta sin ingredientes**: se siembra igual, con la lista vacía.
- **Cuenta ya sembrada**: no pasa nada, porque `VERSION` no sube. Ver abajo.
- **La reparación de la spec 090 sigue funcionando**: lee `ingredientes`, que no
  cambia. La suite de la 092 lo comprueba, para que no se rompa sin que nadie se
  entere.

## 8. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| **Se estructura al GENERAR, no al sembrar** | El trabajo se hace una vez, aquí, y se revisa mirando el fichero. Hacerlo en el navegador de cada usuario sería repetir 373 veces lo mismo y no poder mirarlo. |
| **En los datos iniciales va el nombre, no el id** | El id lo pone Firestore al crear la despensa de cada uno. |
| **Mayúscula inicial siempre** | Petición del usuario el 2 de septiembre: una despensa con mayúsculas y minúsculas mezcladas se lee peor. |
| **`VERSION` NO sube** | Subirla dispararía la resiembra en todas las cuentas, y esto no es una siembra nueva: es la misma con mejor forma. Quien quiera los datos limpios los borra y vuelven. Es lo que va a hacer el usuario. |
| **El nombre del usuario manda sobre el de la app** | Mismo criterio que la lista de la compra. Lo que él escribió es lo que reconoce. |
| **Sin enlazar antes que enlazado al vacío** | Una línea coja se lee y se arregla; un enlace a un documento que no existe es un fallo silencioso. |

## 9. Archivos afectados

| Archivo | Qué |
|---|---|
| `docs/menus/generar-datos-iniciales.mjs` | Monta la lista maestra y estructura las líneas con la extracción de la 090. |
| `js/datos-iniciales.js` | **Regenerado**: 138 ingredientes en mayúscula, recetas estructuradas. |
| `js/siembra.js` | Despensa primero con ids por adelantado, resolución con `mismoIngrediente()`, recetas enlazadas y con `alias`. |
| `js/normalizacion.js` | **Nada.** Sigue leyendo `ingredientes`, que no cambia. Se comprueba en la suite. |
| `docs/specs/092-siembra-casos.mjs` | **Nuevo.** Comprueba contra los datos de verdad que no hay duplicados, que todo va en mayúscula y que ninguna línea apunta a un ingrediente que no está. |
| `docs/specs/075-siembra-casos.mjs` | Se actualiza si mira la forma vieja de los ingredientes. |

Estimación: **entre 180 y 240 líneas**. `revisor-specs` avisó de que 150-200 se
quedaba corta contando lo de no romper la 090; con el campo nuevo al lado ese
trabajo desaparece, pero la resolución difusa de nombres en la siembra sí suma.

## 10. Fuera de spec: ideas apuntadas

- Que el diario (Comidas → Apuntar) se enlace con recetas, que es lo que el
  usuario quiere para tener estadísticas de lo que come.
- Repasar a mano los 27 ingredientes de la lista que no usa ninguna receta.

## ✅ Para probar a mano

1. **Ajustes → Zona de peligro**: marca **Recetas** y **Despensa**, y borra.
2. Recarga. Vuelven las 73 recetas y los 138 ingredientes.
3. **Abre tres o cuatro recetas**: sus ingredientes tienen que salir en piezas,
   legibles y en mayúscula.
4. **Mira la despensa entera**: 138, todos en mayúscula, **ninguno repetido**.
5. **Marca un ingrediente** y comprueba que el "Tienes N de M" de una receta que
   lo lleve sube.
6. **Elige un menú**: los platos tienen que enlazar con sus recetas, y los de dos
   platos enseñar las dos.
7. **Comprueba que sigue todo lo tuyo**: pesajes, comidas apuntadas, ejercicios y
   fotos. Nada de eso se toca.
