"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import AppNavigation from "../components/AppNavigation";
import {
  actualizarEstadoTestCase,
  crearTestCase,
  eliminarTestCase,
  obtenerTestCases,
  type TestCase,
} from "@/lib/api/test-cases";

function getErrorMessage(reason: unknown, fallback: string) {
  return reason instanceof Error ? reason.message : fallback;
}

export default function TestCasesPage() {
  const [tests, setTests] = useState<TestCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [mutationError, setMutationError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TestCase["priority"]>("Medium");
  const [showPriorityOptions, setShowPriorityOptions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [updatingCaseId, setUpdatingCaseId] = useState<string | null>(null);
  const [deletingCaseId, setDeletingCaseId] = useState<string | null>(null);
  const [savedCaseId, setSavedCaseId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [reloadCount, setReloadCount] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isCurrent = true;

    obtenerTestCases()
      .then((loadedTests) => {
        if (isCurrent) setTests(loadedTests);
      })
      .catch((reason: unknown) => {
        if (isCurrent) {
          setLoadError(
            getErrorMessage(
              reason,
              "No se pudieron cargar los casos de prueba.",
            ),
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [reloadCount]);

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

  async function handleCreateTestCase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle || !cleanDescription) {
      setFormError("Completa el título y la descripción para continuar.");
      return;
    }

    setFormError("");
    setMutationError("");
    setIsSaving(true);

    try {
      const newTest = await crearTestCase({
        title: cleanTitle,
        description: cleanDescription,
        priority,
        status: "PENDING",
      });
      setTests((current) => [...current, newTest]);
      setSavedCaseId(newTest.id);
      setTitle("");
      setDescription("");
      setPriority("Medium");
      setShowForm(false);
    } catch (reason) {
      setFormError(
        getErrorMessage(reason, "No se pudo guardar el caso de prueba."),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleStatus(test: TestCase) {
    const nextStatus: TestCase["status"] =
      test.status === "PASS"
        ? "PENDING"
        : test.status === "PENDING"
          ? "FAIL"
          : "PASS";

    setMutationError("");
    setUpdatingCaseId(test.id);
    try {
      const updatedTest = await actualizarEstadoTestCase(test.id, nextStatus);
      setTests((current) =>
        current.map((currentTest) =>
          currentTest.id === updatedTest.id ? updatedTest : currentTest,
        ),
      );
    } catch (reason) {
      setMutationError(
        getErrorMessage(reason, "No se pudo actualizar el estado del caso."),
      );
    } finally {
      setUpdatingCaseId(null);
    }
  }

  async function deleteTestCase(id: string) {
    setMutationError("");
    setDeletingCaseId(id);
    try {
      await eliminarTestCase(id);
      setTests((current) => current.filter((test) => test.id !== id));
    } catch (reason) {
      setMutationError(
        getErrorMessage(reason, "No se pudo eliminar el caso de prueba."),
      );
    } finally {
      setDeletingCaseId(null);
    }
  }

  const metrics = useMemo(() => {
    const total = tests.length;
    const passed = tests.filter((test) => test.status === "PASS").length;
    const failed = tests.filter((test) => test.status === "FAIL").length;
    const pending = tests.filter((test) => test.status === "PENDING").length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    return { total, passed, failed, pending, passRate };
  }, [tests]);

  const filteredTests = useMemo(
    () =>
      tests.filter((test) => {
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          query === "" ||
          test.title.toLowerCase().includes(query) ||
          test.description.toLowerCase().includes(query) ||
          test.id.toLowerCase().includes(query);
        const matchesStatus =
          statusFilter === "ALL" || test.status === statusFilter;
        const matchesPriority =
          priorityFilter === "ALL" || test.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
      }),
    [tests, searchQuery, statusFilter, priorityFilter],
  );

  return (
    <main className="min-h-screen bg-[#07111f] text-white antialiased">
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#0b192b]/90 backdrop-blur-xl">
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
            <span className="hidden text-sm text-slate-300 sm:block">Tester</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-sky-300/20 bg-sky-400/15 text-sm font-semibold text-sky-200">
              A
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
        <AppNavigation activeHref="/test-cases" />

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
              type="button"
              onClick={() => {
                setShowForm((current) => !current);
                setFormError("");
              }}
              className="rounded-xl bg-sky-400 px-5 py-3 text-sm font-bold text-sky-950 shadow-[0_10px_30px_rgba(56,189,248,0.2)] transition-all hover:-translate-y-0.5 hover:bg-sky-300"
            >
              {showForm ? "✕ Cerrar formulario" : "+ Nuevo caso"}
            </button>
          </div>

          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/[0.08] bg-[#0b192b]/60 p-4">
              <span className="text-xs text-slate-400">Total casos</span>
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
              <span className="text-xs text-sky-300">Tasa de éxito</span>
              <p className="mt-1 text-2xl font-bold text-sky-300">
                {metrics.passRate}%
              </p>
              <span className="text-xs text-slate-500">
                {metrics.pending} pendientes
              </span>
            </div>
          </div>

          {savedCaseId && (
            <div
              role="status"
              className="mb-6 flex items-center justify-between rounded-2xl border border-green-400/20 bg-green-400/10 px-5 py-4 text-sm text-green-200"
            >
              <span>
                Caso <strong>{savedCaseId}</strong> guardado correctamente.
              </span>
              <button
                type="button"
                onClick={() => setSavedCaseId(null)}
                className="text-xs font-semibold text-green-200 hover:text-white"
              >
                Ocultar
              </button>
            </div>
          )}

          {(loadError || mutationError) && (
            <div
              role="alert"
              className="mb-6 flex flex-col justify-between gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-200 sm:flex-row sm:items-center"
            >
              <span>{loadError || mutationError}</span>
              {loadError && (
                <button
                  type="button"
                  onClick={() => {
                    setLoadError("");
                    setIsLoading(true);
                    setReloadCount((count) => count + 1);
                  }}
                  className="w-fit font-semibold text-red-100 underline underline-offset-4 hover:text-white"
                >
                  Reintentar
                </button>
              )}
            </div>
          )}

          {showForm && (
            <form
              onSubmit={handleCreateTestCase}
              className="mb-6 rounded-2xl border border-sky-300/15 bg-[#0b192b]/90 p-6 shadow-2xl shadow-black/10"
            >
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
                        setShowPriorityOptions((current) => !current)
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
                              setPriority(
                                option.value as TestCase["priority"],
                              );
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

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="rounded-xl bg-sky-400 px-5 py-3 text-sm font-bold text-sky-950 transition-colors hover:bg-sky-300 disabled:cursor-wait disabled:opacity-70"
                  >
                    {isSaving ? "Guardando caso..." : "Guardar caso"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-xl border border-white/[0.12] px-5 py-3 text-sm text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                  >
                    Cancelar
                  </button>
                </div>

                {formError && (
                  <p className="text-sm font-medium text-amber-300" role="alert">
                    {formError}
                  </p>
                )}
              </div>
            </form>
          )}

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <label htmlFor="search-cases" className="sr-only">
                Buscar casos de prueba
              </label>
              <input
                id="search-cases"
                type="search"
                placeholder="Buscar por ID, título o descripción..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-xl border border-white/[0.10] bg-[#0b192b]/80 px-4 py-2.5 text-sm outline-none placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Limpiar
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="filter-status" className="sr-only">
                Filtrar por estado
              </label>
              <select
                id="filter-status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-white/[0.10] bg-[#0b192b]/80 px-3 py-2.5 text-xs font-semibold text-slate-300 outline-none focus:border-sky-400"
                aria-label="Filtrar por estado"
              >
                <option value="ALL">Estado: Todos</option>
                <option value="PASS">Estado: PASS</option>
                <option value="FAIL">Estado: FAIL</option>
                <option value="PENDING">Estado: PENDING</option>
              </select>
              <label htmlFor="filter-priority" className="sr-only">
                Filtrar por prioridad
              </label>
              <select
                id="filter-priority"
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
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

          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b192b]/80 shadow-2xl shadow-black/10">
            <div className="hidden grid-cols-[90px_1fr_120px_130px_70px] border-b border-white/[0.07] px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid">
              <span>ID</span>
              <span>Caso de prueba</span>
              <span>Prioridad</span>
              <span>Estado</span>
              <span className="text-right">Acción</span>
            </div>

            {isLoading ? (
              <p role="status" className="p-10 text-center text-sm text-slate-400">
                Cargando casos desde el backend...
              </p>
            ) : filteredTests.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <p className="text-base font-medium">
                  {tests.length === 0
                    ? "Todavía no hay casos de prueba."
                    : "No se encontraron casos de prueba."}
                </p>
                {tests.length > 0 && (
                  <p className="mt-1 text-xs text-slate-500">
                    Prueba cambiando los filtros o la búsqueda.
                  </p>
                )}
              </div>
            ) : (
              filteredTests.map((test) => (
                <div
                  key={test.id}
                  className="grid items-center gap-3 border-b border-white/[0.06] px-6 py-5 transition-colors last:border-b-0 hover:bg-white/[0.025] sm:grid-cols-[90px_1fr_120px_130px_70px]"
                >
                  <span className="font-mono text-xs font-semibold text-slate-500">
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
                    onClick={() => void toggleStatus(test)}
                    disabled={updatingCaseId === test.id}
                    aria-label={`Cambiar estado de ${test.id}`}
                    className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 ${
                      test.status === "PASS"
                        ? "border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                        : test.status === "FAIL"
                          ? "border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          : "border-yellow-500/20 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20"
                    }`}
                  >
                    {updatingCaseId === test.id ? "Guardando..." : test.status}
                  </button>
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => void deleteTestCase(test.id)}
                      disabled={deletingCaseId === test.id}
                      aria-label={`Eliminar caso de prueba ${test.id}`}
                      title="Eliminar caso de prueba"
                      className="p-1 text-xs text-slate-500 transition-colors hover:text-red-400 disabled:cursor-wait disabled:opacity-60"
                    >
                      {deletingCaseId === test.id ? "…" : "✕"}
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
