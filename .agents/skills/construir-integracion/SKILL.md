---
name: construir-integracion
description: Construye un escenario integrado UI + API reutilizando Page Objects y capa API existentes, con el dato dinámico compartido visible en el test.
---

# Skill: construir un escenario integrado UI + API

## Entradas
- Proyecto y plan aprobado.
- Objetivo del escenario.
- Fuente autorizada.
- Alcance aprobado.
- Dato dinámico compartido, ya nombrado en el plan.
- Reporte anterior, si existe.

## Reglas de inventario
1. Lee `package.json`, configuración Playwright, `pages/`, `tests/`, fixtures, scripts y convenciones.
2. Identifica qué Page Objects existen y cuáles se pueden reutilizar tal cual.
3. Identifica qué capa API existe y cómo se invoca.
4. No modifiques archivos durante el inventario ni antes de `PLAN APROBADO`.

## Reglas de construcción
1. El test debe tener las cuatro partes visibles y comentadas, en este orden:
   `1 · La API prepara` · `2 · El dato compartido` · `3 · La UI verifica` · `4 · Limpieza`.
2. **El dato compartido nace en la ejecución.** Nunca lo escribas literal en el archivo:
   ni IDs, ni cookies, ni tokens, ni fechas fijas.
3. Extrae de la fuente únicamente método, ruta, entrada, status, headers, schema y auth
   respaldados. Si falta una pieza necesaria o dos fuentes se contradicen, detente y escala.
4. Reutiliza los Page Objects existentes. No crees una capa de UI paralela ni dupliques locators.
5. Reutiliza la capa API existente y la `baseURL` del proyecto.
6. La verificación por UI usa locators semánticos (`getByRole`, `getByLabel`, `getByText`),
   coherentes con el estilo del proyecto.
7. La aserción de UI debe comprobar **el comportamiento visible**, no un detalle interno.
8. Si la fuente no documenta cómo deshacer el estado, no inventes un `DELETE`. Limpia solo lo
   que puedas justificar y deja el resto declarado como residuo conocido.
9. Usa datos de prueba controlados y desechables. Nunca escribas secretos reales ni los imprimas.
10. Corrige en un reintento únicamente defectos del test demostrados por el verificador.
11. Guarda solo los archivos incluidos en el alcance aprobado.

## Salida
- Archivos creados o modificados.
- El dato dinámico compartido y en qué línea nace.
- Page Objects y capa API reutilizados.
- Decisiones tomadas desde la fuente, con la cita.
- Residuo que el escenario deja en el servidor, si lo hay.
- Supuestos evitados o ambigüedades escaladas.
- Entrega al verificador; no declares éxito.
