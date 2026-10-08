"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  crearPregunta,
  obtenerPreguntas,
  type Pregunta,
} from "@/lib/api/preguntas";
import Respuestas from "./respuestas";

export default function FaqPage() {
  const [pregunta, setPregunta] = useState("");
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargarPreguntas() {
      try {
        setPreguntas(await obtenerPreguntas());
      } catch (reason) {
        setError(
          reason instanceof Error
            ? reason.message
            : "No se pudieron cargar las preguntas.",
        );
      } finally {
        setCargando(false);
      }
    }

    void cargarPreguntas();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const texto = pregunta.trim();
    if (texto === "") return;

    setError("");
    setMensaje("");
    setEnviando(true);

    try {
      const preguntaCreada = await crearPregunta(texto);
      setPreguntas((actuales) => [...actuales, preguntaCreada]);
      setPregunta("");
      setMensaje("Pregunta guardada en el backend.");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "No se pudo guardar la pregunta.",
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#07111f] p-6 text-white antialiased lg:p-10">
      {/* Enlace de navegación de Next.js */}
      <Link href="/" className="text-sm text-slate-400 hover:text-white">
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
          required
          placeholder="Escribe una pregunta"
          className="w-full max-w-md rounded-lg border border-white/20 bg-[#0b192b] p-3 text-center text-white placeholder:text-slate-400"
        />

        <button
          className="mt-4 rounded-lg bg-sky-400 px-6 py-2 font-bold text-slate-950 transition-colors hover:bg-sky-300"
          type="submit"
          disabled={enviando}
        >
          {enviando ? "Guardando..." : "Añadir pregunta"}
        </button>
      </form>
      {error && (
        <p
          role="alert"
          className="mx-auto mt-4 max-w-md text-center text-sm text-red-300"
        >
          {error}
        </p>
      )}
      {mensaje && (
        <p
          role="status"
          className="mx-auto mt-4 max-w-md text-center text-sm text-emerald-300"
        >
          {mensaje}
        </p>
      )}
      {cargando ? (
        <p role="status" className="mt-8 text-center text-sm text-slate-400">
          Cargando preguntas...
        </p>
      ) : (
        <Respuestas preguntas={preguntas} />
      )}
    </main>
  );
}
