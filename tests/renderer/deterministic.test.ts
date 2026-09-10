import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { wrapText, getFontMetrics } from "../../src/renderer/typography.js";
import { renderSvg } from "../../src/renderer/render.js";
import { compositeAsset } from "../../src/renderer/compositor.js";
import { resolveSpec } from "../../src/core/resolve-spec.js";
import { VisualSpec } from "../../src/types/spec.js";

describe("Deterministic Renderer", () => {
  it("wraps text properly within given max width", () => {
    const text = "VisualSpec for reliable and deterministic visual design across multiple platforms";
    const wrapped = wrapText(text, 500, 40, 48, 3, "grotesk");

    expect(wrapped.lines.length).toBeGreaterThan(1);
    expect(wrapped.lines.length).toBeLessThanOrEqual(3);
    expect(wrapped.totalHeight).toBe(wrapped.lines.length * 48);
  });

  it("handles line overflow by setting exceededMaxLines and truncating with ellipsis", () => {
    const longText = "This is a very long sentence that has way too many words to fit in a single line boundary without wrapping multiple times.";
    const wrapped = wrapText(longText, 200, 40, 48, 1, "grotesk");

    expect(wrapped.lines).toHaveLength(1);
    expect(wrapped.exceededMaxLines).toBe(true);
    expect(wrapped.lines[0]).toMatch(/\.\.\.$/);
  });

  it("generates valid SVG overlay string containing headline and badge", () => {
    const spec: VisualSpec = {
      version: "0.1",
      asset: { platform: "instagram" },
      text: {
        badge: { content: "FEATURE" },
        headline: { content: "Deterministic Layout Works" },
      },
    };
    const resolved = resolveSpec(spec);
    const svg = renderSvg(resolved, { includeBackground: true });

    expect(svg).toContain("<svg");
    expect(svg).toContain("Deterministic Layout");
    expect(svg).toContain("Works");
    expect(svg).toContain("FEATURE");
    expect(svg).toContain("</svg>");
  });

  it("composites a complete PNG image buffer with exact dimensions via Sharp", async () => {
    const spec: VisualSpec = {
      version: "0.1",
      asset: { platform: "instagram", format: "feed_portrait" },
      canvas: { width: 1080, height: 1350 },
      text: {
        headline: { content: "Pure Deterministic Render Test" },
      },
    };
    const resolved = resolveSpec(spec);
    const buffer = await compositeAsset(resolved);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(10000);

    const meta = await sharp(buffer).metadata();
    expect(meta.width).toBe(1080);
    expect(meta.height).toBe(1350);
    expect(meta.format).toBe("png");
  });
});
