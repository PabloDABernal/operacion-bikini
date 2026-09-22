# 104 — Recetas compartidas: colección común, autor y permisos de edición

- **Estado:** revisada (con avisos aceptados a propósito por el usuario, ver nota abajo)
- **Fecha:** 2026-09-22
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v18: recetas compartidas, decidida el 22 de septiembre de 2026)"

> **Nota tras `revisor-specs` (22 de septiembre de 2026):** el agente marcó
> "NECESITA CAMBIOS" con el aviso de tamaño (regla de CLAUDE.md: avisar si una
> spec pasa de ~300 líneas y proponer partirla). **El usuario decidió
> explícitamente no partirla y hacerlo todo de una vez**, asumiendo el riesgo
> de una sesión de implementación grande. Los cuatro bloqueantes de fondo
> (reescritura de `ingredienteId` dentro de `receta.ingredientes[]`, la
> siembra, el reinicio de datos y la divergencia de contenido al deduplicar)
> están resueltos abajo con decisiones del usuario, no ignorados.
>
> **Segunda pasada (22 de septiembre de 2026):** dos bloqueantes más, ya
> resueltos abajo. (1) El email de admin era `paubauer23@gmail.com` —correo
> personal del usuario para Claude Code, no una cuenta de la app— **el mismo
> error ya cometido y corregido en la spec 089**. El admin real es
> `pantonbernal@gmail.com`, de la lista blanca. (2) Si la siembra crea las
> recetas con `autorUid` = admin, el reinicio de "mis recetas" del admin se
> llevaría por delante el recetario sembrado de todo el grupo. Se resuelve
> dándole a lo sembrado un origen distinto de "escrito a mano por el admin".
>
> **Cambio de planes sobre la migración (22 de septiembre de 2026, tras
> implementar la fusión completa entre las tres cuentas):** el usuario decidió
> simplificarla del todo. Las otras dos cuentas del grupo no usan el
> recetario, así que no hace falta fundir nada entre las tres: **se empieza
> casi de cero**, con los 4 menús de la nutricionista (73 recetas, 138
> ingredientes, spec 075) como único contenido inicial. Se sustituye el
> módulo de migración con fusión por nombre (que llegó a implementarse y
> pasar `revisor-codigo`) por uno mucho más simple: **un solo botón, solo
> para el admin**, que vacía el recetario compartido y el recetario/despensa
> viejos del admin, resiembra los 4 menús desde cero, y reenlaza por nombre
> la dieta activa y el diario de comidas del admin a las recetas recién
> sembradas. Las recetas propias del admin anteriores a esta spec (si las
> había, fuera de los 4 menús) **se pierden a propósito**: no se migran. Las
> cuentas de la mujer y el cuñado no se tocan: su recetario viejo por cuenta
> queda huérfano y sin usar, sin que haga falta borrarlo.

## 1. Objetivo

Las recetas y el catálogo de ingredientes dejan de vivir en la cuenta de cada
usuario y pasan a ser del grupo entero: lo que sube uno lo ve y lo usa
cualquiera. Recetas gana su propia pestaña en la navegación, cada receta lleva
quién la subió, y solo su autor (o el admin) puede editarla o borrarla. Crear
una receta sigue rellenando solo el catálogo de ingredientes que le falten,
ahora compartido. Se puede dar de alta una receta pegando su texto tal cual y
dejando que la IA la divida en ingredientes.

## 2. Criterio de "esto funciona"

1. Entro con mi cuenta, voy a la pestaña nueva **Recetas** (barra de
   navegación, mismo nivel que Hoy/Peso/Comidas/Ejercicio).
2. Creo una receta escribiendo sus campos a mano. Al guardarla, aparece en el
   listado con mi nombre como autor.
3. Los ingredientes de esa receta que no existían en el catálogo compartido se
   han creado solos (compruebo que aparecen en Recetas → Ingredientes).
4. Creo otra receta **pegando el texto** de un plato (copiado de un PDF/web) en
   un campo de texto libre y pulso "Dividir con IA": se rellenan los campos de
   ingrediente/cantidad/preparación; reviso y ajusto antes de guardar.
5. Entro con la otra cuenta (mi mujer/cuñado). Veo las dos recetas que acabo de
   crear, con mi nombre como autor. Al abrirlas, **no** hay botón
   editar/borrar (o sale deshabilitado con aviso).
6. Con la otra cuenta creo una receta propia: en mi cuenta original la veo con
   su nombre de autor, y si soy el admin (`pantonbernal@gmail.com`) sí puedo
   editarla/borrarla; si no lo soy, no.
7. Abro una dieta/comida que ya enlazaba una receta de antes de esta spec y
   sigue enseñándola bien (el enlace por id no se ha roto).
8. Marco/desmarco "lo tengo" en un ingrediente del catálogo compartido con mi
   cuenta y compruebo que en la otra cuenta ese mismo ingrediente sigue con su
   propia marca independiente (no se comparte el marcado, solo el nombre).

## 3. Alcance

### Entra
- Colecciones compartidas top-level (`recetas`, `ingredientes`).
- **Botón de reinicio del recetario, solo para el admin** (ver nota de
  "Cambio de planes" más arriba): vacía `recetas`/`ingredientes` y el
  recetario/despensa viejos del admin, resiembra los 4 menús desde cero
  (73 recetas, 138 ingredientes, `autorUid: "sistema"`) y reenlaza por
  nombre la dieta activa y el diario de comidas del admin a lo recién
  sembrado. No fusiona nada de las otras dos cuentas: su recetario viejo
  por cuenta queda huérfano, sin tocar.
- Campo `autorUid` (+ nombre para mostrar) en cada receta.
- Reglas de Firestore: lectura para todo el grupo, escritura solo para el
  autor o el admin fijo.
- Pestaña "Recetas" nueva en la navegación (con su interruptor interno
  Recetas/Ingredientes, heredado del Recetario actual, spec 085).
- Crear receta sigue creando en el catálogo compartido los ingredientes que
  falten (como hoy hace `js/recetas.js`/`js/despensa.js`, pero en la colección
  común).
- Campo de texto libre + botón "Dividir con IA" para pegar una receta y
  obtener ingredientes estructurados propuestos (nueva función serverless o
  ampliación de una existente en `api/`).
- Al reenlazar por nombre la dieta/diario del admin, se recorren
  `recetaId`/`recetaIds` e `ingredienteId`/`ingredienteIds`: donde el nombre
  del plato coincide con una de las 73 recién sembradas, se enlaza al id
  nuevo; lo que no coincide (una receta propia del admin, fuera de los 4
  menús) se queda con el texto tal cual, sin enlazar — no se inventa un
  enlace que no es.
- **`js/siembra.js` deja de copiar las 73 recetas del menú a cada cuenta
  nueva.** Se siembran UNA sola vez en la colección compartida (si no existen
  ya), con `autorUid: "sistema"` (no el uid del admin, ver sección 5). Un
  usuario nuevo las ve directamente, sin copiarlas a su cuenta.
- **`js/reinicio.js`**: la casilla "mis recetas" pasa a borrar solo las
  recetas cuyo `autorUid` sea el uid del usuario que pide el reinicio (nunca
  las de `autorUid: "sistema"` ni las de otros autores). La despensa (el
  marcado "lo tengo") sigue siendo 100% del usuario y se borra entera como
  hoy.
- La despensa (marcado "lo tengo") sigue siendo por usuario, apuntando al
  ingrediente compartido por id.
- Editar/borrar un **ingrediente** del catálogo (nombre, alias) tiene el
  mismo permiso que una receta: solo su autor o el admin fijo.

### NO entra (explícitamente fuera)
- No cambia cómo dietas, menús o comidas apuntadas referencian una receta:
  siguen guardando su id, igual que hoy.
- No comparte ningún otro dato (peso, comidas, ejercicio, fotos,
  conversaciones): sigue todo separado por `uid`.
- No añade roles de admin configurables desde la app: el admin es un uid fijo
  en código/reglas.
- No cambia la vista de receta, las raciones escalables ni los filtros del
  recetario: eso quedó anotado en la v16 como "se hará si se echa de menos".
- No dedupli­ca por parecido (solo nombre exacto): "tomate" y "tomates" ya se
  unen desde la spec 072, pero un parecido más laxo no se toca aquí.

## 4. Comportamiento detallado

*(a rellenar/ajustar durante la implementación: formulario de "pegar receta",
mensajes de la pestaña nueva, aviso al usuario sin permiso de edición,
vacío inicial de Recetas)*

## 5. Modelo de datos

- `recetas/{recetaId}`: mismos campos que hoy en `usuarios/{uid}/recetas`, más
  `autorUid` (string) y `autorNombre` (string, para no tener que resolver el
  uid al pintar la lista).
- `ingredientes/{ingredienteId}`: mismos campos que hoy en la despensa
  (nombre, alias...), sin el campo de marcado (que era por usuario).
- `usuarios/{uid}/despensa/{ingredienteId}`: nueva subcolección (o campo) que
  guarda solo el marcado "lo tengo" por usuario, referenciando el
  `ingredienteId` del catálogo compartido. Sustituye a la despensa actual
  (que hoy guarda nombre + marcado juntos por usuario).
- Admin fijo: `pantonbernal@gmail.com` (o su uid resuelto), como constante en
  código y en las reglas de Firestore.
- Las recetas/ingredientes que vienen de la siembra (menús de la
  nutricionista, spec 075) llevan `autorUid: "sistema"`, no el uid del admin.
  Los distingue de lo que el admin escribe a mano y los excluye del alcance
  de cualquier reinicio personal, incluido el del propio admin.

## 6. Casos límite

- El texto pegado para dividir con IA no da tiempo/falla (mismo patrón de
  aviso que ya usa el resto de llamadas a IA del proyecto).
- Un usuario borrado o dado de baja como autor: su nombre sigue en las
  recetas que subió (no se borran en cascada).
- **Al reenlazar por nombre la dieta/diario del admin tras el reinicio**: un
  plato cuyo texto no coincide con el nombre exacto de ninguna de las 73
  recién sembradas (por ejemplo, una receta propia del admin de antes de
  esta spec) se queda SIN enlazar — el texto del plato se conserva tal cual,
  pero el botón de "ver receta" deja de salir en él. No se inventa un
  enlace aproximado.
- Pulsar el botón de reinicio dos veces: la segunda vuelve a vaciar y
  resembrar sin romper nada (mismo patrón que "Reparar mis recetas" de las
  specs 089/090: no hace daño repetirlo).

## 7. Archivos afectados

*(estimado, a confirmar al implementar)*
- `js/recetas.js`, `js/despensa.js` (o su fusión, `js/recetario.js` si existe
  tras la 085): pasar de `usuarios/{uid}/recetas` a `recetas` top-level.
- `js/app.js`: pestaña nueva en la navegación.
- `firestore.rules`: reglas nuevas para `recetas` e `ingredientes`.
- `api/`: función o ampliación para dividir texto pegado con IA.
- Botón de reinicio del recetario (solo admin), que vacía, resiembra y
  reenlaza por nombre — ver sección 3.
- `js/dietas.js`, `js/comidas.js`: puntos que hoy asumen receta/ingrediente
  bajo `usuarios/{uid}` y hay que apuntar a la colección compartida.
- `js/estadisticas.js`, `js/compra.js`: leen hoy `recetaPorId`/`ingredientePorId`
  construidos desde listas cargadas por `uid`; pasan a leer de las
  colecciones compartidas.
- `js/siembra.js`, `js/datos-iniciales.js`: dejan de copiar por usuario, ver
  sección 3.
- `js/reinicio.js`: casilla "mis recetas" filtrada por `autorUid`, ver
  sección 3.

## 8. Decisiones tomadas

- **Recetas e ingredientes pasan a colección compartida, excepción a "datos
  separados por uid"** → el usuario lo pidió explícitamente; documentado en
  PRODUCTO.md y ARQUITECTURA.md antes de esta spec.
- **Recetas, pestaña propia en la barra de navegación** → más visible que
  dentro de Comidas, aunque la barra crezca.
- **Solo el autor o el admin fijo (pantonbernal@gmail.com) edita/borra** →
  evita que un usuario cambie sin querer lo que subió otro. **Corregido en la
  segunda pasada de `revisor-specs`: `paubauer23@gmail.com` no está en la
  lista blanca de la app, era el correo personal del usuario, mismo error ya
  cometido y corregido en la spec 089.**
- **Lo sembrado lleva `autorUid: "sistema"`, no el uid del admin** → si
  llevara el uid del admin, reiniciar "mis recetas" como admin se llevaría
  por delante el recetario compartido de todo el grupo. Corregido en la
  segunda pasada de `revisor-specs`.
- **Ingredientes: catálogo de nombres compartido, marcado "lo tengo" sigue por
  usuario** → evita duplicar "tomate" tres veces sin fingir que todos tienen
  la despensa de todos.
- **Migración simplificada a "empezar casi de cero" (22 de septiembre, tras
  implementar y revisar la fusión completa entre las tres cuentas)** → las
  otras dos cuentas no usan el recetario, así que fundir entre las tres no
  compensaba la complejidad. Un solo botón de admin vacía, resiembra los 4
  menús y reenlaza por nombre la dieta/diario del propio admin. Se pierden a
  propósito las recetas propias del admin de antes de esta spec, si las
  había fuera de los 4 menús.
- **Pegar receta y dividir con IA** → mismo patrón que ya usa la app para
  generar recetas con IA, aplicado a texto pegado en vez de a una petición
  libre. **No consume el cupo diario de 20 mensajes**: es una acción de
  utilidad aparte de la conversación.
- **Recetas duplicadas con contenido distinto: sobrevive la más reciente** →
  criterio simple y objetivo, sin necesitar revisión manual caso a caso.
- **Ingredientes: mismo permiso de edición que las recetas (autor o admin)**
  → consistente, evita que cualquiera cambie un nombre y rompa recetas de
  otro autor sin que se entere.
- **Spec sin partir, decisión expresa del usuario** → pasa por encima del
  aviso de tamaño de `revisor-specs` y de la regla 4 de CLAUDE.md. Los
  bloqueantes de fondo que motivaban el aviso quedan resueltos arriba, no
  ignorados; lo que se asume es el riesgo de una sesión de implementación
  grande, no cabos sueltos de producto.

## 9. Fuera de spec: ideas apuntadas

- Roles de admin configurables desde Ajustes (hoy: uid fijo en código).
- Deduplicar ingredientes/recetas por parecido, no solo nombre exacto.

## ✅ Para probar a mano

Ya está desplegado en producción (operacion-bikini.vercel.app) y las reglas
de Firestore publicadas. **Antes de nada, el admin (`pantonbernal@gmail.com`)
tiene que pulsar el botón de reinicio del recetario, una vez**: las otras dos
cuentas no tienen que hacer nada, su recetario viejo se queda sin usar.

### 1. El reinicio del recetario (solo `pantonbernal@gmail.com`)

1. Antes de nada, apunta (o recuerda) qué platos tenía tu dieta activa esta
   semana: lo vas a comprobar después de reiniciar.
2. Entra con `pantonbernal@gmail.com` → **Ajustes → Zona de peligro** →
   busca "Empezar el recetario compartido de cero" (o el texto que tenga el
   botón nuevo).
3. Escribe la palabra de confirmación y pulsa el botón.
4. Espera a que salga "Listo: …". Debe decir algo como "73 recetas y 138
   ingredientes sembrados" y cuántos platos de tu dieta/diario se han
   reenlazado.
5. Ve a la pestaña nueva **Recetas** (barra inferior, junto a Comidas): debe
   haber 73 recetas y 138 ingredientes, todos con autor "Menús de la
   nutricionista" (o el texto que se use para lo sembrado), no con tu
   nombre.
6. Abre **Comidas → Mi dieta**: los platos que coincidían con uno de los 4
   menús deben seguir mostrando el icono de "ver receta" y abrirla bien. Los
   que no coincidían (si tenías alguna receta propia de antes) se ven como
   texto normal, sin el icono — es lo esperado, no un fallo.
7. Vuelve a pulsar el botón (con la palabra de confirmación otra vez): debe
   volver a vaciar y resembrar sin errores, sin dejar recetas duplicadas.

### 2. Camino feliz: crear y ver una receta compartida

8. Con tu cuenta, en **Recetas → Recetas**, pulsa "Nueva receta" y crea una
   con 2-3 ingredientes nuevos (que no existan ya) y una preparación corta.
9. Guárdala. Debe aparecer en la lista con tu nombre como autor.
10. Ve a **Recetas → Ingredientes**: los ingredientes nuevos de esa receta
    tienen que estar ahí, sin marcar ("lo tengo" desmarcado).
11. Cierra sesión y entra con **otra cuenta** del grupo.
12. Ve a **Recetas**: la receta que acabas de crear con la primera cuenta
    tiene que verse aquí también, con el nombre de la primera cuenta como
    autor.
13. Ábrela: **no debe haber botón "Editar" ni "Borrar"** (o deben salir
    deshabilitados). Los ingredientes nuevos que creó, en cambio, sí deben
    aparecer en tu propia lista de Ingredientes (compartidos), y puedes
    marcarlos "lo tengo" sin problema.

### 3. Pegar una receta y dividirla con IA

14. En **Recetas → Recetas**, pulsa "O pega una receta y repártela con IA".
15. Pega un texto de receta real (ingredientes con cantidades y unos pasos),
    por ejemplo algo como "Tortilla de atún, 2 personas: 4 huevos, 1 lata de
    atún al natural escurrida, sal. Bate los huevos, mezcla con el atún y
    cuaja en la sartén."
16. Pulsa "Dividir con IA". Espera unos segundos (puede tardar como al pedir
    una dieta). El formulario debe abrirse con el nombre, las raciones y la
    preparación ya rellenos, y una línea por ingrediente detectado, cada una
    pendiente de enlazar (como al editar una receta vieja de texto libre).
17. Enlaza o crea cada ingrediente y guarda. Comprueba que la receta queda
    bien formada (ingredientes correctos, sin duplicados raros).

### 4. Permisos cruzados y admin

18. Con una cuenta que NO sea `pantonbernal@gmail.com`, intenta editar una
    receta que subió OTRA cuenta que tampoco sea la tuya: no debe poder
    (sin botón de editar/borrar, como en el paso 14).
19. Con `pantonbernal@gmail.com` (el admin), abre esa misma receta de otro
    autor: SÍ debe salir "Editar" y "Borrar". Pruébalo con un cambio menor
    (por ejemplo, añadir una palabra a la preparación) y guarda: debe
    funcionar sin error de permisos.
20. Con el admin, intenta borrar y editar un INGREDIENTE (no una receta) que
    creó otra cuenta, desde Recetas → Ingredientes: debe poder, igual que
    con las recetas.

### 5. Casos límite

21. Con tu cuenta, intenta crear una receta con el MISMO nombre exacto que
    una de las 73 sembradas (por ejemplo, una que ya exista tal cual):
    guárdala igual — el recetario compartido no impide nombres repetidos, no
    hay fusión automática al crear (la fusión solo existió en la migración
    completa que se descartó). Debe quedar como una receta MÁS, no
    sustituir a la que ya había.
22. Marca "lo tengo" en un ingrediente compartido con tu cuenta. Entra con
    otra cuenta y comprueba que ese mismo ingrediente sale SIN marcar para
    ella (la marca es tuya, no del catálogo).
23. En Ingredientes, crea uno cuyo nombre singular/plural coincida con uno
    que ya existe (p. ej. si ya hay "tomate", intenta "tomates" desde una
    receta nueva): debe fundirse con el que ya había, no duplicarse.

### 6. Regresión: lo que ya funcionaba

24. Abre una dieta de la semana que ya tenías antes de esta spec: los platos
    con receta enlazada tienen que seguir mostrando el icono de "ver
    receta", y al abrirlo se debe ver la receta bien.
25. Ve a **Recetas → Ingredientes → (botón de ir a la compra)**: la lista de
    la compra debe seguir calculándose bien a partir de tu dieta activa y tu
    despensa marcada.
26. Apunta una comida en **Comidas → Apuntar** eligiendo una receta del
    campo con sugerencias: debe enlazar bien y aparecer en tu diario.
27. En **Comidas → Apuntar**, mira "Qué comes" (estadísticas): debe seguir
    contando bien tus comidas enlazadas a receta/ingrediente.
28. En **Ajustes → Zona de peligro**, marca solo la casilla "recetas propias
    y dietas" y reinicia: debe borrar SOLO las recetas que TÚ subiste (no
    las de otras cuentas ni las de la siembra original) y tus dietas.
    Confirma con otra cuenta que sus recetas siguen intactas.
29. Comprueba que la pestaña **Comidas** ya no tiene la sub-pestaña
    "Recetario" (ahora solo Apuntar y Mi dieta), y que la navegación entre
    Recetas → Ingredientes → "ir a la compra" → "volver a los ingredientes"
    funciona sin saltos raros, en móvil y en escritorio si puedes probar los
    dos anchos.
