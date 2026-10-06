"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Es una validación local de demostración, no un sistema de autenticación real.
  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Debes completar todos los campos");
      return;
    }

    if (email.trim().toLowerCase() === "qa@test.com" && password === "123456") {
      setIsSubmitting(true);
      await new Promise((resolve) => setTimeout(resolve, 450));
      router.push("/");
      return;
    }

    setError("Credenciales incorrectas");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07111f] px-4 text-white antialiased">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-400 text-2xl text-sky-950 shadow-[0_12px_36px_rgba(56,189,248,0.25)]">
            <span aria-hidden="true">✦</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight">QA Test Lab</h1>

          <p className="mt-2 text-sm text-slate-400">
            Entra en tu espacio de calidad
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.09] bg-[#0b192b]/90 p-7 shadow-2xl shadow-black/20">
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email
              </label>

              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="qa@test.com"
                className="w-full rounded-xl border border-white/[0.10] bg-[#07111f] px-4 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                Contraseña
              </label>

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/[0.10] bg-[#07111f] px-4 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-sky-400 px-4 py-3 text-sm font-bold text-sky-950 hover:bg-sky-300 disabled:cursor-wait disabled:opacity-70"
            >
              {isSubmitting ? "Comprobando acceso..." : "Iniciar sesión"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Demo environment · QA Test Lab
        </p>
      </div>
    </main>
  );
}
