import { ResolvedVisualSpec } from "../types/spec.js";
import { computeLayout, ComputedElementLayout } from "./layout.js";

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export interface RenderSvgOptions {
  includeBackground?: boolean;
}

export function renderSvg(spec: ResolvedVisualSpec, options: RenderSvgOptions = {}): string {
  const { canvas, resolvedBrand } = spec;
  const layout = computeLayout(spec);

  const elementsSvg: string[] = [];

  // If includeBackground is true (standalone render without generated image), create a sleek gradient backdrop
  if (options.includeBackground) {
    elementsSvg.push(`
    <!-- Background Base -->
    <rect width="${canvas.width}" height="${canvas.height}" fill="${resolvedBrand.background}" />
    
    <!-- Atmospheric Glow & Accents -->
    <defs>
      <radialGradient id="ambientGlow" cx="70%" cy="30%" r="60%">
        <stop offset="0%" stop-color="${resolvedBrand.primary}" stop-opacity="0.25" />
        <stop offset="60%" stop-color="${resolvedBrand.primary}" stop-opacity="0.05" />
        <stop offset="100%" stop-color="${resolvedBrand.background}" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="secondaryGlow" cx="20%" cy="80%" r="50%">
        <stop offset="0%" stop-color="${resolvedBrand.secondary}" stop-opacity="0.18" />
        <stop offset="70%" stop-color="${resolvedBrand.secondary}" stop-opacity="0.03" />
        <stop offset="100%" stop-color="${resolvedBrand.background}" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${resolvedBrand.primary}" />
        <stop offset="100%" stop-color="${resolvedBrand.secondary}" />
      </linearGradient>
    </defs>

    <rect width="${canvas.width}" height="${canvas.height}" fill="url(#ambientGlow)" />
    <rect width="${canvas.width}" height="${canvas.height}" fill="url(#secondaryGlow)" />

    <!-- Subtle Architectural Grid Pattern -->
    <path d="M 0 0 L ${canvas.width} 0 M 0 ${canvas.height * 0.33} L ${canvas.width} ${canvas.height * 0.33} M 0 ${canvas.height * 0.66} L ${canvas.width} ${canvas.height * 0.66}" stroke="rgba(255,255,255,0.03)" stroke-width="1" fill="none" />
    `);
  }

  // Render each text and UI component
  for (const [key, item] of layout.entries()) {
    const isBadge = key.toLowerCase().includes("badge");

    if (isBadge) {
      // Render as sleek pill badge
      const badgeText = item.lines[0] || "";
      const pillWidth = Math.max(120, badgeText.length * 12 + 32);
      const pillHeight = 36;
      elementsSvg.push(`
      <g transform="translate(${item.box.x}, ${item.box.y})">
        <rect width="${pillWidth}" height="${pillHeight}" rx="${pillHeight / 2}" fill="rgba(255,255,255,0.08)" stroke="${resolvedBrand.primary}" stroke-width="1.5" />
        <text x="${pillWidth / 2}" y="${pillHeight / 2 + 5}" text-anchor="middle" fill="${resolvedBrand.primary}" font-family="${item.fontFamily}" font-size="14" font-weight="600" letter-spacing="1">
          ${escapeXml(badgeText.toUpperCase())}
        </text>
      </g>
      `);
      continue;
    }

    // Standard text rendering
    let anchor = "start";
    let textX = item.box.x;
    if (item.alignment === "center") {
      anchor = "middle";
      textX = item.box.x + item.box.width / 2;
    } else if (item.alignment === "right") {
      anchor = "end";
      textX = item.box.x + item.box.width;
    }

    const tspans = item.lines
      .map((line, idx) => {
        const dy = idx === 0 ? item.fontSize : item.lineHeight;
        return `<tspan x="${textX}" dy="${dy}">${escapeXml(line)}</tspan>`;
      })
      .join("");

    elementsSvg.push(`
    <text x="${textX}" y="${item.box.y}" font-family="${item.fontFamily}" font-size="${item.fontSize}" font-weight="${item.weight}" fill="${item.color}" text-anchor="${anchor}">
      ${tspans}
    </text>
    `);
  }

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}">
  ${elementsSvg.join("\n")}
</svg>
  `.trim();

  return svg;
}
