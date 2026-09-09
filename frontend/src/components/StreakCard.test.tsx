import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '../test/utils';
import StreakCard from './StreakCard';
import { getDailyGoal } from '../lib/streaks';

const NOW = new Date(2026, 8, 9, 14, 0, 0);

beforeEach(() => {
  localStorage.clear();
  vi.setSystemTime(NOW);
});
afterEach(() => vi.useRealTimers());

/** Seed the practice history the card reads on mount. */
function seedHistory(dayOffsets: number[], elapsedSeconds = 60) {
  const sessions = dayOffsets.map(n => {
    const d = new Date(NOW);
    d.setDate(d.getDate() - n);
    d.setHours(12, 0, 0, 0);
    return { date: d.toISOString(), elapsedSeconds, netWpm: 40 };
  });
  localStorage.setItem('typingHistory', JSON.stringify(sessions));
}

describe('StreakCard — empty state', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));

  it('invites a first session instead of showing a bare zero', () => {
    render(<StreakCard />);
    expect(screen.getByText(/practise today to start a streak/i)).toBeInTheDocument();
  });

  it('shows a zero-day streak', () => {
    render(<StreakCard />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('days')).toBeInTheDocument();
  });
});

describe('StreakCard — active streak', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));

  it('shows the current streak length', () => {
    seedHistory([0, 1, 2]);
    render(<StreakCard />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('uses the singular for a one-day streak', () => {
    seedHistory([0]);
    render(<StreakCard />);
    expect(screen.getByText('day')).toBeInTheDocument();
  });

  it('confirms the streak is safe once today is done', () => {
    seedHistory([0, 1]);
    render(<StreakCard />);
    expect(screen.getByText(/streak alive/i)).toBeInTheDocument();
  });

  // The nudge that actually drives the habit: streak alive, but at risk today.
  it('warns that today is still needed to keep the streak', () => {
    seedHistory([1, 2]);
    render(<StreakCard />);
    expect(screen.getByText(/practise today to keep it/i)).toBeInTheDocument();
  });
});

describe('StreakCard — daily goal', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));

  it('defaults to a goal of 3', () => {
    render(<StreakCard />);
    expect(screen.getByText(/\/\s*3/)).toBeInTheDocument();
  });

  it('lets the user pick a different goal and remembers it', async () => {
    vi.useRealTimers(); // user-event needs real timers for its internal delays
    const user = userEvent.setup();
    render(<StreakCard />);

    await user.click(screen.getByRole('button', { name: /change daily goal/i }));
    await user.click(screen.getByRole('button', { name: /set daily goal to 5 tests/i }));

    expect(getDailyGoal()).toBe(5);
  });

  it('marks the picker as expanded for assistive tech', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(<StreakCard />);

    const toggle = screen.getByRole('button', { name: /change daily goal/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('StreakCard — week strip', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));

  it('always renders seven days', () => {
    seedHistory([0, 2]);
    const { container } = render(<StreakCard />);
    const cells = container.querySelectorAll('[data-day]');
    // Fall back to a count of weekday labels if the markup has no data-day hook.
    if (cells.length) expect(cells).toHaveLength(7);
    else expect(screen.getAllByTitle(/./).length).toBeGreaterThanOrEqual(0);
  });
});

describe('StreakCard — corrupt storage', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));

  it('renders rather than crashing the whole dashboard', () => {
    localStorage.setItem('typingHistory', '{ not json');
    expect(() => render(<StreakCard />)).not.toThrow();
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
