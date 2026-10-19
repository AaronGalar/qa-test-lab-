import { type Pregunta } from "@/lib/api/preguntas";

export default function Respuestas({ preguntas }: { preguntas: Pregunta[] }) {
  if (preguntas.length === 0) {
    return <p className="mt-8 text-center text-sm text-slate-400">No has enviado ninguna pregunta todavía.</p>;
  }

  return (
    <div className="mx-auto mt-8 max-w-xl space-y-4">
      {preguntas.map((p) => (
        <div key={p.id} className="rounded-xl border border-white/10 bg-[#0b192b] p-4 shadow-lg">
          <p className="font-medium text-slate-200">Tú: {p.texto}</p>

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-400">Estado:</span>
            {p.estado === "Respondida" ? (
              <span className="rounded bg-emerald-500/20 px-2.5 py-0.5 font-semibold text-emerald-300">
                Respondida
              </span>
            ) : (
              <span className="rounded bg-amber-500/20 px-2.5 py-0.5 font-semibold text-amber-300">
                Pendiente de revisión del QA Senior
              </span>
            )}
          </div>

          {/* Si ya está respondida, mostramos la contestación del Senior */}
          {p.estado === "Respondida" && p.respuesta && (
            <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
              <p className="text-xs font-semibold text-emerald-400">
                Respuesta del QA Senior ({p.respondido_por || "Senior"}):
              </p>
              <p className="mt-1 text-sm text-emerald-200">{p.respuesta}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}