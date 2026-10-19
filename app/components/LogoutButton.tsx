"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("es_admin");
    router.push("/login");
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.05] px-3.5 py-2 text-xs font-medium text-red-400 transition-all duration-200 hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-300"
    >
      <span>🚪</span>
      <span>Cerrar sesión</span>
    </button>
  );
}