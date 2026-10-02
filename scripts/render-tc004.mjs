import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const testId = process.argv[2] || "TC-004";
const testJsonPath = path.join(
  projectRoot,
  "public",
  "test-data",
  `${testId}.json`,
);

if (!existsSync(testJsonPath)) {
  throw new Error(`No se encontró el JSON del test: ${testJsonPath}`);
}

const testData = JSON.parse(readFileSync(testJsonPath, "utf8"));
process.env.QA_TEST_ID = testData.id;
const outputDir = path.join(projectRoot, "output");
mkdirSync(outputDir, { recursive: true });

const outputFile = path.join(outputDir, `${testData.id}.mp4`);
const command = `npx remotion render remotion/index.ts QARecording "${outputFile}" --overwrite --codec=h264 --crf=18`;

console.log(`Generando video QA para ${testData.id}...`);
console.log(`Salida: ${outputFile}`);
execSync(command, {
  stdio: "inherit",
  cwd: projectRoot,
});

console.log(`Video generado correctamente: ${outputFile}`);
