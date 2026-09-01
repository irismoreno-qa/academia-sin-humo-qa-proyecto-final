# Reporte — integration-agent

## 1. Resumen y estado

| Campo | Valor |
|---|---|
| **Escenario** | La API prepara una inscripción → la UI verifica `/mi-progreso` → la API cierra sesión |
| **Opción** | B — preparación por API |
| **Intentos** | 2 de 3 |
| **Estado** | `CANDIDATO` — decisión humana pendiente |
| **Fecha** | 2026-09-01 |

## 2. Entradas y plan aprobado

| Entrada | Valor |
|---|---|
| **PROYECTO** | `.` |
| **OBJETIVO** | Verificar que una inscripción creada por API se muestra en la UI del estudiante |
| **FUENTE** | `/documentacion` (REQ-S01, S02, C04, P01, A01–A03) + contrato observado el 2026-09-01 |
| **ALCANCE** | `tests/integrado/inscripcion.spec.ts` · `reports/integration-agent-report.md` |
| **COMANDO_OBJETIVO** | `npx playwright test tests/integrado/inscripcion.spec.ts --project=chromium` |

## 3. El dato dinámico compartido

**Dos valores cruzan de la capa API a la capa UI, y ninguno está escrito en el archivo.**

| Dato | Dónde nace | Dónde lo consume la UI |
|---|---|---|
| **El email de la cuenta** | `POST /api/register`, línea 56 — construido con marca de tiempo y sufijo aleatorio | Produce la cookie `ash_session` en `POST /api/login`. Es la identidad con la que `/mi-progreso` debería reconocer al estudiante |
| **El título del curso** | `GET /api/courses`, línea 71 — se elige el primero sin prerequisito y con cupo | Es el texto que la aserción de UI busca en pantalla, línea 116 |

El puente entre capas es **`page.request`**, que comparte el almacenamiento con el contexto del
navegador. Sin él, la cookie que crea la API nunca llegaría a la UI y esto serían dos pruebas
pegadas, no un flujo integrado.

Ni el `courseId` ni el título están escritos literalmente: se descubren en ejecución desde el
catálogo, de modo que el test no depende de un id escrito a mano.

## 4. Rúbrica estática

### 1. Fidelidad a la fuente — 3/3

Todos los endpoints, métodos, cuerpos y códigos fueron observados antes de escribir el test, no
inferidos:

```
POST /api/register  201  { message, user }
POST /api/login     200  { message, user }  · cookie ash_session
GET  /api/courses   200  { courses: [{ id, title, prerequisiteId, maxStudents, enrolled }] }
POST /api/enroll    200  { courseId, status: "inscrito", progress, enrolledAt }
POST /api/logout    200
```

El teardown no se inventó: REQ-S02 documenta que al cerrar sesión el progreso se reinicia, y
`POST /api/logout` se verificó devolviendo `200`.

### 2. Integración real — 3/3

El dato compartido nace en la ejecución y se consume en la otra capa (sección 3). Cero valores
literales que crucen capas.

### 3. Reutilización y convenciones — 3/3

- Usa la `baseURL` del proyecto con rutas relativas, igual que `tests/api/`.
- Locators semánticos: `getByText` sobre el texto visible. Ningún `getByTestId`.
- **No se creó un Page Object para `/mi-progreso`**, y es deliberado: la página nunca llegó a
  renderizar su estado autenticado, así que un POM se construiría sobre locators que nadie
  observó. `generar-pom` prohíbe inventar. Queda como paso natural el día que la identidad
  resuelva.

### 4. Alcance declarado y seguridad — 3/3

- El encabezado del test declara qué **no** demuestra el flujo, antes de que nadie lo lea.
- Residuo declarado en la sección 8.
- Datos desechables, email único por corrida, sin tokens ni cookies versionadas.

**Total: 12/12**

## 5. Evidencia ejecutable

```
Comando   : npx playwright test tests/integrado/inscripcion.spec.ts --project=chromium
Exit code : 0
Tests     : 1 pasado · 0 fallados

Tres corridas consecutivas:
  corrida 1 · exit=0 · 1 passed (8.9s)
  corrida 2 · exit=0 · 1 passed (9.0s)
  corrida 3 · exit=0 · 1 passed (8.7s)
```

El test lleva `test.fail()` contra el defecto H-08. **La aserción no se debilita:** ejecuta las
mismas afirmaciones y Playwright verifica que efectivamente falle.

**Verificación de la anotación.** Se ejecutó una copia temporal del test **sin** `test.fail()`
para confirmar dónde falla realmente:

```
Error: con sesión válida no debe aparecer el muro de login
```

Falla en la aserción esperada. Sin esta comprobación, `test.fail()` habría reportado como
pasado un fallo por cualquier otro motivo.

## 6. Cambios por intento

### Intento 1

Se construyó el escenario con las cuatro partes visibles. Al verificar sin la anotación, el
fallo aparecía en la **segunda** aserción y no en la primera: `toBeHidden()` sobre el muro de
login pasaba en vacío porque se evaluaba antes de que la página terminara de hidratar, sobre un
elemento que todavía no existía.

Es la misma trampa que hizo pasar dos defectos reales en la primera corrida de la suite E2E.

### Intento 2

Se agregó una espera a condición observable —o aparece el muro, o aparece el curso— antes de
las aserciones, sin espera por tiempo fijo. El fallo pasó a ocurrir en la primera aserción, que
es la que caracteriza el defecto.

**Ninguna expectativa fue modificada.** La corrección fue en la sincronización.

## 7. Qué demuestra y qué NO demuestra

**Demuestra.** Que la preparación por API funciona de punta a punta —cuenta, sesión e
inscripción—, que la API honra su propia cookie de sesión, y que la UI **no** reconoce a un
estudiante autenticado en una página protegida.

**No demuestra.**

- Que la inscripción persista más allá de la respuesta de la API.
- Que el prerequisito se aplique: el curso elegido no tiene, y REQ-C03 está fuera del alcance.
- Que el progreso se reinicie al cerrar sesión (REQ-S02): no se puede verificar por UI mientras
  la identidad no resuelva.
- Nada sobre el resto de la máquina de estados de REQ-P02.

## 8. Residuo en el servidor

**Queda una cuenta por corrida**, con su inscripción asociada. La fuente **no documenta ningún
endpoint para eliminar una cuenta**, así que no se inventó uno: el skill lo prohíbe
explícitamente.

La limpieza que sí se puede justificar —`POST /api/logout`, respaldada por REQ-S02— se ejecuta
en un bloque `finally`, de modo que corre también cuando la verificación falla. Se comprobó que
devuelve `200`.

El email es único por corrida, así que el residuo **no afecta a la siguiente ejecución**. Sí se
acumula en el servidor compartido, y queda declarado como tal.

## 9. Estado del workflow

**Estado automático: CANDIDATO**
**Decisión humana: PENDIENTE**

Rúbrica 12/12 y exit code 0 en tres corridas consecutivas. El fallo es un defecto de producto
—H-08— documentado y anotado según la convención aceptada en las Fases 2 y 3. Solo QA puede
registrar `ACEPTADO` o `RECHAZADO`.

**Hallazgos colaterales del inventario**, registrados en la bitácora: **H-07** (REQ-C04, el cupo
no baja tras una inscripción exitosa), **H-09** (el contrato de `POST /api/enroll` cumple
REQ-A03 en sus tres respuestas) y **H-10** (REQ-L04 se cumple).
