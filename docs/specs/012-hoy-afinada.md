# 012 — "Hoy" afinada: resumen con +, accesos directos y calendario con rango

- **Estado:** revisada
- **Fecha:** 2026-08-13
- **Referencia en PRODUCTO.md:** apartado "Ampliación de la v2", puntos «"Hoy" como centro de la app», «Calendario de constancia con rango elegible» y «Nombre de pila».

## 1. Objetivo

Arreglar "Hoy" con lo que pidió el usuario al probarla: que cada línea enseñe lo último apuntado y un **+** para añadir más, que desde ahí se llegue a Consulta, Consejos y Fotos, que el calendario deje de ser un ladrillo de 12 semanas, y que en la cabecera se vea un nombre en vez de un email partido en tres líneas.

## 2. Criterio de "esto funciona"

1. En "Hoy", la línea de **Comidas** enseña la última comida apuntada hoy y, a su derecha, un botón **+**.
2. Si hoy no has apuntado ninguna comida, esa línea enseña **solo el +**, sin guiones ni textos de relleno.
3. Tocar el **+** de cualquier línea abre su pestaña (Peso, Comidas o Ejercicio).
4. Lo mismo en las líneas de **Peso** (el último pesaje de hoy) y **Ejercicio** (el último ejercicio de hoy).
5. Debajo del resumen hay tres accesos: **Consulta**, **Consejos** y **Fotos**. Cada uno abre su sección.
6. En **Ajustes** ya **no** está el bloque provisional "Más secciones" de la spec 011.
7. El **calendario** se abre mostrando **el último mes**, no 12 semanas.
8. Encima del calendario hay un selector con **1 semana · 2 semanas · 1 mes · 3 meses · 6 meses · 12 meses**. Al elegir otro, el calendario se redibuja con ese rango.
9. Con 12 meses elegido, el calendario sigue cabiendo a lo ancho del móvil sin scroll horizontal.
10. En **Ajustes** hay un campo **"Cómo quieres que te llamen"**. Al guardarlo, en la cabecera aparece ese nombre junto a la foto, en lugar del email.
11. Sin nombre puesto, la cabecera enseña el email, pero **en una sola línea** y recortado si no cabe, no partido en tres.
12. El bloque **"Lo de siempre"** ya no está en "Hoy".

## 3. Alcance

### Entra

- **Resumen con lo último y +**: cada línea (Peso, Comidas, Ejercicio) enseña lo último apuntado hoy y un botón **+** que lleva a su pantalla. Sin nada apuntado, solo el **+**.
- **Accesos directos** a Consulta, Consejos y Fotos en "Hoy".
- **Retirada de los atajos provisionales** de Ajustes que puso la spec 011.
- **Selector de rango del calendario**: 1 semana, 2 semanas, 1 mes (por defecto), 3, 6 y 12 meses.
- **Fuera "Lo de siempre"** de "Hoy". Su sitio es la pantalla de Comidas, que es la spec 013.
- **Nombre de pila**: campo nuevo en Ajustes y uso en la cabecera.

### NO entra (explícitamente fuera)

- **Las comidas frecuentes en la pantalla de Comidas**: spec 013. Entre esta spec y la siguiente, repetir una comida no se puede hacer desde ningún sitio. Es un paso atrás temporal y consciente.
- **Que la IA use el nombre**: se guarda y se enseña, pero los prompts no lo mencionan todavía. Eso va con el perfil, en la spec 016.
- **Preguntar el nombre en la entrevista**: spec 016.
- **Recordar el rango elegido** entre sesiones: al recargar vuelve a 1 mes.
- **Cambiar la gráfica de peso**: su selector de rango es la spec 015.

## 4. Comportamiento detallado

### Resumen del día

Tres líneas. Cada una: etiqueta, lo último apuntado hoy, y el botón **+**.

| Línea | Lo último de hoy | Sin nada hoy |
|---|---|---|
| Peso | `82,4 kg` | (vacío) |
| Comidas | el texto de la última comida | (vacío) |
| Ejercicio | `bici estática · 30 min` | (vacío) |

- "La última" es la primera de la lista ya ordenada: las listas vienen de más reciente a más antigua.
- El texto largo se recorta con puntos suspensivos; la línea no crece.
- El **+** está siempre, haya o no algo apuntado, y siempre hace lo mismo: abrir la pestaña.
- Desaparecen los botones "Pesarme" / "Apuntar comida" / "Apuntar ejercicio" de la spec 010: los sustituye el **+**.

### Accesos directos

Debajo del resumen, tres botones a ancho repartido: **Consulta**, **Consejos**, **Fotos**. Llaman a `abrirPestana()`. Reutilizan la clase `.atajo` que ya creó la spec 011, que ahora vive solo aquí.

### Calendario con rango

- Encima del calendario, seis botones: `1 sem · 2 sem · 1 mes · 3 meses · 6 meses · 12 meses`. El elegido se marca en coral.
- Por defecto, **1 mes**.
- El rango en semanas de cada opción: 1, 2, 4, 13, 26 y 52. `calendarioDeConstancia()` ya recibe el número de semanas como parámetro, así que no hay que tocar el cálculo.
- El tamaño del cuadradito se mantiene: lo que cambia es el número de columnas. Como el SVG escala con `width: 100%`, con 52 semanas los cuadraditos salen más pequeños pero siguen cabiendo.
- Al cambiar de rango solo se redibuja el calendario; el resto de "Hoy" no se toca.
- La línea de detalle vuelve a `Toca un día para ver qué apuntaste.` al cambiar de rango.

### Nombre de pila

- Campo de texto en Ajustes, el primero del formulario: **"Cómo quieres que te llamen"**, con `placeholder` de ejemplo.
- Máximo 30 caracteres. Se recorta a los lados. Si queda vacío, se guarda como vacío y la cabecera vuelve al email.
- Se guarda con el resto de ajustes, en el mismo botón "Guardar".
- La cabecera enseña `nombre` si lo hay, y si no el email. En ambos casos **en una sola línea**, con puntos suspensivos si no cabe.

## 5. Modelo de datos

| Colección | Campo | Tipo | Cambio |
|---|---|---|---|
| `usuarios/{uid}` | `nombre` | string (puede ser cadena vacía) | **nuevo**, lo valida y guarda `validarAjustes()`/`guardarAjustes()` |

`firestore.rules`: **sin cambios**.

## 6. Casos límite

- **Nombre con solo espacios**: se guarda vacío, la cabecera enseña el email.
- **Nombre larguísimo**: se corta a 30 caracteres al validar, y además la cabecera lo recorta visualmente.
- **Email larguísimo sin nombre**: una línea con puntos suspensivos. El ancho lo manda la cabecera, no el email.
- **Varios registros del mismo tipo hoy**: se enseña el último.
- **Rango de 52 semanas con pocos datos**: se pinta la cuadrícula entera, casi toda vacía. Es correcto: enseña cuánto llevas sin apuntar.
- **Cambiar de rango con una casilla ya tocada**: el detalle se limpia, porque la casilla que se estaba viendo puede haber desaparecido.
- **Sin conexión**: igual que hasta ahora; "Hoy" pinta lo que haya en memoria.

## 7. Archivos afectados

| Archivo | Cambio |
|---|---|
| `index.html` | resumen sin los botones de texto, accesos directos, selector de rango, fuera el bloque de "lo de siempre" y los atajos provisionales de Ajustes, campo de nombre |
| `js/app.js` | resumen con lo último y **+**, selector de rango, fuera `pintarLoDeSiempre`/`repetirComida`, nombre en la cabecera |
| `js/ajustes.js` | `nombre` en `validarAjustes()` y en `leerAjustes()` |
| `styles.css` | selector de rango, cabecera de una línea, ajustes del resumen |

**Estimación: ~230 líneas.**

## 8. Decisiones tomadas

- **Cada línea enseña lo último y un +** → decisión del usuario el 2026-08-13: "que salga la última de hoy y el más para poner más, y si no sale, con darle al + debe sobrar".
- **El calendario abre en 1 mes** → 12 semanas por defecto era un ladrillo.
- **El rango no se recuerda** → un botón más de estado que guardar y sincronizar, para algo que se elige en un segundo.
- **El nombre se guarda ya, aunque la IA no lo use hasta la 016** → así la cabecera deja de enseñar el email partido desde hoy.
- **Repetir comida queda inaccesible hasta la 013** → mover el bloque en dos pasos es más limpio que dejarlo duplicado en dos pantallas.

## 9. Fuera de spec: ideas apuntadas

- Recordar el último rango elegido del calendario entre sesiones. → `docs/BACKLOG.md`

## ✅ Para probar a mano

Se prueba junto con el resto de specs de esta tanda.
