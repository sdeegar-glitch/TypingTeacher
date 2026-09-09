/**
 * Practice streaks and daily goals, derived from the session history we
 * already store in localStorage under `typingHistory`.
 *
 * Deriving rather than storing a counter means the streak reflects real
 * practice (not a button someone remembered to click), it works retroactively
 * for existing users, and it can never drift out of sync with the history.
 *
 * All day bucketing uses LOCAL dates, not UTC — our audience is largely in
 * IST (UTC+5:30), where a UTC-keyed day would roll over at 5:30am local and
 * wrongly break streaks for anyone practising late at night.
 */

export interface SessionLike {
  date?: string;
  elapsedSeconds?: number;
  netWpm?: number;
}

export interface PracticeStats {
  currentStreak: number;
  longestStreak: number;
  todayCount: number;
  todaySeconds: number;
  practisedToday: boolean;
  /** Last 7 local days, oldest first — for the week strip. */
  week: Array<{ key: string; label: string; active: boolean; isToday: boolean }>;
  totalDays: number;
}

const DAY_MS = 86400000;
const GOAL_KEY = 'ftl_daily_goal';
const DEFAULT_GOAL = 3;

/** Local YYYY-MM-DD for a date (never UTC — see file header). */
export function localDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Daily goal = number of tests to complete per day. */
export function getDailyGoal(): number {
  try {
    const raw = Number(localStorage.getItem(GOAL_KEY));
    if (Number.isFinite(raw) && raw >= 1 && raw <= 20) return Math.round(raw);
  } catch { /* storage blocked */ }
  return DEFAULT_GOAL;
}

export function setDailyGoal(n: number): void {
  const clamped = Math.min(20, Math.max(1, Math.round(n)));
  try { localStorage.setItem(GOAL_KEY, String(clamped)); } catch { /* ignore */ }
}

export function computePracticeStats(sessions: SessionLike[]): PracticeStats {
  const byDay = new Map<string, { count: number; seconds: number }>();

  for (const s of sessions || []) {
    if (!s?.date) continue;
    const d = new Date(s.date);
    if (Number.isNaN(d.getTime())) continue;
    const key = localDayKey(d);
    const entry = byDay.get(key) || { count: 0, seconds: 0 };
    entry.count += 1;
    entry.seconds += Number(s.elapsedSeconds) || 0;
    byDay.set(key, entry);
  }

  const now = new Date();
  const todayKey = localDayKey(now);
  const today = byDay.get(todayKey);

  // Current streak: walk back from today. Practising today is not required to
  // keep a streak alive — if you practised yesterday the streak still stands
  // until today ends, otherwise opening the app in the morning would show 0.
  let currentStreak = 0;
  const startOffset = byDay.has(todayKey) ? 0 : 1;
  for (let i = startOffset; ; i++) {
    const key = localDayKey(new Date(now.getTime() - i * DAY_MS));
    if (byDay.has(key)) currentStreak++;
    else break;
  }

  // Longest streak across all history.
  const sortedKeys = [...byDay.keys()].sort();
  let longestStreak = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const key of sortedKeys) {
    const [y, m, d] = key.split('-').map(Number);
    const cur = new Date(y, m - 1, d);
    if (prev) {
      const gapDays = Math.round((cur.getTime() - prev.getTime()) / DAY_MS);
      run = gapDays === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    if (run > longestStreak) longestStreak = run;
    prev = cur;
  }

  const week: PracticeStats['week'] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * DAY_MS);
    const key = localDayKey(d);
    week.push({
      key,
      label: d.toLocaleDateString(undefined, { weekday: 'narrow' }),
      active: byDay.has(key),
      isToday: i === 0,
    });
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    todayCount: today?.count || 0,
    todaySeconds: today?.seconds || 0,
    practisedToday: !!today,
    week,
    totalDays: byDay.size,
  };
}

/** Reads history straight from localStorage — convenience for pages. */
export function loadPracticeStats(): PracticeStats {
  try {
    const raw = localStorage.getItem('typingHistory');
    return computePracticeStats(raw ? JSON.parse(raw) : []);
  } catch {
    return computePracticeStats([]);
  }
}
