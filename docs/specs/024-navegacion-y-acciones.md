# 024 — Consulta en la barra, Ajustes en el avatar, y cada cosa en su sección

- **Estado:** completada (validada por el usuario el 2026-08-17)
- **Fecha:** 2026-08-16
- **Referencia en PRODUCTO.md:** apartado "Qué hará (v3)", puntos "Cada cosa en su sitio" y «"Hoy" con cuatro acciones».

## 1. Objetivo

Que Consulta sea una sección de pleno derecho en la barra, que Ajustes se alcance desde tu foto, y que pedir una dieta o una tabla de ejercicio deje de vivir dentro de "Consulta" para estar donde corresponde.

## 2. Criterio de "esto funciona"

1. La barra tiene cinco botones: **Hoy · Peso · Comidas · Ejercicio · Consulta**.
2. Tocar tu **foto de perfil** abre Ajustes. El botón "Ajustes" ya no está en la barra.
3. La foto de perfil se cambia desde **Ajustes**, con un botón propio.
4. En **Comidas**, debajo del formulario, hay un botón **"Pedir dieta detallada"** con sus opciones (3 o 7 días).
5. En **Ejercicio**, igual con **"Pedir tabla de ejercicio"** (hoy o semana).
6. En **Consulta** ya no está el bloque "O pide algo concreto": solo la conversación y los planes.
7. En **"Hoy"**, cuatro acciones: **Pasar consulta · Hacer dieta · Tabla de ejercicios · Foto del día**. Cada una lleva a su sección.
8. Lo pedido sigue apareciendo en **Mis planes**, dentro de Consulta, como hasta ahora.
9. Los cupos no cambian: las especializadas siguen gastando una de las dos consultas del día.

## 3. Alcance

### Entra

- Barra de cinco botones, con Consulta dentro y Ajustes fuera.
- Avatar como puerta a Ajustes, y la subida de foto movida allí.
- Los dos botones de pedir plan, cada uno en su sección.
- Las cuatro acciones de "Hoy".

### NO entra (explícitamente fuera)

- **Guardar dietas ni tablas**: siguen apareciendo como planes de texto. Guardarlas de verdad es la spec 027 y siguientes.
- Cambiar los prompts ni el endpoint de planes.
- Tocar el calendario de constancia: es la spec 025.

## 4. Comportamiento detallado

- **Avatar**: pasa de abrir el selector de archivos a abrir Ajustes. En Ajustes aparece un bloque "Foto de perfil" con la foto y un botón **Cambiar foto**, que es el que abre el selector.
- **Especializadas**: el bloque desaparece de Consulta y se parte en dos. Cada sección enseña solo lo suyo: Comidas la dieta, Ejercicio la tabla. El comportamiento (elegir alcance, "Pensando…", errores, cupo) no cambia.
- **Acciones de "Hoy"**: cuatro botones a ancho repartido, debajo del resumen. "Foto del día" se mantiene aunque el usuario dijo que el atajo de Fotos le sobraba: sin él, y con Consulta ya en la barra, la sección de fotos se quedaría sin ninguna puerta.

## 5. Modelo de datos

**Ninguno.**

## 6. Casos límite

- **Sin operación activa**: las secciones bloqueadas siguen avisando; las acciones de "Hoy" no se ven, porque "Hoy" enseña el botón de iniciar.
- **Pantalla de 320 px**: cinco botones caben mejor que seis; la letra sigue encogiéndose sola.
- **Sin foto de perfil**: el avatar enseña la inicial y sigue llevando a Ajustes.

## 7. Archivos afectados

| Archivo | Cambio |
|---|---|
| `index.html` | barra de cinco, bloque de foto en Ajustes, acciones de "Hoy", los dos bloques de pedir plan |
| `js/app.js` | avatar a Ajustes, subida desde Ajustes, un bloque de pedir plan por sección |
| `styles.css` | retoques de las acciones |

**Estimación: ~180 líneas.**

## 8. Decisiones tomadas

- **Ajustes al avatar** → decisión del usuario, para que Consulta entre en la barra sin llegar a seis botones.
- **"Foto del día" se queda en "Hoy"** → el usuario dijo que el atajo de Fotos le sobraba, pero al mover Consulta a la barra esa sección se quedaba sin puerta. Se avisa por si prefiere otra cosa.
- **Cada plan en su sección** → decisión del usuario: pedir una dieta no es "pasar consulta".

## 9. Fuera de spec: ideas apuntadas

Ninguna.

## ✅ Para probar a mano

Se prueba junto con el resto de specs de la v3.
