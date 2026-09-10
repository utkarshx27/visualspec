import { describe, it, expect } from "vitest";
import { compilePrompt } from "../../src/adapters/prompt-compiler.js";
import { MockImageAdapter } from "../../src/adapters/mock-adapter.js";
import { resolveSpec } from "../../src/core/resolve-spec.js";
import { VisualSpec } from "../../src/types/spec.js";

describe("Model Adapter & Prompt Compiler", () => {
  it("compiles structured prompt with negative constraints and composition guidance", () => {
    const spec: VisualSpec = {
      version: "0.1",
      asset: { platform: "instagram" },
      subject: {
        description: "minimal futuristic device",
        placement: "lower_center",
        prominence: 0.6,
      },
      background: {
        description: "dark purple atmospheric gradient",
        texture: "fine_grain",
      },
      composition: {
        negative_space: { target: "upper_third" },
      },
      constraints: {
        forbid: ["people", "extra_devices"],
      },
    };

    const resolved = resolveSpec(spec);
    const compiled = compilePrompt(resolved, "mock");

    expect(compiled.prompt).toContain("minimal futuristic device");
    expect(compiled.prompt).toContain("Reserve the upper third as clean negative space");
    expect(compiled.prompt).toContain("Crucial rule: Absolutely DO NOT include any of the following");
    expect(compiled.prompt).toContain("people");
    expect(compiled.prompt).toContain("extra_devices");
    expect(compiled.negativePrompt).toContain("extra_text");
    expect(compiled.negativePrompt).toContain("watermark");
  });

  it("mock adapter generates valid image layer buffer", async () => {
    const adapter = new MockImageAdapter();
    const spec: VisualSpec = {
      version: "0.1",
      asset: { platform: "instagram", format: "square" },
      canvas: { width: 1080, height: 1080 },
    };
    const resolved = resolveSpec(spec);
    const request = adapter.compile(resolved);
    const layers = await adapter.generate(request);

    expect(layers).toHaveLength(1);
    expect(layers[0].type).toBe("background");
    expect(layers[0].buffer).toBeInstanceOf(Buffer);
    expect(layers[0].width).toBe(1080);
    expect(layers[0].height).toBe(1080);
  });
});
