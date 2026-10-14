"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

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
  activeHref: (typeof navigationItems)[number]["href"];
};

// Componente compartido: la ruta activa solo cambia su estilo y accesibilidad.
export default function AppNavigation({ activeHref }: AppNavigationProps) {
  const router = useRouter();

  const handleSignOut = () => {
    // 1. Limpiamos las credenciales almacenadas
    localStorage.removeItem("token");
    localStorage.removeItem("es_admin");

    // 2. Redirigimos al usuario a la página de login
    router.push("/login");
  };

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
      </nav>

      {/* Botón de Cerrar Sesión situado abajo del todo */}
      <div className="pt-4 border-t border-white/[0.07] mt-auto">
        <button
          onClick={handleSignOut}
          className="w-full rounded-xl   border border-red-500/20 bg-red-500/10 px-10 py-2 text-left text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
        >
          <span className="mr-3 text-red-400"></span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}