// app/(dashboard)/layout.tsx
"use client";

import { usePathname } from "next/navigation";
import AppNavigation from "../components/AppNavigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const esPantallaPrincipal = pathname === "/";

  if (esPantallaPrincipal) {
    return (
      <div className="min-h-screen bg-[#07111f] text-white">
        {children}
      </div>
    );
  }

  return (
    // CONTENEDOR CLAVE: h-screen y overflow-hidden fuerzan a que ocupe exactamente toda la ventana
    <div className="flex h-screen w-full bg-[#07111f] overflow-hidden">
      <AppNavigation />
      {/* El contenido de la derecha tiene scroll propio */}
      <div className="flex-1 overflow-y-auto px-8 py-6">{children}</div>
    </div>
  );
}