# 080 — El texto recortado se despliega al tocarlo

- **Estado:** borrador
- **Fecha:** 2026-08-31
- **Referencia en PRODUCTO.md:** "Qué hará (evolutivos de la fase productiva, desde el 31 de agosto de 2026)"

## 1. Objetivo

En cualquier pantalla donde un nombre o título se recorta con puntos
suspensivos por no caber en su fila, tocarlo lo despliega entero en su sitio
—sin entrar en modo edición—, y volver a tocarlo lo contrae.

## 2. Criterio de "esto funciona"

1. En Comidas → Mi dieta, un plato con un nombre largo se ve cortado a dos
   líneas. Al tocar el nombre, se despliega entero (todas las líneas que
   hagan falta) en el sitio de la fila. Al volver a tocarlo, vuelve a las dos
   líneas de antes.
2. Si ese mismo plato tiene receta enlazada, el icono de la receta sigue
   abriendo y cerrando la receta exactamente igual que hoy, sin que tocar el
   nombre interfiera.
3. En Ejercicio → Mi tabla, un título de sesión largo se ve cortado a una
   línea. Al tocarlo, se despliega entero. Al volver a tocarlo, se recorta de
   nuevo.
4. En Histórico → abrir una operación archivada, una comida o un ejercicio
   con texto largo se ve cortado a una línea. Al tocarlo, se despliega
   entero; al volver a tocarlo, se recorta.
5. En Comidas → Recetario, el nombre de una receta largo se ve cortado a una
   línea en la cabecera de su tarjeta, tanto cerrada como abierta. Tocar el
   nombre lo despliega entero sin cerrar ni abrir la tarjeta (eso lo sigue
   haciendo tocar el resto de la cabecera, como hoy).
6. En Ejercicio → Catálogo de ejercicios, lo mismo que el punto 5 pero con el
   nombre del ejercicio.
7. En cualquiera de las pantallas de arriba, pueden estar varios nombres
   desplegados a la vez sin que desplegar uno contraiga los demás.
8. Un nombre que ya cabe entero (no está recortado) se puede tocar igual y no
   pasa nada visible: no hay error ni parpadeo.

## 3. Alcance

### Entra
- Comidas → Mi dieta: `.plato-nombre` (`nombreDelPlato()` / `filaDeComida()`
  en `js/app.js`).
- Ejercicio → Mi tabla: el título de sesión en `.registro-texto`
  (`filaDeSesion()` en `js/app.js`).
- Histórico → operación archivada: comidas y ejercicios listados con
  `.registro-texto` (dentro de la vista de detalle del histórico).
- Comidas → Recetario y Ejercicio → Catálogo de ejercicios: ambos comparten
  la clase `.receta-nombre` (`tarjetaDeReceta()` y `tarjetaDeEjercicio()` en
  `js/app.js`), así que se arreglan juntos con el mismo cambio.
- Un estado de "desplegado" por elemento, independiente entre sí y de
  cualquier otro estado de la pantalla (receta abierta, edición, etc.).

### NO entra (explícitamente fuera)
- El diario del día a día (Comidas/Ejercicio, lista de "hoy" o del rango de
  fechas): ya no se recorta, se parte en varias líneas desde una spec
  anterior.
- Cambiar el criterio de cuándo se recorta (nº de líneas, ancho de columna):
  se mantiene igual que ahora, solo se añade la forma de ver el texto
  completo.
- Tocar el nombre para editar: eso lo sigue haciendo solo el lápiz.
- Accesibilidad más allá de lo que ya tienen estos elementos (aria-expanded
  en los que ya son `<button>`).

## 4. Comportamiento detallado

- Cada nombre/título afectado se convierte en (o ya es, en los casos que ya
  son `<button>`) un elemento tocable con su propio estado local de
  desplegado/contraído, guardado en memoria (no en Firestore, no sobrevive a
  recargar la página).
- Desplegado: se quita el recorte (line-clamp o el trío
  overflow/ellipsis/nowrap, según el sitio) y el texto se parte en tantas
  líneas como haga falta, igual que ya hace `.registro-que` en el diario.
- Contraído (por defecto, estado inicial siempre): vuelve al recorte actual
  de cada sitio (2 líneas en Mi dieta, 1 línea en los demás).
- En Mi dieta, el nombre y el icono de receta son dos zonas tocables
  independientes: tocar una no afecta al estado de la otra.
- En Recetario y Catálogo de ejercicios, el nombre es una zona tocable
  independiente DENTRO de la cabecera, que a su vez sigue siendo tocable
  para abrir/cerrar la tarjeta entera. Tocar el nombre no debe además
  abrir/cerrar la tarjeta (evitar que el toque se propague al botón de la
  cabecera).
- Sin marcador visual de "esto se puede desplegar" más allá de lo que ya
  exista (los `<button>` que ya avisan de que reaccionan); si se decide
  añadir alguno, es una decisión de diseño a tomar en revisión, no algo que
  se dé por hecho al implementar.

## 5. Modelo de datos

Ninguno. Es estado de interfaz en memoria (equivalente a `recetaDeDietaAbierta`
o `recetaAbierta`, pero puede haber varios desplegados a la vez, así que es un
conjunto/Set de claves en vez de una sola clave).

## 6. Casos límite

- Texto que ya cabe sin recortarse: tocar no cambia nada visible (no hay
  "línea de más" que mostrar).
- Cambiar de pantalla o repintar la lista (nuevo dato llega, se apunta algo):
  el estado de desplegado en memoria se puede perder sin que sea un fallo —
  no es información que el usuario espere que persista.
- Mi dieta: un plato sin receta enlazada (el caso normal, ~46 de 96) se
  comporta igual que uno con receta: el nombre se despliega igual, solo que
  no hay icono de receta al lado.
- Recetario/Catálogo: tocar el nombre cuando la tarjeta ya está abierta debe
  desplegar el nombre sin cerrar la tarjeta; tocarlo con la tarjeta cerrada
  debe desplegarlo sin abrirla.

## 7. Archivos afectados

- `js/app.js`: `filaDeComida()`, `nombreDelPlato()`, `filaDeSesion()`,
  `tarjetaDeReceta()`, `tarjetaDeEjercicio()`, la vista de detalle del
  histórico, y el estado nuevo (un Set de claves desplegadas, o uno por
  pantalla).
- `styles.css`: `.plato-nombre`, `.registro-texto`, `.receta-nombre`, y una
  clase nueva de "desplegado" que anule el recorte de cada una.

## 8. Decisiones tomadas

- **Un toque más en el mismo nombre lo contrae** (interruptor), igual que ya
  funciona el icono de la receta en Mi dieta. Decisión del usuario.
- **Varios nombres pueden estar desplegados a la vez**, cada uno
  independiente: no hay coste de pantalla como el de abrir una receta entera
  (ingredientes y pasos), así que no hace falta limitarlo a uno. Decisión del
  usuario.
- **Alcance: las cuatro pantallas con el problema, más el Catálogo de
  ejercicios** (que comparte clase con el Recetario y sale gratis al
  arreglar una). El diario del día a día queda fuera porque ya está
  arreglado. Decisión del usuario.
- **En Mi dieta, desplegar el nombre y abrir la receta son dos acciones
  separadas** (no un único gesto que haga las dos cosas). Decisión del
  usuario.

## 9. Fuera de spec: ideas apuntadas

Ninguna.

## ✅ Para probar a mano

(Lo afina el agente `qa-manual` antes de la prueba; guion provisional.)

1. Con una dieta de la semana cargada, busca un plato con nombre largo (o
   edítalo para alargarlo) en Comidas → Mi dieta. Comprueba que se ve
   cortado a dos líneas.
2. Tócalo: debe desplegarse entero. Tócalo otra vez: debe volver a
   recortarse.
3. Si ese plato tiene receta enlazada, comprueba que el icono de la receta
   la abre/cierra igual que siempre, sin que afecte al estado del nombre ni
   viceversa.
4. Repite en Ejercicio → Mi tabla con un título de sesión largo.
5. Cierra una operación y ábrela desde el Histórico; busca una comida o
   ejercicio con texto largo y comprueba que se despliega igual.
6. En Comidas → Recetario, busca una receta de nombre largo. Tócalo: debe
   desplegarse sin abrir la tarjeta. Toca el resto de la cabecera: debe abrir
   la tarjeta (con el nombre otra vez recortado si no lo tocaste a él).
7. Repite en Ejercicio → Catálogo de ejercicios con un ejercicio de nombre
   largo.
8. Despliega dos o tres nombres a la vez en la misma pantalla y comprueba
   que los que no tocaste siguen recortados.
