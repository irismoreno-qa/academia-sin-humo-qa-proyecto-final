# Casos de prueba — Registro de estudiantes

Diseñados **leyendo la especificación**, no la pantalla. Fuente:
`https://playground.calidadsinhumo.com/documentacion`, sección 1 — REQ-R01 a R07,
más un requisito derivado (REQ-R08) marcado como tal en cada caso que lo valida.

## Cómo leer este documento

| | |
|---|---|
| **Numeración** | `CP-01` a `CP-32`, en el mismo orden que [`qa/test-cases.json`](qa/test-cases.json). Cada caso muestra además su identificador técnico `TC-…`, que es el que usan los escenarios BDD, los tags de Playwright y la matriz de trazabilidad del README |
| **Resultado esperado** | Sale de la especificación. Nunca de lo que la aplicación hace o dice |
| **Resultado obtenido** | Se completa al ejecutar. Vacío significa **no ejecutado**, no "sin problemas" |
| **Estado** | `PENDIENTE` hasta ejecutar. Después: `PASA`, `FALLA → posible bug`, `SIN VERIFICAR` o `SIN VEREDICTO` |

**`SIN VERIFICAR` no es un estado decorativo.** Un caso ejecutado del que no se puede
citar el código de estado real de `POST /api/register` —o la constancia de que no
hubo petición— no es un caso aprobado. Es un caso sin verificar, y así se firma.

**Los resultados esperados de rechazo no nombran la capa a propósito.** La
especificación exige que el registro sea rechazado sin decir dónde debe ocurrir.
Atar la expectativa al cliente o al servidor la rompería el día que el producto
mueva la validación de lugar, sin que la regla haya cambiado.

## Técnicas aplicadas

| Técnica | Requisitos | Por qué ahí |
|---|---|---|
| **Valores límite** | R02 · R04 · R05 | Son las tres reglas con rango numérico explícito. Cada una se prueba en sus cuatro valores: el inválido y el válido de cada extremo |
| **Partición de equivalencia** | R01 · R03 · R07 | Reglas categóricas sin rango numérico: alcanza con un representante por clase |
| **Verificación de post-condición** | R06 | No valida una entrada sino el estado del formulario después de un evento |
| **Consistencia entre capas** | R08 | Compara dos observaciones de la misma interacción: lo que respondió la API y lo que muestra la pantalla |

---

## REQ-R01 — Los cuatro campos del formulario son obligatorios

> *"El formulario requiere: nombre completo, email, contraseña y edad. Todos los campos son obligatorios."*

### CP-01 · Los cuatro campos vacíos bloquean el envío

- **REQ que valida:** REQ-R01
- **Técnica:** Partición de equivalencia
- **Identificador técnico:** `TC-R01-001`
- **Precondición:** Estar en `/registro`, sin sesión iniciada.
- **Pasos:**
  1. El aspirante abre /registro sin sesión iniciada.
  2. El aspirante deja Nombre, Email, Contraseña y Edad en blanco.
  3. El aspirante hace clic en Crear cuenta.
- **Datos de prueba:** nombre = `(vacío)` · email = `(vacío)` · contrasena = `(vacío)` · edad = `(vacío)`
- **Resultado esperado (según la spec):** No se emite ninguna petición a POST /api/register (bloqueo del lado del cliente) y el formulario informa los cuatro campos obligatorios faltantes.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

### CP-02 · Solo el nombre vacío, resto de campos válidos

- **REQ que valida:** REQ-R01
- **Técnica:** Partición de equivalencia
- **Identificador técnico:** `TC-R01-002`
- **Precondición:** Estar en `/registro`, sin sesión iniciada.
- **Pasos:**
  1. El aspirante abre /registro.
  2. El aspirante deja Nombre en blanco y completa Email, Contraseña y Edad con valores válidos centrales.
  3. El aspirante hace clic en Crear cuenta.
- **Datos de prueba:** nombre = `(vacío)` · email = `{EMAIL_UNICO}` · contrasena = `Clave1234` · edad = `30`
- **Resultado esperado (según la spec):** No se emite petición a POST /api/register y se informa únicamente la obligatoriedad del nombre; ningún otro campo genera error.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

### CP-03 · Solo el email vacío, resto de campos válidos

- **REQ que valida:** REQ-R01
- **Técnica:** Partición de equivalencia
- **Identificador técnico:** `TC-R01-003`
- **Precondición:** Estar en `/registro`, sin sesión iniciada.
- **Pasos:**
  1. El aspirante abre /registro.
  2. El aspirante deja Email en blanco y completa Nombre, Contraseña y Edad con valores válidos centrales.
  3. El aspirante hace clic en Crear cuenta.
- **Datos de prueba:** nombre = `Iris Moreno` · email = `(vacío)` · contrasena = `Clave1234` · edad = `30`
- **Resultado esperado (según la spec):** No se emite petición a POST /api/register y se informa únicamente la obligatoriedad del email; ningún otro campo genera error.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

### CP-04 · Solo la contraseña vacía, resto de campos válidos

- **REQ que valida:** REQ-R01
- **Técnica:** Partición de equivalencia
- **Identificador técnico:** `TC-R01-004`
- **Precondición:** Estar en `/registro`, sin sesión iniciada.
- **Pasos:**
  1. El aspirante abre /registro.
  2. El aspirante deja Contraseña en blanco y completa Nombre, Email y Edad con valores válidos centrales.
  3. El aspirante hace clic en Crear cuenta.
- **Datos de prueba:** nombre = `Iris Moreno` · email = `{EMAIL_UNICO}` · contrasena = `(vacío)` · edad = `30`
- **Resultado esperado (según la spec):** No se emite petición a POST /api/register y se informa únicamente la obligatoriedad de la contraseña; ningún otro campo genera error.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

### CP-05 · Solo la edad vacía, resto de campos válidos

- **REQ que valida:** REQ-R01
- **Técnica:** Partición de equivalencia
- **Identificador técnico:** `TC-R01-005`
- **Precondición:** Estar en `/registro`, sin sesión iniciada.
- **Pasos:**
  1. El aspirante abre /registro.
  2. El aspirante deja Edad en blanco y completa Nombre, Email y Contraseña con valores válidos centrales.
  3. El aspirante hace clic en Crear cuenta.
- **Datos de prueba:** nombre = `Iris Moreno` · email = `{EMAIL_UNICO}` · contrasena = `Clave1234` · edad = `(vacío)`
- **Resultado esperado (según la spec):** No se emite petición a POST /api/register y se informa únicamente la obligatoriedad de la edad; ningún otro campo genera error.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

### CP-06 · Los cuatro campos completos con valores válidos permiten el envío

- **REQ que valida:** REQ-R01
- **Técnica:** Partición de equivalencia — control positivo
- **Identificador técnico:** `TC-R01-006`
- **Precondición:** Estar en `/registro`, sin sesión iniciada.
- **Pasos:**
  1. El aspirante abre /registro.
  2. El aspirante completa los cuatro campos con valores válidos centrales.
  3. El aspirante hace clic en Crear cuenta.
- **Datos de prueba:** nombre = `Iris Moreno` · email = `{EMAIL_UNICO}` · contrasena = `Clave1234` · edad = `30`
- **Resultado esperado (según la spec):** Se emite la petición POST /api/register y la respuesta es de éxito; no se informa obligatoriedad de ningún campo. Este caso es el control de los cinco anteriores: sin él, un formulario permanentemente roto los haría pasar a todos.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

### CP-07 · Campo completado únicamente con espacios en blanco

- **REQ que valida:** REQ-R01
- **Técnica:** Caso límite — ambigüedad de especificación
- **Identificador técnico:** `TC-R01-007`
- **Precondición:** Estar en `/registro`, sin sesión iniciada.
- **Pasos:**
  1. El aspirante abre /registro con la pestaña Network abierta.
  2. El aspirante escribe tres espacios en Nombre y completa el resto con valores válidos centrales.
  3. El aspirante hace clic en Crear cuenta y registra si hubo petición y con qué código respondió.
- **Datos de prueba:** nombre = `   ` · email = `{EMAIL_UNICO}` · contrasena = `Clave1234` · edad = `30`
- **Resultado esperado (según la spec):** Indeterminado por especificación. REQ-R01 exige que el campo no esté vacío y REQ-R02 exige entre 2 y 50 caracteres, pero ninguna de las dos define si los espacios en blanco cuentan como contenido. Este caso NO se marca PASA ni FALLA: se documenta el comportamiento real y se eleva como pregunta al responsable del producto. Si se aceptara, la academia terminaría con estudiantes sin nombre visible.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

## REQ-R02 — El nombre debe tener entre 2 y 50 caracteres

> *"El nombre debe tener entre 2 y 50 caracteres."*

### CP-08 · Nombre por debajo del límite inferior: 1 carácter

- **REQ que valida:** REQ-R02
- **Técnica:** Valores límite
- **Identificador técnico:** `TC-R02-001`
- **Precondición:** Estar en `/registro`, sin sesión iniciada.
- **Pasos:**
  1. El aspirante abre /registro.
  2. El aspirante escribe un nombre de 1 carácter y completa Email, Contraseña y Edad con valores válidos centrales.
  3. El aspirante hace clic en Crear cuenta.
- **Datos de prueba:** nombre = `L` · email = `{EMAIL_UNICO}` · contrasena = `Clave1234` · edad = `30`
- **Resultado esperado (según la spec):** El registro es rechazado y no se crea la cuenta; el formulario informa que el nombre debe tener entre 2 y 50 caracteres. El resultado esperado no especifica la capa a propósito: la especificación exige el rechazo sin decir dónde ocurre. Observado el 2026-09-01: el cliente bloquea y no se emite petición, de modo que este caso demuestra la regla en el cliente y NO en el servidor.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

### CP-09 · Nombre en el límite inferior válido: 2 caracteres exactos

- **REQ que valida:** REQ-R02
- **Técnica:** Valores límite
- **Identificador técnico:** `TC-R02-002`
- **Precondición:** Estar en `/registro`, sin sesión iniciada.
- **Pasos:**
  1. El aspirante abre /registro.
  2. El aspirante escribe un nombre de exactamente 2 caracteres, contados por herramienta y no a ojo, y completa el resto con valores válidos centrales.
  3. El aspirante hace clic en Crear cuenta.
- **Datos de prueba:** nombre = `Li` · email = `{EMAIL_UNICO}` · contrasena = `Clave1234` · edad = `30`
- **Resultado esperado (según la spec):** POST /api/register responde con un código de éxito y la cuenta queda creada; el nombre no genera ningún error.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

### CP-10 · Nombre en el límite superior válido: 50 caracteres exactos

- **REQ que valida:** REQ-R02
- **Técnica:** Valores límite
- **Identificador técnico:** `TC-R02-003`
- **Precondición:** Estar en `/registro`, sin sesión iniciada.
- **Pasos:**
  1. El aspirante abre /registro.
  2. El aspirante escribe un nombre de exactamente 50 caracteres, contados por herramienta, y completa el resto con valores válidos centrales.
  3. El aspirante hace clic en Crear cuenta.
- **Datos de prueba:** nombre = `<cadena de 50 caracteres exactos>` · email = `{EMAIL_UNICO}` · contrasena = `Clave1234` · edad = `30`
- **Resultado esperado (según la spec):** POST /api/register responde con un código de éxito y la cuenta queda creada; el nombre no genera ningún error.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

### CP-11 · Nombre por encima del límite superior: 51 caracteres

- **REQ que valida:** REQ-R02
- **Técnica:** Valores límite
- **Identificador técnico:** `TC-R02-004`
- **Precondición:** Estar en `/registro`, sin sesión iniciada.
- **Pasos:**
  1. El aspirante abre /registro.
  2. El aspirante escribe un nombre de exactamente 51 caracteres, contados por herramienta, y completa el resto con valores válidos centrales.
  3. El aspirante hace clic en Crear cuenta con la pestaña Network abierta.
- **Datos de prueba:** nombre = `<cadena de 51 caracteres exactos>` · email = `{EMAIL_UNICO}` · contrasena = `Clave1234` · edad = `30`
- **Resultado esperado (según la spec):** El registro es rechazado y no se crea la cuenta. Se verifica en Network qué ocurrió: la pantalla por sí sola no alcanza como evidencia, y la ausencia de petición es una lectura tan válida como un código de estado. Observado el 2026-09-01: el cliente bloquea sin emitir petición, de modo que el borde superior queda demostrado en el cliente y NO en el servidor.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

## REQ-R03 — El email debe contener un @ seguido de un dominio con punto

> *"El email debe tener formato válido: debe contener un @ seguido de un dominio con punto (ejemplo: usuario@dominio.com)."*

### CP-12 · Email válido con @ y dominio con punto

- **REQ que valida:** REQ-R03
- **Técnica:** Partición de equivalencia — control positivo
- **Identificador técnico:** `TC-R03-001`
- **Precondición:** Estar en `/registro`, sin sesión iniciada.
- **Pasos:**
  1. El aspirante abre /registro.
  2. El aspirante escribe un email con @ y dominio con punto, y completa el resto con valores válidos centrales.
  3. El aspirante hace clic en Crear cuenta.
- **Datos de prueba:** nombre = `Iris Moreno` · email = `{EMAIL_UNICO}@gmail.com` · contrasena = `Clave1234` · edad = `30`
- **Resultado esperado (según la spec):** POST /api/register responde con un código de éxito; el email no genera ningún error de formato.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

### CP-13 · Email sin arroba

- **REQ que valida:** REQ-R03
- **Técnica:** Partición de equivalencia
- **Identificador técnico:** `TC-R03-002`
- **Precondición:** Estar en `/registro`, sin sesión iniciada.
- **Pasos:**
  1. El aspirante abre /registro.
  2. El aspirante escribe un email sin el carácter @ y completa el resto con valores válidos centrales.
  3. El aspirante hace clic en Crear cuenta.
- **Datos de prueba:** nombre = `Iris Moreno` · email = `irismoreno.gmail.com` · contrasena = `Clave1234` · edad = `30`
- **Resultado esperado (según la spec):** El registro es rechazado por formato de email inválido y no se crea la cuenta.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

### CP-14 · Email con arroba pero sin dominio

- **REQ que valida:** REQ-R03
- **Técnica:** Partición de equivalencia
- **Identificador técnico:** `TC-R03-003`
- **Precondición:** Estar en `/registro`, sin sesión iniciada.
- **Pasos:**
  1. El aspirante abre /registro.
  2. El aspirante escribe un email que termina en @ y completa el resto con valores válidos centrales.
  3. El aspirante hace clic en Crear cuenta.
- **Datos de prueba:** nombre = `Iris Moreno` · email = `irismoreno@` · contrasena = `Clave1234` · edad = `30`
- **Resultado esperado (según la spec):** El registro es rechazado por formato de email inválido y no se crea la cuenta.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

### CP-15 · Email con dominio sin punto

- **REQ que valida:** REQ-R03
- **Técnica:** Partición de equivalencia
- **Identificador técnico:** `TC-R03-004`
- **Precondición:** Estar en `/registro`, sin sesión iniciada.
- **Pasos:**
  1. El aspirante abre /registro.
  2. El aspirante escribe un email con @ y un dominio que no contiene punto, y completa el resto con valores válidos centrales.
  3. El aspirante hace clic en Crear cuenta con la pestaña Network abierta.
- **Datos de prueba:** nombre = `Iris Moreno` · email = `irismoreno@gmail` · contrasena = `Clave1234` · edad = `30`
- **Resultado esperado (según la spec):** El registro es rechazado y no se crea la cuenta: REQ-R03 exige un dominio con punto y 'gmail' no lo tiene. DEFECTO CONFIRMADO el 2026-09-01: la aplicación acepta el registro con 201 y crea la cuenta. El caso es correcto y el producto lo incumple; el fallo se preserva y no se toca la expectativa. Es la mitad de la regla que quedó sin implementar: el cliente exige la arroba y nadie exige el punto.
- **Observado en la captura de evidencia (2026-09-01):** `201` — la aplicación aceptó el registro y creó la cuenta con `irismoreno@gmail`. Registrado como **H-02** en la [bitácora](qa/bitacora-de-hallazgos.md). *No firma este caso: la ejecución formal es la Fase 2.*
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

### CP-16 · Email con dominio de primer nivel atípico pero sintácticamente válido

- **REQ que valida:** REQ-R03
- **Técnica:** Caso límite — interpretación de la regla
- **Identificador técnico:** `TC-R03-005`
- **Precondición:** Estar en `/registro`, sin sesión iniciada.
- **Pasos:**
  1. El aspirante abre /registro.
  2. El aspirante escribe un email cuyo dominio tiene punto pero un TLD poco habitual, y completa el resto con valores válidos centrales.
  3. El aspirante hace clic en Crear cuenta.
- **Datos de prueba:** nombre = `Iris Moreno` · email = `irismoreno@gmail.con` · contrasena = `Clave1234` · edad = `30`
- **Resultado esperado (según la spec):** POST /api/register responde con un código de éxito. REQ-R03 exige un @ y un dominio con punto; no exige un TLD de una lista. Aunque parezca un error de tipeo, aceptarlo es el comportamiento correcto según la regla escrita. Se documenta como caso límite de interpretación, no como bug.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

## REQ-R04 — La contraseña debe tener entre 8 y 64 caracteres inclusive

> *"La contraseña debe tener entre 8 y 64 caracteres (inclusive). Una contraseña de 7 caracteres debe ser rechazada. Una de 65 también."*

### CP-17 · Contraseña por debajo del límite inferior: 7 caracteres

- **REQ que valida:** REQ-R04
- **Técnica:** Valores límite
- **Identificador técnico:** `TC-R04-001`
- **Precondición:** Estar en `/registro`, sin sesión iniciada.
- **Pasos:**
  1. El aspirante abre /registro.
  2. El aspirante escribe una contraseña de exactamente 7 caracteres, contados por herramienta, y completa el resto con valores válidos centrales.
  3. El aspirante hace clic en Crear cuenta.
- **Datos de prueba:** nombre = `Iris Moreno` · email = `{EMAIL_UNICO}` · contrasena = `Clave12` · edad = `30`
- **Resultado esperado (según la spec):** El registro es rechazado por contraseña demasiado corta y no se crea la cuenta.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

### CP-18 · Contraseña en el límite inferior válido: 8 caracteres exactos

- **REQ que valida:** REQ-R04
- **Técnica:** Valores límite
- **Identificador técnico:** `TC-R04-002`
- **Precondición:** Estar en `/registro`, sin sesión iniciada.
- **Pasos:**
  1. El aspirante abre /registro.
  2. El aspirante escribe una contraseña de exactamente 8 caracteres, contados por herramienta, y completa el resto con valores válidos centrales.
  3. El aspirante hace clic en Crear cuenta.
- **Datos de prueba:** nombre = `Iris Moreno` · email = `{EMAIL_UNICO}` · contrasena = `Clave123` · edad = `30`
- **Resultado esperado (según la spec):** POST /api/register responde con un código de éxito y la cuenta queda creada; la contraseña no genera ningún error.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

### CP-19 · Contraseña en el límite superior válido: 64 caracteres exactos

- **REQ que valida:** REQ-R04
- **Técnica:** Valores límite
- **Identificador técnico:** `TC-R04-003`
- **Precondición:** Estar en `/registro`, sin sesión iniciada.
- **Pasos:**
  1. El aspirante abre /registro.
  2. El aspirante escribe una contraseña de exactamente 64 caracteres, generada y contada por herramienta, y completa el resto con valores válidos centrales.
  3. El aspirante hace clic en Crear cuenta con la pestaña Network abierta.
- **Datos de prueba:** nombre = `Iris Moreno` · email = `{EMAIL_UNICO}` · contrasena = `<cadena de 64 caracteres exactos>` · edad = `30`
- **Resultado esperado (según la spec):** POST /api/register responde con un código de éxito y la cuenta queda creada. Junto con TC-R04-004 delimita el borde exacto: 64 entra, 65 no.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

### CP-20 · Contraseña por encima del límite superior: 65 caracteres

- **REQ que valida:** REQ-R04
- **Técnica:** Valores límite
- **Identificador técnico:** `TC-R04-004`
- **Precondición:** Estar en `/registro`, sin sesión iniciada.
- **Pasos:**
  1. El aspirante abre /registro.
  2. El aspirante escribe una contraseña de exactamente 65 caracteres, generada y contada por herramienta, y completa el resto con valores válidos centrales.
  3. El aspirante hace clic en Crear cuenta con la pestaña Network abierta.
  4. El aspirante registra qué ocurrió en Network —código de estado o ausencia de petición— antes de mirar la pantalla.
- **Datos de prueba:** nombre = `Iris Moreno` · email = `{EMAIL_UNICO}` · contrasena = `<cadena de 65 caracteres exactos>` · edad = `30`
- **Resultado esperado (según la spec):** El registro es rechazado y no se crea la cuenta: REQ-R04 exige rechazar 65 caracteres de forma explícita. DEFECTO CONFIRMADO el 2026-09-01: la aplicación acepta el registro con 201 y crea la cuenta. El caso es correcto y el producto lo incumple; el fallo se preserva y no se toca la expectativa. El paso 4 sigue siendo obligatorio: el borde inferior de este mismo requisito sí se bloquea en el cliente, así que solo mirando la red se distingue un rechazo real de una aceptación silenciosa.
- **Observado en la captura de evidencia (2026-09-01):** `201` — la aplicación aceptó el registro y creó la cuenta con una contraseña de 65 caracteres. Registrado como **H-01** en la [bitácora](qa/bitacora-de-hallazgos.md). *No firma este caso: la ejecución formal es la Fase 2.*
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

## REQ-R05 — La edad debe estar entre 16 y 99 inclusive

> *"La edad debe estar entre 16 y 99 (inclusive)."*

### CP-21 · Edad por debajo del límite inferior: 15 años

- **REQ que valida:** REQ-R05
- **Técnica:** Valores límite
- **Identificador técnico:** `TC-R05-001`
- **Precondición:** Estar en `/registro`, sin sesión iniciada.
- **Pasos:**
  1. El aspirante abre /registro.
  2. El aspirante escribe 15 en Edad y completa el resto con valores válidos centrales.
  3. El aspirante hace clic en Crear cuenta.
- **Datos de prueba:** nombre = `Iris Moreno` · email = `{EMAIL_UNICO}` · contrasena = `Clave1234` · edad = `15`
- **Resultado esperado (según la spec):** El registro es rechazado por edad menor a la mínima y no se crea la cuenta.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

### CP-22 · Edad en el límite inferior válido: 16 años exactos

- **REQ que valida:** REQ-R05
- **Técnica:** Valores límite
- **Identificador técnico:** `TC-R05-002`
- **Precondición:** Estar en `/registro`, sin sesión iniciada.
- **Pasos:**
  1. El aspirante abre /registro.
  2. El aspirante escribe 16 en Edad y completa el resto con valores válidos centrales.
  3. El aspirante hace clic en Crear cuenta.
- **Datos de prueba:** nombre = `Iris Moreno` · email = `{EMAIL_UNICO}` · contrasena = `Clave1234` · edad = `16`
- **Resultado esperado (según la spec):** POST /api/register responde con un código de éxito y la cuenta queda creada; la edad no genera ningún error.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

### CP-23 · Edad en el límite superior válido: 99 años exactos

- **REQ que valida:** REQ-R05
- **Técnica:** Valores límite
- **Identificador técnico:** `TC-R05-003`
- **Precondición:** Estar en `/registro`, sin sesión iniciada.
- **Pasos:**
  1. El aspirante abre /registro.
  2. El aspirante escribe 99 en Edad y completa el resto con valores válidos centrales.
  3. El aspirante hace clic en Crear cuenta.
- **Datos de prueba:** nombre = `Iris Moreno` · email = `{EMAIL_UNICO}` · contrasena = `Clave1234` · edad = `99`
- **Resultado esperado (según la spec):** POST /api/register responde con un código de éxito y la cuenta queda creada; la edad no genera ningún error.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

### CP-24 · Edad por encima del límite superior: 100 años

- **REQ que valida:** REQ-R05
- **Técnica:** Valores límite
- **Identificador técnico:** `TC-R05-004`
- **Precondición:** Estar en `/registro`, sin sesión iniciada.
- **Pasos:**
  1. El aspirante abre /registro.
  2. El aspirante escribe 100 en Edad y completa el resto con valores válidos centrales.
  3. El aspirante hace clic en Crear cuenta.
- **Datos de prueba:** nombre = `Iris Moreno` · email = `{EMAIL_UNICO}` · contrasena = `Clave1234` · edad = `100`
- **Resultado esperado (según la spec):** El registro es rechazado por edad mayor a la máxima y no se crea la cuenta.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

## REQ-R06 — El formulario se limpia por completo tras un registro exitoso

> *"Tras un registro exitoso, el formulario debe limpiarse completamente. Ningún campo debe conservar datos del registro anterior."*

### CP-25 · El formulario queda vacío tras un registro exitoso confirmado por la API

- **REQ que valida:** REQ-R06
- **Técnica:** Verificación de post-condición
- **Identificador técnico:** `TC-R06-001`
- **Precondición:** Estar en `/registro`, sin sesión iniciada.
- **Pasos:**
  1. El aspirante abre /registro con la pestaña Network abierta.
  2. El aspirante completa los cuatro campos con valores válidos centrales y un email no usado.
  3. El aspirante hace clic en Crear cuenta.
  4. El aspirante confirma en Network que POST /api/register respondió con éxito.
  5. El aspirante observa los cuatro campos del formulario.
- **Datos de prueba:** nombre = `Iris Moreno` · email = `{EMAIL_UNICO}` · contrasena = `Clave1234` · edad = `30`
- **Resultado esperado (según la spec):** Los cuatro campos quedan completamente vacíos. El paso 4 es previo al 5 por diseño: sin éxito confirmado por la API, REQ-R06 no aplica y el caso no puede evaluarse.
- **Observado en la captura de evidencia (2026-09-01):** `201` confirmado, y los cuatro campos conservaron sus valores. Registrado como **H-03** en la [bitácora](qa/bitacora-de-hallazgos.md). *No firma este caso: la ejecución formal es la Fase 2.*
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

### CP-26 · El formulario conserva los datos tras un registro rechazado

- **REQ que valida:** REQ-R06
- **Técnica:** Verificación de post-condición
- **Identificador técnico:** `TC-R06-002`
- **Precondición:** Estar en `/registro`, sin sesión iniciada.
- **Pasos:**
  1. El aspirante abre /registro con la pestaña Network abierta.
  2. El aspirante completa los campos con una edad fuera de rango y el resto válido.
  3. El aspirante hace clic en Crear cuenta.
  4. El aspirante confirma en Network que el registro fue rechazado.
  5. El aspirante observa los cuatro campos del formulario.
- **Datos de prueba:** nombre = `Iris Moreno` · email = `{EMAIL_UNICO}` · contrasena = `Clave1234` · edad = `100`
- **Resultado esperado (según la spec):** Los campos conservan lo que el aspirante escribió. REQ-R06 condiciona la limpieza a un registro exitoso: limpiar tras un rechazo obligaría a reescribir todo y sería un defecto de usabilidad, además de una violación de la regla.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

### CP-27 · Dos registros exitosos consecutivos sin arrastre de datos

- **REQ que valida:** REQ-R06
- **Técnica:** Verificación de post-condición
- **Identificador técnico:** `TC-R06-003`
- **Precondición:** El aspirante completa un registro exitoso confirmado por la API.
- **Pasos:**
  2. Sin recargar la página, el aspirante completa un segundo registro con un email distinto y no usado.
  3. El aspirante confirma en Network que el segundo registro también respondió con éxito.
  4. El aspirante observa los cuatro campos.
- **Datos de prueba:** primer_email = `{EMAIL_UNICO_1}` · segundo_email = `{EMAIL_UNICO_2}` · nombre = `Iris Moreno` · contrasena = `Clave1234` · edad = `30`
- **Resultado esperado (según la spec):** Los cuatro campos quedan vacíos tras el segundo registro y ningún campo conserva datos del primero. Cubre la segunda oración de REQ-R06, que un solo registro aislado no puede verificar.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

## REQ-R07 — No se puede registrar un email que ya existe en el sistema

> *"No se puede registrar un email que ya existe en el sistema."*

### CP-28 · Un email no registrado previamente es aceptado

- **REQ que valida:** REQ-R07
- **Técnica:** Partición de equivalencia — control positivo
- **Identificador técnico:** `TC-R07-001`
- **Precondición:** Estar en `/registro`, sin sesión iniciada.
- **Pasos:**
  1. El aspirante abre /registro.
  2. El aspirante completa los cuatro campos con un email que no fue usado antes.
  3. El aspirante hace clic en Crear cuenta.
- **Datos de prueba:** nombre = `Iris Moreno` · email = `{EMAIL_UNICO}` · contrasena = `Clave1234` · edad = `30`
- **Resultado esperado (según la spec):** POST /api/register responde con un código de éxito. Es el control de TC-R07-002: sin él, un rechazo generalizado del formulario se leería como cumplimiento de REQ-R07.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

### CP-29 · Un email ya registrado es rechazado

- **REQ que valida:** REQ-R07
- **Técnica:** Partición de equivalencia
- **Identificador técnico:** `TC-R07-002`
- **Precondición:** El aspirante ejecuta TC-R07-001 y registra un email con éxito confirmado por la API.
- **Pasos:**
  2. El aspirante vuelve a /registro y completa el formulario con el mismo email, cambiando nombre, contraseña y edad por otros valores válidos.
  3. El aspirante hace clic en Crear cuenta.
- **Datos de prueba:** nombre = `Ana Gómez` · email = `<el mismo email de TC-R07-001>` · contrasena = `OtraClave99` · edad = `42`
- **Resultado esperado (según la spec):** POST /api/register responde con un código de rechazo por email duplicado y no se crea una segunda cuenta. Depende de TC-R07-001 por diseño; la dependencia está declarada, no escondida.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

### CP-30 · El mismo email con distinta capitalización

- **REQ que valida:** REQ-R07
- **Técnica:** Caso límite — ambigüedad de especificación
- **Identificador técnico:** `TC-R07-003`
- **Precondición:** El aspirante registra un email en minúsculas con éxito confirmado por la API.
- **Pasos:**
  2. El aspirante vuelve a /registro e intenta registrar el mismo email con mayúsculas en la parte local y el dominio.
  3. El aspirante hace clic en Crear cuenta y registra el código de estado.
- **Datos de prueba:** primer_email = `{EMAIL_UNICO}` · segundo_email = `<el mismo email con mayúsculas>` · nombre = `Iris Moreno` · contrasena = `Clave1234` · edad = `30`
- **Resultado esperado (según la spec):** Indeterminado por especificación. REQ-R07 dice 'un email que ya existe' pero no define si la comparación distingue mayúsculas de minúsculas. Este caso NO se marca PASA ni FALLA: se documenta el comportamiento real observado y se eleva como pregunta al responsable del producto. Reportarlo como bug sin una regla que lo respalde sería inventar el resultado esperado.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

## REQ-R08 — El resultado informado en la interfaz debe coincidir con el resultado real del registro

> *"Derivado — no figura en la especificación. El resultado informado en la interfaz debe coincidir con el resultado real del registro."*

**Requisito derivado.** No está escrito en la especificación: se deduce de
REQ-R01 a R07. Las siete reglas obligan a rechazar entradas inválidas, y un
rechazo que el aspirante no percibe equivale, desde su lado, a no haber sido
rechazado. Se marca como derivado para que nunca se confunda con una regla escrita.

### CP-31 · Un rechazo de la API no se muestra como éxito en pantalla

- **REQ que valida:** REQ-R08
- **Técnica:** Consistencia entre capas
- **Identificador técnico:** `TC-R08-001`
- **Precondición:** El aspirante abre /registro con la pestaña Network abierta.
- **Pasos:**
  2. El aspirante registra un email con éxito confirmado por la API.
  3. El aspirante reenvía el formulario con ese mismo email, provocando un rechazo real del servidor.
  4. El aspirante anota el código de estado de POST /api/register.
  5. El aspirante anota el mensaje que muestra la pantalla.
- **Datos de prueba:** nombre = `Iris Moreno` · email = `{EMAIL_UNICO} reenviado por segunda vez` · contrasena = `Clave1234` · edad = `30`
- **Resultado esperado (según la spec):** Si la API respondió con un código de error, la pantalla no muestra el mensaje de éxito. Se comparan los pasos 4 y 5: cualquier divergencia entre ellos es el defecto que este caso busca. El vehículo es el email duplicado porque es el único rechazo de servidor observado el 2026-09-01 (422); el resto de los rechazos ocurre en el cliente sin emitir petición, y por lo tanto no sirve para contrastar capas. La contraseña de 65 caracteres, que era el vehículo original de este caso, dejó de servir al confirmarse que la API la acepta con 201: eso es el defecto de REQ-R04, no una vía para provocar un rechazo.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

### CP-32 · Una aceptación de la API se muestra como éxito en pantalla

- **REQ que valida:** REQ-R08
- **Técnica:** Consistencia entre capas — control positivo
- **Identificador técnico:** `TC-R08-002`
- **Precondición:** Estar en `/registro`, sin sesión iniciada.
- **Pasos:**
  1. El aspirante abre /registro con la pestaña Network abierta.
  2. El aspirante envía un registro válido con un email no usado.
  3. El aspirante anota el código de estado de POST /api/register.
  4. El aspirante anota el mensaje que muestra la pantalla.
- **Datos de prueba:** nombre = `Iris Moreno` · email = `{EMAIL_UNICO}` · contrasena = `Clave1234` · edad = `30`
- **Resultado esperado (según la spec):** Si la API respondió con un código de éxito, la pantalla muestra el mensaje de éxito. Es el control de TC-R08-001: una pantalla que nunca muestra éxito también sería coherente con aquel caso, y estaría igual de rota.
- **Resultado obtenido:** —
- **Estado:** PENDIENTE

---

## Resumen

| | |
|---|---|
| Casos diseñados | **32** sobre 8 requisitos |
| Casos `boundary` | 12 |
| Casos `negative` | 11 |
| Casos `happy_path` | 5 |
| Casos `edge_case` | 4 |
| Casos ejecutados y firmados | **0** — la ejecución formal es la Fase 2 |

Ningún requisito quedó sin cobertura y ningún caso quedó sin requisito: la matriz
bidireccional está en [`qa/traceability.md`](qa/traceability.md).

## Veredicto del juez

Estos casos se pasaron por el juez con rúbrica. El veredicto, lo que señaló como
faltante y qué se aceptó y qué se rechazó están en
[`qa/veredicto-del-juez.md`](qa/veredicto-del-juez.md).
