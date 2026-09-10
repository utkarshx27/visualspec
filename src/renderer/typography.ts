import { FamilyClass, TextScale } from "../types/spec.js";

export interface FontMetrics {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  weight: number;
}

export const SCALE_MAP: Record<TextScale, number> = {
  xs: 22,
  sm: 30,
  md: 40,
  lg: 56,
  xl: 72,
  "2xl": 96,
  "3xl": 128,
};

export const FAMILY_MAP: Record<FamilyClass, string> = {
  grotesk: "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
  geometric: "'Montserrat', 'Century Gothic', 'Inter', sans-serif",
  serif: "'Playfair Display', 'Georgia', 'Times New Roman', serif",
  mono: "'JetBrains Mono', 'SF Mono', 'Fira Code', 'Consolas', monospace",
};

export function getFontMetrics(
  scale: TextScale = "md",
  familyClass: FamilyClass = "grotesk",
  weight: number = 400
): FontMetrics {
  const fontSize = SCALE_MAP[scale] || 40;
  const lineHeight = Math.round(fontSize * 1.25);
  const fontFamily = FAMILY_MAP[familyClass] || FAMILY_MAP.grotesk;

  return {
    fontSize,
    lineHeight,
    fontFamily,
    weight,
  };
}

/**
 * Calculates estimated character width for wrapping text.
 * Average character width is approximately 0.58 * fontSize for proportional fonts, 0.6 for mono.
 */
export function estimateCharWidth(fontSize: number, familyClass: FamilyClass = "grotesk"): number {
  return familyClass === "mono" ? fontSize * 0.62 : fontSize * 0.54;
}

export interface WrappedTextResult {
  lines: string[];
  totalHeight: number;
  exceededMaxLines: boolean;
}

export function wrapText(
  text: string,
  maxWidth: number,
  fontSize: number,
  lineHeight: number,
  maxLines: number = 4,
  familyClass: FamilyClass = "grotesk"
): WrappedTextResult {
  if (!text) {
    return { lines: [], totalHeight: 0, exceededMaxLines: false };
  }

  const charWidth = estimateCharWidth(fontSize, familyClass);
  const maxCharsPerLine = Math.max(1, Math.floor(maxWidth / charWidth));

  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      currentLine = candidate;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  let exceededMaxLines = false;
  let finalLines = lines;
  if (lines.length > maxLines) {
    exceededMaxLines = true;
    finalLines = lines.slice(0, maxLines);
    // Add ellipsis to last line if truncated
    const last = finalLines[maxLines - 1];
    finalLines[maxLines - 1] = last.length > 3 ? `${last.slice(0, -3)}...` : `${last}...`;
  }

  const totalHeight = finalLines.length * lineHeight;

  return {
    lines: finalLines,
    totalHeight,
    exceededMaxLines,
  };
}
