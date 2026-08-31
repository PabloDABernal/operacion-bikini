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
4. Al guardar con éxito, la app vuelve a Comidas → Mi dieta, al mismo día
   que estabas viendo, con la receta del plato mostrando ya los cambios.
5. Si en vez de guardar cancelas, la app vuelve igualmente a Comidas → Mi
   dieta, al mismo día, sin cambios en la receta.
6. Si entras a editar una receta desde el Recetario directamente (como
   hoy), guardar o cancelar se comporta exactamente igual que hasta ahora
   (te deja en el Recetario): el "volver a Mi dieta" solo pasa cuando
   viniste de ahí.

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

- `recetaDesplegada()` añade un botón "Editar" (estilo de fila, igual que
  "Editar"/"Borrar" en `tarjetaDeReceta()`) que, al tocarlo:
  1. Guarda en una variable de módulo (p. ej. `volverAMiDietaTrasEditar`)
     que la edición viene de Mi dieta, y el día que se estaba viendo
     (`diaDietaAbierto` ya existe y sirve para esto).
  2. Cambia de sección con `abrirPestana("comidas", "recetas")` (ya
     existe, es la misma función que usan los enlaces internos de la app).
  3. Llama a `editarReceta(receta)` (ya existe, abre el formulario con esa
     receta cargada).
- El `submit` de `form-receta` y `cerrarFormularioDeReceta()` (Cancelar),
  al terminar, comprueban si `volverAMiDietaTrasEditar` está activo: si lo
  está, lo apagan y llaman a `abrirPestana("comidas", "dieta")` seguido de
  `pintarDieta()` (para que la receta recién guardada se vea actualizada,
  ya que `cuerpoDeReceta()` lee de `recetasCargadas`, que `refrescarRecetas()`
  ya deja al día tras guardar). Si no está activo (edición normal desde el
  Recetario), el comportamiento es exactamente el de hoy.

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
- Entrar a Editar desde Mi dieta, y ANTES de guardar, navegar a mano a
  otra pestaña (Ajustes, por ejemplo) y volver a Comidas: se pierde el
  "recordatorio" de volver a Mi dieta (variable en memoria, no persistida)
  y guardar deja en el Recetario, como una edición normal. No es un fallo:
  es el mismo criterio que ya usa el resto del estado de navegación de la
  app.

## 7. Archivos afectados

- `js/app.js`: `recetaDesplegada()` (botón nuevo), el `submit` de
  `form-receta`, `cerrarFormularioDeReceta()`, y una variable de módulo
  nueva para recordar el origen.
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
