# Adding a New Image Model Provider

VisualSpec is designed to be provider-agnostic. You can add adapters for new models (e.g. Midjourney API, Stable Diffusion / ComfyUI, Flux) in 3 steps:

## 1. Implement `ImageModelAdapter`

Create a new file in `src/adapters/your-adapter.ts`:

```typescript
import { BaseImageAdapter } from "./base.js";
import {
  AdapterCapabilities,
  CompiledGenerationRequest,
  GeneratedLayer,
} from "../types/adapter.js";
import { ResolvedVisualSpec } from "../types/spec.js";
import { compilePrompt } from "./prompt-compiler.js";

export class CustomModelAdapter extends BaseImageAdapter {
  id = "custom";
  supports: AdapterCapabilities = {
    referenceImages: true,
    negativePrompt: true,
    aspectRatio: true,
    transparentBackground: false,
    editMode: false,
  };

  compile(spec: ResolvedVisualSpec): CompiledGenerationRequest {
    // Translate spec into custom prompt syntax if necessary
    return compilePrompt(spec, this.id);
  }

  async generate(request: CompiledGenerationRequest): Promise<GeneratedLayer[]> {
    // Call the external API or local model
    const imageBuffer = await fetchYourModel(request.prompt);

    return [
      {
        id: "custom-layer",
        type: "background",
        buffer: imageBuffer,
        mimeType: "image/png",
        width: request.width,
        height: request.height,
      },
    ];
  }
}
```

## 2. Register Adapter in `src/adapters/index.ts`

```typescript
import { CustomModelAdapter } from "./your-adapter.js";

const adapters = {
  mock: () => new MockImageAdapter(),
  openai: () => new OpenAIImageAdapter(),
  gemini: () => new GeminiImageAdapter(),
  custom: () => new CustomModelAdapter(), // Register here
};
```

## 3. Test Provider

```bash
npx @utkarshx27/visualspec compile examples/product-launch/spec.yaml --provider custom
npx @utkarshx27/visualspec generate examples/product-launch/spec.yaml --provider custom
```
