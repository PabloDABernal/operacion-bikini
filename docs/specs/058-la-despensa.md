# 058 — La despensa: lo que tienes en casa

- **Estado:** implementada y desplegada el 28 de agosto de 2026. **Pendiente de que el usuario la pruebe** en producción; hasta entonces NO es completada.
- **Fecha:** 2026-08-28
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v8: la despensa, decidida el 28 de agosto de 2026)", primera spec de las dos.

## 1. Objetivo

Que el usuario tenga en **Comidas** una lista de los ingredientes con los que
suele cocinar, y pueda marcar cuáles tiene ahora mismo en casa y cuáles se le
han acabado, con un toque.

Esta spec **solo construye la despensa**. Que la dieta la aproveche es la 059.

## 2. Criterio de "esto funciona"

1. En **Comidas** hay una cuarta sub-pestaña, **"Despensa"**, junto a Apuntar,
   Mi dieta y Recetas.
2. La primera vez está vacía y lo dice: explica para qué sirve en una frase, en
   vez de enseñar una lista vacía sin más.
3. Hay un campo para escribir un ingrediente y un botón para añadirlo. Al
   añadirlo aparece en la lista, **marcado como "lo tengo"**: si te molestas en
   escribirlo es porque lo acabas de comprar.
4. Cada ingrediente de la lista tiene una casilla. Marcada = lo tengo.
   Desmarcada = se me ha acabado, pero sigo cocinando con ello.
5. Tocar la casilla lo guarda al instante, sin botón de guardar.
6. Recargar la página: la lista y las marcas siguen como las dejaste.
7. Un ingrediente se puede **borrar** de la lista (para lo que ya no cocinas
   nunca), y se puede **editar** el nombre (para arreglar una falta).
8. Al **entrar** en la sub-pestaña, la lista sale ordenada con **lo que tienes
   primero** y lo que no, después; dentro de cada grupo, alfabético. Marcar y
   desmarcar no recoloca nada en ese momento: el orden se recalcula la próxima
   vez que entras. Marcar cinco cosas seguidas no debe mover las filas bajo el
   dedo.
9. Arriba se ve el recuento: "12 de 20 ingredientes en casa".
10. Añadir un ingrediente que ya está en la lista **no lo duplica**: avisa de que
    ya lo tienes apuntado y, si estaba desmarcado, lo marca.

## 3. Alcance

### Entra

- Sub-pestaña "Despensa" en Comidas.
- Alta, edición del nombre, borrado y marcado/desmarcado de ingredientes.
- Persistencia en Firestore y sus reglas.
- Casilla propia en **Ajustes → Zona de peligro → Reiniciar datos**.

### NO entra (explícitamente fuera)

- **Cantidades, unidades y caducidades.** Decisión del usuario, ver apartado 8.
- **Que la dieta use la despensa.** Es la spec 059.
- **Marcar ingredientes en las recetas.** Es la spec 059.
- **Lista de la compra.** Sigue siendo una idea de `docs/PRODUCTO.md`.
- **Categorías de ingredientes** (verduras, carnes, especias). Con una lista de
  veinte o treinta líneas ordenada por "lo tengo" se lee bien; categorizar es
  trabajo de mantenimiento para el usuario sin beneficio claro todavía.
- **Sugerencias automáticas de ingredientes** a partir de tus recetas. Se apunta
  en `docs/BACKLOG.md`.

## 4. Comportamiento detallado

### La sub-pestaña

Cuarta y última en `data-de="comidas"`, después de Recetas. Se abre con el mismo
mecanismo que las otras tres (spec 035), sin tocar nada de esa lógica.

### Estado vacío

Sin ingredientes: *"Aquí van los ingredientes con los que sueles cocinar.
Márcalos según los tengas en casa y la dieta podrá aprovecharlos."* Nada más, y
el campo de añadir visible debajo.

### Añadir

- Un `<input type="text">` y un botón **"Añadir"**.
- Vacío o solo espacios → error `Escribe un ingrediente.`, no se guarda.
- Máximo **60 caracteres** → error `Máximo 60 caracteres.`. Un ingrediente es
  "mix de verduras congelado", no una frase.
- Duplicado (comparando **normalizado**, ver abajo) → no se crea otro. El mensaje
  dice que ese ingrediente ya está en tu despensa y, si estaba desmarcado, **se
  marca**: volver a escribirlo es la forma natural de decir "he vuelto a
  comprarlo".
- **Ese mensaje NO es un error.** No se pinta en el hueco de error del formulario
  ni en rojo: se pinta como aviso neutro, del mismo tono que el "Guardado" del
  resto de la app. Volver a escribir "tomate" no es equivocarse — es re-marcarlo,
  que es justo lo que la spec quiere que pase. Regañar al usuario por acertar es
  el fallo que hay que evitar aquí.
- Tras añadir, el campo se vacía y **mantiene el foco**: lo normal al estrenar
  esto es meter quince seguidos.

### Normalización para comparar (solo para comparar, no para guardar)

Se guarda **tal y como lo escribes**. Para decidir si dos textos son el mismo
ingrediente se comparan en minúsculas, sin tildes y sin espacios de sobra.
`Tomate`, `tomate` y `  TOMATE ` son el mismo.

Esta función es la semilla del cruce de la spec 059 y por eso vive en su propio
módulo desde ya, no dentro del código de pantalla.

### Marcar y desmarcar

Casilla por fila. Al tocarla, la casilla cambia **al instante** y se escribe en
Firestore. Si la escritura falla, la casilla **vuelve a su estado anterior** y
sale el error: nunca se queda enseñando algo que no se guardó.

**La lista NO se recoloca en cada toque.** El orden ("lo que tienes primero") se
recalcula al entrar en la sub-pestaña, no mientras marcas. Si se recolocara al
tocar, la fila que acabas de marcar saltaría bajo el dedo y la siguiente que
querías marcar ocuparía su sitio: marcar cinco cosas seguidas se volvería una
trampa. Así, marcar es marcar, y el orden se ve ordenado la próxima vez que
abres.

### Editar y borrar

- **Editar**: como en el recetario (spec 026), la fila pasa a modo edición con el
  nombre en un campo. Las mismas validaciones que al añadir, **incluida la de
  duplicado** contra el resto de la lista.
- **Editar hasta chocar con otro ingrediente NO fusiona las dos filas: rechaza el
  cambio** y lo dice ("«tomate» ya está en tu despensa"). Fusionar significaría
  hacer desaparecer una fila que el usuario no ha pedido borrar, y aquí no hay
  deshacer. Al añadir sí se fusiona, porque ahí no desaparece nada: solo se marca
  lo que ya existía.
- Editar una fila dejando el mismo nombre (o solo cambiando mayúsculas o tildes)
  **no** cuenta como duplicado de sí misma: se guarda con normalidad.
- **Borrar**: pide confirmación, porque no hay deshacer.

### Recuento

Encima de la lista: "12 de 20 ingredientes en casa". Con la lista vacía no se
enseña.

## 5. Modelo de datos

Colección nueva `usuarios/{uid}/despensa/{ingredienteId}`.

| Campo | Tipo | Qué es |
|---|---|---|
| `nombre` | string | Tal y como lo escribió el usuario. 1-60 caracteres. |
| `tengo` | boolean | `true` = está en casa ahora. Al crear, siempre `true`. |
| `creadoEn` | timestamp | `serverTimestamp()`. Desempata orden entre iguales. |
| `actualizadoEn` | timestamp | Se toca al marcar, desmarcar o editar. |

**Vive fuera de las operaciones**, igual que `recetas` y `dietas`: tu despensa no
es el diario de una etapa, y no tiene ningún sentido archivarla al cerrar una
operación bikini y empezar la siguiente sin tomates.

`firestore.rules`: bloque nuevo calcado al de `recetas`, con su comentario
diciendo por qué está fuera de las operaciones.

`js/reinicio.js`: la despensa necesita **casilla propia**, y por el mismo motivo
que la tienen las recetas — al no archivarse con la operación, esa casilla es la
única forma de borrarla. La etiqueta será **"despensa"**, sola: no se junta con
"recetas y dietas" porque son cosas distintas, y juntarlas repetiría el error
que `js/reinicio.js` avisa en su propio comentario sobre `ejercicios` y
`ejerciciosCatalogo`.

## 6. Casos límite

- **Sin conexión al marcar**: la casilla revierte y sale el error. No se encola
  nada, igual que en el resto de la app.
- **Dos pestañas abiertas**: la lista se lee al abrir la sub-pestaña. Si otra
  pestaña añadió algo, no se ve hasta reabrirla. Aceptado: es el mismo
  comportamiento que las recetas y el catálogo de ejercicios.
- **Lista larga** (cincuenta ingredientes): no se pagina. Es una lista de texto,
  y el orden "lo que tienes primero" ya es el filtro que importa.
- **Nombre con solo signos** (`---`): se guarda. No merece un validador propio;
  lo borra el usuario.
- **Todo desmarcado**: el recuento dice "0 de 20 ingredientes en casa" y la lista
  se enseña entera. No es un estado vacío: la lista sigue existiendo.

## 7. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/despensa.js` | **Nuevo.** Modelo: validar, normalizar, listar, guardar, actualizar, marcar, borrar. |
| `index.html` | Sub-pestaña, sección, formulario de alta y contenedor de lista. |
| `js/app.js` | Pintado de la lista, altas, marcado, edición, borrado y recuento. |
| `styles.css` | Filas con casilla; se reaprovecha lo que ya existe de listas y chips. |
| `firestore.rules` | Bloque de `despensa`. **Publicar con la CLI antes de probar.** |
| `js/reinicio.js` | Casilla "despensa". |

**Salió en 521 líneas**, de las cuales ~408 son JavaScript (281 en `js/app.js` y
127 en `js/despensa.js`); el resto es HTML, CSS y la regla de Firestore. Por
encima de lo estimado. No se troceó porque para cuando se vio el tamaño la
feature ya estaba entera y es una sola cosa —partirla ahí habría dejado media
despensa en producción—, pero la estimación de abajo se quedó corta y conviene
saberlo al estimar la 059.

Estimación original: **250-300 líneas**. La referencia es el recetario (spec 026): solo
su pintado y sus manejadores en `js/app.js` ocupan ~170 líneas, más ~95 del
modelo en `js/recetas.js`. La despensa tiene un formulario más simple (un solo
campo) pero más lógica viva: casilla con escritura instantánea y reversión,
fusión de duplicados al añadir y recuento.

**Si al implementar se pasa de 300, parar y avisar** (regla 4 de `CLAUDE.md`), no
forzarla.

## 8. Decisiones tomadas

- **Lista marcable, sin cantidades ni caducidades** (usuario, 28 de agosto). Un
  inventario que hay que actualizar después de cada comida acaba mintiendo, y
  una despensa que miente es peor que no tenerla. Marcar y desmarcar es todo el
  mantenimiento que se le pide.
- **Un ingrediente nuevo nace marcado** (usuario, misma conversación): lo
  escribes cuando lo compras.
- **Vive en Comidas, no en Ajustes** (usuario): es material de cocina, va donde
  están las recetas y la dieta.
- **La despensa no se archiva con la operación**: coherente con `recetas` y
  `dietas`, que ya lo resolvieron así en las specs 026 y 028.
- **El duplicado avisa, no regaña**, y **editar hasta chocar rechaza en vez de
  fusionar** (Claude, tras la revisión de la spec del 28 de agosto). Lo primero
  porque re-escribir un ingrediente es la forma natural de re-marcarlo; lo
  segundo porque fusionar haría desaparecer una fila que nadie pidió borrar.
- **La lista no se reordena mientras marcas** (misma revisión): saltaría la fila
  bajo el dedo justo cuando estás marcando varias seguidas.

## 9. Fuera de spec: ideas apuntadas

- Sugerir ingredientes para la despensa a partir de los que más se repiten en tus
  recetas guardadas.
- Categorías de ingredientes, si la lista se hace larga de verdad.

## ✅ Para probar a mano

(Lo afina el agente `qa-manual` antes de la prueba.)
