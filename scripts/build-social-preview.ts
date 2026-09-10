import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

async function buildSocialPreview() {
  const assetsDir = path.resolve(process.cwd(), "assets");
  const cardPath = path.resolve(process.cwd(), "output/demo-product-launch/final.png");

  const canvasWidth = 1280;
  const canvasHeight = 640;

  // Render graphic preview on right side
  const sampleCard = await sharp(cardPath)
    .resize(400, 500, { fit: "cover" })
    .toBuffer();

  const overlaySvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#09090B" />
        <stop offset="60%" stop-color="#0F172A" />
        <stop offset="100%" stop-color="#09090B" />
      </linearGradient>
      <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="100%" stop-color="#CBD5E1" />
      </linearGradient>
      <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#6366F1" />
        <stop offset="100%" stop-color="#06B6D4" />
      </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="${canvasWidth}" height="${canvasHeight}" fill="url(#bgGrad)" />

    <!-- Ambient Glow Circles -->
    <circle cx="200" cy="150" r="300" fill="#6366F1" opacity="0.12" filter="blur(80px)" />
    <circle cx="1000" cy="400" r="350" fill="#06B6D4" opacity="0.1" filter="blur(90px)" />

    <!-- Top Badge -->
    <g transform="translate(80, 80)">
      <rect width="250" height="34" rx="17" fill="rgba(99,102,241,0.15)" stroke="#6366F1" stroke-width="1.5" />
      <text x="125" y="22" text-anchor="middle" fill="#818CF8" font-family="'Inter', sans-serif" font-size="13" font-weight="700" letter-spacing="2">
        OPEN SOURCE • MCP SERVER
      </text>
    </g>

    <!-- Logo / Title -->
    <text x="80" y="190" fill="url(#titleGrad)" font-family="'Inter', sans-serif" font-size="64" font-weight="900" letter-spacing="-1">
      VisualSpec
    </text>

    <!-- Subheading -->
    <text x="80" y="250" fill="#94A3B8" font-family="'Inter', sans-serif" font-size="24" font-weight="500">
      Structured Visual Generation &amp; Deterministic
    </text>
    <text x="80" y="285" fill="#94A3B8" font-family="'Inter', sans-serif" font-size="24" font-weight="500">
      Layout Engine for AI Agents
    </text>

    <!-- Bullet Points -->
    <g transform="translate(80, 350)">
      <circle cx="8" cy="8" r="6" fill="#10B981" />
      <text x="28" y="14" fill="#E2E8F0" font-family="'Inter', sans-serif" font-size="17" font-weight="600">
        Zero Typography Hallucinations (100% Deterministic Text)
      </text>

      <circle cx="8" cy="48" r="6" fill="#6366F1" />
      <text x="28" y="54" fill="#E2E8F0" font-family="'Inter', sans-serif" font-size="17" font-weight="600">
        Platform Safe-Margin &amp; Dimension Constraint QA
      </text>

      <circle cx="8" cy="88" r="6" fill="#06B6D4" />
      <text x="28" y="94" fill="#E2E8F0" font-family="'Inter', sans-serif" font-size="17" font-weight="600">
        Native MCP Server for Cursor, Claude &amp; Antigravity
      </text>
    </g>

    <!-- Footer URL -->
    <text x="80" y="540" fill="#64748B" font-family="'Inter', monospace" font-size="16">
      github.com/utkarshx27/visualspec
    </text>

    <!-- Card Shadow & Border on Right -->
    <rect x="780" y="70" width="400" height="500" rx="16" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
  </svg>
  `;

  const finalImage = await sharp(Buffer.from(overlaySvg, "utf-8"))
    .composite([
      {
        input: sampleCard,
        top: 70,
        left: 780,
      },
    ])
    .png()
    .toBuffer();

  const outPath = path.join(assetsDir, "social-preview.png");
  fs.writeFileSync(outPath, finalImage);
  console.log("Social preview saved to:", outPath);
}

buildSocialPreview().catch(console.error);
