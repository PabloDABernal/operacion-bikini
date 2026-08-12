# 008 — Gráfica de peso, comparador semanal y calendario de constancia

- **Estado:** completada (probada por el usuario en producción el 2026-08-12; tras probarla pidió subir el formulario por encima de la gráfica y llevarse el calendario a la pantalla "Hoy")
- **Fecha:** 2026-08-12
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v2)", punto "Gráfica de evolución del peso" (actualizado el 2026-08-12 para incluir la banda de margen).

## 1. Objetivo

Que al abrir la pestaña **Peso** se vea de un vistazo cómo va la cosa: una gráfica con la tendencia real del peso (media móvil de 7 días) contra el objetivo, cuánto ha cambiado respecto a la semana pasada, y un calendario que enseña los días en que se ha apuntado algo.

## 2. Criterio de "esto funciona"

1. Entrar en la pestaña **Peso** con varios pesajes apuntados: encima del formulario aparece una gráfica con una línea gruesa (la media móvil), puntos claros detrás (los pesajes reales) y, si hay peso objetivo en Ajustes, una línea horizontal con una franja sombreada alrededor.
2. La gráfica se ve entera y sin deformarse **en el móvil en vertical**, sin scroll horizontal.
3. Apuntar un pesaje nuevo: sin recargar la página, la gráfica se redibuja incluyendo el punto nuevo.
4. **Editar** un pesaje (spec 007) cambiándole la fecha o el peso: la gráfica se redibuja acorde.
5. **Borrar** un pesaje: desaparece de la gráfica.
6. Debajo de la gráfica, el comparador dice en grande cuánto ha cambiado el peso respecto a la semana anterior, por ejemplo **"−0,4 kg esta semana"**, o un texto de "aún no hay datos suficientes" si no los hay.
7. Debajo, un calendario de cuadraditos de las últimas 12 semanas: cada día que se apuntó algo (peso, comida o ejercicio) sale coloreado, más intenso cuantas más cosas se apuntaron ese día. Al pasar el ratón o tocar un cuadradito, se ve la fecha y qué se apuntó.
8. Ir a **Ajustes**, poner o cambiar el peso objetivo, volver a **Peso**: la línea de objetivo y su banda están en la posición nueva.
9. Quitar el peso objetivo en Ajustes: la gráfica sigue funcionando, sin línea de objetivo ni banda.
10. Con **un solo pesaje**: no hay error ni gráfica rota; sale un mensaje del tipo "Apunta algún pesaje más para ver la evolución".
11. Con **cero pesajes**: mismo mensaje, sin gráfica, y el resto de la pestaña funciona igual que siempre.
12. Apuntar una comida o un ejercicio y volver a Peso: ese día aparece más intenso en el calendario.

## 3. Alcance

### Entra

- **Gráfica de peso en SVG dibujado a mano**, sin librerías, dentro de la pestaña Peso, encima del formulario "Nuevo pesaje".
- Cuatro capas, todas pedidas por el usuario:
  1. **Media móvil de 7 días**: línea principal, gruesa.
  2. **Puntos crudos**: cada pesaje real, pequeño y tenue, detrás de la línea.
  3. **Línea de objetivo**: horizontal, discontinua, al `pesoObjetivoKg` de Ajustes. Solo si existe.
  4. **Banda de margen**: franja sombreada de ±1 kg alrededor del objetivo. Solo si existe objetivo.
- Ejes mínimos: etiquetas de peso a la izquierda y de fecha abajo (primera y última, para no amontonar).
- **Comparador semanal**: diferencia entre la media de los últimos 7 días y la media de los 7 anteriores, en grande y con signo.
- El **cálculo y el dibujo del calendario de constancia** (`calendarioDeConstancia()` en `js/grafica.js`, `dibujarCalendario()` y `textoDeCasilla()` en `js/grafica-svg.js`), listos y probados, pero **sin colgarlos de ninguna pantalla todavía**: los usará la spec de la pantalla "Hoy".
- Todo se recalcula al guardar, editar o borrar cualquier registro.

### NO entra (explícitamente fuera)

- **Selector de rango temporal** (30 / 90 días / todo): la gráfica pinta siempre todo el historial. Con dos semanas de datos un selector no aporta nada; se añadirá cuando haya meses de historial.
- **El calendario de constancia como parte de la pestaña Peso**: se implementó ahí y el usuario, al probarlo el 2026-08-12, decidió que su sitio es la pantalla **"Hoy"**. El código se queda hecho; la pantalla que lo enseña es otra spec.
- **Gráficas de comidas o de ejercicio**: solo peso.
- **Zoom, desplazamiento o tocar un punto para ver su valor** en la gráfica de peso. El calendario sí tiene el detalle al tocar, porque sin él los cuadraditos no se entienden.
- **Predicción o proyección** de cuándo se alcanzará el objetivo.
- **Rediseño visual**: la gráfica usa los colores actuales de la app. El sistema de color y el modo oscuro son la spec siguiente; esta no se adelanta.
- **Exportar la gráfica** como imagen.
- Gamificación (puntos, rachas, emblemas): el calendario de constancia es solo la vista, no da puntos. Va en su propia spec.

## 4. Comportamiento detallado

### Dónde va

En `index.html`, dentro de `<div class="seccion" data-seccion="peso">`, en este orden:

1. El formulario **"Nuevo pesaje"**, que sigue siendo lo primero: se entra en la pestaña a apuntar, no a mirar.
2. El bloque nuevo: **gráfica** y debajo el **comparador**.
3. La lista **"Mis pesajes"**, como hasta ahora.

Decidido así por el usuario el 2026-08-12, después de ver la primera versión con la gráfica arriba del todo.

### Gráfica

- Un `<svg>` con `viewBox="0 0 320 180"` y `width: 100%`, para que escale solo. `preserveAspectRatio` por defecto.
- **Eje X**: el rango de fechas va del pesaje más antiguo al más reciente, en días naturales (no por índice: dos pesajes separados un mes no pueden salir pegados).
- **Eje Y**: del mínimo al máximo de todo lo que haya que pintar (pesajes, media móvil, y objetivo con su banda si existe), con un margen del 5% arriba y abajo para que nada toque el borde.
- **Etiquetas**: peso mínimo y máximo a la izquierda; fecha del primer y del último pesaje abajo, en formato `DD/MM`, o `DD/MM/AA` si el rango cruza un cambio de año (si no, `28/12` y `03/01` no dicen de qué año son).
- **Colores** (los de la app actual, sin inventar paleta):
  - Media móvil: `#d81b60` (el rosa de los botones), grosor 2.
  - Puntos crudos: `#bbb`, radio 2.
  - Línea de objetivo: `#555`, discontinua.
  - Banda de margen: `#555` al 10% de opacidad.

### Media móvil de 7 días

- Se calcula sobre **días**, no sobre pesajes: si hay dos pesajes el mismo día, ese día vale la media de los dos.
- Para cada día que tenga pesaje, la media móvil es la media de los pesos de los días con pesaje dentro de la **ventana de 7 días naturales** que termina en ese día (él incluido). Los días sin pesaje no cuentan ni como cero ni como hueco.
- **Se pinta desde el primer día**, aunque la ventana todavía no tenga 7 días de historia: con pocos datos la línea es casi igual a los puntos, y esperar una semana para ver algo sería peor. No se avisa de nada.

### Comparador semanal

- **Semana actual**: los 7 días naturales que terminan hoy. **Semana anterior**: los 7 anteriores a esos.
- Se compara la media de cada tramo, calculada **igual que la media móvil: por días, no por pesajes**. Si un día tiene dos pesajes, ese día cuenta una vez, con la media de los dos. Así el comparador y la línea de la gráfica cuentan la misma historia; si no, un día que te pesas tres veces pesaría el triple.
- Diferencia = media actual − media anterior.
- Texto: `−0,4 kg esta semana` / `+0,3 kg esta semana` / `Igual que la semana pasada` (si redondeado a un decimal da 0,0).
- Debajo, en pequeño y en gris: `media 82,1 kg · semana pasada 82,5 kg`.
- **Si falta cualquiera de los dos tramos** (ningún pesaje en una de las dos semanas): `Aún no hay datos suficientes para comparar semanas.` y nada más.
- El signo se pinta pero **no se colorea de verde ni de rojo**: coherente con el principio de `PRODUCTO.md` de premiar la conducta, no los kilos.

### Calendario de constancia

- Cuadrícula de **12 semanas** (84 días) que termina hoy: 7 filas (lunes arriba, domingo abajo) por 12 columnas, la última columna es la semana en curso.
- Cada día tiene un **nivel de 0 a 3**: cuántos de los tres tipos (pesaje, comida, ejercicio) tienen al menos un registro ese día.
  - 0: `#eee` (vacío). 1: rosa al 30%. 2: al 60%. 3: `#d81b60` entero.
- Cada cuadradito lleva un `<title>` con el texto `12/08/2026 — peso, comida` (o `sin registros`), que sirve de tooltip al pasar el ratón y lo leen los lectores de pantalla. En móvil, tocar un cuadradito escribe ese mismo texto en una línea justo debajo del calendario.
- Los días futuros de la semana en curso se pintan como vacíos, sin borde especial.

### Cuándo se recalcula, y de dónde salen los datos

`crearLista()` (spec 007) ya guarda en memoria los registros de cada lista, pero hoy no los expone: solo devuelve `{ refrescar }`. Para no volver a leer de Firestore lo que ya está cargado:

- `crearLista()` pasa a devolver también `obtenerRegistros()`, que da el último array cargado.
- `crearLista()` acepta una opción nueva `alRefrescar`, que se llama al final de `refrescar()`, ya con los datos nuevos pintados. Las tres listas la usan para disparar `refrescarGrafica()`.
- El peso objetivo se guarda en una variable de módulo en `app.js`, rellenada por `refrescarAjustes()` y actualizada al guardar ajustes. La gráfica lee de ahí.

Con eso, la gráfica se recalcula:

- Al entrar en la app (`refrescarTodo()` recarga las tres listas y cada una dispara `alRefrescar`).
- Al guardar, editar o borrar un pesaje, una comida o un ejercicio (`refrescar()` se llama ya en esos tres caminos).
- Al guardar los ajustes, si cambia el peso objetivo.

**No se añade ninguna consulta a Firestore**: `refrescarGrafica()` no llama a `listarPesajes()`, `listarComidas()`, `listarEjercicios()` ni `leerAjustes()`; solo lee lo que esas funciones ya trajeron.

## 5. Modelo de datos

**Ninguna colección, campo ni regla nueva.** Todo se calcula en el navegador a partir de datos que la app ya tiene cargados, sin volver a leerlos:

| Fuente | Quién la trajo | Cómo la lee la gráfica | Para qué |
|---|---|---|---|
| `usuarios/{uid}/pesajes` | `listarPesajes()`, dentro de `crearLista()` | `listaPeso.obtenerRegistros()` | gráfica y comparador |
| `usuarios/{uid}/comidas` | `listarComidas()`, dentro de `crearLista()` | `listaComidas.obtenerRegistros()` | calendario |
| `usuarios/{uid}/ejercicios` | `listarEjercicios()`, dentro de `crearLista()` | `listaEjercicios.obtenerRegistros()` | calendario |
| `usuarios/{uid}` → `pesoObjetivoKg` | `leerAjustes()`, en `refrescarAjustes()` | variable de módulo en `app.js` | línea de objetivo y banda |

`firestore.rules`: **sin cambios**.

## 6. Casos límite

- **Cero pesajes**: no se dibuja el SVG. Mensaje `Apunta algún pesaje más para ver la evolución.` El comparador dice que no hay datos. El calendario sí se pinta (puede haber comidas o ejercicio).
- **Un solo pesaje**: mismo mensaje que con cero. Una línea de un punto no dice nada.
- **Todos los pesajes el mismo día**: el rango del eje X sería cero. Se pinta el SVG con ese día centrado y la línea plana, sin dividir por cero.
- **Todos los pesos iguales**: el rango del eje Y sería cero. Se fuerza un rango mínimo de ±1 kg alrededor del valor para que la línea salga en el centro y no en el borde.
- **Sin peso objetivo** (es opcional desde la spec 006): no se pinta ni la línea ni la banda; el resto igual.
- **Objetivo muy lejos de los pesajes** (por ejemplo objetivo 60 con pesos de 100): el eje Y se estira para que quepan los dos. La línea de peso se aplana, pero se ve la distancia real, que es la información honesta.
- **Pesajes con fechas futuras**: no pueden existir, `errorDeFecha` los rechaza al alta y al editar.
- **Fallo al cargar los datos**: las listas ya enseñan su propio error y su botón "Reintentar". La gráfica simplemente no se pinta y deja el mensaje de vacío; no añade otro mensaje de error encima.
- **Muchos pesajes** (un año, ~365 puntos): son 365 círculos y una polilínea. Un SVG lo aguanta sin problema; no se hace ninguna optimización.
- **Huso horario**: todas las fechas se manejan como texto `AAAA-MM-DD` con las utilidades de `js/fechas.js`. Nada de `toISOString()`, que en España puede restar un día.

## 7. Archivos afectados

| Archivo | Cambio |
|---|---|
| `js/grafica.js` | **nuevo**. Cálculo puro: media móvil, comparador semanal, matriz del calendario. Sin tocar el DOM |
| `js/grafica-svg.js` | **nuevo**. Dibujo: construye el SVG de la gráfica y el del calendario a partir de lo anterior |
| `js/fechas.js` | añadir ayudas de calendario: sumar/restar días y recorrer un rango de fechas ISO |
| `js/app.js` | `crearLista()` devuelve `obtenerRegistros()` y acepta `alRefrescar`. Bloque nuevo `refrescarGrafica()`. El peso objetivo se cachea en una variable de módulo |
| `index.html` | bloque de gráfica, comparador y calendario en la sección `peso` |
| `styles.css` | estilos del bloque, del comparador y del calendario |

`docs/PRODUCTO.md` ya se actualizó el 2026-08-12, antes de revisar esta spec: no queda pendiente.

**Estimación: ~450 líneas.** Por encima del límite de 300 de `CLAUDE.md`. Se avisó al usuario antes de escribir la spec y decidió mantener las tres piezas en una sola spec, completa desde el inicio. Queda escrito aquí para que no se intente partir a posteriori.

## 8. Decisiones tomadas

- **Las tres piezas (gráfica, comparador, calendario) en una sola spec** → decisión explícita del usuario tras avisarle del tamaño.
- **Dentro de la pestaña Peso, arriba** → no añadir una octava pestaña a las siete que ya van apretadas, y ver gráfica y lista juntas.
- **Las cuatro capas, banda de margen incluida** → suaviza el "o llegas o no llegas".
- **Sin selector de rango temporal** → con dos semanas de datos no hace nada; se añadirá cuando haya meses de historial.
- **SVG a mano, sin librerías** → ya decidido en `docs/propuestas/v2-usabilidad-y-gamificacion.md`, apartado 5, y coherente con "sin frameworks" de `ARQUITECTURA.md`. Cero dependencias y cero peso de descarga.
- **Colores actuales de la app** → el sistema visual es la spec siguiente; esta no se adelanta ni obliga a rehacer nada.
- **El cambio de peso no se colorea de verde ni de rojo** → `PRODUCTO.md` dice que se premia la conducta, no los kilos.

### Detalles propuestos al redactar y confirmados por el usuario el 2026-08-12

No salieron de la entrevista; los propuse yo y el usuario los aprobó tal cual:

1. **Banda de margen de ±1 kg.** El usuario pidió la banda, no su anchura.
2. **Calendario de 12 semanas** y **nivel 0-3 según cuántos de los tres tipos** se apuntaron ese día.
3. **La media móvil se pinta desde el primer día**, sin esperar a tener 7 días de historial.

## 9. Fuera de spec: ideas apuntadas

- Selector de rango temporal (30 / 90 días / todo) cuando haya meses de historial. → `docs/BACKLOG.md`
- Tocar un punto de la gráfica para ver su fecha y su peso exactos. → `docs/BACKLOG.md`

## ✅ Para probar a mano

Guion de prueba manual (lo rellena/afina el agente `qa-manual` antes de la prueba).
