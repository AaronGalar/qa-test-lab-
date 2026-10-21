"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { obtenerPreguntasPendientes, type Pregunta } from "@/lib/api/preguntas";

export default function AdminPreguntasPage() {
  const [pendientes, setPendientes] = useState<Pregunta[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const datos = await obtenerPreguntasPendientes();
        setPendientes(datos);
      } catch (err) {
        console.error("Error al cargar pendientes", err);
      } finally {
        setCargando(false);
      }
    }
    void cargar();
  }, []);

  return (
    <main className="min-h-screen bg-[#07111f] p-10 text-white">
      <p>
        <Link href="/" className="text-sm text-slate-400 hover:text-white">
          ← Volver al dashboard
        </Link>
      </p>
      <h1 className="text-2xl font-bold mb-6">
        Preguntas Pendientes de Revisión
      </h1>

      {cargando ? (
        <p>Cargando...</p>
      ) : pendientes.length === 0 ? (
        <p className="text-slate-400">
          No hay preguntas pendientes por revisar.
        </p>
      ) : (
        <ul className="space-y-3 max-w-xl">
          {pendientes.map((item) => (
            <li
              key={item.id}
              className="p-4 bg-[#0b192b] border border-white/10 rounded-lg"
            >
              <p className="font-medium">{item.texto}</p>
              <span className="text-xs text-slate-400">ID: {item.id}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
