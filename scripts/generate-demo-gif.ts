import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

async function createDemoGif() {
  const width = 1000;
  const height = 750;
  const assetsDir = path.resolve(process.cwd(), "assets");
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // --- Common UI Header & Frame Components ---
  function renderTerminalFrame(stepNumber: number, stepTitle: string, stepBadge: string, badgeColor: string, innerSvg: string, statusText: string) {
    return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#090d16" />
          <stop offset="50%" stop-color="#05070d" />
          <stop offset="100%" stop-color="#020408" />
        </linearGradient>
        <linearGradient id="cardGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#151b28" />
          <stop offset="100%" stop-color="#0d111a" />
        </linearGradient>
        <linearGradient id="neonTeal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#00F2FE" />
          <stop offset="100%" stop-color="#4FACFE" />
        </linearGradient>
        <linearGradient id="neonPurple" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#B721FF" />
          <stop offset="100%" stop-color="#21D4FD" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Background Canvas -->
      <rect width="${width}" height="${height}" fill="url(#bgGrad)" />

      <!-- Outer Window Shell -->
      <rect x="30" y="30" width="940" height="690" rx="16" fill="url(#cardGrad)" stroke="#222f44" stroke-width="1.5" />

      <!-- Window Titlebar -->
      <path d="M 30 46 A 16 16 0 0 1 46 30 L 954 30 A 16 16 0 0 1 970 46 L 970 82 L 30 82 Z" fill="#0b1019" />
      <line x1="30" y1="82" x2="970" y2="82" stroke="#1d273a" stroke-width="1" />

      <!-- Window Controls -->
      <circle cx="58" cy="56" r="6" fill="#ef4444" />
      <circle cx="78" cy="56" r="6" fill="#eab308" />
      <circle cx="98" cy="56" r="6" fill="#22c55e" />

      <!-- Title & Branding -->
      <text x="126" y="61" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600">VisualSpec Studio — Generation Pipeline</text>
      
      <!-- Stage Indicator Pill -->
      <rect x="740" y="44" width="210" height="24" rx="12" fill="${badgeColor}22" stroke="${badgeColor}" stroke-width="1" />
      <text x="845" y="60" text-anchor="middle" fill="${badgeColor}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="11" font-weight="700" letter-spacing="0.5">${stepBadge}</text>

      <!-- Inner Stage Content -->
      ${innerSvg}

      <!-- Bottom Status Bar -->
      <rect x="30" y="668" width="940" height="52" rx="0" fill="#0b1019" />
      <line x1="30" y1="668" x2="970" y2="668" stroke="#1d273a" stroke-width="1" />
      <circle cx="60" cy="694" r="4" fill="${badgeColor}" filter="url(#glow)" />
      <text x="76" y="698" fill="#cbd5e1" font-family="monospace" font-size="13">${statusText.replace(/&/g, '&amp;')}</text>
      <text x="940" y="698" text-anchor="end" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12">Step ${stepNumber} of 5</text>
    </svg>
    `;
  }

  // --- STAGE 1: Prompt & Brief Input ---
  const stage1Inner = `
    <g transform="translate(60, 115)">
      <!-- Left Panel: Prompt Editor -->
      <rect x="0" y="0" width="880" height="520" rx="12" fill="#080c14" stroke="#1e293b" stroke-width="1" />

      <text x="40" y="55" fill="#38bdf8" font-family="monospace" font-size="13" font-weight="700">INPUT BRIEF / NATURAL LANGUAGE PROMPT</text>
      
      <!-- Prompt Box -->
      <rect x="40" y="80" width="800" height="150" rx="10" fill="#0f172a" stroke="#334155" stroke-width="1" />
      <text x="65" y="125" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="600">
        "Create an Instagram launch graphic:
      </text>
      <text x="65" y="160" fill="#38bdf8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700">
        VISUALSPEC 0.1 — Deterministic visuals for AI agents"
      </text>

      <!-- Extracted Parameters Grid -->
      <g transform="translate(40, 260)">
        <text x="0" y="0" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="700" letter-spacing="0.5">RESOLVED INTENT &amp; CONSTRAINTS</text>

        <rect x="0" y="18" width="250" height="80" rx="8" fill="#131d2e" stroke="#25354e" stroke-width="1" />
        <text x="20" y="46" fill="#64748b" font-family="-apple-system, sans-serif" font-size="11" font-weight="600">PLATFORM</text>
        <text x="20" y="74" fill="#38bdf8" font-family="monospace" font-size="15" font-weight="700">instagram (1080×1350)</text>

        <rect x="275" y="18" width="250" height="80" rx="8" fill="#131d2e" stroke="#25354e" stroke-width="1" />
        <text x="295" y="46" fill="#64748b" font-family="-apple-system, sans-serif" font-size="11" font-weight="600">TEMPLATE ARCHETYPE</text>
        <text x="295" y="74" fill="#a855f7" font-family="monospace" font-size="15" font-weight="700">product-launch.yaml</text>

        <rect x="550" y="18" width="250" height="80" rx="8" fill="#131d2e" stroke="#25354e" stroke-width="1" />
        <text x="570" y="46" fill="#64748b" font-family="-apple-system, sans-serif" font-size="11" font-weight="600">SAFE MARGINS</text>
        <text x="570" y="74" fill="#22c55e" font-family="monospace" font-size="15" font-weight="700">80px Invariant Enforced</text>
      </g>

      <!-- Agent Terminal Command -->
      <g transform="translate(40, 400)">
        <rect x="0" y="0" width="800" height="70" rx="8" fill="#04060a" stroke="#1e293b" stroke-width="1" />
        <text x="25" y="40" fill="#22c55e" font-family="monospace" font-size="15">$</text>
        <text x="45" y="40" fill="#e2e8f0" font-family="monospace" font-size="15">npx @utkarshx27/visualspec generate --prompt "Instagram launch graphic: VISUALSPEC 0.1"</text>
      </g>
    </g>
  `;

  // --- Shared Graphic Dimensions inside Stage 2, 3, 4, 5 ---
  // Preview Graphic size: 400 x 500 (aspect ratio 4:5 matching Instagram)
  const gx = 300;
  const gy = 120;
  const gw = 400;
  const gh = 500;

  // Base background artwork SVG (Generative Layer: Clean 3D abstract background, NO TEXT)
  const generativeArtLayer = `
    <defs>
      <linearGradient id="artBg" x1="0" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stop-color="#0b0f19" />
        <stop offset="40%" stop-color="#141829" />
        <stop offset="80%" stop-color="#0f1123" />
        <stop offset="100%" stop-color="#060810" />
      </linearGradient>
      <radialGradient id="neonGlow1" cx="60%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#7928CA" stop-opacity="0.65" />
        <stop offset="50%" stop-color="#4FACFE" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#0b0f19" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="neonGlow2" cx="35%" cy="80%" r="50%">
        <stop offset="0%" stop-color="#00F2FE" stop-opacity="0.45" />
        <stop offset="100%" stop-color="#0b0f19" stop-opacity="0" />
      </radialGradient>
    </defs>

    <rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" rx="14" fill="url(#artBg)" stroke="#2b3952" stroke-width="2" />
    <!-- Volumetric Glow Orbs -->
    <rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" rx="14" fill="url(#neonGlow1)" />
    <rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" rx="14" fill="url(#neonGlow2)" />

    <!-- 3D Geometric Crystal / Hardware Chip Accents (Clean visuals, zero text) -->
    <g transform="translate(${gx + 120}, ${gy + 220})">
      <!-- 3D Polyhedron / Core -->
      <polygon points="80,10 150,60 150,140 80,190 10,140 10,60" fill="#182338" stroke="#3b82f6" stroke-width="1.5" opacity="0.85" />
      <polygon points="80,10 150,60 80,100 10,60" fill="#2563eb" opacity="0.4" />
      <polygon points="10,60 80,100 80,190 10,140" fill="#1d4ed8" opacity="0.6" />
      <polygon points="150,60 80,100 80,190 150,140" fill="#3b82f6" opacity="0.3" />
      <!-- Core Lighting -->
      <circle cx="80" cy="100" r="28" fill="#00F2FE" opacity="0.6" filter="url(#glow)" />
      <circle cx="80" cy="100" r="14" fill="#ffffff" opacity="0.9" />
    </g>

    <!-- Tech Grid Lines in Background -->
    <line x1="${gx + 40}" y1="${gy + 100}" x2="${gx + 360}" y2="${gy + 100}" stroke="#1e293b" stroke-width="1" stroke-dasharray="4 4" />
    <line x1="${gx + 40}" y1="${gy + 420}" x2="${gx + 360}" y2="${gy + 420}" stroke="#1e293b" stroke-width="1" stroke-dasharray="4 4" />
  `;

  // --- STAGE 2: Generative Base (AI Model) ---
  const stage2Inner = `
    <!-- Left Sidebar: Architecture Stage Highlight -->
    <g transform="translate(60, 150)">
      <rect x="0" y="0" width="200" height="190" rx="10" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5" />
      <text x="20" y="35" fill="#38bdf8" font-family="-apple-system, sans-serif" font-size="11" font-weight="700">STAGE 1: GENERATIVE</text>
      <text x="20" y="65" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="16" font-weight="700">AI Model Adapter</text>
      <text x="20" y="95" fill="#94a3b8" font-family="-apple-system, sans-serif" font-size="12">Synthesizes 3D objects,</text>
      <text x="20" y="114" fill="#94a3b8" font-family="-apple-system, sans-serif" font-size="12">textures &amp; lighting.</text>
      <rect x="20" y="138" width="160" height="30" rx="6" fill="#38bdf822" />
      <text x="100" y="158" text-anchor="middle" fill="#38bdf8" font-family="-apple-system, sans-serif" font-size="11" font-weight="700">0% Text Hallucination</text>
    </g>

    <!-- Center Graphic: Clean Background Only -->
    ${generativeArtLayer}

    <!-- Callout Pill on Graphic -->
    <rect x="${gx + 60}" y="${gy + 440}" width="280" height="32" rx="16" fill="#000000cc" stroke="#38bdf8" stroke-width="1" />
    <text x="${gx + 200}" y="${gy + 461}" text-anchor="middle" fill="#38bdf8" font-family="monospace" font-size="12" font-weight="700">AI Base Layer (Zero Text)</text>

    <!-- Right Sidebar: Spec Rules -->
    <g transform="translate(740, 150)">
      <rect x="0" y="0" width="200" height="190" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
      <text x="20" y="35" fill="#64748b" font-family="-apple-system, sans-serif" font-size="11" font-weight="700">GENERATIVE PROMPT</text>
      <text x="20" y="65" fill="#cbd5e1" font-family="monospace" font-size="11">"Cyberpunk glass core,</text>
      <text x="20" y="85" fill="#cbd5e1" font-family="monospace" font-size="11">neon cyan &amp; purple glow,</text>
      <text x="20" y="105" fill="#cbd5e1" font-family="monospace" font-size="11">clean dark studio"</text>
      <text x="20" y="145" fill="#ef4444" font-family="monospace" font-size="11">negative: text, words, logo</text>
    </g>
  `;

  // Deterministic SVG Typography Elements
  const deterministicTypography = `
    <!-- Badge Pill -->
    <g transform="translate(${gx + 35}, ${gy + 35})">
      <rect x="0" y="0" width="130" height="26" rx="13" fill="#00F2FE22" stroke="#00F2FE" stroke-width="1.2" />
      <text x="65" y="17" text-anchor="middle" fill="#00F2FE" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="800" letter-spacing="1">NEW RELEASE</text>
    </g>

    <!-- Exact Headline -->
    <text x="${gx + 35}" y="${gy + 105}" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="900" letter-spacing="-0.5">
      VISUALSPEC 0.1
    </text>

    <!-- Exact Subtitle -->
    <text x="${gx + 35}" y="${gy + 138}" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="500">
      Deterministic visuals for AI agents
    </text>

    <!-- Feature Metric Pill -->
    <g transform="translate(${gx + 35}, ${gy + 430})">
      <rect x="0" y="0" width="200" height="34" rx="8" fill="#0f172aee" stroke="#22c55e" stroke-width="1.2" />
      <circle cx="18" cy="17" r="4" fill="#22c55e" />
      <text x="32" y="22" fill="#f8fafc" font-family="-apple-system, sans-serif" font-size="11" font-weight="700">100% Brand-Safe Layout</text>
    </g>
  `;

  // --- STAGE 3: Deterministic Typography Compositing ---
  const stage3Inner = `
    <!-- Left Sidebar: Architecture Stage Highlight -->
    <g transform="translate(60, 150)">
      <rect x="0" y="0" width="200" height="190" rx="10" fill="#0f172a" stroke="#a855f7" stroke-width="1.5" />
      <text x="20" y="35" fill="#a855f7" font-family="-apple-system, sans-serif" font-size="11" font-weight="700">STAGE 2: DETERMINISTIC</text>
      <text x="20" y="65" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="16" font-weight="700">SVG Layout Engine</text>
      <text x="20" y="95" fill="#94a3b8" font-family="-apple-system, sans-serif" font-size="12">Pixel-perfect typography,</text>
      <text x="20" y="114" fill="#94a3b8" font-family="-apple-system, sans-serif" font-size="12">badges &amp; exact copy.</text>
      <rect x="20" y="138" width="160" height="30" rx="6" fill="#a855f722" />
      <text x="100" y="158" text-anchor="middle" fill="#c084fc" font-family="-apple-system, sans-serif" font-size="11" font-weight="700">Exact String Match</text>
    </g>

    <!-- Center Graphic: Background + Vector Typography -->
    ${generativeArtLayer}
    ${deterministicTypography}

    <!-- Right Sidebar: Typography Stack -->
    <g transform="translate(740, 150)">
      <rect x="0" y="0" width="200" height="190" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
      <text x="20" y="35" fill="#64748b" font-family="-apple-system, sans-serif" font-size="11" font-weight="700">TYPOGRAPHY CONTRACT</text>
      <text x="20" y="65" fill="#f8fafc" font-family="monospace" font-size="12" font-weight="700">• VISUALSPEC 0.1</text>
      <text x="20" y="90" fill="#94a3b8" font-family="monospace" font-size="11">• Sub: 34 characters</text>
      <text x="20" y="115" fill="#94a3b8" font-family="monospace" font-size="11">• Font: System Display</text>
      <text x="20" y="145" fill="#22c55e" font-family="monospace" font-size="11">Composited via Sharp</text>
    </g>
  `;

  // --- STAGE 4: Automated Visual QA Inspection ---
  const qaOverlay = `
    <!-- Safe Margin Bounds (80px padding indicator) -->
    <rect x="${gx + 25}" y="${gy + 25}" width="${gw - 50}" height="${gh - 50}" rx="8" fill="none" stroke="#22c55e" stroke-width="2" stroke-dasharray="6 4" />
    <rect x="${gx + 25}" y="${gy + 10}" width="160" height="18" rx="4" fill="#22c55e" />
    <text x="${gx + 105}" y="${gy + 23}" text-anchor="middle" fill="#000000" font-family="monospace" font-size="10" font-weight="800">SAFE MARGIN ZONE: 80px</text>

    <!-- Headline QA Bounding Box -->
    <rect x="${gx + 30}" y="${gy + 70}" width="310" height="48" rx="4" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3 3" />
    <text x="${gx + 345}" y="${gy + 98}" fill="#38bdf8" font-family="monospace" font-size="11" font-weight="700">[PASS]</text>

    <!-- Subhead QA Bounding Box -->
    <rect x="${gx + 30}" y="${gy + 122}" width="280" height="24" rx="4" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3 3" />
    <text x="${gx + 315}" y="${gy + 138}" fill="#38bdf8" font-family="monospace" font-size="11" font-weight="700">[PASS]</text>

    <!-- QA HUD Diagnostic Card -->
    <g transform="translate(${gx + 210}, ${gy + 395})">
      <rect x="0" y="0" width="170" height="85" rx="6" fill="#000000ee" stroke="#22c55e" stroke-width="1.5" />
      <text x="12" y="20" fill="#22c55e" font-family="monospace" font-size="11" font-weight="700">✓ QA REPORT</text>
      <text x="12" y="40" fill="#cbd5e1" font-family="monospace" font-size="10">Safe Margins: OK</text>
      <text x="12" y="56" fill="#cbd5e1" font-family="monospace" font-size="10">Exact Copy: 100%</text>
      <text x="12" y="72" fill="#cbd5e1" font-family="monospace" font-size="10">Ratio (4:5): OK</text>
    </g>
  `;

  const stage4Inner = `
    <!-- Left Sidebar: Architecture Stage Highlight -->
    <g transform="translate(60, 150)">
      <rect x="0" y="0" width="200" height="190" rx="10" fill="#0f172a" stroke="#22c55e" stroke-width="1.5" />
      <text x="20" y="35" fill="#22c55e" font-family="-apple-system, sans-serif" font-size="11" font-weight="700">STAGE 3: VERIFICATION</text>
      <text x="20" y="65" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="16" font-weight="700">Visual QA Check</text>
      <text x="20" y="95" fill="#94a3b8" font-family="-apple-system, sans-serif" font-size="12">Automated geometry check,</text>
      <text x="20" y="114" fill="#94a3b8" font-family="-apple-system, sans-serif" font-size="12">line limits &amp; safe zones.</text>
      <rect x="20" y="138" width="160" height="30" rx="6" fill="#22c55e22" />
      <text x="100" y="158" text-anchor="middle" fill="#22c55e" font-family="-apple-system, sans-serif" font-size="11" font-weight="700">4/4 Checks Passed</text>
    </g>

    <!-- Center Graphic: Artwork + Typography + QA Overlays -->
    ${generativeArtLayer}
    ${deterministicTypography}
    ${qaOverlay}

    <!-- Right Sidebar: QA Invariant List -->
    <g transform="translate(740, 150)">
      <rect x="0" y="0" width="200" height="190" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
      <text x="20" y="35" fill="#64748b" font-family="-apple-system, sans-serif" font-size="11" font-weight="700">INVARIANT RULES</text>
      <text x="20" y="65" fill="#22c55e" font-family="monospace" font-size="11">✓ margin_overflow: 0</text>
      <text x="20" y="90" fill="#22c55e" font-family="monospace" font-size="11">✓ max_lines: 2</text>
      <text x="20" y="115" fill="#22c55e" font-family="monospace" font-size="11">✓ text_overlap: 0</text>
      <text x="20" y="145" fill="#38bdf8" font-family="monospace" font-size="11">Status: VERIFIED</text>
    </g>
  `;

  // --- STAGE 5: Final Production Asset Bundle Ready ---
  const stage5Inner = `
    <!-- Left Sidebar: Production Ready Badge -->
    <g transform="translate(60, 150)">
      <rect x="0" y="0" width="200" height="190" rx="10" fill="#0f172a" stroke="#22c55e" stroke-width="1.5" />
      <text x="20" y="35" fill="#22c55e" font-family="-apple-system, sans-serif" font-size="11" font-weight="700">PIPELINE COMPLETE</text>
      <text x="20" y="65" fill="#ffffff" font-family="-apple-system, sans-serif" font-size="16" font-weight="700">Production Ready</text>
      <text x="20" y="95" fill="#94a3b8" font-family="-apple-system, sans-serif" font-size="12">Asset, spec contract, model</text>
      <text x="20" y="114" fill="#94a3b8" font-family="-apple-system, sans-serif" font-size="12">prompt, &amp; QA report bundled.</text>
      <rect x="20" y="138" width="160" height="30" rx="6" fill="#22c55e22" />
      <text x="100" y="158" text-anchor="middle" fill="#22c55e" font-family="-apple-system, sans-serif" font-size="11" font-weight="700">Platform Ready ✅</text>
    </g>

    <!-- Center Graphic: Clean Finished Asset with Subtle Glow -->
    <rect x="${gx - 4}" y="${gy - 4}" width="${gw + 8}" height="${gh + 8}" rx="18" fill="none" stroke="#22c55e" stroke-width="2" filter="url(#glow)" />
    ${generativeArtLayer}
    ${deterministicTypography}

    <!-- Right Sidebar: Output Files -->
    <g transform="translate(740, 150)">
      <rect x="0" y="0" width="200" height="190" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1" />
      <text x="20" y="35" fill="#64748b" font-family="-apple-system, sans-serif" font-size="11" font-weight="700">OUTPUT BUNDLE</text>
      <text x="20" y="65" fill="#22c55e" font-family="monospace" font-size="11">📁 output/launch/</text>
      <text x="35" y="85" fill="#cbd5e1" font-family="monospace" font-size="11">├── final.png</text>
      <text x="35" y="105" fill="#cbd5e1" font-family="monospace" font-size="11">├── spec.yaml</text>
      <text x="35" y="125" fill="#cbd5e1" font-family="monospace" font-size="11">└── qa-report.json</text>
      <text x="20" y="155" fill="#38bdf8" font-family="monospace" font-size="11">Ready to publish!</text>
    </g>
  `;

  // Render 5 Frame SVGs
  const framesSvg = [
    renderTerminalFrame(1, "Input Brief", "PROMPT INPUT", "#38bdf8", stage1Inner, "Receiving brief: Instagram launch card 'VISUALSPEC 0.1'..."),
    renderTerminalFrame(2, "AI Model", "1/3 AI BASE", "#38bdf8", stage2Inner, "Synthesizing generative background (textures & lighting, 0% text)..."),
    renderTerminalFrame(3, "Typography", "2/3 EXACT TEXT", "#a855f7", stage3Inner, "Layering deterministic SVG vector typography & feature badges..."),
    renderTerminalFrame(4, "Visual QA", "3/3 QA CHECK", "#22c55e", stage4Inner, "Executing automated QA constraint & margin inspection: PASSED..."),
    renderTerminalFrame(5, "Final Asset", "READY ✅", "#22c55e", stage5Inner, "Final asset bundle created: ./output/demo-launch/final.png")
  ];

  console.log("Rendering 5 high-res frames with Sharp...");
  const buffers: Buffer[] = [];
  for (let i = 0; i < framesSvg.length; i++) {
    const buf = await sharp(Buffer.from(framesSvg[i]))
      .png()
      .toBuffer();
    buffers.push(buf);
  }

  // Also save a standalone hero poster image
  const posterPath = path.join(assetsDir, "demo-preview.png");
  await sharp(Buffer.from(framesSvg[4])).png().toFile(posterPath);
  console.log(`Saved static poster image: ${posterPath}`);

  // Create vertical strip for multi-page GIF
  console.log("Combining frames into animated GIF...");
  const totalHeight = height * buffers.length;
  const compositeInputs = buffers.map((buf, idx) => ({
    input: buf,
    top: idx * height,
    left: 0,
  }));

  const stacked = await sharp({
    create: {
      width,
      height: totalHeight,
      channels: 4,
      background: "#090d16"
    }
  })
    .composite(compositeInputs)
    .png()
    .toBuffer();

  const outGifPath = path.join(assetsDir, "demo.gif");
  // Frame delays in milliseconds: 2600ms, 2600ms, 2600ms, 2600ms, 3500ms
  const delays = [2600, 2600, 2600, 2600, 3500];

  await sharp(stacked)
    .gif({
      pageHeight: height,
      loop: 0,
      delay: delays,
    })
    .toFile(outGifPath);

  const stats = fs.statSync(outGifPath);
  console.log(`✓ Animated Demo GIF created successfully!`);
  console.log(`  Path: ${outGifPath}`);
  console.log(`  Size: ${(stats.size / 1024).toFixed(1)} KB`);
}

createDemoGif().catch((err) => {
  console.error("Error creating demo GIF:", err);
  process.exit(1);
});
