import { test, expect } from '@playwright/test';

/**
 * Flujo integrado: la API prepara → la UI verifica → la API limpia.
 *
 * Todas las peticiones salen de `page.request`, que comparte el almacenamiento
 * con el contexto del navegador. Ese detalle ES la integración: sin ese puente
 * la cookie de sesión que crea la API nunca llegaría a la UI y esto serían dos
 * pruebas pegadas, no un flujo.
 *
 * Contrato observado el 2026-09-01, no inventado:
 *   POST /api/register  201  { message, user }
 *   POST /api/login     200  { message, user }  · crea la cookie ash_session
 *   GET  /api/courses   200  { courses: [{ id, title, prerequisiteId, maxStudents, enrolled }] }
 *   POST /api/enroll    200  { courseId, status: "inscrito", progress, enrolledAt }
 *   POST /api/logout    200
 *
 * Qué NO demuestra este flujo, declarado antes de leerlo:
 *   - Que la inscripción persista más allá de la respuesta de la API.
 *   - Que el prerequisito se aplique: el curso elegido no tiene, y REQ-C03 está
 *     fuera del alcance del proyecto.
 *   - Que el progreso se reinicie al cerrar sesión (REQ-S02): no se puede
 *     verificar por UI mientras la identidad no resuelva.
 *
 * Residuo conocido: la cuenta creada queda en el servidor. La fuente no
 * documenta ningún endpoint para eliminar una cuenta, así que no se inventa uno.
 * El email es único por corrida, de modo que el residuo no afecta a la siguiente
 * ejecución.
 */

const PASSWORD = 'Clave1234';

test('Un curso inscrito por API se muestra en /mi-progreso', async ({ page }) => {
  test.fail(
    true,
    'H-08 · DEFECTO CONFIRMADO contra REQ-S01. La sesión es válida —la API la honra y devuelve ' +
      'la inscripción— pero GET /api/auth/me responde {"realUser": null}, y la UI depende de ese ' +
      'endpoint para resolver la identidad. Toda página protegida trata al usuario como anónimo, ' +
      'incluso después de un login por formulario que muestra "¡Hola, Iris!". La expectativa NO ' +
      'se debilita: cuando el producto se corrija, este test pasará y habrá que quitar la anotación.'
  );

  // ─────────────────────────── 1 · La API prepara ───────────────────────────

  // El email nace acá, en la ejecución. Nunca es literal: un registro exitoso
  // consume su email de forma permanente y compartirlo rompería la repetibilidad.
  const email = `iris.qa.${Date.now()}.integrado.${Math.random().toString(36).slice(2, 8)}@gmail.com`;

  const registro = await page.request.post('/api/register', {
    data: { name: 'Iris Moreno', email, password: PASSWORD, age: '30' },
  });
  expect(registro.status(), 'la cuenta de preparación debe crearse').toBe(201);

  const login = await page.request.post('/api/login', { data: { email, password: PASSWORD } });
  expect(login.status(), 'la preparación debe dejar una sesión abierta').toBe(200);

  // El curso también sale de la fuente, no de una constante: se elige el primero
  // sin prerequisito y con cupo, para no depender de un id escrito a mano.
  const catalogo = await page.request.get('/api/courses');
  expect(catalogo.status()).toBe(200);

  const { courses } = await catalogo.json();
  const curso = courses.find(
    (c: { prerequisiteId: string | null; enrolled: number; maxStudents: number }) =>
      c.prerequisiteId === null && c.enrolled < c.maxStudents
  );
  expect(curso, 'debe existir un curso sin prerequisito y con cupo').toBeTruthy();

  const inscripcion = await page.request.post('/api/enroll', { data: { courseId: curso.id } });
  expect(inscripcion.status(), 'la inscripción por API debe tener éxito').toBe(200);
  expect(await inscripcion.json()).toMatchObject({
    courseId: curso.id,
    status: 'inscrito',
  });

  // ────────────────────────── 2 · El dato compartido ─────────────────────────

  // Dos valores cruzan de la capa API a la capa UI, y los dos nacieron arriba:
  //
  //   · el email  → produce la cookie ash_session, que es la identidad con la
  //                 que la UI debería reconocer al estudiante;
  //   · el título → viene de GET /api/courses y es lo que la pantalla debe
  //                 mostrar. No está escrito en este archivo.
  const tituloEsperado: string = curso.title;

  // ─────────────────────────── 3 · La UI verifica ────────────────────────────

  try {
    await page.goto('/mi-progreso');

    const muroDeLogin = page.getByText('Necesitas iniciar sesión para acceder a esta página');
    const cursoInscrito = page.getByText(tituloEsperado);

    // La página hidrata después de cargar. Sin esperar a que resuelva, la
    // aserción negativa de abajo pasaría en vacío: `toBeHidden()` se cumple
    // sobre un elemento que todavía no existe. Es la misma trampa que hizo
    // pasar dos defectos reales en la primera corrida de la suite E2E.
    //
    // La condición de corte es observable en las dos direcciones posibles: o
    // aparece el muro, o aparece el curso. No hay espera por tiempo fijo.
    await expect
      .poll(async () => (await muroDeLogin.count()) > 0 || (await cursoInscrito.count()) > 0, {
        timeout: 15_000,
      })
      .toBeTruthy();

    // REQ-S01 exige que las páginas protegidas pidan sesión a quien no la tiene.
    // Este estudiante SÍ la tiene, así que el muro de login no debe aparecer.
    await expect(muroDeLogin, 'con sesión válida no debe aparecer el muro de login').toBeHidden();

    // REQ-P01: cada curso inscrito tiene un ciclo de vida visible. El comportamiento
    // observable que se comprueba es que el curso preparado por API aparezca.
    await expect(cursoInscrito, 'la inscripción creada por API debe verse en la UI').toBeVisible();
  } finally {
    // ───────────────────────────── 4 · Limpieza ──────────────────────────────

    // REQ-S02: "Al cerrar sesión, todo el progreso del estudiante se reinicia."
    // El teardown está documentado en la fuente, así que no se inventa. Va en
    // finally para que se ejecute también cuando la verificación falla.
    const cierre = await page.request.post('/api/logout');
    expect(cierre.status(), 'la limpieza debe cerrar la sesión').toBe(200);
  }
});
