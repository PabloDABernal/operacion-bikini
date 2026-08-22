# 039 — Quitar la foto de perfil

- **Estado:** borrador
- **Fecha:** 2026-08-21
- **Referencia en PRODUCTO.md:** apartado "Perfil con foto" (v2, ampliación del 13 de agosto), ampliado hoy para incluir esta spec.

## 1. Objetivo

Quien haya subido una foto de perfil puede quitarla y volver a la inicial de
su email, sin tener que subir otra imagen encima para "deshacerse" de ella.

## 2. Criterio de "esto funciona"

1. En **Ajustes → Foto de perfil**, con una foto ya subida, aparece un botón
   **"Quitar foto"** junto al de "Subir foto de perfil".
2. Sin foto (usuario nuevo, o ya se quitó), el botón "Quitar foto" no se ve
   — no hay nada que quitar.
3. Tocar "Quitar foto" la quita al instante (sin confirmación: es una acción
   reversible, basta con subir otra foto para deshacerla). El avatar de la
   cabecera y el de Ajustes vuelven a mostrar la inicial del email.
4. Recargar la página, o volver a entrar en la app: la foto sigue quitada
   (no es solo un cambio visual, se guarda).
5. Tras quitarla, "Subir foto de perfil" sigue funcionando igual que
   siempre para poner una nueva.

## 3. Alcance

### Entra
- Botón "Quitar foto" en Ajustes, visible solo si hay foto.
- Al quitarla, el campo `fotoPerfil` del documento de usuario en Firestore
  vuelve a quedar sin valor.

### NO entra (explícitamente fuera)
- **Borrar el archivo de Cloudinary.** La foto de perfil vive en una ruta
  fija (`usuarios/{uid}/perfil`) pensada para sobrescribirse en la próxima
  subida, no para borrarse (`api/cloudinary.js` ya dice explícitamente que
  la acción "borrar" no puede tocar esa ruta, a propósito, para que
  reiniciar las fotos de progreso no se la lleve por delante). Añadir borrado
  real ahí tocaría código de autorización de borrados en el backend, que es
  más peso del que pide este arreglo. El archivo se queda huérfano en
  Cloudinary hasta que se sobrescriba con una foto nueva; no cuenta dos veces
  en la cuota porque nunca se acumulan copias (ya sobrescribe siempre la
  misma ruta).
- **Confirmación en tres pasos ni ningún otro aviso especial**: quitar la
  foto no es un borrado destructivo de datos (a diferencia del reinicio de
  datos, spec 006): la foto en Cloudinary sigue ahí y se puede volver a
  subir sin pérdida real.
- **Ningún cambio en cómo se sube una foto nueva.**

## 4. Comportamiento detallado

- Nuevo botón `#btn-quitar-foto` en `index.html`, junto a `#btn-cambiar-foto`
  dentro de `.bloque-foto-perfil`. Empieza oculto (`class="oculta"`) — así
  mientras `leerAjustes()` está cargando (antes de que `refrescarAjustes()`
  resuelva) no hay parpadeo: no se ve hasta que se sabe que hay foto.
- Al pintar Ajustes (donde ya se pinta el avatar con `pintarAvatar()`), el
  botón se enseña u oculta según si `ajustes.fotoPerfil` tiene valor.
- Al tocarlo: llama a `guardarFotoPerfil(uid, null)` — la misma función que
  ya usa la subida, sin ninguna nueva: guarda lo que se le pase con
  `setDoc(..., { merge: true })`, y `null` es justo el valor que
  `leerAjustes()` ya trata como "sin foto" para quien nunca subió ninguna. No
  hace falta `deleteField()` ni una función hermana. Después, `pintarAvatar(null,
  emailActual)` y se oculta el botón "Quitar foto".
- Mientras la operación está en curso, el botón se deshabilita (mismo patrón
  que `btn-cambiar-foto` con `estado-perfil`) — cubre también el caso de
  tocarlo dos veces seguidas rápido.

## 5. Modelo de datos

Ningún campo nuevo. `usuarios/{uid}.fotoPerfil` ya existe (spec 011) y ya
admite `null` — es lo que trae un usuario que nunca subió foto.

## 6. Casos límite

- **Tocar "Quitar foto" dos veces seguidas muy rápido**: el botón se
  deshabilita nada más tocarlo (igual que `btn-cambiar-foto`), así que la
  segunda pulsación no llega a disparar nada.
- **Quitar la foto y subir otra en el mismo momento** (dos pestañas, por
  ejemplo): gana la última escritura, como ya pasa hoy con cualquier campo
  de Ajustes — no hay bloqueo optimista en ningún otro campo de esta
  pantalla, así que no se añade aquí tampoco.
- **Sin conexión al tocar "Quitar foto"**: mismo mensaje de error que ya usa
  `btn-cambiar-foto` ("No se ha podido... Comprueba tu conexión"), el botón
  se reactiva y la foto sigue como estaba.
- **Quitar la foto no toca el nombre de pila** ni ningún otro campo de
  Ajustes: solo `fotoPerfil`.

## 7. Archivos afectados

| Archivo | Qué se hace |
|---|---|
| `index.html` | Botón `#btn-quitar-foto` junto a `#btn-cambiar-foto`. |
| `js/app.js` | Listener del nuevo botón (reutiliza `guardarFotoPerfil(uid, null)`, sin tocar `js/ajustes.js`); mostrar/ocultar según `ajustes.fotoPerfil` en el sitio donde ya se pinta el avatar de Ajustes y tras subir una foto nueva. |
| `docs/PRODUCTO.md` | Ya actualizado (ver cabecera de esta spec). |
| `docs/ESTADO.md` | Al terminar, cuando el usuario la valide. |

**Tamaño estimado:** muy por debajo de las ~300 líneas — un botón, una
función de tres líneas y su listener.

## 8. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| No borrar el archivo de Cloudinary, solo el campo en Firestore | El usuario delegó esta spec entera el 2026-08-21 ("te dejo decidir"); tocar la autorización de borrados del backend por un ahorro de almacenamiento mínimo (una imagen, sobrescribible) no compensaba el riesgo añadido |
| Sin confirmación al quitarla | Acción reversible (basta con subir otra foto); no es un borrado de datos como el reinicio (spec 006), que sí la lleva |
| Spec completa decidida por Claude, no entrevistada | El usuario dijo explícitamente "te dejo decidir" al pedir limpiar el backlog el 2026-08-21 |

## 9. Fuera de spec: ideas apuntadas

- Borrado real del archivo en Cloudinary al quitar la foto, si algún día
  importa el espacio o la privacidad de que quede huérfano.

## ✅ Para probar a mano

*(Lo afina el agente `qa-manual` antes de la prueba, con el detalle exacto de
la implementación.)*
