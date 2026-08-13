# 014 — Hora opcional en los registros

- **Estado:** revisada
- **Fecha:** 2026-08-13
- **Referencia en PRODUCTO.md:** apartado "Ampliación de la v2", punto "Hora opcional en los registros".

## 1. Objetivo

Que pesajes, comidas y ejercicios puedan llevar hora además de fecha. Al apuntar se propone la hora actual, y se puede cambiar o borrar. Saber que te pesaste a las 8:30 antes de desayunar es información útil; obligar a rellenarla, no.

## 2. Criterio de "esto funciona"

1. Abrir la pestaña **Peso**: el campo **Hora** ya viene relleno con la hora actual.
2. Guardar sin tocarla: el pesaje queda con esa hora, y en la lista aparece `13/08/2026 8:34`.
3. Borrar la hora antes de guardar: se guarda igual, y en la lista sale solo la fecha.
4. Cambiar la hora a mano antes de guardar: se guarda la que pusiste.
5. Lo mismo en **Comidas** y en **Ejercicio**.
6. **Editar** un registro (spec 007): la fila en edición trae también un campo de hora, que se puede cambiar o vaciar.
7. Los registros **antiguos**, apuntados antes de esta spec, siguen viéndose y editándose sin problema: aparecen sin hora.
8. Dentro de un mismo día, la lista ordena **por hora, de más reciente a más antigua**. Los que no tienen hora van después de los que sí.
9. En "Hoy", la línea del resumen sigue enseñando lo último apuntado, ahora teniendo en cuenta la hora.
10. La hora **no afecta** a la gráfica, al calendario ni a los cupos de IA: todo eso sigue funcionando por días.

## 3. Alcance

### Entra

- Campo **hora** (`<input type="time">`) en los tres formularios de alta, precargado con la hora actual.
- Campo **hora** en la edición dentro de la fila de las tres listas.
- La hora se guarda como texto `HH:MM` o queda ausente si se vacía.
- **Orden por hora** dentro del mismo día.
- La hora se enseña junto a la fecha en las tres listas y en el resumen de "Hoy".

### NO entra (explícitamente fuera)

- **Hora obligatoria**: es opcional siempre.
- **Hora en las fotos de progreso**: siguen siendo una por día.
- **Rellenar la hora de los registros antiguos**: se quedan sin ella.
- **Agrupar por franjas** (mañana, tarde, noche) ni deducir el momento de la comida a partir de la hora.
- **Usar la hora en la IA, la gráfica, el calendario o las estadísticas**: todo eso sigue por días.
- **Zonas horarias**: la hora es la del móvil de quien apunta, como texto. No se convierte a nada.

## 4. Comportamiento detallado

### El campo

- `<input type="time">` etiquetado **Hora**, después del de fecha en los tres formularios.
- Al entrar en la app y después de cada alta, se rellena con la hora actual (`horaActual()`, nueva en `js/fechas.js`), igual que el campo de fecha se rellena con hoy.
- Se puede vaciar. Vacío es válido.

### Validación

Las funciones `validarPesaje`, `validarComida` y `validarEjercicio` reciben un parámetro más:

- Vacío → el registro se guarda **sin** campo `hora`.
- Con formato `HH:MM` → se guarda tal cual.
- Cualquier otra cosa → `La hora no es válida.` El navegador ya impide escribir formatos raros en un `input type="time"`, pero la validación no se fía del navegador.
- **No se comprueba que la hora no sea futura**: un pesaje de ayer a las 23:00 es válido, y comprobar hora futura solo tendría sentido para hoy. No merece la complicación.

### Cómo se enseña

- En las listas, la celda de fecha pasa a decir `13/08/2026 8:34` cuando hay hora, y `13/08/2026` cuando no.
- La hora se escribe sin cero delante: `8:34`, no `08:34`.
- En "Hoy", igual: lo último apuntado se acompaña de su hora si la tiene.

### Orden

`compararPorFechaYCreacion()` (en `js/fechas.js`) pasa a mirar la hora antes que `creadoEn`:

1. Fecha, de más reciente a más antigua.
2. A igualdad de fecha, **hora**, de más reciente a más antigua. Los registros **sin hora van después** de los que la tienen.
3. A igualdad de hora (o sin hora ninguno), `creadoEn`, como hasta ahora.

En comidas, el orden por momento del día (desayuno, comida, cena...) **sigue mandando sobre la hora**: es el orden natural del día y ya estaba decidido en la spec 002.

## 5. Modelo de datos

| Colección | Campo | Tipo | Cambio |
|---|---|---|---|
| `usuarios/{uid}/pesajes/{id}` | `hora` | string `HH:MM`, o ausente | **nuevo**, opcional |
| `usuarios/{uid}/comidas/{id}` | `hora` | string `HH:MM`, o ausente | **nuevo**, opcional |
| `usuarios/{uid}/ejercicios/{id}` | `hora` | string `HH:MM`, o ausente | **nuevo**, opcional |

Los documentos que ya existen no se migran: sin campo `hora` es exactamente "no tiene hora".

`firestore.rules`: **sin cambios**.

## 6. Casos límite

- **Registro antiguo sin hora**: se ve solo con fecha y se ordena después de los que sí tienen. Al editarlo, el campo de hora sale vacío; se le puede poner una.
- **Editar y vaciar la hora**: hay que **borrar el campo** del documento, no guardar cadena vacía, para que "sin hora" sea siempre lo mismo. Se usa `deleteField()` de Firestore.
- **Medianoche**: `00:00` es una hora válida y ordena la primera del día por la mañana; como el orden es descendente, aparece la última de ese día.
- **Cambio de horario de verano**: no afecta, la hora es texto y no se convierte.
- **Apuntar de madrugada con fecha de ayer**: se permite. Es justo el caso de la cena tardía.
- **Hora sin fecha**: imposible, la fecha sigue siendo obligatoria.

## 7. Archivos afectados

| Archivo | Cambio |
|---|---|
| `js/fechas.js` | `horaActual()`, `errorDeHora()`, `formatearHora()` y el orden por hora en `compararPorFechaYCreacion()` |
| `js/pesajes.js`, `js/comidas.js`, `js/ejercicios.js` | validar, guardar y actualizar la hora; borrar el campo al vaciarla |
| `js/app.js` | campo de hora en los tres formularios y en la edición en fila; fecha y hora juntas en las listas y en "Hoy" |
| `index.html` | campo de hora en los tres formularios |

**Estimación: ~250 líneas.**

## 8. Decisiones tomadas

- **Opcional siempre** → decisión del usuario: "debería ser opcional la hora en todos los sitios".
- **Se propone la hora actual al apuntar** → decisión del usuario: "que te coja el getdate de cuando lo estás dando de alta pero que sea fácilmente editable".
- **Sin hora se ordena después** → si no, un registro antiguo sin hora aparecería por delante de los de esa mañana.
- **El momento de la comida sigue mandando sobre la hora** → el orden del día (desayuno, comida, cena) es el que se lee bien; ya estaba decidido en la spec 002.
- **Vaciar la hora borra el campo** → dos formas de decir "sin hora" (ausente y cadena vacía) acaban en un `if` olvidado.
- **La hora no toca ni IA ni gráficas** → todo el producto razona por días; meter horas ahí es otra spec, si alguna vez hace falta.

## 9. Fuera de spec: ideas apuntadas

- Deducir el momento de la comida a partir de la hora (a las 9:00, desayuno). → `docs/BACKLOG.md`

## ✅ Para probar a mano

Se prueba junto con el resto de specs de esta tanda.
