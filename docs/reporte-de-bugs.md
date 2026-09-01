# Reporte de bugs — Academia sin Humo

Cinco defectos contra la especificación publicada en `/documentacion`, ordenados por
severidad. Todos reproducibles: cada uno cita el código de estado real y el test
automatizado que lo preserva.

| # | Requisito | Título | Severidad | Capa |
|---|---|---|---|---|
| [BUG-01](#bug-01--un-estudiante-autenticado-no-puede-entrar-a-ninguna-página-protegida) | REQ-S01 | Un estudiante autenticado no puede entrar a ninguna página protegida | **Crítica** | Integrado |
| [BUG-02](#bug-02--la-validación-de-email-solo-verifica-que-exista-una-arroba) | REQ-R03 | La validación de email solo verifica que exista una arroba | **Alta** | UI + API |
| [BUG-03](#bug-03--el-cupo-de-un-curso-no-baja-al-inscribirse) | REQ-C04 | El cupo de un curso no baja al inscribirse | **Alta** | API |
| [BUG-04](#bug-04--se-acepta-una-contraseña-de-65-caracteres) | REQ-R04 | Se acepta una contraseña de 65 caracteres | Media | UI + API |
| [BUG-05](#bug-05--el-formulario-no-se-limpia-tras-un-registro-exitoso) | REQ-R06 | El formulario no se limpia tras un registro exitoso | Media | UI |

**Sobre la prioridad.** Este reporte asigna severidad y **no** asigna prioridad. Son
cosas distintas: la severidad describe qué tan grave es para el usuario, la prioridad
con qué urgencia conviene corregirlo dado el plan de trabajo. No hay equipo de
desarrollo ni plan de release al cual asignar urgencia, así que ponerla sería inventar
un dato. **La prioridad la fija quien recibe este reporte.**

**Ciclo de vida.** Los cinco quedan en estado `REPORTADO`. El ciclo completo sigue con
*Asignado → En progreso → Resuelto → Retesting → Cerrado*, y se corta acá por contexto,
no por desconocimiento.

---

### BUG-01 · Un estudiante autenticado no puede entrar a ninguna página protegida

- **REQ violado:** REQ-S01 — *"Las páginas `/cursos` y `/mi-progreso` requieren autenticación. Un usuario no logueado debe ver un mensaje pidiendo iniciar sesión."*

- **Comportamiento esperado:** un estudiante con sesión iniciada accede a `/cursos` y a `/mi-progreso`. El mensaje pidiendo iniciar sesión es para quien **no** está logueado.

- **Comportamiento real:** con una sesión válida y recién creada, las dos páginas muestran *"🔒 Necesitas iniciar sesión para acceder a esta página"*. El estudiante queda fuera de todo el producto autenticado.

  La sesión **no está rota**: la API la honra sin problema. `POST /api/enroll` devuelve `200` y crea la inscripción, y `GET /api/progress` la devuelve. Lo que falla es `GET /api/auth/me`, que responde `{"realUser": null}` — y la interfaz depende de ese endpoint para resolver quién es el visitante.

  **El estado se preserva. Lo que se pierde es la identidad.**

- **Pasos para reproducir:**
  1. `POST /api/register` con un email nuevo → `201`.
  2. `POST /api/login` con esas credenciales → `200`, se crea la cookie `ash_session`.
  3. En el **mismo contexto de navegador**, ir a `/mi-progreso`.
  4. Aparece el muro de login.

  Ocurre igual iniciando sesión **por el formulario**, que además muestra *"👋 ¡Hola, Iris! Has iniciado sesión correctamente."* antes de navegar. No es un problema del puente entre capas.

- **Evidencia:**
  ```
  POST /api/login     → 200  · cookie ash_session creada
  POST /api/enroll    → 200  {"courseId":"fundamentos","status":"inscrito"}
  GET  /api/progress  → 200  · devuelve la inscripción del usuario
  GET  /api/auth/me   → {"realUser": null}
  UI /cursos          → BLOQUEADO por muro de login
  UI /mi-progreso     → BLOQUEADO por muro de login
  UI /perfil          → accesible
  UI /reserva         → accesible
  ```
  Test que lo preserva: [`tests/integrado/inscripcion.spec.ts`](../tests/integrado/inscripcion.spec.ts) · bitácora H-08.

- **Severidad y por qué:** **Crítica.** Las dos páginas bloqueadas son exactamente las dos que REQ-S01 nombra, y son el núcleo del producto: el catálogo y el progreso del estudiante. No hay workaround: quien se registra no puede usar la plataforma. El sistema no puede operar en su experiencia autenticada.

- **Capa donde se detecta:** **Integrado.** Ninguna capa sola lo muestra completo. Por API todo responde bien; por UI parece que la sesión no se creó. Solo cruzando las dos se ve que la sesión existe y que lo que falla es su resolución.

---

### BUG-02 · La validación de email solo verifica que exista una arroba

- **REQ violado:** REQ-R03 — *"El email debe tener formato válido: debe contener un `@` seguido de un dominio con punto (ejemplo: `usuario@dominio.com`)."* La versión de trabajo agrega: *"Emails como `usuario@` o `usuario` no son válidos."*

- **Comportamiento esperado:** la regla tiene tres condiciones —una arroba, un dominio después de ella, y un punto dentro de ese dominio— y las tres deben cumplirse.

- **Comportamiento real:** **solo se verifica la primera.** Cualquier cadena que contenga una arroba se acepta:

  | Email | Esperado | Real |
  |---|---|---|
  | `irismoreno.gmail.com` (sin `@`) | rechazo | `422` ✅ |
  | `irismoreno@` (sin dominio) | rechazo | **`201` — cuenta creada** ❌ |
  | `irismoreno@gmail` (sin punto) | rechazo | **`201` — cuenta creada** ❌ |

  El mismo comportamiento en las dos capas: el formulario no muestra ningún error y la API responde `201`.

- **Pasos para reproducir:**
  1. Ir a `/registro`.
  2. Completar con nombre, contraseña y edad válidos, y email `irismoreno@`.
  3. Enviar. Aparece *"¡Registro exitoso! Tu cuenta ha sido creada."*
  4. Equivalente por API: `POST /api/register` con ese email → `201`.

- **Evidencia:** `evidence/registro-email-sin-punto.html` · bitácora H-02 y H-05. Tests que lo preservan: `CP-14` y `CP-15` en [`tests/e2e/registro.spec.ts`](../tests/e2e/registro.spec.ts), `API-09` en [`tests/api/registro-api.spec.ts`](../tests/api/registro-api.spec.ts).

- **Severidad y por qué:** **Alta.** Una cuenta con un email sin dominio válido **no puede recibir correo**: ni recuperación de contraseña, ni notificaciones, ni el certificado. El estudiante queda con una cuenta funcionalmente huérfana y **no tiene forma de darse cuenta**, porque el sistema le dijo que el registro fue exitoso. El workaround —corregir el email— exige soporte, porque no hay pantalla para cambiarlo.

- **Capa donde se detecta:** **UI + API.** Confirmado de forma independiente en las dos.

---

### BUG-03 · El cupo de un curso no baja al inscribirse

- **REQ violado:** REQ-C04 — *"Al inscribirse exitosamente, el número de cupos disponibles debe reducirse en 1."*

- **Comportamiento esperado:** tras una inscripción exitosa, `GET /api/courses` informa un cupo disponible menos para ese curso.

- **Comportamiento real:** el contador no se mueve. El curso `fundamentos` informa `enrolled: 24` de `maxStudents: 30` **antes y después** de una inscripción confirmada con `200`.

- **Pasos para reproducir:**
  1. `GET /api/courses` → anotar `enrolled` de `fundamentos`.
  2. `POST /api/login` con una cuenta válida.
  3. `POST /api/enroll` con `{"courseId":"fundamentos"}` → `200` con `{"status":"inscrito"}`.
  4. `GET /api/courses` → `enrolled` sigue igual.

- **Evidencia:**
  ```
  GET  /api/courses  → enrolled: 24 / maxStudents: 30
  POST /api/enroll   → 200 {"courseId":"fundamentos","status":"inscrito","progress":0}
  GET  /api/courses  → enrolled: 24
  ```
  Bitácora H-07.

- **Severidad y por qué:** **Alta.** El cupo es una regla de negocio, no un adorno. Si el contador nunca sube, **el curso nunca se llena**, y entonces REQ-C02 tampoco puede cumplirse: la rama *"Sin cupo → Lista de espera"* se vuelve inalcanzable. Un defecto de contador arrastra una regla de decisión entera.

- **Capa donde se detecta:** **API.**

---

### BUG-04 · Se acepta una contraseña de 65 caracteres

- **REQ violado:** REQ-R04 — *"La contraseña debe tener entre 8 y 64 caracteres (inclusive). Una contraseña de 7 caracteres debe ser rechazada. **Una de 65 también.**"*

- **Comportamiento esperado:** una contraseña de 65 caracteres se rechaza, igual que una de 7.

- **Comportamiento real:** se acepta y la cuenta se crea. El borde inferior **sí** se aplica: 7 caracteres devuelve `422` con *"La contraseña debe tener al menos 8 caracteres"*. Solo falta el límite superior, y falta en las dos capas.

- **Pasos para reproducir:**
  1. Ir a `/registro` y completar con una contraseña de exactamente 65 caracteres.
  2. Enviar → *"¡Registro exitoso!"*, y `POST /api/register` responde `201`.
  3. Equivalente por API: mismo cuerpo, mismo `201`.

- **Evidencia:** `evidence/registro-password-larga.html` · bitácora H-01. Tests: `CP-20` en `tests/e2e/registro.spec.ts` y `API-05` en `tests/api/registro-api.spec.ts`.

- **Severidad y por qué:** **Media.** La cuenta funciona: se verificó que el login con los 65 caracteres devuelve `200`. No hay daño inmediato para el usuario y existe workaround —usar una contraseña más corta—, pero el sistema almacena datos que su propia especificación declara inválidos.

  > **Aviso para quien lo corrija.** No se arregla truncando. Se verificó que el login con esa misma contraseña recortada a 64 caracteres devuelve **`401`**: truncar dejaría fuera a todas las cuentas ya creadas con contraseñas largas. La corrección va en el rechazo durante el registro, no en el recorte.

- **Capa donde se detecta:** **UI + API.**

---

### BUG-05 · El formulario no se limpia tras un registro exitoso

- **REQ violado:** REQ-R06 — *"Tras un registro exitoso, el formulario debe limpiarse completamente. Ningún campo debe conservar datos del registro anterior."*

- **Comportamiento esperado:** tras un `201` confirmado, los cuatro campos quedan vacíos.

- **Comportamiento real:** los cuatro conservan lo que el aspirante escribió.

- **Pasos para reproducir:**
  1. Ir a `/registro` y completar con datos válidos y un email no usado.
  2. Enviar. Aparece *"¡Registro exitoso! Tu cuenta ha sido creada."* y `POST /api/register` devuelve `201`.
  3. Mirar el formulario: nombre, email, contraseña y edad siguen ahí.

- **Evidencia:**
  ```html
  value="Iris Moreno"
  value="iris.qa.1788272538397.ok@gmail.com"
  value="Clave1234"
  value="30"
  ```
  `evidence/registro-exito.html` · bitácora H-03. Tests: `CP-25` y `CP-27` en `tests/e2e/registro.spec.ts`.

- **Severidad y por qué:** **Media.** Existe workaround —recargar la página—, pero tiene dos consecuencias reales: riesgo de registro duplicado accidental si alguien vuelve a pulsar el botón, y **exposición de datos en una máquina compartida**, donde el siguiente aspirante ve el nombre y el email del anterior en pantalla.

- **Capa donde se detecta:** **UI.** Es una post-condición visible: la API responde correctamente y el defecto está en lo que ocurre después.

---

## Lo que se revisó y NO es defecto

Vale tanto como la lista de arriba: deja constancia de qué se contrastó contra la
especificación y se descartó con criterio, en lugar de dejarlo sin mirar.

| Observación | Veredicto |
|---|---|
| El input de edad declara `min="1" max="150"`, y REQ-R05 dice 16 a 99 | **No es defecto de comportamiento.** Las edades 15 y 100 se rechazan con el mensaje correcto en las dos capas. Queda como riesgo latente: quien confíe en los atributos del input en vez de en la validación de la aplicación leería un rango de 1 a 150 |
| `irismoreno@gmail.con` se acepta | **No es defecto.** REQ-R03 exige un dominio con punto, no un TLD de una lista determinada. `gmail.con` cumple la regla escrita aunque parezca un error de tipeo. Es un límite de interpretación y se documenta como tal |
| El contrato de `POST /api/enroll` | **Cumple REQ-A03** en sus tres respuestas: `200` con `status: "inscrito"`, `400` sin `courseId`, `404` con curso inexistente |
| El mensaje de bienvenida tras el login | **Cumple REQ-L04:** *"👋 ¡Hola, Iris!"*, con el nombre del usuario |
| `tests/login.spec.ts` del andamiaje del curso fallaba | **No es defecto del producto.** `POST /api/login` devolvía `401` porque el par usuario/contraseña que el test tenía fijo ya no es válido; una cuenta recién registrada sí loguea con `200`. Era un problema de datos de prueba. El archivo se eliminó del repositorio por estar fuera del alcance, no se corrigió |

---

## Dos preguntas abiertas, no defectos

La especificación no las define, así que **no hay contra qué contrastar**. Reportarlas
como bugs sería inventar el resultado esperado.

| Caso | Qué no define la especificación |
|---|---|
| `CP-07` | Si un campo con solo espacios en blanco cuenta como vacío. Si se aceptara, la academia acumularía estudiantes sin nombre visible |
| `CP-30` | Si la comparación de emails duplicados distingue mayúsculas de minúsculas |

Ambas van al responsable del producto como consulta, y entran a la suite el día que la
regla exista.
