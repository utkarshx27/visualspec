import fs from "node:fs";
import sharp from "sharp";
import { CheckResult } from "../types/qa.js";
import { ResolvedVisualSpec } from "../types/spec.js";

export async function validateOutputFile(
  filePath: string,
  spec: ResolvedVisualSpec
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  if (!fs.existsSync(filePath)) {
    results.push({
      checkId: "file_exists",
      name: "Output File Exists",
      passed: false,
      message: `Output file not found at ${filePath}`,
    });
    return results;
  }

  const stat = fs.statSync(filePath);
  const minBytes = 1024;
  results.push({
    checkId: "file_size",
    name: "File Size Non-Trivial",
    passed: stat.size > minBytes,
    message: `File size is ${(stat.size / 1024).toFixed(1)} KB`,
  });

  try {
    const meta = await sharp(filePath).metadata();
    const dimsMatch = meta.width === spec.canvas.width && meta.height === spec.canvas.height;
    results.push({
      checkId: "output_dimensions_match",
      name: "Output Image Dimensions Match Canvas",
      passed: dimsMatch,
      message: dimsMatch
        ? `Output dimensions ${meta.width}x${meta.height} perfectly match spec canvas ${spec.canvas.width}x${spec.canvas.height}`
        : `Output dimensions ${meta.width}x${meta.height} differ from spec canvas ${spec.canvas.width}x${spec.canvas.height}`,
      details: {
        actualWidth: meta.width,
        actualHeight: meta.height,
        expectedWidth: spec.canvas.width,
        expectedHeight: spec.canvas.height,
      },
    });

    results.push({
      checkId: "valid_image_format",
      name: "Valid Image Format Decodable",
      passed: !!meta.format,
      message: `Image decoded cleanly as format: ${meta.format}`,
    });
  } catch (err: any) {
    results.push({
      checkId: "valid_image_format",
      name: "Valid Image Format Decodable",
      passed: false,
      message: `Failed to decode output image: ${err.message}`,
    });
  }

  return results;
}
