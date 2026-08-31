---
name: analizar-fallo
description: Analiza un test fallido y determina de forma razonada si la causa está
  en la aplicación, la automatización, los datos, el ambiente o el requisito. Traza
  el fallo a su caso y requisito, registra esperado contra observado, clasifica y
  recomienda el siguiente paso. Nunca modifica el test ni la aserción.
---

# Skill: analizar el fallo de un test

## Entradas
- Ruta del test que falló y nombre del caso (`TC-…`).
- Salida de Playwright: comando, exit code, primer error, ruta del trace.
- Ruta de la bitácora de hallazgos.

## Reglas

- **No modificar el test.** Ni la aserción, ni el Page Object, ni la aplicación.
  Esta skill **solo analiza y registra**.
- **Nunca modificar una aserción para conseguir que el test pase.** Si el
  comportamiento observado contradice el requisito, se preserva el fallo, se
  documenta la evidencia y se hace análisis de causa raíz antes de tocar nada.
- **No asumir que todo fallo es un defecto de la aplicación.** No hay clasificación
  por defecto: se evalúan las cinco causas posibles y se clasifica sobre evidencia.
- **Analizar primero el resultado esperado y el obtenido**, antes de razonar sobre
  causas.
- **El resultado esperado se lee de `docs/qa/test-cases.json`, no de la aserción
  del test.** Si la aserción estuviera mal escrita, leerla como fuente de verdad
  blanquearía el error.
- No suavizar un fallo, no reintentarlo para ver si pasa, no inventar resultados.
- Si la evidencia no alcanza para sostener ninguna clasificación, clasificar
  `NO_CONCLUYENTE` y **declarar qué información falta**. Es una salida válida, no
  una derrota.
- Esta skill no utiliza `ACEPTADO` ni `DESCARTADO`: pertenecen exclusivamente al
  gate humano. La skill produce `RECOMENDACIÓN`.

---

## Fase 1 — Test afectado y requisito relacionado

1. Del nombre del test, extraer el `TC-…`.
2. Buscarlo en `docs/qa/test-cases.json` → obtener `req_ref` y `expected_result`.
3. Buscar el `req_ref` en `docs/qa/requirements.json` → obtener la regla textual.

Si el `TC-…` no existe en `test-cases.json`, detener y reportarlo: hay un test sin
caso de prueba trazado, y eso ya es un hallazgo.

## Fase 2 — Resultado esperado contra resultado obtenido

| Campo | De dónde sale |
|---|---|
| **Esperado** | El `expected_result` del caso más la regla textual del requisito |
| **Obtenido** | El primer error útil de Playwright, sin recortar ni interpretar |
| **Código real** | El código de estado de `POST /api/register`, o `sin petición` |

**El código real es obligatorio.** Es el oráculo de nivel 1 de este proyecto: sin
él no hay contra qué contrastar, y el análisis se clasifica `NO_CONCLUYENTE`
declarando que falta capturarlo. Nunca se infiere.

## Fase 3 — Guardar evidencia

Guardar en `evidence/` con el nombre `<TC-id>-<fecha>.<ext>`: el trace de Playwright,
la captura si existe, y el fragmento de log con la respuesta de la API. Registrar los
nombres de archivo en la bitácora.

## Fase 4 — Analizar las cinco causas

Evaluar **las cinco**, en este orden, antes de clasificar. Dejar constancia de cada
una aunque se descarte: descartar con motivo es parte del análisis.

| Causa | Preguntas a responder |
|---|---|
| **Aplicación** | ¿El comportamiento observado contradice la regla textual del requisito? ¿La respuesta de la API es la que la especificación exige? |
| **Automatización** | ¿El locator sigue existiendo en el DOM? ¿La espera está bien construida o hay una condición de carrera? ¿La aserción afirma lo mismo que dice el caso de prueba? |
| **Datos** | ¿El email ya fue consumido en una corrida anterior? ¿El dato cumple la precondición del caso? ¿El caso depende de un dato que otro caso debía crear? |
| **Ambiente** | ¿La aplicación responde? ¿El smoke de CI pasa? ¿Hay `5xx` generalizado o latencia anómala? |
| **Requisito** | ¿La especificación define este caso, o el resultado esperado se dedujo? ¿La regla admite más de una lectura razonable? |

## Fase 5 — Clasificación

Una sola, sostenida por la evidencia reunida en la Fase 4.

| Clasificación | Qué la sostiene | Qué se hace con el test |
|---|---|---|
| `POSIBLE_DEFECTO` | El comportamiento contradice la regla textual del requisito, y el código real de la API lo confirma | Se preserva el fallo. **No se toca** |
| `PROBLEMA_DE_AUTOMATIZACIÓN` | Evidencia positiva de que la API respondió según la especificación y fue la aserción, el locator o la espera lo que falló | Se **propone** la corrección. No se aplica |
| `PROBLEMA_DE_DATOS` | El fallo se explica por el estado de los datos, no por el comportamiento del sistema: email ya consumido, precondición no creada, dependencia de otro caso | Se **propone** el ajuste de datos. No se aplica |
| `PROBLEMA_DE_AMBIENTE` | La aplicación no responde, `5xx` generalizado, o falla también el smoke | Se detiene la corrida |
| `PROBLEMA_DE_REQUISITO` | La especificación no define el caso o admite más de una lectura | No es defecto. Va a consultas al responsable del producto |
| `NO_CONCLUYENTE` | La evidencia no sostiene ninguna de las anteriores | **Declarar qué información falta** para poder clasificar |

Nota sobre `POSIBLE_DEFECTO`: dice *posible* a propósito. La skill reúne evidencia y
propone; confirmar un defecto es una afirmación sobre el producto y la firma un
humano.

## Fase 6 — Determinar bloqueo

Consultar las dependencias declaradas en `docs/qa/test-plan.md`:

- `TC-R07-002` depende de que `TC-R07-001` haya registrado un email con éxito.
- `TC-R06-001` y `TC-R06-003` dependen de un registro exitoso confirmado por la API.
- Si el registro válido falla, **todo el bloque de camino feliz queda bloqueado**.

Un test bloqueado **no se ejecuta y no se cuenta como fallido**: se marca `BLOQUEADO`
con el `TC-…` que lo bloquea. Contarlo como fallo inflaría el número de defectos con
un solo defecto real.

## Fase 7 — Recomendación

Una sola, coherente con la clasificación.

| Clasificación | Recomendación |
|---|---|
| `POSIBLE_DEFECTO` | `REGISTRAR HALLAZGO` — y `BLOQUEAR DEPENDIENTES` si corresponde |
| `PROBLEMA_DE_AUTOMATIZACIÓN` | `PROPONER CORRECCIÓN DEL TEST` — con el cambio exacto, sin aplicarlo |
| `PROBLEMA_DE_DATOS` | `PROPONER AJUSTE DE DATOS` — sin aplicarlo |
| `PROBLEMA_DE_AMBIENTE` | `DETENER CORRIDA` |
| `PROBLEMA_DE_REQUISITO` | `CONSULTAR AL PRODUCTO` |
| `NO_CONCLUYENTE` | `REEJECUTAR CON MÁS EVIDENCIA` — listando qué capturar |

Si nada de lo anterior aplica y el fallo quedó documentado sin bloquear a nadie:
`CONTINUAR`.

---

## Salida

Añadir a la bitácora una fila y este bloque:

```
H-0X · TC-…

  1. Test afectado      : <archivo::nombre del test>
  2. Requisito          : REQ-R0X — <regla textual>
  3. Resultado esperado : <del caso de prueba, no de la aserción>
  4. Resultado obtenido : <error real, sin recortar>
     Código real        : <código de POST /api/register o "sin petición">
  5. Análisis de causa
       Aplicación       : <descartada por… | sostenida por…>
       Automatización   : <…>
       Datos            : <…>
       Ambiente         : <…>
       Requisito        : <…>
  6. Clasificación      : <una de las seis>
  7. RECOMENDACIÓN      : <una acción>

  Evidencia : <archivos en evidence/>
  Bloquea   : <lista de TC o "ninguno">
  Falta     : <solo si NO_CONCLUYENTE: qué información hace falta>
  Decisión  : <vacío — lo completa la revisión humana>
```

El punto 5 se completa **entero**, con las cinco causas, aunque cuatro se descarten.
Dejar constancia de lo descartado y por qué es lo que distingue un análisis de una
afirmación.

El campo `Decisión` se deja **vacío a propósito**. Lo completa el gate humano, y esa
línea es la que hace visible que hubo criterio de la QA y no solo salida de agente.
