// app/(dashboard)/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { obtenerProyectos, type Proyecto } from "@/lib/api/proyectos";
import LogoutButton from "@/app/components/LogoutButton";

export default function PantallaPrincipalPage() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [cargando, setCargando] = useState(true);

  // 👈 Poniendo esAdmin en false ya no te saldrá el cartel ni el botón de Admin
  const [esAdmin, setEsAdmin] = useState<boolean>(false); 

  useEffect(() => {
    async function cargar() {
      try {
        const data = await obtenerProyectos();
        setProyectos(data);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    }
    void cargar();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050b14] via-[#07111f] to-[#0a192f] p-8 text-white flex flex-col justify-between antialiased lg:p-12">
      
      {/* Cabecera limpia sin modo Admin */}
      {/* Cabecera */}
<div className="flex items-center justify-between">
  <div className="flex items-center gap-3">
    <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
      Pantalla Principal
    </span>
    
  </div>

  <div className="flex items-center gap-4">
    {/* Panel Admin solo para administradores */}
    {esAdmin && (
      <Link
        href="/admin"
        className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 px-3.5 py-1.5 rounded-lg border border-purple-500/30 flex items-center gap-1.5 shadow-sm"
      >
        <span>🛡️</span>
        <span>Panel Admin</span>
      </Link>
    )}

    {/* Nombre de usuario */}
    <div className="flex items-center gap-2 bg-white/[0.05] border border-white/10 px-3 py-1.5 rounded-full">
      <span className="h-2 w-2 rounded-full bg-emerald-400" />
      <span className="text-xs font-medium text-slate-300">
        Aarón {esAdmin && <span className="text-[10px] text-purple-400 font-mono">(Admin)</span>}
      </span>
    </div>

    {/* Botón de cerrar sesión recuperado */}
    <LogoutButton />
  </div>
</div>

      {/* Título */}
      <div className="my-8">
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
          QAlidad
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Selecciona un espacio de trabajo o consulta las guías del sistema.
        </p>
      </div>

      {/* Las 3 Tarjetas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-auto">
        
        {/* Tarjeta 1: Fuentes */}
        <Link
          href="/fuentes"
          className="group relative rounded-2xl border border-white/15 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-8 shadow-2xl hover:border-sky-400/50 flex flex-col justify-between min-h-[280px]"
        >
          <div>
            <span className="text-3xl">📚</span>
            <h2 className="text-xl font-bold text-white mt-4 group-hover:text-sky-300">
              Fuentes, cómo hacer informe
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              Documentación oficial y guías prácticas para QA.
            </p>
          </div>
          <div className="mt-6 text-xs font-semibold text-sky-400">
            Consultar guías →
          </div>
        </Link>

        {/* Tarjeta 2: Proyectos */}
        <div className="group relative rounded-2xl border border-sky-500/30 bg-gradient-to-b from-sky-500/[0.08] to-white/[0.02] p-8 shadow-2xl flex flex-col justify-between min-h-[280px]">
          <div>
            <span className="text-3xl">🚀</span>
            <h2 className="text-xl font-bold text-white mt-4">Tus Proyectos de QA</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {cargando ? (
                <span className="text-xs text-slate-400">Cargando...</span>
              ) : proyectos.length === 0 ? (
                <span className="text-xs text-slate-400">No hay proyectos todavía</span>
              ) : (
                proyectos.slice(0, 3).map((p) => (
                  <Link
                    key={p.id}
                    href={`/proyectos/${p.id}/resumen`}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:bg-sky-500/30"
                  >
                    {(p as any).nombre || (p as any).name || "Proyecto"}
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Link href="/proyectos" className="text-xs font-semibold text-sky-400 hover:underline">
              Ver todos →
            </Link>
          </div>
        </div>

        {/* Tarjeta 3: Pregunta al Senior */}
        <Link
          href="/faq"
          className="group relative rounded-2xl border border-white/15 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-8 shadow-2xl hover:border-sky-400/50 flex flex-col justify-between min-h-[280px]"
        >
          <div>
            <span className="text-3xl">💡</span>
            <h2 className="text-xl font-bold text-white mt-4 group-hover:text-sky-300">
              Pregunta al senior
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              Resuelve dudas técnicas sobre automatización y calidad.
            </p>
          </div>
          <div className="mt-6 text-xs font-semibold text-sky-400">
            Abrir consultas →
          </div>
        </Link>

      </div>

      <div className="text-center text-xs text-slate-500 mt-8">
        Made by Aaron Galar
      </div>
    </main>
  );
}