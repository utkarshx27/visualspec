import sharp from "sharp";
import { BaseImageAdapter } from "./base.js";
import {
  AdapterCapabilities,
  CompiledGenerationRequest,
  GeneratedLayer,
} from "../types/adapter.js";
import { ResolvedVisualSpec } from "../types/spec.js";
import { compilePrompt } from "./prompt-compiler.js";

export class MockImageAdapter extends BaseImageAdapter {
  id = "mock";
  supports: AdapterCapabilities = {
    referenceImages: false,
    negativePrompt: true,
    aspectRatio: true,
    transparentBackground: false,
    editMode: false,
  };

  compile(spec: ResolvedVisualSpec): CompiledGenerationRequest {
    return compilePrompt(spec, this.id);
  }

  async generate(request: CompiledGenerationRequest): Promise<GeneratedLayer[]> {
    const width = request.width || 1080;
    const height = request.height || 1350;

    // Generate an atmospheric abstract background with SVG, then convert to PNG buffer via Sharp
    const mockSceneSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <radialGradient id="grad1" cx="70%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#4F46E5" stop-opacity="0.8" />
          <stop offset="50%" stop-color="#1E1B4B" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#09090B" stop-opacity="1" />
        </radialGradient>
        <radialGradient id="grad2" cx="30%" cy="80%" r="55%">
          <stop offset="0%" stop-color="#06B6D4" stop-opacity="0.5" />
          <stop offset="100%" stop-color="#09090B" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Deep dark base -->
      <rect width="${width}" height="${height}" fill="#09090B" />
      <rect width="${width}" height="${height}" fill="url(#grad1)" />
      <rect width="${width}" height="${height}" fill="url(#grad2)" />

      <!-- Minimal futuristic 3D/geometric motif in lower two-thirds -->
      <g transform="translate(${width * 0.2}, ${height * 0.45})">
        <!-- Stylized floating display/device motif -->
        <polygon points="0,${height * 0.15} ${width * 0.3},0 ${width * 0.6},${height * 0.08} ${width * 0.3},${height * 0.23}" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" stroke-width="2" />
        <polygon points="${width * 0.3},0 ${width * 0.35},${height * 0.05} ${width * 0.65},${height * 0.13} ${width * 0.6},${height * 0.08}" fill="rgba(99,102,241,0.2)" />
        <circle cx="${width * 0.3}" cy="${height * 0.12}" r="${width * 0.12}" fill="url(#grad1)" opacity="0.6" />
      </g>
    </svg>
    `;

    const buffer = await sharp(Buffer.from(mockSceneSvg, "utf-8"))
      .png()
      .toBuffer();

    return [
      {
        id: "mock-base-layer",
        type: "background",
        buffer,
        mimeType: "image/png",
        width,
        height,
      },
    ];
  }
}
