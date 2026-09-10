import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

async function buildShowcaseImage() {
  const assetsDir = path.resolve(process.cwd(), "assets");
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const launchPath = path.resolve(process.cwd(), "output/demo-product-launch/final.png");
  const statPath = path.resolve(process.cwd(), "output/demo-stat-card/final.png");
  const quotePath = path.resolve(process.cwd(), "output/demo-quote-card-repaired/final.png");

  const canvasWidth = 1920;
  const canvasHeight = 1080;

  const cardWidth = 540;
  const cardHeight = 675;

  const launchCard = await sharp(launchPath).resize(cardWidth, cardHeight, { fit: "cover" }).toBuffer();
  const statCard = await sharp(statPath).resize(cardWidth, cardHeight, { fit: "cover" }).toBuffer();
  const quoteCard = await sharp(quotePath).resize(cardWidth, cardHeight, { fit: "cover" }).toBuffer();

  const overlaySvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#09090B" />
        <stop offset="50%" stop-color="#0F172A" />
        <stop offset="100%" stop-color="#09090B" />
      </linearGradient>
    </defs>

    <rect width="${canvasWidth}" height="${canvasHeight}" fill="url(#bgGrad)" />

    <!-- Top Badge -->
    <rect x="835" y="45" width="250" height="32" rx="16" fill="rgba(99,102,241,0.15)" stroke="#6366F1" stroke-width="1.5" />
    <text x="960" y="66" text-anchor="middle" fill="#818CF8" font-family="'Inter', sans-serif" font-size="13" font-weight="700" letter-spacing="2">
      SAMPLE OUTPUTS
    </text>

    <!-- Main Title -->
    <text x="960" y="125" text-anchor="middle" fill="#FFFFFF" font-family="'Inter', sans-serif" font-size="38" font-weight="800">
      Platform-Ready Graphics with Zero Hallucinations
    </text>
    <text x="960" y="165" text-anchor="middle" fill="#94A3B8" font-family="'Inter', sans-serif" font-size="18">
      100% exact typography, safe-margin compliance, and automated QA verification
    </text>

    <!-- Labels below cards -->
    <text x="350" y="930" text-anchor="middle" fill="#FFFFFF" font-family="'Inter', sans-serif" font-size="20" font-weight="700">Product Launch Card</text>
    <text x="350" y="960" text-anchor="middle" fill="#64748B" font-family="'Inter', sans-serif" font-size="15">Instagram Feed Portrait (4:5)</text>

    <text x="960" y="930" text-anchor="middle" fill="#FFFFFF" font-family="'Inter', sans-serif" font-size="20" font-weight="700">Data &amp; Metric Stat Card</text>
    <text x="960" y="960" text-anchor="middle" fill="#64748B" font-family="'Inter', sans-serif" font-size="15">LinkedIn Feed Portrait (4:5)</text>

    <text x="1570" y="930" text-anchor="middle" fill="#FFFFFF" font-family="'Inter', sans-serif" font-size="20" font-weight="700">Editorial Quote Card</text>
    <text x="1570" y="960" text-anchor="middle" fill="#64748B" font-family="'Inter', sans-serif" font-size="15">Square Social Format (1:1)</text>
  </svg>
  `;

  const finalImage = await sharp(Buffer.from(overlaySvg, "utf-8"))
    .composite([
      {
        input: launchCard,
        top: 215,
        left: 80,
      },
      {
        input: statCard,
        top: 215,
        left: 690,
      },
      {
        input: quoteCard,
        top: 215,
        left: 1300,
      },
    ])
    .png()
    .toBuffer();

  const outPath = path.join(assetsDir, "showcase.png");
  fs.writeFileSync(outPath, finalImage);
  console.log("Showcase graphic saved to:", outPath);
}

buildShowcaseImage().catch(console.error);
