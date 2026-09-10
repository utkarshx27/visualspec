---
name: using-visualspec
description: Master workflow skill for orchestrating structured visual generation, constraint validation, and deterministic layout for AI agents.
---

# using-visualspec

## Purpose
Teaches an AI agent the end-to-end disciplined methodology for creating reliable, platform-ready visual marketing and social assets.

## Core Axiom
**Never generate directly from an ambiguous brief with a single monolithic prompt.**

Always follow the layered pipeline:
`Brief → Visual Spec → Platform Rules → Template → Model Adapter → Generative Image → Deterministic Layout/Text → Visual QA → Targeted Repair → Output Bundle`

## Global Rules
1. **Separate generative layers from deterministic layers**: Never ask an image model (Midjourney, DALL-E, Imagen) to draw headlines, logos, or exact typography. Use image models strictly for backgrounds, lighting, textures, and product photography. Render text and geometry deterministically using SVG/HTML.
2. **First create the Visual Spec**: Capture user intent, brand guidelines, subject position, and negative constraints into a valid `spec.yaml`.
3. **Resolve Platform & Template**: Automatically enforce safe margins, aspect ratios, and visual density limits.
4. **Enforce hard constraints**: Treat `exact: true` copy and `forbid: [...]` items as non-negotiable invariants.
5. **Inspect & Repair**: Check output against QA constraints. Repair localized issues (e.g. adjust typography scale) instead of blindly regenerating the entire scene.

## Available CLI Tools
- `visual brief <file>`: Extract structured design intent from free-text.
- `visual validate <spec.yaml>`: Validate schema.
- `visual resolve <spec.yaml>`: Merge platform and template rules.
- `visual compile <spec.yaml>`: Inspect compiled image prompt.
- `visual render <spec.yaml>`: Render deterministic layers only.
- `visual generate <spec.yaml>`: Run full generative pipeline.
- `visual check <img.png> --spec <spec.yaml>`: Run QA constraint validation.
- `visual repair <img.png> --spec <spec.yaml>`: Apply localized fixes.
