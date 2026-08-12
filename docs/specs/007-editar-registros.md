# 007 — Editar registros de peso, comida y ejercicio

- **Estado:** completada (probada por el usuario en producción el 2026-08-12)
- **Fecha:** 2026-08-12
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v2)", primer punto ("Corregir lo apuntado"), y los conceptos Pesaje / Comida / Ejercicio.

## 1. Objetivo

Que el usuario pueda corregir un pesaje, una comida o un ejercicio ya guardado sin borrarlo y volver a crearlo: se editan todos sus campos, incluida la fecha.

## 2. Criterio de "esto funciona"

1. En la pestaña **Peso**, pulsar "Editar" en una fila de la lista: esa fila se convierte en campos editables (fecha y peso) con los valores actuales ya cargados, y aparecen los botones "Guardar" y "Cancelar".
2. Cambiar el peso a otro valor y pulsar "Guardar": la fila vuelve a modo lectura mostrando el nuevo peso, sin recargar la página.
3. Editar otra fila y cambiarle **solo la fecha** a un día anterior: al guardar, la lista se reordena y la fila aparece en su nueva posición cronológica.
4. Pulsar "Editar", cambiar algo y pulsar "Cancelar": la fila vuelve a los valores originales y no se guarda nada.
5. Poner una fecha futura y pulsar "Guardar": sale el mensaje "La fecha no puede ser futura." y la fila sigue en modo edición.
6. Vaciar el peso (o el texto, en comida/ejercicio) y pulsar "Guardar": sale el mismo mensaje de error que al dar de alta, y no se guarda.
7. Lo mismo (pasos 1 a 6) en la pestaña **Comidas**, editando texto, momento y fecha.
8. Lo mismo en la pestaña **Ejercicio**, editando texto, minutos, intensidad y fecha.
9. Recargar la página: todos los cambios guardados siguen ahí.
10. Con dos filas a la vez: al pulsar "Editar" en una segunda fila mientras hay otra en edición, la primera vuelve a modo lectura descartando sus cambios.

## 3. Alcance

### Entra

- Botón "Editar" en cada fila de las listas de pesajes, comidas y ejercicios.
- Edición **dentro de la propia fila** (la fila se transforma en campos de formulario).
- Campos editables:
  - Pesaje: fecha, peso.
  - Comida: fecha, momento, texto.
  - Ejercicio: fecha, texto, minutos, intensidad.
- Reutilizar las funciones de validación existentes (`validarPesaje`, `validarComida`, `validarEjercicio`), con los mismos mensajes de error.
- Guardar `editadoEn: serverTimestamp()` en el documento al editar (campo oculto, no se muestra).
- Reordenar la lista al guardar, para que un cambio de fecha coloque la fila donde toca.

### NO entra (explícitamente fuera)

- **Fotos de progreso**: siguen clavadas a la fecha de subida. El ID del documento en Firestore y el nombre del archivo en Cloudinary son la fecha, así que cambiarla implica mover documento y archivo. Fuera de esta spec.
- **Ajustes de usuario** (peso objetivo, altura, fecha objetivo): ya se editan desde su propia pantalla desde la spec 006.
- Consejos, consultas y planes: no se editan.
- Alta múltiple / "repetir en otra fecha" para rellenar varios días de golpe: a `docs/BACKLOG.md`.
- Historial de versiones o deshacer: no hay. `editadoEn` solo guarda la última edición.
- Cambios de estilo o de disposición más allá de lo mínimo para que la fila en edición se vea bien. El rediseño visual es la siguiente spec.

## 4. Comportamiento detallado

### Modo lectura (lo de ahora + un botón)

Cada fila de las tres listas pasa a tener dos botones: **"Editar"** y **"Borrar"** (hoy solo hay "Borrar").

### Modo edición

Al pulsar "Editar":

- La fila sustituye sus celdas de texto por campos de formulario con los valores actuales:
  - Pesaje: `<input type="date">` + `<input type="text" inputmode="decimal">`.
  - Comida: `<input type="date">` + `<select>` de momentos (mismas opciones que el alta) + `<textarea rows="2">`.
  - Ejercicio: `<input type="date">` + texto + minutos (`inputmode="numeric"`) + `<select>` de intensidad.
- Los botones "Editar"/"Borrar" se sustituyen por **"Guardar"** y **"Cancelar"**.
- Solo puede haber **una fila en edición a la vez** por lista: abrir otra cierra la anterior descartando cambios, sin preguntar.
- Los errores de validación se muestran en el mismo `<p class="error">` que ya usa la pestaña (`error-pesaje`, `error-comida`, `error-ejercicio`), y se limpian al empezar una edición nueva.

### Cómo lo sostiene `crearLista()`

Hoy `crearLista()` (`js/app.js`, líneas 164-214) repinta la lista entera desde lo que devuelve `config.cargar(uidActual)` y no guarda los registros en memoria. Para esta spec:

- `crearLista()` guarda en variables de cierre **el último array de registros cargado** y **el id de la fila en edición** (o `null`).
- Se separan dos cosas: **pintar** desde los datos en memoria, y **recargar** de Firestore. Abrir, cerrar o cancelar una edición solo repinta; no hace ninguna llamada de red. Solo guardar (y el "Reintentar" de siempre) recarga.
- Los `<select>` de momento e intensidad en modo edición no pueden construirse con `rellenarDesplegable()`: esa función siempre selecciona el valor por defecto. Hace falta una variante que acepte el valor actual del registro.

### Guardar

1. Se valida con la misma función que el alta. Si hay error: se muestra el mensaje y la fila **se queda en modo edición**, sin perder lo escrito.
2. Si vale: se deshabilita el botón "Guardar", se hace `updateDoc` con los campos validados más `editadoEn: serverTimestamp()`, y se refresca la lista entera (`refrescar()`, ya existe), lo que reordena y vuelve a pintar todo en modo lectura.
3. Si el guardado falla: mensaje "No se ha podido guardar. Comprueba tu conexión." en el `<p class="error">` de la pestaña, el botón se vuelve a habilitar y la fila sigue en edición con lo escrito.

### Cancelar

Vuelve a pintar la fila en modo lectura con los valores originales. Sin confirmación, aunque haya cambios: son registros de una línea, no un formulario largo.

## 5. Modelo de datos

Sin colecciones ni campos nuevos, salvo uno opcional:

| Colección | Campo | Tipo | Cambio |
|---|---|---|---|
| `usuarios/{uid}/pesajes/{id}` | `fecha`, `pesoKg` | string "AAAA-MM-DD", number | ahora modificables |
| `usuarios/{uid}/comidas/{id}` | `fecha`, `momento`, `texto` | string, string, string | ahora modificables |
| `usuarios/{uid}/ejercicios/{id}` | `fecha`, `texto`, `minutos`, `intensidad` | string, string, number, string | ahora modificables |
| las tres | `creadoEn` | Timestamp | **no se toca** — se usa para desempatar el orden (`compararPorFechaYCreacion`) |
| las tres | `editadoEn` | Timestamp | **nuevo**, se escribe solo al editar. Los registros nunca editados no lo tienen |

Reglas de Firestore: **sin cambios**. `allow read, write` ya cubre `update` en las tres subcolecciones (`firestore.rules`, líneas 29-39).

## 6. Casos límite

- **Sin conexión al guardar**: mensaje de error en la pestaña, la fila se queda en edición con lo escrito. No se pierde nada.
- **El registro ya no existe** (borrado desde otro dispositivo): `updateDoc` falla; se muestra el mismo mensaje de error de guardado. Al pulsar "Reintentar" o cambiar de pestaña, la lista se refresca y la fila desaparece. No se hace nada más sofisticado.
- **Fecha futura**: "La fecha no puede ser futura." (ya lo dice `errorDeFecha`).
- **Fecha vacía**: "Introduce una fecha."
- **Peso/texto/minutos inválidos**: los mensajes que ya devuelven los validadores actuales, sin inventar textos nuevos.
- **Editar sin cambiar nada y guardar**: se guarda igual (escribe `editadoEn`). No se detecta "sin cambios".
- **Cambiar de pestaña con una fila en edición**: la edición **se mantiene**. Las pestañas solo alternan clases CSS (`abrirPestana()`), las tres secciones están siempre en el DOM y nada recarga la lista, así que al volver la fila sigue en edición con lo escrito.
- **Reinicio de datos desde Ajustes** (spec 006) con una fila en edición: `refrescarTodo()` sí recarga las tres listas, y ahí la edición se pierde sin aviso. Aceptado, no se protege.
- **Formulario de alta con texto sin guardar y a la vez una fila en edición**: son independientes. Abrir o guardar una edición no limpia ni valida el formulario de alta, y viceversa.
- **Cupos diarios de IA** (5 consejos, 2 consultas): no les afecta, se cuentan sobre consejos y consultas, no sobre registros.
- **Consejos de la IA**: leen los registros de los últimos 14 días por su campo `fecha`, así que cambiar la fecha de un registro cambia lo que ve la IA en la siguiente petición. Es justo lo que se busca.

## 7. Archivos afectados

| Archivo | Cambio |
|---|---|
| `js/pesajes.js` | añadir `actualizarPesaje(uid, id, pesoKg, fecha)` con `updateDoc` |
| `js/comidas.js` | añadir `actualizarComida(uid, id, texto, momento, fecha)` |
| `js/ejercicios.js` | añadir `actualizarEjercicio(uid, id, texto, minutos, intensidad, fecha)` |
| `js/app.js` | `crearLista()`: guardar registros y fila en edición en memoria, separar pintar de recargar, botón "Editar", modo edición en la fila, guardar/cancelar. Config nueva por lista: `campos()` y `actualizar()`. Variante de `rellenarDesplegable()` que acepta el valor actual |
| `styles.css` | estilos mínimos para la fila en edición (que los campos quepan en móvil) |
| `docs/PRODUCTO.md` | añadir la línea de edición de registros (apartado 8) |
| `docs/BACKLOG.md` | apuntar la idea de alta múltiple / "repetir en otra fecha" |

Estimación: ~200-230 líneas de cambios, la mayoría en `js/app.js`. Por debajo del límite de 300.

## 8. Decisiones tomadas

- **Editar el registro entero, no solo la fecha** → si te equivocas al teclear el peso, borrar y volver a crear es igual de molesto que con la fecha, y el coste extra es pequeño.
- **Edición dentro de la fila**, no reutilizando el formulario de alta → el contexto no se pierde de vista; se ve qué fila se está tocando.
- **`editadoEn` guardado pero no visible** → sirve para depurar algún día sin ensuciar la pantalla.
- **Fotos fuera** → su fecha es el ID del documento y el nombre del archivo en Cloudinary; cambiarla es mover ambas cosas y no compensa ahora.
- **Alta múltiple fuera, pero apuntada en BACKLOG** → el alta con fecha pasada de una en una ya resuelve el caso de inventarse datos para probar.
- **Sin confirmación al cancelar** → registros cortos, se vuelven a escribir en segundos.

## 9. Fuera de spec: ideas apuntadas

- Botón "repetir en otra fecha" / alta múltiple para rellenar varios días de golpe. → `docs/BACKLOG.md`
- Editar la fecha de una foto de progreso (implica mover documento en Firestore y archivo en Cloudinary). → `docs/BACKLOG.md`

## ✅ Para probar a mano

Guion de prueba manual (lo rellena/afina el agente `qa-manual` antes de la prueba).
