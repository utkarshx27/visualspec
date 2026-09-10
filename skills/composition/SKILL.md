---
name: composition
description: Skill for spatial composition, focal points, safe margins, and negative space allocation for multi-layered visual assets.
---

# composition

## Purpose
Ensures visual harmony, readability, and structural balance across both generative background imagery and foreground deterministic typography.

## Key Principles
1. **Negative Space Allocation**: Never place high-contrast generative subjects directly behind text.
   - For upper-left headlines, specify `composition.negative_space.target: upper_left` or `upper_third`.
   - Constrain subjects to `lower_two_thirds` or `lower_center`.
2. **Focal Hierarchy**:
   - Level 1: Primary Headline or Central Metric.
   - Level 2: Core Subject visual.
   - Level 3: Supporting context, subtitle, or badge.
3. **Safe Margins**:
   - Social feeds crop thumbnails or display UI chrome on borders. Never allow text closer than 64px–80px from canvas edges.
