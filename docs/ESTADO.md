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

## Qué toca ahora

La v2 se acordó hacerla entera, en este orden (`docs/propuestas/v2-usabilidad-y-gamificacion.md`, apartado 9):

**Las specs 011 a 027 están probadas y dadas por buenas por el usuario** (16 de agosto). Tiene más cambios que pedir, pero prefiere juntarlos y decirlos de una vez, así que no están anotados todavía.

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

## La v3, decidida el 16 de agosto de 2026

El usuario probó las specs 011-020 con dos meses de datos, las dio por buenas y pidió otra tanda. Quiere **probarlo todo junto** al final, así que ninguna se da por completada hasta entonces. Alcance en `docs/PRODUCTO.md`, apartado "Qué hará (v3)".

| Spec | Qué es | Por qué en este orden |
|---|---|---|
| 021 | Calendario de constancia a tamaño fijo | Bug visible: con "1 semana" los cuadraditos salen enormes |
| 022 | Paleta violeta nocturna | Cambio de tokens, no toca estructura |
| 023 | Un solo interlocutor: fuera "Consejos", todo a "Pasar consulta" | Simplifica antes de repartir lo demás |
| 024 | Consulta en la barra, Ajustes en el avatar, y cada plan en su sección | Coloca cada cosa en su sitio |
| 025 | Calendario de constancia legible (calendario en rangos cortos, meses en los largos) | Se coló aquí: el usuario lo vio y no pasaba |
| 026 | Recetas: colección propia | Las dietas se apoyan en ellas |
| 027 | Dietas y tablas: semana completa, con instrucciones y cupo propio | El usuario lo pidió al ver que gastaban las consultas de la entrevista |
| 028 | Dietas: semana de menús, generada por IA o montada a mano, con "me lo he comido" | Lo más grande de la tanda |
| 029 | Tablas de ejercicio guardadas | Hermana de las dietas |
| 030 | Detalle nutricional automático por IA | Pendiente de la v2 original |
| 031 | Gamificación: puntos, rachas y emblemas | Pendiente de la v2 original |

Decisiones ya tomadas por el usuario para esta tanda:

- Paleta **violeta nocturna** (fondo violeta oscuro, acento violeta, cian de apoyo).
- Las dietas se pueden **generar con IA y montar a mano**, las dos cosas desde el principio.
- Una receta guarda **nombre, raciones, ingredientes y preparación**. Sin datos nutricionales de momento.
- En la dieta de hoy, **un toque apunta la comida**.

## Cosas que hay que saber antes de tocar nada

- **Cómo se prueba**: el usuario prueba SIEMPRE en producción (https://operacion-bikini.vercel.app). Para que pueda probar algo hay que hacer commit y `git push`: Vercel despliega solo desde `main`. Nada de servidores locales.
- **Reglas de Firestore**: se publican con `npx --yes firebase-tools deploy --only firestore:rules`. Ya no se copian a mano en la consola. Hacerlo SIEMPRE antes de pedirle al usuario que pruebe.
- **Modelo de IA**: con la clave del proyecto solo responde `gemini-flash-latest`; `gemini-2.5-flash` da 404. Y la API rechaza con 400 tanto `thinkingConfig` como `propertyOrdering`. Está documentado en `api/_ia.js`.
- **Esquemas de respuesta de Gemini**: todos los campos deben ir como `required`, aunque no apliquen en cada turno (los vacíos, como cadena vacía). Con campos opcionales, el modelo se los salta y llegan planes sin rutina.
- **La reserva de Groq (spec 020) todavía no ha llegado a funcionar**: cuando Gemini se satura y se pasa a Groq, este responde **401** desde Vercel. Diagnóstico del 16 de agosto, con esto YA DESCARTADO:
  - La clave de Vercel es la correcta: su huella SHA-256 coincide con la clave buena, carácter por carácter.
  - Esa clave funciona: la misma petición (mismo modelo, mismo cuerpo, mismo encabezado) devuelve 200 desde fuera de Vercel.
  - El código que corre es el bueno: manda la clave limpia, a la URL correcta, con `Authorization: Bearer`.
  - Los tres modelos de `MODELOS_GROQ` existen y admiten JSON (comprobado contra `/openai/v1/models`).
  
  **Lo único que queda por mirar** es la línea `Groq respondió 401: {...}` en los logs de Vercel: ese mensaje es de Groq y dice el motivo real. Sin él no se puede avanzar. Mientras tanto la app funciona con Gemini y, si Groq falla, se comporta igual que antes de la spec 020.
- **Variables de entorno en Vercel**: `GEMINI_API_KEY`, `GROQ_API_KEY` (reserva de IA, spec 020) y las tres de Cloudinary. Sin la de Groq la app funciona, pero se queda sin red de seguridad cuando Gemini falla.
- **Gemini devuelve 503 cuando está saturado**: no es un fallo del proyecto, es Google diciendo que el modelo está sobrecargado. Pasó el 15 de agosto y tumbó a la vez consejo, consulta y planes especializados. Desde entonces `api/_ia.js` reintenta tres veces (2 s, 4 s, 6 s) y, si sigue, la app dice que la IA está saturada en vez de un "no se ha podido" que no explica nada. Antes de buscar un bug propio, comprobar el código que sale en pantalla.
- **Cuota gratuita de Gemini**: se agota depurando a base de despliegues. Pensar antes de probar en producción.
- **Todo está en Vercel**: web y funciones, mismo dominio. GitHub Pages se descartó y está desactivado.
- **La lista blanca de emails vive en tres sitios**: `js/firebase-config.js`, `firestore.rules` y `api/_auth.js`. Al añadir a alguien hay que tocar los tres.
- **Los cupos diarios** (5 consejos, 2 consultas) se cuentan sobre los documentos guardados, así que borrar datos los reinicia. Es conocido y aceptado.

## Pendiente de decidir por el usuario

- `PRODUCTO.md` llama "collage de evolución" a lo que es una cuadrícula de miniaturas. O se cambia la palabra, o se hace el collage de verdad en v2.

El resto de ideas sueltas, en `docs/BACKLOG.md`.
