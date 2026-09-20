import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { API_URL } from '../lib/api';

// Keys must match what each game passes to saveGameScore().
const TRACKED = [
  { key: 'wordrain', label: 'Word Rain', unit: 'pts' },
  { key: 'zombie', label: 'Zombie Typing', unit: 'pts' },
  { key: 'speedracer', label: 'Speed Racer', unit: 'WPM' },
] as const;

interface Row {
  rank: number;
  user: string;
  score: number;
  date: string;
}

/** Top-10 real scores per game, from GET /api/game-scores/leaderboard. */
export default function GameLeaderboard() {
  const [game, setGame] = useState<(typeof TRACKED)[number]>(TRACKED[0]);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setRows(null);
    setFailed(false);
    fetch(`${API_URL}/api/game-scores/leaderboard?game=${game.key}`)
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(d => { if (!cancelled) setRows(Array.isArray(d) ? d : []); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [game]);

  return (
    <div className="mt-10 bg-brand-surface border border-brand-border rounded-2xl p-5">
      <h2 className="font-bold text-brand-text mb-3 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-amber-500" /> Top Scores
      </h2>
      <div className="flex flex-wrap gap-1.5 mb-4" role="tablist" aria-label="Choose a game">
        {TRACKED.map(g => (
          <button
            key={g.key}
            role="tab"
            aria-selected={g.key === game.key}
            onClick={() => setGame(g)}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              g.key === game.key ? 'bg-brand-primary text-white' : 'bg-brand-surface-2 text-brand-muted hover:text-brand-text'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {failed ? (
        <p className="text-sm text-brand-muted">Could not load scores right now.</p>
      ) : rows === null ? (
        <div className="h-16 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-brand-muted">No scores yet for {game.label}. Play a round and be first!</p>
      ) : (
        <ol className="divide-y divide-brand-border">
          {rows.map(r => (
            <li key={r.rank} className="flex items-center gap-3 py-2 text-sm">
              <span className="w-7 font-mono font-bold text-brand-muted">#{r.rank}</span>
              <span className="flex-1 font-semibold text-brand-text truncate">{r.user}</span>
              <span className="font-mono font-black text-brand-primary">{r.score} {game.unit}</span>
              <span className="hidden sm:block text-xs text-brand-muted w-16 text-right">
                {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
