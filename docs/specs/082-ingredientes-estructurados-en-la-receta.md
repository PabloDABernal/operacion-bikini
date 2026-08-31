# 082 — Ingredientes estructurados en la receta

- **Estado:** revisada por `revisor-specs` (tres rondas, cuatro bloqueantes cerrados), lista para implementar
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
5. Al editar una receta que TODAVÍA está en formato viejo (texto libre,
   como las 73 sembradas): se abre el mismo editor nuevo, con una línea por
   cada elemento del array de texto, mostrando el texto tal cual pero SIN
   ingrediente enlazado todavía. Antes de poder guardar hay que enlazar (o
   crear) el ingrediente de cada línea, igual que en una receta nueva. Al
   guardar, esa receta pasa a formato nuevo entera. Editar una receta vieja
   es, de paso, la forma de migrarla una a una — la spec 083 solo hace
   falta para las que nadie edite a mano.
6. Al ver la receta (no editarla), cada línea se lee como
   "Ingrediente (cantidad)" y, si hay preparación, se lee aparte, sin
   mezclarse en el nombre. Ejemplo del usuario: "Ajo (4 g)" con "triturado"
   a un lado, no "Ajo triturado (4 g)".
7. El cruce con la despensa (qué ingredientes de la receta ya tienes
   marcados) y la lista de la compra (qué te falta) siguen funcionando con
   una receta nueva, ahora por el enlace directo al ingrediente, no por
   adivinar el texto.
8. Una receta de las 73 ya sembradas, o cualquiera creada antes de esta
   spec, que NADIE HA EDITADO TODAVÍA (formato de texto libre, un array de
   líneas), se sigue viendo y funcionando exactamente igual que hoy: esta
   spec no la toca ni la rompe mientras nadie la abra para editar. (Migrar
   de golpe las que nadie edite a mano es la spec 083.)
9. Puedes crear dos ingredientes de despensa que se parecen pero quieres
   distinguir (ejemplo del usuario: "Tomate triturado" y "Tomate natural"):
   el formulario te deja crear el segundo como un ingrediente nuevo y
   distinto, sin fundirlo con el primero.
10. Guardar una receta (nueva o editada) NO deja restos en la despensa más
    allá de los ingredientes que enlazaste o creaste línea a línea: no
    aparece nada raro ni ningún ingrediente con un nombre roto tipo
    "[object Object]".
11. Pedirle una dieta a la IA sigue guardando las recetas que propone,
    exactamente igual que hoy (en formato de texto libre, porque la IA no
    conoce los ids de tu despensa): esta spec no rompe ese camino.
12. El buscador del Recetario (por nombre o por ingrediente) sigue
    encontrando una receta con ingredientes estructurados si buscas por
    uno de sus ingredientes, con el mismo comportamiento de siempre (te
    dice por qué ha salido: "lleva pollo").

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
- El buscador de recetas por nombre e ingrediente (spec 079,
  `recetasQueCoinciden()` en `js/app.js`, líneas ~1733-1753): hoy compara
  cada línea como texto (`normalizarIngrediente(linea)`); con una línea
  estructurada eso compararía un objeto y produciría "[object Object]",
  rompiendo la búsqueda por ingrediente en cualquier receta ya migrada. Se
  adapta para usar el mismo helper de "leer el nombre de una línea" que el
  resto de funciones (ver más abajo).
- Un helper compartido en `js/despensa.js` para no repetir la
  distinción vieja/nueva en cada función que toca `receta.ingredientes`
  (`cruzarConLaDespensa()`, `loQueFalta()`, `recetasQueCoinciden()`,
  `cuerpoDeReceta()`): algo como `nombreDeLinea(linea)` (devuelve `linea`
  tal cual si es un string, o `linea.ingredienteNombre` si es un objeto) y
  `esLineaEstructurada(linea)` (`typeof linea === "object"`). El nombre
  exacto de estas funciones es libre en implementación.
- El formulario de editar receta pasa a ser el MISMO editor estructurado
  para cualquier receta, esté en el formato que esté (ver criterio 5): deja
  de existir un modo de edición en texto libre.
- Quitar la llamada a `llenarDespensaDesde([resultado])` tras guardar una
  receta (`js/app.js`, dentro del `submit` de `form-receta`, hoy en la
  línea ~1995): con el editor nuevo, cada ingrediente ya quedó enlazado o
  creado línea a línea MIENTRAS se editaba, así que volver a analizar la
  receta guardada para "meter lo que falte en la despensa" es trabajo
  repetido — y con ingredientes ya estructurados (objetos, no texto) esa
  llamada rompería: `guardarIngredientesDeReceta()` → `clasificarIngredientes()`
  → `ingredienteDeLinea()` esperan una línea de texto, y con un objeto
  producirían basura tipo `"[object Object]"`.

### NO entra (explícitamente fuera)
- Migrar de golpe las 73 recetas sembradas ni las que el usuario ya tenga y
  nadie edite a mano: spec 083. (Editar una a mano SÍ la migra, como dice
  el criterio 5 — eso es parte de esta spec, no de la 083.)
- El camino de las recetas que PROPONE la IA al generar una dieta
  (`generarDieta()` → `guardarRecetasPropuestas()` en `js/dietas.js`, línea
  ~119, que también llama a `validarReceta()`): la IA no conoce los `id`
  de la despensa del usuario, así que sus recetas siguen llegando y
  guardándose en formato de texto libre, tal cual hoy. Por eso
  `validarReceta()` NO cambia de firma sin más: pasa a aceptar los DOS
  formatos de entrada —un string de texto libre con un ingrediente por
  línea (el que ya usa `guardarRecetasPropuestas()`, sin tocar) y un array
  de líneas estructuradas (el que usa el editor nuevo)— y devuelve
  `receta.ingredientes` en la forma que corresponda a lo que recibió: un
  `string[]` si vino de texto, el array de objetos si vino estructurado.
  Se distingue mirando el tipo de `ingredientesBruto` al entrar
  (`typeof ... === "string"` vs. `Array.isArray(...)`).
- Editar una receta desde el día de la dieta (spec 084 en el orden
  acordado).
- Apuntar una comida con un ingrediente suelto, sin receta (spec 085 en el
  orden acordado).
- Reorganizar Recetario/Despensa visualmente (spec 086 en el orden
  acordado).
- Cambiar `guardarIngredientesDeReceta()`/`clasificarIngredientes()` (spec
  072, el reparto "nuevos/dudas"): se dejan intactas TAL CUAL, porque las
  sigue usando otro sitio que esta spec no toca — las recetas que llegan en
  texto libre desde la IA al generar una dieta (`generarDieta()`,
  `js/app.js` línea ~3536, `llenarDespensaDesde(respuesta.recetas)`). Ese
  camino sigue produciendo recetas en formato viejo (la IA no conoce los
  `id` de tu despensa) y sigue necesitando la heurística de siempre. Lo
  único que deja de llamarlas es el guardado manual de una receta desde el
  Recetario (ver más arriba).

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
- `cuerpoDeReceta()` construye este texto leyendo `receta.ingredientes`
  directamente a través del helper compartido (`nombreDeLinea()` y
  compañía) — NO a partir del campo `texto` que hoy devuelve
  `cruzarConLaDespensa()` para cada línea (ese campo sigue existiendo y
  sigue diciendo si la tienes marcada, pero no es de ahí de donde sale lo
  que se lee).
- Es la MISMA función que abre la receta desde Mi dieta (spec 060): no
  hace falta ningún cambio aparte ahí, pero conviene probarlo desde los dos
  sitios (ver guion de prueba).

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

**Ojo con el nombre repetido:** la receta YA tiene un campo `preparacion` a
su propio nivel (cómo se hace la receta entera, spec 026). El
`preparacion` de cada línea de ingrediente es un campo DISTINTO, a otro
nivel (`ingredientes[].preparacion`, el matiz de ESE ingrediente). Mismo
nombre, dos conceptos — no confundirlos al implementar.

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
  (criterio 9, "tomate triturado" aparte de "tomate"), puede escribirlo entero
  y confirmarlo como nuevo.
- Editar una receta en formato viejo (texto libre) y cerrar sin guardar
  (Cancelar): la receta se queda tal cual estaba, en formato viejo. Abrir
  para editar y no terminar de enlazar todas las líneas no migra nada — la
  migración ocurre solo al guardar con éxito.
- Se cancela un formulario a medio enlazar y se crearon ingredientes nuevos
  de paso (al elegir "crear nuevo" en alguna línea antes de cancelar): esos
  ingredientes SÍ quedan en la despensa (se crean al confirmarlos, no al
  guardar la receta entera) aunque la receta no se guarde. Es el mismo
  comportamiento que ya tiene la despensa hoy: dar de alta un ingrediente
  es un acto aparte de usarlo en algo.
- El usuario escribe texto en el campo de ingrediente de una línea pero no
  llega a confirmar ni una sugerencia existente ni "crear nuevo" (lo deja a
  medias y le da a Guardar): esa línea se trata igual que una línea vieja
  sin enlazar — sin `ingredienteId`, bloquea el guardado con el mismo
  mensaje de validación ("cada línea necesita un ingrediente").

## 7. Archivos afectados

- `js/recetas.js`: `validarReceta()` pasa a aceptar los DOS formatos de
  entrada de `ingredientesBruto` (ver "Alcance" → "NO entra" para el
  motivo): un `string` de texto libre (un ingrediente por línea, tal cual
  hoy, usado por `guardarRecetasPropuestas()` en `js/dietas.js` con las
  recetas que propone la IA) o un `Array` de líneas estructuradas
  `{ ingredienteId, ingredienteNombre, cantidad, preparacion }[]` (usado
  por el editor nuevo). Valida cada forma con su propia regla — la vieja
  igual que hoy; la nueva exige `ingredienteId` en cada línea y al menos
  una línea, y recorta `cantidad`/`preparacion` a sus topes — y devuelve
  `receta.ingredientes` en la MISMA forma que recibió.
- `js/app.js`:
  - El formulario de receta (`abrirFormularioDeReceta()`, líneas
    ~1888-1975 hoy): reescrito para el editor de líneas, que SIEMPRE manda
    a `validarReceta()` el array estructurado (nunca el string). Cuando la
    receta a editar viene en formato viejo, cada línea del array de texto
    se precarga como una fila sin `ingredienteId` (pendiente de enlazar).
  - El `submit` de `form-receta`: quita la llamada a
    `llenarDespensaDesde([resultado])` (ver "Alcance").
  - `cuerpoDeReceta()` (línea ~1811): enseña la forma nueva; sigue
    enseñando la vieja tal cual para una receta que aún no se haya editado.
  - `recetasQueCoinciden()` (líneas ~1733-1753, spec 079): usa el helper
    compartido para leer el nombre de cada línea, sea del formato que sea,
    en vez de comparar la línea entera como texto.
- `js/despensa.js`: `cruzarConLaDespensa()`, `loQueFalta()`, y el helper
  nuevo compartido (`nombreDeLinea()`/`esLineaEstructurada()` o
  equivalente) para distinguir línea vieja/nueva en un solo sitio.
  `guardarIngredientesDeReceta()` y `clasificarIngredientes()` NO se
  tocan (las sigue usando el camino de la IA, sin cambios).
- `js/dietas.js`: sin cambios — `guardarRecetasPropuestas()` sigue
  mandando un string a `validarReceta()`, que sigue aceptándolo.
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
- **Las recetas ya existentes (sembradas o del usuario) NO se migran de
  golpe en esta spec.** Pero editar CUALQUIER receta —vieja o nueva— abre
  siempre el mismo editor estructurado; si es vieja, sus líneas de texto se
  precargan sin enlazar y hay que enlazarlas antes de poder guardar. Editar
  a mano migra esa receta de paso. Decisión del usuario, tras la revisión
  de `revisor-specs`: migrar de golpe las que nadie edite queda para la
  spec 083, pero editar deja de tener un modo "texto libre" aparte.

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
6. Comprueba que una receta de las 73 ya puestas se sigue viendo IGUAL que
   antes de esta spec, mientras no la edites.
7. Abre esa misma receta para editar: debe salir el editor nuevo con sus
   líneas de texto sin enlazar. Enlaza o crea cada ingrediente, guarda, y
   comprueba que ahora se lee estructurada ("Ingrediente (cantidad)").
   Comprueba también que tu despensa no se ha llenado de basura tipo
   "[object Object]" ni de ingredientes repetidos.
8. Prueba el caso del tomate: crea "Tomate triturado" como ingrediente
   nuevo aunque ya tengas "Tomate" en la despensa, y comprueba que quedan
   como dos ingredientes distintos, no fundidos.
9. Pide una dieta a la IA (Comidas → Mi dieta → Pedir dieta) y comprueba
   que las recetas que trae se guardan sin error, como siempre.
10. En el buscador del Recetario, busca por un ingrediente de una receta ya
    estructurada (una de las que migraste en el paso 7) y comprueba que
    aparece, con el motivo ("lleva...") correcto.
11. Esa misma receta estructurada, enlázala a un día de Mi dieta y ábrela
    desde ahí (icono de receta): debe leerse igual que desde el Recetario.
