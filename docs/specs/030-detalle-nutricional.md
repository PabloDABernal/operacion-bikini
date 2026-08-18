# 030 — Detalle nutricional automático

- **Estado:** revisada (agente `revisor-specs`, 2026-08-17; los tres bloqueantes que encontró están resueltos)
- **Fecha:** 2026-08-17
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v2)", punto "Detalle nutricional automático", y "Qué hará (v3)", que lo deja pendiente. La prohibición de calorías exactas está en "Qué explícitamente NO hace".

## 1. Objetivo

Saber qué has comido de verdad sin apuntar nada más: la IA lee lo que ya escribiste en texto libre y lo convierte en grupos de alimentos y una horquilla de calorías. El usuario no rellena ningún campo nuevo.

## 2. Criterio de "esto funciona"

1. En **Hoy**, debajo del resumen del día, hay un bloque **"Qué has comido hoy"** con un botón **Analizar lo que llevo hoy**.
2. Sin comidas apuntadas hoy, el botón está deshabilitado y el bloque explica que primero hay que apuntar algo.
3. Con comidas apuntadas, pulsar el botón enseña `Pensando…` y, en unos segundos, el resultado.
4. El resultado son los **seis grupos fijos**, cada uno con su medida (`nada`, `poco`, `bastante`, `mucho`) y una barra proporcional.
5. Debajo, las calorías **en horquilla**: `Entre 1.600 y 1.900 kcal aproximadamente`. Nunca un número exacto.
6. Debajo, un **comentario corto** de la IA sobre el día (una o dos frases), y el disclaimer de siempre.
7. El bloque dice **a qué hora se hizo** el análisis: `Analizado a las 14:32`.
8. Si apuntas una comida **después** de analizar, el bloque avisa: `Has apuntado algo después de este análisis.` y el botón pasa a decir **Volver a analizar**. Pulsarlo sustituye el análisis del día.
9. El cupo es de **2 análisis al día**. Gastados, el botón se deshabilita y dice cuándo vuelve.
10. Al día siguiente, el bloque aparece **vacío otra vez**: el análisis es de un día concreto, no se arrastra.
11. El análisis de días anteriores **no se puede consultar**: no hay histórico. Lo de ayer, ayer.
12. En **Ajustes → Reiniciar datos** hay una casilla **`Análisis nutricionales (N)`** que los borra.

## 3. Alcance

### Entra

- Bloque nuevo en **Hoy**, debajo del resumen.
- Función serverless que manda las comidas del día y devuelve grupos, horquilla y comentario.
- Guardado del análisis del día, con la hora y con qué comidas se hizo.
- Aviso de análisis desactualizado y opción de rehacerlo.
- Cupo propio de 1 al día, contado como el resto: sobre los documentos guardados hoy.
- Casilla propia en el reinicio de datos y reglas de Firestore para la colección nueva.

### NO entra (explícitamente fuera)

- **Calorías exactas, gramos o pesar alimentos**: lo prohíbe `PRODUCTO.md`. Solo horquillas.
- **Macronutrientes** (proteínas/grasas/hidratos en gramos o porcentajes): es la misma precisión fingida con otro nombre.
- **Objetivo calórico diario** ni "te has pasado / te falta": esta spec describe, no juzga con números.
- **Histórico** de análisis, gráficas de calorías por día o medias semanales.
- **Análisis de días pasados**: solo hoy.
- **Análisis del ejercicio** (calorías quemadas): no está en `PRODUCTO.md` y sería precisión fingida sobre precisión fingida.
- **Que el análisis cambie la dieta o los planes**: es información, no una acción.
- Corregir a mano lo que diga la IA.

## 4. Comportamiento detallado

### Los seis grupos

Lista **fija**, siempre en este orden, para que un día se pueda comparar con otro y la barra se pinte siempre igual:

1. Verdura y fruta
2. Proteína
3. Cereales y féculas
4. Lácteos
5. Grasas
6. Ultraprocesados y dulces

Cada grupo lleva una **medida** de cuatro valores: `nada`, `poco`, `bastante`, `mucho`. No es una cantidad: es cuánto pesó ese grupo en el día. La barra es proporcional a esos cuatro escalones (0, 1, 2, 3).

Los seis salen **siempre**, aunque sean `nada`: un día sin verdura se ve mejor si la fila está y está vacía.

### Las calorías

Una horquilla con **mínimo y máximo**, redondeados a la centena: `Entre 1.600 y 1.900 kcal aproximadamente`. Si la IA devuelve un solo número, se convierte en horquilla de ±15%. Si devuelve una horquilla al revés (mínimo mayor que máximo), se intercambian.

Debajo, siempre: `Es una estimación de una IA a partir de lo que has escrito, no una medición.`

### El botón y el cupo

**2 análisis al día**, para que quepa el caso que los pide: uno a media tarde para ver cómo llevas el día, y otro después de cenar, cuando el día ya está completo.

El cupo **no se cuenta sobre los documentos guardados**, como el resto de cupos del proyecto, porque aquí solo hay **un documento por día** que se sobrescribe al rehacer: contar documentos daría siempre 1. Se cuenta con un campo `veces` dentro del propio documento del día, que sube en cada análisis.

| Situación | Botón | Texto |
|---|---|---|
| Sin comidas hoy | deshabilitado | `Apunta lo que comas y podré decirte qué llevas.` |
| Sin análisis y con cupo | **Analizar lo que llevo hoy** | el cupo que queda |
| Análisis al día, con cupo | deshabilitado | `Ya has analizado el día de hoy.` |
| Análisis viejo, con cupo | **Volver a analizar** | el cupo que queda |
| Cupo gastado | deshabilitado | `Has analizado tu día 2 veces. Vuelve mañana.` |

Con el cupo gastado y el análisis viejo, el aviso de desactualizado **se sigue viendo**: es la explicación de por qué el dato no cuadra con lo que has apuntado.

### Cuándo se queda viejo

Al guardar el análisis se apunta **cuántas comidas de hoy había** en ese momento. Si al pintar el bloque hay más, el análisis está viejo y se avisa. Se cuentan las comidas, no su contenido: editar una comida ya analizada no dispara el aviso, y es una imprecisión aceptada — la alternativa era guardar una huella de todos los textos para ganar muy poco.

### Dónde vive

En `usuarios/{uid}/analisis`, **dentro** de la operación en curso: a diferencia del recetario o el catálogo de ejercicios, esto es diario, no conocimiento. Se archiva con la operación como cualquier otro registro, siguiendo la spec 018.

## 5. Modelo de datos

| Ruta | Campos |
|---|---|
| `usuarios/{uid}/analisis/{AAAA-MM-DD}` | `fecha` (string, la misma que el id), `grupos` (array de 6 objetos `{ grupo, medida }`), `caloriasMin` (number), `caloriasMax` (number), `comentario` (string), `comidasAnalizadas` (number), `veces` (number), `creadoEn`, `editadoEn` |

**El id del documento es la fecha**, así que hay uno por día por construcción: se lee con `getDoc` de una ruta conocida, sin consultas, y rehacer es un `setDoc` que lo sustituye. `veces` sube en cada análisis y es lo que gasta el cupo; `editadoEn` es la hora que se enseña (`Analizado a las 20:41`), que tras un rehacer es la del rehacer.

**`firestore.rules` cambia**: colección nueva. Se publican con la CLI antes de probar.

**`js/operaciones.js` cambia en dos sitios**: `analisis` entra en `COLECCIONES`, o al cerrar una operación los análisis se quedarían sueltos mientras el resto se archiva; y entra también en `NOMBRES`, con la etiqueta `análisis nutricionales`, o al archivar se leería `Archivando… (analisis)`.

**`calcularResumen()` no cambia**: el análisis **no cuenta** para los días registrados de la operación. Es un dato derivado de las comidas, no algo que hayas apuntado tú; contarlo sería premiar dos veces el mismo día.

## 6. Casos límite

- **La IA devuelve grupos que no son los seis**: se emparejan **por orden**, como los días de las specs 028 y 029. Los que falten quedan en `nada`.
- **La IA devuelve una medida inventada** (`moderado`, `alto`): la que no sea una de las cuatro cae a **`nada`**. No hay de dónde deducir otra cosa —la medida *es* el dato—, y quedarse corto se ve en pantalla, mientras que inventar al alza no.
- **La IA devuelve calorías absurdas** (0 o 12.000): se recorta a un rango de 500–6.000 kcal. Fuera de ahí no es una estimación, es un error de lectura.
- **Comidas ilegibles o de broma** (`asdf`): la IA responde lo que pueda y lo dice en el comentario. No se valida el contenido.
- **Apuntar y borrar una comida**: el recuento baja, así que el análisis deja de estar viejo. Es correcto: vuelve a describir lo que hay.
- **Medianoche con la app abierta**: el bloque sigue enseñando el análisis de ayer hasta que se recarga. Mismo comportamiento que el resto de "Hoy" (ya está en `BACKLOG.md`).
- **Sin operación en marcha**: el bloque no se ve, como el resto de "Hoy".
- **Gemini saturado**: cae a Groq como todo lo demás (spec 020). Si fallan los dos, no se guarda análisis y **no se gasta cupo**.
- **Reiniciar datos** marcando comidas pero no análisis: el análisis se queda describiendo comidas que ya no existen. Se acepta: al día siguiente desaparece solo.

## 7. Archivos afectados

| Archivo | Cambio |
|---|---|
| `js/analisis.js` | **nuevo**: leer el de hoy, guardar, cupo y llamada al proxy |
| `api/analisis.js` | **nuevo**: pide los grupos, la horquilla y el comentario |
| `js/app.js` | el bloque en "Hoy" |
| `js/consulta.js` | los mensajes de `analisis-ilegible` y `sin-comidas`, donde viven todos los de la IA |
| `index.html` | el bloque y su botón |
| `styles.css` | las barras de los grupos |
| `js/operaciones.js` | `analisis` en `COLECCIONES` **y** en `NOMBRES` |
| `js/reinicio.js` | casilla nueva: clave `analisis`, etiqueta `análisis nutricionales`, colección `analisis` |
| `firestore.rules` | la colección nueva |
| `vercel.json` | la función nueva |

**Estimación: ~350 líneas.** Por encima del límite de ~300, pero poco: la mitad es el proxy y su normalización, que no se puede probar sin el bloque que lo enseña. Se avisó al usuario y **aceptó no partirla** el 2026-08-17.

## 8. Decisiones tomadas

- **Botón manual, no automático** → decisión del usuario el 2026-08-17. Lanzarlo al abrir la app gastaría la cuota gratuita cada día se mire o no, y a media mañana analizaría un día a medias.
- **Analiza hoy, no ayer** → decisión del usuario. El dato sirve para corregir el día, y de ayer ya no se corrige nada.
- **Grupos fijos, no los que decida la IA** → decisión del usuario. Con etiquetas distintas cada día no se puede comparar ni pintar una barra estable.
- **Avisa cuando se queda viejo, y se puede rehacer** → decisión del usuario. Rehacerlo solo con cada comida se comería la cuota; no avisar dejaría un dato mentiroso en pantalla sin decirlo.
- **Dos análisis al día, no uno** → decisión del usuario el 2026-08-17, al detectarse que con uno solo el botón "Volver a analizar" nunca se podría pulsar. Dos deja el caso real: uno a media tarde y otro después de cenar.
- **El cupo se cuenta con un campo `veces`, no contando documentos** → aquí solo hay un documento por día, que se sobrescribe: contarlos daría siempre 1. Es la única excepción del proyecto al patrón de `quedanPlanesHoy`, y por eso está escrito.
- **El id del documento es la fecha** → un día tiene un análisis por construcción, se lee sin consultas y rehacer es sustituirlo.
- **Los análisis no cuentan para los días registrados de la operación** → son derivados de las comidas; contarlos premiaría dos veces el mismo día.
- **Sin histórico ni días pasados** → no está en `PRODUCTO.md` y multiplicaría la pantalla. La gráfica de calorías por día es justo la precisión fingida que el producto rechaza.
- **Vive dentro de la operación** → es diario, no conocimiento acumulado. Al revés que el recetario (026), la dieta (028) y el catálogo (029).
- **El "está viejo" se mide contando comidas** → guardar una huella de los textos costaba más y aportaba muy poco.

## 9. Fuera de spec: ideas apuntadas

- Ver la evolución de los grupos a lo largo de la semana. → `docs/BACKLOG.md`
- Que el análisis del día alimente el contexto de la conversación con la IA. → `docs/BACKLOG.md`

## ✅ Para probar a mano

En https://operacion-bikini.vercel.app, con la operación en marcha. **El paso 13 borra datos: va al último a propósito.** Ojo: solo hay **2 análisis al día**, así que los pasos 3 y 7 gastan el cupo entero. Si te quedas sin, el resto se prueba mañana.

### Sin nada apuntado (criterio 2)

1. Si hoy no has apuntado ninguna comida, en **Hoy** el bloque **Qué has comido hoy** dice `Apunta lo que comas y podré decirte qué llevas.` y el botón está **deshabilitado**.

### El primer análisis (criterios 1, 3, 4, 5, 6, 7)

2. Apunta dos o tres comidas de hoy en **Comidas**. Vuelve a **Hoy**: el bloque ya explica qué hace y el botón **Analizar lo que llevo hoy** está disponible, con `Te quedan 2 de hoy.`
3. Pulsa el botón. Sale `Pensando…` y en unos segundos el resultado.
4. Comprueba que salen **los seis grupos**, en este orden: verdura y fruta, proteína, cereales y féculas, lácteos, grasas, ultraprocesados y dulces. **Los seis tienen que estar**, aunque alguno diga `nada` con la barra vacía.
5. Las calorías salen como **horquilla**, redondeadas a la centena: `Entre 1.600 y 1.900 kcal aproximadamente`. **Si ves un número exacto de calorías en cualquier parte, es un fallo grave**: es lo que `PRODUCTO.md` prohíbe.
6. Debajo, el comentario de una o dos frases, la hora (`Analizado a las …`) y el aviso de que es una estimación de una IA.
7. El botón queda **deshabilitado** y dice `Ya has analizado el día de hoy.`, con `Te queda 1 de hoy.`

### Que se quede viejo (criterio 8)

8. Ve a **Comidas** y apunta una comida más. Vuelve a **Hoy**: aparece `Has apuntado algo después de este análisis.` y el botón pasa a decir **Volver a analizar**, habilitado.
9. Púlsalo. El análisis se **sustituye** (no se añade otro), la hora cambia y el aviso de viejo desaparece.
10. Ahora el cupo está gastado: el botón dice `Has analizado tu día 2 veces. Vuelve mañana.` y está deshabilitado. **Apunta otra comida más**: el aviso de "has apuntado algo después" **debe volver a verse**, aunque el botón siga bloqueado. Ese aviso es la explicación de por qué el dato no cuadra.

### Al día siguiente (criterio 10)

11. Mañana, el bloque debe estar **vacío otra vez**, con el botón disponible y `Te quedan 2 de hoy.` El análisis de ayer no se arrastra ni se puede consultar (criterio 11).

### Regresiones

12. **Archivar una operación**: si cierras una operación desde Ajustes, el mensaje de progreso debe decir `Archivando… (análisis nutricionales)` en algún momento, **no** `(analisis)`. Y el histórico debe quedar consultable como siempre.

### Lo destructivo, al final

13. **Ajustes → Reiniciar datos**: hay una casilla nueva **`Análisis nutricionales (N)`** con su recuento. Márcala sola, escribe `BORRAR` y confirma. Después, en **Hoy**, el bloque vuelve a estar vacío y el botón disponible — pero **el cupo se reinicia también**, porque el cupo vive dentro del documento que acabas de borrar. Es conocido y aceptado: pasa lo mismo con el resto de cupos del proyecto.

### Lo que hay que mirar con lupa

El punto 5. Todo lo demás son horquillas de las de siempre, pero si la IA devuelve algo raro —un número solo, el mínimo mayor que el máximo, 12.000 kcal— la normalización de `horquilla()` en `api/analisis.js` tiene que dejarlo en una horquilla redondeada y dentro de 500–6.000. No hay forma de forzarlo desde la app: solo se ve si algún día sale un número feo.
