export type FamilyClass = "grotesk" | "serif" | "mono" | "geometric";
export type TextScale = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
export type TextAlignment = "left" | "center" | "right";
export type ImageFormat = "png" | "jpeg" | "webp";
export type QualitySetting = "high" | "medium" | "low";

export interface TypographySpec {
  family_class?: FamilyClass;
  weight?: 300 | 400 | 500 | 600 | 700 | 800 | 900;
  scale?: TextScale;
  color?: string;
}

export interface TextElement {
  content: string;
  exact?: boolean;
  max_lines?: number;
  placement?: string;
  alignment?: TextAlignment;
  typography?: TypographySpec;
}

export interface BrandPalette {
  primary?: string;
  secondary?: string;
  background?: string;
  text?: string;
  accent?: string;
}

export interface BrandSpec {
  id?: string;
  palette?: BrandPalette;
  logo?: {
    source?: string;
    placement?: string;
  };
}

export interface SubjectSpec {
  description?: string;
  placement?: string;
  prominence?: number;
  details?: string;
}

export interface BackgroundSpec {
  description?: string;
  type?: string;
  style?: string;
  mood?: string;
  texture?: string;
  colors?: string[];
}

export interface CompositionSpec {
  hierarchy?: string[];
  focal_point?: string;
  negative_space?: {
    target?: string;
  };
}

export interface ConstraintSpec {
  required?: string[];
  forbid?: string[];
  preserve?: string[];
  exact?: string[];
}

export interface GenerationSpec {
  image_layers?: string[];
  deterministic_layers?: string[];
  variations?: number;
}

export interface CanvasSpec {
  width: number;
  height: number;
  aspect_ratio?: string;
}

export interface AssetSpec {
  id?: string;
  platform: string;
  type?: string;
  template?: string;
  format?: string;
}

export interface OutputSpec {
  format?: ImageFormat;
  quality?: QualitySetting;
}

export interface VisualSpec {
  version: "0.1";
  asset: AssetSpec;
  canvas?: Partial<CanvasSpec>;
  intent?: {
    objective?: string;
    audience?: string;
    message?: string;
    mood?: string[];
  };
  brand?: BrandSpec;
  subject?: SubjectSpec;
  background?: BackgroundSpec;
  composition?: CompositionSpec;
  text?: Record<string, TextElement>;
  constraints?: ConstraintSpec;
  generation?: GenerationSpec;
  output?: OutputSpec;
}

export interface SafeMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ResolvedVisualSpec extends VisualSpec {
  canvas: CanvasSpec;
  safeMargin: SafeMargin;
  resolvedBrand: Required<BrandPalette>;
  resolvedText: Record<string, Required<TextElement> & { computedBox?: LayoutBox }>;
}

export interface LayoutBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
