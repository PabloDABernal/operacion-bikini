# 005 — Fotos de progreso y collage de evolución

- **Estado:** completada (probada a mano por el usuario desde el móvil el 2026-08-11)
- **Fecha:** 2026-08-11
- **Referencia en PRODUCTO.md:** líneas 17 y 34 (una foto de progreso por día con seguimiento visual, concepto "Foto de progreso").
- **Depende de:** specs 001 a 004, completadas. Reutiliza la validación de token del proxy (spec 003).
- **Cierra la v1.**

## 1. Objetivo

Que cada usuario suba una foto de progreso al día desde el móvil y vea todas las suyas en una cuadrícula ordenada por fecha, para apreciar el cambio que la báscula no siempre enseña.

## 2. Criterio de "esto funciona"

Probado **desde el móvil** en https://operacion-bikini.vercel.app, que es donde se van a hacer las fotos:

1. Entro y veo una sexta pestaña: **Fotos**. Las seis caben sin que la pantalla se desplace en horizontal.
2. Pulso `Subir foto de hoy` → se abre la cámara o la galería del móvil.
3. Elijo una foto → veo `Subiendo…`, y en menos de 30 segundos aparece en la cuadrícula, arriba del todo, con su fecha.
4. La foto se ve **derecha**, no girada 90 grados, aunque la haya hecho con el móvil en vertical.
5. Recargo (F5) → la foto sigue ahí.
6. Intento subir otra foto hoy → me avisa de que ya hay una de hoy y me pregunta si la sustituyo. Acepto → la nueva ocupa su lugar; sigue habiendo **una sola foto de hoy**.
7. Toco una miniatura → se ve grande. La cierro y vuelvo a la cuadrícula.
8. Borro una foto, confirmando → desaparece y no vuelve tras recargar.
9. Entro con la otra cuenta → su cuadrícula está vacía; no veo ninguna foto de la primera cuenta.
10. **Prueba de seguridad**: llamo a la URL de la función sin sesión iniciada (con `curl`), tanto para pedir una firma de subida como para pedir una de borrado → responde error de autorización en los dos casos y no devuelve ninguna firma.
11. **Regresión**: las cinco pestañas anteriores siguen funcionando, incluidos Consejos y Consulta.

## 3. Alcance

### Entra

- Pestaña **Fotos** con botón de subida, cuadrícula de miniaturas por fecha y vista ampliada.
- Compresión y redimensionado en el navegador antes de subir.
- Corrección de la orientación de la foto según los datos del propio archivo.
- Subida **firmada**: la función de Vercel comprueba la sesión y firma cada subida concreta.
- Una foto por día: la nueva sustituye a la anterior, avisando antes, y la vieja se borra también de Cloudinary.
- Borrado de una foto, que la elimina de Firestore y de Cloudinary.
- Extracción de la validación de token a un módulo propio, para compartirla entre las funciones de IA y la de fotos.

### NO entra (explícitamente fuera)

- Comparador de dos fotos lado a lado y pase automático tipo vídeo: PRODUCTO.md línea 42 los sitúa en la v2.
- Que la IA mire las fotos.
- Recortar, filtrar, rotar a mano o editar la foto.
- Fotos con nota o etiqueta.
- Subir fotos con fecha anterior: siempre es la foto de hoy.
- Descargar o exportar el collage como una sola imagen.
- Enlaces con caducidad: se usan las URL normales de Cloudinary (ver apartado 6).

## 4. Comportamiento detallado

### 4.1 Pestaña Fotos

- Sexta pestaña, a la derecha de Consulta. Con seis, las pestañas ocupan dos filas en móvil; deben seguir sin provocar desplazamiento horizontal.
- Botón `Subir foto de hoy`, que abre el selector del sistema (cámara o galería).
- Debajo, la cuadrícula: miniaturas cuadradas, de la fecha más reciente a la más antigua, con la fecha `DD/MM/AAAA` bajo cada una.
- Estado vacío: `Aún no has subido ninguna foto.`
- Mientras sube: el botón se deshabilita y aparece `Subiendo…`.

### 4.2 Vista ampliada

Al tocar una miniatura, la foto se ve grande sobre un fondo oscuro, con su fecha, un botón `Borrar` y otro `Cerrar`. Se cierra también tocando fuera o con la tecla Escape.

### 4.3 Preparación de la foto antes de subir

En el navegador, antes de enviar nada:

- Se redimensiona para que el lado mayor no pase de **1280 píxeles**.
- Se convierte a JPEG con calidad 0,8.
- Se corrige la orientación a partir de los datos del archivo, para que no salga girada.

Una foto de móvil pasa así de varios megas a unos 200 KB. Con dos usuarios y una foto diaria, el plan gratuito de Cloudinary (25 GB) da para años.

### 4.4 Sustituir la foto del día

Si ya existe foto de hoy, al elegir una nueva aparece la confirmación `Ya tienes una foto de hoy. ¿La sustituyes?`. Si acepta: se sube la nueva, se actualiza el registro y **se borra la anterior de Cloudinary** para no acumular basura que consuma cuota.

### 4.5 Errores

| Situación | Mensaje |
|---|---|
| El archivo no es una imagen | `Elige una imagen.` |
| El archivo pesa más de 15 MB | `La imagen es demasiado grande.` |
| El navegador no puede leer el formato | `No se ha podido leer esa imagen. Prueba con otra.` |
| Fallo de red o de Cloudinary | `No se ha podido subir la foto. Inténtalo de nuevo.` |
| Sesión caducada al subir | Vuelve al login, como en el resto de la app. |
| Fallo al borrar | `No se ha podido borrar la foto. Inténtalo de nuevo.` |

Si la subida falla, no se guarda nada en Firestore: no quedan fotos rotas en la cuadrícula.

## 5. Modelo de datos

```
usuarios/{uid}/fotos/{AAAA-MM-DD}
  fecha: string       // "AAAA-MM-DD", igual que el identificador del documento
  url: string         // URL de la imagen en Cloudinary
  publicId: string    // identificador en Cloudinary, necesario para borrarla
  creadoEn: timestamp
```

- La fecha se calcula como texto `AAAA-MM-DD` **en hora local**, con la misma función `hoyISO()` de `js/fechas.js` que usan pesajes, comidas y ejercicio. Nada de conversiones a UTC: en España restarían un día a partir de medianoche, y "la foto de hoy" acabaría siendo la de ayer.
- **El identificador del documento es la fecha.** Así, "una foto por día" no necesita comprobaciones: guardar dos veces el mismo día sobrescribe por definición.
- Reglas de Firestore: misma protección que el resto (`uid` propio + email en la lista blanca).

## 6. Seguridad y privacidad

**Subida firmada.** Las claves de Cloudinary (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) viven solo como variables de entorno en Vercel, nunca en el navegador ni en el repositorio, que es público.

El flujo es: el navegador pide una firma a `api/cloudinary.js` → la función comprueba el ID token de Firebase y la lista blanca igual que las funciones de IA → devuelve una firma válida **solo para esa subida** → el navegador sube el archivo a Cloudinary con esa firma. Sin sesión válida no hay firma, y sin firma Cloudinary rechaza la subida.

La misma función se encarga del borrado, que también va firmado.

**Cada foto vive en la carpeta del usuario que la subió**: el identificador en Cloudinary es `usuarios/{uid}/fotos/{fecha}`. Antes de firmar un borrado, la función comprueba que el identificador recibido empieza por la carpeta del `uid` que llama. Sin esa comprobación, un usuario autorizado podría pedir la firma para borrar la foto del otro.

**Privacidad de las URL.** Las fotos se guardan con la URL normal de Cloudinary: larga y con un identificador aleatorio, imposible de adivinar, y no aparece en buscadores porque no está enlazada en ninguna página pública. Pero **quien tenga la URL exacta puede ver la foto sin iniciar sesión**. Es una decisión consciente del usuario (2026-08-11): la alternativa, enlaces firmados con caducidad, obliga a pedir una firma nueva cada vez que se muestra la cuadrícula.

Las URL se guardan en Firestore, protegido por las reglas, así que la única forma de tenerlas es haber iniciado sesión como el dueño.

## 7. Casos límite

- **Fotos HEIC de iPhone**: si el navegador no sabe decodificar el formato, sale `No se ha podido leer esa imagen. Prueba con otra.` en vez de subir un archivo roto. Safari en iPhone sí las lee.
- **Foto girada**: el móvil guarda la orientación como dato aparte, y al redibujarla se pierde si no se corrige. Se corrige (apartado 4.3); es el fallo más visible si se olvida.
- **Cambiar de pestaña mientras sube**: la subida termina igual y la foto aparece al volver.
- **Sustituir dos veces el mismo día**: siempre queda una sola foto, la última.
- **Subir sin conexión**: mensaje de error, no se guarda nada.
- **Foto muy alargada o panorámica**: la miniatura la recorta al cuadrado; la vista ampliada la enseña entera.
- **Borrado a medias**: si se borra en Cloudinary pero falla el borrado en Firestore, quedaría una miniatura rota. Para evitarlo, primero se borra el documento de Firestore y después el archivo de Cloudinary; si lo segundo falla, queda un archivo huérfano ocupando cuota, pero nada roto en pantalla.

## 8. Archivos afectados

- `api/_auth.js` — nuevo: se le mueve `peticionAutorizada` desde `api/_ia.js`, para que la use también la función de fotos.
- `api/_ia.js` — modificar: pasa a usar `api/_auth.js` y **sigue exportando `peticionAutorizada`**, re-exportándola. Así **`api/consejo.js` y `api/consulta.js` no se tocan**: sus `require("./_ia")` siguen funcionando igual. Es deliberado: son las dos funciones ya probadas en producción y la spec 004 ya avisó de que tocarlas es el mayor riesgo de regresión del proyecto.
- `vercel.json` — sin cambios: `api/cloudinary.js` solo firma, responde en milisegundos y no necesita ampliar el tiempo máximo. El archivo pesado va del navegador a Cloudinary directamente, sin pasar por Vercel.
- `api/cloudinary.js` — nuevo: firma de subida y borrado, con validación de sesión.
- `js/fotos.js` — nuevo: preparación de la imagen, subida, listado y borrado.
- `index.html` — modificar: sexta pestaña y vista ampliada.
- `styles.css` — modificar: cuadrícula, miniaturas y vista ampliada.
- `js/app.js` — modificar: enganchar la pestaña.
- `firestore.rules` — modificar: subcolección `fotos`.
- `docs/ARQUITECTURA.md` — modificar: dejar escrito que las subidas a Cloudinary van firmadas desde Vercel y qué variables de entorno hacen falta.

## 9. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| Subida firmada desde Vercel | Sin firma habría que dejar un permiso de subida en el código, y el repositorio es público: cualquiera podría llenar la cuenta gratuita de 25 GB. La validación de sesión ya existe desde la spec 003. |
| Una foto al día, sustituyendo la anterior | Es lo que dice PRODUCTO.md línea 17, y hace que la cuadrícula sea una línea temporal limpia. Sustituir en vez de prohibir evita quedarse con una foto mala todo el día. |
| El identificador del documento es la fecha | "Una por día" deja de ser una regla que comprobar y pasa a ser imposible de incumplir. |
| Cuadrícula de miniaturas, no comparador ni pase automático | Es lo que aporta valor desde la segunda foto; lo demás es v2 según PRODUCTO.md línea 42. |
| URL normales de Cloudinary | Decisión del usuario: imposible de adivinar es suficiente para un enlace que solo está en su base de datos. |
| Comprimir a 1280 px y JPEG 0,8 en el navegador | La cuota gratuita se gasta en almacenamiento y transferencia; subir fotos de 4 MB sin motivo es tirar cuota, y en móvil también tiempo de subida. |
| Borrar primero en Firestore y después en Cloudinary | Un archivo huérfano gasta un poco de cuota; una miniatura rota se ve y molesta cada día. |

## 10. Fuera de spec: ideas apuntadas

- Comparador de dos fechas lado a lado (v2, PRODUCTO.md línea 42).
- Exportar la evolución como una sola imagen para compartir.

## ✅ Para probar a mano

Ver apartado 2. Esta spec **se prueba desde el móvil**, no desde el ordenador: es donde se hacen las fotos y donde aparecen los problemas de orientación y de tamaño. Es además la primera vez que se prueba la app entera en móvil, cosa que quedó pendiente en la spec 002.
