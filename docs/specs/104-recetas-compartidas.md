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
- Migrar `usuarios/{uid}/recetas` y los ingredientes de cada despensa a
  colecciones compartidas top-level (`recetas`, `ingredientes`).
- Deduplicar por nombre exacto (recetas e ingredientes) durante la migración.
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
- Reescribir, durante la migración, los ids de receta/ingrediente en
  dietas/comidas del usuario cuya receta quedó fundida en otra.
- **Reescribir también `ingredienteId` dentro de `receta.ingredientes[]`**
  de TODAS las recetas cuando el ingrediente que referenciaban queda fundido
  en otro al deduplicar (no solo en dietas/comidas). Mismo patrón que
  `js/normalizacion.js` (spec 089) ya usa para un problema parecido.
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

- Dos recetas con nombres que difieren solo en mayúsculas/espacios: ¿cuentan
  como "nombre exacto" para deduplicar? (decidir al implementar, mirando los
  datos reales primero, como manda la regla de ESTADO.md del 2 de septiembre).
- Una receta fundida por duplicado tenía alias distintos en cada copia: los
  alias de ambas se unen en la superviviente.
- **Dos recetas con el mismo nombre exacto pero contenido distinto (otros
  ingredientes/preparación):** sobrevive la editada más recientemente
  (`actualizadaEn`/timestamp equivalente); la otra se descarta tras
  reescribir sus enlaces (dietas, comidas y `ingredienteId` de otras recetas)
  al id de la superviviente.
- El texto pegado para dividir con IA no da tiempo/falla (mismo patrón de
  aviso que ya usa el resto de llamadas a IA del proyecto).
- Un usuario borrado o dado de baja como autor: su nombre sigue en las
  recetas que subió (no se borran en cascada).

## 7. Archivos afectados

*(estimado, a confirmar al implementar)*
- `js/recetas.js`, `js/despensa.js` (o su fusión, `js/recetario.js` si existe
  tras la 085): pasar de `usuarios/{uid}/recetas` a `recetas` top-level.
- `js/app.js`: pestaña nueva en la navegación.
- `firestore.rules`: reglas nuevas para `recetas` e `ingredientes`.
- `api/`: función o ampliación para dividir texto pegado con IA.
- Script de migración de datos existentes (una vez, no parte del código vivo).
- `js/dietas.js`, `js/comidas.js`: puntos que hoy asumen receta/ingrediente
  bajo `usuarios/{uid}` y hay que apuntar a la colección compartida.
- `js/estadisticas.js`, `js/compra.js`: leen hoy `recetaPorId`/`ingredientePorId`
  construidos desde listas cargadas por `uid`; pasan a leer de las
  colecciones compartidas.
- `js/siembra.js`, `js/datos-iniciales.js`: dejan de copiar por usuario, ver
  sección 3.
- `js/reinicio.js`: casilla "mis recetas" filtrada por `autorUid`, ver
  sección 3.
- `js/normalizacion.js`: se reutiliza su patrón de reescritura de
  `ingredienteId` en recetas para la migración de esta spec.

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
- **Migración: deduplicar por nombre exacto, reescribiendo los enlaces rotos
  al id superviviente** → menos duplicados que dejarlo todo tal cual, con el
  cuidado de no dejar comidas/dietas huérfanas (lección de las specs 089/090).
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
de Firestore publicadas. **Antes de nada, las tres cuentas del grupo tienen
que ejecutar la migración una vez**: mientras no lo hagan, sus recetas viejas
siguen donde estaban y no aparecen en el recetario compartido.

### 1. La migración (una vez por cuenta, empezando por `pantonbernal@gmail.com`)

1. Entra con tu cuenta → **Ajustes → Zona de peligro** → busca "Pasar mis
   recetas al recetario compartido".
2. Escribe **COMPARTIR** en el campo de confirmación y pulsa el botón.
3. Espera a que salga "Listo: …". Debería contar tus recetas e ingredientes
   de antes de esta spec (nuevas + fundidas + actualizadas).
4. Ve a la pestaña nueva **Recetas** (barra inferior, junto a Comidas): tus
   recetas de siempre tienen que estar ahí, con tu nombre como autor.
5. Abre **Comidas → Mi dieta**: la semana que ya tenías tiene que verse
   exactamente igual que antes (mismos platos, mismas recetas enlazadas).
6. Repite los pasos 1-3 con la **segunda cuenta**. Si esta cuenta tenía
   alguna receta con el MISMO NOMBRE que una de la primera cuenta, el
   resumen debe contarla como "fundida", no como "nueva".
7. Repite con la **tercera cuenta**.
8. Con cualquiera de las tres cuentas, vuelve a pulsar el botón de migración
   (con COMPARTIR otra vez): debe decir "No había nada que migrar" y no
   duplicar nada.

### 2. Camino feliz: crear y ver una receta compartida

9. Con tu cuenta, en **Recetas → Recetas**, pulsa "Nueva receta" y crea una
   con 2-3 ingredientes nuevos (que no existan ya) y una preparación corta.
10. Guárdala. Debe aparecer en la lista con tu nombre como autor.
11. Ve a **Recetas → Ingredientes**: los ingredientes nuevos de esa receta
    tienen que estar ahí, sin marcar ("lo tengo" desmarcado).
12. Cierra sesión y entra con **otra cuenta** del grupo.
13. Ve a **Recetas**: la receta que acabas de crear con la primera cuenta
    tiene que verse aquí también, con el nombre de la primera cuenta como
    autor.
14. Ábrela: **no debe haber botón "Editar" ni "Borrar"** (o deben salir
    deshabilitados). Los ingredientes nuevos que creó, en cambio, sí deben
    aparecer en tu propia lista de Ingredientes (compartidos), y puedes
    marcarlos "lo tengo" sin problema.

### 3. Pegar una receta y dividirla con IA

15. En **Recetas → Recetas**, pulsa "O pega una receta y repártela con IA".
16. Pega un texto de receta real (ingredientes con cantidades y unos pasos),
    por ejemplo algo como "Tortilla de atún, 2 personas: 4 huevos, 1 lata de
    atún al natural escurrida, sal. Bate los huevos, mezcla con el atún y
    cuaja en la sartén."
17. Pulsa "Dividir con IA". Espera unos segundos (puede tardar como al pedir
    una dieta). El formulario debe abrirse con el nombre, las raciones y la
    preparación ya rellenos, y una línea por ingrediente detectado, cada una
    pendiente de enlazar (como al editar una receta vieja de texto libre).
18. Enlaza o crea cada ingrediente y guarda. Comprueba que la receta queda
    bien formada (ingredientes correctos, sin duplicados raros).

### 4. Permisos cruzados y admin

19. Con una cuenta que NO sea `pantonbernal@gmail.com`, intenta editar una
    receta que subió OTRA cuenta que tampoco sea la tuya: no debe poder
    (sin botón de editar/borrar, como en el paso 14).
20. Con `pantonbernal@gmail.com` (el admin), abre esa misma receta de otro
    autor: SÍ debe salir "Editar" y "Borrar". Pruébalo con un cambio menor
    (por ejemplo, añadir una palabra a la preparación) y guarda: debe
    funcionar sin error de permisos.
21. Con el admin, intenta borrar y editar un INGREDIENTE (no una receta) que
    creó otra cuenta, desde Recetas → Ingredientes: debe poder, igual que
    con las recetas.

### 5. Casos límite

22. Con dos cuentas distintas, crea (o comprueba que ya migraste) dos
    recetas con el mismo nombre exacto pero contenido distinto. Tras la
    migración, solo debe quedar UNA en el recetario compartido — la editada
    más recientemente — y no debe haber dos entradas duplicadas con el mismo
    nombre.
23. Marca "lo tengo" en un ingrediente compartido con tu cuenta. Entra con
    otra cuenta y comprueba que ese mismo ingrediente sale SIN marcar para
    ella (la marca es tuya, no del catálogo).
24. En Ingredientes, crea uno cuyo nombre singular/plural coincida con uno
    que ya existe (p. ej. si ya hay "tomate", intenta "tomates" desde una
    receta nueva): debe fundirse con el que ya había, no duplicarse.

### 6. Regresión: lo que ya funcionaba

25. Abre una dieta de la semana que ya tenías antes de esta spec: los platos
    con receta enlazada tienen que seguir mostrando el icono de "ver
    receta", y al abrirlo se debe ver la receta bien.
26. Ve a **Recetas → Ingredientes → (botón de ir a la compra)**: la lista de
    la compra debe seguir calculándose bien a partir de tu dieta activa y tu
    despensa marcada.
27. Apunta una comida en **Comidas → Apuntar** eligiendo una receta del
    campo con sugerencias: debe enlazar bien y aparecer en tu diario.
28. En **Comidas → Apuntar**, mira "Qué comes" (estadísticas): debe seguir
    contando bien tus comidas enlazadas a receta/ingrediente.
29. En **Ajustes → Zona de peligro**, marca solo la casilla "recetas propias
    y dietas" y reinicia: debe borrar SOLO las recetas que TÚ subiste (no
    las de otras cuentas ni las de la siembra original) y tus dietas.
    Confirma con otra cuenta que sus recetas siguen intactas.
30. Comprueba que la pestaña **Comidas** ya no tiene la sub-pestaña
    "Recetario" (ahora solo Apuntar y Mi dieta), y que la navegación entre
    Recetas → Ingredientes → "ir a la compra" → "volver a los ingredientes"
    funciona sin saltos raros, en móvil y en escritorio si puedes probar los
    dos anchos.
