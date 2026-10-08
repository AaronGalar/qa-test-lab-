import { apiRequest } from "./client";

export type Tarea = {
  id: number;
  texto: string;
  completada: boolean;
};

export function obtenerTareas(): Promise<Tarea[]> {
  return apiRequest<Tarea[]>("/api/tareas");
}

export function crearTarea(texto: string): Promise<Tarea> {
  return apiRequest<Tarea>("/api/tareas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ texto }),
  });
}

export function alternarCompletada(
  id: number,
  completada: boolean,
): Promise<Tarea> {
  return apiRequest<Tarea>(`/api/tareas/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ completada }),
  });
}

export function eliminarTarea(id: number): Promise<{ id: number }> {
  return apiRequest<{ id: number }>(`/api/tareas/${id}`, {
    method: "DELETE",
  });
}