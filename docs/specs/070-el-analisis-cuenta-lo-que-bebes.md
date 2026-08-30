# 070 — El análisis cuenta lo que bebes y lo que acompaña

- **Estado:** ✅ completada (probada y confirmada por el usuario el 2026-08-30).
- **Fecha:** 2026-08-29
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v9)", cuarta spec.

> **Nota de metodología.** Esta spec se escribió **después** de implementarla, el
> 30 de agosto, al darse cuenta de que faltaba su fichero. Se decidió al cerrar
> la 063, se implementó en el mismo commit que la decisión, y nadie escribió el
> documento. Queda anotado porque el proyecto tiene una regla —documentos antes
> que código— y esto la incumplió.

## 1. Objetivo

Que el análisis nutricional del día cuente **también** lo que bebes y lo que
acompaña a cada comida, en vez de hacer como que no existen.

## 2. Por qué existe

Sale de cerrar la spec 063. Con las bebidas (spec 062) el usuario había decidido
que **no** entraran en el análisis, y el argumento aguantaba: una cerveza no
encaja en seis grupos sólidos.

Con el acompañamiento **ese argumento se cae**: tres trozos de pan son cereales y
féculas —uno de los seis grupos— y son bastantes calorías. Dejarlos fuera
significa que **el análisis del día dice menos de lo que comiste**, que es peor
que no tener acompañamiento.

Al plantearlo así, el usuario decidió el 29 de agosto que entren los dos: el
acompañamiento **y** las bebidas.

## 3. Criterio de "esto funciona"

1. Una comida con acompañamiento cuenta **entera** en el análisis: el pan suma a
   cereales y féculas.
2. Las bebidas del día **cuentan**: una cerveza suma a ultraprocesados y a las
   calorías.
3. La horquilla de calorías sube acorde. No es la de la comida sola.
4. **Los seis grupos siguen siendo los mismos seis**, en el mismo orden.
5. Apuntar una bebida deja el análisis **viejo**, y ofrece rehacerlo.
6. Un día sin bebidas ni acompañamientos se analiza **exactamente como antes**.
7. Los análisis ya guardados se siguen viendo bien.

## 4. Alcance

### Entra

- Los acompañamientos, pegados a su comida, en el prompt del análisis.
- Las bebidas del día, en un bloque propio del prompt.
- Que apuntar una bebida envejezca el análisis.

### NO entra (explícitamente fuera)

- **Un séptimo grupo "bebidas".** Ver apartado 5: se descartó a propósito.
- **El agua.** Es un contador (spec 061), no un registro escrito, y no aporta
  calorías. No entra ni entrará.
- **Migrar los análisis ya guardados.** Se quedan como están.

## 5. Comportamiento detallado

### Por qué NO hay un séptimo grupo

Fue la decisión de fondo, y la tomó Claude al implementarlo, avisando al usuario:

- Los seis grupos **describen composición** —verdura, proteína, cereales,
  lácteos, grasas, ultraprocesados—. Un grupo "bebidas" no es una composición: es
  un envase. Metería el café descafeinado junto a la cerveza.
- `seisGrupos()` empareja **por orden** cuando los nombres no cuadran, que es la
  lección de las specs 028 y 029. Cambiar la lista **desalinearía todos los
  análisis ya guardados**.

Lo que se hace en su lugar: **cada cosa cuenta donde le toca por lo que es**. El
pan en cereales y féculas, una cerveza en ultraprocesados y dulces, y todo suma a
la horquilla de calorías. El objetivo del usuario era que cuenten, y así cuentan
sin romper nada.

### Los acompañamientos, pegados

Igual que en `describirRegistros()` de la spec 063:

```
- comida: lentejas con verduras + 3 trozos de pan
```

Nunca en línea aparte: eso le diría al análisis que fueron dos ingestas.

### Las bebidas, en bloque

Detrás de las comidas, con su encabezado, y diciendo que el agua no está ahí. No
son una ingesta de comida, pero sí cuentan.

### El análisis viejo

`estaViejo()` compara cuántos registros hay hoy contra cuántos se analizaron. El
campo guardado **se sigue llamando `comidasAnalizadas`** para no migrar los
documentos que ya existen, pero ahora cuenta comidas **y** bebidas.

Un análisis guardado antes de esta spec dará "viejo" en cuanto apuntes una
bebida. Es correcto: ese análisis, en efecto, no la vio.

## 6. Modelo de datos

Ninguno nuevo. `comidasAnalizadas` cambia de significado, no de nombre ni de
tipo.

## 7. Casos límite

- **Día sin bebidas**: el bloque no se escribe. Un encabezado vacío le diría a la
  IA que no bebes nada, que no es lo mismo que no habérselo preguntado.
- **Comida vieja sin acompañamientos**: `Array.isArray()` de por medio, no
  revienta.
- **Análisis de días anteriores**: no se tocan.

## 8. Archivos afectados

| Archivo | Qué |
|---|---|
| `api/analisis.js` | `describirComidas()` con el "+", `describirBebidas()`, y las dos frases del prompt. |
| `js/analisis.js` | `pedirAnalisisALaIa()` acepta bebidas; `estaViejo()` cuenta las dos cosas. |
| `js/app.js` | `bebidasDeHoy()` y lo que se manda al análisis. |

## 9. Decisiones tomadas

- **Que entren las dos cosas** (usuario, 29 de agosto), cambiando lo decidido
  para las bebidas en la spec 062.
- **Sin séptimo grupo** (Claude, avisando): los seis describen composición y
  cambiar la lista desalinearía los análisis guardados.

## 10. Fuera de spec: ideas apuntadas

- Ninguna.

## ✅ Para probar a mano

Probado por el usuario el 30 de agosto.
