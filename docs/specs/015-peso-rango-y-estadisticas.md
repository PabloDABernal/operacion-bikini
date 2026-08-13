# 015 — Peso: gráfica con rango, orden nuevo y estadísticas

- **Estado:** revisada
- **Fecha:** 2026-08-13
- **Referencia en PRODUCTO.md:** apartado "Ampliación de la v2", punto "Estadísticas de peso".

## 1. Objetivo

Reordenar la pestaña Peso como pidió el usuario —gráfica, pesajes, estadísticas—, dejar elegir el rango de la gráfica, y sustituir el comparador semanal suelto ("−1,0 kg esta semana", que "queda rarísimo") por un bloque de estadísticas de verdad.

## 2. Criterio de "esto funciona"

1. La pestaña **Peso** va en este orden: formulario, **gráfica**, **Mis pesajes**, **Estadísticas**.
2. El comparador suelto de debajo de la gráfica **ya no está**.
3. Encima de la gráfica hay un selector de rango: **1 semana · 1 mes · 3 meses · 6 meses · 1 año · Todo**. Por defecto, **1 mes**.
4. Al elegir "1 semana", la gráfica se redibuja con solo los pesajes de los últimos 7 días.
5. Con un rango donde hay menos de dos pesajes, sale el mensaje de siempre en vez de una gráfica rota.
6. Abajo, **Estadísticas** con cuatro líneas: **Últimos 7 días**, **Últimos 30 días**, **Desde que empezaste** y **Para el objetivo**.
7. "Últimos 7 días" dice cuánto has bajado o subido comparando con la semana anterior, en kg con signo.
8. "Desde que empezaste" dice la diferencia entre el primer pesaje y el último, y en cuántos días.
9. "Para el objetivo" dice cuántos kilos faltan. Sin peso objetivo en Ajustes, invita a ponerlo.
10. Con el objetivo ya alcanzado, lo dice en vez de enseñar un número negativo raro.
11. Apuntar, editar o borrar un pesaje actualiza gráfica y estadísticas al momento.
12. Sin pesajes, las estadísticas no están rotas: cada línea dice que aún no hay datos.

## 3. Alcance

### Entra

- **Reordenar** la pestaña Peso.
- **Selector de rango de la gráfica**: 1 semana, 1 mes (por defecto), 3 meses, 6 meses, 1 año y todo.
- **Bloque de estadísticas** con las cuatro líneas de arriba.
- **Retirada del comparador semanal** de debajo de la gráfica: lo que decía pasa a ser la línea "Últimos 7 días" de las estadísticas.

### NO entra (explícitamente fuera)

- **Fecha estimada de llegada al objetivo**: proyectar al ritmo actual es adivinar, y con dos semanas de datos saldrían fechas absurdas. El usuario eligió "lo que falta", no la predicción.
- **Máximo, mínimo y media**: el usuario no los eligió.
- **Estadísticas de comidas o ejercicio**: solo peso.
- **Cambiar el calendario de constancia** ni nada de "Hoy": eso fue la spec 012.
- **Recordar el rango elegido** entre sesiones.

## 4. Comportamiento detallado

### Orden y selector de rango

- Orden en el HTML: formulario de alta → gráfica (con su selector encima) → Mis pesajes (con su filtro y su desplegable, spec 013) → Estadísticas.
- Selector: seis botones, mismo aspecto que el del calendario de "Hoy" (clase `.rango`), con el elegido en coral.
- Rangos en días: 7, 30, 90, 180, 365 y todo.
- El rango **solo afecta a la gráfica**. Las estadísticas y la lista no cambian con él: son otra cosa y confundiría.
- Con el rango aplicado, la media móvil se calcula **con todos los pesajes** y luego se recorta la ventana a pintar. Si no, al elegir "1 semana" los primeros días saldrían con una media falsa calculada solo sobre lo que se ve.

### Estadísticas

Cuatro líneas, etiqueta a la izquierda y valor a la derecha:

| Línea | Qué dice | Sin datos suficientes |
|---|---|---|
| Últimos 7 días | media de los últimos 7 días menos la de los 7 anteriores, en kg con signo | `Aún no hay datos suficientes` |
| Últimos 30 días | lo mismo con ventanas de 30 días | `Aún no hay datos suficientes` |
| Desde que empezaste | último peso menos el primero, y `en N días` debajo | `Necesitas al menos dos pesajes` |
| Para el objetivo | `Te faltan 2,3 kg` | sin objetivo: `Ponte un peso objetivo en Ajustes` |

- Las comparaciones de 7 y 30 días reutilizan el promedio **por días** que ya usa `compararSemanas()` de la spec 008, generalizado a un número de días cualquiera.
- Signo: `−` para bajar y `+` para subir, sin colorear de verde ni rojo (`PRODUCTO.md`: se premia la conducta, no los kilos).
- Si la diferencia redondeada es 0,0: `Igual que la semana pasada` / `Igual que hace un mes`.
- "Para el objetivo" compara el **último peso apuntado** con el objetivo. Si el último peso ya es igual o menor: `¡Objetivo alcanzado!`.

## 5. Modelo de datos

**Ninguno.** Todo se calcula en el navegador con los pesajes ya cargados y el peso objetivo ya cacheado. `firestore.rules` sin cambios.

## 6. Casos límite

- **Cero o un pesaje**: gráfica con su mensaje; estadísticas con sus textos de "sin datos".
- **Rango sin pesajes** (por ejemplo "1 semana" y llevas dos semanas sin pesarte): mensaje de la gráfica, y las estadísticas siguen enseñando lo suyo, que no depende del rango.
- **Objetivo por encima del peso actual** (quiere engordar): `Te faltan 2,3 kg` igualmente; no se asume que se quiere adelgazar.
- **Todos los pesajes el mismo día**: "Desde que empezaste" dice `en 0 días`; la diferencia sale de la media de ese día contra sí misma, o sea 0,0.
- **Pesajes con hora** (spec 014): las estadísticas siguen razonando por días, la hora no interviene.
- **Sin conexión**: como siempre, se pinta lo que haya en memoria.

## 7. Archivos afectados

| Archivo | Cambio |
|---|---|
| `js/estadisticas.js` | **nuevo**. Cálculo puro de las cuatro líneas |
| `js/grafica.js` | `compararVentanas(diarios, hoy, dias)` generalizando `compararSemanas` |
| `js/app.js` | selector de rango, recorte de la gráfica, pintado de las estadísticas, fuera el comparador |
| `index.html` | reordenar la sección Peso, selector, bloque de estadísticas, fuera el comparador |
| `styles.css` | estilos del bloque de estadísticas |

**Estimación: ~260 líneas.**

## 8. Decisiones tomadas

- **Orden gráfica → pesajes → estadísticas** → decisión del usuario el 2026-08-13.
- **Fuera el comparador suelto** → decisión del usuario: "queda rarísimo". Su contenido vive ahora dentro de las estadísticas, que es donde se entiende.
- **Las cuatro estadísticas elegidas por el usuario**: 7 días, 30 días, total, y lo que falta. Descartadas la fecha estimada y máximo/mínimo/media.
- **El rango solo afecta a la gráfica** → si cambiara también las estadísticas, "últimos 7 días" pasaría a significar cosas distintas según un botón, que es la peor forma de mentir con números.
- **La media móvil se calcula con todo y luego se recorta** → si no, el principio de cada rango enseñaría una media inventada.

## 9. Fuera de spec: ideas apuntadas

- Fecha estimada de llegada al objetivo al ritmo actual, cuando haya meses de historial. → `docs/BACKLOG.md`

## ✅ Para probar a mano

Se prueba junto con el resto de specs de esta tanda.
