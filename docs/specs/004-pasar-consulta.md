# 004 — Botón "Pasar consulta" (entrevista guiada y plan)

- **Estado:** completada (probada a mano por el usuario el 2026-08-11, con la cuota de Gemini ya reiniciada). El 2026-08-10 hubo que depurar el formato de respuesta: Gemini omitía la rutina de ejercicio porque el campo era opcional en el esquema. Se arregló marcando todos los campos como obligatorios.
- **Fecha:** 2026-08-10
- **Referencia en PRODUCTO.md:** líneas 19, 35 y 37 (botón "Pasar consulta", conceptos "Consulta" y "Plan").
- **Depende de:** specs 001, 002 y 003, completadas. Reutiliza el proxy de IA de la 003.

## 1. Objetivo

Que el usuario pulse **"Pasar consulta"** y mantenga una conversación tipo entrevista con la IA (gustos, hábitos, objetivos, mediciones, lesiones…). Cuando la IA considera que tiene datos suficientes, cierra la entrevista y genera un **plan de nutrición y un plan de ejercicio**, que quedan guardados.

## 2. Criterio de "esto funciona"

Probado en https://operacion-bikini.vercel.app:

1. Entro y veo una quinta pestaña: **Consulta**.
2. Pulso **"Empezar consulta"** → aparece la primera pregunta de la IA, y un campo para responder.
3. Contesto → aparece mi respuesta en el hilo y, debajo, la siguiente pregunta. Las preguntas tienen sentido con lo que voy contestando: si digo que odio el pescado, no me lo pregunta otra vez ni me lo mete después en el plan.
4. La IA me pregunta también por cosas que ya sabe de mis registros (peso, ejercicio) sin volver a preguntármelas desde cero.
5. **F5 a mitad de entrevista** → al volver a la pestaña Consulta, el hilo sigue donde lo dejé y puedo continuar.
6. Tras varias preguntas, la IA anuncia que ya tiene bastante y aparece el plan con dos bloques: **Nutrición** y **Ejercicio**. El de ejercicio tiene una pauta por día de la semana.
7. El plan menciona cosas que le he contado en la entrevista (si dije que solo puedo entrenar 3 días, el plan no me pone 6).
8. F5 → el plan sigue ahí, en el historial de planes, con su fecha.
9. Empiezo una segunda consulta → el plan anterior **no** desaparece: el nuevo aparece encima.
10. Entro con la otra cuenta → no veo ni su consulta ni sus planes.
11. **Regresión obligatoria de la spec 003**: voy a la pestaña Consejos y pulso "Pedir consejo" → sigue funcionando exactamente igual que antes. Es el mayor riesgo de esta spec: `api/consejo.js` se modifica para compartir código con la consulta, y esa pieza ya estaba probada y en producción.

## 3. Alcance

### Entra

- Pestaña **Consulta** con: botón para empezar, hilo de la conversación, campo de respuesta y el historial de planes.
- Conversación guiada por la IA, una pregunta cada vez, con memoria de todo lo dicho.
- La IA recibe además un resumen de los registros de los últimos 14 días (peso, comidas, ejercicio) para no preguntar lo que ya sabe.
- Cierre automático de la entrevista cuando la IA tiene datos suficientes, y generación del plan.
- Guardado de la conversación (para poder retomarla) y de los planes.
- Botón para **abandonar** una consulta a medias.
- Límites de uso para proteger la cuota gratuita.
- Nueva llamada en el proxy de IA, reutilizando la validación de token de la spec 003.

### NO entra (explícitamente fuera)

- Editar el plan a mano una vez generado.
- Que la app siga el plan (marcar días cumplidos, recordatorios, avisos).
- Que los consejos de la spec 003 tengan en cuenta el plan vigente.
- Volver atrás para corregir una respuesta ya enviada.
- Borrar planes o consultas.
- Menús cerrados comida a comida: el plan da pautas de nutrición, no un menú de 7 días.
- Exportar o imprimir el plan.
- Respuesta en streaming.

## 4. Comportamiento detallado

### 4.1 Pestaña Consulta

Tres estados posibles:

**Sin consulta en curso**: texto explicativo, botón `Empezar consulta` y, debajo, el historial de planes. Si ya se han empezado 2 consultas hoy, el botón se muestra **deshabilitado** con el texto `Ya has pasado consulta 2 veces hoy` debajo, en vez de dejar pulsar y fallar.

**Consulta en curso**: el hilo (preguntas de la IA y mis respuestas, en orden), un campo de texto con botón `Responder`, y un enlace discreto `Abandonar consulta`. Mientras la IA piensa: `Pensando…` y el botón deshabilitado.

**Consulta recién terminada**: el hilo completo, el plan generado destacado, y botón `Empezar otra consulta`.

La quinta pestaña se añade sin renombrar ids ni clases de las specs anteriores.

### 4.2 La conversación

- La IA hace **una pregunta cada vez**, nunca varias juntas.
- Cubre: objetivo y plazo, peso y medidas, gustos y aversiones alimentarias, alergias e intolerancias, horarios y rutina de comidas, nivel de actividad, días y tiempo disponibles para entrenar, lesiones o limitaciones físicas, y hábitos que quiera cambiar.
- No repregunta lo que ya se deduce de los registros ni lo que ya ha contestado el usuario.
- Cuando tiene bastante, en vez de otra pregunta devuelve el plan.
- Máximo **25 preguntas** por consulta. Al llegar, genera el plan con lo que tenga.

### 4.3 El plan

Dos bloques:

- **Nutrición**: pautas generales (qué priorizar, qué reducir, cómo repartir las comidas), adaptadas a lo que ha contado el usuario. Sin menús cerrados por comida.
- **Ejercicio**: una pauta para cada día de la semana, de lunes a domingo, respetando los días disponibles que haya dicho el usuario. Los días de descanso se indican como tales.

El plan se guarda y aparece en el historial, con su fecha, el más reciente arriba.

### 4.4 Límites de uso

- Máximo **2 consultas nuevas al día** por usuario.

Consumo de cuota: cada turno reenvía el hilo entero, así que una consulta completa puede gastar hasta 25 llamadas a Gemini, frente a 1 por consejo. Con los límites de arriba, el techo diario entre los dos usuarios es de unas 110 llamadas (2 × 2 consultas × 25, más 2 × 5 consejos), que entra en la capa gratuita de Flash con margen. Si alguna vez se agota, sale el mensaje de cuota y se recupera al día siguiente.
- Máximo **25 preguntas** por consulta.
- Solo puede haber **una consulta en curso** a la vez: si hay una abierta, el botón de empezar no aparece hasta terminarla o abandonarla.

### 4.5 Errores

| Situación | Mensaje |
|---|---|
| Ya se han empezado 2 consultas hoy | `Ya has pasado consulta 2 veces hoy. Vuelve mañana.` |
| Respuesta vacía | `Escribe una respuesta.` |
| Respuesta de más de 1000 caracteres | `Máximo 1000 caracteres.` |
| Cuota de Gemini agotada | `La IA ha alcanzado su límite diario gratuito. Prueba mañana.` |
| Fallo de red o proxy | `No se ha podido continuar la consulta. Inténtalo de nuevo.` |
| Respuesta de la IA ilegible | `La IA no ha sabido responder. Inténtalo de nuevo.` |

Si falla el envío de una respuesta, esa respuesta **no** se pierde: se queda en el campo para reintentar.

### 4.6 Abandonar

`Abandonar consulta` → confirmación `¿Abandonar esta consulta? Se perderá la conversación.` → la consulta se marca como abandonada, el hilo desaparece y vuelve el botón de empezar. No genera plan. Una consulta abandonada **sí** cuenta para el límite diario.

## 5. Modelo de datos

```
usuarios/{uid}/consultas/{consultaId}
  estado: string        // "en-curso" | "terminada" | "abandonada"
  mensajes: array       // [{ de: "ia" | "usuario", texto: string }, ...] en orden
  creadaEn: timestamp
  terminadaEn: timestamp | null

usuarios/{uid}/planes/{planId}
  nutricion: string
  ejercicio: string     // pauta por día, de lunes a domingo
  consultaId: string    // de qué consulta salió
  creadoEn: timestamp
```

- El hilo se guarda **entero en un solo documento** de `consultas`: son pocos mensajes y así retomar la conversación es una sola lectura.
- Reglas de Firestore: las dos colecciones nuevas se protegen igual que el resto (`uid` propio + email en la lista blanca).

## 6. El proxy

Se añade `api/consulta.js`, hermana de `api/consejo.js` y con la **misma validación de token y lista blanca** (spec 003, apartado 5). La clave de Gemini sigue viviendo solo en Vercel.

Cada llamada manda: el hilo completo hasta ahora y el resumen de registros de 14 días. La IA responde una de dos cosas:

- una **pregunta** más, o
- el **plan** (nutrición + ejercicio), señalando que la entrevista ha terminado.

El formato de respuesta se fuerza igual que en la spec 003, para que el frontend pueda distinguir los dos casos sin adivinar. Se reutiliza también la cascada de modelos Flash de la 003.

Instrucciones a la IA: español, tuteo, una sola pregunta por turno, sin diagnósticos médicos, y recordar consultar a un profesional ante dudas. En el plan, no inventar datos que el usuario no haya dado.

## 7. Casos límite

- **Cerrar el navegador a mitad**: la consulta sigue "en curso" y se retoma al volver.
- **Dos pestañas abiertas con la misma consulta**: la última respuesta enviada gana; no se intenta sincronizar en tiempo real.
- **Empezar consulta desde dos pestañas a la vez**: podrían crearse dos consultas "en curso". Al recargar se toma la más reciente y la otra queda huérfana en Firestore, sin romper nada. Con dos usuarios personales no compensa añadir bloqueos para evitarlo.
- **La IA devuelve pregunta y plan a la vez**: se toma el plan y se ignora la pregunta.
- **El plan llega sin la rutina de ejercicio**: pasa cuando la IA se queda sin espacio tras extenderse en la nutrición. En vez de perder toda la entrevista, el proxy pide en una segunda llamada solo el bloque que falta, con la conversación como contexto. Si tampoco entonces la devuelve, el turno falla con `La IA no ha sabido responder. Inténtalo de nuevo.` y la consulta sigue abierta para reintentar.
- **La IA hace varias preguntas en un mismo turno**: se muestra tal cual; el prompt lo desaconseja pero no se corta.
- **Respuesta con saltos de línea o emojis**: se guarda y se muestra tal cual.
- **Llegar a las 25 preguntas**: se genera el plan aunque la IA quisiera seguir.
- **Sesión caducada a mitad**: vuelve al login; al volver a entrar, la consulta sigue en curso.

## 8. Archivos afectados

- `api/consulta.js` — nuevo.
- `api/_ia.js` — nuevo: módulo compartido con la validación de token, la lista blanca y la cascada de modelos Flash, extraídos de `api/consejo.js`. El prefijo `_` evita que Vercel lo publique como una ruta más de la API.
- `vercel.json` — modificar: `maxDuration` de 60 s también para `api/consulta.js`. Se declara por función, así que no lo hereda de la 003.
- `js/consulta.js` — nuevo.
- `index.html` — modificar: quinta pestaña.
- `styles.css` — modificar: hilo de conversación y plan.
- `js/app.js` — modificar: enganchar la pestaña.
- `firestore.rules` — modificar: `consultas` y `planes`.
- `api/consejo.js` — modificar: extraer a un módulo compartido la validación de token y la cascada de modelos, para no duplicarla.

## 9. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| Entrevista tipo chat, no formulario | Es lo que dice PRODUCTO.md línea 19: entrevista guiada, con repreguntas según lo que conteste el usuario. |
| La IA decide cuándo termina | Más natural que un número fijo; el tope de 25 preguntas evita que se alargue sin control. |
| Plan con pautas de nutrición, no menú cerrado | Menos texto, menos cuota y menos riesgo de que la IA invente cantidades y menús concretos. |
| Historial de planes | Poder comparar el plan de hoy con el de dentro de un mes. |
| El hilo entero en un documento | Pocos mensajes; retomar la conversación es una sola lectura de Firestore. |
| Una sola consulta en curso a la vez | Evita hilos a medias olvidados y hace la pantalla predecible. |
| Abandonar cuenta para el límite diario | Si no, se podría reiniciar la consulta infinitas veces y agotar la cuota. |

| 25 preguntas, 2 consultas al día, 1000 caracteres por respuesta | Aprobados explícitamente por el usuario el 2026-08-10, tras calcular que el techo de ~110 llamadas diarias cabe en la capa gratuita de Gemini Flash. |

## 10. Riesgo de tamaño

Es la spec más grande del proyecto: proxy nuevo, refactor del proxy existente para compartir código, pantalla con tres estados y modelo de datos de dos colecciones. Estimación de 600-700 líneas. El usuario ya decidió que prefiere specs completas a specs partidas; se asume, pero es la que más probablemente necesite una segunda sesión de arreglos tras probarla.

## 11. Fuera de spec: ideas apuntadas

- Que los consejos (spec 003) tengan en cuenta el plan vigente.
- Marcar días del plan como cumplidos.
- Editar el plan a mano.

## ✅ Para probar a mano

Ver apartado 2. La prueba que de verdad importa es la 3 y la 7: que la IA **use** lo que le has contado, tanto durante la entrevista como en el plan. Si el plan es genérico, el prompt no está funcionando.
