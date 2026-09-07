# 103 — Estadísticas de qué entrenas

- **Estado:** borrador
- **Fecha:** 2026-09-07
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v17: lo mismo, para Ejercicio)", tercer punto

## 1. Objetivo

En Ejercicio, un bloque nuevo que resuma cuántas sesiones apuntas, cuántas
van enlazadas a un ejercicio del Catálogo (spec 102), y qué ejercicios
repites más. Mismo tipo de resumen que "Qué comes" (spec 095), para
ejercicio.

## 2. Criterio de "esto funciona"

1. Sin ningún ejercicio apuntado, entro en Ejercicio → Apuntar y bajo hasta
   el final. Veo un bloque "Qué entrenas" con un texto que dice que aún no
   hay nada que contar.
2. Apunto una sesión escribiéndola a mano, sin elegir ninguna sugerencia del
   catálogo. El bloque dice que tengo 1 sesión apuntada, 0 enlazadas.
3. Apunto otra sesión eligiendo un ejercicio del Catálogo (chip, spec 102).
   El bloque pasa a decir 2 sesiones, 1 enlazada.
4. Debajo de los números veo una lista de "Los ejercicios que más repites",
   con el que acabo de enlazar.
5. Repito el mismo ejercicio del catálogo varias veces en distintos días. En
   la lista de "más repites" sube en la cuenta.
6. Los números se separan en: de hoy, últimos 7 días, últimos 30 días, y
   desde que empecé.

## 3. Alcance

### Entra
- Bloque "Qué entrenas" en Ejercicio → Apuntar, después de "Cuánto llevas
  andado" (spec 087).
- Cuatro líneas: hoy, últimos 7 días, últimos 30 días, y total — cada una con
  cuántas sesiones y cuántas de ellas van enlazadas a algún ejercicio del
  catálogo (con su porcentaje, igual que "Qué comes").
- Lista de "los ejercicios que más repites" (hasta 5), calculada sobre los
  últimos 30 días, contando cada ejercicio del catálogo que aparece en algún
  registro enlazado.
- Estados vacíos: sin ninguna sesión apuntada, y con sesiones pero ninguna
  enlazada — mismo criterio que "Qué comes" (mensajes que dicen qué hacer,
  no un "0%" seco).
- Cálculo puro sobre lo que ya está cargado en memoria (el diario de
  ejercicio y el Catálogo): ninguna lectura nueva a Firestore.

### NO entra (explícitamente fuera)
- **No toca "Cuánto llevas andado"** (spec 087): sigue siendo su propio
  bloque, con sus propios números de distancia.
- **No cuenta minutos ni intensidad**: solo cuenta sesiones y enlaces,
  igual que "Qué comes" no cuenta calorías.
- **No toca "Lo he hecho"** (specs 029/101): esta spec no cambia lo que se
  guarda al apuntar desde Mi tabla, solo lee lo que ya hay en el diario.
- **No pagina ni permite elegir el rango**: las ventanas son fijas (hoy, 7,
  30, total), igual que "Qué comes".

## 4. Comportamiento detallado

Espejo de `pintarQueComes()`/`estadisticasDeComidas()` (spec 095), con una
sola cosa que contar (ejercicios del catálogo) en vez de dos (recetas e
ingredientes):

- Un ejercicio del diario está **enlazado** si tiene `ejercicioIds` con al
  menos un id (spec 102). Sin campo `ejercicioId` singular que migrar: el
  diario de ejercicio nunca tuvo enlace antes de la 102.
- Las ventanas ("hoy", "siete", "treinta", "total") cuentan `{ sesiones,
  enlazadas }`, igual forma que `{ comidas, enlazadas }` en comida.
- "Los ejercicios que más repites": para cada registro enlazado de los
  últimos 30 días, se suma una vez por cada id de `ejercicioIds` que
  encuentre en el Catálogo; se ordena por veces y, en empate, alfabético
  (mismo criterio que `masRepetidos()`).
- Un ejercicio del catálogo que se haya borrado no aporta a la lista de "más
  repites" (no se puede nombrar lo que ya no existe), pero el registro del
  diario sigue contando como enlazado — igual que una receta borrada en
  comida.

## 5. Modelo de datos

Ninguno nuevo: usa `ejercicio.ejercicioIds`, ya añadido en la spec 102.

## 6. Casos límite

- **Sin ninguna sesión apuntada**: mensaje de vacío, sin números.
- **Con sesiones pero ninguna enlazada**: mensaje que explica cómo enlazar
  (eligiendo del catálogo al apuntar), sin mostrar "0%".
- **Un ejercicio del catálogo enlazado que ya no existe**: no aparece en "más
  repites", pero la sesión sigue contando como enlazada en los números de
  arriba.
- **Con sesiones apuntadas pero ninguna enlazada**: el mensaje que explica
  cómo enlazar SUSTITUYE a las cuatro líneas de números, no coexiste con
  ellas — igual que en `pintarQueComes()`.
- **Hay sesiones enlazadas, pero ninguna en los últimos 30 días** (todas más
  antiguas): la lista de "más repites" queda vacía y se dice con un texto
  ("No has apuntado nada enlazado en los últimos 30 días."), aunque los
  números de arriba (que sí miran "desde que empezaste") puedan mostrar
  enlaces — mismo criterio que "Qué comes".
- **El mismo ejercicio del catálogo enlazado dos veces en el mismo
  registro** (si algún día pasara): cuenta las veces que aparece, igual que
  una comida con dos recetas que comparten ingrediente lo cuenta dos veces.

## 7. Archivos afectados

- `js/estadisticas.js`: nueva función `estadisticasDeEjercicios(ejercicios,
  hoy, ejercicioPorId)`, espejo de `estadisticasDeComidas()` con una sola
  lista de "más repetidos" en vez de dos.
- `js/app.js`: nueva función `pintarQueEntrenas()`, llamada desde
  `refrescarPantallas()` (mismo hook que `pintarQueComes()`).
- `index.html`: bloque nuevo "Qué entrenas" en Ejercicio → Apuntar, después
  de "Cuánto llevas andado".
- `docs/specs/103-...-casos.mjs`: casos de `estadisticasDeEjercicios()`,
  espejo de `095-estadisticas-comidas-casos.mjs`.

## 8. Decisiones tomadas

- **Va después de "Cuánto llevas andado"**, al final de Apuntar. Decisión
  del usuario.

## 9. Fuera de spec: ideas apuntadas

Ninguna surgida durante la escritura de esta spec.

## ✅ Para probar a mano

(la rellena/afina el agente `qa-manual` antes de la prueba)
