# Documentación del Front-End (UrewardGo)

El desarrollo de la interfaz de usuario en **UrewardGo** persigue responder a los requerimientos de dos perfiles clave: el trabajador que busca registrar sus labores sin fricción, y el administrador responsable de verificar el cumplimiento. 

Para sostener una experiencia interactiva sin recargas innecesarias y un flujo de comunicación óptimo se estructuró una Single Page Application (SPA). El marco de trabajo escogido fue **React 18** gestionado a través de **Vite** para acelerar drásticamente los tiempos de compilación y empaquetamiento.

## Estructura del Código Fuente

Toda la base de la aplicación reside en el directorio secundario `src/`, en donde rige un esquema de responsabilidad única por carpetas:

- `components/`: Módulos de interfaz que se repiten transversalmente a lo largo de las rutas de usuario. Por ejemplo, la estructura principal de navegación (`Sidebar.jsx`) y el controlador central del bloqueo de acceso visual (`ProtectedRoute.jsx`).
- `context/`: La capa proveedora de la información global asíncrona dedicada por exclusividad al control de la membresía en `AuthContext.jsx`.
- `pages/`: Cada archivo compone el ensamble central del contenido a mostrarse asociado estrechamente a una URL en el enrutamiento.
- `services/`: Un módulo dedicado a las llamadas a red. Las peticiones a APIs no existen sueltas dentro de React; todas transitan por abstracciones ordenadas creadas en `api.js`.
- `App.jsx`: El manifestador top-level de componentes donde convergen la Context API de React y el enrutamiento primario derivado de React Router DOM.

---

## Barreras Lógicas y Administración de Sesiones

Para preservar la accesibilidad condicional y la privacidad de los módulos internos, se depende primordialmente del almacenamiento pasivo de un JWT en el `localStorage` del navegador.

- **El Contexto de Intercomunicación (`AuthContext`):** Este archivo inicia un proceso asíncrono tan pronto como la aplicación es montada en el navegador. Intercepta el JWT latente, valida su estado frente al backend y provee a lo largo y ancho de React (a través de `useAuth()`) el objeto constante y estructurado del `user` en sesión, además de simplificar las funciones para ejecutar cierres y aperturas de nuevos logins.
- **La Protección de Acceso (`ProtectedRoute`):** Como mediador programático, encierra aquellas áreas bajo la URL `/app/*`. Si un visitante no guarda información válida en variables de sesión (`user` en estado vacío o falso), intercepta de forma silenciosa e imperativa la pantalla devolviendo automáticamente al sujeto nuevamente hacia un entorno público (`/login`).

---

## Módulo de Coordinación: Registro y Auditoría de Tareas (TaskRegister)

El componente principal respecto a la interacción es `TaskRegister.jsx`. Posee una lógica dinámica sustancial, puesto que responde de un modo condicionado adaptando todo su renderizado general cuando el visitante evaluado por el `useAuth()` reporta ser Administrador o un Trabajador.

**Flujo Funcional en Tiempos de Ejecución:**

1. **Gestión Directiva (Usuario Administrador):** 
   - La pantalla rinde permanentemente el formulario de inscripción para registrar asignaciones nuevas. Posterior al ingreso natural del texto estructurado que define qué se solicitara, la llamada es enviada. Utilizando React Hooks, tan pronto la estructura remota en Mongo persiste la acción, la propia lista general de interfaz se renueva incorporando unificado el ítem recién añadido.
2. **Presentación Modular:**
   - Para ambos tipos de jerarquía, la lectura principal corre en segundo plano (`listTasks()`), abasteciendo los bloques que constituyen la lista general mostrada en forma de tarjetas sobre el tablero.
3. **Flujo Carga de Pruebas Físicas (Usuario Trabajador):**
   - Cundo el empleado revisa una labor y decide declarar cumplimiento, la respuesta de sistema demanda un soporte empírico. 
   - **Mecanismo de Transmisión de Archivos:** Las variables informativas tradicionales basadas en JSON no soportan bien la inyección masiva de bytes de una fotografía directa. Por tal razón, el programa acopla los binarios en un tipo de objeto nativo particular del dom: un `FormData`. Nuestra capa general de servicios discrimina e intercepta esta necesidad, remueve explícitamente el encabezado JSON natural permitiendo al agente explorador procesar automáticamente encuadramientos de frontera (*boundary delimiters*) y manda con resiliencia el paquete híbrido mediante `multipart/form-data`.
4. **Veredicto Definitivo:**
   - Alternando a la perspectiva de la auditoría, la sesión del jefe muestra esta evidencia particular por cada individuo. Este módulo lee mediante listados anidados el documento y facilita un acceso veloz apuntando a la fuente en bruto servida desde `/uploads`. Una vez evaluado, un proceso RESTful se encarga de someter un `PATCH` formal emitiendo estados definitivos ("Aprobar", "Rechazar"), y la estructura reactiva de la página purga correspondientemente esta actividad tras confirmar la alteración desde el servidor final.

---

## El Gestor Céntrico de Peticiones Asincrónicas (API Services)

Con el fin de no mezclar responsabilidades de estado y UI junto al procesamiento a bajo nivel de internet, se compiló `api.js`. Esta abstracción es responsable del pulso completo en todo evento transaccional.

Construimos internamente un enrutador global de peticiones llamado `http()` que garantiza las reglas transversales de negocio:
1. Asegura automáticamente el traspaso integral del token en la cabecera del *Authorization Header*.
2. Posee lógica condicional interna evaluadora de datos para interpretar con eficacia si un llamado posee la característica binaria de ser un File nativo u si, por el contrario, requiere seriación a JSON regular.
3. Condensa respuestas HTTP erráticas de red a una capa unificante de Errores nativos (`throw new Error()`) permitiendo a los distintos segmentos de frontend resolver excepciones predecibles, arrojándolas uniformemente al usuario del modo más amable posible con elementos visuales de retroalimentación inmediata.
