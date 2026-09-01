# Veredicto del juez — casos de prueba de Registro

Los 32 casos diseñados se pasaron por el **juez con rúbrica** construido en el curso
(workflow `casos-con-juez`): traduce los casos a Gherkin y los puntúa contra cuatro
criterios de 1 a 3.

Este documento registra el veredicto, lo que el juez señaló como faltante, y **qué se
aceptó y qué se rechazó**. La última parte es la que importa: el juez propone, el
criterio de la QA gana.

---

## Declaración de conflicto de interés

Los casos y el juicio salieron del mismo agente. Se deja dicho porque cambia cómo hay
que leer las notas altas: valen menos que las bajas.

Para compensar, el juicio se hizo contra **evidencia que no estaba disponible durante
el diseño** —el HTML real del formulario, que estaba en `evidence/` y no se había
leído— en lugar de contra el recuerdo de haberlo escrito. Las dos notas que bajaron
salieron de ahí.

---

## Rol 1 — Traducción a Gherkin

No se regeneró. La traducción ya existía en [`registro.feature`](registro.feature),
producida por la estación 4 del sistema de 5 estaciones y validada contra
`test-cases.json`.

Generar un Gherkin paralelo para juzgarlo habría creado dos versiones de la verdad, y
el juez habría evaluado un artefacto distinto del que está en el repositorio.

---

## Rol 2 — Puntaje

| Criterio | Puntaje | Sustento |
|---|:--:|---|
| **Cobertura** | **3** | Camino feliz (6), errores (11), límites (12), alternativos (3). Cada requisito tiene su lado válido y su lado inválido. Los tres rangos numéricos tienen los cuatro valores límite; el email tiene cinco clases de equivalencia |
| **Claridad** | **3** | Cada caso trae precondición, pasos, dato concreto y resultado esperado. Los casos de 50, 51, 64 y 65 caracteres exigen contar por herramienta y no a ojo |
| **Casos límite** | **2** | Los bordes de la especificación están completos. Los de la implementación, no — ver abajo |
| **Gherkin** | **2** → **3** | Estructuralmente correcto, pero tres escenarios tenían un paso no asertable. Corregido en `aa35921` |

### Puntaje: **10 / 12** en el veredicto original · **11 / 12** tras la corrección

**Veredicto: LISTO** (10–12). En el piso de la banda al momento del juicio.

### Por qué Casos límite bajó a 2

El HTML del formulario declara `min="1" max="150"` en el campo de edad. La
especificación dice **16 a 99**. Son dos fronteras distintas y por lo tanto dos
caminos de código distintos.

Los casos prueban 15, 16, 99 y 100 — todos cruzan solo la frontera de la
especificación. Ninguno cruza la del HTML. Y esa frontera es justo donde vive el
riesgo central del proyecto: la divergencia entre lo que valida el cliente y lo que
valida el servidor.

### Por qué Gherkin bajó a 2

Tres escenarios tenían pasos que describían actividad de quien prueba en vez de
comportamiento del producto:

```gherkin
Then se registra el comportamiento real del sistema como pregunta abierta
And el caso no se marca ni como aprobado ni como fallido
And el caso se documenta como limite de interpretacion y no como defecto
```

Un `Then` declara qué hace el sistema. Que un caso no se firme es una propiedad del
caso, no un comportamiento del producto: no es verificable y no pertenece a un paso.

---

## QUÉ FALTA — lo que el juez señaló

| # | Señalamiento | Decisión | Motivo |
|---|---|---|---|
| 1 | **Edad fuera del rango del HTML**: `0`, `-5`, `151`. `min="1" max="150"` contra 16–99 de la spec | **RECHAZADO** | Decisión de alcance de la QA. El proyecto cubre las reglas escritas en la especificación, no los atributos del formulario |
| 2 | **Email con espacios al inicio o al final** — `" iris@gmail.com "` | **RECHAZADO** | Fuera del alcance acordado |
| 3 | **Doble envío rápido** — dos clics seguidos en Crear cuenta | **RECHAZADO** | La estrategia declara la concurrencia fuera de alcance |
| 4 | **Contraseña con espacios** — `"Clave 1234"` | **RECHAZADO** | Fuera del alcance acordado |
| 5 | **Corregir los `Then` no asertables** | **ACEPTADO** | Es un defecto de forma, no un caso nuevo. Corregido sin agregar cobertura |

**Cuatro de cinco señalamientos se rechazaron.** No por comodidad: los cuatro proponen
ampliar la cobertura, y ampliar por cantidad es exactamente lo que la estrategia
declara que no se hace. El único aceptado corregía un defecto real de forma.

El puntaje de Casos límite se mantuvo en **2** después de la decisión. Un juez que
sube la nota cuando le dicen que no haga algo no es un juez.

---

## Lo que el juez NO vio

El juez encontró **dos** pasos no asertables. Un script de validación encontró un
**tercero**, en `TC-R03-005`, que estaba en un `And` en vez de en un `Then` y se
escapó del patrón que el juez buscó.

Vale registrarlo porque es la lección del ejercicio: **el criterio y la verificación
mecánica no compiten, se cubren.** El juez razona pero no es exhaustivo; el script es
exhaustivo pero no razona — encuentra patrones, no sabe por qué están mal. Ninguno de
los dos, solo, alcanzaba.

Aplica igual en las dos direcciones: a una persona revisando lo que produce una IA, y
a una IA revisando lo que produce una persona.

---

## Lo que ninguno de los dos podía ver

Ni el juez ni el script detectaron que `TC-R08-001` se apoyaba en una premisa falsa:
usaba una contraseña de 65 caracteres para provocar un rechazo del servidor, y la
captura de evidencia posterior demostró que la API la **acepta** con `201`.

Eso no era un defecto de forma ni de cobertura. Era un supuesto sobre el
comportamiento del producto, y ningún juez que solo lea los documentos puede
refutarlo. Hizo falta ejecutar.

Corregido en `bb2f11c`: el caso pasó a usar el email duplicado, el único rechazo de
servidor observado.
