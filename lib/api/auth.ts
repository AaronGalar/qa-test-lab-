// lib/api/auth.ts
import { apiRequest } from "./client";

export type LoginResponse = {
  access_token: string;
  token_type: string;
  es_admin: boolean;
};

export async function loginUsuario(email: string, password: string): Promise<LoginResponse> {
  const res = await apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // Guardamos el token y el rol en localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem("token", res.access_token);
    localStorage.setItem("es_admin", String(res.es_admin));
  }

  return res;
}

export function logoutUsuario() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("es_admin");
  }
}