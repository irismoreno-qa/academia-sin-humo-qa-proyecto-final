# Bitácora de hallazgos — ejecución de los 32 casos

Registro en crudo, escrito **durante** la ejecución. Una fila por hallazgo, menos de
un minuto cada una. El análisis, la severidad y la redacción van después, en
`reporte-de-bugs.md`.

Procedimiento: [`workflow-hallazgos.md`](workflow-hallazgos.md).

**Entorno de la corrida** — completar antes de empezar:

| | |
|---|---|
| URL | `https://playground.calidadsinhumo.com/registro` |
| Navegador y versión | |
| Sistema operativo | |
| Fecha de la corrida | |
| Ejecutado por | |

---

## Hallazgos

| ID | Caso | Tipo | Esperado (según la spec) | Observado | Código | Evidencia |
|---|---|---|---|---|---|---|
| | | | | | | |

**Tipo:** `DEFECTO` · `PREGUNTA ABIERTA` · `NO ES DEFECTO`
**Código:** el código de estado real de `POST /api/register`, o `sin petición` cuando se espera bloqueo del cliente. Sin este dato el hallazgo no vale.

---

## Notas

Lo que no entra en una línea de la tabla. Referenciar por ID.

<!--
H-0X — nota
-->

---

## Casos ya previstos como PREGUNTA ABIERTA

Estos dos ya se sabe que no tienen resultado esperado en la especificación. Cuando se
ejecuten, van directo a `PREGUNTA ABIERTA` — se documenta el comportamiento real y no
se firman ni aprobados ni fallidos.

| Caso | Qué no define la especificación |
|---|---|
| `TC-R01-007` | Si un campo con solo espacios en blanco cuenta como vacío |
| `TC-R07-003` | Si la comparación de emails duplicados distingue mayúsculas de minúsculas |

---

## Control de la corrida

| | |
|---|---|
| Casos ejecutados | 0 / 32 |
| Hallazgos tipo DEFECTO | 0 |
| Hallazgos tipo PREGUNTA ABIERTA | 0 |
| Hallazgos tipo NO ES DEFECTO | 0 |
| Casos sin verificar (sin código de estado citable) | 0 |

La última fila es la que importa: un caso sin código de estado citable **no es un
caso aprobado**, es un caso sin verificar. Si al terminar ese número no es cero, la
corrida no está cerrada.
