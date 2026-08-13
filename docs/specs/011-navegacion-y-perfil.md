# 011 — Navegación por dispositivo y foto de perfil

- **Estado:** revisada
- **Fecha:** 2026-08-13
- **Referencia en PRODUCTO.md:** apartado "Qué hará (ampliación de la v2, decidida el 13 de agosto de 2026)", puntos "Navegación por dispositivo" y "Perfil con foto".

## 1. Objetivo

Que la navegación se comporte como toca en cada dispositivo — abajo en el móvil, arriba junto al usuario en el ordenador — que el botón "Más" desaparezca y su sitio lo ocupe **Ajustes**, y que cada usuario tenga una foto de perfil junto a su nombre.

## 2. Criterio de "esto funciona"

1. En el **móvil**: barra abajo con cinco botones — **Hoy · Peso · Comidas · Ejercicio · Ajustes**. Ya no hay botón "Más" ni panel que suba desde abajo.
2. Tocar **Ajustes** abre la sección de ajustes directamente, en un toque.
3. En el **ordenador** (pantalla ancha): los botones están **arriba**, en la misma línea que el usuario, y **no hay nada abajo**. El contenido empieza justo debajo.
4. Estrechando la ventana del ordenador hasta tamaño móvil, la navegación se pasa sola abajo, sin recargar.
5. En la cabecera, junto al email, hay un **círculo de foto de perfil**. Sin foto subida, muestra la inicial del email sobre un fondo de color.
6. Tocar ese círculo abre el selector de archivos. Al elegir una imagen, se sube y el círculo pasa a mostrarla, sin recargar la página.
7. Recargar la página: la foto sigue ahí.
8. Entrar con el otro usuario: se ve **su** foto, no la del primero.
9. Subir una foto nueva encima: sustituye a la anterior.
10. Con una imagen enorme (varios MB), la subida funciona y el círculo no se deforma: la foto se recorta a cuadrado.
11. Si falla la subida, sale un mensaje claro y la foto anterior (o la inicial) se queda como estaba.
12. Las **fotos de progreso** (spec 005) siguen funcionando igual: la de perfil no aparece entre ellas ni se borra al reiniciar las fotos de progreso.
13. Al final de **Ajustes**, en un bloque titulado "Más secciones", hay tres botones: **Consulta**, **Consejos** y **Fotos**. Cada uno abre su sección. Sin ellos esas tres pantallas quedarían inalcanzables hasta la spec 012.

## 3. Alcance

### Entra

- **Barra inferior en móvil** con cinco botones: Hoy, Peso, Comidas, Ejercicio, **Ajustes**.
- **Desaparecen el botón "Más" y el panel** que introdujo la spec 009, con todo su código: apertura, cierre, trampa de foco y capa oscurecida.
- **Navegación arriba en escritorio**, en la misma fila que la cabecera del usuario, a partir de un ancho concreto. Abajo no queda nada.
- **Foto de perfil**: círculo en la cabecera, con la inicial del email como recambio si no hay foto.
- **Subida de la foto de perfil** a Cloudinary, firmada desde la función de Vercel igual que las fotos de progreso, en su propia ruta.
- La foto se guarda en el documento de ajustes del usuario, junto al peso objetivo y la altura.

### NO entra (explícitamente fuera)

- **Los accesos directos a Consulta, Consejos y Fotos desde "Hoy"**: son la spec 012. Hasta entonces, esas tres secciones **solo se alcanzan desde "Hoy"**, que ya tendrá sus accesos, o no se alcanzan. Ver "Decisiones tomadas": esta spec deja un acceso provisional.
- **Recortar la foto a mano** (elegir el encuadre): se recorta centrada, sin editor.
- **Borrar la foto de perfil**: se puede sustituir por otra, pero no dejar el círculo vacío otra vez.
- **Foto de perfil en otros sitios** que no sean la cabecera.
- **Cambiar el contenido de ninguna sección**: esta spec mueve navegación y añade el avatar, nada más.
- **Iconos en los botones de navegación**: siguen siendo solo texto.

## 4. Comportamiento detallado

### Navegación en móvil

Igual que la deja la spec 009, pero el quinto botón es **Ajustes** en vez de **Más**, y lleva directamente a la sección `ajustes`. Se borra todo lo del panel.

### Navegación en escritorio

- A partir de **48rem** de ancho, la barra deja de estar fija abajo y pasa a la cabecera: usuario a la izquierda, botones a la derecha, en la misma fila.
- El `padding-bottom` que reservaba el hueco de la barra desaparece en ese tamaño: si no, quedaría un agujero al final de la página.
- El cambio es solo CSS. **El HTML y el JS son los mismos**: los mismos botones, el mismo `abrirPestana()`. Nada de duplicar la barra ni de escuchar el tamaño de la ventana desde JS.
- Cómo, sin reordenar el HTML: hoy `header` va al principio de `#pantalla-principal` y `#nav-inferior` al final, después de todas las secciones. En pantalla ancha, `#pantalla-principal` pasa a ser un contenedor `flex` en columna y la barra sube a la cabecera con `order`, dejando de estar fija. En móvil no se toca nada y sigue con `position: fixed`.
- Si la fila no cabe, la cabecera se parte en dos líneas (usuario arriba, botones debajo) antes que provocar scroll horizontal.

### Acceso provisional a Consulta, Consejos y Fotos

Al quitar el panel "Más", esas tres secciones se quedan sin puerta hasta que la spec 012 les ponga accesos directos en "Hoy". Mientras tanto:

- Al final de la sección **Ajustes**, justo **antes de la zona de peligro** (reiniciar datos), un bloque con el título `Más secciones` y tres botones a ancho completo, en este orden: **Consulta**, **Consejos**, **Fotos**.
- Cada botón llama a `abrirPestana()` con su sección. No hacen nada más.
- Son botones secundarios, con el estilo normal: no compiten con "Guardar" ni con los rojos de borrar.
- El bloque lleva un comentario en el HTML diciendo que es provisional y que lo retira la spec 012, para que no se quede ahí para siempre.

### Foto de perfil

- En la cabecera, un botón redondo de 2,5 rem con la foto recortada en cuadrado (`object-fit: cover`).
- **Sin foto**: la inicial del email en mayúscula, sobre `--superficie-alta`, con el borde en `--acento`.
- Al pulsarlo se abre un `<input type="file" accept="image/*">` oculto, igual que hace la subida de fotos de progreso.
- Mientras sube: el botón se deshabilita y sale `Subiendo…` junto a la cabecera.
- Al terminar: se guarda la URL en el documento de ajustes y el círculo se repinta con la foto nueva.
- Si falla: `No se ha podido subir la foto. Comprueba tu conexión.` y todo se queda como estaba.
- La imagen se pide a Cloudinary ya recortada y pequeña, con las mismas transformaciones que ya usan las miniaturas de las fotos de progreso, para no gastar cuota de más.

### Subida firmada

- `api/cloudinary.js` gana una tercera acción, **`perfil`**, junto a `subir` y `borrar`.
- Firma una subida con `public_id = usuarios/{uid}/perfil` y `overwrite = true`: una sola foto de perfil por usuario, que se sobrescribe.
- La ruta es **distinta de la de las fotos de progreso** (`usuarios/{uid}/fotos/...`), así que el reinicio de datos de la spec 006, que borra esa carpeta foto a foto, no la toca.
- La acción `borrar` sigue exigiendo que el `publicId` empiece por `usuarios/{uid}/fotos/`, así que **no puede usarse para borrar la foto de perfil de nadie**, ni la propia.

## 5. Modelo de datos

| Colección | Campo | Tipo | Cambio |
|---|---|---|---|
| `usuarios/{uid}` | `fotoPerfil` | string (URL de Cloudinary) o ausente | **nuevo**. Se escribe al subir una foto de perfil |

`validarAjustes()` no lo toca: la foto se guarda por su lado, no desde el formulario de ajustes, para que guardar el peso objetivo no pueda borrar la foto ni al revés.

`firestore.rules`: **sin cambios**. `usuarios/{uid}` ya permite lectura y escritura al dueño.

## 6. Casos límite

- **Usuario sin foto**: inicial del email. Si el email viniera vacío, un `?`.
- **Foto muy grande o muy pesada**: se sube tal cual y Cloudinary la sirve recortada. Se acepta el gasto de subida; son dos usuarios y una foto cada uno.
- **Archivo que no es una imagen**: lo filtra el `accept` del campo. Si aun así se cuela, falla la subida y sale el mensaje de error.
- **Elegir el mismo archivo dos veces seguidas**: hay que limpiar el valor del `<input file>` después de cada intento, o el navegador no dispara el evento la segunda vez (ya pasa con las fotos de progreso y está resuelto igual).
- **Reiniciar datos** (spec 006) marcando "fotos": borra las de progreso; **la de perfil se queda**, porque vive en otra ruta y no está en la colección `fotos`.
- **Reiniciar datos** no borra el documento `usuarios/{uid}`, así que `fotoPerfil` sobrevive. Es lo coherente: la cuenta no se borra.
- **Sin conexión al cargar**: si no se pueden leer los ajustes, se enseña la inicial. No es un error que merezca un mensaje propio.
- **La subida va bien pero falla el guardado de la URL**: queda una imagen en Cloudinary que la app no enseña. Se acepta, igual que ya se acepta en las fotos de progreso: el usuario ve el mensaje de error de siempre y, al volver a subir, se sobrescribe la misma ruta (`usuarios/{uid}/perfil`), así que no se acumulan huérfanas.
- **Pantalla entre 48rem y algo más**: la cabecera se parte en dos líneas antes que salirse.
- **Sin sesión**: ni la cabecera ni la navegación se ven.

## 7. Archivos afectados

| Archivo | Cambio |
|---|---|
| `index.html` | quinto botón pasa a Ajustes, fuera el panel "Más", círculo de perfil y `<input file>` en la cabecera |
| `styles.css` | navegación arriba a partir de 48rem, estilos del círculo de perfil, fuera los estilos del panel |
| `js/app.js` | fuera abrir/cerrar panel y su trampa de foco; pintar el círculo; subir la foto |
| `js/perfil.js` | **nuevo**. Pide la firma, sube el archivo a Cloudinary y devuelve la URL. **No escribe en Firestore** |
| `js/ajustes.js` | `guardarFotoPerfil(uid, url)` y `fotoPerfil` en lo que devuelve `leerAjustes()`. Todo lo que escribe en `usuarios/{uid}` sigue viviendo aquí |
| `api/cloudinary.js` | acción `perfil`, que firma la subida a `usuarios/{uid}/perfil` |
| `index.html` | también los tres botones provisionales al final de Ajustes |

**Estimación: ~320 líneas**, contando los botones provisionales. **Se pasa del límite de 300** de `CLAUDE.md`. No se parte porque las tres piezas son inseparables: quitar el panel deja secciones huérfanas, así que los botones provisionales tienen que ir en el mismo cambio, y la cabecera se toca una sola vez para la navegación y el avatar.

## 8. Decisiones tomadas

- **"Más" desaparece y su hueco lo ocupa Ajustes** → decisión del usuario el 2026-08-13: dos toques para algo que se usa a diario sobraba, y el resto se alcanzará desde "Hoy".
- **Acceso provisional a Consulta, Consejos y Fotos**: como sus accesos directos son la spec 012, esta spec deja **tres botones al final de Ajustes** (apartado 4). Sin eso, entre esta spec y la siguiente quedarían inalcanzables. Se quitan en la 012.
- **`js/perfil.js` sube, `js/ajustes.js` escribe** → todo lo que toca el documento `usuarios/{uid}` sigue en un solo archivo, como hasta ahora. `perfil.js` solo habla con Cloudinary.
- **La navegación cambia de sitio solo con CSS** → una sola barra en el HTML y una sola función que la maneja; duplicarla sería duplicar los fallos.
- **La foto de perfil entra en esta spec**, no en una aparte → decisión del usuario el 2026-08-13.
- **Una sola foto de perfil por usuario, que se sobrescribe** → no hace falta historial ni borrado; sustituirla es todo lo que se necesita.
- **Ruta separada de las fotos de progreso** → si compartieran carpeta, reiniciar las fotos de progreso se llevaría por delante el avatar.
- **La URL de la foto se guarda en `usuarios/{uid}`** → es un dato del usuario, como la altura; no merece colección propia.

## 9. Fuera de spec: ideas apuntadas

- Elegir el encuadre de la foto de perfil al subirla. → `docs/BACKLOG.md`
- Quitar la foto de perfil y volver a la inicial. → `docs/BACKLOG.md`

## ✅ Para probar a mano

Guion de prueba manual (lo rellena/afina el agente `qa-manual` antes de la prueba).
