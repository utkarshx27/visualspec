import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { VisualTemplate } from "../types/template.js";

const templateCache = new Map<string, VisualTemplate>();

export function getBuiltinTemplatesDir(): string {
  const currentDir = path.dirname(new URL(import.meta.url).pathname);
  const normalized = process.platform === "win32" && currentDir.startsWith("/")
    ? currentDir.slice(1)
    : currentDir;

  const candidateDirs = [
    path.resolve(normalized, "../../templates"),
    path.resolve(normalized, "../templates"),
    path.resolve(process.cwd(), "templates"),
  ];

  for (const dir of candidateDirs) {
    if (fs.existsSync(dir)) {
      return dir;
    }
  }
  return path.resolve(process.cwd(), "templates");
}

export function loadTemplate(templateId: string, customDir?: string): VisualTemplate {
  const normalizedId = templateId.toLowerCase().trim();
  if (templateCache.has(normalizedId)) {
    return templateCache.get(normalizedId)!;
  }

  const templatesDir = customDir || getBuiltinTemplatesDir();
  const filePath = path.join(templatesDir, `${normalizedId}.yaml`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Template '${templateId}' not found at '${filePath}'`);
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const template = parse(content) as VisualTemplate;
  templateCache.set(normalizedId, template);
  return template;
}

export function clearTemplateCache(): void {
  templateCache.clear();
}
