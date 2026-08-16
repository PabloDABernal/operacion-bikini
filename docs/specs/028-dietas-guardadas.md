# 028 — Dietas: la semana de menús, guardada y editable

- **Estado:** revisada
- **Fecha:** 2026-08-16
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v3)", punto "Dietas".

## 1. Objetivo

Que una dieta deje de ser un texto que se lee y pase a ser una semana de verdad: siete días con sus comidas, que se guarda, se puede corregir a mano, se apoya en tus recetas y desde la que se apunta lo que has comido con un toque.

## 2. Criterio de "esto funciona"

1. En **Comidas** hay un bloque **"Mi dieta"** con la semana en filas: lunes a domingo, y en cada día desayuno, comida, merienda y cena.
2. Pedirle una dieta a la IA la guarda como semana y la enseña ahí, ya no como un bloque de texto.
3. Las **recetas que proponga** la IA aparecen en **Mis recetas**, con sus ingredientes y su preparación.
4. Tocar cualquier comida la deja **editar a mano**: se cambia el texto y se guarda.
5. Al editar, un desplegable permite **meter una receta tuya** y rellena el texto con su nombre.
6. Cada comida tiene un botón **"Me lo he comido"** que la apunta hoy, con su momento, sin escribir nada.
7. Después de usarlo, esa comida aparece en **Mis comidas** y el resumen de "Hoy" la recoge.
8. Hay un botón **"Semana en blanco"** para montar la dieta desde cero, sin IA.
9. Solo hay **una dieta activa**. Pedir otra la sustituye, avisando antes.
10. La dieta **sobrevive** al finalizar una operación, igual que las recetas.

## 3. Alcance

### Entra

- Colección de dietas, con una activa.
- Generación por IA que devuelve la semana **estructurada** y las recetas de los platos principales.
- Guardado automático de esas recetas en el recetario, sin duplicar las que ya existan.
- Edición a mano de cualquier comida, con ayuda del recetario.
- Semana en blanco para montarla uno mismo.
- **"Me lo he comido"**: apunta esa comida hoy.

### NO entra (explícitamente fuera)

- **Varias dietas guardadas a la vez** ni historial: hay una activa y punto.
- **Lista de la compra**.
- **Que la dieta cambie sola** según lo que apuntes.
- **Tablas de ejercicio**: son la spec 029, hermana de esta.
- **Datos nutricionales** de la dieta: la spec 030.
- Arrastrar comidas de un día a otro.

## 4. Comportamiento detallado

### La semana

Siete días fijos, de lunes a domingo. Cada día, cuatro comidas: **desayuno, comida, merienda y cena**. Cada comida es un texto corto (el plato) y, si viene de una receta, su identificador.

Una comida vacía se ve como un hueco con un `+` para rellenarla.

### Pedirla a la IA

- El botón de **Hacer dieta** de la spec 027 sigue igual, con su campo de instrucciones y su cupo de 2 al día.
- Lo que cambia es lo que devuelve: en vez de un texto, la semana estructurada más una lista de recetas.
- Al llegar:
  1. Se guardan las **recetas nuevas** (las que no existan ya con el mismo nombre, comparando sin mayúsculas ni espacios de más).
  2. Se guarda la **dieta** como activa, sustituyendo a la anterior.
  3. Se pinta la semana.
- Si ya había una dieta activa, se avisa antes: `Ya tienes una dieta. ¿La sustituyo?`

### Editarla

- Tocar una comida abre una fila de edición con: el texto, un desplegable **"o usa una receta tuya"** y los botones Guardar y Cancelar.
- Elegir una receta del desplegable escribe su nombre en el texto y la deja enlazada.
- Se guarda la dieta entera: son 28 celdas, cabe de sobra en un documento.

### "Me lo he comido"

- Cada comida con texto lleva ese botón.
- Al pulsarlo se guarda una comida con **ese texto**, **ese momento** y la **fecha de hoy**, con `guardarComida()`, igual que si la hubieras escrito.
- Sale la confirmación de siempre y la lista de comidas se refresca.
- No se marca nada en la dieta: la dieta es el plan, no el diario. Que hayas comido el lunes lo que ponía el jueves es asunto tuyo.

### Dónde vive

En `usuarios/{uid}/dietas`, **fuera de las operaciones**, como el recetario: una dieta que funcionó sigue sirviendo en la etapa siguiente.

## 5. Modelo de datos

| Ruta | Campos |
|---|---|
| `usuarios/{uid}/dietas/{id}` | `activa` (bool), `dias` (array de 7 objetos con `dia` y `comidas`), `instrucciones` (string), `creadoEn` |

Cada comida: `{ momento, texto, recetaId }`. `recetaId` puede faltar.

**`firestore.rules` cambia**: colección nueva. Se publican con la CLI antes de probar.

## 6. Casos límite

- **La IA devuelve menos de siete días**: se completan los que falten en blanco.
- **La IA devuelve una receta con el nombre de una que ya tienes**: no se duplica; la comida se enlaza a la que ya existía.
- **Borrar una receta enlazada**: la comida conserva su texto y se queda sin enlace. No se rompe nada.
- **"Me lo he comido" dos veces**: se apunta dos veces. Es lo mismo que escribirlo dos veces.
- **Sin dieta**: el bloque explica qué es y ofrece pedirla o empezar en blanco.
- **Reiniciar datos**: la dieta se borra con la casilla de recetas, que pasa a llamarse "recetas y dietas".
- **Sin conexión al editar**: mensaje de error y la celda se queda abierta con lo escrito.

## 7. Archivos afectados

| Archivo | Cambio |
|---|---|
| `js/dietas.js` | **nuevo**: la semana, guardar, editar y leer |
| `api/dieta.js` | **nuevo**: pide la semana estructurada y sus recetas |
| `js/app.js` | el bloque de la dieta en Comidas |
| `index.html` | la semana y su edición |
| `styles.css` | la rejilla de la semana |
| `js/reinicio.js` | la casilla pasa a borrar también las dietas |
| `firestore.rules` | la colección nueva |
| `vercel.json` | la función nueva |

**Estimación: ~450 líneas.** Es la spec más grande del proyecto. Se avisó al usuario.

## 8. Decisiones tomadas

- **Una sola dieta activa** → un historial de dietas no aporta nada y multiplica la pantalla.
- **La IA devuelve la semana estructurada, no texto** → sin eso no se puede editar ni apuntar con un toque, que es lo que pidió el usuario.
- **Las recetas propuestas se guardan solas** → el usuario pidió que las recetas de las dietas acabasen en su recetario.
- **"Me lo he comido" no marca la dieta** → la dieta es el plan y las comidas son el diario. Mezclarlos obliga a decidir qué pasa cuando comes otra cosa.
- **La dieta vive fuera de las operaciones** → misma razón que el recetario.

## 9. Fuera de spec: ideas apuntadas

- Guardar varias dietas y poder recuperar una anterior. → `docs/BACKLOG.md`
- Lista de la compra de la semana. → `docs/BACKLOG.md`

## ✅ Para probar a mano

Se prueba junto con el resto de specs de la v3.
