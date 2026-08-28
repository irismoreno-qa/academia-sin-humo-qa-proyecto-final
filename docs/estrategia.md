# Estrategia de pruebas — Academia sin Humo

## Riesgo principal

- **Riesgo:** que un estudiante quede en un estado inconsistente o inseguro sin que
  el producto se lo avise — se registra pero su sesión no persiste, se inscribe en
  un curso que no debería (prerequisito no cumplido) porque la API no aplica las
  mismas reglas que la UI, o pierde datos porque un formulario no valida lo que la
  spec promete.
- **A quién afecta y cómo:** al estudiante, que pierde tiempo o queda con datos
  corruptos (cuenta duplicada, inscripción inválida, progreso perdido); y al
  negocio, porque un cupo mal contado o una inscripción que se coló sin
  prerequisito rompe la integridad del catálogo y la confianza en la plataforma.

Ya sabemos, por lo visto en clase (S16), que hay una sospecha concreta en esta
línea: `POST /api/login` crea la cookie `ash_session`, pero `GET /api/auth/me` con
esa cookie devuelve `realUser: null` y la sesión no sobrevive una recarga. Es la
pista de arranque de la consigna y encaja directo con el riesgo principal: un
usuario que "inicia sesión" pero cuya sesión no es real.

## Flujos evaluados

| Flujo | Frecuencia | Valor/Riesgo | ¿Automatizo? | Capa (UI/API/integrado) | Por qué |
|---|---|---|---|---|---|
| Registro (`/registro`, REQ-R01–R07) | Alta — es la puerta de entrada, todo estudiante pasa por acá | Alta — valida datos obligatorios, formato de email, límites de contraseña/edad, no-duplicados | **Sí** | UI (E2E) | Es el flujo que nunca se probó y es el más fácil de romper con datos límite; buen candidato para Page Object + casos por partición de equivalencia y valores límite |
| Login (`/login`, REQ-L01–L04) | Alta — cada sesión pasa por acá | Alta — ya hay un bug de sesión sospechado | Ya construido en el curso | UI (ya existe `tests/login.spec.ts`) | Se mantiene tal cual; no es el foco de este proyecto pero se reutiliza como base |
| Sesión y autenticación (REQ-S01, S02) | Alta — afecta cada página protegida | **Crítica** — bug ya detectado (`ash_session` / `realUser: null`) | **Sí, como investigación puntual** | API + integrado (no suite completa) | No hace falta automatizar todo el modelo de sesión para que valga: alcanza con reproducirlo, caracterizarlo y reportarlo con evidencia |
| Catálogo e inscripción (REQ-C01–C06) | Alta — es donde se juega el negocio (cupos, prerequisitos) | Alta — la regla estrella REQ-C06 exige paridad UI/API | **Sí** | API + integrado | REQ-C06 es exactamente el patrón API-prepara / UI-verifica visto en S16; si falla, es el mejor hallazgo posible del proyecto |
| Progreso del estudiante (REQ-P01–P05) | Media | Alta — máquina de estados, certificado no debe duplicarse | No (declarado) | — | Máquina de estados completa requiere más tiempo del que da el alcance mínimo; queda fuera y se documenta |
| Reserva de fecha (REQ-D01–D03) | Baja-Media | Media | No | — | Menor impacto que catálogo/registro/sesión |
| Listado de estudiantes (REQ-N01–N03) | Baja | Baja | No | — | Paginación es de bajo riesgo de negocio |
| Subida de CV (REQ-U01–U03) | Baja | Media (seguridad: tipo y tamaño de archivo) | No | — | Interesante por seguridad, pero no entra en el mínimo; queda como candidato si sobra tiempo |

## Alcance elegido

**Lo que SÍ entra:**
- E2E completo de Registro (REQ-R01 a R07) con Page Object, cubriendo campos
  obligatorios, límites de nombre/contraseña/edad, formato de email, limpieza del
  formulario tras éxito y rechazo de email duplicado.
- 4 tests de API contra `POST /api/enroll` (camino feliz, falta `courseId`,
  `courseId` inexistente, body vacío/malformado) + verificación de cupo con
  `GET /api/courses` antes y después.
- 1 flujo integrado sobre **REQ-C06**: la API intenta inscribir en un curso con
  prerequisito pendiente, y se verifica que la UI y la API coinciden en el
  rechazo.
- Investigación dirigida y reporte del bug de sesión (REQ-S01/S02) detectado en
  clase, con reproducción y evidencia — no requiere una suite automatizada
  completa.
- Suite corriendo en CI (ampliando el smoke actual).
- Reporte de bugs con al menos un hallazgo real (candidato principal: el bug de
  sesión; se suman los que aparezcan al testear Registro).

**Lo que NO entra, y por qué:**
- Progreso del estudiante (máquina de estados completa): requiere más tiempo del
  que permite el alcance mínimo del proyecto.
- Reserva de fecha de inicio: menor riesgo de negocio que registro/catálogo/sesión.
- Listado paginado de estudiantes: riesgo bajo, no crítico para el negocio.
- Subida de CV: interesante por seguridad de archivos, pero fuera del mínimo;
  queda como ampliación posible si sobra tiempo.
- Accesibilidad con axe-core: es el anexo opcional de la consigna; no se descarta,
  pero no es parte del alcance comprometido.

**Lo que NO voy a poder demostrar con estas pruebas:**
- Que el resto del producto (progreso, certificados, reservas, listado de
  estudiantes, subida de CV) esté libre de bugs — no fue probado.
- Que el registro y la inscripción se comporten igual bajo carga concurrente o
  con volúmenes altos de usuarios simultáneos.
- Que el modelo de sesión sea seguro de punta a punta — solo se caracteriza el
  bug puntual encontrado (`ash_session` / `realUser: null`), no se audita todo el
  manejo de sesión, tokens o expiración.
- Que la accesibilidad del formulario de registro cumpla WCAG — no se ejecutó el
  anexo de axe-core en esta iteración.
