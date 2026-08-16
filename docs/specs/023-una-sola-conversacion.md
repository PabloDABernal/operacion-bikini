# 023 — Un solo interlocutor: fuera "Consejos", todo a "Pasar consulta"

- **Estado:** revisada
- **Fecha:** 2026-08-16
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v3)", punto "Un solo interlocutor".

## 1. Objetivo

Que la app deje de tener dos formas distintas de hablar con la IA. "Consejos" desaparece como sección: todo pasa por **Pasar consulta**, una conversación que dura, en la que cuentas cómo vas y tu nutricionista responde con lo que tenga que decirte.

## 2. Criterio de "esto funciona"

1. En la barra y en "Hoy" ya **no hay "Consejos"**. Solo "Consulta".
2. Con una operación en marcha, **Pasar consulta** enseña un hilo de conversación y un campo para escribir.
3. Escribir algo y enviarlo: aparece tu mensaje y, unos segundos después, la respuesta de la IA.
4. La IA **ve tus registros**: si le preguntas cómo vas, contesta con tus datos reales, no en abstracto.
5. Cerrar la app y volver: la conversación **sigue ahí**, con todo lo hablado.
6. Los **consejos que ya tenías** aparecen al principio del hilo, con su fecha, como mensajes de la IA.
7. Debajo del campo se ve cuántos mensajes te quedan hoy (**20 al día**).
8. Gastados los 20, el campo se deshabilita y avisa de que vuelvas mañana.
9. Sin operación en marcha, sigue saliendo **"Iniciar operación bikini"** y su entrevista, como hasta ahora.
10. Al terminar la entrevista de bienvenida, la conversación queda abierta y ya se puede escribir en ella.
11. **Mis planes** sigue debajo, igual que antes.

## 3. Alcance

### Entra

- **Conversación continua**, una por operación, que no se abre ni se cierra: siempre está.
- **Fuera la sección Consejos**: su pestaña, su botón de "Pedir consejo" y su lista.
- Los **consejos antiguos** se enseñan dentro del hilo, ordenados por fecha con el resto.
- **Cupo de 20 mensajes tuyos al día**, contados sobre los mensajes que has enviado hoy.
- La IA recibe, como hasta ahora, tus registros de los últimos 14 días y tu perfil.

### NO entra (explícitamente fuera)

- **Las consultas especializadas** (tabla de ejercicio, dieta): siguen donde están hasta la spec 024, que las lleva a su sección.
- **La entrevista de bienvenida**: no cambia. Sigue siendo su propio flujo, con su plan al final.
- **Borrar los consejos antiguos**: se conservan y se siguen archivando al cerrar la operación.
- **Que la conversación genere planes**: si quieres un plan, se pide aparte.
- **Buscar dentro de la conversación** ni exportarla.

## 4. Comportamiento detallado

### La conversación

- Vive en `usuarios/{uid}/consultas`, como los demás hilos, con `modo: "conversacion"` y `estado: "en-curso"`. **Nunca se cierra.**
- Se crea sola con el primer mensaje que envíes. Si no has escrito nada, no hay documento.
- Hay **una por operación**: al finalizar una operación (spec 018) se archiva con todo lo demás, y la siguiente empieza con la conversación en blanco.

### Enviar un mensaje

1. Se añade tu mensaje al hilo, con la fecha del día.
2. Se manda a la IA todo el hilo, tus registros recientes y tu perfil.
3. Su respuesta se añade al hilo.
4. Si falla, tu mensaje **se queda escrito** en el campo para reintentar, y el hilo no se toca.

### Qué se le pide a la IA

Instrucciones nuevas, en modo `conversacion`:

- Eres el nutricionista y entrenador de esta persona, y estáis charlando sobre cómo va.
- Respondes a lo que te pregunte, apoyándote en sus registros: peso, comidas y ejercicio de los últimos 14 días.
- **No entrevistas**: no vas haciendo preguntas de una en una como en la primera visita. Puedes preguntar algo si hace falta, pero lo normal es que respondas.
- Das pautas concretas y breves. Nada de discursos.
- No diagnosticas. Ante algo preocupante, recomiendas ir al médico.

La respuesta usa el mismo esquema que ya existe: el texto viene en el campo `pregunta`, que en este modo es simplemente "lo que dice la IA".

### Los consejos antiguos

No se migran ni se copian. Al pintar el hilo se **mezclan** con los mensajes: cada consejo guardado se enseña como un mensaje de la IA con su fecha, y el conjunto se ordena por fecha. Un consejo antiguo se distingue por llevar su fecha delante.

### El cupo

- **20 mensajes tuyos al día.** Se cuentan los mensajes del hilo con `de: "usuario"` y fecha de hoy.
- Debajo del campo: `Te quedan 14 mensajes hoy.`
- Al llegar a 0: el campo y el botón se deshabilitan y el texto pasa a `Has gastado tus 20 mensajes de hoy. Vuelve mañana.`
- El cupo de **2 consultas al día** deja de aplicarse a la conversación; sigue aplicándose a la entrevista de bienvenida y a los planes especializados.

## 5. Modelo de datos

| Ruta | Campo | Cambio |
|---|---|---|
| `usuarios/{uid}/consultas/{id}` | `modo` | acepta también `"conversacion"` |
| `usuarios/{uid}/consultas/{id}` | `mensajes[].fecha` | **nuevo**: `AAAA-MM-DD`, para contar el cupo diario |

Los mensajes antiguos no tienen `fecha`; se tratan como si fueran de otro día, así que no gastan cupo de hoy.

`firestore.rules`: **sin cambios**.

## 6. Casos límite

- **Sin operación activa**: no hay conversación. Se ve el botón de iniciar, como hasta ahora.
- **Sin conexión al enviar**: el mensaje no se pierde, se queda en el campo.
- **Dos pestañas escribiendo a la vez**: gana la última en guardar; puede perderse un mensaje. Se acepta, igual que en el resto de la app.
- **Hilo muy largo**: se manda entero a la IA. Con el cupo de 20 al día, tarda en ser un problema; si algún día lo es, se recortará a los últimos N mensajes.
- **Consejos antiguos sin fecha legible**: se colocan al principio del hilo.
- **La entrevista de bienvenida en curso**: manda ella. La conversación no se enseña hasta que la entrevista termina o se abandona.

## 7. Archivos afectados

| Archivo | Cambio |
|---|---|
| `js/conversacion.js` | **nuevo**: hilo de la operación, enviar mensaje, cupo diario y mezcla con los consejos antiguos |
| `api/consulta.js` | instrucciones del modo `conversacion` |
| `js/app.js` | la sección Consulta pasa a chat; fuera todo lo de Consejos |
| `index.html` | fuera la sección Consejos y su atajo; el chat en Consulta |
| `styles.css` | el hilo y el campo de escribir |
| `js/consejos.js` | se queda solo con `listarConsejos`; fuera `pedirConsejo` |
| `api/consejo.js` | **se borra**: ya no lo llama nadie |

**Estimación: ~320 líneas.**

## 8. Decisiones tomadas

- **Una conversación que dura, en vez de consultas sueltas** → decisión del usuario: "vas a tu nutricionista y habláis de cómo va la dieta".
- **20 mensajes al día** → decisión del usuario. Se cuentan mensajes y no conversaciones porque ya no hay conversaciones que contar.
- **Los consejos antiguos se enseñan en el hilo** → decisión del usuario: no se pierde nada y la conversación arranca con contexto.
- **Una conversación por operación** → si arrastrase toda la historia, en la tercera operación la IA estaría leyendo cosas de hace un año en cada mensaje.
- **La entrevista de bienvenida no cambia** → es otra cosa: tiene principio, fin y un plan como resultado.

## 9. Fuera de spec: ideas apuntadas

- Recortar el hilo que se manda a la IA cuando la conversación se haga muy larga. → `docs/BACKLOG.md`

## ✅ Para probar a mano

Se prueba junto con el resto de specs de la v3.
