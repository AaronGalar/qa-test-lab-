// lib/api/preguntas.ts
export interface Pregunta {
  id: number;
  texto: string;
  respuesta?: string;
  estado: "Pendiente" | "Respondida";
  fecha?: string;
  creado_por?: string;
  respondido_por?: string;
}

const API_URL = "http://localhost:8000/api";

export async function obtenerPreguntas(): Promise<Pregunta[]> {
  if (typeof window === "undefined") return [];
  
  const token = localStorage.getItem("token") || localStorage.getItem("access_token");

  try {
    const res = await fetch(`${API_URL}/preguntas`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Error al obtener preguntas del servidor:", error);
    return [];
  }
}

export async function guardarNuevaPregunta(textoPregunta: string): Promise<any> {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("token") || localStorage.getItem("access_token");

  try {
    const res = await fetch(`${API_URL}/preguntas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ texto: textoPregunta }),
    });

    if (!res.ok) throw new Error("Error al enviar la pregunta al servidor");
    return await res.json();
  } catch (error) {
    console.error("Error al guardar la nueva pregunta:", error);
    throw error;
  }
}