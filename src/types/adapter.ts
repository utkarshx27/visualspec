import { ResolvedVisualSpec } from "./spec.js";

export interface CompiledGenerationRequest {
  provider: string;
  prompt: string;
  negativePrompt?: string;
  aspectRatio: string;
  width: number;
  height: number;
  seed?: number;
  options?: Record<string, unknown>;
}

export interface GeneratedLayer {
  id: string;
  type: "background" | "subject" | "composite";
  buffer: Buffer;
  mimeType: string;
  width: number;
  height: number;
}

export interface AdapterCapabilities {
  referenceImages: boolean;
  negativePrompt: boolean;
  aspectRatio: boolean;
  transparentBackground: boolean;
  editMode: boolean;
}

export interface ImageModelAdapter {
  id: string;
  supports: AdapterCapabilities;
  compile(spec: ResolvedVisualSpec): CompiledGenerationRequest;
  generate(request: CompiledGenerationRequest): Promise<GeneratedLayer[]>;
}
