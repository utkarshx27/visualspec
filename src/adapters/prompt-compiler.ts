import { ResolvedVisualSpec } from "../types/spec.js";
import { CompiledGenerationRequest } from "../types/adapter.js";

export function compilePrompt(spec: ResolvedVisualSpec, provider: string = "mock"): CompiledGenerationRequest {
  const { canvas, subject, background, composition, constraints, intent } = spec;

  const promptParts: string[] = [];

  // 1. Core objective & mood
  const moodDesc = intent?.mood && intent.mood.length > 0 ? intent.mood.join(", ") : "modern, premium, clean";
  promptParts.push(`Create a high-end, ${moodDesc} visual scene.`);

  // 2. Main subject
  if (subject?.description) {
    let subjectLine = `Main subject: ${subject.description}`;
    if (subject.placement) {
      subjectLine += `, positioned in the ${subject.placement.replace("_", " ")}`;
    }
    if (subject.details) {
      subjectLine += `. Details: ${subject.details}`;
    }
    promptParts.push(subjectLine);
  }

  // 3. Background & environment
  if (background?.description) {
    let bgLine = `Background: ${background.description}`;
    if (background.texture) {
      bgLine += ` with ${background.texture.replace("_", " ")}`;
    }
    promptParts.push(bgLine);
  }

  // 4. Composition & Negative Space (CRITICAL for deterministic layer overlay)
  const compParts: string[] = [];
  if (composition?.negative_space?.target) {
    compParts.push(
      `Reserve the ${composition.negative_space.target.replace("_", " ")} as clean negative space with low visual noise to accommodate text overlays.`
    );
  } else {
    compParts.push(`Maintain balanced negative space in the upper portion for overlay graphics.`);
  }

  if (subject?.prominence) {
    compParts.push(
      `Keep the subject prominence around ${Math.round(subject.prominence * 100)}% of the composition.`
    );
  }
  promptParts.push(`Composition: ${compParts.join(" ")}`);

  // 5. Negative constraints (Forbidden items)
  const forbidList = new Set<string>([
    "extra_text",
    "text",
    "typography",
    "words",
    "letters",
    "watermark",
    "labels",
    "fake UI text",
    ...(constraints?.forbid || []),
  ]);

  const forbidString = Array.from(forbidList).join(", ");
  promptParts.push(
    `Crucial rule: Absolutely DO NOT include any of the following: ${forbidString}. Leave all text and typography for external deterministic rendering.`
  );

  const fullPrompt = promptParts.join("\n\n");
  const negativePrompt = Array.from(forbidList).join(", ");

  return {
    provider,
    prompt: fullPrompt,
    negativePrompt,
    aspectRatio: canvas.aspect_ratio || `${canvas.width}:${canvas.height}`,
    width: canvas.width,
    height: canvas.height,
  };
}
