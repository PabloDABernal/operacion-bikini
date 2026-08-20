# 032 — Elegir el proveedor de IA desde Ajustes

- **Estado:** en implementación (código en `main`, `revisor-codigo` con veredicto CUMPLE el 2026-08-19). Pendiente de que el usuario la pruebe.
- **Fecha:** 2026-08-19
- **Referencia en PRODUCTO.md:** "Qué explícitamente NO hace", la línea sobre no entrenar modelos propios (usa Gemini y Groq como reserva). Necesita actualizarse — ver sección 10.

## 1. Objetivo

Desde Ajustes, cada usuario puede elegir que sus peticiones a la IA prueben primero Groq en vez de Gemini, para poder probar la reserva a propósito sin depender de que Gemini falle solo (spec 020). Si el elegido en primer lugar falla, se sigue cayendo al otro: la red de seguridad no desaparece.

## 2. Criterio de "esto funciona"

1. En **Ajustes**, hay un desplegable nuevo **"Proveedor de IA"** con dos opciones: **"Automático (recomendado)"** y **"Probar Groq primero"**.
2. Cambiar la opción la guarda al momento (sin botón "Guardar" aparte, y sin tocar el resto del formulario de Ajustes).
3. Con **"Automático"** (el valor por defecto): las cuatro funciones de IA —Pasar consulta, dieta, tabla de ejercicio y análisis nutricional— prueban Gemini primero y caen a Groq si Gemini responde 429, 503 o 5xx, si no se puede alcanzar, o si su respuesta no se puede interpretar. **Esto corrige un bug preexistente** (ver sección 8): hoy, si Gemini es inalcanzable por red, la petición falla directamente sin probar Groq, al revés de lo que la spec 020 pretendía. A partir de esta spec, "Automático" sí tiene red de seguridad también en ese caso. En lo demás, ningún cambio: Gemini sigue yendo primero y un 400 sigue sin saltar de proveedor.
4. Con **"Probar Groq primero"**: esas mismas cuatro funciones prueban Groq primero, y caen a Gemini exactamente con las mismas condiciones (429, 503, 5xx, inalcanzable, o respuesta no interpretable). Un 400 no salta de proveedor, igual que en "Automático".
5. Recargar la página o volver a entrar mantiene la opción elegida: se guarda en el documento del usuario, no en el navegador.
6. Si Groq no tiene clave configurada (`GROQ_API_KEY` ausente en Vercel) y el usuario tiene elegido "Probar Groq primero", la petición cae a Gemini directamente, con el mismo aviso de "sin clave" que ya existe hoy para la reserva automática.

## 3. Alcance

### Entra

- El desplegable en Ajustes, con guardado inmediato al cambiar.
- El campo nuevo en el documento de ajustes del usuario.
- Pasar ese valor a las cuatro funciones de IA (`api/consulta.js`, `api/dieta.js`, `api/tabla.js`, `api/analisis.js`) a través de sus llamadas desde `js/conversacion.js`, `js/consulta.js`, `js/dietas.js`, `js/tablas.js` y `js/analisis.js`.
- En `api/_ia.js`, reestructurar `generarJson()` para que pueda intentar los proveedores en cualquier orden. **Esto no es un simple intercambio de qué función se llama primero**: hoy la interpretación de una respuesta *correcta* solo sabe leer el formato de Gemini (`candidates[0].content.parts[0].text`); la de Groq solo se interpreta dentro del camino de reserva, con `jsonDeGroq()` (formato `choices[0].message.content`). Para invertir el orden de verdad, cada proveedor necesita su propia función de "intentar y devolver un resultado interpretado" — ver diseño en la sección 4.
- Actualizar `docs/PRODUCTO.md` con el texto de la sección 10.

### NO entra (explícitamente fuera)

- **Un tercer proveedor de IA**: sigue siendo Gemini y Groq, nada más. Está en `docs/BACKLOG.md` como idea aparte.
- **Forzar un proveedor sin red de seguridad** ("Solo Groq, y si falla que falle"): decisión tomada de mantener siempre la caída al otro.
- **Elegir el proveedor función por función** (una cosa para dieta, otra para consulta): la elección es una sola, para las cuatro.
- **Ver en pantalla qué proveedor respondió realmente** a una petición concreta: eso ya se ve en los logs de Vercel (`console.log` con el proveedor y modelo), no hace falta pantalla nueva.
- **Cambiar el orden de los modelos dentro de cada proveedor** (`MODELOS`, `MODELOS_GROQ`): eso sigue siendo automático, esta spec solo elige entre Gemini y Groq.

## 4. Comportamiento detallado

### El desplegable

Vive en **Ajustes**, en una sección propia **"Proveedor de IA"**, separada del formulario "Mi objetivo" (que ya tiene su propio botón "Guardar" y sus propias validaciones: mezclar los dos formularios complicaría ambos sin necesidad).

Opciones, en este orden:
- `automatico` — **"Automático (recomendado)"**, valor por defecto.
- `groq-primero` — **"Probar Groq primero"**.

Al cambiar el valor, se guarda inmediatamente (sin esperar a que el usuario pulse nada más) y se ve un aviso breve de "Guardado" que desaparece solo, igual que otros avisos de la app.

### Qué pasa en el servidor

Las cuatro funciones (`api/consulta.js`, `api/dieta.js`, `api/tabla.js`, `api/analisis.js`) ya llaman todas a `generarJson(res, cuerpo, etiqueta)`. Esta pasa a aceptar un cuarto parámetro `proveedor` (`"automatico"` por defecto, o `"groq-primero"`), leído del cuerpo de la petición. Cualquier valor que no sea uno de esos dos se trata como `"automatico"` (casilla de seguridad: no hay forma de que llegue otra cosa desde el desplegable, pero el servidor no confía en lo que mande el navegador).

**El contrato externo de `generarJson()` no cambia**: sigue devolviendo el JSON ya parseado, o `null` tras haber respondido ella misma el error. Lo que cambia es su interior, para que Gemini y Groq sean intercambiables:

1. Se extraen dos funciones nuevas, `intentarGemini(cuerpo, etiqueta)` e `intentarGroq(cuerpo, etiqueta)`, cada una responsable de **llamar a su proveedor e interpretar su propio formato de respuesta** (Gemini: `candidates[0].content.parts[0].text`; Groq: `jsonDeGroq()`, que ya existe). Cada una devuelve siempre la misma forma: `{ ok: true, json }` si todo fue bien, o `{ ok: false, mereceReserva, motivo, estado }` si no — nunca escriben en `res` directamente, para que la decisión de qué responder al navegador quede en un solo sitio.
2. `mereceReserva` es `true` cuando: el proveedor responde 429, 503 o ≥500; no tiene clave configurada; no se puede alcanzar (fallo de red); o su respuesta no se puede interpretar (JSON ilegible, o sin el texto esperado). Es la unión de lo que hoy ya dispara la reserva de Gemini→Groq por código de estado, **más** los dos casos que la spec 020 pretendía cubrir y el código nunca llegó a implementar (inalcanzable, respuesta ilegible) — ver sección 8. Se aplica igual en los dos sentidos, sea cual sea el proveedor que va primero.
3. `generarJson()` decide el orden (`["gemini", "groq"]` o `["groq", "gemini"]` según `proveedor`), llama al primero, y si falla con `mereceReserva`, llama al segundo. Si el segundo tampoco puede, **el mensaje de error se construye a partir del fallo del primero** (el elegido), y el campo `reserva` de la respuesta describe qué pasó con el segundo — igual que hoy, donde el error es siempre el de Gemini y `reserva` describe qué pasó con Groq.
4. La comprobación de `GEMINI_API_KEY` deja de ser un corte previo obligatorio: pasa a vivir dentro de `intentarGemini()`, que devuelve `{ ok: false, mereceReserva: true, motivo: "sin-clave" }` si falta, igual que ya hace `intentarGroq()` con `GROQ_API_KEY`. Así una petición con "Probar Groq primero" no depende de que Gemini esté configurado para intentarlo primero (hoy es un caso imposible porque Gemini siempre tiene clave en este proyecto, pero deja de estar el código asumiéndolo sin necesidad).
5. Los códigos de error que hoy se llaman `gemini-error` y `gemini-inalcanzable` (los que cubren cualquier fallo que no sea 429/503) pasan a llamarse `ia-error` e `ia-inalcanzable`, sin más cambio: son genéricos por proveedor desde el principio, así que solo hacía falta quitarles el nombre de uno solo. `js/consulta.js` (`mensajeDeFalloDeIa()`) se actualiza para reconocer el prefijo `ia-` en vez de `gemini`. `cuota-agotada`, `ia-saturada` y `respuesta-ilegible` ya eran genéricos y no cambian.

### Qué manda el cliente

Cada una de las cinco llamadas del navegador (`js/conversacion.js`, `js/consulta.js`, `js/dietas.js`, `js/tablas.js`, `js/analisis.js`) añade `proveedor` al cuerpo de su petición, leyendo el valor guardado en los ajustes del usuario (ya cargados en memoria para pintar Ajustes, igual que `pesoObjetivoActual` hoy).

## 5. Modelo de datos

| Ruta | Campo nuevo |
|---|---|
| `usuarios/{uid}` | `proveedorIa` (string: `"automatico"` \| `"groq-primero"`, ausente = `"automatico"`) |

Sin colección nueva. `leerAjustes()` en `js/ajustes.js` devuelve `"automatico"` cuando el campo no existe, para que las cuentas ya creadas no necesiten migración.

## 6. Casos límite

**Referencia única de `mereceReserva`** (para no tener que reconciliar la sección 2 con la 4): dispara la caída al otro proveedor un 429, un 503, un 5xx, la falta de clave, no poder alcanzarlo, o una respuesta que no se pueda interpretar. Un 400 nunca dispara la caída. Es la misma condición en los dos sentidos.

- **Sin `GROQ_API_KEY` configurada y "Probar Groq primero" elegido**: la petición cae a Gemini directamente, con el mismo código `sin-clave` que ya usa la reserva automática hoy.
- **Los dos proveedores fallan**: gana el error del proveedor que se intentó primero (el elegido), con `reserva` describiendo qué pasó con el segundo. Con "Automático" es exactamente el comportamiento de hoy (gana Gemini); con "Probar Groq primero" gana el de Groq.
- **`proveedorIa` llega con un valor que no es ninguno de los dos conocidos** (manipulado a mano, o un valor futuro no soportado todavía): el servidor lo trata como `"automatico"`.
- **Cambiar la opción a media conversación**: no afecta a lo ya respondido, solo a la siguiente petición que se mande.
- **Cambiar la opción y no guardar el resto de Ajustes**: no hay conflicto, es un guardado aparte del formulario "Mi objetivo".
- **Reiniciar datos**: `proveedorIa` vive en el documento de ajustes, no en ninguna colección de las que cubre el reinicio (spec 006/019); no se toca al reiniciar.
- **Cerrar una operación y abrir otra**: `proveedorIa` es una preferencia del usuario, no de la operación (como el nombre o la foto de perfil): se conserva.

## 7. Archivos afectados

| Archivo | Cambio |
|---|---|
| `js/ajustes.js` | `leerAjustes()` devuelve `proveedorIa` con valor por defecto; función nueva para guardarlo suelto (igual que `guardarFotoPerfil()`) |
| `index.html` | sección nueva "Proveedor de IA" en Ajustes, con el desplegable |
| `js/app.js` | pinta el desplegable con el valor guardado, lo guarda al cambiar, y pasa el valor a las cinco llamadas de IA |
| `js/conversacion.js`, `js/consulta.js`, `js/dietas.js`, `js/tablas.js` | añaden `proveedor` al cuerpo de su petición (ya mandan un objeto con `...contexto`/`...extra` donde encaja) |
| `js/analisis.js` | `pedirAnalisisALaIa(uid, comidas)` cambia de firma para aceptar también `proveedor`: hoy es la única de las cinco que no tiene ya un cuerpo abierto a más campos |
| `api/consulta.js`, `api/dieta.js`, `api/tabla.js`, `api/analisis.js` | leen `proveedor` del cuerpo y lo pasan como cuarto argumento a `generarJson()` |
| `api/_ia.js` | `generarJson()` se reestructura en `intentarGemini()` / `intentarGroq()` (cada una llama e interpreta su propio formato) más un orquestador que decide orden y quién gana el error final; `gemini-error`/`gemini-inalcanzable` pasan a `ia-error`/`ia-inalcanzable` |
| `docs/PRODUCTO.md` | texto actualizado, ver sección 10 |

Sin cambios en `firestore.rules` (mismo documento y las mismas reglas que ya cubren `usuarios/{uid}`), ni en `vercel.json`.

**Estimación: ~260-320 líneas.** Por encima de lo calculado al principio: `api/_ia.js` necesita más que un intercambio de orden, ver sección 4. Está en el límite de lo que el proyecto considera una rebanada pequeña (~300 líneas); si al implementar se ve que se dispara, avisar antes de seguir y valorar dejar fuera `js/analisis.js` (el análisis nutricional) para una spec aparte.

## 8. Decisiones tomadas

- **Añadidos durante la prueba manual del usuario (2026-08-19), no previstos en la redacción inicial**:
  - Las respuestas de error (`cuota-agotada`, `ia-saturada`, `respuesta-ilegible`, `ia-inalcanzable`, `ia-error`) llevan ahora un campo `proveedor`, y el código que arma el mensaje en pantalla lo añade entre paréntesis. Al probar "Probar Groq primero" el usuario vio un `cuota-agotada (reserva: http-503)` y sospechó, con razón, que el mensaje no decía quién lo había dado — con dos proveedores elegibles ya no se podía dar por hecho que fuera Gemini.
  - `llamarAGroq()` solo pasaba al siguiente modelo de `MODELOS_GROQ` ante un 404 (modelo inexistente), no ante un 429 (modelo sin cuota). Cada modelo de Groq tiene su propia cuota gratuita, y el primero de la lista (el más grande, `llama-3.3-70b-versatile`) es el más tacaño: un 429 suyo daba por perdido todo Groq sin probar los otros dos, que suelen tener margen de sobra. Ahora un 429 también pasa al siguiente modelo.
- **Desplegable de dos opciones, no tres** → decisión del usuario el 2026-08-19. "Solo Gemini" con la red de seguridad activada se comporta exactamente igual que "Automático" (Gemini ya es el primero hoy, y ya cae a Groq en los mismos casos), así que una tercera opción idéntica a la primera no aportaba nada y solo confundiría.
- **Se cae al otro proveedor igualmente si el elegido falla** → decisión del usuario. Forzar un proveedor sin red de seguridad se descartó: el objetivo es poder *probar* Groq a propósito, no arriesgarse a quedarse sin respuesta por elegir mal.
- **Se aplica a las cuatro funciones de IA, no solo a la conversación** → decisión del usuario.
- **El orden solo cambia entre Gemini y Groq, no las condiciones de cuándo caer al otro** → decisión técnica, para no crear un segundo comportamiento distinto del que ya existe y está probado (spec 020): un 400 sigue sin saltar de proveedor, sea cual sea el orden. La condición (`mereceReserva`) pasa a aplicarse simétricamente a los dos proveedores, en vez de estar escrita solo pensando en Gemini.
- **`generarJson()` se reestructura en dos funciones por proveedor, no en un simple intercambio de orden** → detectado por el agente `revisor-specs` el 2026-08-19: la interpretación de una respuesta correcta solo sabía leer el formato de Gemini, así que invertir el orden literalmente habría hecho que una respuesta *buena* de Groq se leyera como ilegible. Cada proveedor necesita su propia interpretación de éxito y de fallo.
- **`mereceReserva` pasa a incluir "inalcanzable" y "respuesta ilegible", no solo los códigos de estado** → decisión del usuario el 2026-08-19, al detectarlo el `revisor-specs` en su segunda pasada: hoy, si Gemini es inalcanzable por red, la petición falla sin probar Groq, al revés de lo que pedía la spec 020 (que si se lee literalmente, ya contemplaba "no se puede contactar" como motivo de reserva, pero nunca se implementó así). Se arregla de paso porque esta spec ya reestructura ese código entero. **Esto es un cambio de comportamiento reconocido también en "Automático"**, no solo en "Probar Groq primero": antes de esta spec, un fallo de red a Gemini no tenía red de seguridad; después, sí.
- **Cuando fallan los dos, gana el error del proveedor elegido en primer lugar** → decisión técnica, para que "Automático" no cambie de comportamiento (sigue ganando Gemini) y "Probar Groq primero" muestre el error del proveedor que el usuario quería probar, no el del que solo actuó de red de seguridad.
- **`GEMINI_API_KEY` deja de comprobarse por adelantado y pasa a comprobarse dentro de `intentarGemini()`** → decisión técnica, para que "Probar Groq primero" no dependa de una comprobación pensada para cuando Gemini iba siempre primero.
- **Un valor de `proveedorIa` desconocido se trata como `"automatico"`** → decisión técnica: el servidor no confía en lo que mande el navegador para decidir un comportamiento con consecuencias (a qué proveedor se manda la petición).
- **Vive en el documento de ajustes del usuario, no en el navegador** → decisión técnica, coherente con el resto de preferencias de la app (nombre, foto, objetivo): así se mantiene entre dispositivos y sesiones.

## 9. Fuera de spec: ideas apuntadas

- Un tercer proveedor de IA si Gemini y Groq se quedan cortos. → ya estaba en `docs/BACKLOG.md`.
- Ver en pantalla qué proveedor respondió a cada petición concreta (más allá de los logs de Vercel). → `docs/BACKLOG.md`.

## 10. Actualización propuesta de PRODUCTO.md

La línea actual, en "Qué explícitamente NO hace":

> No entrena modelos propios: usa APIs de IA de terceros tal cual (Google Gemini y, cuando este falla, Groq como reserva).

Pasaría a:

> No entrena modelos propios: usa APIs de IA de terceros tal cual (Google Gemini por defecto, con Groq como reserva automática si falla; desde Ajustes cada usuario puede elegir probar Groq primero).

**Confirmado por el usuario el 2026-08-19 y ya aplicado en `docs/PRODUCTO.md`.**

## ✅ Para probar a mano

En https://operacion-bikini.vercel.app, con la operación en marcha.

### Desplegable visible en Ajustes (criterio 1)

1. Entra en **Ajustes**. Baja hasta la sección **"Proveedor de IA"**, debajo de "Mi objetivo". Debería haber un desplegable **"Cuál se prueba primero"** con dos opciones: **"Automático (recomendado)"** y **"Probar Groq primero"**.

### Guardado inmediato (criterio 2)

2. Abre el desplegable. Cambia de "Automático (recomendado)" a "Probar Groq primero". Debería ver un aviso breve **"Guardado"** que aparece y desaparece solo, sin pulsar ningún botón más.
3. Vuelve a cambiar a "Automático (recomendado)". Debería ver otra vez el aviso "Guardado" inmediato.

### Persistencia al recargar (criterio 5)

4. Asegúrate de que tienes elegido "Probar Groq primero". Recarga la página (F5 o Cmd+R). Después de que cargue, entra otra vez en **Ajustes → Proveedor de IA**: el desplegable debe seguir mostrando "Probar Groq primero" — la opción se ha guardado en tu perfil, no solo en el navegador.

### Las cuatro funciones de IA siguen funcionando con las dos opciones (criterios 3, 4)

**Con "Automático (recomendado)":**

5. En Ajustes, elige "Automático (recomendado)". Ve a **Consulta** y envía un mensaje corto (o inicia una consulta si no la tienes en marcha). Debería llegar la respuesta sin errores.
6. Ve a **Comidas → Hacer dieta**. Pide una dieta (con o sin instrucciones). Debería llegar el plan con los **7 días de la semana completos**, cada uno con sus comidas — no vacío ni incompleto.
7. Ve a **Ejercicio → Tabla de ejercicios**. Pide una tabla. Debería llegar con los **7 días de la semana completos**, cada uno con su rutina.
8. Ve a **Hoy → Analizar lo que llevo hoy** (si te queda cupo). Debería llegar el análisis sin errores.

**Con "Probar Groq primero":**

9. En Ajustes, cambia a "Probar Groq primero" (verás "Guardado"). Repite los pasos 5-8: mensaje en Consulta, dieta, tabla, análisis. Las cuatro deben responder igual de bien. **Lo importante es que los datos llegan completos**: la dieta y la tabla con los 7 días, no vacías — es justo el bug que tuvo Groq con la dieta en la spec 028, y esta spec toca ese mismo camino de código.

### Cambiar la opción a media conversación (caso límite)

10. En una **consulta en marcha**, envía un mensaje. Sin cerrar la consulta, ve a Ajustes y cambia el proveedor. Vuelve a Consulta y envía otro mensaje. Ambos deberían llegar sin problemas.

### Regresión: los dos formularios de Ajustes no se pisan (criterio 2)

11. En **Ajustes**, cambia algo en **"Mi objetivo"** (nombre, peso objetivo o altura) y guarda con su botón "Guardar". Entra otra vez en **Ajustes → Proveedor de IA** y comprueba que tu opción elegida **no ha cambiado**: se guardan por separado.

### Lo que no se puede forzar hoy en producción

Estos casos no tienen pasos porque no hay forma de provocarlos desde la app; ya se comprobaron con una simulación de `fetch` durante la implementación, con resultado correcto en los seis escenarios probados (éxito directo, caída por 503 en los dos sentidos, un 400 que no cae, y quién gana el error cuando fallan los dos proveedores):

- Gemini o Groq inalcanzables por red, o su clave sin configurar en Vercel.
- Una respuesta que no se pueda interpretar.
- Un 400 que no debe saltar de proveedor en ningún sentido.

Si algún día uno de estos pasa de verdad en producción, el mensaje en pantalla y los logs de Vercel (`console.error`) deberían bastar para diagnosticarlo sin sorpresas.
