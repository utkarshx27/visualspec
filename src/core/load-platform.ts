import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { PlatformPack } from "../types/platform.js";

const platformCache = new Map<string, PlatformPack>();

export function getBuiltinPlatformsDir(): string {
  const currentDir = path.dirname(new URL(import.meta.url).pathname);
  // Handle Windows paths starting with /D:/
  const normalized = process.platform === "win32" && currentDir.startsWith("/")
    ? currentDir.slice(1)
    : currentDir;

  const candidateDirs = [
    path.resolve(normalized, "../../platforms"),
    path.resolve(normalized, "../platforms"),
    path.resolve(process.cwd(), "platforms"),
  ];

  for (const dir of candidateDirs) {
    if (fs.existsSync(dir)) {
      return dir;
    }
  }
  return path.resolve(process.cwd(), "platforms");
}

export function loadPlatform(platformName: string, customDir?: string): PlatformPack {
  const normalizedName = platformName.toLowerCase().trim();
  if (platformCache.has(normalizedName)) {
    return platformCache.get(normalizedName)!;
  }

  const platformsDir = customDir || getBuiltinPlatformsDir();
  const filePath = path.join(platformsDir, `${normalizedName}.yaml`);

  if (!fs.existsSync(filePath)) {
    // Fallback to generic-social if platform not found
    const fallbackPath = path.join(platformsDir, "generic-social.yaml");
    if (fs.existsSync(fallbackPath)) {
      const content = fs.readFileSync(fallbackPath, "utf-8");
      const pack = parse(content) as PlatformPack;
      platformCache.set(normalizedName, pack);
      return pack;
    }
    throw new Error(`Platform pack '${platformName}' not found at '${filePath}'`);
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const pack = parse(content) as PlatformPack;
  platformCache.set(normalizedName, pack);
  return pack;
}

export function clearPlatformCache(): void {
  platformCache.clear();
}
