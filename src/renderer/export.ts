import fs from "node:fs";
import path from "node:path";
import { stringify } from "yaml";
import { VisualSpec, ResolvedVisualSpec } from "../types/spec.js";
import { CompiledGenerationRequest } from "../types/adapter.js";
import { QAReport } from "../types/qa.js";

export interface ExportBundleParams {
  outputDir: string;
  imageBuffer: Buffer;
  spec: VisualSpec;
  resolvedSpec: ResolvedVisualSpec;
  generationRequest?: CompiledGenerationRequest | null;
  qaReport?: QAReport | null;
  extraMetadata?: Record<string, unknown>;
}

export interface ExportBundleResult {
  finalImagePath: string;
  bundleDir: string;
  files: string[];
}

export function exportBundle(params: ExportBundleParams): ExportBundleResult {
  const {
    outputDir,
    imageBuffer,
    spec,
    resolvedSpec,
    generationRequest,
    qaReport,
    extraMetadata = {},
  } = params;

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const format = resolvedSpec.output?.format || "png";
  const imageFileName = `final.${format}`;
  const finalImagePath = path.join(outputDir, imageFileName);
  fs.writeFileSync(finalImagePath, imageBuffer);

  const files: string[] = [imageFileName];

  // 1. visual-spec.yaml
  const specPath = path.join(outputDir, "visual-spec.yaml");
  fs.writeFileSync(specPath, stringify(spec));
  files.push("visual-spec.yaml");

  // 2. resolved-spec.yaml
  const resolvedPath = path.join(outputDir, "resolved-spec.yaml");
  fs.writeFileSync(resolvedPath, stringify(resolvedSpec));
  files.push("resolved-spec.yaml");

  // 3. generation-request.json (if any)
  if (generationRequest) {
    const reqPath = path.join(outputDir, "generation-request.json");
    fs.writeFileSync(reqPath, JSON.stringify(generationRequest, null, 2));
    files.push("generation-request.json");
  }

  // 4. qa-report.json (if any)
  if (qaReport) {
    const qaPath = path.join(outputDir, "qa-report.json");
    fs.writeFileSync(qaPath, JSON.stringify(qaReport, null, 2));
    files.push("qa-report.json");
  }

  // 5. metadata.json
  const metadata = {
    framework: "visualspec",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
    canvas: resolvedSpec.canvas,
    platform: resolvedSpec.asset.platform,
    template: resolvedSpec.asset.template,
    files,
    ...extraMetadata,
  };
  const metaPath = path.join(outputDir, "metadata.json");
  fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));
  files.push("metadata.json");

  return {
    finalImagePath,
    bundleDir: outputDir,
    files,
  };
}
