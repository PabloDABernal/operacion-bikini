# 068 — La despensa se llena sola, y deja de mentir

- **Estado:** implementada y desplegada el 29 de agosto de 2026. **Pendiente de que el usuario la pruebe**.
- **Fecha:** 2026-08-29
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v8)", ampliación del 29 de agosto.

## 1. Objetivo

Que la despensa deje de afirmar que tienes cosas que no tienes, y que se rellene
sola con los ingredientes de las recetas que se guardan.

## 2. Por qué existe

El usuario, el 29 de agosto: *"realmente solo tengo sal, así que no debería salir
como que lo tengo. Luego, si me carga una receta, debería ponerme los
ingredientes en la despensa"*.

**El cruce no tenía la culpa.** Se comprobó con su caso: con solo `sal` marcada,
ninguna línea de sus recetas se marca — ni "salsa de tomate", ni "salmón", ni
"ensalada de pollo". La regla de la spec 059 funciona.

La culpa era de la **spec 058**, que creaba **marcado** todo ingrediente nuevo,
con el argumento de que "lo escribes cuando lo compras". Al usarlo resultó falso:
la lista se escribe de golpe, y entonces la despensa afirma tener lo que solo es
"con esto cocino".

## 3. Criterio de "esto funciona"

1. Un ingrediente nuevo aparece **sin marcar**.
2. Escribir uno que ya existe **no lo marca**: solo avisa de que ya está.
3. Al pedir una dieta a la IA, los ingredientes de sus recetas nuevas **aparecen
   en la despensa, sin marcar**.
4. Al guardar una receta a mano, lo mismo.
5. Lo que entra desde una receta viene **limpio**: "200 g de lentejas" se guarda
   como "lentejas", "2 dientes de ajo" como "ajo".
6. **"aceite de oliva" se guarda entero**, no como "aceite".
7. Lo que ya estaba en la despensa **no se duplica ni cambia de marca**.
8. Pedir dos veces la misma receta no mete nada la segunda vez.
9. Si la despensa falla, **la receta y la dieta se guardan igual**.

## 4. Alcance

### Entra

- Los ingredientes nuevos nacen sin marcar (revierte una decisión de la 058).
- Escribir un duplicado deja de marcarlo.
- Las recetas guardadas rellenan la despensa, sin marcar.
- Limpiar cantidades y unidades al pasar de línea de receta a ingrediente.

### NO entra (explícitamente fuera)

- **Quitar de la despensa lo que ya no uses.** Entra solo, se borra a mano.
- **Un botón "añadir lo que falta"** dentro de una receta. Se apunta como idea:
  esto solo cubre las recetas que se guarden a partir de ahora, no las que ya
  tienes.
- **Agrupar la despensa por tipo.** Se descartó en favor del buscador, que es la
  spec 069.
- **Tocar el cruce de la spec 059.** Funciona; se verificó con el caso real.

## 5. Comportamiento detallado

### De línea de receta a ingrediente

`ingredienteDeLinea()` en `js/despensa.js`. Es una heurística, y está escrita
para **equivocarse del lado seguro: ante la duda, deja la línea entera**. Un
ingrediente con la cantidad pegada es feo pero se entiende y se puede editar;
uno recortado de más ("aceite" en vez de "aceite de oliva") es información
perdida y el usuario no tiene forma de saber que pasó.

Qué quita, en este orden:

1. Lo que va entre paréntesis: "perejil (opcional)" → "perejil".
2. Coletillas del final: "al gusto", "opcional", "para decorar".
3. El número de delante, con fracciones y rangos: "1/2", "1,5", "2-3".
4. **Solo si venía justo detrás de un número**, la unidad: "200 **g** de
   lentejas". Y entonces también el "de" que la une al ingrediente.

**El "de" suelto NUNCA se toca**, y es la regla que sostiene todo lo demás: sin
ella, "aceite de oliva" quedaría en "aceite" y "leche de avena" en "leche". Por
eso el "de" solo se quita después de haber quitado una unidad.

Los casos están en `docs/specs/068-limpieza-casos.mjs`, ejecutables con
`node docs/specs/068-limpieza-casos.mjs`, y ejecutan el módulo de verdad.

### Cuándo se rellena

Al **guardar una receta**, por los dos caminos: las que crea la IA al pedir una
dieta, y las que escribe el usuario a mano.

Va en `js/app.js` y no dentro de `guardarRecetasPropuestas()`, para no meterle
la despensa a `js/dietas.js`, que no tiene por qué saber que existe.

**Nunca puede tumbar lo que la llamó.** Si la despensa falla, la receta y la
dieta ya están guardadas, que es lo que importa: se avisa por consola y se sigue.

## 6. Modelo de datos

Ningún campo nuevo. Lo único que cambia es el valor con el que nace `tengo`:
`false` en vez de `true`.

**Los ingredientes que ya existan marcados se quedan como están.** No se migra
nada: el usuario los desmarca cuando quiera, y esa es justo la acción que la spec
le está devolviendo.

## 7. Casos límite

- **Receta sin ingredientes**: no entra nada, no revienta.
- **Dos recetas con el mismo ingrediente** en la misma dieta: entra una vez. La
  despensa se relee entre recetas.
- **Ingrediente más largo que 60 caracteres**: se recorta al máximo del campo.
- **La misma dieta pedida dos veces**: la segunda no mete nada nuevo.
- **"1 tomate" y "2 tomates" en la misma receta**: entran los dos, como "tomate"
  y "tomates". Aceptado: singularizar en español es más peligroso que un
  duplicado, y el usuario borra uno.

## 8. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/despensa.js` | `ingredienteDeLinea()`, `ingredientesNuevosDe()`, `guardarIngredientesDeReceta()`, y `tengo: false` al crear. |
| `js/app.js` | `llenarDespensaDesde()` y sus dos llamadas; el duplicado deja de marcar. |
| `docs/specs/068-limpieza-casos.mjs` | Los casos de la limpieza. |

No toca reglas, ni `api/`, ni el modelo de datos.

## 9. Decisiones tomadas

- **Los ingredientes nacen sin marcar** (usuario, 29 de agosto), revirtiendo la
  058. La lista pasa a ser "con esto cocino" y la casilla, "y ahora mismo lo
  tengo". Escribir no afirma nada sobre la nevera.
- **Se rellena al guardarse una receta**, no con un botón (usuario, misma
  conversación): es un momento claro, ocurre una vez por receta y no sorprende.
- **La limpieza se equivoca del lado seguro** (Claude): ante la duda, la línea
  entera.

## 10. Fuera de spec: ideas apuntadas

- Un botón "añadir lo que falta a mi despensa" dentro de una receta, para las
  recetas ya guardadas antes de esta spec.

## ✅ Para probar a mano

(Lo afina el agente `qa-manual` antes de la prueba.)
