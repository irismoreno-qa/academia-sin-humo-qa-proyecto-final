import { test, expect } from '@playwright/test';

test('Playwright puede ejecutar una prueba en CI', async ({ page }) => {
  await page.setContent(`
    <main>
      <h1>Entorno QA listo</h1>
    </main>
  `);

  await expect(
    page.getByRole('heading', { name: 'Entorno QA listo' }),
  ).toBeVisible();
});
