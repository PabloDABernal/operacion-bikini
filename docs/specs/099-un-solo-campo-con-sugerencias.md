# 099 — Un solo campo con sugerencias de recetas e ingredientes

- **Estado:** borrador
- **Fecha:** 2026-09-06
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v16: registrar en un toque)", segundo punto

## 1. Objetivo

En Comidas → Apuntar → "Nueva comida", sustituir el interruptor de tres modos
(Escribir / Una receta mía / Elegir de mi despensa) por un solo campo de
texto que, mientras escribes, sugiere tus recetas y los ingredientes marcados
de tu despensa. Enlazar la comida pasa a ser lo natural, no una decisión
previa entre tres botones.

## 2. Criterio de "esto funciona"

1. Entro en Comidas → Apuntar. El formulario "Nueva comida" tiene un solo
   campo de texto ("Qué has comido"), sin el interruptor de tres botones que
   había antes.
2. Escribo "lent". Aparece una lista de sugerencias con las recetas y los
   ingredientes marcados de mi despensa cuyo nombre contiene "lent" (por
   ejemplo "Lentejas con verduras", receta, y "lentejas", ingrediente),
   distinguidos con un icono.
3. Toco la receta "Lentejas con verduras". El campo se vacía y debajo aparece
   un chip con su nombre.
4. Escribo "manzana" y elijo el ingrediente "manzana" de las sugerencias. Se
   añade un segundo chip, junto al de la receta, con un campo pequeño de
   "cantidad" (opcional) al lado.
5. Guardo la comida. En "Lo que llevo apuntado" veo un registro cuyo texto es
   "Lentejas con verduras. manzana" (o con la cantidad, si la puse), enlazado
   a la receta y al ingrediente.
6. Repito el alta pero esta vez solo escribo "un café con leche" sin elegir
   ninguna sugerencia, y lo guardo. Se apunta como texto libre, sin enlazar
   nada — igual que el modo "Escribir" de antes de esta spec.
7. Elijo una receta, luego quito su chip con la ×. El campo vuelve a
   aceptar texto libre para esa comida.
8. Sin ninguna receta guardada y sin ningún ingrediente marcado en mi
   despensa, escribo cualquier cosa: no aparece ninguna sugerencia y el
   campo funciona como texto libre sin más.
9. Voy a mis estadísticas de "Qué comes" (spec 095): una comida con varios
   ingredientes sueltos enlazados cuenta cada uno de ellos, no solo el
   primero.

## 3. Alcance

### Entra
- Un solo campo en "Nueva comida", con sugerencias mientras se escribe:
  las recetas del Recetario y los ingredientes **marcados** de la despensa
  cuyo nombre contenga el texto escrito, en una sola lista, cada fila con un
  icono que diga si es receta o ingrediente.
- **Se puede elegir cuantas sugerencias se quiera, de los dos tipos a la
  vez**: varias recetas y varios ingredientes sueltos en la misma comida, sin
  límite de ninguno de los dos. Cada elección se suma como un chip.
- Cada chip de receta se quita con ×, como hoy. Cada chip de ingrediente
  lleva además un campo de cantidad opcional, y se quita con ×.
- **Elegir una sugerencia sustituye lo que hubiera escrito a mano** y vacía
  el campo. A partir de ahí, mientras haya al menos un chip, el campo **solo
  sirve para buscar y añadir más sugerencias**: no admite texto libre para
  esa comida — es una cosa (chips) o la otra (texto tecleado a mano), nunca
  las dos combinadas. Quitar todos los chips devuelve el campo a texto
  libre.
- Si no se elige ninguna sugerencia, la comida se guarda como texto libre sin
  enlazar nada, exactamente igual que el modo "Escribir" de antes.
- El texto final que se guarda, cuando hay chips, es la unión de sus nombres
  (el de la receta, o "nombre (cantidad)" del ingrediente) con ". ", en el
  orden en que se fueron eligiendo — mismo criterio que ya usa
  `textoDeLasRecetas()` hoy.
- **Cambio de modelo de datos**: `ingredienteId` (un solo id, string) pasa a
  `ingredienteIds` (lista), para poder llevar varios ingredientes sueltos a la
  vez. Mismo patrón que `recetaId` → `recetaIds` en la spec 088: **no se migra
  nada**, se añade una función que lee las dos formas, y las comidas viejas
  con el campo antiguo se siguen leyendo igual.
- Los tres botones del interruptor y sus tres paneles desaparecen del HTML.

### NO entra (explícitamente fuera)
- **No toca la edición de una comida ya guardada** (spec 007): el editor en
  línea del diario sigue como está, sin el campo de sugerencias.
- **No toca Mi dieta ni "Lo que toca ahora"** (spec 098): esas pantallas
  siguen apuntando con las recetas que ya trae el plan, sin pasar por este
  campo ni por sus sugerencias.
- **No cambia qué momento propone el formulario por defecto**: eso es la
  spec 100.
- **No añade cantidades como inventario** ni a la despensa ni a las recetas:
  la "cantidad" del chip de ingrediente es una frase descriptiva dentro del
  texto de la comida, exactamente como ya lo es hoy en "Elegir de mi
  despensa" — no se guarda en ningún sitio aparte ni se sigue la pista de
  cuánto queda.
- **No toca los acompañamientos** (spec 063) ni la fecha/hora del formulario:
  siguen exactamente igual.

## 4. Comportamiento detallado

**El campo.** Sustituye al `<textarea id="comida-texto">` actual (que
convivía con el interruptor). Mientras se escribe (a partir de 2 caracteres,
convención de implementación para no listar todo el recetario y toda la
despensa con la primera letra), se muestran las recetas y los ingredientes
marcados cuyo nombre contenga el texto, sin distinguir mayúsculas ni tildes
(mismo criterio de comparación que ya usa la despensa). La lista se corta a un
número razonable de resultados (convención de implementación, no de
producto) para que quepa en pantalla.

**Elegir una sugerencia:**
- Se añade un chip con su nombre (y, si es un ingrediente, un campo de
  cantidad vacío al lado).
- El campo de texto se vacía, listo para seguir escribiendo y añadir otra
  sugerencia si se quiere.
- A partir de aquí, lo que se escriba en el campo solo sirve para buscar
  MÁS sugerencias que añadir como chips: no se guarda como texto suelto
  mientras haya al menos un chip.

**Quitar todos los chips** devuelve el campo a su comportamiento de texto
libre normal: lo que se escriba a partir de ahí se guarda tal cual, salvo que
se vuelva a elegir una sugerencia.

**El texto final.** Con uno o más chips: la unión de sus nombres —el de cada
receta, o "nombre (cantidad)"/"nombre" de cada ingrediente— con ". ", en el
orden en que se añadieron. Sin ningún chip: el texto tal cual se escribió.

**Guardado.** El envío manda `recetaIds` (los ids de los chips de receta) e
`ingredienteIds` (los ids de los chips de ingrediente), igual que hoy se
manda `recetaIds` y se mandaba `ingredienteId`.

**El momento, la fecha/hora y los acompañamientos** del formulario no
cambian: siguen exactamente donde están y como funcionan hoy.

## 5. Modelo de datos

`comida.ingredienteId` (string, spec 084) pasa a `comida.ingredienteIds`
(lista de strings). **No se migra nada** en Firestore: se añade
`idsDeIngredienteDe(comida)`, que lee `ingredienteIds` si es una lista, o
`ingredienteId` si es el campo antiguo, y devuelve siempre una lista (mismo
patrón que `idsDeRecetaDe()` en `js/dietas.js`, de la spec 088). Es el único
sitio del proyecto que sabe que existen las dos formas.

Sitios que hoy leen `comida.ingredienteId` directamente y pasan a leer las dos
formas:
- `js/estadisticas.js`, para saber si una comida está enlazada y para sumar
  qué ingredientes se repiten más (spec 095) — sumando cada ingrediente de la
  lista, no solo uno. **Con su propia función local**, no importando
  `idsDeIngredienteDe()` de `js/comidas.js`: ese archivo es cálculo puro sin
  importar nada que toque Firestore (ni siquiera usa `idsDeRecetaDe()` de
  `js/dietas.js` para las recetas, por el mismo motivo), y así el guion de
  pruebas de la spec 095 sigue funcionando sin tocarlo.

`js/compra.js` **no se toca**: el `ingredienteId` que usa ahí viene de las
líneas estructuradas de una receta (spec 082), no del `ingredienteId` de una
comida del diario — son dos campos distintos que comparten nombre por
casualidad.

Las reglas de Firestore no distinguen tipos de campo dentro de una comida
(no hay validación de esquema por campo), así que **no hace falta tocarlas**.

## 6. Casos límite

- **Sin recetas ni ingredientes marcados**: no aparece ninguna sugerencia; el
  campo se comporta como texto libre puro, sin ningún desplegable vacío ni
  botón deshabilitado que explicar (los tres botones desaparecen del todo).
- **El texto escrito coincide exacto con el nombre de una receta o un
  ingrediente, pero no se elige de la lista**: se guarda como texto libre,
  sin enlazar nada. Enlazar es un acto explícito (elegir de la lista), nunca
  una coincidencia de texto.
- **Una receta y un ingrediente con nombres iguales o parecidos**: los dos
  aparecen en la lista de sugerencias, cada uno con su icono; elegir uno no
  afecta al otro.
- **Un ingrediente elegido se desmarca de la despensa después** de guardar la
  comida: el enlace se queda, igual que pasa hoy con un solo ingrediente.
- **Comidas antiguas con `ingredienteId` (singular)**: se siguen leyendo y
  mostrando igual, vía `idsDeIngredienteDe()`.
- **Se borra una receta o un ingrediente ya enlazado a una comida vieja**:
  sin cambios respecto a hoy — el nombre deja de encontrarse y se trata como
  ya se trata un enlace roto en el resto de la app.

## 7. Archivos afectados

- `index.html`: quitar el interruptor de tres botones y los tres paneles
  (`panel-comida-escribir`, `panel-comida-receta`, `panel-comida-despensa`);
  un campo de texto con su lista de sugerencias y una zona de chips debajo.
- `js/app.js`: sustituir `modoComida`, `actualizarModoComida()` y
  `pintarPanelDeReceta()` por la lógica fusionada (sugerencias mezcladas,
  estado de chips elegidos —recetas e ingredientes, cada uno con su
  cantidad si aplica—, construcción del texto final); el envío del
  formulario pasa a mandar `ingredienteIds` en vez de `ingredienteId`.
- `js/comidas.js`: `validarComida()` y `guardarComida()` cambian
  `ingredienteId` por `ingredienteIds`; nueva función
  `idsDeIngredienteDe(comida)` (mismo patrón que `idsDeRecetaDe`).
  `actualizarComida()` (edición, spec 007) **no se toca**: comprobado en el
  código, hoy no escribe `ingredienteId` en absoluto — coherente con que esta
  spec no toca la edición de una comida ya guardada.
- `js/estadisticas.js`: usar `idsDeIngredienteDe(comida)` en los dos sitios
  que hoy miran `comida.ingredienteId`.
- `styles.css`: estilos del campo con sugerencias y de los chips mixtos
  (puede generalizar `.chip-receta` o añadir una variante para ingredientes).
- `docs/specs/099-...-casos.mjs`: casos de `idsDeIngredienteDe()` y, si se
  extrae a función pura, del filtrado/orden de sugerencias.

**Trampa conocida**: `recetasElegidas` ya existe como estado del formulario
(spec 093). Pasa a convivir con un estado equivalente para los ingredientes
elegidos (cada uno con su cantidad), y hay que respetar el ORDEN en que se
fueron añadiendo ambos tipos para construir el texto final correctamente.

**Tamaño estimado**: al tocar esquema de datos, formulario y un consumidor de
estadísticas a la vez, es probable que esta spec supere las ~300 líneas de
aviso de `CLAUDE.md`. Si al implementarla se confirma, se avisa antes de
seguir y se valora partirla.

## 8. Decisiones tomadas

- **Se puede mezclar todo**: varias recetas y varios ingredientes sueltos a
  la vez, sin límite de ninguno de los dos. Decisión del usuario, tomada
  sabiendo que esto cambia `ingredienteId` a `ingredienteIds` — el mismo
  cambio que ya se hizo con `recetaId` → `recetaIds` en la spec 088, con el
  mismo patrón de "no migrar nada".
- **Elegir una sugerencia sustituye lo escrito a mano**, y mientras haya
  chips no se puede mezclar con texto libre en la misma comida. Decisión del
  usuario.
- **La cantidad de un ingrediente sigue siendo un campo aparte**, no se
  escribe dentro del texto libre. Decisión del usuario.
- **Las sugerencias de recetas e ingredientes van mezcladas en una sola
  lista**, cada una con su icono, en vez de en dos grupos separados.
  Decisión del usuario.

## 9. Fuera de spec: ideas apuntadas

Ninguna surgida durante la escritura de esta spec.

## ✅ Para probar a mano

(la rellena/afina el agente `qa-manual` antes de la prueba)
