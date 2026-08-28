---
name: verificar-proyecto-api
description: Revisa un cambio API contra su fuente y alcance, ejecuta el comando objetivo y registra evidencia sin corregir archivos.
---

# Skill: verificar un proyecto API

## Entradas
- Proyecto, objetivo, fuente y alcance aprobados.
- Archivo objetivo.
- Comando objetivo exacto.
- Número del intento actual.

## Separación de responsabilidad
- Verifica sin editar tests, configuración, aplicación ni fuentes.
- No suavices fallos ni inventes resultados.
- Informa el primer error útil cuando la ejecución falla.

## Rúbrica estática — 3 puntos por criterio
1. **Fidelidad a la fuente**: método, ruta, entrada, status, schema y auth no fueron inventados.
2. **Integración con el proyecto**: respeta stack, baseURL, scripts, rutas y convenciones existentes.
3. **Calidad de las comprobaciones**: assertions corresponden al objetivo y declaran su alcance.
4. **Seguridad y límites**: no hay secretos; los cambios permanecen dentro del alcance aprobado.

Solo `12/12` significa `CALIDAD COMPLETA` en la revisión estática.

## Verificación ejecutable
1. Ejecuta exactamente `COMANDO_OBJETIVO`.
2. Registra comando, exit code, tests pasados, tests fallidos y duración observada.
3. Conserva status/body visibles únicamente cuando no exponen secretos.
4. Distingue fallo de test, posible producto, contrato, datos o entorno.

## Reporte obligatorio
Guarda o actualiza `reports/api-project-agent-report.md` con:
1. Resumen y modo `INICIAR` o `CONTINUAR`.
2. Entradas y plan aprobado.
3. Rúbrica con puntaje y evidencia por criterio.
4. Comando, exit code, tests y duración.
5. Cambios por intento.
6. Qué demuestra y qué no demuestra la ejecución.
7. Estado del workflow y decisión humana pendiente.

El verificador entrega resultados al workflow. No usa `ACEPTADO` y no corrige archivos.
