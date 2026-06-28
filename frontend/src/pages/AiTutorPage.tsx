import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, Brain, Target, Zap, TrendingUp, Award, ChevronRight,
  Loader2, RefreshCw, CheckCircle2, Keyboard,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Seo from '../components/Seo';
import { getTutorPlan, type TutorStats, type TutorPlan } from '../lib/api';

interface HistItem { netWpm?: number; accuracy?: number; lang?: string; date?: string }

function computeStats(): TutorStats | null {
  try {
    const hist: HistItem[] = JSON.parse(localStorage.getItem('typingHistory') || '[]');
    if (!Array.isArray(hist) || hist.length === 0) return null;
    const wpms = hist.map(h => Number(h.netWpm) || 0).filter(n => n > 0);
    if (!wpms.length) return null;
    const accs = hist.map(h => Number(h.accuracy) || 0).filter(n => n > 0);
    const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
    const recent = wpms.slice(-5);
    const delta = recent.length >= 2 ? recent[recent.length - 1] - recent[0] : 0;
    const trend: TutorStats['trend'] = delta > 1 ? 'improving' : delta < -1 ? 'declining' : 'stable';
    const hindi = hist.filter(h => (h.lang || '').toLowerCase().includes('hind')).length;
    return {
      avgWpm: Math.round(avg(wpms)),
      bestWpm: Math.round(Math.max(...wpms)),
      avgAccuracy: accs.length ? Math.round(avg(accs)) : 0,
      totalSessions: hist.length,
      trend,
      hindiShare: Math.round((hindi / hist.length) * 100),
    };
  } catch {
    return null;
  }
}

const trendLabel: Record<TutorStats['trend'], { text: string; cls: string }> = {
  improving: { text: 'Improving ↗', cls: 'text-emerald-500' },
  declining: { text: 'Declining ↘', cls: 'text-rose-500' },
  stable: { text: 'Steady →', cls: 'text-brand-muted' },
};

export default function AiTutorPage() {
  useEffect(() => { document.title = 'AI Typing Tutor — Personalized Improvement Plan | FastTypingLab'; }, []);

  const stats = useMemo(computeStats, []);
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<TutorPlan | null>(null);
  const [error, setError] = useState('');

  async function analyze(forceBeginner = false) {
    setLoading(true);
    setError('');
    try {
      const base: TutorStats = stats ?? { avgWpm: 0, bestWpm: 0, avgAccuracy: 0, totalSessions: 0, trend: 'stable', hindiShare: 0 };
      const res = await getTutorPlan({ ...base, goal: goal.trim() || undefined, ...(forceBeginner ? { avgWpm: 0 } : {}) });
      setPlan(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const statCards = stats && [
    { label: 'Avg WPM', value: stats.avgWpm, icon: Zap, color: 'text-brand-primary' },
    { label: 'Best WPM', value: stats.bestWpm, icon: Award, color: 'text-amber-500' },
    { label: 'Accuracy', value: `${stats.avgAccuracy}%`, icon: Target, color: 'text-brand-accent' },
    { label: 'Sessions', value: stats.totalSessions, icon: TrendingUp, color: 'text-brand-secondary' },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 sm:px-6">
      <Seo
        title="AI Typing Tutor — Personalized Improvement Plan | FastTypingLab"
        description="Get a free, personalized typing improvement plan from our AI tutor. It analyzes your WPM, accuracy and trend, then builds a step-by-step plan and a custom practice passage."
      />
      <div className="max-w-[1100px] mx-auto">

        <div className="flex items-center gap-2 text-xs text-brand-muted mb-6">
          <Link to="/" className="hover:text-brand-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-brand-text">AI Typing Tutor</span>
        </div>

        <PageHeader
          icon={Sparkles}
          gradient="linear-gradient(135deg,#304C53,#2A9DAE)"
          eyebrow="Powered by AI"
          title={<>Your <span className="gradient-text">AI Typing Tutor</span></>}
          subtitle="Analyze your typing and get a personalized, step-by-step plan to type faster and more accurately — tuned to your stats and goals."
        />

        {/* ── Your stats ── */}
        {statCards && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 max-w-2xl mx-auto">
            {statCards.map(s => (
              <div key={s.label} className="bg-brand-surface border border-brand-border rounded-xl p-3 text-center">
                <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
                <div className={`font-black text-xl font-mono ${s.color}`}>{s.value}</div>
                <div className="text-xs text-brand-muted">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── No data yet ── */}
        {!stats && !plan && (
          <div className="max-w-xl mx-auto bg-brand-surface border border-brand-border rounded-2xl p-6 text-center mb-6">
            <Keyboard className="w-8 h-8 mx-auto mb-3 text-brand-muted" />
            <h2 className="font-black text-brand-text mb-1">Take a test first for a tailored plan</h2>
            <p className="text-brand-text-muted text-sm mb-4">The tutor personalizes your plan from your real WPM and accuracy. Take a quick test, then come back — or get a beginner starter plan now.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/tests" className="inline-flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white px-5 py-2.5 rounded-xl font-bold transition-all">
                <Zap className="w-4 h-4" /> Take a typing test
              </Link>
              <button onClick={() => analyze(true)} disabled={loading}
                className="inline-flex items-center justify-center gap-2 border border-brand-border hover:bg-brand-surface-2 text-brand-text px-5 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-60">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />} Beginner starter plan
              </button>
            </div>
          </div>
        )}

        {/* ── Goal + analyze ── */}
        {(stats || plan) && (
          <div className="max-w-2xl mx-auto mb-8">
            <label className="block text-xs font-bold uppercase tracking-wide text-brand-muted mb-1.5">Your goal (optional)</label>
            <input
              value={goal} onChange={e => setGoal(e.target.value)}
              placeholder="e.g. Reach 40 WPM for SSC CHSL, or improve Hindi accuracy"
              className="w-full bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-sm text-brand-text placeholder:text-brand-muted focus:outline-none focus:border-brand-primary/50 mb-3"
            />
            <button onClick={() => analyze()} disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 text-white px-6 py-3.5 rounded-2xl font-bold transition-all active:scale-[.99] disabled:opacity-60 shadow-lg"
              style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing your typing…</>
                : plan ? <><RefreshCw className="w-5 h-5" /> Regenerate my plan</>
                : <><Sparkles className="w-5 h-5" /> Analyze my typing &amp; build my plan</>}
            </button>
            {stats && (
              <p className="text-center text-xs text-brand-muted mt-2">
                Based on your {stats.totalSessions} sessions · trend{' '}
                <span className={trendLabel[stats.trend].cls}>{trendLabel[stats.trend].text}</span>
              </p>
            )}
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 rounded-xl px-4 py-3 text-sm text-center mb-6">{error}</div>
        )}

        {/* ── The plan ── */}
        {plan && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

            {/* Analysis + level + target */}
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-primary/10 text-brand-primary">
                  <Brain className="w-3.5 h-3.5" /> {plan.level}
                </span>
                {!!plan.targetWpm && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Target className="w-3.5 h-3.5" /> Next target: {plan.targetWpm} WPM
                  </span>
                )}
              </div>
              <p className="text-brand-text leading-relaxed">{plan.analysis}</p>
            </div>

            {/* Strengths / weak areas */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
                <h3 className="font-black text-brand-text mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Strengths</h3>
                <ul className="space-y-2">
                  {plan.strengths?.map((s, i) => (
                    <li key={i} className="text-sm text-brand-text-muted flex gap-2"><span className="text-emerald-500 mt-0.5">•</span>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
                <h3 className="font-black text-brand-text mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-rose-500" /> Focus areas</h3>
                <ul className="space-y-2">
                  {plan.weakAreas?.map((s, i) => (
                    <li key={i} className="text-sm text-brand-text-muted flex gap-2"><span className="text-rose-500 mt-0.5">•</span>{s}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Step plan */}
            <div>
              <h2 className="text-lg font-black text-brand-text mb-3">Your step-by-step plan</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {plan.plan?.map((step, i) => (
                  <div key={i} className="bg-brand-surface border border-brand-border rounded-2xl p-5 flex gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-sm" style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>{i + 1}</div>
                    <div>
                      <h3 className="font-bold text-brand-text text-sm mb-1">{step.title}</h3>
                      <p className="text-brand-text-muted text-sm leading-relaxed">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily routine */}
            {!!plan.dailyRoutine?.length && (
              <div className="bg-gradient-to-r from-brand-primary/10 to-brand-accent/10 border border-brand-primary/20 rounded-2xl p-6">
                <h2 className="text-lg font-black text-brand-text mb-3 flex items-center gap-2"><Zap className="w-5 h-5 text-amber-500" /> Daily routine</h2>
                <ul className="space-y-2">
                  {plan.dailyRoutine.map((r, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-brand-text">
                      <span className="shrink-0 w-5 h-5 rounded-full border-2 border-brand-primary/40" />{r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Practice text */}
            {plan.practiceText && (
              <div className="bg-brand-surface border border-brand-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3 gap-3">
                  <h2 className="text-lg font-black text-brand-text flex items-center gap-2"><Keyboard className="w-5 h-5 text-brand-primary" /> Your custom practice passage</h2>
                  <Link to="/tests" className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:opacity-80">
                    Practice now <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <p className="font-mono text-sm leading-relaxed text-brand-text bg-brand-surface-2 rounded-xl p-4 border border-brand-border">{plan.practiceText}</p>
              </div>
            )}

            {/* Encouragement */}
            {plan.encouragement && (
              <p className="text-center text-brand-text font-semibold italic px-4">“{plan.encouragement}”</p>
            )}

            <p className="text-center text-[11px] text-brand-muted">AI-generated guidance — your stats stay in your browser. Re-run anytime as you improve.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
