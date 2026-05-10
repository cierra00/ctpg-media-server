---
description: "Add a new component section to the CTPG Design System (public/system.html). Use when building a new UI component with both light and dark preview variants."
agent: "agent"
tools: [read, edit, search]
argument-hint: "Component name and description (e.g. 'Pagination — nav links for multi-page content')"
---

# CTPG New Component Section

Add a new component section to `public/system.html` with both light and dark preview variants.

## Step 1: Read Existing Sections
Find the end of the last section in `public/system.html` to understand placement and structure. Read 20 lines of an existing similar section for reference pattern.

## Step 2: Define the Component
Clarify before building:
- **Component name** and section anchor `id`
- **States**: default, hover, active, disabled
- **Variants**: size, color, type
- **Dark mode**: which elements need dark overrides

## Step 3: Add CSS
Add all new CSS rules to the `<style>` block at the top of `system.html`.
- Group new rules under a `/* ===== COMPONENT NAME ===== */` comment
- Use CSS variables for all colors (`var(--teal)`, `var(--navy)`, etc.)
- Add `.component-preview-dark .your-class` overrides for dark mode
- **ZERO inline styles**

CSS naming conventions:
- BEM-style: `.card-feature`, `.card-feature__title`, `.card-feature--active`
- Or simple prefixed: `.ctpg-pill`, `.ctpg-pill-active`

## Step 4: Add HTML Section
Insert the new section after the last existing component. Structure:
```html
<!-- ===== COMPONENT NAME ===== -->
<section id="component-name" class="mb-5">
  <div class="container-fluid">
    <h2 class="section-title">Component Name</h2>
    <p class="section-description">Brief description of the component.</p>

    <!-- Light Preview -->
    <h3 class="preview-label">Light</h3>
    <div class="component-preview mb-4">
      <!-- component demo here -->
    </div>

    <!-- Dark Preview -->
    <h3 class="preview-label">Dark</h3>
    <div class="component-preview-dark mb-5">
      <!-- same component demo here -->
    </div>
  </div>
</section>
```

## Step 5: Add to Navigation
Find the sidebar or TOC navigation and add a link to the new section:
```html
<a class="nav-link" href="#component-name">
  <i class="fas fa-icon-name me-2"></i>Component Name
</a>
```

## Step 6: Verify
1. Take a screenshot — verify light variant renders correctly
2. Take a screenshot — verify dark variant: text visible, contrast acceptable
3. Check responsive: does it collapse correctly on mobile?
4. Confirm no inline styles were introduced

## Step 7: Done
Report:
- New section added at line number X
- CSS rules added at line number Y
- Nav link added at line number Z
