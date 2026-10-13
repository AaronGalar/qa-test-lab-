import { apiRequest } from "./client";

export type ScenarioCategory = "login" | "form" | "crud";

export type TestCaseSuggestion = {
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High";
};

export function generarSugerencias(
  category: ScenarioCategory,
  featureName: string,
): Promise<TestCaseSuggestion[]> {
  return apiRequest<TestCaseSuggestion[]>("/api/test-case-suggestions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      category,
      feature_name: featureName,
    }),
  });
}
