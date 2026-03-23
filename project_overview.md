# Resumen del Proyecto: UrewardGo

Bienvenido a la documentación técnica de **UrewardGo**. Esta plataforma fue diseñada para incentivar a los equipos de trabajo a través de un sistema de gamificación, donde las labores diarias se transforman en tareas cuantificables que otorgan puntos canjeables por recompensas.

Para facilitar la comprensión integral del sistema, la documentación técnica está dividida en dos componentes principales:
1. **[Documentación del Back-end](file:///C:/Users/admon/.gemini/antigravity/brain/8d203817-13bd-427a-91f6-7a79743cfb41/backend_documentation.md):** Describe la arquitectura de nuestra API REST construida con Node.js y Express, junto con el modelado de datos en MongoDB utilizando Mongoose.
2. **[Documentación del Front-end](file:///C:/Users/admon/.gemini/antigravity/brain/8d203817-13bd-427a-91f6-7a79743cfb41/frontend_documentation.md):** Detalla la estructura de la Single Page Application (SPA) creada con React y Vite, y explica cómo se administra el estado global y la sesión de los usuarios mediante Context API.

## Flujo Principal del Sistema

### Creación y Aprobación de Tareas

El núcleo lógico de UrewardGo gira en torno a la asignación de tareas y la validación del trabajo realizado. Este ciclo garantiza que el proceso sea transparente y auditable:

**1. Definición de la Tarea (Rol: Administrador o Líder)**
El proceso inicia cuando un administrador crea una nueva asignación. Al hacerlo, define los parámetros clave: título, descripción, fecha de vencimiento y la cantidad de puntos de recompensa. Tras guardarse, el registro se almacena en la base de datos con estado "Pendiente" y se visualiza en el panel de los trabajadores de forma inmediata.

**2. Ejecución y Reporte de Evidencia (Rol: Trabajador)**
El trabajador accede a su panel para revisar las tareas disponibles. Una vez que finaliza su labor, debe enviar un comprobante mediante la plataforma. Utilizando un componente de carga de archivos, el trabajador adjunta una "Evidencia" que respalde su trabajo.
En el aspecto técnico, este paso implica:
- Almacenar físicamente el archivo en el servidor, dentro del directorio `uploads`.
- Crear un registro tipo `Submission` (Entrega) en la base de datos. Este registro vincula al usuario, la tarea correspondiente y la ubicación del archivo, quedando inicialmente en estado "Pendiente de revisión".

**3. Revisión y Veredicto (Rol: Administrador)**
El administrador dispone de una vista específica para auditar todas las entregas (`Submissions`) recibidas. Tras evaluar el archivo adjunto, toma una decisión:
- **Aprobar:** Si el trabajo es satisfactorio, el estado del registro cambia a "Aprobada".
- **Rechazar:** Si advierte inconsistencias, rechaza la entrega y proporciona obligatoriamente retroalimentación (feedback) para que el trabajador sepa qué aspectos debe corregir.

**4. Reclamación de los Puntos (Rol: Trabajador)**
Para brindar control al usuario sobre sus beneficios, los puntos no se acumulan automáticamente de forma pasiva. Cuando una entrega es aprobada, el trabajador debe ingresar a la plataforma y accionar el botón "Reclamar". En este momento, el sistema suma los puntos asociados a la tarea al balance del usuario y marca la entrega como "Reclamada". Este paso evita duplicidades y cierra el ciclo de la tarea.

### Funcionalidades Adicionales
- **Catálogo de Recompensas:** Un módulo donde los líderes registran premios y los trabajadores pueden canjear sus puntos acumulados. Cada redención genera un historial de canjes que facilita la trazabilidad.
- **Sistema de Ranking:** Una tabla de posiciones diseñada para fomentar una competencia sana y mantener la motivación del equipo al visualizar quién ha acumulado más puntos.

## Entorno de Ejecución local
Para desplegar el proyecto en un entorno de desarrollo:
- **Back-end:** Sitúese en el directorio `Back` y ejecute `npm run dev` para iniciar el servidor (puerto 4000 por defecto). Es necesario contar con un archivo `.env` que contenga la variable `MONGO_URI` con las credenciales de la base de datos y un `JWT_SECRET` para la seguridad.
- **Front-end:** En el directorio `Front`, ejecute `npm run dev` para iniciar React sobre Vite (puerto 5173 por defecto). Requiere un archivo `.env` con la variable `VITE_API_BASE` apuntando a la dirección local del servidor backend.

Lo invitamos a revisar los documentos adjuntos de Front-end y Back-end para un análisis en profundidad del código fuente.
