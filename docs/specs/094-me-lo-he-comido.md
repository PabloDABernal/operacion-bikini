# 094 — "Me lo he comido": del plan al diario

- **Estado:** 📝 escrita el 2 de septiembre de 2026, revisada por `revisor-specs` (tres bloqueantes cerrados: la feature YA EXISTE y tiene un fallo en producción). **Pendiente de implementar.**
- **Fecha:** 2026-09-02
- **Referencia en PRODUCTO.md:** apartado "Qué hará (evolutivos de la fase productiva…)", el evolutivo de saber lo que comes, segundo punto.

## 1. Objetivo

Que lo que pone el plan para hoy se apunte en el diario **bien**: solo desde el
día de hoy, y con sus recetas enlazadas.

## 2. Por qué existe

> ### ⚠️ Esto YA EXISTE. Esta spec lo arregla, no lo construye.
>
> `revisor-specs` lo destapó: el botón "Me lo he comido" está en producción desde
> antes de la spec 065, en `filaDeComida()`, y `apuntarDeLaDieta()` ya guarda la
> comida en el diario de hoy. La primera versión de esta spec lo daba por
> construir, y quien la implementara habría escrito por segunda vez algo que ya
> estaba.
>
> **Y tiene un fallo en producción**, que es lo que de verdad hay que arreglar.

**El fallo.** El icono se pinta en **las siete filas** de la semana, no solo en la
de hoy. Y `apuntarDeLaDieta()` guarda siempre con `hoyISO()`. Así que si el jueves
tocas el botón de la comida del martes, **se apunta como comida de hoy**, en
silencio y sin que nada lo diga.

**Y lo que falta.** Con la spec 093 una comida puede llevar `recetaIds`, pero
`apuntarDeLaDieta()` no los pasa: lo apuntado desde el plan **llega al diario sin
enlazar**, que es justo lo que hace falta para que la spec 095 tenga qué contar.

Es el gesto que hace que el diario se llene, así que tiene que llenarlo **bien**.

## 3. Criterio de "esto funciona"

1. En **Comidas → Mi dieta**, cada comida del día tiene un botón **"Me lo he
   comido"**.
2. Al pulsarlo, se apunta en el diario **de hoy**, con el texto del plan, su
   momento y **sus recetas enlazadas**.
3. Lo dice al hacerlo, sin salir de la pantalla.
4. Si ya lo habías apuntado, **avisa antes de repetir** y deja decidir.
5. En la vista de **la semana entera** el botón sale **solo en el día de hoy**:
   apuntar el jueves lo del martes es un error, no una función.
6. Una comida del plan **sin texto** (una casilla vacía) no tiene botón.
7. Lo apuntado sale en el diario **como cualquier comida**, y se puede editar y
   borrar igual.
8. Cuenta para los puntos y la racha (spec 031) como cualquier comida apuntada.
9. El plan **no se toca**: apuntar no lo cambia ni lo marca.
10. Mi dieta sigue funcionando igual: editar la celda, ver la receta, elegir
    menú.

## 4. Alcance

### Entra

- **Arreglar** que el botón salga solo en el día de hoy.
- **Pasar los `recetaIds`** al apuntar, para que llegue enlazado.
- **Quitar la hora**, que hoy se pone sola.
- El aviso de que ya estaba apuntado, y desactivar el botón mientras guarda.
- La etiqueta accesible, con el nombre del plato.
- Suite de casos de la decisión de "ya está apuntado".

### NO entra (explícitamente fuera)

- **Marcar el plan como hecho.** El plan es el plan y el diario es el diario. Una
  marca en el plan sería un tercer sitio donde mirar qué comiste, y se
  contradiría con el diario en cuanto edites uno de los dos.
- **Apuntar el día entero de un botón.** Se apunta comida a comida: casi nunca se
  cumple el plan entero, y un botón que apunta cuatro cosas de golpe se usa una
  vez y luego hay que borrar tres.
- **Apuntar en otro día que no sea hoy.** Ver el criterio 5.
- **Cambiar la hora.** Se apunta sin hora, como una comida escrita sin ella. La
  hora es opcional desde la spec 014.
- **Acompañamientos** (spec 063): el plan no los tiene, así que no se inventan.
- **Tocar el diario ni el análisis.**

## 5. Comportamiento detallado

### El botón, que ya está

Está en `filaDeComida()`, es un icono (spec 065) y llama a `apuntarDeLaDieta()`.
Se queda donde está. Lo que cambia:

- **Su condición**: hoy es `if (comida.texto)`. Pasa a ser `if (comida.texto && esHoy)`.
- **Su etiqueta accesible**: de `"Me lo he comido"` a
  **`"Me lo he comido: {texto del plato}"`**. Con siete filas iguales, la etiqueta
  fija no dice cuál es cuál.

### Solo hoy: el arreglo

En la vista de la semana hay siete días delante y seis no son hoy. El botón
**solo se pinta en el día de hoy**, se vea el día suelto o la semana entera.

`pintarDieta()` ya sabe qué día es hoy: usa `diaDeLaSemana(hoyISO())` para
colocarse. Se compara con eso, sin inventar nada.

### Qué se apunta

| Campo | De dónde sale |
|---|---|
| `texto` | El texto del plato, tal cual |
| `momento` | El de la comida en el plan (desayuno, comida, merienda, cena) |
| `fecha` | Hoy |
| `recetaIds` | Las de la comida del plan (spec 088) |
| `hora` | **No se pone.** Es opcional (spec 014) |

> **Ojo: hoy SÍ se pone la hora.** `apuntarDeLaDieta()` llama a `guardarComida()`
> con `horaActual()`. Hay que **quitarlo**: el plan no tiene hora, y ponerle la de
> cuando pulsas el botón es inventarse a qué hora comiste. Lo avisó
> `revisor-specs`, y no se habría visto leyendo solo el estado final.

Se guarda con `guardarComida()`, la misma de siempre — ampliando la llamada con
el `recetaIds` que estrena la spec 093, que va **al final de la firma**. Los
demás llamadores no se enteran. **No hay un camino de guardado nuevo.**

### Si ya estaba apuntado

Se mira si **hoy** ya hay una comida **con el mismo momento y el mismo texto**.
Si la hay, se pregunta:

> Ya tienes apuntado "Ensalada de repollo y manzana" en la cena de hoy.
> ¿Lo apunto otra vez?

Se pregunta y no se impide, porque **repetir puede ser verdad**: hay quien repite
plato. Lo que no puede pasar es apuntarlo dos veces sin darse cuenta por pulsar
dos veces el mismo botón.

Se compara el texto **normalizado**, sin tildes ni mayúsculas.

### Al terminar

El diario se refresca y sale el aviso de guardado que ya existe, con el texto:

> Apuntado en la cena de hoy.

Sin cambiar de pantalla: se sigue mirando el plan, que es donde estabas.

## 6. Modelo de datos

**Nada nuevo.** Se escribe una comida como cualquier otra, con el `recetaIds` que
estrena la spec 093.

`firestore.rules`: **sin cambios**. `js/reinicio.js`: **sin cambios**.

## 7. Casos límite

- **Pulsar dos veces seguidas**: la segunda encuentra la de la primera y
  pregunta. El botón además **pasa a desactivarse** mientras guarda, cosa que hoy
  no hace.
- **Comida del plan sin recetas**: se apunta solo con su texto. Es válido.
- **Comida del plan sin texto**: no hay botón.
- **Una receta del plan borrada del recetario**: se apunta igual, con el id que
  hubiera. El diario ya sabe saltarse las que no existen (spec 093).
- **Sin conexión**: sale el error de siempre y no se apunta nada.
- **Sin operación en marcha**: no se puede apuntar nada en la app (spec 018), y
  Mi dieta tampoco se ve. No hace falta caso aparte.
- **Cambia el día a medianoche con la pantalla abierta**: el botón sigue donde
  estaba y apuntaría en el día nuevo. Es el mismo despiste que ya tiene "Hoy" y
  se acepta igual.
- **El texto del plan es larguísimo**: `validarComida()` corta a su máximo y da
  su error si se pasa. No se inventa nada.

## 8. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| **Comida a comida, no el día entero** | Casi nunca se cumple el plan entero. Un botón de cuatro se usa una vez y luego hay que borrar tres. |
| **Solo en el día de hoy** | Apuntar el jueves lo del martes es un error, no una función. |
| **El plan no se marca** | Sería un tercer sitio donde mirar qué comiste, y se contradiría con el diario en cuanto edites uno. |
| **Si ya está, se pregunta y no se impide** | Repetir plato puede ser verdad. Lo que no vale es duplicar sin enterarse. |
| **Sin hora** | Es opcional desde la 014, y el plan no la tiene. Inventarla sería mentir. |
| **Un icono, no un botón de texto** | La fila ya va apretada. Mismo patrón que la spec 065. |

## 9. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/comidas.js` | `yaApuntada(comidas, fecha, momento, texto)`: cálculo puro. |
| `js/app.js` | `filaDeComida()`: la condición del icono y su etiqueta. `apuntarDeLaDieta()`: los `recetaIds`, fuera la hora, el aviso de repetido y desactivar el botón. |
| `docs/specs/094-me-lo-he-comido-casos.mjs` | **Nuevo.** Casos de "ya está apuntado". |

Estimación: **entre 70 y 100 líneas**. Mucho menos que las 120-160 de la primera
cuenta, porque el grueso ya estaba escrito: esto es un arreglo, no una feature.
Depende de la spec **093**, que estrena `recetaIds`.

## 10. Fuera de spec: ideas apuntadas

- Apuntar el día entero, si al usarlo se echa de menos.
- Que el plan enseñe, en gris, lo que ya has apuntado de él.
- Poder apuntar el plan de ayer.

## ✅ Para probar a mano

Los diez puntos del apartado 3. Los que importan: el **5** (que en la semana
entera solo salga en hoy), el **4** (pulsarlo dos veces avisa) y el **9** (que el
plan no cambie).
