import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  localDayKey,
  getDailyGoal,
  setDailyGoal,
  computePracticeStats,
  loadPracticeStats,
  type SessionLike,
} from './streaks';

// Pin "now" so streak arithmetic is not a function of when CI happens to run.
const NOW = new Date(2026, 8, 9, 14, 0, 0); // 9 Sep 2026, 2pm local

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
});
afterEach(() => vi.useRealTimers());

/** A session N local days before NOW, at a fixed midday to avoid edge effects. */
const daysAgo = (n: number, elapsedSeconds = 60): SessionLike => {
  const d = new Date(NOW);
  d.setDate(d.getDate() - n);
  d.setHours(12, 0, 0, 0);
  return { date: d.toISOString(), elapsedSeconds, netWpm: 40 };
};

describe('localDayKey', () => {
  it('formats a local date as YYYY-MM-DD', () => {
    expect(localDayKey(new Date(2026, 8, 9, 14, 0))).toBe('2026-09-09');
  });

  it('zero-pads single-digit months and days', () => {
    expect(localDayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  // The reason this function exists rather than using toISOString().slice(0,10):
  // 11:30pm IST is already "tomorrow" in UTC, so a UTC key would credit late-night
  // practice to the wrong day and break the streak of exactly the users who
  // practise most.
  it('keys late-night practice to the local day, not the UTC one', () => {
    const lateNight = new Date(2026, 8, 9, 23, 30);
    expect(localDayKey(lateNight)).toBe('2026-09-09');
  });

  it('keys just after local midnight to the new day', () => {
    expect(localDayKey(new Date(2026, 8, 10, 0, 1))).toBe('2026-09-10');
  });
});

describe('computePracticeStats — streaks', () => {
  it('reports zero for no history', () => {
    const s = computePracticeStats([]);
    expect(s.currentStreak).toBe(0);
    expect(s.longestStreak).toBe(0);
    expect(s.practisedToday).toBe(false);
  });

  it('counts today alone as a one-day streak', () => {
    expect(computePracticeStats([daysAgo(0)]).currentStreak).toBe(1);
  });

  it('counts consecutive days', () => {
    const s = computePracticeStats([daysAgo(0), daysAgo(1), daysAgo(2)]);
    expect(s.currentStreak).toBe(3);
  });

  // Opening the app on a morning you have not practised yet must not show a
  // broken streak — yesterday's practice still counts until today ends.
  it('keeps yesterday\'s streak alive before today\'s practice', () => {
    const s = computePracticeStats([daysAgo(1), daysAgo(2)]);
    expect(s.currentStreak).toBe(2);
    expect(s.practisedToday).toBe(false);
  });

  it('breaks the streak after a missed day', () => {
    const s = computePracticeStats([daysAgo(0), daysAgo(1), daysAgo(3)]);
    expect(s.currentStreak).toBe(2);
  });

  it('reports a broken streak as zero when the last practice is old', () => {
    expect(computePracticeStats([daysAgo(5)]).currentStreak).toBe(0);
  });

  it('does not double-count several sessions on one day', () => {
    const s = computePracticeStats([daysAgo(0), daysAgo(0), daysAgo(0)]);
    expect(s.currentStreak).toBe(1);
    expect(s.todayCount).toBe(3);
  });

  it('remembers the longest past streak even after it breaks', () => {
    const s = computePracticeStats([daysAgo(10), daysAgo(11), daysAgo(12), daysAgo(13), daysAgo(0)]);
    expect(s.longestStreak).toBe(4);
    expect(s.currentStreak).toBe(1);
  });

  it('never reports a longest streak below the current one', () => {
    const s = computePracticeStats([daysAgo(0), daysAgo(1)]);
    expect(s.longestStreak).toBeGreaterThanOrEqual(s.currentStreak);
  });
});

describe('computePracticeStats — today totals', () => {
  it('sums seconds practised today only', () => {
    const s = computePracticeStats([daysAgo(0, 60), daysAgo(0, 120), daysAgo(1, 300)]);
    expect(s.todaySeconds).toBe(180);
    expect(s.todayCount).toBe(2);
  });

  it('treats a missing elapsedSeconds as zero rather than NaN', () => {
    const s = computePracticeStats([{ date: NOW.toISOString() }]);
    expect(s.todaySeconds).toBe(0);
    expect(Number.isNaN(s.todaySeconds)).toBe(false);
  });
});

describe('computePracticeStats — malformed input', () => {
  it('skips entries with no date', () => {
    expect(computePracticeStats([{ elapsedSeconds: 60 }]).totalDays).toBe(0);
  });

  it('skips unparseable dates', () => {
    expect(computePracticeStats([{ date: 'not a date' }]).totalDays).toBe(0);
  });

  it('tolerates null entries in stored history', () => {
    const s = computePracticeStats([null as unknown as SessionLike, daysAgo(0)]);
    expect(s.currentStreak).toBe(1);
  });

  it('tolerates a null session list', () => {
    expect(() => computePracticeStats(null as unknown as SessionLike[])).not.toThrow();
  });
});

describe('computePracticeStats — week strip', () => {
  it('always returns exactly 7 days', () => {
    expect(computePracticeStats([]).week).toHaveLength(7);
  });

  it('ends on today', () => {
    const week = computePracticeStats([]).week;
    expect(week[6].isToday).toBe(true);
    expect(week[6].key).toBe(localDayKey(NOW));
  });

  it('marks only the days actually practised', () => {
    const week = computePracticeStats([daysAgo(0), daysAgo(2)]).week;
    expect(week[6].active).toBe(true);
    expect(week[4].active).toBe(true);
    expect(week[5].active).toBe(false);
  });

  it('runs oldest first', () => {
    const week = computePracticeStats([]).week;
    expect(week[0].key < week[6].key).toBe(true);
  });
});

describe('daily goal', () => {
  it('defaults to 3 when nothing is stored', () => {
    expect(getDailyGoal()).toBe(3);
  });

  it('round-trips a saved goal', () => {
    setDailyGoal(5);
    expect(getDailyGoal()).toBe(5);
  });

  it('clamps an absurdly high goal', () => {
    setDailyGoal(500);
    expect(getDailyGoal()).toBe(20);
  });

  it('clamps zero and negatives up to 1', () => {
    setDailyGoal(0);
    expect(getDailyGoal()).toBe(1);
    setDailyGoal(-5);
    expect(getDailyGoal()).toBe(1);
  });

  it('falls back to the default on corrupt storage', () => {
    localStorage.setItem('ftl_daily_goal', 'abc');
    expect(getDailyGoal()).toBe(3);
  });
});

describe('loadPracticeStats', () => {
  it('reads history from localStorage', () => {
    localStorage.setItem('typingHistory', JSON.stringify([daysAgo(0)]));
    expect(loadPracticeStats().currentStreak).toBe(1);
  });

  it('returns empty stats when there is no history', () => {
    expect(loadPracticeStats().currentStreak).toBe(0);
  });

  it('does not throw on corrupt stored history', () => {
    localStorage.setItem('typingHistory', '{ broken json');
    expect(() => loadPracticeStats()).not.toThrow();
    expect(loadPracticeStats().currentStreak).toBe(0);
  });
});
