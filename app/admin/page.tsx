"use client";

import { useEffect, useState } from "react";
import AppNavigation from "../components/AppNavigation";

interface DashboardSenior {
  resumen_equipo: {
    total_casos: number;
    total_incidencias: number;
    pendientes_revision: number;
    criticas_abiertas: number;
  };
  desglose_pupilos: Array<{
    email: string;
    total_casos: number;
    pass: number;
    fail: number;
    pending: number;
  }>;
  casos_detallados: Array<{
    id: string;
    title: string;
    status: string;
    creado_por: string;
  }>;
  preguntas_pendientes: Array<{ id: number; texto: string }>;
  incidencias_criticas: Array<{ id: number; title: string; severity: string; status: string }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardSenior | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarDatosAdmin = () => {
    fetch("http://localhost:8000/api/admin/dashboard-senior", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("No tienes permisos de administrador o sesión caducada.");
        }
        return res.json();
      })
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    cargarDatosAdmin();
    window.addEventListener("focus", cargarDatosAdmin);
    return () => {
      window.removeEventListener("focus", cargarDatosAdmin);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#07111f] text-white antialiased">
      <header className="border-b border-white/[0.08] bg-[#0b192b]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500 text-lg shadow-[0_8px_24px_rgba(168,85,247,0.25)]">
              <span aria-hidden="true">🛡️</span>
            </div>
            <div>
              <h1 className="font-semibold tracking-tight">QA Lead Center</h1>
              <p className="text-xs text-slate-400">Panel de supervisión senior</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        <AppNavigation activeHref="/admin" />

        <section className="min-w-0 flex-1 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.10),transparent_34%)] p-6 lg:p-10">
          <div className="mb-8">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-purple-400">
              Control de equipo
            </p>
            <h2 className="text-3xl font-bold tracking-tight">Supervisión general</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Controla la actividad de tus pupilos, revisa incidencias críticas y aprueba el contenido pendiente.
            </p>
          </div>

          {loading ? (
            <p className="text-sm text-slate-400">Cargando panel de supervisión...</p>
          ) : error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              {error} (¿Estás logueado con una cuenta de Administrador?)
            </div>
          ) : data ? (
            <>
              {/* Tarjetas de Métricas */}
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-2xl border border-purple-500/20 bg-purple-500/[0.07] p-6 text-purple-300">
                  <p className="text-sm text-slate-300">Casos del equipo</p>
                  <p className="mt-4 text-3xl font-bold text-white">{data.resumen_equipo.total_casos}</p>
                </div>
                <div className="rounded-2xl border border-sky-500/20 bg-sky-500/[0.07] p-6 text-sky-300">
                  <p className="text-sm text-slate-300">Incidencias totales</p>
                  <p className="mt-4 text-3xl font-bold text-white">{data.resumen_equipo.total_incidencias}</p>
                </div>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] p-6 text-amber-300">
                  <p className="text-sm text-slate-300">Preguntas pendientes</p>
                  <p className="mt-4 text-3xl font-bold text-white">{data.resumen_equipo.pendientes_revision}</p>
                </div>
                <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.07] p-6 text-red-300">
                  <p className="text-sm text-slate-300">Críticas abiertas</p>
                  <p className="mt-4 text-3xl font-bold text-white">{data.resumen_equipo.criticas_abiertas}</p>
                </div>
              </div>

              {/* Nueva Tabla: Actividad agrupada por Pupilo */}
              <div className="mt-8 rounded-2xl border border-white/[0.08] bg-[#0b192b]/80 p-6 shadow-xl">
                <h3 className="font-semibold text-purple-300">Actividad del equipo por Pupilo</h3>
                <p className="mt-1 text-xs text-slate-500">Resumen de casos creados y estados por cada alumno</p>
                
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="border-b border-white/[0.08] text-xs uppercase text-slate-400">
                      <tr>
                        <th className="py-3 px-4">Pupilo (Email)</th>
                        <th className="py-3 px-4 text-center">Total Casos</th>
                        <th className="py-3 px-4 text-center text-emerald-400">Pass</th>
                        <th className="py-3 px-4 text-center text-red-400">Fail</th>
                        <th className="py-3 px-4 text-center text-amber-400">Pending</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!data.desglose_pupilos || data.desglose_pupilos.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-slate-500">
                            No hay actividad de pupilos registrada todavía.
                          </td>
                        </tr>
                      ) : (
                        data.desglose_pupilos.map((pupilo, idx) => (
                          <tr key={idx} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                            <td className="py-3 px-4 font-medium text-white">{pupilo.email}</td>
                            <td className="py-3 px-4 text-center font-bold">{pupilo.total_casos}</td>
                            <td className="py-3 px-4 text-center text-emerald-300">{pupilo.pass}</td>
                            <td className="py-3 px-4 text-center text-red-300">{pupilo.fail}</td>
                            <td className="py-3 px-4 text-center text-amber-300">{pupilo.pending}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Nueva Tabla: Casos detallados con su autor */}
              <div className="mt-8 rounded-2xl border border-white/[0.08] bg-[#0b192b]/80 p-6 shadow-xl">
                <h3 className="font-semibold text-purple-300">Casos de prueba detallados</h3>
                <p className="mt-1 text-xs text-slate-500">Listado de casos con indicación del pupilo que los creó</p>
                
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="border-b border-white/[0.08] text-xs uppercase text-slate-400">
                      <tr>
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3 px-4">Título</th>
                        <th className="py-3 px-4">Estado</th>
                        <th className="py-3 px-4 text-purple-400">Creado por</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!data.casos_detallados || data.casos_detallados.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-slate-500">
                            No hay casos de prueba registrados.
                          </td>
                        </tr>
                      ) : (
                        data.casos_detallados.map((c, idx) => (
                          <tr key={idx} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                            <td className="py-3 px-4 font-mono text-xs text-slate-400">{c.id}</td>
                            <td className="py-3 px-4 font-medium text-white">{c.title}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                c.status === 'PASS' ? 'bg-emerald-500/20 text-emerald-300' :
                                c.status === 'FAIL' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                              }`}>
                                {c.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-purple-300 font-medium">{c.creado_por}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Secciones de Alertas / Tareas del Senior */}
              <div className="mt-8 grid gap-8 lg:grid-cols-2">
                {/* Preguntas pendientes */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#0b192b]/80 p-6 shadow-xl">
                  <h3 className="font-semibold text-purple-300">Preguntas de pupilos por revisar</h3>
                  <p className="mt-1 text-xs text-slate-500">Dudas enviadas que esperan validación</p>
                  
                  <div className="mt-4 space-y-3">
                    {data.preguntas_pendientes.length === 0 ? (
                      <p className="text-sm text-slate-400">No hay preguntas pendientes de revisión.</p>
                    ) : (
                      data.preguntas_pendientes.map((p) => (
                        <div key={p.id} className="flex items-center justify-between rounded-xl bg-white/[0.02] p-3 border border-white/[0.04]">
                          <span className="text-sm text-slate-300">{p.texto}</span>
                          <span className="rounded bg-amber-500/10 px-2 py-1 text-xs text-amber-400">Pendiente</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Incidencias críticas */}
                <div className="rounded-2xl border border-white/[0.08] bg-[#0b192b]/80 p-6 shadow-xl">
                  <h3 className="font-semibold text-red-400">Incidencias críticas del equipo</h3>
                  <p className="mt-1 text-xs text-slate-500">Bugs marcados como High que requieren atención</p>
                  
                  <div className="mt-4 space-y-3">
                    {data.incidencias_criticas.length === 0 ? (
                      <p className="text-sm text-slate-400">¡Excelente! No hay incidencias críticas abiertas.</p>
                    ) : (
                      data.incidencias_criticas.map((i) => (
                        <div key={i.id} className="flex items-center justify-between rounded-xl bg-white/[0.02] p-3 border border-white/[0.04]">
                          <div>
                            <p className="text-sm font-medium text-white">{i.title}</p>
                            <span className="text-[10px] text-red-400 uppercase font-bold">{i.severity}</span>
                          </div>
                          <span className="rounded bg-red-500/10 px-2 py-1 text-xs text-red-300">{i.status}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
}