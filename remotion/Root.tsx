// src/Root.tsx
import React from "react";
import { Composition } from "remotion";
import tutorialMetadata from "../public/test-data/TUTORIAL-IA.json";
import { AIDemoVideo } from "./AIDemoVideo";
import { RecordedFirstUseTutorial } from "./RecordedFirstUseTutorial";
import { QATutorial } from "./QATutorial";

const tutorialDurationInFrames = Math.ceil(
  ((tutorialMetadata.durationMs + 1200) / 1000) * 30,
);
const tutorialStatus = (value: string): "PASSED" | "FAILED" => {
  if (value !== "PASSED" && value !== "FAILED") {
    throw new Error(`Estado de tutorial no válido: ${value}`);
  }

  return value;
};
const tutorialSteps = tutorialMetadata.steps.map((step) => ({
  ...step,
  status: tutorialStatus(step.status),
}));

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="QATutorial"
        component={QATutorial}
        durationInFrames={900} // 30 segundos a 30fps
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AIDemoVideo"
        component={AIDemoVideo}
        durationInFrames={720}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FirstUseTutorial"
        component={RecordedFirstUseTutorial}
        durationInFrames={tutorialDurationInFrames}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          testId: tutorialMetadata.id,
          title: tutorialMetadata.title,
          status: tutorialStatus(tutorialMetadata.status),
          durationMs: tutorialMetadata.durationMs,
          steps: tutorialSteps,
          videoSrc: "recordings/tutorial-ia.webm",
        }}
      />
    </>
  );
};
