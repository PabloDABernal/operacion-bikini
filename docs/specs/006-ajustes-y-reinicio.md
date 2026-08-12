# 006 — Ajustes de usuario y reinicio de datos

- **Estado:** revisada
- **Fecha:** 2026-08-11
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v2)", puntos 1 y 2.
- **Depende de:** specs 001 a 005, completadas. Primera spec de la v2.

## 1. Objetivo

Que cada usuario tenga una pantalla de **Ajustes** donde guardar su objetivo (peso, altura y fecha), cerrar sesión, y **borrar sus propios datos** eligiendo qué tipos, para poder empezar de cero después de las pruebas.

## 2. Criterio de "esto funciona"

Probado en https://operacion-bikini.vercel.app:

1. Entro y veo una séptima pestaña: **Ajustes**. Las siete caben sin desplazamiento horizontal, ni en móvil.
2. El botón de cerrar sesión ya **no está en la cabecera**: está en Ajustes. La cabecera solo muestra mi email.
3. Relleno peso objetivo `78,5`, altura `176` y fecha objetivo `2027-06-21` → `Guardar` → sale `Ajustes guardados.`
4. **F5** → los tres campos siguen rellenos con lo que puse.
5. Entro con la otra cuenta → sus ajustes están vacíos; no veo los míos.
6. En **Reiniciar datos**, marco solo `Comidas` → pulso `Borrar lo seleccionado` → aparece un aviso en rojo que dice **cuántos registros** se van a borrar y que no se puede deshacer.
7. Escribo `BORRAR` en el campo → se habilita el botón final → lo pulso → sale una última confirmación del navegador → acepto.
8. Voy a la pestaña Comidas: **vacía**. Voy a Peso: mis pesajes **siguen ahí**. Solo se borró lo que marqué.
9. Marco todo, incluidas `Fotos`, y repito → todas las pestañas quedan vacías. En Cloudinary tampoco quedan mis fotos.
10. Mis **ajustes** (peso objetivo, altura, fecha) siguen guardados: reiniciar datos no borra la configuración.
11. Sigo con la sesión iniciada y puedo apuntar un pesaje nuevo, como el primer día.
12. **Regresión**: las seis pestañas anteriores siguen funcionando, incluidas Consejos, Consulta y Fotos.
13. Tras borrar los consejos, el cupo diario vuelve a cero y puedo pedir uno nuevo. Es la consecuencia esperada de que el cupo se cuente sobre lo guardado.

## 3. Alcance

### Entra

- Pestaña **Ajustes** con: peso objetivo, altura, fecha objetivo, botón de guardar y botón de cerrar sesión.
- Traslado del botón de cerrar sesión desde la cabecera a Ajustes.
- Bloque **Reiniciar datos** con casillas por tipo de dato y confirmación en tres pasos.
- Borrado real en Firestore y, para las fotos, también en Cloudinary.
- Regla de Firestore para el documento del propio usuario, que hasta ahora no existía.

### NO entra (explícitamente fuera)

- Que la IA use el objetivo, la altura o la fecha: entra cuando se rehagan los prompts en una spec posterior.
- Cálculo y visualización del IMC.
- Línea de objetivo en una gráfica: no hay gráfica todavía (spec posterior).
- Borrar la cuenta de usuario.
- Deshacer un borrado o papelera.
- Exportar los datos antes de borrarlos.
- Rediseño visual: la dirección "nocturna deportiva" es otra spec.
- Cambiar el email o la contraseña.

## 4. Comportamiento detallado

### 4.1 Pestaña Ajustes

Séptima pestaña, la última. Con siete, las pestañas ocupan dos o tres filas en móvil; deben seguir sin provocar desplazamiento horizontal. La navegación inferior que arreglará esto llega con el rediseño.

Tres bloques, en este orden: **Mi objetivo**, **Sesión**, **Reiniciar datos**.

### 4.2 Mi objetivo

| Campo | Tipo | Validación |
|---|---|---|
| Peso objetivo (kg) | Texto numérico, un decimal, acepta coma o punto | Entre 20 y 300. Vacío permitido |
| Altura (cm) | Entero | Entre 100 y 250. Vacío permitido |
| Fecha objetivo | Selector de fecha | Posterior a hoy. Hoy mismo no vale: un objetivo que vence hoy no es un objetivo. Vacío permitido |

Los tres campos son **opcionales**: se puede guardar solo uno. Botón `Guardar`.

Mensajes:

| Situación | Mensaje |
|---|---|
| Guardado correcto | `Ajustes guardados.` |
| Peso fuera de rango o no numérico | `El peso objetivo debe estar entre 20 y 300 kg.` |
| Altura fuera de rango o no entera | `La altura debe estar entre 100 y 250 cm.` |
| Fecha objetivo en el pasado | `La fecha objetivo tiene que ser futura.` |
| Sin conexión | `No se han podido guardar los ajustes. Comprueba tu conexión.` |

El mensaje de guardado correcto desaparece a los pocos segundos; los de error se quedan hasta el siguiente intento.

### 4.3 Sesión

Muestra el email con el que se ha entrado y un botón `Cerrar sesión`. Ese botón **se quita de la cabecera**, que pasa a mostrar solo el email.

### 4.4 Reiniciar datos

Bloque visualmente diferenciado (borde rojo) con el título `Reiniciar datos` y una advertencia: `Esto borra tus datos para siempre. No hay vuelta atrás.`

**Casillas**, todas desmarcadas al entrar, cada una con el número de registros que tiene ahora mismo:

- Pesajes (N)
- Comidas (N)
- Ejercicios (N)
- Consejos (N)
- Consultas y planes (N)
- Fotos (N)

Consultas y planes van juntos a propósito: un plan sin su consulta es un documento huérfano. Su recuento **N es la suma de los dos**, y así se dice en el aviso: `3 consultas y planes`.

**Paso 1 — Aviso.** Con al menos una casilla marcada, el botón `Borrar lo seleccionado` está activo. Al pulsarlo aparece un aviso rojo con el recuento exacto de lo que se va a borrar, por ejemplo: `Vas a borrar para siempre: 14 comidas y 3 fotos.`

Si todo lo marcado está ya vacío, el aviso dice `No hay nada que borrar de lo que has marcado.`

La frase enumera los tipos **en el mismo orden en que aparecen las casillas**, separados por comas y con «y» antes del último: `Vas a borrar para siempre: 8 pesajes, 14 comidas y 3 fotos.` Los tipos sin registros no se nombran.

**Paso 2 — Escribir la palabra.** Bajo el aviso, un campo de texto con la etiqueta `Escribe BORRAR para confirmar`. El botón final está deshabilitado hasta que el texto sea exactamente `BORRAR`, en mayúsculas.

**Paso 3 — Confirmación final.** Al pulsar el botón final aparece la confirmación del navegador: `¿Seguro? Esta acción no se puede deshacer.` Solo si acepta, se borra.

Mientras borra: `Borrando…`, con los botones deshabilitados. Al terminar: `Datos borrados.`, las casillas se desmarcan, los recuentos se actualizan y todas las listas de la app se refrescan.

Si el usuario cambia las casillas después del paso 1, el proceso vuelve al principio: se oculta el aviso y se vacía el campo de texto. No se puede marcar una cosa, confirmar, y que se borre otra.

### 4.5 Qué borra cada casilla

| Casilla | Borra |
|---|---|
| Pesajes | `usuarios/{uid}/pesajes` |
| Comidas | `usuarios/{uid}/comidas` |
| Ejercicios | `usuarios/{uid}/ejercicios` |
| Consejos | `usuarios/{uid}/consejos` |
| Consultas y planes | `usuarios/{uid}/consultas` y `usuarios/{uid}/planes` |
| Fotos | `usuarios/{uid}/fotos` y los archivos correspondientes en Cloudinary |

**Nunca** se borra el documento de ajustes del usuario: el objetivo, la altura y la fecha sobreviven a cualquier reinicio. Reiniciar datos es empezar de cero con el mismo objetivo, no olvidar quién eres.

Errores durante el borrado:

| Situación | Mensaje |
|---|---|
| Falla el borrado en Firestore | `No se han podido borrar todos los datos. Vuelve a intentarlo.` |
| Falla el borrado de una foto en Cloudinary | Se continúa igual: la foto ya no se ve en la app. Queda un archivo suelto en Cloudinary, se anota en la consola del navegador |

Si el borrado falla a medias, lo ya borrado no vuelve. Se avisa y se invita a reintentar: repetir el borrado sobre lo que queda es inofensivo.

**Tras un fallo, las casillas se quedan marcadas y el campo `BORRAR` conserva lo escrito**, para reintentar con un clic. Los recuentos sí se actualizan, así que se ve qué llegó a borrarse. Solo tras un borrado correcto se limpia todo el formulario.

## 5. Modelo de datos

```
usuarios/{uid}
  pesoObjetivoKg: number | null
  alturaCm: number | null
  fechaObjetivo: string | null   // "AAAA-MM-DD"
  actualizadoEn: timestamp
```

Hasta ahora el documento `usuarios/{uid}` no existía: solo se usaban sus subcolecciones. Ahora sí, y las reglas de Firestore necesitan una entrada nueva para él, porque las actuales solo dan acceso a las subcolecciones. Mismo patrón que el resto:

```
match /usuarios/{uid} {
  allow read, write: if autorizado() && request.auth.uid == uid;
}
```

**Hay que publicarlas** con `npx firebase-tools deploy --only firestore:rules` antes de probar. Sin eso, guardar ajustes falla con un error de permisos que parece un bug del código.

La fecha objetivo se guarda como texto `AAAA-MM-DD` local, igual que el resto de fechas de la app.

## 6. Borrado en bloque

- Se leen los identificadores de cada colección marcada y se borran en lotes (`writeBatch`), que es más rápido y barato que documento a documento. Un lote admite 500 operaciones como máximo, así que se parte en trozos si hiciera falta; con dos usuarios personales no se llegará, pero el código no debe romperse si se llega.
- Las fotos se borran primero de Firestore y luego de Cloudinary, reutilizando la firma de `api/cloudinary.js` de la spec 005. Si Cloudinary falla, queda un archivo huérfano, pero nada roto en pantalla.

## 7. Casos límite

- **Ninguna casilla marcada**: el botón `Borrar lo seleccionado` está deshabilitado.
- **Escribir `borrar` en minúsculas o con espacios**: no vale. Tiene que ser exactamente `BORRAR`.
- **Cancelar la confirmación final del navegador**: no se borra nada y el formulario se queda como estaba, listo para reintentar.
- **Recargar a mitad del borrado**: lo borrado se queda borrado; lo demás sigue. Repetir la operación termina el trabajo.
- **Borrar una colección vacía**: no falla; simplemente no hay nada que borrar.
- **Cambiar de pestaña mientras borra**: termina igual.
- **Ajustes vacíos**: es válido. Un usuario puede no fijar objetivo y usar la app igual.
- **Sesión caducada al guardar o borrar**: vuelve al login, como en el resto de la app.
- **Borrar «Consultas y planes» con una consulta en curso en pantalla**: al terminar el borrado se refrescan todas las pestañas, así que la conversación desaparece y la pestaña Consulta vuelve a ofrecer `Empezar consulta`. No queda ningún hilo apuntando a un documento que ya no existe.
- **Los cupos diarios se reinician al borrar**: los límites de 5 consejos y 2 consultas al día se cuentan sobre los documentos guardados, así que borrarlos devuelve el cupo. Se acepta a conciencia: esos topes existen para frenar un despiste, no para impedir nada, y la cuota de verdad la pone Google. Conviene saberlo para no confundirlo con un fallo.

## 8. Archivos afectados

- `js/ajustes.js` — nuevo: leer y guardar el documento del usuario.
- `js/reinicio.js` — nuevo: recuento y borrado en bloque.
- `index.html` — modificar: séptima pestaña, y quitar el botón de cerrar sesión de la cabecera.
- `styles.css` — modificar: bloque de peligro y formulario de ajustes.
- `js/app.js` — modificar: enganchar la pestaña y mover el manejador de cerrar sesión.
- `js/fotos.js` — modificar: exportar el borrado de una foto para reutilizarlo desde el reinicio.
- `firestore.rules` — modificar: acceso al documento `usuarios/{uid}`.

## 9. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| Borrado selectivo por tipo, no todo o nada | Decisión del usuario: quiere poder tirar los datos de prueba de una parte sin perder el resto. |
| Confirmación en tres pasos | Decisión del usuario. Es una acción irreversible y sin papelera: la fricción aquí es una virtud, no un estorbo. |
| El recuento se enseña antes de borrar | «Vas a borrar 14 comidas» frena mucho mejor que un aviso genérico, y delata si has marcado la casilla equivocada. |
| Los ajustes sobreviven al reinicio | Reiniciar es empezar de cero con el mismo objetivo. Si borrase también el objetivo, habría que volver a escribirlo cada vez. |
| Consultas y planes se borran juntos | Un plan sin la consulta que lo generó es un huérfano sin contexto. |
| No se borra la cuenta | Habría que volver a crearla a mano en la consola de Firebase para poder entrar. |
| Cerrar sesión se muda a Ajustes | Decisión del usuario. La cabecera gana sitio, y es donde se busca en cualquier app. |
| Altura y fecha objetivo se guardan ya, aunque nadie las use todavía | Cuestan un campo cada una y evitan tener que volver aquí cuando la IA y la gráfica las necesiten. |

## 10. Fuera de spec: ideas apuntadas

- Exportar los datos (a CSV o JSON) antes de borrarlos.
- Mostrar el IMC a partir de la altura.

## ✅ Para probar a mano

Ver apartado 2. La prueba importante es la 8: que borrar **una** cosa no se lleve por delante las demás. Hazla con datos que no te importe perder antes de usar el reinicio en serio.
