# 020 — Proveedor de IA de reserva (Groq)

- **Estado:** completada (validada por el usuario el 2026-08-17)
- **Fecha:** 2026-08-16
- **Referencia en PRODUCTO.md / ARQUITECTURA.md:** ambos dicen hoy que la IA es Google Gemini. Se amplían para reflejar que hay un segundo proveedor de reserva (apartado 8).

## 1. Objetivo

Que un mal día de Google no deje la app sin IA. Cuando Gemini responde que está saturado o que se acabó la cuota, la petición se reintenta contra **Groq**, que es otra empresa con otra infraestructura y otra cuota gratuita.

## 2. Criterio de "esto funciona"

1. Con Gemini funcionando, todo sigue igual que hasta ahora: consejos, consultas y planes especializados salen de Gemini.
2. Con Gemini saturado (503) o sin cuota (429), la petición **no falla**: la responde Groq y el usuario no se entera de nada.
3. En los registros de Vercel se ve qué proveedor respondió cada petición.
4. Si fallan **los dos**, el mensaje en pantalla sigue siendo el de siempre: la IA está saturada, prueba en un rato.
5. Sin `GROQ_API_KEY` configurada, la app se comporta exactamente como antes de esta spec: solo Gemini, y su error si falla.
6. Un plan generado por Groq se guarda y se ve igual que uno de Gemini: mismos campos, misma pantalla.
7. La entrevista respondida por Groq sigue devolviendo **una pregunta por turno** y termina dando el plan.

## 3. Alcance

### Entra

- Segundo proveedor, **Groq**, con su clave en una variable de entorno propia.
- **Traducción** de la petición: el código de la app habla en el formato de Gemini, y se convierte al formato de Groq (compatible con el de OpenAI) en un solo sitio.
- **Cascada**: primero Gemini; si responde 429, 503 o cualquier error de servidor, se prueba Groq.
- **Tolerancia al JSON flojo**: los modelos abiertos siguen peor un esquema. La respuesta de Groq se completa con cadenas vacías en los campos que falten, para que el resto del código no tenga que cambiar.
- Registro en los logs de qué proveedor respondió.

### NO entra (explícitamente fuera)

- **Elegir proveedor desde la app**: no hay ajuste ni botón. La cascada es automática.
- **Un tercer proveedor.**
- **Usar Groq como principal**: Gemini sigue siendo el primero mientras funcione.
- **Cambiar los prompts** de consejo, consulta o planes: se mandan tal cual.
- **Cachear respuestas** ni contar cuota por proveedor.
- **Cambiar los cupos diarios** (5 consejos, 2 consultas): siguen contándose igual, sin importar quién responda.

## 4. Comportamiento detallado

### La cascada

`generarJson()` en `api/_ia.js` pasa a:

1. Llamar a **Gemini**, como hasta ahora, con su cascada de modelos.
2. Si responde bien, se usa esa respuesta.
3. Si responde **429, 503 o 5xx**, o no se puede contactar, se llama a **Groq**.
4. Si Groq responde bien, se usa su respuesta.
5. Si Groq también falla, se devuelve el error como hasta ahora: `cuota-agotada` si el problema era de cuota, `ia-saturada` si era de saturación.

**Se quitan los reintentos por saturación** que introdujo el arreglo del 15 de agosto: esperar 2 y 4 segundos para volver a preguntar a quien acaba de decir que está saturado tiene menos sentido que preguntarle a otro. Además, aquellas esperas se comían el tiempo del navegador.

Un error **400** de Gemini no salta a Groq: significa que la petición está mal, y mandársela a otro no la arregla.

### La traducción

El resto del código (consejo, consulta, plan) sigue construyendo la petición en formato Gemini. La conversión vive solo en `api/_ia.js`:

| Gemini | Groq |
|---|---|
| `systemInstruction.parts[].text` | primer mensaje con `role: "system"` |
| `contents[]` con `role: "user"` / `"model"` | mensajes con `role: "user"` / `"assistant"` |
| `generationConfig.responseSchema` | `response_format: { type: "json_object" }` más una descripción del formato añadida al mensaje de sistema |

Groq no acepta un esquema como tal, así que **los campos obligatorios se le piden por escrito**: se genera una línea del tipo *"Responde solo con un objeto JSON con estas claves, todas obligatorias y de tipo texto: tipo, pregunta, nutricion, ejercicio"*, incluidos los valores permitidos cuando el esquema los fija (`tipo` solo puede ser `pregunta` o `plan`).

### Modelos

Como con Gemini, una lista en orden de preferencia: se usa el primero que conteste y se pasa al siguiente si el modelo no existe. Los nombres de los modelos abiertos cambian a menudo y no todas las claves tienen los mismos.

### Después de responder

La respuesta de Groq se parsea igual y se **completa**: cualquier campo obligatorio que falte se rellena con cadena vacía. Los sitios que ya comprobaban si un campo venía vacío (por ejemplo, un plan sin rutina de ejercicio) siguen funcionando sin cambios.

## 5. Modelo de datos

**Ninguno.** No se guarda de qué proveedor viene cada respuesta: no cambia nada para el usuario y sería un campo más que mantener.

**Variable de entorno nueva en Vercel: `GROQ_API_KEY`.** Sin ella no hay reserva, y la app funciona como antes.

## 6. Casos límite

- **Sin `GROQ_API_KEY`**: se salta la reserva y se devuelve el error de Gemini, como hasta ahora.
- **Los dos sin cuota**: gana el mensaje de cuota agotada, que es lo que más ayuda al usuario ("vuelve mañana").
- **Groq devuelve texto que no es JSON**: se trata como respuesta ilegible, igual que con Gemini.
- **Groq se salta un campo obligatorio**: se rellena con cadena vacía. Si el que falta es imprescindible (la pregunta de la entrevista, el contenido de un plan), el código que ya existe lo detecta y devuelve `respuesta-ilegible`.
- **Groq tarda mucho**: la función tiene 60 segundos y el navegador espera 55. Al no haber ya reintentos de Gemini, hay margen de sobra para las dos llamadas.
- **Gemini responde 400**: no se pasa a Groq. La petición está mal formada y hay que arreglarla, no esconderla.

## 7. Archivos afectados

| Archivo | Cambio |
|---|---|
| `api/_ia.js` | proveedor Groq, traducción de la petición, cascada, y fuera los reintentos por saturación |
| `docs/ARQUITECTURA.md` | el segundo proveedor y por qué |
| `docs/PRODUCTO.md` | deja de decir que la IA es solo Gemini |
| `docs/ESTADO.md` | la clave nueva en Vercel |

**Estimación: ~160 líneas**, todas en un archivo. Ninguna pantalla cambia.

## 8. Decisiones tomadas

- **Groq como reserva** → decisión del usuario el 2026-08-16, tras dos días peleándose con la saturación de Gemini. Su API imita a la de OpenAI, así que la pieza a escribir es pequeña, y al ser otra empresa no le afecta un mal día de Google.
- **Gemini sigue siendo el principal** → es el que mejor respeta el esquema JSON, y eso en esta app importa: ya hubo planes sin rutina en la spec 004.
- **Se quitan los reintentos por saturación** → preguntarle otra vez a quien acaba de decir que está saturado aporta menos que preguntarle a otro, y aquellas esperas se comían el tiempo del navegador.
- **Un 400 no salta de proveedor** → si la petición está mal, mandársela a otro solo esconde el fallo.
- **No se guarda qué proveedor respondió** → al usuario no le cambia nada y sería un campo más que mantener.
- **Se asume que Groq devolverá JSON más flojo** → se le describe el formato por escrito y se completan los campos que falten, en vez de fiarse.

## 9. Fuera de spec: ideas apuntadas

- Elegir el proveedor desde Ajustes, para probar. → `docs/BACKLOG.md`
- Un tercer proveedor si estos dos se quedan cortos. → `docs/BACKLOG.md`

## ✅ Para probar a mano

Se prueba junto con el resto de specs de esta tanda. **Antes hay que crear la variable `GROQ_API_KEY` en Vercel**, o la reserva no existe.
