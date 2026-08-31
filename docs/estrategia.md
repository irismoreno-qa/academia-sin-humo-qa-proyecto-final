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

| REQ | Regla | Técnica de diseño | Clases / valores a cubrir | Oráculo | Riesgo |
|---|---|---|---|---|---|
| **R01** | 4 campos obligatorios | Partición de equivalencia | Cada campo vacío **aislado** (4 casos) + los 4 vacíos a la vez (1) | Ausencia de petición a la API + mensaje visible | Medio |
| **R02** | Nombre entre 2 y 50 caracteres | Valores límite | 1, 2, 50, 51 | Respuesta de la API | **Alto** — el límite superior es donde el cliente suele no validar |
| **R03** | Email con `@` **y** dominio con punto | Partición de equivalencia | Válidos: `a@b.com`, `a@b.co` · Inválidos: `usuario` (sin `@`), `usuario@` (sin dominio), `usuario@dominio` (dominio sin punto) | Respuesta de la API | **Alto** — regla con dos condiciones acopladas; implementar solo una es el error más probable |
| **R04** | Contraseña entre 8 y 64 (inclusive) | Valores límite | 7, 8, 64, 65 | **API obligatorio** | **Crítico** — es el requisito donde ya se observó divergencia UI/API |
| **R05** | Edad entre 16 y 99 (inclusive) | Valores límite | 15, 16, 99, 100 | Respuesta de la API | Alto |
| **R06** | El formulario se limpia tras un registro exitoso | Verificación de post-condición | 1 registro válido → los 4 campos vacíos | UI, **después** de confirmar el éxito real por API | Alto — afecta al siguiente registro |
| **R07** | No se admite un email ya existente | Partición de equivalencia | Email registrado en la misma corrida, reenviado | Respuesta de la API | Alto |

**Total mínimo: 24 casos**, todos con una sola variable bajo prueba.
Dos técnicas de diseño aplicadas y trazadas: **valores límite** (R02, R04, R05) y
**partición de equivalencia** (R01, R03, R07), más una verificación de
post-condición (R06).

**Orden de ejecución:** R01 primero (no necesita datos previos ni llega a la API),
después R02–R05 (una variable cada uno), R06 al final del bloque de camino feliz, y
R07 último porque **depende** de que R06 haya registrado un email real.

---

## 4. Alcance comprometido

### Lo que SÍ entra

1. **Diseño de los 24 casos** de REQ-R01 a R07 con la regla de aislamiento, cada uno
   trazado a su requisito y a su técnica de diseño.
2. **Ejecución manual con evidencia auditable** — captura de Network por caso, según
   la regla de evidencia de la sección 0.
3. **Automatización UI E2E con Page Object** del set completo, afirmando sobre la
   respuesta de `POST /api/register` antes que sobre la pantalla.
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
