# 074 — El armario: el material que tienes

- **Estado:** revisada (`revisor-specs`, 30 de agosto de 2026)
- **Fecha:** 2026-08-30
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v13: el material, decidida el 30 de agosto de 2026)", primer punto.

## 1. Objetivo

Que puedas apuntar con qué material cuentas —banco, mancuernas, esterilla— y
marcarlo según lo tengas, igual que la despensa hace con los ingredientes.

## 2. Por qué existe

Hoy la app sabe qué material pide cada ejercicio (spec 029: el campo `material`
del catálogo) y sabe qué material dijiste tener el día del alta (spec 016: el
perfil, en prosa). Lo que no sabe es **cruzar las dos cosas**, porque ninguna de
las dos es una lista: son frases.

Esta spec pone la primera mitad: la lista de lo tuyo. La 075 hará el cruce y la
076 lo que te falta. **La v13 nace partida en tres**, decidido antes de empezar,
no a mitad de camino.

## 3. Criterio de "esto funciona"

1. En **Ejercicio** hay una cuarta sub-pestaña, **Material**, después de Catálogo.
2. Vacía, explica para qué sirve y enseña el campo de añadir. No enseña ni
   recuento ni lista.
3. Escribes `mancuernas` y **Añadir**: aparece en la lista, marcada, y el campo
   se queda vacío y **con el foco** para escribir la siguiente.
4. Metes cuatro o cinco seguidas sin tocar el ratón.
5. Desmarcas una: la casilla cambia al instante y **la fila no se mueve de sitio**.
6. El recuento de arriba dice "4 de 5 cosas en el armario".
7. Vuelves a escribir `Mancuernas` (con mayúscula) y **Añadir**: no se crea otra
   fila, sale un aviso **neutro, no un error**, y si estaba desmarcada **se marca**.
8. Editas una fila y le cambias el nombre: se guarda. Si la dejas con el nombre
   de otra que ya existe, **rechaza el cambio y lo dice** — no fusiona.
9. Borras una: pide confirmación y desaparece.
10. Sales de la sub-pestaña, vuelves, y la lista sale ordenada con lo que tienes
    primero.
11. En **Ajustes → Zona de peligro** hay una casilla **"material"** propia, y
    marcarla sola borra el armario sin tocar nada más.

## 3 bis. Tamaño: se acepta pasar de 300 líneas

CLAUDE.md pide avisar si una spec parece necesitar más de ~300 líneas de
cambios. **Esta las va a pasar, y se acepta antes de empezar**: la 058, de la
que esto es espejo, salió en 521 frente a las 250-300 que había estimado, y la
074 tiene la misma superficie (formulario, marcar con reversión, fusión de
duplicados al añadir, editar que rechaza fusionar, recuento, orden recalculado,
colección, reglas y casilla de reinicio).

Decisión del usuario el 30 de agosto, tras el aviso de `revisor-specs`. Se
implementa **entera y en una sola spec**: trocear un patrón ya resuelto costaría
más que repetirlo. Lo que sí sigue en pie es parar y avisar **si se pasa de las
600**, que ya no sería el mismo patrón sino otra cosa.

## 4. Alcance

### Entra

- Sub-pestaña **Material** en Ejercicio.
- Añadir, marcar, desmarcar, editar y borrar piezas de material.
- Recuento y orden "lo que tienes primero", recalculado al entrar.
- Colección nueva en Firestore, sus reglas y su casilla en el reinicio.
- La función de normalizar nombres, en su propio módulo desde ya, porque es la
  semilla del cruce de la 075 — igual que pasó en la 058.

### NO entra (explícitamente fuera)

- **El cruce con los ejercicios.** Es la spec 075: la casilla "aprovechar el
  material que tengo" al pedir tabla, y las marcas al abrir un ejercicio.
- **Partir en piezas el campo `material` del catálogo.** Va con el cruce, en la
  075: partirlo aquí no lo usaría nadie.
- **La lista de lo que te falta.** Es la spec 076.
- **Buscador**, al estilo de la spec 069. La despensa lo necesitó porque las
  recetas la llenan solas (spec 068) y crece sin que la escribas. Un armario lo
  escribes tú entero y tiene diez cosas.
- **Que se llene solo** desde el catálogo de ejercicios, al estilo de la 068.
  Los ingredientes de una receta los tienes o los compras; el material que pide
  un ejercicio que no puedes hacer no es tuyo por haberlo leído.
- **Cantidades ni pesos.** "Mancuernas", no "dos de 8 kg". Lo mismo que decidió
  la 058, y por lo mismo: un inventario que hay que actualizar acaba mintiendo.
- **Tocar el perfil de la spec 016.** El perfil sigue diciendo en prosa de qué
  material dispones y la IA lo sigue leyendo. Son dos cosas distintas y esta
  spec no unifica ninguna.

## 5. Comportamiento detallado

### La sub-pestaña

Cuarta y última en `data-seccion="ejercicio"`, después de Catálogo. Se abre con
el mismo mecanismo que las otras tres (spec 035), sin tocar esa lógica.

### Estado vacío

Sin material: *"Aquí va el material con el que entrenas. Márcalo según lo tengas
y tus tablas podrán aprovecharlo."* Nada más, y el campo de añadir debajo.

### Añadir

- Un `<input type="text">` y un botón **"Añadir"**.
- Vacío o solo espacios → error `Escribe un material.`, no se guarda.
- Máximo **60 caracteres** → error `Máximo 60 caracteres.`
- Duplicado (comparando **normalizado**) → no se crea otra fila. El mensaje dice
  que ese material ya está en tu armario y, si estaba desmarcado, **se marca**.
- **Ese mensaje NO es un error**: se pinta como aviso neutro, del tono del
  "Guardado" del resto de la app. Volver a escribir "banco" no es equivocarse.
- Tras añadir, el campo se vacía y **mantiene el foco**.

### Normalización para comparar (solo para comparar, no para guardar)

Se guarda **tal y como lo escribes**. Para decidir si dos textos son la misma
pieza se comparan en minúsculas, sin tildes y sin espacios de sobra. `Banco`,
`banco` y `  BANCO ` son el mismo.

**Se reutiliza la de la despensa**, no se escribe otra: `js/despensa.js` ya
exporta esa función y la 072 le añadió el emparejado por singular y plural, que
aquí hace la misma falta (`mancuerna` / `mancuernas`). Duplicarla significaría
que dentro de un mes hay dos y solo una está arreglada.

### Marcar y desmarcar

Casilla por fila. Al tocarla, cambia **al instante** y se escribe en Firestore.
Si la escritura falla, la casilla **vuelve a su estado anterior** y sale el
error.

**La lista NO se recoloca en cada toque.** El orden se recalcula al entrar en la
sub-pestaña, por el mismo motivo que en la 058: si se recolocara al tocar, la
fila que acabas de marcar saltaría bajo el dedo.

### Editar y borrar

- **Editar**: la fila pasa a modo edición con el nombre en un campo. Mismas
  validaciones que al añadir, **incluida la de duplicado** contra el resto.
- **Editar hasta chocar con otra pieza NO fusiona: rechaza el cambio** y lo dice
  ("«banco» ya está en tu armario"). Al añadir sí se fusiona, porque ahí no
  desaparece ninguna fila.
- Dejar el mismo nombre, o cambiar solo mayúsculas o tildes, **no** cuenta como
  duplicado de sí misma.
- **Borrar**: pide confirmación, porque no hay deshacer.

### Recuento

Encima de la lista: "4 de 5 cosas en el armario". Con la lista vacía no se
enseña.

## 6. Modelo de datos

Colección nueva `usuarios/{uid}/material/{materialId}`.

| Campo | Tipo | Qué es |
|---|---|---|
| `nombre` | string | Tal y como lo escribió el usuario. 1-60 caracteres. |
| `tengo` | boolean | `true` = lo tienes ahora. Al crear, siempre `true`. |
| `creadoEn` | timestamp | `serverTimestamp()`. Desempata orden entre iguales. |
| `actualizadoEn` | timestamp | Se toca al marcar, desmarcar o editar. |

**Vive fuera de las operaciones**, igual que `despensa`, `recetas` y `dietas`:
el material que tienes en casa no es el diario de una etapa, y cerrar una
operación bikini no te quita el banco.

`firestore.rules`: bloque nuevo calcado al de `despensa`, con su comentario
diciendo por qué está fuera de las operaciones.

`js/reinicio.js`: **casilla propia**, etiqueta **"material"**. Por el mismo
motivo que la tienen `despensa` y `compra`: al no archivarse con la operación,
esa casilla es la única forma de borrarlo. No se junta con `ejerciciosCatalogo`,
que es otra cosa —los ejercicios que sabes hacer, no las cosas que tienes—, y
juntarlas obligaría a borrar las dos para borrar una.

## 7. Casos límite

- **Sin conexión al marcar**: la casilla revierte y sale el error. No se encola
  nada, igual que en el resto de la app.
- **Dos pestañas abiertas**: la lista se lee al abrir la sub-pestaña. Lo que
  añada otra pestaña no se ve hasta reabrirla. Aceptado, como en la 058.
- **Lista larga**: no se pagina y no hay buscador. Si el armario crece hasta
  molestar, eso es una señal de que hacía falta el buscador — se anota, no se
  adelanta.
- **Nombre con solo signos** (`---`): se guarda. Lo borra el usuario.
- **Todo desmarcado**: el recuento dice "0 de 5 cosas en el armario" y la lista
  se enseña entera. No es un estado vacío.
- **Sin operación en marcha**: la sub-pestaña se comporta como las demás de
  Ejercicio, detrás del aviso "Primero inicia tu operación bikini desde Hoy".
  El material vive fuera de las operaciones, pero la sección entera está detrás
  de ese aviso desde la spec 018 y esta spec no cambia esa regla.

## 8. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/material.js` | **Nuevo.** Modelo: validar, listar, guardar, actualizar, marcar, borrar. Calcado a `js/despensa.js`. |
| `js/despensa.js` | **Sin cambios.** `normalizar()` y `mismoIngrediente()` (spec 072) ya están exportados y son genéricos: `material.js` los importa tal cual. Verificado por `revisor-specs` el 30 de agosto. |
| `index.html` | Sub-pestaña **Material** en Ejercicio: botón, `div.subseccion`, formulario, recuento y lista. |
| `js/app.js` | Pintar la lista, enganchar añadir/marcar/editar/borrar y cargarla al abrir la sub-pestaña. |
| `js/reinicio.js` | Casilla **"material"** con su colección. |
| `firestore.rules` | Bloque para `usuarios/{uid}/material/{materialId}`. **Publicar con la CLI antes de pedir la prueba.** |
| `css/estilos.css` | Nada nuevo si las clases de la despensa valen. Si hace falta, lo mínimo. |

Como `js/despensa.js` no se toca, **la regresión sobre Comidas → Despensa deja de
ser un riesgo real**; el guion la mantiene igualmente porque `material.js`
importa de ahí.

## 9. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| El armario vive en **Ejercicio → Material**, no en Ajustes → Perfil | Es de usar a diario, como la despensa. En Ajustes se vería una vez. |
| **Tres specs desde el inicio** (074 armario, 075 cruce, 076 lo que falta) | La 073 fue barata porque el cruce ya existía; aquí no hay nada hecho. Y las specs no se parten a posteriori. |
| **Sin buscador** | La despensa lo necesitó porque se llena sola. Un armario lo escribes tú y tiene diez cosas. |
| **No se llena solo** desde el catálogo | El material de un ejercicio que no puedes hacer no es tuyo por haberlo leído. |
| **Sin cantidades** | Igual que la despensa (058), y por lo mismo. |
| Colección **propia**, no reutilizar `despensa` | La despensa se le manda a la IA al pedir dieta: el banco acabaría en el prompt como comida. Es el mismo motivo por el que la 073 le dio colección propia a la compra. |
| Se **revoca** el "no entra" de la spec 059 | Aquella decía que la tabla usara la despensa "no tiene sentido". Sigue sin tenerlo: esto no es la despensa, es otro armario con sus propios datos. |

## 10. Fuera de spec: ideas apuntadas

- Buscador en el armario, si crece hasta molestar (se descartó a propósito aquí).
- Unificar el material del perfil (spec 016) con el armario, para no decir dos
  veces lo mismo en dos sitios.

## ✅ Para probar a mano

Guion completo: lo afina el agente `qa-manual` antes de la prueba. En corto, los
once puntos del apartado 3, más una regresión: **entrar en Comidas → Despensa y
comprobar que sigue funcionando igual**, porque esta spec toca `js/despensa.js`
para compartir la normalización.
