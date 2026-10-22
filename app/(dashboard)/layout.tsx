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
    <div className="flex min-h-screen bg-[#07111f]">
      <AppNavigation />
      {/* Añadimos px-8 para separar el contenido hacia la derecha */}
      <div className="flex-1 overflow-y-auto px-8 py-6">{children}</div>
    </div>
  );
}