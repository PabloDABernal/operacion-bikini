# 061 — El agua del día

- **Estado:** ✅ completada (probada y confirmada por el usuario el 2026-08-29).
- **Fecha:** 2026-08-29
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v9: lo que bebes y lo que acompaña, decidida el 29 de agosto de 2026)", primera spec de las tres.

## 1. Objetivo

Que el usuario lleve la cuenta de los vasos de agua que bebe cada día, con un
toque, desde **Hoy**, y vea cuánto le falta para su objetivo diario.

## 2. Criterio de "esto funciona"

1. En **Hoy** hay un bloque de agua con el número de vasos de hoy y un botón
   grande **"+1 vaso"**.
2. Tocar "+1 vaso" sube el número al instante, sin recargar y sin confirmar.
3. Hay una forma de **restar** un vaso, para el toque de más. Con 0 vasos, restar
   no hace nada (no existen los vasos negativos).
4. Se ve el progreso hacia el objetivo: "5 de 8 vasos". Al llegar al objetivo lo
   dice y se nota, sin bloquear nada: se puede seguir sumando por encima.
5. En **Ajustes → Perfil** se puede cambiar el objetivo diario de vasos. Por
   defecto son **8**.
6. Recargar la página: los vasos de hoy siguen ahí.
7. **Al día siguiente el contador empieza en cero**, sin borrar lo de ayer.
8. El agua **no aparece** en los puntos, ni en la racha, ni en el calendario de
   constancia. Nada de eso cambia respecto a hoy.

## 3. Alcance

### Entra

- El bloque de agua en Hoy: contador, "+1 vaso", quitar uno y progreso.
- El objetivo diario en Ajustes → Perfil.
- Persistencia en Firestore, sus reglas, y su sitio en el archivado de una
  operación y en el reinicio de datos.

### NO entra (explícitamente fuera)

- **Puntos, racha y calendario de constancia.** Decisión del usuario, apartado 8.
- **El análisis nutricional.** Ni el agua ni ninguna bebida entran ahí (v9).
- **Hora de cada vaso, tamaño del vaso, historial vaso a vaso.** Es un contador,
  no un diario de bebida.
- **Editar el agua de un día pasado.** Solo se toca la de hoy. Si te olvidaste
  ayer, se queda.
- **Gráficas ni estadísticas de agua.** Se apunta como idea.
- **Las demás bebidas** (café, cerveza): son la spec 062.
- **Recordatorios o avisos** de que bebas. La app no notifica nada, y lo de las
  notificaciones está descartado desde la v2.

## 4. Comportamiento detallado

### El bloque en Hoy

Va en la **columna izquierda** de Hoy (la del día y lo que toca hacer), debajo
del resumen y de los atajos, y **encima** de "Qué has comido hoy". Es un dato del
día, no de cómo vas: la columna derecha es la de constancia y puntos, y el agua
no tiene nada que ver con eso.

Se enseña **solo con operación activa**, como el resto de Hoy.

Contenido:

- Un título, **"Agua"**.
- El progreso en grande: **"5 de 8 vasos"**.
- El botón **"+1 vaso"**, de acción principal: es lo que se va a tocar ocho veces
  al día y tiene que ser el objetivo más fácil de acertar de la pantalla.
- Un botón discreto para **quitar uno**, claramente secundario. No es una acción
  del día a día: es el arreglo de un toque de más.

### Sumar y restar

- Sumar y restar escriben en Firestore al momento y el número cambia **al
  instante**, sin esperar a la red.
- Si la escritura falla, el número **vuelve atrás** y sale el error. Nunca se
  queda enseñando un vaso que no se guardó.
- Los avisos de guardado y de error son **excluyentes**: verlos a la vez no deja
  saber cuál es verdad. (Lección de la spec 058.)
- **Tocar ocho veces seguidas tiene que funcionar.** El número que se escribe
  sale de lo que se ve en pantalla, no de una relectura de Firestore por cada
  toque: encadenar toques rápidos no puede perder ninguno.
- **Tope de 30 vasos al día.** No es un límite de salud, es un tope contra el
  toque atascado y el bolsillo: por encima de eso, el botón deja de sumar y lo
  dice. Beberse treinta vasos de agua no es un caso real.

### Al llegar al objetivo

El texto pasa a decir que está cumplido y el bloque lo enseña visualmente. **No
se bloquea el botón**: se puede seguir sumando, y el contador dirá "10 de 8". El
objetivo es una referencia, no un techo.

### El objetivo, en Ajustes

Campo numérico en **Ajustes → Perfil**, junto al resto de datos del usuario.
Entre **1 y 20**. Vacío o fuera de rango → error, no se guarda. Por defecto
**8**, que es lo que se usa si nunca lo has tocado.

Cambiar el objetivo **no toca los vasos ya bebidos**: cambia solo contra qué se
comparan.

## 5. Modelo de datos

Colección nueva `usuarios/{uid}/agua/{fecha}`, con la **fecha como id** del
documento, igual que `analisis` (spec 030). Un documento por día, no uno por
vaso: lo único que se guarda es cuántos van.

| Campo | Tipo | Qué es |
|---|---|---|
| `vasos` | number | Cuántos vasos ese día. Entero, de 0 a 30. |
| `actualizadoEn` | timestamp | Se toca en cada suma o resta. |

El objetivo va en el documento de ajustes que ya existe, como un campo más:

| Campo | Tipo | Qué es |
|---|---|---|
| `vasosObjetivo` | number | Entre 1 y 20. Si no está, se usan 8. |

**El agua SÍ se archiva con la operación**, al revés que la despensa. Es diario,
como las comidas y los pesajes: lo que bebiste en tu operación de junio pertenece
a esa operación. Va a `COLECCIONES` **y a `NOMBRES`** en `js/operaciones.js`.

`NOMBRES` tiene fallback (`NOMBRES[nombre] || nombre`), así que sin entrada no se
rompe nada: solo se lee "Archivando agua…" en vez de un texto cuidado. Se pone
igualmente, con la etiqueta **"vasos de agua"**.

`firestore.rules`: bloque nuevo para `usuarios/{uid}/agua/{fecha}`, calcado al de
`analisis`.

### El agua SÍ necesita casilla propia en el reinicio

**Corregido el 29 de agosto tras `revisor-specs`.** El borrador decía lo
contrario —que bastaba con la casilla "operaciones"— y es **falso**. El motivo
está escrito en el propio `js/reinicio.js`, en el comentario de
`borrarOperacion()`:

> *"Sirve igual para una operación en curso (spec 056): sus subcolecciones están
> vacías, porque sus registros viven en las colecciones del día a día hasta que
> se archiva."*

Es decir: `borrarOperacion()` solo vacía `operaciones/{id}/{colección}` y borra
el documento de la operación. **Nunca toca las colecciones de primer nivel**, que
es donde vive todo lo de la operación en curso. Por eso cada colección de
`COLECCIONES` tiene además su entrada en `TIPOS`.

Sin entrada en `TIPOS`, el agua de la operación en marcha
(`usuarios/{uid}/agua/{fecha}`) **no la borraría ninguna casilla**, se quedaría
huérfana en Firestore para siempre, y `contarTodo()` tampoco la contaría: el
usuario ni se enteraría de que algo no se borró.

Así que entra en `TIPOS` con **casilla propia**, clave `agua` y etiqueta
**"vasos de agua"**. No se junta con la de comidas ni con ninguna otra: borrar lo
que comiste no tiene por qué borrar lo que bebiste, y `js/reinicio.js` ya avisa
en sus propios comentarios de lo que cuesta juntar etiquetas parecidas.

### Por qué el criterio 8 se sostiene solo

Verificado en el código, y conviene que quede escrito porque es la parte de esta
spec que más fácil sería romper sin darse cuenta:

- `calcularPuntos()` y `recorrerHistoria()` (`js/gamificacion.js`) reciben
  `pesajes, comidas, ejercicios, fotos` **como parámetros nombrados**. No iteran
  `COLECCIONES`.
- `calcularResumen()` (`js/operaciones.js`) también nombra sus cuatro colecciones
  a mano al calcular "días registrados".

Añadir `agua` a `COLECCIONES` **no puede colarla** en los puntos, la racha, el
calendario ni el resumen de la operación. Es imposible por construcción, no por
cuidado.

### El archivado no necesita nada especial

`archivar()` mueve colección a colección y deja anotado lo que queda pendiente,
así que un archivado cortado a la mitad se reanuda solo. El agua **hereda ese
mecanismo tal cual**, igual que `analisis`: no hay nada que añadir.

## 6. Casos límite

- **Sin conexión al sumar**: el número revierte y sale el error. No se encola
  nada, como en el resto de la app.
- **Ocho toques rápidos seguidos**: llegan los ocho. El estado en pantalla es la
  fuente, y cada escritura manda el total, no un incremento.
- **Pasar la medianoche con la app abierta**: el contador sigue enseñando el día
  en que se cargó la pantalla, y sumar escribiría en ese día. Es el **mismo
  problema conocido** que ya tiene "Hoy" entero, cerrado y aceptado el 27 de
  agosto. No se resuelve aquí, pero **se hereda a propósito**: el agua no debe
  inventarse un manejo de medianoche distinto del que tiene la pantalla donde
  vive.
- **Objetivo cambiado a la mitad del día**: los vasos no se tocan, solo cambia el
  "de 8".
- **Día sin documento** (nunca bebiste): son 0 vasos, y no se crea documento
  hasta el primer toque.
- **Restar con 0**: el botón no hace nada y no da error. No hay vasos negativos.
- **Reiniciar datos**: casilla propia "vasos de agua", con su recuento. La
  casilla "operaciones" se lleva el agua ya archivada, dentro de cada operación;
  la de "vasos de agua" se lleva la de la operación en curso. Es exactamente el
  mismo reparto que tienen hoy las comidas y los pesajes.

## 7. Archivos afectados

| Archivo | Qué |
|---|---|
| `js/agua.js` | **Nuevo.** Leer el día, sumar, restar, y el objetivo por defecto. |
| `index.html` | El bloque de agua en Hoy y el campo de objetivo en Ajustes. |
| `js/app.js` | Pintado del bloque, botones y refresco. |
| `js/ajustes.js` | El campo `vasosObjetivo`. |
| `js/operaciones.js` | `agua` en `COLECCIONES` y en `NOMBRES`. |
| `js/reinicio.js` | Casilla propia "vasos de agua" en `TIPOS`. **Obligatoria**, ver apartado 5. |
| `styles.css` | El bloque, el botón grande y el estado de objetivo cumplido. |
| `firestore.rules` | Bloque de `agua`. **Publicar con la CLI antes de probar.** |

Estimación: **250-300 líneas**. La 058 estimó 250-300 y salió en 408 de
JavaScript, así que este número se mira con desconfianza: **si al implementar
se pasa de 300, parar y avisar** (regla 4 de `CLAUDE.md`).

## 8. Decisiones tomadas

- **Ni puntos ni racha ni calendario** (usuario, 29 de agosto). La racha cuenta
  lo mismo que el calendario de constancia, y las fotos ya se quedaron fuera por
  eso. Si el agua contara, habría que meterla también en el calendario, o el
  calendario pintaría un día vacío que la racha da por bueno. Y es el registro
  más barato de la app: puntuarlo devalúa los puntos de lo que sí cuesta.
- **Fuera del análisis nutricional** (usuario, misma conversación): sus seis
  grupos son sólidos y rehacerlos dejaría desalineados los análisis ya guardados.
- **El contador vive en Hoy, no en Comidas** (usuario): se toca ocho veces al
  día y tiene que estar donde ya entras cada vez.
- **Es un contador, no un diario**: sin hora, sin tamaño de vaso y sin historial
  vaso a vaso. Nadie va a mirar a qué hora bebió el tercero.
- **El agua se archiva con la operación**, al revés que la despensa: es diario,
  como las comidas.
- **Casilla propia en Reiniciar datos, no mezclada con comidas** (Claude, tras
  la revisión del 29 de agosto). Es obligatorio que tenga alguna, por lo
  explicado en el apartado 5; y que sea propia porque borrar lo que comiste no
  tiene por qué borrar lo que bebiste. Ante la duda, la opción que nunca borra
  más de lo que se le pide.

## 8 bis. Pruebas

Las funciones puras de `js/agua.js` tienen sus casos en
`docs/specs/061-agua-casos.mjs`, ejecutables con `node docs/specs/061-agua-casos.mjs`.
Cubren lo que puede llegar torcido desde Firestore (`null`, texto, decimales,
negativos, por encima del tope) y la validación del objetivo. Mismo enfoque que
`059-cruce-casos.mjs`: ejecutan el módulo de verdad, recortándole los imports de
Firebase.

## 9. Fuera de spec: ideas apuntadas

- Ver la evolución del agua a lo largo de la semana o del mes.
- Que la IA vea el agua en el contexto de la conversación y de la revisión.
- Que el objetivo de vasos se ajuste solo según tu peso o el ejercicio del día.

## ✅ Para probar a mano

(Lo afina el agente `qa-manual` antes de la prueba.)
