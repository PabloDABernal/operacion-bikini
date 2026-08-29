# 066 — La barra con iconos, y Ajustes de vuelta

- **Estado:** implementada y desplegada el 29 de agosto de 2026. **Pendiente de que el usuario la pruebe**.
- **Fecha:** 2026-08-29
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v10)", tercera spec, y su sub-apartado "Ajustes vuelve a la barra: esto revierte una decisión anterior".

## 1. Objetivo

Que la barra de navegación sea de iconos —salvo "Hoy", que se queda en texto— y
que **Ajustes vuelva a la barra** con un engranaje.

## 2. Ojo: esto revierte la spec 024

La **spec 024** sacó Ajustes de la barra a propósito y lo puso detrás del avatar.
Tenía sentido con cinco botones de texto, donde no cabía más.

Con iconos caben siete, y esconder Ajustes detrás de una foto nunca fue evidente:
hay que saberlo. **Decisión del usuario del 29 de agosto, tomada sabiendo que
revertía la 024**, y ya escrita en `docs/PRODUCTO.md`.

**El avatar deja de abrir Ajustes.** Dos caminos a la misma pantalla es justo la
duplicidad que la v4 se dedicó a quitar.

## 3. Criterio de "esto funciona"

1. La barra tiene **siete botones**: Hoy, Peso, Comidas, Ejercicio, Fotos,
   Consulta y **Ajustes**.
2. **"Hoy" se ve en texto.** Los otros seis son iconos, sin palabra.
3. **Ajustes es un engranaje** y abre Ajustes.
4. **Tocar el avatar ya no abre Ajustes.** Sigue enseñando tu foto o tu inicial.
5. Se ve cuál es la sección en la que estás.
6. En el móvil, los siete botones **caben sin apretarse ni salirse**, y cada uno
   se puede tocar con el dedo sin acertar de milagro.
7. En escritorio la barra sigue donde está hoy, con los mismos siete.
8. Un lector de pantalla dice el nombre de cada sección.
9. Todo lo demás de la navegación sigue igual: los atajos de "Hoy", las
   sub-pestañas y los enlaces con `data-seccion`.

## 4. Alcance

### Entra

- Seis iconos nuevos y el botón de Ajustes en la barra.
- Quitar el avatar como puerta a Ajustes.
- La barra recolocada para que siete botones quepan en móvil.

### NO entra (explícitamente fuera)

- **Quitar el avatar.** Sigue enseñando tu foto: lo que se le quita es abrir
  Ajustes.
- **Cerrar sesión**, que sigue dentro de Ajustes.
- **Las sub-pestañas** de Comidas y Ejercicio, que se quedan en texto.
- **Reordenar las secciones.** El orden es el de hoy, con Ajustes al final.

## 5. Comportamiento detallado

### Los iconos

Uno por sección, en `TRAZOS_DE_ICONO`: **peso** (una báscula), **comidas**,
**ejercicio**, **fotos** (una cámara), **consulta** (un bocadillo de diálogo) y
**ajustes** (un engranaje).

**"Hoy" se queda en texto**, decisión del usuario: es la sección a la que más se
vuelve y la única que no tiene un dibujo obvio.

Cada botón lleva `aria-label` con el nombre de la sección, y `title`. La sección
activa se marca como ya se marca hoy.

### Que quepan siete en un móvil

Es el riesgo real de esta spec, y donde hay que mirar de verdad. La barra ya
reparte su ancho entre los botones; con siete, cada uno tiene menos.

**Mínimo innegociable: 44 px de zona táctil.** Si con siete botones no se llega
en una pantalla estrecha, hay que decirlo y decidir, **no encogerlos y ya**.

**La cuenta, hecha:** la barra ocupa el ancho entero de la pantalla (`left: 0;
right: 0`, y su `.interior` no lleva relleno lateral). En 320 px, que es la
pantalla más estrecha que se contempla, cada botón se lleva **320/7 = 45,7 px**.
Por encima de los 44, con poco margen pero por encima. En un móvil normal de
360 px son 51,4.

**Con la palabra debajo del icono no habría salido**, y esa es la razón de fondo
por la que los iconos van solos: no era solo estética.

### El avatar

`#btn-perfil` deja de abrir Ajustes: se queda como imagen. Hay que quitarle
también lo que lo hacía parecer pulsable (el cursor, el foco), o seguirá
prometiendo algo que ya no hace.

`#avatar-ajustes`, el de dentro de Ajustes, no se toca.

## 6. Modelo de datos

Ninguno.

## 7. Casos límite

- **Pantalla muy estrecha** (320 px): ver arriba. Es lo primero que hay que
  probar.
- **Sin operación activa**: la barra se comporta como hoy.
- **Icono desconocido**: `iconoDeAccion()` ya no revienta (lección de la 058).

## 8. Archivos afectados

| Archivo | Qué |
|---|---|
| `index.html` | Los siete botones de la barra. |
| `js/app.js` | Seis trazos nuevos, el pintado de la barra y quitar el avatar como puerta. |
| `styles.css` | La barra con siete, y el avatar sin aspecto de botón. |
| `docs/PRODUCTO.md` | Ya actualizado: la reversión de la 024 está escrita. |

Estimación: **100-150 líneas**, casi todo iconos y CSS.

## 9. Decisiones tomadas

- **Ajustes vuelve a la barra con un engranaje, y el avatar deja de abrirlo**
  (usuario, 29 de agosto), sabiendo que revierte la spec 024.
- **Iconos solos, sin palabra debajo, salvo "Hoy"** (usuario, misma
  conversación). Con siete botones es lo único que cabe cómodo en móvil. El
  precio es que un icono sin palabra hay que aprendérselo; se compensa con el
  `title` y el `aria-label`.

## 10. Fuera de spec: ideas apuntadas

- Enseñar el nombre de la sección como título dentro de la pantalla al entrar,
  para que el icono no haya que adivinarlo.

## ✅ Para probar a mano

(Lo afina el agente `qa-manual` antes de la prueba.)
