"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  obtenerProyectos,
  crearProyecto,
  actualizarProyecto,
  eliminarProyecto,
  type Proyecto,
} from "@/lib/api/proyectos";

export default function GeneradorProyecto() {
  // Lista principal de proyectos
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [cargando, setCargando] = useState(true);

  // ----------------------------------------------------
  // ESTADOS PARA EL FORMULARIO DE CREACIÓN
  // ----------------------------------------------------
  const [nombreProyecto, setNombreProyecto] = useState("");
  const [descripcionProyecto, setDescripcionProyecto] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [ultimoTesting, setUltimoTesting] = useState("");
  const [detallesTesting, setDetallesTesting] = useState("");

  // ----------------------------------------------------
  // ESTADOS PARA EL MODO EDICIÓN
  // ----------------------------------------------------
  const [proyectoEnEdicion, setProyectoEnEdicion] = useState<Proyecto | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editFechaInicio, setEditFechaInicio] = useState("");
  const [editUltimoTesting, setEditUltimoTesting] = useState("");
  const [editDetallesTesting, setEditDetallesTesting] = useState("");

  // 1. Cargar la lista inicial de proyectos desde FastAPI
  useEffect(() => {
    async function cargarListaInicial() {
      try {
        const datos = await obtenerProyectos();
        setProyectos(datos);
      } catch (error) {
        console.error("Error al cargar proyectos:", error);
      } finally {
        setCargando(false);
      }
    }
    cargarListaInicial();
  }, []);

  // 2. Función para crear un nuevo proyecto (POST)
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nombreProyecto.trim()) return;

    try {
      const nuevoProyecto = await crearProyecto({
        name: nombreProyecto,
        description: descripcionProyecto,
        fecha_inicio: fechaInicio || undefined,
        ultimo_testing: ultimoTesting || undefined,
        detalles_testing: detallesTesting || undefined,
      });

      // Añadimos el nuevo proyecto a la lista sin recargar la página
      setProyectos([...proyectos, nuevoProyecto]);

      // Limpiamos las cajitas del formulario
      setNombreProyecto("");
      setDescripcionProyecto("");
      setFechaInicio("");
      setUltimoTesting("");
      setDetallesTesting("");
    } catch (error) {
      console.error("Error al crear el proyecto:", error);
    }
  }

  // 3. Activar el modo edición en una tarjeta
  function iniciarEdicion(proyecto: Proyecto) {
    setProyectoEnEdicion(proyecto);
    setEditNombre(proyecto.name);
    setEditDescripcion(proyecto.description || "");
    setEditFechaInicio(proyecto.fecha_inicio || "");
    setEditUltimoTesting(proyecto.ultimo_testing || "");
    setEditDetallesTesting(proyecto.detalles_testing || "");
  }

  // 4. Guardar los cambios editados de un proyecto (PATCH)
  async function handleGuardarEdicion(e: FormEvent) {
    e.preventDefault();
    if (!proyectoEnEdicion) return;

    try {
      const proyectoActualizado = await actualizarProyecto(proyectoEnEdicion.id, {
        name: editNombre,
        description: editDescripcion,
        fecha_inicio: editFechaInicio || undefined,
        ultimo_testing: editUltimoTesting || undefined,
        detalles_testing: editDetallesTesting || undefined,
      });

      // Actualizamos la lista reemplazando solo el proyecto modificado
      setProyectos(
        proyectos.map((p) => (p.id === proyectoEnEdicion.id ? proyectoActualizado : p))
      );

      // Salimos del modo edición
      setProyectoEnEdicion(null);
    } catch (error) {
      console.error("Error al actualizar el proyecto:", error);
    }
  }

  // 5. Función para eliminar un proyecto (DELETE)
  async function handleEliminar(id: number) {
    try {
      await eliminarProyecto(id);
      setProyectos(proyectos.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error al eliminar el proyecto:", error);
    }
  }

  return (
    <main className="min-h-screen bg-[#07111f] p-6 text-white antialiased lg:p-10">
      <Link href="/" className="text-sm text-slate-400 hover:text-white">
        ← Volver al dashboard
      </Link>

      <h1 className="mt-8 text-center text-3xl font-bold tracking-tight">
        Organización de Proyectos & Pruebas
      </h1>

      <div className="mx-auto mt-8 max-w-4xl space-y-10">

        {/* ======================================================= */}
        {/* FORMULARIO PARA CREAR PROYECTO                          */}
        {/* ======================================================= */}
        <form
          onSubmit={handleSubmit}
          className="rounded-lg bg-slate-900 p-6 shadow-md border border-slate-800 space-y-4"
        >
          <h2 className="text-xl font-semibold">Crear nuevo proyecto</h2>

          {/* Nombre */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Nombre del proyecto *:
            </label>
            <input
              type="text"
              className="w-full rounded bg-slate-800 p-2 text-white border border-slate-700 focus:outline-none focus:border-blue-500"
              value={nombreProyecto}
              onChange={(e) => setNombreProyecto(e.target.value)}
              placeholder="Ej: Módulo de Autenticación"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              Descripción:
            </label>
            <textarea
              className="w-full rounded bg-slate-800 p-2 text-white border border-slate-700 focus:outline-none focus:border-blue-500"
              value={descripcionProyecto}
              onChange={(e) => setDescripcionProyecto(e.target.value)}
              placeholder="Descripción general del proyecto..."
              rows={2}
            />
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Fecha de Inicio:
              </label>
              <input
                type="date"
                className="w-full rounded bg-slate-800 p-2 text-white border border-slate-700 focus:outline-none focus:border-blue-500"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Fecha de Último Testing:
              </label>
              <input
                type="date"
                className="w-full rounded bg-slate-800 p-2 text-white border border-slate-700 focus:outline-none focus:border-blue-500"
                value={ultimoTesting}
                onChange={(e) => setUltimoTesting(e.target.value)}
              />
            </div>
          </div>

          {/* Detalles del testing */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">
              ¿Qué se hizo en el último testing?:
            </label>
            <textarea
              className="w-full rounded bg-slate-800 p-2 text-white border border-slate-700 focus:outline-none focus:border-blue-500"
              value={detallesTesting}
              onChange={(e) => setDetallesTesting(e.target.value)}
              placeholder="Ej: Se ejecutaron 10 pruebas unitarias..."
              rows={2}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded bg-blue-600 py-2 font-medium hover:bg-blue-500 transition-colors"
          >
            Guardar Proyecto
          </button>
        </form>

        {/* ======================================================= */}
        {/* LISTA Y TARJETAS DE PROYECTOS                           */}
        {/* ======================================================= */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Mis Proyectos</h2>

          {cargando && <p className="text-slate-400">Cargando proyectos...</p>}

          {!cargando && proyectos.length === 0 && (
            <p className="text-slate-400">No hay proyectos registrados aún.</p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {proyectos.map((proyecto) => {
              const estaEditando = proyectoEnEdicion?.id === proyecto.id;

              return (
                <div
                  key={proyecto.id}
                  className="rounded-lg bg-slate-900 p-5 border border-slate-800 flex flex-col justify-between"
                >
                  {/* SI LA TARJETA SE ESTÁ EDITANDO */}
                  {estaEditando ? (
                    <form onSubmit={handleGuardarEdicion} className="space-y-3">
                      <h3 className="text-sm font-bold text-yellow-400">
                        Editando proyecto...
                      </h3>

                      <input
                        type="text"
                        className="w-full rounded bg-slate-800 p-2 text-xs text-white border border-slate-700"
                        value={editNombre}
                        onChange={(e) => setEditNombre(e.target.value)}
                        required
                      />

                      <textarea
                        className="w-full rounded bg-slate-800 p-2 text-xs text-white border border-slate-700"
                        value={editDescripcion}
                        onChange={(e) => setEditDescripcion(e.target.value)}
                        rows={2}
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          className="w-full rounded bg-slate-800 p-1 text-xs text-white border border-slate-700"
                          value={editFechaInicio}
                          onChange={(e) => setEditFechaInicio(e.target.value)}
                        />
                        <input
                          type="date"
                          className="w-full rounded bg-slate-800 p-1 text-xs text-white border border-slate-700"
                          value={editUltimoTesting}
                          onChange={(e) => setEditUltimoTesting(e.target.value)}
                        />
                      </div>

                      <textarea
                        className="w-full rounded bg-slate-800 p-2 text-xs text-white border border-slate-700"
                        value={editDetallesTesting}
                        onChange={(e) => setEditDetallesTesting(e.target.value)}
                        placeholder="Detalles del testing..."
                        rows={2}
                      />

                      <div className="flex gap-2 justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setProyectoEnEdicion(null)}
                          className="text-xs px-3 py-1 rounded bg-slate-800 hover:bg-slate-700"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="text-xs px-3 py-1 rounded bg-green-600 hover:bg-green-500 font-medium"
                        >
                          Guardar
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* TARJETA EN MODO LECTURA NORMAL (MUESTRA TODOS LOS DATOS) */
                    <div className="space-y-3">
                      {/* Título */}
                      <h3 className="text-lg font-bold text-blue-400">
                        {proyecto.name}
                      </h3>

                      {/* Descripción */}
                      {proyecto.description && (
                        <p className="text-sm text-slate-300">
                          {proyecto.description}
                        </p>
                      )}

                      {/* Fechas */}
                      {(proyecto.fecha_inicio || proyecto.ultimo_testing) && (
                        <div className="text-xs text-slate-400 space-y-1 border-t border-slate-800 pt-3">
                          {proyecto.fecha_inicio && (
                            <p>
                              📅{" "}
                              <span className="font-semibold text-slate-300">
                                Inicio:
                              </span>{" "}
                              {proyecto.fecha_inicio}
                            </p>
                          )}
                          {proyecto.ultimo_testing && (
                            <p>
                              🧪{" "}
                              <span className="font-semibold text-slate-300">
                                Último Testing:
                              </span>{" "}
                              {proyecto.ultimo_testing}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Resumen / Detalles del Testing */}
                      {proyecto.detalles_testing && (
                        <div className="rounded bg-slate-800/80 p-3 text-xs text-slate-300 border border-slate-700/60">
                          <span className="font-semibold text-blue-300 block mb-1">
                            Última actividad de pruebas:
                          </span>
                          <p className="whitespace-pre-line">
                            {proyecto.detalles_testing}
                          </p>
                        </div>
                      )}

                      {/* Botones de acción */}
                      <div className="flex justify-end gap-3 pt-3 border-t border-slate-800/50">
                        <button
                          onClick={() => iniciarEdicion(proyecto)}
                          className="text-xs text-yellow-400 hover:text-yellow-300 hover:underline"
                        >
                          Editar / Actualizar Testing
                        </button>
                        <button
                          onClick={() => handleEliminar(proyecto.id)}
                          className="text-xs text-red-400 hover:text-red-300 hover:underline"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </main>
  );
}