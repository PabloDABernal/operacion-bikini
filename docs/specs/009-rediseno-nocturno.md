# 009 — Rediseño visual "nocturna deportiva" y navegación inferior

- **Estado:** revisada
- **Fecha:** 2026-08-12
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v2)", punto "Rediseño visual" (actualizado el 2026-08-12: siempre oscura, y barra inferior también en escritorio).

## 1. Objetivo

Que la app deje de parecer un formulario y parezca una app: oscura de serie, con la paleta "nocturna deportiva" ya elegida, y con una barra de navegación abajo en lugar de las siete pestañas apelotonadas en dos filas de ahora.

## 2. Criterio de "esto funciona"

1. Entrar en la app: todo es oscuro (fondo casi negro azulado, texto claro), incluida la pantalla de login. No hay ningún destello blanco al cargar.
2. En el móvil, abajo del todo hay una **barra fija** con cuatro botones: **Peso**, **Comidas**, **Ejercicio** y **Más**. La sección abierta se distingue de las otras de un vistazo.
3. La barra **no tapa el contenido**: al bajar hasta el final de una lista larga, el último elemento se ve entero por encima de la barra.
4. Tocar **Más** abre un panel con **Consejos**, **Consulta**, **Fotos** y **Ajustes**. Elegir cualquiera abre esa sección y cierra el panel.
5. Con el panel abierto, tocar fuera de él (o el botón de cerrar) lo cierra sin cambiar de sección.
6. Estando en una sección de las de "Más" (por ejemplo Fotos), el botón **Más** se ve como activo: no se pierde de vista dónde estás.
7. Escribir en cualquier campo de texto en el móvil: con el teclado abierto, el campo sigue viéndose. Este criterio es **"se prueba y se decide"**: el comportamiento de una barra fija con el teclado abierto depende del navegador y no se puede garantizar de antemano. Si molesta, se ocultará la barra mientras haya un campo con foco (apuntado en `docs/BACKLOG.md`).
8. Recorrer las ocho secciones: botones, campos, listas, mensajes de error y la gráfica se ven con la paleta nueva y se leen sin esfuerzo. Nada queda gris sobre gris.
9. La **gráfica de peso** (spec 008) usa los colores nuevos: coral la media móvil, la línea de objetivo y su banda visibles sobre el fondo oscuro.
10. Guardar un pesaje, una comida o un ejercicio: aparece una confirmación breve ("Guardado") que se va sola a los pocos segundos.
11. Con una lista vacía, el texto no es solo "aún no has apuntado nada": dice también qué escribir, con un ejemplo.
12. En el ordenador: la misma barra abajo, con el contenido centrado en una columna que no se estira a lo ancho de un monitor.
13. En horizontal en el móvil y en una pantalla estrecha (320 px): la barra sigue cabiendo, sin que los textos se monten.

## 3. Alcance

### Entra

- **Sistema de color y tipografía** como variables CSS en `:root`: fondo, superficie, tinta, tinta suave, borde, acento coral, apoyo cian, y color de error legible sobre oscuro. Escala tipográfica, espaciados en múltiplos de 4, radios y sombras.
- Paleta **"nocturna deportiva"**, ya elegida por el usuario el 2026-08-11:
  - Fondo `#12141A` · Tinta `#E8EAF0` · Acento (coral) `#FF4D6D` · Apoyo (cian) `#4CC9F0`.
  - El resto (superficie, borde, tinta suave, error) se deriva de esos cuatro al implementar, respetando contraste legible.
- **Navegación inferior fija** en todos los tamaños de pantalla: Peso, Comidas, Ejercicio y **Más**.
- **Panel "Más"**: hoja que sube desde abajo con Consejos, Consulta, Fotos y Ajustes.
- Aplicar la paleta a **todas las pantallas**: la de carga (`#pantalla-cargando`, que es la primera que se ve y de la que depende que no haya destello blanco), login, los tres registros, consejos, consulta, fotos con su visor, ajustes y reinicio, y la **gráfica de peso** (que pasa a tomar los colores de las variables CSS en vez de tenerlos escritos en el JS).
- **Micro-respuesta al guardar** en los tres formularios de registro.
- **Estados vacíos que enseñan**: los textos de lista vacía pasan a incluir un ejemplo de qué apuntar.
- Contenido centrado con ancho máximo en pantallas anchas.

### NO entra (explícitamente fuera)

- **La pantalla "Hoy"**: es la spec siguiente. Esta spec deja la barra preparada para que "Hoy" entre como primer botón, pero **no crea una pestaña vacía**: la barra sale con cuatro botones y pasará a cinco en la spec 010.
- **Tema claro, interruptor de tema o seguir el ajuste del móvil**: la app es oscura y punto. Una sola paleta que mantener y probar.
- **Cambiar textos, flujos o funcionalidad** más allá de los estados vacíos y la confirmación al guardar. Ningún botón hace algo distinto de lo que hace hoy.
- **Reordenar o fusionar secciones**: las ocho siguen siendo ocho, con el mismo contenido.
- **Iconos dibujados** en la barra: por ahora solo texto. Si luego se quieren iconos, es otra spec.
- **Animaciones y transiciones** más allá de lo mínimo para que el panel "Más" no aparezca de golpe.
- **Gamificación, calendario de constancia y detalle nutricional**: cada uno en su spec.

## 4. Comportamiento detallado

### Sistema de color

Variables en `:root`, usadas en toda la hoja de estilos. Nada de hexadecimales sueltos repartidos por el CSS ni por el JS:

| Variable | Para qué |
|---|---|
| `--fondo` `#12141A` | fondo de la app |
| `--superficie` | tarjetas, campos, barra inferior y panel: un escalón más claro que el fondo |
| `--borde` | separadores y bordes de campo |
| `--tinta` `#E8EAF0` | texto principal |
| `--tinta-suave` | texto secundario (fechas, detalles, explicaciones) |
| `--acento` `#FF4D6D` | botones principales, sección activa, media móvil de la gráfica |
| `--apoyo` `#4CC9F0` | acentos secundarios y foco del teclado |
| `--error` | mensajes de error, legible sobre oscuro (el `#c62828` actual no lo es) |

Además: `--radio`, `--sombra` y una escala de espaciado en múltiplos de 4.

`<meta name="theme-color" content="#12141A">` y `color-scheme: dark` en `:root`, para que el navegador pinte de oscuro sus propios controles (calendarios de `<input type="date">`, barras de scroll) y no haya destello blanco al cargar.

### Navegación inferior

- `<nav>` fijo abajo (`position: fixed`), a lo ancho, sobre `--superficie`, con borde superior.
- Cuatro botones a partes iguales: **Peso**, **Comidas**, **Ejercicio**, **Más**.
- El botón de la sección abierta va en `--acento`; los demás en `--tinta-suave`.
- **El botón "Más" también se ve activo** cuando la sección abierta es una de las cuatro que viven dentro de él.
- Al cambiar de sección, la pantalla vuelve arriba. Las secciones se muestran y se ocultan sin tocar el scroll, así que sin esto se puede saltar desde el final de una lista larga a una sección corta y ver una pantalla en blanco.
- **En pantallas anchas la barra ocupa todo el ancho**, pero sus botones se limitan al mismo ancho máximo centrado que el contenido: una barra pegada al borde inferior del monitor con los botones estirados a lo largo de 2000 px queda ridícula.
- El `<body>` lleva un `padding-bottom` igual al alto de la barra más `env(safe-area-inset-bottom)`, para que en un iPhone la barra no quede debajo del indicador de inicio y para que el final de las listas no quede tapado.
- La barra de pestañas actual (`.pestana` en dos filas, arriba) **desaparece**. El email del usuario y el botón de salir siguen donde están hoy (cabecera y Ajustes).

### Panel "Más"

- Al pulsar "Más", una hoja sube desde abajo con los cuatro destinos, uno por línea, y un botón de cerrar.
- Detrás, una capa oscurecida que atenúa el contenido. Tocarla cierra el panel.
- Elegir un destino abre esa sección y cierra el panel.
- Se cierra también con la tecla `Escape`.
- Mientras está abierto, el foco del teclado se queda dentro del panel.

### Micro-respuesta al guardar

- Al guardar un pesaje, una comida o un ejercicio, aparece un aviso breve **"Guardado"** junto al formulario, en `--apoyo`, que se borra solo a los 3 segundos.
- Reutiliza el patrón que ya usa Ajustes ("Ajustes guardados." con `setTimeout`, `js/app.js`): no se inventa un mecanismo nuevo.
- No aparece al editar ni al borrar: solo en el alta, que es la acción que se repite a diario.

### Estados vacíos

Cambian solo los textos de lista vacía de las tres listas:

| Lista | Texto nuevo |
|---|---|
| Pesajes | `Aún no has apuntado ningún pesaje. Pésate al levantarte, antes de desayunar: es el momento más comparable.` |
| Comidas | `Aún no has apuntado ninguna comida. No hace falta detalle: "lentejas y una manzana" vale.` |
| Ejercicio | `Aún no has apuntado ningún ejercicio. Cuenta también andar: "paseo con el carro, 40 minutos".` |

### Gráfica

`js/grafica-svg.js` deja de escribir los colores a mano. Cada forma lleva una clase (`grafica-media`, `grafica-punto`, `grafica-objetivo`, `grafica-banda`) y el color se decide en `styles.css` con las variables. Así el día de mañana se cambia la paleta en un sitio.

Qué variable usa cada capa, para no inventar colores nuevos por el camino:

| Capa de la gráfica | Hoy | Pasa a |
|---|---|---|
| Media móvil | `#d81b60` | `--acento` |
| Puntos de pesajes | `#bbb` | `--borde` |
| Línea de objetivo y su banda | `#555` | `--tinta-suave` |

Lo mismo con las clases del calendario de constancia (`casilla`, `nivel-1`…`nivel-3`), aunque todavía no se pinte en ninguna pantalla.

## 5. Modelo de datos

**Ninguno.** Esta spec no toca Firestore, ni Cloudinary, ni las funciones de Vercel, ni `firestore.rules`. No guarda ni lee ningún dato nuevo.

## 6. Casos límite

- **Teclado abierto en el móvil**: con `position: fixed`, en Android la barra puede quedarse flotando encima del teclado. Se comprueba al probar; si molesta, se oculta la barra mientras hay un campo con foco.
- **Pantalla de 320 px de ancho**: los cuatro botones caben con texto de 0,75 rem. No se abrevian palabras.
- **Móvil en horizontal**: la barra ocupa más proporción de pantalla; se acepta, no se hace nada especial.
- **iPhone con indicador de inicio**: `env(safe-area-inset-bottom)` evita que la barra quede debajo.
- **Visor de fotos**: es la única capa superpuesta que hay hoy (`#visor`, `z-index: 10`). Debe quedar **por encima** de la barra inferior y del panel "Más"; se ordenan los tres `z-index`. La confirmación de reinicio **no** es una capa: vive en el flujo normal de la sección Ajustes, así que no entra en este lío.
- **Listas largas**: el `padding-bottom` del `body` garantiza que el último elemento no quede tapado.
- **Panel "Más" abierto y se cambia de sección desde otro sitio** (por ejemplo, al cerrar sesión): el panel se cierra al mostrar la pantalla de login.
- **Sesión cerrada**: la barra inferior no se ve en la pantalla de login ni en la de carga.
- **Fila en edición** (spec 007) con la paleta nueva: los campos dentro de la fila se ven igual de legibles que los del formulario de alta.
- **Contraste**: cualquier texto sobre el fondo debe leerse sin esfuerzo. El coral `#FF4D6D` **no se usa para texto pequeño sobre fondo oscuro** salvo en el botón activo de la barra, donde el tamaño lo permite.

## 7. Archivos afectados

| Archivo | Cambio |
|---|---|
| `styles.css` | reescritura grande: variables, paleta oscura, barra inferior, panel "Más", y repaso de todos los componentes |
| `index.html` | `<nav>` inferior en vez de la barra de pestañas actual, panel "Más", `<meta name="theme-color">`, textos de estado vacío |
| `js/app.js` | `abrirPestana()` marca activo el botón correcto (incluido "Más"), abrir/cerrar el panel, micro-respuesta al guardar en los tres formularios |
| `js/grafica-svg.js` | los colores pasan de estar escritos en el JS a ser clases CSS |

`docs/PRODUCTO.md` ya se actualizó el 2026-08-12, antes de revisar esta spec: no queda pendiente.

**Estimación: ~500 líneas**, la mayoría CSS. Por encima del límite de 300 de `CLAUDE.md`, pero un rediseño no se puede entregar a medias: media app repintada y media no es peor que no empezar. Se avisa aquí para que conste, no se parte.

## 8. Decisiones tomadas

- **Cuatro botones + "Más"**, con Consejos, Consulta, Fotos y Ajustes dentro del panel → lo del día a día a un toque; lo ocasional, a dos. Descartado fusionar pantallas (comidas+ejercicio, consejos+consulta): obligaría a rehacer pantallas que funcionan.
- **Siempre oscura**, sin tema claro ni interruptor → una sola paleta que mantener y probar, y la propuesta ya decía "oscura de serie" porque se apunta de noche.
- **La misma barra en móvil y en escritorio** → una sola navegación que mantener; el escritorio se resuelve centrando el contenido.
- **Entran la micro-respuesta al guardar y los estados vacíos que enseñan** → ambos son texto y unas pocas líneas, y se notan a diario.
- **Sin iconos, solo texto** → dibujar ocho iconos coherentes es un trabajo aparte y con texto se entiende igual.
- **La barra sale con cuatro botones, no con "Hoy" vacío** → una pestaña que no lleva a nada es peor que una pestaña que aún no está.
- **Los colores de la gráfica pasan al CSS** → si no, la paleta viviría en dos sitios y uno de los dos acabaría mintiendo.

## 9. Fuera de spec: ideas apuntadas

- Iconos en la barra de navegación. → `docs/BACKLOG.md`
- Ocultar la barra automáticamente al abrir el teclado en Android, si al probar resulta molesta. → `docs/BACKLOG.md`

## ✅ Para probar a mano

Guion de prueba manual (lo rellena/afina el agente `qa-manual` antes de la prueba).
