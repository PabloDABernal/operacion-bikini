# 088 — Varias recetas o ingredientes por comida

- **Estado:** revisada — `revisor-specs` sin bloqueantes tras tres rondas
- **Fecha:** 2026-09-01
- **Referencia en PRODUCTO.md:** apartado "Qué hará (evolutivos de la fase productiva, desde el 31 de agosto de 2026)", entrada "Una comida puede tener varias recetas o ingredientes sueltos"

## 1. Objetivo

En **Mi dieta** (la semana de menús, `usuarios/{uid}/dietas/{dietaId}`), una
celda de un día/momento puede enlazar a **varias** recetas y/o varios
ingredientes sueltos de la despensa, no solo a una receta como hoy. El texto
del plato pasa a ser la suma de sus nombres, y desde el día se puede abrir
cada receta/ingrediente enlazado, no solo el primero.

**Esta spec NO toca el diario de comidas ya apuntadas** (spec 084, con su
propio `ingredienteId`): eso sigue exactamente igual, sin editor de enlace
tras apuntar. Es un modelo de datos distinto y una decisión de alcance
aparte, tomada por el usuario al escribir esta spec.

## 2. Criterio de "esto funciona"

1. En Mi dieta, abres el lápiz de edición de una celda que hoy solo tiene una
   receta enlazada y texto con dos platos (el caso real: "Crema de
   zanahoria. 1 hamburguesa de ternera", con la hamburguesa enlazada y la
   crema sin enlazar). El editor de la celda muestra una línea con la receta
   ya enlazada y un botón "Añadir otra".
2. Pulsas "Añadir otra", eliges la receta de la crema en el desplegable
   nuevo, y guardas.
3. El texto de la celda pasa a ser la suma de los nombres de ambas recetas,
   unidos con ". " ("Crema de zanahoria. Hamburguesa de ternera"),
   sustituyendo lo que hubiera escrito antes de guardar — pero el campo de
   texto sigue siendo editable a mano por encima de esa propuesta, igual que
   hoy rellena el nombre de una sola receta.
4. En la fila de Mi dieta, la celda muestra un solo icono de "ver receta".
   Al tocarlo, en vez de abrir directamente la ficha de una receta (como
   hoy con una sola), se despliega una lista con los nombres de las dos
   recetas; tocando cada una abre su ficha, igual que hoy.
5. Repites añadiendo, en vez de una segunda receta, un ingrediente suelto de
   la despensa (p. ej. "Yogur natural", esté marcado o no): el desplegable
   de "añadir otra" deja elegir entre receta o ingrediente, el texto suma
   también su nombre, y el desplegable de "ver" lo lista junto a las
   recetas — tocarlo enseña una ficha mínima con su nombre y si lo tienes
   marcado en la despensa ahora mismo o no (ficha nueva, ver sección 4).
6. Marcas "me lo he comido" en una celda con dos recetas: se apunta en el
   diario un solo registro con el texto sumado, igual que hoy con una
   receta (el registro del diario NO lleva el enlace; ver sección 3).
7. Abres una celda que no ha sido tocada desde antes de esta spec (formato
   antiguo, `recetaId` en vez de `enlaces`): se ve y se edita exactamente
   igual que las nuevas, sin ningún error ni aviso. Al guardarla, queda ya
   en el formato nuevo.
8. En Comidas → Despensa → lista de la compra, un ingrediente suelto
   enlazado a una celda de Mi dieta y que NO tienes marcado sale en la
   lista de lo que falta, igual que un ingrediente de una receta.
9. Una celda enlazada SOLO a un ingrediente suelto (sin ninguna receta) NO
   aparece en el aviso "estas comidas no tienen receta, no se sabe qué
   llevan": ya se sabe qué es, es justo el ingrediente enlazado.

## 3. Alcance

### Entra
- El editor de una celda de Mi dieta (`filaEnEdicion()` en `js/app.js`, el
  que se abre con el lápiz): pasa de un único `<select>` de receta a una
  lista de líneas, cada una una receta del Recetario **o** un ingrediente
  de la despensa (selector con las dos opciones), con un botón "Añadir
  otra" y una forma de quitar una línea. Sin límite de líneas.
- El desplegable de ingredientes muestra **todos** los de la despensa, estén
  marcados o no (a diferencia de la spec 084, que solo mostraba los
  marcados): aquí no se está afirmando "lo tengo ahora", solo qué plato es.
- El texto de la celda se recalcula como la suma de los nombres elegidos,
  unidos con ". ", cada vez que cambia la lista de líneas — sigue siendo un
  campo de texto editable a mano por encima de esa propuesta.
- El icono de "ver receta" de la fila (spec 060/072): si la celda tiene una
  sola receta/ingrediente enlazado, se comporta como hoy (abre directo). Si
  tiene más de una, el icono abre un desplegable con los nombres, cada uno
  llevando a su ficha.
- "Me lo he comido" (`apuntarDeLaDieta()`) sigue apuntando en el diario un
  registro con el texto de la celda tal cual, sin cambios: no propaga la
  lista de enlaces al diario (decisión de alcance, ver sección 8).
- La generación de la semana (`semanaDesdeLaIa()`, `semanaDesdeMenu()` en
  `js/dietas.js`) pasa a escribir `enlaces` con como mucho un elemento tipo
  `"receta"`, en vez de `recetaId`. El algoritmo de emparejado (por nombre
  exacto o por búsqueda dentro del texto) no cambia: solo cambia la forma
  del campo que se guarda.
- La lista de la compra (`recetasDeLaDieta()`, `comidasSinReceta()` en
  `js/app.js`, y `loQueFalta()` en `js/despensa.js`, spec 073): se adaptan
  a leer `comida.enlaces` en vez de `comida.recetaId`, y a incluir también
  los ingredientes sueltos enlazados directamente (no vía receta) en el
  cálculo de lo que falta — un ingrediente enlazado y no marcado (`tengo:
  false`) entra en la lista igual que uno que falte de una receta. Nueva
  función `ingredientesSueltosDeLaDieta()`, ver sección 4.
  `comidasSinReceta()` cambia de criterio: hoy enseña una comida si NO
  tiene receta enlazada; pasa a enseñarla si NO tiene NINGÚN enlace que
  **resuelva** a algo real (ni receta ni ingrediente) — una celda enlazada
  solo a un ingrediente ya no cuenta como "no sé qué lleva" (criterio de
  aceptación, punto 9), pero una celda cuyo único enlace apunta a una
  receta o ingrediente ya borrado SÍ sigue contando como "sin receta":
  igual que hoy hace `recetaDeLaComida()` (comprueba que la receta exista,
  no solo que haya un id), un enlace roto no dice de verdad qué se come.
- **Migración por lectura, sin script aparte**: `leerDietaActiva()`
  (`js/dietas.js`) normaliza cada comida al leerla — si trae `recetaId`
  (formato antiguo) lo convierte a `enlaces: [{tipo: "receta", id:
  recetaId}]` (o `[]` si estaba vacío) antes de que el resto de la app la
  toque. `recetaId` deja de escribirse desde esta spec; una celda queda en
  el formato nuevo la próxima vez que se guarde (al editarla, o al
  regenerar la semana entera). No hace falta tocar Firestore a mano ni
  ejecutar nada fuera de la app: es una sola colección con un documento
  activo por usuario, y la lectura ya la entiende.

### NO entra (explícitamente fuera)
- El diario de comidas ya apuntadas (`usuarios/{uid}/comidas`, spec 084):
  su `ingredienteId` y su editor de texto libre siguen exactamente igual.
  Decisión del usuario: son datos y pantallas distintos, y tocar los dos a
  la vez no cabe en esta spec.
- Migrar el formato de ingredientes DENTRO de una receta (spec 082, el
  "puñado de repollo" sin estructurar): asunto distinto, anotado en
  `docs/BACKLOG.md`.
- Marcado independiente por receta/ingrediente dentro de una misma celda
  ("me comí la crema pero no la hamburguesa"): se marcan todas juntas, un
  solo registro en el diario.
- Que el registro del diario, al marcar "me lo he comido", lleve también
  los enlaces de la celda (para poder abrir la receta desde el diario más
  tarde): queda fuera. Decisión del usuario.
- Límite al número de recetas/ingredientes por celda: no lo hay.
- Cambiar el algoritmo de emparejado de la IA/menú (076): sigue enlazando
  como mucho una receta por plato; esta spec no le enseña a proponer varias.

## 4. Comportamiento detallado

- **Editor de la celda** (`filaEnEdicion()`): hoy es un `<select>` con
  "Sin receta" + una opción por receta, cuyo valor es `comida.recetaId`.
  Pasa a ser una lista de líneas repetible: cada línea tiene un selector de
  tipo (Receta / Ingrediente de la despensa) y, según el tipo, un
  `<select>` con las recetas o con todos los ingredientes de la despensa.
  Un botón "Añadir otra línea" añade una vacía; cada línea (salvo si es la
  única y está vacía) lleva un botón para quitarla. Al cambiar cualquier
  línea, el campo de texto de la celda se rellena con la suma de los
  nombres separados por ". " — mismo patrón que hoy tiene una sola receta,
  extendido a varias.
- **Icono de "ver receta" de la fila**: si `comida.enlaces.length === 1`,
  comportamiento idéntico a hoy (abre la ficha correspondiente — de
  receta, spec 060, o de ingrediente en despensa). Si `length > 1`, el
  icono abre/cierra un desplegable con un nombre por línea (receta o
  ingrediente), y tocar un nombre abre su ficha debajo, igual que hoy con
  una sola.
- **Ficha de receta enlazada**: sin cambios respecto a como se abre hoy
  (spec 060) — esta spec solo cambia cómo se llega a ella cuando hay más
  de una.
- **Ficha de ingrediente enlazado (nueva)**: no existe hoy ninguna pantalla
  así, porque hasta esta spec una celda de la dieta nunca enlazaba
  directamente a un ingrediente. Es mínima, a propósito: el nombre del
  ingrediente y una línea con su estado actual en la despensa ("Lo
  tienes" / "Te falta", según `tengo` en `usuarios/{uid}/despensa` en
  este momento, no como estaba cuando se enlazó — mismo criterio "en
  vivo" que ya usa la ficha de receta desde la spec 058). Sin botón para
  marcarlo desde aquí: para eso está la Despensa.
- **`loQueFalta()` (`js/despensa.js`), firma nueva**: pasa de
  `loQueFalta(recetas, despensa)` a `loQueFalta(recetas, ingredientesSueltos,
  despensa)`, donde `ingredientesSueltos` es la lista plana de ids de
  ingrediente enlazados directamente (tipo `"ingrediente"`) en cualquier
  celda de la dieta activa, sin repetir — construida por una función nueva
  `ingredientesSueltosDeLaDieta()` en `js/app.js`, hermana de
  `recetasDeLaDieta()`. Dentro de `loQueFalta()`, cada id de
  `ingredientesSueltos` se resuelve contra `despensa` igual que ya hace con
  el `ingredienteId` de una línea de receta estructurada (líneas 442-457):
  si está marcado (`tengo: true`), no falta; si no, entra en el resultado.
  Los dos llamadores (`pintarBotonDeCompra()` y `pintarCompra()` en
  `js/app.js`) pasan `ingredientesSueltosDeLaDieta()` como nuevo segundo
  argumento.

## 5. Modelo de datos

`usuarios/{uid}/dietas/{dietaId}.dias[].comidas[]` — cambia el campo de
enlace de cada comida:

- Antes: `{ momento: string, texto: string, recetaId: string }` (vacío si
  no hay receta enlazada).
- Ahora: `{ momento: string, texto: string, enlaces: { tipo: "receta" |
  "ingrediente", id: string, nombre?: string }[] }` — lista, puede estar
  vacía, puede mezclar tipos, sin límite. `nombre` solo se guarda en los
  enlaces de tipo `"ingrediente"`: es el respaldo para la lista de la
  compra si ese ingrediente se borra de la despensa después (ver sección
  6) — una receta no lo necesita, porque sin ella la comida simplemente
  deja de contar como "con receta".

`leerDietaActiva()` normaliza al vuelo: si una comida trae `recetaId` (y no
`enlaces`), la convierte a `enlaces` antes de devolverla. El resto del
código (`js/app.js`, `js/dietas.js`) solo conoce `enlaces` desde esta spec;
nada vuelve a leer `recetaId` salvo esa normalización de entrada.

## 6. Casos límite

- Una celda sin ningún enlace (texto suelto, la mayoría de los platos de un
  menú de la nutricionista): sigue sin icono de "ver receta", igual que hoy.
- Una receta o ingrediente enlazado que se borró después: igual que hoy con
  un solo enlace (spec 072/060), esa línea del desplegable no debe romper
  la lista — se salta o se enseña como no disponible, sin tocar las demás.
- Añadir la misma receta o el mismo ingrediente dos veces en la misma
  celda: se permite, no se deduplica (igual que un ingrediente puede
  repetirse dentro de una receta, spec 082).
- Vaciar todas las líneas de una celda que tenía enlaces: el texto deja de
  sumarse automáticamente, pero lo que hubiera escrito queda tal cual (no
  se borra el texto al quitar el último enlace).
- Una celda en formato antiguo (`recetaId`) que nunca se llega a editar:
  sigue funcionando para siempre vía la normalización de lectura: no hay
  fecha límite ni obligación de tocarla.
- Un ingrediente enlazado sin marcar (`tengo: false`) en una celda: entra
  en la lista de la compra como "te falta". Si además esa despensa no
  existe (se borró el ingrediente), se trata como en el caso de receta: se
  cuenta igual como que falta.
- Una celda con una receta Y un ingrediente enlazados a la vez: no aparece
  en "comidas sin receta" (ya tiene receta) y su ingrediente sí entra en
  el cálculo de la compra — las dos cosas conviven sin conflicto porque
  son listas independientes, no un único campo excluyente.
- Una celda cuyo único enlace apunta a una receta o ingrediente ya
  borrado: SÍ cuenta como "sin receta" en el aviso de la compra, igual que
  hoy. Decisión del usuario, 2026-09-01, tras la tercera revisión de
  `revisor-specs`: un enlace que no resuelve a nada real no dice qué se
  come.

## 7. Archivos afectados

- `js/dietas.js`: `semanaEnBlanco()`, `semanaDesdeLaIa()`,
  `semanaDesdeMenu()` (escriben `enlaces` en vez de `recetaId`);
  `leerDietaActiva()` (normaliza el formato antiguo al leer).
- `js/app.js`: `filaEnEdicion()` y `guardarCelda()` (editor de varias
  líneas); `recetaDeLaComida()` y el pintado del icono/desplegable de la
  fila (`col-receta`, alrededor de la línea 3538); `recetasDeLaDieta()` y
  `comidasSinReceta()` (lista de la compra, leen `comida.enlaces`).
- `js/despensa.js`: `loQueFalta()`, firma nueva con `ingredientesSueltos`
  (ver sección 4).
- `index.html`: si hace falta algún contenedor nuevo para las líneas
  repetibles del editor de celda.
- `styles.css`: estilos de las líneas repetibles del editor, del
  desplegable de varias recetas/ingredientes bajo el icono, y de la ficha
  mínima de ingrediente — reutilizar patrones existentes (spec 082, líneas
  de ingrediente de receta) en la medida de lo posible.

**Aviso de tamaño (regla 4 de `CLAUDE.md`):** el alcance real —editor
multilínea con selector de tipo, desplegable de varias fichas, cuatro
funciones de `js/dietas.js`, cambio de firma de `loQueFalta()` con función
auxiliar nueva, `comidasSinReceta()` con criterio nuevo, ficha de
ingrediente nueva y CSS— puede rondar o superar las ~300 líneas. Decisión
del usuario, 2026-09-01: se implementa como una sola spec: si al escribir
el código se ve que se dispara claramente por encima de ese margen, se para
ahí mismo y se propone partir en dos antes de seguir, en vez de decidirlo
ahora sobre una estimación.

## 8. Decisiones tomadas

- **Solo Mi dieta, no el diario de comidas apuntadas** (spec 084 queda
  intacta). Decisión del usuario, 2026-09-01, tras la primera revisión de
  `revisor-specs`.
- **Texto final = suma de nombres unidos con ". "**, editable a mano por
  encima. Decisión del usuario, 2026-09-01.
- **"Me lo he comido" marca todas las recetas/ingredientes de la celda a la
  vez**, un solo registro en el diario, sin llevar los enlaces consigo.
  Decisión del usuario, 2026-09-01.
- **Sin límite de recetas/ingredientes por celda.** Decisión del usuario,
  2026-09-01.
- **Un solo icono de "ver receta" por celda, con desplegable si hay
  varias.** Decisión del usuario, 2026-09-01.
- **Sin script de migración**: se normaliza al leer y se reescribe sola al
  guardar, porque es un solo documento por usuario. Decisión del usuario,
  2026-09-01, tras conocer que el modelo de datos real es mucho más simple
  de lo que se pensó al escribir la primera versión de esta spec.
- **El desplegable de ingredientes sueltos para la celda muestra TODOS los
  de la despensa**, no solo los marcados (a diferencia de la spec 084).
  Decisión del usuario, 2026-09-01: aquí no se afirma "lo tengo ahora".
- **Un ingrediente suelto enlazado a Mi dieta SÍ entra en el cálculo de la
  lista de la compra** si no está marcado. Decisión del usuario, 2026-09-01.
- **La migración de ingredientes DENTRO de una receta (formato de la spec
  082) queda fuera de esta spec** y anotada en `docs/BACKLOG.md`. Decisión
  del usuario, 2026-09-01.
- **La ficha de un ingrediente enlazado es mínima**: nombre y si lo tienes
  ahora mismo o no, sin más. Decisión del usuario, 2026-09-01.
- **Una celda enlazada solo a un ingrediente ya no cuenta como "sin
  receta"** en el aviso de la lista de la compra. Decisión del usuario,
  2026-09-01 (corrige una contradicción que encontró `revisor-specs`).
- **Se implementa como una sola spec, con aviso de tamaño en vez de partir
  de antemano**: si al codificar se dispara claramente por encima de las
  ~300 líneas, se para y se propone partir en ese momento. Decisión del
  usuario, 2026-09-01.
- **Un enlace roto (receta/ingrediente borrado) sigue contando como "sin
  receta"** en el aviso de la compra, igual que hoy. Decisión del usuario,
  2026-09-01.

## 9. Fuera de spec: ideas apuntadas

- Migrar el formato de ingredientes de las recetas antiguas al estructurado
  de la spec 082 → `docs/BACKLOG.md`.
- Que el diario de comidas apuntadas también permita enlazar varias
  recetas/ingredientes, o editar el enlace tras apuntar (reabriría la
  exclusión de la spec 084) → no anotado como idea firme, el usuario lo
  descartó explícitamente para esta spec; si se quiere en el futuro, es una
  spec propia.

## ✅ Para probar a mano

Prepárate una comida con dos platos y solo uno enlazado (el caso real de la
captura: "Crema de zanahoria. 1 hamburguesa de ternera", con la hamburguesa
enlazada) — si no tienes una a mano, edita cualquier celda para dejarla así.

**Camino feliz — varias recetas/ingredientes en una celda**

1. En Comidas → Mi dieta, pulsa el lápiz de esa celda. Debe verse una línea
   con "Hamburguesa de ternera" ya enlazada y un botón "Añadir otra línea".
2. Pulsa "Añadir otra línea", cambia el tipo a "Ingrediente de la despensa"
   y elige "Crema de zanahoria" (esté marcada o no en tu despensa).
3. Guarda. El texto de la celda debe pasar a "Crema de zanahoria.
   Hamburguesa de ternera" (sustituyendo lo que hubiera antes).
4. Vuelve a abrir el lápiz: deben verse las dos líneas guardadas.
5. Borra el texto a mano y escribe otra cosa, sin tocar las líneas; guarda.
   Debe quedarse con lo que escribiste, no con la suma.
6. En la fila, el icono de "ver receta" debe seguir estando. Tócalo: debe
   desplegar una lista con los dos nombres, no abrir directo.
7. Toca "Crema de zanahoria" en esa lista: debe abrir una ficha mínima con
   su nombre y "Lo tienes."/"Te falta." según tu despensa ahora mismo.
8. Toca "Hamburguesa de ternera": debe abrir la ficha de receta de siempre
   (ingredientes, preparación, botón Editar).
9. Pulsa "Me lo he comido" en esa celda. En el diario de Comidas debe salir
   **un solo registro** con el texto sumado, no dos.

**Casos límite**

10. Una celda con una sola receta o ingrediente enlazado: el icono debe
    seguir abriendo la ficha directamente, sin lista intermedia (no debe
    haber cambiado respecto a como funcionaba antes).
11. Añade la misma receta dos veces en una celda: debe dejarte, sin avisar
    de duplicado.
12. Quita todas las líneas del editor de una celda con enlaces y guarda sin
    tocar el texto: el texto que hubiera se queda tal cual, y desaparece el
    icono de "ver receta".
13. Abre (sin editar) una comida que ya tuvieras guardada de antes de esta
    sesión: debe verse y editarse exactamente igual que una nueva, sin
    errores. Guárdala (aunque sea sin cambios) y confirma que sigue
    funcionando después.
14. Enlaza un ingrediente suelto de la despensa que tengas SIN marcar a una
    celda de Mi dieta. Ve a Comidas → Despensa → lista de la compra: ese
    ingrediente debe salir en "lo que falta", aunque no venga de ninguna
    receta.
15. Esa misma celda (solo con el ingrediente suelto, sin receta) NO debe
    aparecer en el aviso "estas comidas no tienen receta" de la lista de la
    compra — sí se sabe qué es.
16. Borra desde el Recetario una receta que esté enlazada a una celda con
    más de un enlace. Al abrir el icono de esa celda, la lista debe seguir
    mostrando el resto de nombres sin romperse; la receta borrada no debe
    quedar tocable.

**Regresión** (que nada de lo anterior se haya roto)

17. Una comida sin ningún enlace (texto suelto de siempre) sigue sin icono
    de "ver receta".
18. Pedir dieta a la IA o elegir uno de los cuatro menús (spec 076) sigue
    enlazando los platos con su receta con normalidad.
19. La lista de la compra sigue contando lo que falta de las recetas de tu
    dieta, igual que antes de esta spec.

Si algo no coincide con lo descrito, anota el paso y qué viste en su lugar
antes de dar la spec por probada.
