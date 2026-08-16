# Estado del proyecto

Documento para retomar el trabajo en frío. Se actualiza al terminar cada spec.

**Última actualización:** 12 de agosto de 2026 (spec 007 terminada)

## Dónde estamos

**V1 terminada y probada** el 11 de agosto, 20 días antes del plazo. La app está en producción y en uso:

**https://operacion-bikini.vercel.app**

La **v2 está empezada**: su alcance se decidió el 11 de agosto (ver `docs/PRODUCTO.md`, apartado "Qué hará (v2)"). Ya están terminadas la spec 006 (ajustes y reinicio) y la 007 (editar registros).

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
| 011 | Navegación por dispositivo y foto de perfil | 🟡 desplegada, sin probar |
| 012 | "Hoy" afinada: resumen con +, atajos y calendario por rango | 🟡 desplegada, sin probar |
| 013 | Listas cortas con filtro por día y comidas frecuentes | 🟡 desplegada, sin probar |
| 014 | Hora opcional en los registros | 🟡 desplegada, sin probar |
| 015 | Peso: rango en la gráfica y estadísticas | 🟡 desplegada, sin probar |
| 016 | "Iniciar operación bikini": entrevista inicial y perfil | 🟡 desplegada, sin probar |
| 017 | Consultas especializadas de ejercicio y dieta | 🟡 desplegada, sin probar |
| 018 | Operaciones con principio y fin, e histórico | 🟡 desplegada, sin probar |
| 019 | Borrar el histórico desde el reinicio de datos | 🟡 desplegada, sin probar |
| 020 | Groq como proveedor de IA de reserva | 🟡 desplegada, sin probar |

## Qué toca ahora

La v2 se acordó hacerla entera, en este orden (`docs/propuestas/v2-usabilidad-y-gamificacion.md`, apartado 9):

**Las ocho specs de la ampliación (011 a 018) están implementadas y desplegadas, pero el usuario aún no las ha probado.** Las pidió todas seguidas para probarlas juntas. Hasta que dé el visto bueno, ninguna es "completada": si algo no le cuadra, se corrige antes de seguir.

El 13 de agosto el usuario probó la app con un mes de datos sembrados y dio una tanda larga de correcciones. De ahí salieron estas siete specs (alcance completo en `docs/PRODUCTO.md`, apartado "Ampliación de la v2"):

| Spec | Qué es |
|---|---|
| 011 | Navegación por dispositivo (barra abajo en móvil, arriba en escritorio), "Más" pasa a ser Ajustes, y foto de perfil junto al usuario |
| 012 | "Hoy" afinada: botón **+** por línea del resumen, accesos directos a Consulta/Consejos/Fotos, fuera "lo de siempre", calendario con rango elegible (por defecto 1 mes) |
| 013 | Listas cortas en Peso, Comidas y Ejercicio (últimos registros, desplegar o buscar por día) y comidas frecuentes en la pantalla de Comidas |
| 014 | Hora opcional en pesajes, comidas y ejercicios, propuesta al apuntar y editable |
| 015 | Peso: gráfica con rango elegible, orden gráfica → pesajes → estadísticas, y sección de estadísticas |
| 016 | "Iniciar operación bikini": onboarding conversacional que rellena los ajustes y guarda un perfil que la IA usa después |
| 017 | Consultas especializadas: tabla de ejercicio o dieta detallada, gastando una consulta del día |

Después de esas siete, sigue pendiente lo que ya estaba decidido de la v2: **detalle nutricional por IA** (grupos de alimentos y calorías en rango, una llamada al día) y **gamificación** (puntos, rachas con día de gracia y emblemas).

Ya hechas de la v2: ajustes y reinicio (006), editar registros (007), gráfica de peso (008), rediseño nocturno (009) y pantalla "Hoy" (010).

Decisiones de v2 ya tomadas por el usuario el 11 de agosto:

- Dirección visual: **nocturna deportiva**.
- **Sin** objetivo compartido entre los dos usuarios: nada de comparar ni clasificar.
- Calorías **en rango** y además grupos de alimentos.
- Gamificación con **puntos, rachas y emblemas** (los tres).

## Cosas que hay que saber antes de tocar nada

- **Cómo se prueba**: el usuario prueba SIEMPRE en producción (https://operacion-bikini.vercel.app). Para que pueda probar algo hay que hacer commit y `git push`: Vercel despliega solo desde `main`. Nada de servidores locales.
- **Reglas de Firestore**: se publican con `npx --yes firebase-tools deploy --only firestore:rules`. Ya no se copian a mano en la consola. Hacerlo SIEMPRE antes de pedirle al usuario que pruebe.
- **Modelo de IA**: con la clave del proyecto solo responde `gemini-flash-latest`; `gemini-2.5-flash` da 404. Y la API rechaza con 400 tanto `thinkingConfig` como `propertyOrdering`. Está documentado en `api/_ia.js`.
- **Esquemas de respuesta de Gemini**: todos los campos deben ir como `required`, aunque no apliquen en cada turno (los vacíos, como cadena vacía). Con campos opcionales, el modelo se los salta y llegan planes sin rutina.
- **Variables de entorno en Vercel**: `GEMINI_API_KEY`, `GROQ_API_KEY` (reserva de IA, spec 020) y las tres de Cloudinary. Sin la de Groq la app funciona, pero se queda sin red de seguridad cuando Gemini falla.
- **Gemini devuelve 503 cuando está saturado**: no es un fallo del proyecto, es Google diciendo que el modelo está sobrecargado. Pasó el 15 de agosto y tumbó a la vez consejo, consulta y planes especializados. Desde entonces `api/_ia.js` reintenta tres veces (2 s, 4 s, 6 s) y, si sigue, la app dice que la IA está saturada en vez de un "no se ha podido" que no explica nada. Antes de buscar un bug propio, comprobar el código que sale en pantalla.
- **Cuota gratuita de Gemini**: se agota depurando a base de despliegues. Pensar antes de probar en producción.
- **Todo está en Vercel**: web y funciones, mismo dominio. GitHub Pages se descartó y está desactivado.
- **La lista blanca de emails vive en tres sitios**: `js/firebase-config.js`, `firestore.rules` y `api/_auth.js`. Al añadir a alguien hay que tocar los tres.
- **Los cupos diarios** (5 consejos, 2 consultas) se cuentan sobre los documentos guardados, así que borrar datos los reinicia. Es conocido y aceptado.

## Pendiente de decidir por el usuario

- `PRODUCTO.md` llama "collage de evolución" a lo que es una cuadrícula de miniaturas. O se cambia la palabra, o se hace el collage de verdad en v2.

El resto de ideas sueltas, en `docs/BACKLOG.md`.
