import { describe, it, expect } from 'vitest';
import {
  getLiveTestSchedule,
  isoWeekKey,
  hashString,
  pickWeeklyTest,
  formatCountdown,
  LIVE_TEST_DURATION_SEC,
} from './liveTest';

/**
 * Helper: a UTC timestamp for a given IST wall-clock time. The event is defined
 * in IST, so every fixture here is written the way the audience experiences it.
 */
const ist = (y: number, m: number, d: number, h = 0, min = 0) =>
  Date.UTC(y, m - 1, d, h, min) - 5.5 * 3600 * 1000;

// Sunday 13 September 2026, 19:00 IST — a real event instant.
const EVENT = ist(2026, 9, 13, 19, 0);

describe('getLiveTestSchedule', () => {
  it('points at the coming Sunday from midweek', () => {
    const s = getLiveTestSchedule(ist(2026, 9, 9, 12, 0)); // Wednesday
    expect(s.isLive).toBe(false);
    expect(s.start.getTime()).toBe(EVENT);
  });

  it('is live exactly at the start instant', () => {
    expect(getLiveTestSchedule(EVENT).isLive).toBe(true);
  });

  it('is live 59 minutes in', () => {
    expect(getLiveTestSchedule(EVENT + 59 * 60_000).isLive).toBe(true);
  });

  it('is not live one minute before the start', () => {
    const s = getLiveTestSchedule(EVENT - 60_000);
    expect(s.isLive).toBe(false);
    expect(s.msUntilStart).toBe(60_000);
  });

  // The boundary that decides whether a latecomer sees "live" or "next week".
  it('closes the window exactly 60 minutes after the start', () => {
    expect(getLiveTestSchedule(EVENT + 60 * 60_000).isLive).toBe(false);
  });

  it('rolls to the following Sunday once the window has closed', () => {
    const s = getLiveTestSchedule(EVENT + 61 * 60_000);
    expect(s.isLive).toBe(false);
    expect(s.start.getTime()).toBe(EVENT + 7 * 86400000);
  });

  it('reports an end exactly one hour after the start', () => {
    const s = getLiveTestSchedule(ist(2026, 9, 9, 12, 0));
    expect(s.end.getTime() - s.start.getTime()).toBe(60 * 60_000);
  });

  it('never reports a negative countdown', () => {
    for (const t of [EVENT - 1, EVENT, EVENT + 30 * 60_000, EVENT + 61 * 60_000]) {
      expect(getLiveTestSchedule(t).msUntilStart).toBeGreaterThanOrEqual(0);
    }
  });

  // Saturday 23:59 IST and Sunday 00:01 IST must resolve to the SAME event —
  // an off-by-one here would show two different passages either side of midnight.
  it('does not skip the event when crossing into Sunday', () => {
    const sat = getLiveTestSchedule(ist(2026, 9, 12, 23, 59));
    const sun = getLiveTestSchedule(ist(2026, 9, 13, 0, 1));
    expect(sat.start.getTime()).toBe(EVENT);
    expect(sun.start.getTime()).toBe(EVENT);
    expect(sat.weekKey).toBe(sun.weekKey);
  });

  it('runs the test for one minute', () => {
    expect(LIVE_TEST_DURATION_SEC).toBe(60);
  });
});

describe('isoWeekKey', () => {
  it('formats as YYYY-Www', () => {
    expect(isoWeekKey(new Date(Date.UTC(2026, 8, 13)))).toMatch(/^\d{4}-W\d{2}$/);
  });

  it('gives the same key to every day of one ISO week', () => {
    const mon = isoWeekKey(new Date(Date.UTC(2026, 8, 7)));
    const sun = isoWeekKey(new Date(Date.UTC(2026, 8, 13)));
    expect(mon).toBe(sun);
  });

  it('changes key across a week boundary', () => {
    const wk1 = isoWeekKey(new Date(Date.UTC(2026, 8, 13)));
    const wk2 = isoWeekKey(new Date(Date.UTC(2026, 8, 14)));
    expect(wk1).not.toBe(wk2);
  });
});

describe('hashString', () => {
  it('is deterministic', () => {
    expect(hashString('2026-W37:en')).toBe(hashString('2026-W37:en'));
  });

  it('separates different inputs', () => {
    expect(hashString('2026-W37:en')).not.toBe(hashString('2026-W38:en'));
  });

  it('is always a non-negative integer, since it indexes an array', () => {
    for (const s of ['', 'a', '2026-W37:kruti', '👑 unicode']) {
      const h = hashString(s);
      expect(Number.isInteger(h)).toBe(true);
      expect(h).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('pickWeeklyTest', () => {
  const tests = ['a', 'b', 'c', 'd', 'e'];

  it('returns the same passage for the same week — the fairness guarantee', () => {
    expect(pickWeeklyTest(tests, '2026-W37:en')).toBe(pickWeeklyTest(tests, '2026-W37:en'));
  });

  it('gives each track its own passage', () => {
    const en = pickWeeklyTest(tests, '2026-W37:en');
    const hi = pickWeeklyTest(tests, '2026-W37:kruti');
    expect([en, hi].every(x => tests.includes(x!))).toBe(true);
  });

  it('rotates across weeks rather than pinning one passage forever', () => {
    const picks = new Set(
      Array.from({ length: 20 }, (_, i) => pickWeeklyTest(tests, `2026-W${i}:en`))
    );
    expect(picks.size).toBeGreaterThan(1);
  });

  it('always picks from the supplied list', () => {
    for (let i = 0; i < 30; i++) {
      expect(tests).toContain(pickWeeklyTest(tests, `wk${i}`));
    }
  });

  it('returns null for an empty list instead of throwing', () => {
    expect(pickWeeklyTest([], '2026-W37:en')).toBeNull();
  });

  it('handles a single-item list', () => {
    expect(pickWeeklyTest(['only'], '2026-W37:en')).toBe('only');
  });
});

describe('formatCountdown', () => {
  it('shows days and hours when far out', () => {
    expect(formatCountdown(4 * 86400000 + 11 * 3600000)).toMatch(/4d/);
  });

  it('shows minutes when close', () => {
    expect(formatCountdown(5 * 60_000)).toMatch(/5m/);
  });

  it('does not produce a negative countdown', () => {
    expect(formatCountdown(-1000)).not.toMatch(/-/);
  });
});
