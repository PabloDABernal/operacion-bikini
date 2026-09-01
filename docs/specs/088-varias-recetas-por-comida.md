# 088 — Varias recetas o ingredientes por comida

- **Estado:** borrador
- **Fecha:** 2026-09-01
- **Referencia en PRODUCTO.md:** apartado "Qué hará (evolutivos de la fase productiva, desde el 31 de agosto de 2026)", entrada "Una comida puede tener varias recetas o ingredientes sueltos"

## 1. Objetivo

Al editar una comida (apuntada o en la casilla de un día de Mi dieta), poder
enlazarla a varias recetas y/o varios ingredientes sueltos de la despensa, no
solo a uno. El texto que se guarda es la suma de sus nombres, y desde el día
se puede abrir cada una de sus recetas/ingredientes, no solo el primero.

## 2. Criterio de "esto funciona"

1. Abres una comida ya guardada que tiene dos platos en el texto pero solo
   uno enlazado a receta (el caso real: "Crema de zanahoria. 1 hamburguesa de
   ternera", con la hamburguesa enlazada y la crema sin enlazar). La editas,
   añades también la receta de la crema, guardas.
2. El texto de la comida pasa a ser la suma de los nombres de ambas recetas
   ("Crema de zanahoria. Hamburguesa de ternera"), sustituyendo lo que hubiera
   escrito antes (puedes reescribirlo a mano si quieres otra cosa).
3. En Mi dieta (o en el diario), la comida muestra un solo icono de "ver
   receta". Al tocarlo, ves un desplegable con las dos recetas listadas por su
   nombre; tocando cada una se abre su detalle igual que hoy.
4. Repites el mismo caso pero añadiendo, en vez de una segunda receta, un
   ingrediente suelto de la despensa (p. ej. "un yogur"): el texto suma
   también su nombre, y el desplegable lo lista junto a las recetas.
5. Marcas "me lo he comido" en una comida con dos recetas: se apunta una
   ración de cada una a la vez (no hay botón independiente por receta).
6. Abres una comida antigua (antes de esta spec) que solo tenía una receta
   enlazada con el campo antiguo: se ve y se edita igual que las nuevas, sin
   ningún error ni aviso raro.

## 3. Alcance

### Entra
- El formulario de editar una comida (desde el diario de Comidas y desde
  "ver receta → Editar" en Mi dieta) pasa a permitir añadir/quitar varias
  líneas, cada una una receta del Recetario o un ingrediente suelto de la
  despensa (mismo selector que ya existe hoy para elegir una, repetido con
  un botón "Añadir otra").
- El texto de la comida se recalcula como la suma de los nombres elegidos,
  unidos con ". ", cada vez que cambia la lista de recetas/ingredientes
  seleccionados — pero sigue siendo un campo de texto editable a mano por
  encima de esa propuesta (igual que hoy: la suma rellena el campo, no lo
  bloquea).
- En Mi dieta / Mi tabla y en el diario de Comidas, la comida con una o más
  recetas/ingredientes enlazados enseña un solo icono de "ver receta"; si
  hay más de una, tocarlo abre un desplegable con la lista de nombres, cada
  uno llevando a su detalle (receta o ingrediente) como ya funciona hoy para
  una sola.
- "Me lo he comido" (o el equivalente al marcar la casilla del día) apunta
  una ración de cada receta enlazada a la vez.
- Migración: un script que reescribe, para un usuario dado, los documentos
  de `comidas` que tengan el campo antiguo `recetaId` o `ingredienteSueltoId`
  (string) a la lista nueva. Se ejecuta primero contra la cuenta de
  pablodabernal; la del otro usuario se hace más adelante, a la orden.

### NO entra (explícitamente fuera)
- Migrar el formato de ingredientes DENTRO de una receta (spec 082, el
  "puñado de repollo" sin estructurar): es un asunto distinto, anotado en
  `docs/BACKLOG.md`.
- Marcado independiente por receta dentro de una misma comida ("me comí la
  crema pero no la hamburguesa"): se marcan todas juntas.
- Límite al número de recetas/ingredientes por comida: no lo hay.
- Cambiar cómo se genera el texto cuando la IA propone una dieta o un menú
  (076): esta spec toca el formulario de edición manual, no la generación
  automática.

## 4. Comportamiento detallado

*(a rellenar en la sesión de implementación, con el detalle de pantallas y
mensajes — la spec ya fija el comportamiento observable en las secciones 2 y
3, que es lo que ata las decisiones de producto)*

## 5. Modelo de datos

`comidas/{id}` — cambia el campo de enlace:

- Antes: `recetaId: string` (o vacío) **o** `ingredienteSueltoId: string` (o
  vacío) — como mucho uno de los dos con valor.
- Ahora: `enlaces: { tipo: "receta" | "ingrediente", id: string }[]` —
  lista, puede estar vacía, puede mezclar recetas e ingredientes.

Tras la migración, `recetaId` e `ingredienteSueltoId` dejan de escribirse;
todo el código que los lee pasa a leer `enlaces`. La migración por usuario
reescribe los documentos existentes; no queda código que siga los dos
formatos a la vez salvo mientras el otro usuario no se haya migrado (ver
sección 6).

## 6. Casos límite

- Una comida sin ninguna receta ni ingrediente enlazado (texto suelto,
  como la mayoría de la dieta): sigue sin icono de "ver receta", igual que
  hoy.
- El usuario del segundo email, mientras no se ejecute su migración, sigue
  teniendo comidas con el campo antiguo: el código de lectura debe seguir
  entendiendo el formato antiguo hasta que se confirme que los dos usuarios
  están migrados (después, se puede quitar esa compatibilidad en una
  limpieza aparte).
- Añadir la misma receta dos veces a una comida: se permite (igual que un
  ingrediente puede repetirse en una receta, spec 082) — no se deduplica.
- Quitar todas las recetas/ingredientes de una comida que los tenía: el
  texto deja de sumarse automáticamente, pero lo que hubiera escrito queda
  tal cual (no se borra el texto al vaciar los enlaces).
- Una receta o ingrediente enlazado que se borró después de enlazarlo: igual
  que hoy con una sola, esa línea del desplegable no debe romper la lista
  (se salta o se enseña como no disponible).

## 7. Archivos afectados

*(a estimar en la sesión de implementación tras localizar todos los
lectores/escritores de `recetaId`/`ingredienteSueltoId` — al menos
`js/app.js`, `js/recetas.js`, `js/despensa.js`, `js/dietas.js` según lo visto
al escribir esta spec, y un script nuevo de migración)*

## 8. Decisiones tomadas

- **Texto final = suma de nombres unidos con ". "**, editable a mano por
  encima. Decisión del usuario, 2026-09-01.
- **"Me lo he comido" marca todas las recetas/ingredientes de la comida a la
  vez**, no una por una. Decisión del usuario, 2026-09-01.
- **Sin límite de recetas/ingredientes por comida.** Decisión del usuario,
  2026-09-01.
- **Un solo icono de "ver receta" por comida, con desplegable si hay
  varias.** Decisión del usuario, 2026-09-01.
- **Se migran los documentos existentes** (no se deja convivir el formato
  antiguo sin más), ejecutado primero contra pablodabernal y luego, a la
  orden, contra el otro usuario. Decisión del usuario, 2026-09-01.
- **La migración de ingredientes DENTRO de una receta (formato de la spec
  082) queda fuera de esta spec** y anotada en `docs/BACKLOG.md`. Decisión
  del usuario, 2026-09-01: son dos asuntos distintos aunque salieran en la
  misma conversación.

## 9. Fuera de spec: ideas apuntadas

- Migrar el formato de ingredientes de las recetas antiguas al estructurado
  de la spec 082 → `docs/BACKLOG.md`.

## ✅ Para probar a mano

*(lo rellena/afina el agente `qa-manual` antes de la prueba, siguiendo el
criterio de la sección 2)*
