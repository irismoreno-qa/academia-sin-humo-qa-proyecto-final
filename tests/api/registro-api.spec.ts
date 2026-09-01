import { test, expect, type APIResponse } from '@playwright/test';

/**
 * Contrato de POST /api/register llamado sin pasar por el formulario.
 *
 * Por qué existe esta suite. La Fase 2 dejó declarada su limitación más grande:
 * cuando el formulario impide el envío, la petición que probaría al servidor
 * nunca se emite. Nueve de los once rechazos observados por UI ocurrieron sin
 * llegar a la API, así que esos casos demostraban la regla en el cliente y no en
 * el sistema. Esta suite es la única forma de cerrar ese hueco.
 *
 * Cómo se deriva el resultado esperado. La especificación dice que ciertos
 * registros "deben ser rechazados" sin decir dónde. En una llamada directa NO
 * HAY cliente que bloquee: si la API responde con un código de éxito, la cuenta
 * se creó y la regla quedó incumplida. Es la única inferencia de esta suite.
 *
 * Contrato observado el 2026-09-01, no inferido:
 *   POST /api/register  ·  content-type: application/json
 *   body   { name: string, email: string, password: string, age: string }
 *   201    { message: string, user: { name, email, age } }
 *   422    { errors: { <campo>: <mensaje> } }
 */

type CuerpoRegistro = {
  name?: string;
  email?: string;
  password?: string;
  age?: string;
};

const NOMBRE_VALIDO = 'Iris Moreno';
const PASSWORD_VALIDA = 'Clave1234';
const EDAD_VALIDA = '30';

const cadena = (largo: number) => 'a'.repeat(largo);

// Cada caso aceptado consume su email de forma permanente. Sin unicidad por
// corrida, la segunda ejecución recibiría un rechazo por duplicado en vez de su
// resultado real: es el riesgo R-01 del plan de prueba.
const emailUnico = (etiqueta: string) =>
  `iris.qa.${Date.now()}.${etiqueta}.${Math.random().toString(36).slice(2, 8)}@gmail.com`;

const cuerpoValido = (etiqueta: string): CuerpoRegistro => ({
  name: NOMBRE_VALIDO,
  email: emailUnico(etiqueta),
  password: PASSWORD_VALIDA,
  age: EDAD_VALIDA,
});

/**
 * Un rechazo válido según el contrato observado: código de error, JSON, y un
 * mapa `errors` con el campo culpable y su mensaje.
 *
 * El status NO se fija en 422 a propósito. La especificación exige el rechazo,
 * no un código concreto: atarlo a 422 rompería el test si el producto cambiara
 * a 400 sin que la regla haya cambiado.
 */
async function esperarRechazo(respuesta: APIResponse, campo: string) {
  expect(respuesta.status()).toBeGreaterThanOrEqual(400);
  expect(respuesta.headers()['content-type']).toContain('application/json');

  const body = await respuesta.json();
  expect(body).toMatchObject({ errors: { [campo]: expect.any(String) } });
}

test.describe('POST /api/register · contrato y aplicación de reglas en el servidor', () => {
  test('API-01 · Control: un body válido crea la cuenta', async ({ request }) => {
    const cuerpo = cuerpoValido('api01');
    const respuesta = await request.post('/api/register', { data: cuerpo });

    expect(respuesta.status()).toBe(201);
    expect(respuesta.headers()['content-type']).toContain('application/json');

    const body = await respuesta.json();
    expect(body).toMatchObject({
      message: expect.any(String),
      user: { name: cuerpo.name, email: cuerpo.email, age: cuerpo.age },
    });

    // La contraseña no debe volver en la respuesta.
    expect(JSON.stringify(body)).not.toContain(PASSWORD_VALIDA);
  });

  test('API-02 · REQ-R02: un nombre de 51 caracteres debe ser rechazado', async ({ request }) => {
    const respuesta = await request.post('/api/register', {
      data: { ...cuerpoValido('api02'), name: cadena(51) },
    });

    await esperarRechazo(respuesta, 'name');
  });

  test('API-03 · REQ-R02: un nombre de 1 carácter debe ser rechazado', async ({ request }) => {
    const respuesta = await request.post('/api/register', {
      data: { ...cuerpoValido('api03'), name: 'L' },
    });

    await esperarRechazo(respuesta, 'name');
  });

  test('API-04 · REQ-R04: una contraseña de 7 caracteres debe ser rechazada', async ({ request }) => {
    const respuesta = await request.post('/api/register', {
      data: { ...cuerpoValido('api04'), password: 'Clave12' },
    });

    await esperarRechazo(respuesta, 'password');
  });

  test('API-05 · REQ-R04: una contraseña de 65 caracteres debe ser rechazada', async ({ request }) => {
    test.fail(
      true,
      'H-01 · DEFECTO CONFIRMADO en la capa de servidor. REQ-R04 exige rechazar 65 caracteres ' +
        'de forma explícita y POST /api/register responde 201. El borde inferior del MISMO ' +
        'requisito sí se rechaza con 422: la regla está implementada a medias, no ausente.'
    );

    const respuesta = await request.post('/api/register', {
      data: { ...cuerpoValido('api05'), password: cadena(65) },
    });

    await esperarRechazo(respuesta, 'password');
  });

  test('API-06 · REQ-R05: una edad de 15 debe ser rechazada', async ({ request }) => {
    const respuesta = await request.post('/api/register', {
      data: { ...cuerpoValido('api06'), age: '15' },
    });

    await esperarRechazo(respuesta, 'age');
  });

  test('API-07 · REQ-R05: una edad de 100 debe ser rechazada', async ({ request }) => {
    const respuesta = await request.post('/api/register', {
      data: { ...cuerpoValido('api07'), age: '100' },
    });

    await esperarRechazo(respuesta, 'age');
  });

  test('API-08 · REQ-R03: un email sin arroba debe ser rechazado', async ({ request }) => {
    const respuesta = await request.post('/api/register', {
      data: { ...cuerpoValido('api08'), email: 'irismoreno.gmail.com' },
    });

    await esperarRechazo(respuesta, 'email');
  });

  test('API-09 · REQ-R03: un email con dominio sin punto debe ser rechazado', async ({ request }) => {
    test.fail(
      true,
      'H-02 · DEFECTO CONFIRMADO en la capa de servidor. REQ-R03 exige un dominio con punto y ' +
        'POST /api/register acepta irismoreno@gmail con 201. La ausencia de arroba SÍ se ' +
        'rechaza con 422: de las condiciones de la regla, solo se implementó la primera.'
    );

    const respuesta = await request.post('/api/register', {
      data: { ...cuerpoValido('api09'), email: 'irismoreno@gmail' },
    });

    await esperarRechazo(respuesta, 'email');
  });

  test('API-10 · REQ-R01: un body sin el campo name debe ser rechazado', async ({ request }) => {
    const { name, ...sinNombre } = cuerpoValido('api10');
    void name;

    const respuesta = await request.post('/api/register', { data: sinNombre });

    await esperarRechazo(respuesta, 'name');
  });

  test('API-11 · REQ-R07: un email ya registrado debe ser rechazado', async ({ request }) => {
    const cuerpo = cuerpoValido('api11');

    // El caso crea su propia precondición en vez de depender del estado que
    // dejó otra ejecución.
    const primera = await request.post('/api/register', { data: cuerpo });
    expect(primera.status()).toBe(201);

    const segunda = await request.post('/api/register', { data: cuerpo });

    expect(segunda.status()).toBeGreaterThanOrEqual(400);
    expect(segunda.headers()['content-type']).toContain('application/json');
    expect(await segunda.json()).toMatchObject({ errors: expect.any(Object) });
  });
});
