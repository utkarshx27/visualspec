---
name: visual-spec
description: Skill for drafting and validating standard VisualSpec YAML conforming to schemas/visual-spec.schema.json.
---

# visual-spec

## Purpose
Authors complete, valid VisualSpec YAML documents acting as the single source of truth for downstream rendering and generation.

## Schema Invariants
- `version: "0.1"`
- `asset.platform`: Must match an available platform pack (`instagram`, `linkedin`, `generic-social`).
- `asset.template`: Must correspond to an established template archetype (`product-launch`, `quote-card`, `stat-card`).
- `text`: Every key under `text` must define `content`. Set `exact: true` for brand headlines.
- `generation.image_layers`: Specify which components require model rendering (`background`, `subject`).
- `generation.deterministic_layers`: Specify which components must be rendered by SVG/Sharp (`headline`, `supporting`, `badge`).

## Validation
Always run schema validation before executing pipelines:
```bash
visual validate spec.yaml
```
