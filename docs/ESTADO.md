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

## Qué toca ahora

La v2 se acordó hacerla entera, en este orden (`docs/propuestas/v2-usabilidad-y-gamificacion.md`, apartado 9):

El orden se ha ido reordenando sobre la marcha a petición del usuario. Lo que queda:

1. **Pantalla "Hoy"**: lo apuntado hoy de un vistazo, repetir comida ("lo de siempre") y el **calendario de constancia**. El calendario ya está programado y probado en la spec 008 (`calendarioDeConstancia()` en `js/grafica.js`, `dibujarCalendario()` y `textoDeCasilla()` en `js/grafica-svg.js`, y sus estilos en `styles.css`): esta spec solo tiene que colgarlo de la pantalla nueva.
2. **Rediseño visual** en dirección "nocturna deportiva" (oscura de serie, coral y cian) **con navegación inferior** en móvil. Urge: ya hay **siete pestañas** apelotonadas en dos filas, y la de "Hoy" serán ocho.
3. Detalle nutricional automático por IA: grupos de alimentos y calorías en rango, con una llamada al día.
4. Puntos, rachas con día de gracia y emblemas.

Ya hechas de la v2: ajustes y reinicio (006), editar registros (007) y la gráfica de peso (008).

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
- **Cuota gratuita de Gemini**: se agota depurando a base de despliegues. Pensar antes de probar en producción.
- **Todo está en Vercel**: web y funciones, mismo dominio. GitHub Pages se descartó y está desactivado.
- **La lista blanca de emails vive en tres sitios**: `js/firebase-config.js`, `firestore.rules` y `api/_auth.js`. Al añadir a alguien hay que tocar los tres.
- **Los cupos diarios** (5 consejos, 2 consultas) se cuentan sobre los documentos guardados, así que borrar datos los reinicia. Es conocido y aceptado.

## Pendiente de decidir por el usuario

- `PRODUCTO.md` llama "collage de evolución" a lo que es una cuadrícula de miniaturas. O se cambia la palabra, o se hace el collage de verdad en v2.

El resto de ideas sueltas, en `docs/BACKLOG.md`.
