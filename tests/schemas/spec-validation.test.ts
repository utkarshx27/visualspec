import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { validateSpec } from "../../src/qa/validate-spec.js";

describe("Visual Spec Schema Validation", () => {
  it("validates example product-launch spec successfully", () => {
    const filePath = path.resolve(process.cwd(), "examples/product-launch/spec.yaml");
    const spec = parse(fs.readFileSync(filePath, "utf-8"));
    const result = validateSpec(spec);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("validates example quote-card spec successfully", () => {
    const filePath = path.resolve(process.cwd(), "examples/quote-card/spec.yaml");
    const spec = parse(fs.readFileSync(filePath, "utf-8"));
    const result = validateSpec(spec);
    expect(result.valid).toBe(true);
  });

  it("validates example stat-card spec successfully", () => {
    const filePath = path.resolve(process.cwd(), "examples/stat-card/spec.yaml");
    const spec = parse(fs.readFileSync(filePath, "utf-8"));
    const result = validateSpec(spec);
    expect(result.valid).toBe(true);
  });

  it("rejects specs with missing version", () => {
    const invalidSpec = {
      asset: { platform: "instagram" },
    };
    const result = validateSpec(invalidSpec);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes("version"))).toBe(true);
  });

  it("rejects specs with unsupported version number", () => {
    const invalidSpec = {
      version: "2.0",
      asset: { platform: "instagram" },
    };
    const result = validateSpec(invalidSpec);
    expect(result.valid).toBe(false);
  });

  it("rejects specs with missing asset platform", () => {
    const invalidSpec = {
      version: "0.1",
      asset: { type: "product_launch" },
    };
    const result = validateSpec(invalidSpec);
    expect(result.valid).toBe(false);
  });

  it("rejects specs with illegal canvas dimensions", () => {
    const invalidSpec = {
      version: "0.1",
      asset: { platform: "instagram" },
      canvas: { width: 10, height: 10 }, // Below minimum 100
    };
    const result = validateSpec(invalidSpec);
    expect(result.valid).toBe(false);
  });

  it("rejects specs with invalid text alignment enum", () => {
    const invalidSpec = {
      version: "0.1",
      asset: { platform: "instagram" },
      text: {
        headline: {
          content: "Hello",
          alignment: "diagonal", // Invalid enum
        },
      },
    };
    const result = validateSpec(invalidSpec);
    expect(result.valid).toBe(false);
  });
});
