/**
 * Splits text into user-perceived characters (grapheme clusters).
 *
 * Why this matters for Devanagari: `क्षत्रिय` is 8 code points but 3 visible
 * clusters (क्ष | त्रि | य). Styling code points separately (one <span> each)
 * breaks shaping -- vowel signs detach and conjuncts fall apart (W3C
 * "Devanagari Gap Analysis"). Unicode 15.1 (UAX #29) made conjuncts a single
 * cluster and current Blink/WebKit/Gecko implement it, so Intl.Segmenter gives
 * the right unit for colouring, caret placement and per-character feedback.
 *
 * Engines without Intl.Segmenter fall back to code points.
 */

type SegmenterLike = { segment(input: string): Iterable<{ segment: string }> };

let segmenter: SegmenterLike | null | undefined;

function getSegmenter(): SegmenterLike | null {
  if (segmenter !== undefined) return segmenter;
  try {
    const Ctor = (Intl as unknown as { Segmenter?: new (l: string, o: { granularity: string }) => SegmenterLike }).Segmenter;
    segmenter = Ctor ? new Ctor('hi', { granularity: 'grapheme' }) : null;
  } catch {
    segmenter = null;
  }
  return segmenter;
}

const cache = new Map<string, string[]>();
const CACHE_LIMIT = 2000;

/** Grapheme clusters of `text` (code points when Intl.Segmenter is unavailable). */
export function splitClusters(text: string): string[] {
  if (!text) return [];
  const hit = cache.get(text);
  if (hit) return hit;
  const seg = getSegmenter();
  const out = seg ? Array.from(seg.segment(text), s => s.segment) : Array.from(text);
  if (cache.size >= CACHE_LIMIT) cache.clear();
  cache.set(text, out);
  return out;
}

export function clusterCount(text: string): number {
  return splitClusters(text).length;
}

/** Number of Unicode code points (what `String.length` gets wrong for astral characters). */
export function codePointCount(text: string): number {
  let n = 0;
  for (const _ of text) n++; // eslint-disable-line @typescript-eslint/no-unused-vars
  return n;
}
