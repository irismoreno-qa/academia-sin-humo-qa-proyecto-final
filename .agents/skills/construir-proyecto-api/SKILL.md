---
name: construir-proyecto-api
description: Inicia o continúa una base Playwright para API usando una fuente autorizada y modificando solo el alcance aprobado.
---

# Skill: construir o continuar un proyecto API

## Entradas
- Proyecto y modo aprobado: `INICIAR` o `CONTINUAR`.
- Objetivo y archivo objetivo.
- Fuente autorizada.
- Alcance aprobado.
- Reporte anterior, si existe.

## Reglas de inventario
1. Lee `package.json`, configuración Playwright, tests, fixtures, scripts y convenciones.
2. Propón `INICIAR` solo si no existe una base utilizable.
3. Propón `CONTINUAR` cuando ya existe automatización; conserva stack, scripts y estilo.
4. No modifiques archivos durante el inventario ni antes de `PLAN APROBADO`.

## Reglas de construcción
1. Extrae de la fuente únicamente método, ruta, entrada, status, headers, schema y auth respaldados.
2. Si falta una pieza necesaria o dos fuentes se contradicen, detente y escala.
3. En `INICIAR`, crea la estructura mínima compatible con el objetivo; no agregues capas futuras.
4. En `CONTINUAR`, realiza el cambio mínimo y no reestructures partes no solicitadas.
5. Usa `baseURL` y convenciones existentes cuando estén disponibles.
6. Mantén assertions en los tests y declara con precisión qué demuestran.
7. Usa datos de prueba controlados. Nunca escribas secretos reales ni los imprimas completos.
8. Corrige en un reintento únicamente defectos del test demostrados por el verificador.
9. Guarda solo los archivos incluidos en el alcance aprobado.

## Salida
- Modo aplicado.
- Archivos creados o modificados.
- Decisiones tomadas desde la fuente.
- Supuestos evitados o ambigüedades escaladas.
- Entrega al verificador; no declares éxito.
