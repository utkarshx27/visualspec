import fs from "node:fs";
import path from "node:path";
import { parse, stringify } from "yaml";

import { VisualSpec } from "../types/spec.js";
import { analyzeBrief } from "../core/analyze-brief.js";
import { resolveSpec } from "../core/resolve-spec.js";
import { validateSpec } from "../qa/validate-spec.js";
import { checkConstraints } from "../qa/constraint-checker.js";
import { validateOutputFile } from "../qa/validate-output.js";
import { planRepairs } from "../qa/repair-planner.js";
import { runDeterministicRender, runGenerativePipeline } from "../core/pipeline.js";
import { loadPlatform, getBuiltinPlatformsDir } from "../core/load-platform.js";
import { loadTemplate, getBuiltinTemplatesDir } from "../core/load-template.js";

export function parseSpecInput(input: string | Record<string, unknown>): VisualSpec {
  if (typeof input === "object" && input !== null) {
    return input as unknown as VisualSpec;
  }
  if (typeof input === "string") {
    const trimmed = input.trim();
    // Check if it's a file path
    if (fs.existsSync(trimmed)) {
      const content = fs.readFileSync(trimmed, "utf-8");
      return parse(content) as VisualSpec;
    }
    return parse(trimmed) as VisualSpec;
  }
  throw new Error("Invalid spec input: must be a YAML/JSON string, file path, or object.");
}

export async function handleBriefToSpec(params: {
  brief: string;
  platform?: string;
  template?: string;
}) {
  const spec = analyzeBrief(params.brief);
  if (params.platform) {
    spec.asset.platform = params.platform;
  }
  if (params.template) {
    spec.asset.template = params.template;
  }

  const yamlString = stringify(spec);
  return {
    spec,
    yaml: yamlString,
    summary: `Generated VisualSpec for ${spec.asset.platform} (${spec.asset.type}) with headline: "${spec.text?.headline?.content || ""}"`,
  };
}

export async function handleValidateSpec(params: {
  spec: string | Record<string, unknown>;
}) {
  const spec = parseSpecInput(params.spec);
  const result = validateSpec(spec);

  return {
    valid: result.valid,
    errors: result.errors,
    summary: result.valid
      ? "VisualSpec is valid according to schema."
      : `VisualSpec failed validation with ${result.errors.length} error(s).`,
  };
}

export async function handleRender(params: {
  spec: string | Record<string, unknown>;
  outputDir?: string;
}) {
  const spec = parseSpecInput(params.spec);
  const result = await runDeterministicRender(spec, {
    outputDir: params.outputDir,
  });

  return {
    success: true,
    imagePath: result.bundle.finalImagePath,
    outputBundleDir: result.bundle.bundleDir,
    qaPassed: result.qaReport.passed,
    qaReport: result.qaReport,
    summary: `Deterministic render complete. Image: ${result.bundle.finalImagePath}. QA: ${result.qaReport.passed ? "PASS" : "WARNINGS"}`,
  };
}

export async function handleGenerate(params: {
  spec: string | Record<string, unknown>;
  provider?: "mock" | "openai" | "gemini" | string;
  outputDir?: string;
}) {
  const spec = parseSpecInput(params.spec);
  const provider = params.provider || "mock";
  const result = await runGenerativePipeline(spec, {
    provider,
    outputDir: params.outputDir,
  });

  return {
    success: true,
    imagePath: result.bundle.finalImagePath,
    outputBundleDir: result.bundle.bundleDir,
    provider,
    qaPassed: result.qaReport.passed,
    qaReport: result.qaReport,
    repairPlan: result.repairPlan,
    summary: `Generative pipeline complete (${provider}). Image: ${result.bundle.finalImagePath}. QA: ${result.qaReport.passed ? "PASS" : "ACTION REQUIRED"}`,
  };
}

export async function handleCheckQA(params: {
  spec: string | Record<string, unknown>;
  imagePath?: string;
}) {
  const spec = parseSpecInput(params.spec);
  const resolved = resolveSpec(spec);
  const constraintQA = checkConstraints(resolved);

  let fileQA: any[] = [];
  if (params.imagePath && fs.existsSync(params.imagePath)) {
    fileQA = await validateOutputFile(params.imagePath, resolved);
  }

  const allChecks = [...constraintQA.checks, ...fileQA];
  const passed = allChecks.every(c => c.passed);
  const failed = allChecks.filter(c => !c.passed);

  return {
    passed,
    totalChecks: allChecks.length,
    passedChecks: allChecks.length - failed.length,
    failedChecks: failed.length,
    checks: allChecks,
    summary: passed
      ? `All ${allChecks.length} QA checks passed.`
      : `${failed.length} of ${allChecks.length} QA checks failed.`,
  };
}

export async function handleRepair(params: {
  spec: string | Record<string, unknown>;
  imagePath?: string;
  outputDir?: string;
}) {
  const spec = parseSpecInput(params.spec);
  const resolved = resolveSpec(spec);

  const constraintQA = checkConstraints(resolved);
  let fileQA: any[] = [];
  if (params.imagePath && fs.existsSync(params.imagePath)) {
    fileQA = await validateOutputFile(params.imagePath, resolved);
  }

  const allChecks = [...constraintQA.checks, ...fileQA];
  const qaReport = {
    passed: allChecks.every(c => c.passed),
    totalChecks: allChecks.length,
    passedChecks: allChecks.filter(c => c.passed).length,
    failedChecks: allChecks.filter(c => !c.passed).length,
    checks: allChecks,
    timestamp: new Date().toISOString(),
  };

  const repairPlan = planRepairs(qaReport, resolved);

  if (repairPlan.actions.length === 0) {
    return {
      repaired: false,
      summary: "Asset already passes QA. No repairs required.",
      plan: repairPlan,
    };
  }

  // Apply patches to spec
  const patchedSpec = JSON.parse(JSON.stringify(spec));
  for (const act of repairPlan.actions) {
    if (act.suggestedPatch) {
      for (const [keyPath, val] of Object.entries(act.suggestedPatch)) {
        const parts = keyPath.split(".");
        let curr = patchedSpec;
        for (let i = 0; i < parts.length - 1; i++) {
          if (!curr[parts[i]]) curr[parts[i]] = {};
          curr = curr[parts[i]];
        }
        curr[parts[parts.length - 1]] = val;
      }
    }
  }

  // Rerender with patch
  const renderResult = await runDeterministicRender(patchedSpec, {
    outputDir: params.outputDir,
  });

  return {
    repaired: true,
    plan: repairPlan,
    patchedSpec,
    repairedImagePath: renderResult.bundle.finalImagePath,
    qaPassed: renderResult.qaReport.passed,
    summary: `Applied ${repairPlan.actions.length} repair action(s). Repaired asset saved to ${renderResult.bundle.finalImagePath}. New QA status: ${renderResult.qaReport.passed ? "PASS" : "WARNINGS"}`,
  };
}

export async function handleListResources() {
  const platformsDir = getBuiltinPlatformsDir();
  const templatesDir = getBuiltinTemplatesDir();

  const platforms: Record<string, any> = {};
  if (fs.existsSync(platformsDir)) {
    for (const f of fs.readdirSync(platformsDir)) {
      if (f.endsWith(".yaml")) {
        const name = f.replace(".yaml", "");
        try {
          platforms[name] = loadPlatform(name);
        } catch {}
      }
    }
  }

  const templates: Record<string, any> = {};
  if (fs.existsSync(templatesDir)) {
    for (const f of fs.readdirSync(templatesDir)) {
      if (f.endsWith(".yaml")) {
        const name = f.replace(".yaml", "");
        try {
          templates[name] = loadTemplate(name);
        } catch {}
      }
    }
  }

  return {
    platforms: Object.keys(platforms).map(p => ({
      platform: p,
      displayName: platforms[p].displayName,
      formats: Object.keys(platforms[p].formats || {}),
    })),
    templates: Object.keys(templates).map(t => ({
      id: t,
      name: templates[t].name,
      description: templates[t].description,
      slots: templates[t].slots,
    })),
  };
}
