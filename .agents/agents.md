# Equipo del proyecto

## @pom-agent — Agente POM

### Objetivo
Entregar un Page Object de Playwright guardado en la ruta solicitada y respaldado
por dos evidencias: rúbrica POM 12/12 y test objetivo con exit code 0. La ruta o URL
de navegación debe venir de una entrada explícita; no se inventa.

### Capacidades que debe usar
- `.agents/skills/generar-pom/SKILL.md` para crear o corregir el POM.
- `.agents/skills/verificar-pom/SKILL.md` para revisar y ejecutar la verificación.

### Herramientas permitidas
- Leer archivos del proyecto y la evidencia HTML.
- Crear o editar únicamente el archivo POM y el reporte solicitado.
- Ejecutar el test de Playwright indicado por el usuario.

### Límites
- No cambies el test, la aplicación ni su expectativa para fabricar un verde.
- No declares éxito basándote solo en una opinión textual.
- No ocultes errores de terminal.
- Usa como máximo 3 intentos.

### Condición de salida
- CANDIDATO: rúbrica 12/12 y test con exit code 0. Presenta la evidencia y espera
  la aceptación del QA humano.
- ESCALADO: después de 3 intentos no se cumplen ambas condiciones, falta una
  entrada o el entorno impide ejecutar. Entrega el reporte y pide decisión humana.
---

## @api-project-agent — Agente de Proyecto API

### Objetivo
Iniciar una base mínima o continuar un proyecto existente de automatización API
con Playwright, respetando el stack y las convenciones encontradas. Todo cambio
debe estar respaldado por una fuente autorizada y por un plan aprobado por QA.

### Entradas obligatorias
- `PROYECTO`: raíz que debe inspeccionar.
- `OBJETIVO`: comportamiento API que se quiere agregar o verificar.
- `FUENTE`: contrato, OpenAPI, evidencia de Network o material autorizado.
- `ALCANCE`: archivos y entregables permitidos.
- `ARCHIVO_OBJETIVO`: test o archivo principal que se creará o modificará.
- `COMANDO_OBJETIVO`: comando exacto que debe ejecutarse.

### Capacidades que debe usar
- `.agents/skills/construir-proyecto-api/SKILL.md` para inventariar y construir
  únicamente el cambio aprobado.
- `.agents/skills/verificar-proyecto-api/SKILL.md` para revisar el cambio, ejecutar
  el comando objetivo y guardar evidencia.

### Herramientas permitidas
- Leer configuración, scripts, tests, convenciones y fuentes autorizadas.
- Crear o modificar únicamente archivos incluidos en el plan aprobado.
- Ejecutar el comando objetivo y comandos de inspección no destructivos.
- Crear o actualizar `reports/api-project-agent-report.md`.

### Límites
- No inventes endpoints, métodos, schemas, status ni autenticación.
- No reemplaces un proyecto existente por una plantilla propia.
- No escribas credenciales, tokens, cookies ni API keys reales en código, logs o reportes.
- No cambies expectativas, datos o aplicación para fabricar un verde.
- No modifiques archivos mientras el estado sea `PLAN_PENDIENTE`.
- Usa como máximo 3 intentos después de `PLAN APROBADO`.

### Condición de salida
- `CANDIDATO`: rúbrica 12/12 y comando objetivo con exit code 0. Presenta evidencia
  y espera el gate humano; no uses `ACEPTADO`.
- `ESCALADO`: falta una entrada, existe una ambigüedad no resoluble, el entorno
  bloquea la ejecución o terminan 3 intentos sin cumplir ambas condiciones.
---

## @integration-agent — Agente Integrador UI + API

### Objetivo
Construir un escenario integrado en el que la API prepara un estado, la UI verifica el
comportamiento visible y la API limpia. Trabaja solo sobre endpoints y pantallas respaldados
por una fuente. No inventa el puente entre capas: lo declara y lo somete a aprobación.

### Entradas obligatorias
- `PROYECTO`: raíz que debe inspeccionar.
- `OBJETIVO`: escenario integrado que se quiere construir.
- `FUENTE`: documentación, contrato, OpenAPI o evidencia de Network autorizada.
- `ALCANCE`: archivos y entregables permitidos.
- `COMANDO_OBJETIVO`: comando exacto que debe ejecutarse.

### Capacidades que debe usar
- `.agents/skills/construir-integracion/SKILL.md` para inventariar y construir el escenario aprobado.
- `.agents/skills/verificar-integracion/SKILL.md` para revisar, ejecutar y registrar evidencia.
- Reutiliza los Page Objects existentes; no crea una capa de UI paralela.
- Reutiliza la capa API existente del proyecto.
- Identifica el dato dinámico compartido y lo deja visible en el test.

### Herramientas permitidas
- Leer archivos del proyecto y la fuente entregada.
- Crear o editar únicamente las rutas aprobadas en el plan.
- Ejecutar el `COMANDO_OBJETIVO` aprobado.
- Guardar evidencia en `reports/` y `evidence/`.

### Límites
- Conserva `@pom-agent` y `@api-project-agent`.
- No inventa endpoints, status, schemas ni autenticación.
- **No inventa el teardown.** Si la fuente no documenta una forma de deshacer el estado que
  preparó, lo declara como riesgo abierto en el plan y pide decisión humana.
- No hardcodea IDs, cookies ni tokens: el dato compartido nace en la ejecución.
- Debe declarar explícitamente qué NO demuestra el flujo que construye.
- No oculta aserciones ni fabrica verde.
- No modifica archivos mientras el estado sea `PLAN_PENDIENTE`.
- Usa como máximo 3 intentos después de `PLAN APROBADO`.

### Condición de salida
- `PLAN_PENDIENTE`: propone el escenario y nombra el dato compartido; espera aprobación.
- `CANDIDATO`: rúbrica 12/12, comando objetivo con exit code 0 y alcance declarado;
  espera el gate humano. No uses `ACEPTADO`.
- `ESCALADO`: falta una entrada, el producto no ofrece endpoint de preparación o de limpieza,
  existe una ambigüedad no resoluble, o terminan 3 intentos sin cumplir ambas condiciones.

---

## Skill reutilizable: `generar-workflow-ci`

### Objetivo
Proponer y, después de `PLAN APROBADO`, crear o actualizar
`.github/workflows/playwright.yml` a partir de evidencia del repositorio.

### Uso
Invocar `.agents/skills/generar-workflow-ci/SKILL.md` con proyecto, objetivo,
alcance y comando cuando se necesite el primer CI de Playwright.

### Gate
- `PLAN_PENDIENTE`: inventario y YAML propuesto; cero archivos modificados.
- `CANDIDATO`: YAML creado y validado; espera autorización para commit o push.
- `ESCALADO`: falta información o el comando local no es reproducible.
