# Arquitectura: OperaciónBikini

## Stack

- Lenguaje / framework: HTML/JS/CSS puro (sin framework), desplegado como sitio estático.
- Base de datos / almacenamiento: Firestore (Firebase) para datos de peso, comidas, ejercicio, consultas y planes. **Cloudinary** (plan gratuito, sin tarjeta) para las fotos de progreso — Firebase Storage quedó descartado porque desde 2026 exige el plan de pago Blaze (tarjeta vinculada) incluso para uso gratuito.
- Autenticación: Firebase Auth con dos métodos habilitados (email/contraseña y Google Sign-In), sin límite técnico fijo de usuarios pero pensado para un grupo pequeño y cerrado (acceso concedido manualmente, no registro público abierto). Datos separados por `uid` en Firestore/Storage (reglas de seguridad restringen cada usuario a sus propios documentos/archivos), lo cual escala igual de bien a 2 que a 4+ usuarios sin cambios de diseño.
- IA: API gratuita de Google Gemini (modelo de la familia Flash, capa gratuita sin tarjeta), llamada desde una función serverless (proxy) en Vercel o Netlify — nunca directamente desde el navegador, para no exponer la clave de API ni dejar que cualquiera consuma la cuota gratuita. La clave es única y la usan ambos usuarios de la app a través de ese proxy.
- Despliegue: frontend en GitHub Pages; función serverless de proxy IA en Vercel/Netlify (capa gratuita); Firebase en su capa gratuita (Spark).

## Decisiones técnicas y por qué

- **GitHub Pages solo para frontend estático**: no puede ejecutar backend ni guardar datos por sí solo, de ahí la necesidad de Firebase + función serverless aparte.
- **Firebase en vez de backend propio**: cubre Auth + BBDD + Storage de fotos con capa gratuita suficiente para 2 usuarios, sin mantener servidor.
- **Proxy serverless para la IA (Vercel/Netlify) en vez de Firebase Cloud Functions**: Cloud Functions exige activar el plan de pago de Firebase (Blaze) aunque el uso quede dentro de lo gratuito; Vercel/Netlify permiten una función serverless gratis sin tarjeta, evitando ese paso.
- **Google Gemini en vez de la API de Claude**: requisito explícito de coste cero. La API de Claude no tiene capa gratuita permanente (es de pago por token siempre, independiente de la suscripción Pro de claude.ai). Gemini sí ofrece una capa gratuita real y sin tarjeta en sus modelos Flash, con cuota diaria de sobra para 2 personas.
- **Cloudinary en vez de Firebase Storage**: Firebase cambió su política en 2026 y exige el plan de pago Blaze (con tarjeta vinculada) para usar Storage, incluso dentro de la cuota gratuita — incompatible con el requisito de coste y tarjeta cero. Cloudinary ofrece un plan gratuito real (25 créditos/mes ≈ 25 GB) sin pedir tarjeta, suficiente para fotos diarias de pocos usuarios.

## Restricciones conocidas

- Capa gratuita de Firebase (Spark, solo Auth + Firestore): límites de lecturas/escrituras diarias — de sobra para 2-4 usuarios con este uso.
- Capa gratuita de Cloudinary: 25 créditos/mes (~25 GB entre almacenamiento y transferencia), sin tarjeta. Con fotos comprimidas y pocos usuarios no debería agotarse, pero conviene comprimir/redimensionar antes de subir para no gastar cuota de más.
- Capa gratuita de Gemini: cuota diaria y por minuto limitada (varía por modelo dentro de la familia Flash); si algún día se supera, la opción es esperar al reinicio diario de cuota o, si se decide gastar, activar facturación — decisión del usuario, no automática.
- Los límites y condiciones exactas de la capa gratuita de Gemini los fija Google y pueden cambiar sin aviso; conviene revisarlos en la documentación oficial al implementar el proxy.
- Plazo ajustado: v1 debe estar lista el 31 de agosto (aprox. 20 días desde el inicio del proyecto).

## Backlog técnico (deuda conocida, no de producto)

- (vacío por ahora)
