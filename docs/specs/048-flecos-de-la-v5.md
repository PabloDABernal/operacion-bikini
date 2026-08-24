# 048 — Los flecos que dejó la v5

- **Estado:** ✅ completada. Probada y confirmada por el usuario el 24 de agosto de 2026.
- **Fecha:** 2026-08-23
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v5…)", punto **"Los planes desaparecen como concepto"**. No hay cambio de producto: PRODUCTO.md ya dice lo que debe pasar y el código no lo cumple en dos sitios.

## 1. Objetivo

Salen de la auditoría de coherencia del 23 de agosto, la primera desde la spec
040. La v5 retiró los planes, pero quedaron dos sitios sin recorrer:

1. **La pantalla "Hoy", sin operación en marcha**, sigue prometiendo que la
   entrevista "te pondrá un plan". La spec 047 arregló ese texto en Consulta,
   pero este vive en otro sitio y ninguna de las specs 044-047 pasó por él.
2. **El aviso legal del pie** sigue diciendo "los consejos y **planes** de esta
   app los genera una inteligencia artificial". Lo encontró `revisor-codigo`
   mientras revisaba los dos primeros, que es exactamente el patrón que motivó
   esta spec.
3. **El histórico de una operación archivada** sigue pintando un bloque
   titulado "planes" con su contenido, cuando `docs/PRODUCTO.md` dice que los
   planes guardados "dejan de enseñarse". Y además lo pinta mal: en esa
   colección conviven los planes viejos y las **marcas de cupo** de dietas y
   tablas (spec 027), que no tienen texto, así que cada dieta o tabla que
   pidieras deja en el histórico una tarjeta vacía que pone **"(sin texto)"**.

## 2. Criterio de "esto funciona"

1. En **Hoy**, sin operación en marcha, el texto de "Operación bikini" ya no
   dice que la IA "te pondrá un plan". Explica lo que hace de verdad: te
   entrevista, te conoce y deja tus ajustes listos.
2. En **Ajustes → Operación → Histórico**, al abrir una operación archivada,
   **ya no aparece ningún bloque "planes"**, ni con texto ni con tarjetas
   vacías que digan "(sin texto)".
3. El aviso legal del pie ya no habla de "planes": nombra los consejos, las
   dietas y las tablas de ejercicio. Sigue diciendo lo importante — que lo
   genera una IA, que puede equivocarse y que no sustituye a un profesional.
4. Todo lo demás del histórico sigue igual: el resumen, la gráfica, los
   pesajes, las comidas, los ejercicios, las fotos y los **consejos**.
5. Los documentos archivados **no se borran**: solo dejan de pintarse, igual
   que en la pantalla de Consulta (spec 044).
6. Nada más de la app cambia.

## 3. Alcance

### Entra

- Reescribir el texto de `#bloque-iniciar` en `index.html`.
- Reescribir el aviso legal del pie (`.disclaimer`), que debe nombrar lo que la
  IA genera de verdad hoy: consejos, dietas y tablas de ejercicio.
- Dejar de pintar el bloque "planes" en `abrirArchivo()` de `js/app.js`.

### NO entra (explícitamente fuera)

- **Borrar nada de Firestore.** Ni los planes archivados ni los de la
  colección viva. Misma decisión que la spec 044.
- **Quitar `"planes"` de `COLECCIONES` en `js/operaciones.js`.** Esa lista es
  la que decide qué se archiva al cerrar una operación: sacarla de ahí haría
  que las marcas de cupo de dietas y tablas **no se archivaran**, y el cupo
  cuenta sobre esa colección. Es la trampa de siempre, documentada desde la
  044.
- **Tocar los consejos**, que se pintan en el mismo sitio y siguen valiendo.
- **Rediseñar el histórico.**
- **Sub-pestañas en Consulta**, que sigue apuntada como idea a la espera de
  que el usuario diga si el scroll le molesta (spec 047).

## 4. Comportamiento detallado

### El texto de "Hoy" (`index.html`)

Hoy: *"Empieza con una entrevista: la IA te conocerá, te pondrá un plan y
dejará tus ajustes listos. A partir de ahí ya podrás apuntar."*

Pasa a no mencionar el plan. Lo que la entrevista hace de verdad es conocerte,
dejar tus ajustes rellenos y abrir la operación; la dieta y la tabla se piden
después, cada una en su sitio.

### El histórico (`js/app.js`)

`abrirArchivo()` recorre hoy una lista de dos pares, consejos y planes, y pinta
un bloque por cada uno. Se queda **solo con los consejos**.

El bloque de planes se borra entero, no se filtra por "los que tengan texto":
filtrar dejaría de enseñar las tarjetas vacías pero seguiría enseñando los
planes viejos, que es justo lo que la v5 retiró. Y el comentario que dice
"Consejos y planes: el texto tal cual" deja de ser cierto.

## 5. Modelo de datos

Sin cambios. No se toca Firestore, ni `firestore.rules`, ni la IA, ni qué se
archiva al cerrar una operación.

## 6. Casos límite

- **Operación archivada que solo tenía planes y consejos.** Al abrirla se verá
  el resumen y los consejos, sin el bloque de planes. Correcto.
- **Operación archivada sin consejos ni planes.** El código ya salta los
  bloques vacíos (`if (!documentos.length) return;`), así que no queda un
  titular huérfano.
- **La lista `COLECCIONES` de `js/operaciones.js`.** Sigue incluyendo
  `"planes"` a propósito: se archivan aunque no se pinten. Si alguien la
  "limpia", las marcas de cupo dejan de archivarse.

## 7. Archivos afectados

| Archivo | Qué cambia |
|---|---|
| `index.html` | El texto de `#bloque-iniciar` y el aviso legal del pie. |
| `js/app.js` | `abrirArchivo()` deja de pintar el bloque de planes. |
| `docs/ESTADO.md` | Al terminar. |

No se toca `js/operaciones.js`, ni `firestore.rules`, ni `api/`.

Tamaño estimado: ~25 líneas. Es un arreglo, no una feature.

## 8. Decisiones tomadas

- **El histórico deja de enseñar los planes, no se le cambia el texto a
  PRODUCTO.md.** `docs/PRODUCTO.md` ya dice, desde la v5, que los planes
  guardados "dejan de enseñarse"; el código lo contradecía en una pantalla.
  Manda el documento, que es la regla 1 del proyecto. Además, lo que se ve hoy
  ahí es medio ruido: tarjetas vacías de las marcas de cupo.
- **No se borra nada.** Igual que en la 044: quitar una pantalla es reversible,
  borrar documentos no.
- **Esto no necesitaba cambiar PRODUCTO.md.** Los dos flecos son código que no
  cumplía lo que el documento ya decía.

## 9. Fuera de spec: ideas apuntadas

- Que el histórico de una operación enseñe también su dieta y su tabla de
  entonces, que hoy se archivan pero no se pintan.

## ✅ Para probar a mano

Es un arreglo de textos y de una pantalla; se prueba mirando, no gastando cupo.

1. **Sin operación en marcha** (o justo tras finalizar una), en **Hoy**: el
   texto de "Operación bikini" ya no dice que la IA "te pondrá un plan".
2. **Al final de cualquier pantalla**, el aviso legal habla de "los consejos,
   las dietas y las tablas de ejercicio", no de planes. Y sigue diciendo que lo
   genera una IA y que no sustituye a un médico.
3. **Ajustes → Operación → Histórico**: abre una operación archivada. **No debe
   salir ningún bloque "planes"**, ni con texto ni con tarjetas vacías que
   pongan "(sin texto)". Si tenías dietas pedidas en esa etapa, antes salía una
   tarjeta vacía por cada una.
4. En ese mismo histórico, comprueba que **sí siguen** el resumen, la gráfica,
   los pesajes, las comidas, los ejercicios, las fotos, los **consejos** y la
   línea de cuántas consultas hubo.
