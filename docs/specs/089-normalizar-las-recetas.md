# 089 — Normalizar las recetas: ingredientes y alias

- **Estado:** ✅ completada, dada por buena por el usuario el 2 de septiembre de 2026.
- **Fecha:** 2026-09-02
- **Referencia en PRODUCTO.md:** apartado "Qué hará (evolutivos de la fase productiva, desde el 31 de agosto de 2026)", el evolutivo de las recetas normalizadas.

## 1. Objetivo

Dos cosas que arrastran las 73 recetas que trae la app:

1. Que sus ingredientes dejen de ser **una línea de texto** y pasen a estar
   **estructurados y enlazados a la despensa**, como los que escribes tú desde
   la spec 082.
2. Que una receta pueda tener **otros nombres por los que se la reconoce**, para
   que los platos de los menús encuentren la suya.

## 2. Por qué existe

Salió de mirar por qué la cena del usuario no enseñaba su tortilla, y debajo
había dos cosas distintas.

**Los ingredientes.** Las 73 recetas se transcribieron de los PDF en la spec
075, *antes* de que la 082 hiciera estructurados los ingredientes. Así que
llegaron como texto: `"1 lata redonda pequeña de atún, enlatado al natural,
escurrido (50 g)"`. El cruce con la despensa tiene que adivinar qué parte de esa
frase es el ingrediente, con la heurística de la 068, y se equivoca. Las recetas
que escribes tú, no: llevan el enlace hecho.

**Los nombres.** Una receta se llama `"Tortilla de atún"` y el plato del menú es
`"Tortilla de 2 huevos con 1 lata de atún al natural"`. El enlazado busca el
nombre **literalmente dentro** del texto, así que ahí no engancha. Medido: de
**70 textos de plato distintos, 48 enlazan y 22 no**.

La 088 arregló "solo se coge la primera receta". Esto arregla "el nombre no
aparece igual", que es la otra mitad.

## 3. Criterio de "esto funciona"

1. En **Ajustes → Zona de peligro** hay un bloque **"Normalizar mis recetas"**,
   **visible solo para `pantonbernal@gmail.com`**.
2. Se pulsa, se confirma, y al terminar **dice qué ha hecho**: cuántas recetas
   ha tocado, cuántas líneas ha enlazado y cuántos ingredientes ha creado.
3. Después, una receta sembrada enseña sus ingredientes **como piezas**, y su
   cruce con la despensa es exacto: marcas un ingrediente y el "Tienes N de M"
   sube.
4. Los ingredientes que no estaban en la despensa **se han creado, sin marcar**.
5. **Las recetas que escribiste tú no se tocan**: si ya estaban estructuradas,
   se dejan como están.
6. Se pulsa **dos veces** y la segunda no cambia nada ni duplica nada.
7. Al **elegir un menú**, los platos que antes no encontraban su receta ahora la
   encuentran, por el alias.
8. Un plato con dos cosas sigue enlazando **las dos** (spec 088), y los alias no
   rompen la regla de no solapar.
9. **Ningún plato enlaza con una receta equivocada.** Los alias están revisados
   a mano; ninguno se inventa al vuelo.
10. Todo lo demás del Recetario, la despensa y la lista de la compra sigue igual.

## 4. Alcance

### Entra

- `docs/menus/alias-recetas.json`: **nuevo**, los alias revisados a mano.
- El script que **propone** ese fichero para revisarlo.
- Los alias, dentro de `js/datos-iniciales.js` al regenerarlo.
- `semanaDesdeMenu()` mira nombre **y** alias.
- La normalización de las recetas del usuario: línea de texto → línea
  estructurada, creando en la despensa lo que falte.
- El bloque en Ajustes, con su confirmación y su resumen.

### NO entra (explícitamente fuera)

- **Renombrar recetas.** El nombre corto se queda; los alias van aparte.
  Decisión del usuario el 2 de septiembre: renombrar al texto del menú llenaría
  el Recetario de nombres con cantidades dentro, y solo enlazaría en uno de los
  cuatro menús.
- **Enlazar por palabras sueltas, sin revisar.** Se probó al escribir la spec y
  proponía falsos: *"Ensalada de pasta de lentejas y queso de cabra"* enganchaba
  con *"Ensalada de alubias con atún"*. Es literalmente lo que avisó la 076.
- **Que la IA parta las líneas.** Son ~400 líneas: varias llamadas, cupo, espera
  y revisión. La heurística de la 068 ya existe y está escrita para equivocarse
  del lado seguro.
- **Tocar las cuentas de los demás.** Solo `pantonbernal@gmail.com`, y solo desde
  su navegador. Abrirlo a todos es quitar esa condición, y es una decisión
  aparte que se toma **después de que esto se pruebe**.
- **Deshacer.** No hay botón de volver atrás. Ver el apartado 7.
- **Volver a sembrar** ni tocar `VERSION`. Esto normaliza lo que ya hay.
- **Cambiar la heurística de la 068** ni el cruce de la 059.
- **Editar los alias desde la app.** Son datos del repositorio.

## 5. Comportamiento detallado

### Los alias

Fichero nuevo, `docs/menus/alias-recetas.json`: para cada receta, los **trozos
de plato** por los que también se la reconoce.

```json
{
  "Tortilla de atún": [
    "Tortilla de 2 huevos con 1 lata de atún al natural",
    "Tortilla de 2 huevos y una lata de atún al natural"
  ],
  "Tortilla de pimiento rojo, berenjena y jamón serrano": [
    "Tortilla de 2 huevos con pimiento rojo, berenjena y jamón serrano"
  ]
}
```

**Trozos de plato, no textos enteros.** Un texto puede llevar dos platos, y el
alias tiene que ser solo el suyo: si el alias fuera la frase entera, se comería
también las palabras de la ensalada y la regla de no solapar de la 088 dejaría
la ensalada fuera. Los trozos se separan por `". "`, como ya hace el enlazado.

**Los trozos se separan por `". "`, por `" // "` y por `", o "`.** Los dos
primeros separan platos de una misma comida. El tercero separa **alternativas**:
*"...queso de cabra + lata de atún, **o** ensalada de alubias con atún"* son dos
platos entre los que eliges, y **los dos tienen receta**. Cada uno necesita su
propio trozo: con el texto entero como alias de los dos, el primero ocuparía el
tramo y la regla de no solapar de la 088 dejaría al otro fuera. Un `" o "` suelto
NO parte, que rompería "pollo o pavo" y "asado o a la plancha".

> Decisión del usuario el 2 de septiembre, al repasar los alias: ese plato enlaza
> **las dos recetas**, y al cocinar se elige. Efecto asumido: la lista de la
> compra pedirá lo de las dos, porque no sabe cuál vas a hacer.

**El script que los propone**: `docs/menus/proponer-alias.mjs`, que se ejecuta a
mano y escribe el JSON con las propuestas y **una marca en las dudosas**. No se
usa en la app y no se ejecuta solo. Propone comprobando que **todas** las
palabras del nombre de la receta estén en el trozo, ignorando las vacías (`de`,
`la`, `con`, `gramos`…) y los números. Sobre los datos de hoy: de los 22 trozos
sin enlazar propone 24 y deja 34 sin propuesta, y **no queda ninguna ambigua**: al partir por `", o "` cada alternativa casa con una sola receta.

**El fichero se revisa a mano y esa revisión es la que vale.** Un alias
equivocado es una mentira en pantalla (076), y el script se equivoca: hay que
mirar las 22 líneas una vez. Los alias sin revisar **no entran**.

Al regenerar `js/datos-iniciales.js` con `generar-datos-iniciales.mjs`, cada
receta lleva su campo `alias` (lista, vacía si no tiene).

### El enlazado, con alias

`semanaDesdeMenu()` no cambia de forma: sigue probando **de lo más largo a lo
más corto** y descartando lo de **menos de 8 letras**, y sigue sin solapar
tramos (spec 088). Lo único que cambia es **qué se prueba**: para cada receta,
su nombre **y cada uno de sus alias**, cada uno como candidato con su propia
longitud.

Un alias es más largo que el nombre, así que gana antes en el orden. Es lo que
se quiere: un alias es una coincidencia exacta con el texto del menú, y el
nombre corto es lo genérico.

**Una receta entra como mucho una vez.** Con los alias, la misma receta tiene
varios candidatos —su nombre y cada alias—, y podrían encajar dos en tramos
distintos de la misma frase; la comida acabaría con la misma receta dos veces y
el día pintaría dos tarjetas iguales. Así que `recetasEnElTexto()` **descarta un
candidato cuyo `id` ya esté en la lista**. Lo avisó `revisor-specs`; hoy no
puede pasar porque cada receta tiene un solo candidato.

### La normalización de una receta

Para cada receta del usuario, línea a línea:

- **Si la línea ya está estructurada** (spec 082), **no se toca**. Es lo que
  protege lo que el usuario haya escrito o editado.
- **Si es texto**, se parte:
  - **El ingrediente** sale de `ingredienteDeLinea()` (spec 068), que ya quita
    el número, la unidad y los paréntesis, y ante la duda deja la línea entera.
  - **La cantidad** es lo que `ingredienteDeLinea()` quitó por delante: el
    número con su unidad. Si no quitó nada, la cantidad queda vacía.
  - **La preparación** queda **vacía**. Adivinar cuál de las comas de
    `"atún, enlatado al natural, escurrido"` es preparación y cuál es parte del
    nombre no se puede hacer sin equivocarse, y equivocarse aquí ensucia el
    nombre del ingrediente en la despensa, que es lo que se cruza.
  - **El enlace**: se busca el ingrediente en la despensa con
    `mismoIngrediente()` (072, singular y plural). Si está, se enlaza. **Si no
    está, se crea, sin marcar** — como sembró la 075, porque que esté apuntado
    no significa que lo tengas.

La receta se guarda **una vez**, con todas sus líneas ya resueltas.

> ### ⚠️ Los ingredientes nuevos se deduplican entre TODAS las recetas
>
> "Huevo", "sal" y "aceite" salen en decenas de recetas. Si cada receta mirase
> solo la despensa **tal y como estaba al empezar**, la primera que necesite
> "huevo" lo crearía, la segunda no lo encontraría —porque aún no se ha
> escrito— y lo crearía otra vez. Una sola pulsación dejaría la despensa con
> "huevo" repetido diez veces.
>
> Así que se lleva **un registro único para toda la pasada**: un mapa de
> `nombre normalizado → id`, que arranca con la despensa que ya tienes y **crece
> con cada ingrediente que se decide crear**, antes de escribir nada. Se
> consulta siempre con `mismoIngrediente()`, no con igualdad, para que "huevos"
> encuentre el "huevo" que se acaba de decidir crear.
>
> Los `id` de los ingredientes nuevos se generan **por adelantado** con
> `doc(collection(...))` —como ya hace `js/siembra.js`— para poder enlazarlos
> desde las líneas antes de que el lote se escriba.
>
> Lo encontró `revisor-specs`. Es un fallo que no se ve al probarlo el primer
> día: se descubre semanas después, al abrir la despensa.

### El bloque en Ajustes

Va en **Zona de peligro**, que es donde vive lo que cambia datos sin vuelta
atrás, y **solo se pinta si el email del usuario es `pantonbernal@gmail.com`**.

```
Normalizar mis recetas
Pasa los ingredientes de tus recetas a piezas enlazadas con tu
despensa, y crea en ella lo que falte. No se puede deshacer.

[ Normalizar mis recetas ]
```

Pide **la misma confirmación que el reinicio**: escribir una palabra. Se usa
`NORMALIZAR`. No es un borrado, pero escribe en las 73 recetas de una vez y no
hay vuelta atrás.

Mientras corre, el botón se desactiva y dice `Normalizando…`. Al terminar:

> Listo: 73 recetas revisadas, 61 normalizadas, 388 líneas enlazadas y 24
> ingredientes nuevos en tu despensa.

Y si no había nada que hacer —la segunda vez que se pulsa—, **lo dice con otras
palabras**, no con el mismo texto lleno de ceros:

> Ya estaba todo normalizado: no ha hecho falta cambiar nada.

Si falla a mitad, lo dice y **lo hecho hasta ahí se queda hecho**. Es seguro
porque **volver a pulsarlo es inofensivo**: las líneas ya estructuradas se
saltan, así que la segunda pasada solo termina lo que faltaba.

### Cómo se escribe

Por **lotes de 400**, con `writeBatch`, como la siembra (spec 075) y por lo
mismo: son decenas de escrituras y de una en una la app se queda un minuto
colgada con el usuario mirándola.

Orden: **primero los ingredientes nuevos** de la despensa, porque las líneas
necesitan su `id` para enlazar; **después** las recetas.

> ### ⚠️ `update()`, NUNCA `set()`
>
> La siembra usa `lote.set()` porque escribe documentos **nuevos**. Aquí se
> escribe encima de **73 recetas que ya existen**, con su `nombre`, sus
> `raciones`, su `preparacion` y su `creadoEn`. Un `set()` sin `merge` las
> dejaría **solo con los campos que se reescriben** y se llevaría por delante el
> resto, en silencio y sin vuelta atrás.
>
> Se usa **`lote.update()`**, que es lo que hace `actualizarReceta()` en
> `js/recetas.js`, y se le pasan **solo los campos que cambian**:
> `ingredientes`, `alias` y `editadoEn`.
>
> Lo encontró `revisor-specs`, y con razón: la spec remitía al patrón de
> `js/siembra.js`, que hace justo lo contrario de lo que hace falta aquí. Es el
> fallo que habría convertido esta spec en una pérdida de datos.

## 6. Modelo de datos

`usuarios/{uid}/recetas/{id}`, campo `ingredientes`: sus líneas de texto pasan a
ser objetos, con la forma que ya definió la **spec 082**, y que son estos cuatro
campos exactos, tal y como los escribe `ingredientesValidados()` en
`js/recetas.js`:

| Campo | Qué le pone la normalización |
|---|---|
| `ingredienteId` | El id en la despensa. **Obligatorio**: `validarReceta()` rechaza una línea sin él. |
| `ingredienteNombre` | Lo que devuelve `ingredienteDeLinea()`. |
| `cantidad` | Lo que `ingredienteDeLinea()` quitó por delante. Vacío si no quitó nada. |
| `preparacion` | **Vacío siempre.** Ver las decisiones. |

`usuarios/{uid}/despensa`: entradas nuevas, con la forma de siempre y
`tengo: false`.

`js/datos-iniciales.js`, cada receta: campo **`alias`** (lista de textos, vacía
si no tiene). Es dato sembrado, no de usuario.

> **Las recetas ya sembradas en cuentas existentes NO reciben los alias**, y no
> hace falta: los alias los usa `semanaDesdeMenu()`, que lee las recetas **del
> usuario** para emparejarlas con el menú. Así que el alias tiene que llegar a
> la receta del usuario. **Esta spec lo mete en la normalización**: al
> normalizar, cada receta recibe también su lista de alias, buscándola por
> nombre en los datos iniciales.

Entonces sí hay campo nuevo en el usuario:

| Campo | Tipo | Qué |
|---|---|---|
| `alias` | lista de textos, opcional | Otros nombres por los que se reconoce la receta. Sin él, la receta se comporta como hoy. |

**El `alias` se escribe como campo explícito del `update()`**, no dentro de lo
que devuelve `validarReceta()`. Esa función construye el objeto con sus campos
uno a uno y **no conoce `alias`**, así que pasar por ella se lo comería en
silencio. Avisado por `revisor-specs`.

`firestore.rules`: **sin cambios** — es un campo más en una colección permitida.
`js/reinicio.js`: **sin cambios**.

## 7. Casos límite

- **Pulsar dos veces**: la segunda no toca nada. Las líneas ya estructuradas se
  saltan y los ingredientes ya creados se encuentran por `mismoIngrediente()`.
- **Una receta que el usuario ya editó a mano**: sus líneas están estructuradas,
  así que se saltan. Si tiene **unas líneas estructuradas y otras no** (editó a
  medias), se normalizan solo las de texto.
- **Una línea que `ingredienteDeLinea()` no sabe recortar**: devuelve la línea
  entera, y esa línea entera se convierte en un ingrediente de despensa. Es feo
  y se puede editar a mano; es el lado seguro por el que ya se equivoca la 068.
- **Dos líneas de la misma receta que dan el mismo ingrediente**: se enlazan las
  dos al mismo, y en la despensa se crea uno solo.
- **Una receta sin ingredientes**: se salta.
- **La despensa vacía**: se crean todos. Es el caso de una cuenta recién
  sembrada que borró su despensa.
- **Sin conexión a mitad**: lo escrito se queda y lo demás no. Se dice, y se
  arregla volviendo a pulsar.
- **Un alias que apunta a una receta que el usuario borró**: al normalizar no
  existe esa receta, así que no se le pone alias a nadie. No es un error.
- **Un alias de menos de 8 letras**: se descarta al enlazar, como cualquier
  nombre corto (076). No se filtra al escribir el fichero.
- **Un usuario que no es `pantonbernal@gmail.com`**: no ve el bloque. Si llegara a
  llamarse la función igualmente, escribiría en **sus propios datos**, que es lo
  único que las reglas de Firestore le permiten. No hay riesgo de tocar la
  cuenta de otro.
- **Deshacer**: no hay. La vuelta atrás es borrar las recetas desde Ajustes y
  dejar que la siembra las reponga, perdiendo las ediciones propias. Se dice en
  el aviso.

## 8. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| **Alias en un fichero revisado a mano**, no heurística en vivo | Decisión del usuario el 2 de septiembre. La propuesta automática se equivoca —se vio antes de escribir esto— y un enlace falso es una mentira en pantalla (076). Revisado una vez, vale para siempre y se corrige editando una línea. |
| **Alias, no renombrar** | Decisión del usuario. Renombrar llenaría el Recetario de frases con cantidades y solo enlazaría en uno de los cuatro menús. |
| **Los alias son trozos de plato, no el texto entero** | Si no, se comerían las palabras del otro plato de la frase y la regla de no solapar de la 088 dejaría fuera al vecino. |
| **La preparación queda vacía** | Adivinar qué coma separa la preparación del nombre ensucia el nombre del ingrediente, que es justo lo que se cruza. Mejor vacío que mal. |
| **Se crea el ingrediente que falte, sin marcar** | Decisión del usuario. Así todas las líneas quedan enlazadas y el cruce deja de ser heurística. Sin marcar, porque apuntado no es tenido (spec 075). |
| **Solo para `pantonbernal@gmail.com`** | Decisión del usuario: se prueba en su cuenta y, si va bien, se abre a las demás. Abrirlo es quitar una condición. **`revisor-specs` cazó que la spec decía `paubauer23@gmail.com`, que NO está en la lista blanca de la app**: el bloque no se habría pintado nunca. Es el correo personal del usuario, no su cuenta de la app. |
| **En Zona de peligro, con palabra de confirmación** | Escribe en 73 recetas de una vez y no se deshace. Es el sitio de la app donde vive eso. |
| **Volver a pulsarlo es inofensivo** | Es lo que hace que un fallo a mitad no sea un problema: se vuelve a pulsar y termina. |
| **Sin deshacer** | Guardar una copia de las 73 recetas para poder volver es una colección nueva y una pantalla nueva, por un botón que se pulsa una vez. |

## 9. Archivos afectados

| Archivo | Qué |
|---|---|
| `docs/menus/proponer-alias.mjs` | **Nuevo.** Propone el fichero de alias, marcando las dudosas. Se ejecuta a mano. |
| `docs/menus/alias-recetas.json` | **Nuevo.** Los alias, revisados. |
| `docs/menus/generar-datos-iniciales.mjs` | Mete el campo `alias` en cada receta. |
| `js/datos-iniciales.js` | **Regenerado**, con los alias. |
| `js/dietas.js` | `semanaDesdeMenu()` prueba nombre y alias. |
| `js/normalizacion.js` | **Nuevo.** Qué hacer con cada línea y cada receta. Cálculo puro, sin DOM ni red, para poder probarlo. |
| `js/app.js` | El bloque de Ajustes: pintarlo solo para ese email, la confirmación, ejecutar por lotes y el resumen. |
| `index.html` | El bloque en Zona de peligro. |
| `styles.css` | Solo si hace falta; se reutiliza `zona-peligro`. |
| `docs/specs/089-normalizacion-casos.mjs` | **Nuevo.** Casos del partido de líneas y del enlazado con alias. |

Estimación: **entre 350 y 420 líneas**, **por encima** del límite de 300 de
`CLAUDE.md`. La primera cuenta decía 300-380 y `revisor-specs` avisó de que se
quedaba corta: no contaba el registro único de ingredientes nuevos ni el
descarte de recetas repetidas, que son las dos piezas que se añadieron al cerrar
sus bloqueantes.

> **Se avisó al usuario y decidió hacerla entera**, el 2 de septiembre de 2026.
> Se le propuso partirla en **089** (los ingredientes y el botón) y **090** (los
> alias), y prefirió una sola. Queda escrito porque además esta spec **escribe
> en sus datos de verdad y no se deshace**.

## 10. Fuera de spec: ideas apuntadas

- Abrir la normalización a todas las cuentas.
- Que la preparación se separe de verdad, con la IA o a mano.
- Editar los alias desde el Recetario.
- Que la siembra ya escriba los ingredientes estructurados, para que esto no
  haga falta en cuentas nuevas.
- Los 11 trozos de plato que no tienen receta ninguna ("Pieza de fruta", "125gr
  de kéfir con canela"): decidir si merecen receta propia.

## ✅ Para probar a mano

Guion completo: lo afina `qa-manual`. En corto, los diez puntos del apartado 3.

**Antes de pulsar nada**, apunta cuántos ingredientes tienes en la despensa y
abre una receta sembrada para ver cómo está — hace falta para comparar después.

Con especial atención al **5** (que una receta tuya no se toque), al **6**
(pulsarlo dos veces) y al **9**: al elegir un menú, repasa que ningún plato haya
enganchado con una receta que no es.
