/**
 * Weekly Live Test scheduling.
 *
 * The event is deterministic from the date alone — no backend state, no
 * database table, nothing to keep in sync. Everyone who opens the page in a
 * given ISO week sees the same event window, and the passage is picked by
 * hashing the week key against the available test list, so every participant
 * types the identical text. That matters because a shared leaderboard is only
 * fair if everyone typed the same thing.
 *
 * Times are computed in IST (UTC+5:30) since that's where the audience is.
 */

export const LIVE_TEST_DURATION_SEC = 60;

// Sunday 19:00 IST. getUTCDay() on an IST-shifted date gives the IST weekday.
const EVENT_WEEKDAY = 0; // Sunday
const EVENT_HOUR_IST = 19;
/** How long after the start time the event stays "live". */
const EVENT_WINDOW_MIN = 60;

const IST_OFFSET_MS = 5.5 * 3600 * 1000;
const DAY_MS = 86400000;

/** Current time shifted into IST, so getUTC* reads as IST fields. */
function istNow(now: number): Date {
  return new Date(now + IST_OFFSET_MS);
}

/** UTC timestamp of the event for the IST week containing `now`. */
function eventStartFor(now: number): number {
  const ist = istNow(now);
  const dow = ist.getUTCDay();
  // Midnight IST of the current IST day, expressed as a real UTC timestamp.
  const istMidnightUtc =
    Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()) - IST_OFFSET_MS;
  const daysToEvent = (EVENT_WEEKDAY - dow + 7) % 7;
  return istMidnightUtc + daysToEvent * DAY_MS + EVENT_HOUR_IST * 3600 * 1000;
}

export interface LiveTestSchedule {
  /** Start of the upcoming (or in-progress) event, as a Date. */
  start: Date;
  end: Date;
  isLive: boolean;
  msUntilStart: number;
  /** Stable key for the event week, e.g. "2026-W37" — used to pick the passage. */
  weekKey: string;
}

export function getLiveTestSchedule(now: number = Date.now()): LiveTestSchedule {
  let start = eventStartFor(now);
  const windowMs = EVENT_WINDOW_MIN * 60 * 1000;

  // If this week's event has already finished, roll to next week.
  if (now >= start + windowMs) start += 7 * DAY_MS;

  const end = start + windowMs;
  const isLive = now >= start && now < end;

  // Week key from the event date itself, so it's stable for all participants.
  const evIst = istNow(start);
  const weekKey = isoWeekKey(evIst);

  return { start: new Date(start), end: new Date(end), isLive, msUntilStart: start - now, weekKey };
}

/** ISO-8601 week key (YYYY-Www) for an already IST-shifted date. */
export function isoWeekKey(d: Date): string {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week =
    1 + Math.round(((date.getTime() - firstThursday.getTime()) / DAY_MS - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/** Small stable string hash — same input gives the same index everywhere. */
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Deterministically pick this week's passage from a list of tests. */
export function pickWeeklyTest<T>(tests: T[], weekKey: string): T | null {
  if (!tests || tests.length === 0) return null;
  return tests[hashString(weekKey) % tests.length];
}

/** "2d 4h 11m" style countdown text. */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return 'now';
  const totalMin = Math.floor(ms / 60000);
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
