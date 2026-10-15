"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Mantener los destinos en un solo lugar evita que cada página tenga su menú distinto.
const navigationItems = [
  { href: "/", number: "01", label: "Resumen" },
  { href: "/test-cases", number: "02", label: "Casos de prueba" },
  {
    href: "/test-cases/generador",
    number: "03",
    label: "Generador de escenarios",
  },
  { href: "/tareas", number: "04", label: "Lista de tareas" },
  { href: "/faq", number: "05", label: "Preguntas frecuentes" },
  { href: "/proyectos", number: "06", label: "Proyectos" },
] as const;

type AppNavigationProps = {
  activeHref: (typeof navigationItems)[number]["href"] | "/admin";
};

// Componente compartido: la ruta activa solo cambia su estilo y accesibilidad.
export default function AppNavigation({ activeHref }: AppNavigationProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [esAdmin, setEsAdmin] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Comprobamos si el usuario actual es administrador en el localStorage
    const adminValue = localStorage.getItem("es_admin");
    if (adminValue === "true") {
      setEsAdmin(true);
    }
  }, []);

  const handleSignOut = () => {
    // 1. Limpiamos las credenciales almacenadas
    localStorage.removeItem("token");
    localStorage.removeItem("es_admin");

    // 2. Redirigimos al usuario a la página de login
    router.push("/login");
  };

  const isAdminActive = activeHref === "/admin";

  return (
    <aside className="hidden min-h-[calc(100vh-73px)] w-64 shrink-0 flex-col justify-between border-r border-white/[0.07] bg-[#091627]/55 p-5 md:flex">
      <nav aria-label="Navegación principal" className="space-y-2">
        {navigationItems.map((item) => {
          const isActive = item.href === activeHref;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "block w-full rounded-xl border border-sky-300/20 bg-sky-400/15 px-4 py-3 text-left text-sm font-semibold text-sky-100 shadow-[inset_3px_0_0_#38bdf8]"
                  : "block w-full rounded-xl px-4 py-3 text-left text-sm text-slate-400 hover:bg-white/[0.06] hover:text-slate-100"
              }
            >
              <span
                className={`mr-3 ${
                  isActive ? "text-sky-300" : "text-slate-600"
                }`}
              >
                {item.number}
              </span>
              {item.label}
            </Link>
          );
        })}

        {/* BOTÓN DE ADMIN CONDICIONAL E INVISIBLE PARA NO ADMINS */}
        {isClient && esAdmin && (
          <div className="pt-2">
            <Link
              href="/admin"
              aria-current={isAdminActive ? "page" : undefined}
              className={
                isAdminActive
                  ? "block w-full rounded-xl border border-purple-300/20 bg-purple-400/15 px-4 py-3 text-left text-sm font-semibold text-purple-100 shadow-[inset_3px_0_0_#c084fc]"
                  : "block w-full rounded-xl px-4 py-3 text-left text-sm text-purple-300 hover:bg-purple-500/10 hover:text-purple-200"
              }
            >
              <span className={`mr-3 ${isAdminActive ? "text-purple-300" : "text-purple-500"}`}>
                🛡️
              </span>
              Panel Admin
            </Link>
          </div>
        )}
      </nav>

      {/* Botón de Cerrar Sesión situado abajo del todo */}
      <div className="pt-4 border-t border-white/[0.07] mt-auto">
        <button
          onClick={handleSignOut}
          className="w-full rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
        >
          <span className="mr-3 text-red-400"></span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}