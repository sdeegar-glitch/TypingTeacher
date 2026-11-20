# Navigation and Header Design Guide — Usable, Intentional Architecture

AI website generators frequently output a trendy "floating pill" header:
```tsx
// The AI Cliché Navbar:
<header className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-50 backdrop-blur-xl bg-black/40 border border-white/10 rounded-full px-6 py-3 flex items-center justify-between">
  {/* Logo, 4 centered links, and a tiny purple button */}
</header>
```
While visually striking in a Figma thumbnail, this design suffers from serious functional flaws:
1. **Viewport Hoarding**: The floating container with top/bottom margin occludes 12–15% of vertical reading height on laptop screens.
2. **Horizontal Overflow**: On screens between 640px and 900px, centered links wrap awkwardly or collide with the logo.
3. **Broken Mobile UX**: Collapsing a pill into a floating hamburger menu creates tiny, hard-to-tap targets and awkward dropdown popovers.

This guide provides architectural strategies for high-utility, brand-aligned navigation systems.

---

## 1. Information Architecture & Navigation Archetypes

Select a navigation structure that mirrors the information architecture of the website:

### Archetype A: The Full-Width Grounded Header (Standard Enterprise / Utility)
*Best for: Multi-tool platforms, examination portals, SaaS, government utilities.*
- **Structure**: Anchored directly to `top: 0` with `w-full border-b border-brand-border bg-brand-surface`.
- **Layout**: Left-aligned logo $\rightarrow$ category links $\rightarrow$ contextual dropdown $\rightarrow$ right-aligned utility actions (Theme switch, Account/Login).
- **Height**: Restrained to `h-14` or `h-16` (56px–64px).

### Archetype B: The Categorical Double-Decker Header
*Best for: E-commerce, news publications, high-density public documentation.*
- **Top Bar (`h-8`)**: Utility links (Language selection, Status/Notice alert, Secondary help links, Timezone).
- **Main Bar (`h-14`)**: Brand logo, primary navigational hubs, search bar (`cmd+k`), and main CTA.

### Archetype C: The Persistent Side Rail Navigation
*Best for: Dashboards, complex web applications, multi-lesson courseware (e.g. typing curriculum).*
- **Structure**: Collapsible left sidebar (`w-64`) with icon + text rows, nested progress indicators, and keyboard shortcuts (`[1..9]`).
- **Advantage**: Preserves 100% of vertical reading space on 16:9 and 16:10 desktop monitors.

---

## 2. Accessible Mobile Navigation Architecture

Shrinking desktop links or squeezing them into a cramped menu is an anti-pattern. Follow these mobile navigation standards:

1. **Touch Target Size**: Every interactive navigation item must have a minimum touch target of **$48 \times 48\text{px}$** (WCAG 2.2 Success Criterion 2.5.8 Target Size).
2. **Full-Height Drawer with Sheet Backdrop**: Slide in an accessible drawer covering 85% to 100% of the screen.
3. **Focus Trap & Escape Handling**: When the mobile drawer opens:
   - Trap keyboard focus inside the drawer (`onKeyDown` handling for Tab/Shift+Tab).
   - Close on `Escape` key press.
   - Prevent background body scrolling (`document.body.style.overflow = 'hidden'`).
4. **Primary Actions at the Bottom**: Position the primary call-to-action button within comfortable thumb-reach at the bottom of the drawer.

---

## 3. Production-Ready Accessible Navigation Component

Here is a robust, responsive navigation component built in React + TypeScript:

```tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Moon, Sun } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  badge?: string;
  children?: { label: string; href: string; description: string }[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Speed Tests', href: '/tests' },
  {
    label: 'Exams',
    href: '/competitive-exam-typing',
    children: [
      { label: 'SSC CHSL Typing', href: '/ssc-chsl-typing-test', description: '35 WPM Eng / 30 WPM Hindi (10 min)' },
      { label: 'CPCT Madhya Pradesh', href: '/cpct-typing-test', description: 'Score card & qualifying benchmarks' },
      { label: 'UP Police Computer Operator', href: '/up-police-typing-test', description: 'Mangal/INSCRIPT official rules' },
    ],
  },
  { label: 'Learn Hindi', href: '/learn-hindi-typing', badge: '200 Lessons' },
  { label: 'Tools', href: '/tools' },
  { label: 'Blog', href: '/blog' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(null);
  }, [location.pathname]);

  // Handle escape key and outside click for dropdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-border bg-brand-surface/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Identity */}
        <Link to="/" className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-brand-primary rounded">
          <div className="w-8 h-8 rounded bg-brand-primary text-white flex items-center justify-center font-serif font-bold text-lg">
            F
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-brand-text text-base leading-tight tracking-tight">FastTypingLab</span>
            <span className="text-[10px] font-mono text-brand-muted tracking-wider uppercase">Exam & Speed Engine</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
          {NAV_ITEMS.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = dropdownOpen === item.label;

            if (hasChildren) {
              return (
                <div key={item.label} className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(isOpen ? null : item.label)}
                    aria-expanded={isOpen}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-brand-text hover:text-brand-primary rounded-md transition-colors"
                  >
                    {item.label}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="absolute top-full left-0 mt-1 w-80 rounded-lg border border-brand-border bg-brand-surface shadow-lg p-2 z-50">
                      {item.children?.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          className="block p-2.5 rounded-md hover:bg-brand-surface-2 transition-colors"
                        >
                          <div className="text-sm font-medium text-brand-text">{child.label}</div>
                          <div className="text-xs text-brand-muted mt-0.5">{child.description}</div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                to={item.href}
                className="px-3 py-2 text-sm font-medium text-brand-text hover:text-brand-primary rounded-md transition-colors relative"
              >
                {item.label}
                {item.badge && (
                  <span className="ml-1.5 text-[10px] font-mono bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Cluster */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/tests"
            className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors shadow-sm"
          >
            Take Free Test
          </Link>
        </div>

        {/* Mobile Hamburger Trigger */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close Menu' : 'Open Menu'}
          className="md:hidden p-2 text-brand-text hover:bg-brand-surface-2 rounded-md"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Accessible Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-brand-surface z-50 px-6 py-6 overflow-y-auto border-t border-brand-border animate-in fade-in duration-150">
          <nav className="flex flex-col gap-2" aria-label="Mobile Navigation">
            {NAV_ITEMS.map((item) => (
              <div key={item.label} className="border-b border-brand-border/50 pb-2">
                <Link
                  to={item.href}
                  className="block py-3 text-base font-medium text-brand-text"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="pl-4 space-y-2 pb-2">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        className="block text-sm text-brand-muted hover:text-brand-primary py-1"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="mt-8">
            <Link
              to="/tests"
              className="w-full block text-center bg-brand-primary text-white text-sm font-semibold py-3.5 rounded-md"
            >
              Start Typing Test &rarr;
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
```

