# 045 — La consulta, como revisión de lo hecho desde la anterior

- **Estado:** ✅ completada (probada y confirmada por el usuario el 2026-08-22).
- **Fecha:** 2026-08-22
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v5…)", puntos **"La consulta es una revisión, no una entrevista de alta"** y **"Se puede pasar consulta cuando quieras, con la app avisando"**.
- **Segunda de tres.** Va después de la 044 (que ya quitó los planes y el botón de abandonar) y antes de la 046.

## 1. Objetivo

Hoy, con una operación en marcha, "Empezar consulta" abre una entrevista corta
que pregunta como si acabara de conocerte, y la IA solo ve una ventana fija de
días. Al terminar esta spec, pasar consulta es una **revisión**: la IA mira lo
que has hecho **desde la consulta anterior**, te dice cómo vas y qué toca, y la
pantalla te avisa de cuánto hace de la última.

## 2. Criterio de "esto funciona"

1. En **Consulta**, con una operación en marcha, encima del botón se lee cuánto
   hace de la última consulta: **"Última consulta: hace 9 días"**.
2. Si nunca has pasado consulta en esta operación (solo la de bienvenida), lo
   dice de otra forma: **"Aún no has pasado ninguna revisión"**.
3. Si la última fue hace **menos de 7 días**, sale un aviso de que aún es
   pronto y que lo normal es cada semana, y el botón pasa a decir **"Pasar
   consulta igual"**. **Se puede pulsar**: no está bloqueado.
   Excepción: **justo después de terminar una consulta** no sale ese aviso,
   sino el de siempre ("Consulta terminada…") con "Empezar otra consulta".
4. Si hace 7 días o más, no hay aviso y el botón dice **"Pasar consulta"**.
   Y si **nunca** has pasado una revisión, tampoco hay aviso: el botón dice
   "Pasar consulta" a secas, no "Pasar consulta igual" — no hay nada que
   saltarse.
5. El primer mensaje de la IA en una consulta nueva **habla de tus datos del
   periodo**, no de generalidades: menciona el peso, la constancia o lo
   apuntado desde la consulta anterior.
6. La IA no vuelve a preguntar lo que ya sabe de ti (gustos, alergias,
   material, limitaciones): sigue leyéndolo del perfil.
7. El cierre de la consulta (spec 044) recoge ese repaso y dice qué toca ahora.
8. **La entrevista de bienvenida no cambia**: sin operación en marcha sigue
   siendo la entrevista larga de siempre, con su "Iniciar operación bikini".
9. El tope de **2 consultas al día** sigue igual, y su aviso también.
10. La conversación (20 mensajes al día) sigue igual.

## 3. Alcance

### Entra

- Calcular la fecha de la última consulta terminada de la operación en curso, y
  pintarla con su aviso.
- Pasar a la IA el periodo desde la consulta anterior, en vez de la ventana
  fija, cuando el modo es una revisión.
- Reescribir las instrucciones del modo "normal" para que sea una revisión y no
  una entrevista.

### NO entra (explícitamente fuera)

- **Bloquear el botón por calendario.** Decidido en contra: el aviso orienta,
  no impide (sección 8).
- **Cambiar el tope diario de consultas**, que es cuestión de cuota de IA.
- **Que proponga dieta o tabla.** Es la spec 046.
- **La entrevista de bienvenida** (modos `inicial` y `reinicio`).
- **Avisos, recordatorios o notificaciones** de que toca pasar consulta.
- **Cambiar la conversación.**

## 4. Comportamiento detallado

### Cuánto hace de la última (`js/consulta.js`)

Una función `ultimaRevision(consultas)`: de las consultas **terminadas** que no
sean `conversacion` ni la entrevista de bienvenida (`inicial`/`reinicio`),
devuelve la más reciente por `terminadaEn`. Y `diasDesde(fecha)` para los días.

El umbral del aviso, `DIAS_ENTRE_REVISIONES = 7`, como constante con nombre.

### El periodo que ve la IA (`js/consulta.js` y `api/consulta.js`)

`recogerRegistros(uid)` recoge hoy una ventana fija de `DIAS_DE_HISTORIAL`
(14 días) y **la comparten los cuatro modos**. Pasa a aceptar un `desde`
opcional:

- **Solo el modo `normal` lo usa.** La entrevista de bienvenida (`inicial`,
  `reinicio`) y la conversación siguen con la ventana fija de 14 días, tal
  cual, sin tocar una línea de su comportamiento ya validado.
- Si hay revisión anterior, `desde` es su fecha.
- Si no la hay, el principio de la operación en curso.
- **Tope: 30 días.** `MAXIMO_DIAS_DE_REVISION = 30`, como constante con nombre.
  Si el periodo fuera más largo (meses sin pasar consulta), se recorta a los
  últimos 30 días. Los registros viajan como texto dentro del prompt, así que
  un periodo sin tope hace crecer la petición sin límite: más cuota, más
  latencia y más riesgo de que la respuesta llegue truncada. 30 días cubre de
  sobra el ritmo semanal que propone la app y ya duplica la ventana de hoy.

### El texto que acompaña a los registros (`api/consulta.js`)

Hoy el prompt lleva escrito a mano `"Estos son mis registros de los últimos 14
días:"` para los cuatro modos. Con un periodo variable eso pasa a ser mentira,
y le estaría diciendo a la IA algo falso sobre el rango de sus propios datos
justo cuando el criterio 5 le pide ser concreta con ellos. El texto pasa a
decir el periodo real cuando el modo es `normal`, y se queda como está en los
demás.

### Las instrucciones (`api/consulta.js`)

**Cuidado: `INSTRUCCIONES` no es solo el modo normal.** `INSTRUCCIONES_INICIAL`
e `INSTRUCCIONES_REINICIO` se construyen con `${INSTRUCCIONES}` delante, así
que reescribirla in situ le metería a la entrevista de bienvenida un texto que
dice "esto es una revisión, no vuelvas a preguntar lo que ya sabes" — justo lo
contrario de lo que la entrevista tiene que hacer, y contra el punto 8 del
criterio de aceptación.

Se separa en dos constantes:

- `INSTRUCCIONES_ENTREVISTA`: lo que hoy es `INSTRUCCIONES`, intacto. Sigue
  siendo la base de `INSTRUCCIONES_INICIAL` y `INSTRUCCIONES_REINICIO`.
- `INSTRUCCIONES_REVISION`: nueva, para el modo `normal`. Dice que es una
  revisión periódica: que empiece repasando lo que ve en los registros del
  periodo, que sea concreta con esos datos, que anime o apriete según lo que
  haya, y que no vuelva a preguntar lo que ya está en el perfil.

### La pantalla (`index.html`, `js/app.js`)

Un párrafo nuevo encima del botón con la línea de "Última consulta: …" y, si
toca, el aviso de que es pronto. El texto del botón sale de ahí.

Dos reglas para que no se pelee con los tres estados que `pintarEstadoConsulta()`
ya maneja:

- **Solo se ve con operación en marcha.** Si `primeraVez` (no hay operación),
  manda "Iniciar operación bikini" y su explicación, como hasta ahora: el
  párrafo nuevo se oculta.
- **Recién terminada gana.** Justo al cerrar una consulta el contador diría
  "hace 0 días" y soltaría el aviso de que es pronto, un segundo después de
  haberla pasado: suena a regañina y es obvio. En ese estado manda el mensaje
  de siempre ("Consulta terminada. Lo que te ha dicho está al final de la
  conversación") y el botón sigue diciendo "Empezar otra consulta". El contador
  vuelve en la siguiente visita a la sección.

## 5. Modelo de datos

Sin cambios. Se usan campos que ya existen (`estado`, `modo`, `terminadaEn`).
No se toca `firestore.rules`.

## 6. Casos límite

- **Operación recién abierta.** La entrevista de bienvenida no cuenta como
  revisión: sale "Aún no has pasado ninguna revisión" y el periodo arranca en
  el principio de la operación.
- **Consulta terminada sin `terminadaEn`** (datos viejos): se cae a `creadaEn`,
  y si tampoco está, se trata como "no hay revisión anterior".
- **Operación abierta pero sin ninguna revisión todavía.** Es un estado propio,
  distinto de "hace pocos días": no hay aviso de que sea pronto y el botón dice
  "Pasar consulta". Internamente se representa con `-1`, que **no** debe colar
  como "menos de 7 días" en la comparación.
- **Sin registros en el periodo.** La IA tiene que decirlo tal cual ("no has
  apuntado nada desde la última vez"), no inventarse un repaso.
- **Periodo larguísimo** (meses sin pasar consulta): el recorte del prompt
  evita que la petición crezca sin límite.
- **Reinicio de datos.** Si se borran las consultas, se vuelve a "Aún no has
  pasado ninguna revisión". Es correcto.
- **Cambio de operación.** Las consultas de la operación anterior no cuentan:
  al cerrar una operación, `archivar()` las mueve fuera de la colección, así
  que ya no están para leerlas. **No hay campo `operacionId` en los documentos
  de consulta**: la separación depende de ese movimiento físico. Si un
  archivado se quedara a medias (operación marcada como archivada pero las
  consultas todavía sin mover), `ultimaRevision()` podría leer una de la etapa
  anterior y enseñar una fecha vieja. Se acepta: no es un riesgo nuevo de esta
  spec, es una asunción del modelo desde la 018, y lo peor que pasa es un
  "hace N días" equivocado en pantalla.

## 7. Archivos afectados

| Archivo | Qué cambia |
|---|---|
| `js/consulta.js` | `ultimaRevision()`, `diasDesde()`, `MAXIMO_DIAS_DE_REVISION`, el `desde` opcional de `recogerRegistros()`. |
| `api/consulta.js` | `INSTRUCCIONES` se separa en `INSTRUCCIONES_ENTREVISTA` (base de inicial/reinicio, intacta) e `INSTRUCCIONES_REVISION` (nueva, modo normal); el texto de "los últimos 14 días" pasa a decir el periodo real en modo normal. |
| `js/app.js` | Pinta la línea de la última consulta y decide el texto del botón. |
| `index.html` | El párrafo nuevo. |
| `docs/PRODUCTO.md` | Ya actualizado. |

Tamaño estimado: ~200 líneas.

## 8. Decisiones tomadas

- **El aviso orienta, no bloquea.** Confirmado por el usuario el 22 de agosto.
  Bloquear el botón siete días deja fuera el día que de verdad la necesitas, y
  la app no está para decirle a nadie cuándo puede hablar con su nutricionista.
- **La entrevista de bienvenida se queda como está.** La primera vez sí hace
  falta preguntarlo todo: no hay nada que repasar.
- **El periodo es "desde la consulta anterior", no una ventana fija.** Es lo
  que hace que la revisión sea una revisión y no un resumen genérico.
- **Con tope de 30 días.** Confirmado por el usuario el 22 de agosto. Los
  registros viajan como texto dentro del prompt: sin tope, cuatro meses sin
  consulta harían una petición enorme, con más cuota, más latencia y riesgo de
  respuesta truncada. 30 días duplican la ventana de hoy y cubren de sobra el
  ritmo semanal que la propia app propone.
- **Justo tras terminar una consulta manda el mensaje de "recién terminada"**,
  no el contador. Confirmado por el usuario el 22 de agosto: decir "aún es
  pronto" un segundo después de haber pasado consulta es obvio y suena a
  regañina.

## 9. Fuera de spec: ideas apuntadas

- Un recordatorio cuando lleves mucho sin pasar consulta.
- Enseñar en el hilo un resumen de datos del periodo (kilos, días apuntados)
  junto al texto de la IA.

## ✅ Para probar a mano

En producción (https://operacion-bikini.vercel.app), con una operación en
marcha. **Pasar consulta gasta cupo de IA (2 al día).**

### El aviso de cuánto hace

1. Ve a **Consulta**. Encima del botón se lee una línea nueva: **"Última
   consulta: hace N días"**, o **"Aún no has pasado ninguna revisión en esta
   operación"** si es tu caso.
2. Si nunca has pasado revisión, el botón dice **"Pasar consulta"** a secas, y
   **no** debe salir ningún aviso de que sea pronto.
3. Si tu última consulta fue hace menos de una semana, sale además **"Aún es
   pronto: lo normal es pasar consulta cada semana."** y el botón dice **"Pasar
   consulta igual"**. **Compruébalo pulsándolo: tiene que dejarte.** No está
   bloqueado, solo te avisa.

### La revisión en sí

4. Pasa una consulta. **El primer mensaje de la IA tiene que hablar de tus
   datos**: tu peso, tu constancia, lo que has apuntado. Si te suelta una
   pregunta genérica de entrevista ("¿qué comidas te gustan?", "¿cuánto mides?")
   es que las instrucciones nuevas no han cogido, y quiero saberlo.
5. **No debe volver a preguntarte lo que ya sabe de ti** (alergias, material,
   limitaciones): eso está en tu perfil.
6. Contéstale un par de veces. Tiene que cerrar en tres o cuatro preguntas, no
   alargarse como la entrevista de bienvenida.
7. El cierre recoge el repaso y dice qué toca. Sigue leyéndose al final del
   hilo (spec 044).
8. **Nada más terminar**, mira la pantalla: sale "Consulta terminada. Lo que te
   ha dicho está al final de la conversación" y el botón "Empezar otra
   consulta". **No** debe salir "hace 0 días" ni el aviso de que es pronto.
9. Sal de Consulta y vuelve a entrar: **ahora sí** sale "Última consulta: hoy"
   con el aviso de que es pronto.

### Que no se haya roto nada de antes

10. **La conversación** de abajo: manda un mensaje. Responde igual que siempre
    y el contador de mensajes baja.
11. **La entrevista de bienvenida** es lo que más fácil se rompe con este
    cambio, porque comparte el texto base de instrucciones. Solo si vas a
    cerrar la operación de verdad: finalízala en Ajustes → Operación y dale a
    "Iniciar operación bikini". Tiene que seguir siendo la entrevista larga de
    siempre —empezando por preguntarte cómo quieres que te llame—, rellenarte
    Ajustes al terminar y volver a abrir la operación.
12. **Cupo de dietas y tablas** (la trampa de la spec 044): en Comidas → Mi
    dieta, comprueba que sigue diciendo cuántas te quedan hoy.
