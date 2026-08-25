# 055 — La entrevista de bienvenida empieza de cero de verdad

- **Estado:** ✅ completada. Implementada y desplegada el 2026-08-24; probada y confirmada por el usuario el 2026-08-25.
- **Fecha:** 2026-08-24
- **Referencia en PRODUCTO.md:** apartado "Qué hace", punto **"Reinicio de
  datos"** (ampliado hoy con "lo que la IA sabe de ti") y el punto
  **"Operaciones con principio y fin"**.

## 1. Objetivo

El usuario borró todos sus datos, empezó la entrevista de bienvenida, contestó
**"Pau"** a la primera pregunta y la IA cerró la entrevista de golpe,
hablándole de pasar de 81 a 67 kg, de su pádel semanal y de sus mancuernas.
Nada de eso se lo había contado: era su perfil de la etapa anterior.

No fue un invento del modelo. Se lo dimos nosotros:

- `contextoDelUsuario()` (`js/consulta.js`) lee el documento de ajustes, que la
  Zona de peligro **nunca borra** a propósito (`js/reinicio.js`: *"reiniciar es
  empezar de cero con el mismo objetivo, no olvidar quién eres"*).
- `contexto(nombre, perfil)` (`api/consulta.js`) mete ese retrato en el prompt
  **también en modo `inicial`**, con la frase "Esto es lo que ya sabes de ella".
- Nada impide cerrar la entrevista en la primera pregunta: `MAXIMO_PREGUNTAS`
  es un tope por arriba, y por abajo no hay ninguno.

Al terminar esta spec, una entrevista de bienvenida no sabe nada de quien la
hace, no puede cerrarse hasta haber preguntado lo suyo, y el usuario tiene una
forma de hacer que la app le olvide.

## 2. Criterio de "esto funciona"

1. Con un perfil viejo guardado en Ajustes, empezar una **entrevista de
   bienvenida** (modo `inicial`, sin ninguna operación en el histórico): la IA
   **no menciona** nada que no le hayas dicho en esa conversación — ni el peso
   objetivo de antes, ni el deporte, ni el material.
2. Contestar solo el nombre **no cierra** la entrevista: sigue preguntando.
3. La entrevista recorre lo que tiene que averiguar (altura, peso actual, peso
   objetivo, plazo, gustos, aversiones, alergias, ejercicio, material,
   limitaciones) y **solo entonces** cierra.
4. Al cerrar, los Ajustes quedan rellenos con lo que se ha hablado **en esa
   entrevista**, no con lo de antes.
5. Una **entrevista de etapa nueva** (modo `reinicio`, con operaciones en el
   histórico) **sigue conociéndote**: no vuelve a preguntar gustos ni material,
   como hasta ahora. Ahí el perfil es justo lo que la hace útil.
6. En **Ajustes → Zona de peligro** hay una casilla nueva, **"lo que la IA sabe
   de mí"**, con su recuento. Al marcarla y borrar, se vacían nombre, altura,
   peso objetivo, fecha objetivo y perfil.
7. Tras borrar eso, la cabecera deja de llamarte por tu nombre y el formulario
   "Mi objetivo" queda vacío, **sin recargar la página**.
8. Esa casilla **no** borra la preferencia de proveedor de IA ni la cuenta.

## 3. Alcance

### Entra
- No mandar `nombre` ni `perfil` a la IA en modo `inicial`.
- Un suelo de preguntas en modo `inicial`: la IA no puede cerrar antes.
- Casilla nueva en la Zona de peligro que borra los campos del perfil.

### NO entra (explícitamente fuera)
- **El modo `reinicio`.** Sigue recibiendo el perfil, que es su razón de ser.
- **La revisión y la conversación.** También reciben el perfil, con razón.
- **Borrar la cuenta.** Sigue sin poder hacerse desde la app.
- **`proveedorIa`.** Es una preferencia de la app, no algo que la IA sepa de ti.
- **Cambiar `MAXIMO_PREGUNTAS`** (25), que es el tope por arriba.
- **Que el cierre deje de mencionar la dieta y la tabla.** El prompt dice que
  "esta persona ya tiene en la app una dieta semanal y una tabla de ejercicio";
  tras un borrado no las tiene, y el cierre lo dio por hecho. Molesta menos que
  lo anterior y se apunta en `docs/BACKLOG.md`.

## 4. Comportamiento detallado

### 4.1 La entrevista no sabe nada (`api/consulta.js`)

`contexto(nombre, perfil)` se llama hoy siempre. Pasa a llamarse solo cuando el
modo **no** es `inicial` estricto.

Ojo con la variable: hoy `const inicial = cuerpo.modo === "inicial" || reinicio`
—es decir, "inicial" ahí significa "cualquiera de las dos bienvenidas", y se usa
para decidir qué campos personales se devuelven—. Hace falta distinguir la
bienvenida de verdad, que es `cuerpo.modo === "inicial"` a secas. Se añade una
variable nueva con nombre que no engañe (`primeraVez`) y **no** se toca el
significado de `inicial`, del que dependen los campos de la respuesta.

El corte va en el servidor y no en el cliente a propósito: es donde se arma el
prompt, y así ninguna llamada futura puede colarlo por descuido.

Además, `INSTRUCCIONES_INICIAL` gana una línea explícita:

> NO SABES NADA de esta persona: es la primera vez que habláis. No des por hecho
> ningún dato —ni peso, ni objetivo, ni deporte, ni material— que no te haya
> dicho en esta conversación.

### 4.2 El suelo de preguntas (`api/consulta.js`)

En modo `inicial` la IA no puede cerrar antes de haber hecho **8** preguntas.
Son menos que los diez datos obligatorios de la lista porque una respuesta puede
traer varios ("mido 176 y peso 81"), y más que las tres o cuatro con las que se
despacharía.

Cuando llega un cierre antes de tiempo, el proxy **no** lo pasa: le pide otro
turno a la IA con una instrucción al final del hilo, igual que ya se hace al
forzar el cierre en `debeCerrar`, pero al revés:

> Todavía te falta información. NO cierres: haz la siguiente pregunta que
> necesites de la lista de datos obligatorios.

Si aun así insiste en cerrar, se pasa el cierre: pelearse en bucle con el modelo
gastaría cuota y dejaría al usuario esperando. Un reintento, y adelante.

`reinicio` no lleva suelo: su prompt ya dice "con cuatro o cinco preguntas
deberías tener bastante", y ahí cerrar pronto es lo correcto.

### 4.3 La casilla nueva (`js/reinicio.js` y `js/app.js`)

Entrada nueva en `TIPOS`, la **última** de la lista, después de "operaciones":
clave `perfil`, etiqueta "lo que la IA sabe de mí", sin colecciones.

Es la tercera de la lista que no es una colección (como "fotos", que además va a
Cloudinary, y "operaciones", que es el histórico), así que `contarTodo()` y
`borrarSeleccion()` la tratan aparte, igual que a aquellas.

- **Recuento:** cuántos de los cinco campos (`nombre`, `perfil`, `alturaCm`,
  `pesoObjetivoKg`, `fechaObjetivo`) tienen algo. Así el número dice cuánto hay
  que perder, y sale (0) cuando ya no queda nada.
- **Borrado:** poner esos cinco campos a `null` en el documento de ajustes. No
  se borra el documento: dentro vive también `proveedorIa`, que no se toca.

La etiqueta va en primera persona porque las de al lado son sustantivos
("pesajes", "fotos") y esta no lo es. La frase de aviso queda *"Vas a borrar
para siempre: 5 lo que la IA sabe de mí"*, que suena raro pero es el mismo
formato que el resto y no merece un caso especial.

En `js/app.js`, tras un borrado con éxito hay que **releer los ajustes**
(`refrescarAjustes()`), o la cabecera seguiría saludándote por tu nombre. Va
junto al `refrescarOperaciones()` que añadió la spec 053, por el mismo motivo.

## 5. Modelo de datos

Sin colecciones nuevas. En `usuarios/{uid}`, los campos `nombre`, `perfil`,
`alturaCm`, `pesoObjetivoKg` y `fechaObjetivo` pasan a poder valer `null` por
borrado explícito, que es lo que ya devuelve `leerAjustes()` cuando el documento
no existe. No hacen falta reglas nuevas de Firestore: es una escritura del
usuario sobre su propio documento, que ya está permitida.

## 6. Casos límite

- **Entrevista a medias cuando se borra el perfil.** El perfil solo se lee al
  empezar la consulta, así que una entrevista en curso no se entera. Al cerrarse
  volverá a escribir los campos.
- **Sin ajustes guardados** (usuario nuevo): el recuento sale (0) y borrar no
  hace nada. No es un error.
- **La IA devuelve cierre en el reintento.** Se acepta, como se ha dicho.
- **`fotoPerfil`.** Ya no existe desde la spec 039; si algún documento viejo lo
  conserva, no se toca: no es algo que la IA sepa.
- **Modo `reinicio` con el perfil borrado a mano.** La entrevista de etapa nueva
  se queda sin contexto y preguntará más. Es coherente: se borró queriendo.

## 7. Archivos afectados

| Archivo | Qué |
|---|---|
| `api/consulta.js` | `contexto()` solo si no es `inicial` estricto; línea nueva en `INSTRUCCIONES_INICIAL`; suelo de preguntas. |
| `js/reinicio.js` | Tipo `perfil` en `TIPOS`, con su recuento y su borrado. |
| `js/app.js` | Releer ajustes tras borrar. |
| `docs/PRODUCTO.md` | Ya actualizado. |
| `docs/BACKLOG.md` | La idea del cierre que da por hecha la dieta y la tabla. |
| `docs/ESTADO.md` | Al terminar. |

Tamaño estimado: ~90 líneas.

## 8. Decisiones tomadas

- **Casilla nueva en la Zona de peligro**, en vez de dejar el perfil intocable.
  Decisión del usuario el 24 de agosto: sin ella no hay forma de que la app te
  olvide. Va separada y sin marcar por defecto.
- **Suelo de preguntas además del arreglo del contexto.** Decisión del usuario
  el mismo día: red de seguridad por si el prompt vuelve a fallar, en vez de
  fiarlo todo a que el modelo obedezca.
- **El corte del contexto va en el proxy**, no en el cliente: es donde se arma
  el prompt.
- **Ocho preguntas, no diez.** Una respuesta puede traer varios datos.
- **Un solo reintento.** Pelearse con el modelo gasta cuota y hace esperar.

## 9. Fuera de spec: ideas apuntadas

- El cierre de la entrevista da por hecho que ya tienes dieta y tabla en la app
  ("Ya tienes tu plan y tabla listos"), y tras un borrado no las tienes. Va a
  `docs/BACKLOG.md`.

## ✅ Para probar a mano

Se afina con el agente `qa-manual`.
