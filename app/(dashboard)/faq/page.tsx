// app/faq/page.tsx
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

  const [busqueda, setBusqueda] = useState("");
  const [fechaFiltro, setFechaFiltro] = useState("");

  const cargarPreguntas = async () => {
    try {
      const data = await obtenerPreguntas();
      if (data && data.length > 0) {
        setPreguntas(data);
      }
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "No se pudieron cargar las preguntas."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
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
      await crearPregunta(texto);

      // Actualización optimista local para que aparezca al instante
      const fechaHoy = new Date().toISOString().split("T")[0];
      const nuevaPreguntaLocal: any = {
        id: Date.now(),
        texto: texto,
        estado: "Pendiente",
        respuesta: "",
        respondido_por: "",
        fecha: fechaHoy,
      };

      setPreguntas((prev) => [nuevaPreguntaLocal, ...prev]);
      setPregunta("");
      setMensaje("Pregunta guardada y enviada al QA Senior.");

      // Intentamos sincronizar con la API de fondo
      await cargarPreguntas();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "No se pudo guardar la pregunta."
      );
    } finally {
      setEnviando(false);
    }
  };

  // Filtrado optimizado y tolerante a formatos de fecha
  const preguntasFiltradas = preguntas.filter((p: any) => {
    const textoPregunta = p.texto || p.pregunta || p.title || "";
    const coincideTexto = textoPregunta
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    if (!fechaFiltro) return coincideTexto;

    const rawFecha = p.fecha || p.createdAt || p.created_at || p.fecha_creacion || p.date;
    const fechaItem = rawFecha ? rawFecha.split("T")[0] : new Date().toISOString().split("T")[0];

    return coincideTexto && fechaItem === fechaFiltro;
  });

  return (
    <main className="max-w-3xl mx-auto space-y-6 py-2">
      
      {/* Botón Volver y Encabezado */}
      <div className="space-y-3 border-b border-white/10 pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-400 transition-colors"
        >
          <span>←</span>
          <span>Volver al dashboard</span>
        </Link>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
            CENTRO DE CONSULTAS QA
          </span>
          <h1 className="text-2xl font-bold text-white mt-0.5">
            Preguntas Frecuentes y Soporte Senior
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Realiza preguntas al equipo Senior o filtra el historial de dudas resueltas.
          </p>
        </div>
      </div>

      {/* Tarjeta para Crear Nueva Pregunta */}
      <section className="rounded-2xl border border-sky-500/30 bg-gradient-to-b from-sky-500/[0.08] to-white/[0.02] p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-2 text-white font-semibold text-sm">
          <span>💬</span>
          <h2>Realizar una nueva consulta</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            id="pregunta"
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            required
            rows={3}
            placeholder="Escribe aquí tu duda técnica sobre automatización, pruebas, casos de prueba..."
            className="w-full rounded-xl border border-white/15 bg-[#050b14] p-3.5 text-sm text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none"
          />

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              {error && <p className="text-xs text-rose-400 font-medium">⚠️ {error}</p>}
              {mensaje && <p className="text-xs text-emerald-400 font-medium">✓ {mensaje}</p>}
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="rounded-xl bg-sky-400 px-6 py-2.5 text-xs font-bold text-slate-950 transition-all hover:bg-sky-300 disabled:opacity-50 shadow-md flex items-center gap-2"
            >
              <span>{enviando ? "Enviando..." : "Añadir pregunta"}</span>
              <span>→</span>
            </button>
          </div>
        </form>
      </section>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
        <div className="sm:col-span-2 relative">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Buscar en preguntas
          </label>
          <input
            type="text"
            placeholder="Filtrar por palabras clave..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#07111f]/90 px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none shadow-lg"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Filtrar por fecha
          </label>
          <div className="flex gap-1.5">
            <input
              type="date"
              value={fechaFiltro}
              onChange={(e) => setFechaFiltro(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#07111f]/90 px-3 py-3 text-xs text-white focus:border-sky-400 focus:outline-none shadow-lg [color-scheme:dark]"
            />
            {fechaFiltro && (
              <button
                type="button"
                onClick={() => setFechaFiltro("")}
                className="rounded-xl bg-slate-800 px-3 text-xs text-slate-300 hover:bg-slate-700"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* LISTA DE RESPUESTAS */}
      {cargando ? (
        <div className="p-12 text-center text-xs text-slate-400">
          Cargando preguntas y respuestas...
        </div>
      ) : (
        <Respuestas preguntas={preguntasFiltradas} />
      )}

    </main>
  );
}