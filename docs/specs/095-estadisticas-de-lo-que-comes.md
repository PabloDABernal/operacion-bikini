# 095 — Estadísticas de lo que comes

- **Estado:** 📝 escrita el 2 de septiembre de 2026, revisada por `revisor-specs` (sin bloqueantes). **Pendiente de implementar.**
- **Fecha:** 2026-09-02
- **Referencia en PRODUCTO.md:** apartado "Qué hará (evolutivos de la fase productiva…)", el evolutivo de saber lo que comes, tercer punto.

## 1. Objetivo

Que se pueda **mirar lo que comes**: cuántas comidas apuntas, cuántas van
enlazadas de verdad, y **qué recetas e ingredientes repites más**.

## 2. Por qué existe

Es el objetivo que el usuario puso encima de la mesa: *"mi objetivo es que todo
se enlace, así puedo saber lo que como con estadísticas"*.

Las specs **093** y **094** hacen que el diario se llene de comidas enlazadas.
Esta es la que **lo devuelve en forma de respuesta**: sin ella, todo lo anterior
es fontanería que no se ve.

## 3. Criterio de "esto funciona"

1. En **Comidas** hay un bloque **"Qué comes"**.
2. Enseña, para **hoy, los últimos 7 días, los últimos 30 y desde que
   empezaste**: cuántas comidas has apuntado.
3. Y **cuántas de ellas van enlazadas** a una receta o a un ingrediente, en
   número y en porcentaje.
4. Enseña **tus cinco recetas más repetidas**, con cuántas veces.
5. Y **tus cinco ingredientes más comidos**, contando los de las recetas
   enlazadas **y** los ingredientes sueltos de la spec 084.
6. Con **nada apuntado**, lo dice en una frase y no enseña ceros.
7. Con comidas apuntadas pero **ninguna enlazada**, lo dice y explica cómo
   enlazarlas.
8. Se pone al día **sin recargar** al apuntar, editar o borrar una comida.
9. Una receta **borrada del recetario** no rompe el recuento.
10. Lo demás de Comidas —el diario, el filtro, los chips, la dieta— sigue igual.

## 4. Alcance

### Entra

- `estadisticasDeComidas()` en `js/estadisticas.js`: cálculo puro.
- El bloque en Comidas, con sus ventanas y sus dos listas.
- Suite de casos.

### NO entra (explícitamente fuera)

- **Calorías y macros.** Eso ya lo hace el análisis de la IA por día (spec 030),
  y calcularlos aquí obligaría a poner raciones en cada comida, que la spec 093
  dejó fuera a propósito.
- **Gráficas.** Mismo motivo que en la 087: la de peso es SVG a mano y sería más
  código que todo lo demás junto. Primero se ve si los números se usan.
- **Juzgar lo que comes.** Ni "comes poca verdura" ni semáforos. La app cuenta lo
  que hay; los consejos los da la IA en Consulta, que es su sitio.
- **Estadísticas de bebidas ni de agua.** El agua ya tiene lo suyo (spec 061).
- **Tocar los puntos ni la racha** (spec 031).
- **Comparar con el plan** ("cumpliste el 60% de tu dieta"). Suena bien y es otra
  spec: obliga a decidir qué cuenta como cumplir.

## 5. Comportamiento detallado

### Dónde va

Un bloque propio en **Comidas → Apuntar**, debajo del diario. Igual que los
kilómetros en Ejercicio desde la spec 087, y por lo mismo: lo que se cuenta vive
donde se apunta.

### Qué enseña

```
Qué comes
─────────────────────────────────────
De hoy                 3 comidas
                       2 enlazadas (67%)
Últimos 7 días        19 comidas
                      14 enlazadas (74%)
Últimos 30 días       74 comidas
                      51 enlazadas (69%)
Desde que empezaste  112 comidas
                      util 78 enlazadas (70%)

Lo que más repites
  Tortilla de atún              9 veces
  Ensalada de repollo y manzana 7 veces
  Pasta a la boloñesa           4 veces

Lo que más comes
  Huevos          23 veces
  Atún            14 veces
  Tomate          11 veces
```

Las **ventanas son las mismas** que en peso (spec 015) y en distancia (087): hoy,
7 días, 30 días y desde que empezaste. Se aprende una vez.

Las dos listas se calculan sobre **los últimos 30 días**, no sobre todo: lo que
te interesa es qué comes **ahora**, no qué comías en agosto. Se enseñan **cinco**
como mucho, y menos si no hay más.

### Qué cuenta como "enlazada"

Una comida está enlazada si tiene **al menos una receta** (spec 093) **o** un
**ingrediente suelto** (spec 084). Las dos formas dicen qué comiste de verdad.

### Cómo se cuentan los ingredientes

- De una comida con **ingrediente suelto**: ese ingrediente, una vez.
- De una comida con **recetas**: **todos los ingredientes de cada receta**, una
  vez por receta. Si la cena lleva dos recetas y las dos llevan huevo, cuenta
  dos.

Se cuenta **por ingrediente enlazado** (`ingredienteId`), no por nombre, porque
desde la spec 092 el enlace es de fiar. Una línea de receta **sin enlazar** no
cuenta: no se sabe qué es.

### Los estados vacíos

| Situación | Qué dice |
|---|---|
| Ninguna comida apuntada | "Cuando apuntes comidas, aquí verás qué comes." |
| Comidas, pero ninguna enlazada | "Tienes 12 comidas apuntadas, pero ninguna enlazada a una receta o a un ingrediente. Elige la receta al apuntar, o usa 'Me lo he comido' desde tu dieta." |

El segundo importa: es el caso de quien lleva meses escribiendo a mano, y decirle
solo "0%" no le dice **qué hacer**.

### Cuándo se recalcula

En `refrescarPantallas()`, junto a la gráfica, Hoy y los kilómetros. Lo comparten
las cuatro listas y es cálculo puro sobre lo que ya está en memoria: ni una
lectura nueva a Firestore.

## 6. Modelo de datos

**Nada nuevo.** Se lee lo que ya hay: las comidas con sus `recetaIds` (spec 093)
e `ingredienteId` (084), las recetas con sus ingredientes (082 y 092) y la
despensa.

`firestore.rules`: **sin cambios**. `js/reinicio.js`: **sin cambios**.

## 7. Casos límite

- **Sin comidas**: la frase del estado vacío.
- **Comidas sin enlazar**: la otra frase, con el número.
- **Una receta borrada** que sigue enlazada: la comida cuenta como enlazada
  —porque lo está— pero no aporta ingredientes ni entra en "lo que más repites".
  No se puede contar lo que ya no se sabe qué era.
- **Un ingrediente borrado** de la despensa: igual.
- **Empate en el quinto puesto**: se corta por orden alfabético, para que la
  lista no baile entre repintados.
- **Una receta con los ingredientes en el formato viejo** (lista de textos, sin
  `ingredienteId`): no aporta ingredientes. Pasa con las recetas que propone la
  IA al pedir dieta, que se guardan tal cual, y **no es un caso raro**. Se cuenta
  igual como comida enlazada —porque lo está—, pero sus ingredientes no se saben.
  Lo avisó `revisor-specs`.
- **Comidas enlazadas, pero todas de hace más de 30 días**: el bloque de arriba
  enseña sus números y las dos listas salen **vacías**. En ese caso no se pintan
  las listas ni sus títulos, y se dice en una línea: *"No has apuntado nada
  enlazado en los últimos 30 días."* Enseñar dos títulos con nada debajo parece
  un fallo.
- **Una comida con dos recetas iguales**: no puede pasar (spec 088).
- **Una comida con receta e ingrediente suelto**: no puede pasar, el interruptor
  es de uno en uno (spec 093).
- **Menos de cinco recetas distintas**: se enseñan las que haya.
- **Comida con fecha futura**: entra en "desde que empezaste" y no en las
  ventanas, igual que en la spec 087.
- **Cambiar de operación**: las comidas viven dentro de la operación, así que
  "desde que empezaste" es desde que empezó **esta**. Igual que el peso.

## 8. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| **Sin calorías ni macros** | Ya las estima la IA por día (spec 030), y calcularlas aquí obligaría a poner raciones, que la 093 dejó fuera. |
| **Sin gráficas** | Misma razón que en la 087: primero se ve si los números se usan. |
| **Las listas, sobre 30 días** | Interesa qué comes ahora, no qué comías en agosto. |
| **Se cuenta por enlace, no por nombre** | Desde la 092 el enlace es de fiar; el nombre no lo era nunca. |
| **Una línea sin enlazar no cuenta** | No se sabe qué es. Contarla sería inventarse un dato. |
| **El estado vacío dice qué hacer** | "0%" no ayuda a nadie. |
| **Sin juzgar** | La app cuenta; los consejos los da la IA en Consulta. |
| **Las mismas ventanas que peso y distancia** | Se aprende una vez. |

## 9. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/estadisticas.js` | `estadisticasDeComidas()`, al lado de las de peso y distancia. |
| `index.html` | El bloque en Comidas → Apuntar. |
| `js/app.js` | Pintarlo y engancharlo en `refrescarPantallas()`. |
| `styles.css` | Se reutiliza `resumen`; solo si hace falta. |
| `docs/specs/095-estadisticas-comidas-casos.mjs` | **Nuevo.** Casos del cálculo. |

Estimación: **entre 220 y 280 líneas**. Depende de las specs **093** y **094**:
sin ellas no hay comidas enlazadas que contar.

## 10. Fuera de spec: ideas apuntadas

- Comparar lo comido con el plan.
- Gráfica de comidas enlazadas por semana.
- Que la IA use estas cuentas al pasar consulta.
- Lo que **menos** comes de tu despensa, para no tenerlo criando polvo.

## ✅ Para probar a mano

Los diez puntos del apartado 3. Los que importan: el **5** (que los ingredientes
salgan de las recetas enlazadas y del ingrediente suelto), el **7** (el estado
vacío que dice qué hacer) y el **9** (una receta borrada no rompe nada).
