---
name: visual-brief
description: Skill for extracting structured design requirements, brand intent, copy invariants, and negative constraints from natural language creative briefs.
---

# visual-brief

## Purpose
Converts vague or semi-structured user prompts into rigorous creative briefs ready for spec compilation.

## Extraction Checklist
When given a user request, extract or clarify the following:
- **Objective**: (e.g. `product_launch`, `quote`, `statistic`, `educational_post`)
- **Target Platform**: (`instagram`, `linkedin`, `generic-social`)
- **Exact Copy**: Identify mandatory text (headline, subhead, stats) vs flexible copywriting.
- **Visual Subject**: Describe the core physical subject or abstract 3D visual.
- **Brand Palette & Mood**: Identify dark/light mode, primary color accents, aesthetic keywords.
- **Negative Constraints**: Forbidden elements (e.g. `no people`, `no text in image`, `no watermarks`).

## Decision Process
1. If the platform is unspecified, recommend `instagram` (feed portrait 4:5) for consumer/lifestyle or `linkedin` (4:5 / 1:1) for B2B/developers.
2. If exact copy is provided, mark `exact: true`. Never hallucinate or alter user-specified copy.
3. Automatically append `extra_text`, `watermark`, and `fake_ui_labels` to the `forbid` list.
