---
name: strict-constraints
description: Skill for categorizing requirements into exact invariants, negative constraints, and aesthetic preferences.
---

# strict-constraints

## Purpose
Agents and generative models tend to treat all prompt clauses as equal suggestions. This skill enforces hard boundaries between invariants and preferences.

## Constraint Taxonomy
1. **Exact Invariants (`exact`)**:
   - Mandatory copy, brand slogans, numbers.
   - Handled exclusively by deterministic renderer.
2. **Hard Negative Constraints (`forbid`)**:
   - `extra_text`: Forbid model from generating words or gibberish.
   - `watermark`: Forbid model watermarks or signatures.
   - `people`: Enforce inanimate product or abstract tech imagery when humans are disallowed.
   - `fake_ui_labels`: Prevent models from hallucinating fake menus or buttons.
3. **Required Elements (`required`)**:
   - Slots that must be present (e.g. `headline`, `subject`).
4. **Soft Preferences**:
   - Mood, lighting tone, color subtleties.
