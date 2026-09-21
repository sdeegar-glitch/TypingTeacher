/**
 * Pure typing state machine for engine v2.
 *
 * Input model: the hidden textarea's VALUE is the source of truth. After every
 * edit the DOM layer calls applyValue(state, newValue, ...). We diff old vs new
 * by common prefix/suffix, so one code path handles typing, deleting,
 * autocorrect replacements and IME commits -- unlike the v1 engine, which
 * assumed append-only single-key edits.
 *
 * `typed` is kept prefix-aligned with the passage (typed[i] is compared with
 * text[i]), exactly like v1, so heatmap data, PassageComparison and
 * StoredTypingResult keep working. Behaviour preserved from v1:
 *   - skip-word: Space mid-word jumps to the next word; the untyped letters
 *     are marked "skipped" and count as errors (non-strict, practice mode)
 *   - strict mode: a wrong character is rejected (typed unchanged)
 * Fixed vs v1: deleting over a skipped word clears the stale `skipped` marks.
 */

export interface TypingOptions {
  /** Space mid-word skips to the next word (practice mode). Off for exam mode. */
  skipWordOnSpace: boolean;
  /** Reject wrong characters instead of recording them. */
  strict: boolean;
}

export type BackspaceMode = 'full' | 'word' | 'off';

export interface KeyStat {
  key: string;
  hits: number;
  errors: number;
  total_ms: number;
}

export interface TypingState {
  readonly text: string;
  readonly typed: string;
  /** indices auto-filled by skip-word (blue; count as errors) */
  readonly skipped: ReadonlySet<number>;
  /** every accepted character insertion (key depressions) */
  readonly keystrokes: number;
  /** code points removed by editing (corrections) */
  readonly corrections: number;
  /** strict-mode rejections */
  readonly rejected: number;
  readonly keyStats: ReadonlyMap<string, KeyStat>;
  readonly lastKeyAt: number;
}

export function createState(text: string): TypingState {
  return {
    text,
    typed: '',
    skipped: new Set(),
    keystrokes: 0,
    corrections: 0,
    rejected: 0,
    keyStats: new Map(),
    lastKeyAt: 0,
  };
}

const DEVANAGARI_DIGIT_0 = 0x966;
const DEVANAGARI_DIGIT_9 = 0x96f;

/** A Hindi-layout digit (२) typed where the passage has an ASCII digit (2) is correct. */
function mapDigit(expected: string | undefined, ch: string): string {
  if (expected && /[0-9]/.test(expected)) {
    const cp = ch.codePointAt(0)!;
    if (cp >= DEVANAGARI_DIGIT_0 && cp <= DEVANAGARI_DIGIT_9) return String(cp - DEVANAGARI_DIGIT_0);
  }
  return ch;
}

function commonPrefix(a: string, b: string): number {
  const n = Math.min(a.length, b.length);
  let i = 0;
  while (i < n && a.charCodeAt(i) === b.charCodeAt(i)) i++;
  return i;
}

function commonSuffix(a: string, b: string, prefix: number): number {
  const n = Math.min(a.length, b.length) - prefix;
  let i = 0;
  while (i < n && a.charCodeAt(a.length - 1 - i) === b.charCodeAt(b.length - 1 - i)) i++;
  return i;
}

export interface ApplyResult {
  state: TypingState;
  /** true when strict mode refused input: the DOM layer must restore the textarea to state.typed */
  rejected: boolean;
  /** true when state.typed differs from the value we were given (digit mapping, skip-word, strict revert) */
  needsSync: boolean;
}

/**
 * Apply a new textarea value. `now` is a millisecond timestamp (performance.now())
 * used for per-key timing.
 */
export function applyValue(
  prev: TypingState,
  rawValue: string,
  opts: TypingOptions,
  now: number,
): ApplyResult {
  const value = rawValue.replace(/[\r\n]+/g, ' '); // Enter is handled by the DOM layer
  const old = prev.typed;
  if (value === old) return { state: prev, rejected: false, needsSync: rawValue !== old };

  const p = commonPrefix(old, value);
  const s = commonSuffix(old, value, p);
  const removed = old.slice(p, old.length - s);
  const added = value.slice(p, value.length - s);

  // Start from the text kept before the edit point.
  let typed = old.slice(0, p);
  let skipped = new Set([...prev.skipped].filter(i => i < p));
  let keystrokes = prev.keystrokes;
  let rejected = prev.rejected;
  let lastKeyAt = prev.lastKeyAt;
  const keyStats = new Map(prev.keyStats);
  const corrections = prev.corrections + Array.from(removed).length;

  const record = (expected: string, wrong: boolean) => {
    const gap = lastKeyAt ? Math.min(3000, now - lastKeyAt) : 0;
    lastKeyAt = now;
    const ks = keyStats.get(expected);
    const next: KeyStat = ks
      ? { ...ks }
      : { key: expected, hits: 0, errors: 0, total_ms: 0 };
    next.hits += 1;
    if (wrong) next.errors += 1;
    next.total_ms += Math.round(gap);
    keyStats.set(expected, next);
  };

  let strictRejected = false;
  const text = prev.text;

  // Typed text after the edit point is re-appended char by char so skip-word and
  // strict rules apply to it; a pure suffix (unchanged tail) is kept as-is.
  const tail = old.slice(old.length - s);
  const toAppend = Array.from(added);
  for (const rawCh of toAppend) {
    if (typed.length >= text.length) break; // passage complete: ignore extra input
    const expected = text[typed.length];
    const ch = mapDigit(expected, rawCh);

    if (opts.skipWordOnSpace && !opts.strict && ch === ' ' && expected !== ' ' && expected !== undefined) {
      const nextSpace = text.indexOf(' ', typed.length);
      const skipTo = nextSpace === -1 ? text.length : nextSpace;
      for (let i = typed.length; i < skipTo; i++) skipped.add(i);
      const advanceTo = nextSpace === -1 ? text.length : nextSpace + 1;
      typed += text.slice(typed.length, advanceTo);
      keystrokes += 1; // the Space press itself
      continue;
    }

    const wrong = ch !== expected;
    if (wrong && opts.strict) {
      rejected += 1;
      strictRejected = true;
      record(expected, true);
      continue; // rejected: cursor does not advance
    }
    record(expected, wrong);
    typed += ch;
    keystrokes += 1;
  }

  // Re-attach an unchanged tail only for edits in the middle (rare: autocorrect).
  if (tail && typed.length + tail.length <= text.length && !strictRejected) {
    typed += tail;
  }

  // Drop skipped marks that no longer match what is typed.
  skipped = new Set([...skipped].filter(i => i < typed.length && typed[i] === text[i]));

  const state: TypingState = {
    text, typed, skipped, keystrokes, corrections, rejected, keyStats, lastKeyAt,
  };
  return { state, rejected: strictRejected, needsSync: typed !== rawValue };
}

// ── Derived data ────────────────────────────────────────────────────────────

/** Indices where the typed character differs from the passage (skipped words excluded; they are counted separately). */
export function mistakeIndices(state: TypingState): number[] {
  const out: number[] = [];
  for (let i = 0; i < state.typed.length; i++) {
    if (state.typed[i] !== state.text[i] && !state.skipped.has(i)) out.push(i);
  }
  return out;
}

/** v1-compatible error count: wrong characters + skipped letters (strict mode counts rejections instead). */
export function errorCount(state: TypingState, strict: boolean): number {
  return strict ? state.rejected : mistakeIndices(state).length + state.skipped.size;
}

/** Sorted per-key stats for the heatmap (same shape and cap as v1 getKeyStats). */
export function getKeyStats(state: TypingState): KeyStat[] {
  return [...state.keyStats.values()].sort((a, b) => b.hits - a.hits).slice(0, 200);
}

/** Backspace policy (v1 `canDeleteNow`): full = always, off = never, word = only inside the current word. */
export function canDelete(state: TypingState, mode: BackspaceMode): boolean {
  if (state.typed.length === 0) return false;
  if (mode === 'off') return false;
  if (mode === 'word') return state.typed[state.typed.length - 1] !== ' ';
  return true;
}
