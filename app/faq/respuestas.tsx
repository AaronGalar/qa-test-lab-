import type { Pregunta } from "@/lib/api/preguntas";

type RespuestasProps = {
  preguntas: Pregunta[];
};

export default function Respuestas({ preguntas }: RespuestasProps) {
  if (preguntas.length === 0) {
    return (
      <p className="mt-8 text-center text-sm text-slate-500">
        Todavía no hay preguntas guardadas.
      </p>
    );
  }

  return (
    <ul className="mx-auto mt-8 max-w-md space-y-2">
      {preguntas.map((pregunta) => (
        <li
          key={pregunta.id}
          className="rounded border border-white/10 bg-[#0b192b] p-3 text-left"
        >
          ❓ {pregunta.texto}
        </li>
      ))}
    </ul>
  );
}