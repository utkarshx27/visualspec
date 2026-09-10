---
name: visual-qa
description: Skill for performing multi-layer quality assurance, checking geometry, safe margins, and constraint compliance.
---

# visual-qa

## Purpose
Inspects generated assets systematically against the Visual Spec before approval or publishing.

## QA Check Protocol
1. **Dimensions Check**: Does image width/height exactly equal requested canvas dimensions?
2. **Safe Margin Check**: Do text boxes stay strictly inside the safe margin zone?
3. **Max Lines Check**: Has the headline exceeded its budget, forcing truncation?
4. **Exact Copy Check**: Does rendered text match `exact: true` specifications verbatim?
5. **Slot Completeness**: Are all required slots populated?

Run via CLI:
```bash
visual check final.png --spec spec.yaml
```
Outputs structured pass/fail results and metrics.
