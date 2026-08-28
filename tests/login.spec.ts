import { test, expect } from './fixtures';

const casos = [
  {
    nombre: 'credenciales válidas',
    email: 'ana.garcia@ejemplo.com',
    password: 'Segura2025!',
    esperado: 'exito',
  },
  {
    nombre: 'contraseña incorrecta',
    email: 'ana.garcia@ejemplo.com',
    password: 'ContraseñaMala123',
    esperado: 'error',
  },
  {
    nombre: 'email inexistente',
    email: 'usuario.inexistente@ejemplo.com',
    password: 'Segura2026!',
    esperado: 'error',
  },
  {
    nombre: 'email sin formato válido',
    email: 'correo-invalido',
    password: 'Segura2026!',
    esperado: 'error',
  },
] as const;

test.describe('Login data-driven', () => {
  for (const caso of casos) {
    test(`login con ${caso.nombre} → ${caso.esperado}`, async ({
      loginPage, page }) => {

      await loginPage.login(caso.email, caso.password);

      if (caso.esperado === 'exito') {
        await expect(loginPage.okMessage).toBeVisible();
        return;
      }

      await expect(loginPage.errorMessage).toBeVisible();
      await expect(loginPage.okMessage).not.toBeVisible();
      await expect(page).toHaveURL(/.*login/);
    });
  }
});

test('diagnóstico: bloquea varios intentos en la misma sesión', async ({
  loginPage,
}) => {
  for (let intento = 1; intento <= 4; intento++) {
    await loginPage.login(
      'ana.garcia@ejemplo.com',
      'ContraseñaMala123'
    );
  }

  await expect(loginPage.blockedMessage).toContainText('Cuenta bloqueada');
});