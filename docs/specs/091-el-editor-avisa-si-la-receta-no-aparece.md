# 091 — El editor avisa si una receta no aparece en el texto

- **Estado:** 📝 escrita el 2 de septiembre de 2026, revisada por `revisor-specs` (un bloqueante, que cierra la spec 092). **Pendiente de implementar, después de la 092.**
- **Fecha:** 2026-09-02
- **Referencia en PRODUCTO.md:** apartado "Qué hará (evolutivos de la fase productiva, desde el 31 de agosto de 2026)", el evolutivo del editor que avisa.

## 1. Objetivo

Que al editar una comida del día se vea **qué receta está enlazada sin que el
texto la nombre**, para poder decidir si se añade al texto o se suelta.

## 2. Por qué existe

Salió usando la app. El usuario editó una cena, **vació el texto** porque la
receta enlazada estaba mal, y eligió "Tortilla de atún" del desplegable. Con el
campo vacío, la receta elegida pasa a ser el texto entero —lo hace la spec 088 a
propósito—, así que la cena pasó a llamarse solo "Tortilla de atún".

Pero **la ensalada seguía enlazada**. El resultado: el día enseña dos tarjetas y
el título solo nombra una. No es un fallo —el texto es del usuario y nadie lo
reescribe—, pero **no hay forma de darse cuenta** salvo mirando las tarjetas.

## 3. Criterio de "esto funciona"

1. Al editar una comida, si hay una receta enlazada **cuyo nombre no aparece en
   el texto**, sale un aviso que la nombra.
2. Con **varias** así, las nombra todas.
3. Si el texto las nombra todas, **no sale nada**.
4. El aviso **se pone al día mientras escribes**, sin guardar.
5. Al **elegir una receta** del desplegable, el aviso se pone al día (esa nueva
   nunca sale, porque su nombre se acaba de añadir al texto).
6. Al **soltar un chip**, el aviso se pone al día: esa receta deja de contarse.
7. **Un plato enlazado por alias no da aviso**: la cena *"Tortilla de 2 huevos
   con 1 lata de atún al natural"* tiene enlazada *"Tortilla de atún"*, cuyo
   nombre no aparece —pero su alias sí.
8. El aviso **no impide guardar**. Es un aviso, no un error.
9. Una receta **borrada del recetario** que siga enlazada no da aviso: ya lo dice
   su chip, que pone "(receta borrada)".
10. Todo lo demás del editor sigue igual: escribir, sumar recetas, soltar chips,
    Guardar y Cancelar.

## 4. Alcance

### Entra

- La comprobación de qué recetas enlazadas no aparecen en el texto.
- La línea de aviso en el editor de la celda, bajo los chips.
- Suite de casos de la comprobación.

### NO entra (explícitamente fuera)

- **Reescribir el texto.** Es del usuario. Fue la decisión de la 088 al soltar un
  chip y sigue siendo la misma aquí.
- **Impedir guardar.** Tener una receta enlazada sin nombrarla es raro, no
  ilegal: puede que la cena se llame "lo de siempre" a propósito.
- **Avisar al revés** —texto que nombra algo sin receta enlazada—. Eso ya lo dice
  la lista de la compra (spec 073) con su aviso de comidas sin receta, y aquí
  daría un aviso por cada palabra suelta.
- **Avisar fuera del editor.** En la vista del día no: sería un aviso permanente
  en una pantalla que se mira todos los días.
- **Tocar el enlazado** de la 088 ni los alias de la 089.

## 5. Comportamiento detallado

### Qué se considera "que aparece"

Una receta aparece en el texto si **su nombre, o cualquiera de sus alias**, está
dentro del texto, comparando sin tildes ni mayúsculas.

**Los alias son imprescindibles aquí**, no un adorno. Los platos de los menús se
enlazan casi todos por alias (spec 089): la cena *"Tortilla de 2 huevos con 1
lata de atún al natural"* tiene enlazada *"Tortilla de atún"*, cuyo nombre no
está en el texto. Sin mirar los alias, **el aviso saltaría en 24 de los platos
de los menús**, siempre en falso, y en dos días nadie lo leería.

Se compara con `clave()` de `js/dietas.js`, la misma que usa el enlazado.

### Cómo se ve

Debajo de los chips, en la fila de edición:

```
Cena  [Tortilla de atún                        ]
      [ añadir una receta tuya…               ▾ ]

      ⬤ Ensalada de repollo y manzana  ×
      ⬤ Tortilla de atún               ×

      Ojo: "Ensalada de repollo y manzana" está enlazada pero no
      aparece en el texto.
```

Con varias, se nombran todas separadas por comas, y el verbo en plural:
*"…están enlazadas pero no aparecen en el texto."*

Es una línea de aviso, con la clase `advertencia` que ya existe. **No bloquea
nada**: el botón Guardar sigue igual.

### Cuándo se recalcula

Las tres veces que puede cambiar algo:

| Cuándo | Dónde |
|---|---|
| Al escribir en el texto | `input` del campo |
| Al elegir una receta del desplegable | el `change` que ya existe |
| Al soltar un chip | el `click` de la × |

Y al abrir el editor, para que un desajuste que ya venía de antes se vea
enseguida — que es el caso que motivó esta spec.

### Las recetas borradas

Una línea enlazada a una receta que ya no existe en el recetario **no se cuenta**
para el aviso. Su chip ya dice "(receta borrada)" desde la 088, y decir dos cosas
del mismo problema en la misma pantalla es ruido.

> ### El bloqueante de esta spec lo cierra la 092
>
> `revisor-specs` encontró que el aviso dependía de que las recetas del usuario
> tuvieran `alias`, y **la siembra no lo copiaba**: solo lo escribía la
> normalización de la 089, restringida a una cuenta. Para cualquier otra, el
> aviso habría saltado en falso en los ~24 platos que esta spec dice querer
> evitar.
>
> **La spec 092 lo arregla en origen**: la siembra escribe `alias`, así que
> cualquier cuenta —nueva o reiniciada— los tiene desde el primer momento. Esta
> spec se implementa **después** de la 092, no antes.

## 6. Modelo de datos

**Nada.** Se lee lo que ya está en memoria: el texto que se está escribiendo y
`recetasCargadas`.

`firestore.rules`: **sin cambios**. `js/reinicio.js`: **sin cambios**.

## 7. Casos límite

- **Texto vacío y una receta enlazada**: avisa. Es correcto y es literalmente el
  caso que motivó la spec.
- **Sin recetas enlazadas**: no avisa nunca.
- **El nombre aparece con otras mayúsculas o sin tilde**: cuenta como que
  aparece. Se compara normalizado.
- **El nombre aparece como parte de otra palabra**: cuenta. Aquí se busca dentro
  del texto sin exigir palabra entera, al revés que el enlazado — un aviso que se
  calla de más es mejor que uno que salta en falso.
- **Una receta con nombre de menos de 8 letras**: se comprueba igual. El mínimo
  de la spec 076 es para *enlazar* automáticamente, no para esto: aquí la receta
  ya está enlazada porque alguien lo dijo.
- **Dos recetas enlazadas con el mismo nombre**: no puede pasar, el desplegable
  no ofrece las ya enlazadas (spec 088).
- **Se suelta la única receta que faltaba**: el aviso desaparece.
- **Se cancela la edición**: no se guarda nada y el aviso se va con la fila.

## 8. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| **Avisar, no arreglar** | Decisión del usuario el 2 de septiembre. El texto es suyo; recomponerlo solo le quitaría poder llamar a la cena como quiera. |
| **Se miran los alias** | Sin ellos el aviso saltaría en falso en 24 platos de los menús, y un aviso que se equivoca deja de leerse. Es la misma lección de la 076. |
| **No impide guardar** | Tener una receta enlazada sin nombrarla es raro, no ilegal. |
| **Solo en el editor** | En la vista del día sería un aviso permanente en la pantalla que más se mira. |
| **Las borradas no cuentan** | Su chip ya lo dice. Dos avisos del mismo problema es ruido. |
| **Se busca sin exigir palabra entera** | Callarse de más es mejor que saltar en falso. |

## 9. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/dietas.js` | `recetasQueNoAparecen(texto, recetas)`: cálculo puro, con `clave()` que ya está ahí. |
| `js/app.js` | Pintar el aviso en `filaEnEdicion()` y recalcularlo en los tres sitios. |
| `styles.css` | Solo si hace falta; se reutiliza `advertencia`. |
| `docs/specs/091-aviso-casos.mjs` | **Nuevo.** Casos de la comprobación. |

Estimación: **entre 80 y 110 líneas**. Muy por debajo de las 300.

## 10. Fuera de spec: ideas apuntadas

- Un botón "añadir al texto" en el propio aviso.
- Avisar también en la vista de la semana entera.
- Que el aviso diga también lo contrario: texto que nombra platos sin receta.

## ✅ Para probar a mano

Guion completo: lo afina `qa-manual`. En corto, los diez puntos del apartado 3.

**El caso que lo motivó**: abre a editar la cena que se quedó llamándose solo
"Tortilla de atún". Tiene que avisar de que la ensalada está enlazada y no
aparece. Escribe el nombre de la ensalada en el texto y el aviso tiene que
desaparecer **según escribes**.

Y el **punto 7**, que es el que puede romperlo todo: en una cena de un menú sin
tocar, enlazada por alias, **no puede salir ningún aviso**.
