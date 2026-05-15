# CTPG Media Server — Copilot Instructions

## Project Overview
The CTPG media server hosts two active front-end files and serves as the **CDN source** for the WordPress site (future). All CSS and JS remain inline in these files during the prototype phase. Do NOT extract to `src/scss/` or `src/js/` yet — that happens during the componentization phase (see `docs/COMPONENTIZATION_PLAN.md`).

### Active Files
| File | Role | Live URL |
|------|------|----------|
| `public/system.html` | **Component library** — every reusable component with light + dark previews, markup, and class names | `https://media.cruiseandthemeparkguide.com/system.html` |
| `public/home-sample.html` | **Demo page** — full editorial home page prototype using those components | `https://media.cruiseandthemeparkguide.com/home-sample.html` |

**Workflow:** Build and document new components in `system.html` first. Use those components (same class names, same markup) in `home-sample.html`. Both files are standalone — CSS and JS inline only, no imports.

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
- **`system.html`**: Single `<style>` block at the top — all component CSS lives here
- **`home-sample.html`**: Single `<style>` block at the top — all page-level and component CSS lives here
- Do NOT use `src/scss/` until the componentization phase begins
- **CSS Variables** (defined in `:root` in both files):
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
