# 094 — "Me lo he comido": del plan al diario

- **Estado:** 📝 escrita el 2 de septiembre de 2026. Pendiente de `revisor-specs`.
- **Fecha:** 2026-09-02
- **Referencia en PRODUCTO.md:** apartado "Qué hará (evolutivos de la fase productiva…)", el evolutivo de saber lo que comes, segundo punto.

## 1. Objetivo

Que lo que pone el plan para hoy se pueda **apuntar en el diario de un toque**,
con sus recetas ya enlazadas.

## 2. Por qué existe

Con la spec 093 ya se puede apuntar una comida eligiendo receta, pero **a mano**:
buscar el plato en el desplegable, elegirlo, poner el momento y guardar. Cuatro
gestos, cuatro veces al día, para copiar algo que **la app ya tiene escrito** en
Mi dieta.

Si copiar el plan cuesta más que escribir "lentejas" a mano, nadie lo va a hacer,
y sin datos enlazados la spec 095 no tiene qué contar. **Esto es lo que hace que
el diario se llene.**

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

- El botón "Me lo he comido" en cada comida del día en Mi dieta.
- Apuntar la comida con su texto, su momento, la fecha de hoy y sus `recetaIds`.
- El aviso de que ya estaba apuntado.
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

### Dónde va el botón

En la fila de cada comida del día, junto a los iconos que ya hay (ver la receta,
editar). Es un **icono más** en esa columna, con el mismo patrón de la spec 065,
para no meter un botón de texto en una fila que ya va apretada.

Su etiqueta accesible es **"Me lo he comido: {texto del plato}"**.

### Solo hoy

En la vista de la semana entera hay siete días delante, y seis de ellos no son
hoy. El botón **solo se pinta en el día de hoy**, se esté viendo el día suelto o
la semana.

Es la misma idea que ya tiene la app con "Hoy": lo que se apunta, se apunta
cuando pasa.

### Qué se apunta

| Campo | De dónde sale |
|---|---|
| `texto` | El texto del plato, tal cual |
| `momento` | El de la comida en el plan (desayuno, comida, merienda, cena) |
| `fecha` | Hoy |
| `recetaIds` | Las de la comida del plan (spec 088) |
| `hora` | **No se pone.** Es opcional (spec 014) |

Se guarda con `guardarComida()`, la misma de siempre — con el `recetaIds` que
estrena la spec 093. **No hay un camino de guardado nuevo.**

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
  pregunta. El botón además se desactiva mientras guarda.
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
| `js/app.js` | El icono en la fila de Mi dieta, solo en hoy, y el guardado. |
| `docs/specs/094-me-lo-he-comido-casos.mjs` | **Nuevo.** Casos de "ya está apuntado". |

Estimación: **entre 120 y 160 líneas**. Depende de la spec **093**, que estrena
`recetaIds` en la comida.

## 10. Fuera de spec: ideas apuntadas

- Apuntar el día entero, si al usarlo se echa de menos.
- Que el plan enseñe, en gris, lo que ya has apuntado de él.
- Poder apuntar el plan de ayer.

## ✅ Para probar a mano

Los diez puntos del apartado 3. Los que importan: el **5** (que en la semana
entera solo salga en hoy), el **4** (pulsarlo dos veces avisa) y el **9** (que el
plan no cambie).
