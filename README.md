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

Probar las mismas reglas por UI y después contra la API directa mostró esto:

> **Cliente y servidor validan igual, y comparten exactamente los mismos dos huecos.**
> El formulario bloquea nueve de once entradas inválidas sin emitir petición. Llamada
> directamente, `POST /api/register` rechaza esas mismas reglas con `422` y **con los
> mensajes idénticos**. Pero de dos reglas compuestas solo se implementó una condición
> de cada una, y el error está replicado en las dos capas.

| Requisito | Condición implementada | Condición faltante |
|---|---|---|
| REQ-R04 · contraseña de 8 a 64 | mínimo de 8 → `422` | **máximo de 64** → `201`, cuenta creada |
| REQ-R03 · `@` y dominio con punto | presencia de `@` → `422` | **dominio con punto** → `201`, cuenta creada |

No falta una capa de defensa: la segunda existe y tiene el mismo agujero que la
primera. Que los mensajes coincidan carácter por carácter apunta a una **regla mal
escrita una sola vez y usada dos veces**.

Y eso solo se ve probando en las dos capas. Por UI parecía que el backend no validaba
nada; por API sola no se habría visto que el formulario replica el mismo error. **Cada
capa, por separado, contaba una historia equivocada.**

Por eso el proyecto no arranca con casos. Arranca declarando contra qué se firma.

Evidencia en [`evidence/`](evidence), reproducible con
`node tools/capturar-evidencia.js evidence`, y en
[`docs/qa/bitacora-de-hallazgos.md`](docs/qa/bitacora-de-hallazgos.md) con el código de
estado de cada regla.

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

Numeración de fases según la consigna del proyecto final.

| Fase | Entregable | Estado |
|---|---|---|
| 0 · Estrategia | [`docs/estrategia.md`](docs/estrategia.md) — riesgo cuantificado, evaluación de los 9 flujos, alcance y reglas de método | **Completa** |
| 1 · Casos de prueba | [`docs/casos-de-prueba.md`](docs/casos-de-prueba.md) — 32 casos sobre 8 requisitos, más BDD, plan y trazabilidad en [`docs/qa/`](docs/qa) | **Completa** — juez: 11/12 |
| 2 · E2E por UI | [`tests/e2e/`](tests/e2e) + [`pages/`](pages) — 30 casos con Page Object | **Completa** |
| 3 · API | [`tests/api/`](tests/api) — 11 tests de contrato sobre `POST /api/register` | **Completa** |
| 4 · Integrado | [`tests/integrado/`](tests/integrado) — la API prepara, la UI verifica, la API limpia | **Completa** |
| 5 · CI | [`.github/workflows/`](.github/workflows) — 43 tests en GitHub Actions | **Completa** — [run verificado](reports/ci-report.md) |
| 6 · Reporte de bugs | [`docs/reporte-de-bugs.md`](docs/reporte-de-bugs.md) — 5 defectos con evidencia + este README | **Completa** |

**43 tests, verde reproducible.** Ocho llevan `test.fail()` contra defectos
confirmados contra la especificación: corren, ejecutan sus aserciones y Playwright
verifica que efectivamente fallen. El día que el producto se corrija se pondrán en
rojo avisando que hay que quitar la anotación.

**Dos casos quedan sin automatizar** —`CP-07` y `CP-30`— porque la especificación no
define su resultado esperado. Un test necesita algo contra lo cual afirmar; esos dos
se documentan como preguntas al responsable del producto.

---

## Matriz de trazabilidad de resultados

**25 PASS · 5 FAIL · 2 sin automatizar.** Los cinco `FAIL` son defectos del producto
contra la especificación, preservados con `test.fail()`.

| Columna | Qué responde |
|---|---|
| **API** | Qué respondió `POST /api/register`, o `sin petición` cuando el formulario bloqueó antes de enviar |
| **UI** | Qué mostró la pantalla |
| **Resultado** | El veredicto del caso |
| **Hallazgo** | `H-0X` de la [bitácora](docs/qa/bitacora-de-hallazgos.md), cuando hubo algo que registrar |

Las dos columnas se separaron para detectar divergencias entre capas. **No hay
ninguna: coinciden en las 30 filas ejecutadas.** Ese resultado negativo es un
hallazgo, y desmintió la hipótesis con la que arrancó el proyecto.

Lo que sí muestra la columna **API** es *dónde* se aplicó cada regla. `sin petición`
significa que el formulario bloqueó y **el servidor nunca se puso a prueba** por esa
vía — el hueco que la suite de API vino a cerrar.

| Requisito | Test | API | UI | Resultado | Hallazgo |
|---|---|:--:|:--:|:--:|:--:|
| **REQ-R01** | `CP-01` · Los cuatro campos vacíos bloquean el envío | sin petición | 4 errores | PASS | — |
|  | `CP-02` · Solo el nombre vacío, resto de campos válidos | sin petición | error nombre | PASS | — |
|  | `CP-03` · Solo el email vacío, resto de campos válidos | sin petición | error email | PASS | — |
|  | `CP-04` · Solo la contraseña vacía, resto de campos válidos | sin petición | error contraseña | PASS | — |
|  | `CP-05` · Solo la edad vacía, resto de campos válidos | sin petición | error edad | PASS | — |
|  | `CP-06` · Los cuatro campos completos con valores válidos permiten el envío | `201` | éxito | PASS | — |
|  | `CP-07` · Campo completado únicamente con espacios en blanco | — | — | NO AUTOMATIZADO | sin resultado esperado en la spec |
| **REQ-R02** | `CP-08` · Nombre por debajo del límite inferior: 1 carácter | sin petición | error nombre | PASS | — |
|  | `CP-09` · Nombre en el límite inferior válido: 2 caracteres exactos | `201` | éxito | PASS | — |
|  | `CP-10` · Nombre en el límite superior válido: 50 caracteres exactos | `201` | éxito | PASS | — |
|  | `CP-11` · Nombre por encima del límite superior: 51 caracteres | sin petición | error nombre | PASS | — |
| **REQ-R03** | `CP-12` · Email válido con @ y dominio con punto | `201` | éxito | PASS | — |
|  | `CP-13` · Email sin arroba | sin petición | error email | PASS | — |
|  | `CP-14` · Email con arroba pero sin dominio | **`201`** | **éxito** | **FAIL** | **H-05** |
|  | `CP-15` · Email con dominio sin punto | **`201`** | **éxito** | **FAIL** | **H-02** |
|  | `CP-16` · Email con dominio de primer nivel atípico pero sintácticamente válido | `201` | éxito | PASS | — |
| **REQ-R04** | `CP-17` · Contraseña por debajo del límite inferior: 7 caracteres | sin petición | error contraseña | PASS | — |
|  | `CP-18` · Contraseña en el límite inferior válido: 8 caracteres exactos | `201` | éxito | PASS | — |
|  | `CP-19` · Contraseña en el límite superior válido: 64 caracteres exactos | `201` | éxito | PASS | — |
|  | `CP-20` · Contraseña por encima del límite superior: 65 caracteres | **`201`** | **éxito** | **FAIL** | **H-01** |
| **REQ-R05** | `CP-21` · Edad por debajo del límite inferior: 15 años | sin petición | error edad | PASS | — |
|  | `CP-22` · Edad en el límite inferior válido: 16 años exactos | `201` | éxito | PASS | — |
|  | `CP-23` · Edad en el límite superior válido: 99 años exactos | `201` | éxito | PASS | — |
|  | `CP-24` · Edad por encima del límite superior: 100 años | sin petición | error edad | PASS | — |
| **REQ-R06** | `CP-25` · El formulario queda vacío tras un registro exitoso confirmado por la API | `201` | **form conserva datos** | **FAIL** | **H-03** |
|  | `CP-26` · El formulario conserva los datos tras un registro rechazado | sin petición | form conserva datos | PASS | — |
|  | `CP-27` · Dos registros exitosos consecutivos sin arrastre de datos | `201` + `201` | **form conserva datos** | **FAIL** | **H-03** |
| **REQ-R07** | `CP-28` · Un email no registrado previamente es aceptado | `201` | éxito | PASS | — |
|  | `CP-29` · Un email ya registrado es rechazado | `201` + `422` | error duplicado | PASS | — |
|  | `CP-30` · El mismo email con distinta capitalización | — | — | NO AUTOMATIZADO | sin resultado esperado en la spec |
| **REQ-R08** | `CP-31` · Un rechazo de la API no se muestra como éxito en pantalla | `201` + `422` | sin éxito | PASS | — |
|  | `CP-32` · Una aceptación de la API se muestra como éxito en pantalla | `201` | éxito | PASS | — |

**Cómo se llenó.** Fila por fila, a medida que cada caso se ejecutó, siguiendo el
[workflow de hallazgos](docs/qa/workflow-hallazgos.md). Cuando un test falla, la skill
[`analizar-fallo`](.agents/skills/analizar-fallo/SKILL.md) traza el caso a su
requisito, registra esperado contra observado, guarda la evidencia y **propone** una
acción — pero la decisión la toma la QA, y nunca se modifica la expectativa del test
para que pase.

---

## Hallazgos

**Cinco defectos contra la especificación.** Detalle completo, con pasos, evidencia y
severidad, en [`docs/reporte-de-bugs.md`](docs/reporte-de-bugs.md).

| # | Requisito | Qué encontré | Severidad | Capa |
|---|---|---|---|---|
| BUG-01 | REQ-S01 | Un estudiante autenticado no puede entrar a `/cursos` ni a `/mi-progreso` | **Crítica** | Integrado |
| BUG-02 | REQ-R03 | La validación de email solo verifica que exista una arroba: `usuario@` se registra con `201` | **Alta** | UI + API |
| BUG-03 | REQ-C04 | El cupo de un curso no baja al inscribirse | **Alta** | API |
| BUG-04 | REQ-R04 | Se acepta una contraseña de 65 caracteres, que la spec manda rechazar | Media | UI + API |
| BUG-05 | REQ-R06 | El formulario no se limpia tras un registro exitoso | Media | UI |

### El que más me costó, y el que más vale

**BUG-01** empezó como un test integrado que fallaba. Terminó siendo esto:

```
POST /api/login     → 200 · crea la cookie ash_session
POST /api/enroll    → 200 · LA API HONRA ESA COOKIE, la inscripción se crea
GET  /api/progress  → 200 · devuelve la inscripción del usuario
GET  /api/auth/me   → {"realUser": null}
UI /mi-progreso     → "🔒 Necesitas iniciar sesión"
```

**La sesión no está rota: está sin resolver.** Los datos existen y la API los devuelve
para ese usuario. Lo que falla es el endpoint del que la interfaz depende para saber
quién es el visitante. El estado se preserva; lo que se pierde es la identidad.

Y ninguna capa por separado lo mostraba. Por API todo respondía bien; por UI parecía
que la sesión nunca se había creado.

### Lo que revisé y NO es defecto

Vale tanto como la lista de arriba, porque distingue *"lo verifiqué y estaba bien"* de
*"no lo miré"*: el `min="1" max="150"` del input de edad contra los 16–99 de la spec,
el `gmail.con` que la regla escrita sí admite, el contrato de `POST /api/enroll` que
cumple REQ-A03 en sus tres respuestas, y el mensaje de bienvenida que cumple REQ-L04.

Más **dos preguntas abiertas** que no son bugs: la especificación no define si un campo
con solo espacios cuenta como vacío, ni si los emails duplicados distinguen mayúsculas.
Reportarlas como defectos sería inventar el resultado esperado.

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

**Dos casos no se firman ni aprobados ni fallidos.** `CP-07` (nombre con solo
espacios) y `CP-30` (mismo email con distinta capitalización): la
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

### Herramientas de IA que construí, y qué encontró cada una

| Herramienta | Qué hace | Qué aportó en este proyecto |
|---|---|---|
| **`@pom-agent`** | Genera y verifica Page Objects contra evidencia HTML real, con rúbrica de 12 puntos | El POM de registro, 12/12. Y en su primera corrida destapó que **dos defectos reales pasaban en vacío** por una aserción negativa mal sincronizada |
| **`@api-project-agent`** | Inicia o continúa un proyecto de tests de API con plan aprobado y contrato verificado | Los 11 tests de contrato. **Desmintió la hipótesis central del proyecto**: el servidor sí valida |
| **`@integration-agent`** | Construye un escenario UI + API con el dato dinámico compartido declarado | El flujo integrado. Con él apareció **BUG-01**, el hallazgo más grave |
| **Juez con rúbrica** | Puntúa casos de prueba contra cobertura, claridad, casos límite y Gherkin | Veredicto **11/12** sobre los 32 casos. De sus 5 señalamientos, [acepté 1 y rechacé 4](docs/qa/veredicto-del-juez.md) |
| **Matriz de decisión** | Puntúa candidatos a automatización por frecuencia × estabilidad × valor × mantenimiento | Priorizó los 11 tests de API: **7 que descubren por encima de 4 que confirman** |
| **`analizar-fallo`** | Clasifica un test en rojo entre producto, automatización, datos, ambiente o requisito | La clasificación de H-06 como problema de datos y no de producto |

**Ninguna decide.** Las seis proponen y se detienen en un gate humano: los workflows
de agente no pueden escribir la palabra `ACEPTADO`, que está reservada a la QA. Cada
reporte en [`reports/`](reports) tiene esa línea, y la decisión firmada.

Lo que más me sirvió de trabajar así no fue la velocidad. Fue que **tres capas de
revisión encontraron cosas distintas**: el juez halló dos defectos de forma, un script
de validación halló un tercero que el juez no vio, y la ejecución halló un supuesto
falso que ninguno de los dos podía detectar leyendo documentos.

---

## Cómo correrlo

**Requisitos:** Node.js 24 y npm.

```bash
npm ci
npx playwright install chromium
```

```bash
npm test              # toda la suite
npm run test:api      # solo la suite de API
npm run test:list     # lista los casos de login sin ejecutarlos
npm run report        # abre el último reporte HTML
```

### Integración continua

El workflow vive en [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml)
y corre los 43 tests en cada push y en cada pull request a `main`.

**Run de referencia:**
[`33538784699`](https://github.com/irismoreno-qa/academia-sin-humo-qa-proyecto-final/actions/runs/33538784699)
— ✅ `success` en 2 m 03 s, con el artifact `playwright-report` descargado y revisado.
Detalle completo en [`reports/ci-report.md`](reports/ci-report.md).

```
Verificar que no hay tests silenciados  →  Sin skip, sin only, sin waitForTimeout.
Comprobar el entorno                    →  1 passed (1.0s)
Ejecutar la suite del proyecto          →  43 passed (53.3s)
```

Dos decisiones que vale la pena mirar:

- **El smoke corre antes que la suite.** Si falla, el problema es el entorno y no los
  tests. Un rojo en el paso 1 y un rojo en el paso 2 significan cosas distintas.
- **La prohibición de silenciar tests la hace cumplir el CI**, no un documento. Un
  `grep` falla el build si aparece `test.skip`, `.only` o `waitForTimeout`.

**El CI cubre el 100% del repositorio.** Los tests heredados del curso que no
formaban parte del proyecto se eliminaron: si algo no pertenece al alcance, no tiene
por qué estar ocupando lugar ni exigiendo una excepción para justificarlo.

---

## Lo que este proyecto no demuestra

- Que el resto del producto esté libre de defectos: **no fue probado**.
- Que el registro se comporte igual bajo concurrencia o carga.
- Que los datos se persistan realmente: la verificación termina en la respuesta de
  la API.
- Que el formulario cumpla WCAG: la accesibilidad quedó fuera del alcance
  comprometido.

Declarar los límites de una suite es parte de entregarla.
