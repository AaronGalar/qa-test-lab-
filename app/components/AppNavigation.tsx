import Link from "next/link";

// Mantener los destinos en un solo lugar evita que cada página tenga su menú distinto.
const navigationItems = [
  { href: "/", number: "01", label: "Resumen" },
  { href: "/test-cases", number: "02", label: "Casos de prueba" },
  { href: "/test-cases/ai-demo", number: "03", label: "Asistente IA" },
  { href: "/tareas", number: "04", label: "Lista de tareas" },
  { href: "/faq", number: "05", label: "Preguntas frecuentes" },
] as const;

type AppNavigationProps = {
  activeHref: (typeof navigationItems)[number]["href"];
};

// Componente compartido: la ruta activa solo cambia su estilo y accesibilidad.
export default function AppNavigation({ activeHref }: AppNavigationProps) {
  return (
    <aside className="hidden min-h-[calc(100vh-73px)] w-64 shrink-0 border-r border-white/[0.07] bg-[#091627]/55 p-5 md:block">
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
                className={`mr-3 ${isActive ? "text-sky-300" : "text-slate-600"}`}
              >
                {item.number}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
