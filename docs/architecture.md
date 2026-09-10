# VisualSpec — System Architecture

## Architecture Overview

```text
                    USER / AI AGENT
                          │
                          ▼
                  +---------------+
                  | Creative Brief|
                  +-------+-------+
                          │
                          ▼
                  +---------------+
                  | Brief Analyzer|
                  +-------+-------+
                          │
                          ▼
                  +---------------+
                  |  Visual Spec  |
                  |  JSON / YAML  |
                  +-------+-------+
                          │
              +-----------+-----------+
              │                       │
              ▼                       ▼
      +---------------+       +---------------+
      | Platform Pack |       | Template Pack |
      +-------+-------+       +-------+-------+
              │                       │
              +-----------+-----------+
                          │
                          ▼
                  +---------------+
                  | Spec Resolver |
                  +-------+-------+
                          │
             +------------+-------------+
             │                          │
             ▼                          ▼
     +---------------+          +------------------+
     | Model Adapter |          | Layout Renderer  |
     | Image Layer   |          | Text / UI Layer  |
     +-------+-------+          +--------+---------+
             │                           │
             +------------+--------------+
                          │
                          ▼
                  +---------------+
                  |   Compositor  |
                  |  (Sharp / SVG)|
                  +-------+-------+
                          │
                          ▼
                  +---------------+
                  |   Visual QA   |
                  +-------+-------+
                          │
                  pass / fail
                    │       │
                    │       ▼
                    │   +----------------+
                    │   | Repair Planner |
                    │   +-------+--------+
                    │           │
                    +-----------+
                          │
                          ▼
                    FINAL ASSET
```

## Layer Separation Principles

### 1. Generative Layers
Delegated to AI image models:
- Background atmospheric glows, textures, landscapes, abstract 3D elements.
- Subject visuals: Products, devices, abstract motifs.
- Models must be given explicit negative prompts to forbid text, labels, and logos.

### 2. Deterministic Layers
Handled directly by SVG and Sharp:
- Exact copy (headlines, quotes, numbers).
- Line wrapping, alignment, and scale calculations.
- Safe margin compliance.
- Badges, pills, frames, borders, and logos.

### 3. Verification & Repair
- Layer 1 (Deterministic): Bounding box collision, safe margins, line counts, exact string match.
- Layer 2 (Semantic Visual QA): Checks for model hallucinations or unwanted objects.
- Repair Loop: Prefers localized typography or layout modifications before triggering expensive image regenerations.
