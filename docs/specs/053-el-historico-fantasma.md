# 053 — El histórico fantasma y el archivo mudo

- **Estado:** 🧪 implementada y desplegada el 2026-08-24; pendiente de que el usuario la pruebe.
- **Fecha:** 2026-08-24
- **Referencia en PRODUCTO.md:** no añade nada. Arregla dos fallos de lo ya
  descrito: el histórico de operaciones (spec 018) y su borrado desde la Zona de
  peligro (spec 019).

## 1. Objetivo

El usuario borró sus datos desde Ajustes → Zona de peligro, con la casilla
**Operaciones** marcada. La operación archivada se borró de verdad, pero el
histórico siguió enseñando su tarjeta, y al pulsar "Ver" se abría una pantalla
con el título y nada más. Parecían dos bugs distintos; es uno y su consecuencia.

Al terminar esta spec, borrar el histórico lo hace desaparecer de la pantalla en
el acto, y una operación sin registros que enseñar lo dice en vez de quedarse
muda.

## 2. Criterio de "esto funciona"

1. Con una operación archivada en el histórico, ir a **Ajustes → Zona de
   peligro**, marcar **Operaciones**, borrar con las tres confirmaciones.
2. Al terminar, el mensaje sigue siendo **"Datos borrados."** y el recuento de
   Operaciones pasa a **(0)**.
3. Ir a la pestaña de la operación: el **histórico está vacío** y pone "Aún no
   has cerrado ninguna operación." **Sin recargar la página.**
4. Si además se borró todo lo demás, el resto de pantallas queda vacío como
   hasta ahora: nada cambia ahí.
5. Con una operación archivada que **sí** tenga registros, "Ver" sigue
   enseñando la gráfica y las listas exactamente igual que hasta ahora.
6. Con una operación archivada **sin ningún registro** (se cerró el mismo día
   sin apuntar nada), "Ver" enseña el título y el texto **"Esta operación no
   tiene ningún registro archivado."**, en lugar de una pantalla en blanco.

## 3. Alcance

### Entra
- Recargar la lista de operaciones después de un borrado desde la Zona de
  peligro, para que el histórico deje de enseñar lo que ya no existe.
- Estado vacío en la pantalla del archivo de una operación.

### NO entra (explícitamente fuera)
- Cambiar qué borra la Zona de peligro, o cómo. El borrado funciona bien: lo
  que falla es lo que se enseña después.
- Cambiar qué se pinta en el archivo cuando **sí** hay registros.
- Impedir borrar el histórico, o avisar de otra manera. Los tres pasos de
  confirmación que ya hay bastan.
- La operación **activa**: la Zona de peligro nunca la borra (`operacionesArchivadas()`
  filtra por `estado === "archivada"`), y eso se queda como está.

## 4. Comportamiento detallado

### 4.1 El histórico fantasma

`pintarHistorico()` dibuja desde `operacionesCargadas`, la copia en memoria que
solo rellena `refrescarOperaciones()`. El manejador de "Borrar definitivamente"
(`js/app.js`) llama hoy a `refrescarRecuentos()` y `refrescarTodo()`, pero
**no** a `refrescarOperaciones()`, que es la única que recarga esa copia. Por
eso el recuento decía 0 —lee Firestore— y el histórico seguía enseñando la
tarjeta —lee memoria—.

Arreglo: tras un borrado con éxito, llamar también a `refrescarOperaciones()`.

Va **antes** de `refrescarTodo()`: `refrescarOperaciones()` fija `hayOperacion`
y llama a `pintarPuerta()`, y varias pantallas que refresca `refrescarTodo()`
dependen de ese estado.

Se llama **siempre** que el borrado va bien, sin mirar si la selección incluía
`operaciones`: cuesta una lectura y evita que el día de mañana otra casilla que
toque operaciones repita el mismo fallo.

En la rama de error del `catch` **no** se llama: allí se recuentan los datos a
propósito para enseñar qué llegó a borrarse, pero la pantalla se deja como está
para poder reintentar de un clic.

### 4.2 El archivo mudo

`abrirArchivo()` monta la pantalla bloque a bloque y cada bloque se salta a sí
mismo si su lista viene vacía (`if (!registros.length) return;`). Con todo
vacío no pinta nada, y `#archivo-estado` se ha puesto a `""` al terminar de
cargar: título, "Volver" y un hueco.

Arreglo: al terminar de montar la pantalla, si no se pintó **ningún** bloque —ni
gráfica, ni pesajes, ni comidas, ni ejercicios, ni fotos, ni consejos, ni la
nota de consultas—, escribir en `#archivo-estado`:

> Esta operación no tiene ningún registro archivado.

La comprobación es sobre el resultado, no sobre las colecciones: basta con mirar
si `#archivo-contenido` y `#archivo-grafica` se quedaron sin hijos. Así no hay
que mantener una lista paralela de "qué cuenta como contenido" cada vez que se
añada o se quite un bloque.

El mensaje va en `#archivo-estado` porque es donde ya se escribe "Cargando…" y
los errores de carga: un sitio, no tres.

## 5. Modelo de datos

Sin cambios. Ninguna colección, ningún campo, ninguna regla de Firestore.

## 6. Casos límite

- **Borrado que falla a media.** Se queda en el `catch` de siempre: mensaje de
  error, recuentos actualizados y casillas listas para reintentar. El histórico
  no se refresca ahí, así que puede enseñar una operación a medio borrar hasta
  el siguiente intento; es el comportamiento que ya había y no se toca.
- **Borrar sin marcar Operaciones.** `refrescarOperaciones()` se llama igual y
  no cambia nada: la lista vuelve idéntica.
- **Sin conexión al refrescar.** `refrescarOperaciones()` ya traga el error y
  deja `operacionesCargadas` vacío, lo que vacía el histórico. Aceptable: es lo
  mismo que hace hoy al arrancar sin conexión.
- **Operación a medio archivar.** Su tarjeta no tiene botón "Ver" (enseña
  "Archivado sin terminar"), así que nunca llega al estado vacío del 4.2.
- **Operación con solo fotos, o solo consultas.** Hay contenido: no se enseña el
  mensaje.

## 7. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/app.js` | El manejador de `#btn-borrar-definitivo`: añadir `refrescarOperaciones()`. `abrirArchivo()`: el estado vacío. |
| `docs/ESTADO.md` | Al terminar. |

No se toca `js/reinicio.js` ni `js/operaciones.js`: el borrado y el archivado
funcionan. El fallo está solo en lo que se pinta después.

## 8. Decisiones tomadas

- **Refrescar siempre, no solo si se borraron operaciones** → una lectura de
  Firestore es barata y la alternativa es una condición que hay que acordarse de
  actualizar cada vez que cambie la lista de casillas.
- **El mensaje del archivo, por contenido pintado y no por colecciones vacías**
  → los bloques del archivo han cambiado ya dos veces (spec 048 quitó "planes"),
  y una lista paralela se habría quedado desfasada.
- **No se toca el archivo cuando sí hay datos** → el usuario no se quejó de eso;
  la "birria" que vio era la operación borrada.

## 9. Fuera de spec: ideas apuntadas

Ninguna.

## ✅ Para probar a mano

Se afina con el agente `qa-manual` antes de la prueba.
