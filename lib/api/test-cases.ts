import { apiRequest } from "./client";

export type TestCase = {
  id: string;
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
  status: "PASS" | "FAIL" | "PENDING";
};

export type CreateTestCaseInput = Omit<TestCase, "id">;

export function obtenerTestCases(): Promise<TestCase[]> {
  return apiRequest<TestCase[]>("/api/test-cases");
}

export function crearTestCase(data: CreateTestCaseInput): Promise<TestCase> {
  return apiRequest<TestCase>("/api/test-cases", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export function actualizarEstadoTestCase(
  id: string,
  status: TestCase["status"],
): Promise<TestCase> {
  return apiRequest<TestCase>(
    `/api/test-cases/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    },
  );
}

export function eliminarTestCase(id: string): Promise<{ id: string }> {
  return apiRequest<{ id: string }>(
    `/api/test-cases/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
}