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

La captura de los once estados del formulario mostró esto:

> **Toda la validación que funciona vive en el cliente.** Nueve de los once rechazos
> ocurren sin emitir una sola petición a `POST /api/register`. Y las dos reglas que
> el cliente no implementa —el tope de 64 caracteres de la contraseña y el punto
> obligatorio en el dominio del email— **no las aplica nadie**: el servidor las
> acepta con `201` y crea la cuenta.

No hay una segunda línea de defensa. Lo que el formulario deja pasar, entra.

Eso tiene una consecuencia que va más allá de los bugs: **que la pantalla te frene
no significa que el sistema aplique la regla.** Un caso firmado leyendo solo lo
visible confunde una cosa con la otra, y da por probado algo que nunca se probó.

Por eso el proyecto no arranca con casos. Arranca declarando contra qué se firma.

Evidencia en [`evidence/`](evidence) — un archivo por estado más el código de estado
de cada uno. Reproducible con `node tools/capturar-evidencia.js evidence`.

### La regla de oráculo

| Nivel | Fuente | Uso |
|---|---|---|
| **1 · primario** | **Si la cuenta se creó o no**: el código de estado de `POST /api/register`, o la *ausencia* de petición cuando el cliente bloquea | Es lo que decide aprobado o fallido |
| **2 · secundario** | Mensaje visible en pantalla | Se verifica *además* del nivel 1, nunca en su lugar |
| **3 · prohibido** | El texto de error de la propia aplicación | No se usa jamás para derivar un resultado esperado |

El nivel 3 está prohibido por circular: derivar el resultado esperado del mensaje
que muestra la app equivale a decidir de antemano que la app no puede estar
equivocada.

**Cuando el cliente bloquea**, la ausencia de petición es una lectura del oráculo tan
verificable como un código de estado — pero el caso queda demostrado *solo en la capa
de cliente*. Que el servidor aplique la misma regla no se prueba, y en este producto
hay motivos para dudarlo.

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

## Matriz de trazabilidad de resultados

Las columnas **API** y **UI** son los dos niveles del oráculo, separados a propósito:

| Columna | Qué responde |
|---|---|
| **API** | ¿`POST /api/register` respondió como exige la especificación? — *nivel 1, el que decide* |
| **UI** | ¿La pantalla reflejó esa respuesta? — *nivel 2, se verifica además* |
| **Resultado** | El veredicto del caso: `PASS` solo si ambos niveles lo son |
| **Hallazgo** | `H-0X` de la [bitácora](docs/qa/bitacora-de-hallazgos.md), cuando hubo algo que registrar |

Separarlas no es burocracia. **Una fila con `API: PASS` y `UI: FAIL` es exactamente
el defecto de REQ-R08** —el backend rechazó, la pantalla dijo que todo salió bien— y
en esta tabla se ve sin leer una línea de texto. Una sola columna de resultado lo
escondería.

Estados: `PASS` · `FAIL` · `BLOQUEADO` · `SIN VERIFICAR` (ejecutado pero sin código
de estado citable) · `—` (no ejecutado todavía).

| Requisito | Test | API | UI | Resultado | Hallazgo |
|---|---|:--:|:--:|:--:|---|
| **REQ-R01** | `TC-R01-001` · Los cuatro campos vacíos bloquean el envío | — | — | — | — |
|  | `TC-R01-002` · Solo el nombre vacío, resto de campos válidos | — | — | — | — |
|  | `TC-R01-003` · Solo el email vacío, resto de campos válidos | — | — | — | — |
|  | `TC-R01-004` · Solo la contraseña vacía, resto de campos válidos | — | — | — | — |
|  | `TC-R01-005` · Solo la edad vacía, resto de campos válidos | — | — | — | — |
|  | `TC-R01-006` · Los cuatro campos completos con valores válidos permiten el envío | — | — | — | — |
|  | `TC-R01-007` · Campo completado únicamente con espacios en blanco | — | — | — | — |
| **REQ-R02** | `TC-R02-001` · Nombre por debajo del límite inferior: 1 carácter | — | — | — | — |
|  | `TC-R02-002` · Nombre en el límite inferior válido: 2 caracteres exactos | — | — | — | — |
|  | `TC-R02-003` · Nombre en el límite superior válido: 50 caracteres exactos | — | — | — | — |
|  | `TC-R02-004` · Nombre por encima del límite superior: 51 caracteres | — | — | — | — |
| **REQ-R03** | `TC-R03-001` · Email válido con @ y dominio con punto | — | — | — | — |
|  | `TC-R03-002` · Email sin arroba | — | — | — | — |
|  | `TC-R03-003` · Email con arroba pero sin dominio | — | — | — | — |
|  | `TC-R03-004` · Email con dominio sin punto | — | — | — | — |
|  | `TC-R03-005` · Email con dominio de primer nivel atípico pero sintácticamente válido | — | — | — | — |
| **REQ-R04** | `TC-R04-001` · Contraseña por debajo del límite inferior: 7 caracteres | — | — | — | — |
|  | `TC-R04-002` · Contraseña en el límite inferior válido: 8 caracteres exactos | — | — | — | — |
|  | `TC-R04-003` · Contraseña en el límite superior válido: 64 caracteres exactos | — | — | — | — |
|  | `TC-R04-004` · Contraseña por encima del límite superior: 65 caracteres | — | — | — | — |
| **REQ-R05** | `TC-R05-001` · Edad por debajo del límite inferior: 15 años | — | — | — | — |
|  | `TC-R05-002` · Edad en el límite inferior válido: 16 años exactos | — | — | — | — |
|  | `TC-R05-003` · Edad en el límite superior válido: 99 años exactos | — | — | — | — |
|  | `TC-R05-004` · Edad por encima del límite superior: 100 años | — | — | — | — |
| **REQ-R06** | `TC-R06-001` · El formulario queda vacío tras un registro exitoso confirmado por la API | — | — | — | — |
|  | `TC-R06-002` · El formulario conserva los datos tras un registro rechazado | — | — | — | — |
|  | `TC-R06-003` · Dos registros exitosos consecutivos sin arrastre de datos | — | — | — | — |
| **REQ-R07** | `TC-R07-001` · Un email no registrado previamente es aceptado | — | — | — | — |
|  | `TC-R07-002` · Un email ya registrado es rechazado | — | — | — | — |
|  | `TC-R07-003` · El mismo email con distinta capitalización | — | — | — | — |
| **REQ-R08** | `TC-R08-001` · Un rechazo de la API no se muestra como éxito en pantalla | — | — | — | — |
|  | `TC-R08-002` · Una aceptación de la API se muestra como éxito en pantalla | — | — | — | — |

**Cómo se llena.** No a mano al final: fila por fila, a medida que cada caso se
ejecuta, siguiendo el [workflow de hallazgos](docs/qa/workflow-hallazgos.md). Cuando
un test automatizado falla, la skill
[`analizar-fallo`](.agents/skills/analizar-fallo/SKILL.md) traza el caso a su
requisito, registra esperado contra observado, guarda la evidencia y **propone** una
acción — pero la decisión la toma la QA, y nunca se modifica la expectativa del test
para que pase.

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
| [`.agents/skills/`](.agents/skills) | 8 skills de alcance acotado: generar y verificar Page Objects, construir y verificar proyecto de API, integración UI+API, generación del workflow de CI, y [`analizar-fallo`](.agents/skills/analizar-fallo/SKILL.md) para el análisis de tests en rojo. Cada una exige inventario y aprobación humana antes de escribir archivos |
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
