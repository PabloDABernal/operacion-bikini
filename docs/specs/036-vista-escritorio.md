# 036 — Vista de escritorio en varias columnas

- **Estado:** revisada (`revisor-specs`: bloqueante del reparto de Peso, corregido; y las tres mejoras, incorporadas, 2026-08-21)
- **Fecha:** 2026-08-21
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v4, decidida el 20 de agosto de 2026)", punto **"Vista de escritorio en varias columnas"**.

## 1. Objetivo

En un monitor la app deja de ser un móvil estirado. La columna se ensancha y los
bloques de las secciones que tienen varios se reparten en columnas, de forma que
**lo que en el móvil son sub-pestañas, en el escritorio se ve a la vez**.

## 2. Criterio de "esto funciona"

1. En una ventana de **1280 px o más**, la app ocupa hasta unos **1100 px**
   centrados, no los 512 px de ahora.
2. En **Comidas**, la fila de sub-pestañas **desaparece** y se ven las tres a la
   vez, en columnas: *Apuntar · Mi dieta · Recetas*, de izquierda a derecha.
3. En **Ejercicio**, lo mismo: *Apuntar · Mi tabla · Catálogo*.
4. En **Hoy** se ven dos columnas: a la izquierda el resumen, los atajos y el
   detalle nutricional; a la derecha la constancia y los puntos.
5. En **Peso**, dos columnas: a la izquierda "Nuevo pesaje" y la gráfica; a la
   derecha "Mis pesajes" y "Estadísticas".
6. **Consulta** sigue en una columna estrecha y centrada: una conversación a
   1100 px de ancho se lee fatal.
7. **Ajustes** sigue tan estrecha como hoy y centrada. No se ensancha ni se
   recoloca.
8. En el **móvil no cambia absolutamente nada**: las sub-pestañas siguen ahí y
   siguen filtrando.
9. Al estrechar la ventana desde el escritorio hasta el tamaño de un móvil, la
   app vuelve a su forma de móvil sin quedarse a medias ni dejar bloques
   escondidos.
10. El aviso legal del final no se estira de lado a lado: se queda estrecho y
    centrado.
11. Desde **Hoy**, el atajo "Hacer dieta" lleva a Comidas y la columna "Mi
    dieta" **ya se ve** sin tener que buscarla, porque las tres están a la
    vista.
12. Todo lo que ya funcionaba sigue funcionando en las dos formas.

## 3. Alcance

### Entra

- Un punto de corte nuevo en `styles.css` para la vista de escritorio.
- Que el ancho máximo pase de 32 rem a unas 69 rem (~1100 px) a partir de ese
  corte.
- Ocultar la fila de sub-pestañas y enseñar las tres sub-secciones a la vez, en
  columnas, en Comidas y Ejercicio.
- Envolver en contenedores los bloques de **Hoy** y **Peso**, que hoy son
  títulos sueltos sin nada donde agarrarse, para poder repartirlos en dos
  columnas.
- **Poner tope de ancho a Consulta y a Ajustes**, que si no heredarían las
  69 rem y quedarían peor que ahora.

### NO entra (explícitamente fuera)

- **Reordenar Ajustes.** Sigue en `docs/BACKLOG.md`. Aquí solo se le impide
  ensancharse.
- **Cambiar el contenido, los textos o el comportamiento de ningún bloque.**
  Esta spec solo los coloca.
- **Tocar el JavaScript.** Que las sub-secciones se vean todas en escritorio se
  resuelve en CSS: la clase `.activa` se sigue moviendo igual, simplemente el
  escritorio la ignora. Si algo obliga a tocar `js/app.js`, hay que parar y
  avisar.
- **Fotos.** Su rejilla de miniaturas ya se estira sola; se comprueba que no se
  rompe, pero no se le hace nada.
- **Un menú lateral, una cabecera nueva o cualquier navegación de escritorio.**
  La barra ya sube arriba a partir de 48 rem desde la spec 009 y se queda como
  está.
- **Los flecos de la 037** (Fotos en la navegación, zonas táctiles, fecha y hora
  plegables).

## 4. Comportamiento detallado

### Los puntos de corte

Hoy solo hay uno, en `48rem` (768 px), que sube la barra de navegación a la
cabecera (spec 009). **Ese no se toca.**

Se añade un segundo en **`64rem` (1024 px)**, que es donde empieza la vista de
escritorio de verdad: por debajo no caben tres columnas sin que queden ridículas.

| Ancho de ventana | Qué se ve |
|---|---|
| menos de 48 rem | Móvil: barra abajo, una columna de 32 rem, sub-pestañas |
| de 48 a 64 rem | Tableta: barra arriba, una columna de 32 rem, sub-pestañas |
| 64 rem o más | Escritorio: barra arriba, hasta 69 rem, columnas, sin sub-pestañas |

### Los anchos

Se añade una variable nueva junto a `--ancho-columna`, que **no se toca** porque
sigue siendo el ancho bueno para leer y para los formularios:

- `--ancho-columna: 32rem` — lo de siempre.
- `--ancho-ancho: 69rem` (~1104 px) — el tope en escritorio.

A partir de 64 rem, `body` pasa a `--ancho-ancho`, centrada. En un monitor de
1920 px quedan márgenes a los lados: es intencionado, no un descuido. Un párrafo
de 1900 px de ancho hace que el ojo se pierda al saltar de línea.

### Qué hace cada sección en escritorio

| Sección | Qué pasa |
|---|---|
| **Comidas** | Tres columnas: `Apuntar` · `Mi dieta` · `Catálogo de recetas`. La del medio es la más ancha, porque la semana lleva siete días dentro |
| **Ejercicio** | Igual: `Apuntar` · `Mi tabla` · `Catálogo` |
| **Hoy** | Dos columnas. Izquierda: la fecha, el resumen, los atajos y "Qué has comido hoy". Derecha: "Constancia" y "Puntos y racha" |
| **Peso** | Dos columnas. Izquierda: "Nuevo pesaje" y "Cómo va" (la gráfica). Derecha: "Mis pesajes" y "Estadísticas". La izquierda es la más ancha: la gráfica lo agradece. **Este reparto sale del orden que ya tiene el HTML** — ver abajo |
| **Consulta** | Una sola columna, con tope propio de unas 42 rem y centrada. Un hilo de conversación ancho se lee mal |
| **Ajustes** | Una sola columna, con el tope de siempre (32 rem) y centrada. **Sin esto quedaría peor que hoy**: sus formularios estirados a 1100 px son una mala pantalla |
| **Fotos** | La rejilla de miniaturas se estira y caben más por fila. No se le hace nada; solo hay que comprobar que no se rompe |

Además de las secciones, hay **dos elementos compartidos** que también heredan el
ancho nuevo y que no pertenecen a ninguna sección:

- **El aviso legal** (`.disclaimer`) cuelga directamente de `#pantalla-principal`
  y saldría a 1100 px en todas las pantallas. Se le pone el tope estrecho de
  siempre y se centra: por el mismo motivo que a Consulta, un párrafo largo a
  1100 px se lee mal.
- **La fila de la cabecera** (el avatar y el email a la izquierda, la barra de
  navegación a la derecha) se separa hasta los extremos al ensanchar. **Se deja
  así a propósito**: identidad a un lado y navegación al otro es la forma normal
  de una barra de aplicación en escritorio. Se comprueba al probar, por si en la
  práctica queda raro.

### Cómo desaparecen las sub-pestañas

En escritorio:

- `.subpestanas` pasa a no mostrarse.
- `.subseccion` se muestra **siempre**, tenga o no la clase `.activa`.

El JavaScript sigue poniendo y quitando `.activa` exactamente igual: en
escritorio esa clase simplemente no decide nada. Así, **al estrechar la ventana**
la vista de móvil vuelve a funcionar al instante, con la sub-pestaña que estuviera
marcada, sin recargar ni tocar nada.

Cada columna conserva su título (`<h2>`), que ya dice lo que es: sin la fila de
pestañas, el título es la única pista y por eso no se quita.

### Los contenedores nuevos de Hoy y Peso

Comidas y Ejercicio ya tienen dónde agarrarse: los tres `.subseccion` de la spec
035 hacen de columnas tal cual. Hoy y Peso no: son `<h2>` sueltos uno detrás de
otro.

Se envuelven sus bloques en contenedores con una clase común, **sin mover ni un
solo elemento de sitio dentro del HTML** más allá de la envoltura, y sin cambiar
ningún `id`. En móvil esos contenedores no hacen nada (son bloques normales, uno
debajo de otro, igual que ahora); solo cobran sentido en escritorio.

En **Hoy** los contenedores van dentro de `#bloque-hoy`, para que sigan
ocultándose con él cuando no hay operación. `#bloque-iniciar` se queda fuera y a
una columna: es una pantalla de bienvenida con un botón, no necesita dos
columnas.

En **Peso** van dentro de `.contenido-operacion`, por el mismo motivo.

**Por qué la gráfica cae a la izquierda y no a la derecha.** El orden que Peso
tiene hoy en el HTML es: `Nuevo pesaje` → `Cómo va` (la gráfica) →
`Mis pesajes` → `Estadísticas`. Agrupar el formulario con la lista, que sería
lo primero que uno piensa, obligaría a sacar la gráfica de en medio, es decir, a
**mover un bloque en el HTML** — y eso cambiaría también el orden en el móvil,
donde hoy ves la curva justo después de pesarte. Tomando los bloques como están,
salen dos parejas ya contiguas:

- **Izquierda:** apuntar el peso y ver la curva. Lo que haces y su efecto.
- **Derecha:** los pesajes uno a uno y los números. El detalle.

Es un reparto tan bueno como el otro y no cuesta mover nada. **El orden del HTML
no se toca**, y por tanto el móvil se queda exactamente igual que hoy.

## 5. Modelo de datos

**Ninguno.** No se toca Firestore ni `firestore.rules`.

## 6. Casos límite

- **Estrechar la ventana en caliente**: al bajar de 64 rem vuelven las
  sub-pestañas y solo se ve la que estuviera activa. Como el JS nunca ha dejado
  de mantener `.activa`, siempre hay una marcada y **nunca puede quedar la
  sección en blanco**.
- **Sin operación en marcha**: `.contenido-operacion` y `#bloque-hoy` siguen
  ocultándose enteros, con sus columnas dentro. No debe quedar una rejilla vacía
  ni una fila de pestañas huérfana.
- **Una columna mucho más alta que las otras** (por ejemplo la semana de dieta
  frente al recetario vacío): las columnas empiezan arriba y cada una acaba
  donde acabe. No se estiran para igualarse ni se rellenan con hueco.
- **La gráfica de peso en escritorio**: es SVG y se dibuja al ancho de su
  contenedor. Hay que comprobar que al cambiar el tamaño de la ventana no se
  queda con el ancho viejo (`dibujarGrafica()` se llama al pintar la sección, no
  al redimensionar). **Si se queda mal, no se arregla aquí**: se anota y se
  decide aparte, porque tocar el redibujado es JavaScript y esta spec no lo
  toca.
- **La ventana del archivo de una operación** (`#archivo`) y el visor de fotos
  (`#visor`): flotan por encima de todo y no dependen del ancho de `body`. Hay
  que mirarlos igualmente.
- **Los atajos de Hoy en escritorio**: llevan a la sección y, como ya no hay
  sub-pestañas que cambiar, su columna simplemente está a la vista. No hace falta
  desplazar la pantalla hasta ella ni resaltarla: `data-subseccion` sigue
  marcando la sub-pestaña por debajo, sin efecto visible, y vuelve a servir en
  cuanto se estrecha la ventana.
- **Impresión o zoom del navegador muy alto**: el corte va en `rem`, así que al
  subir el tamaño de letra la app pasa a la forma de móvil antes. Es lo
  deseable.

## 7. Archivos afectados

| Archivo | Qué se hace |
|---|---|
| `styles.css` | La variable de ancho nueva y el bloque `@media` de escritorio. Es el grueso de la spec |
| `index.html` | Solo envolver los bloques de Hoy y de Peso en sus contenedores. Ni un `id` nuevo, ni uno menos |
| `docs/ESTADO.md` | Al terminar, cuando el usuario la valide |

**No se toca `js/app.js`.** Si al implementar parece que hace falta, es señal de
que algo se ha entendido mal: parar y avisar.

**Tamaño estimado:** unas 150-200 líneas, casi todas de CSS.

## 8. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| Columnas en Comidas, Ejercicio, Hoy y Peso; Consulta y Ajustes no | Elegido por el usuario el 2026-08-21. Son las cuatro que tienen varios bloques y se usan a diario |
| Tope de ~1100 px centrado | Elegido por el usuario el 2026-08-21 frente a 1400 px y al ancho completo. Con más, los renglones se hacen largos y cuesta seguirlos |
| Las sub-pestañas desaparecen en escritorio, no se convierten en índice | Elegido por el usuario el 2026-08-21. Si los tres bloques se ven a la vez, unas pestañas que no filtran nada solo estorban |
| Se le pone tope a Ajustes aunque "no entre" en la spec | No es recolocarla: es impedir que ensanchar `body` la estropee. Sin esto, la spec dejaría una pantalla peor que la de antes |
| En Peso, la gráfica va con el formulario y no con la lista | Lo impone el orden que el HTML ya tiene. La otra agrupación obligaría a mover un bloque, y eso cambiaría también el orden en el móvil |
| El aviso legal se queda estrecho | Mismo motivo que Consulta: es un párrafo largo, y a 1100 px se lee mal |
| Todo en CSS, sin tocar el JavaScript | Que la vista dependa solo del ancho hace que estrechar la ventana funcione al instante y que no haya dos estados que mantener sincronizados |

## 9. Fuera de spec: ideas apuntadas

- Redibujar la gráfica de peso al cambiar el tamaño de la ventana, si se
  comprueba que hace falta.
- Reordenar Ajustes (ya estaba en `docs/BACKLOG.md`).

## ✅ Para probar a mano

Lo rellena el agente `qa-manual` antes de la prueba.
