// Local (per-browser) practice preferences + completion tracking.
// Powers: remembering the last track & duration (so students don't re-select
// every passage), and marking passages "done" in the list.

const COMPLETED_KEY = 'ftl_completed_tests';
const LAST_DURATION_KEY = 'ftl_last_duration_min';
const LAST_TRACK_KEY = 'ftl_last_track';

function readSet(): Set<string> {
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

/** Mark a passage (by slug or id) as completed. */
export function markTestCompleted(key?: string | null) {
  if (!key) return;
  try {
    const s = readSet();
    s.add(key);
    // Cap the stored list so it can't grow unbounded.
    const arr = Array.from(s).slice(-500);
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(arr));
  } catch {
    /* ignore */
  }
}

export function isTestCompleted(key?: string | null): boolean {
  if (!key) return false;
  return readSet().has(key);
}

export function getCompletedTests(): Set<string> {
  return readSet();
}

// ── Last-used duration (minutes) ──
export function getLastDuration(fallback = 2): number {
  try {
    const v = Number(localStorage.getItem(LAST_DURATION_KEY));
    return v && v > 0 ? v : fallback;
  } catch {
    return fallback;
  }
}
export function setLastDuration(min: number) {
  try { localStorage.setItem(LAST_DURATION_KEY, String(min)); } catch { /* ignore */ }
}

// ── Last-used track / category (e.g. 'english', 'mangal', 'kruti') ──
export function getLastTrack(): string | null {
  try { return localStorage.getItem(LAST_TRACK_KEY); } catch { return null; }
}
export function setLastTrack(id: string) {
  try { localStorage.setItem(LAST_TRACK_KEY, id); } catch { /* ignore */ }
}
