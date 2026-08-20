# 035 — Sub-pestañas en Comidas y Ejercicio, y nombres que dejan de pisarse

- **Estado:** revisada (`revisor-specs`: CUMPLE CON REPAROS el 2026-08-20; los dos reparos, corregidos)
- **Fecha:** 2026-08-20
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v4, decidida el 20 de agosto de 2026)", puntos **"Sub-pestañas dentro de las secciones grandes"** y **"Nombres que no se pisan"**.

## 1. Objetivo

Comidas y Ejercicio dejan de ser una sola página de seis y cinco bloques que
solo se recorre con scroll. Cada una se parte en **tres sub-pestañas** a un
toque, y los títulos que hoy se pisan entre sí pasan a llamarse por lo que son.

## 2. Criterio de "esto funciona"

1. En **Comidas**, arriba del contenido, hay una fila de tres sub-pestañas:
   **Apuntar · Mi dieta · Recetas**. Al entrar está activa "Apuntar".
2. En "Apuntar" se ve el formulario de nueva comida, "Lo de siempre" y la lista
   de lo que llevas apuntado. **No** se ve ni el recetario ni la semana.
3. Tocar **"Mi dieta"** enseña la semana y, debajo, el bloque de pedírsela a la
   IA. Desaparece todo lo demás.
4. Tocar **"Recetas"** enseña solo el recetario.
5. En **Ejercicio** pasa lo mismo con **Apuntar · Mi tabla · Catálogo**.
6. La sub-pestaña activa se distingue de un vistazo, y no solo por el color.
7. Al cambiar de sub-pestaña se ve el principio del contenido, no la mitad.
8. Salir de Comidas y volver te deja siempre en **"Apuntar"**, estuvieras donde
   estuvieras antes.
9. En **Hoy**, el atajo **"Hacer dieta"** lleva a Comidas **y deja abierta la
   sub-pestaña "Mi dieta"**. El atajo **"Tabla de ejercicios"** lleva a
   Ejercicio con **"Mi tabla"** abierta.
10. Los títulos de dentro de Ejercicio ya no se pisan: el catálogo dice que es
    lo que sabes hacer y el diario dice que es lo que has hecho.
11. La barra inferior sigue teniendo los mismos cinco destinos: no se toca.
12. Todo lo que ya funcionaba sigue funcionando: apuntar, editar la semana,
    pedirla a la IA, el recetario, los filtros por día y los desplegables.

## 3. Alcance

### Entra

- Una fila de sub-pestañas en Comidas y otra en Ejercicio, dentro de
  `.contenido-operacion`.
- Envolver los bloques que ya existen en tres contenedores por sección, **sin
  cambiar su contenido** más allá de los títulos.
- El JavaScript que cambia de sub-pestaña, y el que la resetea a la primera al
  entrar en la sección.
- Que los dos atajos de Hoy abran la sub-pestaña que toca.
- Los cambios de nombre de la tabla de abajo.
- El CSS de la fila de sub-pestañas.

### NO entra (explícitamente fuera)

- **La barra inferior de cinco destinos.** No se le añade ni se le quita nada.
- **La vista de escritorio.** Los bloques que salen de aquí serán las columnas
  del escritorio, pero eso es la spec 036. Aquí no se toca ningún `@media`.
- **Sub-pestañas en Ajustes**, que también tiene siete bloques. Está en
  `docs/BACKLOG.md`.
- **Cambiar qué hace cada bloque.** Esta spec mueve y renombra; no toca
  formularios, ni validaciones, ni Firestore, ni las llamadas a la IA.
- **Las etiquetas de los cuatro atajos de Hoy.** Siguen diciendo "Hacer dieta" y
  "Tabla de ejercicios": `PRODUCTO.md` las nombra así literalmente en el
  apartado de la v3, y cambiarlas exigiría tocarlo. Lo que cambia es a dónde
  llevan, no cómo se llaman.
- **Recordar en qué sub-pestaña estabas.** Decidido por el usuario: siempre se
  vuelve a la primera.

## 4. Comportamiento detallado

### El reparto

**Comidas** — tres sub-pestañas, en este orden:

| Sub-pestaña | Qué lleva dentro (bloques que ya existen) |
|---|---|
| **Apuntar** | "Nueva comida" (`#form-comida`), "Lo de siempre" (`#bloque-lo-de-siempre`) y la lista con su filtro por día (`#filtro-comidas`, `#estado-comidas`, `#btn-reintentar-comidas`, `#lista-comidas`, `#btn-desplegar-comidas`) |
| **Mi dieta** | La semana (`#estado-dieta`, `#btn-semana-blanco`, `#semana-dieta`, `#aviso-dieta`) y debajo el bloque de pedírsela a la IA (`#pedir-dieta`, `#form-plan-dieta`, `#cupo-dieta`) |
| **Recetas** | El recetario entero (`#estado-recetas`, `#btn-nueva-receta`, `#form-receta`, `#lista-recetas`, `#btn-desplegar-recetas`) |

**Ejercicio** — la misma forma, para que las dos secciones se aprendan una sola
vez:

| Sub-pestaña | Qué lleva dentro |
|---|---|
| **Apuntar** | "Nuevo ejercicio" (`#form-ejercicio`) y la lista con su filtro (`#filtro-ejercicios`, `#estado-ejercicios`, `#btn-reintentar-ejercicios`, `#lista-ejercicios`, `#btn-desplegar-ejercicios`) |
| **Mi tabla** | La semana (`#estado-tabla`, `#btn-semana-blanco-tabla`, `#semana-tabla`, `#aviso-tabla`) y debajo pedírsela a la IA (`#pedir-ejercicio`, `#form-plan-ejercicio`, `#cupo-ejercicio`) |
| **Catálogo** | El catálogo entero (`#estado-catalogo`, `#btn-nuevo-ejercicio-catalogo`, `#form-ejercicio-catalogo`, `#lista-catalogo`, `#btn-desplegar-catalogo`) |

Cada párrafo de error y de guardado se queda **dentro de la sub-pestaña de su
bloque**: un error que saliera en una pestaña que no se está mirando no serviría
de nada.

### Los nombres

| Sección | Título de hoy | Pasa a ser | Por qué |
|---|---|---|---|
| Ejercicio | "Mis ejercicios" (el catálogo) | **"Ejercicios que me sé"** | Se pisaba con el diario. Ahora dice que es lo que sabes hacer |
| Ejercicio | "Mis entrenamientos apuntados" | **"Lo que llevo apuntado"** | Dice que es el diario, y es la misma frase que en Comidas |
| Ejercicio | "Tabla de ejercicios" (pedírsela a la IA) | **"Pedírsela a la IA"** | Dejaba de distinguirse de "Mi tabla" |
| Comidas | "Mis comidas" | **"Lo que llevo apuntado"** | Simetría con Ejercicio: el mismo bloque, el mismo nombre |
| Comidas | "Hacer dieta" (pedírsela a la IA) | **"Pedírsela a la IA"** | Se pisaba con "Mi dieta" |

"Mi dieta" y "Mi tabla" **no cambian**: ya dicen lo que son.

### Cómo se comporta la fila de sub-pestañas

- Es una fila de botones, no enlaces: no cambia la URL ni el historial, igual
  que la barra inferior que ya existe.
- La activa se marca **por color y además por una línea**, como ya hace
  `.nav-boton.activa`. El color solo no basta.
- Al tocar una se sube al principio, igual que ya hace `abrirPestana()` al
  cambiar de sección.
- Para marcar cuál está puesta se usa **`aria-current="true"`**, no el patrón
  `role="tablist"`/`role="tab"`. Motivo: ese patrón completo obliga además a
  `role="tabpanel"`, a `aria-controls` y a moverse entre pestañas con las
  flechas del teclado; dejarlo a medias le promete a un lector de pantalla un
  comportamiento que la app no tiene, y eso es peor que no ponerlo. `aria-current`
  es válido en un botón normal y dice exactamente lo que hace falta decir. Si
  algún día se quiere el patrón entero, va con su propia spec.
- La barra inferior de secciones **no se toca** en esta spec, aunque hoy tenga el
  mismo hueco. Cambiarla es otro alcance.

### Entrar en la sección

`abrirPestana()` acepta un segundo argumento opcional con la sub-pestaña que hay
que dejar abierta. Si no se le pasa nada, abre **la primera** de esa sección.
Los botones de la barra inferior no le pasan nada; los dos atajos de Hoy sí,
mediante un `data-subseccion` en el HTML.

### Trampa conocida: la clase `.atajo` sirve para dos cosas

`js/app.js` engancha la navegación con
`document.querySelectorAll(".nav-boton, .atajo")` una sola vez, al cargar. Pero
hay un segundo uso de esa clase: el botón "Pedir dieta" / "Pedir tabla" que se
crea a mano en tiempo de ejecución (`boton.className = "atajo"`) y que **no
navega a ninguna parte**, solo despliega su formulario. Hoy no chocan porque el
`querySelectorAll` corre antes de que ese botón exista.

Al tocar esta parte **no se puede** pasar a delegar el evento en el documento ni
volver a consultar el selector más tarde: el botón de pedir empezaría a navegar
a `undefined`. Si hace falta reengancharlo, que sea por un selector propio de
los atajos de Hoy, no por la clase compartida.

## 5. Modelo de datos

**Ninguno.** No se toca Firestore ni `firestore.rules`. Esta spec solo mueve
cosas de sitio en la pantalla y les cambia el nombre.

## 6. Casos límite

- **Sin operación en marcha**: las secciones ya enseñan "Primero inicia tu
  operación bikini desde Hoy" y ocultan `.contenido-operacion` entero. Las
  sub-pestañas van **dentro** de ese contenedor, así que se ocultan con él y no
  aparece una fila de pestañas huérfana.
- **Pantalla de 320 px**: tres sub-pestañas caben, pero "Catálogo" y "Mi tabla"
  van justas. Se resuelve como ya se resolvió en la barra inferior: la letra se
  encoge sola con `clamp()`, sin partirse en dos líneas ni abreviarse.
- **Formulario a medio rellenar al cambiar de sub-pestaña**: el contenido se
  oculta, no se destruye, así que al volver sigue escrito. Es el comportamiento
  de hoy al cambiar de sección y no cambia.
- **Un aviso de "Guardado" puesto al cambiar de sub-pestaña**: su temporizador
  sigue corriendo y se limpia solo. Sin efectos.
- **`scrollIntoView()` del formulario de receta y del de catálogo**
  (`js/app.js`): esos formularios viven dentro de su sub-pestaña, que está
  visible cuando se pulsa el botón que los abre. Debe seguir funcionando; hay
  que comprobarlo al probar.
- **Los desplegables de las listas largas** (`btn-desplegar-*`) y los filtros por
  día: no se tocan, pero quedan dentro de una sub-pestaña. Hay que comprobar que
  siguen respondiendo.

## 7. Archivos afectados

| Archivo | Qué se hace |
|---|---|
| `index.html` | Envolver los bloques de Comidas y Ejercicio en tres contenedores cada una, añadir las dos filas de sub-pestañas, cambiar los cinco títulos y poner `data-subseccion` en los dos atajos de Hoy. |
| `js/app.js` | `abrirPestana()` acepta la sub-pestaña; función nueva para cambiarla; enganchar los botones nuevos. |
| `styles.css` | La fila de sub-pestañas y el estado activo. |
| `docs/ESTADO.md` | Al terminar, cuando el usuario la valide. |

No se toca `firestore.rules`, ni `api/`, ni ninguno de los módulos de datos
(`js/dietas.js`, `js/tablas.js`, `js/recetas.js`…).

**Tamaño estimado:** entre 200 y 300 líneas, casi todas de mover HTML de sitio.
Es la spec más grande de la v4 y roza el límite de `CLAUDE.md`. Se decidió no
partirla porque Comidas y Ejercicio son la misma estructura repetida y dejar la
app medio migrada entre dos sesiones sería peor. **Si al implementar se pasa de
300, hay que parar y avisar al usuario.**

## 8. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| Tres sub-pestañas, y las mismas tres en las dos secciones | Elegido por el usuario el 2026-08-20 entre dos, tres y cuatro. Simétricas para aprenderlas una sola vez |
| Los nombres pasan a decir lo que la cosa es | Elegido por el usuario el 2026-08-20 frente a fiarlo todo a la pestaña. Al buscar con la vista, el título es la pista |
| Al volver a una sección se abre siempre la primera sub-pestaña | Elegido por el usuario el 2026-08-20. Es lo que ya hace la app al cambiar de sección, que te manda arriba del todo |
| "Mis comidas" pasa a llamarse igual que su gemelo de Ejercicio | Se deduce de las dos decisiones anteriores: si las secciones son simétricas, el mismo bloque no puede tener dos nombres |
| `aria-current` en vez del patrón ARIA de pestañas | Decisión técnica al corregir el `revisor-specs`. Un `role="tab"` sin `tabpanel` ni flechas del teclado miente al lector de pantalla |
| Los atajos de Hoy conservan su etiqueta | `PRODUCTO.md` los nombra literalmente en la v3. Cambiarlos sería otra decisión y otro documento |

## 9. Fuera de spec: ideas apuntadas

Ya anotadas en `docs/BACKLOG.md` el 2026-08-20:

- Sub-pestañas también en Ajustes, si estas funcionan bien.
- Reordenar Ajustes, que son siete bloques en una sola columna.

## ✅ Para probar a mano

Lo rellena el agente `qa-manual` antes de la prueba.
