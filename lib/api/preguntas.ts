// lib/api/preguntas.ts
export interface Pregunta {
  id: string;
  pregunta: string;
  respuesta?: string;
  estado: "Pendiente" | "Respondida";
  fecha: string; // Formato YYYY-MM-DD
  respondido_por?: string;
}

const STORAGE_KEY = "qa_saas_preguntas";

export function obtenerPreguntas(): Pregunta[] {
  if (typeof window === "undefined") return [];
  const guardadas = localStorage.getItem(STORAGE_KEY);
  return guardadas ? JSON.parse(guardadas) : [];
}

export function guardarNuevaPregunta(textoPregunta: string, fechaPersonalizada?: string): Pregunta[] {
  const actuales = obtenerPreguntas();
  
  // Usamos la fecha indicada o, por defecto, el día actual en formato YYYY-MM-DD
  const fechaFinal = fechaPersonalizada || new Date().toISOString().split("T")[0];

  const nueva: Pregunta = {
    id: Date.now().toString(),
    pregunta: textoPregunta,
    estado: "Pendiente",
    fecha: fechaFinal,
  };

  const actualizadas = [nueva, ...actuales];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizadas));
  }
  return actualizadas;
}