# Arquitectura: OperaciónBikini

## Stack

- Lenguaje / framework: HTML/JS/CSS puro (sin framework), desplegado como sitio estático.
- Base de datos / almacenamiento: Firebase (Firestore para datos, Firebase Storage para fotos).
- Autenticación: Firebase Auth, 2 cuentas de usuario (yo y mi mujer), datos separados por `uid` en Firestore/Storage (reglas de seguridad restringen cada usuario a sus propios documentos/archivos).
- IA: API gratuita de Google Gemini (modelo de la familia Flash, capa gratuita sin tarjeta), llamada desde una función serverless (proxy) en Vercel o Netlify — nunca directamente desde el navegador, para no exponer la clave de API ni dejar que cualquiera consuma la cuota gratuita. La clave es única y la usan ambos usuarios de la app a través de ese proxy.
- Despliegue: frontend en GitHub Pages; función serverless de proxy IA en Vercel/Netlify (capa gratuita); Firebase en su capa gratuita (Spark).

## Decisiones técnicas y por qué

- **GitHub Pages solo para frontend estático**: no puede ejecutar backend ni guardar datos por sí solo, de ahí la necesidad de Firebase + función serverless aparte.
- **Firebase en vez de backend propio**: cubre Auth + BBDD + Storage de fotos con capa gratuita suficiente para 2 usuarios, sin mantener servidor.
- **Proxy serverless para la IA (Vercel/Netlify) en vez de Firebase Cloud Functions**: Cloud Functions exige activar el plan de pago de Firebase (Blaze) aunque el uso quede dentro de lo gratuito; Vercel/Netlify permiten una función serverless gratis sin tarjeta, evitando ese paso.
- **Google Gemini en vez de la API de Claude**: requisito explícito de coste cero. La API de Claude no tiene capa gratuita permanente (es de pago por token siempre, independiente de la suscripción Pro de claude.ai). Gemini sí ofrece una capa gratuita real y sin tarjeta en sus modelos Flash, con cuota diaria de sobra para 2 personas.
- **Una sola clave de API de Gemini, gestionada en el backend**: nunca se expone al navegador; ambos usuarios comparten esa clave a través del proxy, ninguno la ve ni la necesita individualmente.

## Restricciones conocidas

- Capa gratuita de Firebase (Spark): límites de lecturas/escrituras y almacenamiento diarios — de sobra para 2 usuarios, pero a vigilar si se sube mucho volumen de fotos.
- Capa gratuita de Gemini: cuota diaria y por minuto limitada (varía por modelo dentro de la familia Flash); si algún día se supera, la opción es esperar al reinicio diario de cuota o, si se decide gastar, activar facturación — decisión del usuario, no automática.
- Los límites y condiciones exactas de la capa gratuita de Gemini los fija Google y pueden cambiar sin aviso; conviene revisarlos en la documentación oficial al implementar el proxy.
- Plazo ajustado: v1 debe estar lista el 31 de agosto (aprox. 20 días desde el inicio del proyecto).

## Backlog técnico (deuda conocida, no de producto)

- (vacío por ahora)
