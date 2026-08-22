# 043 — Las filas del diario, en dos líneas y con iconos

- **Estado:** 📝 pendiente de implementar.
- **Fecha:** 2026-08-22
- **Referencia en PRODUCTO.md:** apartado "Qué hará (segunda ampliación de la v4, decidida el 22 de agosto de 2026)", punto **"Lo apuntado se lee de un vistazo"**.

## 1. Objetivo

Detectado por el usuario el 22 de agosto, mirando Ejercicio en escritorio: en
"Lo que llevo apuntado" se veía `22/08/2026 23:00 · 30 min · Media · Editar ·
Borr…`, **sin el nombre del ejercicio**, y con "Borrar" cortado por el borde.
Lo único que no se puede deducir —qué hiciste— era justo lo que faltaba.

No es un fallo de la spec 042 ni de la 036: viene de antes. Al terminar esta
spec, cada registro ocupa dos líneas (qué arriba, cuándo y detalles debajo) y
los botones de editar y borrar son dos iconos que no compiten por el ancho.

## 2. Criterio de "esto funciona"

1. En **Ejercicio → Lo que llevo apuntado**, cada fila enseña en la primera
   línea el **nombre del ejercicio, entero**, y debajo en gris y más pequeño
   `22 ago · 23:00 · 30 min · Media`.
2. En **Comidas → Lo que llevo apuntado**, igual: el texto de la comida arriba,
   y debajo `22 ago · 13:12 · Comida`.
3. En **Peso → Mis pesajes**, igual: `79,8 kg` arriba y debajo `22 ago · 23:00`.
4. A la derecha de cada fila hay **dos iconos**: un lápiz (editar) y una
   papelera (borrar). Ya no ponen "Editar" ni "Borrar".
5. Los iconos son del color del texto suave de la app y **cambian con el tema**
   como el resto: no llevan color propio.
6. Cada icono tiene una zona táctil de **al menos 44×44 px** (mismo criterio
   que la spec 038) y una etiqueta para lectores de pantalla ("Editar" /
   "Borrar").
7. **El texto no se recorta nunca por falta de ancho.** Un ejercicio o una
   comida con nombre largo pasa a la línea siguiente en vez de cortarse con
   puntos suspensivos. La fila crece hacia abajo, no hacia los lados.
8. En **escritorio**, con las listas dentro de una columna estrecha (spec 036),
   se sigue leyendo el texto completo y no aparecen barras de scroll
   horizontales.
9. Tocar el lápiz abre la fila en edición exactamente como hasta ahora, y
   tocar la papelera pide confirmación y borra, exactamente como hasta ahora.
10. Todo lo demás de las listas sigue igual: el filtro por día, "Ver todos
    (33)" / "Ver menos", el aviso de lista vacía, el botón de reintentar y el
    orden de los registros.

## 3. Alcance

### Entra

- Las tres listas del diario: **pesajes**, **comidas** y **ejercicios**.
- Reorganizar cada fila en dos líneas, con el "qué" arriba y el resto debajo.
- Sustituir los botones "Editar" y "Borrar" por dos iconos SVG en esas tres
  listas.

### NO entra (explícitamente fuera)

- **Las demás listas de la app**: recetas, catálogo de ejercicios, los días de
  la dieta y de la tabla, y el histórico de operaciones. Tienen otra forma y
  otro constructor; meterlas aquí multiplicaría la spec. Si al probar esta el
  usuario las quiere igual, se hace en otra.
- **La fila en edición** (`.fila-edicion`). Se queda exactamente como está: sus
  botones son "Guardar" y "Cancelar", que son acciones con consecuencia y
  merecen su palabra. Solo cambian las filas en modo lectura.
- **Un juego de iconos para toda la app.** Esta spec dibuja dos iconos para
  este sitio. La barra de navegación sigue siendo solo texto (sigue en el
  backlog).
- **Cambiar qué datos se enseñan.** Son los mismos campos, colocados de otra
  forma. No se añade ni se quita ninguno.
- **Cambiar el formato de la fecha.** Se sigue usando `formatearFechaConHora()`
  tal cual.

## 4. Comportamiento detallado

### La fila (`js/app.js`)

Hoy `filaDeLectura()` hace `fila.append(...config.celdas(registro),
botonEditar, botonBorrar)`, y `celdas` devuelve una lista plana de `<span>`
que el CSS reparte en una sola línea con `display: flex`.

Pasa a haber tres piezas, y por tanto `celdas` deja de ser una lista plana:
cada lista declara **qué** va arriba y **qué detalles** van abajo.

```
<li>
  <div class="registro-datos">
    <span class="registro-que">Andar a paso ligero</span>
    <span class="registro-meta">22 ago · 23:00 · 30 min · Media</span>
  </div>
  <div class="registro-acciones">
    <button aria-label="Editar">…lápiz…</button>
    <button aria-label="Borrar">…papelera…</button>
  </div>
</li>
```

`config.celdas(registro)` se sustituye por `config.fila(registro)`, que
devuelve `{ que, detalles }`:

| Lista | `que` | `detalles` (se unen con ` · `) |
|---|---|---|
| Pesajes | `79,8 kg` | fecha y hora |
| Comidas | el texto de la comida | fecha y hora, momento |
| Ejercicios | el texto del ejercicio | fecha y hora, `30 min`, intensidad |

Los detalles se juntan con `" · "` filtrando los vacíos, para que una comida
sin hora no deje un separador suelto.

**El "qué" va primero en las tres**, aunque en pesajes eso invierta el orden de
hoy (hoy va la fecha delante y el peso detrás). Es el motivo entero de la spec:
lo que no se puede deducir, arriba.

### Los iconos (`js/app.js`)

Una función `iconoDeAccion(nombre)` que devuelve un `<svg>` con el trazo del
lápiz o de la papelera:

- `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`,
  `stroke-width="2"`, `stroke-linecap="round"`, `stroke-linejoin="round"`,
  `width="20" height="20"`, `aria-hidden="true"`.
- **Por qué aquí sí va el color en el atributo**, al contrario que en
  `js/grafica-svg.js`, donde cada forma lleva una clase y el color lo pone
  `styles.css`: `currentColor` no es un color, es "el que tenga el texto
  aquí". Sacarlo a una clase obligaría a repetir en CSS el color que el botón
  ya tiene, y a mantener los dos sincronizados. Es la excepción que confirma
  la regla, no un descuido.
- `stroke="currentColor"` es lo que hace que hereden el color del tema (punto 5
  del criterio de aceptación). Nada de colores fijos.
- Se crean con `createElementNS("http://www.w3.org/2000/svg", …)`: un `<svg>`
  hecho con `createElement()` a secas no se pinta.

Y un `botonDeIcono(nombre, etiqueta, alPulsar)`, hermano de `botonDeFila()`,
que monta el `<button type="button" class="icono-accion">`, le pone el
`aria-label` y el `title` (que da el mismo texto al pasar el ratón en
escritorio) y le cuelga el SVG.

El botón de borrar sigue recibiéndose por variable para poder deshabilitarlo
mientras borra, igual que ahora.

### CSS (`styles.css`)

- `#lista-pesajes li`, `#lista-comidas li`, `#lista-ejercicios li` siguen
  siendo `flex` con `align-items: center`, pero ahora solo tienen dos hijos:
  los datos y las acciones.
- `.registro-datos`: `flex: 1; min-width: 0;` y en columna. El `min-width: 0`
  se queda por el mismo motivo que lo puso la spec 036 —sin él un flex item no
  se encoge por debajo de su contenido—, pero ahora sirve para que el texto
  **se parta en varias líneas**, no para recortarlo.
- `.registro-que`: `overflow-wrap: anywhere;` para que una palabra larguísima
  se parta en vez de desbordar. **Sin `white-space: nowrap`, sin `overflow:
  hidden` y sin `text-overflow: ellipsis`**: ese trío es exactamente lo que
  hacía desaparecer el texto.
- `.registro-meta`: el gris y el tamaño pequeño que hoy tienen
  `.pesaje-fecha`/`.registro-detalle`.
- `.registro-acciones`: `flex-shrink: 0;` para que los iconos nunca se
  aplasten, con un hueco pequeño entre los dos.
- **Anular el estilo de botón que ya existe.** `styles.css` tiene hoy
  `#lista-pesajes li button, #lista-comidas li button, #lista-ejercicios li
  button { padding: …; font-size: 0.85rem; }`. Los iconos siguen siendo
  `<button>` dentro de esos `<li>`, y ese selector (id + etiqueta) **gana en
  especificidad** a la clase `.icono-accion` sola: sin anularlo, el padding
  heredado descuadra el icono y la zona táctil de 44 px. `.icono-accion` lleva
  `padding: 0` explícito, y la regla vieja pasa a excluirlos con
  `:not(.icono-accion)` para que quede dicho en el sitio donde se lee.
- `.icono-accion`: sin fondo ni borde, `min-width: 44px; min-height: 44px`,
  centrado, color `var(--tinta-suave)`, y al pasar el ratón o al enfocarlo,
  color normal. El de borrar no se pinta de rojo: la confirmación ya avisa, y
  un rojo permanente en cada fila de la lista es ruido.
- **De las clases viejas solo se borra una.** Comprobado uso por uso en
  `js/app.js`: de `.pesaje-fecha`, `.pesaje-peso`, `.registro-texto` y
  `.registro-detalle`, la única que queda huérfana al migrar las tres listas
  del diario es **`.pesaje-peso`**. Las otras tres las siguen usando pantallas
  que esta spec no toca, y **no se pueden borrar ni cambiar**:

  | Clase | Quién más la usa (todos en `js/app.js`) |
  |---|---|
  | `.pesaje-fecha` | el histórico de operaciones (~3286) |
  | `.registro-texto` | la dieta semanal (~1606), las sesiones de la tabla (~2049, ~2059), el histórico (~3287) |
  | `.registro-detalle` | las estadísticas de peso (~797), la cabecera de una receta (~1415), la cabecera del catálogo (~1860), las sesiones de la tabla (~2062) |

  Es decir: **las clases nuevas se añaden, las viejas se quedan como están**, y
  solo desaparece `.pesaje-peso`. Tocar `.registro-texto` (que hoy lleva
  `nowrap` + `ellipsis`) rompería el histórico, la dieta y la tabla.

## 5. Modelo de datos

Sin cambios. No se toca Firestore, ni `firestore.rules`, ni la IA. Son los
mismos campos ya guardados, colocados de otra forma.

## 6. Casos límite

- **Registro sin hora.** Los detalles se unen filtrando los vacíos, así que
  sale `22 ago · 30 min · Media` sin un `·` colgando.
- **Comida con texto vacío.** Hoy la lista de "Hoy" pinta `"—"` en ese caso.
  Se mantiene: el "qué" nunca queda en blanco.
- **Texto larguísimo sin espacios.** `overflow-wrap: anywhere` lo parte. Sin
  eso, una sola palabra puede desbordar la columna y devolver las barras de
  scroll que la spec 036 quitó.
- **Escritorio, columna estrecha.** Es el caso que originó la spec. La fila
  crece hacia abajo; los iconos, con `flex-shrink: 0`, se quedan siempre
  visibles.
- **Filas en edición.** No cambian. Hay que comprobar que al abrir una y
  cerrarla, la fila vuelve al formato nuevo de dos líneas.
- **`fila()` mal escrita en alguna configuración.** Al pasar de una lista
  plana a un objeto, un `que` sin valor no daría error: pintaría "undefined".
  El constructor de la fila trata un `que` vacío como `"—"`, igual que ya hace
  la dieta con las comidas sin texto.
- **Lectores de pantalla.** El SVG va con `aria-hidden="true"` y la etiqueta la
  pone el botón: si no, se anunciaría el dibujo y no la acción.

## 7. Archivos afectados

| Archivo | Qué cambia |
|---|---|
| `js/app.js` | `filaDeLectura()` monta las dos líneas; `celdas` pasa a `fila` en las tres configuraciones de lista; nuevas `iconoDeAccion()` y `botonDeIcono()`. |
| `styles.css` | Las reglas de las filas del diario; clases nuevas `.registro-datos`, `.registro-que`, `.registro-meta`, `.registro-acciones`, `.icono-accion`. |
| `docs/PRODUCTO.md` | Ya actualizado. |
| `docs/ESTADO.md`, `docs/BACKLOG.md` | Al terminar. |

No se toca `index.html` (las listas se pintan desde JavaScript), ni
`firestore.rules`, ni ninguna función de `api/`.

Tamaño estimado: ~130 líneas. Por debajo del límite de 300 de la regla 4.

## 8. Decisiones tomadas

Decisiones de producto confirmadas por el usuario el 22 de agosto de 2026, al
ver el problema en su pantalla:

- **Dos líneas: qué arriba, cuándo y detalles debajo.** Propuesto por el propio
  usuario. Es lo contrario de lo que había: la fecha ocupaba el sitio de honor
  y el texto libre —lo único irrepetible— peleaba por las sobras.
- **Iconos SVG dibujados en el código, no emoji.** Los emoji los dibuja cada
  sistema a su manera (un ✏️ de Android no se parece al de Windows), llevan
  color propio que choca con la paleta violeta de la spec 022, y no heredan el
  color del tema. Un SVG con `stroke="currentColor"` sí.
- **Las tres listas del diario, no solo las dos con texto libre.** La de peso
  cabía en una línea, pero dejar una de las tres con otra forma obliga a
  aprenderse dos. La coherencia vale más que las líneas ahorradas.
- **La papelera no va en rojo.** El borrado ya pide confirmación; pintar de
  rojo una fila de cada registro convierte la lista en una alarma constante.
- **Los botones de la fila en edición siguen siendo palabras.** "Guardar" y
  "Cancelar" no tienen icono universal, y ahí sí hay una decisión que tomar
  antes de pulsar.

## 9. Fuera de spec: ideas apuntadas

- Llevar el mismo formato de dos líneas y los mismos iconos a las recetas, al
  catálogo de ejercicios y al histórico de operaciones.
- Un juego de iconos para la barra de navegación (ya estaba en el backlog).

## ✅ Para probar a mano

En producción (https://operacion-bikini.vercel.app). Los pasos 1 a 8 en el
móvil; del 9 en adelante, en el PC con la ventana ancha, que es donde saliste
tú el fallo.

### Que lo nuevo funcione

1. **Ejercicio → Lo que llevo apuntado**: cada fila tiene dos líneas. Arriba,
   el **nombre del ejercicio entero**. Debajo, en gris y más pequeño,
   `22 ago · 23:00 · 30 min · Media`.
2. **Comidas → Lo que llevo apuntado**: el texto de la comida arriba, y debajo
   `22 ago · 13:12 · Comida`.
3. **Peso → Mis pesajes**: `79,8 kg` arriba, y debajo `22 ago · 23:00`. Fíjate
   en que el peso ha pasado a ir **delante** de la fecha; antes era al revés.
4. A la derecha de cada fila hay un **lápiz** y una **papelera**, sin texto.
   Son grises, del mismo tono que la línea de detalles, y no tienen colores
   propios.
5. Toca el **lápiz** de una fila: se abre en edición igual que antes, con sus
   campos y con "Guardar" y "Cancelar" **en palabras** (esos no cambian).
   Cancela: la fila vuelve a verse en dos líneas.
6. Toca la **papelera** de un registro que no te importe perder: pide
   confirmación y lo borra, como siempre.
7. Los iconos son fáciles de acertar con el dedo, sin apuntar. Si tienes que
   afinar, es que algo se ha quedado pequeño.
8. Apunta un ejercicio con un **nombre muy largo** (por ejemplo "press de banca
   inclinado con mancuernas y series descendentes"). Tiene que verse **entero**,
   partido en varias líneas. No debe salir cortado con puntos suspensivos.

### En el PC, que es donde se vio el fallo

9. Ventana maximizada, **Ejercicio**. La columna de "Lo que llevo apuntado" es
   estrecha: comprueba que **se lee el nombre del ejercicio**, que era justo lo
   que faltaba en tu captura.
10. En esa misma pantalla, comprueba que **no aparece ninguna barra de scroll
    horizontal**, ni en la columna ni en la página.
11. Estrecha la ventana hasta el ancho de un móvil y ensánchala otra vez: las
    filas se recolocan solas, sin quedarse a medias.

### Que no se haya roto nada de antes

12. En las tres listas: el filtro **"Ver un día"** y **"Quitar filtro"** siguen
    funcionando.
13. **"Ver todos (33)"** despliega la lista entera y **"Ver menos"** la recoge
    subiendo la vista al botón, como hasta ahora.
14. Estas pantallas **no cambian** y hay que mirarlas porque comparten estilos
    con las filas del diario:
    - **Ejercicio → Mi tabla**: los días con sus ejercicios, igual que antes.
    - **Comidas → Mi dieta**: la semana de menús, igual.
    - **Comidas → Recetas** y **Ejercicio → Catálogo**: las cabeceras de cada
      ficha ("para 4", "sin material"), igual.
    - **Peso**: las estadísticas debajo de la gráfica, igual.
    - **Ajustes → Operación → Histórico**: abre una operación archivada y
      comprueba que sus registros se siguen viendo bien.
