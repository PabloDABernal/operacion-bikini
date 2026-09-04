# 097 — Marcar "me lo he comido" en cualquier día de la semana

- **Estado:** completada
- **Fecha:** 2026-09-04
- **Referencia en PRODUCTO.md:** sección "evolutivos de la fase productiva", entrada de la spec 097

## 1. Objetivo

En "Mi dieta", poder pulsar "Me lo he comido" en cualquier día de la semana, no
solo en el de hoy. La fecha y hora con la que se apunta la comida ya no es
siempre "ahora": se calcula según si ese momento es pasado, presente o futuro.

Esto revoca dos decisiones tomadas en la spec 094: "solo en el día de hoy" y
"sin hora" (tabla de decisiones de la spec 094, sección 8).

## 2. Criterio de "esto funciona"

1. Entro en Comidas → Mi dieta. En la tira de días toco un día **pasado** de
   esta semana (por ejemplo lunes, si hoy es jueves). Se despliegan sus
   comidas y cada una con texto tiene su botón "Me lo he comido".
2. Pulso "Me lo he comido" en la comida (por ejemplo Comida) del lunes. Se
   guarda sin avisos de futuro, y al abrir el diario de comidas aparece
   fechada el lunes a las 14:00 (franja fija de "Comida").
3. Toco el día de **hoy** y pulso "Me lo he comido" en una comida cuya franja
   ya pasó (por ejemplo Desayuno, siendo ya por la tarde). Se guarda sin
   aviso de futuro, fechada hoy a las 9:00 (franja fija de "Desayuno").
4. En el día de hoy, pulso "Me lo he comido" en una comida cuya franja **aún
   no ha llegado** (por ejemplo Cena, siendo aún por la mañana). La app avisa
   de que ese momento todavía no ha llegado y que se apunta ahora mismo; se
   guarda con la fecha y hora reales del instante en que pulso el botón.
5. Toco un día **futuro** de esta semana (por ejemplo viernes, si hoy es
   jueves) y pulso "Me lo he comido" en cualquiera de sus comidas. La app
   avisa igual que en el paso 4 y guarda con la fecha y hora reales de ahora
   mismo (hoy, no viernes).
6. En el diario de comidas (lista de registros), cada comida apuntada desde
   "Mi dieta" muestra su fecha y hora correctas según los pasos anteriores.
7. Vuelvo a pulsar "Me lo he comido" en una comida ya apuntada (de cualquier
   día): sigue preguntando "¿Lo apunto otra vez?" como hasta ahora (spec 094),
   sin cambios en ese aviso.

## 3. Alcance

### Entra
- El botón "Me lo he comido" pasa a mostrarse en las siete filas de la
  semana, no solo en el día de hoy.
- Cálculo de fecha/hora al apuntar desde "Mi dieta", con tres casos:
  - **Momento pasado** (el día es anterior a hoy, o es hoy y su franja ya
    pasó): se guarda con la fecha de ese día y la hora fija de su franja.
  - **Momento futuro** (el día es posterior a hoy, o es hoy y su franja aún
    no ha llegado): se avisa de que está en el futuro y se guarda con la
    fecha y hora reales del instante en que se pulsa.
  - Frontera exacta (se pulsa justo en el minuto de la franja, en el día de
    hoy): cuenta como pasado, no como futuro.
- Franjas fijas por tipo de comida: Desayuno 9:00, Comida 14:00, Merienda
  18:00, Cena 21:30.
- Mensaje de aviso cuando el momento es futuro (no bloqueante, no pide
  confirmación: informa y guarda).

### NO entra (explícitamente fuera)
- No cambia el aviso de "ya lo tienes apuntado hoy, ¿lo apunto otra vez?"
  (spec 094): sigue preguntando igual, ahora comparando contra la fecha del
  día que se está marcando en vez de siempre "hoy".
- No añade edición de la hora calculada desde este botón: si la hora no es
  la que quieres, se corrige después con "Editar", como cualquier registro
  (spec 007).
- No toca cómo se apuntan comidas escritas a mano (formulario de "Apuntar"):
  solo afecta al botón "Me lo he comido" de "Mi dieta".
- No cambia las franjas horarias en ningún otro sitio de la app (agua,
  bebidas, ejercicio siguen igual).

## 4. Comportamiento detallado

- La condición `esHoy` que hoy oculta el botón fuera del día actual
  (`js/app.js`, función `filaDeComida`) desaparece: el botón se muestra
  siempre que `comida.texto` exista, en cualquiera de los siete días.
- Al pulsar el botón, `apuntarDeLaDieta` (o su reemplazo) necesita saber de
  qué día de la semana es la fila (ya lo sabe indirectamente por el índice de
  día que hoy solo se usa para `esHoy`; pasa a usarse también para calcular
  la fecha).
- Cálculo:
  1. A partir del índice de día de la fila, obtener su fecha real dentro de
     la semana actual (la semana que ya pinta "Mi dieta").
  2. Construir el instante "franja fija" = esa fecha + la hora fija según el
     tipo de comida (Desayuno/Comida/Merienda/Cena).
  3. Comparar con el instante real "ahora" (`new Date()`).
  4. Si franja fija ≤ ahora → guardar con fecha del día y hora de la franja
     fija (sin aviso).
  5. Si franja fija > ahora → mostrar aviso, guardar con la fecha y hora de
     "ahora" (instante real de la pulsación).
- El aviso de futuro es un mensaje corto, no bloqueante (tipo el aviso de
  guardado ya existente, `avisarGuardado`, o un `alert`): "Ese momento
  todavía no ha llegado. Se apunta con la hora de ahora." Aparece a la vez
  que se guarda, no antes: no hace falta un segundo toque para confirmar.
- El aviso de repetido (`yaApuntada`) sigue funcionando: compara contra la
  **fecha con la que se va a guardar el registro**, no contra el día de la
  fila tocada. Es decir: la fecha del día (si es pasado, con la franja fija)
  o la fecha real de hoy (si es futuro) — la misma fecha calculada en el
  paso 4/5 de más arriba, nunca "el día que se está marcando" a secas. Si se
  comparase contra el día de la fila en el caso futuro, marcar dos veces la
  misma comida de un día futuro no se detectaría como repetido, porque
  ambas veces se guarda con la fecha de hoy, no la del día futuro — el mismo
  tipo de fallo silencioso que la spec 094 vino a arreglar.

## 5. Modelo de datos

No hay cambios de esquema. Los registros de comida ya tienen `fecha` y `hora`
(spec 014, campo opcional). Este cambio solo afecta a qué valores calcula el
código antes de llamar a `guardarComida` — antes siempre `hoyISO()` y hora
vacía; ahora la fecha del día marcado y la hora de la franja fija, o la fecha
y hora reales si el momento es futuro.

## 6. Casos límite

- **Semana con el día de hoy en un extremo** (lunes o domingo): sigue
  funcionando igual, la fecha de cada día de la tira ya se calcula hoy para
  pintar la semana.
- **Reloj del dispositivo desfasado**: no se contempla, como el resto de la
  app (usa `new Date()` tal cual, sin corrección de zona horaria especial).
- **Se pulsa un segundo después de que la franja "toque"**: pasa a tratarse
  como pasado, con la hora fija, no con la hora exacta de la pulsación —
  evita que dos personas pulsando el mismo botón en el mismo minuto acaben
  con horas ligeramente distintas por casualidad.
- **Comida sin texto** (`comida.texto` vacío): sigue sin mostrar el botón,
  como hasta ahora.

## 7. Archivos afectados

- `js/app.js`: `filaDeComida` (quitar la condición `esHoy` que oculta el
  botón), `apuntarDeLaDieta` (calcular fecha/hora según el día de la fila en
  vez de usar siempre `hoyISO()` y hora vacía), y la comparación de
  `yaApuntada`.
- Puede que haga falta una función nueva pequeña para las franjas fijas por
  tipo de comida (mapa momento → hora).

## 8. Decisiones tomadas

- **Día pasado (o de hoy tras su franja) → hora fija de la franja**, no la
  hora real de la pulsación. Decisión del usuario: evita que apuntar el
  lunes con retraso el jueves deje una hora falsa ("jueves a las 20:03" en
  vez de "lunes hacia el mediodía").
- **Hoy antes de su franja se trata igual que futuro**: avisa y guarda con
  la hora real de ahora. Decisión del usuario, para no fingir que ya
  desayunaste si aún es por la mañana.
- **Franjas fijas**: Desayuno 9:00, Comida 14:00, Merienda 18:00, Cena 21:30.
  Decisión del usuario.
- El texto exacto del aviso de futuro y si se muestra como `alert()` o como
  un aviso no bloqueante tipo `avisarGuardado` queda a criterio de
  implementación (no es una decisión de producto), pero debe informar
  claramente, no requerir un segundo toque para confirmar, y aparecer pegado
  a la fila/botón tocado, en línea con la spec 036 ("la confirmación aparece
  donde está el dedo").

## 9. Fuera de spec: ideas apuntadas

Ninguna surgida durante la escritura de esta spec.

## ✅ Para probar a mano

(la rellena/afina el agente `qa-manual` antes de la prueba)
