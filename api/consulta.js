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

// Los cuatro campos son obligatorios a propósito: con "ejercicio" opcional,
// Gemini se lo saltaba y llegaban planes sin rutina. Los que no aplican en
// cada turno vienen como cadena vacía.
const ESQUEMA = {
  type: "OBJECT",
  properties: {
    tipo: { type: "STRING", enum: ["pregunta", "plan"] },
    pregunta: { type: "STRING" },
    nutricion: { type: "STRING" },
    ejercicio: { type: "STRING" }
  },
  required: ["tipo", "pregunta", "nutricion", "ejercicio"]
};

module.exports = async (req, res) => {
  if (!(await peticionAutorizada(req, res))) return;

  const cuerpo = req.body || {};
  const mensajes = Array.isArray(cuerpo.mensajes) ? cuerpo.mensajes : [];
  const registros = cuerpo.registros || {};

  const preguntasHechas = mensajes.filter((mensaje) => mensaje.de === "ia").length;
  const debeCerrar = preguntasHechas >= MAXIMO_PREGUNTAS;

  // El hilo se manda como conversación real para que la IA tenga memoria.
  const contents = [
    {
      role: "user",
      parts: [
        {
          text:
            "Estos son mis registros de los últimos 14 días:\n\n" +
            describirRegistros(registros) +
            (mensajes.length
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
      systemInstruction: { parts: [{ text: INSTRUCCIONES }] },
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
          systemInstruction: { parts: [{ text: INSTRUCCIONES }] },
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
      ejercicio
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
