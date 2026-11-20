# Component Redesign Guide — Replacing AI Clichés

When AI assistants generate UI components, they reproduce a narrow set of visual archetypes: pill-shaped buttons with heavy purple drop-shadows, translucent cards with rainbow border strokes, inputs with missing label tags, and repetitive fake testimonials.

This guide provides drop-in, production-grade refactorings for core web components across React, Tailwind, and semantic HTML.

---

## 1. Buttons & Interactive Controls

### The AI Slop Antipattern:
```tsx
// BAD: Purple pill, exaggerated glow, no focus-visible ring
<button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-purple-500/50 hover:scale-105 transition-all">
  Start Now ✨
</button>
```

### The Human-Crafted Refactor:
```tsx
// GOOD: Solid high-contrast token, subtle corner radius, explicit focus-visible ring
export function ButtonPrimary({ children, onClick, disabled }: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-sm font-medium
                 bg-brand-primary text-white hover:bg-brand-primary-hover active:bg-brand-primary-dark
                 disabled:opacity-50 disabled:cursor-not-allowed
                 shadow-sm transition-colors duration-150
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-surface"
    >
      {children}
    </button>
  );
}
```

---

## 2. Cards & Containers

### The AI Slop Antipattern:
```tsx
// BAD: Frosted glass, excessive 24px radius, low-contrast text
<div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-purple-500/50 transition-all">
  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
    <Sparkles />
  </div>
  <h3 className="text-xl font-bold text-white">Smart Analytics</h3>
  <p className="text-gray-400 mt-2">Next-generation insights powered by AI algorithms.</p>
</div>
```

### The Human-Crafted Refactor:
```tsx
// GOOD: Solid surface token, crisp 1px hairline border, structured typographic hierarchy
export function FeatureCard({ kicker, title, description, badge }: CardProps) {
  return (
    <div className="border border-brand-border bg-brand-surface rounded-lg p-6 shadow-sm hover:border-brand-border-strong transition-colors flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-brand-muted">{kicker}</span>
          {badge && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-surface-2 border border-brand-border text-brand-text font-medium">
              {badge}
            </span>
          )}
        </div>
        <h3 className="text-lg font-serif font-bold text-brand-text tracking-tight">{title}</h3>
        <p className="text-sm text-brand-muted mt-2 leading-relaxed">{description}</p>
      </div>
      <div className="mt-6 pt-4 border-t border-brand-border flex items-center text-xs font-medium text-brand-primary">
        <span>Inspect Specifications &rarr;</span>
      </div>
    </div>
  );
}
```

---

## 3. Accessible Form Inputs

### The AI Slop Antipattern:
```html
<!-- BAD: Missing <label>, placeholder used as label, no visible focus ring -->
<div class="relative">
  <input 
    type="text" 
    placeholder="Enter your email..." 
    class="w-full bg-gray-900 border border-gray-800 rounded-full px-6 py-4 text-white focus:outline-none focus:border-purple-500" 
  />
</div>
```

### The Human-Crafted Refactor:
```tsx
// GOOD: Explicit semantic label, error state handling, accessible description, clear focus
export function TextInput({ id, label, error, helperText, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-mono uppercase tracking-wider text-brand-text font-semibold">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        className={`w-full px-3.5 py-2.5 rounded-md text-sm bg-brand-surface border transition-colors
                   text-brand-text placeholder:text-brand-muted
                   focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent
                   ${error ? 'border-red-500 focus:ring-red-500' : 'border-brand-border hover:border-brand-border-strong'}`}
        {...props}
      />
      {error ? (
        <span id={`${id}-error`} className="text-xs text-red-600 dark:text-red-400 font-mono" role="alert">
          {error}
        </span>
      ) : helperText ? (
        <span id={`${id}-helper`} className="text-xs text-brand-muted font-mono">
          {helperText}
        </span>
      ) : null}
    </div>
  );
}
```

---

## 4. Testimonials & Social Proof

### The AI Slop Antipattern:
```html
<!-- BAD: Unverifiable canned quote with fake 5-star emojis -->
<div class="p-6 rounded-2xl bg-gray-900 border border-purple-500/20 text-center">
  <div class="text-yellow-400 text-lg mb-2">⭐⭐⭐⭐⭐</div>
  <p class="text-gray-300 italic">"This platform revolutionized our workflow 10x! Can't imagine working without it."</p>
  <div class="mt-4 font-bold text-white">Sarah Jenkins</div>
  <div class="text-xs text-purple-400">Tech Enthusiast</div>
</div>
```

### The Human-Crafted Refactor:
```tsx
// GOOD: Verifiable student test result with exact numbers, date, and exam target
export function VerifiedResultCard({ candidate, exam, score, date, quote }: ResultProps) {
  return (
    <div className="border border-brand-border bg-brand-surface rounded-lg p-6 shadow-sm">
      <div className="flex items-start justify-between border-b border-brand-border pb-4 mb-4">
        <div>
          <div className="font-sans font-bold text-brand-text text-sm">{candidate}</div>
          <div className="text-xs font-mono text-brand-muted">{exam} · Qualified</div>
        </div>
        <div className="text-right">
          <div className="font-mono font-bold text-brand-primary text-base">{score}</div>
          <div className="text-[10px] font-mono text-brand-muted">{date}</div>
        </div>
      </div>
      <p className="text-sm text-brand-text leading-relaxed">
        &ldquo;{quote}&rdquo;
      </p>
    </div>
  );
}
```

---

## 5. Tabs, Filters & Segmented Controls

### The AI Slop Antipattern:
```html
<!-- BAD: Random floating pills with purple active background -->
<div class="flex gap-2 p-1 bg-gray-900 rounded-full">
  <button class="px-6 py-2 rounded-full bg-purple-600 text-white">Tab 1</button>
  <button class="px-6 py-2 rounded-full text-gray-400">Tab 2</button>
</div>
```

### The Human-Crafted Refactor:
```tsx
// GOOD: Clean tablist with ARIA attributes, keyboard arrow navigation, and underline indicator
export function SegmentedTabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div role="tablist" aria-orientation="horizontal" className="border-b border-brand-border flex gap-6">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={`pb-3 text-sm font-medium transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent rounded-t
              ${isActive ? 'text-brand-primary font-semibold' : 'text-brand-muted hover:text-brand-text'}`}
          >
            {tab.label}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
```

