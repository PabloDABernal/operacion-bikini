# 002 — Registro de comidas y ejercicio

- **Estado:** completada (probada a mano por el usuario el 2026-08-10; queda pendiente comprobar el aspecto en móvil, apuntado en `docs/BACKLOG.md`)
- **Fecha:** 2026-08-10
- **Referencia en PRODUCTO.md:** líneas 15, 16, 32 y 33 (registro de comidas, registro de ejercicio, conceptos "Comida" y "Ejercicio").
- **Depende de:** spec 001 (login y pesajes), completada.

## 1. Objetivo

Que cada usuario pueda apuntar qué come y qué ejercicio hace, verlo en una lista y borrarlo, con la misma mecánica que ya tienen los pesajes. La pantalla principal pasa a organizarse en pestañas para que las tres secciones convivan.

## 2. Criterio de "esto funciona"

Probado en https://pablodabernal.github.io/operacion-bikini/ con sesión iniciada:

1. Entro y veo tres pestañas arriba: **Peso · Comidas · Ejercicio**. Se abre por defecto en **Peso**, con mis pesajes de siempre intactos.
2. Pulso **Comidas** → cambia la sección visible sin recargar la página; el formulario de peso desaparece.
3. Apunto una comida: texto `lentejas y una manzana`, momento `Comida`, fecha de hoy → aparece en la lista arriba del todo.
4. Apunto otra comida el mismo día con momento `Cena` → salen las dos, ordenadas por momento del día dentro de la misma fecha (desayuno primero, picoteo al final).
5. Pulso **Ejercicio** → apunto `bici`, `45` minutos, intensidad `Media`, fecha de hoy → aparece en su lista.
6. **F5** → sigo con sesión, sigo en la pestaña Peso (por defecto) y al cambiar de pestaña los registros siguen ahí.
7. Borro una comida y un ejercicio, confirmando cada uno → desaparecen y no vuelven tras recargar.
8. Entro con la otra cuenta → sus listas de comidas y ejercicio están vacías; no veo nada de la primera cuenta.
9. Lo abro en el móvil → las tres pestañas se ven y se pueden pulsar sin que nada se salga de la pantalla.

## 3. Alcance

### Entra

- Reorganización de la pantalla principal en tres pestañas: Peso, Comidas, Ejercicio.
- Alta, listado y borrado de comidas.
- Alta, listado y borrado de ejercicios.
- Separación por `uid` y lista blanca, extendiendo las reglas de Firestore a las dos colecciones nuevas.

### NO entra (explícitamente fuera)

- Editar una comida o un ejercicio ya guardados (misma decisión que en pesajes: borrar y reapuntar).
- Cálculo de calorías, macros o gasto energético. La app no interpreta el texto; eso es trabajo de la IA en specs posteriores.
- Fotos, botón "Consejos" y botón "Pasar consulta" (specs posteriores).
- Vista de "diario del día" que junte peso, comidas y ejercicio de una fecha.
- Recordar la última pestaña abierta entre recargas: siempre arranca en Peso.
- Buscador, filtros o paginación de las listas.
- Pulido visual, incluido el arreglo del botón de Google apuntado en `docs/BACKLOG.md`.

## 4. Comportamiento detallado

### 4.1 Pestañas

- Tres botones en la parte superior de la pantalla principal, bajo la cabecera con el email: `Peso`, `Comidas`, `Ejercicio`.
- Al pulsar uno se muestra su sección y se ocultan las otras dos. No hay recarga ni cambio de URL.
- La pestaña activa se distingue visualmente (fondo o subrayado).
- Al entrar siempre se abre **Peso**.
- La sección de peso mantiene exactamente el comportamiento de la spec 001; solo cambia de sitio. Al envolverla en la pestaña hay que **conservar los `id` existentes** (`form-pesaje`, `peso`, `fecha`, `btn-guardar`, `error-pesaje`, `lista-pesajes`, `estado-lista`, `btn-reintentar`): `js/app.js` los referencia directamente y renombrarlos rompería la spec 001 en silencio.

### 4.2 Formulario de comida

- **Qué has comido**: texto libre, obligatorio, máximo 500 caracteres.
- **Momento**: desplegable obligatorio con cinco opciones fijas, en este orden: `Desayuno`, `Comida`, `Merienda`, `Cena`, `Picoteo`. Precargado en `Comida`.
- **Fecha**: selector, precargado con hoy, obligatorio.
- Botón `Guardar comida`.

Validaciones:

| Situación | Mensaje |
|---|---|
| Texto vacío (o solo espacios) | `Escribe qué has comido.` |
| Texto de más de 500 caracteres | `Máximo 500 caracteres.` |
| Fecha vacía | `Introduce una fecha.` |
| Fecha futura | `La fecha no puede ser futura.` |

Al guardar bien: el texto se vacía, el momento vuelve a `Comida`, la fecha vuelve a hoy y la lista se refresca.

### 4.3 Lista de comidas

- Cada fila: fecha `DD/MM/AAAA`, momento, texto de la comida y botón `Borrar`.
- Orden: fecha descendente; dentro de la misma fecha, por momento del día en orden natural (Desayuno → Comida → Merienda → Cena → Picoteo); a igualdad de ambos, el más reciente primero.
- El orden por momento **se resuelve en el cliente** con un array de prioridad fijo. Un `orderBy('momento')` de Firestore ordenaría alfabéticamente (`cena, comida, desayuno…`), que no es lo pedido. Mismo patrón que el desempate por `creadoEn` de los pesajes: se pide a Firestore solo `orderBy('fecha','desc')` y el resto se ordena en JS, evitando índices compuestos.
- Estado vacío: `Aún no has apuntado ninguna comida.`

### 4.4 Formulario de ejercicio

- **Qué has hecho**: texto libre, obligatorio, máximo 200 caracteres.
- **Minutos**: número entero, obligatorio, entre 1 y 600.
- **Intensidad**: desplegable obligatorio: `Suave`, `Media`, `Fuerte`. Precargado en `Media`.
- **Fecha**: selector, precargado con hoy, obligatorio.
- Botón `Guardar ejercicio`.

Validaciones:

| Situación | Mensaje |
|---|---|
| Texto vacío (o solo espacios) | `Escribe qué ejercicio has hecho.` |
| Texto de más de 200 caracteres | `Máximo 200 caracteres.` |
| Minutos vacíos o no numéricos | `Introduce los minutos.` |
| Minutos fuera del rango 1–600 | `Los minutos deben estar entre 1 y 600.` |
| Minutos con decimales | Se redondea al entero más cercano, sin mensaje. |
| Fecha vacía | `Introduce una fecha.` |
| Fecha futura | `La fecha no puede ser futura.` |

### 4.5 Lista de ejercicios

- Cada fila: fecha `DD/MM/AAAA`, texto, `45 min`, intensidad y botón `Borrar`.
- Orden: fecha descendente; a igualdad de fecha, el más reciente primero.
- Estado vacío: `Aún no has apuntado ningún ejercicio.`

### 4.6 Borrado

Igual que en pesajes: botón `Borrar` en la fila → confirmación (`¿Borrar esta comida?` / `¿Borrar este ejercicio?`) → se elimina y se refresca la lista.

## 5. Modelo de datos

```
usuarios/{uid}/comidas/{comidaId}
  texto: string       // máx. 500 caracteres
  momento: string     // "desayuno" | "comida" | "merienda" | "cena" | "picoteo"
  fecha: string       // "AAAA-MM-DD"
  creadoEn: timestamp

usuarios/{uid}/ejercicios/{ejercicioId}
  texto: string       // máx. 200 caracteres
  minutos: number     // entero, 1-600
  intensidad: string  // "suave" | "media" | "fuerte"
  fecha: string       // "AAAA-MM-DD"
  creadoEn: timestamp
```

- `momento` e `intensidad` se guardan en minúsculas y sin acentos; la etiqueta visible se genera en el frontend.
- Reglas de seguridad: las dos colecciones nuevas se protegen igual que `pesajes` (mismo `uid` + email en la lista blanca). El resto sigue denegado.

## 6. Casos límite

- **Varias comidas del mismo momento el mismo día**: permitido, se listan todas.
- **Texto con saltos de línea**: se guarda tal cual; en la lista se muestra en una sola línea, recortando con `…` si no cabe.
- **Sin conexión**: mismos mensajes que en pesajes, adaptados (`No se ha podido guardar. Comprueba tu conexión.`, `No se han podido cargar tus comidas. Comprueba tu conexión.` + botón Reintentar, y equivalentes para ejercicio).
- **Cambiar de pestaña mientras se está guardando**: la operación termina igual y la lista se refresca; no se pierde el registro.
- **Sesión caducada estando en una pestaña**: vuelve al login, como en la spec 001.
- **Zona horaria**: fechas como texto `AAAA-MM-DD` local, sin UTC, igual que en pesajes.

## 7. Archivos afectados

- `index.html` — modificar: pestañas + dos secciones nuevas.
- `styles.css` — modificar: estilos de pestañas y de las filas nuevas.
- `js/fechas.js` — nuevo: `hoyISO`, `formatearFecha`, validación de fecha y desempate por `creadoEn`, compartidos por las tres colecciones para no triplicarlos.
- `js/pesajes.js` — modificar: pasa a usar `js/fechas.js`, sin cambio de comportamiento.
- `js/comidas.js` — nuevo.
- `js/ejercicios.js` — nuevo.
- `js/app.js` — modificar: lógica de pestañas y conexión de los dos formularios y listas.
- `firestore.rules` — modificar: reglas para `comidas` y `ejercicios`.
- `docs/PRODUCTO.md` — sin cambios: la feature ya está descrita.

## 8. Decisiones tomadas

| Decisión | Por qué |
|---|---|
| Una sola spec con comidas + ejercicio | Mismo patrón que pesajes; el trabajo de estructura y pestañas se hace una vez en vez de dos. |
| Comida = texto libre + momento del día + fecha | Apuntar es rápido; la interpretación del texto es trabajo de la IA más adelante, no de la app. |
| Ejercicio = texto libre + minutos + intensidad + fecha | Es lo que define PRODUCTO.md línea 33. |
| Pestañas en vez de scroll o diario diario | Escala cuando lleguen fotos, consejos y consulta, sin rehacer la pantalla de pesajes. |
| Sin editar, solo borrar | Coherente con la decisión de la spec 001. |
| La pestaña activa no se recuerda entre recargas | Ahorra complejidad; abrir siempre en Peso es predecible. |

Decisiones menores tomadas por Claude por ser detalle de implementación, revisables: límite de 500 caracteres en comida, 200 en ejercicio, rango 1–600 minutos, y redondeo de minutos decimales.

## 9. Fuera de spec: ideas apuntadas

- (ninguna por ahora)

## ✅ Para probar a mano

Ver apartado 2. El agente `qa-manual` afinará el guion, incluyendo la regresión de la spec 001 (que los pesajes sigan funcionando tras mover la pantalla a pestañas).
