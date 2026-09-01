# 077 — La tabla aprovecha tu material

- **Estado:** revisada — `revisor-specs` sin bloqueantes tras dos rondas
- **Fecha:** 2026-09-01
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v13: el material, decidida el 30 de agosto de 2026)", segundo punto ("La tabla lo aprovecha") y el punto "El material del ejercicio pasa a ser una lista".
- **Depende de:** la spec 074 (el armario), ya implementada — sin ella no hay nada que cruzar.

## 1. Objetivo

Que al pedir la tabla de ejercicio se pueda decir "aprovecha mi material", y
que al abrir un ejercicio del catálogo se vea de un vistazo qué material
tienes y cuál te falta — el espejo exacto de lo que la spec 059 hizo con la
dieta y la despensa, pero para Ejercicio y el armario de la 074.

## 2. Criterio de "esto funciona"

1. En **Ejercicio → Mi tabla**, junto al campo de instrucciones al pedir
   tabla, hay una casilla **"Aprovechar mi material"**.
2. Con el armario vacío, o con todo desmarcado, la casilla **no se enseña**.
3. Marcando la casilla y pidiendo la tabla, la semana que sale usa de verdad
   tu material: se reconocen piezas propias en los ejercicios propuestos.
4. Los ejercicios **no** salen limitados a lo que tienes: la IA prefiere tu
   material, no se encierra en él — igual que la dieta con la despensa.
5. Al abrir un ejercicio **desde Ejercicio → Catálogo**, cada pieza de
   material sale marcada como **la tienes** o **te falta**, según tu
   armario.
6. Arriba del material se ve el resumen: **"Tienes 2 de 3"**.
7. La marca es de ahora, no de cuando se creó o propuso el ejercicio:
   desmarcar una pieza en el armario y volver a abrir el ejercicio lo
   enseña como que falta.
8. Con el armario vacío, los ejercicios se ven exactamente como hoy: sin
   marcas ni resumen.
9. Sin marcar la casilla, la tabla sale como siempre: el armario no se le
   menciona a la IA.
10. Un ejercicio nuevo que la IA proponga al generar una tabla trae su
    material ya como piezas sueltas (no una frase), y esas piezas son las
    que se cruzan con el armario.
11. Un ejercicio del catálogo guardado antes de esta spec, con su material
    en una sola frase ("mancuernas y banco"), se sigue leyendo y cruzando
    bien: se parte en piezas al vuelo, sin tocar lo que hay en Firestore.
12. El formulario manual de "Nuevo ejercicio" (Catálogo) sigue aceptando
    escribir el material como lo hace hoy (un campo de texto), y lo que
    escribas se parte en piezas igual que un ejercicio viejo.

## 3. Alcance

### Entra

- Casilla "Aprovechar mi material" al pedir tabla (Ejercicio → Mi tabla),
  espejo de la de Mi dieta (spec 059).
- Mandar la lista de material marcado al proxy y meterlo en el prompt de
  `api/tabla.js`.
- Cruce armario/ejercicio en el navegador, al pintar un ejercicio del
  catálogo — misma lógica de partir en piezas y cruzar que la despensa
  (spec 059/072), reutilizando lo que se pueda de `js/despensa.js`.
- Marca por pieza y resumen "Tienes N de M" en el **Catálogo** (Ejercicio →
  Catálogo), que es el único sitio de la app donde hoy se abre un ejercicio
  y se leen sus datos completos.
- Que la IA devuelva el material de un ejercicio propuesto como una lista
  de piezas (cambio de esquema en `api/tabla.js`), no como una frase.
- Partir en piezas, al vuelo y sin tocar Firestore, el material de un
  ejercicio ya guardado con el formato antiguo (frase libre).

### NO entra (explícitamente fuera)

- **La lista de lo que te falta**, juntando el material de toda la tabla de
  la semana. Es la spec 078, como la lista de la compra fue aparte de la
  059.
- **Marcas dentro de Mi tabla** (al ver la sesión de un día). Decisión del
  usuario, 2026-09-01: solo en el Catálogo, igual que la 059 antes de que
  la 060 abriera la receta desde la dieta. Si algún día se quiere, es una
  spec propia.
- **Migrar en Firestore** el material de los ejercicios ya guardados a
  formato de lista. Se parten al vuelo, como hace la despensa con las
  líneas de receta sin estructurar (spec 082 dejó convivir los dos
  formatos, y aquí se hace lo mismo pero sin llegar a tener un formato
  "estructurado con id": ver sección 5).
- **Que la conversación o la revisión sepan del armario.** Solo la tabla,
  igual que solo la dieta sabe de la despensa.
- **Descontar del armario nada por usarlo.** El armario no lleva cantidades
  ni caducidades, y esto no lo cambia.
- **Cantidades de material** ("dos mancuernas de 8 kg"). Sigue siendo
  "mancuernas", como decidió la 074.

## 4. Comportamiento detallado

### La casilla, al pedir tabla

Junto al campo de instrucciones que ya existe (spec 027/040), mismo patrón
que la de Mi dieta: etiqueta **"Aprovechar mi material"**, y debajo,
pequeño, "N piezas marcadas".

- No se enseña con el armario vacío, ni si no hay ninguna pieza marcada.
- No se recuerda entre peticiones, igual que la de la dieta (059): una
  casilla recordada acaba condicionando una tabla sin que sepas por qué.

### Lo que se le manda a la IA

Solo con la casilla marcada, y solo las piezas con `tengo: true`, como una
lista de nombres. El prompt de `api/tabla.js` ya dice "adapta lo que
propongas al material que tenga" de forma genérica (sección de
`INSTRUCCIONES`); esta spec le añade la lista real cuando la hay, en el
**mensaje de la petición**, no en `INSTRUCCIONES` (que es fija y compartida
por todos los usuarios) — mismo criterio que la 059.

**Tope de 80 piezas en el prompt**, mismo motivo y mismo número que la 059
(lección del 413 de Groq, spec 049).

### El material, de frase a lista de piezas

- **Lo que devuelve la IA** (`api/tabla.js`, el campo `material` de cada
  ejercicio en `ejercicios`): pasa de `{ type: "STRING" }` a
  `{ type: "ARRAY", items: { type: "STRING" } }`, con el prompt pidiendo
  explícitamente una lista de piezas sueltas ("mancuernas", "banco"), lista
  vacía si no hace falta ninguna — en vez del texto "ninguno" que se pide
  hoy.
- **Lo que guarda el catálogo** (`usuarios/{uid}/ejerciciosCatalogo`, campo
  `material`): pasa a guardarse como lista de strings, tanto si viene de la
  IA como si lo escribe el usuario a mano.
- **El formulario manual** ("Nuevo ejercicio" en el Catálogo) sigue siendo
  un único campo de texto (no se convierte en líneas repetibles al estilo
  de la 082: aquí no hace falta cantidad ni preparación, solo nombres). Al
  guardar, el texto se parte en piezas con **la función que ya existe para
  esto**: `partesDeLinea()` de `js/despensa.js` (línea ~410), que ya parte
  por comas y por "y"/"e" — no se escribe una nueva. **Ojo con un caso de
  esa función**: con una entrada vacía, `partesDeLinea("")` devuelve `[""]`
  (una lista de un elemento vacío), no `[]` — es su comportamiento normal
  para una línea de receta, donde una línea siempre existe. Aquí hay que
  aplicar un `.filter(Boolean)` extra después de llamarla, para que un
  campo de material vacío guarde `material: []` y no `material: [""]`.
- **Un ejercicio guardado antes de esta spec** trae `material` como string.
  Al leerlo, si no es una lista, se parte al vuelo con `partesDeLinea()` y
  se trata como si ya fuera una lista, sin reescribir nada en Firestore. Se
  escribe ya como lista la próxima vez que ese ejercicio se guarde (editado
  a mano, o vuelto a proponer por la IA).
- **`validarEjercicioCatalogo()` siempre devuelve una lista limpia**: tanto
  si la entrada es un array (de la IA) como si es un string partido a
  mano, se recorta cada pieza y se descartan las vacías; los duplicados
  **no** se deduplican (una pieza repetida dos veces no rompe nada y no
  merece la complicación de detectarla aquí).
- **Dos sitios ya existentes pintan `ejercicio.material` como texto plano y
  se romperían con el array tal cual** (encontrado por `revisor-specs`):
  - `js/app.js` (~línea 4209), la cabecera plegada de la tarjeta del
    Catálogo: hoy hace `ejercicio.material || "sin material"`. Con un
    array, `[] || "sin material"` **no cae al fallback** (un array vacío
    es *truthy*), y un array con piezas se pintaría unido sin espacios
    (`"mancuernas,banco"`, por `toString()` implícito). Pasa a usar una
    función nueva y pequeña, `materialLegible(ejercicio)`, que hace
    `ejercicio.material.length ? ejercicio.material.join(", ") : "sin
    material"`.
  - `js/app.js` (~línea 4238), la precarga de `catalogo-material` al
    editar: `id("catalogo-material").value = ejercicio.material || ""`
    tiene el mismo problema. Pasa a `ejercicio.material.join(", ")`.
  **`materialLegible()` da por hecho que `ejercicio.material` ya es un
  array** (normalizado al leer, ver "Un ejercicio guardado antes de esta
  spec" más arriba): no vuelve a comprobar si es string. Quien la llame
  tiene que hacerlo sobre un ejercicio ya pasado por esa normalización de
  lectura, nunca sobre el dato crudo de Firestore.
  Ambos sitios estaban fuera de la primera versión de esta spec; quedan
  añadidos aquí y en la sección 7.

### El cruce, al pintar un ejercicio del catálogo

Al abrir un ejercicio se compara cada pieza de su material con el armario,
pieza por pieza (no por línea completa, como hacía la despensa con una
línea de receta: aquí cada pieza ya es un elemento de la lista, no hace
falta la regla de límites de palabra). La comparación usa la normalización
ya existente (`normalizar()`/`mismoIngrediente()` de `js/despensa.js`,
reutilizada tal cual desde la 074): minúsculas, sin tildes, singular y
plural.

### Cómo se ve

- La pieza que tienes: marca de "la tienes" al principio.
- La que falta: sin marca, en tono apagado.
- Encima: "Tienes 2 de 3".
- Nunca se esconde ninguna pieza.
- Con el armario vacío, sin marcas ni resumen: como hoy.
- Solo en el Catálogo (Ejercicio → Catálogo).

## 5. Modelo de datos

`usuarios/{uid}/ejerciciosCatalogo/{id}`, campo `material`:

- Antes: `string` (frase libre, "mancuernas y banco").
- Ahora: `string[]` (lista de piezas, `["mancuernas", "banco"]`, `[]` si no
  hace falta ninguna).

Sin migración de Firestore: `validarEjercicioCatalogo()` (js/ejercicios-
catalogo.js) acepta las dos formas a la entrada (string o array) y siempre
devuelve una lista; quien lea un ejercicio con `material` todavía en string
(uno viejo, sin editar desde esta spec) lo parte al vuelo con la misma
función. Es el mismo patrón que la spec 082 usó con los ingredientes de
receta, simplificado porque aquí no hay id, cantidad ni preparación que
enlazar: una pieza de material es solo su nombre, comparado por texto
contra el armario, igual que hacía la despensa antes de la 082.

`api/tabla.js`: el cuerpo de la petición acepta un campo nuevo `material`,
lista de strings. Ausente o vacía = se comporta como hoy. El esquema de
`ejercicios[].material` cambia de `STRING` a `ARRAY` de `STRING` (ver
sección 4).

No toca `firestore.rules`: no hay colección nueva ni cambia la forma del
documento de forma que afecte a las reglas.

## 6. Casos límite

- **Armario vacío**: no hay casilla al pedir tabla, no se manda nada, y los
  ejercicios se ven como hoy. Estado de cualquier usuario hasta que use la
  074.
- **Armario con piezas pero todo desmarcado**: la casilla tampoco se
  enseña, pero los ejercicios sí se marcan ("Tienes 0 de 3", todo apagado).
  Mismos dos estados distintos que decidió la 059.
- **Más de 80 piezas**: se recorta y se avisa a la IA, como la 059.
- **La IA ignora el armario**: no es un error, no se reintenta — igual que
  la 059.
- **Ejercicio sin material** (uno editado a mano hasta vaciarlo, o de
  peso corporal): sin marcas ni resumen, no revienta. `material: []`. En
  la cabecera del Catálogo y al editar, se lee "sin material" (ver
  `materialLegible()` en la sección 4), no una celda vacía.
- **Pieza de armario muy corta** ("banco") cruzada contra una frase con una
  palabra parecida: mismo filo que ya resolvió la despensa: aquí se cruza
  pieza contra pieza normalizada, no una pieza dentro de una frase larga,
  así que el riesgo de "sal acierta en salmón" no aplica igual — una pieza
  de material es corta por naturaleza (2-3 palabras como mucho). Si al
  implementar aparece un caso real de falso positivo, se añade un test.
- **El texto manual del formulario "Nuevo ejercicio" no lleva ninguna coma
  ni "y"/"e"** ("banco"): se guarda como una lista de una pieza.
- **El recuento "N piezas marcadas" no se actualiza en vivo** al pedir
  tabla: se lee al entrar en Mi tabla, igual que el de la dieta (059). El
  número puede ir retrasado; lo que se manda al pedir, nunca.
- **Sin conexión al pedir la tabla**: el error de siempre.

## 7. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/ejercicios-catalogo.js` | `validarEjercicioCatalogo()`: `material` pasa a lista, aceptando string o array a la entrada; usa `partesDeLinea()` de `js/despensa.js` para partir un string, recorta y descarta vacíos. |
| `js/despensa.js` | Reutilizar `normalizar()`/`mismoIngrediente()`/`partesDeLinea()` tal cual. Sin cambios. |
| `js/material.js` | Sin cambios de fondo; puede necesitar una función de cruce si no se reutiliza directo la de la despensa. |
| `js/tablas.js` | `guardarEjerciciosPropuestos()`: pasar `propuesta.material` (ya lista) tal cual. Pasar `material` (piezas marcadas) en la petición al proxy. |
| `js/app.js` | Casilla al pedir tabla (leer, mandar, recuento); pintar marcas y resumen en el Catálogo; el formulario "Nuevo ejercicio" parte el texto en piezas al guardar; **`materialLegible()` nueva**, y arreglar los dos sitios que hoy leen `ejercicio.material` como texto (línea ~4209, cabecera de la tarjeta del Catálogo; línea ~4238, precarga del campo al editar). |
| `api/tabla.js` | Esquema `ejercicios[].material` de STRING a ARRAY de STRING; prompt pidiendo piezas sueltas en vez de "ninguno"; aceptar `material` en el cuerpo de la petición y meterlo en el prompt, recortado a 80. |
| `index.html` | Casilla y recuento en Mi tabla. El campo `catalogo-material` puede cambiar su `placeholder`/texto de ayuda para pedir piezas separadas por comas. |
| `styles.css` | Reutilizar las clases de marca/resumen de la despensa/recetario si valen; lo mínimo si no. |

**Aviso de tamaño (regla 4 de `CLAUDE.md`):** el alcance real —casilla y
envío al proxy, cambio de esquema en `api/tabla.js`, partido de frase a
piezas con compatibilidad hacia atrás, cruce nuevo, marcas y resumen en el
Catálogo— tiene la misma superficie que la 074 (521 líneas) y la 059 (que
también avisó). Se acepta de antemano implementarla en una sola spec,
mismo criterio que decidió el usuario en la 074: parar y avisar si se pasa
claramente de las 600 líneas, no antes.

## 8. Decisiones tomadas

- **Las marcas solo se ven en el Catálogo**, no dentro de Mi tabla.
  Decisión del usuario, 2026-09-01: espejo de cómo empezó la 059 antes de
  que la 060 (ver receta desde la dieta) naciera como spec aparte. Si se
  quiere ver desde Mi tabla, es una spec propia.
- **El material se parte en piezas por comas Y por "y"/"e"**, no solo por
  comas. Decisión del usuario, 2026-09-01: mismo criterio que corrigió la
  059 con "sal y pimienta" en la despensa.
- **El cambio de esquema de la IA (material como lista) entra en esta
  spec**, no se deja para la 078. Decisión del usuario, 2026-09-01: sin
  ello, todo el material nuevo seguiría entrando como frase y el partido al
  vuelo sería la única vía, para siempre, incluso para lo nuevo.
- **El formulario manual de "Nuevo ejercicio" no se convierte en líneas
  repetibles** (al estilo de la 082): sigue siendo un único campo de texto,
  partido en piezas al guardar. Decisión de alcance: aquí no hay cantidad
  ni preparación que enlazar, así que la complejidad de la 082 no aporta
  nada.
- **Se acepta de antemano superar las ~300 líneas**, con el mismo criterio
  que la 074: parar solo si se dispara claramente por encima de las 600.
- **Se reutiliza `partesDeLinea()` de `js/despensa.js`** en vez de escribir
  una función nueva para partir el material en piezas. Encontrado por
  `revisor-specs`: ya existe con exactamente esa regla, y duplicarla
  repetiría el error que la propia spec 074 se advirtió a sí misma de no
  cometer.
  Decisión del usuario, 2026-09-01.

## 9. Fuera de spec: ideas apuntadas

- Ver las marcas de material también dentro de Mi tabla, al abrir la
  sesión de un día — descartado a propósito para esta spec.
- Un test automático del cruce de material, si aparece un caso real de
  falso positivo (ver casos límite).

## ✅ Para probar a mano

*(lo rellena/afina el agente `qa-manual` antes de la prueba, siguiendo el
criterio de la sección 2 — caso concreto acordado: pedir tabla con la
casilla "Aprovechar mi material" marcada, y por separado, abrir un
ejercicio del Catálogo y comprobar "Tienes N de M")*
