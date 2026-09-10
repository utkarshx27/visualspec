import { LayoutBox, ResolvedVisualSpec, SafeMargin } from "../types/spec.js";
import { getFontMetrics, wrapText } from "./typography.js";

export interface ComputedElementLayout {
  key: string;
  box: LayoutBox;
  lines: string[];
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  weight: number;
  color: string;
  alignment: "left" | "center" | "right";
  exceededMaxLines: boolean;
}

export function computeLayout(spec: ResolvedVisualSpec): Map<string, ComputedElementLayout> {
  const { canvas, safeMargin, resolvedText } = spec;
  const contentWidth = canvas.width - safeMargin.left - safeMargin.right;
  const contentHeight = canvas.height - safeMargin.top - safeMargin.bottom;

  const result = new Map<string, ComputedElementLayout>();
  const computedBoxes = new Map<string, LayoutBox>();

  // Sort keys so that anchors (headline, quote, metric, badge) are computed before dependent ones (supporting, author, etc.)
  const keys = Object.keys(resolvedText).sort((a, b) => {
    const elA = resolvedText[a];
    const elB = resolvedText[b];
    const isRelA = !!elA.placement?.startsWith("below_");
    const isRelB = !!elB.placement?.startsWith("below_");
    if (isRelA && !isRelB) return 1;
    if (!isRelA && isRelB) return -1;
    return 0;
  });

  for (const key of keys) {
    const el = resolvedText[key];
    const typo = el.typography;
    const metrics = getFontMetrics(typo.scale, typo.family_class, typo.weight);

    let x = safeMargin.left;
    let y = safeMargin.top;
    let targetWidth = contentWidth;

    if (el.alignment === "center" || el.placement === "center" || el.placement === "upper_center") {
      targetWidth = Math.round(contentWidth * 0.9);
      x = safeMargin.left + (contentWidth - targetWidth) / 2;
    } else if (el.placement === "upper_left" || el.placement === "lower_left") {
      targetWidth = Math.round(contentWidth * 0.85);
      x = safeMargin.left;
    }

    // Region / relation positioning
    if (el.placement?.startsWith("below_")) {
      const parentKey = el.placement.replace("below_", "");
      const parentBox = computedBoxes.get(parentKey);
      if (parentBox) {
        y = parentBox.y + parentBox.height + 24; // 24px vertical spacing
        if (el.alignment !== "center") {
          x = parentBox.x;
        }
      } else {
        y = safeMargin.top + Math.round(contentHeight * 0.35);
      }
    } else {
      switch (el.placement) {
        case "upper_left":
        case "upper_third":
          x = safeMargin.left;
          y = safeMargin.top + 20;
          break;
        case "upper_center":
          y = safeMargin.top + 20;
          break;
        case "upper_right":
          x = safeMargin.left + contentWidth - targetWidth;
          y = safeMargin.top + 20;
          break;
        case "center":
          y = safeMargin.top + Math.max(20, Math.round(contentHeight * 0.25));
          break;
        case "lower_third":
        case "lower_center":
          y = safeMargin.top + Math.round(contentHeight * 0.65);
          break;
        case "lower_left":
          x = safeMargin.left;
          y = safeMargin.top + Math.round(contentHeight * 0.75);
          break;
        default:
          x = safeMargin.left;
          y = safeMargin.top;
          break;
      }
    }

    // Ensure targetWidth does not breach right margin
    targetWidth = Math.min(targetWidth, canvas.width - safeMargin.right - x);

    const wrapped = wrapText(
      el.content,
      targetWidth,
      metrics.fontSize,
      metrics.lineHeight,
      el.max_lines,
      typo.family_class
    );

    // Adjust alignment coordinates
    const box: LayoutBox = {
      x,
      y,
      width: targetWidth,
      height: wrapped.totalHeight,
    };

    computedBoxes.set(key, box);

    result.set(key, {
      key,
      box,
      lines: wrapped.lines,
      fontSize: metrics.fontSize,
      lineHeight: metrics.lineHeight,
      fontFamily: metrics.fontFamily,
      weight: metrics.weight,
      color: typo.color || "#FFFFFF",
      alignment: el.alignment || "left",
      exceededMaxLines: wrapped.exceededMaxLines,
    });
  }

  return result;
}
