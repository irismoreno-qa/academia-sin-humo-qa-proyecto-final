import { test, expect } from '@playwright/test';
import { RegistroPage } from '../pages/registro-page';

test('muestra los controles principales del registro', async ({ page }) => {
    const registroPage = new RegistroPage(page);

    await registroPage.goto();

    await expect(registroPage.nameInput).toBeVisible();
    await expect(registroPage.emailInput).toBeVisible();
    await expect(registroPage.passwordInput).toBeVisible();
    await expect(registroPage.ageInput).toBeVisible();
    await expect(registroPage.submitButton).toBeVisible();
});