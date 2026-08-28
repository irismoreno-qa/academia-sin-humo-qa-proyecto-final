import { type Locator, type Page } from '@playwright/test';

export class LoginPage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly blockedMessage: Locator;
  readonly okMessage: Locator;

  constructor(private readonly page: Page) {
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Contraseña');
    this.submitButton = page.getByRole('button', { name: 'Iniciar sesión' });
    this.errorMessage = page.getByText('Email o contraseña incorrectos');
    this.blockedMessage = page.getByTestId('login-lockout');
    this.okMessage = page.getByText('Has iniciado sesión correctamente');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
