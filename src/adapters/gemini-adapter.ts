import { BaseImageAdapter } from "./base.js";
import {
  AdapterCapabilities,
  CompiledGenerationRequest,
  GeneratedLayer,
} from "../types/adapter.js";
import { ResolvedVisualSpec } from "../types/spec.js";
import { compilePrompt } from "./prompt-compiler.js";

export class GeminiImageAdapter extends BaseImageAdapter {
  id = "gemini";
  supports: AdapterCapabilities = {
    referenceImages: true,
    negativePrompt: true,
    aspectRatio: true,
    transparentBackground: false,
    editMode: false,
  };

  compile(spec: ResolvedVisualSpec): CompiledGenerationRequest {
    return compilePrompt(spec, this.id);
  }

  async generate(request: CompiledGenerationRequest): Promise<GeneratedLayer[]> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY environment variable is missing. Set GEMINI_API_KEY or use '--provider mock'."
      );
    }

    // Google Imagen endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instances: [{ prompt: request.prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: request.aspectRatio === "16:9" ? "16:9" : request.aspectRatio === "1:1" ? "1:1" : "4:5",
          safetySetting: "block_only_high",
          personGeneration: "allow_adult",
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Imagen API error (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as any;
    const b64 = data.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) {
      throw new Error("No image data returned from Google Imagen API");
    }

    const buffer = Buffer.from(b64, "base64");

    return [
      {
        id: "gemini-generated-layer",
        type: "composite",
        buffer,
        mimeType: "image/png",
        width: request.width,
        height: request.height,
      },
    ];
  }
}
