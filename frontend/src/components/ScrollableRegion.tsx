import type { ReactNode } from 'react';

/**
 * A horizontally (or vertically) scrollable box that a keyboard can actually
 * reach.
 *
 * Wide tables get wrapped in `overflow-x-auto` so they don't blow out the
 * mobile layout. But a scroll container whose children are all plain text has
 * no focusable element inside it, so keyboard and switch users cannot scroll
 * it at all — the columns past the fold are simply unreachable. Giving the
 * container a tab stop and a name (WCAG 2.1.1) fixes that.
 *
 * This is deliberately a component rather than a remembered convention: the
 * same defect appeared independently in a dozen places, and it only becomes
 * visible when the content happens to be wider than the viewport, which varies
 * by device and font rendering. Centralising it means the next wide table
 * inherits the fix instead of reintroducing the bug.
 */
export default function ScrollableRegion({
  children,
  label,
  className = '',
  axis = 'x',
}: {
  children: ReactNode;
  /** Describes the content for screen readers, e.g. "Speed requirements table". */
  label: string;
  className?: string;
  axis?: 'x' | 'y';
}) {
  return (
    <div
      tabIndex={0}
      role="region"
      aria-label={label}
      className={`${axis === 'x' ? 'overflow-x-auto' : 'overflow-y-auto'} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
