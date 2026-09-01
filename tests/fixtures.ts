import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { RegistroPage } from '../pages/registro-page';

type MisFixtures = {
  loginPage: LoginPage;
  registroPage: RegistroPage;
  peticionesRegistro: number[];
};

export const test = base.extend<MisFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await use(loginPage);
  },

  // Acumula el código de estado de cada respuesta de POST /api/register.
  // Es el oráculo de nivel 1: un array vacío significa que el cliente bloqueó
  // sin enviar, y esa es una lectura tan válida como un código de estado.
  peticionesRegistro: async ({ page }, use) => {
    const codigos: number[] = [];
    page.on('response', (respuesta) => {
      if (respuesta.url().includes('/api/register')) codigos.push(respuesta.status());
    });

    await use(codigos);
  },

  registroPage: async ({ page, peticionesRegistro }, use) => {
    void peticionesRegistro; // fuerza que el listener quede activo antes de navegar
    const registroPage = new RegistroPage(page);
    await registroPage.goto();

    await use(registroPage);
  },
});

export { expect };
