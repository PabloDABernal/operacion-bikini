# 102 — Un solo campo con sugerencias del catálogo de ejercicio

- **Estado:** ✅ completada, probada por el usuario en producción el 8 de septiembre de 2026
- **Fecha:** 2026-09-07
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v17: lo mismo, para Ejercicio)", segundo punto

## 1. Objetivo

En Ejercicio → Apuntar → "Nuevo ejercicio", el campo "Qué has hecho" pasa de
ser texto libre puro a sugerir, mientras se escribe, los ejercicios del
Catálogo que coincidan. Elegir uno enlaza el registro del diario con ese
ejercicio del catálogo. Cierra la asimetría de que Mi tabla ya enlaza cada
ejercicio de una sesión con el catálogo (spec 029) y el diario nunca lo ha
hecho.

## 2. Criterio de "esto funciona"

1. Entro en Ejercicio → Apuntar. El campo "Qué has hecho" sigue teniendo el
   mismo aspecto de siempre.
2. Escribo "sent". Aparece una lista de sugerencias con los ejercicios de mi
   Catálogo cuyo nombre contiene "sent" (por ejemplo "Sentadillas
   búlgaras").
3. Toco esa sugerencia. El campo se vacía y debajo aparece un chip con su
   nombre.
4. Escribo "zanc" y elijo "Zancadas" de las sugerencias. Se añade un segundo
   chip junto al primero.
5. Relleno minutos e intensidad como siempre, y guardo. En "Lo que llevo
   apuntado" veo un registro con el texto "Sentadillas búlgaras. Zancadas",
   enlazado a los dos ejercicios del catálogo.
6. Repito el alta pero esta vez solo escribo "bici por el paseo" sin elegir
   ninguna sugerencia, y lo guardo. Se apunta como texto libre, sin enlazar
   nada — igual que siempre.
7. Elijo un ejercicio de las sugerencias, luego quito su chip con la ×. El
   campo vuelve a aceptar texto libre para ese registro.
8. Sin ningún ejercicio guardado en el Catálogo, escribo lo que sea: no
   aparece ninguna sugerencia y el campo funciona como texto libre sin más.

## 3. Alcance

### Entra
- El campo "Qué has hecho" sugiere, mientras se escribe (a partir de 2
  caracteres), los ejercicios del Catálogo cuyo nombre contenga el texto
  escrito.
- **Se pueden elegir varios ejercicios del catálogo a la vez**, sumándose
  como chips, igual que las recetas de comida (spec 099). Coherente con que
  una sesión de Mi tabla ya puede llevar varios ejercicios enlazados.
- Cada chip se quita con ×.
- **Elegir una sugerencia sustituye lo que hubiera escrito a mano** y vacía
  el campo. Mientras haya al menos un chip, el campo **no admite texto libre
  para ese registro**: es una cosa (chips) o la otra (texto a mano), igual
  que en comida (spec 099). Quitar todos los chips devuelve el campo a texto
  libre.
- Sin ninguna sugerencia elegida, el registro se guarda como texto libre sin
  enlazar nada, exactamente igual que hoy.
- El texto final que se guarda, con chips, es la unión de sus nombres con
  ". ", en el orden en que se eligieron — mismo criterio que
  `textoDeChipsComida()` en comida.
- **Modelo de datos nuevo**: el ejercicio del diario gana `ejercicioIds`
  (lista de ids del Catálogo), análogo a `recetaIds` en comida.

### NO entra (explícitamente fuera)
- **No toca los minutos, la intensidad, la distancia, la fecha ni la hora**
  del formulario: siguen exactamente igual.
- **No toca los chips de "ejercicios frecuentes"** (spec 042): siguen
  rellenando el formulario en vez de guardar directamente, sin relación con
  las sugerencias del catálogo.
- **No toca "Lo he hecho"** (Mi tabla ni el bloque "Lo que toca hoy" de la
  spec 101): siguen apuntando el título de la sesión tal cual, sin enlazar
  con el catálogo. Es una asimetría que queda anotada en la sección 9, no se
  arregla aquí.
- **No toca la edición de un ejercicio ya guardado** (spec 007): el editor
  en línea del diario sigue como está, sin el campo de sugerencias.
- **No toca el Catálogo** ni el armario de material.

## 4. Comportamiento detallado

Espejo exacto del campo único de comidas (spec 099), pero con una sola
fuente de sugerencias (el Catálogo de ejercicio) en vez de dos (recetas e
ingredientes):

- El campo (hoy `<input type="text" id="ejercicio-texto">`) sugiere mientras
  se escribe, comparando sin tildes ni mayúsculas (mismo criterio que
  `normalizar()` de la despensa).
- Elegir una sugerencia añade un chip con su nombre, vacía el campo y deja
  seguir buscando para sumar otro.
- El texto final, con uno o más chips, es la unión de sus nombres con ". ",
  en el orden en que se añadieron.
- Sin ningún chip, el texto es el que se haya escrito a mano.
- El envío manda `ejercicioIds` (los ids de los chips), además de todo lo
  que ya mandaba (minutos, intensidad, fecha, hora, distancia).

## 5. Modelo de datos

`ejercicio.ejercicioIds` (lista de strings), campo nuevo. No hay campo
anterior que migrar (a diferencia de `ingredienteId`→`ingredienteIds` en la
spec 099): el diario de ejercicio nunca ha tenido ningún enlace, así que no
hace falta ninguna función que lea "las dos formas".

Las reglas de Firestore no distinguen tipos de campo dentro de un ejercicio,
así que **no hace falta tocarlas**.

## 6. Casos límite

- **Sin ejercicios en el Catálogo**: no aparece ninguna sugerencia; el campo
  se comporta como texto libre puro.
- **El texto escrito coincide exacto con un ejercicio del catálogo pero no
  se elige de la lista**: se guarda como texto libre, sin enlazar nada.
  Enlazar es un acto explícito.
- **Un ejercicio del catálogo enlazado se borra después**: el enlace se
  queda apuntando a un id que ya no existe, igual que pasa hoy con una
  receta borrada en comida — el nombre deja de encontrarse al mostrarlo, sin
  romper nada.
- **Dos ejercicios del catálogo con nombres parecidos** (por ejemplo
  "Sentadillas" y "Sentadillas búlgaras"): los dos aparecen en la lista de
  sugerencias, elegir uno no afecta al otro.
- **La unión de varios nombres supera el máximo de caracteres**
  (`MAX_CARACTERES` en `js/ejercicios.js`, 200 — más fácil de tocar aquí que
  en comida, que tiene 500). Sin comportamiento especial: `validarEjercicio()`
  ya rechaza cualquier texto que se pase de ese límite con su error de
  siempre ("Máximo 200 caracteres."), venga de chips o de texto a mano.

## 7. Archivos afectados

- `index.html`: el campo `ejercicio-texto` gana su lista de sugerencias y su
  zona de chips debajo, mismo patrón que `comida-texto` en la spec 099.
- `js/app.js`: lógica de sugerencias y chips para el ejercicio (espejo de
  `sugerenciasDeComida`/`pintarSugerenciasComida`/`pintarChipsComida`/
  `textoDeChipsComida` de la spec 099, con una sola fuente); el submit de
  "Nuevo ejercicio" manda `ejercicioIds`.
- `js/ejercicios.js`: `validarEjercicio()` y `guardarEjercicio()` ganan el
  parámetro `ejercicioIds` (lista, opcional, por defecto vacía).
- `styles.css`: puede reutilizar `.campo-con-sugerencias`, `.sugerencias-comida`
  y `.chip-receta` de la spec 099 tal cual, o duplicarlas con nombre propio
  si conviene más al implementar.
- `docs/specs/102-...-casos.mjs`: casos de `validarEjercicio()` con
  `ejercicioIds`.

**Trampa a evitar**: no confundir `js/comidas.js` con `js/ejercicios.js` al
copiar el patrón — son archivos distintos, y esta spec no debe tocar nada de
comidas.

**Tamaño estimado**: parecido a la spec 099 pero más simple (una sola fuente
de sugerencias en vez de dos, sin cantidad por chip, sin cambio de esquema
en un campo ya existente). Debería quedarse por debajo de las ~300 líneas.

## 8. Decisiones tomadas

- **Se pueden enlazar varios ejercicios del catálogo a la vez**, sumados
  como chips. Decisión del usuario, coherente con que una sesión de Mi tabla
  ya puede llevar varios ejercicios.
- **Elegir una sugerencia sustituye lo escrito a mano**, y mientras haya
  chips no se puede mezclar con texto libre. Decisión del usuario, mismo
  criterio que la spec 099.

## 9. Fuera de spec: ideas apuntadas

- **"Lo he hecho" no lleva los enlaces de la sesión al diario.** Al escribir
  esta spec se vio que una sesión de Mi tabla ya enlaza cada uno de sus
  ejercicios con el catálogo (spec 029), pero apuntarla con "Lo he hecho"
  (Mi tabla o el bloque "Lo que toca hoy", spec 101) solo copia el título de
  la sesión al diario, sin llevarse esos enlaces. Con `ejercicioIds` ya
  existiendo en el diario tras esta spec, cerrarlo sería sencillo, pero es
  una ampliación aparte: queda anotada, no se hace aquí.

## ✅ Para probar a mano

(la rellena/afina el agente `qa-manual` antes de la prueba)
