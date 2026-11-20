# Responsive Design Guide — True Mobile Ergonomics

A frequent tell of AI-generated websites is that mobile design is treated as an afterthought: desktop flexbox containers are simply shrunk down, resulting in microscopic typography, illegible three-column tables crammed into a 360px screen, broken horizontal scrolling (`overflow-x: scroll` leaks), and untappable buttons.

This guide provides engineering standards across 9 target viewports to ensure genuine mobile ergonomics.

---

## 1. The Nine Critical Viewport Targets

Never test on a single desktop monitor. Audit layouts against these 9 representative device categories:

| Target Viewport | Typical Devices | Critical Inspection Points |
|---|---|---|
| **320px** | iPhone SE (1st gen), budget Androids | Minimum scale stress test: zero horizontal overflow, button wrapping |
| **375px** | iPhone mini, iPhone SE (2nd/3rd gen) | Standard compact mobile: single-column forms, comfortable margins |
| **390px** | iPhone 12/13/14/15/16 Pro | Primary mobile benchmark: bottom-sheet navigation, sticky CTAs |
| **430px** | iPhone Pro Max, Galaxy Plus/Ultra | Large handheld: dual-column card grids, thumb-reach zones |
| **768px** | iPad mini, Portrait Android Tablets | The mobile/tablet breakpoint: side rail vs drawer collapse |
| **1024px** | iPad Pro Landscape, Small Laptops | Desktop entry: 12-column grid initialization, table expansion |
| **1280px** | MacBook Air, Standard Desktop Monitors | Standard desktop container (`max-w-7xl`), multi-column sidebars |
| **1440px** | 24" 1080p/1440p Monitors | High-resolution desktop: max-width clamping, negative space balance |
| **1920px+** | 27"+ 4K / Ultrawide Monitors | Ultrawide discipline: preventing full-bleed text line stretch |

---

## 2. Eliminating Horizontal Overflow (`overflow-x` Leaks)

Horizontal scrolling on mobile is almost always caused by one of four preventable coding bugs:

### Bug 1: Hardcoded Element Widths
- **Problem**: `<div className="w-[450px]">` on a 390px mobile screen.
- **Solution**: Always combine with max-width: `w-full max-w-md`.

### Bug 2: Unconstrained Code Snippets or URLs
- **Problem**: A long URL or code string (`api.fasttypinglab.com/api/test_sessions/submit...`) that refuses to wrap.
- **Solution**: Apply `break-words break-all` or container overflow clipping:
  ```css
  .break-text {
    overflow-wrap: anywhere;
    word-break: break-word;
  }
  ```

### Bug 3: Absolute Floating Decorative Blobs
- **Problem**: `absolute -right-32 w-96` hanging outside the document root without container clipping.
- **Solution**: Ensure parent wrapper has `overflow-hidden`:
  ```html
  <div class="relative overflow-hidden w-full">
    <!-- Contained visual elements -->
  </div>
  ```

### Bug 4: Negative Margins Colliding with Container Padding
- **Problem**: `-mx-4` nested inside an unpadded container pushing past viewport edges.

---

## 3. Responsive Data Tables

Cramming a 6-column data table into a smartphone viewport destroys readability. Choose one of two responsive table strategies:

### Strategy A: Responsive Card-Stack Conversion (Best for < 6 Columns)
Convert table rows into standalone key-value cards on mobile viewports:
```tsx
export function ResponsiveExamTable({ data }: { data: ExamRow[] }) {
  return (
    <div>
      {/* Mobile Card Stack (< 768px) */}
      <div className="md:hidden divide-y divide-brand-border border border-brand-border rounded-lg bg-brand-surface">
        {data.map((row) => (
          <div key={row.id} className="p-4 space-y-2">
            <div className="flex justify-between items-start">
              <span className="font-bold text-brand-text text-sm">{row.examName}</span>
              <span className="font-mono text-xs text-brand-primary font-semibold">{row.speedBenchmark}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono text-brand-muted">
              <div><span className="text-brand-text font-medium">Duration:</span> {row.duration}</div>
              <div><span className="text-brand-text font-medium">Error Limit:</span> {row.errorTolerance}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Standard Table (>= 768px) */}
      <div className="hidden md:block overflow-x-auto border border-brand-border rounded-lg bg-brand-surface">
        <table className="w-full text-left border-collapse text-sm">
          {/* Standard <thead> and <tbody> */}
        </table>
      </div>
    </div>
  );
}
```

### Strategy B: Sticky Column Horizontal Rail
Keep the row identifier pinned while allowing secondary data columns to scroll smoothly:
```html
<div class="overflow-x-auto border border-brand-border rounded-lg">
  <table class="w-full text-left text-sm whitespace-nowrap">
    <thead>
      <tr class="bg-brand-surface-2 border-b border-brand-border">
        <th class="sticky left-0 bg-brand-surface-2 p-3 font-semibold text-brand-text z-10 border-r border-brand-border">Exam Name</th>
        <th class="p-3">Language</th>
        <th class="p-3">Speed</th>
        <th class="p-3">Duration</th>
        <th class="p-3">Accuracy</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-brand-border">
      <tr>
        <td class="sticky left-0 bg-brand-surface p-3 font-medium text-brand-text z-10 border-r border-brand-border">SSC CHSL</td>
        <td class="p-3">English</td>
        <td class="p-3 font-bold">35 WPM</td>
        <td class="p-3">10 min</td>
        <td class="p-3">93%</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 4. Thumb-Zone Optimization on Mobile

On handheld smartphones, 75% of one-handed interactions occur in the lower third of the screen ("The Thumb Zone").
- **Sticky Bottom Action Bars**: For critical tasks (e.g., submitting a test, starting an exam, completing checkout), anchor the primary CTA to the bottom of the viewport on screens under 640px:
  ```html
  <div class="sm:hidden fixed bottom-0 left-0 right-0 p-4 border-t border-brand-border bg-brand-surface/95 backdrop-blur z-30">
    <button class="w-full bg-brand-primary text-white py-3.5 rounded-md font-semibold text-sm">
      Start Practice Test Now &rarr;
    </button>
  </div>
  ```
- **Input Spacing & Auto-Zoom Prevention**: Ensure all `<input>`, `<select>`, and `<textarea>` elements have a font size of at least **16px (`1rem`)** on iOS Safari. A font size of 14px triggers an intrusive automatic zoom that disorients the user.

