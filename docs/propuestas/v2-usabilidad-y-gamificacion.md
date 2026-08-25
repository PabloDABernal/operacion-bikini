# Propuesta v2 — Usabilidad, gráficas y gamificación

- **Fecha:** 2026-08-10
- **Estado:** ⚠️ **SUPERADA el 25 de agosto de 2026.** Se conserva como historia,
  no como tarea. Sus cinco decisiones pendientes se resolvieron por el camino en
  la v2, la v3 y la v4, y desde entonces han pasado la v5, la v6 y la v7. No
  sacar nada de aquí sin comprobar antes que no está ya hecho.
- **Estado original:** propuesta para debatir. NO es una spec y no se implementa nada de aquí sin decisión del usuario.
- **Origen:** ideas planteadas por el usuario (datos de comida más específicos, gráficas de peso, mejor aspecto, logros y puntos).

---

## 1. El problema real de la v2

La v1 resuelve lo difícil: los datos se guardan, la IA funciona, todo corre gratis. El riesgo de la v2 no es que falten funciones. Es que dejéis de usarla en la semana 3.

Toda propuesta de este documento se juzga contra una sola pregunta:

> ¿Esto hace más probable que apuntes algo un martes a las 23:40, cansado y con la niña de 4 meses acabando de dormirse?

Si una idea añade trabajo al usuario, tiene que devolver algo el mismo día. Si no, sobra.

## 2. Principio rector: premiar la constancia, no el resultado

El peso no se controla directamente: sube y baja por agua, sal, hora del día y ciclo. La conducta sí se controla: apuntar, moverse, cocinar.

Una app que premia kilos perdidos premia el azar y empuja a conductas malas (saltarse comidas para "ganar"). Una app que premia registros y constancia premia lo único que de verdad depende de vosotros.

Esto condiciona toda la gamificación del apartado 6.

---

## 3. Fricción cero al registrar (la base de todo)

Antes de añadir nada, quitar pasos a lo que ya existe.

- **Pantalla "Hoy"** como inicio: peso, comidas y ejercicio del día en una sola vista, con lo de hoy ya a la vista. Las pestañas actuales pasan a ser el histórico.
- **"Lo de siempre"**: botón para repetir una comida reciente. En la práctica, los desayunos se repiten casi todos los días; escribirlos otra vez es trabajo tonto.
- **Peso en dos toques**: campo grande con `+0,1` y `−0,1` a los lados, partiendo del último peso registrado.
- **Registro sin salir de la pantalla**: nada de cambiar de pestaña para apuntar.

Impacto alto, coste bajo, cero llamadas a la IA. Es lo que más sube la probabilidad de que la app siga viva en septiembre.

---

## 4. Datos de comida más específicos... sin escribir más

La idea del usuario es buena, pero tiene una trampa: **más campos que rellenar = menos comidas registradas**. Y una comida no registrada vale cero.

Propuesta: que la estructura la ponga la IA, no el dedo.

1. Tú sigues escribiendo en texto libre: `lentejas y una manzana`.
2. Una vez al día (una sola llamada, no una por comida), la IA convierte el día entero en datos: grupos de alimentos, si hubo verdura, si hubo proteína, si hubo ultraprocesado, y una estimación de calorías **en rango** (por ejemplo 550–700 kcal), no un número exacto.
3. Eso alimenta gráficas y logros sin que rellenes ni un campo más.

**Por qué un rango y no un número exacto**: nadie puede saber las calorías de "lentejas" sin pesar la ración. Un número con decimales daría una falsa precisión, y tomarías decisiones sobre datos inventados. Un rango es honesto y sigue sirviendo para ver tendencias.

**Coste de cuota**: 1 llamada por usuario y día. Despreciable frente a las 5 de consejos.

**Alternativa descartada**: base de datos de alimentos real (Open Food Facts, BEDCA) con búsqueda y raciones. Da precisión de verdad, pero multiplica el trabajo de registro y de desarrollo. No compensa para dos personas.

---

## 5. Gráficas de peso

El peso diario es ruido: entre 1 y 2 kg de variación por agua y sal. Una gráfica cruda te hace pensar que has engordado un martes cualquiera, y eso desmotiva sin motivo.

- **Línea principal: media móvil de 7 días.** Es la que dice la verdad.
- **Puntos crudos detrás, tenues**: se ven, pero no mandan.
- **Línea de objetivo** y banda de margen.
- **Rangos**: 30 días / 90 días / todo.
- **Comparador**: "esta semana vs. la anterior", con el cambio en grande.
- **Calendario de constancia** (mapa de calor): un cuadrado por día, más intenso cuanto más completo. Se lee de un vistazo y además es la materia prima de los logros.

**Implementación**: SVG a mano, unas 150 líneas, sin librerías. Encaja con el stack sin frameworks y no añade dependencias ni peso de descarga.

---

## 6. Que se vea más molón

Ahora mismo el CSS es funcional y punto, que era lo correcto para la v1. Para la v2:

- **Sistema mínimo de diseño**: variables de color, escala tipográfica, espaciado en múltiplos de 4, radios y sombras. Sin framework, unas 100 líneas de CSS bien puestas.
- **Modo oscuro.** Se apunta de noche, en la cama. Una pantalla blanca a las 23:40 es agresiva y encima despierta.
- **Navegación inferior en móvil.** Cinco pestañas ya van justas; con fotos serán seis y no caben.
- **Estados vacíos que enseñan**: en vez de "Aún no has apuntado nada", un ejemplo de qué escribir.
- **Micro-respuesta al guardar**: una marca de confirmación breve. Cuesta poco y hace que la app se sienta viva.

### Tres direcciones visuales (a elegir por el usuario)

| Dirección | Idea | Paleta |
|---|---|---|
| **Clínica cálida** | Limpia, mucho aire, seria sin ser fría. Evolución de lo actual. | Fondo `#FAF7F5`, tinta `#2A2320`, acento `#C2185B`, apoyo `#0F766E` |
| **Cuaderno** | Papel, líneas finas, sensación de diario personal escrito a mano. | Fondo `#F5F1E8`, tinta `#26221D`, acento `#3E6B4A`, apoyo `#8A6D3B` |
| **Nocturna deportiva** | Oscura de serie, números grandes, energía de app de entreno. | Fondo `#12141A`, tinta `#E8EAF0`, acento `#FF4D6D`, apoyo `#4CC9F0` |

---

## 7. Gamificación

### Reglas del juego (lo que la hace funcionar en vez de tóxica)

1. **Puntos por conducta, nunca por kilos.** Ver apartado 2.
2. **Rachas con red de seguridad**: un día de gracia por semana. Sin eso, el primer fallo rompe la racha, y una racha rota es la excusa perfecta para abandonar del todo.
3. **Premiar la vuelta, no solo la perfección**: emblema por retomar tras un parón. Es el momento en que la gente abandona; hay que celebrarlo, no castigarlo.
4. **Nada de comparar pesos entre vosotros.** Fisiologías distintas, y sois pareja, no un ranking. Comparar peso entre miembros de una pareja es la forma más rápida de que uno de los dos deje la app.
5. **Cooperativo antes que competitivo**: un objetivo semanal común ("30 registros entre los dos") une; una clasificación separa.

### Mecánica concreta

- **Puntos**: apuntar peso 1 · comida 1 (máximo 3 al día) · ejercicio 2 · día completo +3 · semana completa +10. Con tope semanal, para que no se infle registrando por registrar.
- **Emblemas**: Primera semana · Mes de hierro (30 días) · Centenario (100 registros) · Primera consulta · Semana redonda (los 7 días completos) · **Vuelta al ruedo** (retomar tras 5+ días parado).
- **Nada de niveles ni ligas**: para dos personas es decorado vacío.

### Riesgo a vigilar

Los puntos incentivan registrar comidas falsas para sumar. Mitigación: que los puntos no desbloqueen nada material. El valor está en ver la racha viva, no en un premio. En cuanto haya una recompensa de verdad, aparece la trampa.

### ⚠️ Aviso de producto

El objetivo compartido de pareja **contradice `docs/PRODUCTO.md` línea 26**, que dice explícitamente que no se comparten datos entre usuarios.

Se puede resolver compartiendo únicamente **contadores agregados** (número de registros de la semana), nunca pesos, comidas ni consejos. Pero sigue siendo un cambio de producto: hay que decidirlo y actualizar `PRODUCTO.md` **antes** de implementar nada.

---

## 8. Lo que NO propongo, y por qué

- **Notificaciones push**: exigen service worker, permisos y Firebase Cloud Messaging. Mucho trabajo, y la mitad de las veces acaban silenciadas. Una alarma del móvil hace el mismo trabajo gratis.
- **Integración con básculas o pulseras**: APIs de pago u OAuth complejo, y hay que mantenerlo.
- **Contador de calorías y macros exactos**: falsa precisión y mucha fricción. Ver apartado 4.
- **Clasificación entre usuarios**: ver apartado 7, regla 4.
- **Migrar a React o similar**: reescribir lo que ya funciona a cambio de nada.

---

## 9. Priorización propuesta

Antes de todo esto va la **spec 005 (fotos de progreso)**, que cierra la v1 y tiene fecha: 31 de agosto.

| Orden | Propuesta | Impacto | Esfuerzo | Necesita IA |
|---|---|---|---|---|
| 1 | Sistema visual + modo oscuro + navegación inferior | Alto | Medio | No |
| 2 | Gráfica de peso con media móvil | Alto | Medio | No |
| 3 | Pantalla "Hoy" + repetir comida | Muy alto | Medio | No |
| 4 | Estructuración de comidas por IA | Medio | Alto | Sí |
| 5 | Rachas, puntos y emblemas | Medio | Alto | No |

Razonamiento del orden: primero lo que mejora **todo** sin depender de la IA ni de decisiones de producto pendientes; al final lo que necesita datos estructurados (los logros de nutrición dependen del apartado 4) y lo que toca `PRODUCTO.md`.

---

## 10. Decisiones que necesito del usuario

1. **Dirección visual**: ¿Clínica cálida, Cuaderno o Nocturna deportiva?
2. **Objetivo compartido de pareja**: ¿sí (y actualizamos `PRODUCTO.md`) o cada uno a lo suyo?
3. **Calorías**: ¿estimación en rango, o mejor sin calorías y solo grupos de alimentos?
4. **Puntos visibles**: ¿puntos y emblemas, o solo rachas y emblemas (más limpio, menos "juego")?
5. **Orden**: ¿cerramos v1 con las fotos antes de tocar nada de esto?
