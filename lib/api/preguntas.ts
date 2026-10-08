import { apiRequest } from "./client";

export type Pregunta = {
  id: number;
  texto: string;
};

type CrearPreguntaResponse = {
  MENSAJE: string;
  pregunta: Pregunta;
};

export function obtenerPreguntas(): Promise<Pregunta[]> {
  return apiRequest<Pregunta[]>("/api/preguntas");
}

export async function crearPregunta(texto: string): Promise<Pregunta> {
  const response = await apiRequest<CrearPreguntaResponse>("/api/preguntas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ texto }),
  });

  return response.pregunta;
}
