# 022 — Paleta violeta nocturna

- **Estado:** revisada
- **Fecha:** 2026-08-16
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v3)", punto "Paleta violeta nocturna".

## 1. Objetivo

Cambiar el carácter de la app sin tocar su estructura: el fondo sigue siendo oscuro, pero con base violeta, y el acento pasa del coral al violeta.

## 2. Criterio de "esto funciona"

1. Al entrar, el fondo es un violeta muy oscuro, no el azulado de antes.
2. Los botones principales (Guardar, Pedir consejo, Iniciar operación) son **violetas**, no coral.
3. La sección activa de la barra de navegación se marca en violeta.
4. La **gráfica de peso** dibuja su línea en violeta, y el **calendario de constancia** sus niveles en violeta.
5. El texto se lee bien en todas las pantallas: nada de gris sobre gris.
6. La **zona de peligro** (reiniciar datos) sigue distinguiéndose del resto en rojo, sin confundirse con el violeta.
7. Los avisos de "Guardado" y los títulos de consejos y planes siguen en cian, que sigue haciendo de segundo color.
8. No cambia ninguna pantalla de sitio: solo los colores.

## 3. Alcance

### Entra

- Cambiar los valores de las variables de color en `:root`.
- Ajustar el `theme-color` de la pestaña del navegador.
- Los tres tonos del calendario, que se derivan del acento.

### NO entra (explícitamente fuera)

- Cambiar tipografía, espaciados, radios ni sombras.
- Mover, quitar ni añadir nada en ninguna pantalla.
- Tema claro ni interruptor: la app sigue siendo oscura siempre.

## 4. Comportamiento detallado

Cambian solo estas variables:

| Variable | Antes | Ahora |
|---|---|---|
| `--fondo` | `#12141a` | `#16131f` |
| `--superficie` | `#1b1e26` | `#201b2e` |
| `--superficie-alta` | `#232733` | `#2a2440` |
| `--borde` | `#2f3441` | `#3a3252` |
| `--tinta` | `#e8eaf0` | `#ece8f5` |
| `--tinta-suave` | `#9aa1b4` | `#a79fc0` |
| `--acento` | `#ff4d6d` (coral) | `#a855f7` (violeta) |
| `--apoyo` | `#4cc9f0` | `#22d3ee` (cian, ajustado) |
| `--sobre-acento` | `#12141a` | `#f7f3ff` |
| `--error` | `#ff8a95` | `#ff8a95` (se queda) |

Dos avisos que condicionan los valores:

- **El texto sobre el acento cambia de color.** Sobre el coral había que poner texto casi negro; sobre el violeta `#a855f7` se lee mucho mejor en blanco roto. Por eso `--sobre-acento` pasa de oscuro a claro.
- **El error se queda en rojo claro** a propósito: si el acento es violeta y el error también tirara a morado, la zona de peligro dejaría de gritar.

El resto de la hoja de estilos no se toca: todo usa las variables desde la spec 009, así que basta con cambiarlas en un sitio.

## 5. Modelo de datos

**Ninguno.**

## 6. Casos límite

- **Contraste**: el violeta `#a855f7` sobre el fondo oscuro se lee bien para botones y títulos. Sigue sin usarse para texto pequeño, como ya decidió la spec 009.
- **Niveles del calendario**: son el mismo violeta con 30 %, 60 % y 100 % de opacidad, así que se adaptan solos.
- **La gráfica**: toma los colores de las variables desde la spec 009; no hay que tocar el JS.
- **Destello al cargar**: el `theme-color` y el fondo cambian a la vez, así que no aparece ningún color viejo.

## 7. Archivos afectados

| Archivo | Cambio |
|---|---|
| `styles.css` | los valores de `:root` |
| `index.html` | el `theme-color` |

**Estimación: ~15 líneas.**

## 8. Decisiones tomadas

- **Violeta nocturno** → elegido por el usuario el 2026-08-16 entre tres opciones.
- **El cian se queda como segundo color** → hace de contrapunto frío al violeta y ya distingue lo confirmado ("Guardado") de lo accionable.
- **El rojo del error no se toca** → un error morado sobre fondo morado no avisa de nada.

## 9. Fuera de spec: ideas apuntadas

Ninguna.

## ✅ Para probar a mano

Se prueba junto con el resto de specs de la v3.
