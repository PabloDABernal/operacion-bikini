# 098 — Lo que toca ahora: el plan del momento, en Apuntar

- **Estado:** ✅ completada, probada por el usuario en producción el 6 de septiembre de 2026
- **Fecha:** 2026-09-06
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v16: registrar en un toque)", primer punto

## 1. Objetivo

En Comidas → Apuntar, arriba del todo, ver lo que la dieta guardada dice para
el momento del día en el que estás, con su botón de "me lo he comido" y su
receta. Apuntar lo planeado deja de obligar a cambiar de sub-pestaña.

## 2. Criterio de "esto funciona"

1. Con una dieta guardada que tenga platos en el día de hoy, entro en Comidas →
   Apuntar. Arriba del todo, antes de "Nueva comida", veo un bloque con el
   momento que toca (por ejemplo "Comida") y el plato que pone mi dieta para
   hoy en ese momento.
2. El bloque enseña **una sola comida**: la de la franja más cercana a la hora
   que es (franjas de la spec 097: desayuno 9:00, comida 14:00, merienda 18:00,
   cena 21:30). A las 11:00 enseña el desayuno; a las 12:00, la comida.
3. Pulso "Me lo he comido" en ese bloque. Se guarda igual que desde Mi dieta:
   con las recetas enlazadas, y con la fecha y hora que manda la spec 097.
4. El bloque se refresca solo y ahora dice que esa comida **ya está apuntada
   hoy**.
5. Vuelvo a pulsar el botón: pregunta "¿lo apunto otra vez?" como hasta ahora
   (spec 094), y si acepto lo apunta de nuevo.
6. Si el plato tiene receta, el bloque tiene el icono de receta. Lo toco y la
   receta se despliega ahí mismo, con sus ingredientes marcados según mi
   despensa. Lo vuelvo a tocar y se cierra.
7. Bajo a "Lo que llevo apuntado" y veo el registro recién guardado, con su
   fecha y hora correctas.
8. Sin dieta guardada (o con el plato de ese momento vacío), el bloque enseña
   una línea diciendo que no hay nada planeado para ese momento, y un atajo que
   lleva a Mi dieta.
9. Voy a Mi dieta: sigue funcionando exactamente igual que antes de esta spec,
   con su tira de días, sus botones y sus recetas.

## 3. Alcance

### Entra
- Bloque nuevo al principio de la sub-pestaña Apuntar de Comidas.
- Enseña **una** comida: la del momento cuya franja fija está más cerca de la
  hora actual, entre las cuatro franjas de hoy.
- Contenido del bloque: etiqueta del momento, texto del plato, botón "Me lo he
  comido" e icono de receta (si el plato tiene recetas que sigan existiendo).
- Marca de "ya lo tienes apuntado hoy" cuando corresponda, sin impedir
  repetir.
- Estado vacío con atajo a Mi dieta.
- El guardado usa exactamente el mismo camino que Mi dieta (`apuntarDeLaDieta`,
  con el índice del día de hoy), incluidas la fecha/hora de la spec 097 y el
  aviso de repetido de la spec 094.

### NO entra (explícitamente fuera)
- **No se puede editar el plan desde el bloque.** Cambiar lo que pone la dieta
  se sigue haciendo en Mi dieta.
- **No enseña el resto del día** ni los otros momentos: una sola comida, la que
  toca. Ver el día entero es lo que hace Mi dieta.
- **No marca en Mi dieta lo cumplido.** Esta marca vive solo en el bloque
  nuevo; la semana de Mi dieta se queda como está (decisión del usuario del 6
  de septiembre, coherente con `PRODUCTO.md`).
- **No toca el formulario "Nueva comida"** ni los tres modos de apuntar: eso es
  la spec 099.
- **No cambia el momento que propone el formulario**: eso es la spec 100.
- **No toca la tabla de ejercicio** ni su equivalente.

## 4. Comportamiento detallado

**Dónde va.** Dentro de `<div class="subseccion" data-subseccion="apuntar">` de
Comidas, como primer hijo, por delante de los dos `<div class="columna">` que
ya hay ahí (altas, y "Lo que llevo apuntado"). **Corrección sobre el CSS real**:
en escritorio, Apuntar no se reparte en dos columnas propias — es una sola
columna (la 1 de la rejilla de tres columnas de Comidas, spec 079/085); las
dos `.columna` de dentro se apilan igual que en móvil, y son las tres
sub-pestañas de Comidas las que se ven a la vez, no un split interno de
Apuntar. Poniendo el bloque como primer hijo, sale arriba del todo y a lo
ancho de esa columna tanto en móvil como en escritorio, sin CSS adicional de
maquetación.

**Qué momento se enseña.** El de la franja fija de hoy más cercana a la hora
actual, en valor absoluto (da igual que ya haya pasado o que esté por llegar):

| Hora | Momento que sale | Por qué |
|---|---|---|
| 03:00 | Desayuno | De madrugada, la franja de hoy más cercana sigue siendo la de las 9:00 |
| 07:00 | Desayuno | 2 h para las 9:00; lo demás, más lejos |
| 11:00 | Desayuno | 2 h desde las 9:00 < 3 h hasta las 14:00 |
| 12:00 | Comida | 3 h desde las 9:00 > 2 h hasta las 14:00 |
| 20:00 | Cena | 1 h 30 hasta las 21:30 < 2 h desde las 18:00 |
| 23:30 | Cena | Solo se miran las franjas de hoy |

En un empate exacto (por ejemplo las 11:30, a 2 h 30 de las 9:00 y de las
14:00) gana **la que todavía no ha llegado**. Es una convención para que el
cálculo sea determinista, no una decisión de producto.

**Contenido del bloque, con plan:**
- Etiqueta del momento ("Desayuno", "Comida", "Merienda", "Cena").
- El texto del plato tal cual está en la dieta. Si es largo, se comporta como
  en Mi dieta (se despliega al tocarlo, spec 080).
- Botón "Me lo he comido", el mismo icono y comportamiento que en Mi dieta
  (spec 065), con la confirmación en el propio botón (spec 034).
- Icono de receta, solo si el plato tiene alguna receta enlazada que siga
  existiendo. Al tocarlo despliega la receta debajo, con sus ingredientes
  cruzados con la despensa, igual que en Mi dieta (specs 060 y 059). Incluido
  su botón "Editar" (spec 083), con la vuelta corregida: ver más abajo.

**Editar una receta desde el bloque vuelve a Apuntar.** La receta desplegada
trae desde la spec 083 un botón "Editar" que lleva al editor del Recetario y,
al guardar o cancelar, vuelve a Mi dieta —siempre, porque la variable que lo
gobierna solo sabe volver ahí—. Se parametriza el destino de vuelta: si la
edición empezó en el bloque de Apuntar, al guardar o cancelar se vuelve a
**Apuntar**; si empezó en Mi dieta, se sigue volviendo a **Mi dieta**, sin
cambio respecto a hoy. Al volver a Apuntar, el bloque se repinta igual que Mi
dieta se repinta al volver a ella, para que un cambio en la receta (nombre,
raciones, preparación) se vea sin más pasos. La receta queda **desplegada**
tras volver, igual que hace Mi dieta hoy.

**Los errores y avisos del bloque son suyos.** `apuntarDeLaDieta()` escribe hoy
sus errores en `#error-semana` y sus confirmaciones con
`avisarGuardado("guardado-dieta", …)`, y los dos elementos viven dentro de la
sub-pestaña Mi dieta, que está oculta mientras se está en Apuntar. Se
parametriza a qué par de elementos escribe, y el bloque nuevo tiene los suyos
propios; Mi dieta se queda exactamente como está. Sin esto, un fallo de
guardado desde el bloque sería invisible.
- Si esa comida ya está apuntada hoy (mismo momento y mismo texto, con la
  comparación que ya hace `yaApuntada`), el bloque lo dice con un texto corto.
  El botón sigue activo.

**Contenido del bloque, sin plan** (no hay dieta guardada, o el plato de ese
momento está vacío): una línea explicando que no hay nada planeado para ese
momento, y un botón/atajo que lleva a Comidas → Mi dieta.

**Después de apuntar**, el bloque se repinta para que aparezca la marca de "ya
apuntado", y el diario de comidas se refresca como ya hace hoy.

## 5. Modelo de datos

Ninguno nuevo. El bloque lee la dieta activa y las comidas ya cargadas, y
escribe por el mismo camino que Mi dieta (`guardarComida`). No estrena
colección ni campo, así que **las reglas de Firestore no se tocan**.

## 6. Casos límite

- **No hay operación en marcha**: Comidas ya no deja apuntar nada; el bloque no
  se pinta, como el resto de la pantalla.
- **La dieta guardada tiene menos de siete días** (semanas viejas): si el día de
  hoy no existe en ella, se trata como "sin plan".
- **El plato tiene receta enlazada que ya se borró**: no sale el icono, igual
  que en Mi dieta.
- **Se cambia de día con la app abierta** (medianoche): el bloque se repinta al
  volver a entrar en la sección, como el resto de la app. No se vigila el reloj
  en segundo plano.
- **Se apunta desde el bloque y luego se va a Mi dieta**: el registro está en el
  diario; Mi dieta no cambia de aspecto, porque no marca lo cumplido.
- **Sin conexión**: mismo comportamiento que Mi dieta — el botón responde con
  "no se ha guardado" y el mensaje de error del bloque.

## 7. Archivos afectados

- `index.html`: el bloque nuevo al principio de la sub-pestaña Apuntar, con sus
  párrafos de error y de guardado.
- `js/app.js`: pintar el bloque, elegir el momento, reutilizar
  `apuntarDeLaDieta()` (que ya recibe el índice del día desde la spec 097) y
  `recetaDesplegada()`; repintar tras apuntar.
- `js/comidas.js`: función pura nueva para elegir el momento más cercano a una
  hora dada.
- `styles.css`: el bloque.
- `docs/specs/098-...-casos.mjs`: casos de la función del momento.

**Tres trampas conocidas**, todas de estado global compartido con Mi dieta:

1. La receta desplegada de Mi dieta se guarda en una variable global indexada
   por `"indiceDia-indiceComida"` y la usa `pintarDieta()`. El bloque nuevo
   necesita **su propia variable** de "receta abierta", o abrir la receta en un
   sitio la abriría en el otro.
2. `volverAMiDietaTrasEditar` (spec 083) solo sabe volver a Mi dieta. Pasa a
   guardar **a dónde** hay que volver, no solo que hay que volver.
3. `apuntarDeLaDieta()` tiene los ids de sus elementos de error y aviso escritos
   dentro. Pasan a ser parámetros.

**Tamaño estimado**: en torno a 250 líneas contando el HTML, el CSS y los casos
de prueba. Cabe en una rebanada; si al implementarla se pasa de ~300, se avisa
antes de seguir.

## 8. Decisiones tomadas

- **Se enseña la franja más cercana**, no la ya empezada ni el día entero.
  Decisión del usuario: a las 11:00 lo que interesa es el desayuno que acabas
  de tomarte; a las 12:00, la comida que viene.
- **Ya apuntado se dice, pero se deja repetir.** Decisión del usuario. Repetir
  plato puede ser verdad, y ya hay un aviso para no duplicar por error.
- **Sin plan se enseña un texto con atajo a Mi dieta**, en vez de esconder el
  bloque. Decisión del usuario: enseña dónde se arregla.
- **Se puede ver la receta desde el bloque**, no solo apuntar. Decisión del
  usuario.
- **El empate exacto entre dos franjas lo gana la que aún no ha llegado.**
  Convención de implementación para que el resultado sea determinista.
- **Editar una receta desde el bloque devuelve a Apuntar**, no a Mi dieta.
  Decisión del usuario del 6 de septiembre, sobre un bloqueante que encontró
  `revisor-specs`: la vuelta estaba clavada a Mi dieta desde la spec 083.
- **El bloque va arriba del todo, a lo ancho de la columna de Apuntar.**
  Decisión del usuario, pedida como "ancho completo, por encima de las dos
  columnas"; al comprobar el CSS real (sección 4) resultó que Apuntar no tiene
  dos columnas propias en escritorio, así que se resuelve poniéndolo como
  primer hijo de la sub-pestaña, sin maquetación nueva.

## 9. Fuera de spec: ideas apuntadas

- La vista de receta para cocinar (ingredientes en tabla, pasos, raciones
  escalables) y los filtros del Recetario ("puedo hacerla ya", "las de mi
  dieta", "las que más repito") quedan anotados en `PRODUCTO.md`, dentro de lo
  que la v16 explícitamente no hace.

## ✅ Para probar a mano

(la rellena/afina el agente `qa-manual` antes de la prueba)
