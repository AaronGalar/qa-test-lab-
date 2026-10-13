
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"
).replace(/\/+$/, "");

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${normalizedPath}`;

  console.log("[API] URL:", url);

  let response: Response;

  try {
    response = await fetch(url, init);
  } catch (error) {
    console.error("[API] No se pudo conectar con el backend:", error);
    throw new Error(
      `No se pudo conectar con la API en ${API_BASE_URL}. Comprueba que el backend esté activo y que la URL sea correcta.`,
    );
  }

  if (!response.ok) {
    const statusText = response.statusText
      ? ` ${response.statusText}`
      : "";

    throw new Error(
      `El backend respondió con HTTP ${response.status}${statusText}.`,
    );
  }

  return (await response.json()) as T;
}
