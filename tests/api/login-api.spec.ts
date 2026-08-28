import { test, expect } from '@playwright/test';

test('rechaza credenciales incorrectas', async ({ request }) => {
  const response = await request.post('/api/login', {
    data: {
      email: 'ana.garcia@ejemplo.com',
      password: 'ContraseñaMala123',
    },
  });

  const status = response.status();
  const body = await response.json();

  console.log('STATUS:', status);
  console.log('CONTENT-TYPE:', response.headers()['content-type']);
  console.log('BODY:', JSON.stringify(body, null, 2));

  expect(status).toBe(401);
  expect(body).toMatchObject({
    error: expect.any(String),
    attempts: expect.any(Number),
    remaining: expect.any(Number),
  });

  // Comprobación de Content-Type (fuente: slide 8)
  const contentType = response.headers()['content-type'];
  expect(contentType).toContain('application/json');
});
