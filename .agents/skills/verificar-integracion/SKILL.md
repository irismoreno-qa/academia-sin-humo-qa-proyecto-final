---
name: verificar-integracion
description: Revisa un escenario integrado UI + API contra su fuente y alcance, ejecuta el comando objetivo y registra evidencia sin corregir archivos.
---

# Skill: verificar un escenario integrado UI + API

## Entradas
- Proyecto, objetivo, fuente y alcance aprobados.
- Dato dinámico compartido declarado en el plan.
- Comando objetivo exacto.
- Número del intento actual.

## Separación de responsabilidad
- Verifica sin editar tests, configuración, aplicación ni fuentes.
- No suavices fallos ni inventes resultados.
- Informa el primer error útil cuando la ejecución falla.

## Rúbrica estática — 3 puntos por criterio
1. **Fidelidad a la fuente**: método, ruta, entrada, status, schema, auth y pantallas
   no fueron inventados.
2. **Integración real**: existe un dato dinámico compartido que nace en la preparación por API
   y se consume en la verificación por UI. Si el dato está escrito literal en el archivo,
   este criterio es **0/3**: no hay integración, hay dos pruebas pegadas.
3. **Reutilización y convenciones**: usa los Page Objects y la capa API existentes, la `baseURL`
   del proyecto y locators semánticos. No duplica capas.
4. **Alcance declarado y seguridad**: el test declara qué NO demuestra, no hay secretos, y los
   cambios permanecen dentro del alcance aprobado.

Solo `12/12` significa `CALIDAD COMPLETA` en la revisión estática.

## Verificación ejecutable
1. Ejecuta exactamente `COMANDO_OBJETIVO`.
2. Registra comando, exit code, tests pasados, tests fallidos y duración observada.
3. Conserva status/body visibles únicamente cuando no exponen secretos.
4. Distingue fallo de test, posible defecto de producto, contrato, datos o entorno.
5. Comprueba que la limpieza se ejecutó. Si quedó residuo en el servidor, decláralo:
   qué quedó, dónde, y si afecta a la próxima ejecución.

## Reporte obligatorio
Guarda o actualiza `reports/integration-agent-report.md` con:
1. Resumen y estado.
2. Entradas y plan aprobado.
3. **El dato dinámico compartido**: qué es, qué endpoint lo crea, qué línea lo consume.
4. Rúbrica con puntaje y evidencia por criterio.
5. Comando, exit code, tests y duración.
6. Cambios por intento.
7. Qué demuestra y qué NO demuestra la ejecución.
8. Residuo dejado en el servidor, si lo hay.
9. Estado del workflow y decisión humana pendiente.

El verificador entrega resultados al workflow. No usa `ACEPTADO` y no corrige archivos.
