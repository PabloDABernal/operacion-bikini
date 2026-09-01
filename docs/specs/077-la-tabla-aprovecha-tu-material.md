# 077 — La tabla aprovecha tu material

- **Estado:** 🚧 implementada y desplegada el 1 de septiembre de 2026, revisada por `revisor-specs` (un bloqueante de producto, cerrado por el usuario: PRODUCTO.md corregido) y `revisor-codigo` (CUMPLE, sin hallazgos). **Pendiente de que el usuario la pruebe.**
- **Fecha:** 2026-09-01
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v13: el material, decidida el 30 de agosto de 2026)", segundo y cuarto puntos.

## 1. Objetivo

Que el armario de la spec 074 **sirva para algo**: que al pedir tabla puedas
decirle a la IA que aproveche lo que tienes, y que al abrir un ejercicio del
catálogo veas **qué material te pide y cuál de él tienes**.

## 2. Por qué existe

La 074 dejó el armario lleno y **desconectado**. Hoy marcas "mancuernas" y no
pasa nada: la tabla se pide igual, y el catálogo sigue enseñando el material
como una frase suelta ("mancuernas, banco, esterilla") que no se cruza con
nada.

Es exactamente el paso que la spec **059** dio con la despensa: el armario ya
existe, ahora entra en la petición. Y como allí, el cruce necesita antes que el
material del ejercicio **deje de ser una frase y pase a ser una lista de
piezas**: no se puede decir "tienes 2 de 3" sobre un párrafo.

## 3. Criterio de "esto funciona"

1. En **Ejercicio → Pedir tabla** hay una casilla **"Aprovechar el material que
   tengo"**, con debajo cuántas piezas tienes marcadas.
2. Pides tabla con la casilla marcada: la tabla que sale se apoya en tu material
   (si tienes mancuernas y banco, salen ejercicios con mancuernas y banco).
3. Pides tabla **sin** marcarla: se pide exactamente como antes de esta spec, y
   el material no se le menciona a la IA.
4. **Si no tienes NINGUNA pieza marcada**, la casilla sale **desactivada** y
   debajo lo dice ("no tienes material marcado…"). No se puede marcar.
5. En el **Catálogo**, la cabecera de un ejercicio dice **"Tienes 2 de 3"**; al
   desplegarlo, su material sale **en piezas**, cada una con si la tienes o te
   falta.
6. Un ejercicio que **no necesita material** dice "Sin material", sin lista y
   sin recuento.
7. Los ejercicios **guardados antes de esta spec** (material como frase:
   `"mancuernas, banco"`) se ven partidos en piezas, **sin tocar Firestore**.
8. Marcas una pieza en tu armario, vuelves al catálogo y el "tienes/te falta"
   está al día.
9. La tabla que ya tenías guardada **se sigue viendo igual**. Esta spec no la
   toca.

## 4. Alcance

### Entra

- Casilla "Aprovechar el material que tengo" en el formulario de pedir tabla,
  con su recuento y su estado desactivado.
- El material marcado, dentro del mensaje que se le manda a `api/tabla.js`.
- El material del ejercicio del catálogo, **leído como lista de piezas**.
- El cruce pieza a pieza contra el armario, y el "Tienes N de M".
- Suite de casos para el partido en piezas y para el cruce.

### NO entra (explícitamente fuera)

- **La lista del material que te falta.** Es la spec 078.
- **Cantidades.** "Mancuernas", no "dos de 8 kg". Lo decidió la 074 y no cambia.
- **Limitar a la IA a tu material.** Es una preferencia, no una jaula: mismo
  criterio literal que la 059 con la despensa.
- **Cambiar cómo se guarda el material del ejercicio en Firestore.** El campo
  `material` sigue siendo el string que es. Se parte **al leerlo**.
- **Tocar la despensa.** Son dos armarios distintos y siguen sin mezclarse.
- **Que las comidas o la dieta sepan del material.** No.
- **Marcar una pieza desde el catálogo.** Ver un "te falta" no te deja
  arreglarlo ahí; eso es la 078, y allí se decidió que se marca desde su lista.

## 5. Comportamiento detallado

### La casilla, al pedir tabla

Va donde la de la dieta, con el mismo aspecto (`casilla-linea` + un
`registro-detalle` debajo):

```
[ ] Aprovechar el material que tengo
    3 cosas marcadas
```

**Con el armario sin nada marcado, la casilla se desactiva y se explica**:

```
[ ] Aprovechar el material que tengo     ← disabled
    No tienes material marcado. Márcalo en Mi material.
```

> **Esto se aparta a propósito de la spec 059**, que con la despensa vacía
> **esconde el bloque entero**. Aquí se enseña desactivado, que es lo que hizo
> la **084** con el botón "Elegir de mi despensa". Decisión del usuario el 1 de
> septiembre: el armario es una pantalla que mucha gente no descubre, y una
> casilla gris que dice dónde está enseña que la función existe. Esconderla
> haría que no se descubriera nunca.

Se **desmarca sola al abrir el formulario**, igual que la de la dieta: cada
petición se decide entera, no se hereda de la anterior.

`generarTabla()` gana un segundo parámetro **`aprovechar = false`**, espejo
exacto de `generarDieta(instrucciones, aprovechar = false)`. Los caminos que
generan tabla **sin pasar por el formulario de "Pedir"** —la propuesta de una
revisión (spec 046) y el comité de bienvenida (057)— no tienen casilla que leer,
así que ahí no se le menciona el material a la IA. Es literalmente lo que ya
hace la dieta y por lo mismo.

El recuento se lee **al abrir el formulario**; lo que se manda se lee **en el
momento de pedir**. Es la misma cautela documentada en
`pintarAprovecharDespensa()`: el número puede ir retrasado, lo que se manda no.

### Lo que se le manda a la IA

Solo los nombres de las piezas **marcadas** (`tengo: true`), como hace
`loQueTengo()` con la despensa. En `api/tabla.js`, en el **mensaje** y no en
`INSTRUCCIONES` —es un dato de esta petición, no la constante de sistema— y con
tope de piezas, por la lección del 413 de la spec 049.

El texto sigue el de `loQueTengoEnCasa()` de `api/dieta.js`, adaptado:

> Esto es el material que tengo para entrenar: mancuernas, banco, esterilla.
> Apóyate en él todo lo que puedas y móntame la semana alrededor de lo que
> tengo. PERO NO te limites a él: si la semana necesita otra cosa, propónla
> igual. Esto es una preferencia, no una restricción, y una tabla pobre por no
> salirse de la lista no me sirve.

`INSTRUCCIONES` ya dice *"Adapta lo que propongas al material que tenga. Si no
sabes de qué dispone, usa ejercicios de peso corporal."* Esa línea **se queda
como está**: es la que cubre el caso de no mandar nada.

### El material del ejercicio, en piezas

Hoy `ejercicio.material` es un string: `"mancuernas, banco"`, `"ninguno"`, `""`.

Se añade a `js/ejercicios-catalogo.js` una función **`piezasDeMaterial(texto)`**
que lo parte y lo normaliza:

- Separa por **comas, punto y coma, y " y "**. `"mancuernas, banco y esterilla"`
  → tres piezas.
- Recorta espacios, tira las vacías y **quita duplicados** (con
  `mismoIngrediente`, así "mancuerna" y "mancuernas" son una).
- **`"ninguno"`, `"ninguna"`, `"nada"`, `"sin material"`, `"peso corporal"` y el
  string vacío devuelven lista vacía.** Son las formas que ya escribe la IA por
  el prompt de `api/tabla.js` (*"si no hace falta ninguno, escribe ninguno"*).

**No se guarda nada nuevo.** El campo `material` sigue siendo el mismo string y
el editor del catálogo sigue siendo el mismo campo de texto. El esquema de
`api/tabla.js` **tampoco cambia**: sigue pidiendo `material` como `STRING`.

> **Esto obligó a corregir `PRODUCTO.md`.** El apartado de la v13 decía "la IA
> lo devuelve ya en piezas", que es un cambio de esquema, a la vez que "se
> parten por comas al vuelo, sin tocar lo que hay en Firestore", que es lo
> contrario. Lo detectó `revisor-specs` el 1 de septiembre. El usuario decidió
> **partir al leer**: da el mismo resultado en pantalla, y la alternativa dejaba
> el campo `material` con dos tipos posibles en Firestore para siempre. La frase
> de `PRODUCTO.md` está corregida, con su nota.

### El cruce, en el catálogo

La ficha del catálogo tiene dos partes (`tarjetaDeEjercicio()`): la **cabecera**,
siempre visible, y el **cuerpo**, que sale al desplegarla. El cruce se reparte
entre las dos:

**En la cabecera**, donde hoy sale `material || "sin material"`, va solo el
resumen, que es una línea y tiene que seguir siéndolo:

```
Sentadillas búlgaras
Tienes 2 de 3
```

**En el cuerpo desplegado**, junto a `comoSeHace`, la lista pieza a pieza:

```
Material · Tienes 2 de 3
✅ Mancuernas
✅ Banco
⬜ Barra
```

- Una pieza **la tienes** si el armario tiene una pieza que case por
  `mismoIngrediente` **y esté marcada** (`tengo: true`).
- Una pieza apuntada en tu armario pero **desmarcada** cuenta como que **te
  falta**. Es lo mismo que hace la lista de la compra con un ingrediente
  agotado.
- **Sin piezas** (`piezasDeMaterial()` vacío): sale `Sin material` y **no hay
  recuento**. Un "tienes 0 de 0" no dice nada.
- **Tienes todas**: `Tienes 3 de 3`. No se le pone medalla ni se esconde: la
  lista se sigue viendo, que es la información.

El cruce se calcula **al pintar**, contra `materialCargado`, que ya está en
memoria. No se guarda.

## 6. Modelo de datos

**Ninguna colección nueva y ningún campo nuevo.** Se leen dos que ya existen:
`usuarios/{uid}/material` (spec 074) y el campo `material` de
`usuarios/{uid}/ejerciciosCatalogo` (spec 029).

`firestore.rules`: **sin cambios**. `js/reinicio.js`: **sin cambios**.

## 7. Casos límite

- **Armario vacío del todo** (ni una pieza apuntada): casilla desactivada, y el
  catálogo enseña todas las piezas como "te falta". Correcto: no tienes nada.
- **Armario con piezas, todas desmarcadas**: igual que el anterior. La casilla
  cuenta **marcadas**, no apuntadas.
- **Material escrito raro** (`"Mancuernas , , banco"`): las vacías se tiran, dos
  piezas.
- **Material larguísimo** (el campo admite 200 caracteres): se parte igual; si
  salen más de 10 piezas se pintan todas — el tope de 200 ya lo acota.
- **`"ninguno"` con mayúscula o con tilde suelta**: se compara normalizado, así
  que `"Ninguno"` también vale.
- **Una pieza que dice "ninguno" entre otras** (`"mancuernas, ninguno"`): la
  palabra se descarta pieza a pieza, quedan las de verdad.
- **Ejercicio del catálogo sin campo `material`** (los más viejos): lista vacía,
  "Sin material".
- **Pedir tabla sin cupo**: falla antes, como siempre. La casilla no cambia eso.
- **Sin conexión al pedir**: mismo error de siempre.
- **Marcar en el armario y volver sin recargar**: el catálogo se repinta al
  entrar en su sub-pestaña, así que sale al día.

## 8. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| **Casilla desactivada y explicada** con el armario vacío | Decisión del usuario el 1 de septiembre. Se aparta de la 059 (que esconde) y sigue a la 084: enseña que la función existe y dice dónde llenarla. |
| **Preferencia, no restricción** | Literalmente lo mismo que la 059. Una tabla pobre por no salirse de la lista no sirve. |
| **El material se parte al leer, no al guardar** | Lo dice `PRODUCTO.md`. Evita migrar datos por una lista de tres palabras, y el editor sigue siendo un campo de texto. |
| **Una pieza desmarcada cuenta como que falta** | Tenerla apuntada no es tenerla. Mismo criterio que la despensa y la lista de la compra. |
| **Sin recuento cuando no hay piezas** | "0 de 0" es ruido. |
| **Nada de cantidades** | Lo decidió la 074, y un inventario que hay que mantener acaba mintiendo. |
| **Desde el catálogo no se marca** | Eso es la 078, que tiene su lista. Dos sitios para marcar lo mismo se desincronizan en la cabeza del usuario antes que en el código. |

## 9. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/ejercicios-catalogo.js` | `piezasDeMaterial()`: partir el string en piezas y descartar los "ninguno". |
| `js/material.js` | `loQueTengo()`: los nombres de las piezas marcadas. Espejo del de la despensa. |
| `js/tablas.js` | **Nada.** `pedirTablaALaIa()` ya reenvía cualquier `contexto` tal cual. |
| `api/tabla.js` | `loQueTengoParaEntrenar()`: el bloque del mensaje, con su tope. |
| `index.html` | La casilla en el formulario de pedir tabla. |
| `js/app.js` | `generarTabla()` monta el contexto (ahí, no en `js/tablas.js`, igual que `generarDieta()`); `pintarEspecializadas()` gana su rama para `tipo === "ejercicio"`; el submit handler lee y desmarca la casilla; `tarjetaDeEjercicio()` pinta el cruce. |
| `styles.css` | Solo si la lista de piezas necesita algo; se reutiliza lo de la despensa. |
| `docs/specs/077-material-casos.mjs` | **Nuevo.** Casos de `piezasDeMaterial()` y del cruce. |

Estimación: **entre 220 y 260 líneas**. Por debajo de las 300, pero no de sobra:
la rama de `tipo === "ejercicio"` en `pintarEspecializadas()` y en el submit
handler es código que hoy solo existe para `"dieta"`. **Si al implementarlo se
pasa de 300, se para y se avisa** en vez de seguir.

## 10. Fuera de spec: ideas apuntadas

- Que el material del ejercicio se edite como lista en vez de como frase.
- Que la IA devuelva el material ya en piezas (hoy el esquema pide un string).
- Un filtro "solo ejercicios que puedo hacer" en el catálogo.

## ✅ Para probar a mano

Guion completo: lo afina `qa-manual`. En corto, los nueve puntos del apartado 3,
con especial atención al **4** (casilla desactivada con el armario sin marcar),
al **7** (los ejercicios viejos, que es la regresión) y al **9** (la tabla que ya
tenías no se toca).
