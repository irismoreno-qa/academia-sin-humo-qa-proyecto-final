# Estrategia de pruebas — Registro de estudiantes

**Producto:** Academia sin Humo — `https://playground.calidadsinhumo.com`
**Alcance del proyecto final:** el flujo de **Registro de estudiantes** (`/registro`),
requisitos REQ-R01 a REQ-R07.

---

## 0. Fuente de verdad y reglas de método

**Fuente de verdad:** la especificación funcional publicada en `/documentacion`,
sección 1. El resultado esperado de cada caso se deriva de la especificación,
**nunca de lo que la aplicación hace o dice**.

### Regla de oráculo

| Nivel | Fuente | Uso |
|---|---|---|
| 1 — Oráculo primario | **Si la cuenta se creó o no**: el código de estado de `POST /api/register`, o la **ausencia** de petición cuando el cliente bloquea | Es lo que decide PASA / FALLA |
| 2 — Aserto secundario | Mensaje o estado visible en la UI | Se afirma **además** del nivel 1, nunca en su lugar |
| 3 — No es oráculo | El texto de error de la propia app | No se usa jamás para derivar un resultado esperado |

Esta regla no es teórica, y la evidencia de `evidence/` la sostiene por un motivo
más grave que el que se suponía al escribirla por primera vez:

> **Cliente y servidor implementan la misma validación, y comparten exactamente los
> mismos dos huecos.** El formulario bloquea nueve de once estados sin emitir
> petición. Llamada directamente, `POST /api/register` rechaza esas mismas reglas con
> `422` y **con los mensajes de error idénticos**. Pero las dos reglas que el cliente
> no implementa —el tope de 64 caracteres de la contraseña y la estructura del
> dominio del email— el servidor tampoco las aplica: las acepta con `201`.

No falta una capa de defensa: **la segunda capa existe y tiene el mismo agujero que
la primera.** Que las dos fallen en los mismos dos puntos, con los mismos mensajes en
el resto, apunta a una definición de validación compartida a la que le faltan esas
dos condiciones — no a un olvido en el backend.

Consecuencia directa: que la pantalla rechace una entrada no prueba por sí solo que el
servidor haga lo mismo, y que la pantalla no muestre un error no significa que la
cuenta no se haya creado. Por lo tanto:

- Un caso firmado leyendo solo la pantalla es un caso **no verificado**.
- El oráculo de nivel 1 es **si la cuenta se creó o no**, evidenciado por el código
  de estado de `POST /api/register` o por la **ausencia** de petición. Las dos
  lecturas son verificables y auditables; una suposición no lo es.
- El nivel 3 está prohibido explícitamente porque es circular: derivar el resultado
  esperado del mensaje que muestra la app equivale a decidir que la app nunca puede
  estar equivocada.

**Bloqueo del lado del cliente.** No es una excepción de REQ-R01: es el
comportamiento observado en REQ-R01 a R05. Cuando el cliente bloquea, el oráculo es
la ausencia de petición — y el caso queda declarado como **verificado únicamente en
la capa de cliente**. Que el servidor aplique esa misma regla no queda demostrado,
y con la evidencia disponible hay motivos para dudar de que lo haga.

### Regla de aislamiento de variable

Cada caso varía **una sola** variable; el resto de los campos van en valores válidos
centrales. Un caso con dos o más campos inválidos a la vez no puede atribuir el
rechazo y por lo tanto no valida ningún requisito. Los casos combinados se diseñan
**después** de haber cubierto cada variable por separado, y se declaran como tales.

### Regla de evidencia

La evidencia la produce quien firma el caso, con su propio navegador y con la
interacción real de usuario. Se adjunta captura de la pestaña Network o export HAR.
No se aceptan resultados obtenidos disparando eventos de forma sintética ni
ejecutados por una herramienta que no deje rastro auditable.

### Regla de preservación del fallo

> **Nunca se modifica la expectativa de un test solo para que pase.** Si el
> comportamiento observado contradice el requisito, se preserva el fallo, se
> documenta el hallazgo y se hace análisis de causa raíz antes de tocar el test.

Es la regla de oráculo aplicada a la fase de automatización. En el diseño se prohíbe
que el mensaje de la aplicación defina el resultado esperado; en la automatización se
prohíbe que **el fallo** lo defina. Son la misma prohibición: el sistema bajo prueba
no puede ser, en ningún momento, la fuente de su propio criterio de aprobación.

**Ninguna causa se supone.** Un test en rojo puede ser un defecto de la aplicación,
de la automatización, de los datos de prueba, del ambiente o del requisito. Se
evalúan las cinco y se clasifica sobre evidencia; **no hay clasificación por
defecto**. Suponer que todo fallo es un defecto del producto infla el reporte y quema
la credibilidad de quien lo firma; suponer que todo fallo es culpa del test convierte
defectos reales en falsos verdes. Son la misma pereza en direcciones opuestas.

La protección contra el falso verde no vive en sesgar el juicio, sino en separarlo de
la acción: **ningún test se modifica sin autorización humana, sea cual sea la
clasificación.**

El procedimiento operativo está en
[`docs/qa/workflow-hallazgos.md`](qa/workflow-hallazgos.md) y la skill que lo aplica
en [`.agents/skills/analizar-fallo/`](../.agents/skills/analizar-fallo/SKILL.md).

---

## 1. Riesgo principal

**Riesgo:** que un aspirante crea que se registró cuando el sistema lo rechazó, o
que entre al sistema con datos que la especificación no admite.

**A quién afecta y cómo:** al aspirante, que pierde el acceso sin saberlo —cree
tener cuenta, no la tiene, y no vuelve a intentar—; y a la academia, que pierde
matrículas de forma silenciosa y acumula registros con datos fuera de rango
(nombres vacíos o de 200 caracteres, emails a los que nunca va a llegar un mail,
edades imposibles).

**Patrón de riesgo concreto, confirmado en las dos capas:** la validación existe en
el cliente **y** en el servidor, con los mismos mensajes. Lo que falla no es una capa
ausente, sino **una regla incompleta replicada fielmente en ambas**.

De las dos reglas de dos condiciones, solo se implementó una condición de cada una:

| Requisito | Condición implementada | Condición faltante |
|---|---|---|
| REQ-R04 · contraseña 8–64 | Mínimo de 8 → `422` en ambas capas | **Máximo de 64** → `201` en ambas |
| REQ-R03 · `@` y dominio con punto | Presencia de `@` → `422` en ambas capas | **Dominio con punto** → `201` en ambas |

Esa es la superficie real de riesgo, y es más estrecha y más precisa de lo que
parecía: no hay que desconfiar de toda la validación, hay que desconfiar de **las
reglas compuestas**, donde se implementó la primera condición y se olvidó la
segunda. REQ-R05, con dos bordes numéricos, sí está completa en las dos capas — lo
que descarta que sea un problema general de reglas con rango.

### Riesgo cuantificado por requisito

El riesgo no es una etiqueta ni una intuición: es el producto de dos dimensiones
puntuadas por separado. **Impacto** (1 despreciable → 5 catastrófico) × **Probabilidad**
(1 raro → 5 casi seguro). La probabilidad se ancla en evidencia observada o en
propiedades estructurales de la regla, nunca en corazonada.

| REQ | Impacto | Por qué ese impacto | Prob. | Por qué esa probabilidad | Score | Banda |
|---|:--:|---|:--:|---|:--:|---|
| **R04** · contraseña 8–64 | 4 | Contraseña fuera de rango aceptada sin aviso. El estudiante queda con una credencial que la spec no admite, y la academia con datos que declaró inválidos | 5 | **Defecto confirmado.** Una contraseña de 65 caracteres se registró con `201`; la spec exige rechazarla de forma explícita | **20** | **CRÍTICO** |
| **R03** · formato de email | 4 | Cuenta a la que nunca llega un correo. Irrecuperable sin soporte | 5 | **Defecto confirmado.** `irismoreno@gmail` se registró con `201`. La regla tiene dos condiciones y solo se implementó la del `@` | **20** | **CRÍTICO** |
| **R06** · limpieza del formulario | 3 | Riesgo de registro duplicado accidental; en una máquina compartida, el siguiente aspirante ve nombre y email del anterior | 5 | **Defecto confirmado.** Tras un `201`, los cuatro campos conservan sus valores | **15** | **CRÍTICO** |
| **R08** · coherencia UI/API | 5 | Se le informaría al aspirante que tiene cuenta cuando no la tiene: el único caso en que **no tiene forma de enterarse** de que algo falló | 2 | **Sin divergencia observada** en los once estados capturados: UI y API coinciden siempre. El riesgo es estructural, no observado | **10** | ALTO |
| **R05** · edad 16–99 | 4 | Menores registrados en la academia. Tiene arista legal | 2 | Los cuatro valores límite se comportan según la spec. Bloqueo de cliente en 15 y en 100 | **8** | MEDIO |
| **R07** · email duplicado | 4 | Cuentas duplicadas rompen la identidad: dos estudiantes con un email, y el sistema no los distingue para login, progreso ni certificados | 2 | Verificado funcionando: el reintento devuelve `422` y el mensaje correcto | **8** | MEDIO |
| **R02** · nombre 2–50 | 3 | Nombres de 1 o de 200 caracteres en los registros. Daño de calidad de dato; el nombre se imprime en el certificado | 2 | Ambos bordes verificados: 1 y 51 caracteres se bloquean en el cliente con el mensaje correcto | **6** | MEDIO |
| **R01** · campos obligatorios | 2 | El aspirante ve el error y reintenta | 2 | Verificado funcionando: los cuatro campos vacíos producen sus cuatro mensajes y ninguna petición | **4** | BAJO |

Bandas: **CRÍTICO** 15–25 · **ALTO** 10–14 · **MEDIO** 5–9 · **BAJO** 1–4

**Caveat que atraviesa toda la tabla.** Las probabilidades de R01, R02 y R05 bajaron
porque el cliente bloquea correctamente. Eso demuestra que la regla se aplica **en la
capa de cliente**, no que se aplique en el servidor: nunca se emitió la petición que
lo probaría. Y dado que R03 y R04 demuestran que el servidor no valida lo que el
cliente deja pasar, **hay motivos concretos para sospechar que tampoco validaría
esto**. Verificarlo exige atacar `POST /api/register` directamente, que es trabajo de
capa API y no de esta suite. Queda declarado en la sección 5.

### Cobertura frente a riesgo: una desproporción aceptada

Cruzar el score contra la cantidad de casos asignados muestra que, en los extremos,
la distribución no es proporcional al riesgo:

| REQ | Score | Casos | |
|---|:--:|:--:|---|
| R04 | 20 | 4 | proporcional — defecto confirmado |
| R03 | 20 | 5 | proporcional — defecto confirmado |
| R06 | 15 | 3 | proporcional — defecto confirmado |
| R08 | 10 | 2 | proporcional |
| R05 | 8 | 4 | levemente alta |
| R07 | 8 | 3 | proporcional |
| R02 | 6 | 4 | levemente alta |
| R01 | 4 | 7 | **el riesgo más bajo, la mayor cobertura** |

Los tres requisitos críticos concentran 12 de los 32 casos, y los tres tienen defecto
confirmado. La distribución quedó alineada con el riesgo, con una sola excepción que
se acepta con motivo:

- **R01 con 7 casos sobre un riesgo de 4.** El riesgo es bajo pero el costo también:
  no llegan a la API, no consumen emails y corren de inmediato. La regla de
  aislamiento exige un caso por campo, y quitarlos ahorraría minutos sin reducir
  riesgo real.

**R02 y R05 quedan levemente sobrecubiertos a propósito.** Sus scores bajaron porque
el cliente los bloquea bien, pero esa verificación no alcanza al servidor. Mantener
los cuatro valores límite deja el set listo para reejecutarse contra la API el día
que se pruebe esa capa, sin rediseñar nada.

Queda declarado como decisión y no como accidente: sin puntuar el riesgo, esta
distribución no se ve.

---

## 2. Contexto del producto: lo que queda fuera del proyecto

La especificación tiene 9 secciones y 36 requisitos. El proyecto final cubre solo
la sección 1. Dejo registrado el resto para que quede claro qué **no** está probado
y cuál sería el orden de ampliación si el alcance creciera:

| Sección | Riesgo si falla | Prioridad de ampliación |
|---|---|---|
| Inscripción y API (`REQ-C01–C06`, `REQ-A01–A03`) | Alto — REQ-A03 define el contrato completo de códigos y REQ-C06 exige paridad UI/API | **1ª** — resultados esperados ya escritos en la spec, máximo valor por esfuerzo |
| Progreso del estudiante (`REQ-P01–P05`) | Alto — máquina de 5 estados; REQ-P04 (certificado no duplicado) es un imán de bugs de idempotencia | 2ª |
| Bloqueo por intentos fallidos (`REQ-L03`) | Alto — única regla dependiente del tiempo de toda la spec | 3ª |
| Sesión y autenticación (`REQ-S01–S02`) | Medio-Alto — si la guarda falla, se filtra contenido privado | 4ª |
| Reserva de fecha (`REQ-D01–D03`) | Medio — límites de fecha explícitos y baratos de probar | 5ª |
| Subida de CV (`REQ-U01–U03`) | Medio — única superficie de seguridad de archivos | 6ª |
| Listado paginado (`REQ-N01–N03`) | Bajo | 7ª |
| Login básico (`REQ-L01, L02, L04`) | Bajo — validación simple, sin hallazgos esperables | — |

---

## 3. Análisis de los requisitos en alcance

La columna de riesgo toma su valor de la matriz cuantificada de la sección 1; el
razonamiento de cada puntuación vive allí y no se repite acá.

| REQ | Regla | Técnica de diseño | Clases / valores a cubrir | Oráculo | Riesgo |
|---|---|---|---|---|---|
| **R01** | 4 campos obligatorios | Partición de equivalencia | Cada campo vacío **aislado** (4 casos) + los 4 vacíos a la vez (1) | Ausencia de petición a la API + mensaje visible | BAJO · 4 |
| **R02** | Nombre entre 2 y 50 caracteres | Valores límite | 1, 2, 50, 51 | Respuesta de la API | MEDIO · 6 |
| **R03** | Email con `@` **y** dominio con punto | Partición de equivalencia | Válidos: `a@b.com`, `a@b.co` · Inválidos: `usuario` (sin `@`), `usuario@` (sin dominio), `usuario@dominio` (dominio sin punto) | Respuesta de la API | **CRÍTICO · 20** |
| **R04** | Contraseña entre 8 y 64 (inclusive) | Valores límite | 7, 8, 64, 65 | **API obligatorio** | **CRÍTICO · 20** |
| **R05** | Edad entre 16 y 99 (inclusive) | Valores límite | 15, 16, 99, 100 | Respuesta de la API | MEDIO · 8 |
| **R06** | El formulario se limpia tras un registro exitoso | Verificación de post-condición | 1 registro válido → los 4 campos vacíos, y sin arrastre entre dos registros consecutivos | UI, **después** de confirmar el éxito real por API | **CRÍTICO · 15** |
| **R07** | No se admite un email ya existente | Partición de equivalencia | Email registrado en la misma corrida, reenviado | Respuesta de la API | MEDIO · 8 |
| **R08** *(derivado)* | El resultado informado en pantalla coincide con el resultado real del registro | Consistencia entre capas | Un rechazo de la API y una aceptación de la API, comparando ambas contra lo que muestra la pantalla | Respuesta de la API **contra** mensaje visible | ALTO · 10 |

**Total mínimo: 24 casos**, todos con una sola variable bajo prueba.
Dos técnicas de diseño aplicadas y trazadas: **valores límite** (R02, R04, R05) y
**partición de equivalencia** (R01, R03, R07), más una verificación de
post-condición (R06) y una de consistencia entre capas (R08).

**Diseño final: 32 casos** sobre 8 requisitos, en [`docs/qa/`](qa/test-plan.md). Los
8 que superan el mínimo son controles positivos —los bordes válidos y los caminos
felices, sin los cuales una validación excesivamente estricta se leería como
cumplimiento—, los dos casos de REQ-R08 y dos ambigüedades de especificación que se
documentan como preguntas abiertas, no como defectos.

**Orden de ejecución:** R01 primero (no necesita datos previos ni llega a la API),
después R02–R05 (una variable cada uno), R06 al final del bloque de camino feliz, y
R07 último porque **depende** de que R06 haya registrado un email real. R08 se
observa durante los casos de R01 y R04, sin ejecuciones adicionales.

---

## 4. Alcance comprometido

### Lo que SÍ entra

1. **Diseño de los casos** de REQ-R01 a R08 con la regla de aislamiento, cada uno
   trazado a su requisito y a su técnica de diseño. Producido con el sistema de
   5 estaciones en [`docs/qa/`](qa/): contexto, requerimientos, casos, escenarios
   BDD, plan de prueba y matriz de trazabilidad.
2. **Ejecución manual con evidencia auditable** — captura de Network por caso, según
   la regla de evidencia de la sección 0.
3. **Automatización UI E2E con Page Object de 30 de los 32 casos**, afirmando sobre
   la respuesta de `POST /api/register` antes que sobre la pantalla.

   Se excluyen `TC-R01-007` y `TC-R07-003`, los dos casos indeterminados por
   especificación. Un test automatizado necesita un resultado esperado contra el
   cual afirmar, y estos dos no lo tienen: la especificación no define si un campo
   con solo espacios cuenta como vacío, ni si la comparación de emails distingue
   mayúsculas. Entran a la automatización recién cuando el responsable del producto
   defina la regla.

   El compromiso dice **30 y no "los que se pueda"** a propósito: un criterio de
   salida que admite excepciones sin nombrarlas nunca se puede incumplir, y por lo
   tanto nunca se puede verificar.
4. **Suite de API contra `POST /api/register`** — 11 tests llamando al endpoint sin
   pasar por el formulario, para verificar si el servidor aplica las reglas que el
   cliente bloquea.

   **Desviación declarada.** La consigna prescribe `POST /api/enroll` para esta capa.
   Se eligió `/api/register` porque cerraba la limitación más grande que esta misma
   estrategia declaraba por escrito: cuando el formulario impide el envío, la petición
   que probaría al servidor nunca se emite. Ir a `/api/enroll` habría agregado un flujo
   nuevo dejando abierto el hueco más grande del flujo elegido. El dominio de
   inscripción se cubre igual, en el flujo integrado.

   Los tests se priorizaron con la matriz de decisión (frecuencia × estabilidad ×
   valor × mantenimiento). Siete de los once **descubren** —son la única forma de
   saber si el servidor valida— y cuatro **confirman** lo ya visto por UI.
5. **Suite corriendo en CI**, ampliando el smoke actual de `tests/ci/`.
6. **Reporte de bugs** con los hallazgos reales, cada uno con su evidencia.

### Lo que NO entra, y por qué

- **Las otras 8 secciones de la especificación:** fuera del alcance del proyecto
  final (ver sección 2).
- **Pruebas de API puras contra `POST /api/register`:** la API se usa como oráculo
  del flujo de UI, no se prueba su contrato de forma independiente. Es una
  ampliación natural, no parte del mínimo.
- **Seguridad del registro** (inyección, XSS en el campo nombre, enumeración de
  usuarios por el mensaje de email duplicado): fuera del mínimo funcional.
- **Accesibilidad con axe-core:** anexo opcional de la consigna; no se descarta,
  pero no está comprometido.

---

## 5. Lo que estas pruebas NO van a demostrar

- Que el resto del producto (login, catálogo, inscripción, progreso, reservas,
  listado, CV) esté libre de bugs: **no fue probado**.
- Que el registro se comporte igual bajo concurrencia — dos personas registrando el
  mismo email al mismo tiempo no se prueba.
- **Que la API rechace entradas que la especificación no contempla.** Los casos de
  robustez —cuerpo vacío, JSON malformado, edad no numérica— quedaron fuera del
  mínimo a propósito: la especificación no define qué debe responder la API en esos
  casos, así que su resultado esperado saldría de una convención de industria y no de
  la fuente de verdad. Se descartan por la misma razón que los dos casos
  indeterminados, no por falta de tiempo.
- **Que los datos registrados persistan.** La verificación termina en la respuesta de
  `POST /api/register`. Que el `201` se traduzca en una fila en una base no se prueba.
- Que los datos registrados se persistan correctamente ni que el email llegue a
  destino: la prueba termina en la respuesta de `POST /api/register`.
- Que el formulario de registro cumpla WCAG.

---

## 6. Riesgos de esta estrategia

- **Dependencia de datos:** cada registro exitoso consume un email, y REQ-R07
  necesita uno ya usado. Si los emails no se generan únicos por corrida, la suite
  pasa la primera vez y falla la segunda. Se resuelve en la automatización con
  emails únicos por ejecución.
- **Acoplamiento R06 → R07:** R07 depende del email que registró R06. Es una
  dependencia de orden real y queda declarada, no escondida.
- **Entorno compartido y sin control:** todo se prueba contra
  `https://playground.calidadsinhumo.com`, cuyo estado inicial puede haber sido
  modificado por otra persona. Un resultado inesperado puede venir de datos ajenos.
- **Sin acceso a los datos registrados:** no hay forma de consultar si un usuario
  quedó realmente creado más allá de lo que devuelve la API. La verificación termina
  en la respuesta, no en la base.

---

## Nota de corrección — 2026-09-01

Esta estrategia se escribió **antes** de tener evidencia de ejecución, y la primera
captura la contradijo en un punto central. Queda registrado porque la corrección
importa tanto como el documento.

**Lo que afirmaba:** que estaba *confirmado* que la pantalla podía mostrar
"¡Registro exitoso!" mientras la API respondía `422`. Esa afirmación venía de un
documento de casos anterior cuya evidencia resultó no auditable, y se arrastró como
si fuera un hecho establecido.

**Lo que muestra la evidencia:** en los once estados capturados, UI y API **coinciden
siempre**. La divergencia nunca se observó. El defecto real es distinto y más grave:
la validación vive solo en el cliente, y las dos reglas que el cliente no implementa
no las aplica nadie.

**Qué cambió como consecuencia:**

| Elemento | Antes | Ahora |
|---|---|---|
| Justificación de la regla de oráculo | Divergencia UI/API observada | Validación únicamente en cliente, servidor permisivo |
| Oráculo de nivel 1 | La respuesta de la API | Si la cuenta se creó: código de estado **o** ausencia de petición |
| R08 · coherencia UI/API | CRÍTICO · 25 (probabilidad 5, "observado") | ALTO · 10 (probabilidad 2, sin divergencia observada) |
| R04 · contraseña | ALTO · 12 | **CRÍTICO · 20** — defecto confirmado |
| R03 · email | CRÍTICO · 20 (por acoplamiento) | **CRÍTICO · 20** — defecto confirmado |
| R02 y R05 | ALTO · 12 | MEDIO · 6 y 8 — ambos bordes verificados en cliente |

La bibliografía de riesgo lo advierte: *un modelo creado una vez y nunca actualizado
produce falsa confianza*. Pasó exactamente eso con este modelo, y por eso la
reevaluación al cerrar cada fase de ejecución no es opcional.

**Evidencia:** `evidence/` — un archivo HTML por estado más `_resumen.json` con el
código de estado de cada uno. Reproducible con `node tools/capturar-evidencia.js evidence`.

---

## Nota de trazabilidad

REQ-R03 leído desde `/documentacion` dice: *"El email debe tener formato válido:
debe contener un `@` seguido de un dominio con punto (ejemplo:
`usuario@dominio.com`)"*. La versión de trabajo agrega: *"Emails como `usuario@` o
`usuario` no son válidos"*. Ambas redacciones coinciden en la regla operativa —se
exige `@` **y** un punto en el dominio— y los casos se diseñan sobre esa regla.
