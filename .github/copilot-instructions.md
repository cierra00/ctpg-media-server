# CTPG Media Server — Copilot Instructions

## Project Overview
This is the **Cruise & Theme Park Guide Design System** — a single-file Bootstrap 5 component library at `public/system.html`. It is ~13,000+ lines and contains every brand component, pattern, and style for CTPG.

## Tech Stack
- **Framework**: Bootstrap 5.3.3 (CDN JS + custom CSS from R2)
- **Custom CSS**: `https://media.cruiseandthemeparkguide.com/css/ctpg-bootstrap.min.css`
- **Icons**: Font Awesome 6 (CDN)
- **Deployment**: Cloudflare R2 — `npm run deploy:r2` (runs `node scripts/upload-to-r2.js`)
- **Live URL**: `https://media.cruiseandthemeparkguide.com`
- **GitHub**: `https://github.com/cierra00/ctpg-media-server.git`, branch `main`
- **NOT Netlify** — all deployment is through Cloudflare R2

## CRITICAL — ZERO INLINE STYLES
**Absolute non-negotiable rule:**
- NEVER add `style="..."` attributes to any HTML element
- ALL styling goes in the `<style>` block at the top of `system.html` or in external `.scss`/`.css` files
- Create proper CSS classes instead of inline styles
- This rule has ZERO exceptions

## CSS Architecture
- **Single `<style>` block** at the top of `public/system.html` — all custom CSS lives here
- **CSS Variables** (defined in `:root`):
  - `--navy: #334155`
  - `--navy-dark: #1e293b`
  - `--teal: #4ecdc4`
  - `--gold: #ffd93d`
  - `--coral: #ff5e5e`
  - `--coral-light: #ff6b6b`
  - `--font-body`, `--font-heading`, `--font-mono`
  - `--text-primary`, `--text-secondary`, `--text-muted`

## Component Preview Containers
- **Light background**: `<div class="component-preview">` or `<div class="component-preview bg-white">`
- **Dark/Navy background**: `<div class="component-preview-dark mb-5">` — navy bg, white text, teal left border
- Always wrap demo content in one of these containers

## File Editing Rules
- Use `replace_string_in_file` or `multi_replace_string_in_file` for ALL edits to `system.html`
- Always read the relevant section before editing
- Include 3–5 lines of unchanged context in `oldString`
- Use `multi_replace_string_in_file` when making multiple independent edits

## Dark Mode Overrides Pattern
When a component needs dark mode styles, scope them under `.component-preview-dark`:
```css
.component-preview-dark .your-component { /* dark overrides */ }
```

## Bootstrap Usage
- Use Bootstrap utility classes where possible (`d-flex`, `gap-2`, `rounded`, etc.)
- Use Bootstrap grid: `col-12 col-sm-6 col-md-3` for responsive 4-up grids
- Use `h-100` on card wrappers for equal height columns
- Bootstrap offcanvas menus naturally sit off-screen — `overflow-x: hidden` on `body` is required

## QA / Verification
- Always take a screenshot with the browser tool after making visual changes
- Verify in both light and dark preview containers when relevant
- Check for horizontal scroll issues with Playwright
- Do not declare something done without visual verification

## Deployment Workflow
1. Make changes to `public/system.html` (or `src/scss/`, `public/images/`, etc.)
2. Run `npm run deploy:r2` to upload to Cloudflare R2
3. `git add . ; git commit -m "message" ; git push origin main`
4. Always get explicit user approval before running `git push`

## Component Sections (61 total)
The system.html file contains sections for: Typography, Color Palette, Spacing, Buttons, Forms, Cards, Navigation, Heroes, Stats, Filters, Badges, Alerts, Modals, Offcanvas, Tabs, Accordions, Tables, Icons, and more. Each section has a light and dark preview variant.
