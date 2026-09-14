import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, RotateCcw, Award, Target } from 'lucide-react';
import Seo from '../components/Seo';
import PassageComparison from '../components/results/PassageComparison';
import ScoreShareButtons from '../components/results/ScoreShareButtons';
import SignupPromptBanner from '../components/SignupPromptBanner';
import { readTypingResult } from '../lib/typingResult';

// Same approximate percentile curve used previously in the results popup —
// kept local since this is now the only place it's shown.
const WPM_PERCENTILE_ANCHORS: Array<[number, number]> = [
  [0, 1], [10, 3], [20, 15], [30, 32], [40, 52], [50, 70], [60, 82], [70, 90], [80, 95], [90, 97], [100, 99],
];
function wpmPercentile(wpm: number): number {
  if (wpm <= 0) return 1;
  const a = WPM_PERCENTILE_ANCHORS;
  if (wpm >= a[a.length - 1][0]) return 99;
  for (let i = 1; i < a.length; i++) {
    if (wpm <= a[i][0]) {
      const [x0, y0] = a[i - 1];
      const [x1, y1] = a[i];
      return Math.round(y0 + ((wpm - x0) / (x1 - x0)) * (y1 - y0));
    }
  }
  return 99;
}

/**
 * Full detail behind the short results popup — every stat, plus the original
 * passage and what was actually typed side by side. Same-session only: fed
 * from sessionStorage written right before navigating here, never a backend
 * round trip, so this page is intentionally not a permalink other people can
 * open (see docs/plan for that scope decision).
 */
export default function TypingReportPage() {
  const result = useMemo(readTypingResult, []);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
        <Seo title="Typing Report | FastTypingLab" description="Detailed typing test report." noindex />
        <div className="text-center max-w-sm">
          <p className="text-brand-text font-bold mb-1">No recent test result to show</p>
          <p className="text-brand-muted text-sm mb-4">Reports are only available right after finishing a test.</p>
          <Link to="/tests/" className="inline-flex items-center gap-1.5 text-brand-primary font-bold text-sm hover:underline">
            Browse tests →
          </Link>
        </div>
      </div>
    );
  }

  const wordCount = result.passage.trim().split(/\s+/).filter(Boolean).length;
  const charCount = result.passage.length;

  const statTiles: Array<{ label: string; value: string | number }> = [
    { label: 'Gross WPM', value: result.wpm },
    { label: 'Net WPM', value: result.netWpm },
    { label: 'CPM', value: result.cpm },
    { label: 'Accuracy', value: `${result.accuracy}%` },
    { label: 'Characters', value: charCount },
    { label: 'Words', value: wordCount },
    { label: 'Errors', value: result.errors },
    { label: 'Time', value: `${result.elapsedSeconds}s` },
    ...(result.consistency !== null ? [{ label: 'Consistency', value: `${result.consistency}%` }] : []),
  ];

  const weakKeys = useMemo(() => {
    if (result.mistakes.length === 0) return [];
    const counts = new Map<string, number>();
    result.mistakes.forEach(idx => {
      const ch = result.passage[idx];
      if (!ch) return;
      const key = ch === ' ' ? '␣' : ch;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [result]);

  return (
    <div className="h-[100dvh] overflow-hidden flex flex-col bg-brand-bg text-brand-text">
      <Seo
        title={`Typing Report — ${result.netWpm} WPM | FastTypingLab`}
        description={`${result.netWpm} WPM, ${result.accuracy}% accuracy on ${result.testTitle}.`}
        noindex
      />

      {/* Header */}
      <div className="shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 h-12 border-b border-brand-border bg-brand-surface">
        <Link to="/tests/" className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text transition-colors text-sm font-medium">
          <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back</span>
        </Link>
        <h1 className="text-sm font-semibold truncate max-w-[50%]">{result.testTitle}</h1>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-white shrink-0"
          style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>
          ⚡ Top ~{wpmPercentile(result.netWpm)}%
        </div>
      </div>

      {/* Stat row */}
      <div className="shrink-0 grid grid-cols-4 sm:[grid-template-columns:repeat(auto-fit,minmax(80px,1fr))] gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5">
        {statTiles.map(s => (
          <div key={s.label} className="bg-brand-surface-2 border border-brand-border rounded-xl px-2 py-1.5 text-center">
            <div className="text-sm sm:text-base font-black font-mono text-brand-text leading-tight">{s.value}</div>
            <div className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-brand-muted">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Passage comparison — the only part that scrolls, internally, per panel */}
      <div className="flex-1 min-h-0 px-3 sm:px-6 pb-2">
        <PassageComparison passage={result.passage} typed={result.typed} mistakes={result.mistakes} skipped={result.skipped} />
      </div>

      {/* Weak keys, if any */}
      {weakKeys.length > 0 && (
        <div className="shrink-0 px-3 sm:px-6 pb-2 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-muted">Keys to practice:</span>
          {weakKeys.map(([ch, count]) => (
            <span key={ch} className="inline-flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 text-rose-500 px-2 py-0.5 rounded-lg text-xs font-mono font-bold">
              {ch}<span className="text-[9px] font-sans opacity-70">×{count}</span>
            </span>
          ))}
          <Link
            to={`/typing-drills/?keys=${encodeURIComponent(weakKeys.map(([ch]) => ch).join(','))}`}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:underline ml-1"
          >
            <Target className="w-3 h-3" /> Drill these →
          </Link>
        </div>
      )}

      {/* Signup nudge — lowest priority, self-hides for logged-in visitors */}
      <div className="shrink-0 px-3 sm:px-6 pb-2">
        <SignupPromptBanner
          dismissKey="signupPromptReport"
          message={`${result.netWpm} WPM at ${result.accuracy}% — create a free account to save this and track your progress.`}
          cta="Save my result"
        />
      </div>

      {/* Footer actions */}
      <div className="shrink-0 border-t border-brand-border bg-brand-surface px-3 sm:px-6 py-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex-1">
          <ScoreShareButtons wpm={result.netWpm} accuracy={result.accuracy} challengeUrl={result.challengeUrl} />
        </div>
        <div className="flex gap-2 shrink-0">
          <Link
            to={`/certificate?wpm=${result.netWpm}&acc=${result.accuracy}&title=${encodeURIComponent(result.testTitle)}`}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 border border-brand-border text-brand-muted hover:text-brand-primary px-3 py-2.5 rounded-xl text-sm font-bold transition-colors"
          >
            <Award className="w-4 h-4" /> <span className="hidden sm:inline">Certificate</span>
          </Link>
          <Link
            to="/typing-test/"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-white px-3 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}
          >
            <RotateCcw className="w-4 h-4" /> <span className="hidden sm:inline">Try Again</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
