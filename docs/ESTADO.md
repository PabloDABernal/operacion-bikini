# Estado del proyecto

Documento para retomar el trabajo en frío. Se actualiza al terminar cada spec.

**Última actualización:** 21 de agosto de 2026 (specs 036 y 037 completadas y validadas por el usuario)

## Dónde estamos

**V1 terminada y probada** el 11 de agosto, 20 días antes del plazo. La app está en producción y en uso:

**https://operacion-bikini.vercel.app**

**Las specs 001 a 037 están implementadas, desplegadas y validadas por el usuario.** La app se usa a diario.

La v2 se amplió dos veces sobre la marcha, según el usuario iba probando:

- **v2 original** (11 de agosto): ajustes, gráfica, "Hoy", rediseño, detalle nutricional y gamificación.
- **Ampliación** (13 de agosto, specs 011-020): salió de usar la app con dos meses de datos sembrados.
- **v3** (16 de agosto, specs 021-028): salió de usarla otra vez, ya con todo lo anterior encima.

Todo lo de esas tres fases está cerrado. Desde ahí, el 19 de agosto se empezó a tirar de `docs/BACKLOG.md`: primero limpieza de código muerto, luego la spec 032 (elegir proveedor de IA desde Ajustes) y la 033 (tocar un punto de la gráfica de peso).

El 20 de agosto arrancó la **v4**, que sale de una auditoría de usabilidad hecha sobre el código. No añade funciones: recoloca las que hay. Está descrita en `docs/PRODUCTO.md`, apartado "Qué hará (v4)".

**No queda ninguna spec abierta.** El "rehacer las pantallas de forma más lógica" que el usuario pidió el 16 de agosto ya se resolvió con las specs 034-037. Lo siguiente es decidir con el usuario: la 038 (fotos en la navegación, zonas táctiles y fecha/hora plegable en Ejercicio y Peso) o la siguiente idea del backlog.

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

## Qué toca ahora

**La v4, empezada el 20 de agosto y ya cerrada.** Aquel "rehacer las pantallas de forma más lógica" que el usuario pidió el 16 de agosto salió de una auditoría de usabilidad sobre el código: Comidas y Ejercicio se habían convertido en páginas de cinco y seis bloques que solo se recorren con scroll ciego, y en un monitor la app era una columna de 512 px con dos desiertos a los lados. Se resolvió en cuatro specs, con una ampliación el 21 de agosto tras usar la 036 en producción:

| Spec | Qué | Estado |
|---|---|---|
| 034 | La confirmación de guardado, en el propio botón | ✅ completada |
| 035 | Sub-pestañas en Comidas y Ejercicio, y nombres que dejan de pisarse | ✅ completada |
| 036 | Vista de escritorio en varias columnas | ✅ completada |
| 037 | Comidas integradas, Hoy completo y detalle real en el calendario (ampliación de la v4 del 21 de agosto) | ✅ completada |

### Lo primero al retomar

**No queda ninguna spec abierta.** La siguiente candidata es la **038**
(fotos en la navegación, zonas táctiles más grandes, y fecha/hora plegable
en Ejercicio y Peso por simetría con lo que la 037 le hizo a Comidas) —
todavía es una idea suelta, sin spec escrita. Preguntarle al usuario si
quiere seguir por ahí o prefiere tirar de otra cosa de `docs/BACKLOG.md`.

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
- **La gráfica de peso no se redibuja al cambiar el tamaño de la ventana**: `dibujarGrafica()` se llama al pintar la sección. Sospecha abierta desde la spec 036, **sin confirmar**: pendiente de que el usuario lo compruebe (paso 21 de su guion). En `docs/BACKLOG.md`.
- **Fix del 21 de agosto, de vuelta a `fixed`: la barra de navegación desaparecía en Ejercicio, en móvil.** Detectado probando la spec 038. Causa real, confirmada con un panel de diagnóstico temporal: al entrar en Ejercicio, `window.innerHeight` saltaba de 681 a 733 mientras `window.visualViewport.height` —lo que de verdad se ve— se quedaba en 681. Un hueco de 52 px justo donde vive `#nav-inferior` (`position: fixed; bottom: 0`): el navegador la coloca contra el `innerHeight` "de diseño", no contra lo que realmente se ve.
  - Se probó compensar ese hueco con JS (`visualViewport`, `ajustarBarraInferior()`), pero quedaba visualmente inconsistente entre secciones (a veces pegada abajo del todo, a veces corregida 52 px con un hueco debajo).
  - Se probó cambiar `position: fixed` por `position: sticky`, que evita el desajuste de raíz sin ningún JS — **pero era un error de bulto**: sticky no sirve para una barra que tiene que estar siempre visible. En una sección más alta que la pantalla (Ejercicio, con muchos registros), sticky solo se pega abajo cuando el scroll llega cerca del final del contenido, no desde el principio — así que la barra volvía a desaparecer, esta vez porque el enfoque entero estaba mal, no por un detalle de la cuenta.
  - Dentro de ese error también se intentó que la sección activa creciera con flexbox y `min-height: 100dvh` para que sticky cayera siempre en el borde real en secciones cortas (Fotos) — funcionaba para eso, pero no arreglaba el problema de fondo en secciones largas.
  - **Vuelta a `position: fixed`**, que es lo correcto para una barra siempre visible, con el arreglo de JS que sí funcionaba (`ajustarBarraInferior()`, enganchado en `abrirPestana()` tras el `scrollTo()`). Se revirtieron el `sticky`, los márgenes negativos de borde a borde que necesitaba, el `flex`/`min-height` de `.seccion.activa`/`#pantalla-principal`, y el padding del `body` volvió a reservar hueco para la barra fija. Verificado con Playwright: con una página mucho más alta que la pantalla, arriba del todo y sin haber hecho scroll, la barra ya está visible desde el primer instante — que es justo el caso que sticky no cumplía.
  - **Pendiente de que el usuario lo confirme en su móvil.** Si vuelve a fallar, el panel de diagnóstico (código en el historial de git, commit `5829e91`) es la forma de medirlo con datos antes de tocar nada a ciegas — no otro intento sin comprobar primero qué hace cada tipo de `position` con una página más alta que la pantalla.

- **Spec 032, detectado al probar en producción y ya corregido**: la capa gratuita de Groq va **por modelo**, no por cuenta entera, y `llamarAGroq()` solo pasaba al siguiente modelo de `MODELOS_GROQ` ante un 404 (modelo inexistente), nunca ante un 429 (modelo sin cuota). El modelo grande (`llama-3.3-70b-versatile`, el primero de la lista) es el más tacaño en cuota gratuita, así que un 429 suyo daba Groq entero por perdido sin probar los otros dos. Ahora un 429 también pasa al siguiente modelo. De paso, los mensajes de error de la IA (`cuota-agotada`, `ia-saturada`, etc.) llevan un campo `proveedor` nuevo: con dos proveedores elegibles, el mensaje ya no bastaba para saber si había sido Gemini o Groq.
- **Código muerto de la spec 029 borrado el 19 de agosto**: `pedirPlanEspecializado()` y `URL_PLAN`/`MAXIMO_INSTRUCCIONES` en `js/consulta.js`, y el archivo `api/plan.js` entero (con su entrada en `vercel.json`). Los planes de dieta y tabla ya eran semanas estructuradas desde las specs 028/029; esto solo quitaba el camino viejo que ya no llamaba nadie. `quedanPlanesHoy`, `pedidosHoy` y `guardarMarcaDePlan` siguen vivos, el cupo de planes no cambia.
- **Spec 031, detectado por `revisor-codigo` y ya corregido**: la entrevista que abre o reabre una operación se guarda en `consultas` con modo `inicial`/`reinicio` antes de crear la operación, así que sin filtrarla el emblema "Primera consulta" salía conseguido desde el segundo cero. `js/gamificacion.js` ya excluye esos dos modos. Si algún día se añade otro modo de entrevista automática a `consultas`, hay que acordarse de excluirlo también.
- **Fix del 19 de agosto**: los recuentos de "Ajustes → Reiniciar datos" solo se leían una vez, al iniciar sesión, y salían desactualizados hasta recargar la página entera. Se refrescan también al abrir Ajustes, y hay un botón manual (`btn-actualizar-recuentos`) para forzarlo. Detectado al probar la spec 030.
- **`sembrar.html` y `js/sembrar.js` siguen en el repo.** Son la herramienta temporal para rellenar datos de prueba. Hay que borrarlos cuando dejen de hacer falta.
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
- **Los cupos diarios**, tras las specs 023 y 027: **20 mensajes** de conversación, **2 consultas** (la entrevista que abre una operación), **2 dietas** y **2 tablas**. Los de la IA se cuentan sobre los documentos guardados —planes o mensajes del hilo—, así que borrar datos los reinicia. Es conocido y aceptado.

## Pendiente de decidir por el usuario

- `PRODUCTO.md` llama "collage de evolución" a lo que es una cuadrícula de miniaturas. O se cambia la palabra, o se hace el collage de verdad.
- **Si se sigue con la 038** (fotos en la navegación, zonas táctiles, fecha/hora plegable en Ejercicio y Peso) o con otra idea de `docs/BACKLOG.md`.

El resto de ideas sueltas, en `docs/BACKLOG.md`.
