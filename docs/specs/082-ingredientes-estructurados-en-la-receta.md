# 082 — Ingredientes estructurados en la receta

- **Estado:** borrador
- **Fecha:** 2026-08-31
- **Referencia en PRODUCTO.md:** "Qué hará (evolutivos de la fase productiva, desde el 31 de agosto de 2026)"

## 1. Objetivo

Al crear o editar una receta, cada ingrediente deja de ser una línea de texto
libre ("1 diente de ajo, triturado (4 g)") y pasa a ser tres piezas: el
ingrediente (enlazado a uno real de la despensa, existente o creado ahí
mismo), su cantidad, y un texto de preparación aparte ("triturado", "en
rodajas"...) que no forma parte del nombre del ingrediente.

Es la primera de cuatro specs relacionadas (la base de las otras tres:
editar receta desde el día, apuntar con ingrediente suelto, reorganizar
Comidas), pero funciona sola: una receta se puede crear y editar de esta
forma nueva sin que nada más cambie todavía.

## 2. Criterio de "esto funciona"

1. En Comidas → Recetario → Nueva receta, el formulario de ingredientes ya
   no es un cuadro de texto de varias líneas: es una lista de líneas, cada
   una con tres campos — ingrediente, cantidad, preparación — y un botón
   para añadir otra línea y otro para quitar una.
2. Al escribir en el campo de ingrediente, aparecen sugerencias de tu
   despensa (autocompletar). Si escribes uno que no existe, puedes crearlo
   ahí mismo (nace sin marcar, como cualquier alta de la despensa) y la
   línea queda enlazada a él.
3. La cantidad y la preparación son campos de texto libre, sin formato
   obligatorio: "4 g", "1/2 cucharadita", "al gusto" son todos válidos. La
   preparación puede quedar vacía.
4. Al guardar, la receta queda con sus ingredientes en la forma nueva. Al
   volver a abrirla para editar, el formulario recupera cada línea con su
   ingrediente, cantidad y preparación tal como se guardaron.
5. Al ver la receta (no editarla), cada línea se lee como
   "Ingrediente (cantidad)" y, si hay preparación, se lee aparte, sin
   mezclarse en el nombre. Ejemplo del usuario: "Ajo (4 g)" con "triturado"
   a un lado, no "Ajo triturado (4 g)".
6. El cruce con la despensa (qué ingredientes de la receta ya tienes
   marcados) y la lista de la compra (qué te falta) siguen funcionando con
   una receta nueva, ahora por el enlace directo al ingrediente, no por
   adivinar el texto.
7. Una receta de las 73 ya sembradas, o cualquiera creada antes de esta
   spec (formato de texto libre, un array de líneas), se sigue viendo y
   funcionando exactamente igual que hoy: esta spec no las toca ni las
   rompe. (Migrarlas es la spec 083.)
8. Puedes crear dos ingredientes de despensa que se parecen pero quieres
   distinguir (ejemplo del usuario: "Tomate triturado" y "Tomate natural"):
   el formulario te deja crear el segundo como un ingrediente nuevo y
   distinto, sin fundirlo con el primero.

## 3. Alcance

### Entra
- Nueva forma de `receta.ingredientes`: en vez de un array de strings, un
  array de objetos `{ ingredienteId, ingredienteNombre, cantidad,
  preparacion }` — ver "Modelo de datos".
- El formulario de receta (crear y editar): líneas repetibles con
  ingrediente (autocompletar + crear nuevo), cantidad y preparación.
- La vista de una receta abierta (`cuerpoDeReceta()`): enseña cada línea
  estructurada.
- El cruce despensa/receta (spec 059) y la lista de la compra (spec 073),
  adaptados para leer la forma nueva CUANDO la receta la tiene, y seguir
  leyendo la forma vieja (texto libre, con la heurística actual) cuando no.
- Crear un ingrediente de despensa desde dentro del formulario de receta.

### NO entra (explícitamente fuera)
- Migrar las 73 recetas sembradas ni las que el usuario ya tenga en formato
  de texto libre: spec 083.
- Editar una receta desde el día de la dieta (spec 084 en el orden
  acordado).
- Apuntar una comida con un ingrediente suelto, sin receta (spec 085 en el
  orden acordado).
- Reorganizar Recetario/Despensa visualmente (spec 086 en el orden
  acordado).
- Cambiar `guardarIngredientesDeReceta()`/`clasificarIngredientes()` (spec
  072, el reparto "nuevos/dudas" al guardar una receta): con ingredientes ya
  enlazados al escribir la línea, esa clasificación deja de hacer falta
  para una receta nueva. Se deja intacta porque las recetas en formato
  viejo (sembradas o del usuario) la siguen necesitando hasta que se
  migren en la 083.

## 4. Comportamiento detallado

**Formulario de receta:**
- Cada línea: un campo de ingrediente con autocompletar contra
  `despensaCargada` (igual de comportamiento que un `<input>` con
  `<datalist>`, o un desplegable filtrable — detalle de implementación
  libre siempre que cumpla el criterio 2); un campo de cantidad (texto); un
  campo de preparación (texto, opcional).
- Si el texto del campo de ingrediente no coincide con ninguno de la
  despensa (comparando con la misma regla de `normalizar()`/
  `mismoIngrediente()` que ya usa la spec 072, singular/plural incluido),
  se ofrece crearlo: al confirmar, se llama a `guardarIngrediente()` (ya
  existe, spec 068) y la línea queda enlazada al que se acaba de crear.
- Botón "Añadir ingrediente" que agrega una línea vacía al final; cada línea
  lleva su botón de quitar. Empieza con una línea vacía en una receta nueva,
  y con tantas líneas como ingredientes tenga al editar una receta
  estructurada.
- Al guardar: se valida que cada línea tenga un ingrediente enlazado (la
  cantidad y la preparación pueden ir vacías) y que haya al menos una línea.
  Mismo límite de caracteres que ya tienen `nombre` de ingrediente (spec
  058, `MAX_NOMBRE = 60`) para el nombre, y unos topes razonables nuevos
  para cantidad y preparación (p. ej. 40 y 200 caracteres).

**Vista de la receta:**
- Cada línea estructurada se enseña como "Ingrediente (cantidad)" — sin
  paréntesis si la cantidad viene vacía — y, si hay preparación, aparte
  (por ejemplo, en un color más apagado a continuación, o en una segunda
  línea pequeña: detalle de diseño a resolver en implementación, sin
  inventar una jerarquía visual nueva más allá de lo que ya usa
  `.receta-ingredientes`).

**Cruce con la despensa y lista de la compra:**
- Para una línea estructurada, "¿la tienes?" es una comprobación directa:
  ¿existe en tu despensa un ingrediente con ese `ingredienteId`, y está
  marcado (`tengo: true`)? Nada de regex ni de partir la línea por comas.
- Para una línea de texto libre (receta vieja), se sigue usando
  `lineaTieneIngrediente()`/`partesDeLinea()` tal cual están hoy.
- `cruzarConLaDespensa()` y `loQueFalta()` distinguen el formato de cada
  línea mirando su tipo (`string` = vieja, objeto = nueva), receta a
  receta y línea a línea — una receta no tiene por qué ser 100% de un
  formato o del otro si se edita a medias (aunque el flujo normal, al
  guardar el formulario entero de una vez, no debería mezclar formatos
  dentro de la misma receta).

## 5. Modelo de datos

`receta.ingredientes` pasa a admitir dos formas, para convivir con las
recetas ya existentes:

- **Forma vieja** (recetas creadas antes de esta spec, y las 73 sembradas):
  `string[]`, cada elemento una línea de texto libre. Sin cambios.
- **Forma nueva** (recetas creadas o editadas con esta spec):
  ```
  {
    ingredienteId: string,      // id del documento en usuarios/{uid}/despensa
    ingredienteNombre: string,  // copia del nombre en el momento de guardar
    cantidad: string,           // "4 g", "1/2 cucharadita", puede ir vacío
    preparacion: string         // "triturado", puede ir vacío
  }[]
  ```

`ingredienteNombre` se copia (denormalizado) siguiendo el mismo patrón que
ya usa `comida.recetaId` en la dieta (spec 060): si el ingrediente de la
despensa se borra o se renombra más tarde, la receta sigue enseñando algo
con sentido en vez de un hueco. El cruce con la despensa, para saber si
"lo tienes ahora", siempre mira el `ingredienteId` contra la despensa
actual — nunca el nombre copiado.

## 6. Casos límite

- El ingrediente enlazado se borra de la despensa después: la receta sigue
  enseñando `ingredienteNombre`, pero el cruce lo cuenta como "no lo
  tienes" (no hay `ingredienteId` que encontrar).
- Dos líneas de la misma receta enlazadas al mismo ingrediente (p. ej. "sal"
  aparece dos veces con distinta cantidad): válido, no se deduplica al
  guardar — es una decisión de quien escribe la receta, no un error.
- Cantidad y/o preparación vacías: válido, se enseñan sin paréntesis/sin la
  parte de preparación.
- Autocompletar con un nombre que difiere solo en mayúsculas/tildes/plural
  de uno ya existente ("Tomates" contra "tomate"): se ofrece el existente
  primero (misma regla de `mismoIngrediente()`), no se crea uno duplicado
  por descuido. Si el usuario quiere de verdad un ingrediente distinto
  (caso 8, "tomate triturado" aparte de "tomate"), puede escribirlo entero
  y confirmarlo como nuevo.
- Editar una receta en formato viejo (texto libre): el formulario la
  enseña con el cuadro de texto de siempre (no se fuerza a estructurar algo
  que no lo está); si el usuario la reescribe entera con el editor nuevo,
  pasa a formato nuevo al guardar. No hay conversión automática de una
  línea de texto a estructurada: eso es exactamente el trabajo de la 083.

## 7. Archivos afectados

- `js/recetas.js`: `validarReceta()` cambia de firma (ya no recibe un
  string de textarea, recibe el array de líneas estructuradas).
- `js/app.js`: el formulario de receta (`abrirFormularioDeReceta()` y el
  guardado, líneas ~1888-1975), `cuerpoDeReceta()` (línea ~1811).
- `js/despensa.js`: `cruzarConLaDespensa()`, `loQueFalta()`, para
  distinguir línea vieja/nueva.
- `styles.css`: estilos de las líneas del formulario nuevo y de la vista de
  una línea estructurada.

## 8. Decisiones tomadas

- **Un solo ingrediente en la despensa por defecto** ("ajo", no "ajo
  triturado"); el matiz de preparación vive en el texto de preparación de
  ESA línea de ESA receta. **Pero si el usuario quiere más granularidad
  para un ingrediente concreto** (su ejemplo: "tomate triturado" y "tomate
  natural" como ingredientes distintos), el formulario se lo deja crear —
  no hay una regla automática que lo decida por él. Decisión del usuario.
- **El ingrediente se elige con autocompletar contra la despensa, con
  opción de crear uno nuevo ahí mismo.** Decisión del usuario.
- **La cantidad es texto libre**, sin separar número y unidad en campos
  distintos: la heurística actual para eso falla a menudo, y no vale la
  pena forzar una estructura que no cubre "al gusto" o fracciones. Decisión
  del usuario.
- **Las recetas ya existentes (sembradas o del usuario) NO se migran en
  esta spec.** Quedan en su formato de texto libre, conviviendo con las
  nuevas. Decisión del usuario, que abre la spec 083.

## 9. Fuera de spec: ideas apuntadas

Ninguna nueva; lo que queda fuera ya tiene su spec propia en el orden
acordado (083, 084, 085, 086).

## ✅ Para probar a mano

(Lo afina el agente `qa-manual` antes de la prueba; guion provisional.)

1. En Comidas → Recetario → Nueva receta, añade dos o tres líneas de
   ingrediente. Prueba a escribir uno que ya tienes (debe sugerirlo) y uno
   que no (debe dejarte crearlo).
2. Pon cantidad en unas líneas y déjala vacía en otra; pon preparación en
   una ("triturado") y déjala vacía en las demás.
3. Guarda la receta y vuelve a abrirla para editar: las líneas deben
   recuperarse tal cual las dejaste.
4. Ciérrala sin editar y mírala en modo lectura: cada línea debe leerse
   "Ingrediente (cantidad)", con la preparación aparte y sin mezclarse en
   el nombre.
5. Marca en tu despensa alguno de los ingredientes de esa receta como que
   lo tienes, y comprueba que la receta lo refleja (cruce despensa/receta).
6. Comprueba que una receta de las 73 ya puestas se sigue viendo y
   comportando exactamente igual que antes de esta spec.
7. Prueba el caso del tomate: crea "Tomate triturado" como ingrediente
   nuevo aunque ya tengas "Tomate" en la despensa, y comprueba que quedan
   como dos ingredientes distintos, no fundidos.
