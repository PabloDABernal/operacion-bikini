# 037 — El día, más a la vista: comidas integradas, Hoy completo y detalle en el calendario

- **Estado:** ✅ completada (probada y confirmada por el usuario el 2026-08-21).
- **Fecha:** 2026-08-21
- **Referencia en PRODUCTO.md:** apartado "Qué hará (ampliación de la v4, decidida el 21 de agosto de 2026)".

## 1. Objetivo

Tres pantallas muestran menos de lo que podrían con los mismos datos que ya
guardan: en Comidas, el formulario es grande y "Lo de siempre" queda lejos de
donde se apunta; en Hoy, el resumen solo enseña lo último de cada tipo aunque
haya varias comidas; y en el calendario, tocar un día solo dice qué categorías
se apuntaron, no qué se apuntó. Al terminar esta spec, las tres muestran el
detalle real sin que el usuario tenga que ir a buscarlo a otra pantalla.

## 2. Criterio de "esto funciona"

1. **Comidas → Apuntar**: bajo el campo "Qué has comido" aparecen las comidas
   habituales de hoy como chips (lo que antes era "Lo de siempre", que
   desaparece como bloque propio). Tocar un chip guarda esa comida al
   instante, igual que hacía el botón de antes.
2. En el mismo formulario, **Fecha y Hora** no se ven de entrada: hay un
   control ("Cambiar fecha y hora" o similar) que los despliega. Sin tocarlo,
   guardar usa la fecha y hora de ahora mismo, igual que si se hubieran
   dejado con su valor por defecto hoy.
3. Con el formulario más corto, el diario ("Lo que llevo apuntado") queda más
   cerca de la parte de arriba: menos scroll para verlo tras abrir Comidas.
4. **Hoy**: el resumen deja de mostrar una sola línea por tipo (Peso, Comidas,
   Ejercicio) y en su lugar hay una lista de **todos** los registros de hoy,
   ordenados por su **hora** (la más tardía primero). Cada línea dice qué es
   y a qué hora. Sigue habiendo un botón "+" para apuntar más de cada tipo.
5. Sin nada apuntado hoy, Hoy enseña el mismo hueco vacío que antes (con sus
   "+"), no una lista en blanco rara.
6. **Calendario de constancia**: al tocar un día con registros, debajo del
   calendario aparece, para ese día: el texto de cada comida (con su hora si
   la tiene), el texto de cada ejercicio (con minutos y hora), y el peso si
   se registró. Todo, no solo un resumen de categorías.
7. Un día sin registros sigue diciendo "sin registros", como ahora.
8. Todo lo anterior funciona igual en móvil y en escritorio.

## 3. Alcance

### Entra

- Comidas: mover "Lo de siempre" a chips bajo el campo de texto del
  formulario de apuntar.
- Comidas: plegar Fecha y Hora del formulario de apuntar, con un control para
  desplegarlos.
- Hoy: sustituir el resumen de una línea por tipo por una lista de todos los
  registros de hoy.
- Calendario de constancia (en Hoy): mostrar el detalle real de un día al
  tocarlo, no solo las categorías.

### NO entra (explícitamente fuera)

- **Ejercicio no se toca en esta spec.** El usuario solo ha pedido esto para
  Comidas. Si se quiere lo mismo en el formulario de "Nuevo ejercicio" (chips
  + fecha/hora plegable), es una spec aparte — se anota en
  `docs/BACKLOG.md`.
- **El formulario de Peso** tampoco se toca (fecha/hora plegable ahí queda
  para cuando se decida extenderlo).
- **Zonas táctiles más grandes en botones de tipo enlace** y **fotos en la
  navegación**: seguían apuntadas para una spec futura (antes numerada 037 en
  `docs/ESTADO.md`, ahora la siguiente libre). No se tocan aquí.
- **Cambiar qué cuenta como "comida habitual"** (`loDeSiempre()`): el cálculo
  de qué se ofrece como chip no cambia, solo cómo y dónde se muestra.
- **El calendario en Ajustes → Histórico** (operaciones archivadas): esta
  spec solo toca el calendario de constancia de la operación en marcha, en
  Hoy.

## 4. Comportamiento detallado

### Comidas: chips de "Lo de siempre"

- El bloque `#bloque-lo-de-siempre` (con su `<h2>Lo de siempre</h2>` propio)
  desaparece de donde está. Los chips se pintan en un contenedor nuevo
  colocado entre el campo `#comida-texto` y el campo `Momento`, o
  inmediatamente debajo del textarea (decisión de maquetación, sin mover
  `Momento`, `Fecha` u `Hora` de orden).
- El comportamiento de cada chip no cambia: tocarlo llama a la misma
  `repetirComida()` que ya guarda la comida con la hora actual (fix del 21 de
  agosto). Dónde cae el aviso de guardado/error (`guardado-repetir`,
  `error-repetir`) al mover los chips de sitio **es libre**: puede seguir
  siendo un texto cerca del contenedor de chips, sin que haga falta parar a
  preguntarlo — lo único que importa es que se vea sin buscarlo, igual que
  exige ya el resto de la app (spec 034).
- Sin comidas habituales que ofrecer, el contenedor de chips queda vacío
  y no ocupa espacio (igual que hoy oculta el bloque entero).

### Comidas: Fecha y Hora plegadas

- `Fecha` y `Hora` empiezan **plegadas**. Un control (botón de tipo enlace,
  p. ej. "Cambiar fecha y hora") las despliega. Una vez desplegadas, se
  quedan visibles mientras el formulario esté abierto (no hace falta
  volver a plegarlas para guardar).
- Al guardar sin desplegarlas, se usa el valor con el que los campos ya
  vienen precargados hoy (fecha y hora actuales) — el comportamiento de
  guardado no cambia, solo la visibilidad de los campos.
- Si el usuario despliega, cambia la fecha u hora, guarda, y vuelve a abrir
  el formulario más tarde (u otra comida), los campos vuelven a su estado
  plegado con los valores por defecto de ese momento: no se recuerda que
  estaban desplegados.

### Hoy: lista completa del día

- `pintarResumen()` deja de coger solo `ultimoDeHoy()` de cada tipo. En su
  lugar recorre `registros.pesajes`, `registros.comidas` y
  `registros.ejercicios` filtrando por `fecha === hoy`, junta los tres en una
  sola lista y la ordena **por el campo `hora` del registro**, de más tardía
  a más temprana (18:30 antes que 09:00). Los registros de hoy sin hora
  (el campo es opcional) van todos **al final de la lista**, después de los
  que sí tienen hora; entre ellos, en el orden en que ya vienen cargados
  (por `creadoEn`, como el resto de listas de la app).
- Cada línea muestra qué tipo es (peso/comida/ejercicio), el texto o valor, y
  la hora si la tiene — reutilizando `conHora()` y el formato que ya existe
  por tipo (`${pesoKg} kg`, el texto de la comida, `texto · minutos min`).
- El botón "+" por tipo, que hoy vive en cada línea de resumen, pasa a un
  sitio que tenga sentido con una lista de N líneas por tipo en vez de una
  fija: tres botones "+" (Peso, Comidas, Ejercicio) en un sitio fijo de la
  pantalla, separados de la lista. **Dónde exactamente (arriba o debajo de la
  lista) es libre**: lo decide quien implemente, sin que haga falta parar a
  preguntarlo. Los tres siguen llevando a la sección/subsección
  correspondiente igual que hoy (`abrirPestana(seccion)`).
- Sin nada apuntado hoy, se mantiene el estado vacío actual (los "+" sin
  ninguna línea encima).

### Calendario: detalle real de un día

- `alTocar(casilla)` deja de llamar solo a `textoDeCasilla()`. Con la
  `casilla.fecha` tocada, filtra `registros.pesajes/comidas/ejercicios`
  (los mismos que ya están cargados para pintar Hoy) por esa fecha y
  construye el detalle: una línea por comida (texto + hora), una línea por
  ejercicio (texto + minutos + hora) y una línea de peso si la hay.
- Sin registros ese día, se mantiene el texto actual ("`fecha` — sin
  registros").
- El detalle sigue cayendo en `#calendario-detalle`, debajo del calendario,
  como ahora — no se abre ninguna ventana ni pantalla nueva.

## 5. Modelo de datos

**Ninguno.** No se toca Firestore ni `firestore.rules`. Todo lo que se
enseña ya se carga hoy (los registros de pesajes/comidas/ejercicios que Hoy
ya trae para pintar el resumen y el calendario); esta spec solo cambia cómo
se muestran.

## 6. Casos límite

- **Muchas comidas habituales**: los chips deben envolver (wrap) en varias
  líneas si no caben en una, igual que hace hoy `#lo-de-siempre`.
- **Varios registros a la misma hora, hoy (del mismo tipo o de tipos
  distintos)**: el orden entre ellos es el mismo que ya usan las listas
  normales (por `creadoEn`, no hay desempate nuevo que inventar).
- **Registros de hoy sin hora**: van todos al final de la lista, como se fija
  arriba — no se mezclan por posición estimada con los que sí tienen hora.
- **Un día del calendario con varias comidas o ejercicios**: todas se listan,
  sin recortar (decisión tomada explícitamente: nada de "ver más" aquí).
- **Cambiar de rango en el calendario** con un día ya seleccionado: el
  detalle vuelve a su estado inicial ("Toca un día para ver qué apuntaste"),
  igual que hoy — la casilla tocada puede haber dejado de existir en el rango
  nuevo.
- **Fecha y hora plegadas y el usuario edita una comida ya guardada**: el
  formulario de edición de una fila (`filaEditable`) es distinto del de
  "Nueva comida" y no se toca aquí — sigue enseñando sus campos como hoy.

## 7. Archivos afectados

| Archivo | Qué se hace |
|---|---|
| `index.html` | Comidas: mueve el marcado de "Lo de siempre" junto al textarea y envuelve Fecha/Hora en un contenedor plegable con su control. Hoy: `#hoy-resumen` pasa a poder llevar N líneas por tipo y los "+" se reorganizan. |
| `styles.css` | Estilos de los chips en su nueva posición, del contenido plegable de Fecha/Hora, y de la lista de Hoy con varias líneas por tipo. |
| `js/app.js` | `pintarLoDeSiempre()` pinta en el contenedor nuevo. Un toggle nuevo para Fecha/Hora. `pintarResumen()` reescrito para listar todos los registros de hoy. `alTocar()` del calendario reescrito para construir el detalle real. |
| `docs/ESTADO.md` | Al terminar, cuando el usuario la valide. |

**Tamaño estimado: por encima de las ~300 líneas** que marca `CLAUDE.md` — es
la suma de tres cambios (spec 035 sola, con una forma parecida, ya rozó ese
límite). El usuario, avisado del riesgo, decidió el 2026-08-21 implementarla
en una sola sesión de todos modos. Se hace en tres pasos dentro de esa misma
sesión, en el orden del criterio de "esto funciona" (Comidas → Hoy →
Calendario), avisando si alguno de los tres se dispara por su cuenta.

Se implementa **ya**, sin esperar a que el usuario dé por completamente
validada la spec 036: la base que 037 necesita (columnas de escritorio,
`#bloque-hoy`, `.contenido-operacion`, las `subseccion` de Comidas) ya está
probada en producción. Si al validar la 036 aparece algún cambio en esa base,
se resuelve aparte y no debería chocar con lo que aquí se construye encima.

## 8. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| Chips + fecha/hora plegable en Comidas | Elegido por el usuario el 2026-08-21, frente a mover "Lo de siempre" sin tocar fecha/hora |
| En Hoy, la lista completa sustituye al resumen de una línea | Elegido por el usuario el 2026-08-21, frente a añadirla debajo del resumen actual |
| En el calendario, todo el detalle sin recortar | Elegido por el usuario el 2026-08-21, frente a recortar como las demás listas |
| Una sola spec para las tres cosas | Elegido por el usuario el 2026-08-21, aun sabiendo que probablemente supere las ~300 líneas |
| Ejercicio se queda fuera | El usuario solo pidió esto para Comidas; se anota en el backlog por si se quiere igualar |
| En Hoy, la lista se ordena por la hora del registro (más tardía primero), no por `creadoEn` | Elegido por el usuario el 2026-08-21, tras detectar `revisor-specs` que la spec se contradecía entre "el más reciente primero" y "ordenada por hora" |
| Se implementa en una sola sesión, sin dividir en tres specs | Elegido por el usuario el 2026-08-21, pese a la recomendación de `revisor-specs` de reconfirmarlo |
| Se implementa ya, sin esperar a que el usuario valide del todo la 036 | Elegido por el usuario el 2026-08-21: la base que necesita ya está probada en producción |

## 9. Fuera de spec: ideas apuntadas

- Chips + fecha/hora plegable también en el formulario de "Nuevo ejercicio",
  por simetría con Comidas.
- Fecha/hora plegable en el formulario de Peso.
- Zonas táctiles más grandes y fotos en la navegación (lo que
  `docs/ESTADO.md` venía llamando "spec 037" antes de esta).

## ✅ Para probar a mano

Se prueba en producción: https://operacion-bikini.vercel.app, con una
operación en marcha.

**Antes de empezar**: para tener chips que probar, apunta antes una comida
sencilla (p. ej. "café con leche") si no tienes ya alguna que se repita a
menudo — "Lo de siempre" tarda un par de repeticiones en ofrecerla.

### Comidas: chips y fecha/hora plegada

1. Entra en **Comidas → Apuntar**. Bajo el textarea "Qué has comido" (y no en
   un bloque aparte más abajo) ves los chips de tus comidas habituales, si
   tienes alguna. El bloque "Lo de siempre" con su propio título **ya no
   existe** como tal.
2. Toca un chip. Se guarda al instante (mismo comportamiento que el botón de
   antes) y aparece en el diario de abajo con la hora de ahora mismo.
3. En el formulario, **no ves Fecha ni Hora** de entrada — solo Qué has
   comido, los chips y Momento. Hay un botón/enlace "Cambiar fecha y hora".
4. Tócalo: aparecen los campos Fecha y Hora, y el botón desaparece.
5. Sin tocar esos campos, escribe algo y guarda. Se guarda con la fecha y
   hora de ahora (igual que si los hubieras visto desde el principio).
6. Tras guardar, **Fecha y Hora vuelven a plegarse** (reaparece el botón
   "Cambiar fecha y hora").
7. Sal de Comidas y vuelve a entrar (o cambia de sub-pestaña y vuelve a
   "Apuntar"): Fecha y Hora **siguen plegadas**, no se queda recordado que
   las habías desplegado antes.
8. Con el formulario más corto, "Lo que llevo apuntado" queda más cerca
   arriba: se nota menos scroll para llegar a él que antes.

### Hoy: la lista completa del día

9. Abre **Hoy**. Donde antes había una línea fija por tipo (Peso, Comidas,
   Ejercicio) con solo lo último, ahora hay una **lista con todos los
   registros de hoy** — si has apuntado dos comidas hoy, aparecen las dos.
10. Cada línea dice qué es (Peso / Comida / Ejercicio) y a qué hora, y están
    **ordenadas de la más tardía a la más temprana** (lo último del día,
    arriba).
11. Hay **tres botones fijos** ("+ Peso", "+ Comidas", "+ Ejercicio"),
    separados de la lista. Tócalos: cada uno lleva a su pantalla de apuntar,
    igual que antes.
12. Sin nada apuntado hoy (o en un usuario/operación recién iniciada), el
    hueco vacío de siempre sigue ahí, con los tres "+", sin una lista vacía
    rara en medio.

### Calendario: detalle real de un día

13. En Hoy, en el calendario de constancia, **toca un día con registros**.
    Debajo aparece, línea por línea: el texto de cada comida de ese día (con
    su hora si la tiene), el de cada ejercicio (con minutos y hora), y el
    peso si lo hay — no solo "comida, ejercicio" como antes.
14. Toca un día **sin registros**: sigue diciendo "`fecha` — sin registros",
    como siempre.
15. Con un día tocado y su detalle visible, **cambia el rango del
    calendario** (p. ej. de "1 mes" a "3 meses"): el detalle vuelve a "Toca
    un día para ver qué apuntaste" — no se queda mostrando el de un día que
    puede haber desaparecido del rango nuevo.

### Casos límite

16. Si tienes varias comidas habituales, los chips se **envuelven en varias
    líneas** en vez de desbordar o cortarse.
17. Apunta dos comidas hoy **a la misma hora exacta** (o edita una para que
    coincida con otra): en Hoy, entre esas dos, el orden debe ser el mismo
    en que las guardaste (la que guardaste después, arriba) — no deben salir
    al revés.

### Que no se haya roto nada

18. En **móvil** (o el modo responsive del navegador a menos de 768 px):
    Comidas y Ejercicio siguen funcionando exactamente igual que antes de
    esta spec, con sus sub-pestañas.
19. **Ejercicio → Apuntar** y **Peso → Nuevo pesaje** siguen mostrando Fecha
    y Hora **siempre visibles**, sin plegar y sin chips: esta spec no los
    tocaba.
20. Apunta un ejercicio y un pesaje cualquiera y comprueba que aparecen en la
    lista de Hoy, con su hora, igual que las comidas.
21. En escritorio, con la ventana ancha (columnas de la spec 036): todo lo
    anterior se ve igual de bien repartido en columnas, sin barras de scroll
    raras ni texto cortado en la lista de Hoy ni en los chips.

Si todo lo anterior pasa, la spec 037 queda **completada**.
