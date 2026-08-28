import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

type MisFixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<MisFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await use(loginPage);
  },
});

export { expect };
