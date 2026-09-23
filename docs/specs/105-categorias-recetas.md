# 105 — Categorías en las recetas, y buscarlas por categoría

- **Estado:** borrador
- **Fecha:** 2026-09-23
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v19: categorías en el recetario y la compra residual, decidida el 23 de septiembre de 2026)"

## 1. Objetivo

Cada receta del recetario compartido puede marcarse con una o varias
categorías de una lista cerrada (Comida, Postre, Fit, Snack, Desayuno,
Otros), y el recetario se puede filtrar por categoría además de por el
buscador de texto que ya existe (spec 079).

## 2. Criterio de "esto funciona"

1. Abro el editor de una receta (nueva o existente). Veo las seis
   categorías como casillas, no como un desplegable de una sola opción.
2. Marco dos categorías a la vez (por ejemplo, Postre y Fit) y guardo. Al
   volver a abrir la tarjeta de la receta, veo las dos categorías marcadas.
3. En el listado del Recetario, cada tarjeta muestra sus categorías (por
   ejemplo, como chips cortos junto al nombre o dentro de la tarjeta
   desplegada).
4. Hay un filtro por categoría (chips o botones tipo "Postre", "Fit"...)
   encima o junto al buscador de texto. Al tocar "Fit", el listado se
   reduce a las recetas marcadas como Fit; puedo combinarlo con el
   buscador de texto a la vez.
5. Quito el filtro y vuelvo a ver el recetario entero.
6. Con una cuenta que NO es el autor de una receta ni el admin, abro esa
   receta: NO puedo cambiar sus categorías (mismo permiso que editar/
   borrar, spec 104).
7. Una receta sin ninguna categoría marcada (las 43 recetas ya sembradas,
   antes de esta spec) se sigue viendo y encontrando bien: no desaparece
   del listado ni rompe nada al no tener categorías.

## 3. Alcance

### Entra
- Campo `categorias` (array de strings) en cada receta del recetario
  compartido (`recetas/{recetaId}`).
- Lista cerrada de seis valores: `comida`, `postre`, `fit`, `snack`,
  `desayuno`, `otros` (claves internas en minúscula; la etiqueta que se ve
  en pantalla es la capitalizada: "Comida", "Postre"...).
- Casillas (checkboxes) en el formulario de crear/editar receta, una por
  categoría — no un `<select>` de una sola opción.
- Chips o botones de filtro por categoría en el listado del Recetario,
  combinables entre sí (una receta con Postre Y Fit aparece si se filtra
  por cualquiera de las dos) y combinables con el buscador de texto que ya
  existe.
- Mismo permiso que editar/borrar la receta (spec 104): solo el autor o el
  admin puede cambiar las categorías de una receta.
- Las recetas sin `categorias` (todas las anteriores a esta spec, incluidas
  las 73 sembradas y las 43 fit) se tratan como "sin categoría": se ven en
  el listado general y no aparecen en ningún filtro de categoría concreta.

### NO entra (explícitamente fuera)
- No se categorizan los ingredientes, solo las recetas.
- No hay una pasada retroactiva que le ponga categoría a las recetas ya
  existentes: quien quiera categorizarlas las abre y las edita a mano,
  cuando le apetezca.
- No se amplía la lista de seis categorías en esta spec.
- No se toca la lista de la compra (spec 106, aparte).

## 4. Comportamiento detallado

*(a rellenar/ajustar durante la implementación: disposición exacta de las
casillas en el formulario, forma visual de los chips de categoría en la
tarjeta y en el filtro, mensaje cuando un filtro no da ningún resultado)*

## 5. Modelo de datos

- `recetas/{recetaId}.categorias`: array de strings, cada uno uno de
  `comida | postre | fit | snack | desayuno | otros`. Campo opcional — su
  ausencia (recetas de antes de esta spec) equivale a "sin categoría", no a
  un array vacío guardado a la fuerza.

## 6. Casos límite

- Guardar una receta sin marcar ninguna casilla: se guarda con
  `categorias: []` (array vacío, nunca se omite el campo al guardar desde
  el formulario) — no es un error. La distinción de la sección 5 es solo
  para las recetas de ANTES de esta spec, que no tienen el campo en
  absoluto: "sin categoría" cubre tanto no tener el campo como tenerlo
  vacío, y el filtro trata las dos formas igual.
- Filtrar por una categoría con cero recetas: el listado queda vacío con un
  mensaje, igual que hoy pasa con el buscador de texto sin resultados.
- Una receta con las seis categorías marcadas a la vez: válido, sin límite
  de cuántas se pueden marcar.

## 7. Archivos afectados

*(estimado, a confirmar al implementar)*
- `js/recetas.js`: validar y guardar `categorias` en `validarReceta()`/
  `guardarReceta()`/`actualizarReceta()`.
- `index.html`: casillas de categoría en `#form-receta`, chips de filtro en
  el listado de Recetas.
- `js/app.js`: pintar las casillas al editar, pintar los chips en cada
  tarjeta, lógica de filtro combinado con el buscador de texto — el punto
  de enganche exacto es `recetasQueCoinciden()`, que hoy filtra solo por
  texto.
- `firestore.rules`: sin cambios (el permiso de escritura de `recetas` ya
  cubre cualquier campo del documento).

## 8. Decisiones tomadas

- **Lista cerrada de seis categorías (Comida, Postre, Fit, Snack, Desayuno,
  Otros)** → evita que "fit"/"Fit"/"FIT" ensucien el filtro con el tiempo,
  a costa de tener que ampliarla el día que se quede corta.
- **Varias categorías por receta, con casillas** → una receta como
  "Tiramisú fit de queso cottage" es Postre y Fit a la vez; forzar una sola
  categoría obligaría a elegir cuál pesa más.
- **Mismo permiso que editar/borrar la receta** → consistente con el resto
  de la spec 104, sin un tercer nivel de permisos nuevo.

## 9. Fuera de spec: ideas apuntadas

- Categorizar retroactivamente las 43 recetas fit y las 73 sembradas (se
  hará a mano, si hace falta, no es parte de esta spec).
- Categorías para ingredientes.

## ✅ Para probar a mano

*(la rellena/afina el agente `qa-manual` antes de la prueba, una vez
implementada)*
