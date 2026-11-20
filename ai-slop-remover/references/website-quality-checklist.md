# Website Quality Checklist & 100-Point Scoring Model

This document establishes a rigorous, repeatable audit model for quantifying website design quality before and after refactoring. The scoring system assigns weights based on real-world user perception, brand trust, and technical execution.

---

## 1. The 100-Point Weighted Scoring Framework

| Category | Weight | Key Evaluation Criteria | Slop Penalties (Deductions) |
|---|---:|---|---|
| **1. Visual Originality** | **15%** | Bespoke layout, unique art direction, absence of template cliches | -5 for indigo/purple gradient hero, -5 for floating glow blobs, -5 for repetitive bento grid |
| **2. Typography** | **10%** | Distinctive display/body pairing, proportional fluid scale, line measure ($45\text{--}75\text{ch}$), language support | -4 for Inter/Roboto everywhere, -3 for uncalibrated letter-spacing, -3 for oversized H1 with no editorial justification |
| **3. Hero & First Impression** | **10%** | Clear domain identity, immediate value statement, product-in-action or authentic proof above the fold | -4 for pill badge + centered generic headline, -3 for dual solid/ghost purple buttons, -3 for empty whitespace desert |
| **4. Navigation & IA** | **10%** | Full-width anchored structure, clear hierarchy, accessible mobile drawer, $\ge 48\text{px}$ touch targets | -4 for floating pill navbar, -3 for broken mobile hamburger collapse, -3 for missing active states |
| **5. Layout & Spacing** | **10%** | Modular 4/8px spacing, asymmetric column tension, high-density data tables, vertical rhythm | -4 for identical vertical 3-card sections, -3 for unconstrained full-width text, -3 for arbitrary pixel margins |
| **6. Component Consistency** | **10%** | Standardized buttons, inputs with semantic labels, hairline borders, consistent corner radii ($\le 8\text{px}$) | -4 for exaggerated `rounded-3xl` everywhere, -3 for missing form labels, -3 for glassmorphism card spam |
| **7. Brand Identity & Copy** | **10%** | Specific, factual copy; domain authority; zero fabricated metrics or testimonials | -5 for generic buzzwords ("Elevate your workflow"), -5 for unattributed fake testimonials or stock avatars |
| **8. Responsive Quality** | **10%** | Flawless behavior across 320px–1920px+, zero horizontal overflow, mobile-first thumb zones | -5 for `overflow-x` leaks on mobile, -3 for squished desktop tables, -2 for text clipping |
| **9. Accessibility (WCAG 2.2 AA)** | **10%** | Minimum 4.5:1 text contrast, visible `:focus-visible` outlines, semantic heading hierarchy, screen-reader cues | -4 for low-contrast gray text on dark/glass, -3 for missing focus indicators, -3 for non-semantic `div` buttons |
| **10. Visual Polish & Interactions** | **5%** | Snappy transitions (100–180ms), natural spring easing, tactile feedback, reduced-motion support | -2 for unprompted hover bounces (`scale-105`), -2 for heavy CPU-throttling animations, -1 for missing active states |
| **Total Score** | **100%** | **Target for Certified Transformation: $\ge 88 / 100$** | **AI Slop Baseline is typically $32\text{--}48 / 100$** |

---

## 2. Pre-Flight Audit Checklist (Before Editing)

Run this checklist before modifying source files:
- [ ] **Stack Identified**: Framework, CSS preprocessor/Tailwind version, package manager.
- [ ] **Baseline Captured**: Mobile (390px) and Desktop (1440px) visual states documented.
- [ ] **Active Tests Verified**: Run `npm test` or `vitest run` to confirm baseline test suite passes.
- [ ] **Domain Classified**: Sector matched to [Industry Design Guide](file:///references/industry-design-guide.md).
- [ ] **Slop Tokens Flagged**: Run automated python scanners to locate color and style anti-patterns.
- [ ] **Initial Score Calculated**: Tally deductions across the 10 categories.

---

## 3. Post-Flight Verification Checklist (Before Release)

Run this checklist after implementing the redesign:
- [ ] **Zero Purple Gradient Clichés**: All generic indigo/purple gradients and radial glow blobs eliminated.
- [ ] **Typography Grounded**: Display and body fonts established with proper line-height and character measure.
- [ ] **Hero Communicates Ground Truth**: Product value and domain context clearly stated above the fold.
- [ ] **Navigation Accessible**: Mobile drawer keyboard-trapped, closes on Esc, touch targets $\ge 48\text{px}$.
- [ ] **Layout Diversified**: Bento grid broken into multi-scale asymmetric grids, matrices, or editorial blocks.
- [ ] **Components Standardized**: Unified corner radii, solid surface tokens, and explicit `:focus-visible` rings.
- [ ] **Copy Factual & Human**: Generic marketing filler rewritten into concrete features and instructions.
- [ ] **Zero Horizontal Overflow**: Tested at 320px, 375px, 390px, and 768px viewports.
- [ ] **Contrast Compliant**: Text contrast checked against WCAG 2.2 AA standards ($\ge 4.5:1$).
- [ ] **Functional Integrity**: All routes, auth flows, form handlers, and API calls function identically.
- [ ] **Build Clean**: Build command (`npm run build` or `vite build`) executes without errors.
- [ ] **Final Score Recorded**: Calculate post-transformation score and include in the audit report.

