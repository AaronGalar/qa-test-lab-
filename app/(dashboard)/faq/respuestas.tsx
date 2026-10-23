// app/faq/respuestas.tsx
import { type Pregunta } from "@/lib/api/preguntas";

export default function Respuestas({ preguntas }: { preguntas: Pregunta[] }) {
  if (preguntas.length === 0) {
    return (
      <div className="w-full rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-400">
        No se encontraron preguntas o no hay ninguna duda registrada aún.
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {preguntas.map((p: any) => {
        const esRespondida = p.estado === "Respondida";
        
        // 1. Intentamos obtener cualquier propiedad de fecha real que envíe la API
        const rawFecha = p.fecha || p.createdAt || p.created_at || p.fecha_creacion || p.date;
        
        let fechaFormateada = "";

        if (rawFecha) {
          if (typeof rawFecha === "string" && rawFecha.includes("-")) {
            fechaFormateada = rawFecha.split("T")[0];
          } else if (typeof rawFecha === "string" && rawFecha.includes("/")) {
            const partes = rawFecha.split("/");
            if (partes.length === 3) {
              fechaFormateada = `${partes[2]}-${partes[1].padStart(2, "0")}-${partes[0].padStart(2, "0")}`;
            }
          } else {
            try {
              fechaFormateada = new Date(rawFecha).toISOString().split("T")[0];
            } catch (e) {
              fechaFormateada = "";
            }
          }
        }

        // Si la pregunta viene sin fecha de la API, usamos la fecha de hoy en formato YYYY-MM-DD
        if (!fechaFormateada) {
          fechaFormateada = new Date().toISOString().split("T")[0];
        }

        return (
          <div
            key={p.id}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#0b192b]/90 to-[#07111f]/90 p-5 shadow-lg transition-all hover:border-sky-500/30"
          >
            {/* Cabecera / Pregunta */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
                    CONSULTA DE QA
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-white/[0.05] px-2 py-0.5 rounded border border-white/10">
                    📅 {fechaFormateada}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white leading-relaxed">
                  {p.texto || p.pregunta}
                </p>
              </div>

              {/* Estado de la pregunta */}
              <div>
                {esRespondida ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                    ✓ RESPONDIDA
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 border border-amber-500/20 whitespace-nowrap">
                    ⏳ PENDIENTE
                  </span>
                )}
              </div>
            </div>

            {/* Respuesta del Senior */}
            {esRespondida && p.respuesta && (
              <div className="mt-4 rounded-xl border border-sky-500/20 bg-sky-500/[0.04] p-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-sky-400 flex items-center gap-1.5">
                    <span>🛡️</span>
                    <span>Respuesta del QA Senior ({p.respondido_por || "Senior"})</span>
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-normal pl-5">
                  {p.respuesta}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}