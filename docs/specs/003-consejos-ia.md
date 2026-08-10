# 003 — Botón "Consejos" (primera integración con IA)

- **Estado:** revisada
- **Fecha:** 2026-08-10
- **Referencia en PRODUCTO.md:** líneas 18, 20 y 36 (botón "Consejos", disclaimer de IA, concepto "Consejo").
- **Depende de:** specs 001 y 002, completadas.

## 1. Objetivo

Que el usuario pulse **"Consejos"** y reciba, en menos de un minuto, un análisis escrito por la IA de sus últimos 14 días de pesajes, comidas y ejercicio, con pautas concretas. Los consejos quedan guardados y se pueden releer.

Esta spec monta además toda la infraestructura de IA del proyecto: función serverless en Vercel que hace de proxy hacia Gemini. Las specs posteriores que usen IA reutilizarán ese proxy.

## 2. Criterio de "esto funciona"

Probado en https://operacion-bikini.vercel.app (la app pasa a servirse desde Vercel, ver `docs/ARQUITECTURA.md`):

1. Entro y veo una cuarta pestaña: **Consejos**.
2. Al pie de la pantalla veo siempre el disclaimer: los consejos los genera una IA y no sustituyen a un médico.
3. Pulso **"Pedir consejo"** → el botón se deshabilita y aparece `Pensando…`.
4. En menos de 30 segundos aparece un consejo con tres apartados: **Qué veo**, **Qué hacer esta semana** y **Ojo con esto**. El texto menciona datos míos de verdad (mi peso, algo que he comido, algún ejercicio), no genéricos.
5. Recargo (F5) → el consejo sigue ahí, en la lista de consejos anteriores, con su fecha y hora.
6. Pido un segundo consejo → aparece arriba del anterior; los dos se conservan.
7. Entro con la otra cuenta → no veo ningún consejo de la primera; pido uno y habla de *sus* datos.
8. Pido 5 consejos en el mismo día y pruebo el sexto → sale `Ya has pedido consejos 5 veces hoy. Vuelve mañana.` y no se llama a la IA.
9. Un usuario sin sesión que llame directamente a la URL del proxy (con `curl` o desde la barra del navegador) recibe un error de autorización y **no** consume cuota de Gemini.
10. Si aún no tengo ningún dato apuntado, al pedir consejo sale `Apunta al menos un pesaje, una comida o un ejercicio antes de pedir consejo.` y no se llama a la IA.

## 3. Alcance

### Entra

- Pestaña **Consejos** con botón "Pedir consejo", el consejo más reciente y el historial de los anteriores.
- Función serverless en Vercel (`api/consejo.js`) que recibe la petición del navegador, valida quién la hace y llama a Gemini con la clave guardada en el servidor.
- Validación en el proxy de que quien llama tiene sesión de Firebase válida y está en la lista blanca.
- Límite de 5 consejos por usuario y día.
- Guardado de los consejos en Firestore.
- Disclaimer visible de forma permanente en la pantalla principal.

### NO entra (explícitamente fuera)

- Botón "Pasar consulta" y generación de planes (spec posterior, reutilizará este proxy).
- Fotos de progreso y Cloudinary.
- Que la IA lea los consejos anteriores para no repetirse: en esta spec cada consejo se genera solo con los datos de los 14 días.
- Borrar consejos.
- Respuesta en streaming (palabra a palabra): el consejo aparece de golpe cuando está completo.
- Elegir el modelo o ajustar el tono desde la app.
- Traducción o soporte multiidioma: todo en español.

## 4. Comportamiento detallado

### 4.1 Pestaña Consejos

- Cuarta pestaña, a la derecha de Ejercicio. Se añade sobre la estructura de la spec 002 **sin renombrar** los `id` ni las clases existentes (`pestanas`, `.pestana`, `.seccion`, `data-seccion`, y todos los `id` de peso, comidas y ejercicio): `js/app.js` los referencia y cambiarlos rompería las specs 001 y 002 en silencio.
- Con cuatro pestañas en una pantalla de móvil el texto puede no caber. Las pestañas deben poder encogerse o partirse en dos filas, nunca provocar scroll horizontal.
- Botón `Pedir consejo`.
- Debajo, la lista de consejos, del más reciente al más antiguo. Cada uno muestra fecha y hora (`DD/MM/AAAA HH:MM`) y los tres apartados.
- Estado vacío: `Aún no has pedido ningún consejo.`
- Mientras se genera: el botón se deshabilita y aparece `Pensando…`. Puede tardar hasta un minuto.

### 4.2 Disclaimer

Texto fijo, siempre visible al pie de la pantalla principal (en todas las pestañas), en letra pequeña. Va **al final del flujo de la página**, no anclado a la ventana: un pie fijo taparía contenido en el móvil, y la spec 002 ya dejó pendiente una revisión de aspecto en pantalla pequeña.

> Los consejos y planes de esta app los genera una inteligencia artificial y pueden ser inexactos. No sustituyen a un médico o nutricionista. Ante dudas, molestias o falta de resultados, consulta a un profesional.

### 4.3 Qué se le manda a la IA

El navegador recoge de Firestore los pesajes, comidas y ejercicios **de los últimos 14 días** (fecha de hoy incluida) y los manda al proxy junto con su credencial de sesión. El proxy construye el prompt y llama a Gemini.

El prompt le pide a la IA que:
- Responda siempre en español, en tono cercano y directo, tuteando.
- Use exclusivamente los datos recibidos, sin inventar mediciones que no estén.
- Devuelva exactamente tres apartados: **Qué veo**, **Qué hacer esta semana**, **Ojo con esto**.
- No dé diagnósticos médicos ni hable de enfermedades; si detecta algo preocupante, recomiende ir al médico.
- Sea breve: máximo unas 200 palabras en total.

### 4.4 Errores

| Situación | Mensaje |
|---|---|
| Sin datos en los últimos 14 días | `Apunta al menos un pesaje, una comida o un ejercicio antes de pedir consejo.` |
| Ya se han pedido 5 hoy | `Ya has pedido consejos 5 veces hoy. Vuelve mañana.` |
| Cuota de Gemini agotada (429) | `La IA ha alcanzado su límite diario gratuito. Prueba mañana.` |
| Fallo de red o proxy caído | `No se ha podido pedir el consejo. Inténtalo de nuevo.` |
| Respuesta de la IA vacía o ilegible | `La IA no ha sabido responder. Inténtalo de nuevo.` |
| Sesión caducada al pedir el consejo | Vuelve al login, como en el resto de la app. |

En todos los casos de error el botón se vuelve a habilitar y no se guarda nada.

## 5. Seguridad del proxy

Punto crítico de la spec: la clave de Gemini vive **solo** en Vercel, nunca en el navegador ni en el repositorio (que es público).

- La clave se guarda como variable de entorno `GEMINI_API_KEY` en el panel de Vercel.
- El navegador manda en cada petición el **ID token** de Firebase del usuario con sesión iniciada.
- El proxy valida ese token contra Google antes de llamar a Gemini, y comprueba que el email resultante está en la lista blanca. Si falla cualquiera de las dos cosas, responde `401` y no llama a Gemini.
- La validación se hace contra el endpoint público de **Google Identity Toolkit** (`accounts:lookup`, pasando el ID token y la `apiKey` pública del proyecto). No requiere el SDK de Firebase Admin, ni clave de cuenta de servicio, ni plan Blaze. La única variable de entorno secreta en Vercel es `GEMINI_API_KEY`.
- El proxy compara el email **en minúsculas**, igual que el cliente y las reglas de Firestore. Si no, un usuario válido con el email en otra capitalización entraría en la app pero el proxy le rechazaría sin explicación clara — el mismo fallo silencioso que ya se evitó en la spec 001.
- La web y el proxy se sirven desde el mismo dominio de Vercel, así que la llamada es del mismo origen y no hace falta configurar CORS. La única barrera es la validación del token, que es la que de verdad protege la cuota.
- La lista blanca queda ahora en **tres** sitios: cliente, reglas de Firestore y proxy. Al añadir a alguien hay que tocar los tres y volver a desplegar los tres.

El límite de 5 al día se cuenta en el cliente sobre los consejos guardados en Firestore. Es evitable por alguien que manipule el navegador, pero para llegar ahí ya hay que estar en la lista blanca: protege de un despiste, no de un ataque.

La cuota gratuita de Gemini es **compartida entre los dos usuarios**: si uno la agota (por un bug, o por tener dos pestañas abiertas saltándose la cuenta), el otro verá `La IA ha alcanzado su límite diario gratuito. Prueba mañana.` hasta que Google la reinicie al día siguiente. No hay reparto por usuario ni aviso previo; se asume porque el límite de 5/día deja mucho margen frente a la cuota real.

## 6. Modelo de datos

```
usuarios/{uid}/consejos/{consejoId}
  queVeo: string
  queHacer: string
  ojoCon: string
  creadoEn: timestamp
```

Reglas de Firestore: misma protección que el resto de subcolecciones (`uid` propio + email en la lista blanca).

## 7. Casos límite

- **La IA no respeta los tres apartados**: si la respuesta no se puede partir en los tres, se muestra `La IA no ha sabido responder. Inténtalo de nuevo.` y no se guarda.
- **Respuesta muy larga**: se muestra entera, sin recortar.
- **Petición lenta**: el cliente espera hasta 30 segundos; pasado ese tiempo, `No se ha podido pedir el consejo. Inténtalo de nuevo.` La función de Vercel declara `maxDuration` de 60 s para tener más margen que el cliente.
- **Doble clic en "Pedir consejo"**: el botón se deshabilita al primer clic, no se puede pedir dos veces a la vez.
- **Cambiar de pestaña mientras se genera**: el consejo termina igual y aparece al volver.
- **Datos con texto raro** (comillas, saltos de línea, emojis): se mandan tal cual, sin romper el prompt.

## 8. Archivos afectados

- `api/consejo.js` — nuevo: función serverless (validación de token, lista blanca, prompt, llamada a Gemini).
- `vercel.json` — nuevo: configuración mínima del despliegue.
- `js/consejos.js` — nuevo: llamada al proxy, guardado y listado en Firestore.
- `index.html` — modificar: cuarta pestaña y disclaimer.
- `styles.css` — modificar: estilos del consejo y del disclaimer.
- `js/app.js` — modificar: enganchar la pestaña.
- `firestore.rules` — modificar: subcolección `consejos`.
- `docs/ARQUITECTURA.md` — modificar: fijar Vercel (frente a Netlify), el modelo concreto de Gemini y la lista blanca triplicada.

## 9. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| Historial de 14 días | Suficiente para ver tendencia de peso sin inflar el prompt ni la cuota. |
| Tres apartados fijos | Se lee mejor y permite detectar cuándo la IA se va por las ramas. |
| Consejos guardados en Firestore | Poder releerlos y ver la evolución. |
| Máximo 5 al día por usuario | La cuota gratuita de Gemini es compartida entre los dos usuarios. |
| El proxy valida el token de Firebase | Sin eso, cualquiera con la URL del proxy gasta la cuota gratuita. El repo es público: la URL se puede leer. |
| Sin streaming | Bastante más código en el proxy y en el cliente para un consejo de 200 palabras. |

| **Vercel**, no Netlify | Decidido por el usuario. Netlify gratuito corta las funciones a 10 s sin poder ampliarlo; Vercel gratuito permite declarar hasta 60 s en `vercel.json`. Un consejo tarda ~5 s, pero el margen evita fallos en días lentos. |
| **Gemini Flash**, no Flash Lite | Decidido por el usuario: mejor calidad de consejo y más fiable respetando el formato de tres apartados. El nombre exacto del modelo y su cuota gratuita se verifican en la documentación de Google al implementar, porque cambian sin aviso. |
| Espera máxima de 30 s en el cliente, `maxDuration` de 60 s en la función | La función tiene más margen que el cliente, así que un corte se ve siempre como error limpio del navegador y nunca como una función colgada consumiendo cuota. |
| El token se valida contra el endpoint público de Google Identity Toolkit | No hace falta el SDK de Firebase Admin ni una clave de cuenta de servicio: bastan la `apiKey` pública y una llamada HTTP. Menos secretos que guardar en Vercel y ninguna dependencia que instalar. |

## 10. Fuera de spec: ideas apuntadas

- Que la IA lea los consejos anteriores para no repetirse.
- Streaming de la respuesta.

## ✅ Para probar a mano

Ver apartado 2. Incluye probar el punto 9 (llamar al proxy sin sesión) con `curl`, que es el que verifica que la clave de Gemini está protegida.
