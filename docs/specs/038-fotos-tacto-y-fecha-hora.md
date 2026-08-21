# 038 — Fotos en la navegación, zonas táctiles y fecha/hora plegable en Ejercicio y Peso

- **Estado:** en implementación (código en `main`, `revisor-specs` y `revisor-codigo` con veredicto favorable el 2026-08-21). Pendiente de que el usuario la pruebe.
- **Fecha:** 2026-08-21
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v4, decidida el 20 de agosto de 2026)", puntos **"Fotos deja de estar escondida"** y **"Menos fricción al apuntar"**.

## 1. Objetivo

Tres flecos sueltos de la v4 que quedaron fuera de las specs 034-037: Fotos
solo se alcanza desde un atajo de Hoy y no tiene sitio propio en la
navegación; los botones de tipo enlace (Cancelar, Quitar filtro, Volver...)
son pequeños para el dedo; y Ejercicio y Peso siguen con Fecha y Hora
siempre a la vista, mientras que Comidas ya las plegó en la spec 037. Al
terminar esta spec, Fotos se navega como cualquier otra sección, los enlaces
se aciertan sin puntería, y Ejercicio y Peso se comportan como Comidas.

## 2. Criterio de "esto funciona"

1. La barra de navegación (abajo en móvil, arriba en escritorio) pasa de
   cinco a **seis botones**: Hoy, Peso, Comidas, Ejercicio, **Fotos**,
   Consulta, en ese orden. Tocar "Fotos" lleva a la sección de fotos.
2. El atajo "Foto del día" de Hoy sigue existiendo y sigue funcionando igual
   que hasta ahora (llega al mismo sitio que el botón nuevo de la barra).
3. Cualquier botón de tipo enlace de la app (Cancelar, Quitar filtro, Volver,
   Cancelar receta, Cancelar dieta...) tiene una zona táctil de **al menos
   44×44 px**, aunque el texto siga viéndose del mismo tamaño que ahora.
4. **Ejercicio → Nuevo ejercicio**: Fecha y Hora no se ven de entrada; un
   botón "Cambiar fecha y hora" las despliega; guardar sin desplegarlas usa
   la fecha y hora de ahora mismo; tras guardar con éxito, vuelven a
   plegarse.
5. **Peso → Nuevo pesaje**: igual que el punto 4, para su Fecha y Hora.
6. Todo lo anterior funciona igual en móvil y en escritorio.
7. Nada de lo que ya funcionaba en Fotos, en los enlaces, ni en Ejercicio o
   Peso deja de funcionar.

## 3. Alcance

### Entra

- Añadir "Fotos" como sexto botón de la navegación principal.
- Ampliar la zona táctil de la clase `.enlace` a 44×44 px como mínimo, en
  toda la app.
- Ejercicio y Peso: plegar Fecha y Hora del formulario de apuntar, con el
  mismo patrón que la spec 037 usó en Comidas (control que despliega, se
  repliega solo al guardar con éxito).

### NO entra (explícitamente fuera)

- **Ningún cambio de contenido en la sección Fotos**: esta spec solo la
  engancha a la navegación. La rejilla de miniaturas, el visor y la subida
  siguen exactamente igual.
- **Ningún cambio en Ajustes.** Sigue en el avatar, sin sub-pestañas ni
  reordenación (`docs/BACKLOG.md`).
- **"Lo de siempre" o chips en Ejercicio o Peso.** La spec 037 los añadió en
  Comidas porque ahí existía "Lo de siempre"; Ejercicio tiene su propio
  catálogo en su sub-pestaña y Peso no tiene equivalente. Aquí solo se pliega
  Fecha/Hora, nada más de lo que hizo la 037.
- **Cambiar qué botones son de tipo enlace.** Esta spec no convierte ningún
  botón normal en enlace ni al revés: solo agranda la zona táctil de los que
  ya lo son.
- **Iconos en la barra de navegación** (seguía en `docs/BACKLOG.md` desde la
  spec 009). Los seis botones siguen siendo solo texto.

## 4. Comportamiento detallado

### Fotos en la navegación

- Se añade `<button class="nav-boton" data-seccion="fotos">Fotos</button>`
  entre Ejercicio y Consulta, igual que los demás — se engancha solo al
  `querySelectorAll(".nav-boton, .atajo")` que ya corre al cargar.
- La barra ya encoge la letra con `clamp()` para que quepan cinco botones en
  320 px sin partir palabras ni abreviar (comentario en `styles.css`); con
  seis, la letra se encoge más, pero el mecanismo es el mismo y no hace falta
  tocarlo.
- El atajo "Foto del día" de Hoy no cambia: sigue llamando a
  `abrirPestana("fotos")`.

### Zonas táctiles de los enlaces

- La clase `.enlace` gana relleno (padding) hasta que su caja táctil llegue
  a 44×44 px, sin agrandar el texto ni cambiar su aspecto (sigue siendo
  texto subrayado, sin fondo ni borde).
- Se aplica a los once usos actuales de `.enlace` en la app (Cancelar,
  Quitar filtro de las tres listas, Cancelar receta, Cancelar dieta,
  Cancelar tabla, Cancelar ejercicio de catálogo, Volver del archivo...) sin
  tocar ninguno de ellos uno a uno: es un cambio en la clase compartida.

### Ejercicio y Peso: Fecha y Hora plegadas

- Mismo patrón que la spec 037 en Comidas: un botón ("Cambiar fecha y hora")
  antes de Fecha y Hora, que las despliega y se oculta a sí mismo; al guardar
  con éxito, los campos se repliegan y el botón reaparece; si no se despliega
  nada, se guarda con los valores precargados de ahora mismo.
- En Ejercicio, Fecha y Hora van después de "Intensidad" (su posición
  actual); en Peso, después de "Peso (kg)" (su única posición posible, es el
  único otro campo). No se reordena ningún campo, solo se envuelven Fecha y
  Hora y se les añade el control.
- Nada de "lo de siempre" ni chips aquí: ver "NO entra".

## 5. Modelo de datos

**Ninguno.** No se toca Firestore ni `firestore.rules`.

## 6. Casos límite

- **Enlaces dentro de una fila estrecha**: `btn-quitar-filtro-pesajes`,
  `-comidas` y `-ejercicios` viven dentro de `.filtro-dia`, en una fila flex
  junto a un `<input type="date">`. Al dar más relleno a `.enlace`, hay que
  comprobar que esa fila no se descuadra en móvil a 320 px (el input y el
  enlace deben seguir cabiendo uno junto al otro, envolviendo si hace falta).
- **Con la ventana muy estrecha (320 px) y seis botones en la barra**: el
  texto se encoge con el `clamp()` ya existente; ningún botón debe partirse
  en dos líneas ni desaparecer.
- **Fotos sin operación en marcha**: la sección ya tiene su propio aviso
  "Primero inicia tu operación bikini desde Hoy" (igual que Peso, Comidas y
  Ejercicio). Se mantiene tal cual; esta spec no toca esa regla, solo añade
  la forma de llegar allí desde la barra.
- **Un enlace muy corto** (p. ej. "×" o similar, si lo hubiera): la zona
  táctil de 44×44 px se centra igualmente sobre el texto.
- **Ejercicio o Peso: guardar, y volver a guardar otro registro sin recargar
  la página**: Fecha y Hora deben volver a estar plegadas cada vez, no solo
  la primera.
- **Editar un pesaje o ejercicio ya guardado** (`filaEditable`): es un
  formulario distinto del de "Nuevo pesaje"/"Nuevo ejercicio" y no se toca
  aquí, igual que ya se dejó fuera en la 037 para comidas.

## 7. Archivos afectados

| Archivo | Qué se hace |
|---|---|
| `index.html` | Añade el botón "Fotos" a `#nav-inferior`. Envuelve Fecha/Hora de Ejercicio y de Peso en su contenedor plegable con el control, igual que ya está en Comidas. |
| `styles.css` | Zona táctil de `.enlace` a 44×44 px. Ningún cambio nuevo de maquetación para Fotos (el botón usa `.nav-boton` tal cual). |
| `js/app.js` | Dos toggles nuevos para Fecha/Hora (uno para Ejercicio, uno para Peso), igual que el que ya existe para Comidas. Los submits de `#form-pesaje` y `#form-ejercicio` vuelven a plegar los campos tras guardar con éxito. |
| `docs/ESTADO.md` | Al terminar, cuando el usuario la valide. |

**Tamaño estimado:** por debajo de las ~300 líneas de `CLAUDE.md` — es más
pequeña que la 037: el botón de Fotos es una línea, la zona táctil es una
regla CSS, y el plegado de fecha/hora es repetir un patrón que ya existe dos
veces (una por formulario).

## 8. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| Fotos como sexto botón de la barra principal | Elegido por el usuario el 2026-08-21, frente a colgarlo del menú de Ajustes/avatar |
| Zona táctil mínima de 44×44 px en `.enlace` | Elegido por el usuario el 2026-08-21: es el mínimo recomendado por las guías de accesibilidad táctil (Apple/WCAG) |
| Fecha/hora plegable en Ejercicio y Peso, igual que en Comidas (spec 037) | Elegido por el usuario el 2026-08-21, sin diferencias respecto al patrón ya implementado |
| Una sola spec para las tres cosas | Elegido por el usuario el 2026-08-21, como se hizo con la 037 |
| Sin chips ni "lo de siempre" en Ejercicio/Peso | Ninguno de los dos tiene un equivalente de "lo de siempre" como Comidas; añadir algo ahí sería producto nuevo no pedido |

## 9. Fuera de spec: ideas apuntadas

- Iconos en la barra de navegación (ya estaba en `docs/BACKLOG.md`, spec 009).
- Reordenar Ajustes (ya estaba en `docs/BACKLOG.md`).
- Chips o "lo de siempre" para ejercicios frecuentes en el formulario de
  Ejercicio, si algún día se quiere algo parecido a lo de Comidas.

## ✅ Para probar a mano

Se prueba en producción: https://operacion-bikini.vercel.app, con una
operación en marcha.

### Navegación: Fotos

1. Mira la barra de navegación (abajo en móvil, arriba en escritorio):
   ahora tiene **seis botones — Hoy, Peso, Comidas, Ejercicio, Fotos,
   Consulta**, en ese orden.
2. Toca "Fotos": llegas a la sección de fotos.
3. Vuelve a **Hoy** y toca el atajo **"Foto del día"**: llegas al mismo sitio
   que con el botón de la barra.

### Zona táctil de los enlaces

4. En cualquier sitio con un enlace (p. ej. "Cambiar fecha y hora" en
   Comidas, o "Quitar filtro" tras filtrar por día en cualquier lista):
   fíjate en que el texto se ve **del mismo tamaño de siempre**, pero hay
   más aire a su alrededor. Tócalo cerca del borde de ese aire, no solo
   sobre la letra: debe responder igual.

### Ejercicio y Peso: fecha y hora plegadas

5. Entra en **Ejercicio → Apuntar**. Tras "Intensidad" **no ves Fecha ni
   Hora**: hay un botón "Cambiar fecha y hora".
6. Sin tocarlo, rellena "Qué has hecho" y "Minutos", y guarda. Se apunta con
   la fecha y hora de ahora mismo (como si los campos hubieran estado
   siempre a la vista).
7. Abre el formulario de nuevo (o guarda otro ejercicio): Fecha y Hora
   **vuelven a estar plegadas**, con el botón de nuevo visible.
8. Esta vez, toca "Cambiar fecha y hora": aparecen los campos y el botón
   desaparece. Cambia la fecha o la hora y guarda: se apunta con lo que
   pusiste.
9. Repite los pasos 5 a 8 en **Peso → Nuevo pesaje** (el botón va tras
   "Peso (kg)", que es el único otro campo).

### Casos límite

10. Con la ventana a **320 px de ancho** (F12 → modo responsive), mira la
    barra con los seis botones: la letra se encoge, pero ningún botón se
    parte en dos líneas ni desaparece.
11. Con esa misma anchura, filtra por día en Comidas o Ejercicio: la fila
    con el campo de fecha y el enlace "Quitar filtro" sigue cabiendo (puede
    envolver a una segunda línea, pero nada se corta ni se sale de la
    pantalla).
12. En Ejercicio o en Peso, guarda **dos veces seguidas sin recargar la
    página**: las dos veces, Fecha y Hora empiezan plegadas.

### Regresión

13. **Comidas → Apuntar** sigue exactamente igual que tras la spec 037:
    chips de "Lo de siempre" junto al texto, Fecha y Hora plegadas con el
    mismo patrón. Esta spec no la tocó.
14. Los seis botones de la barra llevan cada uno a su sección, y **Ajustes**
    (desde el avatar) sigue accesible y sin cambios.
15. Sin operación en marcha, entra en **Fotos** desde la barra: ves el mismo
    aviso "Primero inicia tu operación bikini desde Hoy" que en Peso,
    Comidas y Ejercicio — la sección no se rompe por tener ya un botón
    propio.

Si todo lo anterior pasa, la spec 038 queda **completada**.
