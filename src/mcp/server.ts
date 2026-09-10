import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import {
  handleBriefToSpec,
  handleValidateSpec,
  handleRender,
  handleGenerate,
  handleCheckQA,
  handleRepair,
  handleListResources,
} from "./handlers.js";

export function createVisualSpecServer(): McpServer {
  const server = new McpServer({
    name: "visualspec",
    version: "0.1.0",
  });

  // 1. visual_brief_to_spec
  server.tool(
    "visual_brief_to_spec",
    "Convert a natural-language creative brief or user request into a structured VisualSpec specification",
    {
      brief: z.string().describe("User request or creative brief description"),
      platform: z.string().optional().describe("Target platform (e.g. instagram, linkedin, generic-social)"),
      template: z.string().optional().describe("Target template archetype (e.g. product-launch, quote-card, stat-card)"),
    },
    async (params) => {
      try {
        const result = await handleBriefToSpec(params);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Error generating spec: ${err.message}` }],
        };
      }
    }
  );

  // 2. visual_validate_spec
  server.tool(
    "visual_validate_spec",
    "Validate a VisualSpec YAML or JSON against the schema",
    {
      spec: z.union([z.string(), z.record(z.unknown())]).describe("VisualSpec YAML string, file path, or JSON object"),
    },
    async (params) => {
      try {
        const result = await handleValidateSpec(params);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Error validating spec: ${err.message}` }],
        };
      }
    }
  );

  // 3. visual_render
  server.tool(
    "visual_render",
    "Render deterministic typography, layout, and styling to a PNG asset without requiring an AI image API key",
    {
      spec: z.union([z.string(), z.record(z.unknown())]).describe("VisualSpec YAML string, file path, or JSON object"),
      outputDir: z.string().optional().describe("Directory to write output PNG and bundle"),
    },
    async (params) => {
      try {
        const result = await handleRender(params);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Error rendering asset: ${err.message}` }],
        };
      }
    }
  );

  // 4. visual_generate
  server.tool(
    "visual_generate",
    "Run the full visual generation pipeline (model adapter + deterministic typography overlay + QA)",
    {
      spec: z.union([z.string(), z.record(z.unknown())]).describe("VisualSpec YAML string, file path, or JSON object"),
      provider: z.enum(["mock", "openai", "gemini"]).optional().describe("Image provider adapter (default: mock)"),
      outputDir: z.string().optional().describe("Directory to write output PNG and bundle"),
    },
    async (params) => {
      try {
        const result = await handleGenerate(params);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Error generating asset: ${err.message}` }],
        };
      }
    }
  );

  // 5. visual_check_qa
  server.tool(
    "visual_check_qa",
    "Run automated visual QA checks (safe margins, max lines, exact copy, slot compliance, output dimensions)",
    {
      spec: z.union([z.string(), z.record(z.unknown())]).describe("VisualSpec YAML string, file path, or JSON object"),
      imagePath: z.string().optional().describe("Path to rendered PNG file to verify against spec"),
    },
    async (params) => {
      try {
        const result = await handleCheckQA(params);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Error checking QA: ${err.message}` }],
        };
      }
    }
  );

  // 6. visual_repair
  server.tool(
    "visual_repair",
    "Diagnose QA failures and automatically formulate & apply localized repairs without full regeneration",
    {
      spec: z.union([z.string(), z.record(z.unknown())]).describe("VisualSpec YAML string, file path, or JSON object"),
      imagePath: z.string().optional().describe("Path to failing image file"),
      outputDir: z.string().optional().describe("Directory to write repaired PNG and bundle"),
    },
    async (params) => {
      try {
        const result = await handleRepair(params);
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Error repairing asset: ${err.message}` }],
        };
      }
    }
  );

  // 7. visual_list_resources
  server.tool(
    "visual_list_resources",
    "List all available platform packs (Instagram, LinkedIn, etc.) and structural templates (Product Launch, Quote Card, Stat Card)",
    {},
    async () => {
      try {
        const result = await handleListResources();
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (err: any) {
        return {
          isError: true,
          content: [{ type: "text" as const, text: `Error listing resources: ${err.message}` }],
        };
      }
    }
  );

  return server;
}
