import {
  VisualSpec,
  ResolvedVisualSpec,
  CanvasSpec,
  SafeMargin,
  BrandPalette,
  TextElement,
} from "../types/spec.js";
import { loadPlatform } from "./load-platform.js";
import { loadTemplate } from "./load-template.js";

const DEFAULT_BRAND: Required<BrandPalette> = {
  primary: "#6C5CE7",
  secondary: "#00D2FF",
  background: "#09090B",
  text: "#FFFFFF",
  accent: "#10B981",
};

const DEFAULT_MARGIN: SafeMargin = {
  top: 64,
  right: 64,
  bottom: 64,
  left: 64,
};

export function resolveSpec(spec: VisualSpec): ResolvedVisualSpec {
  const platformName = spec.asset?.platform || "generic-social";
  const platformPack = loadPlatform(platformName);

  // Determine format key
  let formatKey = spec.asset?.format;
  if (!formatKey || !platformPack.formats[formatKey]) {
    // Default priority: feed_portrait -> square -> first available
    if (platformPack.formats["feed_portrait"]) {
      formatKey = "feed_portrait";
    } else if (platformPack.formats["square"]) {
      formatKey = "square";
    } else {
      formatKey = Object.keys(platformPack.formats)[0];
    }
  }

  const platformFormat = platformPack.formats[formatKey] || {
    width: 1080,
    height: 1080,
    aspect_ratio: "1:1",
    safe_margin: DEFAULT_MARGIN,
  };

  // Resolve Canvas
  const width = spec.canvas?.width || platformFormat.width;
  const height = spec.canvas?.height || platformFormat.height;
  const aspect_ratio =
    spec.canvas?.aspect_ratio ||
    platformFormat.aspect_ratio ||
    `${width}:${height}`;

  const canvas: CanvasSpec = { width, height, aspect_ratio };

  // Resolve Safe Margin
  const safeMargin: SafeMargin = {
    top: spec.canvas?.width ? 48 : (platformFormat.safe_margin?.top ?? DEFAULT_MARGIN.top),
    right: spec.canvas?.width ? 48 : (platformFormat.safe_margin?.right ?? DEFAULT_MARGIN.right),
    bottom: spec.canvas?.width ? 48 : (platformFormat.safe_margin?.bottom ?? DEFAULT_MARGIN.bottom),
    left: spec.canvas?.width ? 48 : (platformFormat.safe_margin?.left ?? DEFAULT_MARGIN.left),
  };

  // Resolve Brand
  const resolvedBrand: Required<BrandPalette> = {
    primary: spec.brand?.palette?.primary || DEFAULT_BRAND.primary,
    secondary: spec.brand?.palette?.secondary || DEFAULT_BRAND.secondary,
    background: spec.brand?.palette?.background || DEFAULT_BRAND.background,
    text: spec.brand?.palette?.text || DEFAULT_BRAND.text,
    accent: spec.brand?.palette?.accent || DEFAULT_BRAND.accent,
  };

  // Resolve Template (if specified)
  const templateId = spec.asset?.template;
  let templateLayout: Record<string, any> = {};
  if (templateId) {
    try {
      const template = loadTemplate(templateId);
      templateLayout = template.layout || {};

      // Check required slots
      if (template.slots?.required) {
        for (const slot of template.slots.required) {
          if (slot === "subject" && !spec.subject) {
            // Subject required
          } else if (slot !== "subject" && (!spec.text || !spec.text[slot])) {
            // Missing text slot, warn or handle gracefully
          }
        }
      }
    } catch {
      // Template load optional or fallback
    }
  }

  // Resolve Text Elements
  const resolvedText: Record<string, Required<TextElement>> = {};
  const rawText = spec.text || {};

  for (const [key, rawEl] of Object.entries(rawText)) {
    const isHeadline = key.toLowerCase().includes("headline") || key.toLowerCase().includes("quote") || key.toLowerCase().includes("metric");
    const templateConfig = templateLayout[key] || {};

    const placement = rawEl.placement || templateConfig.region || (isHeadline ? "upper_third" : "below_headline");
    const alignment = rawEl.alignment || templateConfig.alignment || "left";

    resolvedText[key] = {
      content: rawEl.content || "",
      exact: rawEl.exact ?? true,
      max_lines: rawEl.max_lines || (isHeadline ? 3 : 5),
      placement,
      alignment,
      typography: {
        family_class: rawEl.typography?.family_class || "grotesk",
        weight: rawEl.typography?.weight || (isHeadline ? 700 : 400),
        scale: rawEl.typography?.scale || (isHeadline ? "xl" : "md"),
        color: rawEl.typography?.color || resolvedBrand.text,
      },
    };
  }

  // Resolve constraints
  const constraints = {
    required: spec.constraints?.required || Object.keys(resolvedText),
    forbid: spec.constraints?.forbid || ["extra_text", "watermark", "fake_ui_labels"],
    preserve: spec.constraints?.preserve || [],
    exact: spec.constraints?.exact || Object.keys(resolvedText).filter(k => resolvedText[k].exact),
  };

  // Resolve generation layers
  const generation = {
    image_layers: spec.generation?.image_layers || (spec.subject ? ["background", "subject"] : ["background"]),
    deterministic_layers: spec.generation?.deterministic_layers || Object.keys(resolvedText),
    variations: spec.generation?.variations || 1,
  };

  const output = {
    format: spec.output?.format || "png",
    quality: spec.output?.quality || "high",
  };

  return {
    ...spec,
    canvas,
    safeMargin,
    resolvedBrand,
    resolvedText,
    constraints,
    generation,
    output,
  };
}
