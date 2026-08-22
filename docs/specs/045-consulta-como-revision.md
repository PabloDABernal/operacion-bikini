# 045 — La consulta, como revisión de lo hecho desde la anterior

- **Estado:** 📝 pendiente de implementar (después de la 044).
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
4. Si hace 7 días o más, no hay aviso y el botón dice **"Pasar consulta"**.
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

`recogerRegistros()` recoge hoy una ventana fija. Pasa a aceptar un `desde`:

- Si hay revisión anterior, `desde` es su fecha.
- Si no la hay, el principio de la operación en curso.
- Si el periodo saliera larguísimo, se recorta a un máximo razonable para no
  reventar el tamaño del prompt (los registros van en texto dentro de él).

Las instrucciones del modo `normal` pasan a decir que es una **revisión
periódica**: que empiece repasando lo que ve en los registros del periodo, que
sea concreto con esos datos, que anime o apriete según lo que haya, y que no
vuelva a preguntar lo que ya está en el perfil.

### La pantalla (`index.html`, `js/app.js`)

Un párrafo nuevo encima del botón con la línea de "Última consulta: …" y, si
toca, el aviso de que es pronto. El texto del botón sale de ahí.

## 5. Modelo de datos

Sin cambios. Se usan campos que ya existen (`estado`, `modo`, `terminadaEn`).
No se toca `firestore.rules`.

## 6. Casos límite

- **Operación recién abierta.** La entrevista de bienvenida no cuenta como
  revisión: sale "Aún no has pasado ninguna revisión" y el periodo arranca en
  el principio de la operación.
- **Consulta terminada sin `terminadaEn`** (datos viejos): se cae a `creadaEn`,
  y si tampoco está, se trata como "no hay revisión anterior".
- **Sin registros en el periodo.** La IA tiene que decirlo tal cual ("no has
  apuntado nada desde la última vez"), no inventarse un repaso.
- **Periodo larguísimo** (meses sin pasar consulta): el recorte del prompt
  evita que la petición crezca sin límite.
- **Reinicio de datos.** Si se borran las consultas, se vuelve a "Aún no has
  pasado ninguna revisión". Es correcto.
- **Cambio de operación.** Las consultas de la operación anterior no cuentan:
  la revisión es de esta etapa.

## 7. Archivos afectados

| Archivo | Qué cambia |
|---|---|
| `js/consulta.js` | `ultimaRevision()`, `diasDesde()`, el `desde` de `recogerRegistros()`. |
| `api/consulta.js` | Instrucciones del modo `normal`, reescritas como revisión. |
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

## 9. Fuera de spec: ideas apuntadas

- Un recordatorio cuando lleves mucho sin pasar consulta.
- Enseñar en el hilo un resumen de datos del periodo (kilos, días apuntados)
  junto al texto de la IA.

## ✅ Para probar a mano

Lo escribe el agente `qa-manual` cuando la implementación esté revisada.
