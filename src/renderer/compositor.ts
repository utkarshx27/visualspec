import sharp from "sharp";
import { ResolvedVisualSpec } from "../types/spec.js";
import { renderSvg } from "./render.js";

export interface CompositeOptions {
  baseImageBuffer?: Buffer;
}

export async function compositeAsset(
  spec: ResolvedVisualSpec,
  options: CompositeOptions = {}
): Promise<Buffer> {
  const { canvas } = spec;
  const output = spec.output || { format: "png", quality: "high" };
  const width = canvas.width;
  const height = canvas.height;

  if (options.baseImageBuffer) {
    // 1. Process base generative image (resize to fit canvas)
    const baseProcessed = await sharp(options.baseImageBuffer)
      .resize(width, height, { fit: "cover", position: "center" })
      .toBuffer();

    // 2. Render deterministic SVG overlay (without background fill)
    const overlaySvg = renderSvg(spec, { includeBackground: false });
    const svgBuffer = Buffer.from(overlaySvg, "utf-8");

    // 3. Composite overlay on top of base image
    let pipeline = sharp(baseProcessed).composite([
      {
        input: svgBuffer,
        top: 0,
        left: 0,
      },
    ]);

    if (output.format === "jpeg") {
      return await pipeline.jpeg({ quality: output.quality === "high" ? 92 : 80 }).toBuffer();
    } else if (output.format === "webp") {
      return await pipeline.webp({ quality: output.quality === "high" ? 92 : 80 }).toBuffer();
    } else {
      return await pipeline.png({ compressionLevel: 9 }).toBuffer();
    }
  } else {
    // Pure deterministic render (standalone with full background styling)
    const fullSvg = renderSvg(spec, { includeBackground: true });
    const svgBuffer = Buffer.from(fullSvg, "utf-8");

    let pipeline = sharp(svgBuffer);
    if (output.format === "jpeg") {
      return await pipeline.jpeg({ quality: output.quality === "high" ? 92 : 80 }).toBuffer();
    } else if (output.format === "webp") {
      return await pipeline.webp({ quality: output.quality === "high" ? 92 : 80 }).toBuffer();
    } else {
      return await pipeline.png().toBuffer();
    }
  }
}
