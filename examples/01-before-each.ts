/**
 * ARCHIVO DE APOYO PARA LA CLASE
 *
 * Este archivo muestra cómo quedaba la preparación con beforeEach.
 * No se ejecuta como parte de la suite: está fuera de tests/ y no termina en .spec.ts.
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test.describe('Login con beforeEach', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('login exitoso con credenciales válidas', async () => {
    await loginPage.login(
      'ana.garcia@ejemplo.com',
      'Segura2026!'
    );

    await expect(loginPage.okMessage).toBeVisible();
  });

  test('login fallido con contraseña incorrecta', async ({ page }) => {
    await loginPage.login(
      'ana.garcia@ejemplo.com',
      'ContraseñaMala123'
    );

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.okMessage).not.toBeVisible();
    await expect(page).toHaveURL(/.*login/);
  });
});
