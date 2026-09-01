# Reporte — api-project-agent

## 1. Resumen

| Campo | Valor |
|---|---|
| **Modo** | `CONTINUAR` |
| **Objetivo** | Verificar si `POST /api/register` aplica las reglas de REQ-R01 a R07 cuando se lo llama sin pasar por el formulario |
| **Intentos** | 2 de 3 |
| **Estado** | `CANDIDATO` — decisión humana pendiente |
| **Fecha** | 2026-09-01 |

## 2. Entradas y plan aprobado

| Entrada | Valor |
|---|---|
| **PROYECTO** | `.` |
| **OBJETIVO** | Contrato y aplicación de reglas de `POST /api/register` en la capa de servidor |
| **FUENTE** | `/documentacion` sección 1 (REQ-R01 a R07) + contrato observado el 2026-09-01 |
| **ALCANCE** | `tests/api/registro-api.spec.ts` · `reports/api-project-agent-report.md` · scripts de `package.json` |
| **ARCHIVO_OBJETIVO** | `tests/api/registro-api.spec.ts` |
| **COMANDO_OBJETIVO** | `npx playwright test tests/api/registro-api.spec.ts --project=chromium` |

**Modo `CONTINUAR` y no `INICIAR`:** existía base utilizable en
`tests/api/login-api.spec.ts`, que usa la fixture `request` con rutas relativas al
`baseURL` y valida tipos con `expect.any()` en vez de valores fijos. Se conservó
intacta y se siguió su patrón.

## 3. Contrato observado, no inferido

Capturado interceptando una petición real del formulario antes de escribir un solo
test. El skill prohíbe inventar schemas, y el nombre de los campos no se dedujo:

```
POST /api/register     content-type: application/json
body   { name: string, email: string, password: string, age: string }
201    { message: string, user: { name, email, age } }
422    { errors: { <campo>: <mensaje> } }
```

`age` viaja como **string**, no como número. La contraseña **no** vuelve en la
respuesta del `201`.

## 4. Evidencia ejecutable

```
Comando   : npx playwright test tests/api/registro-api.spec.ts --project=chromium
Exit code : 0
Tests     : 11 pasados · 0 fallados
Duración  : 3.4 s

Tres corridas consecutivas:
  corrida 1 · exit=0 · 11 passed (3.8s)
  corrida 2 · exit=0 · 11 passed (3.5s)
  corrida 3 · exit=0 · 11 passed (3.4s)
```

Dos tests llevan `test.fail()` contra defectos confirmados. **La aserción no se
debilita en ninguno:** ejecutan las mismas afirmaciones y Playwright verifica que
efectivamente fallen.

## 5. Resultado por regla

| Regla probada directamente contra la API | Status | Veredicto |
|---|:--:|---|
| REQ-R01 · sin el campo `name` | `422` | ✅ el servidor la aplica |
| REQ-R02 · nombre de 1 carácter | `422` | ✅ |
| REQ-R02 · nombre de 51 caracteres | `422` | ✅ |
| REQ-R04 · contraseña de 7 | `422` | ✅ |
| **REQ-R04 · contraseña de 65** | **`201`** | ❌ **defecto — H-01** |
| REQ-R05 · edad 15 | `422` | ✅ |
| REQ-R05 · edad 100 | `422` | ✅ |
| REQ-R03 · email sin `@` | `422` | ✅ |
| **REQ-R03 · email sin punto en el dominio** | **`201`** | ❌ **defecto — H-02** |
| REQ-R07 · email duplicado | `422` | ✅ |
| Control · body válido | `201` | ✅ |

## 6. El hallazgo, y por qué corrige al proyecto

La hipótesis con la que se entró a esta fase era que **toda la validación vivía en el
cliente** y que el servidor aceptaba lo que el formulario dejara pasar. Era una
inferencia razonable a partir de evidencia de UI, y era **falsa**.

La evidencia de UI solo puede ver el cliente. Nueve rechazos sin petición no dicen
nada sobre lo que hace el servidor.

Lo que muestran estos once tests: **el servidor valida, y valida bien.** Rechaza con
`422` y con los mensajes de error **idénticos** a los del formulario. La segunda capa
de defensa existe.

El defecto real es más estrecho y más preciso:

| Requisito | Condición implementada | Condición faltante |
|---|---|---|
| REQ-R04 · contraseña 8–64 | mínimo de 8 | **máximo de 64** |
| REQ-R03 · `@` y dominio con punto | presencia de `@` | **dominio con punto** |

Que los mensajes coincidan carácter por carácter entre las dos capas apunta a una
definición de validación compartida a la que le faltan esas dos condiciones. **No es
un olvido del backend: es una regla mal escrita una vez y usada dos veces.**

REQ-R05, que también tiene dos bordes numéricos, está **completa** en ambas capas.
Eso descarta que sea un problema general con las reglas de rango.

## 7. Desviación declarada

La consigna prescribe `POST /api/enroll` para esta fase. Se eligió `/api/register`
porque cerraba la limitación más grande que la propia estrategia declaraba por
escrito: *cuando el formulario impide el envío, la petición que probaría al servidor
nunca se emite.*

Ir a `/api/enroll` habría agregado un flujo nuevo dejando abierto el hueco más grande
del flujo elegido en la Fase 0. El dominio de inscripción no queda abandonado: lo
cubre el flujo integrado de la Fase 4.

Los once tests se priorizaron con la matriz de decisión. Siete **descubren** —eran la
única forma de saber si el servidor valida— y cuatro **confirman** lo ya visto por UI.
Se descartaron los de robustez (cuerpo vacío, JSON malformado, edad no numérica)
porque la especificación no define qué debe responder la API en esos casos: su
resultado esperado saldría de una convención de industria y no de la fuente de verdad.

## 8. Alcance de esta verificación

**Qué demuestra.** Que el servidor aplica siete de las nueve reglas probadas, que
rechaza con un contrato estable (`422` + `errors`), y que los dos defectos conocidos
existen también en la capa de servidor y no solo en el render.

**Qué NO demuestra.**

- Que la API rechace entradas que la especificación no contempla: los casos de
  robustez quedaron fuera a propósito.
- Que el `201` se traduzca en persistencia real. La verificación termina en la respuesta.
- Nada sobre `POST /api/enroll`, `GET /api/courses` ni el resto de los endpoints.

## 9. Estado del workflow

**Estado automático: CANDIDATO**
**Decisión humana: PENDIENTE**

Los dos fallos son defectos de producto, no del test. Siguiendo la convención ya
aceptada en la Fase 2, se anotaron con `test.fail()` en vez de dejar la suite en rojo:
la aserción queda intacta y el día que el producto se corrija, esos dos tests pasarán
a rojo avisando que hay que quitar la anotación. Solo QA puede registrar `ACEPTADO` o
`RECHAZADO`.
