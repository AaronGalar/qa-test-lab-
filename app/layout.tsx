import "./globals.css";
import AppNavigation from "./components/AppNavigation";
import LogoutButton from "./components/LogoutButton";

export const metadata = {
  title: "QA Test Lab",
  description: "Tu espacio de pruebas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-[#040d1a] text-slate-100 antialiased">
        <div className="flex min-h-screen">
          {/* Menú lateral izquierdo (Único para toda la App) */}
          <AppNavigation activeHref="/" />

          <div className="flex flex-1 flex-col min-w-0">
            {/* Cabecera superior con Usuario y Cerrar Sesión */}
            <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/[0.08] bg-[#07111f]/90 px-8 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30">
                  ❖
                </div>
                <div>
                  <h1 className="text-sm font-bold text-white tracking-wide">QA Test Lab</h1>
                  <p className="text-[11px] text-slate-400">Tu espacio de pruebas</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-200">Aarón</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                    A
                  </div>
                </div>
                <LogoutButton />
              </div>
            </header>

            {/* Vistas individuales */}
            <main className="flex-1 p-8 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}