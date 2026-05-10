---
description: "Run a full QA visual audit on the CTPG Design System. Checks for horizontal scroll, broken dark mode components, misaligned layouts, and rendering issues across all sections."
agent: "agent"
tools: [read, search, execute]
argument-hint: "Optional: specific section to audit (e.g. 'stats', 'heroes', 'filters')"
---

# CTPG Design System — QA Audit

Run a thorough QA audit on `public/system.html`. Check for visual and technical issues.

## Step 1: Open the Browser
Open `file:///D:/CTPG.com/media-server/public/system.html` if not already open.
Take a full-page screenshot to start.

## Step 2: Horizontal Scroll Check
Run this Playwright check to find any elements overflowing the viewport:
```js
const vw = document.documentElement.clientWidth;
const offenders = [];
document.querySelectorAll('*').forEach(el => {
  const rect = el.getBoundingClientRect();
  if (rect.right > vw + 2) {
    offenders.push({ tag: el.tagName, id: el.id, cls: el.className.toString().slice(0, 60), overflow: Math.round(rect.right - vw) });
  }
});
const body = { scrollWidth: document.body.scrollWidth, clientWidth: document.body.clientWidth };
return JSON.stringify({ offenders: offenders.slice(0, 10), body }, null, 2);
```
**Pass**: `body.scrollWidth === body.clientWidth` and offenders are only offcanvas/decorations (expected).
**Fail**: Any content element with unexpected overflow.

## Step 3: Inline Style Audit
Search for any `style="` attributes in the HTML body:
```
grep -n 'style="' public/system.html | grep -v '<style' | grep -v '<!--'
```
There should be zero results.

## Step 4: Dark Container Checks
For each dark preview section, verify:
- Text is visible (white or light color, NOT navy on navy)
- Filter chips are teal-accented with white text
- Stat numbers use gold or white
- Card borders use teal or subtle rgba

Sections with dark variants: filters, stats, navigation, heroes, cards, badges, alerts, tabs, accordions, tables.

## Step 5: Responsive Layout Check
At viewport widths 375px, 768px, and 1200px verify:
- Stat cards stack to full-width on mobile (`col-12` on xs)
- 4-up grids collapse correctly (`col-sm-6 col-md-3`)
- Hero text is left-aligned (not centered)
- No stat numbers wrap to two lines

## Step 6: Screenshot Sections
Take screenshots of any sections that showed issues in Step 4/5. Report:
- Section name / anchor ID
- Issue found
- Suggested fix (CSS class change or new rule in `<style>` block)

## Step 7: Report
Return a summary:
- ✅ Passed checks
- ❌ Issues found with file line numbers and fix recommendations
- No fixes applied during audit — report only, implement separately
