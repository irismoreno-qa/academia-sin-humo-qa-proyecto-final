# Plan de Prueba — Academia sin Humo · Registro de estudiantes

Generado con el sistema de 5 estaciones (`sistema-qa-completo`) sobre la sección 1
de `https://playground.calidadsinhumo.com/documentacion`.
Artefactos hermanos: [`context.json`](context.json), [`requirements.json`](requirements.json),
[`test-cases.json`](test-cases.json), [`registro.feature`](registro.feature),
[`traceability.md`](traceability.md). Estrategia de referencia: [`../estrategia.md`](../estrategia.md).

---

## 1. Objetivo

Verificar que el formulario de `/registro` aplica las siete reglas de la
especificación (REQ-R01 a R07) y que **el resultado que el aspirante percibe
coincide con el resultado real del sistema** (REQ-R08, derivado).

Ese segundo objetivo no es decorativo: es la razón por la que este plan existe en
esta forma. En este producto ya se observó que la pantalla puede anunciar un
registro exitoso mientras la API lo rechaza. Un plan que verifique solo lo visible
daría por buena esa mentira.

---

## 2. Alcance

### En alcance

- Flujo de registro de estudiantes en `/registro`.
- Requisitos REQ-R01 a REQ-R07 de la especificación, más REQ-R08 derivado.
- Capa de interfaz web, con la respuesta de `POST /api/register` como oráculo.

### Fuera de alcance

| Fuera de alcance | Motivo |
|---|---|
| Las otras 8 secciones de la especificación (login, catálogo, inscripción, progreso, sesión, reserva, listado, CV) | El proyecto final cubre únicamente Registro |
| Pruebas de contrato de `POST /api/register` de forma independiente de la UI | La API se usa como oráculo del flujo de interfaz, no se prueba por separado. Ampliación natural |
| Validación del lado del servidor evadiendo el formulario | Requiere peticiones directas; queda fuera del mínimo |
| Seguridad: inyección, XSS en el campo nombre, enumeración de usuarios por el mensaje de email duplicado | Fuera del mínimo funcional |
| Concurrencia: dos aspirantes registrando el mismo email simultáneamente | No se prueba carga ni condiciones de carrera |
| Persistencia real y entrega de correo | La verificación termina en la respuesta de la API |
| Accesibilidad (axe-core) | Anexo opcional de la consigna, no comprometido |

---

## 3. Estrategia de prueba

### Reglas de método heredadas de la Fase 0

| Regla | Enunciado |
|---|---|
| **Oráculo** | Nivel 1: la respuesta de `POST /api/register` decide APROBADO o FALLIDO. Nivel 2: el mensaje en pantalla se verifica **además**. Nivel 3: el texto de error de la app **no** se usa jamás para derivar un resultado esperado, porque es circular |
| **Aislamiento** | Una sola variable por caso; el resto de los campos en valores válidos centrales |
| **Evidencia** | La produce quien firma el caso, con interacción real de usuario y captura de Network o export HAR |

**Excepción declarada al oráculo:** REQ-R01 espera bloqueo del lado del cliente. En
esos siete casos el oráculo primario es la **ausencia** de petición en Network,
igual de verificable que un código de estado.

### Técnicas aplicadas

| Técnica | Requisitos donde se aplica | Por qué ahí |
|---|---|---|
| **Valores límite** | REQ-R02 (1, 2, 50, 51), REQ-R04 (7, 8, 64, 65), REQ-R05 (15, 16, 99, 100) | Son las tres reglas con rangos numéricos explícitos. Cada límite se prueba por sus cuatro valores: el inválido y el válido de cada extremo |
| **Partición de equivalencia** | REQ-R01 (campos vacíos), REQ-R03 (clases de formato de email), REQ-R07 (email nuevo vs. existente) | Reglas categóricas sin rango numérico: alcanza con un representante por clase |
| **Verificación de post-condición** | REQ-R06 | No valida una entrada sino el estado del formulario después de un evento |
| **Prueba de consistencia entre capas** | REQ-R08 | Compara dos observaciones de la misma interacción: lo que respondió la API y lo que muestra la pantalla |

### Cobertura objetivo

**32 casos** sobre 8 requisitos.

| Tipo | Cantidad |
|---|---|
| boundary | 12 |
| negative | 11 |
| happy_path | 6 |
| edge_case | 3 |

**Nota sobre el piso de cobertura del sistema de 5 estaciones.** La Estación 3 pide,
para requisitos de prioridad alta, *1 camino feliz + 2 negativos + 1 caso límite*.
En REQ-R02, REQ-R04 y REQ-R05 ese piso se satisface por sustitución, no por conteo
de etiquetas: los cuatro casos de valores límite **son** dos rechazos y dos
aceptaciones, y el análisis de límites es una técnica más fuerte que la cuota
genérica para reglas de rango numérico. Agregar casos sueltos solo para que
coincidan las etiquetas sería inflar el set sin agregar poder de detección.

### Casos de control

Seis casos existen para que los demás signifiquen algo, y se declaran como tales:

- `TC-R01-006` — si el formulario estuviera roto de forma permanente, los cinco
  casos de obligatoriedad pasarían igual.
- `TC-R07-001` — si el registro rechazara todo, `TC-R07-002` pasaría sin que
  REQ-R07 esté implementado.
- `TC-R08-002` — una pantalla que nunca muestre éxito sería coherente con
  `TC-R08-001` y estaría igual de rota.
- `TC-R02-002`, `TC-R02-003`, `TC-R04-002`, `TC-R04-003`, `TC-R05-002`,
  `TC-R05-003` — los bordes válidos: sin ellos, una validación excesivamente
  estricta se leería como cumplimiento.

---

## 4. Criterios de entrada y de salida

### Criterios de entrada

1. La especificación de `/documentacion` sección 1 está disponible y es la fuente
   de los resultados esperados.
2. `https://playground.calidadsinhumo.com/registro` responde.
3. Existe un mecanismo para generar emails únicos por ejecución (ver riesgo R-01).
4. Las herramientas de red del navegador están disponibles para capturar el
   código de estado de `POST /api/register`.

### Criterios de salida

1. Los 32 casos fueron ejecutados y firmados.
2. **Cada caso firmado APROBADO o FALLIDO cita el código de estado real de
   `POST /api/register`** —o la ausencia de petición, en los casos de REQ-R01— con
   su evidencia adjunta. Un caso sin esa cita se firma NO VERIFICADO, nunca APROBADO.
3. Los casos indeterminados por especificación (`TC-R01-007`, `TC-R07-003`) están
   documentados como preguntas abiertas al responsable del producto, no como
   defectos.
4. Cada FALLIDO tiene su entrada en el reporte de bugs, con pasos reproducibles y
   evidencia de red.
5. No queda ningún caso en estado pendiente sin motivo declarado.

---

## 5. Lista de casos de prueba

| TC ID | REQ | Descripción | Tipo | Prioridad |
|---|---|---|---|---|
| TC-R01-001 | REQ-R01 | Los cuatro campos vacíos bloquean el envío | negative | Alta |
| TC-R01-002 | REQ-R01 | Solo el nombre vacío, resto válido | negative | Alta |
| TC-R01-003 | REQ-R01 | Solo el email vacío, resto válido | negative | Alta |
| TC-R01-004 | REQ-R01 | Solo la contraseña vacía, resto válido | negative | Alta |
| TC-R01-005 | REQ-R01 | Solo la edad vacía, resto válido | negative | Alta |
| TC-R01-006 | REQ-R01 | Los cuatro campos completos permiten el envío | happy_path | Media (control) |
| TC-R01-007 | REQ-R01 | Campo con solo espacios en blanco | edge_case | Informativa |
| TC-R02-001 | REQ-R02 | Nombre de 1 carácter | boundary | Alta |
| TC-R02-002 | REQ-R02 | Nombre de 2 caracteres exactos | boundary | Media (control) |
| TC-R02-003 | REQ-R02 | Nombre de 50 caracteres exactos | boundary | Media (control) |
| TC-R02-004 | REQ-R02 | Nombre de 51 caracteres | boundary | Alta |
| TC-R03-001 | REQ-R03 | Email con arroba y dominio con punto | happy_path | Media (control) |
| TC-R03-002 | REQ-R03 | Email sin arroba | negative | Alta |
| TC-R03-003 | REQ-R03 | Email con arroba pero sin dominio | negative | Alta |
| TC-R03-004 | REQ-R03 | Email con dominio sin punto | negative | Alta |
| TC-R03-005 | REQ-R03 | Dominio de primer nivel atípico pero válido | edge_case | Media |
| TC-R04-001 | REQ-R04 | Contraseña de 7 caracteres | boundary | Alta |
| TC-R04-002 | REQ-R04 | Contraseña de 8 caracteres exactos | boundary | Media (control) |
| TC-R04-003 | REQ-R04 | Contraseña de 64 caracteres exactos | boundary | Media (control) |
| TC-R04-004 | REQ-R04 | Contraseña de 65 caracteres | boundary | **Alta — riesgo conocido** |
| TC-R05-001 | REQ-R05 | Edad de 15 años | boundary | Alta |
| TC-R05-002 | REQ-R05 | Edad de 16 años exactos | boundary | Media (control) |
| TC-R05-003 | REQ-R05 | Edad de 99 años exactos | boundary | Media (control) |
| TC-R05-004 | REQ-R05 | Edad de 100 años | boundary | Alta |
| TC-R06-001 | REQ-R06 | El formulario queda vacío tras un éxito confirmado | happy_path | Alta |
| TC-R06-002 | REQ-R06 | El formulario conserva los datos tras un rechazo | negative | Alta |
| TC-R06-003 | REQ-R06 | Dos registros consecutivos sin arrastre | edge_case | Alta |
| TC-R07-001 | REQ-R07 | Email no registrado es aceptado | happy_path | Media (control) |
| TC-R07-002 | REQ-R07 | Email ya registrado es rechazado | negative | Alta |
| TC-R07-003 | REQ-R07 | Mismo email con distinta capitalización | edge_case | Informativa |
| TC-R08-001 | REQ-R08 | Un rechazo de la API no se muestra como éxito | negative | **Alta — riesgo conocido** |
| TC-R08-002 | REQ-R08 | Una aceptación de la API se muestra como éxito | happy_path | Media (control) |

**Orden de ejecución:** REQ-R01 primero (no llega a la API ni consume datos), luego
REQ-R02 a REQ-R05 (una variable por caso), después REQ-R06, y REQ-R07 al final
porque `TC-R07-002` **depende** del email que registra `TC-R07-001`. REQ-R08 se
observa durante `TC-R04-004` y `TC-R01-006`, sin ejecuciones adicionales.

---

## 6. Riesgos identificados

| ID | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| **R-01** | **Datos no únicos.** Cada registro exitoso consume un email de forma permanente. Si los emails no se generan únicos por ejecución, la suite pasa la primera vez y falla la segunda por REQ-R07 | Alto — vuelve la suite no repetible, que es el defecto más caro en automatización | Generar el email con un componente único por corrida (marca de tiempo o UUID). Es la razón del marcador `{EMAIL_UNICO}` en los datos de prueba |
| **R-02** | **Acoplamiento REQ-R06 → REQ-R07.** `TC-R07-002` necesita el email que registró `TC-R07-001` | Medio — el orden de ejecución deja de ser libre | Dependencia declarada en el caso y en el orden de ejecución. No se esconde |
| **R-03** | **Entorno compartido sin control del estado inicial.** Otras personas prueban contra el mismo playground | Medio — un resultado inesperado puede venir de datos ajenos | Emails únicos por corrida; ante un resultado sorpresivo, reproducir antes de reportar |
| **R-04** | **Contar caracteres a ojo.** Los casos de 50, 51, 64 y 65 caracteres son indistinguibles visualmente | Alto — un caso límite mal construido invalida silenciosamente la conclusión | Generar y contar las cadenas por herramienta, nunca a ojo. Está escrito en los pasos de cada caso afectado |
| **R-05** | **Tentación de firmar leyendo la pantalla.** Es más rápido que abrir Network, y es exactamente lo que invalidó el intento anterior | **Crítico** — produce casos que parecen verificados y no lo están | Criterio de salida 2: sin cita del código de estado real, el caso se firma NO VERIFICADO |
| **R-06** | **Sin acceso a los datos registrados.** No hay forma de confirmar el alta más allá de lo que devuelve la API | Bajo | Declarado como límite del alcance: la verificación termina en la respuesta |

---

## Desviaciones respecto del sistema de 5 estaciones

Tres, todas deliberadas:

1. **IDs de requisito.** La Estación 2 pide `REQ-001`, `REQ-002`… Se conservan los
   IDs de la especificación (`REQ-R01` a `REQ-R07`). Renumerar rompería la
   trazabilidad con la fuente de verdad, que es lo único que sostiene los
   resultados esperados. Los IDs de caso sí siguen el formato de la Estación 3,
   adaptados como `TC-R01-001`.
2. **Ubicación de los artefactos.** La salida va a `docs/qa/` en vez de `output/`,
   para respetar la convención del proyecto, donde la documentación vive en `docs/`.
3. **Piso de cobertura.** Sustituido por análisis de valores límite en REQ-R02,
   REQ-R04 y REQ-R05, según lo explicado en la sección 3.

Además, un requisito derivado (**REQ-R08**) se agregó siguiendo la instrucción de
la Estación 2 de extraer también los requisitos implícitos. Está marcado como
`source: implícito` con su justificación, para que nunca se confunda con una regla
escrita en la especificación.
