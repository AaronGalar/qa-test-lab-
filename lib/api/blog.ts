// lib/api/blog.ts
export interface Publicacion {
  id: string;
  titulo: string;
  contenido: string;
  tipo: "Release Notes" | "Artículo Blog" | "Newsletter";
  fecha: string;
  version?: string;
  autor: string;
}

const STORAGE_KEY = "qa_saas_blog_posts";

const POSTS_INICIALES: Publicacion[] = [
  {
    id: "1",
    titulo: "Lanzamiento del Centro de Conocimiento & Guías STLC v1.2",
    contenido: "Hemos desplegado la nueva sección de Fuentes y Tutoriales QA con guías metodológicas.",
    tipo: "Release Notes",
    version: "v1.2.0",
    fecha: "2026-10-26",
    autor: "Admin QA",
  },
];

export function obtenerPublicaciones(): Publicacion[] {
  if (typeof window === "undefined") return POSTS_INICIALES;
  const guardados = localStorage.getItem(STORAGE_KEY);
  if (!guardados) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(POSTS_INICIALES));
    return POSTS_INICIALES;
  }
  try {
    return JSON.parse(guardados);
  } catch (e) {
    return POSTS_INICIALES;
  }
}

export function guardarPublicacion(nueva: Omit<Publicacion, "id">) {
  // Obtenemos los posts existentes correctamente
  const actuales = obtenerPublicaciones();
  
  const item: Publicacion = {
    ...nueva,
    id: Date.now().toString(),
  };

  const actualizados = [item, ...actuales];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados));
  }
  return actualizados;
}