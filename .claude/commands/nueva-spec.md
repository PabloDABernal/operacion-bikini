---
description: Crear una nueva spec de feature a partir de la plantilla, entrevistando al usuario
---

El usuario quiere crear una spec para: $ARGUMENTS

Proceso:

1. Lee `docs/PRODUCTO.md` y `docs/specs/PLANTILLA-SPEC.md`.
2. Lee los títulos de las specs existentes en `docs/specs/` para asignar el siguiente número.
3. Antes de escribir nada, haz al usuario las preguntas MÍNIMAS necesarias para cerrar la spec (máximo 5, en un solo mensaje). Prioriza: ¿cuál es el criterio de "esto funciona" usándolo de verdad? ¿qué queda explícitamente FUERA? ¿casos límite?
4. NO propongas producto nuevo por tu cuenta. Si detectas un hueco de decisión (de producto o técnica), pregúntalo — la decisión es del usuario.
5. Con las respuestas, crea `docs/specs/NNN-<nombre-corto>.md` siguiendo la plantilla.
6. Si la feature no está reflejada en `docs/PRODUCTO.md`, avisa: hay que actualizarlo ANTES de dar la spec por buena. Propón el texto exacto a añadir y espera confirmación.
7. Termina recomendando pasar el agente `revisor-specs` antes de implementar.
