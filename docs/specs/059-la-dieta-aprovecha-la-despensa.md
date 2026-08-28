# 059 — La dieta aprovecha la despensa

- **Estado:** borrador
- **Fecha:** 2026-08-28
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v8: la despensa, decidida el 28 de agosto de 2026)", segunda spec de las dos.
- **Depende de:** la spec 058, que crea la despensa. Sin ella no hay nada que aprovechar.

## 1. Objetivo

Que al pedir la dieta de la semana se pueda decir "aprovecha lo que tengo en
casa", y que al abrir una receta se vea de un vistazo qué ingredientes tienes y
cuáles te faltan.

## 2. Criterio de "esto funciona"

1. En **Comidas → Mi dieta**, junto al campo de instrucciones, hay una casilla
   **"Aprovechar lo que tengo en casa"**.
2. Con la despensa vacía, la casilla **no se enseña**: no hay nada que
   aprovechar y ofrecerlo sería mentir.
3. Marcando la casilla y pidiendo la dieta, la semana que sale **usa de verdad**
   lo que tienes marcado: se reconocen ingredientes propios en varios platos.
4. Las recetas **no** salen usando solo lo tuyo: pueden pedir cosas que no
   tienes. Es una preferencia, no una jaula.
5. Al abrir cualquier receta, cada ingrediente sale marcado como **lo tienes** o
   **te falta**, según tu despensa.
6. Arriba de los ingredientes se ve el resumen: "Tienes 5 de 8".
7. **La marca es de ahora, no de cuando se generó la receta**: desmarcar el
   tomate en la despensa y volver a abrir la receta lo enseña como que falta.
8. Con la despensa vacía, las recetas se ven **exactamente como hoy**: sin marcas
   y sin resumen.
9. Sin marcar la casilla, la dieta sale como siempre: la despensa no se le
   menciona a la IA.

## 3. Alcance

### Entra

- Casilla "aprovechar lo que tengo" al pedir la dieta.
- Mandar la lista de lo marcado al proxy y meterla en el prompt.
- Cruce despensa/receta en el navegador, al pintar una receta.
- Marca por ingrediente y resumen "Tienes N de M", en el recetario y en las
  recetas que enseña la dieta.

### NO entra (explícitamente fuera)

- **Lista de la compra.** Enseñar qué falta en UNA receta no es juntar la compra
  de la semana. Sigue siendo idea de `docs/PRODUCTO.md`.
- **Que la tabla de ejercicio use nada de esto.** No tiene sentido.
- **Guardar en la receta qué tenías el día que se generó.** Ver apartado 8: se
  descartó a propósito.
- **Descontar de la despensa lo que cocinas.** La 058 ya dejó fuera las
  cantidades; esto sería lo mismo por la puerta de atrás.
- **Que la conversación o la revisión sepan de la despensa.** Solo la dieta.

## 4. Comportamiento detallado

### La casilla, al pedir dieta

Junto al campo de instrucciones que ya existe (spec 027/040). Etiqueta:
**"Aprovechar lo que tengo en casa"**, y debajo, pequeño: "12 ingredientes
marcados". Así sabes qué le vas a mandar sin ir a mirarlo.

- **No se enseña si la despensa está vacía**, ni si no hay ningún ingrediente
  marcado. En ese caso pedir dieta funciona exactamente como hoy.
- **No se recuerda entre peticiones.** Las instrucciones sí se recuerdan (spec
  040) porque son un texto que cuesta reescribir; una casilla es un clic, y
  recordarla haría que un día te saliera una dieta condicionada sin saber por
  qué.

### Lo que se le manda a la IA

Solo con la casilla marcada, y **solo los ingredientes con `tengo: true`**. Se
mandan como una lista de nombres, tal y como los escribió el usuario.

El prompt de `api/dieta.js` gana un bloque que dice, en resumen: tiene estos
ingredientes en casa, apóyate en ellos todo lo que puedas y repítelos entre
platos si hace falta, **pero no te limites a ellos** — completa con lo que la
semana necesite, que esto es una preferencia y no una restricción. Y que **no
mienta**: si un plato necesita algo que no está en la lista, lo pone igual.

**Tope de la lista: 80 ingredientes.** Es la lección del 413 de Groq (spec 049):
todo lo que entra en un prompt sin límite acaba reventándolo. Si hay más, se
mandan los 80 primeros y se le dice a la IA que se han recortado, igual que hace
`describirRegistros()`.

### El cruce, al pintar una receta

Al abrir una receta se compara **cada línea de sus ingredientes** con la despensa
y se marca si la tienes.

Cómo se compara, de más fiable a menos, parando en el primer acierto:

1. **Igualdad normalizada**: la misma función de la spec 058 (minúsculas, sin
   tildes, sin espacios de sobra). `Tomate` = `tomate`.
2. **La línea de la receta contiene el ingrediente**, ya normalizados los dos.
   `2 tomates maduros` contiene `tomate`. Esto es lo que salva las cantidades y
   los plurales, que es el caso normal.

Si ninguna de las dos acierta, **se considera que falta**. Ante la duda, que la
app diga que te falta: mandarte al súper a por algo que tenías es una molestia;
dejarte sin cenar porque te dijo que lo tenías, no.

Cuando un ingrediente de la despensa acierta, se marca **ese** como usado y no
se vuelve a usar para otra línea de la misma receta: si la receta pide tomate dos
veces, no se cuenta el tuyo dos veces.

**Este cruce es cosmético.** Es una marca al lado de un texto: si se equivoca, la
receta sigue siendo legible y la dieta sigue siendo la misma. Por eso puede vivir
en el navegador y por eso no merece nada más listo que estas dos reglas.

### Cómo se ve

- El ingrediente que tienes: marca de "lo tienes" al principio de la línea.
- El que falta: sin marca, y **en un tono más apagado**, para que la lista se lea
  como "esto es lo que hay que comprar".
- Encima: **"Tienes 5 de 8"**.
- **Nunca se esconde ningún ingrediente.** La receta se lee entera, con marcas o
  sin ellas.
- Con la despensa vacía no hay marcas ni resumen: la receta se ve como hoy.
- La marca aparece en **los dos sitios donde se lee una receta**: el recetario
  (Comidas → Recetas) y las recetas que cuelgan de la dieta.

## 5. Modelo de datos

**Ninguna colección nueva y ningún campo nuevo.** Es lo importante de esta spec:
la marca de "lo tienes" **no se guarda en ningún sitio**, se calcula al pintar.

Lo que cambia:

- `api/dieta.js`: el cuerpo de la petición acepta un campo nuevo `despensa`, una
  lista de strings. Ausente o vacía = se comporta como hoy. El **esquema de
  respuesta no cambia**: la IA sigue devolviendo lo mismo, y no se le pide que
  marque nada.

## 6. Casos límite

- **Despensa vacía o nada marcado**: no hay casilla, no se manda nada, las
  recetas se ven como hoy. Es el estado de todo usuario hasta que use la 058.
- **Despensa de un solo ingrediente**: la casilla se enseña. Un tomate es poco,
  pero es decisión del usuario mandarlo.
- **Más de 80 ingredientes**: se recorta y se avisa a la IA. Ver arriba.
- **La IA ignora la despensa** y saca una semana sin usar nada tuyo: no es un
  error de la app y no se reintenta. Es una preferencia, y gastar otra llamada de
  cuota para insistir es justo lo que la spec 020 decidió no hacer.
- **Receta sin ingredientes** (una editada a mano hasta vaciarla): sin marcas y
  sin resumen, no revienta.
- **Ingrediente de la despensa muy corto** (`ajo`, `sal`): la regla 2 puede
  acertar dentro de otra palabra. Se exige que la coincidencia caiga en **límites
  de palabra**, para que `sal` no marque `salmón`. Es el único filo de verdad del
  cruce y hay que probarlo.
- **Sin conexión al pedir la dieta**: el error de siempre. Nada que ver con esto.

## 7. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/despensa.js` | La función de cruce (línea de receta contra lista de despensa), junto a la normalización que ya creó la 058. |
| `index.html` | La casilla al pedir dieta y su recuento. |
| `js/app.js` | Leer la casilla, mandar la lista, y pintar las marcas y el resumen en los dos sitios donde se lee una receta. |
| `js/dietas.js` | Pasar `despensa` en la petición al proxy. |
| `api/dieta.js` | Aceptar `despensa`, recortarla a 80 y meterla en el prompt. |
| `styles.css` | El ingrediente que falta, apagado; la marca del que tienes. |

No toca `firestore.rules`: no hay colección nueva.

Estimación: unas 200 líneas. Cabe en una spec.

## 8. Decisiones tomadas

- **El cruce lo hace el navegador al abrir la receta, no la IA al generarla**
  (usuario, 28 de agosto). La alternativa era que la IA marcase cada ingrediente
  al crear la dieta: entiende mejor los sinónimos, pero **la marca se congelaría**
  el día de la generación, y una receta se mira días después, cuando la despensa
  ya ha cambiado. Se prefirió una marca que nunca miente sobre el presente,
  aunque falle algún cruce raro. El fallo del cruce es cosmético; el de la marca
  congelada, no.
- **Ante la duda, "te falta"** (derivado de lo anterior): el falso negativo es
  una molestia, el falso positivo te deja sin cenar.
- **La preferencia no es una restricción** (usuario): las recetas no salen
  usando solo lo que tienes, porque eso daría semanas tristes y repetidas.
- **La casilla no se recuerda entre peticiones**, al revés que las instrucciones
  de la spec 040: una casilla recordada acaba condicionando una dieta sin que
  sepas por qué.
- **Tope de 80 ingredientes en el prompt**: la lección del 413 de Groq (spec
  049), aplicada antes de que duela.

## 9. Fuera de spec: ideas apuntadas

- Lista de la compra de la semana, juntando lo que falta de todas las recetas de
  la dieta. Ya estaba en `docs/PRODUCTO.md`; esta spec la deja a un paso.
- Un botón en la receta para meter en la despensa lo que te falta, de un toque.

## ✅ Para probar a mano

(Lo afina el agente `qa-manual` antes de la prueba.)
