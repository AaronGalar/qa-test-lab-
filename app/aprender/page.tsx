import AppNavigation from "../components/AppNavigation";

const exercises = [
  {
    number: "01",
    title: "Guardar tareas en el navegador",
    level: "Principiante",
    goal: "Evitar que la lista de tareas desaparezca al recargar la página.",
    files: "app/tareas/page.tsx",
    steps: [
      "Crea un efecto con useEffect que lea las tareas de localStorage al iniciar.",
      "Guarda la lista cada vez que cambie el estado de tareas.",
      "Comprueba que el primer render no sobrescriba los datos guardados.",
    ],
    acceptance:
      "Añade una tarea, recarga /tareas y verifica que sigue en pantalla.",
  },
  {
    number: "02",
    title: "Editar un caso de prueba",
    level: "Intermedio",
    goal: "Practicar cómo actualizar un elemento concreto de una lista en React.",
    files: "app/test-cases/page.tsx",
    steps: [
      "Añade un estado que guarde el ID del caso que se está editando.",
      "Rellena el formulario con los datos del caso seleccionado.",
      "Usa map() para reemplazar solo ese caso y conserva los demás.",
    ],
    acceptance:
      "Edita el título de un caso y verifica que sus otros campos no cambian.",
  },
  {
    number: "03",
    title: "Buscar preguntas frecuentes",
    level: "Principiante",
    goal: "Filtrar una lista sin mutar el estado original.",
    files: "app/faq/page.tsx y app/faq/respuestas.tsx",
    steps: [
      "Añade un campo de búsqueda controlado con useState.",
      "Usa filter() para encontrar preguntas que incluyan el texto escrito.",
      "Muestra un mensaje útil cuando no haya coincidencias.",
    ],
    acceptance:
      "Busca una palabra, comprueba las coincidencias y prueba una búsqueda vacía.",
  },
  {
    number: "04",
    title: "Probar un flujo con Playwright",
    level: "Intermedio",
    goal: "Convertir un requisito de QA en una prueba de navegador repetible.",
    files: "tests/tareas.spec.ts",
    steps: [
      "Describe el resultado esperado antes de escribir los pasos.",
      "Localiza elementos por su rol o etiqueta accesible.",
      "Añade una expectativa para el resultado, no solo para el clic.",
    ],
    acceptance:
      "Ejecuta npm run test:tareas y confirma que el escenario termina correctamente.",
  },
] as const;

// Esta página es un Server Component: solo presenta contenido y no necesita estado.
export default function LearningPage() {
  return (
    <main className="min-h-screen bg-[#07111f] text-white antialiased">
      <header className="border-b border-white/[0.08] bg-[#0b192b]/90 px-6 py-5 lg:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300/80">
          Ruta de aprendizaje
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Aprende React construyendo QA Test Lab
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Cada reto parte de un archivo real del proyecto. Lee los pasos,
          implementa la mejora y valida el resultado con el criterio de
          aceptación.
        </p>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        <AppNavigation activeHref="/aprender" />

        <section
          aria-label="Ejercicios de React y testing"
          className="min-w-0 flex-1 p-6 lg:p-10"
        >
          <div className="grid gap-5 xl:grid-cols-2">
            {exercises.map((exercise) => (
              <article
                key={exercise.number}
                className="rounded-2xl border border-white/[0.08] bg-[#0b192b]/80 p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold tracking-widest text-sky-300">
                      RETO {exercise.number}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold">
                      {exercise.title}
                    </h2>
                  </div>
                  <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-xs text-sky-200">
                    {exercise.level}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-300">
                  {exercise.goal}
                </p>
                <p className="mt-4 font-mono text-xs text-slate-400">
                  Archivo: {exercise.files}
                </p>

                <h3 className="mt-5 text-sm font-semibold text-slate-200">
                  Pasos
                </h3>
                <ol className="mt-2 list-inside list-decimal space-y-2 text-sm leading-6 text-slate-400">
                  {exercise.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>

                <p className="mt-5 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.06] p-4 text-sm leading-6 text-emerald-100">
                  <strong>Criterio de aceptación:</strong> {exercise.acceptance}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
