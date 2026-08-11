# Arquitectura: OperaciónBikini

## Stack

- Lenguaje / framework: HTML/JS/CSS puro (sin framework), desplegado como sitio estático en **Vercel** (`operacion-bikini.vercel.app`), junto a la función serverless de IA.
- Base de datos / almacenamiento: Firestore (Firebase) para datos de peso, comidas, ejercicio, consultas y planes. **Cloudinary** (plan gratuito, sin tarjeta) para las fotos de progreso — Firebase Storage quedó descartado porque desde 2026 exige el plan de pago Blaze (tarjeta vinculada) incluso para uso gratuito.
- Autenticación: Firebase Auth con dos métodos habilitados (email/contraseña y Google Sign-In), sin límite técnico fijo de usuarios pero pensado para un grupo pequeño y cerrado (acceso concedido manualmente, no registro público abierto). Datos separados por `uid` en Firestore/Storage (reglas de seguridad restringen cada usuario a sus propios documentos/archivos), lo cual escala igual de bien a 2 que a 4+ usuarios sin cambios de diseño.
- IA: API gratuita de Google Gemini (modelo **Flash**, capa gratuita sin tarjeta), llamada desde una función serverless (proxy) en **Vercel** — nunca directamente desde el navegador, para no exponer la clave de API ni dejar que cualquiera consuma la cuota gratuita. La clave es única y la usan ambos usuarios de la app a través de ese proxy.
- Despliegue: **todo en Vercel** (capa gratuita Hobby) — web estática y función de proxy IA en el mismo dominio, desplegadas juntas en cada push a `main`. Firebase en su capa gratuita (Spark). GitHub sigue siendo el repositorio; GitHub Pages quedó descartado (ver decisiones).

## Decisiones técnicas y por qué

- **Todo en Vercel, GitHub Pages descartado** (decidido en la spec 003): la app necesitaba igualmente una función serverless para la IA, y Vercel sirve estáticos gratis. Teniéndolo todo en un dominio desaparece el CORS entre web y función, hay un solo despliegue por cambio y un solo dominio que autorizar en Firebase. GitHub Pages funcionó bien para las specs 001 y 002, pero mantener dos despliegues del mismo repo no aportaba nada.
- **Firebase en vez de backend propio**: cubre Auth + BBDD + Storage de fotos con capa gratuita suficiente para 2 usuarios, sin mantener servidor.
- **Proxy serverless para la IA (Vercel/Netlify) en vez de Firebase Cloud Functions**: Cloud Functions exige activar el plan de pago de Firebase (Blaze) aunque el uso quede dentro de lo gratuito; Vercel/Netlify permiten una función serverless gratis sin tarjeta, evitando ese paso.
- **Google Gemini en vez de la API de Claude**: requisito explícito de coste cero. La API de Claude no tiene capa gratuita permanente (es de pago por token siempre, independiente de la suscripción Pro de claude.ai). Gemini sí ofrece una capa gratuita real y sin tarjeta en sus modelos Flash, con cuota diaria de sobra para 2 personas.
- **Vercel en vez de Netlify para el proxy** (decidido en la spec 003): la capa gratuita de Netlify corta las funciones a 10 segundos sin posibilidad de ampliarlo; Vercel permite declarar hasta 60 segundos en `vercel.json`. Una respuesta de Gemini tarda unos segundos, pero el margen evita fallos en días lentos.
- **El proxy valida el ID token de Firebase antes de llamar a Gemini** (spec 003): el repositorio es público, así que la URL del proxy es conocida. Sin validación, cualquiera podría agotar la cuota gratuita. La validación se hace contra el endpoint público de Google Identity Toolkit, sin SDK de Firebase Admin ni cuenta de servicio, así que el único secreto guardado en Vercel es `GEMINI_API_KEY`.
- **Las subidas a Cloudinary van firmadas desde Vercel** (decidido en la spec 005): la alternativa (subida sin firmar) obliga a dejar un permiso de subida en el código del navegador, y el repositorio es público — cualquiera podría llenar la cuenta gratuita de 25 GB. La función `api/cloudinary.js` valida la sesión igual que las de IA y firma cada subida y cada borrado por separado. Variables de entorno necesarias en Vercel: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`. El archivo va del navegador a Cloudinary directamente: por Vercel solo pasa la firma.
- **Las fotos se guardan en `usuarios/{uid}/fotos/` dentro de Cloudinary**: permite comprobar, antes de firmar un borrado, que la foto es de quien la pide.
- **Lista blanca de emails en tres capas**: cliente (mensaje claro), reglas de Firestore (barrera de datos) y proxy de IA (barrera de cuota). Duplicada a propósito; al añadir a alguien hay que tocar y desplegar las tres.
- **Cloudinary en vez de Firebase Storage**: Firebase cambió su política en 2026 y exige el plan de pago Blaze (con tarjeta vinculada) para usar Storage, incluso dentro de la cuota gratuita — incompatible con el requisito de coste y tarjeta cero. Cloudinary ofrece un plan gratuito real (25 créditos/mes ≈ 25 GB) sin pedir tarjeta, suficiente para fotos diarias de pocos usuarios.

## Restricciones conocidas

- Capa gratuita de Firebase (Spark, solo Auth + Firestore): límites de lecturas/escrituras diarias — de sobra para 2-4 usuarios con este uso.
- Capa gratuita de Cloudinary: 25 créditos/mes (~25 GB entre almacenamiento y transferencia), sin tarjeta. Con fotos comprimidas y pocos usuarios no debería agotarse, pero conviene comprimir/redimensionar antes de subir para no gastar cuota de más.
- Capa gratuita de Gemini: cuota diaria y por minuto limitada (varía por modelo dentro de la familia Flash); si algún día se supera, la opción es esperar al reinicio diario de cuota o, si se decide gastar, activar facturación — decisión del usuario, no automática.
- Los límites y condiciones exactas de la capa gratuita de Gemini los fija Google y pueden cambiar sin aviso; conviene revisarlos en la documentación oficial al implementar el proxy.
- Plazo ajustado: v1 debe estar lista el 31 de agosto (aprox. 20 días desde el inicio del proyecto).

## Backlog técnico (deuda conocida, no de producto)

- (vacío por ahora)
