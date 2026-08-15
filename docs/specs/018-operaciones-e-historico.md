# 018 — Operaciones con principio y fin, e histórico

- **Estado:** revisada. Se avisó al usuario de que son ~600 líneas y se le propuso partirla en 018 (operaciones) y 019 (histórico); decidió el 2026-08-15 hacerla entera de una. También se le avisó de que, al mover los documentos de verdad, lo archivado no se podrá editar nunca más.
- **Fecha:** 2026-08-14
- **Referencia en PRODUCTO.md:** apartado "Ampliación de la v2" — pendiente de añadir el concepto de operación (ver apartado 8).

## 1. Objetivo

Que la app deje de ser un flujo infinito y pase a tener ciclos: una **operación** empieza con la entrevista, dura lo que dure, y se cierra desde Ajustes. Al cerrarla, todo lo apuntado se archiva y la app vuelve a ofrecer "Iniciar operación bikini".

## 2. Criterio de "esto funciona"

1. Con la app vacía, **"Hoy"** enseña un botón grande **"Iniciar operación bikini"** y una explicación. No hay resumen ni calendario.
2. Sin operación activa, las pestañas **Peso, Comidas y Ejercicio** no dejan apuntar: cada una avisa de que primero hay que iniciar la operación. **Ajustes** sí funciona.
3. Pulsar el botón arranca la entrevista de bienvenida (spec 016) en la pestaña Consulta.
4. Al **terminar** la entrevista, la operación queda activa: "Hoy" pasa a su aspecto normal y ya se puede apuntar en las tres pestañas.
5. Si la entrevista se **abandona**, no se crea ninguna operación y todo sigue como estaba.
6. En **Ajustes** hay un botón **"Finalizar operación bikini"**, con confirmación.
7. Al finalizar: todos los pesajes, comidas, ejercicios, fotos, consejos, consultas y planes se **mueven al archivo** de esa operación. Las pantallas del día a día quedan vacías y vuelve el botón de iniciar.
8. En **Ajustes → Histórico** aparece una tarjeta por operación cerrada, con sus fechas, peso inicial y final, kilos y días registrados.
9. Al abrir una operación del histórico se ven su gráfica y sus registros, **en solo lectura**: no se puede editar ni borrar nada.
10. La **segunda** operación arranca con una entrevista **más corta**: la IA conserva tu perfil y solo pregunta peso actual, nuevo objetivo, plazo y qué ha cambiado.
11. Si el archivado falla a media (por ejemplo, se corta la conexión), sale un error y un botón de **reintentar** que continúa donde se quedó, **sin perder ni duplicar nada**.
12. La **foto de perfil**, el nombre y el perfil de la IA **sobreviven** a finalizar una operación.

## 3. Alcance

### Entra

- **Concepto de operación**: documento con fecha de inicio, fecha de fin y estado (`activa` o `archivada`).
- **Puerta de entrada**: sin operación activa, la app solo deja iniciar una (y entrar en Ajustes).
- **Creación de la operación** al terminar la entrevista inicial.
- **"Finalizar operación bikini"** en Ajustes, con confirmación de dos pasos.
- **Archivado real** de los registros a subcolecciones de la operación, por lotes y reanudable.
- **Histórico** en Ajustes: lista de operaciones cerradas con su resumen, y vista de solo lectura de cada una.
- **Entrevista más corta** a partir de la segunda operación.
- **Reglas de Firestore** para las colecciones nuevas.

### NO entra (explícitamente fuera)

- **Comparar operaciones entre sí** ("en la primera perdiste más que en la segunda").
- **Reabrir** una operación archivada.
- **Borrar** una operación del histórico. El reinicio de datos de la spec 006 se queda como está y no toca el archivo.
- **Editar** nada dentro del histórico.
- **Gráfica que cruce varias operaciones**: cada una tiene la suya.
- **Cambiar la gamificación ni el detalle nutricional**: no existen todavía.

## 4. Comportamiento detallado

### La operación

`usuarios/{uid}/operaciones/{opId}`:

| Campo | Qué es |
|---|---|
| `estado` | `"activa"` o `"archivada"` |
| `inicio` | fecha `AAAA-MM-DD` en que terminó la entrevista |
| `fin` | fecha de cierre, o ausente |
| `numero` | 1, 2, 3… para titular las tarjetas del histórico |
| `resumen` | pesos y recuentos, calculados al archivar (ver abajo) |
| `archivando` | qué colecciones faltan por mover; ausente cuando terminó |

Solo puede haber **una activa** a la vez.

### Sin operación activa

- **"Hoy"** enseña el botón "Iniciar operación bikini" y la explicación. Nada más: ni resumen, ni atajos, ni calendario.
- **Peso, Comidas y Ejercicio**: en lugar de su formulario y su lista, un aviso — `Primero inicia tu operación bikini desde Hoy.` — y un botón que lleva a "Hoy".
- **Consulta**: se puede usar para la entrevista inicial. Las consultas especializadas (spec 017) no, hasta que haya operación.
- **Consejos y Fotos**: mismo aviso que Peso.
- **Ajustes**: funciona entero, incluido el histórico.

### Iniciar

- El botón de "Hoy" lleva a Consulta y arranca la entrevista de bienvenida.
- **La operación se crea cuando la entrevista termina**, no al empezarla: una entrevista abandonada no deja una operación coja.
- `numero` es el número de operaciones que ya existían más uno.

### Finalizar

En Ajustes, dentro de su propio bloque (no en la zona de peligro: esto no destruye nada):

1. Botón **"Finalizar operación bikini"**.
2. Al pulsarlo, aparece el aviso de qué va a pasar —que todo se archiva y las pantallas quedan a cero— y dos botones: **Sí, finalizar** y **Cancelar**.
3. Al confirmar: se calcula el resumen, se marca la operación como archivada y empieza el archivado.
4. Mientras: `Archivando… (pesajes)`, con los botones deshabilitados.
5. Al terminar: `Operación finalizada.` y la app vuelve al estado inicial.

### El archivado, en detalle

Para cada colección (`pesajes`, `comidas`, `ejercicios`, `consejos`, `consultas`, `planes`, `fotos`):

- Se leen sus documentos y se procesan **en lotes de 200**.
- Cada lote es un `writeBatch` que hace, **en la misma operación atómica**: `set` del documento en `usuarios/{uid}/operaciones/{opId}/{coleccion}/{docId}` y `delete` del original.
- Así ningún documento se borra sin estar ya copiado: si el lote falla, no se ha movido nada de ese lote.
- Al terminar cada colección, se quita de la lista `archivando` de la operación.
- Si algo falla, la operación se queda con las colecciones pendientes anotadas y el botón **Reintentar** continúa por donde iba. Los documentos ya movidos no se vuelven a tocar.
- **Las fotos de Cloudinary no se tocan**: solo se mueve su documento de Firestore, que conserva `url` y `publicId`. Siguen viéndose desde el histórico.

### El resumen

Se calcula **antes** de mover nada, con los pesajes de la operación:

| Campo | Qué es |
|---|---|
| `pesoInicial` | primer pesaje |
| `pesoFinal` | último pesaje |
| `diasRegistrados` | días distintos con algún registro de cualquier tipo |
| `registros` | cuántos registros en total |

Si no hubo pesajes, `pesoInicial` y `pesoFinal` quedan a `null` y la tarjeta lo dice.

### El histórico

- En Ajustes, bloque **Histórico** con una tarjeta por operación archivada, de más reciente a más antigua.
- Cada tarjeta: `Operación 1 · 15/07/2026 → 14/08/2026`, los kilos (`−3,2 kg`), el peso inicial y final, y `28 días registrados`.
- Botón **Ver** que abre una pantalla de solo lectura con la gráfica de esa operación y sus registros, agrupados por tipo. Sin botones de editar ni borrar.
- Botón **Volver** para salir de esa vista.

### La segunda entrevista

- Si ya hay operaciones archivadas, la entrevista se pide con `modo: "reinicio"`: la IA conserva el perfil y solo pregunta peso actual, nuevo objetivo, plazo y qué ha cambiado desde la última vez.
- Al terminar, actualiza el perfil con lo nuevo, sin borrar lo anterior.

## 5. Modelo de datos

| Ruta | Cambio |
|---|---|
| `usuarios/{uid}/operaciones/{opId}` | **nueva** |
| `usuarios/{uid}/operaciones/{opId}/{pesajes,comidas,ejercicios,consejos,consultas,planes,fotos}/{id}` | **nuevas**, copia de los registros archivados |

**`firestore.rules` sí cambia**: hay que permitir lectura y escritura al dueño en las rutas nuevas. Sin eso, el archivado falla con error de permisos. Se publican con la CLI **antes** de que el usuario pruebe.

## 6. Casos límite

- **Archivado interrumpido**: la operación queda `archivada` con colecciones pendientes; el botón Reintentar sigue. Mientras tanto, la app ya considera que no hay operación activa, así que el usuario puede iniciar otra. Los registros pendientes de mover **no** aparecen en el día a día porque la vista solo enseña lo que hay tras la última operación activa. Se acepta.
- **Cero registros al finalizar**: se archiva igual, con resumen vacío.
- **Finalizar sin haber iniciado**: el botón no aparece.
- **Dos pestañas abiertas** archivando a la vez: los lotes son idempotentes (`set` sobre el mismo id) y el borrado de algo ya borrado no falla. Puede salir un error de lectura, y el reintento lo arregla.
- **Muchos registros** (un año, ~1500): son ocho lotes por colección. Tarda unos segundos y se ve el progreso.
- **La foto de perfil, el nombre y el perfil de la IA** viven en `usuarios/{uid}`, que no se toca: sobreviven.
- **Reinicio de datos (spec 006)** con operaciones archivadas: borra lo del día a día, **no el archivo**. Queda anotado en el aviso de esa pantalla.

## 7. Archivos afectados

| Archivo | Cambio |
|---|---|
| `js/operaciones.js` | **nuevo**. Crear, listar, resumir, archivar por lotes y leer una operación archivada |
| `js/consulta.js` | crear la operación al terminar la entrevista; modo `reinicio` |
| `api/consulta.js` | instrucciones del modo `reinicio` |
| `js/app.js` | puerta de entrada, bloqueo de pestañas, finalizar, histórico y vista de solo lectura |
| `index.html` | bloque de inicio en "Hoy", avisos de bloqueo, finalizar e histórico en Ajustes |
| `styles.css` | tarjetas del histórico y bloque de inicio |
| `firestore.rules` | reglas de las colecciones nuevas |

**Estimación: ~600 líneas.** Muy por encima del límite de 300 de `CLAUDE.md`. **Propongo partirla en dos specs** (ver abajo), pero la decisión es del usuario.

## 8. Decisiones tomadas

- **Archivado real, moviendo los documentos** → decisión del usuario el 2026-08-14, sabiendo que son cientos de escrituras y que la alternativa (una operación como tramo de fechas) era instantánea y sin riesgo.
- **Lotes de 200 con copia y borrado en la misma transacción** → decisión técnica para que un fallo a media no pueda perder registros.
- **Sin operación activa, la app no deja apuntar** → decisión del usuario: "solo el botón, nada más".
- **La operación se crea al terminar la entrevista, no al empezarla** → una entrevista abandonada no debe dejar una operación vacía.
- **El perfil se conserva entre operaciones** → decisión del usuario: la segunda entrevista es más corta.
- **El histórico enseña resumen y datos completos** → decisión del usuario.

## 9. Fuera de spec: ideas apuntadas

- Comparar dos operaciones entre sí. → `docs/BACKLOG.md`
- Reabrir o borrar una operación archivada. → `docs/BACKLOG.md`

## ✅ Para probar a mano

Guion de prueba manual (lo rellena/afina el agente `qa-manual` antes de la prueba).
