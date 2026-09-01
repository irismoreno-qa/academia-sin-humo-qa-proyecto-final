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

**Resuelto el 2026-09-01 eliminando el archivo.** No se corrigieron las credenciales: se
quitó del repositorio junto con el resto de los tests heredados que no pertenecen al
alcance del proyecto. Si algo no forma parte del alcance, no tiene por qué estar
ocupando lugar ni exigiendo una excepción en el CI para justificarlo.

El hallazgo se conserva porque documenta un diagnóstico correcto —problema de datos y
no de producto— y porque la verificación que lo sostiene sigue siendo válida: una
cuenta recién registrada **sí** loguea con `200`.

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

## Corrida 3 · Suite de API directa — 2026-09-01

`npx playwright test tests/api/registro-api.spec.ts` · 11 tests llamando a
`POST /api/register` sin pasar por el formulario. **9 rechazos correctos, 2 defectos.**

| Regla probada directamente contra la API | Status | Cuerpo |
|---|:--:|---|
| REQ-R01 · sin el campo `name` | `422` | `{"errors":{"name":"El nombre es obligatorio"}}` |
| REQ-R02 · nombre de 1 carácter | `422` | `{"errors":{"name":"El nombre debe tener entre 2 y 50 caracteres"}}` |
| REQ-R02 · nombre de 51 caracteres | `422` | idéntico al anterior |
| REQ-R04 · contraseña de 7 | `422` | `{"errors":{"password":"La contraseña debe tener al menos 8 caracteres"}}` |
| **REQ-R04 · contraseña de 65** | **`201`** | **cuenta creada — H-01 confirmado en servidor** |
| REQ-R05 · edad 15 | `422` | `{"errors":{"age":"Debes tener al menos 16 años"}}` |
| REQ-R05 · edad 100 | `422` | `{"errors":{"age":"La edad máxima es 99"}}` |
| REQ-R03 · email sin `@` | `422` | `{"errors":{"email":"El email no tiene un formato válido"}}` |
| **REQ-R03 · email sin punto** | **`201`** | **cuenta creada — H-02 confirmado en servidor** |
| **REQ-R03 · email sin dominio** | **`201`** | **cuenta creada — H-05 confirmado en servidor** |
| REQ-R07 · email duplicado | `422` | rechazo correcto |

### Esto corrige la hipótesis central del proyecto, por segunda vez

**Lo que la Corrida 1 hizo suponer:** que toda la validación vivía en el cliente y
que el servidor aceptaba lo que el formulario dejara pasar. Era una inferencia
razonable sobre evidencia de UI — pero la evidencia de UI **solo puede ver el
cliente**. Nueve rechazos sin petición no dicen nada sobre el servidor.

**Lo que muestran estos tests:** el servidor valida, y valida bien. Rechaza con `422`
y **con los mensajes de error idénticos** a los del formulario. La segunda capa de
defensa existe.

**El defecto real, ahora preciso:** de las dos reglas compuestas, solo se implementó
una condición de cada una, y el error está replicado igual en ambas capas.

| Requisito | Condición implementada | Condición faltante |
|---|---|---|
| REQ-R04 · contraseña 8–64 | mínimo de 8 | **máximo de 64** |
| REQ-R03 · `@` y dominio con punto | presencia de `@` | **dominio con punto** |

Que los mensajes coincidan carácter por carácter entre cliente y servidor apunta a
una definición de validación compartida a la que le faltan esas dos condiciones. **No
es un olvido del backend: es una regla mal escrita una sola vez y usada dos veces.**

REQ-R05, que también tiene dos bordes numéricos, está **completa** en ambas capas.
Eso descarta que sea un problema general con las reglas de rango y acota el defecto a
esos dos puntos.

---

## Corrida 4 · Flujo integrado API → UI — 2026-09-01

`npx playwright test tests/integrado/inscripcion.spec.ts`

| ID | Tipo | Esperado (según la spec) | Observado | Código |
|---|---|---|---|---|
| **H-07** | `DEFECTO` | REQ-C04 — *"Al inscribirse exitosamente, el número de cupos disponibles debe reducirse en 1."* | `GET /api/courses` informa `enrolled: 24` **antes y después** de una inscripción exitosa. El cupo no se mueve | `200` |
| **H-08** | `DEFECTO` | REQ-S01 — las páginas protegidas requieren autenticación; un usuario autenticado debe poder verlas | Con sesión válida, `/mi-progreso` muestra *"Necesitas iniciar sesión para acceder a esta página"*. Ocurre también tras un login por formulario | `200` en login |
| **H-09** | `NO ES DEFECTO` | REQ-A03 — contrato de `POST /api/enroll` | `200`/`inscrito`, `400` sin `courseId`, `404` curso inexistente. **Los tres coinciden con la especificación** | `200`/`400`/`404` |
| **H-10** | `NO ES DEFECTO` | REQ-L04 — *"el sistema muestra un mensaje de bienvenida con el nombre del usuario"* | *"👋 ¡Hola, Iris! Has iniciado sesión correctamente."* Se cumple | `200` |

### H-08 caracteriza el bug de sesión mejor que la pista del curso

La consigna anticipaba que *"la sesión no sobrevive una recarga de página"*. Es cierto, pero
incompleto y el matiz cambia el diagnóstico:

```
POST /api/login          → 200 · crea la cookie ash_session
POST /api/enroll         → 200 · LA API HONRA ESA COOKIE, la inscripción se crea
GET  /api/progress       → 200 · devuelve la inscripción del usuario
GET  /api/auth/me        → {"realUser": null}
UI en /mi-progreso       → muro de login
```

**La sesión no está rota: está sin resolver.** Los datos existen y la API los devuelve
correctamente para ese usuario. Lo que falla es `/api/auth/me`, que no traduce la cookie a una
identidad — y la UI depende de ese endpoint para saber quién es el visitante.

Por eso toda página protegida trata al estudiante como anónimo aunque acabe de ver
*"¡Hola, Iris!"* en pantalla. **El estado se preserva; lo que se pierde es la identidad.**

Verificado en las dos direcciones: sesión creada por API y sesión creada por formulario. El
resultado es el mismo, así que no es un problema del puente entre capas.

### Hallazgo sobre la propia automatización, por segunda vez

La primera versión del test integrado tenía una aserción negativa —`toBeHidden()` sobre el muro
de login— evaluada **antes de que la página terminara de hidratar**. Pasaba en vacío sobre un
elemento que todavía no existía, igual que en la Corrida 2.

Se detectó recién al ejecutar el test **sin** su anotación `test.fail()` para comprobar dónde
fallaba de verdad: fallaba en la aserción siguiente, no en esta. Con la anotación puesta, un
test que falla por el motivo equivocado se reporta igual como pasado.

**De ahí sale una regla de método:** un test anotado con `test.fail()` debe verificarse una vez
sin la anotación, para confirmar que falla donde se espera. Si no, `test.fail()` deja de
documentar un defecto y pasa a esconder cualquier cosa.

---

## Notas

**H-01, H-02 y H-05 comparten causa.** No es una capa de validación ausente: la
Corrida 3 probó que el servidor valida y rechaza con los mismos mensajes que la UI.
Son **dos reglas compuestas a las que les falta su segunda condición**, replicadas
igual en cliente y servidor. Los tres hallazgos van juntos al reporte de bugs como un
solo defecto con tres manifestaciones. H-03, en cambio, es independiente: la
post-condición de REQ-R06 no se cumple y no tiene relación con las otras dos reglas.

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
| Hallazgos `DEFECTO` | 6 — reducibles a **5 defectos raíz**, ver [reporte-de-bugs](../reporte-de-bugs.md) |
| Hallazgos `PREGUNTA ABIERTA` | 0 |
| Hallazgos `NO ES DEFECTO` | 4 |
| Casos sin verificar (sin código de estado citable) | 0 |

La última fila es la que importa: un caso sin código de estado citable —o sin la
constancia de que no hubo petición— **no es un caso aprobado**, es un caso sin
verificar. Si al cerrar la Fase 2 ese número no es cero, la corrida no está cerrada.
