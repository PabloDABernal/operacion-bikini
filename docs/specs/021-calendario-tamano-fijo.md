# 021 — El calendario de constancia, a tamaño fijo

- **Estado:** revisada
- **Fecha:** 2026-08-16
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v2)", pantalla "Hoy" con su calendario de constancia. No cambia el producto: corrige cómo se ve.

## 1. Objetivo

Que los cuadraditos del calendario midan siempre lo mismo, elijas el rango que elijas. Hoy, con "1 semana", una sola columna se estira hasta ocupar media pantalla.

## 2. Criterio de "esto funciona"

1. Con **1 semana** elegida, el calendario es una columna estrecha de siete cuadraditos pequeños, no un bloque gigante.
2. Con **2 semanas**, dos columnas del mismo tamaño que las anteriores.
3. Con **12 meses**, los cuadraditos siguen midiendo lo mismo y el calendario **cabe a lo ancho** del móvil sin scroll lateral.
4. Cambiar de rango no cambia el tamaño del cuadradito, solo cuántos hay.
5. Se siguen pudiendo tocar para ver el detalle del día.

## 3. Alcance

### Entra

- Tamaño fijo del cuadradito, con un tope de ancho para el calendario entero.
- Que a 52 semanas se encoja lo justo para caber, sin salirse.

### NO entra (explícitamente fuera)

- Cambiar los rangos, los colores ni los niveles.
- Poner etiquetas de meses o días de la semana alrededor.
- Tocar nada más de "Hoy".

## 4. Comportamiento detallado

El SVG del calendario se dibuja con un `viewBox` cuyo ancho depende del número de columnas, y en CSS tiene `width: 100%`. Con pocas columnas, ese 100% estira cada casilla hasta deformarla.

La solución es no dejar que el SVG crezca más de lo que mide de verdad:

- El calendario deja de ocupar el 100% del ancho y pasa a medir lo que le corresponde: **12 píxeles por columna** (10 de casilla y 2 de hueco, que es lo que ya usa el dibujo).
- Ese ancho se calcula al pintar y se pone como estilo del contenedor.
- Se mantiene un **tope**: si con muchas columnas no cabe en la pantalla, el calendario se limita al ancho disponible y las casillas se encogen proporcionalmente, como hasta ahora. Es decir, el 100% pasa de ser el tamaño a ser el límite.

## 5. Modelo de datos

**Ninguno.**

## 6. Casos límite

- **1 semana**: una columna de 12 píxeles de ancho. Se ve pequeño, que es justo lo que se busca.
- **52 semanas en una pantalla estrecha**: 624 píxeles no caben en un móvil de 360; el tope hace que se encojan, como ahora.
- **Pantalla muy ancha**: el calendario no se estira más allá de su tamaño natural.

## 7. Archivos afectados

| Archivo | Cambio |
|---|---|
| `js/app.js` | al pintar el calendario, fijar el ancho del contenedor según las columnas |
| `styles.css` | el bloque del calendario deja de estirarse |

**Estimación: ~25 líneas.**

## 8. Decisiones tomadas

- **Tamaño fijo con tope, en vez de tamaño variable** → un cuadrito de constancia significa lo mismo en todos los rangos; que cambie de tamaño según el zoom hace que parezcan otra cosa.

## 9. Fuera de spec: ideas apuntadas

- Etiquetas de mes encima del calendario cuando el rango es largo. → `docs/BACKLOG.md`

## ✅ Para probar a mano

Se prueba junto con el resto de specs de la v3.
