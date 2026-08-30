# 073 — Qué me falta de la compra

- **Estado:** implementada, pendiente de `revisor-codigo` y de que el usuario la pruebe (rehecha el 30 de agosto de 2026, antes de que probara la primera versión).
- **Fecha:** 2026-08-30
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v12: la lista de la compra, decidida el 30 de agosto de 2026, corregida el mismo día antes de probarla)".

## 0. Por qué se rehizo antes de probarse

La primera versión de esta spec ponía la lista de la compra como un bloque fijo
**encima** de la lista de ingredientes de la despensa, con apuntes a mano
("papel higiénico"). El usuario, al leer cómo había quedado —antes de probarla
en la app—, dijo que no le gustaba: *"mejor que salga un botón (…) pero no que
salga arriba de los ingredientes. eso es un añadido, no lo importante, que son
los ingredientes"*.

Se rehace: sigue siendo "qué me falta de la compra", con el mismo criterio de
qué cuenta como falta, pero cambia dónde vive, cómo se ve y qué entra:

| | Versión original | Esta versión |
|---|---|---|
| Dónde | Bloque fijo, **encima** de la despensa | Un botón, **debajo** de la despensa |
| Cómo se ve | Siempre visible | Se despliega/pliega al pulsar el botón |
| Apuntes a mano | Sí, colección propia | **No existen** |
| Qué enseña | Lo que falta + apuntes | Solo lo que falta |

## 1. Objetivo

Que el usuario pueda ver, cuando quiera y sin que estorbe a lo importante (los
ingredientes de su despensa), qué le falta comprar de las recetas de su dieta
de esta semana — y marcarlo como comprado ahí mismo.

## 2. Por qué existe

Lleva en la lista de ideas desde la spec 026, y hasta ahora era cara. Ya no: la
spec 059 hizo el cruce despensa/receta y la 068 llenó la despensa sola, así que
**las piezas ya están**. Solo falta juntar lo que falta de todas las recetas de
la semana y enseñarlo sin competir con la despensa por el primer sitio.

## 3. Criterio de "esto funciona"

1. En **Comidas → Despensa**, debajo de la lista de ingredientes, hay un botón
   **"Ver qué me falta de la compra"**.
2. Pulsarlo despliega, justo debajo del botón, los ingredientes de las recetas
   de tu dieta que **no tienes marcados** en la despensa.
3. Un ingrediente que aparece en tres recetas sale **una vez**.
4. Cada fila tiene un botón para decir **"ya lo tengo"**: marca el ingrediente
   en tu despensa (`tengo: true`) y desaparece de esta lista al instante.
5. Con todo comprado (o sin nada que falte), el desplegado lo dice en vez de
   enseñar una lista vacía.
6. Sin dieta activa, el desplegado lo dice y no hay nada que listar.
7. El desplegado dice también **qué comidas de tu semana no tienen receta**,
   por su nombre, para que sepas qué le falta por saber.
8. Volver a pulsar el botón lo pliega. El estado (desplegado o no) no se
   guarda: cada vez que entras en Despensa empieza plegado.

## 4. Alcance

### Entra

- El botón y el desplegable dentro de Despensa, debajo de la lista de
  ingredientes.
- El cálculo al vuelo de lo que falta (reutilizando `loQueFalta()` de la spec
  059/072, ya existente en `js/despensa.js`).
- Marcar un ingrediente como "ya lo tengo" desde ahí (reutilizando
  `marcarIngrediente()`, ya existente).
- El aviso de comidas sin receta (reutilizando `comidasSinReceta()`, ya
  escrita en la implementación anterior de esta misma spec).

### NO entra (explícitamente fuera)

- **Apuntar cosas a mano.** Estaba en la versión anterior; se quita: desviaba
  el foco de lo que importa (los ingredientes) y no era lo que el usuario
  pedía. Sin apuntes a mano, **no hace falta colección nueva en Firestore, ni
  reglas, ni casilla de reinicio**: todo esto pasa a estar fuera de spec.
- **Cantidades.** La lista dice "tomate", no "3 tomates".
- **Agrupar por pasillo o por tipo de producto.** Se descartó ya para la
  despensa, en favor del buscador (spec 069).
- **Compartir la lista** con otra persona.
- **Adivinar los ingredientes de las comidas sin receta.** Se dice cuáles son
  y el usuario les pone receta él mismo; ver el apartado 5.
- **Recordar si estaba desplegado o plegado** entre visitas a la sub-pestaña.

## 5. Lo que esta lista no sabe, y cómo lo arregla el usuario

Igual que en la versión anterior de esta spec: **solo las comidas con receta
tienen ingredientes**. La IA devuelve como mucho ocho recetas por semana; el
resto de las comidas —"yogur con nueces", "fruta"— son solo un nombre.

El desplegable dice, por su nombre, **qué comidas de la semana no tienen
receta enlazada**, para que el usuario pueda cerrarlo él mismo:

1. **Comidas → Recetas → Nueva receta**, con sus ingredientes.
2. **Comidas → Mi dieta**, editar esa comida y enlazar la receta.

Desde ese momento, sus ingredientes entran en lo que falta como los demás.

## 6. Comportamiento detallado

### Dónde y cómo

Dentro de **Comidas → Despensa**, **debajo** de `#lista-despensa`: un botón de
texto (estilo `.desplegar`, el mismo que usan las listas largas de la app) que
alterna entre "Ver qué me falta de la compra" y "Ocultar qué me falta de la
compra". Al pulsarlo, se pinta o se vacía un contenedor debajo del propio
botón. No es una sub-pestaña ni un bloque aparte: es parte de la sub-pestaña
Despensa, en último lugar, para no competir con la lista de ingredientes por
la atención de quien entra ahí.

### Qué sale al desplegar

Los ingredientes de las recetas enlazadas a la dieta activa que **no** están
marcados en la despensa, calculados **al vuelo** con `loQueFalta()` — sin
guardar nada, igual que el cruce de la spec 059. Los repetidos se juntan con
la regla de la spec 072 (igualdad y plural).

- Con dieta activa y algo pendiente: la lista de ingredientes, cada uno con su
  botón "ya lo tengo".
- Con dieta activa y nada pendiente: *"No te falta nada de tu dieta."*
- Sin dieta activa: *"Aún no tienes dieta, así que no hay nada que comprobar."*

Debajo de la lista (o del aviso de "nada pendiente"), si hay comidas sin
receta enlazada, el mismo aviso por nombre que ya tenía la versión anterior de
esta spec.

### Marcar "ya lo tengo"

Marca el ingrediente en la despensa (`marcarIngrediente(uid, id, true)`) y
desaparece de esta lista al instante; la fila de la despensa (si está a la
vista) se actualiza igual. Sin conexión, revierte y avisa, como el resto de la
despensa.

## 7. Modelo de datos

**Ninguno nuevo.** Sin apuntes a mano, esta spec no necesita colección propia:
todo se calcula al vuelo cruzando `despensa`, `dietas` y `recetas`, que ya
existen.

## 8. Casos límite

- **Sin dieta activa**: el desplegable lo dice, no hay lista.
- **Dieta sin recetas enlazadas**: el desplegable dice que no falta nada, y el
  aviso de comidas sin receta cobra todo su sentido.
- **Receta borrada del recetario**: sus ingredientes dejan de salir.
- **Todo comprado**: se dice, no se enseña una lista vacía.
- **Sin conexión al marcar "ya lo tengo"**: revierte y sale el error, como en
  toda la despensa.
- **Se pliega el desplegable con algo marcado a medias**: no hay nada a medias
  posible — marcar es una acción atómica por fila.

## 9. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/despensa.js` | Ninguno nuevo: reutiliza `loQueFalta()`, ya escrita. |
| `index.html` | Botón y contenedor del desplegable, debajo de `#lista-despensa`. Se retira el bloque `#lista-compra`/`#form-apunte` de la versión anterior. |
| `js/app.js` | Pintado del desplegable y de sus filas, alternar mostrar/ocultar, marcar "ya lo tengo". Se retira todo el bloque "La lista de la compra" de la implementación anterior (`js/compra.js` completo, sus imports, `apuntesDeCompra`, `pintarCompra()`, `filaDeCompra()`, `marcarComprado()`, `refrescarCompra()`, el formulario de apuntar). `recetasDeLaDieta()` y `comidasSinReceta()` se conservan: no dependían de los apuntes. |
| `js/compra.js` | **Se borra.** Era solo para los apuntes a mano, que ya no existen. |
| `firestore.rules` | Se retira el bloque `usuarios/{uid}/compra/{apunteId}` de la versión anterior. |
| `js/reinicio.js` | Se retira la entrada `compra` de `TIPOS`, ya innecesaria. |
| `styles.css` | Reutiliza `.desplegar` y las filas `.ingrediente` que ya existen; no debería hacer falta CSS nuevo. |

**Al ser una reescritura que QUITA más de lo que añade** (colección, reglas,
formulario y sus manejadores desaparecen), no se estima un tope de líneas
nuevo: el resultado neto debería ser más pequeño que la versión anterior
(303 líneas), no más grande.

## 10. Decisiones tomadas

- **Un botón, no un bloque fijo, y debajo de los ingredientes, no encima**
  (usuario, 30 de agosto, antes de probar la primera versión): la despensa es
  lo importante de esa sub-pestaña; la compra es un añadido.
- **Se sigue mostrando solo lo que falta**, no un listado completo
  tengo/no-tengo de todos los ingredientes de la semana (usuario, 30 de
  agosto): mismo criterio que ya tenía la versión anterior, no se cambia.
- **Fuera los apuntes a mano** (usuario, 30 de agosto): no eran lo que se
  pedía y desviaban el foco.
- **El desplegado no recuerda su estado entre visitas** (Claude, al escribir
  esta corrección): es el mismo patrón que "Ver todos" en el resto de la app,
  y no hay ninguna razón para tratarlo distinto aquí.

## 11. Fuera de spec: ideas apuntadas

- Cantidades en la lista.
- Un botón en el aviso de "comida sin receta" que lleve directo a crearla.
- Apuntar cosas sueltas a mano, si más adelante se echa en falta (se quitó a
  propósito en esta corrección, pero queda anotado por si cambia de opinión).

## ✅ Para probar a mano

(Lo afina el agente `qa-manual` antes de la prueba.)
