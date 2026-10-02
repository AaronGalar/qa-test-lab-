import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { TestInfo } from "@playwright/test";

export type QaStatus = "PASSED" | "FAILED";

export type QaStep = {
  name: string;
  status: QaStatus;
  startMs: number;
  endMs: number;
};

export type QaMetadata = {
  id: string;
  title: string;
  status: QaStatus;
  startedAt: number;
  durationMs: number;
  steps: QaStep[];
  createdCase?: {
    id: string;
    title: string;
    description: string;
    priority: "Low" | "Medium" | "High";
    status: "PENDING";
  };
};

const PRESENTATION_PAUSE_MS = 900;

export function createQaMetricRecorder(
  testInfo: TestInfo,
  initialData: {
    id: string;
    title: string;
    createdCase?: QaMetadata["createdCase"];
  },
) {
  const steps: QaStep[] = [];
  const startedAt = Date.now();

  const toRelativeMs = () => Date.now() - startedAt;

  async function recordStep<T>(
    name: string,
    action: () => Promise<T>,
  ): Promise<T> {
    const startMs = toRelativeMs();

    try {
      const result = await action();
      await new Promise((resolve) =>
        setTimeout(resolve, PRESENTATION_PAUSE_MS),
      );
      const endMs = toRelativeMs();

      steps.push({
        name,
        status: "PASSED",
        startMs,
        endMs,
      });

      return result;
    } catch (error) {
      const endMs = toRelativeMs();

      steps.push({
        name,
        status: "FAILED",
        startMs,
        endMs,
      });

      throw error;
    }
  }

  function finalize(status: QaStatus = "PASSED"): QaMetadata {
    const durationMs = toRelativeMs();

    const metadata: QaMetadata = {
      id: initialData.id,
      title: initialData.title,
      status,
      startedAt,
      durationMs,
      steps,
      ...(initialData.createdCase
        ? { createdCase: initialData.createdCase }
        : {}),
    };

    const outputDir = path.resolve(testInfo.outputDir);
    mkdirSync(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, "test-data.json");
    const publicPath = path.resolve(
      process.cwd(),
      "public",
      "test-data",
      `${initialData.id}.json`,
    );

    mkdirSync(path.dirname(publicPath), { recursive: true });

    writeFileSync(outputPath, JSON.stringify(metadata, null, 2), "utf8");
    writeFileSync(publicPath, JSON.stringify(metadata, null, 2), "utf8");

    return metadata;
  }

  return {
    recordStep,
    finalize,
  };
}
