// Captura de evidencia del formulario de registro en sus distintos estados.
// Vuelca el DOM real de cada estado y el codigo de estado real de POST /api/register.
// No afirma nada: solo registra lo observado para que sirva de fuente a los locators.

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE = 'https://playground.calidadsinhumo.com';
const OUT = process.argv[2];
const SELLO = Date.now();
const EMAIL_UNICO = `iris.qa.${SELLO}@gmail.com`;

const resumen = [];

async function capturar(page, nombre, rellenar, { esperaPeticion }) {
  await page.goto(`${BASE}/registro`, { waitUntil: 'domcontentloaded' });
  const form = page.locator('form');
  await form.waitFor({ state: 'visible' });

  const antes = await form.innerHTML();

  let respuesta = null;
  const escucha = (r) => {
    if (r.url().includes('/api/register')) respuesta = { status: r.status(), url: r.url() };
  };
  page.on('response', escucha);

  await rellenar(page);

  const esperaRed = esperaPeticion
    ? page.waitForResponse((r) => r.url().includes('/api/register'), { timeout: 15000 }).catch(() => null)
    : Promise.resolve(null);

  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await esperaRed;

  // Espera a que el DOM cambie respecto del estado previo al clic, sin timeout arbitrario.
  await page
    .waitForFunction(
      (html) => document.querySelector('form') && document.querySelector('form').innerHTML !== html,
      antes,
      { timeout: 15000 }
    )
    .catch(() => null);

  page.off('response', escucha);

  const despues = await page.locator('form').innerHTML();
  const cuerpo = await page.locator('body').innerHTML();
  fs.writeFileSync(path.join(OUT, `${nombre}.html`), despues);

  // Texto visible del formulario: es de donde salen los locators por texto.
  const textos = await page.locator('form').allInnerTexts();

  resumen.push({
    estado: nombre,
    peticion_a_api: respuesta ? 'si' : 'no',
    codigo: respuesta ? respuesta.status : 'sin peticion',
    dom_cambio: despues !== antes,
    texto_visible: textos.join(' | ').split('\n').map((s) => s.trim()).filter(Boolean),
    mensaje_exito_en_body: /exitoso|Exitoso|éxito/.test(cuerpo),
  });

  console.log(
    `  ${nombre.padEnd(30)} peticion=${respuesta ? respuesta.status : 'ninguna'}  dom_cambio=${despues !== antes}`
  );
}

const llenar = (datos) => async (page) => {
  if (datos.nombre !== undefined) await page.getByLabel('Nombre completo').fill(datos.nombre);
  if (datos.email !== undefined) await page.getByLabel('Email').fill(datos.email);
  if (datos.password !== undefined) await page.getByLabel('Contraseña').fill(datos.password);
  if (datos.edad !== undefined) await page.getByLabel('Edad').fill(datos.edad);
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log(`Email unico de esta corrida: ${EMAIL_UNICO}\n`);

  const validos = { nombre: 'Iris Moreno', email: EMAIL_UNICO, password: 'Clave1234', edad: '30' };

  const largo = (n) => 'a'.repeat(n);

  // Cada caso lleva su propio email. Un caso que resulte aceptado consume el email de
  // forma permanente, y si se compartiera, el siguiente caso recibiria un 422 por
  // duplicado en vez de su resultado real. Es el riesgo R-01 del plan de prueba.
  const email = (caso) => `iris.qa.${SELLO}.${caso}@gmail.com`;
  const con = (caso, extra = {}) => llenar({ ...validos, email: email(caso), ...extra });

  // Bordes inferiores invalidos
  await capturar(page, 'registro-obligatorios', llenar({}), { esperaPeticion: false });
  await capturar(page, 'registro-nombre-corto', con('n1', { nombre: 'L' }), { esperaPeticion: true });
  await capturar(page, 'registro-password-corta', con('p7', { password: 'Clave12' }), { esperaPeticion: true });
  await capturar(page, 'registro-edad-baja', con('e15', { edad: '15' }), { esperaPeticion: true });

  // Bordes superiores invalidos: aca es donde el intento anterior declaro defectos
  await capturar(page, 'registro-nombre-largo', con('n51', { nombre: largo(51) }), { esperaPeticion: true });
  await capturar(page, 'registro-password-larga', con('p65', { password: largo(65) }), { esperaPeticion: true });
  await capturar(page, 'registro-edad-alta', con('e100', { edad: '100' }), { esperaPeticion: true });

  // Formato de email: REQ-R03 exige arroba Y punto en el dominio
  await capturar(page, 'registro-email-invalido', llenar({ ...validos, email: 'irismoreno.gmail.com' }), { esperaPeticion: true });
  await capturar(page, 'registro-email-sin-punto', llenar({ ...validos, email: 'irismoreno@gmail' }), { esperaPeticion: true });

  // Camino feliz, y duplicado reutilizando a proposito el email que acaba de crearse
  await capturar(page, 'registro-exito', con('ok'), { esperaPeticion: true });
  await capturar(page, 'registro-email-duplicado', con('ok'), { esperaPeticion: true });

  fs.writeFileSync(path.join(OUT, '_resumen.json'), JSON.stringify({ email_usado: EMAIL_UNICO, estados: resumen }, null, 2));
  await browser.close();

  console.log('\n=== TEXTOS VISIBLES POR ESTADO ===');
  for (const r of resumen) {
    console.log(`\n${r.estado}  [${r.codigo}]`);
    for (const t of r.texto_visible) console.log(`   ${t}`);
  }
})();
