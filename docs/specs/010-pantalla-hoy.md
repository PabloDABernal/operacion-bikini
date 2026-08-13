# 010 — Pantalla "Hoy"

- **Estado:** completada (probada por el usuario en producción el 2026-08-13). En la prueba pidió cambios: fuera "lo de siempre" (se va a la pantalla de Comidas), botón **+** en cada línea del resumen, accesos directos a Consulta/Consejos/Fotos y calendario con rango elegible. Eso son las specs 011, 012 y 013.
- **Fecha:** 2026-08-13
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v2)", punto "Pantalla Hoy" (añadido el 2026-08-12 al llevarse allí el calendario de constancia).

## 1. Objetivo

Que al abrir la app se vea en una pantalla qué llevas apuntado hoy, se pueda repetir una comida de las de siempre con un toque, y se vea el calendario de constancia con los días en que apuntaste algo.

## 2. Criterio de "esto funciona"

1. Entrar en la app: se abre en **"Hoy"**, que es el primer botón de la barra inferior. Ahora son cinco: Hoy · Peso · Comidas · Ejercicio · Más.
2. Arriba, la fecha de hoy escrita en claro (por ejemplo `jueves, 13 de agosto`).
3. Un resumen con tres líneas — **Peso**, **Comidas**, **Ejercicio** — con lo apuntado hoy: el peso del día si lo hay, cuántas comidas y cuántos minutos de ejercicio.
4. En la línea de lo que **no** has apuntado hoy sale un botón que lleva a su pestaña. Tocar el de Ejercicio abre la pestaña Ejercicio.
5. Debajo, **"Lo de siempre"**: hasta cinco comidas que repites a menudo. Tocar una la guarda **hoy**, con el mismo momento del día que tenía, sin preguntar nada.
6. Al repetirla, el resumen de arriba se actualiza al momento (una comida más) y aparece una confirmación breve.
7. Ir a la pestaña **Comidas**: la comida repetida está en la lista, con la fecha de hoy.
8. Debajo, el **calendario de constancia**: 12 semanas de cuadraditos, más intenso cuanto más apuntaste ese día.
9. Tocar un cuadradito: debajo aparece la fecha y qué se apuntó ese día (`11/08/2026 — peso, comida`).
10. Apuntar un pesaje en la pestaña Peso y volver a "Hoy": el resumen y el calendario están al día, sin recargar la página.
11. Un usuario nuevo, sin nada apuntado: "Hoy" no está roto ni vacío del todo — el resumen dice que no hay nada y "Lo de siempre" no aparece.
12. En un móvil, **el resumen y "Lo de siempre" se ven sin hacer scroll**. El calendario va debajo y sí puede quedar fuera de la primera pantalla: es lo que menos se mira a diario. Si al implementarlo ni siquiera eso cabe, se para y se pregunta al usuario qué recortar, no se decide sobre la marcha.
13. Con cinco botones en la barra inferior, en una pantalla de 320 px "Ejercicio" (la etiqueta más larga) sigue cabiendo sin abreviarse ni montarse con las de al lado.

## 3. Alcance

### Entra

- **Sección nueva "Hoy"**, primera en la barra inferior y **pantalla de inicio** de la app.
- **Fecha de hoy** en texto legible.
- **Resumen del día** con tres líneas:
  - **Peso**: el peso apuntado hoy, o un guion si no hay. Si hay varios, el último.
  - **Comidas**: cuántas comidas hoy.
  - **Ejercicio**: cuántos minutos en total hoy.
  - En las líneas sin nada apuntado, un botón que abre la pestaña correspondiente.
- **"Lo de siempre"**: hasta 5 botones con las comidas más repetidas de los últimos 30 días. Tocar uno la guarda hoy con su mismo momento.
- **Calendario de constancia**: se cuelga aquí el que ya está programado y probado en la spec 008.
- Todo se recalcula al apuntar, editar o borrar cualquier registro, sin consultas nuevas a Firestore.

### NO entra (explícitamente fuera)

- **Formularios de alta en "Hoy"**: para apuntar se va a su pestaña. Duplicar los formularios sería duplicar validaciones, errores y sitios donde algo puede romperse.
- **Repetir ejercicio o pesaje**: solo comidas. Un ejercicio repetido casi nunca dura lo mismo, y un peso repetido no tiene ningún sentido.
- **Editar o borrar desde "Hoy"**: eso vive en la lista de cada pestaña (spec 007).
- **Puntos, rachas y emblemas**: el calendario es solo la vista de la constancia. La gamificación es su propia spec.
- **Detalle nutricional por IA**: otra spec.
- **Elegir el momento al repetir**: se hereda el que tenía, sin preguntar.
- **Cambiar la barra de navegación** más allá de añadir el quinto botón.

## 4. Comportamiento detallado

### Dónde va

- Sección nueva `data-seccion="hoy"`, la primera del HTML.
- La barra inferior de la spec 009 pasa de cuatro botones a **cinco**: Hoy, Peso, Comidas, Ejercicio, Más. El panel "Más" no cambia.
- `PESTANA_INICIAL` pasa de `"peso"` a `"hoy"`.

### Resumen del día

Tres líneas, cada una con su etiqueta a la izquierda y el dato a la derecha:

| Línea | Con datos | Sin datos |
|---|---|---|
| Peso | `82,4 kg` | `—` y botón **Pesarme** |
| Comidas | `2 comidas` (o `1 comida`) | `—` y botón **Apuntar comida** |
| Ejercicio | `45 min` | `—` y botón **Apuntar ejercicio** |

- Si hay **varios pesajes hoy**, se enseña el último (el de `creadoEn` más reciente, que es el criterio de orden que ya usa la lista).
- Los minutos de ejercicio son la **suma** de todos los ejercicios de hoy.
- Los botones abren la pestaña correspondiente. No hacen nada más.

### "Lo de siempre"

- Se miran las comidas de los **últimos 30 días** (por su campo `fecha`).
- Se agrupan por **texto exacto**, normalizando espacios y mayúsculas para agrupar (`Lentejas` y `lentejas ` cuentan juntas), pero se guarda y se enseña el texto **tal como se escribió la última vez**.
- Se ordenan por número de veces, de más a menos. A igualdad, primero la más reciente.
- Se enseñan **hasta 5**, cada una como un botón con su texto y su momento (`Desayuno · café con leche y tostada`).
- El **momento** que se repite es el de la aparición más reciente de ese texto.
- Tocar el botón guarda una comida nueva con ese texto, ese momento y la **fecha de hoy**, usando `guardarComida()`, la misma función del alta normal.
- Mientras guarda, el botón se deshabilita. Al terminar: confirmación breve `Guardado` (el mismo patrón de la spec 009) y se refresca la lista de comidas, que a su vez actualiza "Hoy".
- Si falla: `No se ha podido guardar. Comprueba tu conexión.` y el botón se vuelve a habilitar.
- Si no hay ninguna comida en 30 días, **el bloque entero no se pinta** (ni título ni botones).

### Calendario de constancia

Tal como lo dejó la spec 008, sin cambios de comportamiento: cuadrícula de 12 semanas que termina el domingo de la semana en curso, nivel 0-3 según cuántos de los tres tipos se apuntaron ese día, `<title>` en cada casilla y detalle al tocar en una línea debajo.

Antes de tocar ninguna casilla, esa línea dice `Toca un día para ver qué apuntaste.` Con un cuadradito sin nada tocado, el texto es el que ya da `textoDeCasilla()`: `10/08/2026 — sin registros`.

### Cuándo se recalcula

El mecanismo es el de la spec 008 (`alRefrescar` + `obtenerRegistros()`), pero **hoy solo está cableado en la lista de peso**: `listaComidas` y `listaEjercicios` no tienen `alRefrescar`, porque la gráfica no las necesitaba. Esta spec **tiene que añadírselo a las dos**, o "Hoy" no se enteraría de que has apuntado una comida.

Las tres listas pasan a llamar a una única función `refrescarPantallas()`, que repinta la gráfica y "Hoy". "Hoy" lee con `obtenerRegistros()`: **ninguna consulta nueva a Firestore.**

## 5. Modelo de datos

**Ninguna colección, campo ni regla nueva.** Todo sale de lo ya cargado:

| Fuente | Cómo se lee | Para qué |
|---|---|---|
| `usuarios/{uid}/pesajes` | `listaPeso.obtenerRegistros()` | peso de hoy y calendario |
| `usuarios/{uid}/comidas` | `listaComidas.obtenerRegistros()` | comidas de hoy, "lo de siempre" y calendario |
| `usuarios/{uid}/ejercicios` | `listaEjercicios.obtenerRegistros()` | minutos de hoy y calendario |

Al repetir una comida se escribe un documento nuevo en `usuarios/{uid}/comidas` con `guardarComida()`, exactamente igual que un alta normal.

`firestore.rules`: **sin cambios**.

## 6. Casos límite

- **Sin nada apuntado nunca**: resumen con tres guiones y sus tres botones; "Lo de siempre" no se pinta; el calendario sale entero vacío. Ningún error.
- **Sin nada apuntado hoy, pero con historial**: igual, pero "Lo de siempre" y el calendario sí tienen contenido.
- **Varios pesajes hoy**: se enseña el último apuntado.
- **Comida repetida que ya está apuntada hoy**: se guarda otra vez, como una comida más. No se avisa ni se impide: comer dos veces lo mismo en un día es normal.
- **Textos de comida muy largos**: el botón recorta el texto con puntos suspensivos, sin crecer ni romper la fila.
- **Comidas con el mismo texto y momentos distintos** (café con leche como desayuno y como merienda): cuentan juntas para el orden, y se repite con el momento de la vez más reciente.
- **Cambio de día con la app abierta** (pasa la medianoche): "Hoy" seguirá enseñando el día anterior hasta que algo la repinte. Aceptado: no se monta un temporizador para eso.
- **Fallo al cargar alguna lista**: la lista enseña su propio error como siempre; "Hoy" pinta lo que tenga (posiblemente vacío) sin añadir otro mensaje encima.
- **Repetir comida sin conexión**: mensaje de error y el botón se vuelve a habilitar; no se guarda nada a medias.
- **Fechas**: todo con las utilidades de `js/fechas.js`, en texto `AAAA-MM-DD` y hora local. Nada de `toISOString()`.

## 7. Archivos afectados

| Archivo | Cambio |
|---|---|
| `js/hoy.js` | **nuevo**. Cálculo puro: resumen del día y ranking de "lo de siempre". Sin tocar el DOM |
| `js/app.js` | sección "Hoy": pintar resumen, botones de "lo de siempre" y calendario. `PESTANA_INICIAL` a `"hoy"`. `refrescarPantallas()` nueva, y `alRefrescar` añadido a `listaComidas` y `listaEjercicios`, que hoy no lo tienen |
| `index.html` | sección `hoy` (resumen, "lo de siempre", calendario y su línea de detalle) y quinto botón en la barra inferior |
| `styles.css` | estilos del resumen y de los botones de "lo de siempre" |

**Estimación: ~280 líneas**, contando el cableado de las dos listas y el contenedor del calendario. Por debajo del límite de 300, pero justo.

## 8. Decisiones tomadas

- **"Hoy" solo mira y repite; para apuntar se va a su pestaña** → los formularios viven en un solo sitio; duplicarlos duplica lo que puede romperse.
- **"Lo de siempre" = las más repetidas de los últimos 30 días** → lo que de verdad comes a menudo sube solo, sin que una comida rara de ayer desplace al desayuno de siempre.
- **Se repite con el momento que tenía** → un toque y listo; preguntar el momento cada vez lo convertiría en un formulario más.
- **"Hoy" es la pantalla de inicio** → es el resumen; tiene sentido que sea lo primero.
- **Solo se repiten comidas, ni ejercicios ni pesajes** → un ejercicio repetido casi nunca dura lo mismo, y repetir un peso no significa nada.

## 9. Fuera de spec: ideas apuntadas

- Repetir un ejercicio de los habituales. → `docs/BACKLOG.md`
- Que "Hoy" se actualice sola al pasar la medianoche con la app abierta. → `docs/BACKLOG.md`

## ✅ Para probar a mano

Guion de prueba manual (lo rellena/afina el agente `qa-manual` antes de la prueba).
