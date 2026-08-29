# 062 — Las bebidas, apuntadas

- **Estado:** implementada y desplegada el 29 de agosto de 2026. **Pendiente de que el usuario la pruebe**; hasta entonces NO es completada.
- **Fecha:** 2026-08-29
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v9)", segunda spec de las tres.
- **Depende de:** nada. Se puede implementar antes o después de la 061; van juntas en la v9 porque son el mismo tema, no porque una necesite a la otra.

## 1. Objetivo

Que el usuario pueda apuntar lo que bebe que **no es agua** —café, cerveza,
refresco, zumo— como una línea con su hora, y verlo en el diario del día.

El agua no entra aquí: es un contador y es la spec 061.

## 2. Criterio de "esto funciona"

1. En **Comidas → Apuntar** se puede apuntar una bebida: qué era y cuándo.
2. La bebida aparece en la lista del día, distinguible de una comida a simple
   vista.
3. Se puede **editar y borrar** una bebida ya apuntada, igual que una comida.
4. Las bebidas aparecen en **Hoy**, en el resumen del día.
5. Hay **chips de bebidas frecuentes** que la apuntan de un toque, como los de
   ejercicio (spec 042).
6. La IA ve las bebidas en el contexto de la conversación y de la revisión: si le
   preguntas cómo vas, puede mencionarlas.
7. Nada de lo que ya existe cambia: comidas, ejercicios y pesajes se apuntan y se
   ven igual que antes.

## 3. Alcance

### Entra

- Alta, edición y borrado de bebidas.
- Su sitio en la lista del día y en el resumen de Hoy.
- Chips de bebidas frecuentes.
- Las bebidas dentro del bloque de registros que va a la IA.

### NO entra (explícitamente fuera)

- **El agua.** Es la 061, y es un contador, no un registro escrito.
- **El análisis nutricional.** Las bebidas se quedan fuera de los seis grupos y
  de la horquilla de calorías. Decisión del usuario del 29 de agosto; la deuda
  está escrita en `docs/PRODUCTO.md`.
- **Cantidades, graduación o calorías** de la bebida. Es una línea de texto, como
  una comida.
- **Puntos, racha y calendario de constancia.** Confirmado con el usuario el 29
  de agosto: los puntos premian la conducta que te acerca al objetivo, y apuntar
  tres cervezas no es eso. Ver apartado 8.

## 4. Comportamiento detallado

### Dónde se apunta

En **Comidas → Apuntar**, debajo del formulario de comidas y con su propio
bloque: **"¿Has bebido algo?"**. Mismo formulario de siempre —texto, y fecha y
hora plegadas— para no inventar un patrón nuevo.

Campos: **qué era** (texto, máximo 200 caracteres) y **cuándo** (fecha y hora,
plegadas como en las comidas desde la spec 037).

No hay "momento del día" como en las comidas. Una bebida no es un desayuno ni
una cena: es algo que te tomaste a una hora.

### La lista del día

Lista propia, con el mismo comportamiento que las de comidas y ejercicios: filtro
por día, "Ver todas", editar y borrar. Se monta con `crearLista()`, la factoría
que ya usan las otras dos.

Se ve **claramente separada de las comidas**, con su propio título, para que
nadie confunda una cerveza con una cena.

### Chips de bebidas frecuentes

Como los de ejercicio (spec 042): las que más repites, y tocarlas **rellena el
formulario**, no guarda. Igual que en ejercicio y por el mismo motivo: la hora
casi nunca es la misma, así que guardar de un toque apuntaría una hora heredada
que habría que ir a corregir.

### En Hoy

Las bebidas de hoy salen en el resumen del día, con su propia línea, igual que
las comidas y los ejercicios.

### Lo que ve la IA

Las bebidas entran en el bloque de registros que va a la IA
(`describirRegistros()` en `api/_ia.js`), con su propio encabezado. Así, al pasar
consulta o al charlar, puede mencionarlas.

**No entran en el análisis nutricional**, que es otra llamada distinta
(`api/analisis.js`) y solo lee comidas.

## 5. Modelo de datos

Colección nueva `usuarios/{uid}/bebidas/{bebidaId}`.

| Campo | Tipo | Qué es |
|---|---|---|
| `texto` | string | Qué bebiste. 1-200 caracteres. |
| `fecha` | string | `AAAA-MM-DD`. |
| `hora` | string | `HH:MM`, opcional (cadena vacía si no se puso). |
| `creadoEn` | timestamp | Desempata el orden dentro del mismo día. |

**Por qué colección propia y no un momento más de `comidas`** (decisión del
usuario, 29 de agosto, después de mirar el código): `comidasDeHoy()` en
`js/app.js` filtra las comidas del día **solo por fecha** y las manda enteras al
análisis nutricional. Con las bebidas dentro de `comidas`, cada cerveza entraría
en el análisis — justo lo que la v9 decidió que no pasara. Habría que excluirlas
en el análisis, en el recuento de "análisis viejo", en las listas y en el prompt;
y cualquier spec futura que lea `comidas` sin saber de esto se las tragaría sin
enterarse.

Con colección propia, quedan fuera **por construcción**. Es la misma lección que
dejó la 061: lo que no puede pasar es mejor que lo que hay que cuidar que no
pase.

**Se archiva con la operación**, como las comidas: va a `COLECCIONES` y a
`NOMBRES` en `js/operaciones.js`.

**Casilla propia en Reiniciar datos**, clave `bebidas`, etiqueta "bebidas". Es
**obligatoria**, por lo mismo que el agua en la 061: `borrarOperacion()` solo
vacía `operaciones/{id}/{colección}` y nunca las colecciones de primer nivel,
donde vive la operación en curso. Sin casilla, las bebidas del ciclo en marcha se
quedarían huérfanas.

`firestore.rules`: bloque nuevo calcado al de `comidas`.

### Lo que NO hay que tocar

- **`js/gamificacion.js`**: no. Las bebidas no dan puntos ni racha.
- **`js/calendario.js`**: no. Un día de solo bebidas no es un día registrado.
- **`api/analisis.js`**: no. Las bebidas no entran en los seis grupos.

Las tres cosas se sostienen solas: `calcularPuntos()` y `calcularResumen()`
reciben sus colecciones como parámetros nombrados, así que añadir `bebidas` a
`COLECCIONES` no puede colarlas en ningún sitio.

## 6. Casos límite

- **Texto vacío o solo espacios** → error, no se guarda.
- **Más de 200 caracteres** → error. Una bebida es "caña con Jose", no un relato.
- **Fecha futura o inválida** → el mismo error que ya dan las comidas
  (`errorDeFecha()`).
- **Sin hora**: se guarda igual, como las comidas.
- **Sin bebidas**: la lista lo dice y no enseña una lista vacía sin más.
- **Sin conexión**: el error de siempre, nada se encola.
- **Reiniciar datos**: casilla propia con su recuento. La de "operaciones" se
  lleva las ya archivadas; la de "bebidas", las de la operación en curso.

## 7. Archivos afectados (estimación)

| Archivo | Qué |
|---|---|
| `js/bebidas.js` | **Nuevo.** Validar, guardar, actualizar, listar y borrar. |
| `index.html` | El bloque de apuntar y la lista, en Comidas → Apuntar. |
| `js/app.js` | La lista con `crearLista()`, el alta y los chips frecuentes. |
| `js/operaciones.js` | `bebidas` en `COLECCIONES` y en `NOMBRES`. |
| `js/reinicio.js` | Casilla propia "bebidas". **Obligatoria**, ver apartado 5. |
| `api/_ia.js` | Las bebidas en `describirRegistros()`. |
| `firestore.rules` | Bloque de `bebidas`. **Publicar con la CLI antes de probar.** |
| `styles.css` | Lo poco que no salga ya de las listas existentes. |

Estimación: **200-250 líneas**. Es menos de lo que parece porque `crearLista()`
—la factoría que ya montan las listas de comidas y de ejercicios— se lleva el
listado, el filtro por día, el "Ver todas", la edición y el borrado. Lo propio de
esta spec es el modelo, el alta y los chips.

**Con desconfianza**: la 058 estimó 250-300 y salió en 408.

## 8. Decisiones tomadas

- **El agua va aparte, en la 061** (usuario, 29 de agosto): es un contador porque
  se bebe ocho veces al día y nadie lo escribiría ocho veces. Una cerveza sí se
  escribe.
- **Fuera del análisis nutricional** (usuario, misma conversación).
- **Colección propia, no un momento más de `comidas`** (usuario, 29 de agosto).
  La pregunta se hizo primero dando por hecho que el momento nuevo salía casi
  gratis; al mirar el código resultó que no, porque las comidas del día van
  enteras al análisis. Ver el apartado 5.
- **Ni puntos ni racha** (usuario, misma conversación). El argumento que dejó al
  agua fuera —es el registro más barato de la app— aquí no vale: escribir una
  bebida cuesta lo mismo que escribir una comida. El argumento propio es otro:
  los puntos premian la conducta que te acerca al objetivo, y apuntar que te
  bebiste tres cervezas no es eso. Puntuarlo sería premiarte por registrarlo.

## 9. Fuera de spec: ideas apuntadas

- Que la cerveza y el refresco cuenten calorías. Anotado como deuda en
  `docs/PRODUCTO.md`.

## ✅ Para probar a mano

(Cuando la spec esté cerrada.)
