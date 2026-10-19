"use client";

import { useState } from "react";

type Fuente = {
  titulo: string;
  categoria: "Documentación" | "Herramientas QA" | "Estándares & Guías" | "Comunidad";
  descripcion: string;
  url: string;
  badge: string;
};

const fuentesData: Fuente[] = [
  {
    titulo: "ISTQB® Glossary & Syllabi",
    categoria: "Estándares & Guías",
    descripcion: "Glosario oficial de términos y estándares internacionales de pruebas de software.",
    url: "https://www.istqb.org/",
    badge: "Estándar QA",
  },
  {
    titulo: "Playwright Docs",
    categoria: "Documentación",
    descripcion: "Documentación oficial para automatización de pruebas E2E en web.",
    url: "https://playwright.dev/",
    badge: "Automatización",
  },
  {
    titulo: "OWASP Top 10",
    categoria: "Estándares & Guías",
    descripcion: "Referencia fundamental sobre los diez riesgos de seguridad más críticos en aplicaciones web.",
    url: "https://owasp.org/www-project-top-ten/",
    badge: "Seguridad",
  },
];

export default function FuentesPage() {
  const [tabActiva, setTabActiva] = useState<"recursos" | "informe" | "excel">("recursos");
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSel, setCategoriaSel] = useState<string>("Todas");

  const categorias = ["Todas", "Documentación", "Estándares & Guías"];

  const fuentesFiltradas = fuentesData.filter((f) => {
    const coincideBusqueda =
      f.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      f.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCat = categoriaSel === "Todas" || f.categoria === categoriaSel;
    return coincideBusqueda && coincideCat;
  });

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
          Centro de Conocimiento
        </span>
        <h1 className="text-2xl font-bold text-white mt-1">Fuentes y Tutoriales QA</h1>
        <p className="text-sm text-slate-400 mt-1">
          Librería de referencias y guías prácticas paso a paso para la gestión de calidad.
        </p>
      </div>

      {/* Pestañas de Navegación */}
      <div className="flex border-b border-white/10 gap-6">
        <button
          onClick={() => setTabActiva("recursos")}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tabActiva === "recursos"
              ? "border-sky-400 text-sky-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          📚 Enlaces y Fuentes
        </button>
        <button
          onClick={() => setTabActiva("informe")}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tabActiva === "informe"
              ? "border-sky-400 text-sky-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          📝 Cómo hacer un Informe de QA
        </button>
        <button
          onClick={() => setTabActiva("excel")}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tabActiva === "excel"
              ? "border-sky-400 text-sky-300"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          📊 Estructurar un Excel de QA
        </button>
      </div>

      {/* CONTENIDO DE RECURSOS */}
      {tabActiva === "recursos" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <input
              type="text"
              placeholder="Buscar fuente..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full sm:w-72 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-sky-500/50 focus:outline-none"
            />
            <div className="flex gap-2">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoriaSel(cat)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    categoriaSel === cat
                      ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                      : "bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fuentesFiltradas.map((fuente, idx) => (
              <a
                key={idx}
                href={fuente.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between rounded-xl border border-white/10 bg-[#07111f]/60 p-5 hover:border-sky-500/30 hover:bg-white/[0.04]"
              >
                <div>
                  <span className="rounded-md bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-400 border border-sky-500/20">
                    {fuente.badge}
                  </span>
                  <h2 className="text-base font-semibold text-white mt-3 group-hover:text-sky-300">
                    {fuente.titulo}
                  </h2>
                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">{fuente.descripcion}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.06] text-xs text-sky-400">
                  Consultar fuente ↗
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* CONTENIDO: TUTORIAL INFORME DE QA */}
      {tabActiva === "informe" && (
        <div className="rounded-2xl border border-white/10 bg-[#07111f]/60 p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white">Guía para redactar un Informe de QA Profesional</h2>
            <p className="text-sm text-slate-400 mt-1">
              Un buen informe de pruebas debe ser claro, directo y ofrecer visibilidad ejecutiva sobre el estado del software.
            </p>
          </div>

          <div className="space-y-4 text-sm text-slate-300">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <h3 className="font-semibold text-sky-300 mb-1">1. Resumen Ejecutivo</h3>
              <p className="text-slate-400 text-xs">
                Breve descripción general del ciclo de pruebas ejecutado (versión evaluada, fechas y si el sistema está listo o no para producción).
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <h3 className="font-semibold text-sky-300 mb-1">2. Métricas Clave de Pruebas</h3>
              <p className="text-slate-400 text-xs">
                Casos totales ejecutados, porcentaje de casos superados (PASS), fallidos (FAIL) y bloqueados (BLOCKED).
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <h3 className="font-semibold text-sky-300 mb-1">3. Defectos e Incidencias Críticas</h3>
              <p className="text-slate-400 text-xs">
                Listado de bugs abiertos clasificados por severidad (Bloqueante, Alto, Medio, Bajo) junto con su impacto en el usuario final.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <h3 className="font-semibold text-sky-300 mb-1">4. Conclusión y Recomendación de QA</h3>
              <p className="text-slate-400 text-xs">
                Dictamen final del equipo: Apto para despliegue, Apto con observaciones (riesgos menores aceptados), o Rechazado por defectos críticos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO: TUTORIAL EXCEL QA */}
      {tabActiva === "excel" && (
        <div className="rounded-2xl border border-white/10 bg-[#07111f]/60 p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white">Cómo estructurar una Plantilla de Excel para QA</h2>
            <p className="text-sm text-slate-400 mt-1">
              Estructura recomendada en columnas para gestionar casos de prueba y trazabilidad de forma impecable en Excel o Google Sheets.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-sky-400 bg-white/[0.02]">
                  <th className="p-3">Columna</th>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Descripción / Ejemplo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="p-3 font-mono text-slate-400">A</td>
                  <td className="p-3 font-semibold text-white">ID de Caso</td>
                  <td className="p-3 text-slate-400">Identificador único (Ej: TC-LOGIN-001)</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-slate-400">B</td>
                  <td className="p-3 font-semibold text-white">Módulo / Área</td>
                  <td className="p-3 text-slate-400">Sección evaluada (Ej: Autenticación, Pagos)</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-slate-400">C</td>
                  <td className="p-3 font-semibold text-white">Descripción / Objetivo</td>
                  <td className="p-3 text-slate-400">Qué se va a probar (Ej: Validar login con credenciales válidas)</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-slate-400">D</td>
                  <td className="p-3 font-semibold text-white">Pasos a Seguir</td>
                  <td className="p-3 text-slate-400">1. Ir a /login. 2. Introducir email. 3. Pulsar entrar.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-slate-400">E</td>
                  <td className="p-3 font-semibold text-white">Resultado Esperado</td>
                  <td className="p-3 text-slate-400">El usuario accede al dashboard correctamente.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-slate-400">F</td>
                  <td className="p-3 font-semibold text-white">Estado (Status)</td>
                  <td className="p-3 text-slate-400">PASS / FAIL / PENDING (Ideal usar validación de datos en Excel)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}