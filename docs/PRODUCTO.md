# Producto: OperaciónBikini

## Para qué sirve

Esta app sirve para que mi mujer y yo perdamos peso y nos sintamos bien con nuestro cuerpo de cara al verano de 2027, actuando como un nutricionista/entrenador personal con IA que nos entrevista, hace seguimiento de nuestros datos y nos da consejos y planes.

## Para quién

Un grupo pequeño y cerrado de usuarios personales (empezando por mí y mi mujer; el 21 de agosto de 2026 se sumó un cuñado), cada uno con su cuenta y sus datos completamente separados: peso, comidas, ejercicio, fotos y conversaciones con la IA de un usuario no son visibles para el otro. No es una app pública ni de registro abierto — el acceso se concede manualmente (dando de alta la cuenta o permitiendo el inicio de sesión), no cualquiera con el enlace puede entrar.

## Qué hace (alcance actual — v1 beta, objetivo 31 de agosto)

- Login separado por usuario, con email/contraseña o cuenta de Google (a elección de cada uno).
- Registro de pesajes (peso + fecha).
- Registro de comidas.
- Registro de ejercicio.
- Subida de una foto de progreso por día, con seguimiento visual (cuadrícula de evolución).
- Botón **"Consejos"**: la IA analiza el historial reciente (pesajes, comidas, ejercicio) y da pautas puntuales.
- Botón **"Pasar consulta"**: conversación guiada por la IA, tipo entrevista de nutricionista (pregunta gustos, hábitos, objetivos, mediciones...) que termina generando un plan de nutrición y un plan de ejercicio.
- Disclaimer visible de que los consejos y planes los genera una IA y no sustituyen a un médico o nutricionista real.

## Qué hará (v2, decidida el 11 de agosto de 2026)

- **Corregir lo apuntado**: cualquier pesaje, comida o ejercicio ya guardado se puede editar después (todos sus campos, incluida la fecha), sin tener que borrarlo y volver a crearlo. Las fotos de progreso siguen ligadas a su fecha de subida.
- Pantalla de **Ajustes** con los datos personales de cada usuario: peso objetivo, altura y fecha objetivo. Desde ahí también se cierra sesión.
- **Reinicio de datos**: cada usuario puede borrar sus propios datos eligiendo qué tipos (pesajes, comidas, ejercicio, consejos, consultas y planes, fotos), con una confirmación de tres pasos. La cuenta no se borra. Entre lo que se puede borrar está también **lo que la IA sabe de ti** (el nombre con el que te llama, la altura, el peso y la fecha objetivo, y el retrato que usa para aconsejarte): es la única forma de que la app te olvide y de que una entrevista de bienvenida vuelva a empezar de cero de verdad.
- **Gráfica de evolución del peso** con media móvil de 7 días, los pesajes reales de fondo, y línea de objetivo con una banda de margen alrededor. Debajo, comparación con la semana anterior.
- **Pantalla "Hoy"**: lo apuntado en el día de un vistazo, accesos directos al resto de la app y un calendario de constancia con los días en que se apuntó algo.
- **Detalle nutricional automático**: una vez al día la IA convierte lo apuntado en texto libre en grupos de alimentos y una estimación de calorías en rango. El usuario no rellena ningún campo nuevo.
- **Gamificación individual**: puntos por registrar, rachas con un día de gracia por semana y emblemas por constancia. Se premia la conducta, nunca los kilos perdidos.
- **Rediseño visual** en dirección oscura ("nocturna deportiva"), siempre oscura, con navegación inferior en móvil.

## Qué hará (ampliación de la v2, decidida el 13 de agosto de 2026)

Sale de probar la app con un mes de datos de verdad. Ordenado como se va a construir:

- **Navegación por dispositivo**: en móvil, barra inferior con Hoy, Peso, Comidas, Ejercicio y **Ajustes** (el botón "Más" desaparece: lo que había dentro se alcanza desde "Hoy"). En escritorio, los botones van **arriba, junto al usuario**, no abajo.
- **Perfil con foto**: cada usuario puede subir una foto de perfil, que se ve junto a su nombre en la cabecera, y quitarla para volver a la inicial de su email (añadido el 21 de agosto de 2026, spec 039).
- **"Hoy" como centro de la app**: cada línea del resumen enseña **lo último apuntado hoy** y un botón **+** para añadir más, que lleva a la pantalla donde se apunta. Si no hay nada apuntado, solo está el **+**. Desde "Hoy" hay además **accesos directos a Consulta, Consejos y Fotos**. El bloque "lo de siempre" desaparece de "Hoy".
- **Nombre de pila**: cada usuario decide cómo quiere que le llamen. Se ve junto a la foto de perfil en lugar del email, y la IA lo usa al dirigirse a él. Se pregunta en la entrevista inicial y se puede cambiar en Ajustes.
- **Comidas frecuentes en su sitio**: las comidas que más se repiten se ofrecen para repetir en la **pantalla de Comidas**, debajo del formulario.
- **Calendario de constancia con rango elegible**: 1 semana, 2 semanas, 1 mes, 3, 6 o 12 meses. Por defecto, el último mes.
- **Listas cortas**: las listas de pesajes, comidas y ejercicios enseñan solo los últimos registros y se pueden desplegar enteras o buscar por día.
- **Hora opcional en los registros**: peso, comida y ejercicio pueden llevar hora además de fecha. Se propone la hora a la que se está apuntando y se puede cambiar.
- **Estadísticas de peso**: debajo de la lista de pesajes, lo perdido en 7 y en 30 días, lo perdido en total desde el primer pesaje, y lo que falta para el objetivo. La gráfica pasa a tener rango elegible.
- **"Iniciar operación bikini"**: con la app vacía, un botón arranca la primera consulta, que además de entrevistar guarda los datos personales (altura, peso actual, objetivo y fecha) y **conoce al usuario** (comidas que le gustan, ejercicio que disfruta, con qué material cuenta). Ese perfil se guarda y la IA lo usa en todas las consultas y consejos posteriores.
- **Operaciones con principio y fin**: la app funciona por ciclos. Una **operación bikini** empieza con la entrevista y se cierra cuando el usuario quiere, desde Ajustes. Mientras no hay una operación en marcha, la app solo deja iniciarla: no se puede apuntar nada. Al cerrarla, todo lo apuntado se archiva y queda consultable en un **histórico**, con su resumen (fechas, peso inicial y final, kilos y días registrados) y sus registros en solo lectura. Los ajustes y lo que la IA sabe del usuario se conservan de una operación a la siguiente, salvo que se borren a mano desde el reinicio de datos. Las operaciones se pueden borrar desde el reinicio de datos, como cualquier otro tipo: la casilla se lleva tanto el histórico como la operación que haya en marcha, que en ese caso se tira sin archivarse. Cerrarla guardando su resumen es lo que hace "Finalizar operación bikini"; borrarla es lo contrario.
- **Consultas especializadas**: se puede gastar una consulta del día en pedir algo concreto — una tabla de ejercicios para hoy o para la semana, o una dieta detallada para los próximos días — en vez de la entrevista general. Al abrir el formulario de pedir, las instrucciones ya vienen rellenas con las últimas que se usaron para ese mismo tipo (dieta o tabla), para no tener que reescribirlas cada vez (añadido el 21 de agosto de 2026, spec 040).

## Qué hará (v3, decidida el 16 de agosto de 2026)

Sale de usar la app con dos meses de datos. Cambia la estructura, no solo el aspecto:

- **Paleta violeta nocturna**: se mantiene el fondo oscuro, pero con base violeta y acento violeta en lugar del coral.
- **Un solo interlocutor**: "Consejos" desaparece como sección aparte. Todo pasa por **"Pasar consulta"**, una conversación con tu nutricionista/entrenador en la que hablas de cómo va la dieta y te va dando pautas. Los consejos son lo que sale de esa conversación, no un botón que escupe texto.
- **Cada cosa en su sitio**: pedir una dieta vive en **Comidas** y pedir una tabla de ejercicio vive en **Ejercicio**. Dejan de ser un tipo raro de consulta.
- **"Hoy" con cuatro acciones**: Pasar consulta · Hacer dieta · Tabla de ejercicios · Foto del día.
- **Recetas**: colección propia. Cada receta tiene nombre, para cuántas personas, ingredientes y preparación. Se guardan las que propone la IA y se pueden escribir a mano, editar y borrar.
- **Dietas**: una dieta es una semana de menús (días × comidas). La IA puede generarla entera con sus recetas, y también se puede montar a mano colocando recetas propias. En la dieta de hoy, cada comida tiene un botón para decir **"me lo he comido"**, que la apunta sin escribir nada.
- **Ejercicios**: catálogo propio. Cada ejercicio tiene nombre, cómo se hace y qué material necesita. Se guardan los que propone la IA y se pueden escribir a mano, editar y borrar.
- **Tablas de ejercicio**: una tabla es una semana de entrenamientos (días × sesión). La IA puede generarla entera con sus ejercicios, y también se puede montar a mano colocando ejercicios propios. En la tabla de hoy, la sesión tiene un botón para decir **"lo he hecho"**, que la apunta como un solo ejercicio sin escribir nada.
- **Detalle nutricional automático** y **gamificación** (puntos, rachas y emblemas): lo que quedaba pendiente de la v2.

## Qué hará (v4, decidida el 20 de agosto de 2026)

Sale de volver a usar la app con todo lo anterior encima, y de una auditoría de
usabilidad sobre el código. No añade funciones: **coloca mejor las que ya hay**.
El diagnóstico fue que Comidas y Ejercicio se habían convertido en páginas de
cinco y seis bloques que solo se recorren con scroll ciego, y que en un monitor
la app es una columna estrecha con dos desiertos a los lados.

- **Sub-pestañas dentro de las secciones grandes**: Comidas y Ejercicio dejan de
  ser una sola página larga. Cada una se parte en pestañas propias (apuntar, el
  catálogo/recetario, la semana), a un toque. La barra inferior sigue teniendo
  los mismos cinco destinos: lo que cambia es lo que hay dentro de dos de ellos.
- **Nombres que no se pisan**: dentro de una misma sección no puede haber cuatro
  títulos que suenen igual. Hoy en Ejercicio conviven "Mis ejercicios" (el
  catálogo), "Mi tabla" (la semana), "Tabla de ejercicios" (pedírsela a la IA) y
  "Mis entrenamientos apuntados" (el diario). Cada cosa pasa a llamarse por lo
  que es.
- **Vista de escritorio en varias columnas**: en pantalla ancha la app deja de
  ser un móvil estirado. La columna se ensancha y los bloques de una sección se
  reparten en varias columnas, de modo que lo que en el móvil son sub-pestañas
  en el escritorio se ve a la vez. Es la misma app y el mismo código: cambia la
  colocación, no las funciones.
- **La confirmación aparece donde está el dedo**: al apuntar algo desde la
  semana ("me lo he comido", "lo he hecho"), el aviso de guardado sale pegado al
  botón que se ha pulsado, no al final de la página. Hasta ahora se guardaba
  bien pero el aviso caía fuera de la pantalla, y parecía que no había pasado
  nada.
- **Fotos deja de estar escondida**: hoy solo se llega desde el atajo de Hoy.
  Pasa a tener su sitio en la navegación.
- **Menos fricción al apuntar**: los campos de fecha y hora dejan de estar
  siempre a la vista en los formularios, porque casi siempre son "ahora". Se
  despliegan cuando hacen falta. Y los botones pequeños de tipo enlace
  (Cancelar, Quitar filtro, Volver) crecen lo suficiente para acertarles con el
  dedo.

Lo que **no** cambia: la semana de dieta y la de tabla siguen sin guardar estado
—no marcan qué has cumplido y qué no—, tal y como se decidió al diseñarlas. Aquí
solo se arregla el aviso de guardado.

## Qué hará (ampliación de la v4, decidida el 21 de agosto de 2026)

Sale de probar la 036 en producción. Sigue sin añadir funciones: muestra mejor
lo que ya se guarda.

- **Comidas: "lo de siempre" integrado**: en vez de una lista aparte debajo del
  formulario, las comidas que más se repiten se ofrecen como chips justo bajo
  el campo de texto de "Nueva comida"; tocar uno la guarda igual que antes.
  Fecha y hora del formulario se pliegan —casi siempre es "ahora"— y solo se
  despliegan si hace falta cambiarlas, para que el formulario ocupe menos y el
  diario de comidas se vea antes, sin tanto scroll.
- **"Hoy" con la lista completa del día**: el resumen de una línea por tipo
  (peso/comida/ejercicio) se sustituye por una lista de todo lo dado de alta
  hoy, ordenada por la hora de cada registro (más tardía primero).
- **Detalle real en el calendario de constancia**: al tocar un día ya no basta
  con saber qué tipos se apuntaron ("comida, ejercicio"); debajo del
  calendario se ve el texto exacto de cada comida y ejercicio de ese día (con
  su hora) y el peso, sin recortar.

## Qué hará (segunda ampliación de la v4, decidida el 22 de agosto de 2026)

Sale del mismo diagnóstico de usabilidad del 20 de agosto, en el único punto
que la v4 dejó sin tocar. Tampoco añade funciones.

- **Ajustes deja de ser una columna de siete bloques**: hoy conviven en una
  sola página la foto de perfil, el objetivo, el proveedor de IA, la sesión,
  finalizar la operación, el histórico y el reinicio de datos, en ese orden.
  Pasa a partirse en pestañas propias, igual que Comidas y Ejercicio en la
  spec 035: **Perfil**, **Operación**, **App** y una pestaña aparte para la
  **zona de peligro**. Lo de todos los días deja de compartir pantalla con el
  borrado irreversible.
- **Ajustes es la excepción en escritorio**: a diferencia del resto de
  secciones, en pantalla ancha sus pestañas **no** desaparecen ni sus bloques
  se reparten en columnas. Un formulario estirado se lee peor, así que Ajustes
  se queda estrecho, centrado y con las pestañas puestas. Es una excepción
  consciente a la vista de escritorio de la spec 036.

- **Ejercicio también repite lo de siempre**: los ejercicios que más se
  repiten se ofrecen como chips junto al campo de "Nuevo ejercicio", igual que
  las comidas desde la ampliación del 21 de agosto. Con una diferencia
  deliberada: un chip de comida **guarda** la comida de un toque, mientras que
  un chip de ejercicio **rellena el formulario** (nombre, minutos e intensidad
  de la última vez) y espera a que confirmes, porque un ejercicio repetido casi
  nunca dura lo mismo. Se ahorra escribir, no se decide por el usuario.

- **Lo apuntado se lee de un vistazo**: cada registro del diario (peso, comida
  o ejercicio) pasa a ocupar dos líneas: arriba, **qué** fue; debajo y en gris,
  cuándo y sus detalles (hora, minutos, intensidad, momento). Hasta ahora todo
  iba en una sola línea y competía por el ancho con los botones, así que en una
  columna estrecha el texto de la comida o del ejercicio —justo lo único que no
  se puede deducir— se recortaba hasta desaparecer. Editar y borrar dejan de
  ser dos palabras y pasan a ser dos iconos.

## Qué hará (v5: la consulta como revisión periódica, decidida el 22 de agosto de 2026)

Sale de usar Consulta con la app ya llena. El diagnóstico del usuario: la
pantalla arrastra un modelo de cuando no existían la dieta ni la tabla
semanales. Hoy una consulta termina pariendo un "plan" de texto —pautas de
nutrición y una rutina— que **duplica** lo que ya viven en Comidas y en
Ejercicio, y encima con menos detalle y sin poder marcarlo ni editarlo. Y para
salir de una consulta a medias hay un botón de "Abandonar consulta", que es lo
que hace un formulario, no lo que hace un paciente.

La idea que manda a partir de ahora: **la app tiene un nutricionista al que
puedes preguntarle dudas cuando quieras, y que además te pasa consulta cada
cierto tiempo para ver cómo vas, animarte o echarte la bronca.**

- **La consulta es una revisión, no una entrevista de alta.** Al pasar consulta,
  la IA repasa lo que has hecho **desde la consulta anterior** (peso, comidas,
  ejercicio, constancia) y te habla de eso: qué ha ido bien, qué se ha torcido y
  qué toca ahora. La entrevista larga sigue existiendo, pero solo donde tiene
  sentido: la primera vez, al abrir una operación.
- **Se puede pasar consulta cuando quieras, con la app avisando.** No hay
  bloqueo por calendario: la pantalla te dice cuánto hace de la última y te
  sugiere esperar si fue hace nada, pero la decisión es tuya. Sigue habiendo un
  tope diario, que es una cuestión de cuota de IA, no de producto.
- **"Abandonar consulta" desaparece.** Una consulta a medias se retoma o se
  deja estar; no hace falta un botón para tirarla a la basura.
- **Los planes desaparecen como concepto.** Lo que antes era un "plan" ahora
  son dos cosas que ya existen y son mejores: la **dieta de la semana** y la
  **tabla de ejercicio**. Lo que la consulta produce es su propio cierre —el
  repaso y lo que toca—, que se lee en la conversación, no una tarjeta aparte.
  Los planes ya guardados no se borran: dejan de enseñarse.
- **La consulta puede proponerte dieta o tabla nuevas.** Si de la revisión sale
  que toca cambiar la semana, la IA te lo propone y te lo deja a un toque. No
  te sustituye la dieta ni la tabla sin que lo aceptes.

## Qué hará (v6: un solo hilo, decidida el 23 de agosto de 2026)

Sale de usar la v5 recién hecha. El usuario lo dijo en una línea: *"es un poco
lío lo de la conversación más la consulta, igual mejor que sea todo uno"*. Y
tiene razón: la spec 023 se llamaba "una sola conversación" y hemos acabado con
**dos hilos, dos cajas de texto y dos cupos** en la misma pantalla. Un
nutricionista de verdad no tiene dos libretas.

- **Un solo hilo con tu nutricionista.** Todo lo que habláis vive en el mismo
  sitio y en orden: las dudas del día a día y las revisiones periódicas. Al
  pasar consulta ves lo que ya habíais hablado, que es justo el contexto que
  hace falta para entender lo que te dice.
- **Una sola caja de texto, arriba del todo.** Escribes en el mismo sitio
  siempre. Si hay una revisión en marcha, lo que escribes le contesta a ella; si
  no, es una pregunta normal.
- **Lo último, lo primero que se ve.** El hilo va debajo de la caja y **del
  revés**: lo más reciente arriba, lo más antiguo hacia abajo. No hay que
  recorrer meses de conversación para escribir ni para leer lo último; se baja
  solo si se quiere ver cómo empezó.
- **Un solo cupo: 20 mensajes al día.** Desaparece el cupo aparte de consultas.
  Empezar una revisión cuenta como un mensaje, que es lo que la mantiene
  acotada sin necesidad de un segundo número que explicar.
- **"Pasar consulta" sigue siendo un botón.** La revisión no es un mensaje más:
  es el momento en que le pides que se ponga a mirar tus datos y te diga cómo
  vas. Se marca en el hilo para que se distinga de la charla normal.
- **Lo ya hablado no se pierde.** Las conversaciones y las consultas que ya
  tienes guardadas se enseñan juntas, ordenadas por fecha. No se migra ni se
  borra nada: solo se pintan en el mismo hilo.
- **La entrevista que abre una operación también vive ahí.** Es el principio de
  la conversación con tu nutricionista, no un trámite aparte.

## Qué hará (v7: el comité de bienvenida, decidida el 25 de agosto de 2026)

Sale de hacer la entrevista de bienvenida ya arreglada y ver que preguntar de
una en una el nombre, la altura, el peso y el objetivo es lento para datos que
caben en un formulario.

- **Un formulario de alta con todo de serie.** Abrir una operación deja de ser
  un chat de diez preguntas: se rellena una ficha —nombre, altura, peso actual,
  peso objetivo, plazo, gustos, aversiones, alergias, ejercicio que disfrutas,
  material y limitaciones— y se envía de una vez.
- **La IA solo repregunta si tiene dudas.** Si la ficha está completa, no
  pregunta nada y contesta directamente con sus primeros consejos. Si falta algo
  o algo no cuadra, lo pregunta de una en una, hasta tres veces.
- **El comité te deja la casa montada.** Al terminar el alta, si lo has pedido,
  ya tienes creadas tu **dieta de la semana** y tu **tabla de ejercicio**, hechas
  con lo que acabas de contar. El cierre te lo dice.
- **Tu peso de partida cuenta desde el minuto uno.** El peso que pones en la
  ficha se apunta como tu primer pesaje, así que la gráfica arranca con un punto
  en vez de estar vacía.
- **Las operaciones siguientes usan la misma ficha**, ya rellena con lo que la
  IA sabía de ti: cambias lo que haya cambiado y envías.

## Qué hará (v8: la despensa, decidida el 28 de agosto de 2026)

Sale de usar la dieta semanal. La IA te propone una semana estupenda y luego
resulta que hay que ir al supermercado a por todo, mientras en tu nevera se
está poniendo mala media bolsa de mix de verduras congelado. La dieta no sabe
nada de lo que ya tienes en casa, así que no puede aprovecharlo.

La v8 le enseña a la app qué tienes en la cocina, y hace que la dieta lo use.

- **Una despensa tuya, en Comidas.** Una lista de los ingredientes con los que
  sueles cocinar: desde "tomate" hasta "mix de verduras congelado", pasando por
  carnes, legumbres y especias. La escribes una vez y se queda.
- **Cada ingrediente se marca o se desmarca**, según lo tengas ahora mismo o se
  te haya acabado. Marcar es un toque, y es todo el mantenimiento que pide.
  **No lleva cantidades ni caducidades a propósito**: un inventario que hay que
  actualizar después de cada comida acaba mintiendo, y una despensa que miente
  es peor que no tenerla.
- **Al pedir la dieta puedes decir "aprovecha lo que tengo".** Con esa casilla,
  la IA recibe la lista de lo que tienes marcado y construye la semana tirando
  de ello todo lo que pueda.
- **No es una obligación, es una preferencia.** Las recetas no salen usando
  *solo* lo que tienes: eso daría semanas tristes y repetidas. Si con lo tuyo da
  para el plato entero, lo hace; si no, completa con lo que haga falta.
- **Al abrir una receta ves qué tienes y qué te falta.** Cada ingrediente sale
  marcado o no según tu despensa **en ese momento**, no según cómo estaba el día
  que se generó la receta. Si te comiste el tomate y lo desmarcaste, la receta lo
  refleja al abrirla.

Qué NO hace la v8, para que quede escrito:

- **No lleva la cuenta de cuánto te queda de nada.** Ver el punto de arriba.
- **No hace la lista de la compra.** Está en las ideas de más abajo desde hace
  semanas y sigue ahí: enseñarte qué te falta en una receta no es lo mismo que
  juntar la compra de la semana entera, y esto último merece su propia versión.
- **No toca las bebidas ni los acompañamientos.** Salieron en la misma
  conversación del 28 de agosto y están decididos, pero van a la v9: ver abajo.

Se reparte en tres specs. Las dos primeras se decidieron así desde el inicio,
porque son cosas distintas y la primera se puede usar sin la segunda. La tercera
salió al revisar la 059, **antes de implementar nada**: aquella spec daba por
hecho que una receta se podía leer desde Mi dieta, y resultó que no — la dieta
guarda a qué receta apunta cada comida pero nunca la enseña.

| Spec | Qué |
|---|---|
| 058 | La despensa: la sub-pestaña, la lista y las casillas de "lo tengo" |
| 059 | La dieta aprovecha la despensa, y la receta del recetario enseña qué te falta |
| 060 | Poder abrir la receta desde Mi dieta, con sus marcas |

## Qué hará (v9: lo que bebes y lo que acompaña, decidida el 29 de agosto de 2026)

Sale de la misma conversación que la v8, el 28 de agosto, y se aparcó para
cerrar aquella antes de abrir otro frente. La v8 está cerrada el 29.

La app sabe lo que comes y lo que entrenas, y **no sabe nada de lo que bebes**.
Ni el agua, que es la mitad de cualquier consejo que te van a dar, ni la caña del
viernes. Y de lo que comes se le escapa lo que acompaña: apuntas "lentejas" y no
los tres trozos de pan que te comiste con ellas.

- **El agua, con un contador de un toque.** Un botón "+1 vaso" en **Hoy**, con un
  objetivo diario que se configura en Ajustes. Es un contador y no un registro
  escrito porque el agua se bebe ocho veces al día, y nadie va a escribir "vaso
  de agua" ocho veces.
- **El resto de bebidas, apuntadas como una línea normal**: el café, la cerveza,
  el refresco. Eso sí interesa verlo escrito, y con su hora.
- **Un acompañamiento dentro de la comida**, campo corto: "3 trozos de pan", "un
  biscote". No es un picoteo aparte, va CON la comida, y la IA tiene que verlo
  como una sola cosa ("lentejas + 3 trozos de pan") y no como dos ingestas.

Qué NO hace la v9, y por qué. Las tres son decisiones del usuario del 29 de
agosto, y las tres son de contención:

- **El agua no da puntos ni mantiene la racha.** La racha cuenta lo mismo que el
  calendario de constancia —peso, comida, ejercicio— y las fotos ya se quedaron
  fuera por eso mismo. Si el agua contara, habría que meterla también en el
  calendario, o el calendario pintaría un día vacío que la racha da por bueno.
  Además es el registro más barato de la app: puntuarlo devalúa los puntos de lo
  que sí cuesta.
- **Las bebidas no entran en el análisis nutricional.** Sus seis grupos son
  sólidos y no hay hueco para un líquido sin rehacerlos, lo que dejaría
  desalineados todos los análisis ya guardados. Que la cerveza no cuente
  calorías es una deuda consciente, apuntada abajo en las ideas.
- **El agua no se apunta con hora ni se edita vaso a vaso.** Es un contador: +1,
  -1 y el número del día. Un historial de a qué hora bebiste cada vaso no lo va a
  mirar nadie.

Se reparte en tres specs, partidas desde el inicio porque son tres cosas
distintas y cada una se puede usar sin las otras:

| Spec | Qué |
|---|---|
| 061 | El agua del día: el contador en Hoy y su objetivo en Ajustes |
| 062 | Las bebidas, apuntadas como un registro más |
| 063 | El acompañamiento dentro de la comida |

## Qué hará (v10: la semana que se lee y la app con iconos, decidida el 29 de agosto de 2026)

Sale de usar la dieta. Dos problemas, y el segundo es la causa del primero.

**La semana de la dieta se descuadra.** Cada comida es una fila con la etiqueta
del momento, el plato y dos botones. Los botones son de texto y de ancho
variable —"Me lo he comido", "Editar", "+"—, así que la columna del plato acaba
en un sitio distinto en cada fila y la semana se lee torcida. Además, siete días
por cuatro comidas son veintiocho filas seguidas en pantalla: mucho scroll para
ver lo de hoy.

- **La semana pasa a ser siete recuadros, L M X J V S D**, en una tira. Tocas uno
  y debajo aparecen las comidas de ese día, solo de ese.
- **El día en el que estás se ve marcado**, y es el que sale abierto al entrar.
- **Las acciones de fila llevan icono en vez de texto**: "Me lo he comido",
  "Editar" y "Borrar". Al ser de ancho fijo, las filas se alinean solas — que es
  el arreglo del descuadre, no un adorno.
- **La barra de navegación pasa a iconos**, salvo "Hoy", que se queda en texto.
- **Ajustes vuelve a la barra, con un engranaje**, y el avatar deja de abrirlo.

Qué NO hace la v10:

- **No cambia ningún dato.** Es cómo se ve y cómo se llega, nada más. La dieta
  que tengas guardada es la misma.
- **No iconiza los botones únicos** (Guardar, Cancelar, Pedir dieta, Analizar).
  Solo los que se repiten en cada fila y la barra. Una acción que aparece una vez
  se explica mejor con su palabra que con un dibujo.
- **La Despensa vuelve a su sitio en escritorio.** Desde la spec 058 hay cuatro
  sub-pestañas en Comidas y la rejilla de escritorio estaba hecha para tres, así
  que la Despensa caía debajo de Apuntar en vez de junto a las Recetas, que es
  con lo que se usa. En móvil no se notaba.
- **El nombre de un plato largo se parte en dos líneas**, en vez de recortarse
  con puntos suspensivos. Un plato es "pollo al horno con tomate triturado y
  verduras", y cortarlo a la mitad no dice lo que has puesto.
- **No quita la vista de la semana entera**: sigue habiendo forma de ver los
  siete días de un vistazo, para cuando lo que quieres es repasar la semana.

### Ajustes vuelve a la barra: esto revierte una decisión anterior

La **spec 024** sacó Ajustes de la barra a propósito y lo puso detrás del avatar.
Aquello tenía sentido cuando la barra tenía cinco botones de texto y no cabía
más. Con iconos caben siete, y esconder Ajustes detrás de una foto nunca fue
evidente: hay que saberlo.

Decisión del usuario del 29 de agosto, tomada sabiendo que revertía la 024. **El
avatar deja de abrir Ajustes**: dos caminos a la misma pantalla es justo la
duplicidad que la v4 se dedicó a quitar.

Se reparte en tres specs:

| Spec | Qué |
|---|---|
| 064 | La semana de la dieta, en siete recuadros con el día de hoy marcado |
| 065 | Iconos en las acciones de fila |
| 066 | La barra con iconos, y Ajustes de vuelta con su engranaje |
| 067 | La misma tira de días en la tabla de ejercicio (ampliación del 29 de agosto) |

## Ideas para más adelante (27 de agosto de 2026)

El 27 de agosto se vació `docs/BACKLOG.md`: la app está terminada y en uso
diario, y lo que quedaba dentro no eran tareas pendientes de una versión, sino
candidatas a la siguiente. Viven aquí, en producto, para que la próxima versión
se elija de una lista de ideas y no de una lista de deudas.

**Nada de esto está decidido.** Estar en esta lista no es un compromiso: es
haber sobrevivido a la limpieza. Lo que se decida se escribirá arriba, como un
apartado "Qué hará (v8…)" con sus specs.

### Deudas que deja la v9

- **La cerveza y el refresco no cuentan calorías.** La v9 los apunta pero los
  deja fuera del análisis nutricional, que tiene seis grupos y todos son
  sólidos (`api/analisis.js`). Meterlos obliga a rehacer el prompt, el esquema
  y la normalización, y a decidir qué pasa con los análisis ya guardados. Es
  una decisión consciente del 29 de agosto, no un olvido.
- **Que el agua cuente para la constancia.** Descartado el 29 de agosto para no
  contradecir al calendario. Si algún día se retoma, el trabajo de verdad no es
  la gamificación: es **meter el agua en el calendario de constancia**, y solo
  entonces en la racha. Una cosa sin la otra deja la app diciendo dos verdades
  distintas en la misma pantalla.

### Huecos que se notan usando la app

- **Guardar varias dietas y varias tablas**, y poder recuperar una anterior. Hoy
  solo hay una activa de cada (specs 028 y 029): pedir otra pisa la que tenías.
  Es la más grande de la lista — cambia el modelo de datos y las reglas de
  Firestore, así que sería una versión partida en varias specs, nunca una sola.
- **Lista de la compra** de la semana, a partir de la dieta y sus recetas
  (specs 026 y 028).
- **Borrar una operación concreta del histórico** desde su tarjeta. La spec 019
  borra el histórico entero o nada, y la 056 le añadió la operación en curso,
  pero sigue sin haber un borrado de una sola.
- **Marcar ejercicios sueltos dentro de una sesión**, en vez de la sesión entera
  (spec 029).
- **Registrar los pesos levantados y ver la progresión de cargas** (spec 029).
  De aquí cuelga el chip de series y repeticiones de la spec 042: sin cargas
  registradas no hay nada que enseñar.
- **Que el análisis nutricional del día alimente el contexto de la conversación**
  (spec 030). Hoy se calcula y no se le cuenta a nadie: la IA no lo ve.
- **Evolución de los grupos de alimentos a lo largo de la semana** (spec 030:
  solo el día de hoy, sin histórico).
- **Que la revisión sepa si de verdad tienes dieta y tabla.** El 27 de agosto se
  arregló el alta, que prometía planes que nadie iba a crear (ver más abajo,
  en la limpieza). La revisión periódica arrastra la misma suposición: su prompt
  afirma que ya tienes dieta semanal y tabla de ejercicio, y con las casillas del
  comité desmarcadas eso es falso. Arreglarlo de verdad obliga a que el navegador
  le diga al proxy qué tienes, así que es una spec, no un retoque.

### Pulido visual

Verificado el 27 de agosto contra el código: todo esto sigue pendiente, y todo
es cosmético.

- Iconos en la barra de navegación inferior (la spec 009 la dejó solo con texto).
- Llevar el formato de dos líneas con iconos de la spec 043 a las recetas, al
  catálogo de ejercicios y al histórico de operaciones. La 043 solo cambió las
  tres listas del diario.
- Que el chip de ejercicio frecuente enseñe cuántas veces lo has hecho
  ("bici · 45 min · ×9") (spec 042).
- Etiquetas de mes encima del calendario de constancia cuando el rango es largo
  (spec 021).
- Tocar un mes del mapa de calor para verlo como calendario (spec 025).
- Elegir el encuadre de la foto de perfil al subirla (la spec 011 recorta
  centrado, sin editor).
- El aviso de guardado dura 3 segundos fijos y desaparece solo; valorar si algún
  caso pide que se quede hasta cerrarlo.

### Con una condición delante

- **Que la semana de dieta y de tabla marquen qué has cumplido hoy.** Se descartó
  a propósito en la v4 para no chocar con la spec 028. Sigue contradiciendo lo
  que dice este documento: si algún día se retoma, **hay que cambiar primero el
  apartado correspondiente de arriba**, y solo entonces escribir la spec.

## Qué explícitamente NO hace

- No sustituye a un profesional médico real: siempre debe recordar (disclaimer) que ante dudas o falta de resultados hay que consultar a un médico.
- No da diagnósticos médicos ni detecta enfermedades.
- No comparte datos entre los dos usuarios: cada uno ve solo lo suyo.
- No entrena modelos propios: usa APIs de IA de terceros tal cual (Google Gemini por defecto, con Groq como reserva automática si falla; desde Ajustes cada usuario puede elegir probar Groq primero).
- No compara ni clasifica a los dos usuarios entre sí: no hay ranking ni objetivos compartidos.
- No pesa alimentos ni da calorías exactas: solo estimaciones en rango, porque cualquier otra cosa sería precisión fingida.

## Conceptos clave del dominio

- **Pesaje**: registro puntual de peso con fecha. Se puede corregir después.
- **Comida**: registro de una ingesta (qué se ha comido, cuándo). Se puede corregir después.
- **Ejercicio**: registro de una actividad física (qué, duración/intensidad, cuándo). Se puede corregir después.
- **Foto de progreso**: foto asociada a una fecha, para seguimiento visual y cuadrícula de evolución.
- **Consulta** (o **revisión**): el momento en que le pides a tu nutricionista que mire tus datos y te diga cómo vas. La primera de todas es la entrevista que abre una operación; las siguientes repasan lo hecho desde la anterior. Desde la v6 no es un hilo aparte: ocurre dentro de la conversación de siempre.
- **Consejo**: feedback puntual generado por la IA a partir del historial reciente, sin ser una conversación guiada completa.
- ~~**Plan**~~: retirado en la v5 (22 de agosto de 2026). Lo que producía —pautas de nutrición y una rutina, en texto— lo hacen mejor la *dieta* y la *tabla de ejercicio*, que además se pueden editar y marcar. Los planes ya guardados siguen en la base de datos, sin enseñarse.
- **Racha**: días seguidos apuntando algo. Admite un día de gracia por semana, para que un despiste no la rompa.
- **Punto**: unidad que se gana al registrar. Premia la conducta, no los kilos.
- **Receta**: nombre, raciones, ingredientes y preparación. Se puede cocinar leyéndola y la IA puede reutilizarla.
- **Vaso de agua** (v9): la unidad del contador de agua. No se guarda a qué hora ni de qué tamaño: solo cuántos llevas hoy. No da puntos ni mantiene la racha.
- **Bebida** (v9): lo que bebes que no es agua —café, cerveza, refresco—, apuntado como una línea con su hora, igual que una comida.
- **Acompañamiento** (v9): lo que va CON una comida y no es un plato aparte ("3 trozos de pan"). Vive dentro del registro de la comida, no al lado.
- **Despensa** (v8): la lista de ingredientes con los que sueles cocinar, cada uno marcado o no según lo tengas ahora en casa. No es un inventario: no guarda cuánto queda. Sirve para que la dieta aproveche lo que ya está en la nevera.
- **Dieta**: una semana de menús, día a día y comida a comida, hecha de recetas.
- **Tabla de ejercicio**: una semana de entrenamientos, día a día, con sus series y duraciones.
- **Ejercicio del catálogo**: nombre, cómo se hace y material. Distinto de un *ejercicio* apuntado, que es un registro de actividad hecha.
- **Emblema**: reconocimiento por un hito de constancia (primera semana, primer mes, retomar tras un parón).

## Roadmap por fases

- **v1 (beta, deadline 31 de agosto)**: todo el alcance descrito arriba (registro completo + consejos + consulta + fotos), priorizando que funcione sobre que esté pulido visualmente. **Terminada y probada el 11 de agosto de 2026** (specs 001 a 005), 20 días antes del plazo.
- **v2 (en curso desde el 11 de agosto de 2026, sin fecha límite)**: lo descrito en "Qué hará (v2)". El criterio con el que se eligió: la v2 no se pierde por falta de funciones, se pierde si dejamos de usar la app; así que primero va lo que quita fricción y lo que se disfruta a diario. Razonamiento completo en `docs/propuestas/v2-usabilidad-y-gamificacion.md`.
- **v3 (16 de agosto de 2026)**: lo descrito en "Qué hará (v3)". Terminada y probada.
- **v4 (desde el 20 de agosto de 2026, sin fecha límite)**: lo descrito en "Qué hará (v4)" y en sus dos ampliaciones, la del 21 y la del 22 de agosto. No añade funciones: reordena lo que ya hay para que se encuentre, y estrena la vista de escritorio. Sale de una auditoría de usabilidad hecha sobre el código el 20 de agosto, y de probar la 036 en producción el 21.
- **v5 (desde el 22 de agosto de 2026, sin fecha límite)**: lo descrito en "Qué hará (v5)". Sale de usar Consulta con la app ya llena y ver que arrastraba el modelo de antes de que existieran la dieta y la tabla semanales. Se reparte en las specs 044, 045 y 046.
- **v6 (desde el 23 de agosto de 2026, sin fecha límite)**: lo descrito en "Qué hará (v6)". Sale de usar la v5 y ver que la pantalla de Consulta había acabado con dos hilos y dos cupos. Se reparte en las specs 050 (ver el hilo junto), 051 (una caja y un cupo) y 052 (la entrevista en el hilo).
- **v7 (desde el 25 de agosto de 2026, sin fecha límite)**: lo descrito en "Qué hará (v7)". Sale de usar la entrevista de bienvenida ya arreglada (specs 052-056) y ver que es lenta para datos que caben en un formulario. Va en la spec 057, sin partir, por decisión del usuario.
- **v8 (desde el 28 de agosto de 2026, sin fecha límite)**: lo descrito en "Qué hará (v8)". Sale de usar la dieta semanal y ver que propone comprarlo todo mientras se estropea lo que ya hay en casa. Se reparte en las specs 058 (la despensa) y 059 (la dieta que la aprovecha), partida desde el inicio.
- **v8 (28 y 29 de agosto de 2026)**: la despensa. **Terminada y probada**, en las specs 058 (la despensa), 059 (la dieta la aprovecha) y 060 (ver la receta desde la dieta). La 060 no estaba prevista: salió de revisar la 059 y descubrir que daba por hecha una pantalla que no existía.
- **v9 (desde el 29 de agosto de 2026, sin fecha límite)**: lo descrito en "Qué hará (v9)". Sale de la misma conversación que la v8. Se reparte en las specs 061 (el agua), 062 (las bebidas) y 063 (el acompañamiento), partida desde el inicio.
- **v10 (desde el 29 de agosto de 2026, sin fecha límite)**: lo descrito en "Qué hará (v10)". Sale de que la semana de la dieta se descuadraba al usarla. Se reparte en las specs 064 (los siete recuadros), 065 (iconos de fila) y 066 (la barra y Ajustes).
- **Descartado para v2**: notificaciones push (mucho trabajo y acaban silenciadas), integración con básculas o pulseras, y comparativa de fotos lado a lado, que se pospone.
