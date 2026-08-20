# 033 — Tocar un punto de la gráfica de peso

- **Estado:** borrador
- **Fecha:** 2026-08-19
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v2)", punto "Gráfica de evolución del peso". No añade nada nuevo al alcance del producto, solo hace consultable un dato que la gráfica ya dibuja — no hace falta tocar `PRODUCTO.md`.

## 1. Objetivo

Tocar (o pasar el ratón por encima de) un punto de la gráfica de peso enseña su fecha y su peso exactos, igual que ya se puede hacer con el calendario de constancia.

## 2. Criterio de "esto funciona"

1. En **Peso**, debajo de la gráfica, hay una línea de detalle (vacía al principio) que dice "Toca un punto para ver su fecha y su peso", igual que ya existe en el calendario de constancia.
2. Con ratón, pasar por encima de un punto (círculo) enseña un tooltip nativo del navegador con la fecha y el peso de ese día.
3. En pantalla táctil, tocar un punto escribe esa misma fecha y peso en la línea de detalle de debajo.
4. El peso que se enseña es el de ese día (si hubo varios pesajes ese día, el ya promediado que representa el punto — el mismo número que la gráfica ya dibuja, sin recalcular nada nuevo).
5. Cambiar de rango (1 semana, 1 mes, 3 meses...) borra el detalle y vuelve al texto de "Toca un punto...", igual que ya hace el calendario al cambiar de rango.
6. Funciona en cualquier rango de la gráfica, no solo en el más corto.

## 3. Alcance

### Entra

- El `<title>` (tooltip nativo) y el evento de toque en cada punto (círculo) de `dibujarGrafica()`.
- La línea de detalle debajo de la gráfica de peso, con su texto inicial y su actualización al tocar.
- Reiniciar el detalle al cambiar de rango.

### NO entra (explícitamente fuera)

- **Tocar la línea de la media móvil**: solo los puntos (círculos) de los pesajes reales, que es lo que pidió el backlog. La media no es un dato que el usuario haya apuntado.
- **Editar el pesaje desde la gráfica**: tocar un punto solo consulta, no lleva a "Mis pesajes" ni abre el formulario de edición.
- **Resaltar visualmente el punto tocado** (cambiar su color o tamaño): solo se pide ver el dato, no un estado de selección persistente.
- **Mostrar la media móvil de ese día junto al peso real**: decisión del usuario, solo el peso real.

## 4. Comportamiento detallado

Sigue exactamente el patrón que ya usa `dibujarCalendario()` en `js/grafica-svg.js` para el calendario de constancia (spec 021): cada punto lleva un `<title>` con el texto (tooltip con ratón, y lo leen los lectores de pantalla) y un `addEventListener("click", ...)` que llama a un callback `alTocar(dia)`, pasado desde `js/app.js`, que escribe el texto en la línea de detalle.

Texto del tooltip y de la línea de detalle: `"27/07/2026: 82,4 kg"` (fecha formateada con `formatearFecha()`, peso formateado con el mismo `kg()` que ya usa el resto de la gráfica).

### Dónde vive

En `index.html`, un párrafo nuevo `#grafica-peso-detalle` debajo de `#grafica-peso`, con la misma clase `comparador-detalle` que ya usa `#calendario-detalle` (mismo estilo, cero CSS nuevo).

En `js/app.js`, `refrescarGrafica()` pasa el callback `alTocar` a `dibujarGrafica()` y reinicia el texto del detalle cada vez que se repinta (por eso el criterio 5 se cumple solo con reutilizar lo que ya hace `pintarCalendario()`).

## 5. Modelo de datos

Ninguno. No se guarda nada nuevo: todo sale de los `diarios` que `dibujarGrafica()` ya recibe.

## 6. Casos límite

- **Un solo punto en el rango** (por ejemplo, "1 semana" con un único pesaje): el punto se puede tocar igual y enseña su dato.
- **Objetivo con banda de margen dibujada**: la banda y la línea de objetivo no son puntos, no llevan toque ni tooltip; solo los círculos de pesajes reales.
- **Sin pesajes suficientes para dibujar la gráfica** (`dibujarGrafica()` devuelve `null`): no hay puntos que tocar, y la línea de detalle no se pinta (igual que hoy no se pinta la gráfica).
- **Pantalla táctil con ratón también conectado** (portátil híbrido): las dos formas conviven sin conflicto, como ya pasa en el calendario.

## 7. Archivos afectados

| Archivo | Cambio |
|---|---|
| `js/grafica-svg.js` | `dibujarGrafica()` acepta un callback `alTocar` y añade `<title>` + evento de click a cada punto |
| `js/app.js` | `refrescarGrafica()` pasa el callback y pinta el texto en `#grafica-peso-detalle`; lo reinicia al repintar |
| `index.html` | párrafo nuevo `#grafica-peso-detalle` |

Sin cambios en `styles.css` (reutiliza `.comparador-detalle`), `firestore.rules` ni ningún otro archivo.

**Estimación: ~40-60 líneas.** Muy por debajo del límite de la spec pequeña.

## 8. Decisiones tomadas

- **El detalle se ve debajo de la gráfica, como el calendario de constancia** → decisión del usuario el 2026-08-19. Reutiliza un patrón ya existente y probado, en vez de un tooltip flotante nuevo que el proyecto no tiene en ningún otro sitio.
- **Solo el peso real de ese día, no también la media móvil** → decisión del usuario. Es justo lo que pedía la línea del backlog, sin añadir un segundo número que nadie pidió.

## 9. Fuera de spec: ideas apuntadas

Ninguna nueva; la idea del backlog queda cerrada con esta spec.

## ✅ Para probar a mano

(El agente `qa-manual` lo afina antes de la prueba, con los pasos concretos.)
