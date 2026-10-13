import { apiRequest } from "./client";

// 1. Agregamos las nuevas propiedades a la respuesta completa del Proyecto
export type Proyecto = {
  id: number;
  name: string;
  description: string;
  fecha_inicio?: string;
  ultimo_testing?: string;
  detalles_testing?: string;
};

// 2. Este ya lo tenías bien para la creación
export type ProyectoCreate = {
  name: string;
  description: string;
  fecha_inicio?: string;
  ultimo_testing?: string;
  detalles_testing?: string;
};

// 3. Añadimos los campos a la actualización (PATCH)
export type ProyectoUpdate = {
  name?: string;
  description?: string;
  fecha_inicio?: string;
  ultimo_testing?: string;
  detalles_testing?: string;
};

export function obtenerProyectos(): Promise<Proyecto[]> {
  return apiRequest<Proyecto[]>("/api/proyectos");
}

export function crearProyecto(data: ProyectoCreate): Promise<Proyecto> {
  return apiRequest<Proyecto>("/api/proyectos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export function actualizarProyecto(
  id: number,
  data: ProyectoUpdate,
): Promise<Proyecto> {
  return apiRequest<Proyecto>(`/api/proyectos/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export function eliminarProyecto(id: number): Promise<{ id: number }> {
  return apiRequest<{ id: number }>(`/api/proyectos/${id}`, {
    method: "DELETE",
  });
}