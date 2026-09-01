import { test, expect } from '../fixtures';
import { type RegistroPage } from '../../pages/registro-page';

/**
 * Espera a que el envío quede resuelto antes de aseverar sobre la red.
 *
 * Sin esto, una aserción negativa —`not.toContain(201)`, `toBeHidden()`— pasa en
 * vacío: se evalúa antes de que ocurra nada y encuentra exactamente la ausencia
 * que buscaba. Es la forma en que un defecto real se lee como comportamiento
 * correcto, y pasó de verdad en la primera corrida de esta suite.
 *
 * La condición de corte es observable en las dos direcciones posibles: o llegó
 * una respuesta de la API, o el formulario mostró un error. No hay espera por
 * tiempo fijo.
 */
async function esperarResultado(
  registroPage: RegistroPage,
  peticiones: number[],
  minimoPeticiones = 1
) {
  await expect
    .poll(
      async () => peticiones.length >= minimoPeticiones || (await registroPage.errores.count()) > 0,
      { timeout: 15_000 }
    )
    .toBeTruthy();
}

/**
 * Suite E2E del flujo de registro — 30 de los 32 casos diseñados.
 *
 * Se excluyen CP-07 (TC-R01-007) y CP-30 (TC-R07-003), indeterminados por
 * especificación: un test automatizado necesita un resultado esperado contra el
 * cual afirmar, y esos dos no lo tienen. Ver docs/casos-de-prueba.md.
 *
 * Oráculo de nivel 1: si la cuenta se creó o no, evidenciado por el código de
 * estado de POST /api/register o por la ausencia de petición cuando el cliente
 * bloquea. El mensaje en pantalla se afirma además, nunca en su lugar.
 *
 * Ningún test espera por tiempo. La señal de que el envío fue procesado es la
 * aparición del mensaje correspondiente, que es determinista.
 */

const NOMBRE_VALIDO = 'Iris Moreno';
const PASSWORD_VALIDA = 'Clave1234';
const EDAD_VALIDA = '30';

const cadena = (largo: number) => 'a'.repeat(largo);

/**
 * Cada caso necesita su propio email. Un registro exitoso lo consume de forma
 * permanente, y compartirlo haría que el segundo caso recibiera un rechazo por
 * duplicado en vez de su resultado real. Es el riesgo R-01 del plan de prueba, y
 * es lo que sostiene el requisito de la consigna: tres corridas seguidas, tres
 * veces el mismo resultado.
 */
const emailUnico = (etiqueta: string) =>
  `iris.qa.${Date.now()}.${etiqueta}.${Math.random().toString(36).slice(2, 8)}@gmail.com`;

test.describe('REQ-R01 · Los cuatro campos son obligatorios', () => {
  test('CP-01 · Los cuatro campos vacíos bloquean el envío', async ({ registroPage, peticionesRegistro }) => {
    await registroPage.submit();

    await expect(registroPage.nameError).toHaveText('El nombre es obligatorio');
    await expect(registroPage.emailError).toHaveText('El email es obligatorio');
    await expect(registroPage.passwordError).toHaveText('La contraseña es obligatoria');
    await expect(registroPage.ageError).toHaveText('La edad es obligatoria');
    expect(peticionesRegistro).toHaveLength(0);
  });

  test('CP-02 · Solo el nombre vacío, resto de campos válidos', async ({ registroPage, peticionesRegistro }) => {
    await registroPage.registrar({
      nombre: '',
      email: emailUnico('cp02'),
      password: PASSWORD_VALIDA,
      edad: EDAD_VALIDA,
    });

    await expect(registroPage.nameError).toHaveText('El nombre es obligatorio');
    await expect(registroPage.emailError).toBeHidden();
    await expect(registroPage.passwordError).toBeHidden();
    await expect(registroPage.ageError).toBeHidden();
    expect(peticionesRegistro).toHaveLength(0);
  });

  test('CP-03 · Solo el email vacío, resto de campos válidos', async ({ registroPage, peticionesRegistro }) => {
    await registroPage.registrar({
      nombre: NOMBRE_VALIDO,
      email: '',
      password: PASSWORD_VALIDA,
      edad: EDAD_VALIDA,
    });

    await expect(registroPage.emailError).toHaveText('El email es obligatorio');
    await expect(registroPage.nameError).toBeHidden();
    await expect(registroPage.passwordError).toBeHidden();
    await expect(registroPage.ageError).toBeHidden();
    expect(peticionesRegistro).toHaveLength(0);
  });

  test('CP-04 · Solo la contraseña vacía, resto de campos válidos', async ({ registroPage, peticionesRegistro }) => {
    await registroPage.registrar({
      nombre: NOMBRE_VALIDO,
      email: emailUnico('cp04'),
      password: '',
      edad: EDAD_VALIDA,
    });

    await expect(registroPage.passwordError).toHaveText('La contraseña es obligatoria');
    await expect(registroPage.nameError).toBeHidden();
    await expect(registroPage.emailError).toBeHidden();
    await expect(registroPage.ageError).toBeHidden();
    expect(peticionesRegistro).toHaveLength(0);
  });

  test('CP-05 · Solo la edad vacía, resto de campos válidos', async ({ registroPage, peticionesRegistro }) => {
    await registroPage.registrar({
      nombre: NOMBRE_VALIDO,
      email: emailUnico('cp05'),
      password: PASSWORD_VALIDA,
      edad: '',
    });

    await expect(registroPage.ageError).toHaveText('La edad es obligatoria');
    await expect(registroPage.nameError).toBeHidden();
    await expect(registroPage.emailError).toBeHidden();
    await expect(registroPage.passwordError).toBeHidden();
    expect(peticionesRegistro).toHaveLength(0);
  });

  // Control positivo: sin este caso, un formulario permanentemente roto haría
  // pasar los cinco anteriores.
  test('CP-06 · Los cuatro campos completos con valores válidos permiten el envío', async ({
    registroPage,
    peticionesRegistro,
  }) => {
    await registroPage.registrar({
      nombre: NOMBRE_VALIDO,
      email: emailUnico('cp06'),
      password: PASSWORD_VALIDA,
      edad: EDAD_VALIDA,
    });

    await expect(registroPage.successMessage).toBeVisible();
    expect(peticionesRegistro).toEqual([201]);
  });
});

test.describe('REQ-R02 · El nombre debe tener entre 2 y 50 caracteres', () => {
  test('CP-08 · Nombre por debajo del límite inferior: 1 carácter', async ({ registroPage, peticionesRegistro }) => {
    await registroPage.registrar({
      nombre: 'L',
      email: emailUnico('cp08'),
      password: PASSWORD_VALIDA,
      edad: EDAD_VALIDA,
    });

    await expect(registroPage.nameError).toHaveText('El nombre debe tener entre 2 y 50 caracteres');
    await expect(registroPage.successMessage).toBeHidden();
    expect(peticionesRegistro).not.toContain(201);
  });

  test('CP-09 · Nombre en el límite inferior válido: 2 caracteres exactos', async ({
    registroPage,
    peticionesRegistro,
  }) => {
    await registroPage.registrar({
      nombre: 'Li',
      email: emailUnico('cp09'),
      password: PASSWORD_VALIDA,
      edad: EDAD_VALIDA,
    });

    await expect(registroPage.successMessage).toBeVisible();
    await expect(registroPage.nameError).toBeHidden();
    expect(peticionesRegistro).toEqual([201]);
  });

  test('CP-10 · Nombre en el límite superior válido: 50 caracteres exactos', async ({
    registroPage,
    peticionesRegistro,
  }) => {
    await registroPage.registrar({
      nombre: cadena(50),
      email: emailUnico('cp10'),
      password: PASSWORD_VALIDA,
      edad: EDAD_VALIDA,
    });

    await expect(registroPage.successMessage).toBeVisible();
    await expect(registroPage.nameError).toBeHidden();
    expect(peticionesRegistro).toEqual([201]);
  });

  test('CP-11 · Nombre por encima del límite superior: 51 caracteres', async ({
    registroPage,
    peticionesRegistro,
  }) => {
    await registroPage.registrar({
      nombre: cadena(51),
      email: emailUnico('cp11'),
      password: PASSWORD_VALIDA,
      edad: EDAD_VALIDA,
    });

    await expect(registroPage.nameError).toHaveText('El nombre debe tener entre 2 y 50 caracteres');
    await expect(registroPage.successMessage).toBeHidden();
    expect(peticionesRegistro).not.toContain(201);
  });
});

test.describe('REQ-R03 · El email debe contener un @ seguido de un dominio con punto', () => {
  test('CP-12 · Email válido con @ y dominio con punto', async ({ registroPage, peticionesRegistro }) => {
    await registroPage.registrar({
      nombre: NOMBRE_VALIDO,
      email: emailUnico('cp12'),
      password: PASSWORD_VALIDA,
      edad: EDAD_VALIDA,
    });

    await expect(registroPage.successMessage).toBeVisible();
    await expect(registroPage.emailError).toBeHidden();
    expect(peticionesRegistro).toEqual([201]);
  });

  test('CP-13 · Email sin arroba', async ({ registroPage, peticionesRegistro }) => {
    await registroPage.registrar({
      nombre: NOMBRE_VALIDO,
      email: 'irismoreno.gmail.com',
      password: PASSWORD_VALIDA,
      edad: EDAD_VALIDA,
    });

    await expect(registroPage.emailError).toHaveText('El email no tiene un formato válido');
    await expect(registroPage.successMessage).toBeHidden();
    expect(peticionesRegistro).not.toContain(201);
  });

  test('CP-14 · Email con arroba pero sin dominio', async ({ registroPage, peticionesRegistro }) => {
    test.fail(
      true,
      'H-05 · DEFECTO CONFIRMADO contra REQ-R03: la especificación nombra usuario@ como ' +
        'invalido de forma explicita, y la aplicacion lo acepta con 201. El cliente solo ' +
        'verifica que exista una arroba: no exige dominio ni punto. La expectativa NO se debilita.'
    );

    await registroPage.registrar({
      nombre: NOMBRE_VALIDO,
      email: 'irismoreno@',
      password: PASSWORD_VALIDA,
      edad: EDAD_VALIDA,
    });

    await expect(registroPage.emailError).toHaveText('El email no tiene un formato válido');
    await expect(registroPage.successMessage).toBeHidden();
    expect(peticionesRegistro).not.toContain(201);
  });

  test('CP-15 · Email con dominio sin punto', async ({ registroPage, peticionesRegistro }) => {
    test.fail(
      true,
      'H-02 · DEFECTO CONFIRMADO contra REQ-R03: la aplicación acepta irismoreno@gmail con 201. ' +
        'La expectativa NO se debilita: el caso exige el rechazo que la especificación ordena. ' +
        'Cuando el producto se corrija, este test pasará y habrá que quitar esta anotación.'
    );

    await registroPage.registrar({
      nombre: NOMBRE_VALIDO,
      email: 'irismoreno@gmail',
      password: PASSWORD_VALIDA,
      edad: EDAD_VALIDA,
    });

    await esperarResultado(registroPage, peticionesRegistro, 1);
    await expect(registroPage.successMessage).toBeHidden();
    expect(peticionesRegistro).not.toContain(201);
  });

  // Aceptarlo es correcto: REQ-R03 exige un @ y un dominio con punto, no un TLD
  // de una lista determinada. Límite de interpretación, no defecto.
  test('CP-16 · Email con dominio de primer nivel atípico pero sintácticamente válido', async ({
    registroPage,
    peticionesRegistro,
  }) => {
    await registroPage.registrar({
      nombre: NOMBRE_VALIDO,
      email: `iris.qa.${Date.now()}.cp16@gmail.con`,
      password: PASSWORD_VALIDA,
      edad: EDAD_VALIDA,
    });

    await expect(registroPage.successMessage).toBeVisible();
    expect(peticionesRegistro).toEqual([201]);
  });
});

test.describe('REQ-R04 · La contraseña debe tener entre 8 y 64 caracteres', () => {
  test('CP-17 · Contraseña por debajo del límite inferior: 7 caracteres', async ({
    registroPage,
    peticionesRegistro,
  }) => {
    await registroPage.registrar({
      nombre: NOMBRE_VALIDO,
      email: emailUnico('cp17'),
      password: 'Clave12',
      edad: EDAD_VALIDA,
    });

    await expect(registroPage.passwordError).toHaveText('La contraseña debe tener al menos 8 caracteres');
    await expect(registroPage.successMessage).toBeHidden();
    expect(peticionesRegistro).not.toContain(201);
  });

  test('CP-18 · Contraseña en el límite inferior válido: 8 caracteres exactos', async ({
    registroPage,
    peticionesRegistro,
  }) => {
    await registroPage.registrar({
      nombre: NOMBRE_VALIDO,
      email: emailUnico('cp18'),
      password: 'Clave123',
      edad: EDAD_VALIDA,
    });

    await expect(registroPage.successMessage).toBeVisible();
    await expect(registroPage.passwordError).toBeHidden();
    expect(peticionesRegistro).toEqual([201]);
  });

  test('CP-19 · Contraseña en el límite superior válido: 64 caracteres exactos', async ({
    registroPage,
    peticionesRegistro,
  }) => {
    await registroPage.registrar({
      nombre: NOMBRE_VALIDO,
      email: emailUnico('cp19'),
      password: cadena(64),
      edad: EDAD_VALIDA,
    });

    await expect(registroPage.successMessage).toBeVisible();
    await expect(registroPage.passwordError).toBeHidden();
    expect(peticionesRegistro).toEqual([201]);
  });

  test('CP-20 · Contraseña por encima del límite superior: 65 caracteres', async ({
    registroPage,
    peticionesRegistro,
  }) => {
    test.fail(
      true,
      'H-01 · DEFECTO CONFIRMADO contra REQ-R04: la especificación exige rechazar 65 caracteres ' +
        'de forma explícita, y la aplicación acepta el registro con 201. La expectativa NO se ' +
        'debilita. Cuando el producto se corrija, este test pasará y habrá que quitar la anotación.'
    );

    await registroPage.registrar({
      nombre: NOMBRE_VALIDO,
      email: emailUnico('cp20'),
      password: cadena(65),
      edad: EDAD_VALIDA,
    });

    await esperarResultado(registroPage, peticionesRegistro, 1);
    await expect(registroPage.successMessage).toBeHidden();
    expect(peticionesRegistro).not.toContain(201);
  });
});

test.describe('REQ-R05 · La edad debe estar entre 16 y 99', () => {
  test('CP-21 · Edad por debajo del límite inferior: 15 años', async ({ registroPage, peticionesRegistro }) => {
    await registroPage.registrar({
      nombre: NOMBRE_VALIDO,
      email: emailUnico('cp21'),
      password: PASSWORD_VALIDA,
      edad: '15',
    });

    await expect(registroPage.ageError).toHaveText('Debes tener al menos 16 años');
    await expect(registroPage.successMessage).toBeHidden();
    expect(peticionesRegistro).not.toContain(201);
  });

  test('CP-22 · Edad en el límite inferior válido: 16 años exactos', async ({
    registroPage,
    peticionesRegistro,
  }) => {
    await registroPage.registrar({
      nombre: NOMBRE_VALIDO,
      email: emailUnico('cp22'),
      password: PASSWORD_VALIDA,
      edad: '16',
    });

    await expect(registroPage.successMessage).toBeVisible();
    await expect(registroPage.ageError).toBeHidden();
    expect(peticionesRegistro).toEqual([201]);
  });

  test('CP-23 · Edad en el límite superior válido: 99 años exactos', async ({
    registroPage,
    peticionesRegistro,
  }) => {
    await registroPage.registrar({
      nombre: NOMBRE_VALIDO,
      email: emailUnico('cp23'),
      password: PASSWORD_VALIDA,
      edad: '99',
    });

    await expect(registroPage.successMessage).toBeVisible();
    await expect(registroPage.ageError).toBeHidden();
    expect(peticionesRegistro).toEqual([201]);
  });

  test('CP-24 · Edad por encima del límite superior: 100 años', async ({ registroPage, peticionesRegistro }) => {
    await registroPage.registrar({
      nombre: NOMBRE_VALIDO,
      email: emailUnico('cp24'),
      password: PASSWORD_VALIDA,
      edad: '100',
    });

    await expect(registroPage.ageError).toHaveText('La edad máxima es 99');
    await expect(registroPage.successMessage).toBeHidden();
    expect(peticionesRegistro).not.toContain(201);
  });
});

test.describe('REQ-R06 · El formulario se limpia tras un registro exitoso', () => {
  test('CP-25 · El formulario queda vacío tras un registro exitoso confirmado por la API', async ({
    registroPage,
    peticionesRegistro,
  }) => {
    test.fail(
      true,
      'H-03 · DEFECTO CONFIRMADO contra REQ-R06: tras un 201 confirmado, los cuatro campos ' +
        'conservan sus valores. La expectativa NO se debilita. Cuando el producto se corrija, ' +
        'este test pasará y habrá que quitar la anotación.'
    );

    await registroPage.registrar({
      nombre: NOMBRE_VALIDO,
      email: emailUnico('cp25'),
      password: PASSWORD_VALIDA,
      edad: EDAD_VALIDA,
    });

    // El éxito se confirma por la API ANTES de mirar el formulario: sin éxito
    // real, REQ-R06 no aplica y el caso no puede evaluarse.
    await expect(registroPage.successMessage).toBeVisible();
    expect(peticionesRegistro).toEqual([201]);

    await expect(registroPage.nameInput).toHaveValue('');
    await expect(registroPage.emailInput).toHaveValue('');
    await expect(registroPage.passwordInput).toHaveValue('');
    await expect(registroPage.ageInput).toHaveValue('');
  });

  test('CP-26 · El formulario conserva los datos tras un registro rechazado', async ({ registroPage }) => {
    const email = emailUnico('cp26');

    await registroPage.registrar({
      nombre: NOMBRE_VALIDO,
      email,
      password: PASSWORD_VALIDA,
      edad: '100',
    });

    await expect(registroPage.ageError).toBeVisible();
    await expect(registroPage.nameInput).toHaveValue(NOMBRE_VALIDO);
    await expect(registroPage.emailInput).toHaveValue(email);
    await expect(registroPage.ageInput).toHaveValue('100');
  });

  test('CP-27 · Dos registros exitosos consecutivos sin arrastre de datos', async ({
    registroPage,
    peticionesRegistro,
  }) => {
    test.fail(
      true,
      'H-03 · Misma causa que CP-25: el formulario nunca se limpia. Cubre la segunda oración ' +
        'de REQ-R06, que un solo registro aislado no puede verificar.'
    );

    await registroPage.registrar({
      nombre: NOMBRE_VALIDO,
      email: emailUnico('cp27a'),
      password: PASSWORD_VALIDA,
      edad: EDAD_VALIDA,
    });
    await expect(registroPage.successMessage).toBeVisible();

    const segundoEmail = emailUnico('cp27b');
    await registroPage.registrar({
      nombre: 'Ana Gómez',
      email: segundoEmail,
      password: 'OtraClave99',
      edad: '42',
    });

    await esperarResultado(registroPage, peticionesRegistro, 2);
    expect(peticionesRegistro).toEqual([201, 201]);
    await expect(registroPage.nameInput).toHaveValue('');
    await expect(registroPage.emailInput).toHaveValue('');
    await expect(registroPage.ageInput).toHaveValue('');
  });
});

test.describe('REQ-R07 · No se puede registrar un email que ya existe', () => {
  test('CP-28 · Un email no registrado previamente es aceptado', async ({ registroPage, peticionesRegistro }) => {
    await registroPage.registrar({
      nombre: NOMBRE_VALIDO,
      email: emailUnico('cp28'),
      password: PASSWORD_VALIDA,
      edad: EDAD_VALIDA,
    });

    await expect(registroPage.successMessage).toBeVisible();
    expect(peticionesRegistro).toEqual([201]);
  });

  test('CP-29 · Un email ya registrado es rechazado', async ({ registroPage, peticionesRegistro }) => {
    const email = emailUnico('cp29');

    // El dato nace acá: el caso crea su propia precondición en vez de depender
    // del estado que dejó otra ejecución.
    await registroPage.registrar({
      nombre: NOMBRE_VALIDO,
      email,
      password: PASSWORD_VALIDA,
      edad: EDAD_VALIDA,
    });
    await expect(registroPage.successMessage).toBeVisible();

    await registroPage.registrar({
      nombre: 'Ana Gómez',
      email,
      password: 'OtraClave99',
      edad: '42',
    });

    await expect(registroPage.emailError).toHaveText('Este email ya está registrado');
    expect(peticionesRegistro).toEqual([201, 422]);
  });
});

test.describe('REQ-R08 · El resultado en pantalla coincide con el resultado real (derivado)', () => {
  test('CP-31 · Un rechazo de la API no se muestra como éxito en pantalla', async ({
    registroPage,
    peticionesRegistro,
  }) => {
    const email = emailUnico('cp31');

    await registroPage.registrar({
      nombre: NOMBRE_VALIDO,
      email,
      password: PASSWORD_VALIDA,
      edad: EDAD_VALIDA,
    });
    await expect(registroPage.successMessage).toBeVisible();

    // El email duplicado es el único rechazo de servidor observado. El resto de
    // los rechazos ocurre en el cliente sin emitir petición, y sin respuesta no
    // hay dos capas que contrastar.
    await registroPage.registrar({
      nombre: NOMBRE_VALIDO,
      email,
      password: PASSWORD_VALIDA,
      edad: EDAD_VALIDA,
    });

    await esperarResultado(registroPage, peticionesRegistro, 2);
    expect(peticionesRegistro.at(-1)).toBeGreaterThanOrEqual(400);
    await expect(registroPage.successMessage).toBeHidden();
  });

  // Control: una pantalla que nunca muestre éxito sería coherente con CP-31 y
  // estaría igual de rota.
  test('CP-32 · Una aceptación de la API se muestra como éxito en pantalla', async ({
    registroPage,
    peticionesRegistro,
  }) => {
    await registroPage.registrar({
      nombre: NOMBRE_VALIDO,
      email: emailUnico('cp32'),
      password: PASSWORD_VALIDA,
      edad: EDAD_VALIDA,
    });

    await esperarResultado(registroPage, peticionesRegistro, 1);
    expect(peticionesRegistro).toEqual([201]);
    await expect(registroPage.successMessage).toBeVisible();
  });
});
