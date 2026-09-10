import { BaseImageAdapter } from "./base.js";
import {
  AdapterCapabilities,
  CompiledGenerationRequest,
  GeneratedLayer,
} from "../types/adapter.js";
import { ResolvedVisualSpec } from "../types/spec.js";
import { compilePrompt } from "./prompt-compiler.js";

export class OpenAIImageAdapter extends BaseImageAdapter {
  id = "openai";
  supports: AdapterCapabilities = {
    referenceImages: false,
    negativePrompt: false, // DALL-E 3 incorporates negative instructions into main prompt
    aspectRatio: true,
    transparentBackground: false,
    editMode: false,
  };

  compile(spec: ResolvedVisualSpec): CompiledGenerationRequest {
    return compilePrompt(spec, this.id);
  }

  async generate(request: CompiledGenerationRequest): Promise<GeneratedLayer[]> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY environment variable is missing. Set OPENAI_API_KEY or use '--provider mock'."
      );
    }

    // Determine standard DALL-E 3 size
    let size = "1024x1024";
    if (request.aspectRatio === "16:9" || request.width > request.height) {
      size = "1792x1024";
    } else if (request.aspectRatio === "4:5" || request.aspectRatio === "9:16" || request.height > request.width) {
      size = "1024x1792";
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: request.prompt,
        n: 1,
        size,
        response_format: "b64_json",
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI Image API error (${response.status}): ${errText}`);
    }

    const data = (await response.json()) as any;
    const b64 = data.data[0]?.b64_json;
    if (!b64) {
      throw new Error("No image data returned from OpenAI Image API");
    }

    const buffer = Buffer.from(b64, "base64");

    return [
      {
        id: "openai-generated-layer",
        type: "composite",
        buffer,
        mimeType: "image/png",
        width: request.width,
        height: request.height,
      },
    ];
  }
}
