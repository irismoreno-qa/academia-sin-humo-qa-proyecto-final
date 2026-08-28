---
description: Construye y verifica un Page Object con evidencia real, máximo 3 intentos.
---

Cuando el usuario ejecute `/pom-agent`, actúa como `@pom-agent` y respeta
`.agents/agents.md`.

## Entradas obligatorias
- OBJETIVO
- POM
- TEST
- EVIDENCIA_HTML
- URL

Si falta una entrada y no puedes encontrarla de forma inequívoca, detente y pídela.
No inventes rutas.

## Ciclo de trabajo — máximo 3 intentos

Para cada intento:

1. PREPARAR
   - Lee el objetivo, la URL, el test, la evidencia HTML, el POM actual y el reporte anterior.

2. GENERAR
   - Usa la skill `generar-pom`.
   - Guarda o corrige únicamente el POM solicitado.

3. VERIFICAR COMO RESPONSABILIDAD SEPARADA
   - Usa la skill `verificar-pom`.
   - Revisa la rúbrica y ejecuta `npx playwright test <TEST>`.
   - Guarda o actualiza `reports/pom-agent-report.md`.

4. OBSERVAR Y DECIDIR
   - Si la rúbrica es 12/12 y el exit code es 0, no hagas otro intento.
     Registra `VERIFICACIÓN SUPERADA`, presenta estado `CANDIDATO`, las evidencias
     y espera el gate humano. No uses todavía `ACEPTADO`.
   - Antes de responder, actualiza `reports/pom-agent-report.md`. En la sección
     `## Estado del workflow` registra:
     - `Estado automático: CANDIDATO` y `Decisión humana: PENDIENTE`, si ambas
       verificaciones cumplieron; o
     - el estado del intento actual y la corrección pendiente, si todavía reintentarás.
   - Si una condición falla, identifica la causa usando el reporte.
     Decide la corrección mínima respaldada por evidencia y comienza el intento siguiente.
   - Nunca modifiques el test ni la aplicación para fabricar un verde.

5. LÍMITE
   - Si termina el intento 3 sin ambas condiciones, detente.
   - Presenta estado `ESCALADO`, los tres resultados, la causa pendiente y la decisión
     que necesita del QA humano.
   - Actualiza `## Estado del workflow` del reporte con `Estado automático: ESCALADO`,
     la causa pendiente y la ayuda o decisión humana necesaria.

## Respuesta final obligatoria
- Estado: CANDIDATO o ESCALADO.
- Intentos usados.
- Archivo POM modificado.
- Puntaje final de rúbrica.
- Comando ejecutado y exit code.
- Tests pasados/fallidos.
- Cambios realizados en cada intento.
- Decisión humana pendiente: registrar `ACEPTADO` o `RECHAZADO` con motivo, o
  resolver el escalamiento.