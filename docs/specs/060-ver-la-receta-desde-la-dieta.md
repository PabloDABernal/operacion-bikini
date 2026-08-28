# 060 — Ver la receta desde la dieta

- **Estado:** ✅ completada (probada y confirmada por el usuario el 2026-08-29). Con ella se cierra la v8.
- **Fecha:** 2026-08-28
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v8: la despensa, decidida el 28 de agosto de 2026)", tercera spec.
- **Depende de:** la spec 059, que crea el cruce despensa/receta y las marcas.

## 1. Objetivo

Que desde **Comidas → Mi dieta**, en una comida de la semana que tenga una receta
enlazada, se pueda abrir esa receta y leerla sin salir de la dieta.

## 2. Por qué existe esta spec

Salió de la revisión de la 059, el 28 de agosto. Aquella spec daba por hecho que
una receta ya se podía leer desde la dieta, y **no es verdad**: la dieta guarda el
`recetaId` de cada comida, pero solo lo usa en el desplegable de edición
(`js/app.js`). `filaDeComida()` pinta el momento y el texto, y nada más.

Se separó **antes** de implementar nada, no a posteriori: montar esa vista es una
pantalla nueva, no una marca encima de una que ya existe.

## 3. Criterio de "esto funciona"

1. En **Comidas → Mi dieta**, una comida con receta enlazada enseña que la tiene:
   se distingue a simple vista de una que no.
2. Tocándola se abre la receta: nombre, raciones, ingredientes y preparación.
3. Una comida **sin** receta enlazada (el yogur, la fruta, casi todos los
   desayunos y meriendas) **no** ofrece nada que abrir, y no cambia respecto a
   hoy. Es el caso mayoritario: la IA devuelve como mucho ocho recetas por semana.
4. Con la despensa en uso, los ingredientes salen marcados igual que en el
   recetario: "lo tienes" o "te falta", y el resumen "Tienes 5 de 8".
5. Cerrar la receta devuelve a la semana **tal y como estaba**, en el mismo sitio.
6. El botón **"Me lo he comido"** (spec 034) y el cupo de dietas siguen
   funcionando exactamente igual que antes. Es la regresión que más importa.
7. Si la receta enlazada ya no existe (se borró desde el recetario), la comida lo
   dice en vez de abrir una pantalla vacía.

## 4. Alcance

### Entra

- Señal visible de "esta comida tiene receta" en la semana de la dieta.
- Abrir y cerrar la receta desde ahí.
- Reutilizar el pintado de receta con marcas de la spec 059, sin duplicarlo.

### NO entra (explícitamente fuera)

- **Editar la receta desde la dieta.** Para eso está el recetario.
- **Enlazar una receta a mano** a una comida que no la tiene: ya se puede, desde
  el desplegable de edición de la celda.
- **Lista de la compra.** Sigue siendo idea de `docs/PRODUCTO.md`.
- **Cambiar nada del cruce despensa/receta.** Viene hecho de la 059.

## 5. Comportamiento detallado

### Cómo se abre: el nombre del plato

**El nombre del plato se toca**, y solo cuando esa comida tiene una receta
enlazada. No se añade ningún botón: la fila ya lleva "Me lo he comido" y
"Editar" (`filaDeComida()`), y en móvil un tercero no cabe sin apilarlos.

Que se puede tocar tiene que **verse antes de tocarlo**: el nombre va subrayado
punteado y con el cursor de mano. Un texto que reacciona al tocarlo sin avisar de
que reacciona es un truco escondido, y esto tiene que encontrarse solo.

Una comida **sin** receta enlazada se ve exactamente como hoy: texto plano, sin
subrayado y sin reaccionar. Es el caso mayoritario —la IA devuelve como mucho
ocho recetas por semana, y hay veintiocho comidas—, así que la fila normal no
puede cambiar de aspecto.

### Cómo se enseña: desplegada bajo la fila

La receta se abre **justo debajo de su fila**, dentro de la semana, y se cierra
volviendo a tocar el nombre. Es el mismo gesto que ya tienen las recetas en
Comidas → Recetas (spec 026), así que no hay nada nuevo que aprender, y no
pierdes de vista el resto de la semana.

**Solo una abierta a la vez.** Abrir otra cierra la anterior: con siete días de
cuatro comidas, dos o tres recetas abiertas convierten la semana en un scroll
sin fondo. Se guarda en una variable de módulo, igual que `recetaAbierta` en el
recetario.

Dentro se ve, en este orden: el resumen **"Tienes N de M"**, la lista de
ingredientes con sus marcas (spec 059) y la preparación. **No hay botones de
editar ni de borrar**: aquí la receta se lee. Para cambiarla está el recetario.

### Qué se reutiliza

El cruce y el pintado de ingredientes marcados salen tal cual de la 059
(`cruzarConLaDespensa()`). Si al implementarlo hay que duplicar ese código, es
señal de que hay que sacarlo a una función común, no de que haya que copiarlo.

## 6. Casos límite

- Comida sin `recetaId`: nada que abrir. Es el caso normal.
- `recetaId` que apunta a una receta borrada: se dice, no se abre en blanco.
- Receta sin ingredientes: se abre igual, sin marcas ni resumen (como en la 059).

## 7. Archivos afectados (estimación)

| Archivo | Qué |
|---|---|
| `js/app.js` | `filaDeComida()` y el pintado de la dieta: la señal y la apertura. **Cuidado: aquí viven también el cupo y el botón "Me lo he comido" de la spec 034.** |
| `index.html` | El contenedor de la receta abierta, si no se reaprovecha uno existente. |
| `styles.css` | La señal de "tiene receta" y la receta abierta. |

No toca `firestore.rules`, ni `api/`, ni el modelo de datos: todo lo que hace
falta ya está guardado.

## 8. Decisiones tomadas

- **Se separa de la 059 antes de implementar** (usuario, 28 de agosto), en vez de
  hacer crecer aquella spec por encima de 300 líneas y meterle mano al código que
  lleva el botón de marcar comida.
- **Se abre tocando el nombre del plato, no con un botón nuevo** (usuario, 29 de
  agosto). La fila ya lleva dos botones y en móvil un tercero se apila o se sale.
- **Se despliega bajo la fila, no en una capa encima** (usuario, misma
  conversación). Es el gesto que ya tienen las recetas en su sub-pestaña, y deja
  la semana a la vista.
- **Solo una receta abierta a la vez** (Claude, al cerrar la spec): con
  veintiocho comidas en pantalla, varias abiertas hacen la semana ilegible. Mismo
  criterio que el recetario, que ya funciona así.

Y dos cosas que salieron al implementarla, señaladas por `revisor-codigo` como
código no pedido por esta spec. Se documentan aquí en vez de quitarse, porque
sin ellas la feature no funciona o miente:

- **`refrescarRecetas()` repinta la semana si hay dieta cargada.** No es una
  feature: es una carrera. `refrescarTodo()` lanza `refrescarRecetas()` y
  `refrescarDieta()` a la vez, sin orden garantizado, y un plato solo se puede
  tocar si su receta está en `recetasCargadas`. Si la dieta llegaba primero, la
  semana se pintaba con la lista de recetas vacía y **ningún plato salía
  tocable** hasta el siguiente repintado. El precio es un repintado doble de la
  semana al arrancar, que no se nota.
- **`recetaDesplegada()` avisa si la receta ya no existe.** El criterio 7 solo
  cubría el caso al pintar la fila, y ahí el nombre ni siquiera se vuelve
  tocable. Este es el cinturón: si la receta se borra desde otra pestaña con la
  dieta ya abierta, se dice en vez de enseñar un hueco.

## 9. Fuera de spec: ideas apuntadas

- Ninguna todavía.

## ✅ Para probar a mano

(Lo afina el agente `qa-manual` antes de la prueba.)
