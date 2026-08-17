# 026 — Recetas

- **Estado:** completada (validada por el usuario el 2026-08-17)
- **Fecha:** 2026-08-16
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v3)", punto "Recetas".

## 1. Objetivo

Tener un recetario propio: platos con sus ingredientes y su preparación, que se puedan escribir a mano, corregir y borrar. Es la base sobre la que se montarán las dietas.

## 2. Criterio de "esto funciona"

1. En **Comidas** hay un bloque **"Mis recetas"** con un botón **Nueva receta**.
2. Pulsarlo abre un formulario con: **nombre**, **para cuántas personas**, **ingredientes** (uno por línea) y **preparación**.
3. Guardar una receta la hace aparecer en la lista, con su nombre y sus raciones.
4. Tocar una receta la despliega: se ven sus ingredientes y su preparación.
5. Cada receta tiene **Editar** y **Borrar**, con confirmación al borrar.
6. Editar una receta abre el formulario relleno y guarda los cambios.
7. Sin recetas, el bloque dice qué es y anima a crear la primera.
8. Se ven las **3 últimas** y hay un **"Ver todas (N)"** para desplegar.
9. Las recetas **sobreviven** al finalizar una operación: siguen ahí en la siguiente.
10. En **Ajustes → Reiniciar datos** hay una casilla **recetas** para borrarlas todas.

## 3. Alcance

### Entra

- Colección de recetas, con alta, edición y borrado.
- Bloque en la pantalla de Comidas, con lista recortada y desplegable.
- Casilla propia en el reinicio de datos.
- Reglas de Firestore para la colección nueva.

### NO entra (explícitamente fuera)

- **Guardar recetas que proponga la IA**: llega con las dietas, en la spec 027.
- **Lista de la compra** ni escalar raciones.
- **Datos nutricionales** de la receta: el usuario los descartó al elegir qué guarda una receta.
- **Fotos** de la receta.
- **Buscar** entre las recetas: con unas pocas, la lista basta.

## 4. Comportamiento detallado

### La receta

| Campo | Regla |
|---|---|
| Nombre | obligatorio, máximo 80 caracteres |
| Raciones | número entero de 1 a 20; si se deja vacío, 2 |
| Ingredientes | uno por línea, obligatorio al menos uno; se guardan como lista |
| Preparación | texto libre, opcional, máximo 2000 caracteres |

Mensajes de error: `Ponle nombre a la receta.`, `Las raciones deben estar entre 1 y 20.`, `Escribe al menos un ingrediente.`

### La pantalla

- El bloque va en **Comidas**, entre "Lo de siempre" y "Hacer dieta".
- Lista de tarjetas: nombre y `para 2` a la derecha. Tocar la tarjeta despliega ingredientes y preparación; volver a tocarla la pliega.
- Cada tarjeta desplegada enseña **Editar** y **Borrar**.
- Formulario oculto por defecto; se abre con **Nueva receta** o al editar, y se cierra al guardar o cancelar.
- Recorte a **3** con `Ver todas (N)`, igual que las listas de la spec 013.

### Dónde viven

En `usuarios/{uid}/recetas`, **fuera de las operaciones**. Una receta es tuya, no de una etapa: archivarlas al cerrar una operación te dejaría sin recetario cada vez que empiezas otra.

Por eso tampoco entran en el archivado de la spec 018 ni se pierden al finalizar.

## 5. Modelo de datos

| Ruta | Campos |
|---|---|
| `usuarios/{uid}/recetas/{id}` | `nombre` (string), `raciones` (number), `ingredientes` (array de string), `preparacion` (string), `creadoEn`, `editadoEn` |

**`firestore.rules` cambia**: hay que permitir al dueño leer y escribir en `usuarios/{uid}/recetas`. Se publican con la CLI antes de probar.

## 6. Casos límite

- **Ingredientes con líneas en blanco**: se ignoran las vacías.
- **Nombre repetido**: se permite. Dos formas de hacer lentejas son dos recetas.
- **Receta larguísima**: la preparación se corta a 2000 caracteres al validar.
- **Borrar una receta usada en una dieta**: todavía no hay dietas. Se resuelve en la spec 027.
- **Sin conexión**: mismo comportamiento que el resto de listas.
- **Reiniciar datos** marcando recetas: se borran todas, también las de operaciones anteriores, porque no están archivadas.

## 7. Archivos afectados

| Archivo | Cambio |
|---|---|
| `js/recetas.js` | **nuevo**: validar, guardar, listar, actualizar y borrar |
| `js/app.js` | el bloque de recetas en Comidas |
| `index.html` | formulario y lista |
| `styles.css` | tarjetas de receta |
| `js/reinicio.js` | casilla nueva |
| `firestore.rules` | la colección nueva |

**Estimación: ~280 líneas.**

## 8. Decisiones tomadas

- **Las recetas no se archivan con la operación** → un recetario es conocimiento acumulado, no el diario de una etapa. Perderlo al empezar otra operación sería absurdo.
- **Ingredientes uno por línea** → escribir a mano una lista es más rápido que rellenar campos, y guardarlos separados permite reutilizarlos luego.
- **Sin datos nutricionales** → decisión del usuario al elegir qué guarda una receta.
- **Viven en Comidas, no en una sección propia** → la barra ya tiene cinco botones y las recetas se usan al planificar lo que se come.

## 9. Fuera de spec: ideas apuntadas

- Lista de la compra a partir de las recetas de una semana. → `docs/BACKLOG.md`
- Escalar los ingredientes al cambiar las raciones. → `docs/BACKLOG.md`

## ✅ Para probar a mano

Se prueba junto con el resto de specs de la v3.
