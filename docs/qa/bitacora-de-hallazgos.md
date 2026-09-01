# Bitácora de hallazgos — flujo de registro

Registro en crudo de lo observado. El análisis, la severidad y la redacción van
después, en `docs/reporte-de-bugs.md` (Fase 6).

Procedimiento: [`workflow-hallazgos.md`](workflow-hallazgos.md).

---

## Corrida 1 · Captura de evidencia — 2026-09-01

**Qué fue esta corrida.** Una captura del DOM y de la respuesta de red en once
estados del formulario, hecha para tener una fuente real de la que derivar los
locators. **No fue la ejecución formal de los 32 casos**, y los hallazgos de abajo no
firman ningún caso: son observaciones que la ejecución de la Fase 2 va a confirmar o
desmentir.

La distinción importa. Registrar un defecto observado es válido; firmar un caso que
no se ejecutó, no. Cuando `TC-R04-004`, `TC-R03-004` y `TC-R06-001` se ejecuten como
casos, van a fallar, y ahí quedará el resultado firmado.

| | |
|---|---|
| URL | `https://playground.calidadsinhumo.com/registro` |
| Navegador | Chromium 151.0.7922.34 (headless) |
| Runner | Playwright 1.62.1 — `node tools/capturar-evidencia.js evidence` |
| Sistema operativo | Windows 11 |
| Fecha | 2026-09-01 |
| Datos de la corrida | emails `iris.qa.1788272538397.*@gmail.com`, contraseña `Clave1234` |

---

## Hallazgos

| ID | Caso | Tipo | Esperado (según la spec) | Observado | Código | Evidencia |
|---|---|---|---|---|---|---|
| **H-01** | `TC-R04-004` | `DEFECTO` | REQ-R04 — *"Una contraseña de 7 caracteres debe ser rechazada. Una de 65 también."* | Registro aceptado y cuenta creada con una contraseña de 65 caracteres | `201` | `evidence/registro-password-larga.html` |
| **H-02** | `TC-R03-004` | `DEFECTO` | REQ-R03 — *"debe contener un `@` seguido de un dominio con punto"* | Registro aceptado y cuenta creada con `irismoreno@gmail`, sin punto en el dominio | `201` | `evidence/registro-email-sin-punto.html` |
| **H-03** | `TC-R06-001` | `DEFECTO` | REQ-R06 — *"Tras un registro exitoso, el formulario debe limpiarse completamente."* | Los cuatro campos conservan sus valores tras un `201` confirmado | `201` | `evidence/registro-exito.html` |
| **H-04** | — | `NO ES DEFECTO` | REQ-R05 — edad entre 16 y 99 | El input declara `min="1" max="150"`, que contradice la spec. Pero el comportamiento es correcto: 15 y 100 se rechazan con el mensaje adecuado | `sin petición` | `evidence/registro-form.html` · `registro-edad-baja.html` · `registro-edad-alta.html` |

**Tipo:** `DEFECTO` · `PREGUNTA ABIERTA` · `NO ES DEFECTO`
**Código:** el código de estado real de `POST /api/register`, o `sin petición` cuando el cliente bloquea. Sin este dato el hallazgo no vale.

---

## Corrida 2 · Primera ejecución de la suite E2E — 2026-09-01

`npx playwright test tests/e2e/registro.spec.ts` · 30 casos automatizados.

| ID | Caso | Tipo | Esperado (según la spec) | Observado | Código | Evidencia |
|---|---|---|---|---|---|---|
| **H-05** | `CP-14` | `DEFECTO` | REQ-R03 — la versión de trabajo nombra `usuario@` como inválido de forma explícita | Registro aceptado y cuenta creada con `irismoreno@`, sin dominio. **No aparece ningún mensaje de error** | `201` | `tools/capturar-evidencia.js` · corrida directa 2026-09-01 |
| **H-06** | — | `NO ES DEFECTO` | `tests/login.spec.ts` del andamiaje del curso espera un login exitoso con `ana.garcia@ejemplo.com` | `POST /api/login` responde `401`. La página anuncia *"usa las credenciales demo de abajo"*: el dato de prueba del test quedó obsoleto | `401` | Corrida directa 2026-09-01 |

### H-05 refina H-02, no lo repite

H-02 se había leído como *"media regla implementada: el `@` sí, el punto no"*. H-05 muestra que
es peor: **el cliente solo verifica que exista una arroba.** `irismoreno@` no tiene dominio ni
punto y entra igual. La regla de REQ-R03 tiene tres condiciones —arroba, dominio, punto en el
dominio— y solo la primera se aplica.

Los dos hallazgos van juntos al reporte de bugs: es un solo defecto con dos manifestaciones.

### H-06 está fuera del alcance y no se corrige

El fallo es de `tests/login.spec.ts`, que viene del commit inicial del curso y que la estrategia
declara fuera de alcance. La causa es de **datos**, no de producto: el par usuario/contraseña
que el test tiene fijo ya no es válido. No se toca, porque corregir un test fuera del alcance
declarado es ampliar el alcance sin decirlo.

Se registra porque afecta a la Fase 5: mientras siga ahí, la suite completa queda en rojo
aunque la suite del proyecto esté en verde.

### Hallazgo sobre la propia automatización

La primera corrida dio **25 pasados y 5 fallados**, y dos de esos fallos decían
*"Expected to fail, but passed"* sobre defectos que ya estaban confirmados con evidencia.

Causa: las aserciones sobre la red se evaluaban **antes** de que llegara la respuesta.

```ts
await expect(registroPage.successMessage).toBeHidden();   // pasa: aún no renderizó
expect(peticionesRegistro).not.toContain(201);            // pasa: array aún vacío
```

Las dos son aserciones negativas, así que encontraban exactamente la ausencia que buscaban.
**Un defecto real se leyó como comportamiento correcto.** Es el falso verde en su forma más
peligrosa, y no lo produjo el producto: lo produjo el test.

Corregido con `esperarResultado()`, que espera a una condición observable —llegó una respuesta
o apareció un error— sin espera por tiempo fijo. Queda anotado porque explica por qué el
oráculo se verifica *después* de una señal determinista y nunca antes.

---

## Notas

**H-01 y H-02 comparten causa, y H-03 la acompaña.** Los nueve rechazos observados
ocurrieron **sin emitir petición**: toda la validación que funciona vive en el
cliente. Las dos reglas que el cliente no implementa —el tope de contraseña y el
punto del dominio— no las aplica nadie, porque detrás no hay una segunda línea de
defensa. No son tres defectos independientes: son tres síntomas de un mismo defecto
de arquitectura, y así deberían reportarse en la Fase 6.

**H-01 corrige una creencia previa del proyecto.** El documento de casos invalidado
afirmaba que una contraseña de 65 caracteres producía un `422` de la API con la
pantalla mostrando éxito. Es falso: la API responde `201` y la cuenta se crea de
verdad. No hay divergencia entre capas — hay ausencia de validación. El defecto es
más simple y más grave que el que se creía tener.

**H-04 se registra aunque no sea defecto.** Deja constancia de que la inconsistencia
entre el HTML y la especificación se detectó, se contrastó y se descartó como
defecto de comportamiento. Queda como riesgo latente: el día que alguien confíe en
los atributos del input en vez de en la validación de la aplicación, el rango
efectivo pasaría a ser 1–150.

---

## Casos ya previstos como PREGUNTA ABIERTA

Estos dos no tienen resultado esperado en la especificación. Cuando se ejecuten, van
directo a `PREGUNTA ABIERTA` — se documenta el comportamiento real y no se firman ni
aprobados ni fallidos.

| Caso | Qué no define la especificación |
|---|---|
| `TC-R01-007` | Si un campo con solo espacios en blanco cuenta como vacío |
| `TC-R07-003` | Si la comparación de emails duplicados distingue mayúsculas de minúsculas |

---

## Control

| | |
|---|---|
| Casos automatizados y ejecutados | **30 / 32** — CP-07 y CP-30 quedan fuera por indeterminados |
| Hallazgos `DEFECTO` | 4 |
| Hallazgos `PREGUNTA ABIERTA` | 0 |
| Hallazgos `NO ES DEFECTO` | 2 |
| Casos sin verificar (sin código de estado citable) | 0 |

La última fila es la que importa: un caso sin código de estado citable —o sin la
constancia de que no hubo petición— **no es un caso aprobado**, es un caso sin
verificar. Si al cerrar la Fase 2 ese número no es cero, la corrida no está cerrada.
