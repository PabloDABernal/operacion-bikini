# 083 — Editar la receta desde el día

- **Estado:** borrador
- **Fecha:** 2026-08-31
- **Referencia en PRODUCTO.md:** "Qué hará (evolutivos de la fase productiva, desde el 31 de agosto de 2026)"

## 1. Objetivo

Al ver la receta de un plato desde Comidas → Mi dieta (el icono de receta,
spec 060), hay un botón "Editar" que lleva directamente al editor de esa
receta, y al guardar (o cancelar) vuelve a donde estabas viendo el día.

Es la tercera de cuatro specs relacionadas; la 082 (ingredientes
estructurados) ya cerrada es su base — el editor que se reutiliza aquí es
el mismo editor de líneas de esa spec, sin cambios.

## 2. Criterio de "esto funciona"

1. En Comidas → Mi dieta, abre la receta de un plato (icono de receta).
   Junto a la receta desplegada hay un botón "Editar" (además de lo que ya
   hay hoy: nombre, raciones, ingredientes, preparación).
2. Al tocarlo, la app cambia a Comidas → Recetas con el formulario de esa
   receta ya abierto, exactamente como si hubieras tocado "Editar" desde su
   tarjeta en el Recetario.
3. Editas lo que haga falta (nombre, ingredientes, cantidades,
   preparación...) y guardas.
4. Al guardar con éxito, la app vuelve a Comidas → Mi dieta, viendo lo
   mismo que estabas viendo (el mismo día concreto, o la semana entera si
   estabas ahí), con la receta del plato mostrando ya los cambios.
5. Si en vez de guardar cancelas, la app vuelve igualmente a Comidas → Mi
   dieta, viendo lo mismo, sin cambios en la receta.
6. Si entras a editar una receta desde el Recetario directamente (como
   hoy), guardar o cancelar se comporta exactamente igual que hasta ahora
   (te deja en el Recetario): el "volver a Mi dieta" solo pasa cuando
   viniste de ahí.
7. Lo mismo que los puntos 1-4, pero abriendo la receta estando en "Ver la
   semana entera" en vez de un día concreto: al volver, sigues viendo la
   semana entera, no un día suelto.

## 3. Alcance

### Entra
- Un botón "Editar" en `recetaDesplegada()` (`js/app.js`, la caja de
  receta que se ve bajo un plato en Mi dieta), junto al resto de la
  información de la receta.
- Recordar que la edición se abrió desde Mi dieta (y desde qué día), para
  poder volver ahí al terminar.
- Al guardar o cancelar viniendo de ese camino: volver a Comidas → Mi
  dieta con `pintarDieta()`, en el mismo día que se estaba viendo.

### NO entra (explícitamente fuera)
- Un editor nuevo o inline dentro de la caja de Mi dieta: se reutiliza tal
  cual el formulario existente (`form-receta` / `abrirFormularioDeReceta()`
  / `editarReceta()`), sin duplicar su lógica. Decisión del usuario.
- Cambiar nada del editor en sí (eso ya lo hizo la spec 082).
- Apuntar una comida con un ingrediente suelto (spec 084 en el orden
  acordado).
- Reorganizar Recetario/Despensa visualmente (spec 085 en el orden
  acordado).

## 4. Comportamiento detallado

- **La variable es un booleano, `volverAMiDietaTrasEditar`, NO el día.**
  La primera redacción de esta spec guardaba ahí el valor de
  `diaDietaAbierto` (el día que se estaba viendo), pero `diaDietaAbierto`
  también vale `null` cuando se está viendo "la semana entera" (spec 064)
  — el mismo valor que se pensaba usar para "no hay recordatorio puesto".
  Los dos casos se confundirían: editar una receta estando en vista de
  semana completa habría quedado indistinguible de una edición normal
  desde el Recetario. No hace falta guardar el día en absoluto: nada
  cambia `diaDietaAbierto` mientras el formulario de receta está abierto
  (verificado — solo lo tocan la tira de días y el botón "Ver la semana
  entera"/"Ver un solo día", ninguno alcanzable desde ahí), así que al
  volver y repintar, `pintarDieta()` ya respeta el valor que
  `diaDietaAbierto` tuviera, sea un día concreto o la semana entera. Con
  un booleano basta.
- `abrirFormularioDeReceta()` (`js/app.js`, línea ~2064 — la usan tanto
  "Nueva receta" como `editarReceta()`) apaga
  `volverAMiDietaTrasEditar` a `false` AL PRINCIPIO, siempre, pase lo que
  pase: es el único sitio por el que se abre el formulario, sea cual sea
  el camino, así que es el punto natural para que cualquier apertura nueva
  "olvide" un recordatorio de una edición anterior sin terminar (ver
  "Casos límite").
- `recetaDesplegada()` añade un botón "Editar" (estilo de fila, igual que
  "Editar"/"Borrar" en `tarjetaDeReceta()`) que, al tocarlo:
  1. Cambia de sección con `abrirPestana("comidas", "recetas")` (ya
     existe, es la misma función que usan los enlaces internos de la app).
  2. Llama a `editarReceta(receta)` (ya existe, abre el formulario con esa
     receta cargada — y de paso apaga `volverAMiDietaTrasEditar`, como
     cualquier apertura del formulario).
  3. SOLO DESPUÉS de eso, pone `volverAMiDietaTrasEditar = true`. El
     orden importa: si se pusiera antes de `editarReceta()`, el reseteo
     del paso anterior se lo comería.
- `cerrarFormularioDeReceta()` es el único sitio que necesita comprobar la
  variable: el `submit` de `form-receta`, al guardar con éxito, YA llama a
  `cerrarFormularioDeReceta()` (así lo hace hoy), así que basta con tocar
  esa función una vez para cubrir Guardar y Cancelar a la vez — no hace
  falta duplicar la comprobación en el `submit`. Si
  `volverAMiDietaTrasEditar` es `true` al llamarla: se apaga (`= false`),
  y en vez de dejar la pantalla en Recetas (lo de siempre) se llama a
  `abrirPestana("comidas", "dieta")` seguido de `pintarDieta()` (para que
  la receta recién guardada se vea actualizada, ya que `cuerpoDeReceta()`
  lee de `recetasCargadas`, que `refrescarRecetas()` ya deja al día tras
  guardar — ver "Casos límite" sobre el orden de estas dos llamadas; y
  para que la vista respete el día o la semana entera que se estuviera
  viendo, sin necesidad de haberlo guardado aparte). Si la variable es
  `false` (edición normal desde el Recetario), el comportamiento es
  exactamente el de hoy.

## 5. Modelo de datos

Ninguno. Es navegación y estado de interfaz en memoria.

## 6. Casos límite

- Cancelar sin haber cambiado nada: vuelve a Mi dieta igual, sin guardar
  nada (coherente con que "cancelar" ya no hace nada hoy).
- Editar y que el guardado falle (sin conexión): el error se enseña en el
  propio formulario, como hoy; NO se vuelve a Mi dieta hasta que se
  guarde con éxito o se cancele explícitamente.
- La receta editada deja de tener el nombre/ingredientes que tenía cuando
  se abrió el plato: al volver a Mi dieta, `recetaDeLaComida()` la sigue
  encontrando por `recetaId` (no cambia con la edición), así que el plato
  sigue enlazado y muestra la receta actualizada.
- Entrar a Editar desde Mi dieta, y ANTES de guardar o cancelar, navegar a
  mano a otra pestaña (Ajustes, por ejemplo) SIN cerrar el formulario
  (sigue abierto, solo oculto tras la sección): el recordatorio SIGUE
  puesto, porque nada lo ha tocado. Si vuelves a Comidas → Recetas y
  terminas esa misma edición (Guardar o Cancelar), te lleva a Mi dieta —
  es la misma edición que empezaste, solo que con un rodeo por otra
  pantalla en medio. Esto es intencional, no un fallo.
- Entrar a Editar desde Mi dieta, abandonarlo (como arriba), y luego abrir
  el formulario OTRA VEZ para algo distinto —"Nueva receta", o editar
  cualquier receta desde el Recetario—: como `abrirFormularioDeReceta()`
  apaga el recordatorio al principio SIEMPRE, esa apertura nueva "gana":
  guardar o cancelar esa segunda edición se comporta como una edición
  normal, sin arrastrar el rodeo a Mi dieta de la que se abandonó. Esto es
  justo lo que evita que una edición a medias "contamine" una edición
  distinta y posterior.
- Editar una receta estando en "Ver la semana entera" (no un día
  concreto): al volver, se ve igual la semana entera, no un día suelto —
  porque `diaDietaAbierto` no se ha tocado durante el rodeo (ver
  "Comportamiento detallado" sobre por qué la variable es un booleano y no
  el día).
- Al volver a Mi dieta tras guardar: `cerrarFormularioDeReceta()` llama a
  `abrirPestana()` y `pintarDieta()` justo después de `avisarGuardado()`,
  pero `refrescarRecetas()` (que deja `recetasCargadas` al día) es
  asíncrona y puede no haber terminado todavía en ese instante exacto.
  Puede verse un parpadeo brevísimo con la receta sin el cambio, corregido
  enseguida por el `pintarDieta()` que ya hace `refrescarRecetas()` al
  terminar. No es un fallo, es un detalle a no confundir con uno al
  probarlo a mano.

## 7. Archivos afectados

- `js/app.js`: `recetaDesplegada()` (botón nuevo), `abrirFormularioDeReceta()`
  (apaga el recordatorio al principio, siempre), `cerrarFormularioDeReceta()`
  (la única función que necesita comprobarlo — el `submit` de `form-receta`
  no necesita tocarse aparte, porque ya llama a `cerrarFormularioDeReceta()`
  al guardar con éxito), y una variable de módulo nueva
  (`volverAMiDietaTrasEditar`) para recordar el origen.
- `styles.css`: si hace falta, un ajuste menor de espaciado para el botón
  nuevo dentro de `.receta-en-dieta` (mismo patrón que `.receta-acciones`).

## 8. Decisiones tomadas

- **Se reutiliza el editor existente**, cambiando a la sub-pestaña Recetas
  con el formulario ya abierto — no se construye un editor inline dentro
  de Mi dieta. Menos trabajo, cero riesgo de mantener dos editores
  sincronizados. Decisión del usuario.
- **Guardar (o cancelar) devuelve a Mi dieta**, al mismo día que se estaba
  viendo, con la receta ya actualizada. Solo cuando la edición se abrió
  desde ahí; una edición normal desde el Recetario se comporta como
  siempre. Decisión del usuario.

## 9. Fuera de spec: ideas apuntadas

Ninguna nueva.

## ✅ Para probar a mano

(Lo afina el agente `qa-manual` antes de la prueba; guion provisional.)

1. En Mi dieta, abre la receta de un plato con receta enlazada. Toca
   "Editar": debes acabar en Recetas, con el formulario de esa receta ya
   abierto.
2. Cambia algo (por ejemplo, la cantidad de un ingrediente) y guarda.
   Debes volver a Mi dieta, al mismo día, y ver la receta con el cambio.
3. Repite el paso 1, pero esta vez pulsa Cancelar en vez de guardar. Debes
   volver a Mi dieta igual, sin el cambio.
4. Desde el Recetario (sin pasar por Mi dieta), edita una receta
   cualquiera y guarda: debes quedarte en Recetas, como siempre.
5. En Mi dieta, toca "Ver la semana entera" y desde ahí abre una receta y
   edítala. Al guardar, debes volver viendo la semana entera, no un solo
   día.
6. En Mi dieta, abre una receta y toca "Editar" (paso 1). Sin guardar ni
   cancelar, navega a mano a otra pestaña (Ajustes) y vuelve a Comidas →
   Recetario. Edita una receta DISTINTA y guarda: debes quedarte en
   Recetas (no debe llevarte a Mi dieta arrastrado de la edición
   abandonada).
