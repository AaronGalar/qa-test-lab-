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

export function obtenerPublicaciones(): Publicacion[] {
  if (typeof window === "undefined") return [];
  const guardadas = localStorage.getItem(STORAGE_KEY);
  return guardadas ? JSON.parse(guardadas) : [];
}

export function guardarPublicacion(postData: Omit<Publicacion, "id">): Publicacion[] {
  const actuales = obtenerPublicaciones();
  const nueva: Publicacion = {
    ...postData,
    id: Date.now().toString(),
  };
  const actualizadas = [nueva, ...actuales];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizadas));
  }
  return actualizadas;
}

export function actualizarPublicacion(id: string, postData: Partial<Publicacion>): Publicacion[] {
  const actuales = obtenerPublicaciones();
  const actualizadas = actuales.map((post) =>
    post.id === id ? { ...post, ...postData } : post
  );
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizadas));
  }
  return actualizadas;
}

export function eliminarPublicacion(id: string): Publicacion[] {
  const actuales = obtenerPublicaciones();
  const actualizadas = actuales.filter((post) => post.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizadas));
  }
  return actualizadas;
}