import { apiRequest } from "./client";

export interface Pregunta {
  id: number;
  texto: string;
  creado_por?: string;
  respuesta?: string;
  respondido_por?: string;
  estado?: string;
}

// 1. Obtener las preguntas enviando siempre el Token del usuario logueado
export async function obtenerPreguntas(): Promise<Pregunta[]> {
  const token = localStorage.getItem("token") || "";
  
  const res = await fetch("http://localhost:8000/api/preguntas", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error("No se pudieron cargar las preguntas");
  }

  return res.json();
}

// 2. Crear la pregunta enviando también el Token para que se guarde tu email
export async function crearPregunta(texto: string): Promise<any> {
  const token = localStorage.getItem("token") || "";

  const res = await fetch("http://localhost:8000/api/preguntas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ texto })
  });

  if (!res.ok) {
    throw new Error("No se pudo enviar la pregunta");
  }

  return res.json();
}

// 3. Obtener las pendientes para el Admin
export async function obtenerPreguntasPendientes(): Promise<Pregunta[]> {
  const token = localStorage.getItem("token") || "";

  const res = await fetch("http://localhost:8000/api/admin/preguntas-pendientes", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error("Error al cargar las preguntas pendientes");
  }

  return res.json();
}