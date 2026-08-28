import { type Locator, type Page } from '@playwright/test';

export class RegistroPage {
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly ageInput: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.nameInput = page.getByLabel('Nombre completo');
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Contraseña');
    this.ageInput = page.getByLabel('Edad');
    this.submitButton = page.getByRole('button', { name: 'Crear cuenta' });
  }

  async goto() {
    await this.page.goto('/registro');
  }
}
