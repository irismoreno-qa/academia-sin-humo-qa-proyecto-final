# Workflow de hallazgos — documentar y avanzar

Procedimiento para registrar lo que aparezca durante la ejecución de los casos —a
mano en la Fase 2, automatizada en la Fase 3— **sin interrumpir el avance**.

Las dos vías escriben en la misma bitácora y desembocan en un único reporte.

```
Fase 2 · manual         ─┐
                          ├──▶  bitacora-de-hallazgos.md  ──▶  reporte-de-bugs.md
Fase 3 · automatización ─┘
```

---

## Las tres reglas que gobiernan

**1. Documentás y seguís.** No investigás, no reproducís variantes, no buscás la
causa raíz, no arreglás nada. Con una sola excepción innegociable: **la evidencia se
captura en el momento**, porque es lo único que no se recupera después sin volver a
ejecutar.

**2. Nunca se modifica la expectativa de un test solo para que pase.** Si el
comportamiento observado contradice el requisito, se preserva el fallo, se documenta
el hallazgo y se hace análisis de causa raíz antes de tocar el test.

La segunda es la regla de oráculo aplicada a la automatización. En el diseño se
prohíbe que el mensaje de la aplicación defina el resultado esperado; acá se prohíbe
que **el fallo** lo defina. El sistema bajo prueba no puede ser, en ningún momento,
la fuente de su propio criterio de aprobación.

**3. Ninguna causa se supone.** Un test en rojo puede ser un defecto de la
aplicación, de la automatización, de los datos, del ambiente o del requisito. Se
evalúan las cinco y se clasifica sobre evidencia, sin clasificación por defecto.

Suponer que todo fallo es un defecto del producto infla el reporte y quema la
credibilidad de quien lo firma; suponer que todo fallo es culpa del test convierte
defectos reales en falsos verdes. Son la misma pereza en direcciones opuestas, y la
regla 2 protege contra la segunda sin necesidad de sesgar el juicio hacia la primera:
**ningún test se modifica sin autorización humana, sea cual sea la clasificación.**

### Lo que NO se hace, en ninguna de las dos vías

| No hagas esto | Por qué |
|---|---|
| Detenerte a reproducir el hallazgo | Ya tenés la evidencia. Reproducir ahora es trabajo duplicado |
| Probar variantes "para entender mejor" | Eso es exploración y no está en el alcance de esta corrida. Anotalo y seguí |
| Escribir el reporte completo ahí mismo | Rompe el ritmo. La redacción se hace toda junta al final |
| Ajustar la aserción hasta que el test pase | Es convertir un defecto en un falso verde. Es el peor resultado posible del proyecto |
| Cambiar el caso de prueba a mitad de corrida | Invalida los casos ya ejecutados |
| Decidir si es bug cuando tenés dudas | Anotalo como `PREGUNTA ABIERTA` y seguí. Decidir requiere calma, no urgencia |

---

## Vía A · Hallazgo durante la ejecución manual

Una fila en [`bitacora-de-hallazgos.md`](bitacora-de-hallazgos.md) por hallazgo.
Objetivo: **menos de un minuto**.

| Campo | Qué va | Obligatorio |
|---|---|---|
| **ID** | Correlativo: `H-01`, `H-02`… | Sí |
| **Caso** | El `TC-…` donde apareció | Sí |
| **Tipo** | `DEFECTO` · `PREGUNTA ABIERTA` · `NO ES DEFECTO` | Sí |
| **Esperado** | Lo que dice la especificación, en una línea | Sí |
| **Observado** | Lo que pasó, en una línea | Sí |
| **Código** | El código real de `POST /api/register`, o `sin petición` | **Sí — sin esto el hallazgo no vale** |
| **Evidencia** | Nombre del archivo en `evidence/` | Sí |

### Las tres clasificaciones

| Tipo | Cuándo | Qué pasa al final |
|---|---|---|
| **DEFECTO** | El comportamiento **contradice** una regla escrita de la especificación | Se expande a reporte completo |
| **PREGUNTA ABIERTA** | La especificación **no define** el caso, no hay contra qué contrastar | Va a consultas al responsable del producto. **No se reporta como bug** |
| **NO ES DEFECTO** | Te sorprendió, pero al contrastar con la spec el comportamiento **es correcto** | Se documenta igual, como constancia de que se verificó y se descartó |

La tercera parece innecesaria y no lo es: sin ella, quien lee el trabajo no puede
distinguir *"lo verificó y estaba bien"* de *"no lo miró"*.

---

## Vía B · Fallo durante la automatización

Cuando un test se pone en rojo, el agente analiza; la QA decide. El agente nunca
toca el test.

```
test falla
   ↓
skill analizar-fallo
   ├── traza el TC y su requisito
   ├── registra esperado (de la spec) contra observado (del error real)
   ├── guarda evidencia en evidence/
   ├── evalúa LAS CINCO causas: aplicación · automatización · datos · ambiente · requisito
   ├── clasifica sobre evidencia (sin clasificación por defecto)
   ├── determina si bloquea otros casos
   └── recomienda UNA acción
   ↓
entrada H-0X en la bitácora, con el campo Decisión VACÍO
   ↓
◆ GATE HUMANO — la QA revisa y completa Decisión
   ↓
continúa la automatización
```

### Qué hace el agente

Procedimiento completo en
[`.agents/skills/analizar-fallo/SKILL.md`](../../.agents/skills/analizar-fallo/SKILL.md).
Lo esencial:

- **El esperado se lee de `test-cases.json`, no de la aserción del test.** Si la
  aserción estuviera mal escrita, leerla como fuente de verdad blanquearía el error.
- **El código real de `POST /api/register` es obligatorio.** Sin él no hay contra qué
  contrastar, y el análisis se clasifica `NO_CONCLUYENTE`. Nunca se infiere.
- **No hay clasificación por defecto.** Se evalúan las cinco causas y se clasifica
  sobre evidencia. Suponer que todo fallo es un defecto de la aplicación es tan
  perezoso como suponer que todo fallo es culpa del test.
- **Un test bloqueado no se ejecuta ni se cuenta como fallido.** Se marca
  `BLOQUEADO` con el `TC-…` que lo bloquea; contarlo inflaría el número de defectos
  con un solo defecto real.

| Clasificación | Qué la sostiene | Qué se hace con el test | Recomendación |
|---|---|---|---|
| `POSIBLE_DEFECTO` | Contradice la regla del requisito, confirmado por el código real de la API | Se preserva el fallo. **No se toca** | `REGISTRAR HALLAZGO` |
| `PROBLEMA_DE_AUTOMATIZACIÓN` | La API respondió según la spec; falló la aserción, el locator o la espera | Se **propone** la corrección. No se aplica | `PROPONER CORRECCIÓN DEL TEST` |
| `PROBLEMA_DE_DATOS` | El fallo se explica por el estado de los datos, no por el comportamiento del sistema | Se **propone** el ajuste. No se aplica | `PROPONER AJUSTE DE DATOS` |
| `PROBLEMA_DE_AMBIENTE` | App caída, `5xx` generalizado, o falla también el smoke | Se detiene la corrida | `DETENER CORRIDA` |
| `PROBLEMA_DE_REQUISITO` | La especificación no define el caso o admite más de una lectura | No es defecto | `CONSULTAR AL PRODUCTO` |
| `NO_CONCLUYENTE` | La evidencia no sostiene ninguna de las anteriores | Nada, todavía | `REEJECUTAR CON MÁS EVIDENCIA` |

**`POSIBLE_DEFECTO` dice *posible* a propósito.** La skill reúne evidencia y propone;
confirmar un defecto es una afirmación sobre el producto y la firma un humano.

**`PROBLEMA_DE_DATOS` es una clasificación propia y no un subtipo de error de
automatización**, porque es la causa más probable en este proyecto: el riesgo R-01
del plan de prueba dice que cada registro exitoso consume un email de forma
permanente, y si no se generan únicos por corrida, la suite pasa la primera vez y
falla la segunda por REQ-R07. Sin esta clase, ese fallo se leería como test roto y se
saldría a arreglar un test que está perfecto.

**`NO_CONCLUYENTE` es una salida válida, no una derrota.** Obliga a declarar qué
información falta, que es más honesto que forzar una clasificación con evidencia
insuficiente.

### El gate humano

El agente escribe `PROPUESTA` y deja `Decisión` en blanco. **Ni el agente ni la
skill usan la palabra `ACEPTADO`: pertenece exclusivamente al gate humano**, igual
que en el resto de las skills del proyecto.

En el gate, la QA hace una de tres cosas:

| Decisión | Qué significa |
|---|---|
| `ACEPTADO — <acción>` | La propuesta se confirma y se ejecuta |
| `RECLASIFICADO — <tipo> — <motivo>` | El agente clasificó mal. Manda el criterio humano |
| `ESCALADO — <motivo>` | No hay información suficiente para decidir todavía |

**Solo el gate humano puede autorizar tocar un test.** Es lo que convierte la regla 2
en algo operativo y no en una buena intención.

### La traza que queda

Cada fallo deja esta cadena, que es exactamente lo que hace auditable el proceso:

```
test falla → analizar-fallo → H-001 → evidencia → PROPUESTA → decisión humana → continúa
```

---

## Cierre · Reporte, al terminar la corrida

Recién acá se expande cada entrada `DEFECTO` de la bitácora a un reporte completo en
`reporte-de-bugs.md`, con el checklist ISTQB de reporte mínimo viable:

- [ ] Título claro que describe el problema **y** dónde ocurre
- [ ] Pasos de reproducción que otra persona pueda seguir
- [ ] Resultado esperado vs. resultado real
- [ ] Entorno: navegador, sistema operativo, URL, fecha
- [ ] Impacto, alcance y frecuencia (siempre / a veces / raro)
- [ ] Severidad
- [ ] Evidencia adjunta
- [ ] Requisito y caso de prueba relacionados

Regla de calidad: **reducir a la reproducción mínima confiable.** Si el defecto
aparece con tres campos inválidos pero también con uno solo, el reporte usa uno solo.

Y al cerrar, actualizar la **matriz de trazabilidad de resultados** del README, que
es donde se ve el estado de los 32 casos de un vistazo.

---

## Dos decisiones tomadas para este contexto

### Severidad sí, prioridad no

- **Severidad** — qué tan grave es el problema para el usuario o el sistema.
- **Prioridad** — con qué urgencia debe corregirse, dadas las planificaciones.

Se asigna severidad y **no** se asigna prioridad. No hay equipo de desarrollo, no hay
plan de release y nadie va a corregir estos defectos. Poner `P0/P1/P2` sería inventar
un dato. La prioridad la fija quien recibe el reporte, y el reporte lo dice.

| Severidad | Definición |
|---|---|
| **Crítica** | El sistema no puede operar, o hay pérdida de datos o impacto en seguridad |
| **Alta** | Funcionalidad principal afectada. Workaround muy difícil o imposible |
| **Media** | Funcionalidad afectada pero existe un workaround razonable |
| **Baja** | Impacto cosmético o menor. No afecta la funcionalidad |

### El ciclo de vida se trunca, y se declara

El ciclo completo es *Nuevo → Asignado → En progreso → Resuelto → Retesting →
Cerrado*, con ramas a *Rechazado*, *Diferido* y *Reabierto*.

Acá los defectos llegan hasta **`REPORTADO`** y ahí se quedan: no hay a quién
asignarlos ni un fix que reverificar. Se declara en el reporte para dejar claro que
el ciclo se conoce completo y se cortó por contexto, no por desconocimiento.
