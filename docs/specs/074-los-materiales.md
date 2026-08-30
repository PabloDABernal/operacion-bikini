# 074 — Los materiales: lo que tienes para entrenar

- **Estado:** borrador
- **Fecha:** 2026-08-30
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v13: los materiales, decidida el 30 de agosto de 2026)", primera spec de las dos.

## 1. Objetivo

Que el usuario tenga en **Ejercicio** una lista de los materiales con los que
suele entrenar, y pueda marcar cuáles tiene ahora mismo en casa y cuáles no,
con un toque. Es la despensa (spec 058) trasladada a Ejercicio.

Esta spec **solo construye la lista de materiales**. Que la tabla la aproveche
y que el catálogo enseñe qué te falta es la 075.

## 2. Criterio de "esto funciona"

1. En **Ejercicio** hay una cuarta sub-pestaña, **"Materiales"**, junto a
   Apuntar, Mi tabla y Catálogo.
2. La primera vez está vacía y lo dice: explica para qué sirve en una frase, en
   vez de enseñar una lista vacía sin más.
3. Hay un campo para escribir un material y un botón para añadirlo. Nace
   **sin marcar**: escribir la lista no dice nada sobre lo que hay en casa
   (mismo criterio que la despensa desde la spec 068).
4. Cada material de la lista tiene una casilla. Marcada = lo tengo.
   Desmarcada = no lo tengo, pero sigue en la lista.
5. Tocar la casilla lo guarda al instante, sin botón de guardar.
6. Recargar la página: la lista y las marcas siguen como las dejaste.
7. Un material se puede **borrar** de la lista, y se puede **editar** el
   nombre.
8. Al **entrar** en la sub-pestaña, la lista sale ordenada con **lo que tienes
   primero** y lo que no, después; dentro de cada grupo, alfabético. Marcar y
   desmarcar no recoloca nada en ese momento: el orden se recalcula la próxima
   vez que entras.
9. Arriba se ve el recuento: "4 de 9 materiales en casa".
10. Añadir un material que ya está en la lista **no lo duplica**: avisa de que
    ya lo tienes apuntado y, si estaba desmarcado, lo marca.

## 3. Alcance

### Entra

- Sub-pestaña "Materiales" en Ejercicio.
- Alta, edición del nombre, borrado y marcado/desmarcado de materiales.
- Persistencia en Firestore y sus reglas.
- Casilla propia en **Ajustes → Zona de peligro → Reiniciar datos**.

### NO entra (explícitamente fuera)

- **Cantidades, pesos y variantes** ("mancuernas de 8 kg"). Decisión del
  usuario, ver apartado 8.
- **Que la tabla use los materiales.** Es la spec 075.
- **Que el ejercicio del catálogo enseñe qué te falta.** Es la spec 075.
- **Que el catálogo rellene la lista solo**, al estilo de la spec 068 con la
  despensa. Se decide más adelante, viendo cómo se usa esta lista.
- **Categorías de materiales** (peso libre, cardio, accesorios). Mismo motivo
  que en la despensa: con una lista corta ordenada por "lo tengo" se lee bien.

## 4. Comportamiento detallado

### La sub-pestaña

Cuarta y última en `data-de="ejercicio"`, después de Catálogo. Se abre con el
mismo mecanismo que las otras tres (spec 035), sin tocar nada de esa lógica.

### Estado vacío

Sin materiales: *"Aquí van los materiales con los que sueles entrenar.
Márcalos según los tengas en casa y las tablas podrán aprovecharlos."* Nada
más, y el campo de añadir visible debajo.

### Añadir

- Un `<input type="text">` y un botón **"Añadir"**.
- Vacío o solo espacios → error `Escribe un material.`, no se guarda.
- Máximo **60 caracteres** → error `Máximo 60 caracteres.`.
- Duplicado (comparando **normalizado**, ver abajo) → no se crea otro. El
  mensaje dice que ese material ya está en tu lista y, si estaba desmarcado,
  **se marca**.
- **Ese mensaje NO es un error.** Se pinta como aviso neutro, igual que el
  "Guardado" del resto de la app, por el mismo motivo que en la despensa:
  volver a escribir "mancuernas" no es equivocarse, es re-marcarlo.
- Tras añadir, el campo se vacía y **mantiene el foco**.

### Normalización para comparar (solo para comparar, no para guardar)

Se guarda **tal y como lo escribes**. Para decidir si dos textos son el mismo
material se comparan en minúsculas, sin tildes y sin espacios de sobra
(`Mancuernas`, `mancuernas` y `  MANCUERNAS ` son el mismo).

Se reutiliza la función de normalización que ya existe para la despensa
(`js/despensa.js`), no se copia: es la misma regla, para el mismo propósito, y
la spec 075 la necesitará también para el cruce con el material del catálogo.

### Marcar y desmarcar

Casilla por fila. Al tocarla, la casilla cambia **al instante** y se escribe en
Firestore. Si la escritura falla, la casilla **vuelve a su estado anterior** y
sale el error.

**La lista NO se recoloca en cada toque.** El orden se recalcula al entrar en
la sub-pestaña, no mientras marcas (mismo motivo que la despensa: no debe
saltar la fila bajo el dedo).

### Editar y borrar

- **Editar**: la fila pasa a modo edición con el nombre en un campo. Mismas
  validaciones que al añadir, incluida la de duplicado contra el resto de la
  lista.
- **Editar hasta chocar con otro material NO fusiona las dos filas: rechaza el
  cambio** y lo dice ("«mancuernas» ya está en tu lista"), mismo criterio que
  la despensa.
- Editar una fila dejando el mismo nombre (o solo cambiando mayúsculas o
  tildes) no cuenta como duplicado de sí misma.
- **Borrar**: pide confirmación, porque no hay deshacer.

### Recuento

Encima de la lista: "4 de 9 materiales en casa". Con la lista vacía no se
enseña.

## 5. Modelo de datos

Colección nueva `usuarios/{uid}/materiales/{materialId}`.

| Campo | Tipo | Qué es |
|---|---|---|
| `nombre` | string | Tal y como lo escribió el usuario. 1-60 caracteres. |
| `tengo` | boolean | `true` = lo tienes en casa ahora. Al crear, siempre `false` (mismo criterio que la despensa desde la spec 068: escribir no afirma nada). |
| `creadoEn` | timestamp | `serverTimestamp()`. Desempata orden entre iguales. |
| `actualizadoEn` | timestamp | Se toca al marcar, desmarcar o editar. |

**Vive fuera de las operaciones**, igual que `despensa`, `recetas`, `dietas` y
el catálogo de ejercicios: no es el diario de una etapa.

`firestore.rules`: bloque nuevo calcado al de `despensa`.

`js/reinicio.js`: casilla propia, **"materiales"**, sola — mismo motivo que la
despensa: al no archivarse con la operación, es la única forma de borrarla, y
no se junta con "catálogo de ejercicios y tabla" porque son cosas distintas.

## 6. Casos límite

- **Sin conexión al marcar**: la casilla revierte y sale el error.
- **Dos pestañas abiertas**: la lista se lee al abrir la sub-pestaña. Si otra
  pestaña añadió algo, no se ve hasta reabrirla (mismo comportamiento que el
  resto de listas del proyecto).
- **Lista larga**: no se pagina.
- **Nombre con solo signos**: se guarda, no merece validador propio.
- **Todo desmarcado**: el recuento dice "0 de 9 materiales en casa" y la lista
  se enseña entera.

## 7. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/materiales.js` | **Nuevo.** Modelo: validar, listar, guardar, actualizar, marcar, borrar. Reutiliza `normalizar()` de `js/despensa.js`. |
| `index.html` | Sub-pestaña, sección, formulario de alta y contenedor de lista, en `data-de="ejercicio"`. |
| `js/app.js` | Pintado de la lista, altas, marcado, edición, borrado y recuento. |
| `styles.css` | Se reaprovechan las reglas de la despensa; no debería hacer falta CSS nuevo. |
| `firestore.rules` | Bloque de `materiales`. **Publicar con la CLI antes de probar.** |
| `js/reinicio.js` | Casilla "materiales". |

**Estimación: 250-300 líneas**, tomando como referencia la despensa (spec 058,
521 líneas reales) pero descontando lo que aquí no hace falta rehacer: no hay
mensaje de estado vacío distinto por escribir desde cero (se copia el patrón),
y la normalización se reutiliza en vez de escribirse de nuevo. **Si al
implementar se pasa de 300, parar y avisar** (regla 4 de `CLAUDE.md`).

## 8. Decisiones tomadas

- **Lista marcable, sin cantidades ni variantes** (usuario, 30 de agosto):
  mismo criterio que la despensa — un inventario que hay que mantener acaba
  mintiendo.
- **Nace sin marcar** (usuario, 30 de agosto, aplicando directamente la
  corrección que la spec 068 ya hizo en la despensa): escribir la lista no
  afirma nada sobre lo que hay en casa.
- **Vive en Ejercicio, no en Ajustes** (usuario): es material de entrenamiento,
  va donde están el catálogo y la tabla.
- **No entra en la generación de un ejercicio suelto** (usuario, 30 de
  agosto): hoy no existe pedirle a la IA un ejercicio individual, solo tablas
  completas.
- **No se rellena sola desde el catálogo** (usuario, 30 de agosto): a
  diferencia de la despensa (spec 068), se deja para más adelante, viendo
  primero cómo se usa la lista con esta spec ya en producción.

## 9. Fuera de spec: ideas apuntadas

- Que guardar un ejercicio en el catálogo con un material nuevo lo añada solo a
  esta lista, como hace la despensa con las recetas (spec 068).
- Categorías de materiales, si la lista se hace larga de verdad.

## ✅ Para probar a mano

(Lo afina el agente `qa-manual` antes de la prueba.)
