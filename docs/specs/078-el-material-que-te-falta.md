# 078 — El material que te falta

- **Estado:** borrador
- **Fecha:** 2026-09-01
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v13: el material, decidida el 30 de agosto de 2026)", tercer punto ("Y lo que te falta, junto").
- **Depende de:** la spec 074 (el armario) y la 077 (la tabla aprovecha tu
  material, cruce y material como lista de piezas) — sin ellas no hay ni
  armario que cruzar ni piezas que cruzar pieza a pieza.

## 1. Objetivo

Que Ejercicio diga qué material hay que conseguir: las piezas que piden los
ejercicios de tu tabla de esta semana que **no** tienes, más lo que apuntes
a mano, y que marcar algo como conseguido lo quite de la lista y lo meta en
tu armario — el espejo exacto de la lista de la compra (spec 073), para
material en vez de comida.

## 2. Criterio de "esto funciona"

1. En **Ejercicio → Material**, además de tu armario, hay una lista de
   **material que te falta**.
2. Salen las piezas de los ejercicios de tu tabla activa que **no** tienes
   marcadas en el armario.
3. Una pieza que piden tres ejercicios distintos sale **una vez**.
4. Se puede **apuntar algo a mano** ("comprar un banco nuevo") y aparece en
   la lista.
5. Marcar como conseguida una pieza la marca en tu armario: **desaparece de
   la lista** y el ejercicio que la pedía pasa a enseñarla con su marca de
   "la tienes".
6. Marcar como conseguido un apunte a mano lo **borra**.
7. Sin tabla activa, la lista solo tiene lo que hayas apuntado a mano.
8. Con todo conseguido, lo dice en vez de enseñar una lista vacía.

## 3. Alcance

### Entra

- La lista dentro de Ejercicio → Material: lo que falta de la tabla y los
  apuntes a mano.
- Apuntar y borrar a mano.
- Marcar como conseguido, con sus dos comportamientos (marca en el armario
  / borra el apunte).
- La colección de apuntes, sus reglas y su casilla de reinicio.

### NO entra (explícitamente fuera)

- **Cantidades.** La lista dice "mancuernas", no "un par de mancuernas de 8
  kg". El armario nunca ha llevado cantidades (spec 074) y esto no lo
  cambia.
- **Agrupar por tipo de material.** Descartado ya para el armario, en favor
  de que la lista sea corta por naturaleza (diez piezas, no cien).
- **Compartir la lista** con otra persona. Cada usuario ve solo lo suyo.
- **Adivinar el material de un ejercicio sin material asociado.** Si un
  ejercicio del catálogo tiene `material: []` (peso corporal, o nunca se
  rellenó), no aporta nada a la lista y no se avisa de nada: a diferencia
  de una comida sin receta (073), un ejercicio de peso corporal SIN
  material es un estado normal y válido, no una laguna que arreglar.
- **Un atajo para editar el material de un ejercicio desde la lista.** El
  camino ya existe (Ejercicio → Catálogo → editar el ejercicio).

## 4. Comportamiento detallado

### Dónde

Dentro de **Ejercicio → Material** (la sub-pestaña de la spec 074), encima
o junto a la lista del armario — mismo criterio que la 073: es el mismo
asunto, qué tienes y qué falta, y no merece una quinta sub-pestaña.

### Qué sale

Dos cosas en una sola lista:

- **Lo que falta de la tabla**: cada pieza de material de los ejercicios de
  tu tabla activa (recorriendo `dias[].sesion.ejercicios[]`, cada uno con
  su `ejercicioId` si está enlazado al catálogo), cruzada contra tu
  armario, que no esté marcada. Se calcula **al vuelo**, sin guardar nada
  — igual que la 073 con la dieta.
- **Lo que has apuntado a mano**, que sí se guarda.

Los repetidos se juntan con la misma regla de normalización que ya usa el
armario (`js/despensa.js`, reutilizada desde la 074/077).

Un ejercicio de la sesión de un día **sin** `ejercicioId` (una línea de
texto suelta, sin enlazar al catálogo) no aporta nada a la lista: no hay
de dónde sacar su material. Igual que una comida sin receta en la 073, pero
aquí **sin aviso** (ver "NO entra": no es una laguna a cerrar, un ejercicio
de peso corporal escrito a mano es perfectamente normal).

### Marcar como conseguido

- Una **pieza**: se marca en el armario (`tengo: true`). Si no existía
  todavía en tu armario (la pedía un ejercicio pero nunca la escribiste),
  se crea ya marcada — mismo criterio que la 073 con un ingrediente que
  falta de una receta y no está en la despensa. Conseguir algo es tenerlo.
- Un **apunte a mano**: se borra.

### Apuntar a mano

Un campo y un botón, mismo patrón que la compra: máximo 60 caracteres, sin
repetidos, hasta 50 apuntes.

## 5. Modelo de datos

Colección nueva `usuarios/{uid}/materialCompra/{apunteId}`, **solo para los
apuntes a mano** (mismo motivo que `compra` en la 073: no se guardan en el
armario, o acabarían mandándose a la IA como material que ya tienes al
pedir tabla con "aprovechar mi material").

| Campo | Tipo | Qué es |
|---|---|---|
| `texto` | string | Qué hay que conseguir. 1-60 caracteres. |
| `creadoEn` | timestamp | Para ordenarlos. |

**Lo que falta de la tabla NO se guarda.** Vista derivada de la tabla activa
y el armario, igual que la 073.

`materialCompra` vive **fuera de las operaciones**, como el armario y la
compra: no es el diario de una etapa.

Necesita **casilla propia** en Reiniciar datos, por el mismo motivo que
`compra` en la 073: `borrarOperacion()` no toca colecciones de primer
nivel.

## 6. Casos límite

- **Sin tabla activa**: solo salen los apuntes a mano, y se dice.
- **Tabla sin ejercicios enlazados al catálogo** (todo texto suelto): la
  lista solo tiene apuntes, sin aviso adicional (a diferencia de la 073,
  ver sección 3).
- **Ejercicio borrado del catálogo** después de enlazarlo en una sesión: su
  material deja de salir. Correcto: ya no vas a hacerlo tal y como estaba.
- **Un apunte a mano que coincide con una pieza que falta**: sale una vez,
  como apunte. Al marcarlo, se borra el apunte **y** se marca la pieza si
  existe en el armario — mismo caso límite que la 073.
- **Todo conseguido**: se dice, no se enseña una lista vacía.
- **Sin conexión al marcar**: revierte y sale el error, como en toda la
  app.
- **Un ejercicio de la sesión repetido varias veces** (tres bloques de
  sentadillas): su material se cuenta una sola vez en la lista, como
  cualquier repetido.

## 7. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/material-compra.js` | **Nuevo.** Los apuntes: validar, listar, guardar, borrar. Calcado a `js/compra.js`. |
| `js/material.js` | Función de "lo que falta" (piezas de los ejercicios de la tabla, cruzadas con el armario) — equivalente a `loQueFalta()` de `js/despensa.js`, o reutilizando la misma si el cruce de la 077 vive ahí. |
| `index.html` | El bloque de la lista dentro de Ejercicio → Material. |
| `js/app.js` | Pintado, alta, marcado y borrado. |
| `firestore.rules` | Bloque de `materialCompra`. **Publicar con la CLI antes de probar.** |
| `js/reinicio.js` | Casilla "material que falta" (o el nombre que se le dé), junto a la de "material" que ya existe desde la 074 — **casillas distintas**: una es tu armario, la otra son los apuntes sueltos, igual que `despensa` y `compra` son casillas separadas. |
| `styles.css` | Reutilizar lo de la compra si vale. |

**Aviso de tamaño:** por precedente (la 073, el mismo patrón para comida,
salió en 303 líneas porque casi todo ya estaba hecho), se estima un rango
similar, **250-320 líneas**, con la salvedad de que aquí el cruce y el
"material como lista" los pone la spec 077 antes que esta, así que debería
quedar igual de barata o más. Si al implementar se pasa de 320, parar y
avisar.

## 8. Decisiones tomadas

- **Vive dentro de Ejercicio → Material**, no en sub-pestaña propia.
  Decisión del usuario, 2026-09-01: mismo criterio que la 073.
- **Se puede apuntar material a mano.** Decisión del usuario, 2026-09-01:
  mismo criterio que la 073, colección aparte por el mismo motivo (no
  contaminar lo que se manda a la IA como "lo que tienes").
- **Marcar como conseguido crea la pieza en el armario si no existía, ya
  marcada.** Decisión del usuario, 2026-09-01: espejo exacto de cómo la
  073 trata un ingrediente que falta y no está en la despensa.
- **Un ejercicio de peso corporal (sin material) no genera ningún aviso.**
  Decisión de alcance, 2026-09-01: a diferencia de una comida sin receta
  (que sí es una laguna real en la 073), un ejercicio sin material es un
  estado normal, no algo que el usuario tenga que "arreglar" creando algo.

## 9. Fuera de spec: ideas apuntadas

- Cantidades en la lista de material.
- Un atajo para editar el material de un ejercicio directamente desde la
  lista de lo que falta.

## ✅ Para probar a mano

*(lo rellena/afina el agente `qa-manual` antes de la prueba, siguiendo el
criterio de la sección 2 — caso concreto acordado: un ejercicio de tu
tabla pide material que no tienes, sale en la lista de lo que falta,
marcarlo lo mete ya marcado en tu armario)*
