# 106 — La lista de la compra, residual: un botón en Recetas

- **Estado:** borrador
- **Fecha:** 2026-09-23
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v19: categorías en el recetario y la compra residual, decidida el 23 de septiembre de 2026)"

## 1. Objetivo

La lista de la compra deja de vivir dentro de Recetas → Ingredientes (con su
botón "ir a la compra" y el número de cuántas cosas faltan al lado) y pasa a
un botón suelto, sin número ni aviso, en la pantalla Recetas. Sigue
calculándose exactamente igual; solo cambia dónde se llega a ella.

## 2. Criterio de "esto funciona"

1. Entro en la pestaña **Recetas**. Veo un botón "Lista de la compra" (o
   texto similar) que NO lleva ningún número al lado.
2. En **Recetas → Ingredientes** ya NO está el botón "ir a la compra" de
   antes.
3. Toco el botón de Recetas y se abre la lista de la compra, con el mismo
   contenido de siempre: los ingredientes de las recetas de mi dieta activa
   que no tengo marcados, más lo que haya apuntado a mano.
4. Marco un ingrediente como comprado: desaparece de la lista, igual que
   hoy.
5. Cierro la lista de la compra con su botón de volver: vuelvo a la pantalla
   donde estaba justo antes de abrirla (Recetas o Ingredientes, la que
   fuera) — no siempre a Ingredientes, que es lo que hace hoy.
6. En escritorio (pantalla ancha), la lista de la compra ya no aparece
   apilada automáticamente debajo del Recetario: solo se ve si se abre con
   el botón.

## 3. Alcance

### Entra
- Quitar el botón "ir a la compra" (con su número de cosas que faltan) de
  dentro de `panel-recetario-ingredientes`.
- Un botón nuevo, sin número, en el nivel de la pantalla Recetas (fuera del
  interruptor Recetas/Ingredientes), que abre/cierra la lista de la compra.
- La lista de la compra sigue siendo el mismo cálculo de siempre (despensa
  cruzada con las recetas de la dieta activa, spec 073) y el mismo listado
  de apuntes a mano.
- En escritorio, la lista de la compra deja de mostrarse siempre visible
  (columna 3, fila 2 de la rejilla de Comidas de antes de la 104): pasa a
  comportarse igual que en móvil, oculta hasta que se pulsa el botón.

### NO entra (explícitamente fuera)
- No cambia cómo se calcula lo que falta comprar.
- No cambia el formulario de apuntar algo a mano, ni el botón "comprado
  todo" (spec 096).
- No toca las categorías de recetas (spec 105, aparte).

## 4. Comportamiento detallado

**El botón "volver" recuerda de dónde vino** (revisión de `revisor-specs`,
23 de septiembre): hoy `btn-volver-despensa` siempre hace
`mostrarPanelDeRecetario("ingredientes")`, forzando el destino. Pasa a
guardar, al abrir la compra, cuál era el panel activo en ese momento
(`"recetas"` o `"ingredientes"`) y a restaurar ESE panel al cerrarla, en vez
de un destino fijo.

*(el resto, a rellenar/ajustar durante la implementación: dónde exactamente
se coloca el botón dentro de la pantalla Recetas — arriba del todo, o junto
al interruptor Recetas/Ingredientes —, y si la lista se abre en la misma
pantalla o como un panel superpuesto)*

## 5. Modelo de datos

Sin cambios: sigue siendo `usuarios/{uid}/compra` (spec 073), sin tocar.

## 6. Casos límite

- Sin dieta activa: la lista de la compra se abre igual, vacía o solo con
  lo apuntado a mano — mismo comportamiento de hoy, solo cambia el camino
  para llegar.
- Abrir la lista de la compra y cambiar a otra pestaña y volver: se
  recuerda o no el estado abierto/cerrado es un detalle menor, no crítico.

## 7. Archivos afectados

*(estimado, a confirmar al implementar)*
- `index.html`: mover el bloque de la compra fuera de
  `panel-recetario-ingredientes`, quitar `#btn-ir-a-compra` de su sitio
  actual y añadir el botón nuevo a nivel de pantalla.
- `js/app.js`: `mostrarPanelDeRecetario()`/navegación de Recetas, ajustar
  el toggle del panel de compra; `pintarBotonDeCompra()` (hoy calcula y
  escribe el número "(N)" en el texto del botón — deja de hacerlo).
- `styles.css`: quitar la regla de escritorio que mostraba la compra
  siempre visible en la rejilla vieja de Comidas (o su equivalente ya
  migrado a Recetas tras la spec 104), y confirmar que en escritorio se
  comporta igual que en móvil (oculta hasta pulsar el botón).

## 8. Decisiones tomadas

- **Botón suelto en Recetas, sin número al lado** → decisión explícita del
  usuario: el aviso de "cuántas cosas faltan" molestaba. Se sigue pudiendo
  usar la lista, solo deja de recordar que existe todo el rato.
- **También en escritorio deja de estar siempre visible** → coherente con
  quitarle protagonismo: si en móvil se abre a demanda, en escritorio
  tampoco tiene sentido que aparezca sola.
- **El botón de volver recuerda de dónde vino, en vez de ir siempre a
  Ingredientes** → con la compra ya fuera de Ingredientes, forzar ese
  destino dejaría de tener sentido si se entró desde Recetas.

## 9. Fuera de spec: ideas apuntadas

Ninguna surgida al escribir esta spec.

## ✅ Para probar a mano

Ya desplegado en producción (operacion-bikini.vercel.app).

1. Entra en **Recetas**: debe verse un botón "Lista de la compra" arriba,
   antes del interruptor Recetas/Ingredientes, SIN ningún número al lado.
2. Ve a **Recetas → Ingredientes**: el botón de ir a la compra que había
   ahí ya no está.
3. Con la dieta activa puesta, toca "Lista de la compra": debe verse el
   mismo contenido de siempre (ingredientes que faltan + lo apuntado a
   mano).
4. Marca un ingrediente como comprado: desaparece de la lista, igual que
   antes.
5. Toca "Volver": si entraste a la compra viendo el panel **Recetas**,
   debes volver a Recetas (no a Ingredientes).
6. Repite desde **Ingredientes**: toca "Lista de la compra" estando en el
   panel Ingredientes, y al tocar "Volver" debes caer de nuevo en
   Ingredientes.
7. Si puedes probar en pantalla ancha (escritorio): entra en Recetas y
   comprueba que la lista de la compra NO se ve apilada debajo del
   Recetario automáticamente — solo aparece al tocar el botón, igual que
   en móvil.
8. Comprueba que apuntar algo a mano y el botón "comprado todo" (spec 096)
   siguen funcionando igual que siempre dentro de la lista.
