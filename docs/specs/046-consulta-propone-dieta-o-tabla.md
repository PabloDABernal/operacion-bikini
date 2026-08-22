# 046 — La consulta propone dieta o tabla, y tú aceptas

- **Estado:** 📝 pendiente de implementar (después de la 045).
- **Fecha:** 2026-08-22
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
4. **Nada se cambia solo.** Mientras no toques el botón, tu dieta y tu tabla
   siguen intactas.
5. Al tocarlo, se pide la semana **con las instrucciones que salen de la
   consulta** (lo que la IA acaba de concluir), sin que tengas que escribirlas.
6. Mientras se genera, el botón se deshabilita y se ve que está trabajando.
7. Cuando llega, sustituye tu semana igual que si la hubieras pedido desde
   Comidas o Ejercicio, y te lleva a verla.
8. **Gasta del cupo diario de dietas o de tablas** (2 al día, spec 027), no del
   de consultas.
9. Si no te queda cupo de ese tipo hoy, el botón lo dice y no se puede pulsar.
10. Si falla la generación, sale el error de siempre y **tu semana anterior
    sigue intacta**.

## 3. Alcance

### Entra

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

## 4. Comportamiento detallado

### Lo que la IA devuelve (`api/consulta.js`)

Al cerrar, además de `cierre`, dos campos de propuesta. Aquí es donde los
campos `nutricion` y `ejercicio` que la 044 dejó vacíos **se retiran o se
reaprovechan** con nombre nuevo y significado nuevo: ya no son un plan, son las
**instrucciones** para pedir la semana.

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

- La propuesta viaja dentro del documento de consulta que ya existe.
- La semana generada se guarda donde se guarda hoy (`dietas` / `tablas`), sin
  cambios.
- `firestore.rules` no se toca.

## 6. Casos límite

- **Cupo agotado.** El botón lo dice y no se puede pulsar. La propuesta no se
  pierde: sigue ahí mañana.
- **Aceptar dos veces.** El botón se deshabilita al pulsar; y aunque se
  colara, generaría otra semana, que es lo mismo que pedirla dos veces a mano.
- **Fallo de la IA al generar.** La semana anterior sigue intacta, porque solo
  se sustituye cuando la nueva llega entera. Es como funciona hoy.
- **Consulta vieja con propuesta ya aceptada.** No se guarda que se aceptó, así
  que el botón sigue ahí. Aceptado: pulsarlo otra vez es pedir otra semana.
- **La IA propone siempre.** Es el riesgo real de esta spec. Si al probarla
  propone en cada consulta, hay que apretar las instrucciones, no añadir
  código.
- **Sin operación en marcha.** No hay consultas de revisión, así que no hay
  propuestas.

## 7. Archivos afectados

| Archivo | Qué cambia |
|---|---|
| `api/consulta.js` | Campos de propuesta y cuándo proponer. |
| `js/consulta.js` | Guardar la propuesta con el cierre. |
| `js/app.js` | Los botones de aceptar y el enganche con el camino de dieta/tabla. |
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

## 9. Fuera de spec: ideas apuntadas

- Ver la semana propuesta antes de aceptarla.
- Que la consulta pueda proponer también retocar el objetivo de peso o la fecha
  objetivo de Ajustes.

## ✅ Para probar a mano

Lo escribe el agente `qa-manual` cuando la implementación esté revisada.
