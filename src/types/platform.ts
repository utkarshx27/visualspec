import { SafeMargin } from "./spec.js";

export interface PlatformFormat {
  width: number;
  height: number;
  aspect_ratio?: string;
  safe_margin?: Partial<SafeMargin>;
}

export interface PlatformGuidance {
  max_primary_text_blocks?: number;
  prefer_large_headline?: boolean;
  mobile_first?: boolean;
  tone?: string;
}

export interface PlatformPack {
  platform: string;
  displayName?: string;
  formats: Record<string, PlatformFormat>;
  guidance?: PlatformGuidance;
  anti_patterns?: string[];
}
