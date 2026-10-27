// app/(dashboard)/admin/preguntas/page.tsx
"use client";
import { useEffect, useState } from "react";
import { obtenerPreguntas, type Pregunta } from "@/lib/api/preguntas";

export default function AdminPreguntasPage() {
  const [pendientes, setPendientes] = useState<Pregunta[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const datos = await obtenerPreguntas();
        const noRespondidas = datos.filter(
          (p) => p.estado?.toLowerCase() !== "respondida"
        );
        setPendientes(noRespondidas);
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
              className="p-4 bg-[#0b192b] border border-white/10 rounded-lg space-y-2"
            >
             <p className="font-medium text-sm">{item.texto}</p>
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>ID: {item.id}</span>
                <span className="text-amber-400 font-semibold">
                  {item.estado || "Pendiente"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}