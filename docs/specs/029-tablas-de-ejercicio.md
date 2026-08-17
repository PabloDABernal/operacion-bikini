# 029 — Ejercicios y tablas: la semana de entrenamientos, guardada y editable

- **Estado:** revisada (agente `revisor-specs`, 2026-08-17; los dos bloqueantes que encontró están resueltos)
- **Fecha:** 2026-08-17
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v3)", puntos "Ejercicios" y "Tablas de ejercicio" (ampliados el 2026-08-17 antes de escribir esta spec).

## 1. Objetivo

Que una tabla de ejercicio deje de ser un texto que se lee y pase a ser una semana de verdad: siete días con su sesión, que se guarda, se puede corregir a mano, se apoya en un catálogo de ejercicios propio, y desde la que se apunta el entrenamiento del día con un toque.

Es la hermana de las specs 026 (recetas) y 028 (dietas), y hace las dos cosas a la vez: el catálogo y la semana.

## 2. Criterio de "esto funciona"

1. En **Ejercicio** hay un bloque **"Mis ejercicios"** con un botón **Nuevo ejercicio**.
2. Pulsarlo abre un formulario con: **nombre**, **cómo se hace** y **material**. Guardar lo mete en la lista.
3. Tocar un ejercicio lo despliega y enseña **Editar** y **Borrar**, con confirmación al borrar.
4. Debajo hay un bloque **"Mi tabla"** con la semana en filas: lunes a domingo, y en cada día su sesión.
5. Pedirle una tabla a la IA la guarda como semana y la enseña ahí, ya no como un bloque de texto.
6. Los **ejercicios que proponga** la IA aparecen en **Mis ejercicios**, con su explicación y su material.
7. Cada día enseña el **título de la sesión**, sus **minutos**, su **intensidad** y la lista de ejercicios con series/repeticiones o duración.
8. Tocar un día lo deja **editar a mano**: título, minutos, intensidad y los ejercicios, uno por línea.
9. Al editar, un desplegable permite **meter un ejercicio tuyo** y añade su nombre a la lista.
10. Cada día con sesión tiene un botón **"Lo he hecho"** que apunta **un solo registro de ejercicio** hoy, con el título, los minutos y la intensidad de esa sesión.
11. Después de usarlo, ese entrenamiento aparece en **Mis ejercicios apuntados** y el resumen de "Hoy" lo recoge.
12. Hay un botón **"Semana en blanco"** para montar la tabla desde cero, sin IA.
13. Solo hay **una tabla activa**. Pedir otra la sustituye, avisando antes.
14. El catálogo y la tabla **sobreviven** al finalizar una operación, igual que las recetas y la dieta.
15. En **Ajustes → Reiniciar datos** hay una casilla **"catálogo de ejercicios y tabla"** que los borra, distinta de la casilla **"ejercicios"** que ya existe y borra el diario.

## 3. Alcance

### Entra

- **Catálogo de ejercicios**: colección propia con alta, edición y borrado (espejo de la spec 026).
- **Colección de tablas**, con una activa (espejo de la spec 028).
- Generación por IA que devuelve la semana **estructurada** y los ejercicios que usa.
- Guardado automático de esos ejercicios en el catálogo, sin duplicar los que ya existan.
- Edición a mano de cualquier día, con ayuda del catálogo.
- Semana en blanco para montarla uno mismo.
- **"Lo he hecho"**: apunta la sesión del día como un registro.
- Casilla propia en el reinicio de datos y reglas de Firestore para las dos colecciones nuevas.

### NO entra (explícitamente fuera)

- **Varias tablas guardadas a la vez** ni historial: hay una activa y punto.
- **Marcar ejercicios sueltos** dentro de una sesión: se apunta la sesión entera o nada.
- **Registro de pesos levantados ni progresión de cargas**.
- **Que la tabla cambie sola** según lo que apuntes.
- **Vídeos, imágenes o enlaces** en el catálogo de ejercicios: solo texto.
- **Detalle nutricional** (spec 030) y **gamificación** (spec 031).
- Arrastrar sesiones de un día a otro.

## 4. Comportamiento detallado

### El ejercicio del catálogo

| Campo | Regla |
|---|---|
| Nombre | obligatorio, máximo 80 caracteres |
| Cómo se hace | texto libre, opcional, máximo 1000 caracteres |
| Material | texto libre, opcional, máximo 200 caracteres; vacío se lee como "sin material" |

Mensajes de error: `Ponle nombre al ejercicio.`, `Máximo 80 caracteres.`

Lista de tarjetas recortada a **3** con `Ver todos (N)`, igual que la spec 013 y el recetario. Tocar la tarjeta despliega cómo se hace y el material; volver a tocarla la pliega. El formulario está oculto por defecto y se abre con **Nuevo ejercicio** o al editar.

**Aviso de nombres**: en la app ya hay "ejercicios" que son registros de actividad hecha. Para no confundirlos, el bloque nuevo se llama **"Mis ejercicios"** (el catálogo) y la lista de registros que ya existía pasa a llamarse **"Mis entrenamientos apuntados"**.

### La semana

Siete días fijos, de lunes a domingo. Cada día es **una sesión** con:

- **título**: qué es esa sesión (`Piernas y core`, `Andar una hora`).
- **minutos**: duración estimada, entero de 1 a 600 (mismos límites que `validarEjercicio`).
- **intensidad**: `suave`, `media` o `fuerte` (los valores que ya usa `INTENSIDADES`).
- **ejercicios**: lista de líneas, cada una con su texto (`Sentadillas 4×12`) y, si viene del catálogo, su identificador.

Un día vacío se ve como un hueco con un `+` para rellenarlo, **igual que en la dieta**. No hay etiqueta de "descanso": un día sin sesión es un día de descanso, y no hace falta decirlo dos veces.

### Pedirla a la IA

- El botón **Pedir tabla de ejercicio** de la spec 027 sigue igual, con su campo de instrucciones y su cupo de **2 tablas al día**.
- Lo que cambia es lo que devuelve: en vez de un texto, la semana estructurada más la lista de ejercicios que usa.
- Al llegar:
  1. Se guardan los **ejercicios nuevos** (los que no existan ya con el mismo nombre, comparando sin mayúsculas ni espacios de más).
  2. Se guarda la **tabla** como activa, sustituyendo a la anterior.
  3. Se pinta la semana.
- Si ya había una tabla activa, se avisa antes: `Ya tienes una tabla. ¿La sustituyo?`

### El cupo, que sigue viviendo en los planes

La tabla se guarda en `usuarios/{uid}/tablas`, pero el cupo de **2 tablas al día** de la spec 027 se cuenta sobre `usuarios/{uid}/planes`. La 028 resolvió lo mismo dejando en `planes` una **marca** vacía (`guardarMarcaDePlan`) que gasta cupo y no se pinta, filtrada en `pintarPlanes()` por el campo `esDietaSemanal`.

Ese nombre ya no vale para una tabla, así que **se generaliza**:

- El campo pasa a llamarse **`esPlanSemanal`**, y lo escriben tanto la dieta como la tabla.
- `pintarPlanes()` filtra los planes que tengan **`esPlanSemanal` o `esDietaSemanal`**: las marcas de dieta ya guardadas llevan el nombre viejo y seguirían pintándose como tarjetas vacías si solo se mira el nuevo. **No se migran documentos**: se reconocen los dos y punto.
- `guardarMarcaDePlan(uid, tipo, instrucciones)` no cambia de firma; el `tipo` ya distingue dieta de ejercicio.

### Editarla

- Tocar un día abre una fila de edición con: título, minutos, intensidad (desplegable), los ejercicios **uno por línea**, un desplegable **"o usa un ejercicio tuyo"** y los botones Guardar y Cancelar.
- Elegir un ejercicio del desplegable **añade su nombre como línea nueva** y lo deja enlazado.
- Se guarda la tabla entera: son 7 sesiones, cabe de sobra en un documento.
- Vaciar el título borra la sesión y el día vuelve a ser un hueco.
- **Los minutos se validan al guardar**, con los mismos límites que el formulario de ejercicio: entero de **1 a 600**. Vacío o fuera de rango, no se guarda: `Los minutos deben estar entre 1 y 600.`
- El mismo ejercicio **puede repetirse** en una sesión. Tres bloques de sentadillas en momentos distintos del entrenamiento son tres líneas, no un error.

### "Lo he hecho"

- Cada día con sesión lleva ese botón.
- Al pulsarlo se guarda **un registro de ejercicio** con `guardarEjercicio(uid, texto, minutos, intensidad, fecha, hora)`:
  - `texto` = el **título** de la sesión,
  - `minutos` e `intensidad` = los de la sesión,
  - `fecha` = **hoy**, y **sin hora**.
- Va sin hora a propósito, igual que `apuntarDeLaDieta` y `repetirComida`: el botón se puede pulsar por la noche después de haber entrenado por la mañana, así que poner la hora del clic sería inventarse un dato.
- Sale la confirmación de siempre y la lista de entrenamientos apuntados se refresca.
- Se apunta **la sesión entera, no ejercicio a ejercicio**: decisión del usuario, porque un registro por ejercicio es un follón y una sesión a veces es simplemente "andar una hora".
- No se marca nada en la tabla: la tabla es el plan, no el diario. Igual que en la dieta.

### Dónde vive

En `usuarios/{uid}/ejerciciosCatalogo` y `usuarios/{uid}/tablas`, **fuera de las operaciones**, como el recetario y la dieta: lo que funcionó sigue sirviendo en la etapa siguiente.

## 5. Modelo de datos

| Ruta | Campos |
|---|---|
| `usuarios/{uid}/ejerciciosCatalogo/{id}` | `nombre` (string), `comoSeHace` (string), `material` (string), `creadoEn`, `editadoEn` |
| `usuarios/{uid}/tablas/{id}` | `activa` (bool), `dias` (array de 7 objetos con `dia` y `sesion`), `instrucciones` (string), `creadoEn` |

Cada sesión: `{ titulo, minutos, intensidad, ejercicios: [{ texto, ejercicioId }] }`. `ejercicioId` puede faltar. Un día sin sesión lleva `sesion: null`.

La colección del catálogo se llama `ejerciciosCatalogo` y **no** `ejercicios`, que ya está ocupada por los registros de actividad. Confundirlas mezclaría el plan con el diario.

**`firestore.rules` cambia**: dos colecciones nuevas. Se publican con la CLI antes de probar.

## 6. Casos límite

- **La IA devuelve menos de siete días**: se completan los que falten en blanco. Los días se emparejan **por orden**, no por nombre (lección de la spec 028).
- **La IA devuelve la lista de ejercicios como texto plano**: `api/tabla.js` la normaliza, y `describirEsquema()` en `api/_ia.js` tiene que decirle a Groq que ahí hay **listas dentro**, no texto. Es exactamente el fallo que costó cuatro intentos en la 028.
- **La IA devuelve minutos absurdos o intensidad inventada**: se recortan a 1–600 y la intensidad que no sea `suave`/`media`/`fuerte` cae a `media`.
- **La IA devuelve un ejercicio con el nombre de uno que ya tienes**: no se duplica; la línea se enlaza al que ya existía.
- **Borrar un ejercicio del catálogo enlazado en una tabla**: la línea conserva su texto y se queda sin enlace. No se rompe nada.
- **"Lo he hecho" dos veces**: se apunta dos veces. Es lo mismo que escribirlo dos veces.
- **Sin tabla**: el bloque explica qué es y ofrece pedirla o empezar en blanco.
- **Sin ejercicios en el catálogo**: el desplegable de edición no aparece; se escribe a mano.
- **Reiniciar datos** marcando la casilla nueva: se borran catálogo y tabla, también los de operaciones anteriores, porque no están archivados.
- **Sin conexión al editar**: mensaje de error y la fila se queda abierta con lo escrito.
- **Marcas de dieta ya guardadas**: llevan `esDietaSemanal` y no se migran. `pintarPlanes()` reconoce los dos nombres, así que no reaparecen como tarjetas vacías.
- **Anidamiento nunca probado**: la tabla es el primer esquema con listas **dentro de** listas (días → ejercicios). `describirEsquema()` ya es recursivo desde la 028, pero hay que probarlo **contra Groq** a propósito, no solo contra Gemini, que es quien responde casi siempre.

## 7. Archivos afectados

| Archivo | Cambio |
|---|---|
| `js/ejercicios-catalogo.js` | **nuevo**: validar, guardar, listar, actualizar y borrar del catálogo |
| `js/tablas.js` | **nuevo**: la semana, guardar, editar y leer |
| `api/tabla.js` | **nuevo**: pide la semana estructurada y sus ejercicios |
| `js/consulta.js` | `guardarMarcaDePlan` escribe `esPlanSemanal` en vez de `esDietaSemanal` |
| `js/app.js` | los bloques de catálogo y tabla en Ejercicio; `pintarPlanes()` filtra los dos nombres de marca; fuera `pintarUltimoPlan()`, que solo servía para leer la tabla en texto |

`api/_ia.js` estaba en esta lista y **no ha hecho falta tocarlo**: `describirEsquema()` ya era recursivo desde la 028 y describe el anidamiento nuevo sin cambios.
| `index.html` | formulario del catálogo, la semana y su edición |
| `styles.css` | tarjetas y rejilla de la semana |
| `js/reinicio.js` | casilla nueva |
| `firestore.rules` | las dos colecciones nuevas |
| `vercel.json` | la función nueva |

**Estimación: ~700 líneas.** Muy por encima del límite de ~300 de `CLAUDE.md`. Se avisó al usuario y se le ofreció partirla en dos specs (catálogo y tabla); **eligió una sola spec completa** el 2026-08-17.

## 8. Decisiones tomadas

- **La sesión del día es una lista libre de ejercicios**, no ranuras fijas → un entrenamiento no tiene un número fijo de partes como una comida tiene desayuno/comida/merienda/cena.
- **Día vacío = hueco con `+`**, sin etiqueta de descanso → igual que en la dieta; un día sin nada ya dice que se descansa.
- **"Lo he hecho" apunta la sesión entera** → decisión del usuario: un registro por ejercicio es un follón, y a veces la sesión es simplemente andar una hora.
- **Sí hay catálogo de ejercicios** → decisión del usuario, aun sabiendo que casi duplica el tamaño de la spec. Sin él, la tabla no puede apoyarse en nada propio.
- **Una sola tabla activa, sustituyendo con aviso** → espejo de la 028, por la misma razón: un historial no aporta y multiplica la pantalla.
- **Catálogo y tabla viven fuera de las operaciones** → misma razón que el recetario y la dieta.
- **Una sola spec de ~700 líneas en vez de dos** → decisión del usuario el 2026-08-17, con el aviso de tamaño delante.
- **"Lo he hecho" apunta sin hora** → decisión del usuario el 2026-08-17. Es lo que ya hacen los atajos de comida, y el botón se pulsa cuando uno se acuerda, no cuando entrena.
- **La marca de cupo se generaliza a `esPlanSemanal`** → decisión del usuario el 2026-08-17. Dos flags con el mismo significado (`esDietaSemanal` + `esTablaSemanal`) obligarían a mirar los dos para siempre. Los documentos viejos no se migran: el filtro reconoce ambos nombres.
- **La casilla de reinicio se llama "catálogo de ejercicios y tabla"** → decisión del usuario el 2026-08-17. No comparte la palabra suelta "ejercicios" con la casilla del diario, y equivocarse ahí borra datos.
- **Los minutos se validan a 1–600 al editar a mano** → mismos límites que `validarEjercicio`. Si no, "Lo he hecho" mandaría minutos inválidos a un registro que sí valida.
- **Una línea escrita a mano se enlaza sola si empieza por el nombre de un ejercicio del catálogo** → añadido durante la implementación, no estaba en la spec. Escribir "Sentadillas 4x12" y tener que abrir además el desplegable para enlazarlo sería trabajo doble. **Pendiente de que el usuario lo confirme al probar**: si molesta, se quita `enlazarConElCatalogo()` y el enlace queda solo en el desplegable.

## 9. Fuera de spec: ideas apuntadas

- Guardar varias tablas y poder recuperar una anterior. → `docs/BACKLOG.md`
- Registrar los pesos levantados y ver la progresión. → `docs/BACKLOG.md`
- Marcar ejercicios sueltos dentro de una sesión. → `docs/BACKLOG.md`

## ✅ Para probar a mano

En https://operacion-bikini.vercel.app, con la operación en marcha. **Los pasos 16 y 17 borran datos de verdad: van al final a propósito.**

### El catálogo (criterios 1, 2, 3)

1. **Ejercicio** → bloque **Mis ejercicios** → **Nuevo ejercicio**. Nombre `Sentadillas búlgaras`, cómo se hace lo que quieras, material `un banco`. Guardar. Aparece la tarjeta con el nombre y, a la derecha, `un banco`.
2. Otro más, sin material: `Flexiones`. La tarjeta debe decir **`sin material`**, no un hueco.
3. Tocas `Sentadillas búlgaras`: se despliega y se ve cómo se hace, con **Editar** y **Borrar**. Vuelves a tocarla: se pliega.
4. **Editar** en `Flexiones`, cambias el material, guardas. La tarjeta lo refleja. **Borrar** en `Flexiones`: sale `¿Borrar el ejercicio "Flexiones"?`. Aceptas y desaparece.

### La semana a mano (criterios 4, 8, 9, 12)

5. Bloque **Mi tabla**: dice que aún no tienes tabla. Pulsas **Empezar una semana en blanco**. Salen los siete días, de lunes a domingo, cada uno con un `—` y un `+`. **Ningún día debe decir "descanso"**.
6. `+` en el lunes. Escribes título `Piernas`, minutos `45`, intensidad `media`, y en la caja de ejercicios `Sentadillas búlgaras 3x15`. Guardas.
7. El lunes enseña `Piernas`, `45 min · Media`, la lista con esa línea, y los botones **Lo he hecho** y **Editar**.
8. **Editar** en el lunes: el desplegable **"o usa un ejercicio tuyo…"** está ahí. Eliges `Sentadillas búlgaras` y se **añade una línea nueva**, sin borrar la que ya había. Guardas: ahora hay dos líneas.

### Lo que valida (casos límite)

9. **Editar** el lunes, pones minutos `700`, guardas: sale `Los minutos deben estar entre 1 y 600.` y la fila **sigue abierta con lo escrito**. Corriges a `50` y guarda bien.
10. **Editar** el lunes, **borras el título** y guardas: el lunes vuelve a ser un hueco con `+`.

### Pedírsela a la IA (criterios 5, 6, 13) — y el paso que importa

11. Arriba, **Pedir tabla de ejercicio**. Escribes `el sábado juego al pádel, no me pongas nada`. **Pedir**. Sale `Pensando…` unos segundos.
12. **Este es el paso que hay que mirar con lupa.** Cuando llegue, comprueba que **al menos un día tiene DOS O MÁS líneas de ejercicio** debajo del título. Si los días salen con título y minutos pero **sin líneas**, o con la lista pegada en una sola línea llena de comillas y corchetes, es el fallo de las listas anidadas: hay que mirar `describirEsquema()` de `api/_ia.js` y `listaDeEjercicios()` de `api/tabla.js`. Comprueba también que el sábado respetó lo que pediste.
13. Los ejercicios que ha usado aparecen ahora en **Mis ejercicios**, con su explicación y su material. Si ya tenías uno con ese nombre, **no debe estar repetido**.
14. Si ya tenías tabla, antes de sustituirla te ha preguntado `Ya tienes una tabla. ¿La sustituyo?`.

### "Lo he hecho" (criterios 10, 11)

15. **Lo he hecho** en un día con sesión. Sale `Guardado`. Bajas a **Mis entrenamientos apuntados**: está el registro con el título de la sesión, sus minutos y su intensidad, con fecha de hoy y **sin hora**. En **Hoy**, el resumen lo recoge. Púlsalo dos veces: se apunta dos veces, y es lo esperado.

### Regresiones (esta spec tocó código compartido)

16. **Cupos separados**: bajo el botón de tabla debe decir cuántas te quedan hoy. Pide una dieta en **Comidas** y vuelve: **el contador de tablas no debe haber bajado**, y al revés.
17. **Nada de tarjetas vacías**: en **Consulta → Mis planes** no puede aparecer ninguna tarjeta sin texto. Ni de las dietas de días pasados ni de las tablas de hoy. Este es el punto que rompería el renombrado de la marca.
18. **La dieta sigue igual**: en **Comidas**, la semana de menús se ve, se edita y "me lo he comido" sigue apuntando.
19. **Catálogo vacío**: borra todos los ejercicios de **Mis ejercicios** y edita un día de la tabla. El desplegable **no debe aparecer**; se escribe a mano y guarda igual.
20. **Ejercicio enlazado borrado**: con un ejercicio del catálogo que esté en la tabla, bórralo. La línea de la tabla **conserva su texto** y no se rompe nada.

### Lo destructivo, al final

21. **Ajustes → Reiniciar datos**. Hay dos casillas parecidas: **`Ejercicios (N)`** (el diario) y **`Catálogo de ejercicios y tabla (N)`** (lo nuevo). Marca **solo la primera**, pulsa borrar, escribe `BORRAR` y confirma. Después: **Mis entrenamientos apuntados** vacío, pero **Mis ejercicios** y **Mi tabla intactos**.
22. Ahora la segunda casilla, igual. Después: **Mis ejercicios** vacío y **Mi tabla** dice que no tienes tabla.

### Una cosa a decidir mientras pruebas

En el paso 6 escribiste `Sentadillas búlgaras 3x15` a mano y esa línea **se enlazó sola** con el ejercicio del catálogo, porque empieza por su nombre. Eso no estaba en la spec: se añadió al implementar. Si te estorba, se quita y el enlace queda solo en el desplegable.
