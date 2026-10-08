# Guía para aprender frontend y backend con QA Test Lab

Esta guía explica los conceptos usando el proyecto que ya tienes, no una
aplicación inventada. La idea es entender cada paso y luego practicarlo aquí.

## Qué vamos a aprender hoy

**Objetivo:** entender y comprobar el flujo de tareas de principio a fin:

```text
Pantalla React → función de lib/api/tareas.ts → petición HTTP → endpoint FastAPI
→ base de datos SQLite → respuesta JSON → pantalla React actualizada
```

La pantalla de tareas ya llama a las funciones API de `lib/api/tareas.ts`. El
backend tiene endpoints para listarlas, crearlas, completarlas y eliminarlas
(`GET`, `POST`, `PATCH` y `DELETE`). Hoy seguiremos cada acción desde el clic
hasta SQLite y comprobaremos que los datos sobreviven a una recarga.

### El plan, paso a paso

1. **Leer la pantalla.** Localizar los estados React, el formulario y las
   funciones que responden a añadir, completar y eliminar.
2. **Seguir la lectura.** Trazar `useEffect` → `obtenerTareas` → `GET
   /api/tareas` → consulta a SQLite → actualización de la lista.
3. **Seguir la escritura.** Trazar `agregarTarea` → `crearTarea` → `POST` →
   validación con Pydantic → guardado en SQLite → nueva tarea en pantalla.
4. **Entender los cambios y errores.** Comparar el flujo `PATCH` y `DELETE`;
   ver cómo la pantalla muestra estados de carga y errores.
5. **Probarlo manualmente.** Crear una tarea, recargar, completarla, volver a
   recargar y eliminarla. Revisar las peticiones en Developer Tools → Network.
6. **Verificar automáticamente.** Ejecutar `npm run test:tareas` y explicar en
   voz alta qué hizo cada capa en uno de los flujos.

**Resultado esperado:** poder explicar y comprobar cómo una interacción de
React llega a FastAPI y SQLite, y cómo vuelve como respuesta a la pantalla.

## Mapa del proyecto

| Parte | Dónde está | Para qué sirve |
| --- | --- | --- |
| Páginas y componentes | `app/` | La interfaz y las rutas web. |
| Pantalla de preguntas | `app/faq/page.tsx` | Ejemplo real de una pantalla React conectada a la API. |
| Cliente HTTP | `lib/api/client.ts` | Forma la URL, hace `fetch` y trata respuestas HTTP fallidas. |
| Funciones para la API | `lib/api/` | Una función por operación del frontend, como obtener o crear datos. |
| Backend | `backend/main.py` | Rutas FastAPI que reciben peticiones. |
| Modelos de base de datos | `backend/models.py` | Tablas SQLite representadas como clases Python. |
| Conexión a SQLite | `backend/database.py` | Crea el motor y las sesiones de base de datos. |
| Pruebas de navegador | `tests/` | Comprueban los flujos de la aplicación con Playwright. |

## Conceptos básicos de programación

### Variables

Una variable tiene un nombre y guarda un valor para usarlo después.

En JavaScript y TypeScript:

```ts
const nombre = "Ana"; // No reasignamos esta variable.
let contador = 0; // Podemos asignarle otro valor más adelante.
contador = contador + 1;
```

Usa `const` por defecto. Usa `let` cuando de verdad vayas a reasignar la
variable. En React, los valores que deben actualizar la pantalla suelen
guardarse en estado (`useState`), no en una variable normal.

En Python:

```python
nombre = "Ana"
contador = 0
contador = contador + 1
```

Python no lleva `const` o `let` delante del nombre. La indentación (los espacios
al inicio de la línea) delimita los bloques de código.

### Funciones

Una función agrupa instrucciones, puede recibir datos (parámetros) y puede
devolver un resultado.

```ts
function saludar(nombre: string): string {
  return `Hola, ${nombre}`;
}

const mensaje = saludar("Ana");
```

La misma idea con una función flecha:

```ts
const duplicar = (numero: number): number => numero * 2;
```

En Python:

```python
def saludar(nombre: str) -> str:
    return f"Hola, {nombre}"
```

`nombre` es el parámetro. `return` devuelve el resultado. Los tipos (`string`,
`number`, `str`) ayudan a entender qué datos espera la función.

### Objetos y listas

Un objeto agrupa datos con nombre; una lista contiene varios valores:

```ts
type Tarea = {
  id: number;
  texto: string;
  completada: boolean;
};

const tareas: Tarea[] = [
  { id: 1, texto: "Probar la API", completada: false },
];
```

En este ejemplo, `Tarea` describe la forma que debe tener cada tarea y `Tarea[]`
significa "una lista de tareas". Los tipos de la API del proyecto también
documentan el contrato esperado entre frontend y backend.

### Asincronía: `async` y `await`

Una petición a otro programa tarda un tiempo. `async` marca una función
asíncrona y `await` espera su resultado sin bloquear el resto de la página:

```ts
async function cargarTareas() {
  const lista = await obtenerTareas();
  return lista;
}
```

Si algo falla durante la petición, `try`/`catch` permite mostrar el error en la
interfaz en vez de fingir que todo salió bien:

```ts
try {
  const lista = await obtenerTareas();
  setTareas(lista);
} catch (error) {
  setError(error instanceof Error ? error.message : "Error inesperado");
}
```

## Cómo funciona el frontend

### React: componentes, propiedades y estado

Un componente React es una función que devuelve la interfaz. En este proyecto,
`FaqPage` es un componente de página. El estado contiene datos que cambian y
hacen que React vuelva a dibujar la pantalla:

```tsx
const [pregunta, setPregunta] = useState("");
```

- `pregunta` es el valor actual.
- `setPregunta(...)` lo actualiza.
- `useState("")` indica que empieza como texto vacío.

Un componente puede recibir datos mediante **props** (propiedades). Por ejemplo,
la página FAQ entrega su lista al componente `Respuestas`.

### Eventos y formularios

Los eventos responden a acciones del usuario. `onChange` reacciona al cambio de
un campo; `onSubmit` reacciona al envío del formulario. En un formulario React
se suele llamar a `preventDefault()` para que el navegador no recargue la página
automáticamente.

La página `app/faq/page.tsx` muestra el patrón completo: guarda lo escrito con
`useState`, envía el formulario, espera a `crearPregunta` y actualiza la lista.

### Next.js y `"use client"`

En este proyecto, Next.js organiza las páginas por carpetas dentro de `app/`.
Por ejemplo, `app/faq/page.tsx` corresponde a la página `/faq`.

Las páginas que necesitan interacción del navegador, como estado, efectos o
eventos de formulario, declaran `"use client";` al principio del archivo.
`useEffect` sirve aquí para pedir las preguntas cuando la página aparece.
No hace falta convertir todas las páginas en componentes de cliente: se usa
cuando una pantalla necesita esa interactividad.

## Cómo se conectan frontend y backend

### HTTP y JSON

El frontend y el backend son programas separados. Se comunican enviando
peticiones HTTP y, normalmente, intercambian datos JSON.

| Verbo | Uso habitual | Ejemplo del proyecto |
| --- | --- | --- |
| `GET` | Leer datos | `GET /api/tareas` |
| `POST` | Crear datos | `POST /api/tareas` con `{"texto":"Estudiar"}` |
| `PATCH` | Cambiar parte de un dato | `PATCH /api/tareas/1` con `{"completada":true}` |
| `DELETE` | Eliminar datos | `DELETE /api/tareas/1` |

Una respuesta JSON de tarea tiene este aspecto:

```json
{
  "id": 1,
  "texto": "Estudiar",
  "completada": false
}
```

El **contrato** es el acuerdo sobre rutas, verbos y campos. Si el frontend envía
`texto` pero el backend espera otro nombre, la operación no funcionará.

### `fetch` y el cliente común

`fetch` hace una petición HTTP desde JavaScript. El proyecto lo centraliza en
`lib/api/client.ts`: construye la URL usando `NEXT_PUBLIC_API_URL`, comprueba si
la respuesta HTTP fue correcta y devuelve el JSON. Así, las demás funciones no
tienen que repetir esa lógica.

Una llamada sencilla se puede escribir así:

```ts
const respuesta = await fetch("http://127.0.0.1:8000/api/tareas");
if (!respuesta.ok) {
  throw new Error(`HTTP ${respuesta.status}`);
}
const tareas = await respuesta.json();
```

En el proyecto, es preferible reutilizar `apiRequest` y las funciones de
`lib/api/` en vez de repetir este ejemplo en cada página.

### Funciones del frontend para la API

`lib/api/tareas.ts` ofrece funciones con nombres que describen cada operación:

```ts
obtenerTareas(); // GET: devuelve una promesa con la lista.
crearTarea("Estudiar"); // POST: envía JSON y devuelve la tarea creada.
alternarCompletada(1, true); // PATCH: actualiza el estado.
eliminarTarea(1); // DELETE: elimina una tarea.
```

Estos ejemplos muestran la intención. En código, hay que usar `await` o
`then(...)` porque las llamadas devuelven promesas y no el resultado inmediato.

## Cómo funciona el backend Python

### FastAPI: rutas y funciones

FastAPI conecta una dirección HTTP con una función Python mediante decoradores:

```python
@app.get("/api/tareas")
def obtener_tareas(db: Session = Depends(get_db)):
    return db.query(models.TareaModel).order_by(models.TareaModel.id).all()
```

- `@app.get("/api/tareas")` registra la ruta para peticiones `GET`.
- `obtener_tareas` contiene lo que hace esa ruta.
- `Depends(get_db)` proporciona una sesión de base de datos para la petición.
- `return` devuelve datos que FastAPI convierte a JSON.

El backend del proyecto declara rutas equivalentes para listar, crear,
actualizar y eliminar tareas en `backend/main.py`.

### Pydantic: validar los datos recibidos

Un esquema describe qué forma deben tener los datos de entrada. Por ejemplo:

```python
class CrearTareaSchema(BaseModel):
    texto: str
    completada: bool = False
```

Si llega un JSON como `{"texto":"Estudiar"}`, FastAPI lo valida y lo entrega a
la función del endpoint. Un valor que no respete el esquema genera un error de
validación en vez de pasar datos inesperados sin comprobar.

### SQLite y SQLAlchemy

SQLite guarda los datos en un archivo local. SQLAlchemy permite trabajar con
tablas usando modelos y consultas Python. En `backend/models.py`,
`TareaModel` representa la tabla de tareas; `SessionLocal` en
`backend/database.py` crea sesiones para consultar y guardar información.

El patrón de creación que aparece en el endpoint es:

1. Crear un objeto del modelo con los datos recibidos.
2. Añadirlo a la sesión con `db.add(...)`.
3. Guardar los cambios con `db.commit()`.
4. Leer la fila guardada con `db.refresh(...)`.
5. Devolver el objeto para que FastAPI lo convierta a JSON.

### CORS: permitir la conexión local

El navegador aplica restricciones de origen. CORS es la configuración que
permite al frontend en `http://localhost:3000` llamar al backend en
`http://127.0.0.1:8000`. El backend ya permite esos orígenes de desarrollo en
`backend/main.py`. En producción se debe configurar el origen real del frontend,
no abrir el acceso sin necesidad.

## Arrancar el proyecto en Windows

Abre dos terminales en la carpeta del proyecto.

**Terminal 1: backend**

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload
```

La guía principal explica cómo crear el entorno virtual e instalar los
requisitos si todavía no están instalados. Con el backend en marcha, su
documentación interactiva queda disponible en
[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

**Terminal 2: frontend**

```powershell
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). El cliente usa
`http://127.0.0.1:8000` por defecto; `.env.example` muestra cómo configurar
`NEXT_PUBLIC_API_URL` en `.env.local` si necesitas otra dirección.

## Cómo investigar un fallo

Cuando una acción no funciona, sigue la petición de principio a fin:

1. ¿El componente registra el evento del usuario?
2. ¿La función correcta de `lib/api/` se llama con los datos correctos?
3. ¿El navegador envía la petición? Revisa **Developer Tools → Network**.
4. ¿La ruta y el método existen en FastAPI? Compruébalos en `/docs`.
5. ¿El cuerpo JSON tiene los nombres y tipos que espera Pydantic?
6. ¿La operación de SQLite se guarda y la respuesta vuelve al frontend?
7. ¿La interfaz muestra el resultado o el error?

## Ejercicios para comprobar que lo entendiste

1. Sin mirar la tabla de arriba, explica la diferencia entre `GET` y `POST`.
2. Encuentra qué estado controla el texto del campo en la pantalla FAQ.
3. Sigue `crearPregunta` desde el evento del formulario hasta el `db.commit()`.
4. Cambia el estado de una tarea y comprueba en Network qué JSON se envía.
5. Al recargar, ¿por qué sigue ahí una tarea aunque el estado React empiece vacío?
6. Explica qué error vería el usuario si FastAPI no estuviera ejecutándose.

**Siguiente paso después de hoy:** aprender pruebas automatizadas con Playwright
y escribir una prueba para el flujo conectado de tareas.
