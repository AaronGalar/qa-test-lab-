// app/blog/page.tsx
"use client";

import { useState, useEffect } from "react";
import { obtenerPublicaciones, Publicacion } from "@/lib/api/blog";

export default function BlogPublicoPage() {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<string>("Todos");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    setPublicaciones(obtenerPublicaciones());
  }, []);

  const publicacionesFiltradas = publicaciones.filter((pub) => {
    const coincideTipo = filtroTipo === "Todos" || pub.tipo === filtroTipo;
    const coincideBusqueda =
      pub.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      pub.contenido.toLowerCase().includes(busqueda.toLowerCase());
    return coincideTipo && coincideBusqueda;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 text-xs text-slate-300">
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded border border-sky-500/20">
          CENTRO DE NOVEDADES
        </span>
        <h1 className="text-2xl font-bold text-white mt-1">Blog & Parches de la Plataforma</h1>
        <p className="text-slate-400">
          Consulta las últimas actualizaciones de la app y notas de versión publicadas por el equipo de administración.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
        <input
          type="text"
          placeholder="Buscar publicaciones..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full sm:w-80 rounded-xl border border-white/10 bg-[#07111f]/90 px-4 py-2 text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none shadow-lg"
        />

        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
          {["Todos", "Release Notes", "Artículo Blog", "Newsletter"].map((categoria) => (
            <button
              key={categoria}
              onClick={() => setFiltroTipo(categoria)}
              className={`rounded-lg px-3 py-1.5 font-medium transition-all whitespace-nowrap ${
                filtroTipo === categoria
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                  : "bg-[#07111f] text-slate-400 hover:text-white border border-white/5"
              }`}
            >
              {categoria}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {publicacionesFiltradas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-slate-500">
            No hay publicaciones registradas aún.
          </div>
        ) : (
          publicacionesFiltradas.map((pub) => {
            const esRelease = pub.tipo === "Release Notes";
            const esBlog = pub.tipo === "Artículo Blog";

            return (
              <article
                key={pub.id}
                className="group rounded-2xl border border-white/10 bg-gradient-to-b from-[#0b192b]/90 to-[#07111f]/90 p-6 shadow-xl space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2.5 py-0.5 text-[10px] font-bold border ${
                        esRelease
                          ? "bg-purple-500/10 text-purple-300 border-purple-500/20"
                          : esBlog
                          ? "bg-sky-500/10 text-sky-300 border-sky-500/20"
                          : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                      }`}
                    >
                      {pub.tipo}
                    </span>

                    {pub.version && (
                      <span className="font-mono text-[10px] text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/10">
                        {pub.version}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 font-mono text-slate-500">
                    <span>✍️ {pub.autor}</span>
                    <span>•</span>
                    <span>📅 {pub.fecha}</span>
                  </div>
                </div>

                <h2 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors">
                  {pub.titulo}
                </h2>

                <p className="text-slate-300 leading-relaxed font-sans">
                  {pub.contenido}
                </p>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}