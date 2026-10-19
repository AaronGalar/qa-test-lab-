"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const navigationItems = [
  { href: "/", number: "01", label: "Resumen", icon: "📊" },
  { href: "/test-cases", number: "02", label: "Casos de prueba", icon: "🧪" },
  {
    href: "/test-cases/generador",
    number: "03",
    label: "Generador de escenarios",
    icon: "✨",
  },
  { href: "/tareas", number: "04", label: "Lista de tareas", icon: "📋" },
  { href: "/faq", number: "05", label: "Preguntas frecuentes", icon: "💬" },
  { href: "/proyectos", number: "06", label: "Proyectos", icon: "📁" },
  { href: "/fuentes", number: "07", label: "Fuentes y Tutoriales", icon: "📚" }
] as const;

type AppNavigationProps = {
  activeHref: (typeof navigationItems)[number]["href"] | "/admin";
};

export default function AppNavigation({ activeHref }: AppNavigationProps) {
  const [isClient, setIsClient] = useState(false);
  const [esAdmin, setEsAdmin] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const adminValue = localStorage.getItem("es_admin");
    if (adminValue === "true") {
      setEsAdmin(true);
    }
  }, []);

  const isAdminActive = activeHref === "/admin";

  return (
    <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col border-r border-white/[0.08] bg-[#07111f]/95 p-5 backdrop-blur-xl">
      <div className="flex-1">
        <span className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 block mb-3 mt-2">
          Menú de Navegación
        </span>

        <nav aria-label="Navegación principal" className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = item.href === activeHref;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`group relative flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-sky-500/20 to-sky-500/5 text-sky-200 shadow-[0_4px_20px_rgba(56,189,248,0.15)] border border-sky-500/30"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs transition-colors ${
                      isActive
                        ? "bg-sky-500/20 text-sky-300 font-bold"
                        : "bg-white/[0.03] text-slate-500 group-hover:text-slate-300 group-hover:bg-white/[0.06]"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="tracking-wide">{item.label}</span>
                </div>

                <span
                  className={`text-[10px] font-mono transition-opacity ${
                    isActive ? "text-sky-400 opacity-100" : "text-slate-600 opacity-60 group-hover:opacity-100"
                  }`}
                >
                  {item.number}
                </span>

                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-sky-400 shadow-[0_0_10px_#38bdf8]" />
                )}
              </Link>
            );
          })}

          {/* BOTÓN DE ADMIN CONDICIONAL */}
          {isClient && esAdmin && (
            <div className="pt-3 mt-3 border-t border-white/[0.06]">
              <span className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400/80 block mb-2">
                Zona Restringida
              </span>
              <Link
                href="/admin"
                aria-current={isAdminActive ? "page" : undefined}
                className={`group relative flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isAdminActive
                    ? "bg-gradient-to-r from-purple-500/20 to-purple-500/5 text-purple-200 shadow-[0_4px_20px_rgba(168,85,247,0.15)] border border-purple-500/30"
                    : "text-purple-300/80 hover:bg-purple-500/10 hover:text-purple-200 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs transition-colors ${
                      isAdminActive
                        ? "bg-purple-500/20 text-purple-300 font-bold"
                        : "bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20"
                    }`}
                  >
                    🛡️
                  </span>
                  <span className="tracking-wide">Panel Admin</span>
                </div>

                {isAdminActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-purple-400 shadow-[0_0_10px_#c084fc]" />
                )}
              </Link>
            </div>
          )}
        </nav>
      </div>
    </aside>
  );
}