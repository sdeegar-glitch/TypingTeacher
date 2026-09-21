import { useMemo } from 'react';
import ClusterText from '../ClusterText';

interface PassageComparisonProps {
  passage: string;
  typed: string;
  mistakes: number[];
  skipped: number[];
}

/**
 * The original passage and what was actually typed, side by side. The right panel
 * shows the exact text the user typed (wrong letters included), marked where it
 * differs from the passage, not a re-colouring of the passage. Coloured per
 * grapheme cluster (ClusterText) so Devanagari conjuncts and vowel signs are
 * never split across styled spans.
 *
 * Each panel is a fixed-height box with its own internal scroll for long
 * passages (same pattern a diff viewer uses) — the page around this never
 * scrolls, only the passage text does, within its own bounded region.
 */
export default function PassageComparison({ passage, typed, mistakes, skipped }: PassageComparisonProps) {
  const mistakeSet = useMemo(() => new Set(mistakes), [mistakes]);
  const skipSet = useMemo(() => new Set(skipped), [skipped]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-full min-h-0">
      <div className="flex flex-col min-h-0 bg-brand-surface-2 border border-brand-border rounded-2xl overflow-hidden">
        <p className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-brand-muted px-4 pt-3 pb-1.5">
          Original passage
        </p>
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-3 font-mono text-sm leading-relaxed text-brand-text-muted break-words">
          {passage}
        </div>
      </div>

      <div className="flex flex-col min-h-0 bg-brand-surface-2 border border-brand-border rounded-2xl overflow-hidden">
        <p className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-brand-muted px-4 pt-3 pb-1.5">
          What you typed
        </p>
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-3 font-mono text-sm leading-relaxed break-words whitespace-pre-wrap">
          {typed.length === 0
            ? <span className="text-brand-muted">Nothing was typed.</span>
            : <ClusterText text={typed} typedLength={typed.length} mistakes={mistakeSet} skipped={skipSet} />}
        </div>
      </div>
    </div>
  );
}
