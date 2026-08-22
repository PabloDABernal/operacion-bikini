# Producto: OperaciónBikini

## Para qué sirve

Esta app sirve para que mi mujer y yo perdamos peso y nos sintamos bien con nuestro cuerpo de cara al verano de 2027, actuando como un nutricionista/entrenador personal con IA que nos entrevista, hace seguimiento de nuestros datos y nos da consejos y planes.

## Para quién

Un grupo pequeño y cerrado de usuarios personales (empezando por mí, y probablemente mi mujer), cada uno con su cuenta y sus datos completamente separados: peso, comidas, ejercicio, fotos y conversaciones con la IA de un usuario no son visibles para el otro. No es una app pública ni de registro abierto — el acceso se concede manualmente (dando de alta la cuenta o permitiendo el inicio de sesión), no cualquiera con el enlace puede entrar.

## Qué hace (alcance actual — v1 beta, objetivo 31 de agosto)

- Login separado por usuario, con email/contraseña o cuenta de Google (a elección de cada uno).
- Registro de pesajes (peso + fecha).
- Registro de comidas.
- Registro de ejercicio.
- Subida de una foto de progreso por día, con seguimiento visual (collage de evolución).
- Botón **"Consejos"**: la IA analiza el historial reciente (pesajes, comidas, ejercicio) y da pautas puntuales.
- Botón **"Pasar consulta"**: conversación guiada por la IA, tipo entrevista de nutricionista (pregunta gustos, hábitos, objetivos, mediciones...) que termina generando un plan de nutrición y un plan de ejercicio.
- Disclaimer visible de que los consejos y planes los genera una IA y no sustituyen a un médico o nutricionista real.

## Qué hará (v2, decidida el 11 de agosto de 2026)

- **Corregir lo apuntado**: cualquier pesaje, comida o ejercicio ya guardado se puede editar después (todos sus campos, incluida la fecha), sin tener que borrarlo y volver a crearlo. Las fotos de progreso siguen ligadas a su fecha de subida.
- Pantalla de **Ajustes** con los datos personales de cada usuario: peso objetivo, altura y fecha objetivo. Desde ahí también se cierra sesión.
- **Reinicio de datos**: cada usuario puede borrar sus propios datos eligiendo qué tipos (pesajes, comidas, ejercicio, consejos, consultas y planes, fotos), con una confirmación de tres pasos. La cuenta no se borra.
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
- **Operaciones con principio y fin**: la app funciona por ciclos. Una **operación bikini** empieza con la entrevista y se cierra cuando el usuario quiere, desde Ajustes. Mientras no hay una operación en marcha, la app solo deja iniciarla: no se puede apuntar nada. Al cerrarla, todo lo apuntado se archiva y queda consultable en un **histórico**, con su resumen (fechas, peso inicial y final, kilos y días registrados) y sus registros en solo lectura. Los ajustes, la foto y lo que la IA sabe del usuario se conservan de una operación a la siguiente. El histórico se puede borrar entero desde el reinicio de datos, como cualquier otro tipo.
- **Consultas especializadas**: se puede gastar una consulta del día en pedir algo concreto — una tabla de ejercicios para hoy o para la semana, o una dieta detallada para los próximos días — en vez de la entrevista general.

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
- **Foto de progreso**: foto asociada a una fecha, para seguimiento visual y collage de evolución.
- **Consulta**: conversación guiada por la IA (tipo entrevista) que termina generando un plan de nutrición y ejercicio.
- **Consejo**: feedback puntual generado por la IA a partir del historial reciente, sin ser una conversación guiada completa.
- **Plan**: resultado de una consulta (nutrición + ejercicio) asociado a un usuario.
- **Racha**: días seguidos apuntando algo. Admite un día de gracia por semana, para que un despiste no la rompa.
- **Punto**: unidad que se gana al registrar. Premia la conducta, no los kilos.
- **Receta**: nombre, raciones, ingredientes y preparación. Se puede cocinar leyéndola y la IA puede reutilizarla.
- **Dieta**: una semana de menús, día a día y comida a comida, hecha de recetas.
- **Tabla de ejercicio**: una semana de entrenamientos, día a día, con sus series y duraciones.
- **Ejercicio del catálogo**: nombre, cómo se hace y material. Distinto de un *ejercicio* apuntado, que es un registro de actividad hecha.
- **Emblema**: reconocimiento por un hito de constancia (primera semana, primer mes, retomar tras un parón).

## Roadmap por fases

- **v1 (beta, deadline 31 de agosto)**: todo el alcance descrito arriba (registro completo + consejos + consulta + fotos), priorizando que funcione sobre que esté pulido visualmente. **Terminada y probada el 11 de agosto de 2026** (specs 001 a 005), 20 días antes del plazo.
- **v2 (en curso desde el 11 de agosto de 2026, sin fecha límite)**: lo descrito en "Qué hará (v2)". El criterio con el que se eligió: la v2 no se pierde por falta de funciones, se pierde si dejamos de usar la app; así que primero va lo que quita fricción y lo que se disfruta a diario. Razonamiento completo en `docs/propuestas/v2-usabilidad-y-gamificacion.md`.
- **v3 (16 de agosto de 2026)**: lo descrito en "Qué hará (v3)". Terminada y probada.
- **v4 (desde el 20 de agosto de 2026, sin fecha límite)**: lo descrito en "Qué hará (v4)" y en su ampliación del 21 de agosto. No añade funciones: reordena lo que ya hay para que se encuentre, y estrena la vista de escritorio. Sale de una auditoría de usabilidad hecha sobre el código el 20 de agosto, y de probar la 036 en producción el 21.
- **Descartado para v2**: notificaciones push (mucho trabajo y acaban silenciadas), integración con básculas o pulseras, y comparativa de fotos lado a lado, que se pospone.
