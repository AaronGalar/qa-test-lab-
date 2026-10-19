"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import { crearTestCase } from "@/lib/api/test-cases";
import {
  generarSugerencias,
  type ScenarioCategory,
  type TestCaseSuggestion,
} from "@/lib/api/test-case-suggestions";

type PreviewSuggestion = TestCaseSuggestion & { saved: boolean };

function getErrorMessage(reason: unknown, fallback: string) {
  return reason instanceof Error ? reason.message : fallback;
}

function isScenarioCategory(value: string): value is ScenarioCategory {
  return value === "login" || value === "form" || value === "crud";
}

export default function TestCaseGeneratorPage() {
  const [category, setCategory] = useState<ScenarioCategory>("login");
  const [featureName, setFeatureName] = useState("");
  const [suggestions, setSuggestions] = useState<PreviewSuggestion[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanFeatureName = featureName.trim();
    if (!cleanFeatureName) return;

    setError("");
    setMessage("");
    setSuggestions([]);
    setSelectedIndices([]);
    setIsGenerating(true);

    try {
      const generated = await generarSugerencias(category, cleanFeatureName);
      setSuggestions(
        generated.map((suggestion) => ({ ...suggestion, saved: false })),
      );
      if (generated.length === 0) {
        setMessage("No hay escenarios para esta categoría todavía.");
      }
    } catch (reason) {
      setError(
        getErrorMessage(reason, "No se pudieron generar los escenarios."),
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function toggleSelection(index: number, checked: boolean) {
    setSelectedIndices((current) =>
      checked
        ? [...current, index]
        : current.filter((selectedIndex) => selectedIndex !== index),
    );
  }

  async function handleSaveSelected() {
    const indicesToSave = selectedIndices.filter(
      (index) => !suggestions[index]?.saved,
    );
    if (indicesToSave.length === 0) return;

    setError("");
    setMessage("");
    setIsSaving(true);
    const savedIndices: number[] = [];

    try {
      for (const index of indicesToSave) {
        const suggestion = suggestions[index];
        if (!suggestion) continue;

        await crearTestCase({
          title: suggestion.title,
          description: suggestion.description,
          priority: suggestion.priority,
          status: "PENDING",
        });
        savedIndices.push(index);
        setSuggestions((current) =>
          current.map((item, itemIndex) =>
            itemIndex === index ? { ...item, saved: true } : item,
          ),
        );
      }

      setMessage(
        `${savedIndices.length} ${
          savedIndices.length === 1
            ? "caso guardado en"
            : "casos guardados en"
        } la biblioteca.`,
      );
    } catch (reason) {
      const detail = getErrorMessage(reason, "Error desconocido.");
      const partialResult =
        savedIndices.length > 0
          ? ` Se guardaron ${savedIndices.length} casos antes del error.`
          : "";
      setError(`No se pudieron guardar todos los casos: ${detail}${partialResult}`);
    } finally {
      setSelectedIndices((current) =>
        current.filter((index) => !savedIndices.includes(index)),
      );
      setIsSaving(false);
    }
  }

  const selectedCount = selectedIndices.filter(
    (index) => !suggestions[index]?.saved,
  ).length;

  return (
    <main className="min-h-screen bg-[#07111f] text-white antialiased">
      <header className="border-b border-white/[0.08] bg-[#0b192b]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4 lg:px-10">
          <div>
            <h1 className="font-semibold tracking-tight">QA Test Lab</h1>
            <p className="text-xs text-slate-400">Tu espacio de pruebas</p>
          </div>
          <Link
            href="/test-cases"
            className="text-sm text-slate-400 transition-colors hover:text-white"
          >
            Volver a casos
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1600px]">
      

        <section className="min-w-0 flex-1 p-6 lg:p-10">
          <div className="mx-auto max-w-4xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-sky-300/80">
              Herramienta guiada
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              Generador de escenarios QA
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Elige una plantilla y revisa escenarios creados por reglas
              deterministas en el backend. No utiliza un modelo de IA.
            </p>

            <form
              onSubmit={handleGenerate}
              className="mt-8 grid gap-5 rounded-2xl border border-white/[0.08] bg-[#0b192b]/80 p-6 sm:grid-cols-2"
            >
              <div>
                <label
                  htmlFor="scenario-category"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Tipo de funcionalidad
                </label>
                <select
                  id="scenario-category"
                  value={category}
                  onChange={(event) => {
                    if (isScenarioCategory(event.target.value)) {
                      setCategory(event.target.value);
                    }
                  }}
                  className="w-full rounded-lg border border-white/15 bg-[#07111f] px-3 py-3 text-sm text-white outline-none focus:border-sky-400"
                >
                  <option value="login">Inicio de sesión</option>
                  <option value="form">Formulario</option>
                  <option value="crud">Operaciones CRUD</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="feature-name"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Nombre de la funcionalidad
                </label>
                <input
                  id="feature-name"
                  value={featureName}
                  onChange={(event) => setFeatureName(event.target.value)}
                  maxLength={80}
                  required
                  placeholder="Ej.: Acceso de clientes"
                  className="w-full rounded-lg border border-white/15 bg-[#07111f] px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-sky-400"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating || !featureName.trim()}
                className="w-fit rounded-lg bg-sky-400 px-5 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
              >
                {isGenerating ? "Preparando escenarios..." : "Generar escenarios"}
              </button>
            </form>

            {error && (
              <p role="alert" className="mt-5 text-sm text-red-300">
                {error}
              </p>
            )}
            {message && (
              <p role="status" className="mt-5 text-sm text-emerald-300">
                {message}
              </p>
            )}

            {suggestions.length > 0 && (
              <section
                aria-labelledby="suggestions-heading"
                className="mt-8"
              >
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3
                      id="suggestions-heading"
                      className="text-xl font-semibold"
                    >
                      Revisa las sugerencias
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                      Marca solo los casos que quieras añadir a la biblioteca.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleSaveSelected()}
                    disabled={isSaving || selectedCount === 0}
                    className="w-fit rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-bold text-emerald-950 transition-colors hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSaving
                      ? "Guardando..."
                      : `Guardar seleccionados (${selectedCount})`}
                  </button>
                </div>

                <ul className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={`${suggestion.title}-${index}`}
                      className="rounded-xl border border-white/[0.08] bg-[#0b192b]/70 p-4"
                    >
                      <label className="flex cursor-pointer gap-3">
                        <input
                          type="checkbox"
                          aria-label={`Seleccionar ${suggestion.title}`}
                          checked={
                            suggestion.saved || selectedIndices.includes(index)
                          }
                          disabled={suggestion.saved || isSaving}
                          onChange={(event) =>
                            toggleSelection(index, event.target.checked)
                          }
                          className="mt-1 h-4 w-4 accent-sky-400"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2 font-medium text-white">
                            {suggestion.title}
                            <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-xs text-amber-200">
                              {suggestion.priority === "High"
                                ? "Alta"
                                : suggestion.priority === "Medium"
                                  ? "Media"
                                  : "Baja"}
                            </span>
                            {suggestion.saved && (
                              <span className="text-xs text-emerald-300">
                                Guardado
                              </span>
                            )}
                          </span>
                          <span className="mt-2 block text-sm leading-6 text-slate-400">
                            {suggestion.description}
                          </span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
