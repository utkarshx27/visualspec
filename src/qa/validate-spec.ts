import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { VisualSpec } from "../types/spec.js";

export interface SpecValidationResult {
  valid: boolean;
  errors: string[];
}

let validator: any = null;

function getValidator() {
  if (validator) return validator;

  const AjvClass: any = (Ajv as any).default || Ajv;
  const addFormatsFn: any = (addFormats as any).default || addFormats;

  const ajv = new AjvClass({ allErrors: true, verbose: true });
  addFormatsFn(ajv);

  const currentDir = path.dirname(new URL(import.meta.url).pathname);
  const normalized = process.platform === "win32" && currentDir.startsWith("/")
    ? currentDir.slice(1)
    : currentDir;

  const candidateDirs = [
    path.resolve(normalized, "../../schemas/visual-spec.schema.json"),
    path.resolve(normalized, "../schemas/visual-spec.schema.json"),
    path.resolve(process.cwd(), "schemas/visual-spec.schema.json"),
  ];

  let schemaContent = "";
  for (const p of candidateDirs) {
    if (fs.existsSync(p)) {
      schemaContent = fs.readFileSync(p, "utf-8");
      break;
    }
  }

  if (!schemaContent) {
    throw new Error("Could not find schemas/visual-spec.schema.json");
  }

  const schema = JSON.parse(schemaContent);
  validator = ajv.compile(schema);
  return validator;
}

export function validateSpec(spec: unknown): SpecValidationResult {
  const validate = getValidator();
  const valid = validate(spec);

  if (valid) {
    return { valid: true, errors: [] };
  }

  const errors = (validate.errors || []).map((err: any) => {
    const path = err.instancePath || "root";
    return `${path}: ${err.message}`;
  });

  return { valid: false, errors };
}
