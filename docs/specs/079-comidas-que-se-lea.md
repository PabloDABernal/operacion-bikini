# 079 — Comidas, que se lea

- **Estado:** 🚧 implementada y desplegada el 31 de agosto de 2026. **Pendiente de que el usuario la pruebe.**
- **Fecha:** 2026-08-31
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v15: Comidas, que se lea, decidida el 31 de agosto de 2026)".

## 1. Objetivo

Que Comidas se pueda usar sin hacer scroll infinito: sub-pestañas con icono en
el móvil, Apuntar sin cuatro bloques apilados, la lista de la compra detrás de
un botón y un buscador en las recetas.

## 2. Por qué existe

Comidas ha ido creciendo spec a spec —el diario, las bebidas (062), los
acompañamientos (063), las recetas (026), la despensa (058), la compra (073), las
73 recetas de golpe (075)— y nunca se ha rehecho la pantalla. El resultado, dicho
por el usuario al usarla:

- **Cinco sub-pestañas con texto** no caben en 320 px.
- **Apuntar apila cuatro bloques grandes**: alta de comida, su diario, alta de
  bebida y su diario. Es el scroll infinito.
- **Buscar una receta** entre 73 no se puede: la lista se recorta a 3 con "Ver
  todos", y a partir de ahí es leer 73 nombres.

## 3. Criterio de "esto funciona"

1. En el **móvil**, la barra de Comidas enseña **cuatro iconos** sin texto:
   Apuntar, Mi dieta, Recetas y Despensa. Se distinguen y se tocan bien.
2. En **escritorio** no hay pestañas —nunca las hubo: desde la spec 036 se ven
   todos los bloques a la vez— y **la Despensa sale ARRIBA de su columna**, no
   enterrada debajo de las Recetas.
3. **La Compra ya no es pestaña**: dentro de Despensa, arriba, hay un botón
   **"Ver lista de la compra"** con el número de cosas que faltan.
4. Ese botón abre la compra, y desde la compra hay una vuelta a la despensa.
   En escritorio los dos botones **no se ven**: la despensa y la compra están
   una encima de otra y llevarían a donde ya estás.
5. En **Apuntar**, lo primero que se ve es el alta de comida y el diario. La
   bebida está **plegada** tras un botón "¿Has bebido algo?"; al pulsarlo se
   abre su formulario y su diario.
6. En **escritorio**, Apuntar sale en **dos columnas**: a la izquierda las
   altas, a la derecha lo apuntado. En el móvil sigue siendo una columna.
7. En **Recetas** hay un buscador. Escribes `pollo` y salen las que lo llevan
   **en el nombre o en los ingredientes**.
8. Cada resultado dice **por qué ha entrado** cuando ha sido por un ingrediente.
9. Buscar algo que no está lo dice, no deja la lista muda.
10. Con el buscador vacío, Recetas se ve **exactamente como hoy**.

## 4. Alcance

### Entra

- Iconos en las sub-pestañas de Comidas, con texto solo en escritorio.
- La compra pasa de sub-pestaña a botón dentro de Despensa.
- La bebida, plegada en Apuntar.
- Dos columnas en Apuntar, solo en escritorio.
- Buscador de recetas por nombre e ingrediente.

### NO entra (explícitamente fuera)

- **Iconos en Ejercicio ni en Ajustes.** Sus barras tienen tres y cuatro
  pestañas y caben. Cuando molesten, se hace igual y ya está el patrón.
- **Tocar qué hace cada pantalla.** Esto recoloca; no cambia ninguna función.
- **Filtrar recetas por otra cosa** que no sea el texto: ni por raciones, ni por
  tiempo, ni por si tienes los ingredientes. Eso último ya lo dice el cruce
  (059) al abrirla.
- **Paginar el recetario.** Con buscador, la lista larga deja de ser el problema.
- **Sacar el diario a su propia pestaña.** Se valoró y se descartó: apuntar y
  comprobar lo apuntado se hacen seguidos.

## 5. Comportamiento detallado

### Las sub-pestañas

Se reutiliza `iconoDeAccion()` y `TRAZOS_DE_ICONO` de la spec 066, que es lo que
ya dibuja la barra inferior. Cinco trazos nuevos: `apuntar`, `dieta`, `recetas`,
`despensa` y `compra`.

El texto **no se borra del HTML**: se envuelve en un `<span class="etiqueta">`
que el CSS esconde visualmente, **sin `display: none`**, para que el lector de
pantalla lo siga leyendo — un botón que solo contiene un dibujo no se anuncia
como nada. El `title` lo dice al pasar el ratón.

> **Corregido al implementarla.** La spec decía "icono en móvil, icono y texto
> en escritorio". En escritorio **la barra de pestañas no existe**: desde la
> spec 036, Comidas enseña todos sus bloques a la vez en tres columnas y
> `.subpestanas` está en `display: none`. Así que la etiqueta se esconde
> siempre; lo que sí se ha hecho en escritorio es **subir la Despensa**, que era
> lo que el usuario pedía con "en web debería salir arriba".

### La lista de la compra

Deja de tener botón en la barra. Su `<div class="subseccion">` **se queda**, y se
llega desde un botón en **Despensa**, arriba del todo:

```
[ 🛒 Ver lista de la compra (7) ]
```

El número es lo que falta, y se recalcula al pintar la despensa. Si no falta
nada, el botón lo dice —"Ver lista de la compra"— sin número, en vez de
esconderse: esconder el sitio donde mirar es peor que enseñarlo vacío.

Dentro de la compra, arriba, un enlace **"← Volver a la despensa"**.

### En escritorio: la despensa arriba

La rejilla de tres columnas se reparte así:

| Columna 1 | Columna 2 | Columna 3 |
|---|---|---|
| Apuntar | Mi dieta | **Despensa** |
|  | Recetas | Compra |

La despensa estaba debajo de Recetas, y con las 73 recetas de la spec 075 quedó
a media pantalla de scroll. Lo que se mira a diario es qué tienes.

### Apuntar

La bebida entera —su formulario, sus errores y su diario— se mete en un bloque
plegable tras un botón **"¿Has bebido algo?"**, con el mismo patrón que "Cambiar
fecha y hora" (spec 037). Empieza **cerrado**.

En escritorio, dos columnas con el patrón `.columna` que ya usan Hoy y Peso:

| Izquierda | Derecha |
|---|---|
| Nueva comida (y la bebida plegada) | Lo que llevo apuntado |

### El buscador de recetas

Un campo, como el de la despensa (spec 069). Filtra lo que se pinta, no lo que
hay. Busca en **el nombre y en los ingredientes**, comparando normalizado —sin
tildes ni mayúsculas—, con la misma `normalizar()` de `js/despensa.js` que ya
usan la despensa, el armario y el cruce.

- Si entra **por el nombre**, la tarjeta se ve como siempre.
- Si entra **solo por un ingrediente**, debajo del nombre sale una línea:
  *"lleva pollo"*. Sin eso, ver "Crema de calabaza" al buscar "pollo" parece un
  error.
- Sin resultados: *"Ninguna receta contiene «pollo»."*
- El buscador aparece a partir de **8 recetas**, igual que el de la despensa. Con
  las 73 de la spec 075 sale siempre, pero quien las borre no tiene por qué
  cargar con un campo que no le hace falta.

Buscar **no toca** el recorte a 3 con "Ver todos": si hay resultados de sobra,
se siguen recortando igual.

## 6. Modelo de datos

**Sin cambios.** Ni colecciones, ni campos, ni `firestore.rules`. Esta spec no
guarda nada nuevo: recoloca y filtra.

## 7. Casos límite

- **Sin recetas**: no hay buscador y el estado vacío se ve como hoy.
- **Receta sin ingredientes**: no puede entrar por ingrediente; por nombre sí.
- **Buscar y luego crear una receta**: se limpia la búsqueda al guardar, como
  hace la despensa (spec 069), para que lo recién creado no parezca perdido.
- **Estar en la Compra y recargar**: se abre en Apuntar, la de por defecto. La
  compra ya no es un destino de la barra, y no se guarda dónde estabas.
- **Pantalla justo en 900 px**: el texto de las pestañas aparece o desaparece en
  ese punto. No hay estado intermedio.
- **El botón de la compra con muchas cosas** (más de 99): sale el número tal
  cual. Una lista de la compra de 100 líneas es un problema de la lista, no del
  botón.

## 8. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| **Iconos en la barra de Comidas** | Cinco palabras no caben en 320 px, y abreviarlas las vuelve un jeroglífico. En escritorio la barra no se ve, así que el texto se esconde siempre —pero sin `display: none`, para no dejar mudo al lector de pantalla. |
| **La despensa, arriba en escritorio** | Estaba enterrada bajo 73 recetas. Se mira a diario. |
| **La compra sale de la barra y pasa a botón** | Se usa una vez por semana; una pestaña permanente para eso le quita sitio a lo diario. Decisión del usuario el 31 de agosto. |
| **El botón de la compra se ve aunque no falte nada** | Esconder el sitio donde se mira es peor que enseñarlo vacío. |
| **La bebida, plegada** | Es lo que menos se apunta y ocupaba media pantalla. Mismo patrón que fecha y hora. |
| **Un solo campo de búsqueda**, no uno por nombre y otro por ingrediente | Un desplegable para elegir dónde buscar es un gesto más y una decisión que nadie quiere tomar. |
| **Decir "lleva pollo"** cuando entra por ingrediente | Sin eso, un resultado cuyo nombre no menciona lo buscado parece un fallo. |
| **El diario NO se va a otra pestaña** | Apuntar y comprobar lo apuntado se hacen seguidos. |

## 9. Archivos afectados

| Archivo | Qué |
|---|---|
| `index.html` | Iconos y `<span class="etiqueta">` en las pestañas de Comidas; botón de la compra en Despensa; la bebida dentro de un plegable; las dos columnas de Apuntar; el campo de búsqueda en Recetas. |
| `js/app.js` | Pintar los iconos de las sub-pestañas; el botón de la compra con su cuenta; abrir y cerrar la bebida; filtrar el recetario. |
| `styles.css` | Esconder la etiqueta bajo 900 px; el botón de la compra; el plegable. |

Estimación: en torno a **250 líneas**. No toca lógica de datos, solo pantalla.

## 10. Fuera de spec: ideas apuntadas

- Llevar los iconos a las sub-pestañas de Ejercicio y Ajustes.
- Que la búsqueda de recetas entienda "lo que puedo hacer con lo que tengo",
  cruzando con la despensa.

## ✅ Para probar a mano

Guion completo: lo afina `qa-manual`. En corto, los diez puntos del apartado 3,
**en el móvil y en el portátil**, que es donde esta spec se juega todo.
