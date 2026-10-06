"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Respuestas from "./respuestas";

export default function FaqPage() {
  // El estado conserva el texto del campo y las preguntas añadidas durante esta visita.
  const [pregunta, setPregunta] = useState("");
  const [listaPreguntas, setListaPreguntas] = useState<string[]>([]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const preguntaLimpia = pregunta.trim();
    if (!preguntaLimpia) return;

    // Actualización funcional para basarnos siempre en la versión más reciente del estado.
    setListaPreguntas((preguntasActuales) => [
      ...preguntasActuales,
      preguntaLimpia,
    ]);
    setPregunta("");
  };

  return (
    <main className="min-h-screen bg-[#07111f] p-6 text-white antialiased lg:p-10">
      {/* Enlace de navegación de Next.js */}
      <Link
        href="/"
        className="text-sm text-slate-400 hover:text-white"
      >
        ← Volver al dashboard
      </Link>

      <h1 className="mt-8  text-center text-3xl font-bold tracking-tight">
        Preguntas frecuentes
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col items-center">
        <label htmlFor="pregunta" className="sr-only">
          Escribe una pregunta
        </label>
        <input
          id="pregunta"
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          type="text"
          placeholder="Escribe una pregunta"
          className="w-full max-w-md rounded-lg border border-white/20 bg-[#0b192b] p-3 text-center text-white placeholder:text-slate-400"
        />

        <button
          className="mt-4 rounded-lg bg-sky-400 px-6 py-2 font-bold text-slate-950 transition-colors hover:bg-sky-300"
          type="submit"
        >
          Añadir pregunta
        </button>
      </form>
      {/* El componente hijo recibe datos mediante props y se encarga de mostrarlos. */}
      <Respuestas preguntas={listaPreguntas} />
    </main>
  );
}