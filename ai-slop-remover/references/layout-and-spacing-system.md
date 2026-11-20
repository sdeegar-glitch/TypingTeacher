# Layout and Spacing System — Escaping Bento-Grid Fatigue

AI code generators default to two extreme layout anti-patterns:
1. **The Empty Whitespace Desert**: Vast `py-32` (128px) margins separating sections that contain only two sentences, forcing endless scrolling without substantive content.
2. **The Bento-Grid Monotony**: Every section is packaged into rounded, frosted cards arranged in rigid 3x1 or 2x2 grids, regardless of whether the information is a feature list, testimonial, stat, or product screenshot.

This guide provides an intentional layout engine based on proportion, vertical rhythm, and asymmetric grid tension.

---

## 1. The Modular Spacing Scale

Establish a consistent spatial scale based on a 4px/8px geometric progression. Avoid arbitrary values like `mt-[37px]` or `gap-[19px]`.

| Token | Size | Typical Use Case |
|---|---|---|
| `space-1` | 4px | Internal badge padding, tight icon-to-label gaps |
| `space-2` | 8px | Button inline gap, form field vertical label spacing |
| `space-3` | 12px | Compact card padding, table cell padding |
| `space-4` | 16px | Standard component padding, list item gaps |
| `space-6` | 24px | Card container padding, form fieldgroup spacing |
| `space-8` | 32px | Sub-section margins, grid column gutters |
| `space-12` | 48px | Standard section top/bottom padding on mobile |
| `space-16` | 64px | Standard section top/bottom padding on desktop |
| `space-24` | 96px | Hero or major thematic boundary padding (maximum) |

*Rule: Section padding above 96px (`py-24`) is rarely justified and creates cognitive disconnect between sections.*

---

## 2. Breaking the 3-Card Bento Grid

Instead of dropping three identical cards onto every page, choose from structural layout patterns that communicate hierarchy:

### Pattern A: The 8-4 Hero Feature Anchor
Give 66% of the width to the flagship capability, complete with interactive UI or real data, and 33% to secondary support features stacked vertically:
```html
<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
  <!-- Primary Feature (8 cols) -->
  <div class="lg:col-span-8 border border-brand-border rounded-lg p-8 bg-brand-surface">
    <span class="text-xs font-mono uppercase text-brand-primary">Flagship Engine</span>
    <h3 class="text-2xl font-serif font-bold text-brand-text mt-2">Exact Word Alignment & Deduction Scoring</h3>
    <p class="text-brand-muted mt-3 text-sm leading-relaxed max-w-xl">
      We calculate gross words, net words, full mistakes, and half mistakes using official exam rubrics.
    </p>
    <div class="mt-6 border border-brand-border rounded bg-brand-surface-2 p-4 font-mono text-xs">
      <!-- Real interactive calculation sandbox -->
    </div>
  </div>

  <!-- Secondary Stack (4 cols) -->
  <div class="lg:col-span-4 space-y-6">
    <div class="border border-brand-border rounded-lg p-6 bg-brand-surface">
      <h4 class="font-bold text-brand-text text-base">Audio Dictation Mode</h4>
      <p class="text-xs text-brand-muted mt-1">Stenographer Grade C & D transcription practice.</p>
    </div>
    <div class="border border-brand-border rounded-lg p-6 bg-brand-surface">
      <h4 class="font-bold text-brand-text text-base">Key Mistake Heatmaps</h4>
      <p class="text-xs text-brand-muted mt-1">Locate specific finger fatigue and ligature errors.</p>
    </div>
  </div>
</div>
```

### Pattern B: The High-Density Comparison Matrix
Replace vague feature cards with a concrete, scannable comparison matrix:
```html
<div class="overflow-x-auto border border-brand-border rounded-lg bg-brand-surface">
  <table class="w-full text-left border-collapse text-sm">
    <thead>
      <tr class="border-b border-brand-border bg-brand-surface-2 font-mono text-xs text-brand-muted uppercase">
        <th class="p-4">Examination</th>
        <th class="p-4">Language / Layout</th>
        <th class="p-4">Benchmark Speed</th>
        <th class="p-4">Duration</th>
        <th class="p-4">Error Tolerance</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-brand-border font-mono text-xs">
      <tr class="hover:bg-brand-surface-2/50 transition-colors">
        <td class="p-4 font-sans font-semibold text-brand-text text-sm">SSC CHSL Tier-II</td>
        <td class="p-4 text-brand-muted">English or Hindi (Inscript/Kruti)</td>
        <td class="p-4 font-bold text-brand-text">35 WPM / 30 WPM</td>
        <td class="p-4 text-brand-muted">10 Minutes</td>
        <td class="p-4 text-brand-muted">Max 7% errors (UR)</td>
      </tr>
      <tr class="hover:bg-brand-surface-2/50 transition-colors">
        <td class="p-4 font-sans font-semibold text-brand-text text-sm">MP CPCT</td>
        <td class="p-4 text-brand-muted">Hindi (Remington Gail) + English</td>
        <td class="p-4 font-bold text-brand-text">20 WPM (Hin) / 30 WPM (Eng)</td>
        <td class="p-4 text-brand-muted">15 Min each</td>
        <td class="p-4 text-brand-muted">Scaled percentile score</td>
      </tr>
    </tbody>
  </table>
</div>
```

### Pattern C: The Editorial Pull-Quote with Embedded Data
Break vertical monotony with an expansive, typographically authoritative editorial statement:
```html
<section class="py-16 border-y border-brand-border bg-brand-surface-2">
  <div class="max-w-4xl mx-auto px-6 text-center">
    <div class="text-xs font-mono uppercase tracking-widest text-brand-muted mb-4">
      Engine Benchmark Standard
    </div>
    <blockquote class="text-2xl sm:text-3xl font-serif font-medium text-brand-text leading-snug">
      &ldquo;A candidate who types 45 WPM in standard online tests frequently fails SSC exams because online tests ignore backspace penalties and official word-omission deduction rules.&rdquo;
    </blockquote>
    <div class="mt-6 flex items-center justify-center gap-4 text-xs font-mono text-brand-muted">
      <span>FastTypingLab Scoring Manifesto</span>
      <span>&middot;</span>
      <span>Verified Against NTA Guidelines</span>
    </div>
  </div>
</section>
```

---

## 3. Container Width Disciplines

Avoid stretching content across 1920px displays without max-width constraints:
- **Article / Long-Form Reading**: `max-w-3xl` (approx. 768px / 65ch line measure).
- **Application Workspaces & Typing Test Areas**: `max-w-5xl` (approx. 1024px) to keep metrics and test passage in the user's primary field of foveal vision.
- **Global Marketing & Multi-Column Pages**: `max-w-7xl` (1280px) with generous horizontal padding (`px-4 sm:px-6 lg:px-8`).

