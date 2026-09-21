import { memo, useMemo } from 'react';
import { splitClusters } from '../lib/graphemes';

export type RunStatus = 'correct' | 'error' | 'skipped' | 'upcoming' | 'current';

export interface Run {
  text: string;
  status: RunStatus;
  /** UTF-16 offset of the run in the passage */
  start: number;
}

/**
 * Colours a passage by grapheme CLUSTER, not code unit. `क्षत्रिय` is 8 code
 * units but 3 visible clusters; giving each code unit its own <span> splits
 * conjuncts and detaches vowel signs (W3C Devanagari Gap Analysis), so a
 * cluster containing any wrong/skipped code unit is styled as a whole, and
 * neighbouring clusters with the same status are merged into one span.
 *
 * `mistakes` / `skipped` are UTF-16 indices into `text`, as produced by the
 * typing engines. `currentIndex` (optional) marks the cluster holding the caret.
 */
export function buildRuns(
  text: string,
  typedLength: number,
  mistakes: ReadonlySet<number>,
  skipped: ReadonlySet<number>,
  currentIndex = -1,
): Run[] {
  const runs: Run[] = [];
  let offset = 0;
  for (const cluster of splitClusters(text)) {
    const end = offset + cluster.length;
    let hasError = false;
    let hasSkip = false;
    for (let i = offset; i < end; i++) {
      if (mistakes.has(i)) hasError = true;
      if (skipped.has(i)) hasSkip = true;
    }
    let status: RunStatus;
    if (currentIndex >= offset && currentIndex < end) status = 'current';
    else if (hasError) status = 'error';
    else if (hasSkip) status = 'skipped';
    else if (offset < typedLength) status = 'correct';
    else status = 'upcoming';

    const last = runs[runs.length - 1];
    if (last && last.status === status && status !== 'current') last.text += cluster;
    else runs.push({ text: cluster, status, start: offset });
    offset = end;
  }
  return runs;
}

const CLASS: Record<RunStatus, string> = {
  correct: 'typing-correct',
  error: 'typing-error',
  skipped: 'typing-skipped',
  upcoming: 'typing-upcoming',
  current: 'typing-current',
};

interface ClusterTextProps {
  text: string;
  typedLength: number;
  mistakes: ReadonlySet<number>;
  skipped: ReadonlySet<number>;
  currentIndex?: number;
}

function ClusterTextImpl({ text, typedLength, mistakes, skipped, currentIndex = -1 }: ClusterTextProps) {
  const runs = useMemo(
    () => buildRuns(text, typedLength, mistakes, skipped, currentIndex),
    [text, typedLength, mistakes, skipped, currentIndex],
  );
  return (
    <>
      {runs.map(r => (
        <span key={r.start} className={CLASS[r.status]} id={r.status === 'current' ? 'current-char' : undefined}>
          {r.text}
        </span>
      ))}
    </>
  );
}

export default memo(ClusterTextImpl);
