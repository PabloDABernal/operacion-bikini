# 034 — La confirmación de guardado, donde está el dedo

- **Estado:** ✅ completada. Validada por el usuario el 2026-08-20 probando en producción.
- **Fecha:** 2026-08-20
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v4, decidida el 20 de agosto de 2026)", punto **"La confirmación aparece donde está el dedo"**.

## 1. Objetivo

Al apuntar algo desde la semana de dieta ("Me lo he comido") o desde la semana de
tabla ("Lo he hecho"), el usuario ve la confirmación **en el propio botón que ha
pulsado**, en vez de en un párrafo que cae fuera de la pantalla.

## 2. Criterio de "esto funciona"

1. En **Comidas → Mi dieta**, con una semana guardada, pulsar "Me lo he comido"
   en una comida del **primer día** hace que **ese mismo botón** pase a decir
   "✓ Guardado" sin necesidad de hacer scroll.
2. Pasados unos 3 segundos, el botón vuelve a decir "Me lo he comido" y se puede
   pulsar otra vez.
3. Mientras dice "✓ Guardado", el botón está deshabilitado: pulsarlo de nuevo no
   apunta la comida dos veces.
4. La comida sigue apareciendo en "Mis comidas" igual que antes: esta spec no
   cambia lo que se guarda, solo cómo se avisa.
5. Lo mismo, punto por punto, en **Ejercicio → Mi tabla** con el botón
   "Lo he hecho".
6. Si falla (por ejemplo sin conexión), el botón pasa a decir
   "✗ No se ha guardado" en color de error y el mensaje explicativo aparece
   además en su sitio de siempre.
7. El aviso sigue anunciándose a un lector de pantalla, como hasta ahora.

## 3. Alcance

### Entra

- Un ayudante nuevo que da la respuesta en el propio botón (texto, color y
  deshabilitado temporal), en `js/app.js`.
- Usarlo en `apuntarDeLaDieta()` y en `apuntarDeLaTabla()`, en sus dos caminos:
  el que va bien y el que falla.
- Las clases de CSS para el botón confirmado y el botón fallido.
- **Se mantiene** la llamada a `avisarGuardado()` que ya existe. El párrafo
  `#guardado-dieta` / `#guardado-tabla` lleva `role="status"`: si se quitara, un
  lector de pantalla dejaría de anunciar el guardado. Que el párrafo quede fuera
  de la vista es justo el fallo que arregla esta spec, pero para quien no mira la
  pantalla sigue siendo la única señal.

### NO entra (explícitamente fuera)

- **Que la fila recuerde que ya lo apuntaste hoy.** La semana no guarda estado:
  se decidió así en la spec 028 y `PRODUCTO.md` (v4) lo confirma. El botón vuelve
  a su texto original a los 3 segundos y no consulta el diario. Está en
  `docs/BACKLOG.md` por si algún día se quiere.
- **Los demás avisos de guardado de la app.** `avisarGuardado()` se usa en diez
  sitios; los otros ocho están justo debajo de su formulario y se ven. No se
  tocan.
- **Mover o rediseñar los párrafos de error** `#error-semana` y
  `#error-semana-tabla`. Se quedan donde están; lo único que cambia es que ahora
  el botón también avisa.
- Cambiar el tiempo que dura el aviso en el resto de la app.

## 4. Comportamiento detallado

### El ayudante

Una función en `js/app.js`, hermana de `avisarGuardado()`, que recibe el botón
pulsado y si la cosa fue bien o mal:

- **Guarda** el texto original del botón antes de tocarlo.
- **Bien**: texto → `"✓ Guardado"`, clase `boton-confirmado`, `disabled = true`.
- **Mal**: texto → `"✗ No se ha guardado"`, clase `boton-fallido`,
  `disabled = true`.
- A los **3 segundos** (el mismo tiempo que `avisarGuardado()`, para que la app
  se comporte igual en todas partes): vuelve el texto original, se quita la clase
  y `disabled = false`.

Si se vuelve a llamar sobre un botón que ya está en mitad de su aviso, se cancela
el temporizador anterior y se cuenta de nuevo, para que no se quede con el texto
cambiado para siempre.

### Dónde se usa

- `apuntarDeLaDieta(comida)` — hoy escribe en `#guardado-dieta` (que está debajo
  de los siete días) o en `#error-semana`. Pasa a recibir además el botón que se
  ha pulsado, para poder responder en él.
- `apuntarDeLaTabla(sesion)` — igual, con `#guardado-tabla` y
  `#error-semana-tabla`.

Los dos sitios que construyen esos botones —`filaDeComida()` para la dieta y
`filaDeSesion()` para la tabla— le pasan el botón a la función que apunta.

### Colores

- `boton-confirmado`: el mismo color de apoyo que ya usa `.boton-comido`, pero
  relleno en vez de solo borde, para que el cambio se note de un vistazo.
- `boton-fallido`: el color de error que ya existe (`--error`).

Ningún hexadecimal nuevo: los colores salen de las variables de `styles.css`,
como manda el sistema visual de la spec 009.

## 5. Modelo de datos

**Ninguno.** Esta spec no toca Firestore. Lo que se guarda, cuándo y con qué
forma es exactamente lo de antes.

## 6. Casos límite

- **Sin conexión**: el `catch` que ya existe se dispara. El botón dice
  "✗ No se ha guardado" y el párrafo de error explica qué pasó. Nada se apunta.
- **Pulsar dos veces seguidas muy rápido**: el botón está deshabilitado desde la
  primera respuesta, así que no se duplica el registro. Entre el toque y la
  respuesta de Firestore sí hay un hueco en el que se puede pulsar dos veces:
  **eso ya pasaba antes de esta spec y no cambia aquí**, porque deshabilitar
  desde el primer toque es un cambio de comportamiento mayor que merece su
  propia decisión.
- **Editar una celda de la semana mientras el botón dice "✓ Guardado"**: editar
  llama a `pintarDieta()` / `pintarTabla()`, que rehacen las filas enteras y se
  llevan por delante el botón y su temporizador. El aviso desaparece antes de
  tiempo. Se acepta: son dos acciones distintas y la segunda ya da su propia
  señal.
- **Cambiar de sección con el aviso puesto**: el temporizador sigue corriendo y
  al volver el botón ya está normal. Sin efectos.
- **Sesión caducada**: se comporta como cualquier otro fallo de escritura, por el
  mismo `catch`.

## 7. Archivos afectados

| Archivo | Qué se hace |
|---|---|
| `js/app.js` | Añadir el ayudante junto a `avisarGuardado()`. Modificar `apuntarDeLaDieta()`, `apuntarDeLaTabla()`, `filaDeComida()` y `filaDeSesion()` para pasarles el botón. |
| `styles.css` | Dos clases nuevas: `.boton-confirmado` y `.boton-fallido`. |
| `docs/ESTADO.md` | Al terminar, cuando el usuario la valide. |

No se toca `index.html`, ni `firestore.rules`, ni ninguna función de `api/`.

**Tamaño estimado:** unas 60 líneas.

## 8. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| La confirmación va **en el botón**, no en un aviso flotante ni en un párrafo movido de sitio | Elegido por el usuario el 2026-08-20. Es el único punto de la pantalla donde se sabe con certeza que está mirando: acaba de tocar ahí. |
| La semana **sigue sin recordar** lo apuntado | Elegido por el usuario el 2026-08-20 entre esa opción y la de marcar estado. Cambiarlo contradiría la spec 028 y obligaría a tocar `PRODUCTO.md`. |
| Se mantiene `avisarGuardado()` además del aviso en el botón | No es código de más: el párrafo tiene `role="status"` y es lo único que oye un lector de pantalla. |
| 3 segundos, el mismo tiempo que el resto de la app | Que dos avisos de la misma app duren distinto no tiene ninguna justificación. |

## 9. Fuera de spec: ideas apuntadas

Anotadas en `docs/BACKLOG.md` el 2026-08-20:

- Que la semana de dieta y de tabla marquen qué has cumplido hoy.
- Revisar si algún aviso de guardado debería quedarse hasta que lo cierres, en
  vez de irse a los 3 segundos.

## ✅ Para probar a mano

En https://operacion-bikini.vercel.app, con una operación en marcha.

**Preparación:** en **Comidas**, baja hasta "Mi dieta" y comprueba que hay una
semana guardada (si no, pulsa "Empezar una semana en blanco" y rellena un par de
celdas). Lo mismo en **Ejercicio** → "Mi tabla".

### Camino feliz — dieta

1. En **Comidas** → "Mi dieta", con la semana entera desplegada, pulsa
   **"Me lo he comido"** en una comida del **primer día**. El botón pasa al
   momento a **"✓ Guardado"**, relleno en color de apoyo. **Sin hacer scroll:**
   esa es toda la gracia de la spec.
2. Espera 3 segundos → vuelve a decir "Me lo he comido" y se puede pulsar otra
   vez.
3. Baja a **"Mis comidas"** → la comida está ahí con la fecha de hoy.

### Camino feliz — tabla

4. En **Ejercicio** → "Mi tabla", pulsa **"Lo he hecho"** en una sesión del
   primer día → el botón pasa a **"✓ Guardado"**, igual que arriba.
5. A los 3 segundos vuelve a "Lo he hecho".
6. Baja a **"Mis entrenamientos apuntados"** → el entrenamiento está ahí con la
   fecha de hoy.

### Casos límite

7. **Sin conexión.** Pon el móvil en modo avión (o en el ordenador, F12 →
   Network → Offline). Pulsa "Me lo he comido" → el botón dice
   **"✗ No se ha guardado"** en rojo, y debajo de los siete días aparece el
   mensaje de error de siempre. Quita el modo avión y vuelve a pulsar →
   "✓ Guardado". Comprueba en "Mis comidas" que **solo se ha apuntado una vez**.
8. **Pulsar dos veces.** Pulsa "Me lo he comido" y vuelve a pulsar en cuanto
   diga "✓ Guardado" → no pasa nada, está deshabilitado. En "Mis comidas" hay
   un solo registro.
9. **Editar con el aviso puesto.** Pulsa "Me lo he comido" y, sin esperar, pulsa
   "Editar" en esa misma comida → el aviso desaparece antes de los 3 segundos.
   **Es lo esperado** y está aceptado en la spec: repintar la semana se lleva el
   botón por delante. Cancela la edición; nada queda roto.
10. **Cambiar de sección.** Pulsa "Me lo he comido", vete a **Hoy** y vuelve a
    **Comidas** → el botón está normal, sin quedarse pillado en "✓ Guardado".

### Regresiones sobre las specs 028 y 029

11. En "Mi dieta", edita una celda y guárdala → se actualiza como siempre.
    Luego pulsa "Me lo he comido" en esa celda → lo que llega a "Mis comidas" es
    el texto **nuevo**.
12. En "Mi tabla", edita un día (minutos o intensidad) y guárdalo → se
    actualiza. Pulsa "Lo he hecho" → lo apuntado lleva los datos nuevos.
13. Pulsa **"Vaciar y empezar de nuevo"** en la dieta → la semana queda vacía
    con sus `+`. Vuelve a montarla o pídesela a la IA con **"Pedir"** → todo
    igual que antes de esta spec.
14. Lo mismo en la tabla: vaciar y pedirla a la IA.

### Que no se haya roto nada más

15. En **Peso**, guarda un pesaje → el aviso **"Guardado"** sale como siempre,
    en su párrafo debajo del formulario, **no** dentro del botón.
16. Lo mismo al guardar una receta nueva, una comida suelta y un ejercicio
    suelto: párrafo de siempre. La spec 034 solo cambia los dos botones de la
    semana.

Si todo pasa, la spec queda **completada**.
