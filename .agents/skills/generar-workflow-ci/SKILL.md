---
name: generar-workflow-ci
description: Revisa un proyecto Playwright con npm y propone, crea o actualiza `.github/workflows/playwright.yml` con GitHub Actions. Úsala cuando se solicite generar el primer CI, automatizar un smoke de Playwright o revisar un workflow existente, siempre con inventario, PLAN_PENDIENTE y aprobación humana antes de escribir.
---

# Generar un workflow CI para Playwright

## Objetivo
Crear un workflow pequeño, explicable y reproducible que ejecute el alcance real del proyecto. No asumir rama, lockfile, navegador, reporter ni comando.

## Entradas
Solicitar o descubrir:
- raíz del proyecto;
- rama principal;
- comando de test objetivo;
- navegador o proyecto Playwright;
- ruta del reporte;
- alcance permitido.

Si una entrada no puede verificarse, devolver `ESCALADO` y no escribir archivos.

## 1. Inventariar sin modificar
1. Confirmar que la raíz pertenece a un repositorio Git.
2. Leer `package.json`, `package-lock.json` y `playwright.config.*`.
3. Confirmar que el comando objetivo existe y ejecutarlo localmente.
4. Verificar la rama principal y si ya existe `.github/workflows/playwright.yml`.
5. Confirmar que el reporter crea `playwright-report/`.
6. Registrar archivos modificados: ninguno.

## 2. Proponer
Devolver `PLAN_PENDIENTE` con:
- hechos verificados;
- YAML completo propuesto;
- explicación línea por línea;
- supuestos y riesgos;
- archivo que se creará o actualizará;
- comando exacto que validará el resultado.

No escribir mientras el estado sea `PLAN_PENDIENTE`.

## 3. Reglas del YAML
Usar, cuando coincidan con el inventario:

```yaml
name: Playwright Tests

on:
  push:
    branches: [RAMA_VERIFICADA]
  pull_request:
    branches: [RAMA_VERIFICADA]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  test:
    name: Playwright smoke
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - name: Descargar el repositorio
        uses: actions/checkout@v6

      - name: Preparar Node.js
        uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: npm

      - name: Instalar dependencias
        run: npm ci

      - name: Instalar Chromium
        run: npx playwright install --with-deps chromium

      - name: Ejecutar el smoke
        run: COMANDO_VERIFICADO

      - name: Guardar el reporte de Playwright
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v7
        with:
          name: playwright-report
          path: playwright-report/
          if-no-files-found: error
          retention-days: 7
```

Adaptar solo datos demostrados por el repositorio. Si no existe lockfile, no cambiar silenciosamente `npm ci` por `npm install`: escalar la decisión.

## 4. Límites
- No inventar rama, scripts, navegador, rutas ni reporter.
- No agregar secrets, deploy, Docker, matrices, sharding ni runners propios.
- No usar `skip`, borrar tests ni debilitar aserciones para fabricar verde.
- No modificar archivos fuera del alcance aprobado.
- No hacer commit, push ni abrir pull request sin autorización explícita.
- No afirmar que el workflow funciona antes de observar un run.

## 5. Construir después del gate
Solo después de recibir `PLAN APROBADO`:
1. Crear `.github/workflows/` si no existe.
2. Crear o actualizar únicamente `.github/workflows/playwright.yml`.
3. Mantener claves principales en columna 1 y dos espacios por nivel.
4. Validar sintaxis YAML.
5. Ejecutar `git diff --check`.
6. Volver a ejecutar el comando objetivo local.
7. Mostrar el diff y los resultados.

## Salida
- `CANDIDATO`: YAML válido, diff limitado al archivo aprobado y comando local con exit code 0. Esperar decisión humana; no hacer push.
- `ESCALADO`: falta información, el comando falla, el repositorio contradice el plan o no puede validarse con seguridad.
