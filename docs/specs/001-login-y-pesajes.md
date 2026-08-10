# 001 — Login y registro de pesajes

- **Estado:** completada (probada a mano por el usuario el 2026-08-10)
- **Fecha:** 2026-08-10
- **Referencia en PRODUCTO.md:** líneas 9, 13, 14 y 31 (acceso cerrado por usuario, login email/Google, registro de pesajes, concepto "Pesaje").

## 1. Objetivo

Que cada usuario pueda entrar en la app con su cuenta (email/contraseña o Google), apuntar su peso con una fecha, ver su lista de pesajes y borrar los que sean erróneos. Los pesajes de un usuario no son visibles para el otro.

## 2. Criterio de "esto funciona"

Probado en la app desplegada (GitHub Pages), no solo en local:

1. Abro la URL sin sesión iniciada → veo la pantalla de login, no veo ningún dato.
2. Entro con email/contraseña (cuenta ya creada a mano en la consola de Firebase) → paso a la pantalla principal y veo mi email y un botón "Cerrar sesión".
3. Apunto un peso (ej. `82,4`) con la fecha de hoy → aparece inmediatamente en la lista, arriba del todo.
4. Recargo la página (F5) → sigo con sesión iniciada y el pesaje sigue ahí.
5. Añado otro pesaje con fecha anterior → aparece por debajo del de hoy (lista ordenada de más reciente a más antigua).
6. Borro un pesaje, confirmo → desaparece de la lista y no vuelve tras recargar.
7. Cierro sesión → vuelvo a la pantalla de login.
8. Entro con la segunda cuenta (la de mi mujer) → su lista está vacía, no veo ningún pesaje de la primera cuenta.
9. Entro con "Entrar con Google" usando un email que SÍ está en la lista blanca → entro normal.
10. Entro con "Entrar con Google" usando una cuenta de Google que NO está en la lista blanca → se me cierra la sesión automáticamente y veo el mensaje "Acceso no autorizado". No se crea ningún dato mío en la base de datos.

## 3. Alcance

### Entra

- Pantalla de login con dos métodos: email/contraseña y botón "Entrar con Google".
- Lista blanca de emails autorizados, aplicada en dos sitios: en el cliente (mensaje + cierre de sesión) y en las reglas de seguridad de Firestore (barrera real).
- Sesión persistente entre recargas.
- Botón "Cerrar sesión".
- Formulario de alta de pesaje: peso (kg) + fecha.
- Lista de pesajes del usuario, ordenada de fecha más reciente a más antigua.
- Borrado de un pesaje con confirmación.
- Separación de datos por `uid` en Firestore.

### NO entra (explícitamente fuera)

- Pantalla de registro. Las cuentas de email/contraseña se crean a mano en la consola de Firebase.
- Recuperación de contraseña / "he olvidado mi contraseña".
- Editar un pesaje ya guardado (para corregir: borrar y volver a apuntar).
- Gráfica de evolución del peso (es v2 según PRODUCTO.md línea 42).
- Comidas, ejercicio, fotos, "Consejos" y "Pasar consulta" (specs posteriores).
- Notas o comentarios en el pesaje.
- Diseño visual pulido: prioridad a que funcione (PRODUCTO.md línea 41).
- Modo offline / funcionamiento sin conexión.

## 4. Comportamiento detallado

### 4.1 Pantalla de login

Se muestra cuando no hay sesión iniciada. Contiene:

- Campo email, campo contraseña, botón "Entrar".
- Separador y botón "Entrar con Google".
- Zona de mensaje de error (vacía por defecto).

Mensajes de error (texto exacto):

| Situación | Mensaje |
|---|---|
| Email o contraseña incorrectos | `Email o contraseña incorrectos.` |
| Campo email o contraseña vacío | `Rellena email y contraseña.` |
| Email no está en la lista blanca | `Acceso no autorizado.` |
| Fallo de red / Firebase caído | `No se ha podido conectar. Inténtalo de nuevo.` |
| Ventana de Google cerrada por el usuario | (sin mensaje, vuelve al login) |
| Google con un email ya registrado por contraseña (`auth/account-exists-with-different-credential`) | `Esta cuenta usa email y contraseña. Entra por ahí.` |

### 4.2 Lista blanca

- Constante en el código del frontend con los emails autorizados (2 entradas, ampliable editando el archivo y volviendo a desplegar).
- Tras un login correcto por cualquiera de los dos métodos, se compara `user.email` (en minúsculas) con la lista.
- Si no está: `signOut()` inmediato y mensaje `Acceso no autorizado.` en la pantalla de login.
- Las reglas de seguridad de Firestore repiten la misma lista de emails y son la barrera real: aunque alguien salte el chequeo del cliente, no puede leer ni escribir nada.
- **Las reglas comparan `request.auth.token.email.lower()` contra la lista escrita en minúsculas**, igual que el cliente. Si no coincidieran los criterios (cliente en minúsculas, reglas sensibles a mayúsculas), un usuario válido pasaría el login pero Firestore le denegaría todo en silencio: pantalla principal vacía y sin mensaje de error.
- **Nota operativa:** cada usuario nuevo obliga a editar la lista en LOS DOS sitios (constante JS y `firestore.rules`) y a redesplegar ambos (frontend en GitHub Pages, reglas en Firebase). Si solo se toca uno, el usuario entra pero no ve ni guarda nada.

### 4.2b Pantalla de carga

Al abrir la app, Firebase tarda un instante en decidir si hay sesión guardada. Durante ese rato se muestra una tercera pantalla con el texto `Cargando…`, para no enseñar el login a alguien que ya tiene sesión (parpadeo) ni al revés.

### 4.3 Pantalla principal

Visible solo con sesión iniciada y email autorizado. Contiene:

- Cabecera: email del usuario + botón "Cerrar sesión".
- Formulario de pesaje:
  - Campo **Peso (kg)**: numérico, admite un decimal. Obligatorio.
  - Campo **Fecha**: selector de fecha, precargado con la fecha de hoy. Obligatorio.
  - Botón "Guardar pesaje".
- Lista de pesajes: cada fila muestra fecha (formato `DD/MM/AAAA`), peso con la unidad (`82,4 kg`) y un botón "Borrar".
- Estado vacío: si no hay pesajes, texto `Aún no has apuntado ningún pesaje.`

### 4.4 Validaciones del pesaje

| Situación | Mensaje |
|---|---|
| Peso vacío o no numérico | `Introduce un peso válido.` |
| Peso con más de un decimal (`82,44`) | Se redondea a un decimal (`82,4`) al guardar, sin mensaje de error. |
| Peso fuera del rango 20–300 kg | `El peso debe estar entre 20 y 300 kg.` |
| Fecha vacía | `Introduce una fecha.` |
| Fecha futura | `La fecha no puede ser futura.` |

Al guardar correctamente: el formulario se limpia (peso vacío, fecha vuelve a hoy) y la lista se actualiza.

### 4.5 Borrado

Botón "Borrar" en cada fila → confirmación (`¿Borrar este pesaje?`) → si acepta, se elimina de Firestore y desaparece de la lista.

## 5. Modelo de datos

Firestore:

```
usuarios/{uid}/pesajes/{pesajeId}
  pesoKg: number        // ej. 82.4
  fecha: string         // "AAAA-MM-DD", fecha del pesaje elegida por el usuario
  creadoEn: timestamp   // serverTimestamp(), momento de guardado
```

- Ordenación de la lista: por `fecha` descendente; a igualdad de fecha, por `creadoEn` descendente.
- No hay documento en `usuarios/{uid}` en sí; solo la subcolección.

Reglas de seguridad (comportamiento requerido, redacción exacta en implementación):

- Acceso a `usuarios/{uid}/pesajes/**` permitido solo si `request.auth.uid == uid` **y** `request.auth.token.email.lower()` está en la lista blanca (escrita en minúsculas).
- Todo lo demás, denegado.

## 6. Casos límite

- **Dos pesajes el mismo día**: permitido, se muestran ambos. No se sustituye ni se avisa.
- **Sesión caducada o revocada**: la app vuelve a la pantalla de login sin error específico.
- **Sin conexión al guardar**: mensaje `No se ha podido guardar. Comprueba tu conexión.` y el pesaje no se añade a la lista.
- **Sin conexión al borrar**: mensaje `No se ha podido borrar. Comprueba tu conexión.` y el pesaje sigue en la lista.
- **Sin conexión al cargar la lista**: no se muestra el estado vacío (sería engañoso), sino el mensaje `No se han podido cargar tus pesajes. Comprueba tu conexión.` con un botón "Reintentar".
- **Usuario autorizado que se quita de la lista blanca**: en su siguiente carga de la app, `Acceso no autorizado.` y fuera. Sus datos siguen en Firestore, no se borran.
- **Email de Google con mayúsculas**: la comparación con la lista blanca se hace siempre en minúsculas.
- **Coma vs punto decimal**: el campo acepta `82,4` y `82.4` y guarda `82.4`.
- **Zona horaria**: la fecha se maneja como texto `AAAA-MM-DD` local, sin conversión UTC, para que no se desplace un día.

## 7. Archivos afectados

Todos nuevos (proyecto vacío):

- `index.html` — pantalla de login + pantalla principal.
- `styles.css` — estilos mínimos.
- `js/firebase-config.js` — configuración de Firebase e inicialización.
- `js/auth.js` — login email/Google, lista blanca, cierre de sesión, estado de sesión.
- `js/pesajes.js` — alta, listado y borrado de pesajes.
- `js/app.js` — arranque y conexión entre pantallas.
- `firestore.rules` — reglas de seguridad.

## 8. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| Una sola spec con login + pesajes | El criterio de éxito real es "entro y veo mi peso guardado"; separarlas dejaría una spec sin nada verificable a mano. |
| Los dos métodos de login desde el principio | PRODUCTO.md línea 13. |
| Sin pantalla de registro; cuentas de email creadas a mano | Ya existen las dos cuentas; mantiene el acceso cerrado (PRODUCTO.md línea 9). |
| Lista blanca de emails | Firebase Auth con Google crea la cuenta en el primer inicio de sesión, así que sin lista blanca cualquiera con el enlace entraría — contradiría PRODUCTO.md línea 9. Decisión del usuario tras plantearle el riesgo. |
| Lista blanca también en las reglas de Firestore | El chequeo en el navegador se puede saltar; la barrera real está en el servidor. |
| Añadir y borrar, sin editar | Menos código; corregir un error es borrar y reapuntar. |
| Peso + fecha, sin nota | PRODUCTO.md línea 31 define pesaje como peso + fecha; añadir nota sería ampliar producto. |
| Un solo método de login por cuenta, sin vincular credenciales | Menos código y menos casos raros; PRODUCTO.md línea 13 dice "a elección de cada uno", un método por persona. |
| Se acepta la spec completa (400-650 líneas) pese a exceder las ~300 de la regla 4 | Decisión del usuario: prefiere specs enteras a specs partidas en 1-1 / 1-2, que se vuelven un lío de seguir. A cambio, las próximas specs se dimensionan bien de entrada en vez de partirse a posteriori. |

## 9. Fuera de spec: ideas apuntadas

- (ninguna por ahora)

## ✅ Para probar a mano

Ver apartado 2 ("Criterio de esto funciona"). El agente `qa-manual` afinará el guion con regresiones antes de la prueba.
