import { useEffect, useState } from 'react';
import { Keyboard } from 'lucide-react';
import { API_URL } from '../lib/api';

interface KeyRow {
  key: string;
  hits: number;
  errors: number;
  avg_ms: number | null;
}

// Keys with fewer attempts than this are shown but not ranked as "weak" --
// one slip on a rarely-typed key is noise, not a weakness.
const MIN_HITS_TO_RANK = 5;

const label = (k: string) => (k === ' ' ? '␣' : k === '\n' ? '↵' : k);

/** Green (never wrong) to red (often wrong). */
function tone(errorRate: number) {
  const hue = Math.max(0, 140 - Math.min(1, errorRate * 4) * 140);
  return {
    background: `hsla(${hue}, 70%, 45%, 0.22)`,
    borderColor: `hsla(${hue}, 70%, 45%, 0.55)`,
  };
}

/**
 * All-time per-key accuracy for the signed-in user, from real typing sessions
 * (GET /api/progress/heatmap). Renders nothing when logged out.
 */
export default function KeyHeatmapCard() {
  const [rows, setRows] = useState<KeyRow[] | null>(null);
  const [failed, setFailed] = useState(false);
  const token = (() => { try { return localStorage.getItem('accessToken'); } catch { return null; } })();

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetch(`${API_URL}/api/progress/heatmap`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then((data: KeyRow[]) => { if (!cancelled) setRows(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [token]);

  if (!token) return null;

  const sorted = (rows ?? []).slice().sort((a, b) => b.hits - a.hits);
  const weakest = (rows ?? [])
    .filter(r => r.hits >= MIN_HITS_TO_RANK && r.errors > 0)
    .sort((a, b) => b.errors / b.hits - a.errors / a.hits)
    .slice(0, 5);
  const slowest = (rows ?? [])
    .filter(r => r.hits >= MIN_HITS_TO_RANK && r.avg_ms)
    .sort((a, b) => (b.avg_ms ?? 0) - (a.avg_ms ?? 0))
    .slice(0, 5);

  return (
    <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
      <h2 className="font-bold text-brand-text mb-1 flex items-center gap-2">
        <Keyboard className="w-4 h-4 text-brand-primary" /> Your Key Heatmap
      </h2>
      <p className="text-xs text-brand-muted mb-4">Built from your real typing tests. Red keys are the ones you miss most.</p>

      {failed ? (
        <p className="text-sm text-brand-muted">Could not load your heatmap right now.</p>
      ) : rows === null ? (
        <div className="h-16 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-brand-muted">
          No key data yet. Finish a typing test while signed in and your heatmap will appear here.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5 mb-4" role="list" aria-label="Per-key accuracy">
            {sorted.map(r => (
              <div
                key={r.key}
                role="listitem"
                title={`${label(r.key)} — ${r.hits} attempts, ${r.errors} wrong${r.avg_ms ? `, avg ${r.avg_ms} ms` : ''}`}
                style={tone(r.errors / r.hits)}
                className="min-w-9 h-9 px-1.5 border rounded-lg flex items-center justify-center font-mono font-bold text-sm text-brand-text"
              >
                {label(r.key)}
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-brand-muted mb-1">Most missed</div>
              {weakest.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {weakest.map(r => (
                    <span key={r.key} className="bg-rose-500/10 border border-rose-500/20 text-rose-500 px-2 py-0.5 rounded-lg font-mono font-bold text-xs">
                      {label(r.key)} <span className="font-sans opacity-70">{Math.round((r.errors / r.hits) * 100)}%</span>
                    </span>
                  ))}
                </div>
              ) : <span className="text-brand-muted text-xs">Not enough data yet.</span>}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-brand-muted mb-1">Slowest</div>
              {slowest.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {slowest.map(r => (
                    <span key={r.key} className="bg-amber-500/10 border border-amber-500/20 text-amber-600 px-2 py-0.5 rounded-lg font-mono font-bold text-xs">
                      {label(r.key)} <span className="font-sans opacity-70">{r.avg_ms}ms</span>
                    </span>
                  ))}
                </div>
              ) : <span className="text-brand-muted text-xs">Not enough data yet.</span>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
