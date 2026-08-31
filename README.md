# QA del flujo de registro — Academia sin Humo

Estrategia de pruebas, diseño de casos y automatización con Playwright sobre el
formulario de registro de `https://playground.calidadsinhumo.com`.

Trabajo final del curso **Ruta de Transformación de QA Manual a QA Automation**
(TesteandoYa).

La tesis del proyecto cabe en una línea: **un caso de prueba vale lo que vale su
oráculo.** Todo lo demás —el alcance, las técnicas, el formato de los artefactos—
sale de ahí.

---

## Por qué el oráculo es el centro de este proyecto

Durante la exploración manual del formulario apareció esto:

> La pantalla muestra **"¡Registro exitoso! Tu cuenta ha sido creada."**
> mientras `POST /api/register` responde **`422`**.

El backend rechazó la cuenta. El frontend le dijo al aspirante que la tenía.

Eso tiene una consecuencia que va más allá del bug: **cualquier caso de prueba
firmado leyendo el mensaje de pantalla está certificando una mentira.** No es que
el caso esté mal escrito — es que su fuente de verdad no es confiable.

Por eso el proyecto no arranca con casos. Arranca declarando contra qué se firma.

### La regla de oráculo

| Nivel | Fuente | Uso |
|---|---|---|
| **1 · primario** | Respuesta real de `POST /api/register`: código de estado y body | Es lo que decide aprobado o fallido |
| **2 · secundario** | Mensaje visible en pantalla | Se verifica *además* del nivel 1, nunca en su lugar |
| **3 · prohibido** | El texto de error de la propia aplicación | No se usa jamás para derivar un resultado esperado |

El nivel 3 está prohibido por circular: derivar el resultado esperado del mensaje
que muestra la app equivale a decidir de antemano que la app no puede estar
equivocada.

**Excepción declarada:** REQ-R01 espera bloqueo del lado del cliente, así que ahí
el oráculo primario es la *ausencia* de petición en Network — igual de verificable
que un código de estado.

### Las otras dos reglas de método

| Regla | Enunciado | Por qué |
|---|---|---|
| **Aislamiento** | Un caso varía una sola variable; el resto de los campos van en valores válidos centrales | Un caso con cuatro campos inválidos no puede atribuir el rechazo, y por lo tanto no valida ningún requisito |
| **Evidencia** | La produce quien firma el caso, con interacción real de usuario y captura de Network o HAR | Un resultado que no se puede auditar no es un resultado |

---

## Alcance

**Dentro:** el flujo de registro (`/registro`), requisitos REQ-R01 a R07 de la
especificación publicada en `/documentacion`, más un requisito derivado (REQ-R08).

**Fuera:** las otras 8 secciones de la especificación —login, catálogo,
inscripción, progreso, sesión, reserva, listado paginado y subida de CV—, con su
riesgo y su orden de ampliación documentados en
[`docs/estrategia.md`](docs/estrategia.md).

Declarar lo que queda afuera es parte del entregable: una estrategia que solo mira
lo que ya decidiste probar no es una estrategia.

---

## Estado

| Fase | Entregable | Estado |
|---|---|---|
| 0 · Estrategia | Riesgo, evaluación de los 9 flujos, alcance, reglas de método | **Completa** |
| 1 · Diseño de casos | 32 casos sobre 8 requisitos, escenarios BDD, plan de prueba, matriz de trazabilidad | **Completa** |
| 2 · Ejecución manual | Ejecución de los 32 casos con evidencia de red por caso | Pendiente |
| 3 · Automatización | Suite UI con Page Object afirmando sobre la respuesta de la API | Esqueleto: POM con 5 locators y 1 test de visibilidad |
| 4 · CI | Smoke en GitHub Actions | Funcionando |
| 5 · Reporte de bugs | Hallazgos con pasos reproducibles y evidencia | Pendiente |

Los 32 casos están **diseñados, no ejecutados**. `docs/qa/test-cases.json` no tiene
campo para resultado obtenido: diseño y ejecución son artefactos separados, y
mezclarlos es exactamente lo que permite firmar como verificado algo que no lo está.

---

## Artefactos

| Archivo | Contenido |
|---|---|
| [`docs/estrategia.md`](docs/estrategia.md) | Fase 0: riesgo principal, evaluación de flujos, alcance, reglas de método, riesgos de la propia estrategia |
| [`docs/qa/context.json`](docs/qa/context.json) | Contexto del sistema y reglas de negocio textuales |
| [`docs/qa/requirements.json`](docs/qa/requirements.json) | 8 requisitos con criterios de aceptación |
| [`docs/qa/test-cases.json`](docs/qa/test-cases.json) | Los 32 casos: pasos, datos y resultado esperado |
| [`docs/qa/registro.feature`](docs/qa/registro.feature) | 32 escenarios Gherkin, etiquetados `@TC-…` y `@req-…` |
| [`docs/qa/test-plan.md`](docs/qa/test-plan.md) | Plan IEEE 829-lite: objetivo, alcance, técnicas, criterios de entrada y salida, riesgos |
| [`docs/qa/traceability.md`](docs/qa/traceability.md) | Matriz bidireccional requisito ↔ caso ↔ escenario |

### Cómo se cubrió cada requisito

| Requisito | Técnica | Cobertura |
|---|---|---|
| R01 · campos obligatorios | Partición de equivalencia | Los 4 campos aislados + los 4 vacíos a la vez + control positivo |
| R02 · nombre 2–50 | Valores límite | `1` · **2** · **50** · `51` |
| R03 · formato de email | Partición de equivalencia | 1 clase válida, 3 inválidas, 1 límite de interpretación |
| R04 · contraseña 8–64 | Valores límite | `7` · **8** · **64** · `65` |
| R05 · edad 16–99 | Valores límite | `15` · **16** · **99** · `100` |
| R06 · limpieza del formulario | Post-condición | Tras éxito, tras rechazo, y entre dos registros consecutivos |
| R07 · email duplicado | Partición de equivalencia | Rechazo del duplicado + control con email nuevo |
| R08 · coherencia UI/API *(derivado)* | Consistencia entre capas | Las dos direcciones: la API rechaza y la API acepta |

En negrita, los valores que deben aceptarse.

**Dos casos no se firman ni aprobados ni fallidos.** `TC-R01-007` (nombre con solo
espacios) y `TC-R07-003` (mismo email con distinta capitalización): la
especificación no los define, así que se documentan como preguntas al responsable
del producto. Reportar un defecto sin una regla que lo respalde es inventar el
resultado esperado.

---

## Cómo se desarrolló

El proyecto se construyó con agentes dirigidos, no con generación libre. La regla
de trabajo fue que **el criterio de qué se prueba y qué no lo fija la estrategia,
no la herramienta.**

| Componente | Qué hace |
|---|---|
| [`.agents/skills/`](.agents/skills) | 7 skills de alcance acotado: generar y verificar Page Objects, construir y verificar proyecto de API, integración UI+API, y generación del workflow de CI. Cada una exige inventario y aprobación humana antes de escribir archivos |
| [`.agents/workflows/`](.agents/workflows) | 3 workflows de agente con sus contratos de entrada, salida y condiciones de parada |
| [`reports/`](reports) | Reportes de verificación de las ejecuciones de agente, con rúbrica y puntaje |
| [`evidence/`](evidence) | Evidencia HTML del formulario bajo prueba, usada como fuente para los locators |

Los artefactos de la Fase 1 se produjeron con un sistema de 5 estaciones en cadena
—contexto, requerimientos, casos, BDD, plan y trazabilidad—, con **tres
desviaciones deliberadas** documentadas en
[`docs/qa/test-plan.md`](docs/qa/test-plan.md): se conservan los IDs de la
especificación en vez de renumerar, la salida va a `docs/qa/` en vez de `output/`,
y el piso de cobertura se cubre por análisis de valores límite en los requisitos
de rango numérico.

Una desviación sin justificar es un error. Una desviación argumentada es criterio.

---

## Cómo correrlo

**Requisitos:** Node.js 24 y npm.

```bash
npm ci
npx playwright install chromium
```

```bash
npm test              # toda la suite
npm run test:login    # solo la suite de login
npm run test:api      # solo la suite de API
npm run test:list     # lista los casos de login sin ejecutarlos
npm run report        # abre el último reporte HTML
```

### Smoke de CI

```bash
npx playwright test tests/ci/ci-smoke.spec.ts --project=chromium
```

Comprueba que Playwright arranca, abre Chromium y ejecuta una expectativa. **No
valida el producto** — es la base sobre la que se construye el CI.

El workflow vive en [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml)
y se generó con la skill `generar-workflow-ci`, que inspecciona el proyecto,
propone un plan en estado `PLAN_PENDIENTE` y solo escribe el archivo después de
recibir `PLAN APROBADO`.

---

## Lo que este proyecto no demuestra

- Que el resto del producto esté libre de defectos: **no fue probado**.
- Que el registro se comporte igual bajo concurrencia o carga.
- Que los datos se persistan realmente: la verificación termina en la respuesta de
  la API.
- Que el formulario cumpla WCAG: la accesibilidad quedó fuera del alcance
  comprometido.

Declarar los límites de una suite es parte de entregarla.
