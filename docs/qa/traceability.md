# Matriz de Trazabilidad — Academia sin Humo · Registro de estudiantes

Documento funcional de origen: `https://playground.calidadsinhumo.com/documentacion`,
sección 1 — Registro de estudiantes, REQ-R01 a REQ-R07.
Escenarios BDD en [`registro.feature`](registro.feature); cada uno lleva su etiqueta
`@TC-…` y `@req-…`, de modo que la trazabilidad es ejecutable y no solo documental.

---

## Requisito → casos → escenarios

| REQ ID | Descripción | TC IDs | Escenarios BDD | Cobertura |
|---|---|---|---|---|
| **REQ-R01** | Los cuatro campos son obligatorios | TC-R01-001 · TC-R01-002 · TC-R01-003 · TC-R01-004 · TC-R01-005 · TC-R01-006 · TC-R01-007 | `@req-REQ-R01` (7 escenarios) | **Completa** — los 4 campos aislados + los 4 vacíos a la vez + control positivo + 1 ambigüedad abierta |
| **REQ-R02** | Nombre entre 2 y 50 caracteres | TC-R02-001 · TC-R02-002 · TC-R02-003 · TC-R02-004 | `@req-REQ-R02` (4 escenarios) | **Completa** — los 4 valores límite: 1, 2, 50, 51 |
| **REQ-R03** | Email con `@` y dominio con punto | TC-R03-001 · TC-R03-002 · TC-R03-003 · TC-R03-004 · TC-R03-005 | `@req-REQ-R03` (5 escenarios) | **Completa** — 1 clase válida, 3 clases inválidas (sin `@`, sin dominio, dominio sin punto), 1 límite de interpretación |
| **REQ-R04** | Contraseña entre 8 y 64 caracteres | TC-R04-001 · TC-R04-002 · TC-R04-003 · TC-R04-004 | `@req-REQ-R04` (4 escenarios) | **Completa** — los 4 valores límite: 7, 8, 64, 65 |
| **REQ-R05** | Edad entre 16 y 99 | TC-R05-001 · TC-R05-002 · TC-R05-003 · TC-R05-004 | `@req-REQ-R05` (4 escenarios) | **Completa** — los 4 valores límite: 15, 16, 99, 100 |
| **REQ-R06** | El formulario se limpia tras un registro exitoso | TC-R06-001 · TC-R06-002 · TC-R06-003 | `@req-REQ-R06` (3 escenarios) | **Completa** — cubre las dos oraciones del requisito: la limpieza tras éxito y la ausencia de arrastre entre registros consecutivos, más el contraste con el caso de rechazo |
| **REQ-R07** | No se admite un email ya existente | TC-R07-001 · TC-R07-002 · TC-R07-003 | `@req-REQ-R07` (3 escenarios) | **Completa** — rechazo del duplicado + control con email nuevo + 1 ambigüedad abierta |
| **REQ-R08** *(derivado)* | El resultado informado en pantalla coincide con el real | TC-R08-001 · TC-R08-002 | `@req-REQ-R08` (2 escenarios) | **Completa** — las dos direcciones: la API rechaza y la pantalla no miente; la API acepta y la pantalla lo informa |

**8 requisitos · 32 casos · 32 escenarios BDD · 0 requisitos sin cobertura · 0 casos huérfanos.**

---

## Caso → requisito (trazabilidad inversa)

| TC ID | REQ | Tipo | Técnica |
|---|---|---|---|
| TC-R01-001 | REQ-R01 | negative | Partición de equivalencia |
| TC-R01-002 | REQ-R01 | negative | Partición de equivalencia |
| TC-R01-003 | REQ-R01 | negative | Partición de equivalencia |
| TC-R01-004 | REQ-R01 | negative | Partición de equivalencia |
| TC-R01-005 | REQ-R01 | negative | Partición de equivalencia |
| TC-R01-006 | REQ-R01 | happy_path | Control positivo |
| TC-R01-007 | REQ-R01 | edge_case | Ambigüedad de especificación |
| TC-R02-001 | REQ-R02 | boundary | Valores límite |
| TC-R02-002 | REQ-R02 | boundary | Valores límite |
| TC-R02-003 | REQ-R02 | boundary | Valores límite |
| TC-R02-004 | REQ-R02 | boundary | Valores límite |
| TC-R03-001 | REQ-R03 | happy_path | Partición de equivalencia |
| TC-R03-002 | REQ-R03 | negative | Partición de equivalencia |
| TC-R03-003 | REQ-R03 | negative | Partición de equivalencia |
| TC-R03-004 | REQ-R03 | negative | Partición de equivalencia |
| TC-R03-005 | REQ-R03 | edge_case | Límite de interpretación |
| TC-R04-001 | REQ-R04 | boundary | Valores límite |
| TC-R04-002 | REQ-R04 | boundary | Valores límite |
| TC-R04-003 | REQ-R04 | boundary | Valores límite |
| TC-R04-004 | REQ-R04 | boundary | Valores límite |
| TC-R05-001 | REQ-R05 | boundary | Valores límite |
| TC-R05-002 | REQ-R05 | boundary | Valores límite |
| TC-R05-003 | REQ-R05 | boundary | Valores límite |
| TC-R05-004 | REQ-R05 | boundary | Valores límite |
| TC-R06-001 | REQ-R06 | happy_path | Verificación de post-condición |
| TC-R06-002 | REQ-R06 | negative | Verificación de post-condición |
| TC-R06-003 | REQ-R06 | edge_case | Verificación de post-condición |
| TC-R07-001 | REQ-R07 | happy_path | Control positivo |
| TC-R07-002 | REQ-R07 | negative | Partición de equivalencia |
| TC-R07-003 | REQ-R07 | edge_case | Ambigüedad de especificación |
| TC-R08-001 | REQ-R08 | negative | Consistencia entre capas |
| TC-R08-002 | REQ-R08 | happy_path | Consistencia entre capas |

---

## Requisitos del documento funcional fuera de esta matriz

El documento funcional completo tiene 9 secciones y 36 requisitos. Esta matriz cubre
la sección 1. Las 8 restantes quedan **sin cobertura declarada**, por alcance del
proyecto final y no por omisión:

| Sección | Requisitos | Cobertura |
|---|---|---|
| 2 · Inicio de sesión | REQ-L01 a L04 | Sin cobertura — fuera de alcance |
| 3 · Catálogo e inscripción | REQ-C01 a C06 | Sin cobertura — fuera de alcance |
| 4 · Progreso del estudiante | REQ-P01 a P05 | Sin cobertura — fuera de alcance |
| 5 · Sesión y autenticación | REQ-S01, S02 | Sin cobertura — fuera de alcance |
| 6 · API de inscripción | REQ-A01 a A03 | Sin cobertura — fuera de alcance |
| 7 · Reserva de fecha | REQ-D01 a D03 | Sin cobertura — fuera de alcance |
| 8 · Listado paginado | REQ-N01 a N03 | Sin cobertura — fuera de alcance |
| 9 · Subida de CV | REQ-U01 a U03 | Sin cobertura — fuera de alcance |

---

## Nota sobre el estado de esta matriz

Esta matriz traza **diseño**, no ejecución. Ningún caso tiene todavía resultado
obtenido, y por diseño `test-cases.json` no tiene un campo para guardarlo.

La ejecución es un artefacto aparte, con su evidencia. Mezclar diseño y ejecución en
un mismo documento es lo que permitió, en el intento anterior, que casos firmados
como aprobados no tuvieran detrás ninguna verificación real.
