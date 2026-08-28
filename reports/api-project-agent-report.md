# Reporte — api-project-agent

## 1. Resumen

| Campo | Valor |
|---|---|
| **Modo** | `CONTINUAR` |
| **Objetivo** | Agregar y verificar la comprobación de Content-Type en `POST /api/login` |
| **Intentos** | 1 de 3 |
| **Estado** | `CANDIDATO` — decisión humana pendiente |

## 2. Entradas y plan aprobado

| Entrada | Valor |
|---|---|
| **PROYECTO** | `.` (Demo S11) |
| **OBJETIVO** | Agregar y verificar comprobación de Content-Type en POST /api/login |
| **FUENTE** | Salida visible de `npm run test:api` (slide 8) — `CONTENT-TYPE: application/json` |
| **ALCANCE** | `tests/api/login-api.spec.ts`, `reports/api-project-agent-report.md` |
| **ARCHIVO_OBJETIVO** | `tests/api/login-api.spec.ts` |
| **COMANDO_OBJETIVO** | `npm run test:api` |

**Plan aprobado**: agregar una assertion `expect(contentType).toContain('application/json')` al test existente `rechaza credenciales incorrectas`.

## 3. Rúbrica — 12/12

| # | Criterio | Puntaje | Evidencia |
|---|---|---|---|
| 1 | **Fidelidad a la fuente** | 3/3 | Método `POST`, ruta `/api/login`, status `401`, schema `error/attempts/remaining`, y `content-type: application/json` — todos provienen de la salida real. Nada inventado. |
| 2 | **Integración con el proyecto** | 3/3 | Usa `@playwright/test`, fixture `request`, `baseURL` del config, convenciones existentes (español en nombres, `console.log` diagnóstico). |
| 3 | **Calidad de las comprobaciones** | 3/3 | 3 assertions declaradas: status 401, schema del body (`toMatchObject`), content-type (`toContain`). `toContain` es adecuado porque el header puede incluir `; charset=utf-8`. |
| 4 | **Seguridad y límites** | 3/3 | Sin secretos. Datos de prueba controlados. Cambio dentro del alcance aprobado (3 líneas agregadas). |

## 4. Ejecución

| Campo | Valor |
|---|---|
| **Comando** | `npm run test:api` |
| **Exit code** | 0 |
| **Tests pasados** | 1 (`rechaza credenciales incorrectas`) |
| **Tests fallidos** | 0 |
| **Duración** | 1.3s |

### Salida relevante

```
STATUS: 401
CONTENT-TYPE: application/json
BODY: {
  "error": "Email o contraseña incorrectos",
  "attempts": 1,
  "remaining": 4
}

  1 passed (1.3s)
```

## 5. Cambios por intento

### Intento 1 (final)

**Archivo**: `tests/api/login-api.spec.ts`

```diff
   expect(body).toMatchObject({
     error: expect.any(String),
     attempts: expect.any(Number),
     remaining: expect.any(Number),
   });
+
+  // Comprobación de Content-Type (fuente: slide 8)
+  const contentType = response.headers()['content-type'];
+  expect(contentType).toContain('application/json');
 });
```

## 6. Qué demuestra y qué no demuestra

### Demuestra
- El endpoint `POST /api/login` devuelve el header `Content-Type` con valor que contiene `application/json`.
- El status 401 y el schema del body se mantienen correctos tras agregar la nueva assertion.
- Las tres comprobaciones (status, body, content-type) pasan en una ejecución real contra el servidor.

### No demuestra
- No prueba otros valores de Content-Type (p. ej., `text/plain` en caso de error del servidor).
- No prueba credenciales correctas (fuera del alcance solicitado).
- No prueba variantes del header con charset explícito.

## 7. Estado del workflow

| Campo | Valor |
|---|---|
| **Estado** | `CANDIDATO` |
| **Rúbrica** | 12/12 |
| **Exit code** | 0 |
| **Decisión humana** | **Pendiente** — solo QA puede registrar `ACEPTADO` o `RECHAZADO`. |
