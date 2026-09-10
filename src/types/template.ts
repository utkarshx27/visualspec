export interface SlotDefinition {
  required?: string[];
  optional?: string[];
}

export interface LayoutSlotConfig {
  region?: string;
  relation?: string;
  alignment?: "left" | "center" | "right";
  prominence?: number;
}

export interface VisualTemplate {
  id: string;
  version?: string;
  name?: string;
  description?: string;
  slots: SlotDefinition;
  layout: Record<string, LayoutSlotConfig>;
  rules?: string[];
}
