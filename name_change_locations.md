# Ubicaciones del Nombre Antiguo (TaskRewardPro)

Tras examinar a fondo todo el código fuente del proyecto, la buena noticia es que **el nombre antiguo NO se encuentra en ningún archivo de código puro de React (`.jsx`), en ningún estilo (`.css`), ni en controladores/modelos del Back-end (`.js`).**

El nombre `TaskRewardPro` (o sus variaciones en minúscula `taskrewardpro-main` / `taskrewardpro-front`) solo permanece escrito en archivos de configuración de paquetes (donde se define el nombre técnico del módulo para npm) y en la documentación antigua que ya tenías en la carpeta raíz.

Aquí tienes la lista exacta de dónde se encuentra para que puedas hacer la corrección técnica de los repositorios y JSON en el futuro:

### 1. Archivos de Configuración (Node/npm)
- `Back/package.json` (Línea 2)
- `Back/package-lock.json` (Líneas 2 y 8)
- `Front/package.json` (Línea 2)
- `Front/package-lock.json` (Líneas 2 y 8)
- `package-lock.json` (Raíz) (Línea 2)

### 2. Documentación Antigua (Documentos `.md` existentes en la raíz)
- `README.md` (Líneas 1, 5, 51, 161)
- `MAPA_DEL_PROYECTO.md` (Líneas 1, 7, 41)
- `RESUMEN_PARA_EXPOSICION.md` (Líneas 1, 5, 216, 311, 351)
- `INDICE_DOCUMENTACION.md` (Líneas 1, 49)
- `GUIA_EXPOSICION.md` (Múltiples menciones en líneas 1, 9, 27, 37, 471, 789, 804)
- `DOCUMENTACION_DETALLADA.md` (Líneas 1, 19, 1304, 1322, 1338, 1541)
- `DIAGRAMAS_ARQUITECTURA.md` (Líneas 1, 691, 1142)

*Nota: Para los archivos `.json`, cuando decidas modificarlos, recuerda simplemente cambiar el key `"name"` y luego ejecutar `npm install` en ambas carpetas para que se regenere automáticamente el `package-lock.json`.*

---
*Documento inspeccionado, recopilado y generado por **Antigravity** (Asistente de IA de Google DeepMind).*
