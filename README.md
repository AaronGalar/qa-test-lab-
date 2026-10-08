<div align="center">
	<h1>QA Test Lab</h1>
	<p><strong>Diseña casos. Explora flujos. Convierte pruebas reales en vídeo.</strong></p>
	<p>Un laboratorio visual para practicar QA de principio a fin, desde el primer clic hasta el MP4 final.</p>
	<p>
		<img src="https://img.shields.io/badge/Next.js-16.3.6-111111?logo=nextdotjs" alt="Next.js 16.3.6">
		<img src="https://img.shields.io/badge/React-19.2.8-149eca?logo=react&logoColor=white" alt="React 19.2.8">
		<img src="https://img.shields.io/badge/Playwright-1.63.0-2ead33?logo=playwright&logoColor=white" alt="Playwright 1.63.0">
		<img src="https://img.shields.io/badge/Remotion-4.0.528-6e40c9" alt="Remotion 4.0.528">
	</p>
	<p>
		<a href="#empezar">Empezar</a> ·
		<a href="#recorrido-en-video">Ver el flujo de vídeo</a> ·
		<a href="#documentacion">Documentación</a>
	</p>
</div>

---

## El laboratorio

QA Test Lab es una demo interactiva para recorrer tareas habituales de testing y enseñar cómo automatizarlas. La aplicación reúne un dashboard, una biblioteca de casos de prueba y un asistente conversacional simulado. Playwright graba recorridos reales en Chromium y Remotion los transforma en vídeos guiados.

| Área                | Qué puedes probar                                                                              |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| **Casos de prueba** | Crear casos, asignar prioridad, buscar, filtrar, cambiar estados y revisar métricas.           |
| **Tareas**          | Añadir tareas, marcarlas como completadas y eliminarlas.                                       |
| **Preguntas frecuentes** | Consultar y guardar preguntas en el backend FastAPI y su base de datos SQLite.                |
| **Asistente QA**         | Explorar una conversación de ejemplo sobre escenarios de prueba. Las respuestas son simuladas. |
| **Vídeos QA**       | Grabar interacciones del navegador, medir pasos y renderizar tutoriales en MP4.                |

<p align="center">
	<img src="output/preview.png" alt="Tutorial de QA Test Lab mostrando el inicio de sesión" width="49%">
	<img src="output/TC-004-final-preview.png" alt="Confirmación de un caso de prueba creado en QA Test Lab" width="49%">
</p>
<p align="center"><sub>Dos momentos del recorrido automatizado: acceso a la demo y creación de un caso.</sub></p>

## Empezar

Necesitas Node.js compatible con Next.js 16 y npm.

```bash
git clone https://github.com/AaronGalar/qa-test-lab-.git
cd qa-test-lab-
npm ci
npx playwright install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Para entrar en la demo:

| Campo      | Valor         |
| ---------- | ------------- |
| Email      | `qa@test.com` |
| Contraseña | `123456`      |

## Comandos

| Comando                   | Acción                                                                   |
| ------------------------- | ------------------------------------------------------------------------ |
| `npm run dev`             | Inicia la aplicación en modo desarrollo.                                 |
| `npm run build`           | Genera la compilación de producción.                                     |
| `npm run start`           | Sirve la compilación de producción.                                      |
| `npm run lint`            | Ejecuta ESLint.                                                          |
| `npx tsc --noEmit`        | Comprueba los tipos de TypeScript.                                       |
| `npx playwright test`     | Ejecuta la suite en Chromium, Firefox y WebKit.                          |
| `npx playwright test --project=chromium` | Ejecuta la suite en Chromium y guarda los vídeos QA.          |
| `npm run test:tareas`     | Prueba el flujo de añadir, completar y eliminar tareas en Chromium.      |
| `npm run remotion`        | Abre Remotion Studio con las composiciones del proyecto.                 |
| `npm run record:tutorial` | Graba el recorrido de primer uso con Playwright.                         |
| `npm run render:tutorial` | Graba el recorrido y renderiza el tutorial completo.                     |
| `npm run render:ai-demo`  | Renderiza la composición de demostración del asistente IA.               |
| `npm run render:qa`       | Renderiza TC-004 usando la grabación y métricas disponibles.             |
| `npm run render:tareas`   | Ejecuta el test de tareas y renderiza `output/Tareas.mp4` con Remotion.   |

## Conectar el backend FastAPI

El frontend centraliza las llamadas HTTP y los tipos de la API en `lib/api/`.
Preguntas y casos de prueba se guardan en el backend FastAPI y SQLite:

| Método | Endpoint          | Contrato                                                                  |
| ------ | ----------------- | ------------------------------------------------------------------------- |
| `GET`  | `/api/preguntas`  | Devuelve una lista de objetos `{ "id": 1, "texto": "..." }`.             |
| `POST` | `/api/preguntas`  | Recibe `{ "texto": "..." }` y devuelve la pregunta creada.               |
| `GET`  | `/api/test-cases` | Devuelve la lista de casos de prueba guardados.                            |
| `POST` | `/api/test-cases` | Recibe `title`, `description`, `priority` y `status`; el backend asigna el ID. |
| `PATCH` | `/api/test-cases/{id}` | Actualiza el estado del caso. |
| `DELETE` | `/api/test-cases/{id}` | Elimina el caso de prueba. |

La primera vez que arranca el backend, añade los tres casos de demostración
originales si la tabla está vacía. Los IDs nuevos se asignan consecutivamente
(`TC-004`, `TC-005`, etc.) y no se reutilizan aunque se elimine un caso.
Si ya existe en `preguntas.db` una tabla `test_cases` de la estructura antigua,
la nueva API guarda sus casos en `qa_test_cases` y deja la tabla anterior intacta.

Abre dos terminales en la raíz del repositorio. En la primera, prepara y arranca
el backend:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

En la segunda terminal, configura la URL del backend (el valor por defecto ya
es `http://127.0.0.1:8000`) y arranca Next.js:

```powershell
Copy-Item .env.example .env.local
npm run dev
```

`.env.local` es local y no se sube a Git. Si cambias la URL del backend,
actualiza `NEXT_PUBLIC_API_URL`. FastAPI debe permitir el origen del frontend en
CORS; el backend actual ya permite `http://localhost:3000`.

## Recorrido en vídeo

El flujo combina tres piezas: Playwright ejecuta el escenario en Chromium, `tests/qa-metrics.ts` registra los tiempos y resultados de cada paso, y Remotion compone la grabación con rótulos sincronizados.

```text
Escenario Playwright → grabación WebM + métricas JSON → composición Remotion → MP4
```

Para generar el tutorial de primer uso:

```bash
npm run render:tutorial
```

La grabación fuente queda en `public/recordings/tutorial-ia.webm` y el vídeo final en `output/Tutorial-primer-uso.mp4`. La demo del asistente se genera como `output/Demo-asistente-IA.mp4`. Los renders e imágenes de vista previa se guardan en `output/`; las grabaciones fuente y los datos de prueba, en `public/`.

El recorrido de tareas puede probarse y renderizarse con `npm run render:tareas`. Si el test de Chromium pasa, Remotion genera `output/Tareas.mp4`. Para ejecutar un escenario completo de extremo a extremo y producir su grabación QA, usa `npm run render:qa -- TC-004`.

## Estructura

```text
app/                  Rutas y componentes compartidos de Next.js
  components/         Navegación reutilizable
  faq/                Preguntas y ejemplo de props
lib/api/              Cliente HTTP y funciones tipadas para FastAPI
tests/                Pruebas Playwright y recopilador de métricas
../backend/           API FastAPI y base de datos SQLite (carpeta hermana)
public/recordings/    Grabaciones fuente para los tutoriales
public/test-data/     Cronologías QA utilizadas por Remotion
remotion/             Composiciones de vídeo reutilizables
scripts/              Comandos para grabar y renderizar vídeos
output/               Archivos generados al renderizar
docs/                 Guías de trabajo y creación de vídeos QA
```

## Documentación

- [Guía para aprender frontend y backend paso a paso](README.aprendizaje.md)
- Ejecuta `npx playwright test --project=chromium tests/app-basics.spec.ts tests/ai-demo.spec.ts tests/login.spec.ts` para validar los flujos básicos sin recorrer todos los navegadores.
- [Guía práctica para crear vídeos QA](docs/GUIA-CREAR-VIDEOS-QA.md)
- [Guía para modificar vídeos QA](docs/GUIA-TRABAJO-MODIFICAR-VIDEOS-QA.md)
- [Playbook de IA para vídeos QA](docs/PLAYBOOK-IA-VIDEOS-QA.md)

## Alcance de la demo

Las preguntas frecuentes y los casos de prueba se leen y guardan en el backend
FastAPI y SQLite de `backend/`. Las tareas también se guardan en ese backend y
persisten al recargar. El inicio de sesión y el asistente de IA son
simulaciones; las credenciales de arriba son exclusivamente para esta demo.
