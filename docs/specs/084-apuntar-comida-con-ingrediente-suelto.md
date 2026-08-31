# 084 — Apuntar una comida con un ingrediente suelto de la despensa

- **Estado:** ✅ completada el 31 de agosto de 2026 (commit `6f0a8c5`), revisada por `revisor-specs` (dos rondas) y `revisor-codigo` (CUMPLE), probada por el usuario en producción.
- **Fecha:** 2026-08-31
- **Referencia en PRODUCTO.md:** "Qué hará (evolutivos de la fase productiva, desde el 31 de agosto de 2026)"

## 1. Objetivo

En Comidas → Apuntar, además de escribir libremente lo que has comido, se
puede elegir directamente un ingrediente de tu despensa (de los que tienes
marcados) y una cantidad opcional, sin tener que crear una receta de un
solo ingrediente. La comida guardada queda enlazada de verdad a ese
ingrediente.

Es la última de las cuatro specs relacionadas (082 ingredientes
estructurados y 083 editar desde el día, ya cerradas; la reorganización
visual de Comidas queda para otra sesión aparte).

## 2. Criterio de "esto funciona"

1. En Comidas → Apuntar → Nueva comida, junto al campo "Qué has comido"
   hay un interruptor con dos modos: "Escribir" (el de hoy, por defecto) y
   "Elegir de mi despensa".
2. Al cambiar a "Elegir de mi despensa", el textarea se sustituye por un
   desplegable con los ingredientes que tienes MARCADOS ahora mismo
   (`tengo: true`) en tu despensa, y un campo de cantidad opcional al lado.
3. Eliges "Yogur natural", pones "200 g" (o lo dejas vacío) y guardas: la
   comida queda apuntada con el texto "Yogur natural (200 g)" (o solo
   "Yogur natural" si no pusiste cantidad), en el momento, fecha y hora que
   corresponda — igual que cualquier otra comida.
4. Esa comida, vista en el diario (lista de comidas apuntadas), se lee
   exactamente igual que cualquier otra: no hay diferencia visual con una
   escrita a mano.
5. Si vuelves a "Escribir" tras haber elegido un ingrediente, se olvida la
   elección: guardar en modo "Escribir" nunca lleva un ingrediente
   enlazado, aunque hubieras tocado el desplegable un momento antes.
6. Si no tienes NINGÚN ingrediente marcado en tu despensa, el botón
   "Elegir de mi despensa" del interruptor está deshabilitado (con una
   nota de por qué) y el formulario se queda en "Escribir", sin
   fricción.
7. Repetir con "Lo de siempre" (los chips de comidas repetidas) sigue
   funcionando igual: son atajos de texto, y no interfieren con el modo
   nuevo.

## 3. Alcance

### Entra
- El formulario "Nueva comida" (`js/app.js`/`index.html`, sub-pestaña
  Apuntar de Comidas): interruptor Escribir/Elegir de mi despensa,
  desplegable de ingredientes marcados, campo de cantidad opcional.
- `comida.ingredienteId`: campo nuevo, opcional, en el documento de
  `usuarios/{uid}/comidas`. Se guarda cuando la comida se apuntó eligiendo
  un ingrediente; no existe (o es vacío) en una comida escrita a mano.
- `validarComida()`/`guardarComida()` (`js/comidas.js`): aceptan el
  `ingredienteId` opcional.

### NO entra (explícitamente fuera)
- Editar el enlace de una comida YA apuntada: la edición de una comida
  (icono lápiz en el diario) sigue siendo el textarea de texto libre de
  siempre, sin el interruptor. Si quieres cambiar el ingrediente, borras y
  vuelves a apuntar. Decisión de alcance para mantener esta spec pequeña.
- Cualquier cruce, análisis o pantalla nueva que LEA `comida.ingredienteId`
  (por ejemplo, saber cuánto sueles comer de un ingrediente): esta spec
  solo guarda el enlace, no lo usa todavía en ningún sitio. Es la base
  para si algún día hace falta.
- Cambiar qué ingredientes salen en el desplegable más allá de "los
  marcados ahora": no se ofrece ver también los no marcados.
- Reorganizar Comidas visualmente (spec pendiente, sesión aparte).

## 4. Comportamiento detallado

- El interruptor: dos botones tipo pestaña, con la clase `panel-recetario-boton`
  que ya trae la spec 085 para el interruptor Recetas/Ingredientes del
  Recetario — mismo concepto (dos opciones dentro de un panel), mismo
  aspecto, sin inventar un estilo nuevo. Vive junto al `<label>` "Qué has
  comido", antes del campo en sí.
- Modo "Escribir" (por defecto, y al cargar la pantalla): el textarea de
  siempre, comportamiento sin cambios.
- Modo "Elegir de mi despensa":
  - Un `<select>` con los ingredientes de `despensaCargada` que tengan
    `tengo: true`, ordenados igual que ya hace `ordenarDespensa()`.
  - Un campo de texto de cantidad, opcional, máximo 40 caracteres (mismo
    criterio y tope que la cantidad de una línea de receta, spec 082:
    texto libre, sin validar formato).
  - Si `despensaCargada.filter(i => i.tengo)` está vacío: el botón "Elegir
    de mi despensa" del interruptor se deshabilita (`disabled`), con un
    `title`/texto explicando que no tienes ningún ingrediente marcado, y
    el formulario se queda forzado en modo "Escribir". Nunca hay un modo
    activo en el que no se pueda guardar. Decisión del usuario.
- Al guardar (`submit` de `form-comida`): si el modo activo es "Elegir de
  mi despensa" y hay un ingrediente elegido, el texto que se manda a
  `validarComida()` se construye como `nombre` o `` `${nombre} (${cantidad})` ``
  (si hay cantidad), y se manda además el `ingredienteId` del ingrediente
  elegido. Si el modo activo es "Escribir", `ingredienteId` va vacío,
  exactamente como hoy.
- Al guardar con éxito, el formulario se limpia y vuelve al modo
  "Escribir" (igual que el resto de campos vuelven a su estado inicial).

## 5. Modelo de datos

`usuarios/{uid}/comidas/{comidaId}` gana un campo opcional:

```
ingredienteId: string  // id de usuarios/{uid}/despensa/{ingredienteId}, o "" si no aplica
```

El `texto` de la comida sigue siendo el único campo que se lee en todos
los sitios que ya existen (diario, buscador, análisis nutricional...): el
enlace es metadato aparte, no sustituye al texto. Sigue el mismo patrón
denormalizado que `comida.recetaId` en la dieta (spec 060): si el
ingrediente se borra de la despensa después, la comida ya apuntada
conserva su texto tal cual, sin verse afectada.

## 6. Casos límite

- El ingrediente elegido se borra de la despensa DESPUÉS de apuntar la
  comida: la comida ya guardada no cambia (su `texto` es independiente).
  `comida.ingredienteId` queda apuntando a un documento que ya no existe;
  como nadie lo lee todavía (ver "NO entra"), no hay ningún efecto visible.
- Cantidad con caracteres largos o raros: mismo tope y criterio que la
  cantidad de una línea de receta (spec 082).
- Cambiar de "Elegir de mi despensa" a "Escribir" y de vuelta a "Elegir de
  mi despensa": el ingrediente/cantidad elegidos se pierden al cambiar de
  modo (no se recuerdan), para no arrastrar un enlace a medio confirmar.
- Guardar en modo "Elegir de mi despensa" sin haber elegido ningún
  ingrediente (desplegable en su opción en blanco, si la hay): se trata
  como el error de siempre, "Escribe qué has comido" o equivalente — no se
  guarda una comida vacía.

## 7. Archivos afectados

- `js/comidas.js`: `validarComida()` y `guardarComida()`, para aceptar
  `ingredienteId`.
- `js/app.js`: el formulario "Nueva comida" (interruptor, desplegable,
  campo de cantidad, y el `submit`).
- `index.html`: el HTML del interruptor y el desplegable nuevo.
- `styles.css`: reutiliza `.subpestanas-internas`/`.panel-recetario-boton`
  (spec 085) para el interruptor; sin estilos nuevos salvo que algo no
  encaje.

## 8. Decisiones tomadas

- **La comida queda enlazada de verdad** al ingrediente (`ingredienteId`),
  no solo con el texto relleno. Decisión del usuario, pensando en cruces
  futuros — que esta spec NO implementa, solo deja el dato guardado.
- **El interruptor Escribir/Elegir de mi despensa**, no un botón que
  añade al texto ya escrito. Decisión del usuario.
- **Solo los ingredientes marcados (`tengo: true`)** salen en el
  desplegable. Decisión del usuario.
- **Con la despensa sin ningún ingrediente marcado, el botón "Elegir de mi
  despensa" se deshabilita** y el formulario se queda en "Escribir" —
  nunca hay un modo activo en el que no se pueda guardar. Decisión del
  usuario, tras la revisión de `revisor-specs`.
- **Editar una comida ya apuntada no lleva el interruptor**: sigue siendo
  texto libre, para mantener la spec pequeña. Decisión del usuario (alcance).

## 9. Fuera de spec: ideas apuntadas

- Usar `comida.ingredienteId` para algún cruce o análisis futuro (cuánto
  sueles comer de un ingrediente, por ejemplo): anotado como posible
  evolutivo, no decidido.

## ✅ Para probar a mano

(Lo afina el agente `qa-manual` antes de la prueba; guion provisional.)

1. En Comidas → Apuntar, comprueba que "Escribir" es el modo por defecto
   y que apuntar una comida de texto libre funciona exactamente igual que
   antes.
2. Cambia a "Elegir de mi despensa". Debe salir un desplegable con los
   ingredientes que tienes marcados ahora mismo (comprueba que uno que
   NO tienes marcado no sale).
3. Elige uno, pon una cantidad, y guarda. Comprueba en el diario que la
   comida se lee "Ingrediente (cantidad)".
4. Repite sin poner cantidad: debe leerse solo el nombre del ingrediente.
5. Cambia a "Elegir de mi despensa", elige uno, y vuelve a "Escribir"
   antes de guardar: guarda un texto libre y comprueba (mirando la app,
   o si hace falta con las herramientas de desarrollo) que esa comida NO
   lleva `ingredienteId`.
6. Desmarca todos los ingredientes de tu despensa (o bórralos) y vuelve a
   Apuntar: el botón "Elegir de mi despensa" debe salir deshabilitado, con
   una nota de por qué, y el formulario en "Escribir" — puedes apuntar por
   texto sin fricción. Vuelve a marcar alguno para dejar la despensa como
   estaba.
