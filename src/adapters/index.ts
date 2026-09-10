import { ImageModelAdapter } from "../types/adapter.js";
import { MockImageAdapter } from "./mock-adapter.js";
import { OpenAIImageAdapter } from "./openai-adapter.js";
import { GeminiImageAdapter } from "./gemini-adapter.js";

export * from "./base.js";
export * from "./prompt-compiler.js";
export * from "./mock-adapter.js";
export * from "./openai-adapter.js";
export * from "./gemini-adapter.js";

const adapters: Record<string, () => ImageModelAdapter> = {
  mock: () => new MockImageAdapter(),
  openai: () => new OpenAIImageAdapter(),
  gemini: () => new GeminiImageAdapter(),
};

export function getAdapter(providerName: string = "mock"): ImageModelAdapter {
  const factory = adapters[providerName.toLowerCase()];
  if (!factory) {
    const available = Object.keys(adapters).join(", ");
    throw new Error(`Unknown provider '${providerName}'. Available providers: ${available}`);
  }
  return factory();
}
