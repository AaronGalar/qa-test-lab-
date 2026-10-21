// app/components/ExportReportButton.tsx
"use client";

import { useState } from "react";
import { exportarCasosACSV, generarPDFProfesional, CasoPruebaExport } from "@/lib/api/exportUtils";

interface Props {
  casos: CasoPruebaExport[];
}

export default function ExportReportButton({ casos }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left print:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl bg-sky-500/10 px-4 py-2.5 text-sm font-semibold text-sky-400 border border-sky-500/30 hover:bg-sky-500/20 transition-all shadow-lg shadow-sky-500/5"
      >
        <span>📥</span>
        <span>Exportar Informe</span>
        <span className="text-xs opacity-70">▼</span>
      </button>

      {open && (
        <div 
          className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#0b192b] p-1.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
          onMouseLeave={() => setOpen(false)}
        >
          <button
            onClick={() => {
              generarPDFProfesional(casos);
              setOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-200 hover:bg-sky-500/10 hover:text-sky-300 transition-colors"
          >
            <span>📄</span>
            <div className="text-left">
              <div className="font-semibold">Descargar en PDF</div>
              <div className="text-[10px] text-slate-400">Informe formal estructurado</div>
            </div>
          </button>

          <button
            onClick={() => {
              exportarCasosACSV(casos);
              setOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-200 hover:bg-sky-500/10 hover:text-sky-300 transition-colors border-t border-white/5 mt-1 pt-2"
          >
            <span>📊</span>
            <div className="text-left">
              <div className="font-semibold">Exportar Datos a CSV</div>
              <div className="text-[10px] text-slate-400">Compatible con Excel / Sheets</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}