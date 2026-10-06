// Las props describen los datos que el componente padre le entrega al componente hijo.
type RespuestasProps = {
  preguntas: string[];
};

// El componente recibe "preguntas" desde el archivo principal
export default function Respuestas({ preguntas }: RespuestasProps) {
  if (preguntas.length === 0) {
    return (
      <p className="mt-8 text-center text-sm text-slate-500">
        Tus preguntas aparecerán aquí.
      </p>
    );
  }

  return (
    <ul className="mt-8 space-y-2 max-w-md mx-auto">
      {preguntas.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="bg-[#0b192b] border border-white/10 p-3 rounded text-left"
        >
          ❓ {item}
        </li>
      ))}
    </ul>
  );
}