#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { Command } from "commander";
import chalk from "chalk";
import { parse, stringify } from "yaml";

import { VisualSpec } from "../types/spec.js";
import { validateSpec } from "../qa/validate-spec.js";
import { resolveSpec } from "../core/resolve-spec.js";
import { analyzeBrief } from "../core/analyze-brief.js";
import { compilePrompt } from "../adapters/prompt-compiler.js";
import { runDeterministicRender, runGenerativePipeline } from "../core/pipeline.js";
import { checkConstraints } from "../qa/constraint-checker.js";
import { validateOutputFile } from "../qa/validate-output.js";
import { planRepairs } from "../qa/repair-planner.js";
import { compositeAsset } from "../renderer/compositor.js";

const program = new Command();

program
  .name("visual")
  .description("VisualSpec — A structured visual-generation framework and execution engine for AI agents")
  .version("0.1.0");

function loadSpecFile(filePath: string): VisualSpec {
  const resolved = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolved)) {
    console.error(chalk.red(`Error: Spec file not found at '${resolved}'`));
    process.exit(1);
  }
  const content = fs.readFileSync(resolved, "utf-8");
  try {
    return parse(content) as VisualSpec;
  } catch (err: any) {
    console.error(chalk.red(`Error parsing spec YAML/JSON: ${err.message}`));
    process.exit(1);
  }
}

// 1. init
program
  .command("init")
  .description("Initialize a new VisualSpec project configuration and folders")
  .action(() => {
    const dirs = ["specs", "output", "templates", "platforms"];
    for (const d of dirs) {
      const p = path.resolve(process.cwd(), d);
      if (!fs.existsSync(p)) {
        fs.mkdirSync(p, { recursive: true });
        console.log(chalk.green(`Created directory: ./${d}`));
      }
    }
    const sampleConfig = {
      default_provider: "mock",
      output_directory: "./output",
      renderer: {
        engine: "svg-sharp",
      },
      qa: {
        enforce_constraints: true,
      },
    };
    const configPath = path.resolve(process.cwd(), "visual.config.yaml");
    if (!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, stringify(sampleConfig));
      console.log(chalk.green(`Created visual.config.yaml`));
    }
    console.log(chalk.cyan("\n✨ Project initialized successfully!"));
  });

// 2. brief
program
  .command("brief <briefFile>")
  .description("Convert a natural-language creative brief into a structured Visual Spec")
  .option("-o, --output <outputFile>", "Path to save generated spec.yaml")
  .action((briefFile, options) => {
    const resolvedPath = path.resolve(process.cwd(), briefFile);
    if (!fs.existsSync(resolvedPath)) {
      console.error(chalk.red(`Error: Brief file '${resolvedPath}' not found`));
      process.exit(1);
    }
    const briefText = fs.readFileSync(resolvedPath, "utf-8");
    const spec = analyzeBrief(briefText);
    const yamlOutput = stringify(spec);

    if (options.output) {
      const outPath = path.resolve(process.cwd(), options.output);
      const outDir = path.dirname(outPath);
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(outPath, yamlOutput);
      console.log(chalk.green(`✓ Draft Visual Spec saved to ${options.output}`));
    } else {
      console.log(chalk.cyan("\n--- Generated Visual Spec ---"));
      console.log(yamlOutput);
    }
  });

// 3. validate
program
  .command("validate <specFile>")
  .description("Validate a Visual Spec file against the JSON Schema")
  .action((specFile) => {
    const spec = loadSpecFile(specFile);
    const result = validateSpec(spec);

    if (result.valid) {
      console.log(chalk.green(`✓ Spec '${specFile}' is valid!`));
    } else {
      console.log(chalk.red(`✗ Validation failed with ${result.errors.length} error(s):`));
      for (const err of result.errors) {
        console.log(chalk.yellow(`  • ${err}`));
      }
      process.exit(1);
    }
  });

// 4. resolve
program
  .command("resolve <specFile>")
  .description("Apply platform and template rules and display the fully resolved Visual Spec")
  .option("-o, --output <outputFile>", "Save resolved spec to file")
  .action((specFile, options) => {
    const spec = loadSpecFile(specFile);
    const resolved = resolveSpec(spec);
    const yamlOutput = stringify(resolved);

    if (options.output) {
      fs.writeFileSync(path.resolve(process.cwd(), options.output), yamlOutput);
      console.log(chalk.green(`✓ Resolved spec written to ${options.output}`));
    } else {
      console.log(chalk.cyan("\n--- Resolved Visual Spec ---"));
      console.log(yamlOutput);
    }
  });

// 5. compile
program
  .command("compile <specFile>")
  .description("Compile the prompt and negative constraints for a target image generation provider")
  .option("-p, --provider <provider>", "Target provider (mock, openai, gemini)", "mock")
  .action((specFile, options) => {
    const spec = loadSpecFile(specFile);
    const resolved = resolveSpec(spec);
    const compiled = compilePrompt(resolved, options.provider);

    console.log(chalk.bold.cyan("\n=== Compiled Generation Request ==="));
    console.log(chalk.bold("Provider:"), compiled.provider);
    console.log(chalk.bold("Aspect Ratio:"), compiled.aspectRatio, `(${compiled.width}x${compiled.height})`);
    console.log(chalk.bold("\n[Prompt]:\n") + chalk.white(compiled.prompt));
    if (compiled.negativePrompt) {
      console.log(chalk.bold("\n[Negative Constraints]:\n") + chalk.yellow(compiled.negativePrompt));
    }
  });

// 6. render (deterministic only)
program
  .command("render <specFile>")
  .description("Render deterministic typography, layout, and styling (no AI provider needed)")
  .option("-o, --output <dir>", "Output directory")
  .action(async (specFile, options) => {
    const spec = loadSpecFile(specFile);
    console.log(chalk.blue(`⚙ Rendering deterministic asset from '${specFile}'...`));

    try {
      const result = await runDeterministicRender(spec, { outputDir: options.output });
      console.log(chalk.green(`\n✓ Render successful!`));
      console.log(chalk.cyan(`  Final Image: `) + chalk.white(result.bundle.finalImagePath));
      console.log(chalk.cyan(`  Output Bundle: `) + chalk.white(result.bundle.bundleDir));
      console.log(chalk.cyan(`  QA Status: `) + (result.qaReport.passed ? chalk.green("PASS") : chalk.yellow("WARNINGS")));

      for (const check of result.qaReport.checks) {
        const symbol = check.passed ? chalk.green("✓") : chalk.red("✗");
        console.log(`    ${symbol} ${check.name}: ${check.message}`);
      }
    } catch (err: any) {
      console.error(chalk.red(`\n✗ Render failed: ${err.message}`));
      process.exit(1);
    }
  });

// 7. generate (full pipeline)
program
  .command("generate <specFile>")
  .description("Run the full visual generation pipeline (model adapter + deterministic rendering + QA)")
  .option("-p, --provider <provider>", "Image provider (mock, openai, gemini)", "mock")
  .option("-o, --output <dir>", "Output directory")
  .action(async (specFile, options) => {
    const spec = loadSpecFile(specFile);
    console.log(chalk.blue(`🚀 Generating visual asset using provider '${options.provider}'...`));

    try {
      const result = await runGenerativePipeline(spec, {
        provider: options.provider,
        outputDir: options.output,
      });

      console.log(chalk.green(`\n✓ Generation pipeline complete!`));
      console.log(chalk.cyan(`  Final Image: `) + chalk.white(result.bundle.finalImagePath));
      console.log(chalk.cyan(`  Output Bundle: `) + chalk.white(result.bundle.bundleDir));
      console.log(chalk.cyan(`  QA Status: `) + (result.qaReport.passed ? chalk.green("PASS") : chalk.yellow("ACTION REQUIRED")));

      console.log(chalk.bold("\n--- QA Checks ---"));
      for (const check of result.qaReport.checks) {
        const symbol = check.passed ? chalk.green("✓") : chalk.red("✗");
        console.log(`  ${symbol} ${check.name}: ${check.message}`);
      }

      if (result.repairPlan && !result.qaReport.passed) {
        console.log(chalk.bold.yellow("\n--- Recommended Repair Plan ---"));
        console.log(chalk.yellow(result.repairPlan.summary));
        for (const act of result.repairPlan.actions) {
          console.log(`  • [${act.type}] ${act.reason}`);
        }
      }
    } catch (err: any) {
      console.error(chalk.red(`\n✗ Generation failed: ${err.message}`));
      process.exit(1);
    }
  });

// 8. check (QA)
program
  .command("check <imageFile>")
  .description("Run visual QA checks against an existing image and spec")
  .requiredOption("-s, --spec <specFile>", "Path to visual spec file")
  .action(async (imageFile, options) => {
    const spec = loadSpecFile(options.spec);
    const resolved = resolveSpec(spec);
    const imgPath = path.resolve(process.cwd(), imageFile);

    console.log(chalk.blue(`🔍 Inspecting '${imageFile}' against spec '${options.spec}'...`));

    const constraintQA = checkConstraints(resolved);
    const fileQA = await validateOutputFile(imgPath, resolved);
    const allChecks = [...constraintQA.checks, ...fileQA];
    const failed = allChecks.filter(c => !c.passed);

    console.log(chalk.bold("\n--- QA Verification Results ---"));
    for (const check of allChecks) {
      const symbol = check.passed ? chalk.green("✓") : chalk.red("✗");
      console.log(`  ${symbol} ${check.name}: ${check.message}`);
    }

    if (failed.length === 0) {
      console.log(chalk.green(`\n✓ All ${allChecks.length} QA checks PASSED!`));
    } else {
      console.log(chalk.yellow(`\n⚠ ${failed.length} check(s) FAILED.`));
      const plan = planRepairs({ ...constraintQA, checks: allChecks }, resolved);
      console.log(chalk.bold.yellow("\n--- Actionable Repair Plan ---"));
      console.log(plan.summary);
      for (const act of plan.actions) {
        console.log(`  • [${act.type}] ${act.reason}`);
      }
      process.exit(1);
    }
  });

// 9. repair
program
  .command("repair <imageFile>")
  .description("Formulate and apply a targeted repair plan for a failing visual asset")
  .requiredOption("-s, --spec <specFile>", "Path to visual spec file")
  .option("-o, --output <dir>", "Output directory for repaired asset")
  .action(async (imageFile, options) => {
    const spec = loadSpecFile(options.spec);
    const resolved = resolveSpec(spec);
    const imgPath = path.resolve(process.cwd(), imageFile);

    console.log(chalk.blue(`🛠 Diagnosing asset failure for '${imageFile}'...`));

    const constraintQA = checkConstraints(resolved);
    const fileQA = await validateOutputFile(imgPath, resolved);
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

    console.log(chalk.bold("\n--- Repair Plan ---"));
    console.log(chalk.cyan(repairPlan.summary));

    if (repairPlan.actions.length === 0) {
      console.log(chalk.green("No repairs needed!"));
      return;
    }

    for (const act of repairPlan.actions) {
      console.log(chalk.yellow(`  • Action [${act.type}]: `) + act.reason);
    }

    // Apply repair patches to spec
    console.log(chalk.blue("\nApplying repair patches..."));
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

    // Re-render
    const outDir = options.output || path.resolve(process.cwd(), "output", "repaired");
    const result = await runDeterministicRender(patchedSpec, { outputDir: outDir });
    console.log(chalk.green(`\n✓ Asset repaired successfully!`));
    console.log(chalk.cyan(`  Repaired Image: `) + chalk.white(result.bundle.finalImagePath));
    console.log(chalk.cyan(`  QA Status: `) + (result.qaReport.passed ? chalk.green("PASS") : chalk.yellow("WARNINGS")));
  });

// 10. mcp
program
  .command("mcp")
  .description("Launch the VisualSpec Model Context Protocol (MCP) server for AI coding agents over stdio")
  .action(async () => {
    const { runMcpServer } = await import("../mcp/index.js");
    await runMcpServer();
  });

program.parse(process.argv);
