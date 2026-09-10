import { describe, it, expect } from "vitest";
import { resolveSpec } from "../../src/core/resolve-spec.js";
import { analyzeBrief } from "../../src/core/analyze-brief.js";
import { VisualSpec } from "../../src/types/spec.js";

describe("Core Spec Resolver & Brief Analyzer", () => {
  it("resolves default platform dimensions when not specified", () => {
    const rawSpec: VisualSpec = {
      version: "0.1",
      asset: {
        platform: "instagram",
        format: "feed_portrait",
      },
    };

    const resolved = resolveSpec(rawSpec);
    expect(resolved.canvas.width).toBe(1080);
    expect(resolved.canvas.height).toBe(1350);
    expect(resolved.canvas.aspect_ratio).toBe("4:5");
    expect(resolved.safeMargin.top).toBe(72);
    expect(resolved.safeMargin.left).toBe(64);
  });

  it("applies brand color fallbacks", () => {
    const rawSpec: VisualSpec = {
      version: "0.1",
      asset: { platform: "generic-social" },
      brand: {
        palette: {
          primary: "#FF0055",
        },
      },
    };

    const resolved = resolveSpec(rawSpec);
    expect(resolved.resolvedBrand.primary).toBe("#FF0055");
    expect(resolved.resolvedBrand.background).toBe("#09090B");
    expect(resolved.resolvedBrand.text).toBe("#FFFFFF");
  });

  it("analyzes brief and extracts headline, platform, and constraints", () => {
    const brief = `
      Make an Instagram launch post for our new developer tool.
      Headline: "Autonomous Agents are here."
      Use a dark futuristic look.
      No people.
      No extra text.
    `;

    const spec = analyzeBrief(brief);
    expect(spec.asset.platform).toBe("instagram");
    expect(spec.text?.headline?.content).toBe("Autonomous Agents are here.");
    expect(spec.constraints?.forbid).toContain("people");
    expect(spec.constraints?.forbid).toContain("extra_text");
    expect(spec.intent?.mood).toContain("dark");
    expect(spec.intent?.mood).toContain("futuristic");
  });
});
