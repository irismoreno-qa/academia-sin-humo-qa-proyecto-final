---
description: Inicia o continúa un proyecto API Playwright con plan previo, evidencia real, máximo 3 intentos y gate humano.
---

Cuando el usuario ejecute `/api-project-agent`, actúa como `@api-project-agent` y
respeta `.agents/agents.md`.

## Entradas obligatorias
- `PROYECTO`
- `OBJETIVO`
- `FUENTE`
- `ALCANCE`
- `ARCHIVO_OBJETIVO`
- `COMANDO_OBJETIVO`

Si falta una entrada y no puedes encontrarla de forma inequívoca, presenta
`ESCALADO`. No inventes rutas, contratos ni comandos.

## Fase 1 — Inventario y plan, sin modificar
1. Lee proyecto, fuente, archivo objetivo y reporte anterior.
2. Propón `INICIAR` si no existe base utilizable o `CONTINUAR` si debe conservarse.
3. Presenta `PLAN_PENDIENTE` con:
   - modo y evidencia del inventario;
   - archivos que propone crear o modificar;
   - decisiones respaldadas por la fuente;
   - comando objetivo;
   - riesgos, secretos y límites.
4. Detente. Solo continúa después de recibir `PLAN APROBADO`.

## Fase 2 — Ciclo aprobado, máximo 3 intentos
Para cada intento:

1. **CONSTRUIR**
   - Usa `construir-proyecto-api`.
   - Modifica únicamente el alcance aprobado.

2. **VERIFICAR COMO RESPONSABILIDAD SEPARADA**
   - Usa `verificar-proyecto-api` sin editar archivos.
   - Calcula la rúbrica y ejecuta exactamente `COMANDO_OBJETIVO`.
   - Actualiza `reports/api-project-agent-report.md`.

3. **OBSERVAR Y DECIDIR**
   - Rúbrica 12/12 + exit code 0: detente con `CANDIDATO` y decisión humana pendiente.
   - Si falla por un defecto demostrado del test y queda un intento, aplica la corrección mínima.
   - Si existe posible defecto de producto, contradicción de fuente, secreto, entrada faltante
     o bloqueo de entorno, no adaptes el test: presenta `ESCALADO`.

4. **LÍMITE**
   - Después del intento 3 sin ambas condiciones, presenta `ESCALADO`.

## Respuesta final obligatoria
- Estado `CANDIDATO` o `ESCALADO`.
- Modo y cantidad de intentos.
- Archivos creados o modificados.
- Puntaje final de rúbrica.
- Comando, exit code y tests pasados/fallidos.
- Evidencia y alcance.
- Decisión humana pendiente. Solo QA puede registrar `ACEPTADO` o `RECHAZADO`.
