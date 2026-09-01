# Reporte del Agente POM

## Resultado de la verificación

> [!NOTE]
> ✅ **VERIFICACIÓN SUPERADA** — Rúbrica 12/12 · Exit code 0

| Dato | Valor |
|------|-------|
| Intentos usados | 2 de 3 |
| POM | `pages/registro-page.ts` |
| Test | `tests/e2e/registro.spec.ts` — 30 casos |
| Evidencia HTML | `evidence/` — 12 archivos, un estado del formulario por archivo |
| URL | `https://playground.calidadsinhumo.com/registro` |
| Fecha | 2026-09-01 |

---

## Evidencia estática — Rúbrica POM

### 1. Locators semánticos — 3/3

Controles, con etiqueta y rol reales del HTML capturado:

- `getByLabel('Nombre completo')` — `<label for="name">Nombre completo</label>`
- `getByLabel('Email')` — `<label for="email">Email</label>`
- `getByLabel('Contraseña')` — `<label for="password">Contraseña</label>`
- `getByLabel('Edad')` — `<label for="age">Edad</label>`
- `getByRole('button', { name: 'Crear cuenta' })` — `<button type="submit">Crear cuenta</button>`

Mensajes, con `getByTestId`:

- `register-name-error` · `register-email-error` · `register-password-error` · `register-age-error` · `register-success`

**Por qué no se descuenta.** La regla dice que `getByTestId` es el último recurso, no
que esté prohibido. En el HTML real los mensajes son `<p class="text-danger">` y
`<div>` sin rol, sin etiqueta y sin encabezado: **no existe un locator semántico
disponible.** El único otro handle sería su propio texto — y localizar un elemento
por el mismo texto que el test va a afirmar vuelve la aserción vacía, porque siempre
encontraría exactamente lo que busca. Localizar por `testid` y afirmar el texto en el
test mantiene separadas las dos cosas. Hay precedente en el proyecto:
`pages/login.page.ts` usa `getByTestId('login-lockout')` por el mismo motivo.

Ningún locator depende de clases CSS, posiciones ni jerarquía del DOM.

### 2. Aserciones fuera — 3/3

- El POM no contiene `expect`, `assert`, `toBe`, `toBeVisible` ni ningún método de
  verificación. Verificado por grep: 0 coincidencias.
- Las 100 aserciones viven en `tests/e2e/registro.spec.ts`.

### 3. Estructura POM — 3/3

- `private readonly page: Page` en el constructor.
- Once locators `readonly` públicos, todos inicializados en el constructor.
- Tipos importados desde `@playwright/test`; clase exportada como `RegistroPage`.
- Tipo `DatosRegistro` exportado para que el test declare sus datos sin duplicar la forma.

### 4. Acciones limpias — 3/3

- `goto()` separado de las acciones, con la ruta relativa `/registro` consistente con
  el `baseURL` de `playwright.config.ts`.
- `completar(datos)`, `submit()` y `registrar(datos)` con parámetros explícitos.
- Ninguna acción devuelve aserciones ni interpreta resultados.

**Total: 12/12**

---

## Evidencia ejecutable

```
Comando : npx playwright test tests/e2e/registro.spec.ts --project=chromium
Exit code : 0
Tests     : 30 pasados · 0 fallados
Duración  : 1.1 m

Reproducibilidad — tres corridas seguidas:
  corrida 1 · exit=0 · 30 passed (1.1m)
  corrida 2 · exit=0 · 30 passed (1.1m)
  corrida 3 · exit=0 · 30 passed (1.1m)
```

Cinco de los 30 están anotados con `test.fail()` porque el producto incumple la
especificación en esos puntos. **La aserción no se debilita en ninguno**: el test
ejecuta las mismas afirmaciones y Playwright verifica que efectivamente fallen. El
día que el producto se corrija, esos cinco pasarán a rojo avisando que hay que
quitar la anotación.

Prohibiciones de la consigna, verificadas por grep sobre `tests/` y `pages/`:
`waitForTimeout` 0 · `test.skip` 0 · `.only` 0.

---

## Cambios realizados

### Intento 1 — 25 pasados, 5 fallados

Se creó `pages/registro-page.ts` con los once locators derivados del HTML capturado y
`tests/e2e/registro.spec.ts` con los 30 casos automatizables.

Dos de los fallos reportaron **"Expected to fail, but passed"** sobre defectos que ya
estaban confirmados con evidencia. La causa no era el POM ni el producto: las
aserciones sobre la red se evaluaban antes de que llegara la respuesta, y siendo
negativas, encontraban exactamente la ausencia que buscaban. **Un defecto real se
estaba leyendo como comportamiento correcto.**

Un tercer fallo, `CP-14`, resultó ser un defecto de producto no observado hasta
entonces: `irismoreno@`, sin dominio, se acepta con `201`.

### Intento 2 — 30 pasados

- **POM:** se agregó el locator `errores`, unión explícita de los cuatro mensajes de
  error. Sirve únicamente para esperar a que un envío quede resuelto; no afirma nada.
- **Test:** se agregó `esperarResultado()`, que espera a una condición observable —o
  llegó una respuesta de la API, o apareció un error— antes de aseverar sobre la red.
  Sin espera por tiempo fijo.
- **Test:** `CP-14` pasó a `test.fail()` con la referencia al hallazgo H-05.

**Ninguna expectativa fue modificada para fabricar un verde.** La corrección fue en la
sincronización, no en lo que se afirma. El efecto fue el contrario al de un falso
verde: dos tests que pasaban en vacío pasaron a fallar de verdad, y su fallo quedó
declarado como esperado contra un defecto documentado.

---

## Alcance de esta verificación

**Qué demuestra.** Que el POM localiza los once elementos del formulario en la
aplicación real, que las 100 aserciones de los 30 casos corren contra el producto en
vivo, y que el resultado es idéntico en tres corridas consecutivas.

**Qué NO demuestra.**

- Que el servidor aplique las reglas que el cliente bloquea. En REQ-R01, R02 y R05 el
  formulario impide el envío y la petición que probaría al servidor nunca se emite.
- Que los cinco tests anotados con `test.fail()` sigan siendo correctos si el producto
  cambia: si se corrigen los defectos, hay que quitar las anotaciones.
- Nada sobre el resto del producto. `tests/login.spec.ts` falla por un dato de prueba
  obsoleto (`POST /api/login` → `401`), registrado como H-06 y fuera del alcance
  declarado.

---

## Estado del workflow

**Estado automático: CANDIDATO**
**Decisión humana: ACEPTADO — 2026-09-01, Iris Moreno**

Rúbrica 12/12 y exit code 0 en tres corridas consecutivas. El POM y la suite E2E
quedan aceptados como base de la Fase 2.

Punto que necesita decisión además de la aceptación: **`tests/registro.spec.ts`**
—el smoke de visibilidad del andamiaje del curso— quedó fuera de `tests/e2e/` y su
cobertura ya está contenida en `CP-01` a `CP-06`. Conviene moverlo o eliminarlo para
que no haya dos suites de registro en el repositorio.
