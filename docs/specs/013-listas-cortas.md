# 013 — Listas cortas y comidas frecuentes en Comidas

- **Estado:** completada (validada por el usuario el 2026-08-17)
- **Fecha:** 2026-08-13
- **Referencia en PRODUCTO.md:** apartado "Ampliación de la v2", puntos "Listas cortas" y "Comidas frecuentes en su sitio".

## 1. Objetivo

Que las listas de pesajes, comidas y ejercicios dejen de ser un rollo infinito: se ven los últimos registros, se pueden desplegar enteras o filtrar por un día concreto. Y que repetir una comida habitual vuelva a ser posible, esta vez en la pantalla de Comidas.

## 2. Criterio de "esto funciona"

1. Con un mes de datos, la pestaña **Peso** enseña bajo "Mis pesajes" solo los **3 últimos**, y debajo un botón **"Ver todos (24)"** con el total.
2. Pulsar "Ver todos" despliega la lista entera y el botón pasa a **"Ver menos"**. Pulsarlo otra vez vuelve a 3.
3. Hay un campo de **fecha** para filtrar. Al elegir un día, la lista enseña solo los registros de ese día, y aparece un botón para **quitar el filtro**.
4. Con un filtro puesto que no tiene registros: `No hay pesajes de ese día.`
5. En **Comidas** y **Ejercicio**, lo mismo, pero enseñando los de los **3 últimos días** con registros, no los 3 últimos registros: un día con cinco comidas no debe comerse la lista entera.
6. Apuntar un registro nuevo con la lista recortada: aparece arriba del todo, y la lista sigue recortada.
7. Editar o borrar un registro (spec 007) funciona igual, esté la lista recortada, desplegada o filtrada.
8. En **Comidas**, debajo del formulario, hay un bloque **"Lo de siempre"** con hasta 5 comidas de las que más repites en los últimos 30 días.
9. Tocar una la guarda **hoy** con su mismo momento, sale "Guardado" y aparece en la lista.
10. Sin comidas apuntadas, ese bloque no aparece.
11. En "Hoy" no hay ningún bloque de repetir comidas: solo está en Comidas.

## 3. Alcance

### Entra

- **Recorte de las tres listas**, con botón de desplegar/plegar que dice cuántos hay en total.
- **Filtro por día** en las tres listas, con botón para quitarlo.
- **"Lo de siempre" en la pantalla de Comidas**, con el mismo comportamiento que tenía en "Hoy" antes de la spec 012 (que lo quitó de allí).

### NO entra (explícitamente fuera)

- **Buscar por texto** dentro de las comidas o los ejercicios: solo por día.
- **Paginación de verdad** (traer de Firestore por trozos): se sigue trayendo todo y se recorta al pintar. Con dos usuarios y un año de datos son unos cientos de documentos; no compensa complicar las consultas.
- **Recordar el estado desplegado** entre sesiones o entre cambios de pestaña.
- **Repetir ejercicios**: sigue en el backlog.
- **Cambiar la gráfica ni las estadísticas**: eso es la spec 015.

## 4. Comportamiento detallado

### Recorte

- **Peso**: se enseñan los **3 últimos registros**.
- **Comidas y Ejercicio**: se enseñan los registros de los **3 últimos días que tengan registros**. Si el día 12 tuviste 5 comidas y el 11 otras 3, con 3 días se ven todas las de esos 3 días.
- Debajo de la lista, un botón:
  - Recortada y con más registros de los que se ven: `Ver todos (N)`, con N el total.
  - Desplegada: `Ver menos`.
  - Si no hay nada que ocultar, el botón no aparece.
- El recorte es solo al pintar: los datos cargados son los mismos de siempre.

### Filtro por día

- Encima de la lista, un `<input type="date">` y, cuando tiene valor, un botón **Quitar filtro**.
- Con filtro puesto se enseñan **todos** los registros de ese día, sin recorte, y el botón de desplegar desaparece.
- Al quitarlo, la lista vuelve a como estaba (recortada).
- Vacío si ese día no tiene nada: `No hay pesajes de ese día.` / `No hay comidas de ese día.` / `No hay ejercicios de ese día.`

### "Lo de siempre" en Comidas

- Va **debajo del formulario de alta y encima de la lista**.
- Hasta 5 botones con las comidas más repetidas de los últimos 30 días, con su momento delante: `Desayuno · café con leche y tostada`.
- Tocar uno guarda esa comida hoy, con ese momento, y refresca la lista.
- Reutiliza `loDeSiempre()` de `js/hoy.js`, que ya está escrito y probado desde la spec 010.
- Sin comidas en 30 días, el bloque no se pinta.

## 5. Modelo de datos

**Ninguno.** Todo es presentación sobre datos ya cargados. `firestore.rules` sin cambios.

## 6. Casos límite

- **Menos registros que el recorte**: no sale el botón de desplegar.
- **Filtro con fecha futura**: se permite elegirla, y sale el mensaje de que no hay nada. No merece una validación propia.
- **Editar un registro y cambiarle la fecha fuera del filtro**: al refrescar desaparece de la vista filtrada. Es correcto.
- **Desplegar, filtrar y quitar el filtro**: vuelve a recortada, no a desplegada. Un solo estado, sin recordar el anterior.
- **Cambiar de pestaña**: cada lista mantiene su estado mientras no se recargue la página.
- **Repetir una comida con el filtro puesto en otro día**: se guarda hoy, y no se ve hasta quitar el filtro. Se acepta: la confirmación "Guardado" ya dice que ha ido bien.

## 7. Archivos afectados

| Archivo | Cambio |
|---|---|
| `js/app.js` | `crearLista()` gana recorte, botón de desplegar y filtro por día. Bloque de "lo de siempre" en Comidas |
| `index.html` | filtro y botón de desplegar en las tres listas, bloque de "lo de siempre" en Comidas |
| `styles.css` | estilos del filtro, del botón de desplegar y del bloque de repetir |

**Estimación: ~260 líneas.**

## 8. Decisiones tomadas

- **3 últimos en peso, 3 últimos días en comidas y ejercicio** → un pesaje al día, pero varias comidas: contar registros en comidas dejaría fuera medio día.
- **Filtro por día y no por texto** → es lo que pidió el usuario, y buscar por texto en comidas se resuelve mejor con "lo de siempre".
- **Sin paginación real** → se traen todos los documentos igual que hasta ahora; con este volumen, complicar las consultas de Firestore no aporta nada.
- **"Lo de siempre" vuelve, pero en Comidas** → decisión del usuario: su sitio es donde se apuntan comidas, no en el resumen del día.

## 9. Fuera de spec: ideas apuntadas

- Buscar comidas y ejercicios por texto. → `docs/BACKLOG.md`

## ✅ Para probar a mano

Se prueba junto con el resto de specs de esta tanda.
