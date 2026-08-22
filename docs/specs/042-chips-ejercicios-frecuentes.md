# 042 — Chips de ejercicios frecuentes

- **Estado:** ✅ completada (probada y confirmada por el usuario el 2026-08-22).
- **Fecha:** 2026-08-22
- **Referencia en PRODUCTO.md:** apartado "Qué hará (segunda ampliación de la v4, decidida el 22 de agosto de 2026)", punto **"Ejercicio también repite lo de siempre"**.

## 1. Objetivo

Apuntar una comida que se repite es un toque desde la spec 037. Apuntar un
ejercicio que se repite sigue siendo escribirlo entero: el nombre, los minutos
y la intensidad, cada vez. Al terminar esta spec, los ejercicios que más se
repiten aparecen como chips junto al formulario de "Nuevo ejercicio", y tocar
uno deja el formulario relleno con lo de la última vez, listo para corregir los
minutos y guardar.

## 2. Criterio de "esto funciona"

1. En **Ejercicio → Apuntar**, justo debajo del campo "Qué has hecho", aparece
   una fila de chips con los ejercicios que más has apuntado en los últimos 30
   días, como mucho **cinco**, el más repetido primero.
2. Si no has apuntado ningún ejercicio en los últimos 30 días, la fila de chips
   **no se ve** (no queda un hueco vacío ni un título suelto).
3. Cada chip enseña el nombre del ejercicio y los minutos de la última vez, por
   ejemplo **"bici · 45 min"**.
4. Tocar un chip **rellena el formulario y no guarda nada**: "Qué has hecho",
   "Minutos" e "Intensidad" quedan con los valores de la última vez que
   apuntaste ese ejercicio, y el foco pasa al campo **Minutos** con su
   contenido seleccionado, para poder teclear otro número encima sin borrar.
5. Tras tocar un chip, "Guardar ejercicio" guarda exactamente lo que se ve en
   el formulario, con la fecha y hora de ahora mismo, igual que si lo hubieras
   escrito a mano.
6. Cambiar cualquier campo después de tocar un chip funciona con normalidad, y
   tocar otro chip vuelve a rellenar el formulario encima.
7. Los chips se actualizan solos: al guardar un ejercicio, la fila refleja el
   nuevo recuento sin recargar la página.
8. La fecha y la hora **siguen plegadas** (spec 038): tocar un chip no las
   despliega ni las cambia.
9. Nada de lo que ya funcionaba en Ejercicio deja de funcionar: apuntar a mano,
   editar, borrar, filtrar por día, la tabla y el catálogo.
10. Los chips de **Comidas** siguen comportándose exactamente como hasta ahora
    (un toque = guardado directo). Esta spec no los toca.

## 3. Alcance

### Entra

- Fila de chips de ejercicios frecuentes en el formulario de Ejercicio, con el
  mismo aspecto que la de Comidas (clase `.chips` / `.chip`, ya existentes).
- El cálculo de "los más repetidos de los últimos 30 días", reutilizando el que
  ya usa Comidas en lugar de escribir otro.
- Rellenar el formulario al tocar un chip, con el foco en Minutos.

### NO entra (explícitamente fuera)

- **Guardar de un toque.** Decidido explícitamente en contra (ver sección 8).
- **Chips a partir del catálogo de ejercicios** (`ejerciciosCatalogo`).
  Decidido explícitamente en contra (ver sección 8).
- **Ningún cambio en los chips de Comidas.** Siguen guardando de un toque.
- **Ningún cambio en el modelo de datos.** No se guarda nada nuevo en
  Firestore: los chips se calculan sobre los ejercicios ya apuntados.
- **Ningún ajuste para elegir cuántos chips o cuántos días.** Se heredan las
  constantes que ya usa Comidas (5 chips, 30 días).
- **Chips en el formulario de edición** de un ejercicio ya guardado.
- **Ningún cambio en Peso**, que no tiene nada repetible que ofrecer.

## 4. Comportamiento detallado

### El cálculo (`js/hoy.js`)

`loDeSiempre()` ya hace justo esto para las comidas: agrupa por texto
normalizado, cuenta las veces en los últimos 30 días, y de cada grupo se queda
con la aparición **más reciente** para decidir con qué valores se repite. Lo
único específico de comidas es que arrastra el campo `momento`.

Se extrae la parte común a una función nueva, `masRepetidos(registros, hoy,
maximo)`, que devuelve para cada grupo `{ texto, veces, fecha, registro }`,
donde `registro` es el registro completo más reciente de ese grupo. Con eso:

- `loDeSiempre()` pasa a ser un envoltorio de `masRepetidos()` que se queda con
  `texto` y `momento`. **Su salida no cambia**, así que Comidas no se entera.
- Ejercicio llama a `masRepetidos()` directamente y se queda con `texto`,
  `minutos` e `intensidad` del `registro`.

Las constantes `DIAS_LO_DE_SIEMPRE` (30) y `MAXIMO_LO_DE_SIEMPRE` (5) se
comparten tal cual. El desempate también: a igual número de veces, primero el
más reciente.

La función `clave()` (que hace que "Bici " y "bici" sean el mismo ejercicio)
se reutiliza sin tocar.

### HTML (`index.html`)

En `.seccion[data-seccion="ejercicio"]`, sub-pestaña `apuntar`, justo después
del campo `#ejercicio-texto` y antes de la etiqueta de Minutos — el mismo sitio
que ocupa "lo de siempre" en Comidas:

```html
<div id="bloque-ejercicios-frecuentes" class="oculta">
  <div id="ejercicios-frecuentes" class="chips"></div>
</div>
```

Sin `#error-...` ni `#guardado-...` propios: al contrario que en Comidas, tocar
un chip aquí no guarda nada, así que no hay nada que pueda fallar ni que
confirmar. El error y el aviso del formulario (`#error-ejercicio`,
`#guardado-ejercicio`) siguen siendo los de siempre.

### JavaScript (`js/app.js`)

Una función `pintarEjerciciosFrecuentes(ejercicios)`, hermana de
`pintarLoDeSiempre()`:

- Esconde el bloque con `.oculta` si no hay ninguno, igual que Comidas.
- Por cada uno, un `<button type="button" class="chip">` con el texto
  `"<nombre> · <minutos> min"`.
- Al tocarlo, `rellenarConEjercicio(habitual)`:
  1. `#ejercicio-texto` ← el texto de la última vez.
  2. `#ejercicio-minutos` ← los minutos de la última vez.
  3. `#ejercicio-intensidad` ← la intensidad de la última vez, o
     `INTENSIDAD_POR_DEFECTO` si el registro no la trae (ver casos límite).
  4. `#error-ejercicio` se vacía (si venías de un intento fallido, ese mensaje
     ya no habla de lo que hay ahora en el formulario).
  5. `id("ejercicio-minutos").focus()` y `.select()`.

Los botones son `type="button"` a propósito: están **dentro** de
`#form-ejercicio`, y sin eso el navegador los trataría como envío del
formulario. Es lo mismo que ya hacen los chips de Comidas.

`pintarEjerciciosFrecuentes()` se llama desde `refrescarHoy()` (`js/app.js`),
que es exactamente donde ya se llama a `pintarLoDeSiempre()` y donde ya se
tienen a mano los ejercicios cargados. `refrescarHoy()` la invoca
`refrescarPantallas()`, que es el `alRefrescar` de `listaEjercicios`, así que
el punto 7 del criterio de aceptación se cumple solo: guardar un ejercicio
repinta los chips.

### CSS (`styles.css`)

Nada nuevo. `.chips` y `.chip` ya existen desde la spec 037 y valen tal cual.

## 5. Modelo de datos

Sin cambios. No se toca Firestore, ni `firestore.rules`, ni ninguna llamada a
la IA. Los chips salen de la colección `ejercicios` (el diario), que ya se lee
entera para pintar la lista.

## 6. Casos límite

- **Ejercicio sin minutos guardados.** No debería pasar (`validarEjercicio()`
  los exige), pero si un registro viejo llegara sin ellos, el chip enseña solo
  el nombre y deja Minutos vacío en vez de escribir "undefined min".
- **Ejercicio sin intensidad guardada.** Mismo caso, y hay que tratarlo igual
  de explícitamente: asignar `undefined` a un `<select>` no lo deja vacío, lo
  deja en la primera opción, que es una intensidad concreta y probablemente
  falsa. Si el registro no trae intensidad, se pone
  `INTENSIDAD_POR_DEFECTO` — la misma que ya usa el formulario recién
  vaciado.
- **Sin operación en marcha.** El formulario de Ejercicio ya está oculto
  entero, así que los chips tampoco se ven. No hay nada que añadir.
- **Un solo ejercicio apuntado.** Sale un solo chip. Es correcto: sigue siendo
  el que más repites.
- **El mismo ejercicio con intensidades distintas.** Manda la última vez, igual
  que en Comidas manda el último `momento`. No se hace media ni se pregunta.
- **Tocar un chip con el formulario a medio escribir.** Lo sobrescribe sin
  avisar. Es lo esperado de un atajo de relleno, y es reversible: basta con
  volver a escribir.
- **Vista de escritorio.** Los chips viven dentro de la sub-sección `apuntar`,
  que en escritorio es una columna de la rejilla (spec 036). `.chips` ya hace
  `flex-wrap`, así que se reparten en varias filas si la columna es estrecha.

## 7. Archivos afectados

| Archivo | Qué cambia |
|---|---|
| `js/hoy.js` | Se extrae `masRepetidos()`; `loDeSiempre()` pasa a apoyarse en ella sin cambiar lo que devuelve. |
| `index.html` | El bloque de chips en el formulario de Ejercicio. |
| `js/app.js` | `pintarEjerciciosFrecuentes()` y su relleno del formulario; la llamada donde se refresca la lista de ejercicios. |
| `docs/PRODUCTO.md` | Ya actualizado. |
| `docs/ESTADO.md`, `docs/BACKLOG.md` | Al terminar. |

No se toca `styles.css`, ni `firestore.rules`, ni ninguna función de `api/`.

Tamaño estimado: ~70 líneas. Muy por debajo del límite de 300 de la regla 4.

## 8. Decisiones tomadas

Decisiones de producto confirmadas por el usuario el 22 de agosto de 2026:

- **El chip rellena el formulario, no guarda.** Es la diferencia deliberada con
  Comidas, y la razón por la que esta idea llevaba parada desde la spec 010:
  "un ejercicio repetido casi nunca dura lo mismo". Guardar de un toque
  apuntaría unos minutos heredados que casi siempre habría que ir a editar
  después — más trabajo, no menos, y con un dato falso guardado por el camino.
  Se paga un toque extra (el de Guardar) a cambio de que lo apuntado sea
  verdad.
- **Los chips salen del diario, no del catálogo.** El catálogo
  (`ejerciciosCatalogo`) es lo que sabes hacer; el diario (`ejercicios`) es lo
  que haces de verdad. Un catálogo largo daría una parrilla de chips que no
  refleja tus hábitos, y además no tendría minutos ni intensidad con los que
  rellenar el formulario. Es el mismo criterio que Comidas.
- **Foco en Minutos con el contenido seleccionado**, y no en el nombre ni sin
  foco: el nombre es justo lo que el chip acaba de dar por bueno, y los minutos
  son lo que casi siempre hay que cambiar. Seleccionado para poder teclear
  encima sin borrar antes.
- **El chip enseña los minutos** ("bici · 45 min") y no solo el nombre: así se
  ve de antemano qué va a rellenar, y a veces basta con confirmar sin tocar
  nada.
- **Se reutiliza el cálculo de Comidas en vez de escribir otro.** Las mismas
  constantes (5 chips, 30 días) y el mismo desempate. Dos rankings distintos
  para la misma idea envejecerían mal.

## 9. Fuera de spec: ideas apuntadas

- Que el chip enseñe también cuántas veces lo has hecho ("bici · 45 min · ×9").
- Un chip para las series/repeticiones cuando algún día se registren cargas
  (idea que ya está en el backlog desde la spec 029).

## ✅ Para probar a mano

En producción (https://operacion-bikini.vercel.app), con una operación en
marcha y varios ejercicios ya apuntados en el último mes.

### Que lo nuevo funcione

1. Ve a **Ejercicio → Apuntar**. Debajo del campo "Qué has hecho" hay una fila
   de chips con los ejercicios que más repites, como mucho cinco, y cada uno
   dice el nombre y los minutos de la última vez: **"bici · 45 min"**.
2. El primer chip es el que más veces has apuntado en los últimos 30 días.
3. Toca un chip. **No se guarda nada**: se rellenan "Qué has hecho", "Minutos"
   e "Intensidad" con lo de la última vez, y el cursor se queda en **Minutos**
   con el número ya seleccionado.
4. Teclea otro número directamente (sin borrar antes): debe sustituir al que
   había.
5. Dale a **Guardar ejercicio**. Se guarda lo que se ve en el formulario, con
   la fecha y hora de ahora.
6. Mira la fila de chips: se ha actualizado sola, sin recargar la página.
7. Toca un chip y luego otro distinto: el segundo sobrescribe al primero en el
   formulario.
8. Comprueba que **Fecha y hora siguen plegadas** tras tocar un chip: sigue
   apareciendo el botón "Cambiar fecha y hora", no los campos.

### Que no se haya roto nada de antes

9. Apunta un ejercicio **escribiéndolo entero a mano**, sin tocar ningún chip:
   funciona igual que siempre.
10. Provoca un error de validación (deja los minutos vacíos y dale a Guardar).
    Sale el mensaje de error. Ahora **toca un chip**: el mensaje de error
    desaparece, porque ya no habla de lo que hay en el formulario.
11. Edita y borra un ejercicio del diario, y filtra por un día: todo igual.
12. Entra en **Ejercicio → Mi tabla** y **Catálogo**: sin cambios.
13. **Comidas → Apuntar**: los chips de "lo de siempre" siguen **guardando de
    un toque**, como hasta ahora. Esto es lo que más importa que no se haya
    roto: el cálculo de los chips es ahora código compartido con Ejercicio.
14. Comprueba que en Comidas el chip sigue apuntando la comida con el **momento
    correcto** (desayuno / comida / cena, el de la última vez que la apuntaste).

### Casos raros

15. Si tienes alguna cuenta o momento sin ningún ejercicio apuntado en los
    últimos 30 días, la fila de chips **no debe verse**: ni hueco, ni título
    suelto, ni borde vacío.
16. Con la ventana ancha (escritorio), entra en Ejercicio: los chips se
    reparten en varias líneas dentro de su columna, sin desbordarse ni sacar
    barras de scroll.
