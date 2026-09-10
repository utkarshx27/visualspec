import path from "node:path";
import { VisualSpec, ResolvedVisualSpec } from "../types/spec.js";
import { resolveSpec } from "./resolve-spec.js";
import { compositeAsset } from "../renderer/compositor.js";
import { exportBundle, ExportBundleResult } from "../renderer/export.js";
import { getAdapter } from "../adapters/index.js";
import { checkConstraints } from "../qa/constraint-checker.js";
import { validateOutputFile } from "../qa/validate-output.js";
import { planRepairs } from "../qa/repair-planner.js";
import { QAReport, RepairPlan } from "../types/qa.js";
import { CompiledGenerationRequest } from "../types/adapter.js";

export interface PipelineOptions {
  provider?: string;
  outputDir?: string;
  skipQA?: boolean;
}

export interface PipelineResult {
  spec: VisualSpec;
  resolvedSpec: ResolvedVisualSpec;
  generationRequest: CompiledGenerationRequest | null;
  qaReport: QAReport;
  repairPlan: RepairPlan | null;
  bundle: ExportBundleResult;
}

export async function runDeterministicRender(
  spec: VisualSpec,
  options: PipelineOptions = {}
): Promise<PipelineResult> {
  const resolvedSpec = resolveSpec(spec);
  const outputDir = options.outputDir || path.resolve(process.cwd(), "output", resolvedSpec.asset.id || "render");

  // 1. Initial constraint QA
  const qaReport = checkConstraints(resolvedSpec);
  const repairPlan = !qaReport.passed ? planRepairs(qaReport, resolvedSpec) : null;

  // 2. Pure deterministic composite (SVG with sleek background)
  const imageBuffer = await compositeAsset(resolvedSpec);

  // 3. Export bundle
  const bundle = exportBundle({
    outputDir,
    imageBuffer,
    spec,
    resolvedSpec,
    generationRequest: null,
    qaReport,
    extraMetadata: { mode: "deterministic_only" },
  });

  // 4. Validate output file
  const fileChecks = await validateOutputFile(bundle.finalImagePath, resolvedSpec);
  qaReport.checks.push(...fileChecks);
  qaReport.totalChecks = qaReport.checks.length;
  qaReport.passedChecks = qaReport.checks.filter(c => c.passed).length;
  qaReport.failedChecks = qaReport.checks.filter(c => !c.passed).length;
  qaReport.passed = qaReport.failedChecks === 0;

  return {
    spec,
    resolvedSpec,
    generationRequest: null,
    qaReport,
    repairPlan,
    bundle,
  };
}

export async function runGenerativePipeline(
  spec: VisualSpec,
  options: PipelineOptions = {}
): Promise<PipelineResult> {
  const resolvedSpec = resolveSpec(spec);
  const outputDir = options.outputDir || path.resolve(process.cwd(), "output", resolvedSpec.asset.id || "generated");
  const providerName = options.provider || "mock";
  const adapter = getAdapter(providerName);

  // 1. Compile prompt
  const generationRequest = adapter.compile(resolvedSpec);

  // 2. Generate generative base layers
  const layers = await adapter.generate(generationRequest);
  const baseLayer = layers[0];
  if (!baseLayer) {
    throw new Error(`Adapter '${providerName}' failed to return an image layer.`);
  }

  // 3. Composite deterministic text & layout overlay onto base layer
  const imageBuffer = await compositeAsset(resolvedSpec, {
    baseImageBuffer: baseLayer.buffer,
  });

  // 4. Initial Constraint QA
  const qaReport = checkConstraints(resolvedSpec);

  // 5. Export bundle
  const bundle = exportBundle({
    outputDir,
    imageBuffer,
    spec,
    resolvedSpec,
    generationRequest,
    qaReport,
    extraMetadata: {
      mode: "generative_pipeline",
      provider: providerName,
    },
  });

  // 6. Validate exported image file
  const fileChecks = await validateOutputFile(bundle.finalImagePath, resolvedSpec);
  qaReport.checks.push(...fileChecks);
  qaReport.totalChecks = qaReport.checks.length;
  qaReport.passedChecks = qaReport.checks.filter(c => c.passed).length;
  qaReport.failedChecks = qaReport.checks.filter(c => !c.passed).length;
  qaReport.passed = qaReport.failedChecks === 0;

  // 7. Repair plan if failed
  const repairPlan = !qaReport.passed ? planRepairs(qaReport, resolvedSpec) : null;

  return {
    spec,
    resolvedSpec,
    generationRequest,
    qaReport,
    repairPlan,
    bundle,
  };
}
