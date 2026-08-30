# 076 — Elegir menú en vez de pedírselo a la IA

- **Estado:** borrador
- **Fecha:** 2026-08-30
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v14: los menús de la nutricionista, decidida el 30 de agosto de 2026)", punto tercero.

## 1. Objetivo

Que al hacer la dieta de la semana puedas elegir uno de los cuatro menús de la
nutricionista en un desplegable, en vez de pedírselo a la IA, y que la semana se
rellene con él.

## 2. Por qué existe

La spec 075 metió los cuatro menús en `js/datos-iniciales.js`, con sus siete días
ya montados, y **nadie los lee**. Esta spec los enchufa.

Y resuelve algo de fondo: hasta ahora, para tener una dieta había que pasar por
la IA, que se la inventa razonablemente bien pero se la inventa, y que además
tiene cupo diario. Estos menús son de una nutricionista de verdad, no cuestan
llamada y no fallan.

## 3. Criterio de "esto funciona"

1. En **Comidas → Mi dieta**, junto al botón de pedir la dieta, hay un
   desplegable **"O elige un menú"** con los cuatro menús.
2. Eliges **Menú 2** y pulsas **Usar este menú**: la semana se rellena al momento
   con sus siete días, **sin llamar a la IA** y **sin gastar cupo**.
3. Los siete días salen llenos, de lunes a domingo, con sus cuatro momentos.
4. Los platos que son una receta salen **enlazados a su receta**: se abren desde
   la dieta con el icono de la spec 060.
5. Sábado y domingo llevan lo mismo, y lunes a miércoles lo mismo que el jueves.
   Es lo que dice el papel; la spec 075 lo dejó así a propósito.
6. **Pedirle la dieta a la IA sigue funcionando igual** que hasta ahora, con su
   casilla de aprovechar la despensa (059) y su cupo.
7. Con una dieta ya puesta, elegir un menú **avisa antes de pisarla**: la dieta
   de la semana es una sola (spec 028) y esto la sustituye.
8. La dieta que sale se puede **editar a mano**, como cualquier otra.
9. Salir de la pestaña y volver: la dieta elegida **sigue ahí**.

## 4. Alcance

### Entra

- Desplegable con los cuatro menús y botón para aplicar el elegido.
- Rellenar la semana desde `MENUS` de `js/datos-iniciales.js`.
- Enlazar cada plato con su receta por nombre, con lo que ya hace
  `semanaDesdeLaIa()` de `js/dietas.js`.
- Confirmación antes de pisar una dieta que ya existe.

### NO entra (explícitamente fuera)

- **Quitar la dieta por IA.** Es una alternativa, no un sustituto.
- **Mezclar**, tipo "el lunes del menú 1 y el martes del menú 3". Eliges uno
  entero; luego lo editas a mano si quieres.
- **Que la IA vea los menús** ni que los use de ejemplo. Elegir un menú no manda
  nada al proxy.
- **Guardar varias dietas.** Sigue habiendo una activa (spec 028), y esto no lo
  cambia.
- **Menús para la tabla de ejercicio.** No hay tablas en el papel.
- **Que el usuario cree sus propios menús** o edite los cuatro. Otra spec, si se
  echa de menos.

## 5. Comportamiento detallado

### Dónde va

En **Comidas → Mi dieta**, en el mismo bloque donde hoy están las instrucciones y
el botón de pedir la dieta. Debajo de ese botón, separado, para que se lea como
la otra forma de hacerlo y no como parte del formulario de la IA.

```
[ Pedir dieta a la IA ]
Te quedan 2 de hoy.

O elige un menú:  [ Menú 1 ▾ ]  [ Usar este menú ]
```

El desplegable arranca **sin elegir nada** ("Elige un menú…") y el botón está
**deshabilitado** hasta que se elige uno: así no se pisa una dieta de un clic
distraído.

### Qué hace al aplicar

1. Si ya hay dieta activa, **pregunta**: *"Esto sustituye tu dieta de la semana.
   ¿Seguir?"*. Es la misma cortesía que el borrado: no hay deshacer.
2. Coge el menú de `MENUS` y lo pasa por `semanaDesdeLaIa()`, que es quien
   empareja cada plato con su receta por nombre. **Se reutiliza tal cual**: hace
   exactamente lo que hace falta y ya está probada desde la spec 028.
3. Guarda la dieta con `guardarDieta()`, con `instrucciones` puesto al nombre del
   menú (`"Menú 2"`), para que quede escrito de dónde salió.
4. Repinta la semana y avisa **"Menú 2 puesto"** en el hueco de guardado que ya
   existe.

### Lo que NO toca

Ni el cupo, ni el proxy, ni la casilla de aprovechar la despensa. Elegir un menú
es una escritura en Firestore y nada más.

## 6. Modelo de datos

**Sin cambios.** La dieta se guarda como siempre, en `usuarios/{uid}/dietas`, con
la forma que ya valida `js/dietas.js`. El campo `instrucciones`, que hoy guarda
lo que le pediste a la IA, pasa a guardar el nombre del menú cuando viene de
aquí.

`firestore.rules`: **sin cambios**.

## 7. Casos límite

- **Sin conexión al aplicar**: sale el error de siempre y la dieta anterior se
  queda como estaba. No se pinta una semana que no se guardó.
- **Un plato del menú que no tiene receta** (por ejemplo "Pieza de fruta"): entra
  como texto, sin enlace. Es lo mismo que pasa hoy con la IA, y la lista de la
  compra (073) ya sabe avisar de las comidas sin receta.
- **El usuario borró la receta que un plato nombra**: el plato se queda como
  texto. El enlace se calcula al aplicar, contra las recetas de ese momento.
- **Cuenta sin sembrar** (la 075 falló): los menús se leen del módulo, no de
  Firestore, así que el desplegable funciona igual. Los platos saldrán sin
  enlazar, porque no hay recetas con las que emparejar. Aceptable y coherente.
- **Elegir el mismo menú dos veces**: se vuelve a escribir igual. No hace daño.

## 8. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| Un desplegable, no cuatro botones | Cuatro botones ocupan la pantalla y no crecen bien si algún día hay ocho menús. |
| Botón aparte, no aplicar al elegir | Elegir en un desplegable es demasiado fácil como para que pise una dieta sin preguntar. |
| **Se reutiliza `semanaDesdeLaIa()`** | Ya empareja platos con recetas por nombre. Escribir otra función que haga lo mismo es garantizar que dentro de un mes solo una está arreglada — la misma lección que la 074 con la normalización. |
| `instrucciones` guarda el nombre del menú | Deja escrito de dónde salió la dieta sin añadir un campo nuevo. |
| No se mezclan menús | Complica la pantalla para un caso que nadie ha pedido. Editar a mano ya cubre el retoque. |

## 9. Archivos afectados

| Archivo | Qué |
|---|---|
| `index.html` | Desplegable y botón en el bloque de Mi dieta. |
| `js/app.js` | Rellenar el desplegable desde `MENUS`, y aplicar el elegido. |
| `css/estilos.css` | Nada, si las clases de `fila-alta` valen. |

Estimación: **muy por debajo de las 300 líneas**. La mayor parte del trabajo lo
hizo la 075 al dejar los menús ya montados con sus siete días.

## 10. Fuera de spec: ideas apuntadas

- Que el usuario cree y guarde sus propios menús.
- Mezclar días de menús distintos.
- Menús para la tabla de ejercicio, si algún día hay tablas en papel.

## ✅ Para probar a mano

Guion completo: lo afina `qa-manual`. En corto, los nueve puntos del apartado 3,
comprobando sobre todo el 6 —que pedir la dieta a la IA sigue igual— y el 7 —que
avisa antes de pisar una dieta que ya tenías.
