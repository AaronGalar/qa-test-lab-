// app/faq/page.tsx
"use client";

import { useState, useEffect } from "react";
import Respuestas from "./respuestas";
import { obtenerPreguntas, guardarNuevaPregunta, Pregunta } from "@/lib/api/preguntas";

export default function FAQPage() {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [nuevaPregunta, setNuevaPregunta] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [mensajeEnviado, setMensajeEnviado] = useState(false);

  useEffect(() => {
    obtenerPreguntas().then((data) => setPreguntas(data));
  }, []);

  const handleEnviarConsulta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaPregunta.trim()) return;

    try {
      await guardarNuevaPregunta(nuevaPregunta);
      const actualizadas = await obtenerPreguntas();
      setPreguntas(actualizadas);
      setNuevaPregunta("");
      
      setMensajeEnviado(true);
      setTimeout(() => setMensajeEnviado(false), 3000);
    } catch (error) {
      console.error("No se pudo enviar la consulta");
    }
  };

  const preguntasFiltradas = preguntas.filter((p: any) => {
    const textoPregunta = p.texto || p.pregunta || "";
    const coincideTexto = textoPregunta.toLowerCase().includes(busqueda.toLowerCase());

    if (!fechaFiltro) return coincideTexto;

    const rawFecha = p.fecha || p.createdAt || p.created_at;
    let fechaItem = "";

    if (rawFecha) {
      if (typeof rawFecha === "string" && rawFecha.includes("-")) {
        fechaItem = rawFecha.split("T")[0];
      } else {
        try {
          fechaItem = new Date(rawFecha).toISOString().split("T")[0];
        } catch (e) {
          fechaItem = "";
        }
      }
    }

    return coincideTexto && fechaItem === fechaFiltro;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 text-xs text-slate-300">
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded border border-sky-500/20">
          CENTRO DE CONSULTAS QA
        </span>
        <h1 className="text-2xl font-bold text-white mt-1">Preguntas Frecuentes y Soporte Senior</h1>
        <p className="text-slate-400">
          Realiza preguntas al equipo Senior o filtra el historial de dudas resueltas por fecha.
        </p>
      </div>

      <form onSubmit={handleEnviarConsulta} className="rounded-2xl border border-white/10 bg-[#07111f]/90 p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <span>💬</span> Realizar una nueva consulta
        </h2>

        <textarea
          rows={3}
          placeholder="Escribe aquí tu duda técnica sobre automatización, pruebas, casos de prueba..."
          value={nuevaPregunta}
          onChange={(e) => setNuevaPregunta(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-[#0b192b] p-4 text-xs text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none"
          required
        />

        {mensajeEnviado && (
          <p className="text-emerald-400 font-semibold text-xs">
            ✓ Pregunta guardada y enviada al servidor correctamente.
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-sky-500 px-5 py-2.5 font-bold text-white hover:bg-sky-400 transition-all shadow-lg shadow-sky-500/20"
          >
            Añadir pregunta →
          </button>
        </div>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">BUSCAR EN PREGUNTAS</label>
          <input
            type="text"
            placeholder="Filtrar por palabras clave..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-2.5 text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">FILTRAR POR FECHA</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={fechaFiltro}
              onChange={(e) => setFechaFiltro(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-2.5 text-white focus:border-sky-400 focus:outline-none"
            />
            {fechaFiltro && (
              <button
                type="button"
                onClick={() => setFechaFiltro("")}
                className="rounded-xl bg-white/5 px-3 py-2 text-slate-400 hover:text-white border border-white/10"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <Respuestas preguntas={preguntasFiltradas} />
    </div>
  );
}