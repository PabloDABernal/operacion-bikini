# Estado del proyecto

Documento para retomar el trabajo en frío. Se actualiza al terminar cada spec.

**Última actualización:** 2 de septiembre de 2026. **Specs 001 a 088 escritas y sin ningún hueco.** El 1 de septiembre se cerraron las cinco que arrastraban "desplegada sin probar" (074, 075, 076, 079 y 086) y se hicieron las tres que quedaban declaradas y sin escribir (**077**, **078** y **087**), con lo que se cierra la v13. Luego, del uso salió la **088** (una comida, varias recetas). **Las cuatro —077, 078, 087 y 088— están desplegadas y PENDIENTES de que el usuario las pruebe.**

> **Del 1 al 2 de septiembre de 2026: la 088, que sí salió del uso.** El usuario
> vio en su cena —"Ensalada de repollo y manzana. Tortilla de 2 huevos"— que
> solo salía una receta, y preguntó si eso no se iba a cambiar. **No: nunca se
> especificó.** Una comida guarda UN `recetaId` desde la spec 028, y la 076 vio
> el caso —dejó escrito que los platos del papel son "una frase entera con
> cantidades y a veces dos cosas"— y lo aceptó.
>
> **El punto ciego era peor que lo que se veía**: los huevos de la tortilla no
> llegaban a la lista de la compra, y el aviso de "estas comidas no tienen
> receta y no sé qué llevan" **se callaba**, porque esa comida sí tenía una.
>
> **`recetaId` pasa a `recetaIds`, y NO se migra nada.** `idsDeRecetaDe()` en
> `js/dietas.js` es el único sitio del proyecto que sabe que existen las dos
> formas; una dieta vieja se pasa sola a la nueva en cuanto se guarda cualquiera
> de sus celdas. Campo nuevo y no el viejo convertido en lista, por lo mismo que
> se decidió esa misma tarde en la 077: un campo con dos tipos posibles obliga a
> comprobar el tipo en todos los lectores, para siempre.
>
> **Se avisó de que se pasaba de las 300 líneas y el usuario decidió hacerla
> entera**, en vez de partirla en 088 (el modelo) + 089 (el editor con chips).
> Salió en **251**, así que la estimación era pesimista. Queda anotado porque la
> regla 4 de `CLAUDE.md` dice avisar y proponer partir, y se hizo.
>
> **Dos cosas que cazaron las herramientas y no la lectura:**
>
> 1. **`revisor-specs`**: la suite `075-siembra-casos.mjs` comprueba `recetaId`
>    en cuatro aserciones y se habría roto entera y en silencio. Y
>    `filaDeComida()` era un lector que la spec no cubría — el icono de "ver la
>    receta" se habría pintado siempre, porque una lista vacía es *truthy*.
> 2. **La suite nueva**: el algoritmo de no-solapamiento que la propia spec
>    dejaba escrito estaba mal. Usaba `indexOf`, que mira solo la PRIMERA
>    aparición, así que una receta cuya primera aparición estuviera pisada se
>    descartaba aunque más adelante tuviera hueco libre. Corregido en el código
>    y en la spec.
>
> **Nueve suites de pruebas**, todas en verde. Reglas de Firestore sin tocar.

> **Sesión del 1 de septiembre de 2026, por la tarde: las tres últimas specs.**
> El usuario pidió cerrar la deuda entera —"no quiero tener debes"— y se
> escribieron, revisaron e implementaron las tres que quedaban declaradas en
> `PRODUCTO.md` y sin escribir. Con la 077 y la 078 **se cierra la v13**, que
> llevaba a medias desde el 30 de agosto.
>
> | Spec | Qué | Dónde mirar |
> |---|---|---|
> | **077** | La tabla aprovecha tu material | Ejercicio → Pedir tabla, y Catálogo |
> | **078** | El material que te falta | Ejercicio → Material, abajo |
> | **087** | Cuánto llevas andado | Ejercicio → Apuntar, abajo |
>
> **Se avisó de que estas tres no eran un compromiso** —este documento y
> `PRODUCTO.md` decían que se escribían solo si al usar la app se echaban de
> menos— y el usuario decidió hacerlas igual. Queda anotado por si alguna
> resulta no usarse: no salieron del uso, salieron de cerrar la lista.
>
> **Tres decisiones de producto que tomó el usuario** al escribirlas:
>
> 1. **La casilla "aprovechar el material" se enseña DESACTIVADA** con el
>    armario vacío, no escondida. Se aparta a propósito de la spec 059, que
>    esconde la de la despensa, y sigue a la 084. El motivo: el armario no se
>    descubre solo, y una casilla gris que dice dónde llenarlo lo enseña.
> 2. **Lo que te falta se marca desde su propia lista**, sin ir al armario.
> 3. **Los kilómetros van en Ejercicio**, no en Peso → Estadísticas, y **sin
>    gráfica**: la de peso es SVG a mano y habría sido más código que todo lo
>    demás junto.
>
> **Un bloqueante de producto, encontrado por `revisor-specs` y corregido en
> `PRODUCTO.md`.** El apartado de la v13 decía a la vez que la IA devolviera el
> material "ya en piezas" (un cambio de esquema) y que se partiera por comas al
> vuelo "sin tocar lo que hay en Firestore" (lo contrario). El usuario eligió
> **partir al leer**: mismo resultado en pantalla, sin dejar el campo `material`
> con dos tipos posibles en Firestore para siempre. La frase está corregida, con
> su nota al lado.
>
> **Las tres pasaron `revisor-codigo` con CUMPLE y sin hallazgos.**
>
> **Las suites de pruebas pasan de cuatro a OCHO**, con tres nuevas (077, 078 y
> 087, 47 casos entre las tres). Se ejecutan con `node`:
> `docs/specs/059-cruce-casos.mjs`, `061-agua-casos.mjs`,
> `068-limpieza-casos.mjs`, `075-siembra-casos.mjs`, `077-material-casos.mjs`,
> `078-material-falta-casos.mjs`, `086-distancia-casos.mjs` y
> `087-distancia-estadisticas-casos.mjs`.
>
> **Reglas de Firestore: sin tocar.** Ninguna de las tres estrena colección ni
> campo — todo sale de cruzar al vuelo lo que ya estaba.
>
> **Dos trampas que dejó este tramo:**
>
> 1. **`marcarEnElArmario()` no repinta el armario a propósito** (spec 074, para
>    no mover la fila bajo el dedo). Cualquier bloque nuevo que dependa de lo
>    marcado tiene que repintarse él solo desde ahí, o se queda atrasado. Le pasó
>    a la 078 y lo cazó `revisor-specs`.
> 2. **`obtenerRegistros()` devuelve la lista ENTERA**; `recortarPorDias` solo
>    decide qué se pinta. Da miedo al leerlo por primera vez y es correcto: la
>    gráfica ya tiraba de ahí.

> **Sesión del 1 de septiembre de 2026: limpieza de cierre.** El usuario
> confirmó que ha probado en producción las cinco specs que quedaban desplegadas
> sin probar — **074, 075, 076, 079 y 086** — y las dio por cerradas. Con eso
> **no queda absolutamente nada desplegado y sin validar**, que era el único
> frente abierto del proyecto.
>
> **Lo que se limpió:**
>
> - Las cinco specs pasan a `✅ completada … probada por el usuario en producción
>   el 1 de septiembre de 2026` en su cabecera.
> - La tabla de specs de este documento estaba **desordenada e incompleta**: le
>   faltaban las filas 077, 078 y 080-085, y las 064-069 aparecían detrás de las
>   074-087. Se reordenó por número y se completó.
> - **`docs/BACKLOG.md` sigue vacío**, y esta vez sí por descuido de nadie: al
>   usar la app estos días no salió ninguna idea que anotar. Es el buzón
>   principal de la fase productiva; si no cae nada, se queda vacío.
>
> **Las cuatro suites de pruebas pasan** (ejecutadas ese día):
> `node docs/specs/059-cruce-casos.mjs`, `061-agua-casos.mjs`,
> `068-limpieza-casos.mjs` y `075-siembra-casos.mjs`.
>
> **Tres decisiones que quedaron validadas al probar** y que ya no hace falta
> vigilar: que una pieza de material nace MARCADA al revés que un ingrediente de
> la despensa (074), que los menús enlazan unos 50 platos de 96 con su receta
> (076), y la transcripción a ojo de los PDF. Si aparece una errata en una
> receta, se corrige en `docs/menus/recetas-transcritas.json` y se regenera con
> `node docs/menus/generar-datos-iniciales.mjs`.
>
> **Lo siguiente sale del uso.** No hay versión en marcha ni spec abierta. Las
> 077 (la tabla aprovecha tu material), 078 (el material que falta) y 087
> (cuánto llevas andado) están declaradas y sin escribir: se escriben solo si al
> usar la app se echan de menos.

> **Traspaso del 31 de agosto de 2026.** Se sigue en remoto desde Claude Code
> web. `main` limpio y sincronizado con `origin/main`.
>
> **Hoy empieza la operación bikini de verdad.** La app pasa a usarse a diario y
> el trabajo entra por lo que el usuario se encuentre, no por una lista de
> versiones. Lo de abajo, sobre cómo se trabaja en fase productiva, sigue en pie.
>
> **Arreglo del mismo día: la entrevista de bienvenida tardaba más de los 55 s
> que espera el navegador** ("La IA está tardando demasiado"), justo al intentar
> empezar la primera operación. La causa: `llamarAGemini()` en `api/_ia.js`
> forzaba siempre `maxOutputTokens: 8192` sin importar lo que pidiera quien
> llamaba, y con ese margen tan amplio `gemini-flash-latest` (que no admite
> desactivar su razonamiento, ver más abajo) puede "pensar" más de la cuenta
> antes de responder. Se cambió para que respete el `maxOutputTokens` que
> mande la llamada, y `api/consulta.js` pide ahora 2048 en vez de los 8192 por
> defecto: le sobra de margen para el cierre (200 palabras) y los campos
> cortos, y acota cuánto puede tardar. `api/dieta.js`, `api/tabla.js` y
> `api/analisis.js` siguen con el margen de 8192, que sí necesitan. **Desplegado
> a `main` y confirmado por el usuario en producción: la entrevista ya no da
> timeout.**
>
> **Primeros dos evolutivos de la fase productiva, cerrados hoy mismo: specs
> 080 y 081.** Al usar la app de verdad, el usuario notó que el nombre de un
> plato/receta/ejercicio/sesión largo se cortaba con puntos suspensivos sin
> forma de verlo entero salvo entrando en modo edición. Se creó una spec
> (080), `revisor-specs` encontró un bloqueante técnico (el Recetario y el
> Catálogo de ejercicios anidaban el nombre dentro de un `<button>` que ya
> hacía otra cosa, HTML inválido), y se partió en dos: **080** (Mi dieta, Mi
> tabla, Histórico — sin conflicto) y **081** (Recetario y Catálogo, con la
> cabecera pasada de `<button>` a `<div role="button">`). Las dos,
> implementadas, revisadas por `revisor-codigo` sin hallazgos, y confirmadas
> por el usuario en producción. Nuevo patrón reutilizable en `js/app.js`:
> `celdaDesplegable()` y `cabeceraDesplegable()`.
>
> **OJO CON TRABAJAR EN DOS SITIOS A LA VEZ.** El 31 de agosto se hicieron las
> specs 080-085 desde Claude Code web y, a la vez, la de la distancia desde el
> PC. Las dos ramas cogieron el número 080 y el push del PC salió rechazado. Se
> resolvió sin perder nada —la del PC pasó a ser la **086**—, pero la forma de
> evitarlo es **`git pull` antes de empezar**, no al ir a subir.

> **Cuatro specs más, cerradas el mismo día: 082, 083, 084 y 085.** El
> usuario pidió, de una vez, cuatro cambios relacionados en Comidas: que los
> ingredientes de una receta fueran estructurados (ingrediente enlazado a la
> despensa + cantidad + preparación aparte, en vez de una línea de texto
> libre), poder editar la receta desde el día en que sale en Mi dieta,
> apuntar una comida con un ingrediente suelto de la despensa sin tener que
> montar una receta de uno solo, y fundir Recetas+Despensa en un único
> "Recetario" con interruptor interno (esta última se adelantó por
> urgencia, antes que la 084). Se hicieron cuatro specs en el orden acordado
> con el usuario — **082** (ingredientes estructurados, la base: tres
> rondas de `revisor-specs`, cuatro bloqueantes cerrados — el más
> importante, `llenarDespensaDesde()` rompía con líneas estructuradas y
> otros dos llamadores de `validarReceta()`/`receta.ingredientes` que no se
> habían visto a la primera), **083** (editar desde el día: cuatro rondas,
> tres bloqueantes — la variable de "volver a Mi dieta" tenía que
> distinguir "no puesto" de "vista de semana entera", y también apagarse
> ante las acciones disruptivas de Ajustes que refrescan todo), **085**
> (fusión visual del Recetario: un bloqueante, el reordenado de la despensa
> al entrar colgaba de un hook que la fusión eliminaba) y **084** (apuntar
> con ingrediente suelto: un bloqueante, qué hacer con la despensa sin
> ningún ingrediente marcado). Las cuatro implementadas, revisadas por
> `revisor-codigo` sin hallazgos, y confirmadas por el usuario en
> producción. Patrón nuevo reutilizable: `.panel-recetario-boton`/
> `.subpestanas-internas` (interruptor de dos paneles dentro de un
> formulario o pantalla), ya usado tres veces (Recetario, y el modo
> Escribir/Elegir de mi despensa al apuntar una comida).
>
> **Cuatro specs quedaron desplegadas y sin probar ese día** — 074 (el
> armario), 075 (las recetas y los ingredientes ya puestos), 076 (elegir menú
> sin la IA) y 079 (Comidas, que se lea), más la 086 (la distancia al apuntar).
> **Las cinco las cerró el usuario el 1 de septiembre**, probadas en producción;
> ver el bloque de arriba.
>
> **Reglas de Firestore publicadas**, incluido el bloque `material`. Las specs
> 075, 076 y 079 no las tocan.

> **Fase productiva desde el 31 de agosto de 2026.** Se acabó construir a
> ciclos. Mañana empieza la operación bikini de verdad y **la app pasa a usarse
> en serio**: a partir de aquí el trabajo entra por lo que el usuario se
> encuentre usándola, no por una lista de versiones planificadas.
>
> **Qué cambia en la forma de trabajar:**
>
> - Lo que salga del uso real **sigue pasando por una spec** si toca más de un
>   archivo. La metodología de `CLAUDE.md` no se relaja por ser fase productiva;
>   lo que cambia es de dónde salen las ideas.
> - Un fallo que impida usar la app se arregla y punto, sin spec. Se anota
>   después, en `docs/BACKLOG.md`, para que quede el rastro.
> - `docs/BACKLOG.md` vuelve a ser el buzón principal: es donde caen las cosas
>   que se noten al usarla.
>
> **Lo que quedaba a medias entonces** (la 074 desplegada sin probar, y las
> 077/078 declaradas y sin escribir) **se resolvió el 1 de septiembre**: la 074
> la probó el usuario y quedó cerrada; las 077 y 078 siguen sin escribir, y sin
> compromiso de escribirse.
>
> `main` limpio y sincronizado. Las suites de pruebas en verde. Reglas de
> Firestore publicadas, incluido el bloque `material`.

> **Cierre del 30 de agosto de 2026.** La **spec 073 (la lista de la compra)
> queda cerrada** por decisión del usuario: está implementada, desplegada y con
> las reglas de Firestore publicadas y verificadas con la CLI (`already up to
> date`, re-liberadas). El guion de prueba manual está al final de la propia
> spec por si hace falta repasarlo. Con ella se da por terminada la **v12**.
>
> `main` limpio y sincronizado con `origin/main`. No hay ninguna decisión
> pendiente ni nada a medias. **Lo siguiente son evolutivos nuevos**: se elige
> una idea del apartado "Ideas para más adelante" de `docs/PRODUCTO.md`, se
> decide si es una versión partida en varias specs, y se escribe con
> `/nueva-spec` antes de tocar código.
>
> **Las pruebas automáticas se ejecutan con `node`** y conviene pasarlas si se
> toca el cruce o la despensa:
> `node docs/specs/059-cruce-casos.mjs`, `node docs/specs/061-agua-casos.mjs` y
> `node docs/specs/068-limpieza-casos.mjs`. Las tres pasaban al cerrar la sesión.


> **Traspaso del 27 de agosto de 2026.** Se sigue en remoto desde Claude Code web. Estado al cerrar la sesión del PC: nada a medias, `main` limpio y sincronizado con `origin/main`. No hay spec abierta. **`docs/BACKLOG.md` está vacío a propósito desde hoy**: sus veintidós entradas se repartieron entre `docs/PRODUCTO.md` (apartado "Ideas para más adelante", que es de donde se elige la próxima versión), este documento (las trampas, aquí abajo) y el propio backlog (lo cerrado, para que no vuelva a proponerse). **Lo siguiente son evolutivos nuevos**: se elige una idea de `PRODUCTO.md`, se decide si es una versión partida en varias specs, y se escribe con `/nueva-spec` antes de tocar código. Antes de nada, leer "Cosas que hay que saber antes de tocar nada" de más abajo: las trampas del modelo de IA, la publicación de reglas de Firestore y que se prueba SIEMPRE en producción con push.

## Dónde estamos

**V1 terminada y probada** el 11 de agosto, 20 días antes del plazo. La app está en producción y en uso:

**https://operacion-bikini.vercel.app**

**Las specs 001 a 040 están implementadas, desplegadas y validadas por el usuario.** La app se usa a diario.

La v2 se amplió dos veces sobre la marcha, según el usuario iba probando:

- **v2 original** (11 de agosto): ajustes, gráfica, "Hoy", rediseño, detalle nutricional y gamificación.
- **Ampliación** (13 de agosto, specs 011-020): salió de usar la app con dos meses de datos sembrados.
- **v3** (16 de agosto, specs 021-028): salió de usarla otra vez, ya con todo lo anterior encima.

Todo lo de esas tres fases está cerrado. Desde ahí, el 19 de agosto se empezó a tirar de `docs/BACKLOG.md`: primero limpieza de código muerto, luego la spec 032 (elegir proveedor de IA desde Ajustes) y la 033 (tocar un punto de la gráfica de peso).

El 20 de agosto arrancó la **v4**, que sale de una auditoría de usabilidad hecha sobre el código. No añade funciones: recoloca las que hay. Está descrita en `docs/PRODUCTO.md`, apartado "Qué hará (v4)".

**La v4 está cerrada del todo** (specs 034-038). El 21 de agosto el usuario dijo "te dejo decidir, vamos a limpiar el backlog" — Claude tira de `docs/BACKLOG.md` por su cuenta desde entonces: descartó dos falsas alarmas y completó la **spec 039** (quitar la foto de perfil), **probada y confirmada**. Sigue tirando del backlog salvo que el usuario diga lo contrario.

## Specs

| Spec | Qué es | Estado |
|---|---|---|
| 001 | Login (email y Google) con lista blanca, y pesajes | ✅ completada |
| 002 | Comidas y ejercicio, pantalla en pestañas | ✅ completada |
| 003 | Botón "Consejos" y toda la infraestructura de IA (proxy en Vercel) | ✅ completada |
| 004 | Botón "Pasar consulta": entrevista guiada que genera un plan | ✅ completada |
| 005 | Fotos de progreso con Cloudinary, subida firmada | ✅ completada |
| 006 | Ajustes de usuario y reinicio de datos | ✅ completada |
| 007 | Editar pesajes, comidas y ejercicios ya guardados (incluida la fecha) | ✅ completada |
| 008 | Gráfica de peso con media móvil y objetivo, y comparador semanal | ✅ completada |
| 009 | Rediseño "nocturna deportiva" y navegación inferior | ✅ completada |
| 010 | Pantalla "Hoy" | ✅ completada |
| 011 | Navegación por dispositivo y foto de perfil | ✅ completada |
| 012 | "Hoy" afinada: resumen con +, atajos y calendario por rango | ✅ completada |
| 013 | Listas cortas con filtro por día y comidas frecuentes | ✅ completada |
| 014 | Hora opcional en los registros | ✅ completada |
| 015 | Peso: rango en la gráfica y estadísticas | ✅ completada |
| 016 | "Iniciar operación bikini": entrevista inicial y perfil | ✅ completada |
| 017 | Consultas especializadas de ejercicio y dieta | ✅ completada |
| 018 | Operaciones con principio y fin, e histórico | ✅ completada |
| 019 | Borrar el histórico desde el reinicio de datos | ✅ completada |
| 020 | Groq como proveedor de IA de reserva | ✅ completada |
| 021 | Calendario de constancia a tamaño fijo | ✅ completada |
| 022 | Paleta violeta nocturna | ✅ completada |
| 023 | Una sola conversación: fuera "Consejos" | ✅ completada |
| 024 | Consulta en la barra, Ajustes en el avatar, cada plan en su sección | ✅ completada |
| 025 | Calendario de constancia legible | ✅ completada |
| 026 | Recetario propio | ✅ completada |
| 027 | Dietas y tablas de lunes a domingo, a medida y con cupo propio | ✅ completada |
| 028 | Dietas: la semana de menús, guardada y editable | ✅ completada |
| 029 | Ejercicios y tablas: la semana de entrenamientos, guardada y editable | ✅ completada |
| 030 | Detalle nutricional automático: grupos de alimentos y calorías en rango | ✅ completada |
| 031 | Gamificación: puntos, racha con día de gracia y emblemas | ✅ completada |
| 032 | Elegir el proveedor de IA desde Ajustes (Automático / Groq primero) | ✅ completada |
| 033 | Tocar un punto de la gráfica de peso para ver su fecha y su peso | ✅ completada |
| 034 | La confirmación de guardado, en el propio botón de la semana | ✅ completada |
| 035 | Sub-pestañas en Comidas y Ejercicio, y nombres que dejan de pisarse | ✅ completada |
| 036 | Vista de escritorio en varias columnas | ✅ completada |
| 037 | Comidas integradas, Hoy completo y detalle real en el calendario | ✅ completada |
| 038 | Fotos en la navegación, zonas táctiles y fecha/hora plegable en Ejercicio y Peso | ✅ completada |
| 039 | Quitar la foto de perfil | ✅ completada |
| 040 | Recordar las últimas instrucciones al pedir dieta o tabla | ✅ completada |
| 041 | Ajustes en pestañas (Perfil, Operación, App, Zona de peligro) | ✅ completada |
| 042 | Chips de ejercicios frecuentes, que rellenan el formulario | ✅ completada |
| 043 | Las filas del diario, en dos líneas y con iconos | ✅ completada |
| 044 | Fuera los planes y fuera "Abandonar consulta" (v5) | ✅ completada |
| 045 | La consulta, como revisión de lo hecho desde la anterior (v5) | ✅ completada |
| 046 | La consulta propone dieta o tabla, y tú aceptas (v5) | ✅ completada |
| 047 | La revisión se puede empezar de verdad (arreglo de la v5) | ✅ completada |
| 048 | Los flecos que dejó la v5 (auditoría del 23 de agosto) | ✅ completada |
| 049 | El 413 de Groq y el prompt acotado | ✅ completada |
| 050 | Un solo hilo: ver la conversación y las revisiones juntas (v6) | ✅ completada |
| 051 | Una caja arriba, el hilo del revés, y un solo cupo (v6) | ✅ completada |
| 052 | La entrevista de alta, también en el hilo (v6) | ✅ completada |
| 053 | El histórico fantasma y el archivo mudo | ✅ completada |
| 054 | La caja deja de hablar de más durante una consulta | ✅ completada |
| 055 | La entrevista de bienvenida empieza de cero de verdad | ✅ completada |
| 056 | La casilla "Operaciones" borra también la que está en marcha | ✅ completada |
| 057 | El comité de bienvenida: la ficha de alta (v7) | ✅ completada |
| 058 | La despensa: lo que tienes en casa (v8) | ✅ completada |
| 059 | La dieta aprovecha la despensa (v8) | ✅ completada |
| 060 | Ver la receta desde la dieta (v8) | ✅ completada |
| 061 | El agua del día (v9) | ✅ completada |
| 062 | Las bebidas, apuntadas (v9) | ✅ completada |
| 063 | El acompañamiento de la comida (v9) | ✅ completada |
| 070 | El análisis cuenta bebidas y acompañamientos (v9) | ✅ completada |
| 071 | La IA deja de tirar respuestas buenas (v11) | ✅ completada |
| 072 | La despensa con sensibilidad, y la receta con su icono (v8+) | ✅ completada |
| 073 | La lista de la compra (v12) | ✅ completada |
| 064 | La semana de la dieta, en siete recuadros (v10) | ✅ completada |
| 065 | Iconos en las acciones de fila (v10) | ✅ completada |
| 066 | La barra con iconos, y Ajustes de vuelta (v10) | ✅ completada |
| 067 | La tira de días, también en la tabla (v10) | ✅ completada |
| 068 | La despensa se llena sola, y deja de mentir (v8+) | ✅ completada |
| 069 | Buscar en la despensa (v8+) | ✅ completada |
| 074 | El armario: el material que tienes (v13) | ✅ completada |
| 075 | Las recetas y los ingredientes, ya puestos (v14) | ✅ completada |
| 076 | Elegir menú en vez de pedírselo a la IA (v14) | ✅ completada |
| 077 | La tabla aprovecha tu material (v13) | 🚧 implementada y desplegada, **sin probar** |
| 078 | El material que te falta (v13) | 🚧 implementada y desplegada, **sin probar** |
| 079 | Comidas, que se lea (v15) | ✅ completada |
| 080 | El texto recortado se despliega al tocarlo | ✅ completada |
| 081 | Recetario y Catálogo: el nombre se despliega en la cabecera | ✅ completada |
| 082 | Ingredientes estructurados en la receta | ✅ completada |
| 083 | Editar la receta desde el día | ✅ completada |
| 084 | Apuntar una comida con un ingrediente suelto | ✅ completada |
| 085 | Recetario: un solo apartado con recetas e ingredientes | ✅ completada |
| 086 | La distancia, al apuntar | ✅ completada |
| 087 | Cuánto llevas andado (estadísticas) | 🚧 implementada y desplegada, **sin probar** |
| 088 | Una comida, varias recetas | 🚧 implementada y desplegada, **sin probar** |

## Qué toca ahora

**Probar las cuatro que están desplegadas sin probar**: la **077**, la **078**,
la **087** y la **088**. Es lo único abierto. Están desplegadas, revisadas y con sus suites en
verde, pero **build verde no es probado**: sus guiones están al final de cada
spec.

Después, **usar la app**. Al 1 de septiembre las specs **001 a 087 están
escritas**, sin ningún hueco, y con estas tres **se cierra la v13**, que llevaba
a medias desde el 30 de agosto. **No queda nada declarado y sin escribir.** El
trabajo entra por lo que el usuario se encuentre usándola, y cae primero en
`docs/BACKLOG.md`.

**Las reglas de Firestore del bloque `usuarios/{uid}/material` SÍ están
publicadas**, con la CLI y antes del commit `6c250b3`. Se anota porque no se ve
en el repositorio y la duda cuesta una tarde de perseguir errores de permisos
que parecen bugs. Las specs 077, 078 y 087 **no las tocan**: ninguna estrena
colección ni campo.

### Lo que se cerró entre el 28 y el 30 de agosto

| Versión | Qué |
|---|---|
| **v8** | La despensa (058-060), y su ampliación: se llena sola desde las recetas, con buscador y con sensibilidad para no duplicar (068, 069, 072). |
| **v9** | Lo que bebes y lo que acompaña: el agua (061), las bebidas (062), el acompañamiento (063) y que el análisis los cuente (070). |
| **v10** | La semana en siete recuadros, los iconos de fila y la barra con Ajustes (064-067). |
| **v11** | La IA deja de tirar respuestas buenas (071). |
| **v12** | La lista de la compra (073). |

### Lo siguiente

1. **Probar la 077, la 078, la 087 y la 088.** Lo único abierto. Se han
   acumulado cuatro: si algo falla, hay más sitios donde mirar que de costumbre.
2. Después, **usar la app**: es lo único que genera trabajo ahora. Lo que
   chirríe se anota en `docs/BACKLOG.md`, en una línea.
3. Cuando se junten varias anotaciones que apunten al mismo sitio, **eso será la
   próxima versión**: se escribe con `/nueva-spec` antes de tocar código.

**Elegir.** No hay nada a medias ni ninguna decisión pendiente. Las ideas viven
en `docs/PRODUCTO.md`, apartado "Ideas para más adelante", y `docs/BACKLOG.md`
tiene su buzón con lo que fue saliendo.

Lo que más se ha nombrado sin hacerse:

- ~~**La lista de la compra**~~ **hecha el 30 de agosto**, en la spec 073. Era la
  idea más vieja del proyecto —de la spec 026— y salió en 303 líneas porque el
  cruce (059), la limpieza (068) y el emparejado (072) ya estaban hechos por
  otros motivos.
- **Un tercer proveedor de IA**, si los dos actuales siguen quedándose cortos. La
  071 arregló el fallo que había; si vuelve a fallar, ahora se sabría por qué.
- **La tira de siete días en más sitios**, y el resto del pulido visual de
  `docs/PRODUCTO.md`.

### Tres cosas que este tramo dejó aprendidas

1. **Cuando algo se sale de su sitio, es más barato fijarle el sitio que
   convencer al contenido de que no crezca.** El descuadre de la dieta costó
   cuatro intentos: tres peleando con el texto y uno poniendo una rejilla.
2. **Un `const` no se puede leer antes de su declaración, y eso tumba el módulo
   entero.** La spec 066 dejó la app en "Cargando…" por pintar unos iconos
   demasiado arriba. La decoración va en `try/catch`.
3. **Una prueba automática con la expectativa mal puesta es peor que no tenerla.**
   El caso `"sal y pimienta"` estaba escrito desde el 28 de agosto, dado por
   acierto correcto, y tapó el fallo que el usuario encontró a mano.


## Historia

Lo que fue pasando, sesión a sesión. Lo de arriba es el estado; esto es el camino.

### Historia: la v4

**La v4, empezada el 20 de agosto, está cerrada del todo.** Aquel "rehacer las pantallas de forma más lógica" que el usuario pidió el 16 de agosto salió de una auditoría de usabilidad sobre el código: Comidas y Ejercicio se habían convertido en páginas de cinco y seis bloques que solo se recorren con scroll ciego, y en un monitor la app era una columna de 512 px con dos desiertos a los lados. Se resolvió en cinco specs, con una ampliación el 21 de agosto tras usar la 036 en producción:

| Spec | Qué | Estado |
|---|---|---|
| 034 | La confirmación de guardado, en el propio botón | ✅ completada |
| 035 | Sub-pestañas en Comidas y Ejercicio, y nombres que dejan de pisarse | ✅ completada |
| 036 | Vista de escritorio en varias columnas | ✅ completada |
| 037 | Comidas integradas, Hoy completo y detalle real en el calendario (ampliación de la v4 del 21 de agosto) | ✅ completada |
| 038 | Fotos en la navegación, zonas táctiles y fecha/hora plegable en Ejercicio y Peso | ✅ completada |

### Lo primero al retomar

> **Sesión del 24 de agosto de 2026, en el PC.** El usuario confirmó que había
> probado las specs **046 a 051**: las seis quedan cerradas. Después enseñó dos
> pantallas que no cuadraban y de ahí salió la spec 053.
>
> **Lo que se hizo:**
>
> 1. Specs 046-051 marcadas como completadas, en sus ficheros y aquí.
> 2. **Spec 053** escrita e implementada. Eran dos fallos encadenados: borrar el
>    histórico desde la Zona de peligro no refrescaba `operacionesCargadas`, así
>    que el histórico seguía enseñando una operación ya borrada; y al pulsar
>    "Ver" en ella, `abrirArchivo()` se quedaba mudo porque no tiene estado
>    vacío. Ahora se refresca, y una operación sin registros lo dice.
> 3. **Spec 052** revisada (tenía un bloqueante), corregida e implementada. Con
>    ella la v6 queda cerrada.
>
> 4. **Spec 054**, salida de probar la 052: durante una entrevista o una
>    revisión la caja seguía enseñando el placeholder de charlar y la línea
>    "Te quedan N mensajes hoy", que en la entrevista miente porque no gasta
>    cupo. Ahora la caja va desnuda mientras hay una consulta en curso.
>
> 5. **Spec 055**, el fallo gordo de la tanda. El usuario borró sus datos, hizo
>    la entrevista de bienvenida, contestó solo su nombre y la IA cerró de
>    golpe hablándole de su peso objetivo de antes, de su pádel y de sus
>    mancuernas. No lo inventó: el documento de ajustes sobrevive al borrado
>    por diseño, y `contexto()` en `api/consulta.js` se lo metía en el prompt
>    **también en modo `inicial`**. Tres arreglos: la bienvenida ya no recibe
>    perfil, no puede cerrarse antes de 8 preguntas, y hay casilla nueva en la
>    Zona de peligro para borrar lo que la IA sabe de ti.
>
> 6. **Spec 056**, el segundo agujero del mismo día. Tras la entrevista
>    fantasma, el usuario se quedó con una **operación en marcha vacía**: la
>    casilla "Consultas y planes" se llevó la entrevista que la abrió, pero
>    "Operaciones" solo borraba las archivadas, así que quedó un ciclo sin
>    principio y sin más salida que archivarlo. Ahora "Operaciones" son todas,
>    incluida la que esté en marcha, que se tira sin archivar.
>
> **Todo eso quedó probado y cerrado el 25 de agosto.** Con la 052, la v6 está
> cerrada del todo.
>
> **Lo que toca ahora: la v7, el "comité de bienvenida".** El usuario, al hacer
> la entrevista limpia, vio que preguntar de una en una el nombre, la altura,
> el peso y el objetivo es lento para datos que caben en un formulario. La v7
> los pide todos de golpe en un formulario, y la IA solo repregunta si falta
> algo o algo no cuadra. Sin dudas, va directa a los primeros consejos y puede
> dejar ya una dieta y una tabla creadas. Con eso cerrado,
> volver a `docs/BACKLOG.md`, que es de donde se tiraba por decisión delegada.
>
> **Tres trampas que salieron y conviene no olvidar:**
>
> - **La entrevista de alta NO gasta cupo diario.** `enviadosHoy()` excluye los
>   modos `inicial` y `reinicio` vía `esRevision()`. La spec 052 daba por hecho
>   lo contrario; el usuario decidió el 24 de agosto que se queda como está. Sí
>   sigue bloqueada si el cupo está agotado por otras conversaciones.
> - **`esRevision()` no se toca.** La comparte `js/gamificacion.js` para el
>   emblema "Primera consulta": cambiar qué cuenta como revisión lo movería de
>   rebote. Por eso el filtro del hilo en `pintarConversacion()` usa
>   `modo !== "conversacion"` a mano en vez de llamarla.
> - **La spec 051 dejó un resto**: `#bloque-conversacion` se escondía con
>   `!hayOperacion || enCurso`, condición de cuando había DOS cajas de texto.
>   Con una sola caja eso dejaba sin sitio donde contestar a una consulta en
>   curso. Arreglado dentro de la 052, que lo necesitaba.
>
> **Cerrado el 24 de agosto:** el usuario confirmó que **el hilo del revés está
> bien tal como quedó**, con el separador de la revisión debajo de sus mensajes.
> No hay que tocarlo. La alternativa de la sección 8 de la spec 051 queda
> descartada.

**1. Reglas de Firestore: ya está hecho.** El 22 de agosto se publicaron
con `npx --yes firebase-tools deploy --only firestore:rules` desde el PC
(la sesión remota del 21 no tenía `firebase login` guardado). El tercer
usuario de la lista blanca (`jrecio0086@gmail.com`, cuñado del propietario,
entra con Google) ya tiene permisos sobre sus propios datos. Está en los
tres sitios de código: `js/firebase-config.js`, `api/_auth.js` y
`firestore.rules`.

**2. La v5 está en marcha y es lo que manda ahora**, por encima del backlog.
Sale de que el usuario miró Consulta el 22 de agosto y vio dos cosas: que
"Abandonar consulta" fallaba y no tenía sentido, y que "Mis planes" duplicaba
peor lo que ya hacen la dieta y la tabla semanales. La idea que manda: la app
tiene un nutricionista al que preguntas dudas cuando quieras y que además te
pasa consulta cada cierto tiempo para ver cómo vas, animarte o apretarte.
Está en `docs/PRODUCTO.md`, apartado "Qué hará (v5…)", y repartida **desde el
principio** en tres specs (no se parten a posteriori):

| Spec | Qué | Estado |
|---|---|---|
| 044 | Fuera los planes y fuera "Abandonar consulta" | ✅ completada |
| 045 | La consulta, como revisión de lo hecho desde la anterior | ✅ completada |
| 046 | La consulta propone dieta o tabla, y tú aceptas | ✅ completada |

Y después de la v5, tres arreglos que salieron de probarla y de la auditoría:

| Spec | Qué | Estado |
|---|---|---|
| 047 | La revisión se podía empezar de verdad | ✅ completada |
| 048 | Los flecos de "planes" que dejó la v5 | ✅ completada |
| 049 | El 413 de Groq y el prompt acotado | ✅ completada |

**Arranca la v6 (23 de agosto).** El usuario probó la v5 y dijo: *"es un poco
lío lo de la conversación más la consulta, igual mejor que sea todo uno, que
cuando pases consulta puedas ver el histórico de conversación"*. Tiene razón:
la spec 023 se llamaba "una sola conversación" y habíamos acabado con dos
hilos, dos cajas de texto y dos cupos en la misma pantalla. Está en
`docs/PRODUCTO.md`, apartado "Qué hará (v6…)", y va en tres specs:

| Spec | Qué | Estado |
|---|---|---|
| 050 | Ver la conversación y las revisiones en un solo hilo | ✅ completada |
| 051 | Una caja arriba, el hilo del revés, y un solo cupo | ✅ completada |
| 052 | La entrevista de alta, también en el hilo | ✅ completada |

**La v6 está cerrada del todo** (25 de agosto). Detrás de ella salieron cuatro
arreglos de cosas que el usuario vio usándola: las specs 053 a 056.

**Se partió en tres ANTES de escribir código**, cuando `revisor-specs` avisó de
que junto pasaba de 300 líneas (regla 4). El proyecto ya decidió no partir
specs a posteriori.

**Dónde vive el cupo desde la 051, y por qué:** `MENSAJES_POR_DIA`,
`enviadosHoy()` y `quedanMensajesHoy()` se mudaron de `js/conversacion.js` a
`js/consulta.js`. El contador necesita `esRevision()`, que es de `consulta.js`,
y `empezarConsulta()` necesita el contador: dejarlo donde estaba habría creado
un **ciclo de imports**. Ahora `conversacion.js` importa de `consulta.js` y no
al revés. **No devolverlo a su sitio "por orden".**

Y cuenta mirando **todas** las consultas, no escribiendo mensajes: la primera
versión de la spec decía que empezar una revisión escribiera un mensaje con la
fecha de hoy, y eso no habría funcionado (ni el documento ni el autor
correctos), y un mensaje sintético de usuario **habría salido pintado en el
hilo**.

**Decisión del usuario en contra de la recomendación (spec 052):** la entrevista
de alta también irá al hilo. Se recomendó dejarla aparte por riesgo —es el
código que rellena Ajustes y crea la operación—, y él decidió que entre. Por eso
va sola en su spec: si rompe algo, se revierte solo eso.

**`node --check` NO vale para estos módulos, y me ha mordido dos veces el mismo
día.** `node --check fichero.js` lo trata como CommonJS: da **exit 0 con código
que es sintácticamente inválido como módulo ES**, que es como los sirve el
navegador (`<script type="module">`). Al implementar la 051 quedó un bloque
huérfano con su `});` suelto y `node --check` no dijo nada; lo cazó
`revisor-codigo`. La comprobación buena es:

```
node --input-type=module --check < js/app.js
```

**El fallo del 23 de agosto que dejó la app en "Cargando…", y la lección que
más vale tener presente:** al implementar la 050 se añadió `esRevision` al
bloque de importación de `./conversacion.js`, cuando la exporta
`./consulta.js`. Un import nombrado que no existe **tumba el módulo entero**:
la app se quedaba en la pantalla de carga, sin más pista. Lo grave es lo que
NO lo detectó: `node --check` solo valida sintaxis de un archivo, no resuelve
imports, y `revisor-codigo` tampoco lo vio. **Antes de dar por buena cualquier
spec que toque imports, comprobar el grafo de módulos**, por ejemplo con este
recorrido de `js/` que verifica que cada import nombrado existe de verdad en el
archivo del que se pide:

```
node --input-type=module -e "const fs=await import('node:fs'); /* recorre js/, saca los export de cada archivo y comprueba cada import nombrado */"
```

Está en el historial del commit que lo arregló. Con 214 imports en `js/`, esto
no se ve a ojo.

**El fallo que destapó la 047, y la lección:** con una operación en marcha
**no había forma de empezar una consulta**. `#btn-empezar-consulta` vivía
dentro de `#bloque-entrevista`, que `pintarEstadoConsulta()` escondía con
`hayOperacion && !enCurso` — una regla de la spec 023, de cuando con una
operación abierta lo único que existía era la conversación. Las specs 045 y 046
se construyeron enteras sobre un camino que la interfaz no dejaba alcanzar, y
sus guiones de prueba decían "ve a Consulta y mira encima del botón" sin
comprobar que ese botón se viera. **Lección: cuando una spec cambia el
comportamiento de un control, el guion tiene que empezar por verificar que ese
control es visible y pulsable en el estado del que habla.**

**Lo que salió a la luz en la 046:** el hilo de una consulta terminada **solo
se veía mientras no recargaras**. Dependía de `consultaReciénTerminada`, una
variable en memoria, así que el cierre que la spec 044 prometía "al final de la
conversación" se esfumaba con un F5. Se arregló dentro de la 046 porque sin eso
la propuesta tampoco sobrevivía. Ahora el hilo sale de `ultimaRevision()`, que
se lee de Firestore; `consultaReciénTerminada` sigue viva, pero solo para el
mensaje y el texto del botón.

**La trampa de la 045:** `INSTRUCCIONES` en `api/consulta.js` **no era "el modo
normal"**: era la base de la entrevista, y `INSTRUCCIONES_INICIAL` e
`INSTRUCCIONES_REINICIO` se construyen encima con template strings.
Reescribirla in situ le habría metido a la entrevista de bienvenida un texto
que dice "esto es una revisión, no preguntes lo que ya sabes" — lo contrario de
lo que debe hacer. Lo paró `revisor-specs`. Ahora son dos constantes:
`INSTRUCCIONES_ENTREVISTA` (base de inicial/reinicio, intacta) e
`INSTRUCCIONES_REVISION` (modo normal).

**La trampa de la 044, que casi se lleva por delante el cupo:** la colección
`planes` guarda dos cosas distintas. Los planes retirados, y las **marcas de
cupo** de dietas y tablas (spec 027). El array `planesCargados` lo leen
`generarDieta()`, `generarTabla()`, `pintarEspecializadas()` y el autorrelleno
de instrucciones de la spec 040, y solo se llena en `refrescarConsulta()`. La
primera versión de la spec mandaba borrar `listarPlanes()` y `planesCargados`;
`revisor-specs` lo paró. **Si alguien vuelve a tocarlos, el cupo de dietas y
tablas pasa a estar siempre entero y el autorrelleno deja de funcionar.**

**3. Seguir limpiando `docs/BACKLOG.md`** por decisión delegada del usuario
el 21 de agosto ("te dejo decidir, vamos a limpiar el backlog"): specs 039
(quitar la foto de perfil), 040 (recordar instrucciones al pedir dieta o
tabla) y 041 (Ajustes en cuatro pestañas) ya completadas y confirmadas. Mientras el usuario no diga lo
contrario, seguir el mismo patrón: elegir un ítem pequeño y autocontenido,
escribir su spec documentando las decisiones de producto en la sección 8 en
vez de entrevistar, pasar `revisor-specs` → implementar → `revisor-codigo` →
guion de prueba, y parar ahí — la prueba manual siempre la hace el usuario,
eso no se delega.

Dos cosas quedaron sin confirmar del guion de la 036 y conviene no perderlas
de vista si algún día se tocan la cabecera o la gráfica de peso:

- **Cabecera en escritorio**: al ensanchar, el avatar/email y la barra de
  navegación se separan a los extremos con mucho hueco en medio. El usuario
  no dijo que le chirriara al validar la spec, así que se da por aceptado
  como está.
- **Redibujado de la gráfica de peso al redimensionar la ventana**: sigue
  como sospecha sin confirmar del todo (`dibujarGrafica()` se llama al
  pintar la sección, no al redimensionar). Anotado en `docs/BACKLOG.md`.

## Deuda conocida

- **Fixes del 21 de agosto, al probar la spec 036 en el navegador**: el usuario vio barras de scroll feas en las columnas de Comidas en escritorio. Causa: `.registro-texto` y `.receta-nombre` son `flex: 1` con recorte por `text-overflow: ellipsis`, pero sin `min-width: 0` un flex item nunca se encoge por debajo del ancho de su contenido, así que el recorte no llegaba a aplicarse y una comida con texto largo ensanchaba toda la columna. Además los `grid-template-columns` de las cuatro rejillas de escritorio iban con `1fr` a secas, que lleva el mismo mínimo implícito a nivel de rejilla; ahora son `minmax(0, …)`. De paso, tres retoques pedidos en la misma sesión: "Pedírsela a la IA" (dieta y tabla) se ha subido junto a "Empezar una semana en blanco"/"Vaciar y empezar de nuevo" en vez de quedar al final de la columna, pareciendo una sección escondida; los botones "Ver menos" de listas largas (comidas, ejercicios, pesajes, recetas, catálogo) hacen scroll hasta sí mismos al recogerse, para no dejar la ventana mirando un hueco en blanco; y apuntar automáticamente desde la dieta/tabla o desde "Lo de siempre" ya guarda la hora actual (antes se guardaba sin hora). Confirmado por el usuario el 21 de agosto.
- **Trampa de CSS de la spec 036, ya resuelta pero fácil de romper otra vez**: las reglas de rejilla del `@media` de 64 rem llevan `:not(.oculta)` a propósito. Sin él ganan en especificidad a la clase `.oculta` con la que `js/app.js` esconde `#bloque-hoy` y `.contenido-operacion` cuando no hay operación en marcha, y **todos los formularios reaparecen en escritorio justo cuando no deben verse**. Si alguien "limpia" esos `:not(.oculta)`, vuelve el fallo. Está comentado en `styles.css`.
- **La clase `.atajo` sirve para dos cosas distintas** (detectado en la spec 035): los atajos de Hoy, que navegan, y el botón "Pedir dieta"/"Pedir tabla" que se crea en tiempo de ejecución y **no navega**. El enganche de navegación funciona porque `querySelectorAll(".nav-boton, .atajo")` corre al cargar, antes de que ese botón exista. **No convertirlo nunca en un listener delegado** ni volver a consultar el selector más tarde: el botón de pedir empezaría a llamar a `abrirPestana(undefined)`. Comentado en `js/app.js`.
- **Descartado el 21 de agosto: la gráfica de peso NO tenía el problema que se sospechaba.** `dibujarGrafica()` (en `js/grafica-svg.js`) usa un `viewBox` fijo y el SVG lleva `width: 100%; height: auto` en `styles.css` — es una gráfica SVG responsiva de manual, se reescala sola con el contenedor sin ejecutar ni una línea de JS al redimensionar. Los puntos tocables son elementos SVG propios con su `addEventListener` de toda la vida, no coordenadas calculadas a partir del tamaño en el momento de pintar, así que tampoco hay un desajuste de click. Falsa alarma de la spec 036; quitado de `docs/BACKLOG.md`.
- **Descartado el 21 de agosto: el hueco de la cabecera en escritorio se da por aceptado.** El usuario no dijo que le chirriara al validar la spec 036 (paso 20 de su guion). Quitado de `docs/BACKLOG.md`.
- **Fix del 21 de agosto, de vuelta a `fixed`: la barra de navegación desaparecía en Ejercicio, en móvil.** Detectado probando la spec 038. Causa real, confirmada con un panel de diagnóstico temporal: al entrar en Ejercicio, `window.innerHeight` saltaba de 681 a 733 mientras `window.visualViewport.height` —lo que de verdad se ve— se quedaba en 681. Un hueco de 52 px justo donde vive `#nav-inferior` (`position: fixed; bottom: 0`): el navegador la coloca contra el `innerHeight` "de diseño", no contra lo que realmente se ve.
  - Se probó compensar ese hueco con JS (`visualViewport`, `ajustarBarraInferior()`), pero quedaba visualmente inconsistente entre secciones (a veces pegada abajo del todo, a veces corregida 52 px con un hueco debajo).
  - Se probó cambiar `position: fixed` por `position: sticky`, que evita el desajuste de raíz sin ningún JS — **pero era un error de bulto**: sticky no sirve para una barra que tiene que estar siempre visible. En una sección más alta que la pantalla (Ejercicio, con muchos registros), sticky solo se pega abajo cuando el scroll llega cerca del final del contenido, no desde el principio — así que la barra volvía a desaparecer, esta vez porque el enfoque entero estaba mal, no por un detalle de la cuenta.
  - Dentro de ese error también se intentó que la sección activa creciera con flexbox y `min-height: 100dvh` para que sticky cayera siempre en el borde real en secciones cortas (Fotos) — funcionaba para eso, pero no arreglaba el problema de fondo en secciones largas.
  - **Vuelta a `position: fixed`**, que es lo correcto para una barra siempre visible, con el arreglo de JS que sí funcionaba (`ajustarBarraInferior()`, enganchado en `abrirPestana()` tras el `scrollTo()`). Se revirtieron el `sticky`, los márgenes negativos de borde a borde que necesitaba, el `flex`/`min-height` de `.seccion.activa`/`#pantalla-principal`, y el padding del `body` volvió a reservar hueco para la barra fija. Verificado con Playwright: con una página mucho más alta que la pantalla, arriba del todo y sin haber hecho scroll, la barra ya está visible desde el primer instante — que es justo el caso que sticky no cumplía.
  - **Confirmado por el usuario el 21 de agosto: ya se ve en Ejercicio.** Queda un detalle estético aceptado a propósito: en Ejercicio (la sección donde se mide el hueco de 52 px), la barra queda desplazada esos 52 px respecto a las demás secciones, donde el hueco no aparece y no hace falta corregir nada. El usuario lo notó y decidió dejarlo así antes que seguir tocando algo que ya funciona. Si algún día se quiere ese último pulido, el panel de diagnóstico (código en el historial de git, commit `5829e91`) es la forma de medirlo con datos, no otro intento a ciegas.

- **El 413 de Groq, detectado en producción el 23 de agosto (spec 049).** El
  usuario vio `ia-saturada (gemini) · reserva: http-413`: Gemini saturado, la
  reserva de Groq entró bien, y Groq devolvió 413 = la petición no cabe en su
  **límite de tokens por minuto**. Ese límite, como la cuota, **va por modelo**,
  y el grande (el primero de `MODELOS_GROQ`) es el más tacaño. Es la misma
  trampa que el 429 de la spec 032 con otro número. Ahora el 413 hace lo mismo
  que el 429 en los **dos** puntos de decisión: probar el siguiente modelo
  dentro de Groq (`llamarAGroq`) y probar el otro proveedor
  (`estadoMereceReserva`) — sin lo segundo, con "Groq primero" elegido, Gemini
  no llegaba a intentarse nunca. **Si aparece un código nuevo de "no puedo",
  mirar esos dos sitios, no uno.**
- **El prompt crecía sin freno (spec 049).** La spec 045 pasó la ventana de la
  revisión de 14 días fijos a un mes, pero `describirRegistros()` escribe una
  línea por registro: un mes con cinco comidas al día son doscientas líneas
  dentro del prompt, y por eso Groq se ahogaba. Ahora hay topes
  (`MAXIMO_PESAJES` 30, `MAXIMO_COMIDAS` 60, `MAXIMO_EJERCICIOS` 30) y, cuando
  recorta, se lo dice a la IA. **El recorte se queda con los primeros elementos
  porque las listas llegan de más reciente a más antigua: si algún día se
  cambia ese orden, el recorte se quedaría con lo viejo sin que lo note nadie.**
- **Spec 032, detectado al probar en producción y ya corregido**: la capa gratuita de Groq va **por modelo**, no por cuenta entera, y `llamarAGroq()` solo pasaba al siguiente modelo de `MODELOS_GROQ` ante un 404 (modelo inexistente), nunca ante un 429 (modelo sin cuota). El modelo grande (`llama-3.3-70b-versatile`, el primero de la lista) es el más tacaño en cuota gratuita, así que un 429 suyo daba Groq entero por perdido sin probar los otros dos. Ahora un 429 también pasa al siguiente modelo. De paso, los mensajes de error de la IA (`cuota-agotada`, `ia-saturada`, etc.) llevan un campo `proveedor` nuevo: con dos proveedores elegibles, el mensaje ya no bastaba para saber si había sido Gemini o Groq.
- **Código muerto de la spec 029 borrado el 19 de agosto**: `pedirPlanEspecializado()` y `URL_PLAN`/`MAXIMO_INSTRUCCIONES` en `js/consulta.js`, y el archivo `api/plan.js` entero (con su entrada en `vercel.json`). Los planes de dieta y tabla ya eran semanas estructuradas desde las specs 028/029; esto solo quitaba el camino viejo que ya no llamaba nadie. `quedanPlanesHoy`, `pedidosHoy` y `guardarMarcaDePlan` siguen vivos, el cupo de planes no cambia.
- **Spec 031, detectado por `revisor-codigo` y ya corregido**: la entrevista que abre o reabre una operación se guarda en `consultas` con modo `inicial`/`reinicio` antes de crear la operación, así que sin filtrarla el emblema "Primera consulta" salía conseguido desde el segundo cero. `js/gamificacion.js` ya excluye esos dos modos. Si algún día se añade otro modo de entrevista automática a `consultas`, hay que acordarse de excluirlo también.
- **Fix del 19 de agosto**: los recuentos de "Ajustes → Reiniciar datos" solo se leían una vez, al iniciar sesión, y salían desactualizados hasta recargar la página entera. Se refrescan también al abrir Ajustes, y hay un botón manual (`btn-actualizar-recuentos`) para forzarlo. Detectado al probar la spec 030.
- **`sembrar.html` y `js/sembrar.js` fueron la herramienta temporal para rellenar datos de prueba. Borrados el 27 de agosto de 2026**, cuando dejaron de hacer falta.
- **La reserva de Groq daba 401 el 16 de agosto** y quedó sin explicar (ver más abajo). El 17 la dieta salió adelante, así que o se arregló sola o respondió Gemini. **Sin confirmar.**
- Las ideas sueltas siguen en `docs/BACKLOG.md`.

## Cosas que hay que saber antes de tocar nada

- **Cómo se prueba**: el usuario prueba SIEMPRE en producción (https://operacion-bikini.vercel.app). Para que pueda probar algo hay que hacer commit y `git push`: Vercel despliega solo desde `main`. Nada de servidores locales.
- **Reglas de Firestore**: se publican con `npx --yes firebase-tools deploy --only firestore:rules`. Ya no se copian a mano en la consola. Hacerlo SIEMPRE antes de pedirle al usuario que pruebe.
- **Modelo de IA**: con la clave del proyecto solo responde `gemini-flash-latest`; `gemini-2.5-flash` da 404. Y la API rechaza con 400 tanto `thinkingConfig` como `propertyOrdering`. Está documentado en `api/_ia.js`.
- **A Groq hay que describirle la forma de la respuesta, no solo las claves** (spec 028, 17 de agosto): Groq no acepta esquemas, así que `api/_ia.js` se los describe por escrito. Esa descripción decía que todas las claves eran "de tipo texto", lo cual era cierto para la conversación pero mentira para la dieta, que lleva listas dentro: Groq devolvía los días como texto plano y la semana llegaba vacía. Costó cuatro intentos porque los tres primeros arreglaron síntomas (la coerción de tipos, los nombres de los días, las mayúsculas) sin mirar qué se le estaba pidiendo. **Si una respuesta con listas llega vacía, lo primero es mirar `describirEsquema()`.**
- **Las listas dentro de listas ya están probadas** (spec 029): `api/tabla.js` pide días que llevan dentro su lista de ejercicios, y es el único esquema del proyecto con ese anidamiento. `describirEsquema()` de `api/_ia.js` lo describe sin tocarlo, porque es recursivo desde la 028. Si hace falta otro nivel más, ese es el sitio.
- **Las colecciones del plan y del diario se llaman parecido y no lo son**: `ejerciciosCatalogo` es lo que sabes hacer y `ejercicios` es lo que has hecho. Lo mismo con `tablas`/`ejercicios` y `dietas`/`comidas`. En `js/reinicio.js` van en casillas separadas y la etiqueta de la nueva evita a propósito la palabra suelta "ejercicios": equivocarse ahí borra el diario.
- **No fiarse de la forma de lo que devuelve la IA** (specs 004, 028): nombres de día con fecha pegada, sin tildes, en inglés, claves en mayúscula, listas como texto JSON. `api/dieta.js` los normaliza todos y empareja los días **por orden**, no por nombre. Cualquier spec nueva que pida estructuras a la IA debería copiar ese apaño en vez de confiar.
- **Esquemas de respuesta de Gemini**: todos los campos deben ir como `required`, aunque no apliquen en cada turno (los vacíos, como cadena vacía). Con campos opcionales, el modelo se los salta y llegan planes sin rutina.
- **La reserva de Groq dio 401 el 16 de agosto y nunca se explicó del todo.** Quedó descartado: la clave de Vercel es la correcta (huella SHA-256 comprobada contra la buena), esa clave devuelve 200 desde fuera de Vercel con la misma petición, el código manda bien el encabezado, y los tres modelos de `MODELOS_GROQ` existen. El 17 la dieta salió adelante, así que o se arregló solo o quien respondió fue Gemini: **sin confirmar**. Si vuelve a fallar, lo único que falta por mirar es la línea `Groq respondió 401: {...}` en los logs de Vercel, que trae el motivo que da Groq. El mensaje de pantalla ya dice por qué falló la reserva (`sin-clave`, `http-NNN`, `json-ilegible`, `inalcanzable`).
- **Variables de entorno en Vercel**: `GEMINI_API_KEY`, `GROQ_API_KEY` (reserva de IA, spec 020) y las tres de Cloudinary. Sin la de Groq la app funciona, pero se queda sin red de seguridad cuando Gemini falla.
- **Gemini devuelve 503 cuando está saturado**: no es un fallo del proyecto, es Google diciendo que el modelo está sobrecargado. Pasó el 15 de agosto y tumbó a la vez consejo, consulta y planes. La respuesta fue la spec 020: cuando Gemini responde 429, 503 o 5xx, la misma petición se manda a Groq. Los reintentos que hubo un día se quitaron: preguntarle otra vez a quien acaba de decir que está saturado aporta menos que preguntarle a otro. Antes de buscar un bug propio, mirar el código que sale en pantalla.
- **Cuota gratuita de Gemini**: se agota depurando a base de despliegues. Pensar antes de probar en producción.
- **Todo está en Vercel**: web y funciones, mismo dominio. GitHub Pages se descartó y está desactivado.
- **La lista blanca de emails vive en tres sitios**: `js/firebase-config.js`, `firestore.rules` y `api/_auth.js`. Al añadir a alguien hay que tocar los tres.
- **El orden de la cascada de modelos de `api/_ia.js`.** Se reordenó el 10 de agosto para que `gemini-flash-latest` vaya primero: con la clave actual, `gemini-2.5-flash` da 404 y gastaba una llamada fallida en cada turno. Si cambia la clave o Google renombra los modelos, hay que revisarlo. (Venía de `docs/BACKLOG.md`, que se vació el 27 de agosto.)
- **Los emails autorizados están en texto plano en un repo público.** Decisión consciente del usuario el 10 de agosto. Alternativas si algún día molesta: lista blanca por UID o por hash SHA-256.
- **Si Gemini y Groq se quedan cortos, la salida es un tercer proveedor**, no exprimir más a los dos que hay. La cascada de `api/_ia.js` ya está montada para eso desde la spec 020.
- **Si vuelve el 413 de Groq, lo que falta es acotar el prompt por caracteres.** La spec 049 puso topes de número de registros (`MAXIMO_PESAJES` 30, `MAXIMO_COMIDAS` 60, `MAXIMO_EJERCICIOS` 30), pero el texto de una comida no tiene límite de longitud: alguien escribiendo párrafos puede volver a inflar la petición. Se cerró el 27 de agosto sin hacerlo porque el 413 no ha vuelto desde el 23 y recortar el texto del usuario pierde información de verdad. Si reaparece, esto es lo primero, y hace falta decidir cuántos caracteres y si el recorte se marca.
- **Resumir los registros por día en el prompt** ("3 comidas, 45 min de bici") en vez de listarlos uno a uno cuando el periodo es largo (spec 049) diría más con menos texto, pero cambia lo que la IA ve. No es una tarea: es la otra salida al mismo problema que la anterior.
- **El alta ya no promete planes que no pediste; la revisión todavía sí.** Arreglado el 27 de agosto: `INSTRUCCIONES_ENTREVISTA` (`api/consulta.js`) afirmaba que "esta persona ya tiene en la app una dieta semanal y una tabla de ejercicio", así que con las casillas del comité desmarcadas (spec 057) el cierre del alta te prometía planes que nadie iba a crear. Ahora la frase ya no da nada por hecho, y `fichaEnProsa()` (`js/consulta.js`) **dice en voz alta lo que NO se va a crear**: el silencio no bastaba, porque una casilla desmarcada se leía igual que un campo sin rellenar. **`INSTRUCCIONES_REVISION` sigue afirmando lo mismo** (dos veces, en el cierre y en la propuesta de cambio) y ahí no se tocó: el proxy no sabe si existen la dieta y la tabla, y para saberlo tiene que decírselo el navegador. Eso es una spec, y está anotada en `docs/PRODUCTO.md`.
- **`sembrar.html` y `js/sembrar.js` ya no existen** (borrados el 27 de agosto). Seguían desplegados y funcionando en producción sin que los enlazara nada. Si algún evolutivo necesita datos de prueba, están en el historial de git.
- **Los cupos diarios**, tras las specs 023 y 027: **20 mensajes** de conversación, **2 consultas** (la entrevista que abre una operación), **2 dietas** y **2 tablas**. Los de la IA se cuentan sobre los documentos guardados —planes o mensajes del hilo—, así que borrar datos los reinicia. Es conocido y aceptado.

## Pendiente de decidir por el usuario

- **Nada bloqueante.** Al 30 de agosto no queda ninguna decisión abierta: las
  cuatro de la v9 y las tres de la v10 se cerraron con el usuario antes de
  implementarlas.
- **Qué se hace a continuación**, de las ideas de `docs/PRODUCTO.md`. Ver
  "Lo siguiente", más arriba.
