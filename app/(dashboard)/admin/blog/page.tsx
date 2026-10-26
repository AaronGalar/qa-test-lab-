// app/admin/blog/page.tsx
"use client";

import { useState, useEffect } from "react";
import { obtenerPublicaciones, guardarPublicacion, Publicacion } from "@/lib/api/blog";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Publicacion[]>([]);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [tipo, setTipo] = useState<"Release Notes" | "Artículo Blog" | "Newsletter">("Release Notes");
  const [version, setVersion] = useState("");
  const [mensajeExito, setMensajeExito] = useState(false);

  useEffect(() => {
    setPosts(obtenerPublicaciones());
  }, []);

  const handleCrearPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !contenido.trim()) return;

    const actualizados = guardarPublicacion({
      titulo,
      contenido,
      tipo,
      version: version.trim() || undefined,
      fecha: new Date().toISOString().split("T")[0],
      autor: "Admin QA",
    });

    setPosts(actualizados);
    setTitulo("");
    setContenido("");
    setVersion("");
    setMensajeExito(true);
    setTimeout(() => setMensajeExito(false), 3000);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 text-xs text-slate-300">
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded border border-purple-500/20">
          ZONA RESTRINGIDA - ADMIN
        </span>
        <h1 className="text-2xl font-bold text-white mt-2">Gestor y Publicador de Blog & Novedades</h1>
        <p className="text-slate-400">
          Crea notas de versión o artículos que se sincronizarán directamente con el feed público de la plataforma.
        </p>
      </div>

      {mensajeExito && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-300">
          ✓ Publicación guardada en el backend y publicada con éxito.
        </div>
      )}

      {/* Formulario de Publicación */}
      <form onSubmit={handleCrearPost} className="rounded-2xl border border-white/10 bg-[#07111f]/90 p-6 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white">Redactar Nueva Entrada</h2>

        <div className="space-y-1">
          <label className="text-slate-400">Título del Comunicado *</label>
          <input
            type="text"
            placeholder="Ej: Actualización del módulo de casos de prueba..."
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0b192b] px-4 py-2.5 text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-slate-400">Tipo de Publicación</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as any)}
              className="w-full rounded-xl border border-white/10 bg-[#0b192b] px-4 py-2.5 text-white focus:border-purple-400 focus:outline-none"
            >
              <option value="Release Notes">Release Notes (Notas de Versión)</option>
              <option value="Artículo Blog">Artículo de Blog</option>
              <option value="Newsletter">Newsletter / Comunicado</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400">Versión (Opcional)</label>
            <input
              type="text"
              placeholder="Ej: v1.3.0"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0b192b] px-4 py-2.5 text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-slate-400">Contenido del Artículo o Parche *</label>
          <textarea
            rows={5}
            placeholder="Escribe los detalles..."
            value={contenido}
            onChange={(e) => setContenido(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0b192b] px-4 py-2.5 text-white placeholder-slate-500 focus:border-purple-400 focus:outline-none"
            required
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="rounded-xl bg-purple-500 px-5 py-2.5 font-bold text-white hover:bg-purple-400 transition-all shadow-lg shadow-purple-500/20"
          >
            🚀 Publicar en el Blog
          </button>
        </div>
      </form>

      {/* Historial en Admin */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white">Publicaciones Registradas ({posts.length})</h3>
        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="rounded-xl border border-white/10 bg-[#0b192b]/70 p-4 space-y-1">
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span className="text-purple-300 font-bold">{p.tipo} {p.version && `(${p.version})`}</span>
                <span>{p.fecha}</span>
              </div>
              <h4 className="font-bold text-white">{p.titulo}</h4>
              <p className="text-slate-400">{p.contenido}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}