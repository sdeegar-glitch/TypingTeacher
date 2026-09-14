// Same-session handoff of a just-finished test's full detail from
// TypingTestPage to the /results report — sessionStorage, not a backend
// round trip (same pattern already used for AI-tutor practice text via
// `ftl_practice_text`). Intentionally not a permalink: sessionStorage clears
// on tab close, so a report is only ever visible to the person who just
// finished the test, in that same tab.

export interface StoredTypingResult {
  passage: string;
  typed: string;
  mistakes: number[];
  skipped: number[];
  wpm: number;
  netWpm: number;
  accuracy: number;
  errors: number;
  cpm: number;
  elapsedSeconds: number;
  /** How steady WPM stayed through the test (100 - coefficient of variation), or null if too short a run to compute. */
  consistency: number | null;
  testTitle: string;
  challengeUrl: string;
}

export const RESULT_STORAGE_KEY = 'ftl_last_result';

export function storeTypingResult(result: StoredTypingResult): void {
  try {
    sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(result));
  } catch {
    /* private browsing / storage full — the popup's own numbers still show fine */
  }
}

export function readTypingResult(): StoredTypingResult | null {
  try {
    const raw = sessionStorage.getItem(RESULT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.passage !== 'string' || typeof parsed?.typed !== 'string') return null;
    return parsed as StoredTypingResult;
  } catch {
    return null;
  }
}
