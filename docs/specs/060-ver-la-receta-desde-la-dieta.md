# 060 — Ver la receta desde la dieta

- **Estado:** borrador
- **Fecha:** 2026-08-28
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v8: la despensa, decidida el 28 de agosto de 2026)", tercera spec.
- **Depende de:** la spec 059, que crea el cruce despensa/receta y las marcas.

## 1. Objetivo

Que desde **Comidas → Mi dieta**, en una comida de la semana que tenga una receta
enlazada, se pueda abrir esa receta y leerla sin salir de la dieta.

## 2. Por qué existe esta spec

Salió de la revisión de la 059, el 28 de agosto. Aquella spec daba por hecho que
una receta ya se podía leer desde la dieta, y **no es verdad**: la dieta guarda el
`recetaId` de cada comida, pero solo lo usa en el desplegable de edición
(`js/app.js`). `filaDeComida()` pinta el momento y el texto, y nada más.

Se separó **antes** de implementar nada, no a posteriori: montar esa vista es una
pantalla nueva, no una marca encima de una que ya existe.

## 3. Criterio de "esto funciona"

1. En **Comidas → Mi dieta**, una comida con receta enlazada enseña que la tiene:
   se distingue a simple vista de una que no.
2. Tocándola se abre la receta: nombre, raciones, ingredientes y preparación.
3. Una comida **sin** receta enlazada (el yogur, la fruta, casi todos los
   desayunos y meriendas) **no** ofrece nada que abrir, y no cambia respecto a
   hoy. Es el caso mayoritario: la IA devuelve como mucho ocho recetas por semana.
4. Con la despensa en uso, los ingredientes salen marcados igual que en el
   recetario: "lo tienes" o "te falta", y el resumen "Tienes 5 de 8".
5. Cerrar la receta devuelve a la semana **tal y como estaba**, en el mismo sitio.
6. El botón **"Me lo he comido"** (spec 034) y el cupo de dietas siguen
   funcionando exactamente igual que antes. Es la regresión que más importa.
7. Si la receta enlazada ya no existe (se borró desde el recetario), la comida lo
   dice en vez de abrir una pantalla vacía.

## 4. Alcance

### Entra

- Señal visible de "esta comida tiene receta" en la semana de la dieta.
- Abrir y cerrar la receta desde ahí.
- Reutilizar el pintado de receta con marcas de la spec 059, sin duplicarlo.

### NO entra (explícitamente fuera)

- **Editar la receta desde la dieta.** Para eso está el recetario.
- **Enlazar una receta a mano** a una comida que no la tiene: ya se puede, desde
  el desplegable de edición de la celda.
- **Lista de la compra.** Sigue siendo idea de `docs/PRODUCTO.md`.
- **Cambiar nada del cruce despensa/receta.** Viene hecho de la 059.

## 5. Comportamiento detallado

Pendiente de detallar: **cómo se abre** (botón "Ver receta" en la fila, o tocar la
fila entera) y **cómo se enseña** (desplegando dentro de la semana, o en la capa
de detalle que ya usa el archivo de operaciones). Se decide con el usuario al
escribir esta spec de verdad, no ahora: la 059 solo necesitaba que quedara claro
que esto **no** entra en ella.

Lo que sí está decidido: **la receta se lee, no se edita**, y el cruce y las
marcas se reutilizan tal cual de la 059.

## 6. Casos límite

- Comida sin `recetaId`: nada que abrir. Es el caso normal.
- `recetaId` que apunta a una receta borrada: se dice, no se abre en blanco.
- Receta sin ingredientes: se abre igual, sin marcas ni resumen (como en la 059).

## 7. Archivos afectados (estimación)

| Archivo | Qué |
|---|---|
| `js/app.js` | `filaDeComida()` y el pintado de la dieta: la señal y la apertura. **Cuidado: aquí viven también el cupo y el botón "Me lo he comido" de la spec 034.** |
| `index.html` | El contenedor de la receta abierta, si no se reaprovecha uno existente. |
| `styles.css` | La señal de "tiene receta" y la receta abierta. |

No toca `firestore.rules`, ni `api/`, ni el modelo de datos: todo lo que hace
falta ya está guardado.

## 8. Decisiones tomadas

- **Se separa de la 059 antes de implementar** (usuario, 28 de agosto), en vez de
  hacer crecer aquella spec por encima de 300 líneas y meterle mano al código que
  lleva el botón de marcar comida.

## 9. Fuera de spec: ideas apuntadas

- Ninguna todavía.

## ✅ Para probar a mano

(Lo afina el agente `qa-manual` antes de la prueba.)
