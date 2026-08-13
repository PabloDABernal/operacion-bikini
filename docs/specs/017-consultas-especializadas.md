# 017 — Consultas especializadas: tabla de ejercicio y dieta detallada

- **Estado:** revisada
- **Fecha:** 2026-08-13
- **Referencia en PRODUCTO.md:** apartado "Ampliación de la v2", punto "Consultas especializadas".

## 1. Objetivo

Que una de las dos consultas del día se pueda gastar en pedir algo concreto —una tabla de ejercicio para hoy o para la semana, o una dieta detallada para los próximos días— en vez de en la entrevista general.

## 2. Criterio de "esto funciona"

1. En **Consulta**, además del botón de siempre, hay dos: **"Pedir tabla de ejercicio"** y **"Pedir dieta detallada"**.
2. Cada uno abre unas opciones: la tabla, para **hoy** o para **la semana**; la dieta, para **3 días** o para **7 días**.
3. Al pedirla, sale "Pensando…" y en unos segundos aparece el resultado como un plan más, el primero de "Mis planes".
4. El plan resultante dice de qué tipo es: `Tabla de ejercicio · semana` o `Dieta detallada · 3 días`.
5. **No hay entrevista**: se pide y llega, en una sola vuelta.
6. Cada petición **gasta una consulta** del cupo diario. Con las dos gastadas, los tres botones salen deshabilitados y se avisa.
7. La IA usa tu **perfil** (spec 016): no propone lo que dijiste que odias, y respeta el material que tienes.
8. La tabla de ejercicio sale con **una línea por día**; la dieta, **por días y por comidas**.
9. Con una consulta en curso, los botones de las especializadas no están disponibles: primero se termina o se abandona.
10. Si falla la IA, sale el mensaje de siempre y **no se gasta** ninguna consulta.

## 3. Alcance

### Entra

- **Dos tipos de consulta especializada**: tabla de ejercicio (hoy / semana) y dieta detallada (3 días / 7 días).
- **Sin conversación**: una petición, una respuesta.
- Se guardan como **planes**, en la misma colección y con la misma lista de siempre, con su tipo y su alcance.
- **Consumen del mismo cupo** de 2 consultas al día.
- Usan el **perfil** y los registros recientes, como todo lo demás.

### NO entra (explícitamente fuera)

- **Repreguntar** sobre una tabla ya generada ("cámbiame el martes"): es una petición nueva.
- **Guardar la tabla como rutina activa** ni marcar días como hechos.
- **Convertir la dieta en comidas apuntadas**: sigue siendo texto para leer.
- **Elegir músculos, calorías o macros exactos**: la IA decide con tu perfil.
- **Cupos separados** por tipo de consulta: los dos salen del mismo bote de 2.
- **Recordar la última opción elegida**.

## 4. Comportamiento detallado

### La pantalla

Debajo del botón de consulta general, un bloque **"O pide algo concreto"** con dos botones. Al pulsar uno, aparecen sus opciones (dos botones) y un botón de cancelar. Al elegir opción, se lanza la petición.

Los tres botones (consulta general y los dos especializados) se deshabilitan si no quedan consultas hoy o si hay una consulta en curso.

### La petición

- Endpoint nuevo: `api/plan.js`, hermano de `api/consulta.js`. Recibe `tipo` (`ejercicio` o `dieta`), `alcance` (`hoy`, `semana`, `3dias`, `7dias`), los registros recientes, el nombre y el perfil.
- Instrucciones distintas por tipo:
  - **Ejercicio**: una línea por día, respetando material y limitaciones, con series y repeticiones o duración. Marca descansos.
  - **Dieta**: por día y por comida (desayuno, comida, merienda, cena), con raciones aproximadas, **sin calorías exactas** (`PRODUCTO.md`: nada de precisión fingida).
- Esquema de respuesta con dos campos obligatorios: `nutricion` y `ejercicio`. El que no aplica viene vacío, siguiendo lo aprendido en la spec 004 con Gemini.
- Una sola llamada. Sin reintentos ni conversación.

### Qué se guarda

En `usuarios/{uid}/planes`, un documento como los de siempre más dos campos:

- `tipo`: `"entrevista"` (los de siempre), `"ejercicio"` o `"dieta"`.
- `alcance`: `"hoy"`, `"semana"`, `"3dias"`, `"7dias"`, o ausente en los de entrevista.

Los planes ya guardados no tienen `tipo`: se enseñan como "Plan completo", que es lo que son.

### El cupo

- Cuenta igual que una consulta: se crea un documento en `consultas` con `estado: "terminada"`, `modo: "especializada"` y sin mensajes, para que `empezadasHoy()` lo cuente sin tocar esa función.
- **Primero la IA, después el documento**: si la IA falla, no se escribe nada y no se gasta cupo.

## 5. Modelo de datos

| Colección | Campo | Tipo | Cambio |
|---|---|---|---|
| `usuarios/{uid}/planes/{id}` | `tipo` | `"entrevista"`, `"ejercicio"` o `"dieta"` | **nuevo** |
| `usuarios/{uid}/planes/{id}` | `alcance` | string o ausente | **nuevo** |
| `usuarios/{uid}/consultas/{id}` | `modo` | también `"especializada"` | ampliado |

`firestore.rules`: **sin cambios**.

## 6. Casos límite

- **Sin cupo**: los tres botones deshabilitados y el aviso de siempre.
- **Consulta en curso**: las especializadas no se pueden pedir. Primero se cierra la que hay.
- **Sin registros y sin perfil**: se pide igual; la IA dará algo genérico. No se bloquea como en los consejos, porque aquí el usuario está pidiendo algo concreto a propósito.
- **La IA devuelve el campo que no toca** (una dieta en el campo de ejercicio): se guarda lo que venga en el campo correcto según el tipo pedido; si ese campo viene vacío, error `respuesta-ilegible` y no se gasta cupo.
- **Fallo de red a mitad**: no se escribe nada.
- **Planes antiguos**: sin `tipo`, se etiquetan como "Plan completo".
- **Cuota de Gemini agotada**: mismo mensaje que en el resto de la app.

## 7. Archivos afectados

| Archivo | Cambio |
|---|---|
| `api/plan.js` | **nuevo**. Endpoint de planes especializados |
| `js/consulta.js` | `pedirPlanEspecializado()`, y el tipo/alcance al guardar |
| `js/app.js` | botones, opciones y pintado del tipo en la lista de planes |
| `index.html` | bloque "O pide algo concreto" |
| `styles.css` | estilos del bloque |

**Estimación: ~280 líneas.**

## 8. Decisiones tomadas

- **Dos tipos: ejercicio y dieta** → decisión del usuario: "podrías querer pedir una tabla de ejercicios para el día, para la próxima semana, así como dietas detalladas para los próximos X días".
- **Gastan del mismo cupo de 2** → decisión del usuario: "podrías gastar 1 de las consultas".
- **Sin entrevista** → si hubiera que conversar, sería la consulta general otra vez.
- **Se guardan como planes** → es lo que son, y así aparecen donde el usuario ya los busca.
- **Primero la IA y después el documento de cupo** → un fallo de la IA no debe costarte una consulta del día.
- **La dieta no lleva calorías exactas** → `PRODUCTO.md` lo prohíbe: solo rangos, nunca precisión fingida.

## 9. Fuera de spec: ideas apuntadas

- Repreguntar sobre una tabla ya generada ("cámbiame el martes"). → `docs/BACKLOG.md`
- Marcar los días de la tabla como hechos. → `docs/BACKLOG.md`

## ✅ Para probar a mano

Se prueba junto con el resto de specs de esta tanda.
