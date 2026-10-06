"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import AppNavigation from "../components/AppNavigation";

export type TestCase = {
  id: string;
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  status: "PASS" | "FAIL" | "PENDING";
};

const initialTests: TestCase[] = [
  {
    id: "TC-001",
    title: "Login correcto",
    description: "Comprobar acceso con credenciales válidas",
    priority: "High",
    status: "PASS",
  },
  {
    id: "TC-002",
    title: "Login incorrecto",
    description: "Comprobar rechazo de credenciales incorrectas",
    priority: "Medium",
    status: "PASS",
  },
  {
    id: "TC-003",
    title: "Campos obligatorios",
    description: "Comprobar validación de campos vacíos",
    priority: "Low",
    status: "PASS",
  },
];

export default function TestCasesPage() {
  // Estado local para practicar cómo React actualiza la interfaz tras cada acción.
  const [tests, setTests] = useState<TestCase[]>(initialTests);
  // Contador de alta monotónica: borrar un caso no hace que su ID se reutilice.
  const nextCaseNumber = useRef(
    initialTests.reduce((highest, test) => {
      const number = Number(test.id.replace("TC-", ""));
      return Number.isNaN(number) ? highest : Math.max(highest, number);
    }, 0) + 1,
  );
  const [showForm, setShowForm] = useState(false);

  // Estado del Formulario
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TestCase["priority"]>("Medium");
  const [showPriorityOptions, setShowPriorityOptions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedCaseId, setSavedCaseId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  // Estado de Búsqueda y Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar desplegable de prioridad al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowPriorityOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleStatus = (id: string) => {
    setTests((prevTests) =>
      prevTests.map((test) => {
        if (test.id === id) {
          const nextStatus: TestCase["status"] =
            test.status === "PASS"
              ? "PENDING"
              : test.status === "PENDING"
                ? "FAIL"
                : "PASS";
          return { ...test, status: nextStatus };
        }
        return test;
      }),
    );
  };

  const deleteTestCase = (id: string) => {
    setTests((prev) => prev.filter((t) => t.id !== id));
  };

  async function createTestCase() {
    if (!title.trim() || !description.trim()) {
      setFormError("Completa el título y la descripción para continuar.");
      return;
    }

    setFormError("");
    setIsSaving(true);

    const newTest: TestCase = {
      id: `TC-${String(nextCaseNumber.current).padStart(3, "0")}`,
      title: title.trim(),
      description: description.trim(),
      priority,
      status: "PENDING",
    };

    await new Promise((resolve) => setTimeout(resolve, 300));
    nextCaseNumber.current += 1;
    setTests((prev) => [...prev, newTest]);
    setSavedCaseId(newTest.id);

    setTitle("");
    setDescription("");
    setPriority("Medium");
    setShowForm(false);
    setIsSaving(false);
  }

  // Cálculo de Métricas
  const metrics = useMemo(() => {
    const total = tests.length;
    const passed = tests.filter((t) => t.status === "PASS").length;
    const failed = tests.filter((t) => t.status === "FAIL").length;
    const pending = tests.filter((t) => t.status === "PENDING").length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    return { total, passed, failed, pending, passRate };
  }, [tests]);

  // Lista Filtrada
  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      const matchesSearch =
        test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || test.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" || test.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tests, searchQuery, statusFilter, priorityFilter]);

  return (
    <main className="min-h-screen bg-[#07111f] text-white antialiased">
      <header className="border-b border-white/[0.08] bg-[#0b192b]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400 text-lg text-sky-950 shadow-[0_8px_24px_rgba(56,189,248,0.25)]">
              <span aria-hidden="true">✦</span>
            </div>
            <div>
              <h1 className="font-semibold tracking-tight">QA Test Lab</h1>
              <p className="text-xs text-slate-400">Tu espacio de pruebas</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-300 sm:block">
              Tester
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-sky-300/20 bg-sky-400/15 text-sm font-semibold text-sky-200">
              A
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        <AppNavigation activeHref="/test-cases" />

        {/* Ámbito Principal */}
        <section className="min-w-0 flex-1 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.10),transparent_34%)] p-6 lg:p-10">
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-sky-300/80">
                Biblioteca de calidad
              </p>
              <h2 className="text-3xl font-bold tracking-tight">
                Casos de prueba
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-400">
                Define escenarios claros, ejecútalos y conserva una suite fácil
                de mantener.
              </p>
            </div>

            <button
              onClick={() => setShowForm((prev) => !prev)}
              className="rounded-xl bg-sky-400 px-5 py-3 text-sm font-bold text-sky-950 shadow-[0_10px_30px_rgba(56,189,248,0.2)] hover:-translate-y-0.5 hover:bg-sky-300 transition-all"
            >
              {showForm ? "✕ Cerrar formulario" : "+ Nuevo caso"}
            </button>
          </div>

          {/* Tarjetas de Métricas */}
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/[0.08] bg-[#0b192b]/60 p-4">
              <span className="text-xs text-slate-400">Total Casos</span>
              <p className="mt-1 text-2xl font-bold">{metrics.total}</p>
            </div>
            <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4">
              <span className="text-xs text-green-400">Exitosos (PASS)</span>
              <p className="mt-1 text-2xl font-bold text-green-400">
                {metrics.passed}
              </p>
            </div>
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
              <span className="text-xs text-red-400">Fallidos (FAIL)</span>
              <p className="mt-1 text-2xl font-bold text-red-400">
                {metrics.failed}
              </p>
            </div>
            <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4">
              <span className="text-xs text-sky-300">Tasa de Éxito</span>
              <p className="mt-1 text-2xl font-bold text-sky-300">
                {metrics.passRate}%
              </p>
            </div>
          </div>

          {/* Banner de Éxito */}
          {savedCaseId && (
            <div className="mb-6 flex items-center justify-between rounded-2xl border border-green-400/20 bg-green-400/10 px-5 py-4 text-sm text-green-200">
              <span>
                Caso <strong>{savedCaseId}</strong> guardado correctamente.
              </span>
              <button
                onClick={() => setSavedCaseId(null)}
                className="text-xs font-semibold text-green-200 hover:text-white"
              >
                Ocultar
              </button>
            </div>
          )}

          {/* Formulario de Creación */}
          {showForm && (
            <div className="mb-6 rounded-2xl border border-sky-300/15 bg-[#0b192b]/90 p-6 shadow-2xl shadow-black/10">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-300/80">
                    Nuevo escenario
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">
                    Crea un caso de prueba
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg px-2 py-1 text-slate-500 hover:bg-white/[0.06] hover:text-white"
                  aria-label="Cerrar formulario"
                >
                  ×
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="title"
                    className="mb-2 block text-sm font-medium"
                  >
                    Título
                  </label>
                  <input
                    id="title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Ej. Restablecer contraseña"
                    className="w-full rounded-xl border border-white/[0.10] bg-[#07111f] px-4 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-medium"
                  >
                    Descripción
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe los pasos o qué queremos comprobar..."
                    rows={4}
                    className="w-full rounded-xl border border-white/[0.10] bg-[#07111f] px-4 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="priority"
                    className="mb-2 block text-sm font-medium"
                  >
                    Prioridad
                  </label>

                  <div className="relative w-full max-w-xl" ref={dropdownRef}>
                    <button
                      id="priority"
                      type="button"
                      aria-label="Prioridad"
                      aria-haspopup="listbox"
                      aria-expanded={showPriorityOptions}
                      onClick={() =>
                        setShowPriorityOptions(!showPriorityOptions)
                      }
                      className="flex w-full items-center justify-between rounded-xl border border-white/[0.10] bg-[#07111f] px-4 py-3 text-left text-sm outline-none transition-colors hover:border-sky-300/40 focus:border-sky-400 focus:ring-4 focus:ring-sky-400/10"
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${
                            priority === "High"
                              ? "bg-rose-400"
                              : priority === "Medium"
                                ? "bg-amber-300"
                                : "bg-emerald-400"
                          }`}
                        />
                        <span className="font-medium">
                          {priority === "High"
                            ? "Alta"
                            : priority === "Low"
                              ? "Baja"
                              : "Media"}
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={`text-slate-400 transition-transform ${
                          showPriorityOptions ? "rotate-180" : ""
                        }`}
                      >
                        ▾
                      </span>
                    </button>

                    {showPriorityOptions && (
                      <div
                        id="priority-options"
                        role="listbox"
                        aria-label="Niveles de prioridad"
                        className="absolute left-0 top-[calc(100%+8px)] z-30 w-full overflow-hidden rounded-xl border border-white/[0.12] bg-[#0b192b] p-1.5 shadow-2xl shadow-black/40"
                      >
                        {[
                          {
                            value: "High",
                            label: "Alta",
                            detail:
                              "Riesgo crítico o flujo que bloquea al usuario",
                            color: "bg-rose-400",
                          },
                          {
                            value: "Medium",
                            label: "Media",
                            detail:
                              "Funcionalidad habitual con impacto moderado",
                            color: "bg-amber-300",
                          },
                          {
                            value: "Low",
                            label: "Baja",
                            detail:
                              "Mejora o escenario secundario no bloqueante",
                            color: "bg-emerald-400",
                          },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            role="option"
                            aria-selected={priority === option.value}
                            onClick={() => {
                              setPriority(option.value as TestCase["priority"]);
                              setShowPriorityOptions(false);
                            }}
                            className="flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-white/[0.06] focus:bg-white/[0.06] focus:outline-none"
                          >
                            <span
                              className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${option.color}`}
                            />
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-slate-100">
                                {option.label}
                              </span>
                              <span className="mt-1 block text-xs leading-5 text-slate-400">
                                {option.detail}
                              </span>
                            </span>
                            {priority === option.value && (
                              <span className="ml-auto text-xs font-semibold text-sky-300">
                                Actual
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={createTestCase}
                    disabled={isSaving}
                    className="rounded-xl bg-sky-400 px-5 py-3 text-sm font-bold text-sky-950 hover:bg-sky-300 disabled:cursor-wait disabled:opacity-70 transition-colors"
                  >
                    {isSaving ? "Guardando caso..." : "Guardar caso"}
                  </button>

                  <button
                    onClick={() => setShowForm(false)}
                    className="rounded-xl border border-white/[0.12] px-5 py-3 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                </div>

                {formError && (
                  <p
                    className="text-sm font-medium text-amber-300"
                    role="alert"
                  >
                    {formError}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Filtros y Buscador */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar por ID, título o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/[0.10] bg-[#0b192b]/80 px-4 py-2.5 text-sm outline-none placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Limpiar
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-white/[0.10] bg-[#0b192b]/80 px-3 py-2.5 text-xs font-semibold text-slate-300 outline-none focus:border-sky-400"
                aria-label="Filtrar por estado"
              >
                <option value="ALL">Estado: Todos</option>
                <option value="PASS">Estado: PASS</option>
                <option value="FAIL">Estado: FAIL</option>
                <option value="PENDING">Estado: PENDING</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="rounded-xl border border-white/[0.10] bg-[#0b192b]/80 px-3 py-2.5 text-xs font-semibold text-slate-300 outline-none focus:border-sky-400"
                aria-label="Filtrar por prioridad"
              >
                <option value="ALL">Prioridad: Todas</option>
                <option value="High">Prioridad: Alta</option>
                <option value="Medium">Prioridad: Media</option>
                <option value="Low">Prioridad: Baja</option>
              </select>
            </div>
          </div>

          {/* Tabla de Casos de Prueba */}
          {/* map() transforma cada elemento del estado en una fila identificada por su ID. */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b192b]/80 shadow-2xl shadow-black/10">
            <div className="hidden grid-cols-[90px_1fr_120px_130px_70px] border-b border-white/[0.07] px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid">
              <span>ID</span>
              <span>Caso de Prueba</span>
              <span>Prioridad</span>
              <span>Estado</span>
              <span className="text-right">Acción</span>
            </div>

            {filteredTests.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <p className="text-base font-medium">
                  No se encontraron casos de prueba
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Prueba cambiando los filtros o la búsqueda.
                </p>
              </div>
            ) : (
              filteredTests.map((test) => (
                <div
                  key={test.id}
                  className="grid items-center gap-3 border-b border-white/[0.06] px-6 py-5 last:border-b-0 hover:bg-white/[0.025] transition-colors sm:grid-cols-[90px_1fr_120px_130px_70px]"
                >
                  <span className="font-mono text-xs text-slate-500 font-semibold">
                    {test.id}
                  </span>

                  <div>
                    <p className="text-sm font-medium text-slate-100">
                      {test.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {test.description}
                    </p>
                  </div>

                  <span className="text-sm text-slate-300">
                    <span
                      className={`mr-2 inline-block h-2 w-2 rounded-full ${
                        test.priority === "High"
                          ? "bg-rose-400"
                          : test.priority === "Medium"
                            ? "bg-amber-300"
                            : "bg-emerald-400"
                      }`}
                    />
                    {test.priority === "High"
                      ? "Alta"
                      : test.priority === "Low"
                        ? "Baja"
                        : "Media"}
                  </span>

                  <button
                    type="button"
                    onClick={() => toggleStatus(test.id)}
                    aria-label={`Cambiar estado de ${test.id}`}
                    className={
                      test.status === "PASS"
                        ? "w-fit rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-colors"
                        : test.status === "FAIL"
                          ? "w-fit rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                          : "w-fit rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 transition-colors"
                    }
                  >
                    {test.status}
                  </button>

                  <div className="text-right">
                    <button
                      onClick={() => deleteTestCase(test.id)}
                      aria-label={`Eliminar caso de prueba ${test.id}`}
                      title="Eliminar caso de prueba"
                      className="text-xs text-slate-500 hover:text-red-400 transition-colors p-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
