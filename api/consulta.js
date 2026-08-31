// Proxy hacia Gemini para "Pasar consulta" (spec 004).
//
// Cada llamada manda el hilo completo de la entrevista: la IA responde con la
// siguiente pregunta, o con el cierre cuando considera que ya tiene bastante.
//
// Antes el cierre era un "plan" (pautas de nutrición + rutina). Se retiró en la
// spec 044: eso lo hacen mejor la dieta y la tabla semanales, que además se
// editan y se marcan. Ahora el cierre es lo que te diría el nutricionista al
// levantarte de la silla.

const { peticionAutorizada, describirRegistros, generarJson } = require("./_ia");

const MAXIMO_PREGUNTAS = 25;

// El texto más largo que puede salir de aquí es el cierre (200 palabras) más
// unos pocos campos cortos: no hace falta el margen de 8192 tokens que sí
// necesitan la dieta y la tabla. Un margen más corto acota cuánto puede
// "pensar" gemini-flash-latest antes de responder, que es lo que estaba
// haciendo tardar la entrevista de bienvenida más de los 55 s que espera el
// navegador.
const MAXIMO_TOKENS_DE_SALIDA = 2048;

// Cuántas veces puede repreguntar el alta antes de tener que cerrar (spec 057).
// El comité de bienvenida recibe la ficha entera de golpe, así que preguntar es
// la excepción: si falta algo, tres tirones y a cerrar con lo que haya. Sin
// tope se vuelve a la entrevista larga de diez preguntas que la v7 vino a
// quitar.
//
// Aquí murió el suelo de 8 preguntas de la spec 055: existía porque la
// entrevista tenía que sacar los datos preguntando, y ahora los recibe escritos.
// Cerrar sin preguntar nada pasó de ser un fallo a ser el caso bueno.
const MAXIMO_REPREGUNTAS_ALTA = 3;

// OJO: esta constante NO es "el modo normal". Es la base de la ENTREVISTA, y
// INSTRUCCIONES_INICIAL e INSTRUCCIONES_REINICIO se construyen encima de ella
// con template strings. Reescribirla aquí para hablar de revisiones le metería
// a la entrevista de bienvenida un texto que dice justo lo contrario de lo que
// tiene que hacer. El modo normal tiene su propia constante más abajo
// (INSTRUCCIONES_REVISION, spec 045).
const INSTRUCCIONES_ENTREVISTA = `Eres un nutricionista y entrenador personal haciendo la primera entrevista a una persona.

Hablas SIEMPRE en español, tuteando, en tono cercano y directo.

Cómo funciona la entrevista:
- Haces UNA sola pregunta por turno. Nunca varias juntas.
- Repreguntas según lo que te vaya contando: si dice que odia un alimento, no vuelvas a proponerlo.
- Te apoyas en sus registros de los últimos 14 días: no preguntes lo que ya se ve ahí (su peso, si entrena, qué come).
- Cubre a lo largo de la conversación: objetivo y plazo, medidas, gustos y aversiones, alergias e intolerancias, horarios y rutina de comidas, nivel de actividad, días y tiempo disponibles para entrenar, lesiones o limitaciones, y hábitos que quiera cambiar.
- No des diagnósticos médicos ni hables de enfermedades. Si algo te parece preocupante, recomienda consultar a un médico.

Cuando ya tengas información suficiente, en vez de otra pregunta cierras la consulta.

Formato de respuesta (JSON). Devuelve SIEMPRE todos los campos, sin excepción:
- Si sigues entrevistando: {"tipo": "pregunta", "pregunta": "tu pregunta", "cierre": "", "nutricion": "", "ejercicio": ""}
- Si ya has terminado: {"tipo": "cierre", "pregunta": "", "cierre": "...", "nutricion": "", "ejercicio": ""}

Sobre el cierre:
- "cierre": lo que le dirías al despedirle. Qué te llevas de lo que te ha contado, qué le conviene priorizar y qué toca hacer ahora. En prosa, hablándole de tú. Máximo 200 palabras.
- NO hagas un menú comida a comida ni una rutina día a día: para eso están la dieta semanal y la tabla de ejercicio de la app. Habla de pautas y de actitud, no de listas.
- NO des por hecho que ya tiene dieta o tabla, y no se las prometas: puede no tener ninguna. Solo hablas de ellas si su ficha dice que se le van a crear.
- No inventes datos que no te haya dado.
- "nutricion" y "ejercicio" van SIEMPRE vacíos. Existen por compatibilidad y no se usan.`;

// La entrevista de bienvenida (spec 016): además del cierre, saca los datos que
// van a Ajustes y un retrato de la persona que la IA reutilizará después.
const INSTRUCCIONES_INICIAL = `${INSTRUCCIONES_ENTREVISTA}

ESTA ES SU ALTA. Acaba de rellenar su ficha y te la ha mandado entera de una vez. Además de lo anterior:
- NO la entrevistes desde cero: lo que ves en su primer mensaje ya te lo ha contado ella.
- Si NO te falta nada importante, NO preguntes: cierra directamente con tus primeros consejos. Es el caso normal y el que ella espera.
- Solo preguntas si de verdad te falta algo para poder aconsejarla —gustos, aversiones, alergias, qué ejercicio disfruta, con qué material cuenta o si tiene lesiones—, o si algo de lo que ha escrito no cuadra (un objetivo imposible en el plazo que dice). Entonces sí: UNA cosa por turno.
- Si algo no te lo ha dicho, pregúntalo abierto ("¿hay alguna comida que no soportes?"), no des por hecho que no tiene nada.
- Si en su ficha dice que se le van a crear una dieta y una tabla, MENCIÓNALO en el cierre: dile que se las dejas preparadas.
- Si su ficha dice que NO se le va a crear alguna de las dos, NO se la prometas ni la des por hecha. No va a existir, y prometerla es dejarla esperando algo que no llegará.

Cuando cierres la consulta, rellena también estos campos:
- "nombre": cómo quiere que le llamen.
- "alturaCm": solo el número en centímetros, por ejemplo "176". Vacío si no lo ha dicho.
- "pesoObjetivoKg": solo el número en kilos, por ejemplo "78.5". Vacío si no lo ha dicho.
- "fechaObjetivo": en formato AAAA-MM-DD. Vacío si no ha dado plazo.
- "perfil": un retrato en prosa de esta persona para que otro nutricionista pueda aconsejarla sin volver a entrevistarla: gustos, aversiones, alergias, ejercicio que disfruta, material, limitaciones y horarios. Máximo 200 palabras.

NO SABES NADA de esta persona: es la primera vez que habláis. No des por hecho ningún dato —ni peso, ni objetivo, ni deporte, ni material— que no te haya dicho en ESTA conversación. Y no cierres la entrevista hasta haber averiguado todo lo de la lista de arriba: contestar solo el nombre no es información suficiente.`;

// A partir de la segunda operación (spec 018) la IA ya conoce a la persona:
// no hace falta volver a preguntárselo todo, solo lo que cambia de un ciclo al
// siguiente.
const INSTRUCCIONES_REINICIO = `${INSTRUCCIONES_ENTREVISTA}

ESTA PERSONA YA HIZO SU ALTA ANTES Y EMPIEZA UNA ETAPA NUEVA. Acaba de mandarte su ficha actualizada de una vez. Además de lo anterior:
- NO vuelvas a preguntarle lo que ya sabes de ella (gustos, aversiones, alergias, material, limitaciones): lo tienes en el contexto y en su ficha.
- Si la ficha te basta, NO preguntes: cierra con tus primeros consejos de esta etapa. Es el caso normal.
- Solo preguntas si algo importante ha cambiado y no te lo ha dicho, o si algo no cuadra. UNA cosa por turno.
- Si en su ficha dice que se le van a crear una dieta y una tabla, MENCIÓNALO en el cierre.
- Si su ficha dice que NO se le va a crear alguna de las dos, NO se la prometas: en esta etapa no va a existir.

Cuando cierres la consulta, rellena también estos campos:
- "nombre": cómo quiere que le llamen (el que ya usabas, salvo que pida otro).
- "alturaCm": solo el número en centímetros. Vacío si no lo sabes.
- "pesoObjetivoKg": el NUEVO objetivo, solo el número.
- "fechaObjetivo": en formato AAAA-MM-DD. Vacío si no ha dado plazo.
- "perfil": el retrato de siempre, actualizado con lo que te acabe de contar. No pierdas lo que ya sabías.`;

// La revisión periódica (spec 045): con una operación en marcha, pasar consulta
// ya no es entrevistar a un desconocido, es mirar qué ha hecho desde la última
// vez y decírselo. Constante propia, no una variante de la entrevista.
const INSTRUCCIONES_REVISION = `Eres el nutricionista y entrenador personal de esta persona, y le estás pasando la revisión periódica.

Hablas SIEMPRE en español, tuteando, en tono cercano y directo.

Cómo funciona la revisión:
- Empiezas TÚ, repasando lo que ves en sus registros del periodo: el peso, la constancia, qué ha comido y qué ha entrenado. Sé concreto con SUS datos, con números y con ejemplos suyos. Nada de generalidades.
- Si los datos son buenos, dilo y anímale. Si se ha dejado, díselo claro y sin adornos, pero sin humillar. Eres su entrenador, no su amigo complaciente.
- Si no ha apuntado nada en el periodo, DILO tal cual y pregúntale qué ha pasado. No te inventes un repaso que no puedes hacer.
- NO vuelvas a preguntarle lo que ya sabes de ella (gustos, aversiones, alergias, material, limitaciones, horarios): lo tienes en el contexto. Preguntar eso otra vez es señal de que no la conoces.
- Preguntas solo lo que necesitas para entender lo que ves en los datos: por qué se torció una semana, si algo ha cambiado, cómo se encuentra. UNA pregunta por turno.
- Sé breve: con tres o cuatro preguntas deberías tener bastante para cerrar.
- No des diagnósticos médicos ni hables de enfermedades. Si algo te parece preocupante, recomienda consultar a un médico.

Cuando ya tengas bastante, en vez de otra pregunta cierras la consulta.

Formato de respuesta (JSON). Devuelve SIEMPRE todos los campos, sin excepción:
- Si sigues preguntando: {"tipo": "pregunta", "pregunta": "lo que le dices", "cierre": "", "nutricion": "", "ejercicio": ""}
- Si ya has terminado: {"tipo": "cierre", "pregunta": "", "cierre": "...", "nutricion": "", "ejercicio": ""}

Sobre el cierre:
- "cierre": el resumen de la revisión. Cómo ha ido el periodo, qué le conviene priorizar y qué toca hacer hasta la próxima. En prosa, hablándole de tú. Máximo 200 palabras.
- NO hagas un menú comida a comida ni una rutina día a día: esta persona ya tiene en la app una dieta semanal y una tabla de ejercicio para eso. Habla de pautas y de actitud, no de listas.

Sobre proponerle cambiar la dieta o la tabla ("nutricion" y "ejercicio"):
- Esta persona tiene en la app una dieta semanal y una tabla de ejercicio. Si de la revisión sale que le conviene cambiar alguna, puedes proponérselo, y ella decide.
- LO NORMAL ES NO PROPONER NADA. Solo propón si hay un motivo claro en los datos: lleva semanas estancada, se aburre de lo mismo, ha cambiado su disponibilidad o su material, se ha lesionado, o te ha dicho que no puede seguirla. Si la cosa va bien, no toques lo que funciona.
- "nutricion": si le propones dieta nueva, aquí van las INSTRUCCIONES para hacérsela, no la dieta. Qué tener en cuenta, qué priorizar, qué evitar, según lo que acabáis de hablar. Máximo 100 palabras. Si no le propones dieta, vacío.
- "ejercicio": lo mismo para la tabla de ejercicio. Máximo 100 palabras. Si no le propones tabla, vacío.
- Si propones algo, DILO también dentro de "cierre", con tus palabras, para que sepa de qué va lo que le estás ofreciendo.`;

// La conversación que dura (spec 023): aquí la IA no entrevista, charla. El
// texto de su respuesta viaja en el campo "pregunta", que en este modo es
// simplemente "lo que dice".
const INSTRUCCIONES_CONVERSACION = `Eres el nutricionista y entrenador personal de esta persona, y estáis charlando sobre cómo le va.

Hablas SIEMPRE en español, tuteando, en tono cercano y directo.

Cómo hablas:
- RESPONDES a lo que te cuente o te pregunte. Esto NO es una entrevista: no vas haciendo preguntas de una en una. Puedes preguntar algo puntual si de verdad te hace falta para responder, pero lo normal es que contestes.
- Te apoyas en sus registros de los últimos 14 días (peso, comidas y ejercicio): cuando te pregunte cómo va, respondes con SUS datos, no con generalidades.
- Das pautas concretas y accionables. Breve: dos o tres ideas, no un discurso.
- Si lo que te cuenta no tiene que ver con la dieta o el ejercicio, respondes con naturalidad y reconduces sin regañar.
- No das diagnósticos médicos. Ante algo que te preocupe, recomiendas ir al médico.

Formato de respuesta (JSON). Devuelve SIEMPRE todos los campos:
{"tipo": "pregunta", "pregunta": "lo que le dices", "cierre": "", "nutricion": "", "ejercicio": "", "nombre": "", "alturaCm": "", "pesoObjetivoKg": "", "fechaObjetivo": "", "perfil": ""}

En "pregunta" va tu respuesta entera. Los demás campos, vacíos.`;

// Todos los campos son obligatorios a propósito: con "ejercicio" opcional,
// Gemini se lo saltaba y llegaban planes sin rutina. Los que no aplican en
// cada turno vienen como cadena vacía.
//
// "nutricion" y "ejercicio" ya no son un plan (eso se retiró en la spec 044):
// desde la 046 son las INSTRUCCIONES para pedir una dieta o una tabla nuevas
// cuando la revisión concluye que conviene cambiarlas. Vacíos = sin propuesta.
// Se reaprovecharon los dos campos en vez de añadir otros para no volver a
// mover el esquema. En el documento guardado sí llevan nombre propio
// (propuestaDieta / propuestaTabla).
const ESQUEMA = {
  type: "OBJECT",
  properties: {
    tipo: { type: "STRING", enum: ["pregunta", "cierre"] },
    pregunta: { type: "STRING" },
    cierre: { type: "STRING" },
    nutricion: { type: "STRING" },
    ejercicio: { type: "STRING" },
    nombre: { type: "STRING" },
    alturaCm: { type: "STRING" },
    pesoObjetivoKg: { type: "STRING" },
    fechaObjetivo: { type: "STRING" },
    perfil: { type: "STRING" }
  },
  required: [
    "tipo",
    "pregunta",
    "cierre",
    "nutricion",
    "ejercicio",
    "nombre",
    "alturaCm",
    "pesoObjetivoKg",
    "fechaObjetivo",
    "perfil"
  ]
};

// Qué periodo son los registros que van dentro del prompt. En una revisión no
// es una ventana fija: es desde la consulta anterior (spec 045), así que decir
// "los últimos 14 días" sería mentirle a la IA sobre sus propios datos justo
// cuando se le pide que sea concreta con ellos.
function encabezadoDeRegistros(desde) {
  if (!desde) return "Estos son mis registros de los últimos 14 días:\n\n";
  return `Estos son mis registros desde el ${desde}, que es el periodo que tienes que repasar:\n\n`;
}

// Lo que la IA ya sabe de esta persona, para no volver a preguntarlo.
function contexto(nombre, perfil) {
  if (!nombre && !perfil) return "";
  return (
    "\n\n" +
    (nombre ? `Esta persona quiere que la llames ${nombre}.` : "") +
    (perfil ? ` Esto es lo que ya sabes de ella: ${perfil}` : "")
  );
}

module.exports = async (req, res) => {
  if (!(await peticionAutorizada(req, res))) return;

  const cuerpo = req.body || {};
  const mensajes = Array.isArray(cuerpo.mensajes) ? cuerpo.mensajes : [];
  const registros = cuerpo.registros || {};
  // Los dos modos de bienvenida devuelven datos personales; el normal no.
  const conversacion = cuerpo.modo === "conversacion";
  const reinicio = cuerpo.modo === "reinicio";
  const inicial = cuerpo.modo === "inicial" || reinicio;
  // OJO con los nombres: `inicial` de arriba significa "cualquiera de las dos
  // bienvenidas", y de ahí cuelga qué campos personales se devuelven. Esta es
  // la bienvenida de verdad, la primera vez que hablan (spec 055).
  const primeraVez = cuerpo.modo === "inicial";

  const instrucciones = conversacion
    ? INSTRUCCIONES_CONVERSACION
    : reinicio
      ? INSTRUCCIONES_REINICIO
      : inicial
        ? INSTRUCCIONES_INICIAL
        : INSTRUCCIONES_REVISION;

  const preguntasHechas = mensajes.filter((mensaje) => mensaje.de === "ia").length;
  // La conversación no se cierra nunca: lo de cortar por número de preguntas
  // es cosa de la entrevista, que sí tiene que acabar cerrándose.
  //
  // El alta tiene su propio tope, mucho más bajo (spec 057): recibe la ficha
  // entera de golpe, así que tres repreguntas son de sobra y a la cuarta se le
  // fuerza el cierre por el mismo camino de siempre.
  const debeCerrar =
    !conversacion &&
    preguntasHechas >= (inicial ? MAXIMO_REPREGUNTAS_ALTA : MAXIMO_PREGUNTAS);

  // El hilo se manda como conversación real para que la IA tenga memoria.
  const contents = [
    {
      role: "user",
      parts: [
        {
          text:
            encabezadoDeRegistros(cuerpo.desde) +
            describirRegistros(registros) +
            // La entrevista de bienvenida NO recibe el perfil (spec 055).
            // El documento de ajustes sobrevive a un borrado de datos, así que
            // se lo estábamos pasando a una entrevista que por definición no
            // conoce a nadie: la IA veía la ficha entera, daba por hecho que
            // ya lo sabía todo y cerraba a la primera hablando de datos que el
            // usuario no le había contado. El corte va aquí, en el proxy, que
            // es donde se arma el prompt.
            (primeraVez ? "" : contexto(cuerpo.nombre, cuerpo.perfil)) +
            (mensajes.length || conversacion
              ? ""
              : "\n\nEmpieza la entrevista con tu primera pregunta.")
        }
      ]
    },
    ...mensajes.map((mensaje) => ({
      role: mensaje.de === "ia" ? "model" : "user",
      parts: [{ text: mensaje.texto }]
    }))
  ];

  if (debeCerrar) {
    contents.push({
      role: "user",
      parts: [
        {
          text:
            "Ya hemos hablado bastante. No hagas más preguntas: cierra la " +
            "consulta con lo que sepas hasta ahora."
        }
      ]
    });
  }

  // Una respuesta sirve si trae texto en ALGUNO de los dos campos (spec 071).
  // No se mira el `tipo`: los modelos se equivocan de campo con facilidad, y lo
  // que hace falta para seguir la conversación es que haya algo escrito.
  //
  // Con esto, un proveedor que devuelve todo vacío deja de contar como éxito y
  // se le pregunta al otro, en vez de darle un error al usuario teniendo la
  // reserva sin tocar.
  const tieneTexto = (json) =>
    Boolean((json && json.pregunta) || (json && json.cierre));

  const pedirTurno = (partes, etiqueta) =>
    generarJson(
      res,
      {
        systemInstruction: { parts: [{ text: instrucciones }] },
        contents: partes,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: ESQUEMA,
          maxOutputTokens: MAXIMO_TOKENS_DE_SALIDA
        }
      },
      etiqueta,
      cuerpo.proveedor,
      tieneTexto
    );

  let respuesta = await pedirTurno(
    contents,
    debeCerrar ? "Cierre de consulta" : "Turno de consulta"
  );

  // generarJson ya ha respondido si algo falló.
  if (!respuesta) return;

  // Si la IA manda cierre y pregunta a la vez, manda el cierre.
  //
  // Ya no hay reintento del "campo que falta" (lo hubo mientras el cierre eran
  // dos bloques, nutrición y rutina, y podía llegar solo uno): con un único
  // texto de salida no hay medias respuestas que rescatar, y reintentar un
  // texto que ha llegado vacío gasta otra llamada de cuota para lo mismo.
  // RESCATE (spec 071). El texto se coge de donde venga.
  //
  // El fallo que lo motivó: en una conversación, el prompt le pide poner la
  // respuesta en "pregunta" y dejar "cierre" vacío. Ante un mensaje emotivo
  // —"no sé si tirar la toalla"— el modelo escribe algo que suena a despedida y
  // lo mete en "cierre". La respuesta era buena y se tiraba entera, con un
  // "La IA no ha sabido responder" en pantalla.
  //
  // Se respeta el `tipo` que declara el modelo y solo se rellena el campo que
  // falta con el otro. Al revés —deducir el tipo del campo que traiga texto—
  // cerraría una entrevista antes de tiempo, que es peor que un error.
  const texto = respuesta.cierre || respuesta.pregunta || "";

  if (respuesta.tipo === "cierre" && texto) {
    respuesta = { ...respuesta, cierre: texto };
  } else if (respuesta.pregunta || respuesta.cierre) {
    respuesta = { ...respuesta, pregunta: respuesta.pregunta || respuesta.cierre };
  }

  // La conversación NO se cierra nunca (spec 023): si el modelo dice "cierre",
  // se le devuelve al navegador como lo que es, un mensaje más del hilo. Sin
  // esto, un cierre inventado en mitad de una charla la daría por terminada.
  if (conversacion && respuesta.tipo === "cierre" && respuesta.cierre) {
    return res.status(200).json({ tipo: "pregunta", pregunta: respuesta.cierre });
  }

  if (respuesta.tipo === "cierre" && respuesta.cierre) {
    return res.status(200).json({
      tipo: "cierre",
      cierre: respuesta.cierre,
      // Instrucciones para pedir una semana nueva, si la IA lo ha propuesto
      // (spec 046). Vacías = sin propuesta. Solo en la revisión: la entrevista
      // de bienvenida no propone nada, que para eso acaba de conocerte.
      nutricion: inicial ? "" : respuesta.nutricion || "",
      ejercicio: inicial ? "" : respuesta.ejercicio || "",
      // Solo la entrevista de bienvenida trae datos personales; en el resto
      // vienen vacíos y el navegador no guarda nada.
      nombre: inicial ? respuesta.nombre : "",
      alturaCm: inicial ? respuesta.alturaCm : "",
      pesoObjetivoKg: inicial ? respuesta.pesoObjetivoKg : "",
      fechaObjetivo: inicial ? respuesta.fechaObjetivo : "",
      perfil: inicial ? respuesta.perfil : ""
    });
  }

  if (respuesta.tipo === "pregunta" && respuesta.pregunta) {
    return res.status(200).json({ tipo: "pregunta", pregunta: respuesta.pregunta });
  }

  // Llegar aquí significa que el JSON era válido pero no encaja con ninguno de
  // los dos formatos esperados (p. ej. tipo "cierre" con el cierre vacío).
  console.error(`Respuesta con forma inesperada: ${JSON.stringify(respuesta).slice(0, 300)}`);
  return res.status(502).json({ error: "respuesta-ilegible" });
};
