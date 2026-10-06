// Le dice a Next.js que este componente usa funciones del navegador (interacción, estados en vivo)
"use client";

// Importamos useState desde React para crear la "memoria" de nuestra aplicación
import { useState, type FormEvent } from "react";
// Importamos Link de Next.js para navegar entre páginas sin recargar la pantalla
import Link from "next/link";

// INTERFAZ: Define la estructura o modelo de datos que DEBE tener cada tarea en TypeScript
interface Tarea {
  id: number;          // Un identificador único (ej: 171100239)
  texto: string;       // El texto de la tarea
  completada?: boolean; // El signo '?' significa opcional, pero indica si la tarea está lista (true/false)
}

export default function TasksPage() {
  // ESTADO 1: Guarda el texto que el usuario está escribiendo en el <input>
  const [textoTarea, setTextoTarea] = useState("");

  // ESTADO 2: Guarda la lista completa de tareas.
  // <Tarea[]> indica a TypeScript que este arreglo solo guardará objetos que sigan la interfaz Tarea
  const [listaTareas, setTareas] = useState<Tarea[]>([]);

  // FUNCIÓN 1: Añadir una tarea al enviar el formulario, también con la tecla Enter.
  const agregarTarea = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // .trim() quita los espacios al inicio y al final.
    // Si la cadena queda vacía "", el 'return' detiene la función y no añade nada.
    if (textoTarea.trim() === "") return;

    // Construimos el nuevo objeto de tarea siguiendo la interfaz
    const nuevaTarea: Tarea = {
      id: Date.now(),      // Genera un número único usando los milisegundos de la fecha/hora actual
      texto: textoTarea.trim(),
      completada: false,   // Por defecto, toda tarea nueva nace desmarcada
    };

    // Actualizamos la lista de tareas.
    // [...listatareas, nuevaTarea] usa el operador 'spread' (...):
    // Copia todas las tareas anteriores y coloca la nueva al final del arreglo.
    setTareas((tareasActuales) => [...tareasActuales, nuevaTarea]);

    // Limpiamos el valor del estado del texto para que el <input> vuelva a quedar vacío
    setTextoTarea("");
  };

  // FUNCIÓN 2: Marcar / Desmarcar tarea como completada
  const alternarCompletada = (id: number) => {
    // prevTareas es el valor más reciente de la lista
    setTareas((tareasActuales) =>
      // map() crea una lista nueva y solo reemplaza la tarea que coincide por ID.
      tareasActuales.map((tarea) =>
        // ¿Es esta la tarea que el usuario clickeó? (comparamos IDs)
        tarea.id === id
          ? { ...tarea, completada: !tarea.completada } // SÍ: Copia la tarea e invierte completada (true <-> false)
          : tarea                                      // NO: Deja la tarea tal cual está
      )
    );
  };

  // FUNCIÓN 3: Eliminar tarea
  const eliminarTarea = (id: number) => {
    // .filter() genera una nueva lista guardando solo los elementos que cumplan la condición
    // (Conserva las tareas cuyos IDs sean DIFERENTES al id seleccionado)
    setTareas((prevTareas) => prevTareas.filter((tarea) => tarea.id !== id));
  };

  return (
    <main className="min-h-screen bg-[#07111f] p-6 text-white antialiased lg:p-10">
      <div className="mx-auto max-w-[1200px]">
        {/* Enlace de navegación de Next.js */}
        <Link href="/" className="text-sm text-slate-400 hover:text-white">
          ← Volver al dashboard
        </Link>

        <h1 className="mt-8 text-3xl font-bold tracking-tight">
          Lista de tareas
        </h1>

        <form onSubmit={agregarTarea}>
          {/* Un input controlado refleja el estado y lo actualiza en cada cambio. */}
          <label htmlFor="texto-tarea" className="sr-only">
            Nueva tarea
          </label>
          <input
            id="texto-tarea"
            type="text"
            placeholder="Añade aquí tu tarea"
            value={textoTarea}
            onChange={(e) => setTextoTarea(e.target.value)}
            className="mt-6 w-full rounded-lg border border-white/[0.08] bg-[#0b192b] p-2 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />

          <button
            className="mt-4 rounded-lg bg-sky-500 px-4 py-2 text-slate-950 transition-colors hover:bg-sky-400"
            type="submit"
          >
            Añadir tarea
          </button>
        </form>

        {/* LISTA: Renderizado dinámico de las tareas */}
        <ul className="mt-6 space-y-2">
          {/* .map() recorre el arreglo 'listatareas' y genera un <li> por cada tarea */}
          {listaTareas.map((tarea) => (
            <li
              // key es Obligatorio en React para que sepa exactamente qué elemento modificar en el DOM
              key={tarea.id}
              className="bg-[#0b192b] border border-white/[0.08] px-4 py-2 rounded-lg flex justify-between items-center"
            >
              {/* Mostramos el texto de la tarea con un estilo condicional (tachado si está completada) */}
              <span className={tarea.completada ? "line-through text-slate-500" : ""}>
                {tarea.texto}
              </span>

              <div className="flex space-x-2">
                {/* Botón para cambiar el estado a completado/no completado */}
                <button
                  className="bg-sky-500 text-slate-950 px-3 py-1 rounded-lg hover:bg-sky-600 transition-colors"
                  onClick={() => alternarCompletada(tarea.id)}
                >
                  {tarea.completada ? "Desmarcar" : "Marcar"}
                </button>

                {/* Botón para borrar la tarea de la lista */}
                <button
                  className="bg-red-500 text-slate-950 px-3 py-1 rounded-lg hover:bg-red-600 transition-colors"
                  onClick={() => eliminarTarea(tarea.id)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}