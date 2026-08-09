# Reglas del proyecto

## Metodología (innegociable)

1. **Documentos antes que código.** Ningún cambio de producto/funcionalidad se implementa si no está reflejado primero en `docs/PRODUCTO.md`. Ningún cambio de arquitectura se implementa si no está en `docs/ARQUITECTURA.md`. Si el usuario pide algo que contradice `docs/PRODUCTO.md`, PARAR y preguntar si quiere actualizarlo primero.

2. **Una spec por feature.** Toda implementación parte de una spec en `docs/specs/`. Si no existe spec para lo que se pide, proponer crearla primero (usar `/nueva-spec`). No implementar "de palabra" nada que toque más de un archivo.

3. **Build verde ≠ funciona probado.** Que compile y pasen los tests NO significa que la feature esté terminada. Al acabar cualquier implementación, SIEMPRE terminar el mensaje con la sección "✅ Para probar a mano:" listando los pasos concretos que el usuario debe seguir para verificarlo usando la app de verdad. Una spec solo se marca como completada cuando el usuario confirma que la ha probado.

4. **Rebanadas verticales pequeñas.** Cada sesión de implementación aborda UNA spec. Si una spec parece requerir más de ~300 líneas de cambios, avisar y proponer dividirla antes de empezar.

5. **Las decisiones son del usuario.** Los agentes y Claude no deciden producto ni stack tecnológico. Si durante la implementación surge una decisión no cubierta por `docs/PRODUCTO.md`/`docs/ARQUITECTURA.md`/la spec, PARAR y preguntar. No rellenar huecos de diseño con suposiciones.

## Stack

- Frontend: HTML/JS/CSS puro (sin framework), desplegado en GitHub Pages.
- BBDD/Storage/Auth: Firebase (Firestore + Storage + Auth), capa gratuita (Spark), 2 usuarios con datos separados por `uid`.
- IA: API gratuita de Google Gemini (familia Flash), llamada solo desde una función serverless en Vercel (proxy), nunca desde el navegador.
- Despliegue: GitHub Pages (frontend) + Vercel (función proxy IA) + Firebase (backend de datos), todo en capas gratuitas.

## Anti scope-creep

Las ideas nuevas que surjan durante la implementación NO se implementan sobre la marcha: se anotan en `docs/BACKLOG.md` con una línea y se sigue con la spec actual. Recordárselo al usuario si él mismo propone desviarse a mitad de spec.

## Flujo de trabajo estándar

1. `/nueva-spec` → crear la spec de la feature
2. Agente `revisor-specs` → validar la spec antes de tocar código
3. Implementar la spec (sesión principal)
4. Agente `revisor-codigo` → verificar que el código cumple la spec
5. Agente `guardian-vision` → verificar que no hay scope creep ni contradicciones con `docs/PRODUCTO.md`
6. El usuario prueba la build de verdad → solo entonces la spec pasa a "completada"
