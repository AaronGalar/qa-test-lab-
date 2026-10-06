import Link from "next/link";
import AppNavigation from "./components/AppNavigation";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#07111f] text-white antialiased">
      <header className="border-b border-white/[0.08] bg-[#0b192b]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400 text-lg shadow-[0_8px_24px_rgba(56,189,248,0.25)]">
              <span aria-hidden="true">✦</span>
            </div>

            <div>
              <h1 className="font-semibold tracking-tight">QA Test Lab</h1>
              <p className="text-xs text-slate-400">Tu espacio de pruebas</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-300 sm:block">
              Aarón
            </span>

            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-sky-300/20 bg-sky-400/15 text-sm font-semibold text-sky-200">
              A
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        <AppNavigation activeHref="/" />

        <section className="min-w-0 flex-1 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.10),transparent_34%)] p-6 lg:p-10">
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-sky-300/80">
                Vista general
              </p>
              <h2 className="text-3xl font-bold tracking-tight">
                Resumen de calidad
              </h2>

              <p className="mt-2 max-w-xl text-sm text-slate-400">
                Una lectura rápida del estado de tu suite y de las últimas
                pruebas ejecutadas.
              </p>
            </div>

            <Link
              href="/test-cases"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-sky-400 px-4 py-3 text-sm font-bold text-sky-950 shadow-[0_10px_30px_rgba(56,189,248,0.2)] hover:-translate-y-0.5 hover:bg-sky-300"
            >
              <span aria-hidden="true">+</span> Nuevo caso
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard title="Casos totales" value="24" icon="01" tone="sky" />

            <StatCard title="Superados" value="18" icon="02" tone="green" />

            <StatCard
              title="Necesitan atención"
              value="6"
              icon="03"
              tone="amber"
            />
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b192b]/80 shadow-2xl shadow-black/10">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5">
              <div>
                <h3 className="font-semibold">Actividad reciente</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Últimos casos ejecutados
                </p>
              </div>
              <span className="rounded-full border border-green-400/20 bg-green-400/10 px-3 py-1 text-xs font-semibold text-green-300">
                Suite estable
              </span>
            </div>

            <div>
              <TestRow id="TC-001" title="Login correcto" status="PASS" />

              <TestRow id="TC-002" title="Crear proyecto" status="PASS" />

              <TestRow id="TC-003" title="Editar proyecto" status="PASS" />

              <TestRow id="TC-004" title="Eliminar proyecto" status="FAIL" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: string;
  icon: string;
  tone: "sky" | "green" | "amber";
}) {
  // El tipo literal de "tone" limita el estilo a las tres variantes definidas.
  const tones = {
    sky: "border-sky-300/15 bg-sky-300/[0.07] text-sky-300",
    green: "border-green-300/15 bg-green-300/[0.07] text-green-300",
    amber: "border-amber-300/15 bg-amber-300/[0.07] text-amber-300",
  };

  return (
    <div className={`rounded-2xl border p-6 ${tones[tone]}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-300">{title}</p>

        <span className="text-xs font-bold tracking-widest opacity-70">
          {icon}
        </span>
      </div>

      <p className="mt-5 text-4xl font-bold tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}

function TestRow({
  id,
  title,
  status,
}: {
  id: string;
  title: string;
  status: "PASS" | "FAIL";
}) {
  // El estado determina tanto el texto como el color que ve la persona usuaria.
  const passed = status === "PASS";

  return (
    <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4 last:border-b-0 hover:bg-white/[0.025]">
      <div className="flex items-center gap-4">
        <span className="rounded-md bg-white/[0.05] px-2 py-1 font-mono text-[11px] text-slate-500">
          {id}
        </span>

        <span className="text-sm">{title}</span>
      </div>

      <span
        className={
          passed
            ? "rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400"
            : "rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400"
        }
      >
        {status}
      </span>
    </div>
  );
}
