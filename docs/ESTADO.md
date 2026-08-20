# Estado del proyecto

Documento para retomar el trabajo en frío. Se actualiza al terminar cada spec.

**Última actualización:** 20 de agosto de 2026 (spec 034 terminada y validada; la v4 en marcha)

## Dónde estamos

**V1 terminada y probada** el 11 de agosto, 20 días antes del plazo. La app está en producción y en uso:

**https://operacion-bikini.vercel.app**

**Las specs 001 a 034 están todas implementadas, desplegadas y validadas por el usuario.** La app se usa a diario.

La v2 se amplió dos veces sobre la marcha, según el usuario iba probando:

- **v2 original** (11 de agosto): ajustes, gráfica, "Hoy", rediseño, detalle nutricional y gamificación.
- **Ampliación** (13 de agosto, specs 011-020): salió de usar la app con dos meses de datos sembrados.
- **v3** (16 de agosto, specs 021-028): salió de usarla otra vez, ya con todo lo anterior encima.

Todo lo de esas tres fases está cerrado. Desde ahí, el 19 de agosto se empezó a tirar de `docs/BACKLOG.md`: primero limpieza de código muerto, luego la spec 032 (elegir proveedor de IA desde Ajustes) y la 033 (tocar un punto de la gráfica de peso).

El 20 de agosto arrancó la **v4**, que sale de una auditoría de usabilidad hecha sobre el código. No añade funciones: recoloca las que hay. Está descrita en `docs/PRODUCTO.md`, apartado "Qué hará (v4)".

**No queda ninguna spec abierta.** Lo siguiente es decidir con el usuario: el rehacer las pantallas que pidió el 16 de agosto, o la siguiente idea del backlog.

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

## Qué toca ahora

**La v4, empezada el 20 de agosto.** Aquel "rehacer las pantallas de forma más lógica" que el usuario pidió el 16 de agosto ya está concretado y en `PRODUCTO.md`. Salió de una auditoría de usabilidad sobre el código: Comidas y Ejercicio se habían convertido en páginas de cinco y seis bloques que solo se recorren con scroll ciego, y en un monitor la app es una columna de 512 px con dos desiertos a los lados.

Las cuatro specs de la v4, **en este orden y no en otro**:

| Spec | Qué | Estado |
|---|---|---|
| 034 | La confirmación de guardado, en el propio botón | ✅ completada |
| 035 | Sub-pestañas en Comidas y Ejercicio, y nombres que dejan de pisarse | siguiente |
| 036 | Vista de escritorio en varias columnas | pendiente |
| 037 | Fotos en la navegación, zonas táctiles y fecha/hora plegables | pendiente |

**Por qué la 035 va antes que la 036:** los trozos en que se parta Comidas en el móvil son exactamente las columnas del escritorio. Al revés habría que recolocar el CSS dos veces.

**La 035 roza el límite de las ~300 líneas** que marca `CLAUDE.md`. Se decidió no partirla: Comidas y Ejercicio son la misma estructura repetida, y dejar la app medio migrada entre dos sesiones es peor. Si al implementarla se desmadra, avisar antes de seguir.

## Deuda conocida

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
- **Rehacer las pantallas de forma más lógica**: el usuario lo pidió el 16 de agosto, sin concretar. Preguntarle qué tiene en mente antes de tocar nada.

El resto de ideas sueltas, en `docs/BACKLOG.md`.
