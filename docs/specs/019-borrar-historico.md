# 019 — Borrar el histórico de operaciones

- **Estado:** revisada
- **Fecha:** 2026-08-15
- **Referencia en PRODUCTO.md:** apartado "Ampliación de la v2", punto "Operaciones con principio y fin" — se amplía para decir que el histórico también se puede borrar (ver apartado 8).

## 1. Objetivo

Que el histórico de operaciones archivadas sea una opción más del reinicio de datos. Hasta ahora era lo único que no se podía borrar desde la app, y había que entrar en la consola de Firebase.

## 2. Criterio de "esto funciona"

1. En **Ajustes → Reiniciar datos** hay una casilla nueva: **histórico de operaciones**, con su recuento (`2 operaciones`).
2. Marcarla y confirmar borra las operaciones archivadas **y todo lo que tienen dentro**: pesajes, comidas, ejercicios, consejos, consultas, planes y fotos.
3. Las **fotos archivadas** también desaparecen de Cloudinary, no solo su ficha.
4. Después, el bloque **Histórico** dice que no has cerrado ninguna operación.
5. La **operación en curso no se toca**: sigues pudiendo apuntar y el botón de finalizar sigue ahí.
6. Marcar solo "histórico" no borra nada del día a día, y marcar solo "pesajes" no toca el histórico.
7. Con el histórico vacío, la casilla aparece con `0 operaciones` y marcarla no rompe nada.
8. La frase de confirmación nombra el histórico junto al resto: `Vas a borrar 8 pesajes y 2 operaciones.`

## 3. Alcance

### Entra

- Tipo nuevo **`operaciones`** en el reinicio de datos, con su casilla, su recuento y su parte en la frase de confirmación.
- Borrado de las operaciones **archivadas** y de sus siete subcolecciones.
- Borrado en Cloudinary de las fotos que estuvieran archivadas.

### NO entra (explícitamente fuera)

- **Borrar una operación suelta** del histórico: o todas o ninguna, como el resto de tipos.
- **Tocar la operación en curso**: para eso está "Finalizar operación bikini".
- **Deshacer** un borrado. Sigue sin haber papelera.
- **Cambiar la confirmación de tres pasos** de la spec 006: se reutiliza tal cual.

## 4. Comportamiento detallado

- Se añade a `TIPOS` (en `js/reinicio.js`) una entrada `operaciones`, etiqueta **"operaciones"**, la última de la lista.
- **Recuento**: cuántas operaciones **archivadas** hay. La activa no se cuenta porque no se va a borrar.
- **Borrado**, para cada operación archivada:
  1. Se borran los documentos de sus siete subcolecciones, por lotes.
  2. Las **fotos** se borran primero de Cloudinary, una a una, con la misma función firmada que ya usa el borrado normal. Su `publicId` sigue siendo `usuarios/{uid}/fotos/…`, que es lo único que la función de firma acepta, así que funciona sin tocar el backend.
  3. Por último se borra el documento de la operación.
- Si algo falla a media, lo ya borrado se queda borrado y se propaga el error, igual que en el resto del reinicio. Repetir la operación es inofensivo.

## 5. Modelo de datos

**Ninguno nuevo.** Se borran documentos existentes. `firestore.rules` **sin cambios**: las reglas de la spec 018 ya permiten al dueño escribir (y por tanto borrar) en esas rutas.

## 6. Casos límite

- **Sin operaciones archivadas**: recuento a 0, no aparece en la frase de confirmación y borrar no hace nada.
- **Operación a medio archivar**: sus registros aún viven en las colecciones del día a día. Se borra su documento de operación y lo que ya se hubiera movido; lo que quedaba sin mover se borra solo si además se marcan sus tipos. Es coherente: cada casilla borra lo suyo.
- **Foto archivada que ya no está en Cloudinary**: el borrado sigue adelante; el fallo de Cloudinary no debe impedir borrar la ficha.
- **Muchas operaciones con muchos registros**: se borra por lotes de 500, como el resto.
- **La operación activa**: no se cuenta ni se borra nunca por esta vía.

## 7. Archivos afectados

| Archivo | Cambio |
|---|---|
| `js/reinicio.js` | tipo `operaciones`, su recuento y su borrado en cascada |
| `docs/PRODUCTO.md` | el histórico también se puede borrar |
| `sembrar.html` | quitar el aviso de que el archivo solo se borra desde la consola de Firebase |

Las casillas se pintan solas a partir de `TIPOS`, así que `index.html` y `js/app.js` no cambian.

**Estimación: ~70 líneas.**

## 8. Decisiones tomadas

- **El histórico se puede borrar desde la app** → decisión del usuario el 2026-08-15, después de que la spec 018 lo dejara fuera. Rectifica lo que se le dijo entonces ("eso hay que hacerlo a mano en la consola de Firebase").
- **Todo el histórico o nada** → es como funcionan los demás tipos del reinicio; borrar una operación suelta es otra cosa y no se ha pedido.
- **La operación en curso no entra** → para cerrarla ya está "Finalizar operación bikini", y borrarla sin querer al marcar una casilla sería una trampa.
- **Las fotos archivadas se borran también de Cloudinary** → si no, quedarían archivos pagando cuota que ya no se pueden alcanzar desde ninguna pantalla.

## 9. Fuera de spec: ideas apuntadas

- Borrar una operación concreta del histórico, desde su tarjeta. → `docs/BACKLOG.md`

## ✅ Para probar a mano

Se prueba junto con el resto de specs de esta tanda.
