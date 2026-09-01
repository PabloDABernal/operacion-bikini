# 087 — Cuánto llevas andado

- **Estado:** 📝 escrita el 1 de septiembre de 2026, revisada por `revisor-specs` (sin bloqueantes). **Pendiente de implementar.**
- **Fecha:** 2026-09-01
- **Referencia en PRODUCTO.md:** apartado "Qué hará (evolutivos de la fase productiva, desde el 31 de agosto de 2026)", el evolutivo de los kilómetros.

## 1. Objetivo

Que los kilómetros que apuntas desde la spec 086 **se puedan mirar juntos**:
cuánto llevas andado en la semana, en el mes y desde que empezaste.

## 2. Por qué existe

La 086 guarda el dato y dice, con todas las letras, que las estadísticas son
esta spec: *"un contador de 0 km este mes el primer día no dice nada. Primero se
apunta, luego se cuenta"*. Ya hay días apuntados, así que toca contar.

Es lo que de verdad quería el usuario cuando pidió el campo: la frase fue *"la
app no guardaba lo que más interesa mirar al cabo de un mes"*. **Mirar** es
esto.

## 3. Criterio de "esto funciona"

1. En **Ejercicio** hay un bloque **"Cuánto llevas andado"**.
2. Con ejercicios apuntados con distancia, enseña **cuatro líneas**: hoy,
   últimos 7 días, últimos 30 días y desde que empezaste.
3. Los totales **cuadran** con lo que has apuntado (se suman a mano dos o tres
   días y sale lo mismo).
4. Las líneas de 7 y 30 días llevan además la **media por sesión con
   distancia**.
5. La de "desde que empezaste" dice **en cuántas sesiones**.
6. Un ejercicio **sin distancia** (los de antes de la 086, y los de gimnasio)
   **no cuenta**: ni suma cero ni baja la media.
7. **Sin ningún kilómetro apuntado**, el bloque lo dice en una frase y no
   enseña cuatro ceros.
8. Apuntas un ejercicio con distancia y el bloque se pone al día **sin
   recargar**.
9. Borras o editas un ejercicio con distancia y los totales cambian en
   consecuencia.
10. La lista de ejercicios, el filtro por día y los chips de frecuentes siguen
    funcionando igual.

## 4. Alcance

### Entra

- `estadisticasDeDistancia()` en `js/estadisticas.js`: cálculo puro, sin DOM.
- El bloque en la sección Ejercicio, con sus cuatro líneas y su estado vacío.
- Repintado al apuntar, editar o borrar un ejercicio.
- Suite de casos del cálculo.

### NO entra (explícitamente fuera)

- **Gráfica de kilómetros.** Se valoró y se dejó fuera el 1 de septiembre: la
  gráfica de peso es SVG a mano (spec 008) y sería más código que todo lo demás
  junto. Si al mirar los números se echa de menos, es otra spec.
- **Ritmo (min/km), velocidad o calorías.** Lo dejó fuera la 086 y sigue fuera.
- **Puntos, racha ni emblemas por kilómetros.** La gamificación (spec 031)
  cuenta días con actividad, no cuánto. Meter esto ahí cambiaría lo que la app
  premia.
- **Un objetivo de kilómetros** ("500 este mes"). No lo ha pedido nadie.
- **Kilómetros en Hoy** ni en el resumen del día.
- **Que la IA vea los kilómetros** al pasar consulta. La 086 lo dejó fuera.
- **Que la tabla de ejercicio lleve distancia.** La tabla es el plan; esto es el
  diario.
- **Meter esto en Peso → Estadísticas.** Se valoró y se descartó: es la pantalla
  de la báscula.

## 5. Comportamiento detallado

### Dónde va

Un bloque propio en **Ejercicio → Apuntar**, debajo de la lista de ejercicios.
Los kilómetros viven donde se apuntan.

```
Cuánto llevas andado
────────────────────────────
De hoy                 5,2 km
Últimos 7 días        18,4 km   3,7 km de media
Últimos 30 días       62,1 km   4,1 km de media
Desde que empezaste   87,3 km   en 21 sesiones
```

Se reutiliza `lineaDeEstadistica()` y la clase `resumen` que ya usa Peso →
Estadísticas (spec 015): misma forma, se aprende una vez.

### El cálculo

`estadisticasDeDistancia(ejercicios, hoy)` en `js/estadisticas.js`, al lado de
`estadisticasDePeso()` y con su misma disciplina: **cálculo puro, sin DOM y sin
red**.

- Cuenta **solo los ejercicios con `distanciaKm`**. Un ejercicio sin el campo no
  existe para esta cuenta: no suma cero ni entra en el divisor de la media. Es
  lo que dejó escrito la 086 (*"la 087 los contará como sin distancia, no como
  cero"*).
- **Ventanas fijas**, las mismas que las estadísticas de peso: hoy, los últimos
  **7** días y los últimos **30**, contando hacia atrás desde `hoy` (inclusive).
  No hay selector de rango: el de la gráfica es de la gráfica.

> **Lo que se parece al peso son las ventanas, NO el algoritmo.**
> `estadisticasDePeso()` tira de `compararVentanas()` (`js/grafica.js`), que
> compara **dos ventanas consecutivas** para sacar una diferencia: sirve para
> *"cuánto has variado"*. Aquí hace falta una **suma dentro de una sola
> ventana**: *"cuánto llevas"*. `compararVentanas()` **no se reutiliza**; es una
> función nueva y más simple. Lo avisó `revisor-specs` porque encajarla ahí a la
> fuerza es el error fácil.
- Razona **por días**, con la fecha ISO del ejercicio. La hora (spec 014) no
  interviene, igual que en las estadísticas de peso.
- Los totales se **redondean a un decimal**, como los guarda la 086. Se suma
  primero y se redondea al final, para que veinte paseos de 5,25 no arrastren
  error.
- La **media** es el total de la ventana entre el **número de sesiones con
  distancia** de esa ventana. Con cero sesiones, media `null`, y quien pinta
  no la enseña.

Devuelve:

```js
{
  hoy:   { km, sesiones },
  siete: { km, sesiones, media },
  treinta: { km, sesiones, media },
  total: { km, sesiones }
}
```

### El estado vacío

Si **`total.sesiones` es 0** —ningún ejercicio con distancia—, el bloque no
enseña las cuatro líneas. Enseña una frase:

> Cuando apuntes kilómetros en un ejercicio, aquí verás cuánto llevas.

Cuatro ceros no informan de nada y hacen pensar que la app no funciona.

Si hay alguna sesión pero **la ventana de hoy o de siete días está a cero**, esa
línea **sí** sale, con `0 km`. Ahí el cero sí dice algo: que esta semana no has
salido.

### Cuándo se repinta

En **`refrescarPantallas()`**, junto a `refrescarGrafica()` y `refrescarHoy()`,
que es donde `listaEjercicios` ya engancha su `alRefrescar`.

**No hay ninguna lectura nueva a Firestore**: `listaEjercicios.obtenerRegistros()`
devuelve el array **completo**, porque `recortarPorDias: true` solo afecta a lo
que se **pinta**, no a lo que se guarda en memoria. Es lo mismo que ya hace
`refrescarGrafica()`, que necesita el historial entero de pesajes. Verificado
por `revisor-specs` el 1 de septiembre.

`refrescarPantallas()` lo comparten las cuatro listas, así que este bloque se
recalculará también al guardar un pesaje o una comida. **Es correcto y no es un
efecto raro**: pasa ya con la gráfica, no cuesta nada (es cálculo puro sobre
memoria) y evita cuatro enganches donde basta uno.

## 6. Modelo de datos

**Nada nuevo.** Se lee `distanciaKm` de `usuarios/{uid}/ejercicios`, que estrenó
la spec 086.

`firestore.rules`: **sin cambios**. `js/reinicio.js`: **sin cambios**.

## 7. Casos límite

- **Ningún ejercicio**: la frase del estado vacío.
- **Ejercicios, pero ninguno con distancia**: la misma frase. Es el caso de
  quien solo hace gimnasio.
- **Un solo ejercicio con distancia, de hace tres meses**: "desde que empezaste"
  lo cuenta; hoy, 7 y 30 días salen a `0 km`.
- **Dos ejercicios el mismo día**: se suman los dos. Un día puede tener dos
  paseos.
- **Ejercicio con fecha futura** (la app las admite al editar): entra en "desde
  que empezaste" y **no** en las ventanas, que miran hacia atrás. No es un caso
  real, pero no debe romper.
- **`distanciaKm` a 0** en un documento antiguo o tocado a mano: la 086 no lo
  guarda nunca, pero si aparece cuenta como sesión de 0 km. No se filtra por
  valor, se filtra por **existir el campo**.
- **Muchos decimales al sumar** (0,1 + 0,2): se redondea al final, así que sale
  `0,3` y no `0,30000000000000004`.
- **La coma decimal**: se pinta con coma, como el resto de la app.
- **Cambiar de operación bikini**: los ejercicios viven dentro de la operación,
  así que "desde que empezaste" es desde que empezó **esta**. Es lo mismo que
  hacen las estadísticas de peso.

## 8. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| **Bloque propio en Ejercicio**, no en Peso → Estadísticas | Decisión del usuario el 1 de septiembre. Los kilómetros viven donde se apuntan, y la pantalla de la báscula no se llena de gimnasio. |
| **Las mismas ventanas que el peso** (hoy, 7, 30, total) | Se aprende una vez. Y evita meter un selector de rango que solo tendría este bloque. |
| **Sin gráfica** | La de peso es SVG a mano: sería más código que todo lo demás junto. Primero se ve si los números se usan. |
| **Un ejercicio sin distancia no cuenta** | Lo dejó escrito la 086. Contarlo como cero hundiría la media de quien mezcla gimnasio y paseos. |
| **Media por sesión, no por día** | Lo que quiere saber es cuánto anda cada vez que sale, no cuánto le tocaría por día del calendario. |
| **Estado vacío con frase, no con ceros** | Cuatro ceros parecen una app rota. |
| **Un cero dentro de una ventana sí se enseña** | Ahí el cero informa: esta semana no has salido. |
| **Ni puntos ni racha** | Cambiaría lo que la app premia, que son días con actividad. Mismo razonamiento que la 086. |

## 9. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/estadisticas.js` | `estadisticasDeDistancia()`. |
| `index.html` | El bloque en Ejercicio → Apuntar. |
| `js/app.js` | Pintarlo, y engancharlo en `refrescarPantallas()`. |
| `styles.css` | Se reutiliza `resumen`; solo si hace falta. |
| `docs/specs/087-distancia-estadisticas-casos.mjs` | **Nuevo.** Casos del cálculo. |

Estimación: **entre 180 y 220 líneas**. La primera cuenta decía 150 y era
optimista: solo `estadisticasDePeso()` y `pintarEstadisticas()`, que son el
patrón que se copia, ya suman 95. Sigue por debajo de las 300.

## 10. Fuera de spec: ideas apuntadas

- Gráfica de kilómetros por semana.
- Ritmo medio (min/km), ahora que están los dos datos.
- Un objetivo de kilómetros al mes.
- El mejor paseo ("tu récord: 12,4 km").

## ✅ Para probar a mano

Guion completo: lo afina `qa-manual`. En corto, los diez puntos del apartado 3,
con especial atención al **6** (un ejercicio sin distancia no debe bajar la
media), al **7** (el estado vacío) y al **10**, que es la regresión sobre la
pantalla de Ejercicio entera.
