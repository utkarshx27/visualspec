import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  handleBriefToSpec,
  handleValidateSpec,
  handleRender,
  handleGenerate,
  handleCheckQA,
  handleRepair,
  handleListResources,
} from "../../src/mcp/handlers.js";
import { createVisualSpecServer } from "../../src/mcp/server.js";

describe("MCP Server & Tool Handlers", () => {
  it("initializes McpServer instance successfully", () => {
    const server = createVisualSpecServer();
    expect(server).toBeDefined();
  });

  it("handles visual_brief_to_spec properly", async () => {
    const brief = "Create an Instagram launch post for a developer tool. Headline: 'AI Pairing Just Leveled Up'.";
    const result = await handleBriefToSpec({ brief });

    expect(result.spec).toBeDefined();
    expect(result.spec.asset.platform).toBe("instagram");
    expect(result.spec.text?.headline?.content).toBe("AI Pairing Just Leveled Up");
    expect(result.yaml).toContain("AI Pairing Just Leveled Up");
  });

  it("handles visual_validate_spec with valid spec", async () => {
    const spec = {
      version: "0.1",
      asset: { platform: "linkedin" },
      text: {
        headline: { content: "Valid Headline" },
      },
    };
    const result = await handleValidateSpec({ spec });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("handles visual_validate_spec with invalid spec", async () => {
    const invalidSpec = {
      asset: { platform: "linkedin" }, // Missing version
    };
    const result = await handleValidateSpec({ spec: invalidSpec });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("handles visual_render deterministically", async () => {
    const spec = {
      version: "0.1",
      asset: { id: "mcp-test-render", platform: "instagram" },
      text: {
        headline: { content: "MCP Tool Render Test" },
      },
    };
    const tempOut = path.resolve(process.cwd(), "output/mcp-test-render");
    const result = await handleRender({ spec, outputDir: tempOut });

    expect(result.success).toBe(true);
    expect(fs.existsSync(result.imagePath)).toBe(true);
    expect(result.qaPassed).toBe(true);
  });

  it("handles visual_check_qa", async () => {
    const spec = {
      version: "0.1",
      asset: { platform: "instagram" },
      text: {
        headline: { content: "QA Check Headline", exact: true },
      },
    };
    const result = await handleCheckQA({ spec });
    expect(result.passed).toBe(true);
    expect(result.totalChecks).toBeGreaterThan(0);
  });

  it("handles visual_generate with mock provider", async () => {
    const spec = {
      version: "0.1",
      asset: { id: "mcp-test-gen", platform: "generic-social" },
      text: {
        headline: { content: "Generative MCP Pipeline" },
      },
    };
    const tempOut = path.resolve(process.cwd(), "output/mcp-test-gen");
    const result = await handleGenerate({ spec, provider: "mock", outputDir: tempOut });

    expect(result.success).toBe(true);
    expect(result.provider).toBe("mock");
    expect(fs.existsSync(result.imagePath)).toBe(true);
  });

  it("handles visual_repair when asset has line overflow", async () => {
    const failingSpec = {
      version: "0.1",
      asset: { id: "mcp-test-repair", platform: "instagram" },
      text: {
        headline: {
          content: "This is an extremely long headline designed specifically to exceed the maximum allowed line count and force a repair action.",
          max_lines: 1,
          typography: { scale: "xl" as const },
        },
      },
    };
    const tempOut = path.resolve(process.cwd(), "output/mcp-test-repair");
    const result = await handleRepair({ spec: failingSpec, outputDir: tempOut });

    expect(result.repaired).toBe(true);
    expect(result.plan.actions.length).toBeGreaterThan(0);
    expect(fs.existsSync(result.repairedImagePath!)).toBe(true);
  });

  it("handles visual_list_resources", async () => {
    const result = await handleListResources();
    expect(result.platforms.length).toBeGreaterThanOrEqual(3);
    expect(result.templates.length).toBeGreaterThanOrEqual(3);
    expect(result.platforms.some(p => p.platform === "instagram")).toBe(true);
    expect(result.templates.some(t => t.id === "product-launch")).toBe(true);
  });
});
