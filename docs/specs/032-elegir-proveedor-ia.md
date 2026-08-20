# 032 — Elegir el proveedor de IA desde Ajustes

- **Estado:** borrador
- **Fecha:** 2026-08-19
- **Referencia en PRODUCTO.md:** "Qué explícitamente NO hace", la línea sobre no entrenar modelos propios (usa Gemini y Groq como reserva). Necesita actualizarse — ver sección 10.

## 1. Objetivo

Desde Ajustes, cada usuario puede elegir que sus peticiones a la IA prueben primero Groq en vez de Gemini, para poder probar la reserva a propósito sin depender de que Gemini falle solo (spec 020). Si el elegido en primer lugar falla, se sigue cayendo al otro: la red de seguridad no desaparece.

## 2. Criterio de "esto funciona"

1. En **Ajustes**, hay un desplegable nuevo **"Proveedor de IA"** con dos opciones: **"Automático (recomendado)"** y **"Probar Groq primero"**.
2. Cambiar la opción la guarda al momento (sin botón "Guardar" aparte, y sin tocar el resto del formulario de Ajustes).
3. Con **"Automático"** (el valor por defecto, igual que hoy): las cuatro funciones de IA —Pasar consulta, dieta, tabla de ejercicio y análisis nutricional— prueban Gemini primero y caen a Groq solo si Gemini responde 429, 503 o 5xx. Ningún cambio de comportamiento respecto a hoy.
4. Con **"Probar Groq primero"**: esas mismas cuatro funciones prueban Groq primero, y caen a Gemini si Groq falla (network, no-ok, o JSON ilegible).
5. Recargar la página o volver a entrar mantiene la opción elegida: se guarda en el documento del usuario, no en el navegador.
6. Si Groq no tiene clave configurada (`GROQ_API_KEY` ausente en Vercel) y el usuario tiene elegido "Probar Groq primero", la petición cae a Gemini directamente, con el mismo aviso de "sin clave" que ya existe hoy para la reserva automática.

## 3. Alcance

### Entra

- El desplegable en Ajustes, con guardado inmediato al cambiar.
- El campo nuevo en el documento de ajustes del usuario.
- Pasar ese valor a las cuatro funciones de IA (`api/consulta.js`, `api/dieta.js`, `api/tabla.js`, `api/analisis.js`) a través de sus llamadas desde `js/conversacion.js`, `js/consulta.js`, `js/dietas.js`, `js/tablas.js` y `js/analisis.js`.
- En `api/_ia.js`, la función que ahora mismo siempre prueba Gemini primero pasa a poder invertir el orden cuando se lo pidan, manteniendo la misma lógica de caída al otro proveedor que ya existe (mismos códigos de estado que disparan la reserva).
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

Las cuatro funciones (`api/consulta.js`, `api/dieta.js`, `api/tabla.js`, `api/analisis.js`) ya llaman todas a `generarJson()` en `api/_ia.js`. Esta pasa a aceptar un parámetro `proveedor` (`"automatico"` por defecto, o `"groq-primero"`), leído del cuerpo de la petición.

Con `"groq-primero"`, el orden de intento se invierte (Groq primero, Gemini como reserva), pero la lógica de cuándo caer al otro proveedor es la misma que hoy: solo ante fallos de verdad (red, HTTP que no sea 2xx, JSON no interpretable), nunca ante un 400, que sigue significando "la petición está mal formada" y no "prueba con el otro".

### Qué manda el cliente

Cada una de las cinco llamadas del navegador (`js/conversacion.js`, `js/consulta.js`, `js/dietas.js`, `js/tablas.js`, `js/analisis.js`) añade `proveedor` al cuerpo de su petición, leyendo el valor guardado en los ajustes del usuario (ya cargados en memoria para pintar Ajustes, igual que `pesoObjetivoActual` hoy).

## 5. Modelo de datos

| Ruta | Campo nuevo |
|---|---|
| `usuarios/{uid}` | `proveedorIa` (string: `"automatico"` \| `"groq-primero"`, ausente = `"automatico"`) |

Sin colección nueva. `leerAjustes()` en `js/ajustes.js` devuelve `"automatico"` cuando el campo no existe, para que las cuentas ya creadas no necesiten migración.

## 6. Casos límite

- **Sin `GROQ_API_KEY` configurada y "Probar Groq primero" elegido**: la petición cae a Gemini directamente, con el mismo código `sin-clave` que ya usa la reserva automática hoy.
- **Los dos proveedores fallan**: se ve el mismo error que hoy cuando falla la reserva automática (el de Gemini gana, por ser el que mejor explica qué pasó, según la lógica ya existente en `generarJson()`).
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
| `js/conversacion.js`, `js/consulta.js`, `js/dietas.js`, `js/tablas.js`, `js/analisis.js` | añaden `proveedor` al cuerpo de su petición |
| `api/consulta.js`, `api/dieta.js`, `api/tabla.js`, `api/analisis.js` | leen `proveedor` del cuerpo y lo pasan a `generarJson()` |
| `api/_ia.js` | `generarJson()` acepta `proveedor` e invierte el orden Gemini/Groq cuando toca, reutilizando la lógica de caída ya existente |
| `docs/PRODUCTO.md` | texto actualizado, ver sección 10 |

Sin cambios en `firestore.rules` (mismo documento y las mismas reglas que ya cubren `usuarios/{uid}`), ni en `vercel.json`.

**Estimación: ~180-220 líneas.** Dentro del límite de la spec pequeña.

## 8. Decisiones tomadas

- **Desplegable de dos opciones, no tres** → decisión del usuario el 2026-08-19. "Solo Gemini" con la red de seguridad activada se comporta exactamente igual que "Automático" (Gemini ya es el primero hoy, y ya cae a Groq en los mismos casos), así que una tercera opción idéntica a la primera no aportaba nada y solo confundiría.
- **Se cae al otro proveedor igualmente si el elegido falla** → decisión del usuario. Forzar un proveedor sin red de seguridad se descartó: el objetivo es poder *probar* Groq a propósito, no arriesgarse a quedarse sin respuesta por elegir mal.
- **Se aplica a las cuatro funciones de IA, no solo a la conversación** → decisión del usuario.
- **El orden solo cambia entre Gemini y Groq, no las condiciones de cuándo caer al otro** → decisión técnica, para no crear un segundo comportamiento distinto del que ya existe y está probado (spec 020): un 400 sigue sin saltar de proveedor, sea cual sea el orden.
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

(El agente `qa-manual` lo afina antes de la prueba, con los pasos concretos.)
