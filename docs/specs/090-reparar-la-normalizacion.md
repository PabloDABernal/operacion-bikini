# 090 — Reparar la normalización

- **Estado:** ✅ completada, dada por buena por el usuario el 2 de septiembre de 2026.
- **Fecha:** 2026-09-02
- **Referencia en PRODUCTO.md:** arregla la spec 089, declarada en "Qué hará (evolutivos de la fase productiva, desde el 31 de agosto de 2026)".

## 1. Objetivo

Arreglar lo que la **spec 089** dejó mal: sacar de la despensa los ingredientes
ilegibles que creó, y volver a enlazar las líneas de las recetas contra los
nombres buenos.

## 2. Por qué existe

La 089 se desplegó y el usuario la pulsó. El resultado, medido sobre sus datos:

```
Ingredientes creados:   181     (la despensa pasó de 133 a 314)
   de 1-3 palabras:      67
   de 4 o más (basura): 114
```

Con entradas como `"redonda pequeña de atún, enlatado al natural, escurrido"`,
`"medianas de huevo de gallina, entero, crudo"` o `"sopera de queso batido"`.

**Qué falló.** La 089 usó `ingredienteDeLinea()`, de la spec 068, que está hecha
para líneas cortas tipo `"200 g de lentejas"`: quita el número y la unidad. Las
recetas transcritas son otra cosa —`"1 lata redonda pequeña de atún, enlatado al
natural, escurrido (50 g)"`— y ahí quita `"1 lata"` y deja el resto entero.

**Y el fallo de método, que es el importante.** Las 373 líneas reales estaban en
el repositorio desde la spec 075. **No se ejecutó la normalización contra ellas
antes de desplegarla.** La suite de la 089 probaba la heurística con líneas
inventadas, pasaba sus 25 casos, y eso se dio por bueno. Medirlo costaba un
comando.

> **La regla que sale de aquí, para el resto del proyecto:** cuando una spec
> transforma datos que ya existen, **se ejecuta contra los datos de verdad y se
> mira el resultado ANTES de desplegar**. Una suite de casos inventados dice que
> el código hace lo que le pediste; no dice que le pidieras lo correcto.

## 3. La idea que arregla esto

No es afinar más la heurística: es **dejar de partir y empezar a buscar**.

La despensa ya trae **133 nombres limpios** (`atún`, `cebolla`, `pechuga de
pollo`). Casi siempre, el ingrediente de una línea **es uno de esos 133**. Así
que se recorta la línea para quitarle la paja, y luego **se busca cuál de los
133 cabe dentro**.

Medido sobre las 373 líneas reales, con el recorte y la búsqueda de esta spec:

| | La 089 | Esta spec |
|---|---|---|
| Líneas enlazadas a los 133 limpios | — | **357 (96%)** |
| Ingredientes nuevos creados | **181** | **8** |
| De ellos, ilegibles (4+ palabras) | **114** | **0** |

> Las cifras finales, mejores que las de la primera estimación (306/22/9): la
> tabla de sinónimos y el arreglo del corte por la coma se llevaron el resto.
> **La suite las comprueba y falla si empeoran.**

Y de esos 22, la mayoría tienen equivalente en la despensa escrito de otra
forma, que resuelve una tabla de sinónimos revisada a mano.

## 4. Criterio de "esto funciona"

1. En **Ajustes → Zona de peligro** el bloque pasa a llamarse **"Reparar mis
   recetas"**, con la misma confirmación por escrito.
2. Al pulsarlo, las recetas sembradas quedan enlazadas a **nombres legibles**:
   una receta enseña `atún`, no `redonda pequeña de atún, enlatado al natural`.
3. **Los ingredientes ilegibles desaparecen de la despensa.**
4. **NO se borra nada que tengas marcado** como que lo tienes, aunque su nombre
   sea feo.
5. **NO se borra nada que use alguna receta** después de reparar.
6. **A las recetas que escribiste tú no se les cambia el texto**, pero sí el
   enlace: si su línea apuntaba a un ingrediente ilegible, pasa a apuntar al
   bueno.
7. Se pulsa **dos veces** y la segunda no cambia nada.
8. Al terminar dice qué ha hecho: líneas reenlazadas e ingredientes borrados.
9. La despensa vuelve a tener un tamaño razonable (~133 + los pocos nuevos que
   de verdad hacían falta).
10. El Recetario, la dieta, la lista de la compra y los alias de la 089 siguen
    funcionando.

## 5. Alcance

### Entra

- `ingredienteDeReceta()`: el recorte nuevo y la búsqueda en los 133.
- `docs/menus/sinonimos-ingredientes.json`: **nuevo**, revisado a mano.
- El modo **reparar**: rehace las líneas de las recetas **sembradas** desde su
  texto original, aunque ya estén estructuradas.
- El **reenlace** de las recetas del usuario, sin tocarles el texto.
- El borrado de los ingredientes que quedan huérfanos.
- El bloque de Ajustes, renombrado.
- Suite de casos, **y una medida contra las 373 líneas reales**.

### NO entra (explícitamente fuera)

- **Cambiar el TEXTO de las recetas del usuario.** De esas no hay original al
  que volver, así que su `ingredienteNombre` se queda tal cual. Lo único que se
  les toca es el enlace. Ver "Qué recetas se reparan".
- **Borrar un ingrediente marcado**, aunque su nombre sea ilegible. Si dijiste
  que lo tienes, es tuyo.
- **Borrar un ingrediente que use alguna receta** tras reparar.
- **Cambiar `ingredienteDeLinea()`** (spec 068). Sigue donde está y para lo suyo:
  la usa la despensa que se llena sola desde una receta que escribes tú, con
  líneas cortas, y ahí funciona. Esta spec añade otra función, no la sustituye.
- **Tocar los alias** de la 089. Están bien y se quedan.
- **Deshacer la reparación.** Ver el apartado 8.
- **Abrirlo a las demás cuentas.** Sigue solo para `pantonbernal@gmail.com`.

## 6. Comportamiento detallado

### De dónde sale el texto que se recorta

> ### ⚠️ Las líneas originales YA NO ESTÁN en los datos del usuario
>
> La 089 las sobrescribió: hoy `receta.ingredientes` son objetos, y su
> `ingredienteNombre` es el recorte mutilado —sin paréntesis, con las comas ya
> comidas—. Recortar **eso** daría un resultado peor todavía, y no se parecería
> en nada a la medida del apartado 3, que se hizo contra el texto original.
>
> **Las 373 líneas originales sobreviven en `js/datos-iniciales.js`**, que la 089
> no tocó. La reparación **reconstruye desde ahí**: por cada receta sembrada se
> busca su gemela en `RECETAS` por nombre y se recortan **sus** líneas.
>
> Lo encontró `revisor-specs`. Sin esto, la spec entera estaba construida sobre
> una fuente de datos que ya no existía.

Consecuencia: **solo se puede reparar de verdad lo que vino de la siembra**. De
las recetas que escribió el usuario no hay original al que volver. Qué hacer con
ellas está en "Qué recetas se reparan".

### El recorte

Sobre la línea original, en este orden:

1. **Fuera los paréntesis**: `"(50 g)"`, `"(en conserva)"`. Antes de normalizar,
   o los paréntesis ya se han convertido en espacios y el `"50 g"` se queda
   dentro. *(Este fallo salió en el banco de pruebas, no leyendo.)*
2. **Corte en la primera coma**: `"atún, enlatado al natural, escurrido"` → la
   coma separa el ingrediente de cómo viene.
3. **La barra separa alternativas** y se queda la primera: `"plátano/banana"` →
   `"plátano"`. **Solo entre letras**: `"1/2 cucharada"` es una fracción, y
   partirla por ahí se lleva la línea entera. *(También salió en el banco: los
   enlaces cayeron de 306 a 254 hasta verlo.)*
4. **Fuera las coletillas** del final: `"al gusto"`, `"opcional"`.
5. **Se come por delante** todo lo que sea número, unidad, envase, tamaño o
   artículo (`1`, `120gr`, `cucharada`, `sopera`, `lata`, `unidad`, `ración`,
   `puñado`, `mediana`, `pequeña`, `un`, `una`…), y los `de` que los unen. Un
   `de` **solo se come si va detrás de una cantidad**: en `"aceite de oliva"` es
   parte del nombre.

### La búsqueda

Con el recorte hecho, se busca **cuál de los 133 ingredientes limpios cabe
dentro**, del de más palabras al de menos:

- **Palabra a palabra**, no como texto suelto: así `"sal"` no aparece dentro de
  `"salmón"`. Es la regla de la spec 059.
- **Singular y plural cuentan igual** (spec 072): `"huevo de gallina"` encuentra
  tus `"huevos"`, y `"boquerón"` tus `"boquerones"`.
- **Todas las palabras** del ingrediente tienen que estar en el recorte.

Si no encuentra ninguno, se mira la **tabla de sinónimos**; y si tampoco, **se
crea el recorte** como ingrediente nuevo, sin marcar.

> ### ⚠️ Antes de crear, se busca en TODA la despensa, no solo en los 133
>
> Los ~22 que crea la reparación no son ninguno de los 133 fijos. Si la segunda
> pasada solo mirase esos 133, no los encontraría y **los crearía otra vez**, y
> la despensa se duplicaría en cada pulsación.
>
> Así que la búsqueda va contra la **despensa actual entera** —los 133, los
> sinónimos, y lo creado en pasadas anteriores y en la de ahora mismo—, con el
> mismo registro único y `mismoIngrediente()` que ya usa `planDeNormalizacion()`
> en la 089.
>
> Lo encontró `revisor-specs`: la spec afirmaba que pulsarlo dos veces era
> inofensivo, y el algoritmo descrito no lo garantizaba.

### Los sinónimos

`docs/menus/sinonimos-ingredientes.json`, del recorte al nombre bueno:

```json
{
  "aceite de oliva": "aceite de oliva virgen extra",
  "aove": "aceite de oliva virgen extra",
  "pimienta": "pimienta negra",
  "chia": "semillas de chía",
  "pechuga de pollo sin piel": "pechuga de pollo"
}
```

**Revisada a mano**, como los alias de la 089 y por lo mismo: aquí es donde una
equivocación mete un ingrediente donde no toca. Se propone mirando la lista de
los 22 que quedan sin encontrar, y el usuario la repasa.

### Qué recetas se reparan

Hay **dos tratamientos**, porque hay dos situaciones distintas.

#### Las sembradas: se reconstruyen enteras

Una receta es sembrada si su **nombre** coincide con el de una de las 73 de
`js/datos-iniciales.js`, sin tildes ni mayúsculas. Se le rehacen todas las
líneas desde el texto original: nombre de ingrediente, cantidad y enlace.

**Si dos recetas del usuario tienen ese mismo nombre, no se repara ninguna de
las dos.** Nada impide hoy tener nombres repetidos (`js/recetas.js` no lo
comprueba), y con dos candidatas no hay forma de saber cuál vino de la siembra.
Ante la duda no se toca: un caso raro se queda sin reparar, que es mucho mejor
que sobrescribir una receta escrita a mano. Decisión del usuario el 2 de
septiembre, avisado por `revisor-specs`.

#### Las del usuario: solo se les arregla el enlace

De estas **no hay original**: la 089 se llevó su texto por delante y no está en
ningún sitio. Así que:

- **`ingredienteNombre` se queda como está.** Feo, pero es lo único que queda de
  lo que el usuario escribió, y lo puede editar a mano cuando quiera.
- **`cantidad` y `preparacion`, igual**: no se tocan.
- **`ingredienteId` sí se rehace**: se pasa el `ingredienteNombre` actual por el
  mismo recorte y la misma búsqueda, y si encuentra un ingrediente limpio, la
  línea pasa a apuntar a **ese**.

Con eso dejan de apuntar a basura —así sus ingredientes cuentan bien en la lista
de la compra y en el cruce— y la basura se queda huérfana, que es lo que permite
borrarla. Decisión del usuario el 2 de septiembre.

> Esto es distinto de la 089, que normalizaba cualquier receta con líneas de
> texto sin distinguir de quién era. Y aquí hay que rehacer líneas **ya
> estructuradas**, así que "no tocar lo que ya está hecho" ha dejado de servir
> como red: la red pasa a ser **de quién es la receta**, y qué se le toca.

### Qué ingredientes se borran

Después de reenlazar, un ingrediente de la despensa se borra si cumple **las
tres**:

1. **No es uno de los 133** que trae la app.
2. **No lo usa ninguna receta**: ni las reparadas, con sus enlaces nuevos, **ni
   las del usuario, que no se tocan**. El conjunto entero, no solo lo reescrito.
3. **No está marcado** como que lo tienes.

Las tres a la vez, y ante la duda no se borra. La 2 es la que evita dejar una
receta apuntando al vacío; la 3 es la que respeta lo que el usuario dijo.

### Volver a pulsarlo

Es inofensivo, pero por otro motivo que en la 089: allí se saltaba lo ya hecho;
aquí **se rehace y sale lo mismo**, porque el recorte y la búsqueda son
deterministas. La segunda pasada no encuentra nada que borrar y no cambia
ninguna línea, así que **no escribe nada** y lo dice.

### Lo que se le enseña al usuario

> Listo: 61 recetas reparadas, 373 líneas reenlazadas y 114 ingredientes
> ilegibles fuera de tu despensa.

Y si no había nada que reparar:

> Ya estaba todo bien: no ha hecho falta cambiar nada.

## 7. Modelo de datos

**Nada nuevo.** Se reescribe `ingredientes` de las recetas sembradas y se borran
documentos de `despensa`, las dos cosas con la forma que ya tienen.

Las recetas se escriben con **`update()`**, nunca `set()`, por lo mismo que en la
089: son documentos que ya existen.

`firestore.rules`: **sin cambios**. `js/reinicio.js`: **sin cambios**.

## 8. Casos límite

- **Pulsar dos veces**: la segunda no escribe nada y lo dice.
- **Una receta del usuario con líneas de texto**: no se toca. La 089 sí la
  habría tocado; esta no.
- **Una receta sembrada que el usuario renombró**: deja de reconocerse como
  sembrada y no se repara. Es el lado seguro: si le cambiaste el nombre, es
  tuya.
- **Un ingrediente ilegible que marcaste como que lo tienes**: se queda. Sale
  del enlace de las recetas, pero no se borra.
- **Un ingrediente ilegible que usa una receta tuya**: se queda, por la regla 2.
- **Un ingrediente de los 133 que quedó huérfano**: se queda. La app lo trae
  puesto y borrarlo sería quitarle a la despensa algo que siempre estuvo.
- **La despensa entera borrada antes de reparar**: se crean los que hagan falta,
  como en la 089.
- **Sin conexión a mitad**: lo escrito se queda; volver a pulsarlo termina. Como
  la 089.
- **Una línea que no encuentra nada ni en los 133 ni en los sinónimos**: se crea
  con el recorte. Son 22 sobre 373, y la mayoría son ingredientes de verdad
  (`agua`, `fruta`).
- **Una receta sembrada sin ingredientes**: se salta.
- **Dos recetas con el mismo nombre sembrado**: no se repara ninguna. Se cuenta
  aparte en el resumen, para que se sepa que ha pasado.
- **Una receta del usuario llamada igual que una sembrada**: cae en el caso de
  arriba, y por eso no se toca. Es el caso peligroso y se resuelve no actuando.
- **Una línea del usuario cuyo nombre no encuentra nada**: se queda con su
  enlace actual, sea el que sea. No se le inventa uno nuevo ni se le crea un
  ingrediente.

## 9. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| **Buscar en los 133, no partir mejor** | Los nombres limpios ya existen. Partir una frase es adivinar; buscar en una lista conocida, no. Es lo que lleva la basura de 114 a 9. |
| **Las sembradas se reconstruyen; las tuyas solo se reenlazan** | Decisión del usuario. De las suyas no hay original que recuperar, pero sí se puede dejar de apuntar a basura sin tocarles una letra. |
| **Con el nombre repetido, no se toca nada** | Decisión del usuario, avisado por `revisor-specs`. Con dos candidatas no se sabe cuál vino de la siembra, y sobrescribir una receta escrita a mano es el peor resultado posible. |
| **Tres condiciones para borrar, y las tres a la vez** | Es la parte que destruye datos. Ante la duda, no se borra. |
| **Nunca se borra algo marcado** | Si dijiste que lo tienes, es tuyo, se llame como se llame. |
| **Sinónimos revisados a mano** | Igual que los alias de la 089: es donde una equivocación mete un ingrediente donde no toca. |
| **`ingredienteDeLinea()` se queda como está** | La usa la despensa que se llena sola desde tus recetas (spec 068), con líneas cortas, y ahí funciona. |
| **Sin deshacer** | Lo mismo que la 089, y ahora además hay una salida conocida: borrar Recetas y Despensa desde Ajustes las repone sembradas. |

## 10. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/normalizacion.js` | `recortarLinea()`, `ingredienteDeReceta()`, `planDeReparacion()` y qué borrar. Todo puro. |
| `js/normalizacion.js` (escritura) | Reescribir recetas con `update()` y borrar ingredientes. |
| `docs/menus/sinonimos-ingredientes.json` | **Nuevo**, revisado. |
| `docs/menus/proponer-sinonimos.mjs` | **Nuevo.** Lista lo que queda sin encontrar, para repasarlo. |
| `index.html` | El bloque, renombrado a "Reparar mis recetas". |
| `js/app.js` | El botón, su confirmación y su resumen. |
| `docs/specs/090-reparacion-casos.mjs` | **Nuevo.** Casos, **y la medida contra las 373 líneas reales**, con un tope: si la basura pasa de 15, la suite falla. |

Estimación: **entre 300 y 350 líneas**. La primera cuenta decía 250-300 y
`revisor-specs` avisó de que se quedaba corta: no contaba el reenlace de las
recetas del usuario, la búsqueda contra la despensa entera ni el fichero de
sinónimos.

## 11. Fuera de spec: ideas apuntadas

- Que la siembra escriba ya los ingredientes estructurados, y esto no vuelva a
  hacer falta en cuentas nuevas.
- Repasar los 133 ingredientes: faltan `agua` y `fruta`.
- Abrir la reparación a las demás cuentas, cuando esta se pruebe.

## ✅ Para probar a mano

**Antes**: mira cuántos ingredientes tienes en la despensa (deberían ser ~314) y
abre la receta de la ensalada de repollo, la de la captura.

Los diez puntos del apartado 4. Los que importan:

- **El 3**: la despensa tiene que bajar de ~314 a ~140, y lo que quede tiene que
  leerse.
- **El 4**: marca a mano un ingrediente ilegible ANTES de reparar, y comprueba
  que **sigue ahí** después.
- **El 6**: si tienes alguna receta escrita por ti, míralaantes y después.
- **El 7**: púlsalo dos veces.
