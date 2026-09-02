# 096 — Comprado todo: marcar la lista entera de una vez

- **Estado:** 🚧 implementada y desplegada el 2 de septiembre de 2026, revisada por `revisor-specs` (sin bloqueantes) y `revisor-codigo` (CUMPLE). **Pendiente de que el usuario la pruebe.**
- **Fecha:** 2026-09-02
- **Referencia en PRODUCTO.md:** apartado "Qué hará (evolutivos de la fase productiva…)", el evolutivo de "ya lo he comprado todo".

## 1. Objetivo

Que al volver del súper se pueda marcar **toda la lista de la compra de una
vez**, en lugar de cosa por cosa.

## 2. Por qué existe

Lo pidió el usuario el 2 de septiembre, usando la app: *"para ingredientes igual
podríamos poner un marcar todos… En plan: ¡Comprado! y que se marquen los que
faltaban"*.

Hoy la lista se marca **de uno en uno** (spec 073). Con veinte cosas eso son
veinte toques, y encima cada uno escribe en Firestore por separado. Pero lo que
pasa de verdad al volver de comprar no es marcar veinte cosas: es **haber
comprado todo**.

## 3. Criterio de "esto funciona"

1. En **Comidas → Recetario → Lista de la compra** hay un botón **"¡Comprado
   todo!"**, arriba de la lista.
2. Al pulsarlo, **todo lo que hay en la lista** pasa a estar marcado en tu
   despensa, y la lista **se queda vacía**.
3. Lo que **no estaba** en tu despensa se **crea y nace marcado** — igual que ya
   hace marcar uno solo (spec 073).
4. Los **apuntes a mano** (el papel higiénico) **se borran**, que es lo que ya
   hace marcarlos de uno en uno.
5. **Pregunta antes**, diciendo cuántas cosas va a marcar.
6. Al terminar, **dice qué ha hecho**.
7. Con la lista **vacía**, el botón **no sale**.
8. Marcar **una sola cosa** sigue funcionando exactamente igual.
9. Si falla a mitad, lo dice, y **lo ya marcado se queda marcado**: volver a
   pulsarlo termina lo que falte.
10. La despensa, el cruce con las recetas y el botón "Ver lista de la compra"
    quedan al día sin recargar.

## 4. Alcance

### Entra

- El botón, con su confirmación y su resumen.
- Marcar y crear en lote, y borrar los apuntes a mano.
- Suite de casos del reparto (qué se marca, qué se crea, qué se borra).

### NO entra (explícitamente fuera)

- **Deshacer.** No hay "descomprar". Si te pasas, se desmarca a mano en la
  despensa, que es donde se hace siempre.
- **Marcar solo una parte.** Es "todo" o de uno en uno; un modo de selección
  múltiple es otra pantalla y no lo ha pedido nadie.
- **Cambiar cómo se calcula la lista** (specs 059, 068, 073). Se marca lo que la
  lista diga en ese momento.
- **Tocar la lista de material** de Ejercicio (spec 078). Allí no hay "comprar
  todo" porque no se compra un banco cada semana.
- **Cantidades.** La despensa no las lleva (spec 058).

## 5. Comportamiento detallado

### El botón

Va **arriba de la lista**, no al final: si estás en el súper y lo tienes debajo
de veinte cosas, no lo encuentras.

```
Lista de la compra
[ ¡Comprado todo! ]

  🛒 Huevos
  🛒 Atún
  🛒 Papel higiénico
```

**Solo se pinta si hay algo en la lista.** Con la lista vacía no hay nada que
marcar y un botón que no hace nada es peor que ninguno.

### La confirmación

Se pregunta, con el número por delante:

> ¿Marcar las 14 cosas de la lista como compradas?

Se pregunta porque **no se deshace** y porque toca muchas cosas a la vez. Es lo
mismo que hace la app antes de sustituir una dieta o una tabla.

### Qué hace con cada cosa

Lo mismo que `marcarComprado()` hace con una, en lote:

| Qué es | Qué se hace |
|---|---|
| Está en tu despensa, sin marcar | Se **marca** |
| Está en una receta pero no en tu despensa | Se **crea y nace marcado** — es la única alta que nace marcada desde la 068, y aquí es verdad que lo tienes |
| Es un apunte a mano (spec 073) | Se **borra** de los apuntes — y si su nombre coincide con algo de tu despensa, ese algo **se marca** |

> ### El apunte a mano que ya tienes en la despensa
>
> Hoy, marcar un apunte a mano **solo lo borra**: nunca marca el ingrediente que
> le corresponde, aunque exista. Así que si apuntas "huevos" a mano y ya tienes
> "Huevos" en tu despensa, se borra el apunte y el ingrediente se queda sin
> marcar — o peor, se crea uno repetido.
>
> Es un fallo que **ya está en la spec 073**, no lo trae esta. Pero la 096 lo
> haría **catorce veces de golpe**, y el usuario ha pedido expresamente que no
> haya ingredientes duplicados. Así que se arregla aquí: un apunte se cruza con
> la despensa por `mismoIngrediente()` (spec 072) y, si está, se **marca el que
> hay** en vez de crear otro.
>
> Lo destapó `revisor-specs`.

El reparto se decide **antes de escribir nada**, en una función pura, y luego se
escribe por lotes con `writeBatch`, como la siembra (075) y la reparación (090).

> ### Cómo se escribe de verdad: NO se reutilizan `guardarIngrediente()` ni `marcarIngrediente()`
>
> Las dos hacen **una escritura suelta cada una**, y además `guardarIngrediente()`
> crea siempre con `tengo: false`, así que crear-y-marcar serían **dos** viajes
> por ingrediente. Llamarlas dentro de un lote no es un lote de verdad.
>
> Se hace como en las specs 090 y 092: **el id se genera por adelantado** con
> `doc(collection(db, "usuarios", uid, "despensa")).id` y se escribe directamente
> con `lote.set(..., { tengo: true, ... })`.
>
> **La generación de ids vive FUERA de la función pura**, en la que escribe. Es
> lo que permite probar el reparto entero sin tocar la red, igual que en
> `js/siembra.js` y `js/normalizacion.js`. `repartoDeLaCompra()` no importa nada
> de Firestore.

### Cómo se escribe

Tres pasos, en este orden:

1. Los ingredientes que hay que **crear**, ya marcados.
2. Los que hay que **marcar**, que ya existían.
3. Los apuntes a mano que hay que **borrar**.

Los apuntes **al final**, por lo mismo que la 090 borra al final: si se corta a
mitad, lo peor que pasa es que quede un apunte de más —que se ve y se vuelve a
pulsar—, y no que desaparezca sin haberse marcado nada.

**Volver a pulsarlo es inofensivo**: lo ya marcado no sale en la lista, así que
la segunda pasada solo termina lo que faltara.

### Al terminar

> Marcadas 14 cosas. 3 eran nuevas y han entrado en tu despensa.

Sin el "3 eran nuevas" si no hubo ninguna. La lista se repinta y se queda vacía,
y con ella el recuento del botón "Ver lista de la compra".

## 6. Modelo de datos

**Nada nuevo.** Se escribe en `despensa` y se borra de `compra`, las dos con la
forma que ya tienen.

`firestore.rules`: **sin cambios**. `js/reinicio.js`: **sin cambios**.

## 7. Casos límite

- **Lista vacía**: no hay botón.
- **Solo apuntes a mano**: se borran todos y no se crea nada. El resumen lo dice.
- **Dos cosas de la lista que son el mismo ingrediente**: no puede pasar,
  `loQueFalta()` ya las une (spec 073).
- **Un ingrediente que se borró de la despensa mientras mirabas la lista**: se
  crea, como si nunca hubiera estado.
- **Un apunte a mano que ya está en tu despensa**: se borra el apunte y se marca
  el ingrediente que ya tenías. No se crea uno repetido. Ver arriba.
- **Un apunte a mano en singular y el ingrediente en plural** ("huevo" contra
  "Huevos"): cuentan como el mismo, por `mismoIngrediente()` (spec 072).
- **Cancelar la confirmación**: no se toca nada.
- **Sin conexión**: lo escrito antes del corte se queda, se dice, y volver a
  pulsarlo termina.
- **Pulsarlo dos veces seguidas**: el botón se desactiva mientras trabaja.
- **Más de 400 cosas**: se escribe por lotes, como la siembra. No va a pasar,
  pero no se rompe.

## 8. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| **Arriba de la lista** | En el súper, debajo de veinte cosas no se encuentra. |
| **Se pregunta antes** | No se deshace y toca muchas cosas de una vez. |
| **Lo nuevo nace marcado** | Es lo que ya hace marcar uno (spec 073): acabas de comprarlo. |
| **Los apuntes se borran** | Es lo que ya hace marcarlos de uno en uno. |
| **Los apuntes, al final** | Si se corta, mejor que sobre un apunte a que desaparezca sin marcarse nada. Misma razón que el borrado de la 090. |
| **Sin deshacer** | Se desmarca en la despensa, que es donde se desmarca siempre. |
| **Sin selección múltiple** | Es "todo" o de uno en uno. Un modo de selección es otra pantalla. |
| **Nada en la lista de material** (078) | No se compra un banco cada semana. |
| **Un apunte que ya está en la despensa marca el que hay** | Arregla de paso un fallo de la 073 que en lote crearía duplicados, y el usuario ha pedido expresamente que no los haya. |
| **Ids por adelantado, y fuera de la función pura** | Es lo que hace que el reparto se pueda probar entero sin red. Mismo patrón que las specs 090 y 092. |

## 9. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/compra.js` | `repartoDeLaCompra(lista, despensa)`: qué crear, qué marcar y qué borrar. **Cálculo puro**, sin Firestore. |
| `js/compra.js` (escritura) | `comprarTodo(uid, reparto)`, por lotes, con los ids generados ahí. |
| `index.html` | El botón, arriba de la lista. |
| `js/app.js` | Pintarlo solo si hay lista, la confirmación y el resumen. |
| `docs/specs/096-comprado-todo-casos.mjs` | **Nuevo.** Casos del reparto. |

Estimación: **entre 160 y 210 líneas**. La primera cuenta decía 120-160 y
`revisor-specs` avisó de que se quedaba corta: `js/compra.js` no tiene hoy nada
de `writeBatch` —eso vive en la siembra, la normalización y el reinicio—, y el
cruce de los apuntes con la despensa también suma. **Si al implementarlo se pasa
de 300, se para y se avisa.**

## 10. Fuera de spec: ideas apuntadas

- Deshacer lo último comprado.
- Marcar solo lo de una receta.
- Que la lista se pueda compartir o imprimir para llevarla al súper.

## ✅ Para probar a mano

1. Ten cosas en la lista, con **las tres clases**: alguna que esté en tu despensa
   sin marcar, alguna que no esté, y **un apunte a mano**.
2. Pulsa **"¡Comprado todo!"** → tiene que decir cuántas son y preguntar.
3. Acepta → la lista se queda **vacía** y el resumen dice cuántas y cuántas
   nuevas.
4. **Mira la despensa**: todas marcadas, y las nuevas creadas.
5. **Comprueba que los apuntes a mano se han ido.**
6. **La regresión**: vuelve a poner algo en la lista y márcalo **de uno en uno**,
   como siempre. Tiene que seguir funcionando igual.
