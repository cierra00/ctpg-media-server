---
description: "Use when editing, auditing, or adding components to public/system.html. Covers all CTPG Design System CSS conventions, component patterns, dark mode overrides, and Bootstrap integration rules."
applyTo: "public/system.html"
---

# CTPG system.html Editing Rules

## File Structure
- Lines 1–~300: `<head>` with `<style>` block (all custom CSS here)
- Lines ~300+: `<body>` with 61 component sections
- Bottom of file: `<script>` block with all JS

## CSS Rules — Non-Negotiable
- **Zero inline `style=""` attributes.** No exceptions.
- All CSS belongs in the `<style>` block at the top of this file.
- Use CSS variables for all brand colors and fonts.

## CSS Variables (`:root`)
```css
--navy: #334155
--navy-dark: #1e293b
--teal: #4ecdc4
--gold: #ffd93d
--coral: #ff5e5e
--coral-light: #ff6b6b
--font-body, --font-heading, --font-mono
--text-primary, --text-secondary, --text-muted
```

## Component Preview Containers
Every component demo must be wrapped in one of:
```html
<div class="component-preview">             <!-- light bg -->
<div class="component-preview bg-white">    <!-- white bg -->
<div class="component-preview-dark mb-5">   <!-- dark/navy bg -->
```

## Dark Mode Overrides
Scope dark overrides under `.component-preview-dark`:
```css
.component-preview-dark .filter-chip { color: #fff; }
```
Never rely on Bootstrap's `data-bs-theme` for dark sections — use the `.component-preview-dark` scope.

## Responsive Grid Pattern
For card/stat grids use: `col-12 col-sm-6 col-md-3`
Always add `h-100` to card wrapper divs for equal height columns.

## Stat / Counter Cards
Use `.stat-card` (flexbox centered, `min-height: 180px`).
Use `.stat-number` for the large number (has `white-space: nowrap` to prevent wrapping).
Use `.stat-label` for the description below.

## Hero Sections
Hero article content (`.hs-article`) should be left-aligned:
- `text-align: left`
- `.hs-h1`, `.hs-excerpt`: `margin: 0 0 ...` (not `0 auto ...`)
- `.hs-meta`, `.hs-actions`: `justify-content: flex-start`

## Offcanvas / Overflow
`overflow-x: hidden` is set on `body` — required to contain Bootstrap offcanvas drawers and decorative blobs that extend beyond the viewport.

## Editing Workflow
1. Read the target section first (at least 10 lines of context)
2. Add new CSS rules to the `<style>` block (keep alphabetical/grouped)
3. Edit HTML with `replace_string_in_file` or `multi_replace_string_in_file`
4. Screenshot and verify in browser before declaring done
5. Check both light and dark preview variants

## Section IDs (for navigation)
Each component section has an anchor `id`. Common ones:
- `#typography`, `#colors`, `#spacing`, `#buttons`, `#forms`
- `#cards`, `#navigation`, `#heroes`, `#stats`, `#filters`
- `#badges`, `#alerts`, `#modals`, `#offcanvas`, `#tabs`
- `#accordions`, `#tables`, `#icons`
