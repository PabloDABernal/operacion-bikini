# 027 — Dietas y tablas: semana completa, con instrucciones y cupo propio

- **Estado:** revisada
- **Fecha:** 2026-08-16
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v3)", punto "Cada cosa en su sitio". Corrige lo que la spec 017 dejó a medias.

## 1. Objetivo

Que pedir una dieta o una tabla de ejercicio deje de comportarse como una consulta: siempre de lunes a domingo, con su propio cupo diario, y pudiéndole decir lo que haga falta ("el jueves salgo a cenar", "el sábado no puedo entrenar").

## 2. Criterio de "esto funciona"

1. En **Comidas → Hacer dieta** ya no se elige entre 3 y 7 días: la dieta es siempre **de lunes a domingo**.
2. Al pulsar el botón aparece un campo para **decirle algo**, opcional, y el botón de pedir.
3. Escribir *"ponme libre el jueves, que salgo a comer"* y pedir: la dieta que llega **respeta esa petición**.
4. Lo mismo en **Ejercicio → Tabla de ejercicios**: siempre la semana, con su campo para pedir cambios.
5. Escribir *"el sábado juego al pádel, no me pongas nada"* y la tabla lo tiene en cuenta.
6. Debajo del botón se ve cuántas te quedan hoy: **2 dietas y 2 tablas al día**, contadas por separado.
7. Gastadas las 2 dietas, el botón de dieta se deshabilita pero el de la tabla **sigue disponible**.
8. Pedir una dieta ya **no gasta** ninguna de las 2 consultas de la entrevista.
9. Los planes siguen apareciendo en **Mis planes**, etiquetados como antes.

## 3. Alcance

### Entra

- **Fuera los alcances** (hoy, semana, 3 días, 7 días): siempre de lunes a domingo.
- **Campo de instrucciones** libre y opcional, que viaja a la IA.
- **Cupo propio por tipo**: 2 dietas y 2 tablas al día, contadas sobre los planes guardados.
- Contador visible de lo que queda.

### NO entra (explícitamente fuera)

- **Guardar la dieta como una semana editable**: eso es la spec siguiente. Aquí sigue llegando como texto.
- **Que la dieta use tus recetas guardadas**: también la siguiente.
- Cambiar la entrevista ni la conversación.
- Recordar las instrucciones de la última vez.

## 4. Comportamiento detallado

### La petición

- El botón **Pedir dieta detallada** / **Pedir tabla de ejercicio** despliega un `<textarea>` con la etiqueta **"¿Algo que deba tener en cuenta?"** y un ejemplo en el marcador de posición.
- Debajo, **Pedir** y **Cancelar**.
- El texto es opcional y se limita a **500 caracteres**.
- Se manda a la IA como una petición más del usuario, después de sus registros y su perfil.

### Las instrucciones en el prompt

Se añaden como un bloque aparte, con una orden clara: *"Además, esta persona te pide expresamente lo siguiente, y tienes que respetarlo: …"*. Si contradice lo razonable (por ejemplo, pedir siete días de descanso), la IA lo dice en el propio plan en vez de ignorarlo en silencio.

### La semana

Siempre **de lunes a domingo**, los siete días, en las dos. Se le pide explícitamente que empiece cada línea por el día.

### El cupo

- **2 dietas y 2 tablas al día**, cada una por su lado.
- Se cuentan los **planes guardados hoy de ese tipo**, no las consultas: un plan que no llegó a guardarse (porque falló la IA) no gasta cupo, igual que hasta ahora.
- Debajo del botón: `Te quedan 2 dietas hoy.` / `Has pedido tus 2 dietas de hoy. Vuelve mañana.`
- La entrevista de bienvenida mantiene su cupo de 2 consultas al día, ya sin compartirlo con nada.

## 5. Modelo de datos

| Ruta | Campo | Cambio |
|---|---|---|
| `usuarios/{uid}/planes/{id}` | `alcance` | **deja de escribirse**. Los planes antiguos lo conservan y se siguen enseñando igual |
| `usuarios/{uid}/planes/{id}` | `instrucciones` | **nuevo**: lo que se le pidió, para saber por qué salió así |

Ya no se crea un documento en `consultas` al pedir un plan: el cupo se cuenta sobre los propios planes.

`firestore.rules`: **sin cambios**.

## 6. Casos límite

- **Sin instrucciones**: se pide igual, sin bloque extra en el prompt.
- **Instrucciones larguísimas**: se cortan a 500 caracteres.
- **Instrucciones absurdas o contradictorias**: la IA responde lo que pueda y lo advierte en el plan. No se valida el contenido.
- **Planes antiguos con `alcance`**: se siguen etiquetando con él en "Mis planes"; los nuevos, solo con su tipo.
- **Cupo y husos horarios**: se cuenta por fecha local, como todo lo demás.
- **Fallo de la IA**: no se guarda plan y no se gasta cupo.

## 7. Archivos afectados

| Archivo | Cambio |
|---|---|
| `api/plan.js` | fuera los alcances, semana fija de lunes a domingo, bloque de instrucciones |
| `js/consulta.js` | cupo por tipo sobre los planes, instrucciones en la petición, fuera el documento de consulta |
| `js/app.js` | campo de instrucciones y contador por tipo |
| `index.html` | el campo y el contador en las dos secciones |

**Estimación: ~200 líneas.**

## 8. Decisiones tomadas

- **Cupo propio por tipo** → decisión del usuario: que una dieta gastara una consulta de la entrevista no tenía sentido; son cosas distintas.
- **El cupo se cuenta sobre los planes guardados** → es el dato que ya existe y que dice la verdad: si el plan no se guardó, no se pidió.
- **Siempre de lunes a domingo** → decisión del usuario. Una dieta "para hoy" o "para tres días" no encaja con cómo se planifica una semana.
- **Campo de instrucciones libre, no una lista de opciones** → "el jueves salgo a comer" no cabe en un desplegable.

## 9. Fuera de spec: ideas apuntadas

- Recordar las últimas instrucciones para no reescribirlas. → `docs/BACKLOG.md`

## ✅ Para probar a mano

Se prueba junto con el resto de specs de la v3.
