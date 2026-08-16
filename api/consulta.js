// Proxy hacia Gemini para "Pasar consulta" (spec 004).
//
// Cada llamada manda el hilo completo de la entrevista: la IA responde con la
// siguiente pregunta, o con el plan cuando considera que ya tiene bastante.

const { peticionAutorizada, describirRegistros, generarJson } = require("./_ia");

const MAXIMO_PREGUNTAS = 25;

const INSTRUCCIONES = `Eres un nutricionista y entrenador personal haciendo la primera entrevista a una persona.

Hablas SIEMPRE en español, tuteando, en tono cercano y directo.

Cómo funciona la entrevista:
- Haces UNA sola pregunta por turno. Nunca varias juntas.
- Repreguntas según lo que te vaya contando: si dice que odia un alimento, no vuelvas a proponerlo.
- Te apoyas en sus registros de los últimos 14 días: no preguntes lo que ya se ve ahí (su peso, si entrena, qué come).
- Cubre a lo largo de la conversación: objetivo y plazo, medidas, gustos y aversiones, alergias e intolerancias, horarios y rutina de comidas, nivel de actividad, días y tiempo disponibles para entrenar, lesiones o limitaciones, y hábitos que quiera cambiar.
- No des diagnósticos médicos ni hables de enfermedades. Si algo te parece preocupante, recomienda consultar a un médico.

Cuando ya tengas información suficiente, en vez de otra pregunta devuelves el plan.

Formato de respuesta (JSON). Devuelve SIEMPRE los cuatro campos, sin excepción:
- Si sigues entrevistando: {"tipo": "pregunta", "pregunta": "tu pregunta", "nutricion": "", "ejercicio": ""}
- Si ya has terminado: {"tipo": "plan", "pregunta": "", "nutricion": "...", "ejercicio": "..."}

Sobre el plan:
- "nutricion": pautas generales adaptadas a lo que te ha contado (qué priorizar, qué reducir, cómo repartir las comidas). NO hagas un menú cerrado comida a comida. Máximo 150 palabras.
- "ejercicio": una línea por cada día de la semana, de lunes a domingo, respetando los días que haya dicho que puede entrenar. Marca los días de descanso como descanso. Máximo 150 palabras.
- No inventes datos que no te haya dado. Si algo no lo sabes, da la pauta de forma general.
- IMPORTANTÍSIMO: cuando devuelvas el plan, rellena SIEMPRE los dos campos, "nutricion" y "ejercicio". Un plan sin rutina de ejercicio no sirve. Si te quedas sin espacio, acorta la parte de nutrición, nunca omitas el ejercicio.`;

// La entrevista de bienvenida (spec 016): además del plan, saca los datos que
// van a Ajustes y un retrato de la persona que la IA reutilizará después.
const INSTRUCCIONES_INICIAL = `${INSTRUCCIONES}

ESTA ES LA ENTREVISTA DE BIENVENIDA. Además de lo anterior:
- Tu PRIMERA pregunta es cómo quiere que le llames. Nada más.
- A lo largo de la conversación tienes que averiguar sí o sí: altura en centímetros, peso actual, peso objetivo, para cuándo, qué comidas le gustan y cuáles no soporta, alergias e intolerancias, qué ejercicio disfruta, con qué material cuenta (gimnasio, pesas en casa, nada) y si tiene lesiones o limitaciones.
- Sigue siendo UNA pregunta por turno.

Cuando devuelvas el plan, rellena también estos campos:
- "nombre": cómo quiere que le llamen.
- "alturaCm": solo el número en centímetros, por ejemplo "176". Vacío si no lo ha dicho.
- "pesoObjetivoKg": solo el número en kilos, por ejemplo "78.5". Vacío si no lo ha dicho.
- "fechaObjetivo": en formato AAAA-MM-DD. Vacío si no ha dado plazo.
- "perfil": un retrato en prosa de esta persona para que otro nutricionista pueda aconsejarla sin volver a entrevistarla: gustos, aversiones, alergias, ejercicio que disfruta, material, limitaciones y horarios. Máximo 200 palabras.`;

// A partir de la segunda operación (spec 018) la IA ya conoce a la persona:
// no hace falta volver a preguntárselo todo, solo lo que cambia de un ciclo al
// siguiente.
const INSTRUCCIONES_REINICIO = `${INSTRUCCIONES}

ESTA PERSONA YA HIZO LA ENTREVISTA ANTES Y EMPIEZA UNA ETAPA NUEVA. Además de lo anterior:
- NO vuelvas a preguntarle lo que ya sabes de ella (gustos, aversiones, alergias, material, limitaciones): lo tienes en el contexto.
- Pregunta solo lo que cambia entre una etapa y otra: peso actual, nuevo objetivo, para cuándo, y qué ha cambiado desde la última vez (horarios, lesiones, material, motivación).
- Sé breve: con cuatro o cinco preguntas deberías tener bastante.
- Sigue siendo UNA pregunta por turno.

Cuando devuelvas el plan, rellena también estos campos:
- "nombre": cómo quiere que le llamen (el que ya usabas, salvo que pida otro).
- "alturaCm": solo el número en centímetros. Vacío si no lo sabes.
- "pesoObjetivoKg": el NUEVO objetivo, solo el número.
- "fechaObjetivo": en formato AAAA-MM-DD. Vacío si no ha dado plazo.
- "perfil": el retrato de siempre, actualizado con lo que te acabe de contar. No pierdas lo que ya sabías.`;

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
{"tipo": "pregunta", "pregunta": "lo que le dices", "nutricion": "", "ejercicio": "", "nombre": "", "alturaCm": "", "pesoObjetivoKg": "", "fechaObjetivo": "", "perfil": ""}

En "pregunta" va tu respuesta entera. Los demás campos, vacíos.`;

// Todos los campos son obligatorios a propósito: con "ejercicio" opcional,
// Gemini se lo saltaba y llegaban planes sin rutina. Los que no aplican en
// cada turno vienen como cadena vacía.
const ESQUEMA = {
  type: "OBJECT",
  properties: {
    tipo: { type: "STRING", enum: ["pregunta", "plan"] },
    pregunta: { type: "STRING" },
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
    "nutricion",
    "ejercicio",
    "nombre",
    "alturaCm",
    "pesoObjetivoKg",
    "fechaObjetivo",
    "perfil"
  ]
};

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

  const instrucciones = conversacion
    ? INSTRUCCIONES_CONVERSACION
    : reinicio
      ? INSTRUCCIONES_REINICIO
      : inicial
        ? INSTRUCCIONES_INICIAL
        : INSTRUCCIONES;

  const preguntasHechas = mensajes.filter((mensaje) => mensaje.de === "ia").length;
  // La conversación no se cierra nunca: lo de cortar por número de preguntas
  // es cosa de la entrevista, que sí tiene que acabar en un plan.
  const debeCerrar = !conversacion && preguntasHechas >= MAXIMO_PREGUNTAS;

  // El hilo se manda como conversación real para que la IA tenga memoria.
  const contents = [
    {
      role: "user",
      parts: [
        {
          text:
            "Estos son mis registros de los últimos 14 días:\n\n" +
            describirRegistros(registros) +
            contexto(cuerpo.nombre, cuerpo.perfil) +
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
            "Ya hemos hablado bastante. No hagas más preguntas: devuelve el plan " +
            "con lo que sepas hasta ahora."
        }
      ]
    });
  }

  const respuesta = await generarJson(
    res,
    {
      systemInstruction: { parts: [{ text: instrucciones }] },
      contents,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: ESQUEMA
      }
    },
    debeCerrar ? "Plan" : "Turno de consulta"
  );

  // generarJson ya ha respondido si algo falló.
  if (!respuesta) return;

  // Si la IA manda plan y pregunta a la vez, manda el plan.
  if (respuesta.tipo === "plan" && respuesta.nutricion) {
    let ejercicio = respuesta.ejercicio;

    // A veces se queda sin espacio y manda la nutrición sin la rutina. Antes
    // de tirar toda la entrevista a la basura, se pide solo el bloque que
    // falta, con la conversación como contexto.
    if (!ejercicio) {
      console.error("Plan sin rutina de ejercicio: se pide el bloque que falta.");

      const soloEjercicio = await generarJson(
        res,
        {
          systemInstruction: { parts: [{ text: instrucciones }] },
          contents: [
            ...contents,
            {
              role: "user",
              parts: [
                {
                  text:
                    "Falta la rutina de ejercicio. Devuélvela ahora, con una línea " +
                    "por cada día de la semana, de lunes a domingo. Repite la parte " +
                    "de nutrición tal cual te la he pedido antes."
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: ESQUEMA
          }
        },
        "Rutina de ejercicio"
      );

      if (!soloEjercicio) return;
      ejercicio = soloEjercicio.ejercicio;
    }

    if (!ejercicio) {
      console.error("La IA sigue sin devolver la rutina de ejercicio.");
      return res.status(502).json({ error: "respuesta-ilegible" });
    }

    return res.status(200).json({
      tipo: "plan",
      nutricion: respuesta.nutricion,
      ejercicio,
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
  // los dos formatos esperados (p. ej. tipo "plan" sin plan dentro).
  console.error(`Respuesta con forma inesperada: ${JSON.stringify(respuesta).slice(0, 300)}`);
  return res.status(502).json({ error: "respuesta-ilegible" });
};
