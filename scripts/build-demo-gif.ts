import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

interface TerminalFrame {
  lines: Array<{
    prefix?: string;
    prefixColor?: string;
    text: string;
    textColor?: string;
    badge?: string;
    badgeColor?: string;
  }>;
  cursor?: boolean;
  delayMs: number;
}

function renderTerminalSvg(width: number, height: number, frame: TerminalFrame): string {
  const lineSpacing = 28;
  const startY = 85;

  const contentRows = frame.lines.map((line, idx) => {
    const y = startY + idx * lineSpacing;
    let elements = "";
    let currentX = 40;

    if (line.badge) {
      const badgeWidth = line.badge.length * 8 + 14;
      elements += `
        <rect x="${currentX}" y="${y - 14}" width="${badgeWidth}" height="20" rx="4" fill="${line.badgeColor || '#6366F1'}" opacity="0.2" />
        <rect x="${currentX}" y="${y - 14}" width="${badgeWidth}" height="20" rx="4" fill="none" stroke="${line.badgeColor || '#6366F1'}" stroke-width="1" />
        <text x="${currentX + badgeWidth / 2}" y="${y}" fill="${line.badgeColor || '#6366F1'}" font-family="'Consolas', 'Courier New', monospace" font-size="11" font-weight="700" text-anchor="middle">${line.badge}</text>
      `;
      currentX += badgeWidth + 12;
    }

    if (line.prefix) {
      elements += `<text x="${currentX}" y="${y}" fill="${line.prefixColor || '#10B981'}" font-family="'Consolas', 'Courier New', monospace" font-size="14" font-weight="700">${line.prefix}</text>`;
      currentX += line.prefix.length * 8.5 + 4;
    }

    elements += `<text x="${currentX}" y="${y}" fill="${line.textColor || '#F1F5F9'}" font-family="'Consolas', 'Courier New', monospace" font-size="14">${line.text}</text>`;
    return elements;
  }).join("\n");

  const cursorElement = frame.cursor ? `
    <rect x="${40 + (frame.lines[frame.lines.length - 1]?.text.length || 0) * 8.5 + 40}" y="${startY + (frame.lines.length - 1) * lineSpacing - 14}" width="8" height="17" fill="#38BDF8" opacity="0.9" />
  ` : "";

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#090D16" />
        <stop offset="100%" stop-color="#0F172A" />
      </linearGradient>
      <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="rgba(99,102,241,0.4)" />
        <stop offset="100%" stop-color="rgba(56,189,248,0.2)" />
      </linearGradient>
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.6" />
      </filter>
    </defs>

    <!-- Canvas Background -->
    <rect width="${width}" height="${height}" fill="#05070D" />

    <!-- Terminal Window Container -->
    <g transform="translate(20, 20)">
      <!-- Box shadow & background -->
      <rect width="${width - 40}" height="${height - 40}" rx="12" fill="url(#bgGrad)" stroke="url(#borderGrad)" stroke-width="1.5" filter="url(#shadow)" />

      <!-- Title Bar -->
      <rect width="${width - 40}" height="42" rx="12" fill="#0B1120" />
      <!-- Clip bottom corners of titlebar -->
      <rect y="30" width="${width - 40}" height="12" fill="#0B1120" />
      <line x1="0" y1="42" x2="${width - 40}" y2="42" stroke="rgba(255,255,255,0.08)" stroke-width="1" />

      <!-- Window Dots -->
      <circle cx="22" cy="21" r="6" fill="#EF4444" />
      <circle cx="42" cy="21" r="6" fill="#F59E0B" />
      <circle cx="62" cy="21" r="6" fill="#10B981" />

      <!-- Title -->
      <text x="${(width - 40) / 2}" y="26" fill="#94A3B8" font-family="'Inter', sans-serif" font-size="12" font-weight="600" text-anchor="middle">
        terminal — visualspec CLI
      </text>

      <!-- Terminal Body Content -->
      ${contentRows}
      ${cursorElement}
    </g>
  </svg>
  `;
}

async function buildDemoGif() {
  const width = 860;
  const height = 460;
  const assetsDir = path.resolve(process.cwd(), "assets");

  const framesData: TerminalFrame[] = [
    // Frame 1: Empty prompt
    {
      lines: [
        { prefix: "$", prefixColor: "#38BDF8", text: "", textColor: "#F8FAFC" }
      ],
      cursor: true,
      delayMs: 600,
    },
    // Frame 2: Typing command part 1
    {
      lines: [
        { prefix: "$", prefixColor: "#38BDF8", text: "visual generate", textColor: "#F8FAFC" }
      ],
      cursor: true,
      delayMs: 400,
    },
    // Frame 3: Full command
    {
      lines: [
        { prefix: "$", prefixColor: "#38BDF8", text: "visual generate examples/product-launch/spec.yaml", textColor: "#F8FAFC" }
      ],
      cursor: true,
      delayMs: 800,
    },
    // Frame 4: Spec loaded & resolving
    {
      lines: [
        { prefix: "$", prefixColor: "#38BDF8", text: "visual generate examples/product-launch/spec.yaml", textColor: "#F8FAFC" },
        { prefix: "→", prefixColor: "#818CF8", text: "Resolving platform: instagram-feed-portrait (1080x1350)", textColor: "#94A3B8" },
        { prefix: "→", prefixColor: "#818CF8", text: "Applying template: product-launch with dark-futuristic theme", textColor: "#94A3B8" },
      ],
      delayMs: 500,
    },
    // Frame 5: Generating layers
    {
      lines: [
        { prefix: "$", prefixColor: "#38BDF8", text: "visual generate examples/product-launch/spec.yaml", textColor: "#F8FAFC" },
        { prefix: "→", prefixColor: "#818CF8", text: "Resolving platform: instagram-feed-portrait (1080x1350)", textColor: "#94A3B8" },
        { prefix: "→", prefixColor: "#818CF8", text: "Applying template: product-launch with dark-futuristic theme", textColor: "#94A3B8" },
        { prefix: "✔", prefixColor: "#10B981", text: "Model Adapter: synthesized generative artwork base", textColor: "#E2E8F0", badge: "GENERATIVE", badgeColor: "#6366F1" },
        { prefix: "✔", prefixColor: "#10B981", text: "Layout Engine: compiled deterministic SVG typography", textColor: "#E2E8F0", badge: "DETERMINISTIC", badgeColor: "#06B6D4" },
      ],
      delayMs: 600,
    },
    // Frame 6: QA Verification & Output
    {
      lines: [
        { prefix: "$", prefixColor: "#38BDF8", text: "visual generate examples/product-launch/spec.yaml", textColor: "#F8FAFC" },
        { prefix: "→", prefixColor: "#818CF8", text: "Resolving platform: instagram-feed-portrait (1080x1350)", textColor: "#94A3B8" },
        { prefix: "→", prefixColor: "#818CF8", text: "Applying template: product-launch with dark-futuristic theme", textColor: "#94A3B8" },
        { prefix: "✔", prefixColor: "#10B981", text: "Model Adapter: synthesized generative artwork base", textColor: "#E2E8F0", badge: "GENERATIVE", badgeColor: "#6366F1" },
        { prefix: "✔", prefixColor: "#10B981", text: "Layout Engine: compiled deterministic SVG typography", textColor: "#E2E8F0", badge: "DETERMINISTIC", badgeColor: "#06B6D4" },
        { prefix: "✔", prefixColor: "#10B981", text: "Automated QA: 0 margin violations • 100% copy invariant match", textColor: "#E2E8F0", badge: "QA PASSED", badgeColor: "#10B981" },
        { prefix: "✨", prefixColor: "#F59E0B", text: "Saved final asset: output/demo-product-launch/final.png", textColor: "#38BDF8" },
      ],
      delayMs: 2800, // Pause so user can comfortably read the results
    },
  ];

  console.log("Rendering", framesData.length, "frames...");
  const frameBuffers: Buffer[] = [];
  const delays: number[] = [];

  for (const frame of framesData) {
    const svg = renderTerminalSvg(width, height, frame);
    const buf = await sharp(Buffer.from(svg, "utf-8")).png().toBuffer();
    frameBuffers.push(buf);
    delays.push(frame.delayMs);
  }

  // Combine frames vertically for Sharp animated GIF creation
  const totalHeight = height * frameBuffers.length;
  console.log(`Stacking ${frameBuffers.length} frames into ${width}x${totalHeight} strip...`);

  const composites = frameBuffers.map((buf, i) => ({
    input: buf,
    top: i * height,
    left: 0,
  }));

  const stacked = await sharp({
    create: {
      width,
      height: totalHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite(composites)
    .png()
    .toBuffer();

  console.log("Encoding animated GIF via Sharp...");
  const gifBuffer = await sharp(stacked)
    .gif({
      pageHeight: height,
      delay: delays,
      loop: 0, // infinite loop
    })
    .toBuffer();

  const outPath = path.join(assetsDir, "demo.gif");
  fs.writeFileSync(outPath, gifBuffer);
  console.log(`Demo GIF successfully generated: ${outPath} (${(gifBuffer.length / 1024).toFixed(1)} KB)`);
}

buildDemoGif().catch(console.error);
