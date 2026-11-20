# Animation and Interaction Guide — Purposeful Motion vs. Jitter

A major symptom of AI-generated websites is "motion pollution":
- Continuous background gradient animations that consume 40% CPU on mobile.
- Exaggerated hover bounces (`hover:scale-105 duration-300`) applied indiscriminately to every card, button, and footer link.
- Particle nets and floating 3D spheres that add zero informative value.
- Jarring scroll-triggered fade-ins that delay content display when a user rapidly scans.

This guide outlines principles of purposeful motion: high-performance, subtle, and functional.

---

## 1. The Three Laws of Functional Web Motion

1. **Motion Must Provide Feedback, Not Decoration**:
   - A button states its response to click (active compression: `scale-98`).
   - A dropdown states where it came from (origin top, 150ms ease-out).
   - A typing test states which word is active through subtle background tinting, not a frantic bouncing cursor.
2. **Restrain Duration to the Human Perception Window**:
   - Micro-interactions (hover, focus, button active): **100ms – 180ms**.
   - Structural transitions (drawers, modal backdrops, accordions): **200ms – 300ms**.
   - *Never use 500ms+ durations for standard UI elements*; it makes the website feel sluggish and unresponsive.
3. **Hardware Acceleration**: Only animate composite-friendly properties: `transform` and `opacity`. Never animate `width`, `height`, `margin`, `top`, or `padding`, as these trigger expensive browser layout recalculations and cause frame drops.

---

## 2. Transition Timing Functions (Easing)

Replace generic `ease-in-out` with natural physics-based spring curves:

```css
:root {
  /* Snappy entrance for modals, menus, and toasts */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);

  /* Natural deceleration for drawers and tabs */
  --ease-out-quad: cubic-bezier(0.25, 1, 0.5, 1);

  /* Subtle elastic settle */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 3. High-Quality Micro-Interaction Recipes

### Recipe A: Tactile Button Press (Natural Resistance)
```css
.btn-tactile {
  transition: transform 120ms var(--ease-out-quad), background-color 150ms ease;
}
.btn-tactile:hover {
  transform: translateY(-1px);
}
.btn-tactile:active {
  transform: translateY(1px) scale(0.99);
}
```

### Recipe B: Structural Card Border Elevation
Instead of floating the card into the user's face with a heavy shadow, shift the hairline border contrast:
```css
.card-structural {
  border: 1px solid var(--color-border-subtle);
  background-color: var(--color-surface-card);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.card-structural:hover {
  border-color: var(--color-border-strong);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
}
```

### Recipe C: Smooth Accessible Accordion / Drawer
```tsx
// Using CSS grid-template-rows for smooth height transition without JavaScript layout calculation
export function AccordionItem({ title, content, isOpen }: AccordionProps) {
  return (
    <div className="border-b border-brand-border">
      <button 
        className="w-full py-4 text-left font-medium text-brand-text flex justify-between items-center"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>&darr;</span>
      </button>
      <div 
        className={`grid transition-all duration-200 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <p className="pb-4 text-sm text-brand-muted leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
}
```

