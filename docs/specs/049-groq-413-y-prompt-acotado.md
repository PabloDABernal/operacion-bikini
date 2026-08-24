# 049 — La reserva de Groq se rendía ante un 413, y el prompt crecía sin freno

- **Estado:** ✅ completada. Probada y confirmada por el usuario el 24 de agosto de 2026.
- **Fecha:** 2026-08-23
- **Referencia en PRODUCTO.md:** apartado "Qué explícitamente NO hace" y la nota de la v2 sobre Groq como reserva automática. No hay cambio de producto: es un arreglo para que la reserva cumpla lo que ya se prometía.

## 1. Objetivo

El usuario intentó pasar consulta el 23 de agosto y vio:

> La IA no ha respondido (ia-saturada (gemini) · reserva: http-413). Vuelve a
> intentarlo en un momento.

O sea: Gemini estaba saturado, la reserva de Groq entró como debía, y **Groq
respondió 413**. Dos causas, las dos arreglables:

1. **`llamarAGroq()` se rinde ante un 413.** Solo prueba el siguiente modelo
   ante un `404` (modelo inexistente) o un `429` (sin cuota). Groq devuelve
   **413 cuando la petición supera su límite de tokens por minuto**, y ese
   límite —como la cuota— **va por modelo**: el grande, que es el primero de la
   lista, es el más tacaño de la capa gratuita. Es literalmente la misma
   trampa que la spec 032 arregló para el 429, con otro número.
2. **El prompt de la revisión creció sin freno.** La spec 045 pasó la ventana
   de registros de 14 días fijos a "desde la última consulta", con tope de 30
   días, pero `describirRegistros()` escribe **una línea por cada registro**,
   sin límite. Un mes apuntando cinco comidas al día son doscientas líneas
   dentro del prompt.

Al terminar esta spec, un 413 hace que se pruebe el siguiente modelo de Groq, y
el bloque de registros del prompt tiene un tamaño máximo conocido.

## 2. Criterio de "esto funciona"

1. Con Gemini saturado, si el primer modelo de Groq devuelve 413, **se prueba
   el siguiente** en vez de rendirse. Solo si fallan los tres se le dice al
   usuario que la reserva no ha podido.
2. En los registros de Vercel se ve la línea que dice qué modelo se saltó y por
   qué, igual que ya pasa con el 429.
3. Pasar consulta funciona aunque lleves un mes apuntando cinco comidas al día.
4. La IA sigue viendo lo que necesita para hacer la revisión: si hay más
   registros de los que caben, ve **los más recientes** y se le dice
   explícitamente cuántos se han quedado fuera, para que no crea que ahí se
   acaba tu historial.
5. La entrevista de bienvenida, la conversación y las peticiones de dieta y de
   tabla siguen funcionando igual.
6. El mensaje de error de pantalla sigue diciendo qué proveedor falló y con qué
   código, como desde la spec 032.

## 3. Alcance

### Entra

- Tratar el `413` de Groq como el `429`: probar el siguiente modelo.
- Acotar el bloque de registros que `describirRegistros()` mete en el prompt,
  quedándose con los más recientes y diciendo cuántos faltan.

### NO entra (explícitamente fuera)

- **Cambiar el tope de 30 días de la revisión** (spec 045). El problema no es
  el periodo, es cuánto texto genera; el periodo lo decidió el usuario.
- **Cambiar el orden de `MODELOS_GROQ`** ni añadir modelos.
- **Reintentar con el mismo modelo.** Ya se decidió en la spec 020: preguntarle
  otra vez a quien acaba de decir que no puede aporta menos que preguntarle a
  otro.
- **Resumir los registros con la IA** antes de mandarlos. Sería otra llamada y
  otra cuota para ahorrar cuota.
- **Tocar Gemini.** Su 503 es saturación de Google y ya tiene su camino.

## 4. Comportamiento detallado

### El 413 (`api/_ia.js`)

En `llamarAGroq()`, la condición que decide si se prueba el siguiente modelo
pasa de `404 || 429` a `404 || 429 || 413`, con su mensaje propio en el
`console.error`: *"El modelo X de Groq no admite una petición tan grande
(límite de tokens por minuto), probando el siguiente."*

Los tres códigos van juntos porque significan lo mismo a efectos de decidir:
**este modelo no puede, otro quizá sí.** Un 400, en cambio, sigue sin
reintentarse: eso es una petición mal formada y mandársela a otro solo
escondería el fallo. Esa distinción ya está documentada en el archivo.

### El 413 en el otro punto de decisión (`api/_ia.js`)

`llamarAGroq()` no es el único sitio donde se decide. `estadoMereceReserva()`
dice si, cuando un proveedor falla, merece la pena probar **el otro**, y hoy
tampoco contempla el 413. Con "Groq primero" elegido en Ajustes (spec 032), si
los tres modelos de Groq se ahogan por tamaño, Gemini —que tiene mucho más
margen— **no llegaría a intentarse nunca**. Es la misma trampa que la de arriba
en el sitio simétrico, y la encontró `revisor-specs`.

El 413 se añade también ahí. Un 400 sigue sin merecer reserva: eso es una
petición mal formada y mandársela a otro solo escondería el fallo.

### El tamaño del prompt (`api/_ia.js`)

`describirRegistros()` pasa a acotar cada bloque. Tope por categoría, quedándose
con los **más recientes** (las listas ya llegan ordenadas de más nueva a más
vieja desde el cliente):

| Bloque | Tope |
|---|---|
| Pesajes | 30 |
| Comidas | 60 |
| Ejercicios | 30 |

Son tres constantes con nombre propio —`MAXIMO_PESAJES`, `MAXIMO_COMIDAS`,
`MAXIMO_EJERCICIOS`— y no una compartida, para que se puedan mover por separado. Con
esos números, un mes entero de uso intenso cabe casi siempre, y el bloque de
registros queda acotado a unas 120 líneas pase lo que pase.

Cuando se recorta, se añade una línea al final del bloque:
`- (y N más antiguos, que no caben aquí)`. Sin eso, la IA daría por hecho que
ahí empieza tu historial y podría decirte que llevas dos semanas sin pesarte
cuando en realidad es que no cabían.

## 5. Modelo de datos

Sin cambios. No se toca Firestore, ni `firestore.rules`, ni el esquema de
ninguna respuesta.

## 6. Casos límite

- **Los tres modelos de Groq devuelven 413.** Se devuelve la última respuesta y
  el usuario ve `reserva: http-413`, como hasta ahora. Al menos se habrán
  probado los tres.
- **Menos registros que el tope.** No se añade ninguna línea de "y N más": solo
  aparece cuando de verdad se ha recortado.
- **Sin registros.** Sigue saliendo `- sin registros`, sin tocar.
- **El orden de las listas.** El recorte se queda con los primeros elementos
  porque el cliente los manda de más reciente a más antiguo. Si algún día eso
  cambiara, el recorte se quedaría con lo viejo y sería un fallo silencioso: va
  comentado en el código.
- **Líneas muy largas.** El tope es de número de registros, no de caracteres:
  el texto de una comida o de un ejercicio no tiene límite de longitud en la
  app. Con textos normales el bloque queda acotado de sobra; con alguien
  escribiendo párrafos en cada comida, podría seguir creciendo. Se acepta y se
  anota en el backlog: acotar por caracteres obligaría a decidir dónde cortar
  un texto del usuario, que es otra decisión.
- **La dieta y la tabla** también llaman a `describirRegistros()`. También se
  benefician del recorte y no les cambia nada más.

## 7. Archivos afectados

| Archivo | Qué cambia |
|---|---|
| `api/_ia.js` | El 413 se trata como el 429 en `llamarAGroq()`; `describirRegistros()` acota cada bloque. |
| `docs/ESTADO.md` | Al terminar: la trampa del 413, junto a la del 429 de la spec 032. |

No se toca el navegador (`js/`), ni `api/consulta.js`, ni las reglas.

Tamaño estimado: ~50 líneas.

## 8. Decisiones tomadas

- **El 413 se trata como el 429.** Los dos son "este modelo no puede"; la cuota
  y el límite de tokens por minuto de Groq van por modelo, no por cuenta. Es la
  lección de la spec 032, que costó descubrir en producción.
- **Se acota el texto, no el periodo.** Los 30 días los eligió el usuario el 22
  de agosto sabiendo lo que costaban. Lo que no se acotó entonces —y es el
  fallo de la 045— fue cuánto texto genera ese periodo.
- **Se recorta por lo viejo y se dice cuánto falta.** Quedarse con lo reciente
  es lo que le importa a una revisión; callarse el recorte haría que la IA
  hablara con datos incompletos creyéndolos completos.
- **El 413 merece reserva de proveedor, no solo de modelo.** Decidido al
  implementar, sobre el mismo principio que ya guiaba al 429: un 413 dice "este
  no puede", y el otro proveedor quizá sí. Si el usuario prefiere que "Groq
  primero" signifique "Groq o nada", esto es lo que habría que cambiar.
- **Topes generosos y no ajustados al límite de Groq.** Ajustarlos al modelo
  más pequeño sería optimizar para el peor caso de la reserva y empeorar el
  caso normal, que es Gemini respondiendo.

## 9. Fuera de spec: ideas apuntadas

- Resumir los registros por día (por ejemplo "3 comidas, 45 min de bici") en
  vez de listarlos uno a uno cuando el periodo es largo: diría más con menos
  texto, pero cambia lo que la IA ve y merece su propia spec.

## ✅ Para probar a mano

Lo malo de este arreglo es que **no se puede provocar a voluntad**: depende de
que Gemini esté saturado y de cuánta cuota le quede a Groq en ese minuto.

1. **Vuelve a intentar pasar consulta.** Si Gemini ya no está saturado,
   responderá él y no se sabrá nada de Groq: eso también vale, la consulta sale.
2. Si vuelve a fallar, mira **qué dice el mensaje**. Lo que importa es que ya
   **no** ponga `reserva: http-413` habiendo probado un solo modelo. Si sale
   otro código (`http-429`, `http-401`), dímelo: es otro camino distinto.
3. **Ajustes → App → Proveedor de IA → "Probar Groq primero"**, y pasa consulta.
   Ahora Groq va primero; si se ahoga, tiene que caer a Gemini en vez de
   rendirse. Acuérdate de devolverlo a "Automático" después.
4. **Que la revisión siga sabiendo de qué habla**: pasa una consulta y comprueba
   que la IA menciona tus datos recientes. Con un mes largo de registros verá
   los más recientes; si algo se ha quedado fuera, lo sabe y no debería decirte
   que llevas semanas sin apuntar nada.
5. **Que no se haya roto lo demás que usa el mismo prompt**: pide una **dieta**
   y una **tabla** y comprueba que salen bien.
6. La **conversación** de abajo también manda registros: manda un mensaje y
   comprueba que responde.

Si quieres verlo con datos en vez de a ciegas, en los registros de Vercel sale
la línea `El modelo X de Groq no admite una petición tan grande (límite de
tokens por minuto), probando el siguiente.`
