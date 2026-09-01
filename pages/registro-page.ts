import { type Locator, type Page } from '@playwright/test';

export type DatosRegistro = {
  nombre: string;
  email: string;
  password: string;
  edad: string;
};

export class RegistroPage {
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly ageInput: Locator;
  readonly submitButton: Locator;

  readonly nameError: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly ageError: Locator;
  readonly successMessage: Locator;
  readonly errores: Locator;

  constructor(private readonly page: Page) {
    // Controles: locators semánticos contra las etiquetas y el rol reales.
    this.nameInput = page.getByLabel('Nombre completo');
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Contraseña');
    this.ageInput = page.getByLabel('Edad');
    this.submitButton = page.getByRole('button', { name: 'Crear cuenta' });

    // Mensajes: en el HTML real son <p> y <div> sin rol, sin etiqueta y sin
    // encabezado, así que no hay un locator semántico disponible. El único otro
    // handle sería su propio texto, y localizar un elemento por el mismo texto
    // que el test va a afirmar vuelve la aserción vacía: siempre encontraría lo
    // que busca. Por eso acá getByTestId no es un atajo, es lo correcto — y
    // deja que el texto exacto se afirme en el test, donde corresponde.
    this.nameError = page.getByTestId('register-name-error');
    this.emailError = page.getByTestId('register-email-error');
    this.passwordError = page.getByTestId('register-password-error');
    this.ageError = page.getByTestId('register-age-error');
    this.successMessage = page.getByTestId('register-success');

    // Unión explícita de los cuatro mensajes de error. Sirve para esperar a que
    // el formulario haya resuelto un envío, no para afirmar nada: un test que
    // asevera sobre la red antes de que el envío se resuelva pasa en vacío.
    this.errores = page.locator(
      [
        '[data-testid="register-name-error"]',
        '[data-testid="register-email-error"]',
        '[data-testid="register-password-error"]',
        '[data-testid="register-age-error"]',
      ].join(', ')
    );
  }

  async goto() {
    await this.page.goto('/registro');
  }

  async completar(datos: DatosRegistro) {
    await this.nameInput.fill(datos.nombre);
    await this.emailInput.fill(datos.email);
    await this.passwordInput.fill(datos.password);
    await this.ageInput.fill(datos.edad);
  }

  async submit() {
    await this.submitButton.click();
  }

  async registrar(datos: DatosRegistro) {
    await this.completar(datos);
    await this.submit();
  }
}
