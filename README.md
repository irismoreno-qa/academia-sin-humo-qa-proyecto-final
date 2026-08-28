# Demo S11 — Playwright para QA

Proyecto educativo utilizado en la Ruta de Transformación de TesteandoYa para practicar automatización con Playwright.

## Contenido

- pruebas UI con Page Object Model;
- fixtures y hooks;
- pruebas de API;
- agentes especializados para POM, API e integración;
- smoke test local que se utilizará como base para aprender CI con GitHub Actions.

## Requisitos

- Node.js 24
- npm

## Instalación

```bash
npm ci
npx playwright install chromium
```

## Ejecutar el smoke de CI

```bash
npx playwright test tests/ci/ci-smoke.spec.ts --project=chromium
```

Este smoke solo comprueba que Playwright puede arrancar, abrir Chromium y ejecutar una expectativa. No valida el producto completo.

## Otros comandos

```bash
npm test
npm run test:login
npm run test:api
npm run test:list
```

## Skill reutilizable para CI

El proyecto incluye `.agents/skills/generar-workflow-ci/SKILL.md`. La skill inspecciona un proyecto Playwright, propone un workflow con estado `PLAN_PENDIENTE` y solo crea o actualiza `.github/workflows/playwright.yml` después de recibir `PLAN APROBADO`.

Invocación sugerida:

```text
Usa $generar-workflow-ci en este proyecto.
Objetivo: crear el primer workflow de CI para el smoke estable.
Alcance: solo .github/workflows/playwright.yml.
No modifiques archivos hasta que yo responda PLAN APROBADO.
```
