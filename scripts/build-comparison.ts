import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

async function buildComparisonImage() {
  const assetsDir = path.resolve(process.cwd(), "assets");
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const hallucinatedPath = "C:\\Users\\ACER\\.gemini\\antigravity-ide\\brain\\dffee946-c475-4e87-9d1f-d6f390203c30\\ai_hallucinated_text_1789019925998.jpg";
  const visualSpecPath = path.resolve(process.cwd(), "output/demo-product-launch/final.png");

  const cardWidth = 800;
  const cardHeight = 1000;
  const canvasWidth = 1800;
  const canvasHeight = 1250;

  // Process Left Image (Hallucinated AI)
  const leftCard = await sharp(hallucinatedPath)
    .resize(cardWidth, cardHeight, { fit: "cover" })
    .toBuffer();

  // Process Right Image (VisualSpec Output)
  const rightCard = await sharp(visualSpecPath)
    .resize(cardWidth, cardHeight, { fit: "cover" })
    .toBuffer();

  // Header & labels SVG overlay
  const overlaySvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#09090B" />
        <stop offset="50%" stop-color="#0F172A" />
        <stop offset="100%" stop-color="#09090B" />
      </linearGradient>
    </defs>

    <!-- Background -->
    <rect width="${canvasWidth}" height="${canvasHeight}" fill="url(#bgGrad)" />

    <!-- Top Badge -->
    <rect x="750" y="32" width="300" height="32" rx="16" fill="rgba(99,102,241,0.15)" stroke="#6366F1" stroke-width="1.5" />
    <text x="900" y="53" text-anchor="middle" fill="#818CF8" font-family="'Inter', sans-serif" font-size="13" font-weight="700" letter-spacing="2">
      VISUALSPEC vs. STANDARD AI
    </text>

    <!-- Main Title -->
    <text x="900" y="100" text-anchor="middle" fill="#FFFFFF" font-family="'Inter', sans-serif" font-size="34" font-weight="800">
      Why Asking Image Models to Draw Text Fails
    </text>
    <text x="900" y="135" text-anchor="middle" fill="#94A3B8" font-family="'Inter', sans-serif" font-size="17">
      Prompt: "Make an Instagram post: 'Your AI pair programmer just leveled up.'"
    </text>

    <!-- Left Badge (Failure) -->
    <rect x="60" y="155" width="800" height="42" rx="8" fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.4)" stroke-width="1" />
    <circle cx="85" cy="176" r="6" fill="#EF4444" />
    <text x="105" y="182" fill="#F87171" font-family="'Inter', sans-serif" font-size="16" font-weight="700">
      ❌ Monolithic Prompt to Image Model (Hallucinated Typography &amp; Misspellings)
    </text>

    <!-- Right Badge (Success) -->
    <rect x="940" y="155" width="800" height="42" rx="8" fill="rgba(16,185,129,0.15)" stroke="rgba(16,185,129,0.4)" stroke-width="1" />
    <circle cx="965" cy="176" r="6" fill="#10B981" />
    <text x="985" y="182" fill="#34D399" font-family="'Inter', sans-serif" font-size="16" font-weight="700">
      ✅ VisualSpec (Generative Art + Deterministic SVG Typography &amp; Safe Margins)
    </text>
  </svg>
  `;

  const finalImage = await sharp(Buffer.from(overlaySvg, "utf-8"))
    .composite([
      {
        input: leftCard,
        top: 205,
        left: 60,
      },
      {
        input: rightCard,
        top: 205,
        left: 940,
      },
    ])
    .png()
    .toBuffer();

  const outPath = path.join(assetsDir, "comparison.png");
  fs.writeFileSync(outPath, finalImage);
  console.log("Comparison graphic saved to:", outPath);
}

buildComparisonImage().catch(console.error);
