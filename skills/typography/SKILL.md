---
name: typography
description: Skill for deterministic typography hierarchy, font family selection, line budgeting, and contrast rules.
---

# typography

## Purpose
Guarantees crisp, professional, human-grade typographic layout without relying on generative models.

## Family Classes
- `grotesk`: High legibility modern sans-serif (`Inter`, `Segoe UI`, system sans). Ideal for tech, SaaS, product announcements.
- `geometric`: Bold modern geometric sans (`Montserrat`). Ideal for bold headlines and metrics.
- `serif`: Editorial authority (`Playfair Display`, `Georgia`). Ideal for quotes and luxury products.
- `mono`: Code and technical stats (`JetBrains Mono`, `SF Mono`). Ideal for developer tools and terminal visuals.

## Scale Hierarchy
- `3xl` (128px): Massive single metrics or hero numbers.
- `2xl` (96px) / `xl` (72px): Primary headlines.
- `lg` (56px) / `md` (40px): Subtitles, supporting copy, author names.
- `sm` (30px) / `xs` (22px): Badges, category labels, footers.

## Rules
- Enforce `max_lines` on headlines (typically 2–3 lines max).
- Maintain minimum 4.5:1 WCAG contrast between text color and background luminance.
