# Reporte de CI — Fase 5

## Run de referencia

| Campo | Valor |
|---|---|
| **Enlace** | https://github.com/irismoreno-qa/academia-sin-humo-qa-proyecto-final/actions/runs/33538784699 |
| **Run ID** | `33538784699` |
| **Commit** | `f0e96e4` — *ci: ampliar el workflow para correr la suite del proyecto — Fase 5* |
| **Disparado por** | `push` a `main` |
| **Resultado** | ✅ `success` |
| **Duración** | 2 m 03 s |
| **Fecha** | 2026-09-01 |

## Job y steps

**Job:** `Suite del proyecto` — ID `99959564598`, 1 m 59 s

```
✓ Set up job
✓ Descargar el repositorio
✓ Preparar Node.js
✓ Instalar dependencias
✓ Instalar Chromium
✓ Verificar que no hay tests silenciados
✓ Comprobar el entorno
✓ Ejecutar la suite del proyecto
✓ Guardar el reporte de Playwright
✓ Post Preparar Node.js
✓ Post Descargar el repositorio
✓ Complete job
```

### Salida de los tres pasos que importan

```
Verificar que no hay tests silenciados  →  Sin skip, sin only, sin waitForTimeout.
Comprobar el entorno                    →  1 passed (1.0s)
Ejecutar la suite del proyecto          →  43 passed (53.3s)
```

## Artifact `playwright-report` — descargado y revisado

Descargado con `gh run download 33538784699 -n playwright-report`.

| Comprobación | Resultado |
|---|---|
| `index.html` | 570 KB, `<title>Playwright Test Report</title>`, con `playwrightReportBase64` embebido |
| `data/` | 8 archivos de contexto de error |
| **Correspondencia** | **8 archivos de contexto ↔ 8 tests con `test.fail()`** en el repositorio: 5 en `tests/e2e/`, 2 en `tests/api/`, 1 en `tests/integrado/` |

Esa correspondencia es la comprobación que vale: **prueba que los ocho tests anotados
se ejecutaron de verdad y fallaron de verdad.** Si estuvieran silenciados no habrían
generado contexto de error, y el artefacto lo delataría.

## Alcance del CI, declarado

Corre `tests/e2e`, `tests/api` y `tests/integrado` — 43 tests — más el smoke de
entorno. Quedan fuera dos archivos, con el motivo escrito también dentro del propio
workflow:

| Archivo | Motivo |
|---|---|
| `tests/login.spec.ts` | Falla: `POST /api/login` → `401` con credenciales demo obsoletas (hallazgo H-06). Problema de datos, no de producto, y el login está fuera del alcance declarado. Incluirlo dejaría el CI rojo por algo ajeno al proyecto; corregirlo sería ampliar el alcance sin decirlo |
| `tests/registro.spec.ts` | Smoke de visibilidad heredado del curso, redundante con los casos CP-01 a CP-06 |

## Dos decisiones de diseño del workflow

**El smoke corre antes que la suite.** Si falla, el problema es el entorno y no los
tests. Separa el diagnóstico del veredicto: un rojo en el paso 1 y un rojo en el paso
2 significan cosas distintas.

**La prohibición de silenciar tests la hace cumplir el CI.** La consigna prohíbe
`skip` y tests borrados para forzar verde. Un `grep` que falla si aparece
`test.skip`, `.only` o `waitForTimeout` convierte esa regla en algo verificable, en
lugar de dejarla como una buena intención escrita en un documento que nadie relee.

## Riesgos abiertos

1. **La suite golpea un servicio externo en vivo.** `playwright.config.ts` tiene
   `retries: 0`, así que si el playground está caído el CI se pone rojo por entorno y
   no por producto. Cambiarlo quedó fuera del alcance aprobado para esta fase.
2. **Cada corrida crea unas 25 cuentas reales** en el playground compartido. Los
   emails son únicos por corrida, así que no chocan entre sí, pero se acumulan.
3. **Sin secretos.** Permisos en `contents: read`. No hay tokens, `.env` ni
   credenciales versionadas.
