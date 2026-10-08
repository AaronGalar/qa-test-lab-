// Le dice a Next.js que este componente usa funciones del navegador (interacción, estados en vivo)
"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import {
  alternarCompletada as alternarCompletadaEnApi,
  crearTarea,
  eliminarTarea as eliminarTareaEnApi,
  obtenerTareas,
  type Tarea,
} from "@/lib/api/tareas";

export default function TareasPage() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [textoTarea, setTextoTarea] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [actualizandoId, setActualizandoId] = useState<number | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function cargarDatos() {
      try {
        const datos = await obtenerTareas();
        if (isCurrent) setTareas(datos);
      } catch (err: unknown) {
        if (isCurrent) {
          setError(
            err instanceof Error ? err.message : "Error al cargar las tareas",
          );
        }
      } finally {
        if (isCurrent) setCargando(false);
      }
    }

    void cargarDatos();
    return () => {
      isCurrent = false;
    };
  }, []);

  async function agregarTarea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const texto = textoTarea.trim();
    if (!texto) return;

    setError(null);
    setGuardando(true);
    try {
      const nuevaTarea = await crearTarea(texto);
      setTareas((actuales) => [...actuales, nuevaTarea]);
      setTextoTarea("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear la tarea");
    } finally {
      setGuardando(false);
    }
  }

  async function alternarTarea(tarea: Tarea) {
    setError(null);
    setActualizandoId(tarea.id);
    try {
      const tareaActualizada = await alternarCompletadaEnApi(
        tarea.id,
        !tarea.completada,
      );
      setTareas((actuales) =>
        actuales.map((actual) =>
          actual.id === tarea.id ? tareaActualizada : actual,
        ),
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al actualizar la tarea",
      );
    } finally {
      setActualizandoId(null);
    }
  }

  async function borrarTarea(id: number) {
    setError(null);
    setEliminandoId(id);
    try {
      await eliminarTareaEnApi(id);
      setTareas((actuales) => actuales.filter((tarea) => tarea.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al eliminar la tarea");
    } finally {
      setEliminandoId(null);
    }
  }

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
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Añadir tarea"}
          </button>
        </form>
        {cargando && <p role="status">Cargando tareas...</p>}
        {error && <p role="alert">{error}</p>}
        {/* LISTA: Renderizado dinámico de las tareas */}
        <ul className="mt-6 space-y-2">
          {/* .map() recorre el arreglo 'tareas' y genera un <li> por cada tarea */}
          {!cargando && tareas.length === 0 && !error && (
            <li className="rounded-lg border border-white/[0.08] bg-[#0b192b] px-4 py-3 text-slate-400">
              No hay tareas todavía.
            </li>
          )}
          {tareas.map((tarea) => (
            <li
              // key es Obligatorio en React para que sepa exactamente qué elemento modificar en el DOM
              key={tarea.id}
              className="bg-[#0b192b] border border-white/[0.08] px-4 py-2 rounded-lg flex justify-between items-center"
            >
              {/* Mostramos el texto de la tarea con un estilo condicional (tachado si está completada) */}
              <span
                className={
                  tarea.completada ? "line-through text-slate-500" : ""
                }
              >
                {tarea.texto}
              </span>

              <div className="flex space-x-2">
                {/* Botón para cambiar el estado a completado/no completado */}
                <button
                  type="button"
                  className="bg-sky-500 text-slate-950 px-3 py-1 rounded-lg hover:bg-sky-600 transition-colors"
                  onClick={() => void alternarTarea(tarea)}
                  disabled={actualizandoId === tarea.id}
                >
                  {actualizandoId === tarea.id
                    ? "Guardando..."
                    : tarea.completada
                      ? "Desmarcar"
                      : "Marcar"}
                </button>

                {/* Botón para borrar la tarea de la lista */}
                <button
                  type="button"
                  className="bg-red-500 text-slate-950 px-3 py-1 rounded-lg hover:bg-red-600 transition-colors"
                  onClick={() => void borrarTarea(tarea.id)}
                  disabled={eliminandoId === tarea.id}
                >
                  {eliminandoId === tarea.id ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
