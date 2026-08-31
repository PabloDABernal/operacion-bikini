# 085 — Recetario: un solo apartado con recetas e ingredientes

- **Estado:** borrador
- **Fecha:** 2026-08-31
- **Referencia en PRODUCTO.md:** "Qué hará (evolutivos de la fase productiva, desde el 31 de agosto de 2026)"

## 1. Objetivo

Recetas y Despensa dejan de ser dos apartados separados y pasan a ser uno
solo, "Recetario", con un interruptor arriba para cambiar entre "Recetas"
e "Ingredientes". Los ingredientes dejan de salir todos de golpe: se
enseñan unos pocos, con un botón para desplegar el resto (mismo patrón que
ya tienen las recetas). En escritorio, este apartado va arriba a la
derecha (tercera columna), en vez de repartido entre la columna del medio
y la de la derecha como hasta ahora.

Es la reorganización visual que quedaba pendiente de las cuatro specs
relacionadas de hoy (082, 083, 084 ya cerradas o en marcha).

## 2. Criterio de "esto funciona"

1. En Comidas, en móvil hay TRES sub-pestañas en vez de cuatro: Apuntar,
   Mi dieta, Recetario. (Antes: Apuntar, Mi dieta, Recetas, Despensa.)
2. Al entrar en Recetario, arriba hay un interruptor con dos opciones:
   "Recetas" (por defecto) e "Ingredientes". Recetas se ve exactamente
   como el Recetario de hoy (buscador, tarjetas, "Nueva receta"...).
3. Al tocar "Ingredientes", se ve la despensa de hoy (añadir ingrediente,
   buscador, lista con casillas) — pero la lista ya NO sale entera de
   golpe: se ven los primeros, con un botón "Ver todos (N)" debajo, igual
   que ya hacen las recetas.
4. El botón de la lista de la compra sigue estando dentro de
   Ingredientes, en el mismo sitio de siempre (arriba, con el número de lo
   que falta).
5. En escritorio (≥64rem), el Recetario (con su interruptor) va arriba a
   la derecha, en la tercera columna, primera fila — donde antes estaba
   la Despensa sola. La lista de la compra sigue debajo, en la misma
   columna. La columna del medio se queda solo con Mi dieta.
6. Entrar en Recetario, sea desde la pestaña o desde "Editar" en una
   receta vista desde Mi dieta (spec 083), siempre aterriza en el panel
   "Recetas" (no en "Ingredientes"), igual que hoy.
7. Todo lo que ya funcionaba en Recetas y en Despensa (buscar, crear,
   editar, marcar, borrar, la lista de la compra) sigue funcionando
   exactamente igual: esto es una reorganización visual, no cambia
   ninguna función.

## 3. Alcance

### Entra
- Fusionar las sub-pestañas "Recetas" y "Despensa" en una sola,
  "Recetario", en `index.html` y `js/app.js`.
- Un interruptor interno (Recetas / Ingredientes) dentro de esa
  sub-pestaña, con su propia función de pintado —no reutiliza
  `abrirSubpestana()` para este interruptor interno, que sigue siendo
  para las sub-pestañas de primer nivel—.
- Paginar la lista de ingredientes (`pintarDespensa()`), con el mismo
  patrón "N visibles + Ver todos" que ya usan las recetas
  (`RECETAS_SIN_DESPLEGAR`/`recetasDesplegadas`).
- Mover el HTML de la despensa (formulario de alta, buscador, lista,
  botón de ir a la compra) dentro del contenedor de la sub-pestaña
  "Recetario", como panel "Ingredientes".
- Ajustar la rejilla de escritorio (`styles.css`, `@media (min-width: 64rem)`):
  Recetario a columna 3 / fila 1; la lista de la compra se queda en
  columna 3 / fila 2 (sin cambios ahí); la columna 2 se queda solo con Mi
  dieta.
- Que `abrirPestana("comidas", "recetas")` (usado por la spec 083) siga
  aterrizando en el panel "Recetas" del Recetario, no en "Ingredientes".

### NO entra (explícitamente fuera)
- Cambiar cómo se ve o se comporta la lista de la compra en sí: sigue
  siendo la misma sub-pestaña `compra`, con el mismo botón de siempre
  para llegar y volver.
- Cambiar el criterio de paginado de las recetas (ya existente, sin
  tocar).
- Cualquier cambio de las specs 082/083/084 (ingredientes estructurados,
  editar desde el día, ingrediente suelto): esta spec es solo la
  reorganización visual, sin tocar su lógica.

## 4. Comportamiento detallado

- **Sub-pestañas de Comidas**: se queda un botón para "Recetario" (antes
  había uno para "Recetas" y otro para "Despensa"). Usa
  `data-subseccion="recetas"`, para que el mecanismo de sub-pestañas de
  primer nivel (`abrirSubpestana()`) no cambie de nombre por fuera —
  menos riesgo de romper los sitios que ya navegan ahí (spec 083).
- **Interruptor interno**: dos botones, "Recetas" e "Ingredientes",
  dentro del contenedor de la sub-pestaña "recetas". Al tocar uno, una
  función nueva (p. ej. `mostrarPanelDeRecetario(modo)`) alterna la clase
  `.oculta` entre el panel de recetas (el HTML que ya existe hoy) y el
  panel de ingredientes (el HTML de la despensa, movido aquí dentro), y
  marca cuál de los dos botones del interruptor está activo.
- **Aterrizar siempre en "Recetas"**: `abrirSubpestana()`, cuando activa
  la sub-pestaña `recetas` de `comidas`, llama también a
  `mostrarPanelDeRecetario("recetas")` — así cualquier camino que hoy
  navega ahí (la pestaña misma, o `editarRecetaDesdeElDia()` de la spec
  083) aterriza siempre en el panel correcto, sin arrastrar un
  "Ingredientes" que se hubiera quedado activo de antes.
- **Volver de la lista de la compra**: el botón "← Volver a la despensa"
  pasa a decir "← Volver a los ingredientes" (o similar) y, en vez de
  `abrirSubpestana("comidas", "despensa")` (que ya no existe como
  sub-pestaña propia), hace `abrirSubpestana("comidas", "recetas")`
  seguido de `mostrarPanelDeRecetario("ingredientes")` — para volver al
  Recetario, pero en el panel de Ingredientes, no en el de Recetas por
  defecto.
- **Paginado de ingredientes**: mismo patrón que las recetas. Se define
  una constante (p. ej. `DESPENSA_SIN_DESPLEGAR = 10`, más que las 3 de
  recetas porque una fila de ingrediente es mucho más compacta que una
  tarjeta de receta) y una variable `despensaDesplegada`, con sus botones
  "Ver todos (N)" / "Ver menos", calcados de
  `btn-desplegar-recetas`/`btn-desplegar-recetas-arriba`.
- **Escritorio**: la lista de la compra (`compra`) NO cambia de
  comportamiento — sigue siempre visible, apilada justo debajo del
  Recetario en la misma columna, sin botón (como ya pasa hoy). Al estar
  el Recetario mucho más corto (paginado, y con un solo interruptor en
  vez de dos bloques largos apilados), la compra deja de quedar
  enterrada al final de la columna.

## 5. Modelo de datos

Ninguno. Es reorganización de interfaz.

## 6. Casos límite

- Entrar en Recetario con el interruptor recién montado (primera vez que
  se usa esta versión): por defecto, panel "Recetas".
- Cambiar a "Ingredientes", desplegar todos, y volver a "Recetas" y de
  vuelta a "Ingredientes": el estado de desplegado (`despensaDesplegada`)
  se puede perder al cambiar de panel (no es información que el usuario
  espere que persista, mismo criterio que otros estados de interfaz de la
  app) — se puede simplificar volviendo siempre a "colapsado" al
  reabrir el panel, o mantenerlo si sale gratis; cualquiera de las dos es
  válida.
- Buscar un ingrediente en Ingredientes con la lista colapsada: el
  buscador filtra sobre TODOS los ingredientes (no solo los visibles),
  igual que ya hace el buscador de recetas hoy con `recetasDesplegadas`.
- Con 0 ingredientes en la despensa: el aviso de "aquí van los
  ingredientes..." se sigue viendo igual; el paginado no aparece (no hay
  nada que desplegar).
- Móvil, pantalla estrecha: el interruptor interno no debe descuadrar
  nada ni obligar a scroll horizontal — mismo criterio que ya cumplen las
  sub-pestañas de primer nivel.

## 7. Archivos afectados

- `index.html`: fusión de las sub-pestañas Recetas/Despensa en una,
  interruptor interno nuevo, reubicación del HTML de la despensa dentro
  del contenedor de Recetario.
- `js/app.js`: `mostrarPanelDeRecetario()` (nueva), `abrirSubpestana()`
  (para aterrizar siempre en "Recetas"), el listener de
  `btn-volver-despensa`, `pintarDespensa()` y `ingredientesQueCoinciden()`
  (paginado, mismo patrón que `pintarRecetas()`), nuevas
  constante/variable de paginado.
- `styles.css`: rejilla de escritorio (columna/fila de `recetas` y
  eliminar la de `despensa`), estilos del interruptor interno.

## 8. Decisiones tomadas

- **Un solo apartado "Recetario"** con interruptor Recetas/Ingredientes,
  en vez de dos sub-pestañas separadas. Decisión del usuario.
- **Los ingredientes se paginan** igual que las recetas (unos pocos +
  "Ver todos"). Decisión del usuario.
- **La lista de la compra sigue dentro de Ingredientes**, alcanzable con
  el mismo botón de siempre — no se convierte en una tercera opción del
  interruptor. Decisión del usuario (ya la había pedido así en la
  conversación original de hoy).
- **En escritorio, el Recetario va arriba a la derecha (columna 3, fila
  1)**, sustituyendo el sitio donde estaba la Despensa sola; la columna
  del medio se queda solo con Mi dieta. Decisión del usuario.
- **La lista de la compra en escritorio sigue apilada, sin botón**, sin
  cambios respecto a hoy: al acortarse el Recetario, deja de quedar
  enterrada. Decisión tomada para minimizar el alcance de esta spec —
  avisar al usuario si tras probarlo prefiere que también use el botón
  en escritorio.

## 9. Fuera de spec: ideas apuntadas

Ninguna nueva.

## ✅ Para probar a mano

(Lo afina el agente `qa-manual` antes de la prueba; guion provisional.)

1. En móvil (o la ventana estrecha), comprueba que Comidas tiene tres
   sub-pestañas: Apuntar, Mi dieta, Recetario.
2. Entra en Recetario: debe verse el interruptor Recetas/Ingredientes,
   con Recetas activo por defecto y viéndose igual que el Recetario de
   siempre.
3. Toca Ingredientes: debe verse la despensa, con solo unos pocos
   ingredientes y un botón para ver todos. Búscalo por nombre y comprueba
   que encuentra uno que no esté entre los visibles.
4. Desde Ingredientes, toca el botón de ir a la lista de la compra y
   vuelve: debes regresar a Ingredientes, no a Recetas.
5. Desde Comidas → Mi dieta, abre una receta y toca "Editar" (spec 083):
   debes aterrizar en el panel Recetas del Recetario, no en Ingredientes,
   aunque la última vez que estuviste en Recetario fuera viendo
   Ingredientes.
6. En escritorio (ventana ancha), comprueba que el Recetario está arriba
   a la derecha (tercera columna), con la lista de la compra justo
   debajo, y que la columna del medio solo tiene Mi dieta.
7. Comprueba que crear, editar, borrar y marcar recetas e ingredientes
   sigue funcionando exactamente igual que antes.
