# Documentación del Back-End (UrewardGo)

El servidor de **UrewardGo** proporciona una API RESTful desarrollada con **Node.js** y **Express.js**. Para asegurar persistencia y flexibilidad estructural en el almacenamiento de datos, se eligió **MongoDB**, implementando **Mongoose** como herramienta de modelado de objetos (ODM).

A continuación se detalla la arquitectura, los modelos de datos y las rutas principales expuestas por la API.

## Arquitectura y Directorios

El sistema sigue la filosofía del patrón **MVC (Model-View-Controller)**, entendiendo que la capa de presentación (Vista) delegada está a cargo del Front-end en React, mientras el servidor se limita a responder requerimientos JSON.

El código fuente dentro de la carpeta `src/` está estructurado de la siguiente manera:
- `config/`: Archivos para la inicialización y conexión a la base de datos.
- `controllers/`: Contiene la lógica principal de negocio. Recibe las solicitudes HTTP, procesa los datos y retorna las respuestas adecuadas.
- `middleware/`: Funciones interceptoras que se ejecutan antes de llegar al controlador. Su labor es verificar la autenticación (`auth.js`), validar niveles de autorización (`rolmiddleware.js`) y procesar la entrada de archivos físicos (`upload.js`).
- `models/`: Definición de los esquemas (schemas) de Mongoose, donde se establecen los atributos, tipos de datos y reglas de validación para interactuar con MongoDB.
- `routes/`: Archivos encargados de mapear las URLs y métodos HTTP a sus respectivos controladores, ordenando el enrutamiento general.

## Modelos de Datos (Mongoose)

### 1. `Usuario`
Gestiona la identidad y el estado de los integrantes del sistema.
- **Campos principales:** `name`, `email` (único), `password`, `rol` (con valores permitidos: Admin, Lider, Trabajador) y un balance numérico `points` para el sistema de recompensas.
- **Seguridad:** Antes de realizar el guardado en la base de datos, las contraseñas son sometidas a un algoritmo de hash mediante `bcrypt` para proteger la información sensible.

### 2. `Tarea`
Representa una asignación de trabajo y su valor en el sistema.
- **Campos principales:** `title`, `description`, `dueDate` (plazo de entrega), `points` (valor de la recompensa, exigiendo un mínimo de 1), `attachments` (rutas a archivos adjuntos para proveer contexto), `status` (por defecto en "Pendiente") y `createdBy` (referencia cruzada al usuario que emitió la tarea).

### 3. `Submission` (Entrega)
Este modelo actúa como el puente transaccional entre un Trabajador y una Tarea específica. Es el elemento que certifica que un trabajo ha sido realizado.
- **Campos principales:**
  - `task` y `user`: Identificadores que vinculan la entrega con su origen y autor.
  - `filePath`: La ruta física del archivo subido como prueba del trabajo en el sistema de archivos del servidor.
  - `status`: Refleja el estado de la validación ("Pendiente", "Aprobada" o "Rechazada").
  - `feedback`: Texto opcional para explicar las correcciones en el caso de ser rechazada.
  - `claimed`: Un indicador booleano esencial para rastrear si el trabajador ya ha convertido esta entrega en puntos reales sumados a su saldo final.

### 4. `Recompensa`
El modelo que cataloga los objetos o beneficios disponibles en el sistema de canje.
- **Campos principales:** `nombre`, `descripcion`, `puntosRequeridos` (el coste de canje), `cantidadCanjes` (estadística de cuántas veces se ha entregado) y `limiteCanjes` (variable opcional para controlar el inventario).

---

## Endpoints Principales (Rutas de la API)

Toda la API está expuesta bajo el prefijo `/api/`. Las interacciones requieren mayoritariamente un token JWT válido (manejado por `authRequired`). Las rutas orientadas a configuración obligan al usuario a tener permisos administrativos a través del middleware `requireRol`.

### Entorno de Autenticación (`/api/auth`)
- `POST /register`: Da de alta un nuevo perfil. Por diseño de seguridad de la lógica de negocio, cualquier registro público asume el rol basal de "Trabajador".
- `POST /login`: Valida las credenciales aportadas contra la base de datos y retorna un token JWT firmado.
- `GET /me`: Identifica y devuelve el perfil del usuario actual descifrando la información contenida en la cabecera del token Bearer.

### Flujo Central: Creación y Entrega de Tareas (`/api/tareas`)
Este proceso se compone de cuatro momentos clave gestionados por estos endpoints:

1. **Creación (Admin):**
   - El endpoint `POST /` recibe un objeto de configuración que crea el documento tipo `Tarea` en estado inicial "Pendiente".
2. **Recepción de Evidencia (Trabajador):**
   - El usuario invoca `POST /:taskId/submit` enviando información con el tipo MIME `multipart/form-data`. El middleware `multer` intercepta la carga, almacena el documento o imagen en el disco rígido (directorio `uploads/`) y un controlador registra un modelo `Submission` en estado "Pendiente" con la ruta absoluta del archivo retenido.
3. **Auditoría de Entregas (Admin):**
   - Primero, el administrador jala las pruebas enviadas mediante `GET /:id/submissions`.
   - Luego, dictamina mediante un llamado a `PATCH /:taskId/submission/:subId/decision`, transformando el estado a "Aprobada" o a "Rechazada", proveyendo obligatoriamente un parámetro de `feedback` en caso de rechazo.
4. **Reclamación de Puntos (Trabajador):**
   - Completada la auditoría favorable, se activa la disponibilidad de llamar a `POST /:taskId/claim`. Este controlador valida transaccionalmente que la entrega posea la marca de "Aprobada" y que el atributo `claimed` siga inactivo. Así, se suma el puntaje de la tarea a la entidad `Usuario`, modificando permanentemente a verdad a `claimed` para prevenir cobros dobles e inconsistencias en la base de datos.

### Servicio de Archivos y Evidencias
Mediante el controlador estático de Node (`express.static`), se habilitó un conducto público `/uploads` que expone los archivos en forma de lectura. Esto previene tiempos adicionales de procesamiento por código y permite que el cliente renderice eficientemente pruebas documentales y fotos de comprobación directamente desde los recursos del sistema de archivos.

---

## Estrategia de Seguridad
* **Autenticación Basada en JSON Web Tokens (JWT):** Un estándar probado de la industria para preservar identidades. Operado principalmente desde `authController.js` bajo una clave criptográfica de entorno `JWT_SECRET`.
* **Middlewares de Filtrado:**
  - `authRequired`: Extrae e inspecciona el token Bearer en la petición. Si el objeto logra desencriptarse, pasa la información estructural del firmante hacia el objeto general envolvente para su uso en módulos siguientes (`req.user`).
  - `requireRol(Rol)`: Validada ya la identidad, esta barrera verifica lógicamente la idoneidad y jerarquía (`req.user.rol`), interrumpiendo tempranamente cualquier petición hacia secciones restringidas.
