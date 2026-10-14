// app/login/page.tsx
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUsuario } from "@/lib/api/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const data = await loginUsuario(email, password);
      
      // Redirigir según el rol del usuario
      if (data.es_admin) {
        router.push("/");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#07111f] flex flex-col items-center justify-center p-6 text-white antialiased">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#0b192b] p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-center tracking-tight mb-6">
          Iniciar Sesión
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
              className="w-full rounded-lg border border-white/20 bg-[#07111f] p-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-white/20 bg-[#07111f] p-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          {error && (
            <p role="alert" className="text-center text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-lg bg-sky-400 py-3 font-bold text-slate-950 transition-colors hover:bg-sky-300 disabled:opacity-50"
          >
            {cargando ? "Iniciando sesión..." : "Ingresar"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
        </div>
      </div>
    </main>
  );
}