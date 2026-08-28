# 059 — La dieta aprovecha la despensa

- **Estado:** implementada y desplegada el 29 de agosto de 2026. **Pendiente de que el usuario la pruebe**; hasta entonces NO es completada.
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
5. Al abrir una receta **desde Comidas → Recetas**, cada ingrediente sale marcado
   como **lo tienes** o **te falta**, según tu despensa.
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
- Marca por ingrediente y resumen "Tienes N de M" **en el recetario**
  (Comidas → Recetas), que hoy es el único sitio de la app donde se abre una
  receta y se leen sus ingredientes.

### NO entra (explícitamente fuera)

- **Lista de la compra.** Enseñar qué falta en UNA receta no es juntar la compra
  de la semana. Sigue siendo idea de `docs/PRODUCTO.md`.
- **Que la tabla de ejercicio use nada de esto.** No tiene sentido.
- **Guardar en la receta qué tenías el día que se generó.** Ver apartado 8: se
  descartó a propósito.
- **Descontar de la despensa lo que cocinas.** La 058 ya dejó fuera las
  cantidades; esto sería lo mismo por la puerta de atrás.
- **Que la conversación o la revisión sepan de la despensa.** Solo la dieta.
- **Abrir una receta desde Mi dieta.** No se puede hoy: la dieta guarda el
  `recetaId` de cada comida pero nunca lo usa para enseñar la receta
  (`js/app.js`, `filaDeComida()` solo pinta el momento y el texto; `recetaId`
  solo aparece en el desplegable de edición). Montar esa vista es una pantalla
  nueva, no una marca encima de una que ya existe, y tocaría código que también
  lleva el botón "Me lo he comido" de la spec 034. **Va a la spec 060.**

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

El bloque dice, en resumen: tiene estos ingredientes en casa, apóyate en ellos
todo lo que puedas y repítelos entre platos si hace falta, **pero no te limites a
ellos** — completa con lo que la semana necesite, que esto es una preferencia y
no una restricción. Y que **no mienta**: si un plato necesita algo que no está en
la lista, lo pone igual.

**Dónde va, que importa:** en el **mensaje del usuario**, junto a `contexto()` y
al resto de lo que se pide en cada petición. **NO** en `INSTRUCCIONES`, que es la
constante estática del `systemInstruction` y es la misma para todas las
peticiones de todos los usuarios. La despensa es un dato de esta petición, no una
regla del sistema.

**Tope de la lista: 80 ingredientes.** Es la lección del 413 de Groq (spec 049):
todo lo que entra en un prompt sin límite acaba reventándolo. Si hay más, se
mandan los 80 primeros y se le dice a la IA que se han recortado, igual que hace
`describirRegistros()`.

### El cruce, al pintar una receta

Al abrir una receta se compara **cada línea de sus ingredientes** con la despensa
y se marca si la tienes.

**La regla, exacta.** Los dos textos se normalizan primero (la función de la spec
058: minúsculas, sin tildes, sin espacios de sobra). Después se busca el
ingrediente dentro de la línea con esta forma:

```
(no hay letra ni numero antes) + ingrediente + (es|s)? + (no hay letra ni numero despues)
```

**Corregido al implementarla, el 29 de agosto.** La spec decía "límite de
palabra" y eso se escribe con ``, que fue lo primero que se probó. Falla:
`` exige una letra a un lado y algo que no lo sea al otro, así que un
ingrediente acabado en signo —`aceite (virgen extra)`— **no se encontraba ni a
sí mismo**. Lo cazó el fichero de casos antes de que llegara a producción.

Ahora los dos límites son *lookarounds* que solo preguntan si al lado hay letra
o número, que es lo que de verdad importa. El comportamiento buscado no cambia;
lo que cambia es que ya no depende de con qué carácter acabe tu ingrediente.

Es decir: **límite de palabra estricto por la izquierda**, y por la derecha se
tolera **solo** una `s` o un `es` de plural antes del límite. Nada más.

Esas dos mitades son las que hacen que la regla funcione, y **no son
intercambiables**:

- El sufijo opcional es lo que salva el caso normal: tu `tomate` acierta en
  `2 tomates maduros`, tu `coliflor` en `2 coliflores`, tu `ajo` en
  `ajos tiernos`.
- Que el sufijo sea **solo `s` o `es`** es lo que impide el desastre: tu `sal`
  **no** acierta en `salmón a la plancha`, porque lo que sigue a `sal` es `món`,
  que no es ninguno de los dos. Con un sufijo libre, `sal` se comería el salmón.
- El límite estricto por la izquierda es lo que impide que `lechuga` acierte en
  `leche entera`.

**Los casos están en `docs/specs/059-cruce-casos.mjs`** y se ejecutan con
`node docs/specs/059-cruce-casos.mjs`. Al implementar la spec dejaron de ser una
copia de la regla y pasaron a ejecutar **el módulo de verdad** (`js/despensa.js`,
recortándole los imports de Firebase, que necesitan red). Son 20 casos de la
regla más seis del resto del cruce, y son lo que cazó el fallo del ``.

Es la única parte de la v8 donde un cambio pequeño de la regla rompe algo en
silencio: **si se toca el cruce, se ejecutan.**

Si la regla no acierta, **se considera que falta**. Ante la duda, que la app diga
que te falta: mandarte al súper a por algo que tenías es una molestia; dejarte
sin cenar porque te dijo que lo tenías, no.

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
- **Solo en el recetario** (Comidas → Recetas). Es el único sitio donde hoy se
  abre una receta. Cuando la spec 060 permita abrirla desde Mi dieta, la marca
  saldrá allí sin tocar nada de esto: el cruce es una función pura que recibe
  una lista de ingredientes y devuelve cuáles tienes.

## 5. Modelo de datos

**Ninguna colección nueva y ningún campo nuevo.** Es lo importante de esta spec:
la marca de "lo tienes" **no se guarda en ningún sitio**, se calcula al pintar.

Lo que cambia:

- `api/dieta.js`: el cuerpo de la petición acepta un campo nuevo `despensa`, una
  lista de strings. Ausente o vacía = se comporta como hoy. El **esquema de
  respuesta no cambia**: la IA sigue devolviendo lo mismo, y no se le pide que
  marque nada.

## 6. Casos límite

- **Despensa vacía** (aún no has escrito nada): no hay casilla al pedir dieta, no
  se manda nada, y las recetas se ven como hoy, sin marcas ni resumen. Es el
  estado de todo usuario hasta que estrene la 058.
- **Despensa con cosas pero todo desmarcado** (se te ha acabado todo): la casilla
  **tampoco se enseña** — no hay nada que aprovechar. Pero las recetas **sí** se
  marcan, y saldrá "Tienes 0 de 8" con todos los ingredientes apagados. Son dos
  estados distintos y se comportan distinto: el primero es "no uso esto", el
  segundo es "toca ir a comprar".
- **Despensa de un solo ingrediente**: la casilla se enseña. Un tomate es poco,
  pero es decisión del usuario mandarlo.
- **Más de 80 ingredientes**: se recorta y se avisa a la IA. Ver arriba.
- **La IA ignora la despensa** y saca una semana sin usar nada tuyo: no es un
  error de la app y no se reintenta. Es una preferencia, y gastar otra llamada de
  cuota para insistir es justo lo que la spec 020 decidió no hacer.
- **Receta sin ingredientes** (una editada a mano hasta vaciarla): sin marcas y
  sin resumen, no revienta.
- **Ingrediente de la despensa muy corto** (`ajo`, `sal`): resuelto por la regla
  de arriba, y es el caso que la obligó a ser como es. `sal` no marca `salmón`.
  Sigue siendo el filo del cruce: va en un test.
- **Tu despensa escrita en plural** (`lentejas`) y la receta en singular
  (`100 g de lenteja`): **no acierta**. La tolerancia de plural va en un solo
  sentido. Se acepta: escribir los ingredientes en singular es lo natural, y el
  fallo es una marca de menos, que es el lado seguro.
- **Cancelar y volver a abrir el formulario deja la casilla desmarcada.**
  Cancelar llama a `pintarEspecializadas()`, que rehace el botón "Pedir", y su
  manejador llama a `pintarAprovecharDespensa()`, que la pone a `false`. Es el
  mismo camino que al abrirlo la primera vez.
- **El recuento "12 ingredientes marcados" no se actualiza en vivo.** Se lee al
  entrar en Mi dieta. Si vas a la Despensa, desmarcas cosas y vuelves sin recargar,
  puede decir de más. Aceptado por coherencia con el resto de la app (las recetas y
  el catálogo hacen lo mismo), y porque lo que de verdad se manda a la IA se lee en
  el momento de pedir la dieta, no de pintar la casilla: **el número puede ir
  retrasado, lo que se manda nunca**.
- **Sin conexión al pedir la dieta**: el error de siempre. Nada que ver con esto.

## 7. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/despensa.js` | La función de cruce (línea de receta contra lista de despensa), junto a la normalización que ya creó la 058. |
| `index.html` | La casilla al pedir dieta y su recuento. |
| `js/app.js` | Leer la casilla, mandar la lista, y pintar las marcas y el resumen en el recetario. |
| `js/dietas.js` | Pasar `despensa` en la petición al proxy. |
| `api/dieta.js` | Aceptar `despensa`, recortarla a 80 y meterla en el prompt. |
| `styles.css` | El ingrediente que falta, apagado; la marca del que tienes. |

No toca `firestore.rules`: no hay colección nueva.

Estimación: **unas 200 líneas**, ya sin la vista de receta desde la dieta, que se
ha ido a la spec 060. Cabe en una spec.

Cuidado con `js/app.js`: el pintado de la dieta lleva también el cupo y el botón
"Me lo he comido" (spec 034). Esta spec **no** debería necesitar tocar
`filaDeComida()` ni `pintarDieta()` — si acaba haciéndolo, es señal de que se
está colando dentro lo que es de la 060.

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
- **Cada ingrediente marcado lleva además un `title`** ("Lo tienes en casa" /
  "Te falta"). No estaba en la spec; se añadió al implementarla y se documenta
  aquí para que no quede código sin respaldo. El motivo: la marca visual son un
  "✓" puesto desde CSS y una opacidad, y ninguna de las dos cosas la lee un
  lector de pantalla. Sin el `title`, para quien no ve la pantalla la lista de
  ingredientes no dice nada de la despensa.
- **Las marcas, solo en el recetario; abrir la receta desde Mi dieta va a la spec
  060** (usuario, 28 de agosto, tras la revisión). La spec daba por hecha una
  pantalla que no existe: la dieta guarda el `recetaId` pero nunca enseña la
  receta. Montarla es una pantalla nueva y toca código que lleva el botón "Me lo
  he comido" (spec 034), así que se parte **antes** de implementar, no después.
- **La regla del cruce: límite estricto por la izquierda y sufijo `s`/`es` por la
  derecha** (Claude, tras la revisión). El revisor dio por incompatibles
  "tomate acierta en tomates" y "sal no acierta en salmón". No lo son si el
  sufijo tolerado se limita a `s` y `es`: a `sal` le sigue `món`, que no es
  ninguno de los dos. Verificado sobre 17 casos antes de cerrar la spec.

## 9. Fuera de spec: ideas apuntadas

- Lista de la compra de la semana, juntando lo que falta de todas las recetas de
  la dieta. Ya estaba en `docs/PRODUCTO.md`; esta spec la deja a un paso.
- Un botón en la receta para meter en la despensa lo que te falta, de un toque.

## ✅ Para probar a mano

(Lo afina el agente `qa-manual` antes de la prueba.)
