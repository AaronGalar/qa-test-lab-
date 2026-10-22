"use client";

import { useEffect, useState } from "react";
import ExportReportButton from "@/app/components/ExportReportButton";
import { CasoPruebaExport } from "@/lib/api/exportUtils";
import { obtenerTestCases, TestCase } from "@/lib/api/test-cases";

export default function ResumenPage() {
  const [casos, setCasos] = useState<CasoPruebaExport[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const data: TestCase[] = await obtenerTestCases();
        
        const casosFormateados: CasoPruebaExport[] = data.map((c) => ({
          id: c.id,
          titulo: c.title,
          categoria: "Funcional",
          estado: c.status === "PASS" ? "Aprobado" : c.status === "FAIL" ? "Fallido" : "Pendiente",
          prioridad: c.priority === "High" ? "Alta" : c.priority === "Medium" ? "Media" : "Baja",
          fecha: new Date().toISOString().split("T")[0],
        }));

        setCasos(casosFormateados);
      } catch (error) {
        console.error("Error al cargar los casos de prueba:", error);
      } finally {
        setCargando(false);
      }
    }

    cargarDatos();
  }, []);

  const totales = casos.length;
  const aprobados = casos.filter((c) => c.estado === "Aprobado").length;
  const fallidos = casos.filter((c) => c.estado === "Fallido").length;
  const tasaExito = totales > 0 ? ((aprobados / totales) * 100).toFixed(1) : "0.0";

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-400">
        <p>Cargando informe de calidad...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado del Informe */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
            INFORME EJECUTIVO DE CALIDAD
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Resumen de Calidad QA</h1>
        </div>

        <ExportReportButton casos={casos} />
      </div>

      {/* Tarjetas de Métricas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/10 bg-[#07111f]/60 p-5 shadow-lg">
          <span className="text-xs text-slate-400 font-medium">Total de Casos</span>
          <div className="text-3xl font-bold text-white mt-2">{totales}</div>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-5 shadow-lg">
          <span className="text-xs text-emerald-400 font-medium">Aprobados (Pass)</span>
          <div className="text-3xl font-bold text-emerald-400 mt-2">{aprobados}</div>
        </div>

        <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.03] p-5 shadow-lg">
          <span className="text-xs text-rose-400 font-medium">Fallidos (Fail)</span>
          <div className="text-3xl font-bold text-rose-400 mt-2">{fallidos}</div>
        </div>

        <div className="rounded-xl border border-sky-500/20 bg-sky-500/[0.03] p-5 shadow-lg">
          <span className="text-xs text-sky-400 font-medium">Tasa de Éxito</span>
          <div className="text-3xl font-bold text-sky-300 mt-2">{tasaExito}%</div>
        </div>
      </div>

      {/* Tabla Ejecutiva de Resultados */}
      <div className="rounded-xl border border-white/10 bg-[#07111f]/80 overflow-hidden shadow-xl mt-8">
        <div className="p-4 border-b border-white/10 bg-white/[0.02]">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Detalle de Casos de Prueba Registrados
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          {casos.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No hay casos de prueba registrados todavía. ¡Crea uno nuevo para ver las métricas aquí!
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/[0.04] text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-white/10">
                <tr>
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Caso de Prueba</th>
                  <th className="p-3.5">Categoría</th>
                  <th className="p-3.5">Prioridad</th>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {casos.map((caso) => (
                  <tr key={caso.id} className="hover:bg-white/[0.02]">
                    <td className="p-3.5 font-mono text-slate-400">{caso.id}</td>
                    <td className="p-3.5 font-medium text-white">{caso.titulo}</td>
                    <td className="p-3.5 text-slate-400">{caso.categoria}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {caso.prioridad}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        caso.estado === "Aprobado"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : caso.estado === "Fallido"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                      }`}>
                        {caso.estado}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 font-mono">{caso.fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}