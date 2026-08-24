# 056 — La casilla "Operaciones" borra también la que está en marcha

- **Estado:** 🧪 implementada y desplegada el 2026-08-24; pendiente de que el usuario la pruebe.
- **Fecha:** 2026-08-24
- **Referencia en PRODUCTO.md:** apartado "Qué hace", puntos **"Reinicio de
  datos"** y **"Operaciones con principio y fin"**.

## 1. Objetivo

El usuario se quedó colgado. Su secuencia fue: entrevista fantasma que abrió una
operación (el fallo de la spec 055), borrar todos los datos desde la Zona de
peligro, y encontrarse con **una operación en marcha vacía**: sin entrevista en
el hilo, sin registros, y con la app tratándole como si estuviera dentro de un
ciclo. La única salida era "Finalizar operación bikini" y archivar una operación
que nunca existió de verdad.

La causa es que la casilla "Operaciones" solo borra las **archivadas**
(`operacionesArchivadas()` en `js/reinicio.js` filtra por `estado ===
"archivada"`), mientras que la casilla "Consultas y planes" sí se lleva la
entrevista que abrió la operación en curso. Se puede borrar el principio de una
operación pero no la operación: queda un ciclo sin comienzo.

Al terminar esta spec, marcar "Operaciones" borra **todas**, la del histórico y
la que esté en marcha, y borrarlo todo devuelve la app al estado de recién
llegado.

## 2. Criterio de "esto funciona"

1. Con una **operación en marcha**, ir a **Ajustes → Zona de peligro**: el
   recuento de **Operaciones** la incluye. Con una activa y ninguna archivada
   dice **(1)**.
2. Marcar Operaciones y borrar con las tres confirmaciones: la operación en
   marcha desaparece.
3. **Sin recargar la página**, la app vuelve al estado de recién llegado: en
   Consulta sale **"Iniciar operación bikini"**, y las pantallas de registro
   (Peso, Comidas, Ejercicio, Fotos) enseñan el aviso de que primero hay que
   iniciar una.
4. El histórico sigue borrándose igual que hasta ahora, con las archivadas.
5. Marcarlo todo y borrar deja la app **exactamente** como la primera vez que
   entras: sin operación, sin datos y sin nada que la IA sepa de ti (spec 055).
6. El aviso rojo de la Zona de peligro ya no dice "No toca el histórico de
   operaciones ya archivadas", que era mentira desde la spec 019, sino lo que
   de verdad pasa.
7. **Finalizar operación bikini** sigue existiendo y funcionando igual: es la
   forma normal de cerrar un ciclo, guardando su resumen en el histórico.
   Borrarla desde aquí es lo contrario: tirarla sin guardar nada.

## 3. Alcance

### Entra
- Que el recuento y el borrado de la casilla "Operaciones" incluyan la activa.
- Reescribir el aviso rojo de la Zona de peligro.

### NO entra (explícitamente fuera)
- **Una casilla aparte para la operación en curso.** Se planteó y el usuario
  eligió el 24 de agosto la opción de una sola casilla: "borrar operaciones" son
  todas, sin letra pequeña.
- **Tocar "Finalizar operación bikini"**, que sigue siendo el camino normal.
- **Detectar operaciones huérfanas y curarlas solas.** Con esto ya hay salida;
  inventar un detector de "operación sin entrevista" es adivinar.
- **Borrar los registros del día a día al borrar la operación.** Cada casilla
  borra lo suyo y solo lo suyo, que es la regla de este módulo desde la spec
  006. Ver casos límite.

## 4. Comportamiento detallado

En `js/reinicio.js`, `operacionesArchivadas(uid)` deja de filtrar y pasa a ser
`todasLasOperaciones(uid)`. La usan el recuento (`contarTodo`) y el borrado
(`borrarHistorico`, que pasa a llamarse `borrarOperaciones`).

`borrarOperacion(uid, operacionId)` **no cambia**: recorre las subcolecciones de
la operación y luego borra su documento. Una operación en curso simplemente las
tiene vacías —sus registros viven en las colecciones del día a día hasta que se
archiva—, así que el mismo código sirve para las dos y no hace falta un camino
aparte.

El comentario que decía *"La operación en curso NUNCA se borra por esta vía:
para cerrarla está 'Finalizar operación bikini', y llevársela por delante al
marcar una casilla sería una trampa"* se sustituye por el motivo nuevo: la
trampa resultó ser la contraria, porque se podía borrar la entrevista que abre
la operación y dejarla huérfana.

El aviso rojo de `index.html` pasa a:

> Esto borra tus datos para siempre. No hay vuelta atrás. Si marcas
> "Operaciones" se borra también la que tengas en marcha, sin archivarla.

La app ya se entera sola del cambio: `refrescarOperaciones()` tras el borrado
(spec 053) recalcula `hayOperacion` y `pintarPuerta()` vuelve a poner los avisos
de "primero inicia tu operación".

## 5. Modelo de datos

Sin cambios.

## 6. Casos límite

- **Borrar solo "Operaciones" y dejar los registros.** Los pesajes, comidas y
  ejercicios del día a día se quedan donde están, huérfanos: no se ven, porque
  sin operación la app no enseña esas pantallas, pero se archivarán con la
  operación **siguiente**. Es raro pero es honesto: cada casilla borra lo suyo.
  Quien quiera irse de verdad, marca todas — que es lo que dice el criterio 5.
- **Operación a medio archivar.** `borrarOperacion()` recorre sus subcolecciones
  antes de borrar el documento, así que se lleva también lo que ya se hubiera
  movido. Es el comportamiento que ya tenía con las archivadas.
- **Numeración.** `crearOperacion()` numera con `operaciones.length + 1`. Tras
  borrarlas todas, la siguiente vuelve a ser la número 1. Correcto: no queda
  ninguna con la que chocar.
- **Fotos de una operación activa.** Están en la colección `fotos` del día a
  día, no dentro de la operación, así que las borra su propia casilla. Borrar la
  operación no deja huérfanos en Cloudinary.

## 7. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/reinicio.js` | `operacionesArchivadas()` → `todasLasOperaciones()`; renombrar `borrarHistorico()`; comentarios. |
| `index.html` | El aviso rojo de la Zona de peligro. |
| `docs/PRODUCTO.md` | Ya actualizado. |
| `docs/ESTADO.md` | Al terminar. |

Tamaño estimado: ~25 líneas.

## 8. Decisiones tomadas

- **Una sola casilla, no dos.** Decisión del usuario el 24 de agosto, entre tres
  opciones: prefirió el modelo mental simple ("borrar operaciones = todas") a la
  red de seguridad de una casilla aparte para la activa.
- **No se curan operaciones huérfanas.** Con la casilla arreglada hay salida sin
  tener que adivinar cuándo una operación está "coja".
- **Se borra sin archivar.** Archivarla al vuelo sería guardar precisamente lo
  que el usuario ha dicho que quiere tirar.

## 9. Fuera de spec: ideas apuntadas

Ninguna.

## ✅ Para probar a mano

Se afina con el agente `qa-manual`.
