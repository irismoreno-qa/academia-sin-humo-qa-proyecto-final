Feature: Registro de estudiantes

  Alta de un aspirante como estudiante de Academia sin Humo.

  Oráculo primario: si la cuenta se creó o no, evidenciado por el código de estado de
  POST /api/register o por la ausencia de petición cuando el cliente bloquea. Las dos
  lecturas son verificables. El mensaje visible en pantalla se verifica además, nunca
  en lugar del oráculo.

  Los escenarios de rechazo no nombran la capa a propósito: la especificación exige
  que el registro sea rechazado sin decir dónde debe ocurrir. Atar la aserción al
  cliente o al servidor la rompería el día que el producto mueva la validación de
  lugar, sin que la regla haya cambiado.

  @TC-R01-001 @req-REQ-R01 @negative
  Scenario: Los cuatro campos vacios bloquean el envio
    Given que el aspirante esta en la pagina de registro sin sesion iniciada
    When envia el formulario con los cuatro campos en blanco
    Then no se emite ninguna peticion a POST /api/register
    And se informa la obligatoriedad de los cuatro campos

  @TC-R01-002 @req-REQ-R01 @negative
  Scenario: Solo el nombre vacio con el resto de campos validos
    Given que el aspirante esta en la pagina de registro
    When envia el formulario con el nombre en blanco y el resto de campos validos
    Then no se emite ninguna peticion a POST /api/register
    And se informa unicamente la obligatoriedad del nombre

  @TC-R01-003 @req-REQ-R01 @negative
  Scenario: Solo el email vacio con el resto de campos validos
    Given que el aspirante esta en la pagina de registro
    When envia el formulario con el email en blanco y el resto de campos validos
    Then no se emite ninguna peticion a POST /api/register
    And se informa unicamente la obligatoriedad del email

  @TC-R01-004 @req-REQ-R01 @negative
  Scenario: Solo la contrasena vacia con el resto de campos validos
    Given que el aspirante esta en la pagina de registro
    When envia el formulario con la contrasena en blanco y el resto de campos validos
    Then no se emite ninguna peticion a POST /api/register
    And se informa unicamente la obligatoriedad de la contrasena

  @TC-R01-005 @req-REQ-R01 @negative
  Scenario: Solo la edad vacia con el resto de campos validos
    Given que el aspirante esta en la pagina de registro
    When envia el formulario con la edad en blanco y el resto de campos validos
    Then no se emite ninguna peticion a POST /api/register
    And se informa unicamente la obligatoriedad de la edad

  @TC-R01-006 @req-REQ-R01 @happy_path
  Scenario: Los cuatro campos completos permiten el envio
    Given que el aspirante esta en la pagina de registro
    When envia el formulario con los cuatro campos en valores validos centrales
    Then POST /api/register responde con un codigo de exito
    And no se informa la obligatoriedad de ningun campo

  # Sin veredicto: REQ-R01 no define si los espacios en blanco cuentan como contenido.
  # Se ejecuta para caracterizar el comportamiento real y elevarlo como consulta al
  # responsable del producto. No se firma ni aprobado ni fallido.
  @TC-R01-007 @req-REQ-R01 @edge_case
  Scenario: Nombre completado unicamente con espacios en blanco
    Given que el aspirante esta en la pagina de registro
    When envia el formulario con el nombre compuesto solo por espacios y el resto de campos validos
    Then POST /api/register devuelve un codigo de estado y la pantalla muestra un mensaje

  @TC-R02-001 @req-REQ-R02 @boundary
  Scenario: Nombre de 1 caracter por debajo del limite inferior
    Given que el aspirante esta en la pagina de registro
    When envia el formulario con un nombre de 1 caracter y el resto de campos validos
    Then el registro es rechazado
    And no se crea la cuenta

  @TC-R02-002 @req-REQ-R02 @boundary
  Scenario: Nombre de 2 caracteres exactos en el limite inferior valido
    Given que el aspirante esta en la pagina de registro
    When envia el formulario con un nombre de 2 caracteres exactos y el resto de campos validos
    Then POST /api/register responde con un codigo de exito
    And el nombre no genera ningun error

  @TC-R02-003 @req-REQ-R02 @boundary
  Scenario: Nombre de 50 caracteres exactos en el limite superior valido
    Given que el aspirante esta en la pagina de registro
    When envia el formulario con un nombre de 50 caracteres exactos y el resto de campos validos
    Then POST /api/register responde con un codigo de exito
    And el nombre no genera ningun error

  @TC-R02-004 @req-REQ-R02 @boundary
  Scenario: Nombre de 51 caracteres por encima del limite superior
    Given que el aspirante esta en la pagina de registro
    When envia el formulario con un nombre de 51 caracteres exactos y el resto de campos validos
    Then el registro es rechazado
    And no se crea la cuenta

  @TC-R03-001 @req-REQ-R03 @happy_path
  Scenario: Email con arroba y dominio con punto
    Given que el aspirante esta en la pagina de registro
    When envia el formulario con un email que contiene arroba y un dominio con punto
    Then POST /api/register responde con un codigo de exito
    And el email no genera ningun error de formato

  @TC-R03-002 @req-REQ-R03 @negative
  Scenario: Email sin arroba
    Given que el aspirante esta en la pagina de registro
    When envia el formulario con un email que no contiene arroba
    Then el registro es rechazado
    And no se crea la cuenta

  @TC-R03-003 @req-REQ-R03 @negative
  Scenario: Email con arroba pero sin dominio
    Given que el aspirante esta en la pagina de registro
    When envia el formulario con un email que termina en arroba
    Then el registro es rechazado
    And no se crea la cuenta

  @TC-R03-004 @req-REQ-R03 @negative
  Scenario: Email con dominio sin punto
    Given que el aspirante esta en la pagina de registro
    When envia el formulario con un email cuyo dominio no contiene punto
    Then el registro es rechazado
    And no se crea la cuenta

  # Aceptarlo es el comportamiento correcto: REQ-R03 exige un @ y un dominio con punto,
  # no un TLD de una lista determinada. Se documenta como limite de interpretacion y no
  # como defecto, aunque a simple vista parezca un error de tipeo.
  @TC-R03-005 @req-REQ-R03 @edge_case
  Scenario: Email con dominio de primer nivel atipico pero sintacticamente valido
    Given que el aspirante esta en la pagina de registro
    When envia el formulario con un email cuyo dominio tiene punto y un TLD poco habitual
    Then POST /api/register responde con un codigo de exito

  @TC-R04-001 @req-REQ-R04 @boundary
  Scenario: Contrasena de 7 caracteres por debajo del limite inferior
    Given que el aspirante esta en la pagina de registro
    When envia el formulario con una contrasena de 7 caracteres exactos y el resto de campos validos
    Then el registro es rechazado
    And no se crea la cuenta

  @TC-R04-002 @req-REQ-R04 @boundary
  Scenario: Contrasena de 8 caracteres exactos en el limite inferior valido
    Given que el aspirante esta en la pagina de registro
    When envia el formulario con una contrasena de 8 caracteres exactos y el resto de campos validos
    Then POST /api/register responde con un codigo de exito
    And la contrasena no genera ningun error

  @TC-R04-003 @req-REQ-R04 @boundary
  Scenario: Contrasena de 64 caracteres exactos en el limite superior valido
    Given que el aspirante esta en la pagina de registro
    When envia el formulario con una contrasena de 64 caracteres exactos y el resto de campos validos
    Then POST /api/register responde con un codigo de exito
    And la contrasena no genera ningun error

  @TC-R04-004 @req-REQ-R04 @boundary
  Scenario: Contrasena de 65 caracteres por encima del limite superior
    Given que el aspirante esta en la pagina de registro
    When envia el formulario con una contrasena de 65 caracteres exactos y el resto de campos validos
    Then el registro es rechazado
    And no se crea la cuenta

  @TC-R05-001 @req-REQ-R05 @boundary
  Scenario: Edad de 15 anios por debajo del limite inferior
    Given que el aspirante esta en la pagina de registro
    When envia el formulario con edad 15 y el resto de campos validos
    Then el registro es rechazado
    And no se crea la cuenta

  @TC-R05-002 @req-REQ-R05 @boundary
  Scenario: Edad de 16 anios exactos en el limite inferior valido
    Given que el aspirante esta en la pagina de registro
    When envia el formulario con edad 16 y el resto de campos validos
    Then POST /api/register responde con un codigo de exito
    And la edad no genera ningun error

  @TC-R05-003 @req-REQ-R05 @boundary
  Scenario: Edad de 99 anios exactos en el limite superior valido
    Given que el aspirante esta en la pagina de registro
    When envia el formulario con edad 99 y el resto de campos validos
    Then POST /api/register responde con un codigo de exito
    And la edad no genera ningun error

  @TC-R05-004 @req-REQ-R05 @boundary
  Scenario: Edad de 100 anios por encima del limite superior
    Given que el aspirante esta en la pagina de registro
    When envia el formulario con edad 100 y el resto de campos validos
    Then el registro es rechazado
    And no se crea la cuenta

  @TC-R06-001 @req-REQ-R06 @happy_path
  Scenario: El formulario queda vacio tras un registro exitoso
    Given que el aspirante completo un registro valido con un email no usado
    And POST /api/register respondio con un codigo de exito
    When observa el formulario
    Then los cuatro campos quedan completamente vacios

  @TC-R06-002 @req-REQ-R06 @negative
  Scenario: El formulario conserva los datos tras un registro rechazado
    Given que el aspirante envio un registro con la edad fuera de rango
    And POST /api/register respondio con un codigo de rechazo
    When observa el formulario
    Then los campos conservan los datos que el aspirante escribio

  @TC-R06-003 @req-REQ-R06 @edge_case
  Scenario: Dos registros exitosos consecutivos sin arrastre de datos
    Given que el aspirante completo un primer registro exitoso confirmado por la API
    When completa un segundo registro exitoso con otro email sin recargar la pagina
    Then los cuatro campos quedan vacios
    And ningun campo conserva datos del registro anterior

  @TC-R07-001 @req-REQ-R07 @happy_path
  Scenario: Un email no registrado previamente es aceptado
    Given que el aspirante esta en la pagina de registro
    When envia el formulario con un email que no fue usado antes y el resto de campos validos
    Then POST /api/register responde con un codigo de exito
    And la cuenta queda creada

  @TC-R07-002 @req-REQ-R07 @negative
  Scenario: Un email ya registrado es rechazado
    Given que el aspirante registro previamente un email con exito confirmado por la API
    When envia el formulario con ese mismo email y otros datos validos
    Then el registro es rechazado por email duplicado
    And no se crea una segunda cuenta

  # Sin veredicto: REQ-R07 no define si la comparacion de emails distingue mayusculas
  # de minusculas. Se ejecuta para caracterizar el comportamiento real y elevarlo como
  # consulta al responsable del producto. No se firma ni aprobado ni fallido.
  @TC-R07-003 @req-REQ-R07 @edge_case
  Scenario: El mismo email con distinta capitalizacion
    Given que el aspirante registro previamente un email en minusculas con exito confirmado por la API
    When envia el formulario con ese mismo email escrito en mayusculas
    Then POST /api/register devuelve un codigo de estado y la pantalla muestra un mensaje

  # El vehiculo es el email duplicado porque es el unico rechazo de servidor observado:
  # el resto de los rechazos ocurre en el cliente sin emitir peticion, y sin respuesta
  # no hay dos capas que contrastar. La contrasena de 65 caracteres, vehiculo original
  # de este escenario, dejo de servir al confirmarse que la API la acepta con 201.
  @TC-R08-001 @req-REQ-R08 @negative
  Scenario: Un rechazo de la API no se muestra como exito en pantalla
    Given que el aspirante registro previamente un email con exito confirmado por la API
    When reenvia el formulario con ese mismo email y la pestana Network abierta
    Then POST /api/register responde con un codigo de error
    And la pantalla no muestra el mensaje de exito

  @TC-R08-002 @req-REQ-R08 @happy_path
  Scenario: Una aceptacion de la API se muestra como exito en pantalla
    Given que el aspirante esta en la pagina de registro con la pestana Network abierta
    When envia un registro valido con un email no usado
    Then POST /api/register responde con un codigo de exito
    And la pantalla muestra el mensaje de exito
