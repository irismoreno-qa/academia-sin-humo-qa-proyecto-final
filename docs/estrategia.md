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
| 1 — Oráculo primario | Respuesta real de `POST /api/register`: código de estado + body | Es lo que decide PASA / FALLA |
| 2 — Aserto secundario | Mensaje o estado visible en la UI | Se afirma **además** del nivel 1, nunca en su lugar |
| 3 — No es oráculo | El texto de error de la propia app | No se usa jamás para derivar un resultado esperado |

Esta regla no es teórica. En esta aplicación está confirmado que la pantalla puede
mostrar *"¡Registro exitoso! Tu cuenta ha sido creada."* mientras la API responde
`422`. Por lo tanto:

- Un caso firmado leyendo solo la pantalla es un caso **no verificado**.
- Si un caso no puede citar la respuesta real de la API, no se marca PASA: se marca
  *no verificado* y queda pendiente.
- El nivel 3 está prohibido explícitamente porque es circular: derivar el resultado
  esperado del mensaje que muestra la app equivale a decidir que la app nunca puede
  estar equivocada.

**Excepción declarada:** REQ-R01 espera bloqueo del lado del cliente. En esos casos
el oráculo primario es la **ausencia** de petición en Network, verificable y
auditable igual que un código de estado.

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

---

## 1. Riesgo principal

**Riesgo:** que un aspirante crea que se registró cuando el sistema lo rechazó, o
que entre al sistema con datos que la especificación no admite.

**A quién afecta y cómo:** al aspirante, que pierde el acceso sin saberlo —cree
tener cuenta, no la tiene, y no vuelve a intentar—; y a la academia, que pierde
matrículas de forma silenciosa y acumula registros con datos fuera de rango
(nombres vacíos o de 200 caracteres, emails a los que nunca va a llegar un mail,
edades imposibles).

**Patrón de riesgo concreto:** la especificación describe reglas que se validan en
**dos lugares** —el formulario en el cliente y `POST /api/register` en el servidor—
y no exige que coincidan salvo implícitamente. **Ahí es donde este producto ya
demostró romperse**, y ahí se concentra el diseño de casos.

### Riesgo cuantificado por requisito

El riesgo no es una etiqueta ni una intuición: es el producto de dos dimensiones
puntuadas por separado. **Impacto** (1 despreciable → 5 catastrófico) × **Probabilidad**
(1 raro → 5 casi seguro). La probabilidad se ancla en evidencia observada o en
propiedades estructurales de la regla, nunca en corazonada.

| REQ | Impacto | Por qué ese impacto | Prob. | Por qué esa probabilidad | Score | Banda |
|---|:--:|---|:--:|---|:--:|---|
| **R08** · coherencia UI/API | 5 | Se le informa al aspirante que tiene cuenta cuando no la tiene. Es el único caso en que **no tiene forma de enterarse** de que algo falló: no reintenta, se pierde | 5 | Observado directamente: pantalla de éxito con `422` de la API | **25** | **CRÍTICO** |
| **R03** · formato de email | 4 | Cuenta a la que nunca llega un correo. Irrecuperable sin soporte | 5 | Dos condiciones acopladas (`@` **y** punto en el dominio). Se observó un dominio sin punto aceptado con `201` | **20** | **CRÍTICO** |
| **R06** · limpieza del formulario | 3 | Riesgo de registro duplicado accidental; en una máquina compartida, el siguiente aspirante ve nombre y email del anterior | 5 | Observado fallando de forma repetida, incluso tras registros confirmados genuinos por la API. Las post-condiciones son las reglas que más se omiten | **15** | **CRÍTICO** |
| **R02** · nombre 2–50 | 3 | Nombres de 1 o de 200 caracteres en los registros. Daño de calidad de dato; el nombre se imprime en el certificado | 4 | Dos bordes, doble implementación cliente/servidor, y el borde superior nunca fue verificado | **12** | ALTO |
| **R04** · contraseña 8–64 | 4 | Contraseña rechazada con pantalla de éxito: el estudiante no puede entrar y no sabe por qué. Pérdida silenciosa de acceso | 3 | Dos bordes y doble implementación, pero la observación disponible indica que el servidor **sí** aplicó el límite. Lo que falló fue el reporte, y eso pertenece a R08 | **12** | ALTO |
| **R05** · edad 16–99 | 4 | Menores registrados en la academia. Tiene arista legal | 3 | Dos bordes, doble implementación, campo numérico estándar. Sin señal adversa observada | **12** | ALTO |
| **R07** · email duplicado | 4 | Cuentas duplicadas rompen la identidad: dos estudiantes con un email, y el sistema no los distingue para login, progreso ni certificados | 2 | Condición única. La unicidad suele aplicarse con restricción en base de datos. Se observó funcionando | **8** | MEDIO |
| **R01** · campos obligatorios | 2 | El aspirante ve el error y reintenta | 2 | Una condición por campo (no vacío), la validación más estándar que existe, y bloquea del lado del cliente | **4** | BAJO |

Bandas: **CRÍTICO** 15–25 · **ALTO** 10–14 · **MEDIO** 5–9 · **BAJO** 1–4

### Cobertura frente a riesgo: una desproporción aceptada

Cruzar el score contra la cantidad de casos asignados muestra que, en los extremos,
la distribución no es proporcional al riesgo:

| REQ | Score | Casos | |
|---|:--:|:--:|---|
| R08 | 25 | 2 | el riesgo más alto, la menor cobertura |
| R03 | 20 | 5 | proporcional |
| R06 | 15 | 3 | proporcional |
| R02 · R04 · R05 | 12 | 4 c/u | proporcional |
| R07 | 8 | 3 | proporcional |
| R01 | 4 | 7 | el riesgo más bajo, la mayor cobertura |

Se acepta la desproporción, con motivo en cada extremo:

- **R01 con 7 casos.** El riesgo es bajo pero el costo también: no llegan a la API,
  no consumen emails y corren de inmediato. La regla de aislamiento exige un caso por
  campo, y quitarlos ahorraría minutos sin reducir riesgo real.
- **R08 con 2 casos.** Sus dos casos cubren las dos direcciones de la regla —la API
  rechaza y la pantalla no miente; la API acepta y la pantalla lo informa— y no
  requieren ejecuciones adicionales: se observan durante `TC-R04-004` y `TC-R01-006`.
  La regla queda cubierta en su lógica completa, no por volumen.

Queda declarado como decisión y no como accidente: sin puntuar el riesgo, esta
desproporción no se ve.

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
| Login básico (`REQ-L01, L02, L04`) | Bajo — ya cubierto por `tests/login.spec.ts` del curso | — |

---

## 3. Análisis de los requisitos en alcance

La columna de riesgo toma su valor de la matriz cuantificada de la sección 1; el
razonamiento de cada puntuación vive allí y no se repite acá.

| REQ | Regla | Técnica de diseño | Clases / valores a cubrir | Oráculo | Riesgo |
|---|---|---|---|---|---|
| **R01** | 4 campos obligatorios | Partición de equivalencia | Cada campo vacío **aislado** (4 casos) + los 4 vacíos a la vez (1) | Ausencia de petición a la API + mensaje visible | BAJO · 4 |
| **R02** | Nombre entre 2 y 50 caracteres | Valores límite | 1, 2, 50, 51 | Respuesta de la API | ALTO · 12 |
| **R03** | Email con `@` **y** dominio con punto | Partición de equivalencia | Válidos: `a@b.com`, `a@b.co` · Inválidos: `usuario` (sin `@`), `usuario@` (sin dominio), `usuario@dominio` (dominio sin punto) | Respuesta de la API | **CRÍTICO · 20** |
| **R04** | Contraseña entre 8 y 64 (inclusive) | Valores límite | 7, 8, 64, 65 | **API obligatorio** | ALTO · 12 |
| **R05** | Edad entre 16 y 99 (inclusive) | Valores límite | 15, 16, 99, 100 | Respuesta de la API | ALTO · 12 |
| **R06** | El formulario se limpia tras un registro exitoso | Verificación de post-condición | 1 registro válido → los 4 campos vacíos, y sin arrastre entre dos registros consecutivos | UI, **después** de confirmar el éxito real por API | **CRÍTICO · 15** |
| **R07** | No se admite un email ya existente | Partición de equivalencia | Email registrado en la misma corrida, reenviado | Respuesta de la API | MEDIO · 8 |
| **R08** *(derivado)* | El resultado informado en pantalla coincide con el resultado real del registro | Consistencia entre capas | Un rechazo de la API y una aceptación de la API, comparando ambas contra lo que muestra la pantalla | Respuesta de la API **contra** mensaje visible | **CRÍTICO · 25** |

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
4. **Suite corriendo en CI**, ampliando el smoke actual de `tests/ci/`.
5. **Reporte de bugs** con los hallazgos reales, cada uno con su evidencia.

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
- Que el backend valide **exactamente** lo mismo que el frontend en todos los
  campos: se verifica la respuesta real de la API por caso, lo que detecta la
  divergencia cuando aparece, pero no se audita el código de validación.
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

## Nota de trazabilidad

REQ-R03 leído desde `/documentacion` dice: *"El email debe tener formato válido:
debe contener un `@` seguido de un dominio con punto (ejemplo:
`usuario@dominio.com`)"*. La versión de trabajo agrega: *"Emails como `usuario@` o
`usuario` no son válidos"*. Ambas redacciones coinciden en la regla operativa —se
exige `@` **y** un punto en el dominio— y los casos se diseñan sobre esa regla.
