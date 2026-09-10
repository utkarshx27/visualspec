import {
  ImageModelAdapter,
  AdapterCapabilities,
  CompiledGenerationRequest,
  GeneratedLayer,
} from "../types/adapter.js";
import { ResolvedVisualSpec } from "../types/spec.js";

export abstract class BaseImageAdapter implements ImageModelAdapter {
  abstract id: string;
  abstract supports: AdapterCapabilities;

  abstract compile(spec: ResolvedVisualSpec): CompiledGenerationRequest;
  abstract generate(request: CompiledGenerationRequest): Promise<GeneratedLayer[]>;
}
