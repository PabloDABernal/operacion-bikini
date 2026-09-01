# 087 — Cuánto llevas andado (estadísticas de distancia)

- **Estado:** borrador
- **Fecha:** 2026-09-01
- **Referencia en PRODUCTO.md:** no estaba desarrollada, solo el título en la
  tabla de specs de `docs/ESTADO.md` ("087 | Cuánto llevas andado
  (estadísticas)"). Esta spec añade el detalle a `docs/PRODUCTO.md` antes
  de darse por buena (ver aviso al final).
- **Depende de:** la spec 086 (`distanciaKm` en un ejercicio apuntado), que
  guarda el dato pero **sigue sin probar por el usuario en producción**.
  Se escribe esta spec igualmente por decisión del usuario del 1 de
  septiembre, aunque la propia 086 razonaba "primero se apunta, luego se
  cuenta" — si al probar la 086 aparece algo que cambie cómo se guarda la
  distancia, esta spec podría necesitar un ajuste antes de implementarse.

## 1. Objetivo

Que Ejercicio diga cuántos kilómetros llevas andados/corridos este mes y
desde que empezaste a apuntar distancia, sin gráfica ni comparativas: dos
números.

## 2. Criterio de "esto funciona"

1. En **Ejercicio**, cerca del diario de ejercicios apuntados, hay un
   bloque de **estadísticas de distancia**.
2. Muestra dos líneas: **"Este mes"** y **"Desde que empezaste"**, cada una
   con el total de kilómetros sumando todos los ejercicios que llevan
   `distanciaKm`.
3. "Este mes" suma solo los ejercicios apuntados dentro del mes en curso
   (por fecha del registro, no por cuándo se creó la cuenta).
4. "Desde que empezaste" suma **todos** los ejercicios con distancia que
   tengas apuntados, sin límite de fecha.
5. Un ejercicio sin `distanciaKm` (la mayoría, y todos los de antes de la
   086) no suma nada a ninguna de las dos líneas.
6. Sin ningún ejercicio con distancia todavía, las dos líneas lo dicen en
   vez de mostrar "0 km" (que parecería un error o que hoy no has andado,
   en vez de "no hay datos").
7. Apuntar, editar (añadir o quitar distancia) o borrar un ejercicio
   actualiza las dos líneas al momento, sin recargar.
8. Cambiar de mes con el calendario del sistema (probar al día siguiente,
   o simulando la fecha) hace que "Este mes" vuelva a estar a cero/"sin
   datos" y "Desde que empezaste" no cambie.

## 3. Alcance

### Entra

- Bloque de dos líneas de estadísticas de distancia, dentro de Ejercicio.
- El cálculo, hecho al vuelo a partir de los ejercicios ya cargados (sin
  guardar nada nuevo en Firestore).

### NO entra (explícitamente fuera)

- **Gráfica de evolución.** Son dos números, no una gráfica como la del
  peso (spec 008/015). Se descarta a propósito: con pocos datos (recién
  estrenada la 086) una gráfica estaría casi vacía.
- **Comparar con el mes anterior** ("+3 km respecto al mes pasado"), al
  estilo de "Últimos 7 días" del peso (spec 015). Decisión del usuario,
  2026-09-01: solo los dos totales, nada de comparativas todavía.
- **Ritmo (min/km), calorías ni velocidad.** Ya estaba descartado en la
  086 y sigue fuera aquí.
- **Puntos ni racha por kilómetros.** La gamificación cuenta días con
  actividad, no distancia — decisión ya tomada en la 086.
- **Distancia en "Hoy"** ni en el resumen del día. Solo este bloque, dentro
  de Ejercicio.
- **Que la IA vea estos totales** al pasar consulta o pedir tabla. Ninguna
  spec de material lo pide, y añadirlo es una decisión aparte.
- **Filtrar por tipo de ejercicio** ("solo lo que anduviste andando, no en
  bici"). La app no distingue tipos de ejercicio hoy; sumar todo lo que
  lleve distancia es lo único que se puede hacer sin inventar una
  categoría nueva.

## 4. Comportamiento detallado

### Dónde

Dentro de **Ejercicio**, en la sub-pestaña donde ya se apunta y se lista el
diario de ejercicios (Apuntar), cerca de la lista — mismo criterio de
"vive donde ya se mira" que las estadísticas de peso (spec 015) en su
propia pestaña, adaptado a que Ejercicio no tiene una pestaña dedicada
entera a esto.

### El cálculo

- **"Este mes"**: filtra los ejercicios cargados por fecha dentro del mes
  en curso (año y mes iguales a hoy), suma `distanciaKm` de los que lo
  tengan.
- **"Desde que empezaste"**: suma `distanciaKm` de todos los ejercicios
  cargados, sin filtrar por fecha.
- Los dos se calculan sobre la misma lista que ya usa el diario de
  Ejercicio (`listarEjercicios`), sin una consulta nueva a Firestore.
- El total se muestra con **un decimal** (mismo criterio que guarda la
  086: "32,4 km"), sumando los valores tal cual están guardados.

### Estado sin datos

Cada línea, por separado, dice algo como "Aún no has apuntado distancia
este mes" / "Aún no has apuntado ninguna distancia" en vez de "0 km" —
mismo criterio que la 015 usa para sus líneas sin datos suficientes.

## 5. Modelo de datos

**Ninguna colección nueva y ningún campo nuevo.** Igual que el cruce de la
059: es una vista derivada de `usuarios/{uid}/ejercicios` (el diario), que
ya existe desde la 086 con su `distanciaKm` opcional. Se calcula al pintar,
no se guarda nada.

## 6. Casos límite

- **Ningún ejercicio con distancia**: las dos líneas dicen que no hay
  datos, sin romper nada.
- **Todos los ejercicios con distancia son de meses anteriores**: "Este
  mes" dice que no hay datos; "Desde que empezaste" sí suma.
- **Un ejercicio editado para quitarle la distancia** (spec 086, vaciar el
  campo): dejar de sumar en ambas líneas al momento.
- **Un ejercicio borrado**: su distancia deja de contar.
- **Cambio de mes con la app abierta** (medianoche cruzada sin recargar):
  aceptado que no se actualice sola, mismo criterio que "Hoy" no se
  actualiza solo al cruzar la medianoche (limitación conocida y aceptada
  del proyecto, ver `docs/ESTADO.md`).
- **Sin operación en marcha**: el bloque, como el resto de Ejercicio, vive
  detrás del aviso "Primero inicia tu operación bikini desde Hoy" (spec
  018). No cambia esa regla.
- **Cerrar una operación y empezar otra**: "Desde que empezaste" solo cabe
  interpretarlo dentro de la operación en marcha (el diario de ejercicios
  vive dentro de la operación, spec 018), así que suma solo lo apuntado en
  la operación actual, no el histórico de operaciones anteriores —
  coherente con que el histórico es de solo lectura y no se mezcla con los
  datos activos en ningún otro sitio de la app.
- **Sin conexión al cargar Ejercicio**: el bloque no se pinta o dice que no
  se ha podido cargar, igual que el resto de listas de la app.

## 7. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/ejercicios.js` | Función de cálculo (total del mes, total acumulado) a partir de la lista ya cargada. |
| `index.html` | El bloque de dos líneas dentro de Ejercicio. |
| `js/app.js` | Pintar el bloque; repintarlo cuando cambie el diario (apuntar, editar, borrar). |
| `styles.css` | Lo mínimo, reutilizando el estilo de línea de estadística que ya tiene el peso (spec 015) si encaja. |

Estimación: **por debajo de 150 líneas**. Es un cálculo sobre datos que ya
se cargan, sin colección nueva, sin IA y sin gráfica.

## 8. Decisiones tomadas

- **Se escribe ahora, sin esperar a que la 086 esté validada en
  producción**, aunque la 086 razonaba lo contrario. Decisión del usuario,
  2026-09-01, al pedir escribir las tres specs pendientes de una vez. Se
  implementa cuando toque; si al probar la 086 aparece algo que cambie el
  dato guardado, esta spec se revisa antes de implementar.
- **Solo dos números: este mes y desde que empezaste.** Decisión del
  usuario, 2026-09-01. Nada de comparar con el mes anterior ni de gráfica.
- **Vive dentro de Ejercicio**, no en "Hoy". Decisión del usuario,
  2026-09-01.
- **"Desde que empezaste" es de la operación en marcha**, no de todo el
  histórico de operaciones. Decisión de alcance, coherente con que el
  diario de ejercicios vive dentro de la operación (spec 018) y el
  histórico es de solo lectura.

## 9. Fuera de spec: ideas apuntadas

- Comparar el mes en curso con el anterior.
- Gráfica de evolución de la distancia, si con el tiempo hay datos que
  la justifiquen.
- Ritmo (min/km), ya apuntado como idea desde la 086.

## ⚠️ Antes de dar esta spec por buena

`docs/PRODUCTO.md` no tenía nada escrito sobre esta feature más allá del
título en la tabla. Añadir, en el apartado de evolutivos de la fase
productiva, junto a la entrada de la 086:

```
- **Cuánto llevas andado.** Dentro de Ejercicio, dos números: los
  kilómetros de este mes y los acumulados desde que empezaste a apuntar
  distancia (spec 086), sumando los ejercicios que la llevan. Sin
  gráfica ni comparativa con el mes anterior — eso se deja para si con
  el tiempo hace falta.
```

Y en la tabla de specs, `087 | Cuánto llevas andado (estadísticas;
sin escribir)` pasa a `087 | Cuánto llevas andado (estadísticas de
distancia)`.

## ✅ Para probar a mano

*(lo rellena/afina el agente `qa-manual` antes de la prueba, siguiendo el
criterio de la sección 2)*
