# 075 — Las recetas y los ingredientes, ya puestos

- **Estado:** ✅ completada el 30 de agosto de 2026, revisada por `revisor-specs` y `revisor-codigo`, probada por el usuario en producción el 1 de septiembre de 2026.
- **Fecha:** 2026-08-30
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v14: los menús de la nutricionista, decidida el 30 de agosto de 2026)", puntos primero y segundo.

## 1. Objetivo

Que quien entre en la app se encuentre las recetas de los cuatro menús de la
nutricionista ya guardadas en su recetario, y sus ingredientes apuntados en la
despensa, sin haber tenido que escribir nada.

## 2. Por qué existe

Hasta ahora la única forma de tener una receta era escribirla o pedírsela a la
IA, que se la inventa razonablemente bien pero se la inventa. El usuario tiene
cuatro menús reales de su nutricionista, con 73 recetas distintas. Esto los mete
en la app.

Y de paso arregla un problema que no se veía: la despensa, el cruce (059) y la
lista de la compra (073) funcionan de maravilla **cuando ya tienes datos**. Con
la cuenta vacía no hacen nada. Esta spec les da con qué trabajar desde el minuto
uno.

## 3. Criterio de "esto funciona"

1. Con una cuenta **nueva**, al entrar por primera vez, **Comidas → Recetas**
   enseña las **73 recetas** de los menús, cada una con sus ingredientes y sus
   pasos.
2. **Comidas → Despensa** enseña los **133 ingredientes**, todos **sin marcar**.
3. Ninguno sale repetido: ni dos "Tortitas de avena y plátano", ni "tomate" y
   "tomates".
4. Abres una receta cualquiera y se lee entera y bien: nombre, ingredientes con
   sus cantidades, y los pasos numerados.
5. Marcas cuatro ingredientes en la despensa, abres una receta que los use y el
   cruce de la spec 059 los enseña como que **los tienes**.
6. **Son tuyas**: editas una receta y se guarda; borras otra y desaparece.
7. Recargas la página: **no se duplica nada** y lo que borraste **sigue borrado**.
8. Con una cuenta que **ya tenía** recetas propias, esas recetas **siguen ahí**,
   y las nuevas se le suman sin pisar ninguna.
9. Si ya tenías una receta con el mismo nombre que una de los menús, **la tuya
   manda** y la del menú no entra.
10. La primera carga **no bloquea la app**: puedes navegar mientras ocurre, y si
    falla, la app sigue funcionando.

## 4. Alcance

### Entra

- Un módulo de datos con las 73 recetas, los 133 ingredientes y los 4 menús,
  generado desde `docs/menus/recetas-transcritas.json`.
- Sembrar recetas e ingredientes en la cuenta del usuario, **una sola vez**.
- La marca de "ya se sembró", para no repetirlo en cada arranque.

### NO entra (explícitamente fuera)

- **El desplegable para elegir menú.** Es la spec 076. Los menús viajan en el
  módulo de datos desde ya, pero **nadie los lee todavía**.
- **Una colección común de solo lectura.** Descartado en `PRODUCTO.md`: obliga a
  fusionar dos fuentes en el recetario, el cruce, la compra y la dieta.
- **La tabla nutricional del papel.** La app calcula la suya (spec 030).
- **La franja de media mañana.** Se pega al desayuno; añadir un quinto momento
  es otra spec.
- **Volver a sembrar lo que el usuario borre.** Ver apartado 8.
- **Fotos de los platos.** Los PDF las traen, pero son suyas y esto no monta un
  almacén de imágenes.

## 5. Comportamiento detallado

### El módulo de datos

`js/datos-iniciales.js`, **generado**, no escrito a mano. Exporta:

| Export | Qué |
|---|---|
| `RECETAS` | 73 recetas `{ nombre, raciones, ingredientes[], preparacion[] }`, ya sin las repetidas entre menús. |
| `INGREDIENTES` | 133 nombres, la lista curada. |
| `MENUS` | 4 menús, cada uno con sus siete días y sus cuatro momentos. Para la 076. |
| `VERSION` | Número. Hoy `1`. |

Se genera con un script en `docs/menus/`, que se queda en el repositorio para
poder rehacerlo si se corrige una transcripción.

**Los menús ya vienen con los siete días**, montados **al generar** y no en el
navegador. Cada día sale del suyo: lunes, martes y miércoles de la **página 1**
del PDF, y jueves, viernes y "fin de semana" de la **página 2**. "Fin de semana"
va en el **sábado**, y el **domingo se queda vacío**: es el día de descanso, y
rellenarlo sería inventarse una comida que el papel no manda.

> **Corregido el 30 de agosto.** La primera versión de esta spec decía que lunes,
> martes y miércoles repetían el jueves "porque el papel no los trae". Era falso:
> **sí los trae, en la página 1**, que se leyó como si fuera una portada. Lo vio
> el usuario. Los cuatro menús están ahora con sus días de verdad, y hay dos
> casos en `075-siembra-casos.mjs` que fallan si alguien vuelve a copiar un día
> sobre otro.

### Cuándo se siembra

Al arrancar la app con sesión iniciada, después de cargar los ajustes. Se compara
`ajustes.datosInicialesVersion` con `VERSION`:

- Si es igual, **no se hace nada**. Es el caso normal, y no cuesta ni una lectura
  de más: los ajustes ya se leen hoy.
- Si falta o es menor, se siembra y se guarda la versión nueva.

### Cómo se siembra

1. Se leen las recetas y la despensa que el usuario ya tenga.
2. **Recetas**: entra la que no exista ya con ese nombre, comparado con la
   normalización de `js/despensa.js`. La del usuario manda siempre.
3. **Ingredientes**: entra el que no esté ya, comparado con `mismoIngrediente()`
   (spec 072), así que tu "tomates" impide que entre "tomate". Entran **sin
   marcar**, como decidió la 068.
4. Se guarda `datosInicialesVersion` en los ajustes **al final**, solo si todo
   fue bien.

**Se escribe con `writeBatch`**, en tandas de 400. Son unas 206 escrituras la
primera vez: hacerlas de una en una, con `await` cada una, tardaría cerca de un
minuto con la app en la mano. Firestore admite 500 por lote; se dejan 400 de
margen.

### Que no tumbe la app

Todo el sembrado va dentro de un `try` que, si falla, **avisa por consola y ya**.
La app tiene que arrancar igual. Es la misma regla que `llenarDespensaDesde()` de
la spec 068, y por el mismo motivo: esto es un extra, no el diario del usuario.

Como la versión se guarda al final, un fallo a medias deja la marca sin poner y
**el siguiente arranque lo reintenta**. Lo que ya entró no se duplica, porque el
paso 2 y el 3 comparan contra lo que hay.

## 6. Modelo de datos

**No hay colecciones nuevas.** Se escribe en las que ya existen:

| Dónde | Qué |
|---|---|
| `usuarios/{uid}/recetas` | Las 73 recetas, con el mismo esquema que valida `js/recetas.js`. |
| `usuarios/{uid}/despensa` | Los 133 ingredientes, con `tengo: false`. |
| `usuarios/{uid}` (ajustes) | Campo nuevo `datosInicialesVersion` (number). |

`firestore.rules`: **sin cambios**. Todo cuelga de `usuarios/{uid}`, que ya está
permitido. No hace falta publicar reglas para esta spec.

`js/reinicio.js`: **sin casilla nueva**. Estas recetas son recetas y estos
ingredientes son despensa; se borran con las casillas que ya hay.

## 7. Casos límite

- **Sin conexión al arrancar**: no se siembra, se avisa por consola, la marca no
  se guarda y se reintenta al siguiente arranque.
- **El usuario borra una receta suelta**: **no vuelve**. Borrar una cosa concreta
  es una decisión sobre esa cosa, y resucitarla sería llevarle la contraria.
- **Reinicio de datos** con la casilla de recetas o de despensa: **vuelven**.
  Borrar el recetario entero no es lo mismo que borrar una receta: es dejar la
  cuenta como recién estrenada, y una cuenta recién estrenada trae sus recetas y
  sus ingredientes. El reinicio pone `datosInicialesVersion` a 0 y la siembra se
  ejecuta otra vez, sin recargar. **Decisión del usuario el 30 de agosto**, que
  revierte lo que decía la primera versión de esta spec.
- **Dos pestañas abiertas a la vez en el primer arranque**: las dos podrían
  sembrar. Lo tapa el paso 2 y 3 solo en parte, porque leen antes de escribir.
  Aceptado: es una carrera de un único instante en la vida de una cuenta, y el
  daño máximo es alguna receta repetida que se borra a mano.
- **Cuenta con muchas recetas propias**: no se toca ninguna.
- **Una receta del JSON mal formada**: se salta y se avisa por consola, como hace
  `js/dietas.js` con lo que devuelve la IA. No tumba el resto.

## 8. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| **Copia en cada usuario**, no colección común de solo lectura | Cero cambios en el recetario, el cruce, la compra y la dieta: todos siguen leyendo de un solo sitio. La alternativa era mucho más código y muchos más sitios donde romper algo, para un grupo que cabe en una mano. Decisión del usuario el 30 de agosto. |
| **Los ingredientes entran sin marcar** | La 068 lo dejó claro: escribir la lista no dice nada sobre lo que hay en la nevera. Meterlos marcados haría que la app afirmase tener 133 cosas. |
| **La receta del usuario manda** sobre la del menú | Nunca pisar lo que alguien escribió a mano. |
| **La lista de ingredientes va curada a mano** | Pasar las líneas del PDF por `ingredienteDeLinea()` daba 222 entradas sucias, con "aceite de oliva", "AOVE" y "café de aceite de oliva, virgen" como tres cosas. Una despensa así ensucia el cruce y la lista de la compra. |
| **Cada día sale del suyo, y el domingo descansa** | El papel trae los siete: lunes a miércoles en la página 1 y el resto en la 2. El domingo no lleva nada porque es el día de descanso. |
| **Borrar el recetario o la despensa los devuelve** | Vaciar es dejar la cuenta como nueva. Borrar una receta suelta sigue siendo definitivo. |
| **`writeBatch` en tandas de 400** | 206 escrituras de una en una tardan cerca de un minuto. |

## 9. Archivos afectados

| Archivo | Qué |
|---|---|
| `docs/menus/generar-datos-iniciales.mjs` | **Nuevo.** Convierte el JSON transcrito en el módulo, incluida la semana de siete días. |
| `js/datos-iniciales.js` | **Nuevo y generado.** Los datos. |
| `js/siembra.js` | **Nuevo.** Sembrar: comparar contra lo que hay, escribir por lotes, marcar la versión. |
| `js/ajustes.js` | Leer y guardar `datosInicialesVersion`. |
| `js/app.js` | Llamar a la siembra al arrancar, sin bloquear ni poder tumbar nada. Y volver a llamarla tras un reinicio que borre recetas o despensa. |
| `docs/specs/075-siembra-casos.mjs` | **Nuevo.** 26 casos: los datos generados, cuándo se siembra y qué falta. |

## 10. Fuera de spec: ideas apuntadas

- Las fotos de los platos, que los PDF traen y aquí se dejan fuera.
- Que al corregir una transcripción suba `VERSION` y entren solo las nuevas.

## ✅ Para probar a mano

Guion completo: lo afina `qa-manual`. En corto, los diez puntos del apartado 3,
con dos cuentas: una nueva y la del usuario, que ya tiene recetas suyas.
