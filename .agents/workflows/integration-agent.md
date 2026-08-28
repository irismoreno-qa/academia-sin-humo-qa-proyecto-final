---
description: Construye un escenario integrado UI + API con plan previo, dato compartido declarado, evidencia real, máximo 3 intentos y gate humano.
---

Cuando el usuario ejecute `/integration-agent`, actúa como `@integration-agent` y
respeta `.agents/agents.md`.

## Entradas obligatorias
- `PROYECTO`
- `OBJETIVO`
- `FUENTE`
- `ALCANCE`
- `COMANDO_OBJETIVO`

Si falta una entrada y no puedes encontrarla de forma inequívoca, presenta
`ESCALADO`. No inventes rutas, contratos, endpoints ni comandos.

## Fase 1 — Inventario y plan, sin modificar
1. Lee el proyecto: configuración Playwright, Page Objects existentes, capa API existente,
   fixtures, scripts y convenciones.
2. Lee la fuente y extrae únicamente lo respaldado: método, ruta, entrada, status, schema, auth,
   pantallas protegidas y requisitos aplicables.
3. Identifica las tres piezas del patrón:
   - **Preparación por API**: qué endpoint deja listo el estado.
   - **Verificación por UI**: qué pantalla y qué comportamiento visible se comprueba.
   - **Limpieza por API**: qué endpoint deshace el estado.
4. **Nombra el dato dinámico compartido**: qué valor nace en la preparación y consume la UI.
   Si no existe un dato que cruce las dos capas, no hay integración: presenta `ESCALADO`.
5. Presenta `PLAN_PENDIENTE` con:
   - evidencia del inventario (qué encontró y qué va a reutilizar);
   - el escenario propuesto, paso por paso;
   - el dato dinámico compartido, nombrado explícitamente;
   - archivos que propone crear o modificar;
   - decisiones respaldadas por la fuente, con la cita;
   - **qué NO va a demostrar el flujo**;
   - riesgos abiertos, secretos y límites.
6. Detente. Solo continúa después de recibir `PLAN APROBADO`.

## Regla del teardown
Si la fuente **no documenta** una forma de deshacer el estado preparado, no inventes un endpoint
de limpieza ni asumas que existe. Declara el riesgo en el plan, propone la alternativa más
conservadora disponible (por ejemplo, limpiar solo el estado local del navegador y usar datos
desechables) y deja la decisión al gate humano.

## Fase 2 — Ciclo aprobado, máximo 3 intentos
Para cada intento:

1. **CONSTRUIR**
   - Usa `construir-integracion`.
   - Modifica únicamente el alcance aprobado.
   - Reutiliza Page Objects y capa API existentes; no dupliques capas.

2. **VERIFICAR COMO RESPONSABILIDAD SEPARADA**
   - Usa `verificar-integracion` sin editar archivos.
   - Calcula la rúbrica y ejecuta exactamente `COMANDO_OBJETIVO`.
   - Actualiza `reports/integration-agent-report.md`.

3. **OBSERVAR Y DECIDIR**
   - Rúbrica 12/12 + exit code 0: detente con `CANDIDATO` y decisión humana pendiente.
   - Si falla por un defecto demostrado del test y queda un intento, aplica la corrección mínima.
   - Si existe posible defecto de producto, contradicción de fuente, secreto, entrada faltante
     o bloqueo de entorno, no adaptes el test: presenta `ESCALADO`.

4. **LÍMITE**
   - Después del intento 3 sin ambas condiciones, presenta `ESCALADO`.

## Respuesta final obligatoria
- Estado `PLAN_PENDIENTE`, `CANDIDATO` o `ESCALADO`.
- Dato dinámico compartido, nombrado.
- Cantidad de intentos.
- Archivos creados o modificados.
- Puntaje final de rúbrica.
- Comando, exit code y tests pasados/fallidos.
- Qué demuestra y qué NO demuestra el flujo.
- Decisión humana pendiente. Solo QA puede registrar `ACEPTADO` o `RECHAZADO`.
