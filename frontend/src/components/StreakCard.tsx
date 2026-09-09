import { useMemo, useState } from 'react';
import { Flame, Target, Check } from 'lucide-react';
import { loadPracticeStats, getDailyGoal, setDailyGoal } from '../lib/streaks';

const GOAL_CHOICES = [1, 3, 5, 10];

/**
 * Streak + daily-goal card. Reads straight from practice history, so it shows
 * real activity rather than a claim-a-reward counter.
 */
export default function StreakCard({ compact = false }: { compact?: boolean }) {
  const [goal, setGoal] = useState(() => getDailyGoal());
  const [editingGoal, setEditingGoal] = useState(false);
  const stats = useMemo(() => loadPracticeStats(), []);

  const done = Math.min(stats.todayCount, goal);
  const pct = Math.round((done / goal) * 100);
  const goalMet = stats.todayCount >= goal;
  const minutesToday = Math.round(stats.todaySeconds / 60);

  const chooseGoal = (n: number) => {
    setDailyGoal(n);
    setGoal(n);
    setEditingGoal(false);
  };

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        {/* Streak */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: stats.currentStreak > 0
                ? 'linear-gradient(135deg,#F97316,#FB923C)'
                : 'var(--brand-surface-2)',
            }}
          >
            <Flame className={`w-6 h-6 ${stats.currentStreak > 0 ? 'text-white' : 'text-brand-muted'}`} />
          </div>
          <div>
            <div className="text-2xl font-black text-brand-text leading-none">
              {stats.currentStreak}
              <span className="text-sm font-bold text-brand-muted ml-1">
                {stats.currentStreak === 1 ? 'day' : 'days'}
              </span>
            </div>
            <p className="text-xs text-brand-muted mt-1">
              {stats.currentStreak === 0
                ? 'Practise today to start a streak'
                : stats.practisedToday
                  ? 'Streak alive — nice work'
                  : 'Practise today to keep it'}
            </p>
          </div>
        </div>

        {stats.longestStreak > 0 && (
          <div className="text-right shrink-0">
            <div className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Best</div>
            <div className="text-lg font-black text-brand-text font-mono">{stats.longestStreak}d</div>
          </div>
        )}
      </div>

      {/* Daily goal */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-muted flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" /> Today's goal
          </span>
          <button
            onClick={() => setEditingGoal(v => !v)}
            aria-expanded={editingGoal}
            aria-label={`Change daily goal (currently ${stats.todayCount} of ${goal} tests done)`}
            className="text-[11px] font-bold text-brand-primary hover:underline"
          >
            {stats.todayCount}/{goal} tests
          </button>
        </div>
        <div className="h-2.5 rounded-full bg-brand-surface-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: goalMet
                ? 'linear-gradient(90deg,#22C55E,#4ADE80)'
                : 'linear-gradient(90deg,#304C53,#2A9DAE)',
            }}
          />
        </div>
        <p className="text-[11px] text-brand-muted mt-1.5">
          {goalMet ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
              <Check className="w-3 h-3" /> Goal complete!
              {minutesToday > 0 && ` ${minutesToday} min practised today.`}
            </span>
          ) : (
            `${goal - stats.todayCount} more ${goal - stats.todayCount === 1 ? 'test' : 'tests'} to hit today's goal`
          )}
        </p>

        {editingGoal && (
          <div className="flex items-center gap-2 mt-2.5">
            <span className="text-[11px] text-brand-muted">Set goal:</span>
            {GOAL_CHOICES.map(n => (
              <button
                key={n}
                onClick={() => chooseGoal(n)}
                aria-label={`Set daily goal to ${n} test${n === 1 ? '' : 's'}`}
                aria-pressed={goal === n}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                  goal === n
                    ? 'bg-brand-primary text-white border-transparent'
                    : 'bg-brand-surface-2 border-brand-border text-brand-muted hover:text-brand-text'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Week strip */}
      {!compact && (
        <div className="flex items-center justify-between gap-1.5 pt-3 border-t border-brand-border">
          {stats.week.map(d => (
            <div key={d.key} className="flex flex-col items-center gap-1.5 flex-1">
              <div
                title={d.key}
                className={`w-full h-7 rounded-lg flex items-center justify-center transition-all ${
                  d.active
                    ? 'text-white'
                    : d.isToday
                      ? 'border-2 border-dashed border-brand-border'
                      : 'bg-brand-surface-2'
                }`}
                style={d.active ? { background: 'linear-gradient(135deg,#F97316,#FB923C)' } : undefined}
              >
                {d.active && <Flame className="w-3.5 h-3.5" />}
              </div>
              <span className={`text-[10px] font-bold ${d.isToday ? 'text-brand-primary' : 'text-brand-muted'}`}>
                {d.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
