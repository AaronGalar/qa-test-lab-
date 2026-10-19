"use client";

import { useState as useReactState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegistroPage() {
  const [email, setEmail] = useReactState("");
  const [password, setPassword] = useReactState("");
  const [error, setError] = useReactState("");
  const [success, setSuccess] = useReactState("");
  const router = useRouter();

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("http://localhost:8000/api/auth/registro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Error al registrarse");
      }

      setSuccess("¡Usuario creado con éxito! Redirigiendo al login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white p-4">
      <div className="w-full max-w-md rounded-xl bg-gray-800 p-8 shadow-lg border border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-center">Crear una cuenta</h1>

        {error && (
          <div className="mb-4 rounded bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400">
            {success}
          </div>
        )}

        <form onSubmit={handleRegistro} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg bg-gray-900 border border-gray-700 p-3 text-white focus:border-blue-500 focus:outline-none"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg bg-gray-900 border border-gray-700 p-3 text-white focus:border-blue-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-500"
          >
            Registrarse
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="text-blue-400 hover:underline">
            Ingresa aquí
          </Link>
        </p>
      </div>
    </div>
  );
}