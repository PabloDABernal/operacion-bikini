# 033 — Tocar un punto de la gráfica de peso

- **Estado:** en implementación (código en `main`, `revisor-codigo` con veredicto CUMPLE el 2026-08-19). Pendiente de que el usuario la pruebe.
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

- **La línea de detalle con toque solo entra en la pestaña Peso**, no en la gráfica de una operación archivada (Ajustes → Histórico → ver una operación): `dibujarGrafica()` se llama también ahí (`abrirArchivo()` en `js/app.js`), de solo lectura y sin ningún párrafo de detalle a mano. Ahí el `<title>` (tooltip con ratón) sigue funcionando igual que en el resto de puntos, porque no depende de tener un callback; lo único que no hace nada en el archivo es el toque en pantalla táctil, que no tiene dónde escribir el resultado.

### NO entra (explícitamente fuera)

- **Tocar la línea de la media móvil**: solo los puntos (círculos) de los pesajes reales, que es lo que pidió el backlog. La media no es un dato que el usuario haya apuntado.
- **Editar el pesaje desde la gráfica**: tocar un punto solo consulta, no lleva a "Mis pesajes" ni abre el formulario de edición.
- **Resaltar visualmente el punto tocado** (cambiar su color o tamaño): solo se pide ver el dato, no un estado de selección persistente.
- **Mostrar la media móvil de ese día junto al peso real**: decisión del usuario, solo el peso real.
- **Línea de detalle en la gráfica de una operación archivada**: ver arriba. Añadirla ahí no es difícil, pero no lo pidió el backlog y esa pantalla no tiene hueco reservado para ese párrafo; se puede apuntar en `docs/BACKLOG.md` si algún día se echa en falta.

## 4. Comportamiento detallado

Sigue exactamente el patrón que ya usa `dibujarCalendario()` en `js/grafica-svg.js` para el calendario de constancia (spec 021): cada punto lleva un `<title>` con el texto (tooltip con ratón, y lo leen los lectores de pantalla) y un `addEventListener("click", ...)` que llama a un callback `alTocar(dia)`, pasado desde `js/app.js`, que escribe el texto en la línea de detalle.

`dibujarGrafica()` recibe `alTocar` como parámetro **opcional**: `dibujarGrafica(diarios, pesoObjetivo, totalPesajes, alTocar)`. Si no se pasa (como en `abrirArchivo()`, que hoy la llama con solo tres argumentos), el `click` no hace nada — un no-op por defecto —, y el `<title>` funciona igual porque no depende del callback. Así no hay que tocar `abrirArchivo()` ni la gráfica de operaciones archivadas para nada.

Texto del tooltip y de la línea de detalle: `"27/07/2026: 82,4 kg"` (fecha formateada con `formatearFecha()`, peso formateado con el mismo `kg()` que ya usa el resto de la gráfica).

Los puntos llevan `cursor: pointer` en `styles.css`, igual que `.casilla` del calendario: sin eso, nada indica que se puedan tocar.

### Dónde vive

En `index.html`, un párrafo nuevo `#grafica-peso-detalle` debajo de `#grafica-peso`, con la misma clase `comparador-detalle` que ya usa `#calendario-detalle` (mismo estilo, cero CSS nuevo más allá del `cursor: pointer`).

En `js/app.js`, `refrescarGrafica()` (la única que pinta la pestaña Peso) pasa el callback `alTocar` a `dibujarGrafica()` y reinicia el texto del detalle cada vez que se repinta (por eso el criterio 5 se cumple solo con reutilizar lo que ya hace `pintarCalendario()`). `abrirArchivo()` no cambia.

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
| `js/grafica-svg.js` | `dibujarGrafica()` acepta un callback `alTocar` **opcional** (no-op si no se pasa) y añade `<title>` + evento de click a cada punto |
| `js/app.js` | `refrescarGrafica()` pasa el callback y pinta el texto en `#grafica-peso-detalle`; lo reinicia al repintar. `abrirArchivo()` no cambia: sigue llamando a `dibujarGrafica()` sin el callback nuevo |
| `index.html` | párrafo nuevo `#grafica-peso-detalle` |
| `styles.css` | `.grafica-punto { cursor: pointer; }`, para que los puntos se vean tocables como ya se ven las casillas del calendario |

Reutiliza `.comparador-detalle` para el párrafo nuevo. Sin cambios en `firestore.rules` ni ningún otro archivo.

**Estimación: ~40-60 líneas.** Muy por debajo del límite de la spec pequeña.

## 8. Decisiones tomadas

- **El detalle se ve debajo de la gráfica, como el calendario de constancia** → decisión del usuario el 2026-08-19. Reutiliza un patrón ya existente y probado, en vez de un tooltip flotante nuevo que el proyecto no tiene en ningún otro sitio.
- **Solo el peso real de ese día, no también la media móvil** → decisión del usuario. Es justo lo que pedía la línea del backlog, sin añadir un segundo número que nadie pidió.
- **`alTocar` es opcional en `dibujarGrafica()`, y la gráfica de una operación archivada se queda sin línea de detalle** → detectado por el agente `revisor-specs` el 2026-08-19: `dibujarGrafica()` se llama también desde `abrirArchivo()` (histórico de operaciones), que no tiene párrafo de detalle. Hacer el callback opcional evita tocar esa pantalla, que es de solo lectura y no lo pidió nadie; el tooltip con ratón sigue funcionando ahí igual, solo el toque en pantalla táctil no hace nada.
- **`.grafica-punto` lleva `cursor: pointer`** → mejora señalada por el `revisor-specs`: sin eso, nada indica visualmente que los puntos se pueden tocar, al revés que `.casilla` del calendario.

## 9. Fuera de spec: ideas apuntadas

Ninguna nueva; la idea del backlog queda cerrada con esta spec.

## ✅ Para probar a mano

En https://operacion-bikini.vercel.app, con una operación en marcha y **al menos 4 pesajes en días distintos** (para ver varios puntos en la gráfica). La prueba se hace principalmente en **móvil** (toque en puntos); el paso con ratón es opcional, solo si tienes un ordenador a mano.

### Camino feliz: tocar un punto (móvil)

1. En **Peso**, debajo de la gráfica hay un párrafo que dice **"Toca un punto para ver su fecha y su peso."** — el detalle, vacío al principio.
2. **Toca uno de los puntos de la gráfica** (un círculo, un pesaje real). El párrafo debe cambiar y mostrar la fecha y el peso exactos de ese día, en formato `27/07/2026: 82,4 kg`.
3. Toca otro punto distinto. El párrafo se actualiza con los datos del nuevo punto.
4. Toca el mismo punto varias veces seguidas. El texto no cambia, sigue mostrando lo mismo.

### Cambiar de rango (criterio 5)

5. Fíjate en qué rango está activo encima de la gráfica (1 sem, 1 mes...).
6. Pulsa un rango distinto. La gráfica se redibuja y el párrafo de detalle **vuelve al texto inicial** "Toca un punto para ver su fecha y su peso." — se ha limpiado.
7. Toca un punto de la gráfica nueva: vuelve a funcionar igual.

### Casos límite

8. Si algún rango deja un único pesaje en la gráfica (por ejemplo "1 sem" con solo un pesaje esa semana), ese punto se puede tocar igual y enseña su dato.
9. La **línea gris de la media móvil no se puede tocar**: solo los puntos (círculos) responden. Tocar la línea entre puntos no hace nada.

### Tooltip con ratón (opcional, solo si pruebas desde ordenador)

10. Pasa el ratón por encima de un punto sin hacer clic: debe verse el tooltip nativo del navegador con el mismo formato `27/07/2026: 82,4 kg`.

### Regresión: gráfica de una operación archivada

11. Ve a **Ajustes → Histórico** y abre una operación ya cerrada. En su gráfica, comprueba que el tooltip con ratón (si pruebas desde ordenador) sigue funcionando igual que antes. Tocarla desde el móvil no debe hacer nada (correcto: esa pantalla no tiene párrafo de detalle) — y sobre todo, **no debe dar ningún error ni romper la pantalla**.

### Lo que hay que mirar con lupa

- El formato del texto es `DD/MM/AAAA: NN,N kg`, con coma decimal — si ves un punto en vez de coma, es un fallo.
- Si al cambiar de rango el párrafo se queda con el dato del punto anterior en vez de limpiarse, es un fallo.
