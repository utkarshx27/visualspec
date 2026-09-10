---
name: visual-repair
description: Skill for diagnosing QA violations and synthesizing minimal targeted repair plans without regenerating entire assets.
---

# visual-repair

## Purpose
Prevents wasteful, expensive regenerations of whole scenes when a simple typography adjustment or layout tweak can fix the issue.

## Repair Hierarchy
1. **Deterministic Text Repair** (Cheapest):
   - Issue: Text line overflow (`max_lines` exceeded) or safe margin violation.
   - Fix: Step typography scale down by one increment (e.g. `xl` → `lg`) and rerender deterministically.
2. **Layout Repositioning**:
   - Issue: Text overlap or safe-margin breach.
   - Fix: Adjust region coordinates or margins and re-composite.
3. **Generative Background Regeneration**:
   - Issue: Unwanted text hallucinated by model or poor contrast.
   - Fix: Strengthen negative prompt and regenerate only the image layer.
4. **Full Recompile**:
   - Issue: Fundamental brief mismatch or conflicting invariants.

Run automated repair:
```bash
visual repair final.png --spec spec.yaml
```
