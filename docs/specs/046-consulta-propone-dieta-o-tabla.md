# 046 — La consulta propone dieta o tabla, y tú aceptas

- **Estado:** 📝 pendiente de implementar (después de la 045).
- **Fecha:** 2026-08-23
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v5…)", punto **"La consulta puede proponerte dieta o tabla nuevas"**.
- **Tercera de tres.** Cierra la v5.

## 1. Objetivo

Tras la 045, la consulta repasa cómo vas y te dice qué toca. Pero si lo que
toca es cambiar la dieta o la tabla, hay que salir a Comidas o a Ejercicio y
pedirla a mano, repitiendo el contexto que la IA acababa de tener delante. Al
terminar esta spec, la consulta te lo deja a un toque, sin sustituir nada sin
tu permiso.

## 2. Criterio de "esto funciona"

1. Si del cierre de una consulta sale que conviene cambiar la **dieta**, debajo
   del mensaje aparece un botón **"Pedir esa dieta"**.
2. Igual con la **tabla de ejercicio**: **"Pedir esa tabla"**.
3. Puede proponer las dos, una, o ninguna. Lo normal es ninguna.
4. **Al recargar la página y volver a Consulta**, el hilo de la última consulta
   terminada sigue viéndose, con su cierre y con sus botones de propuesta si
   los tenía.
5. **Nada se cambia solo.** Mientras no toques el botón, tu dieta y tu tabla
   siguen intactas.
6. Al tocarlo, se pide la semana **con las instrucciones que salen de la
   consulta** (lo que la IA acaba de concluir), sin que tengas que escribirlas.
7. Mientras se genera, el botón se deshabilita y se ve que está trabajando.
8. Cuando llega, sustituye tu semana igual que si la hubieras pedido desde
   Comidas o Ejercicio, y te lleva a verla.
9. **Gasta del cupo diario de dietas o de tablas** (2 al día, spec 027), no del
   de consultas.
10. Si no te queda cupo de ese tipo hoy, el botón lo dice y no se puede pulsar.
11. Si falla la generación, sale el error de siempre y **tu semana anterior
    sigue intacta**.

## 3. Alcance

### Entra

- **Que el hilo de la última consulta terminada se siga viendo al volver a
  entrar en Consulta, aunque se haya recargado la página.** Hoy no: depende de
  `consultaReciénTerminada`, una variable en memoria que se pierde al recargar.
  Entra aquí porque sin esto la propuesta no sobrevive a un F5 y los dos casos
  límite de esta spec ("sigue ahí mañana") serían mentira.
- Que el cierre de la consulta pueda venir con una propuesta de dieta y/o de
  tabla, con las instrucciones ya escritas.
- Los botones de aceptar debajo del cierre, con su cupo y sus errores.
- Reutilizar el camino de generación que ya existe (`api/dieta.js`,
  `api/tabla.js`) sin duplicarlo.

### NO entra (explícitamente fuera)

- **Sustituir la dieta o la tabla sin confirmación.** Decidido en contra
  (sección 8).
- **Que la consulta genere la semana ella misma.** Solo escribe las
  instrucciones; la semana la hace quien ya la hace.
- **Cambiar el cupo de dietas y tablas.**
- **Proponer recetas o ejercicios sueltos del catálogo.**
- **Guardar un histórico de propuestas rechazadas.**
- **Poder releer consultas anteriores a la última.** Se enseña el hilo de **la
  última** consulta terminada, no un archivo de todas. Eso sigue en el backlog.

## 4. Comportamiento detallado

### El hilo que se queda (`js/app.js`)

`pintarEstadoConsulta()` pinta hoy `pintarHilo(consultaAbierta || terminada)`,
donde `terminada` sale de buscar `consultaReciénTerminada` en
`consultasCargadas`. Esa variable vive en memoria y se pierde al recargar, así
que el cierre que la spec 044 dejó "al final de la conversación" solo se lee
mientras no cierres la pestaña.

Pasa a haber dos cosas distintas, y conviene no confundirlas:

- `consultaReciénTerminada` **se queda**, y sigue decidiendo el mensaje de
  "Consulta terminada…" y el botón "Empezar otra consulta" (spec 045: recién
  terminada manda sobre el contador). Eso es un estado de sesión y está bien
  que lo sea.
- **Qué hilo se pinta** deja de depender de ella: se pinta el de la **última
  consulta terminada** que haya en `consultasCargadas`, que ya se leen enteras
  de Firestore. Una función `ultimaTerminada(consultas)` hermana de
  `ultimaRevision()` (spec 045) — de hecho `ultimaRevision()` ya devuelve
  exactamente eso, así que se reutiliza en vez de escribir otra.

Con una consulta **en curso** manda ella, como hasta ahora.

### Lo que la IA devuelve (`api/consulta.js`)

Al cerrar, además de `cierre`, la propuesta. **Se reaprovechan `nutricion` y
`ejercicio`**, los dos campos que la 044 dejó en el esquema vacíos a propósito
para esto (está escrito en su comentario). No se añaden campos nuevos: el
esquema no crece, solo cambia lo que significan esos dos y las instrucciones
que los rellenan. Ya no son un plan; son las **instrucciones** para pedir la
semana.

- `nutricion` → instrucciones para la **dieta**.
- `ejercicio` → instrucciones para la **tabla**.

- Vacío = sin propuesta. Con texto = propuesta, y ese texto son las
  instrucciones.
- Todos los campos siguen yendo como `required`, vacíos cuando no aplican
  (regla del proyecto: con campos opcionales Gemini se los salta).
- Las instrucciones del modo revisión dicen cuándo proponer: solo si de verdad
  toca, no en cada consulta.

### Aceptar (`js/app.js`)

Los botones se pintan bajo el último mensaje si la consulta terminada trae
propuesta. Al pulsar, llaman **al mismo camino que ya usa "Pedírsela a la IA"**
de Comidas y Ejercicio, pasándole las instrucciones de la propuesta, con su
cupo (`quedanPlanesHoy()`) y su `guardarMarcaDePlan()`.

**Trampa heredada de la spec 044:** esas funciones se llaman "planes" por el
nombre de la colección donde escriben las marcas de cupo, y no tienen nada que
ver con los planes retirados. Son las que hay que usar.

Al terminar, se navega a Comidas → Mi dieta (o Ejercicio → Mi tabla) con
`abrirPestana(seccion, subseccion)`, que ya acepta sub-pestaña.

## 5. Modelo de datos

- La propuesta se guarda en el documento de consulta, en dos campos nuevos:
  **`propuestaDieta`** y **`propuestaTabla`** (cadena vacía = sin propuesta).
  Nombres propios y no `nutricion`/`ejercicio`: en el documento guardado no hay
  ninguna razón para arrastrar unos nombres que ya engañaron una vez. Los del
  esquema de la IA se quedan como están porque cambiarlos obligaría a tocar el
  esquema, que es lo que se quería evitar.
- Los `mensajes` no cambian de forma: la propuesta va aparte, no dentro del
  hilo.
- La semana generada se guarda donde se guarda hoy (`dietas` / `tablas`), sin
  cambios.
- `firestore.rules` no se toca.

## 6. Casos límite

- **Cupo agotado.** El botón lo dice y no se puede pulsar. La propuesta no se
  pierde: sigue ahí mañana.
- **Aceptar dos veces.** El botón se deshabilita al pulsar; y aunque se
  colara, generaría otra semana, que es lo mismo que pedirla dos veces a mano.
- **Cancelar el "¿la sustituyo?".** `generarDieta()`/`generarTabla()` preguntan
  antes de pisar una semana que ya existe, y si cancelas **vuelven sin lanzar
  ningún error**. Eso no es un éxito: no hay semana nueva, así que no se navega
  a ninguna parte y el botón tiene que quedar otra vez pulsable. Se resuelve
  haciendo que esas dos funciones devuelvan si generaron algo, y rehabilitando
  el botón en el `finally` y no solo en el `catch`.
- **El cierre de la entrevista de bienvenida no se ve como hilo persistente.**
  El hilo que se enseña es el de la última **revisión**, y la entrevista de
  bienvenida no lo es. Aceptado: la entrevista deja sus resultados en Ajustes y
  en la operación recién abierta, que es donde se miran.
- **Fallo de la IA al generar.** La semana anterior sigue intacta, porque solo
  se sustituye cuando la nueva llega entera. Es como funciona hoy.
- **Consulta vieja con propuesta ya aceptada.** No se guarda que se aceptó, así
  que el botón sigue ahí. Aceptado: pulsarlo otra vez es pedir otra semana.
- **La IA propone siempre.** Es el riesgo real de esta spec. Si al probarla
  propone en cada consulta, hay que apretar las instrucciones, no añadir
  código.
- **Sin operación en marcha al aceptar.** Si finalizas la operación entre que
  se genera la propuesta y que la aceptas, el botón no debe dejarte pedir:
  `generarDieta()`/`generarTabla()` **no** comprueban `hayOperacion` (quien lo
  hace hoy es `pintarEspecializadas()`, que deshabilita su botón). Aquí hay que
  comprobarlo igual antes de pedir.
- **Recargar la página con una propuesta pendiente.** Es el caso que obligó a
  meter el hilo persistente en esta spec: al volver a entrar en Consulta,
  el hilo de la última consulta terminada y sus botones tienen que seguir ahí.

## 7. Archivos afectados

| Archivo | Qué cambia |
|---|---|
| `api/consulta.js` | Campos de propuesta y cuándo proponer. |
| `js/consulta.js` | Guardar `propuestaDieta`/`propuestaTabla` con el cierre. |
| `js/app.js` | El hilo persistente, los botones de aceptar y el enganche con `generarDieta()`/`generarTabla()`. |
| `index.html` | El contenedor de los botones de propuesta bajo el hilo. |
| `docs/PRODUCTO.md` | Ya actualizado. |

Tamaño estimado: ~220 líneas.

## 8. Decisiones tomadas

- **Propone y tú aceptas; nunca sustituye sola.** Confirmado por el usuario el
  22 de agosto. Perder la semana que tenías sin decidirlo es el tipo de cosa
  que hace desconfiar de una app, y la dieta se puede haber editado a mano.
- **La consulta no genera la semana: escribe las instrucciones.** Así hay un
  solo camino de generación de dietas y tablas, el que ya está probado, en vez
  de dos que se van separando.
- **Gasta del cupo de dietas/tablas, no del de consultas.** Es una dieta: da
  igual desde dónde se pida.
- **El hilo de la última consulta terminada se queda siempre.** Confirmado por
  el usuario el 23 de agosto, al descubrirse que hoy desaparece al recargar.
  Sin esto, la 044 promete un cierre "que se lee en la conversación" que se
  esfuma con un F5, y la propuesta de esta spec no sobreviviría a cerrar la
  pestaña. Se enseña **la última**, no un archivo de todas: releer consultas
  antiguas sigue en el backlog.
- **Se reaprovechan `nutricion` y `ejercicio` del esquema de la IA**, en vez de
  añadir dos campos nuevos. La spec 044 los dejó vacíos justamente para esto y
  lo dejó escrito en el código. En el documento guardado en Firestore sí llevan
  nombres propios (`propuestaDieta`, `propuestaTabla`): ahí no hay esquema que
  respetar y arrastrar los nombres viejos solo volvería a confundir.

## 9. Fuera de spec: ideas apuntadas

- Ver la semana propuesta antes de aceptarla.
- Que la consulta pueda proponer también retocar el objetivo de peso o la fecha
  objetivo de Ajustes.

## ✅ Para probar a mano

En producción (https://operacion-bikini.vercel.app), con una operación en
marcha. **Pasar consulta gasta cupo de IA, y aceptar una propuesta gasta del
cupo de dietas o de tablas.**

### El hilo que ya no se pierde (arreglo de la 044)

1. Pasa una consulta entera hasta que la IA cierre. El cierre se lee al final
   del hilo.
2. **Recarga la página (F5)** y vuelve a **Consulta**. El hilo de esa consulta
   **sigue ahí**, con su cierre. Antes de esta spec desaparecía: esto es lo
   primero que hay que comprobar.
3. Al recargar, el mensaje vuelve a ser el contador ("Última consulta: hoy…"),
   no "Consulta terminada…". Es lo correcto: lo de "recién terminada" es de la
   sesión en la que la pasaste.

### La propuesta

4. Si esa consulta te ha propuesto cambiar la dieta, debajo del hilo hay un
   botón **"Pedir esa dieta"** (y/o **"Pedir esa tabla"**).
5. **Puede que no proponga nada, y eso es lo normal**: solo debería proponer si
   hay un motivo claro (estancamiento, aburrimiento, cambio de material,
   lesión). Si te propone algo en **todas** las consultas, avísame: hay que
   apretar las instrucciones.
6. **Antes de tocar el botón**, ve a **Comidas → Mi dieta** y comprueba que tu
   semana sigue **exactamente igual**. La consulta propone, no sustituye.
7. Vuelve y toca **"Pedir esa dieta"**. Si ya tenías dieta, te pregunta si la
   sustituye:
   - **Dale a Cancelar.** No debe pasar nada: no te lleva a Comidas, tu dieta
     sigue como estaba, y **el botón se puede volver a pulsar**. Esto es lo que
     estaba roto y quiero que lo compruebes.
   - Vuelve a pulsarlo y ahora **acepta**. Sale "Pensando…", y al terminar te
     lleva a **Comidas → Mi dieta** con la semana nueva.
8. La semana nueva tiene que responder a lo que hablasteis en la consulta, no
   ser una dieta genérica.
9. Vuelve a **Consulta**: el botón sigue ahí (no se guarda que lo aceptaste).
   Pulsarlo otra vez es pedir otra semana, y eso está aceptado.

### El cupo

10. Aceptar una propuesta **gasta del cupo de dietas o tablas**, no del de
    consultas. Compruébalo en **Comidas → Mi dieta → "Pedírsela a la IA"**: el
    número de las que te quedan hoy ha bajado.
11. Gasta las dos dietas del día. Vuelve a Consulta: el botón **"Pedir esa
    dieta"** tiene que estar **deshabilitado**, con el aviso de que ya has
    pedido 2 hoy y de que la propuesta sigue ahí mañana.
12. El de la tabla lleva su propio cupo: no debe deshabilitarse por haber
    gastado el de dietas.

### Que no se haya roto nada

13. **Con una consulta a medias** (empieza una y no la termines) no debe salir
    ningún botón de propuesta.
14. **Comidas → Mi dieta → "Pedírsela a la IA"** y **Ejercicio → Mi tabla**
    siguen funcionando a mano, con las instrucciones precargadas (spec 040).
15. La **conversación** de abajo sigue igual.
16. **La entrevista de bienvenida no propone nada**: si cierras la operación y
    la vuelves a hacer, al terminar no debe salir ningún botón de propuesta.
    Su cierre tampoco se queda como hilo persistente, y es a propósito.
