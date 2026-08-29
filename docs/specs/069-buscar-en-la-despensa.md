# 069 — Buscar en la despensa

- **Estado:** ✅ completada (probada y confirmada por el usuario el 2026-08-29).
- **Fecha:** 2026-08-29
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v8)", ampliación del 29 de agosto.

## 1. Objetivo

Encontrar un ingrediente concreto en la despensa escribiendo, sin recorrer la
lista entera.

## 2. Por qué existe

Lo pidió el usuario el 29 de agosto, en la misma conversación que la 068, y las
dos van juntas por un motivo: **desde la 068 la despensa se llena sola**. Deja de
ser una lista de quince cosas que escribiste tú y pasa a crecer con cada receta.
Ordenada solo por "lo tengo", encontrar el orégano se vuelve un ejercicio de
paciencia.

Se prefirió el buscador a agrupar por tipos: resuelve el mismo problema, cuesta
mucho menos y no obliga al usuario a clasificar nada.

## 3. Criterio de "esto funciona"

1. Con la despensa larga hay un campo **Buscar** encima de la lista.
2. Escribir filtra la lista **al momento**, sin pulsar nada.
3. Encuentra sin tildes ni mayúsculas: "jamon" encuentra "Jamón".
4. Encuentra por el medio de la palabra: "verdura" encuentra "mix de verduras
   congelado".
5. Si no hay coincidencias, **lo dice** en vez de dejar la lista vacía sin
   explicación.
6. Hay forma de **limpiar** la búsqueda de un toque.
7. El recuento de arriba sigue hablando de **la despensa entera**, no de lo
   filtrado.
8. Marcar, editar y borrar funcionan igual con la lista filtrada.
9. Con la despensa corta, **el buscador no se enseña**.

## 4. Alcance

### Entra

- El campo de búsqueda, el filtrado en vivo, el mensaje de "no hay nada" y el
  botón de limpiar.

### NO entra (explícitamente fuera)

- **Agrupar por tipos.** Descartado en favor de esto.
- **Buscar en las recetas o en la dieta.** Solo la despensa.
- **Recordar la búsqueda** entre visitas. Es un estado de mirar.

## 5. Comportamiento detallado

El campo aparece a partir de **8 ingredientes**. Por debajo, la lista entera cabe
de un vistazo y un buscador solo estorba.

Se compara **normalizado** con la misma función que usa todo lo demás de la
despensa (sin tildes, en minúsculas), y por **contenido**, no por principio de
palabra: se busca lo que uno recuerda, no cómo empieza.

**El recuento no cambia al filtrar.** Dice cuántos tienes de cuántos hay, y eso
es un dato de la despensa, no de lo que se está mirando.

**Al añadir un ingrediente, la búsqueda se limpia.** Si no, lo recién añadido
podría no coincidir con el filtro y parecería que no se ha guardado.

## 6. Modelo de datos

Ninguno. La búsqueda es una variable de módulo.

## 7. Casos límite

- **Búsqueda sin resultados**: se dice, con el texto buscado.
- **Solo espacios**: se trata como búsqueda vacía.
- **Filtrar y marcar**: funciona; la lista no se reordena al marcar, igual que
  sin filtro (spec 058).
- **Borrar el último resultado visible**: la lista queda vacía y sale el mensaje.

## 8. Archivos afectados

| Archivo | Qué |
|---|---|
| `index.html` | El bloque de búsqueda. |
| `js/app.js` | El filtrado y sus dos manejadores. |

Estimación: **40-60 líneas**.

## 9. Decisiones tomadas

- **Buscador en vez de agrupar por tipos** (usuario, 29 de agosto).

## 10. Fuera de spec: ideas apuntadas

- Ninguna todavía.

## ✅ Para probar a mano

(Lo afina el agente `qa-manual` antes de la prueba.)
