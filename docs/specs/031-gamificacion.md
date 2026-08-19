# 031 — Gamificación: puntos, racha y emblemas

- **Estado:** borrador
- **Fecha:** 2026-08-19
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v2)", punto "Gamificación individual", y "Conceptos clave del dominio" (Racha, Punto, Emblema). Confirmado también en "Qué explícitamente NO hace": sin ranking ni objetivos compartidos entre usuarios.

## 1. Objetivo

En "Hoy", cada usuario ve sus puntos por conducta, su racha de días seguidos apuntando algo (con un día de gracia semanal) y los emblemas de constancia que ha conseguido en la operación en curso. Nada de esto compara a los dos usuarios entre sí, ni premia perder peso.

## 2. Criterio de "esto funciona"

1. Con una operación en marcha, en **Hoy**, debajo del calendario de constancia, hay un bloque nuevo con: los **puntos totales** de la operación, la **racha actual** (días) y los **emblemas** conseguidos.
2. Los puntos suben al apuntar peso (+1), comida (+1, hasta 3 al día) y ejercicio (+2), sin recargar la página: apunta algo y vuelve a "Hoy" para verlo reflejado.
3. Un día en que apuntas peso, comida y ejercicio los tres suma +3 puntos extra ese día ("día completo").
4. Una semana natural (lunes a domingo) en la que apuntaste algo los 7 días suma +10 puntos extra ("semana completa"), y desbloquea el emblema **Semana redonda**.
5. La racha cuenta días consecutivos con algo apuntado. Si falta un día, la racha **no se rompe** si es el primer día sin apuntar de esa semana natural; si falta un segundo día en la misma semana, la racha se corta ahí.
6. El bloque dice si el día de gracia de esta semana **ya está gastado** o sigue disponible.
7. Los emblemas conseguidos se ven marcados; los que faltan, no (o se ven apagados, a decidir en el diseño).
8. Cerrar la operación desde Ajustes archiva los registros como siempre; al abrir una operación nueva, el bloque **empieza de cero**: 0 puntos, racha 0, sin emblemas.
9. Sin operación en marcha, el bloque no se ve, como el resto de "Hoy".
10. Editar la fecha de un registro pasado (spec 007) recalcula puntos, racha y emblemas con la fecha corregida, sin arrastrar el valor viejo.
11. Reiniciar datos (pesajes, comidas o ejercicios) desde Ajustes hace que puntos, racha y emblemas bajen o desaparezcan en consecuencia, porque se recalculan a partir de lo que quede.

## 3. Alcance

### Entra

- Bloque nuevo en **Hoy**: puntos totales, racha actual, aviso del día de gracia, y lista de emblemas.
- Cálculo de puntos, racha y emblemas a partir de los pesajes, comidas y ejercicios ya guardados de la operación en curso. **No se guarda nada nuevo en Firestore**: es un dato derivado, igual que `calcularResumen()` calcula ya "días registrados" del histórico.
- Los seis emblemas de la propuesta v2: Primera semana, Mes de hierro, Centenario, Primera consulta, Semana redonda, Vuelta al ruedo (detalle en el punto 4).

### NO entra (explícitamente fuera)

- **Objetivo compartido entre los dos usuarios** ni ninguna cifra que cruce cuentas: `PRODUCTO.md` prohíbe comparar o compartir datos entre usuarios.
- **Ranking o clasificación** entre usuarios.
- **Niveles ni ligas.**
- **Recompensas materiales** ni nada que los puntos desbloqueen: el riesgo de incentivar registros falsos se mitiga así, como avisa la propuesta v2.
- **Puntos por peso perdido** ni por ningún resultado en la báscula: solo por registrar.
- **Histórico de puntos por día** ni gráfica de evolución de puntos.
- **Corregir puntos a mano.**
- **Aviso o notificación al conseguir un emblema** (tipo popup/toast): se ve al entrar en "Hoy", no hay aviso aparte. Si hace falta, se apunta en el backlog.
- **Puntos por fotos de progreso**: la propuesta v2 no las incluye en la fórmula de puntos. Sí cuentan para la racha (ver punto 4).

## 4. Comportamiento detallado

### Qué es un "día con registro"

Un día en el que hay al menos un **pesaje, comida o ejercicio** apuntado. Son los mismos tres tipos que ya pinta el calendario de constancia de "Hoy" (`calendarioDeConstancia()` en `js/grafica.js`), para que la racha cuente exactamente lo mismo que el usuario ya ve pintado justo encima. **Las fotos de progreso no cuentan para la racha**, igual que hoy tampoco pintan el calendario.

### Puntos

Se calculan sumando, para cada día de la operación en curso:

- +1 por cada pesaje.
- +1 por cada comida, con un tope de **3 puntos de comida al día** (a partir de la cuarta comida del día, no suma más).
- +2 por cada ejercicio.
- **+3 extra si ese día hay pesaje, comida Y ejercicio a la vez** ("día completo").

Y, además, por cada semana natural (lunes-domingo) completa dentro de la operación:

- **+10 extra si los 7 días de esa semana son "días con registro"** ("semana completa", ver definición arriba — no hace falta que cada día sea "día completo", basta con que tenga algo apuntado).

Los puntos totales de la operación son la suma de todo lo anterior desde que empezó.

### Racha

Cuenta días consecutivos con registro, terminando hoy (si hoy ya tiene algo apuntado) o ayer (si hoy todavía no tiene nada: el día no ha acabado, así que no rompe nada todavía, igual que el resto de "Hoy" no se resuelve hasta que se recarga).

Recorre los días hacia atrás desde ahí:
- Un día con registro suma 1 a la racha.
- Un día sin registro consume el **día de gracia de su semana natural** si no se había usado ya esa semana: la racha sigue sin romperse.
- Un segundo día sin registro en la misma semana natural **rompe la racha** ahí: no se sigue contando hacia atrás.
- Nunca se retrocede más allá de la fecha de inicio de la operación.

El bloque dice, con esa misma cuenta, si el día de gracia de la semana en curso está disponible o ya gastado.

### Los seis emblemas

Se calculan mirando todos los días de la operación hasta hoy, no solo la racha actual (un emblema conseguido no se pierde si la racha se rompe después):

| Emblema | Se consigue cuando... | ¿Se repite? |
|---|---|---|
| Primera semana | la racha alcanzó alguna vez 7 días, en cualquier momento de la operación | No |
| Mes de hierro | la racha alcanzó alguna vez 30 días | No |
| Centenario | la suma de pesajes + comidas + ejercicios + fotos de la operación llegó a 100 | No |
| Primera consulta | se completó al menos una consulta (documento en `consultas`) durante la operación | No |
| Semana redonda | se consiguió al menos una vez el bonus de "semana completa" (7 días con registro en una semana natural) | No |
| Vuelta al ruedo | tras 5 o más días seguidos sin ningún registro, se volvió a apuntar algo | **Sí**, una vez por cada parón de 5+ días que termina |

### Dónde vive

En **Hoy**, en un bloque nuevo debajo del calendario de constancia. Igual que el resto de bloques de "Hoy", solo se ve con una operación en marcha.

## 5. Modelo de datos

**No hay colección ni campo nuevo en Firestore.** Todo se calcula leyendo `pesajes`, `comidas`, `ejercicios` (y `fotos` solo para el emblema Centenario) de la operación en curso, igual que ya hace `calcularResumen()` en `js/operaciones.js`. Sin escritura, sin cupo, sin nada que reiniciar aparte: al borrar registros desde Ajustes, puntos/racha/emblemas bajan solos porque se recalculan cada vez.

Al cerrar una operación, sus registros se archivan como siempre (spec 018) y el cálculo de la operación nueva empieza de cero porque no tiene registros propios todavía.

## 6. Casos límite

- **Operación recién iniciada, sin nada apuntado**: puntos 0, racha 0, sin emblemas, día de gracia disponible.
- **La operación empieza a mitad de semana natural**: esa primera semana parcial nunca puede llegar a "semana completa" (le faltan días antes del inicio). Se acepta: no hay forma de que sí los tenga.
- **Reiniciar datos borra pesajes/comidas/ejercicios**: todo baja al recalcularse. Incluye la posibilidad de que un emblema ya "conseguido" deje de aparecer marcado si ya no hay historial que lo sostenga (por ejemplo, tras borrar todo, ya no hubo nunca una racha de 7). Se acepta: es la misma lógica que el resto de datos derivados del proyecto (no hay snapshot de logros).
- **Editar la fecha de un registro pasado** (spec 007) mueve ese registro de día: puntos, racha y emblemas se recalculan con la fecha nueva, sin rastro del cálculo anterior.
- **Los dos usuarios de la pareja**: cada uno ve solo los suyos, como todo lo demás en la app. No hay comparación posible desde este bloque.
- **Operación muy larga (muchos meses)**: el cálculo recorre todos sus días. Se acepta el coste porque ya es el mismo patrón que usa `calcularResumen()` con toda la operación.
- **Medianoche con la app abierta**: el bloque sigue mostrando el estado de ayer hasta que se recarga, como el resto de "Hoy" (deuda ya conocida en `BACKLOG.md`).

## 7. Archivos afectados

| Archivo | Cambio |
|---|---|
| `js/gamificacion.js` | **nuevo**: calcula puntos, racha, día de gracia y emblemas a partir de los registros de la operación |
| `js/app.js` | el bloque nuevo en "Hoy", llamando a `js/gamificacion.js` |
| `index.html` | el bloque y su estructura |
| `styles.css` | estilos del bloque: puntos, racha, lista de emblemas |

Sin cambios en `firestore.rules`, `js/operaciones.js`, `js/reinicio.js` ni `vercel.json`: no hay colección nueva, no hay IA, no hay cupo.

**Estimación: ~250-300 líneas** entre el cálculo y el bloque visual. Dentro del límite de la spec pequeña.

## 8. Decisiones tomadas

- **Puntos, racha y emblemas visibles los tres** (no solo racha+emblemas) → decisión del usuario el 2026-08-19.
- **Valores de puntos y lista de emblemas, los de la propuesta v2 tal cual** → decisión del usuario el 2026-08-19. Sin puntos por fotos, porque la propuesta no los incluye.
- **Día de gracia: uno por semana natural (lunes-domingo)**, no por bloques de 7 días desde el inicio de la racha → decisión del usuario el 2026-08-19.
- **Vive dentro de la operación en curso, se reinicia al cerrarla** → decisión del usuario el 2026-08-19. Coherente con que es un dato derivado de comidas/pesajes/ejercicios, que ya siguen ese patrón (spec 018).
- **"Día completo" exige peso + comida + ejercicio el mismo día; "semana completa" solo exige algo apuntado los 7 días** (no exige que cada día sea "día completo") → decisión del usuario el 2026-08-19, al detectar que ambas lecturas eran razonables.
- **Sin colección nueva en Firestore: todo se calcula al vuelo** → decisión técnica, siguiendo el mismo patrón que `calcularResumen()` ya usa para "días registrados". Evita cupos, reglas nuevas y datos que puedan desincronizarse de los registros reales.
- **La racha cuenta los mismos tipos que el calendario de constancia** (peso, comida, ejercicio; no fotos) → decisión técnica, para que la racha no contradiga lo que el propio calendario pinta justo encima.
- **Los emblemas, salvo "Vuelta al ruedo", se consiguen una sola vez por operación y no se "pierden" visualmente salvo que se borren los datos que los sostenían** → decisión técnica, para que reflejen la historia real de la operación en curso.
- **Sin aviso ni notificación al conseguir un emblema** → se ve al entrar en "Hoy". Evita el trabajo y el riesgo de intrusismo de un sistema de notificaciones, descartado ya para toda la app.

## 9. Fuera de spec: ideas apuntadas

- Objetivo semanal compartido entre los dos usuarios, con contadores agregados (sin cruzar datos individuales). Contradice `PRODUCTO.md` tal como está hoy: si algún día se quiere, hay que decidirlo y actualizar `PRODUCTO.md` antes. → `docs/BACKLOG.md`
- Aviso o animación al conseguir un emblema nuevo. → `docs/BACKLOG.md`
- Histórico de puntos/racha de operaciones ya archivadas. → `docs/BACKLOG.md`

## ✅ Para probar a mano

(El agente `qa-manual` lo afina antes de la prueba, con los pasos concretos y las fechas de ejemplo.)
