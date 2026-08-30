# 073 — La lista de la compra

- **Estado:** ✅ completada (probada y confirmada por el usuario el 2026-08-30).
- **Fecha:** 2026-08-30
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v12: la lista de la compra, decidida el 30 de agosto de 2026)".

## 1. Objetivo

Que la app diga qué hay que comprar: los ingredientes de la dieta de esta semana
que **no** tienes, más lo que apuntes a mano, y que marcar algo como comprado lo
quite de la lista.

## 2. Por qué existe

Lleva en la lista de ideas desde la spec 026, y hasta ahora era cara. Ya no: la
spec 059 hizo el cruce despensa/receta y la 068 llenó la despensa sola, así que
**las piezas ya están**. Solo falta juntar lo que falta de todas las recetas de
la semana en un sitio.

## 3. Criterio de "esto funciona"

1. En **Comidas → Despensa**, además de lo que tienes, hay una **lista de la
   compra**.
2. Salen los ingredientes de las recetas de tu dieta que **no tienes marcados**.
3. Un ingrediente que aparece en tres recetas sale **una vez**.
4. Se puede **apuntar algo a mano** ("papel higiénico") y aparece en la lista.
5. Marcar como comprado un ingrediente lo marca en tu despensa: **desaparece de
   la lista** y las recetas pasan a enseñarlo con su ✓.
6. Marcar como comprado un apunte a mano lo **borra**.
7. Sin dieta, la lista solo tiene lo que hayas apuntado a mano.
8. Con todo comprado, lo dice en vez de enseñar una lista vacía.
9. La lista dice **qué comidas de tu semana no tienen receta**, por su nombre,
   para que sepas qué le falta por saber.
10. Al crear una receta y enlazarla a una de esas comidas, sus ingredientes
    **aparecen en la lista** y esa comida deja de salir en el aviso.

## 4. Alcance

### Entra

- La lista dentro de Despensa: lo que falta de la dieta y los apuntes a mano.
- Apuntar y borrar a mano.
- Marcar como comprado, con sus dos comportamientos.
- La colección de apuntes, sus reglas y su casilla de reinicio.

### NO entra (explícitamente fuera)

- **Cantidades.** La lista dice "tomate", no "3 tomates". La despensa nunca ha
  llevado cantidades (spec 058) y esto no lo cambia.
- **Agrupar por pasillo o por tipo de producto.** Se descartó ya para la
  despensa, en favor del buscador (spec 069).
- **Compartir la lista** con otra persona. Cada usuario ve solo lo suyo, como
  todo en esta app.
- **Adivinar los ingredientes de las comidas sin receta.** Se dice cuáles son y
  el usuario les pone receta él mismo; ver el apartado 5.
- **Un atajo para crear la receta desde la lista.** El camino ya existe (Recetas
  → Nueva receta, y enlazarla al editar la comida). Se apunta como idea por si
  el camino largo molesta al usarlo.

## 5. Lo que esta lista no sabe, y cómo lo arregla el usuario

**Solo las comidas con receta tienen ingredientes.** La IA devuelve como mucho
ocho recetas por semana; el resto de las veintiocho comidas —"yogur con nueces",
"fruta"— son solo un nombre, sin lista de ingredientes detrás.

Así que la lista **cubre lo que dicen las recetas, no la semana entera**. Una
lista de la compra que parece completa y no lo es es peor que no tenerla, porque
te vas al súper confiado.

**Pero esto tiene arreglo, y lo tiene el usuario.** Lo señaló él mismo el 30 de
agosto: *"¿puedo crear recetas yo? sería editar las comidas que no tienen receta
para que tengan"*. Y sí, ya se puede desde las specs 026 y 028:

1. **Comidas → Recetas → Nueva receta**, con sus ingredientes.
2. **Comidas → Mi dieta**, editar esa comida, y en el desplegable *"o usa una
   receta tuya…"* elegirla. Queda enlazada.

Desde ese momento, sus ingredientes entran en la lista de la compra como los
demás.

Por eso la lista **no se limita a avisar de lo que no sabe: dice cuáles son**.
Enseña las comidas de tu semana sin receta enlazada, por su nombre, para que sepas
exactamente qué le falta y puedas cerrarlo tú. Un aviso genérico —"puede que
falten cosas"— no sirve de nada; tres nombres concretos sí.

Adivinar los ingredientes de "yogur con nueces" **con la IA** se descarta: sería
pedirle que invente una receta para cada comida suelta, con su cupo y su espera,
para una lista de la compra. El usuario lo hace mejor y gratis.


## 6. Comportamiento detallado

### Dónde

Dentro de **Comidas → Despensa**, en su propio bloque, **encima** de la lista de
ingredientes: cuando entras ahí pensando en comprar, lo primero que quieres ver
es qué falta.

No se hace sub-pestaña propia por dos motivos: Comidas ya tiene cuatro y en móvil
una quinta aprieta, y en escritorio la rejilla de tres columnas está colocada a
mano para cuatro (spec 072). Y sobre todo, es el mismo asunto: qué hay en casa y
qué hace falta.

### Qué sale

Dos cosas en una sola lista:

- **Lo que falta de la dieta**: cada ingrediente de las recetas enlazadas a tu
  dieta activa, que no esté marcado en tu despensa. Se calcula **al vuelo**, sin
  guardar nada: es la despensa cruzada con las recetas, igual que la spec 059.
- **Lo que has apuntado a mano**, que sí se guarda.

Los repetidos se juntan con la misma regla de la spec 072 —igualdad y plural—,
así que "tomate" y "tomates" salen una vez.

### Marcar como comprado

- Un **ingrediente**: se marca en la despensa (`tengo: true`). Desaparece de la
  lista, y las recetas pasan a enseñarlo con su ✓. Comprar algo es tenerlo.
- Un **apunte a mano**: se borra. No tiene sentido guardar el papel higiénico
  para siempre.

Los dos desaparecen de la lista, que es lo que el usuario espera; lo que cambia
por debajo es dónde va a parar cada uno.

### Apuntar a mano

Un campo y un botón, como en la despensa. Máximo 60 caracteres, sin repetidos y
hasta 50 apuntes. También se puede **borrar** uno sin marcarlo como comprado.

## 7. Modelo de datos

Colección nueva `usuarios/{uid}/compra/{apunteId}`, **solo para los apuntes a
mano**:

| Campo | Tipo | Qué es |
|---|---|---|
| `texto` | string | Qué hay que comprar. 1-60 caracteres. |
| `creadoEn` | timestamp | Para ordenarlos. |

**Lo que falta de la dieta NO se guarda.** Es una vista derivada de la despensa y
las recetas, como el cruce de la 059: guardarla obligaría a mantenerla al día
cada vez que cambia la dieta, la despensa o una receta, y a resolver qué pasa
cuando se contradicen.

### Por qué los apuntes NO van a la despensa

Fue lo primero que se pensó, y está mal. La despensa se le manda a la IA al pedir
dieta (`loQueTengo()`, spec 059): **el papel higiénico acabaría en el prompt como
un ingrediente que tienes en casa**. Colección aparte, y el problema no existe.

`compra` vive **fuera de las operaciones**, como la despensa: la lista de la
compra no es el diario de una etapa.

Necesita **casilla propia** en Reiniciar datos, por lo mismo que el agua en la
061 y las bebidas en la 062: `borrarOperacion()` nunca toca las colecciones de
primer nivel, así que sin casilla se quedaría huérfana.

## 8. Casos límite

- **Sin dieta activa**: solo salen los apuntes a mano, y se dice.
- **Dieta sin recetas enlazadas**: la lista solo tiene apuntes, y el aviso de que
  solo sabe lo que dicen las recetas cobra todo su sentido.
- **Receta borrada del recetario**: sus ingredientes dejan de salir. Correcto: ya
  no vas a cocinarla.
- **Un apunte a mano que coincide con un ingrediente que falta**: sale una vez,
  como apunte. Al marcarlo, se borra el apunte **y** se marca el ingrediente si
  existe en la despensa.
- **Todo comprado**: se dice, no se enseña una lista vacía.
- **Sin conexión al marcar**: revierte y sale el error, como en toda la despensa.

## 9. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/compra.js` | **Nuevo.** Los apuntes: validar, listar, guardar, borrar. |
| `js/despensa.js` | `loQueFalta()`: los ingredientes de unas recetas que no tienes. |
| `index.html` | El bloque de la compra dentro de Despensa. |
| `js/app.js` | Pintado, alta, marcado y borrado. |
| `firestore.rules` | Bloque de `compra`. **Publicar con la CLI antes de probar.** |
| `js/reinicio.js` | Casilla "lista de la compra". **Obligatoria**, ver apartado 7. |
| `styles.css` | La lista y su estado vacío. |

Estimación: **250-320 líneas**. Va justa al tope de las 300 de `CLAUDE.md`, y con
el precedente de la 058 —que estimó 250-300 y salió en 408— hay que mirarla con
desconfianza. **Si al implementar se pasa de 320, parar y avisar.**

**Salió en 303**, contando código, HTML, CSS y reglas. Dentro de lo estimado,
por primera vez en varias specs. El motivo es que casi todo estaba ya hecho: el
cruce de la 059, la limpieza de la 068, el emparejado de la 072 y las filas de la
despensa de la 058 se reutilizan tal cual.

## 10. Decisiones tomadas

- **Vive dentro de Despensa** (usuario, 30 de agosto): es el mismo asunto, y no
  obliga a tocar la navegación ni la rejilla de escritorio.
- **Lo que falta, y poder apuntar a mano** (usuario).
- **Marcar comprado marca en la despensa** (usuario): comprar algo es tenerlo.
- **Los apuntes a mano NO van a la despensa** (Claude, al escribir la spec):
  acabarían en el prompt de la dieta como ingredientes que tienes en casa. Las
  dos respuestas del usuario chocaban aquí y se resuelve con una colección
  aparte.
- **La lista dice lo que no sabe, y POR SU NOMBRE** (usuario, 30 de agosto).
  Él mismo señaló que puede crear recetas y enlazarlas a las comidas que no
  la tienen, así que la limitación no es un techo: es algo que él puede
  cerrar. Un aviso genérico no serviría; una lista de nombres concretos sí.

## 11. Fuera de spec: ideas apuntadas

- Cantidades en la lista.
- Un botón en el aviso que lleve directo a crear la receta de esa comida.

## ✅ Para probar a mano

(Lo afina el agente `qa-manual` antes de la prueba.)
