# 088 — Una comida, varias recetas

- **Estado:** 📝 escrita el 1 de septiembre de 2026, revisada por `revisor-specs` (dos bloqueantes cerrados). **Pendiente de implementar.**
- **Fecha:** 2026-09-01
- **Referencia en PRODUCTO.md:** apartado "Qué hará (evolutivos de la fase productiva, desde el 31 de agosto de 2026)", el evolutivo de la comida con varias recetas.

## 1. Objetivo

Que una comida del día pueda llevar **todas las recetas que tenga**, no una
sola: que las enseñe todas, y que todas cuenten para la lista de la compra.

## 2. Por qué existe

Salió usando la app. La cena **"Ensalada de repollo y manzana. Tortilla de 2
huevos"** enseña solo la ensalada, porque la comida guarda **un** `recetaId`
desde la spec 028 y `semanaDesdeMenu()` (spec 076) enlaza la receta más larga
que quepa en el texto y para.

Lo que se ve en pantalla es lo de menos. **El punto ciego es la lista de la
compra**: los huevos de la tortilla no salen, y el aviso *"ojo, estas comidas no
tienen receta y no sé qué llevan"* **se calla**, porque esa comida sí tiene una.
Falta comida en la lista y nada lo dice.

La 076 vio el caso —dejó escrito que los platos de la nutricionista son *"una
frase entera con cantidades y a veces dos cosas"*— y lo aceptó. Al usarlo, no
se sostiene.

## 3. Criterio de "esto funciona"

1. Una comida con **dos recetas enlazadas** las enseña **las dos**, una tarjeta
   debajo de otra, cada una con su **Editar**.
2. Los ingredientes de **las dos** cuentan para la **lista de la compra**.
3. Al **editar** una comida del día, elegir una receta del desplegable **suma**:
   engancha su nombre al texto y aparece su **chip** debajo.
4. Eliges una segunda: se suma también, y el texto queda con las dos.
5. Tocas la **×** de un chip: esa receta se suelta. El **texto no se toca** — lo
   escrito es tuyo.
6. El texto se puede seguir **escribiendo a mano**, con recetas enlazadas o sin
   ellas.
7. **Elegir un menú** (spec 076) enlaza **todas** las recetas que reconozca en
   cada plato, no solo la primera.
8. **Las dietas de antes de esta spec se siguen viendo igual**, con su única
   receta, **sin migrar nada** en Firestore.
9. Una comida **sin ninguna receta** se comporta exactamente como hoy, y sigue
   saliendo en el aviso de la lista de la compra.
10. Una receta **borrada del recetario** que siga enlazada no rompe el día: se
    dice, como hoy.
11. **Apuntar una comida** (Comidas → Apuntar), el recetario, la despensa y la
    lista de la compra siguen funcionando igual.

## 4. Alcance

### Entra

- `recetaId` (texto) pasa a leerse como **lista de recetas** por comida.
- El día pinta **una tarjeta por receta** enlazada.
- El editor de la celda: el desplegable **suma** en vez de sustituir, y chips
  con × para soltar.
- `semanaDesdeMenu()` enlaza **todas** las recetas que reconozca.
- `recetasDeLaDieta()` y `comidasSinReceta()`, sobre la lista.
- Suite de casos.

### NO entra (explícitamente fuera)

- **Migrar Firestore.** Las dietas guardadas se leen tal cual. Ver el apartado 6.
- **Cambiar el aviso de la lista de la compra.** Sigue saltando solo cuando la
  comida no tiene **ninguna** receta. Decisión del usuario el 1 de septiembre:
  adivinar si un texto largo esconde un tercer plato sin enlazar daría falsos
  avisos en frases como *"Arroz con verduras. Al gusto"*, y un aviso que se
  equivoca a menudo deja de leerse.
- **Recomponer el texto solo** al soltar una receta. El texto es del usuario:
  quitar el enlace no le borra lo que escribió.
- **Varias recetas en una comida apuntada** (Comidas → Apuntar, specs 084 y
  082). Eso es el diario, no el plan. Aquí se toca **la dieta**.
- **Que la IA devuelva varias recetas por comida.** El proxy y su esquema no se
  tocan; `semanaDesdeLaIa()` sigue enlazando por nombre exacto como hoy.
- **Cantidades ni raciones por plato.** Una comida con dos recetas son dos
  recetas, cada una con sus raciones, como están.

## 5. Comportamiento detallado

### El día: una tarjeta por receta

`recetaDeLaComida()` pasa a ser **`recetasDeLaComida()`** y devuelve una lista.
`recetaDesplegada()` pinta **una caja por receta**, cada una con su cabecera
(`nombre · para N`), su cuerpo y su botón **Editar**, que sigue llevando al
editor del recetario como en la spec 083.

Las recetas **borradas del recetario se saltan**, no ocupan una tarjeta vacía.
Si estaban todas borradas, se dice *"Esta receta ya no existe."* como hoy: la
frase solo aparece cuando **no queda ninguna** que enseñar.

El nombre del plato se vuelve tocable si **hay al menos una** receta viva, igual
que hoy con una.

**`filaDeComida()` es el otro lector, y hay que tocarlo.** Hoy llama a
`recetaDeLaComida()` para decidir si pinta el icono "Ver la receta" en su
columna fija (spec 072). Pasa a preguntar si la lista **tiene algo**:
`recetasDeLaComida(comida).length > 0`. El icono sigue siendo **uno**, y abre la
fila con todas las tarjetas dentro; no hay un icono por receta. Lo encontró
`revisor-specs`: sin esto el icono se pintaría siempre, porque una lista vacía
es un objeto y es *truthy*.

### El editor de la celda

Hoy el desplegable **sustituye** el texto por el nombre de la receta. Pasa a
**sumar**:

```
Cena  [Ensalada de repollo y manzana. Tortilla de 2 huevos ]
      [ añadir una receta tuya…                          ▾ ]

      ⬤ Ensalada de repollo y manzana  ×
      ⬤ Tortilla de 2 huevos           ×

      [Guardar]  [Cancelar]
```

- **Elegir una receta**: se añade a la lista y su nombre se engancha al final
  del texto. Si el texto estaba vacío, queda solo el nombre; si no, se une con
  **`". "`** — que es como vienen escritos los platos de la nutricionista.
- El desplegable **vuelve a su opción vacía** después de cada elección, para
  poder elegir otra.
- Una receta **ya enlazada no se ofrece** en el desplegable: enlazar dos veces
  la misma no significa nada.
- **La ×** suelta la receta y quita su chip. **El texto se queda como está**: lo
  escrito es del usuario, y borrarle media frase por soltar un enlace sería
  peor que dejarle una línea de más que puede editar.
- El texto se sigue pudiendo escribir a mano en cualquier momento.

### Elegir un menú

`semanaDesdeMenu()` deja de usar `.find()` y **recoge todas** las recetas cuyo
nombre quepa en el texto del plato, con las mismas dos cautelas de la 076, que
no cambian:

- de la **más larga a la más corta**,
- descartando nombres de **menos de 8 letras**, que acertarían dentro de
  cualquier frase.

Y una nueva, que es la que hace falta al coger varias: **una receta no se enlaza
si sus palabras ya se las llevó otra**. Sin eso, "Ensalada de repollo" y
"Ensalada de repollo y manzana" se enlazarían las dos sobre las mismas palabras.

**El algoritmo, dicho sin margen** —`revisor-specs` avisó de que "cae dentro"
admitía dos lecturas y podían divergir:

Se trabaja sobre `clave(texto)`, el texto del plato ya normalizado. Se lleva una
lista de **tramos ocupados** `[inicio, fin)`. Para cada receta candidata, de la
más larga a la más corta:

1. Se busca su clave con `indexOf` dentro de `clave(texto)`. Si no está, se
   descarta.
2. Si el tramo que ocuparía **se solapa** con alguno ya ocupado, se descarta.
3. Si no, se enlaza y su tramo se apunta como ocupado.

Es **posiciones reales, no "un nombre dentro de otro"**. Las dos lecturas dan lo
mismo en el ejemplo de arriba, pero solo esta acierta cuando dos recetas de
nombre distinto se pisan en el texto sin que una contenga a la otra.

### La lista de la compra

`recetasDeLaDieta()` recorre la lista de cada comida en vez de un solo campo.
`comidasSinReceta()` avisa cuando la lista está **vacía**, que es exactamente lo
que hace hoy cuando `recetaId` está vacío.

## 6. Modelo de datos

`usuarios/{uid}/dietas`, dentro de `dias[].comidas[]`:

| Campo | Tipo | Qué |
|---|---|---|
| `recetaId` | texto | **Se deja de escribir.** Se sigue LEYENDO, para las dietas guardadas. |
| `recetaIds` | lista de textos | Las recetas de la comida. Vacía si no hay ninguna. |

**No se migra nada.** Una función `idsDeRecetaDe(comida)` en `js/dietas.js`
resuelve las dos formas:

```js
// Devuelve siempre una lista, venga la comida como venga.
export function idsDeRecetaDe(comida) {
  if (Array.isArray(comida?.recetaIds)) return comida.recetaIds.filter(Boolean);
  return comida?.recetaId ? [comida.recetaId] : [];
}
```

Todo lo que hoy lee `comida.recetaId` pasa por ahí. Una dieta vieja se lee sin
tocarla; en cuanto se **guarda** una celda, esa dieta pasa a escribir
`recetaIds` (y `recetaId` a `""`, para que no queden dos verdades).

> **Por qué campo nuevo y no reutilizar `recetaId` como lista.** Un campo con dos
> tipos posibles es justo lo que se rechazó esta misma tarde en la spec 077 con
> el material del ejercicio, y por el mismo motivo: obliga a que todo lector
> compruebe el tipo, para siempre. Aquí el campo viejo se queda quieto y muerto,
> y hay un único sitio que sabe de los dos.

`firestore.rules`: **sin cambios**. `js/reinicio.js`: **sin cambios**.

## 7. Casos límite

- **Dieta de antes de esta spec**: `idsDeRecetaDe()` devuelve su única receta.
  Se ve igual que siempre.
- **Comida sin ninguna receta**: lista vacía, sin tarjeta, y sale en el aviso de
  la compra. Como hoy.
- **Una de las dos recetas borrada del recetario**: se pinta la que queda. El
  nombre del plato sigue siendo tocable.
- **Las dos borradas**: *"Esta receta ya no existe."*, como hoy.
- **La misma receta elegida dos veces**: no se puede, no se ofrece en el
  desplegable.
- **Soltar la última receta**: la comida se queda como texto suelto, y vuelve a
  salir en el aviso de la compra. Correcto.
- **Texto vacío y una receta elegida**: el texto queda con el nombre de la
  receta, igual que hoy.
- **Guardar sin conexión**: el error de siempre, y la semana en pantalla sigue
  siendo la que hay guardada. No cambia.
- **Un plato del menú donde encajan dos recetas solapadas** ("Ensalada de
  repollo" dentro de "Ensalada de repollo y manzana"): se enlaza **la larga**, y
  la corta se descarta por caer dentro de lo ya cogido.
- **Elegir un menú dos veces**: se vuelve a escribir igual, como en la 076.
- **La suite `075-siembra-casos.mjs` se rompe si no se toca.** Comprueba
  `c.recetaId === ""` en el domingo vacío, cuenta los enlazados con
  `filter((c) => c.recetaId)` contra un umbral de 40, y busca un plato con texto
  y sin receta. Las tres pasan a leer `recetaIds`. **El umbral de 40 se
  mantiene**: con varias recetas por plato solo puede subir, así que sigue
  cazando el día que alguien vuelva a la comparación estricta. Lo encontró
  `revisor-specs`.
- **Editar una celda vieja sin tocar el desplegable**, solo el texto: el editor
  abre con `idsDeRecetaDe(comida)`, así que al guardar escribe `recetaIds` con
  la receta que ya tenía. Se migra sola, sin que el usuario haga nada raro.
- **Editar una celda y dejarla sin ninguna receta**: se guarda `recetaIds: []` y
  `recetaId: ""`. La comida vuelve a ser texto suelto, y vuelve al aviso de la
  compra.
- **Una dieta guardada a medias** (unas comidas con `recetaId` y otras con
  `recetaIds`, por haber editado solo una celda): cada comida se lee por su
  cuenta. No hay estado inconsistente posible.

## 8. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| **El desplegable suma, y hay chips con ×** | Decisión del usuario el 1 de septiembre. Sin una forma de soltar una sola, una comida se queda con enlaces invisibles que solo se sueltan empezando de cero. |
| **Soltar una receta NO toca el texto** | Lo escrito es del usuario. Borrarle media frase por soltar un enlace es peor que dejarle una línea que puede editar. |
| **El aviso de la compra se queda como está** | Decisión del usuario. Adivinar platos escondidos en un texto daría falsos avisos, y un aviso que se equivoca deja de leerse. |
| **Campo nuevo `recetaIds`, no `recetaId` con dos tipos** | Lo mismo que se decidió hoy en la 077: un campo de dos tipos obliga a comprobar el tipo en todos los lectores, para siempre. |
| **Sin migración** | Una función que lee las dos formas cuesta seis líneas; una migración cuesta un script, una ventana de riesgo y una tarde. |
| **Al enlazar varias, no se solapan** | "Ensalada de repollo" dentro de "Ensalada de repollo y manzana" son la misma comida, no dos. |
| **Esto es la dieta, no el diario** | Apuntar una comida (084) sigue con su ingrediente o su receta única. Son dos pantallas y dos problemas. |

## 9. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/dietas.js` | `idsDeRecetaDe()`; `semanaEnBlanco()` y `semanaDesdeLaIa()` escriben `recetaIds`; `semanaDesdeMenu()` enlaza todas sin solapar. |
| `js/app.js` | `recetasDeLaComida()`, `recetaDesplegada()` con una tarjeta por receta, `filaEnEdicion()` con desplegable que suma y chips, `guardarCelda()` con la lista, `recetasDeLaDieta()` y `comidasSinReceta()`. |
| `styles.css` | Los chips de receta enlazada. |
| `docs/specs/088-varias-recetas-casos.mjs` | **Nuevo.** Casos de `idsDeRecetaDe()` y `semanaDesdeMenu()`. |
| `docs/specs/075-siembra-casos.mjs` | **Hay que actualizarlo.** Ejecuta `semanaDesdeMenu()` de verdad y comprueba `recetaId`; con la lista sus aserciones leerían `undefined` y el umbral de "enlaza bastantes platos" daría 0. |

Estimación: **entre 300 y 350 líneas**, que es **por encima** del límite de 300
que marca `CLAUDE.md`. `revisor-specs` lo calculó contando lo que la primera
estimación se dejaba: `filaDeComida()`, el no-solapamiento, y sobre todo el
editor, que pasa de un `<select>` suelto a un desplegable con estado, una lista
mutable de chips en memoria y el filtrado de las ya elegidas.

> **Se avisó al usuario y decidió hacerla entera**, el 1 de septiembre de 2026.
> Se le propuso partirla en dos desde el inicio —**088** el modelo y la lectura
> (que ya arregla el caso de la cena por sí sola, porque el menú enlaza las dos
> recetas solo), y **089** el editor con chips— y prefirió una sola rebanada.
> Queda escrito porque es la spec más grande del proyecto y va contra la regla 4
> de `CLAUDE.md`: si al probarla algo falla, hay más sitios donde mirar.

## 10. Fuera de spec: ideas apuntadas

- Que el aviso de la compra sepa detectar platos sin enlazar dentro de un texto.
- Varias recetas también al apuntar una comida en el diario.
- Que la IA devuelva los platos separados en vez de una frase con puntos.
- Reordenar las recetas de una comida.

## ✅ Para probar a mano

**El caso que motivó la spec, tal cual**: la cena **"Ensalada de repollo y
manzana. Tortilla de 2 huevos"** tiene que enseñar **las dos** tarjetas, y los
huevos de la tortilla tienen que aparecer en la lista de la compra si no los
tienes marcados en la despensa.

Guion completo: lo afina `qa-manual`. En corto, los once puntos del apartado 3,
con especial atención al **2** (que los ingredientes de las dos lleguen a la
lista de la compra, que es el motivo de la spec), al **5** (soltar un chip no
toca el texto) y al **8** y el **11**, que son las regresiones: las dietas de
antes y todo lo que rodea al recetario.
