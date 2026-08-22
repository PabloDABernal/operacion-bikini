# 041 — Ajustes en pestañas

- **Estado:** 📝 pendiente de implementar.
- **Fecha:** 2026-08-22
- **Referencia en PRODUCTO.md:** apartado "Qué hará (segunda ampliación de la v4, decidida el 22 de agosto de 2026)", puntos **"Ajustes deja de ser una columna de siete bloques"** y **"Ajustes es la excepción en escritorio"**.

## 1. Objetivo

Ajustes es el último punto que la auditoría de usabilidad del 20 de agosto
señaló y la v4 no llegó a tocar: siete bloques en una sola columna, en un
orden que mezcla lo de todos los días (la foto, el objetivo) con el borrado
irreversible de datos. Al terminar esta spec, Ajustes está partido en cuatro
pestañas, con la zona de peligro aislada en la suya, usando la misma
maquinaria de sub-pestañas que la spec 035 estrenó en Comidas y Ejercicio.

## 2. Criterio de "esto funciona"

1. Al entrar en **Ajustes** (tocando el avatar de la cabecera) se ve una fila
   de cuatro pestañas: **Perfil**, **Operación**, **App** y **Zona de
   peligro**, y se abre **Perfil**.
2. **Perfil** contiene, en este orden: "Mi objetivo" (el formulario con
   nombre, peso objetivo, altura, fecha objetivo y lo que la IA sabe de ti,
   con su botón Guardar) y "Foto de perfil".
3. **Operación** contiene "Operación bikini" (finalizar, con su confirmación,
   sus mensajes de estado y el botón de reintentar el archivado) y
   "Histórico".
4. **App** contiene "Proveedor de IA" y "Sesión" (el email con el que has
   entrado y "Cerrar sesión").
5. **Zona de peligro** contiene "Reiniciar datos" entero: el aviso, el botón
   de actualizar recuento, las casillas, y la confirmación escribiendo
   BORRAR.
6. Cambiar de pestaña no recarga nada ni pierde lo que estuvieras
   escribiendo en otra pestaña: solo cambia lo que se ve.
7. Salir de Ajustes y volver a entrar abre **Perfil** otra vez, no la última
   pestaña que estuvieras mirando (mismo criterio que la spec 035).
8. Todo lo que ya funcionaba en Ajustes sigue funcionando exactamente igual:
   guardar el objetivo, subir y quitar la foto, cambiar el proveedor de IA,
   cerrar sesión, finalizar la operación, ver y abrir el histórico,
   actualizar recuentos y borrar datos.
9. **En escritorio (≥ 64 rem)**: las pestañas de Ajustes **siguen viéndose** y
   siguen filtrando, y la sección sigue estrecha y centrada como hasta ahora.
   Es la excepción: en Comidas, Ejercicio, Hoy y Peso las pestañas
   desaparecen y los bloques se reparten en columnas, y eso no cambia.
10. Estrechar y ensanchar la ventana no deja Ajustes en un estado raro (sin
    pestaña abierta, o con dos bloques a la vez).

## 3. Alcance

### Entra

- Reagrupar los siete bloques de la sección Ajustes de `index.html` en cuatro
  `.subseccion`, con su fila `.subpestanas data-de="ajustes"`, sin cambiar el
  contenido de ningún bloque.
- El único reordenado dentro de un grupo: en **Perfil**, "Mi objetivo" pasa
  delante de "Foto de perfil" (hoy la foto va primero).
- La excepción de escritorio en `styles.css`: que las pestañas de Ajustes no
  se oculten y que sus sub-secciones sigan mostrándose solo si están activas.

### NO entra (explícitamente fuera)

- **Ningún cambio dentro de los bloques.** Los formularios, los textos, los
  botones, la confirmación de tres pasos del reinicio y los mensajes de error
  se quedan exactamente como están. Esta spec mueve cajas, no las abre.
- **Ningún cambio en la maquinaria de pestañas.** `abrirPestana()`,
  `abrirSubpestana()` y el enganche de `.subpestana` ya son genéricos y
  funcionan por sección: no hace falta tocarlos, y no se tocan. Lo único que
  cambia en `js/app.js` son las dos líneas del párrafo de error del proveedor
  de IA (sección 4).
- **Recordar la última pestaña abierta.** La spec 035 decidió a propósito que
  entrar en una sección es entrar por su primera pestaña. Ajustes no
  introduce una regla distinta.
- **Ajustes en varias columnas en escritorio.** Decidido explícitamente en
  contra (ver sección 8).
- **Enlaces profundos a una pestaña concreta de Ajustes** (por ejemplo, un
  atajo de Hoy que abra directamente la zona de peligro). `abrirPestana()` ya
  acepta un segundo argumento `subseccion` y seguirá aceptándolo, pero esta
  spec no crea ningún botón que lo use para Ajustes.
- **Sub-pestañas en ninguna otra sección.**

## 4. Comportamiento detallado

### HTML (`index.html`)

Dentro de `.seccion[data-seccion="ajustes"]`, antes que nada, la fila de
pestañas, calcada de la de Comidas:

```html
<div class="subpestanas" data-de="ajustes">
  <button type="button" class="subpestana activa" data-subseccion="perfil" aria-current="true">Perfil</button>
  <button type="button" class="subpestana" data-subseccion="operacion">Operación</button>
  <button type="button" class="subpestana" data-subseccion="app">App</button>
  <button type="button" class="subpestana" data-subseccion="peligro">Zona de peligro</button>
</div>
```

Y los bloques actuales repartidos en cuatro `div.subseccion`, sin tocar su
contenido interno:

| `data-subseccion` | Qué se lleva dentro (por sus ids actuales) |
|---|---|
| `perfil` (nace con `.activa`) | `#form-ajustes` con su `<h2>Mi objetivo</h2>`, y pegados a él sus dos mensajes (`#aviso-ajustes`, `#error-ajustes`); después `.bloque-foto-perfil` con su `<h2>Foto de perfil</h2>` y `#estado-perfil` |
| `operacion` | `<h2>Operación bikini</h2>`, `#bloque-finalizar`, `#estado-operacion`, `#error-operacion`, `#btn-reintentar-archivado`, `<h2>Histórico</h2>`, `#estado-historico`, `#lista-historico` |
| `app` | `<h2>Proveedor de IA</h2>`, `#proveedor-ia` con su `<label>`, `#guardado-proveedor`, **`#error-proveedor` (nuevo, ver abajo)**, `<h2>Sesión</h2>`, el párrafo con `#email-ajustes`, `#btn-salir` |
| `peligro` | `.zona-peligro` entera, tal cual |

`#aviso-ajustes` y `#error-ajustes` se van con `perfil`, pero **hay que
partir `#error-ajustes` en dos**. Hoy lo escriben tres sitios de `js/app.js`,
y con las pestañas puestas ya no comparten pantalla:

| Quién escribe | Dónde está el usuario | A dónde va a partir de ahora |
|---|---|---|
| `catch` del `submit` de `#form-ajustes`, y los errores de validación | pestaña **Perfil** | `#error-ajustes`, sin cambios |
| `catch` de `refrescarAjustes()` (fallo al cargar los ajustes) | pestaña **Perfil**: es la que se abre siempre al entrar en Ajustes | `#error-ajustes`, sin cambios |
| `catch` del listener `change` de `#proveedor-ia` | pestaña **App** | **`#error-proveedor`, nuevo** |

Sin esto, un fallo al guardar el proveedor de IA escribiría su mensaje en un
párrafo con `display: none` y el usuario no vería nada: creería que se ha
guardado. Es el principio que la spec 035 dejó escrito — "un error que
saliera en una pestaña que no se está mirando no serviría de nada".

`#error-proveedor` es un `<p class="error" role="alert">` vacío, calcado de
`#error-ajustes`, colocado justo detrás de `#guardado-proveedor`.

Los mensajes van pegados al bloque que los escribe y no al final de la
pestaña, por el mismo motivo que la spec 034: un aviso que sale lejos del
botón que se acaba de pulsar parece que no ha salido.

`#estado-operacion`, `#error-operacion` y `#btn-reintentar-archivado` siguen
**fuera** de `#bloque-finalizar` y dentro de la misma sub-sección: ese detalle
está comentado en el HTML y sigue valiendo (el bloque se oculta en cuanto la
operación deja de estar activa, y esos mensajes hacen falta justo entonces).

### JavaScript (`js/app.js`)

**Dos cambios, y solo dos:**

1. En el `catch` del listener `change` de `#proveedor-ia`, `id("error-ajustes")`
   pasa a ser `id("error-proveedor")`. El texto del mensaje no cambia.
2. `#error-proveedor` se añade a la lista de campos que `limpiarPantallas()`
   vacía al cerrar sesión, junto a `error-ajustes` y `aviso-ajustes`. Si no,
   el error de un usuario se le quedaría en pantalla al siguiente.

De la maquinaria de pestañas no hay nada que tocar.
`abrirPestana()` ya busca `.subpestanas[data-de="<sección>"]`
y, si la encuentra, abre la primera sub-pestaña; el listener de `.subpestana`
ya resuelve la sección con `closest(".seccion")`. Con el HTML puesto, Ajustes
entra solo.

El único cuidado: el HTML nace con `perfil` marcada `.activa` y con
`aria-current`, igual que Comidas y Ejercicio, para que la pantalla sea
coherente aunque se mire antes de que `abrirPestana()` corra por primera vez.

### CSS (`styles.css`)

Dentro del `@media (min-width: 64rem)` ya existente, junto a la regla que hoy
limita el ancho de Ajustes, la excepción:

```css
/* Ajustes es la excepción de la vista de escritorio: sus pestañas NO se
   esconden y sus bloques NO se reparten en columnas (spec 041). Un
   formulario estirado se lee peor, así que aquí la pantalla ancha solo
   sirve para tener la app centrada. Estas dos reglas deshacen, y solo para
   Ajustes, el .subpestanas { display: none } y el .subseccion
   { display: block } generales de arriba. */
.seccion[data-seccion="ajustes"] .subpestanas {
  display: flex;
}

.seccion[data-seccion="ajustes"] .subseccion:not(.activa) {
  display: none;
}
```

`display: flex` y no `revert`: es el valor que `.subpestanas` tiene en la hoja
base, y ponerlo explícito evita depender del orden en que se resuelvan las
cascadas.

## 5. Modelo de datos

Sin cambios. Esta spec no toca Firestore, ni `firestore.rules`, ni ninguna
llamada a la IA.

## 6. Casos límite

- **Sin operación en marcha.** `js/app.js` esconde partes de la app con la
  clase `.oculta` cuando no hay operación activa. La regla nueva de escritorio
  usa `:not(.activa)` para esconder, no un `display: block` para enseñar, así
  que no puede resucitar nada oculto — que es justo el fallo que el
  `:not(.oculta)` de la spec 036 tuvo que salir a parar. Aun así, hay que
  comprobar a mano que sin operación en marcha Ajustes sigue enseñando lo
  mismo que hoy.
- **Redimensionar la ventana cruzando los 64 rem.** Como el filtrado por
  `.activa` sigue vivo en Ajustes a los dos lados del corte, no hay estado que
  sincronizar: la pestaña abierta sigue siendo la misma.
- **Archivado fallido.** Al finalizar una operación y fallar el archivado, el
  mensaje y el botón de reintentar aparecen en la pestaña **Operación**, que
  es donde estabas al pulsar Finalizar. No hay salto de pestaña.
- **Mensajes de estado en una pestaña que no se ve.** El aviso de guardado del
  proveedor de IA (`#guardado-proveedor`) y el del formulario de objetivo
  (`#aviso-ajustes`) solo se disparan al tocar sus propios controles, que
  están en su misma pestaña. No hay ningún mensaje que se escriba en una
  pestaña estando en otra.
- **Fallo al cargar los ajustes.** El `catch` de `refrescarAjustes()` sigue
  escribiendo en `#error-ajustes`, que vive en **Perfil**. Es correcto sin
  hacer nada más: entrar en Ajustes abre siempre Perfil, así que el mensaje
  se ve en la pestaña en la que el usuario está.
- **Sin operación en marcha.** `#bloque-finalizar` sigue oculto por `.oculta`
  dentro de la pestaña **Operación**, y esa pestaña no se abre sola. Es lo
  esperado: no hay nada que finalizar, y la app ya empuja a iniciar una
  operación desde otro sitio. No se fuerza ningún cambio de pestaña.
- **Foco del teclado.** Al cambiar de pestaña, los controles ocultos quedan
  con `display: none` y salen del recorrido del tabulador solos, igual que en
  Comidas y Ejercicio.

## 7. Archivos afectados

| Archivo | Qué cambia |
|---|---|
| `index.html` | La sección Ajustes se reagrupa en cuatro `.subseccion` con su fila de `.subpestanas`. Contenido de los bloques intacto. |
| `js/app.js` | Dos líneas: el `catch` de `#proveedor-ia` escribe en `#error-proveedor`, y ese id entra en la lista de `limpiarPantallas()`. Nada más. |
| `styles.css` | Dos reglas nuevas dentro del `@media (min-width: 64rem)`, y actualizar el comentario que dice que "Ajustes no se recoloca en esta spec". |
| `docs/PRODUCTO.md` | Ya actualizado: nueva sección "segunda ampliación de la v4". |
| `docs/ESTADO.md` | Al terminar. |
| `docs/BACKLOG.md` | Se quitan los dos ítems que esta spec resuelve. |

No se toca `firestore.rules` ni ninguna función de `api/`.

Tamaño estimado: ~120 líneas de HTML movidas (no nuevas) y ~10 de CSS. Muy por
debajo del límite de 300 de la regla 4.

## 8. Decisiones tomadas

Decisiones de producto confirmadas por el usuario el 22 de agosto de 2026:

- **Cuatro pestañas y no tres.** Se valoró fundir la zona de peligro dentro de
  "Operación", porque finalizar, el histórico y reiniciar hablan los tres de
  datos de una etapa. Se descartó: el motivo entero de esta spec es que el
  borrado irreversible deje de compartir pantalla con lo que se toca cada
  semana. Meterlo debajo del histórico lo devolvería al mismo sitio.
- **Sub-pestañas y no un simple reordenado.** También se valoró dejar Ajustes
  en una columna y limitarse a mover la zona de peligro al final. Se descartó
  porque sigues recorriendo siete bloques con scroll, que es el diagnóstico
  original, y porque la maquinaria de la spec 035 ya está hecha y es genérica.
- **En escritorio, Ajustes conserva sus pestañas.** Es una excepción
  deliberada a la vista de escritorio de la spec 036: allí las pestañas se
  esconden porque los bloques caben a la vez en columnas, pero un formulario
  estirado a 1100 px se lee peor que uno estrecho. Ajustes ya estaba limitado
  a `--ancho-columna` en escritorio precisamente por eso; esta spec solo
  completa esa decisión en lugar de contradecirla.
- **En "Perfil", el objetivo va antes que la foto.** Es el bloque que
  realmente se abre a cambiar algo; la foto se toca una vez y no se vuelve.
- **El error del proveedor de IA se separa en su propio párrafo**, en vez de
  dejar `#error-ajustes` fuera de las pestañas (siempre visible) o duplicar
  mensajes. Detectado por `revisor-specs` el 22 de agosto: `#error-ajustes`
  lo escriben tres sitios y uno de ellos se muda a otra pestaña. Un párrafo
  de error por bloque es lo que ya hace el resto de la app.
- **"Zona de peligro" como nombre de la pestaña**, y no "Reiniciar datos": la
  clase CSS ya se llama `.zona-peligro` y el nombre avisa antes de entrar,
  que es lo que se busca.

## 9. Fuera de spec: ideas apuntadas

- Un atajo desde algún sitio que abra directamente una pestaña concreta de
  Ajustes, aprovechando el `data-subseccion` que `abrirPestana()` ya acepta.
- Que la pestaña "App" acabe recogiendo más preferencias si algún día las hay
  (hoy solo tiene el proveedor de IA y la sesión, y se queda algo escueta).

## ✅ Para probar a mano

En producción (https://operacion-bikini.vercel.app), con una operación en
marcha. Del 1 al 5, en el móvil; del 6 en adelante, en el PC.

### Que lo nuevo funcione

1. Toca tu avatar para entrar en **Ajustes**. Se ve una fila de cuatro
   pestañas — **Perfil · Operación · App · Zona de peligro** — y está abierta
   **Perfil**.
2. En **Perfil**: primero "Mi objetivo" (nombre, peso objetivo, altura, fecha
   objetivo, lo que la IA sabe de ti, botón Guardar) y debajo "Foto de
   perfil". Nada más.
3. Toca **Operación**: "Operación bikini" (con su botón de finalizar) e
   "Histórico". Toca **App**: "Proveedor de IA" y "Sesión". Toca **Zona de
   peligro**: "Reiniciar datos" entero. En cada una, lo de las otras tres no
   se ve.
4. Escribe algo en "Peso objetivo" **sin guardar**, vete a **Operación** y
   vuelve a **Perfil**: lo que escribiste sigue ahí.
5. Estando en **Zona de peligro**, sal a Peso con la barra de abajo y vuelve
   a entrar en Ajustes: se abre **Perfil**, no la pestaña donde estabas.

### Que no se haya roto nada de antes

6. **Perfil**: cambia el peso objetivo y dale a Guardar. Sale "Ajustes
   guardados". Recarga la página: el valor sigue puesto.
7. **Perfil**: sube una foto de perfil. Aparece "Quitar foto". Tócalo: el
   avatar vuelve a la inicial de tu email y el botón desaparece (spec 039).
8. **App**: cambia el proveedor de IA a "Probar Groq primero". Sale el aviso
   de guardado. Ve a **Consulta**, manda un mensaje corto y comprueba que
   responde. Luego devuélvelo a "Automático".
9. **Operación**: comprueba que el histórico sigue listando tus operaciones
   cerradas y que al tocar una se abre en solo lectura. **No hace falta
   finalizar la operación en marcha solo para esto.**
10. **Zona de peligro**: toca "↻ Actualizar recuento" y comprueba que los
    números de las casillas se actualizan. Marca una casilla, dale a "Borrar
    lo seleccionado" y comprueba que sale el aviso y el campo de escribir
    BORRAR. **Luego cancela / sal de la pestaña sin llegar a borrar nada.**
11. **App**: toca "Cerrar sesión". Vuelve a entrar: todo sigue igual.

### El error del proveedor de IA, que es lo delicado

12. En el PC, abre las herramientas de desarrollador (F12), pestaña **Red**, y
    marca **Sin conexión / Offline**. Ve a **Ajustes → App** y cambia el
    proveedor de IA. Tiene que salir **"No se ha podido guardar el proveedor
    de IA. Comprueba tu conexión."** ahí mismo, debajo del desplegable, en la
    pestaña App. Si no ves ningún mensaje, esto es el fallo que buscamos.
    Quita el "Sin conexión" y vuelve a cambiarlo: ahora sí se guarda.

### Escritorio (spec 036, que no debe cambiar)

13. Con la ventana ancha (maximizada), entra en **Comidas**, **Ejercicio**,
    **Hoy** y **Peso**: en las cuatro, las sub-pestañas **no se ven** y los
    bloques salen repartidos en columnas, como hasta ahora.
14. Entra en **Ajustes** con la ventana igual de ancha: aquí las pestañas
    **sí se siguen viendo**, y la sección sigue siendo una columna estrecha
    centrada, sin estirarse de lado a lado. Es la única sección que se
    comporta así, y es a propósito.
15. Estando en Ajustes con la pestaña **Zona de peligro** abierta, estrecha la
    ventana hasta el ancho de un móvil y vuelve a ensancharla. La pestaña
    abierta sigue siendo **Zona de peligro** y en ningún momento se ven dos
    bloques a la vez ni ninguno.
