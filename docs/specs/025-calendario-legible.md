# 025 — Un calendario de constancia que se entienda

- **Estado:** completada (validada por el usuario el 2026-08-17)
- **Fecha:** 2026-08-16
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v2)", calendario de constancia de la pantalla "Hoy".

## 1. Objetivo

Que la constancia se lea. Hoy, en rangos cortos, son dos columnas de cuadraditos apretados contra el borde izquierdo que no dicen nada: ni qué día es cada uno, ni qué semana.

## 2. Criterio de "esto funciona"

1. Con **1 semana, 2 semanas o 1 mes**, la constancia se ve como un **calendario**: siete columnas de lunes a domingo, con las iniciales arriba y **el número del día dentro** de cada casilla.
2. Las casillas son grandes y ocupan el ancho disponible, sin apelotonarse a la izquierda.
3. El día de hoy se distingue del resto.
4. Los días que aún no han llegado se ven apagados.
5. Con **3, 6 o 12 meses**, se ve el mapa de calor de siempre (semanas en columnas), ahora con **etiquetas de mes** encima.
6. En los dos formatos, tocar un día sigue enseñando debajo qué apuntaste.
7. Con 12 meses, sigue cabiendo a lo ancho del móvil.

## 3. Alcance

### Entra

- Vista de **calendario** para 1 semana, 2 semanas y 1 mes.
- Vista de **mapa de calor** con etiquetas de mes para 3, 6 y 12 meses.
- Marca del día de hoy y atenuado de los días futuros.

### NO entra (explícitamente fuera)

- Cambiar los rangos disponibles ni cuál viene por defecto.
- Cambiar cómo se calcula el nivel de cada día.
- Poder tocar un mes para ampliarlo.

## 4. Comportamiento detallado

### Rangos cortos: calendario

- Rejilla de **siete columnas** (L M X J V S D) con su cabecera.
- Una fila por semana. Cada casilla lleva el **número del día** y se colorea según el nivel, como hasta ahora.
- Las casillas son cuadradas y se reparten el ancho: en un móvil salen de unos 40 px.
- **Hoy** lleva un borde en el color de acento.
- Los días **futuros** van al 35 % de opacidad.
- Se dibuja con HTML y CSS, no con SVG: hace falta texto dentro y eso en SVG es incómodo.

### Rangos largos: mapa de calor

- Se mantiene el SVG actual, con las semanas en columnas.
- Encima, una fila de **etiquetas de mes** (`ene`, `feb`…) colocada sobre la primera semana de cada mes.
- Tamaño de casilla como hasta ahora, encogiéndose para caber.

### En los dos

Tocar un día escribe debajo la misma línea de siempre: `12/08/2026 — peso, comida`.

## 5. Modelo de datos

**Ninguno.**

## 6. Casos límite

- **La semana en curso**: se pinta entera, con los días que faltan apagados.
- **Cambio de mes a mitad de fila**: no se marca de ninguna forma especial en la vista de calendario; el número del día basta para ubicarse.
- **12 meses en pantalla estrecha**: como hasta ahora, las casillas se encogen.
- **Un mes con 5 o 6 semanas**: se pintan las filas que hagan falta.

## 7. Archivos afectados

| Archivo | Cambio |
|---|---|
| `js/grafica-svg.js` | etiquetas de mes en el mapa de calor |
| `js/calendario.js` | **nuevo**: la vista de calendario en HTML |
| `js/app.js` | elegir vista según el rango |
| `styles.css` | la rejilla del calendario |

**Estimación: ~200 líneas.**

## 8. Decisiones tomadas

- **Dos vistas según el rango** → un mapa de calor de dos columnas no comunica nada, y un calendario de 52 semanas no cabe. Cada rango pide una forma distinta.
- **El número del día dentro** → sin él, en un calendario corto no se sabe qué día es cada casilla.
- **HTML en vez de SVG para la vista corta** → hace falta texto dentro de cada casilla.

## 9. Fuera de spec: ideas apuntadas

- Tocar un mes del mapa de calor para verlo como calendario. → `docs/BACKLOG.md`

## ✅ Para probar a mano

Se prueba junto con el resto de specs de la v3.
