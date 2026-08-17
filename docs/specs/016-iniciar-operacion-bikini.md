# 016 — "Iniciar operación bikini": entrevista inicial y perfil

- **Estado:** completada (validada por el usuario el 2026-08-17)
- **Fecha:** 2026-08-13
- **Referencia en PRODUCTO.md:** apartado "Ampliación de la v2", punto «"Iniciar operación bikini"».

## 1. Objetivo

Que con la app vacía haya un botón que arranque la primera consulta: una entrevista que además de dar un plan **rellena sola los ajustes** (nombre, altura, peso objetivo, fecha) y **guarda un perfil** —gustos, aversiones, ejercicio que disfruta, material disponible, limitaciones— que la IA usará en todos los consejos y consultas posteriores.

## 2. Criterio de "esto funciona"

1. Con la app recién estrenada (sin consultas ni planes), la pestaña **Consulta** enseña un botón grande **"Iniciar operación bikini"** en vez de "Empezar consulta".
2. Pulsarlo arranca una entrevista que **empieza preguntando cómo quieres que te llamen**.
3. La entrevista pregunta también altura, peso actual, peso objetivo, plazo, qué comidas te gustan y cuáles no, qué ejercicio disfrutas, con qué material cuentas y si tienes alguna limitación.
4. Al terminar, además del plan de siempre, **los Ajustes se han rellenado solos**: nombre, altura, peso objetivo y fecha objetivo.
5. La **cabecera** pasa a enseñar tu nombre, sin que hayas tocado Ajustes.
6. Después, al pedir un **consejo**, la IA te llama por tu nombre y tiene en cuenta lo que dijiste (no te propone algo que dijiste que odias).
7. Una **consulta posterior** también parte de ese perfil: no vuelve a preguntar lo que ya sabe.
8. Con la primera entrevista ya hecha, el botón vuelve a ser **"Pasar consulta"** normal.
9. En **Ajustes** se puede ver y editar lo que la IA guardó del perfil, en un campo de texto libre.
10. Si la entrevista se abandona a medias, no se guarda ningún perfil ni se tocan los ajustes.

## 3. Alcance

### Entra

- **Botón "Iniciar operación bikini"** en Consulta cuando no hay ninguna consulta terminada.
- **Modo inicial de la entrevista**: mismo mecanismo de preguntas y respuestas, pero con instrucciones distintas y con la obligación de cubrir los datos personales.
- **Extracción del perfil** al cerrar la entrevista: la IA devuelve, junto al plan, los datos personales y un resumen del perfil.
- **Guardado automático** de nombre, altura, peso objetivo y fecha objetivo en los ajustes.
- **Campo `perfil`** en el documento del usuario, con el resumen en texto.
- **Uso del perfil** en los prompts de consejos y de consultas posteriores.
- **Edición del perfil** en Ajustes, como texto libre.

### NO entra (explícitamente fuera)

- **Consultas especializadas** (tabla de ejercicio, dieta detallada): spec 017.
- **Rehacer la entrevista inicial** desde un botón: si se quiere repetir, se reinician los datos desde Ajustes.
- **Perfil estructurado por campos** (una lista de alergias, otra de material...): se guarda como texto, que es lo que la IA entiende y lo que el usuario puede corregir sin formularios.
- **Que el perfil se use en el detalle nutricional**: esa spec aún no existe.
- **Validar médicamente nada**: sigue el disclaimer de siempre.

## 4. Comportamiento detallado

### Cuándo se ofrece

- Si el usuario **no tiene ninguna consulta terminada**, la pestaña Consulta enseña "Iniciar operación bikini" y un texto que explica que es la entrevista de bienvenida y que rellenará sus datos.
- Si ya tiene alguna, el botón es "Empezar consulta" como hasta ahora.
- Gasta una de las **2 consultas diarias**, igual que cualquier otra.

### La entrevista inicial

Va contra el mismo endpoint `api/consulta.js` con un campo nuevo en el cuerpo, `modo: "inicial"`, que cambia las instrucciones del sistema:

- Empieza **preguntando el nombre** ("¿cómo quieres que te llame?").
- Debe cubrir, además de lo de siempre: altura, peso actual, peso objetivo, plazo, gustos y aversiones de comida, alergias, ejercicio que disfruta, material disponible y limitaciones.
- Sigue siendo **una pregunta por turno**.

### Lo que devuelve al terminar

El esquema de respuesta gana cinco campos más, **todos obligatorios** (con cadena vacía cuando no aplican, como manda la experiencia de la spec 004 con Gemini):

| Campo | Qué es |
|---|---|
| `nombre` | cómo quiere que le llamen |
| `alturaCm` | altura en cm, como número en texto; vacío si no la dijo |
| `pesoObjetivoKg` | peso objetivo; vacío si no lo dijo |
| `fechaObjetivo` | `AAAA-MM-DD`; vacío si no dio plazo |
| `perfil` | resumen en prosa: gustos, aversiones, alergias, ejercicio que disfruta, material, limitaciones y horarios. Máximo 200 palabras |

En modo normal (no inicial), esos cinco campos vienen vacíos y no se guarda nada.

### Qué se guarda

Al cerrar una entrevista **en modo inicial**, además del plan:

- `nombre`, `alturaCm`, `pesoObjetivoKg` y `fechaObjetivo` se guardan en `usuarios/{uid}` **solo si vienen con valor y pasan las validaciones de `validarAjustes()`**. Un valor inventado o fuera de rango se ignora en silencio: mejor un ajuste vacío que uno falso.
- `perfil` se guarda tal cual, como texto.
- La cabecera y el formulario de Ajustes se refrescan al terminar.

### Uso del perfil

- `api/consejo.js` y `api/consulta.js` reciben el perfil y el nombre en el cuerpo, y los meten en las instrucciones: *"Esta persona se llama X. Esto es lo que sabes de ella: ..."*.
- Si no hay perfil, no se añade nada y todo funciona como hasta hoy.

### Edición en Ajustes

- Campo `<textarea>` **"Lo que la IA sabe de ti"** al final del formulario de Ajustes, con el texto del perfil.
- Se guarda con el resto de ajustes. Máximo 2000 caracteres.
- Explicación debajo: que ese texto es lo que la IA lee antes de aconsejarte, y que se puede corregir.

## 5. Modelo de datos

| Colección | Campo | Tipo | Cambio |
|---|---|---|---|
| `usuarios/{uid}` | `perfil` | string | **nuevo** |
| `usuarios/{uid}/consultas/{id}` | `modo` | `"inicial"` o ausente | **nuevo** |

`firestore.rules`: **sin cambios**.

## 6. Casos límite

- **La IA devuelve una altura absurda** (por ejemplo 1,75 en vez de 175): `validarAjustes()` la rechaza y ese campo se queda como estaba.
- **La IA devuelve una fecha objetivo pasada**: se rechaza igual.
- **El usuario ya tenía ajustes puestos**: la entrevista inicial **los sobrescribe** solo con los valores válidos que devuelva; los que vengan vacíos se dejan como estaban.
- **Entrevista inicial abandonada**: no se guarda nada, ni perfil ni ajustes. Cuenta para el cupo diario, como cualquier consulta abandonada.
- **Perfil larguísimo**: se recorta a 2000 caracteres al guardar.
- **Perfil borrado a mano** en Ajustes: la IA vuelve a funcionar sin él.
- **Reiniciar datos** borrando consultas y planes: el botón vuelve a ser "Iniciar operación bikini", pero **el perfil y los ajustes se conservan**, porque viven en el documento del usuario y ese no se borra. Es coherente con la spec 006.

## 7. Archivos afectados

| Archivo | Cambio |
|---|---|
| `api/consulta.js` | modo inicial con sus instrucciones, cinco campos nuevos en el esquema, perfil y nombre en el contexto |
| `api/consejo.js` | perfil y nombre en las instrucciones |
| `js/consulta.js` | `modo` al empezar, mandar perfil y nombre, guardar ajustes y perfil al cerrar |
| `js/consejos.js` | mandar perfil y nombre |
| `js/ajustes.js` | `perfil` en validar, leer y guardar |
| `js/app.js` | botón de inicio, campo de perfil en Ajustes, refresco al terminar |
| `index.html` | botón, textos y campo de perfil |

**Estimación: ~290 líneas.**

## 8. Decisiones tomadas

- **La entrevista inicial rellena los ajustes sola** → decisión del usuario: "te pregunta altura, peso actual, peso objetivo, fecha y todas las cosas que se quedan en los ajustes, así las guarda en ese momento".
- **El perfil se guarda como texto, no estructurado** → es lo que la IA lee y lo que el usuario puede corregir sin inventar formularios.
- **Los datos que la IA devuelva pasan por las mismas validaciones que el formulario** → la IA se equivoca; un peso objetivo de 5 kg no puede entrar por la puerta de atrás.
- **Se ofrece por no tener consultas terminadas, no por un campo aparte** → un estado menos que mantener y que se puede desincronizar.
- **El perfil sobrevive al reinicio de datos** → vive en el documento del usuario, que la spec 006 no borra. Quien quiera empezar de cero puede vaciar el campo en Ajustes.

## 9. Fuera de spec: ideas apuntadas

- Rehacer la entrevista inicial desde un botón, sin borrar datos. → `docs/BACKLOG.md`

## ✅ Para probar a mano

Se prueba junto con el resto de specs de esta tanda.
