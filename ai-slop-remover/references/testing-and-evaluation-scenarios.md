# Testing and Evaluation Scenarios — Self-Test Matrix

Before deploying or applying the `ai-slop-remover` skill to any client codebase, the skill must be verified against 5 rigorous benchmark scenarios spanning diverse frontend architectures. This document details the test matrix, evaluation criteria, and expected results.

---

## Scenario 1: Generic AI-Generated SaaS Landing Page
- **Stack**: Next.js 15 (App Router), Tailwind CSS v4, TypeScript, Lucide Icons.
- **Initial Slop Profile**:
  - `bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500` used in H1 and CTA.
  - Floating radial glow blobs positioned with `blur-3xl`.
  - Floating pill navbar with `backdrop-blur-md` occluding top content.
  - 3 identical feature cards with star icons and generic "Supercharge your workflow" copy.
  - Baseline Quality Score: **34 / 100**.
- **Refactoring Strategy**:
  1. Replace gradient with high-contrast monochrome + cobalt accent system ([Color Guide Archetype B](file:///references/color-and-visual-identity.md)).
  2. Ground the header to `w-full border-b` with structured navigation.
  3. Transform the hero into an asymmetric Product-in-Action layout featuring a live interactive terminal component ([Hero Archetype 9](file:///references/hero-section-design.md)).
  4. Replace 3-card bento with an 8/4 asymmetric feature grid.
- **Expected Post-Refactor Score**: **$\ge 92 / 100$**.
- **Verification Gate**: `npm run build` succeeds; zero horizontal overflow at 320px; contrast $\ge 4.5:1$.

---

## Scenario 2: Government & Public Information Portal
- **Stack**: React 19 SPA, Vite, Vanilla CSS Modules, Multilingual (English + Hindi).
- **Initial Slop Profile**:
  - Inappropriate dark mode template with neon purple accents on official civil service content.
  - Uncalibrated English-only typography that clips Hindi Devanagari matras and halff-letters.
  - Missing keyboard focus outlines; non-semantic `div` buttons.
  - Baseline Quality Score: **28 / 100**.
- **Refactoring Strategy**:
  1. Switch to Institutional Trust & Deep Navy palette ([Color Guide Archetype D](file:///references/color-and-visual-identity.md)).
  2. Implement dual-script typography (*Plus Jakarta Sans* + *Noto Sans Devanagari*) with 1.65 line height for Devanagari ([Typography Guide](file:///references/typography-and-font-selection.md)).
  3. Redesign navigation with national/state emblem header, language switcher, and accessible breadcrumbs.
  4. Replace marketing cards with high-density circular/gazette notice tables featuring direct PDF links.
- **Expected Post-Refactor Score**: **$\ge 95 / 100$**.
- **Verification Gate**: Full WCAG 2.2 AA compliance; all interactive controls keyboard accessible (`Tab`/`Enter`); screen-reader announcements verified.

---

## Scenario 3: Education & Exam Preparation Hub (e.g. FastTypingLab)
- **Stack**: React 19, Tailwind CSS, Vite, Supabase REST API, Client State hooks.
- **Initial Slop Profile**:
  - Exam cards link to generic typing tests rather than exam-matched engines.
  - Unattributed social proof ("18,000 active students", "Priya S.") with no source.
  - Centered hero with buzzword copy ("Transform your typing speed").
  - Baseline Quality Score: **42 / 100**.
- **Refactoring Strategy**:
  1. Route every exam card to its authentic engine configuration (SSC 10-min, CPCT 15-min, Mangal vs Kruti Dev 010).
  2. Implement Warm Paper & Editorial Clay visual identity ([Color Guide Archetype A](file:///references/color-and-visual-identity.md)).
  3. Embed an interactive typing sandbox directly into the hero section ([Hero Archetype 1](file:///references/hero-section-design.md)).
  4. Replace fake testimonials with factual student test result cards displaying WPM, accuracy, and date.
- **Expected Post-Refactor Score**: **$\ge 94 / 100$**.
- **Verification Gate**: All 287 Vitest unit tests pass; typing keystroke events and accuracy formulas remain 100% intact.

---

## Scenario 4: E-Commerce Storefront
- **Stack**: Vue 3, Nuxt 3, Tailwind CSS.
- **Initial Slop Profile**:
  - Giant hero containing zero products; only an abstract 3D clay rendering of a shopping bag.
  - Unusable mobile filters; product cards with unreadable light-gray price text.
  - Baseline Quality Score: **38 / 100**.
- **Refactoring Strategy**:
  1. High-Contrast Contemporary Artbook aesthetic ([Color Guide Archetype E](file:///references/color-and-visual-identity.md)).
  2. Magazine-inspired hero showing authentic product photography with tactile typography.
  3. Mobile-first sticky bottom cart bar and accessible slide-out filter drawer.
- **Expected Post-Refactor Score**: **$\ge 90 / 100$**.
- **Verification Gate**: Cart checkout state and Vue reactive bindings operate without mutation.

---

## Scenario 5: Data-Intensive Admin Dashboard
- **Stack**: React, Bootstrap 5 / Tailwind, Chart.js, REST API backend.
- **Initial Slop Profile**:
  - Massive pie charts taking up half the viewport.
  - Vast empty margins; low information density.
  - Tables lack horizontal sticky scrolling on mobile.
  - Baseline Quality Score: **45 / 100**.
- **Refactoring Strategy**:
  1. Compact monospace tabular typography (*Geist Mono* / *IBM Plex Mono*).
  2. Replace decorative pie charts with sparklines, tabular heatmaps, and metric deltas.
  3. Implement sticky column data rails for mobile viewports ([Responsive Guide](file:///references/responsive-design-guide.md)).
- **Expected Post-Refactor Score**: **$\ge 93 / 100$**.
- **Verification Gate**: Real-time polling and table pagination execute without latency or DOM re-render lag.

