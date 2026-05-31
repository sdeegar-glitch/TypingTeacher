import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, Target, Flame, Trophy, Star, TrendingUp, Award, Brain, ChevronRight, Lock } from 'lucide-react';

const API_URL = 'https://typingteacher-2lnd.onrender.com';

// XP needed per level
const xpForLevel = (level: number) => level * 200;
const totalXpForLevel = (level: number) => Array.from({ length: level - 1 }, (_, i) => xpForLevel(i + 1)).reduce((a, b) => a + b, 0);

const ACHIEVEMENTS = [
  { key: 'first_test', name: 'First Steps', icon: '🎯', desc: 'Complete your first test', xp: 25 },
  { key: 'wpm_30', name: 'Warming Up', icon: '🔥', desc: 'Reach 30 WPM', xp: 50 },
  { key: 'wpm_50', name: '50 WPM Club', icon: '⚡', desc: 'Reach 50 WPM', xp: 100 },
  { key: 'wpm_70', name: '70 WPM Club', icon: '🚀', desc: 'Reach 70 WPM', xp: 150 },
  { key: 'wpm_100', name: '100 WPM Legend', icon: '🏆', desc: 'Break 100 WPM', xp: 300 },
  { key: 'acc_95', name: 'Sharpshooter', icon: '🎯', desc: '95%+ accuracy', xp: 75 },
  { key: 'acc_100', name: 'Perfect', icon: '💎', desc: '100% accuracy', xp: 200 },
  { key: 'streak_3', name: '3-Day Streak', icon: '🔥', desc: '3 days in a row', xp: 75 },
  { key: 'streak_7', name: 'Week Warrior', icon: '🗓️', desc: '7-day streak', xp: 150 },
  { key: 'tests_10', name: 'Dedicated', icon: '📚', desc: 'Complete 10 tests', xp: 100 },
  { key: 'tests_50', name: 'Power User', icon: '💪', desc: 'Complete 50 tests', xp: 250 },
  { key: 'speed_demon', name: 'Speed Demon', icon: '👹', desc: '80 WPM + 90% acc', xp: 200 },
];

// Local gamification derived from localStorage session history
function loadLocalStats() {
  try {
    const raw = localStorage.getItem('typingHistory');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function computeStats(sessions: any[]) {
  if (!sessions.length) return { bestWpm: 0, avgWpm: 0, avgAcc: 100, total: 0, xp: 0, level: 1, streak: 0, unlockedKeys: [] as string[] };
  const bestWpm = Math.max(...sessions.map(s => s.netWpm || 0));
  const avgWpm = Math.round(sessions.reduce((a, s) => a + (s.netWpm || 0), 0) / sessions.length);
  const avgAcc = Math.round(sessions.reduce((a, s) => a + (s.accuracy || 0), 0) / sessions.length);
  const total = sessions.length;
  const baseXp = sessions.reduce((a, s) => a + 10 + Math.floor((s.netWpm || 0) / 5), 0);

  // Determine unlocked achievements
  const unlockedKeys: string[] = [];
  if (total >= 1) unlockedKeys.push('first_test');
  if (bestWpm >= 30) unlockedKeys.push('wpm_30');
  if (bestWpm >= 50) unlockedKeys.push('wpm_50');
  if (bestWpm >= 70) unlockedKeys.push('wpm_70');
  if (bestWpm >= 100) unlockedKeys.push('wpm_100');
  if (avgAcc >= 95) unlockedKeys.push('acc_95');
  if (sessions.some(s => s.accuracy === 100)) unlockedKeys.push('acc_100');
  if (total >= 10) unlockedKeys.push('tests_10');
  if (total >= 50) unlockedKeys.push('tests_50');
  if (sessions.some(s => s.netWpm >= 80 && s.accuracy >= 90)) unlockedKeys.push('speed_demon');

  const achievementXp = unlockedKeys.reduce((a, k) => {
    const ach = ACHIEVEMENTS.find(x => x.key === k);
    return a + (ach?.xp || 0);
  }, 0);
  const xp = baseXp + achievementXp;

  // Compute level from XP
  let level = 1, cumulative = 0;
  while (cumulative + xpForLevel(level) <= xp) { cumulative += xpForLevel(level); level++; }
  const xpIntoLevel = xp - cumulative;
  const xpNeeded = xpForLevel(level);

  return { bestWpm, avgWpm, avgAcc, total, xp, level, xpIntoLevel, xpNeeded, streak: 0, unlockedKeys };
}

const LEVEL_TITLES: Record<number, string> = {
  1: 'Beginner', 2: 'Novice', 3: 'Apprentice', 4: 'Typist', 5: 'Skilled',
  6: 'Advanced', 7: 'Expert', 8: 'Master', 9: 'Grandmaster', 10: 'Legend',
};

export default function DashboardPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [availableTests, setAvailableTests] = useState<any[]>([]);
  const [aiCoach, setAiCoach] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [tab, setTab] = useState<'overview' | 'history' | 'achievements' | 'coach'>('overview');

  useEffect(() => {
    document.title = 'Dashboard | FastTypingLab';
    setSessions(loadLocalStats());
    fetch(`${API_URL}/api/tests/latest`)
      .then(r => r.json())
      .then(d => Array.isArray(d) && setAvailableTests(d.slice(0, 6)))
      .catch(() => {});
  }, []);

  const stats = computeStats(sessions);
  const xpPercent = Math.min(100, stats.xpNeeded ? Math.round((stats.xpIntoLevel / stats.xpNeeded) * 100) : 0);
  const levelTitle = LEVEL_TITLES[Math.min(stats.level, 10)] || 'Legend';

  // WPM chart data — last 10 sessions
  const chartData = sessions.slice(-10).map((s, i) => ({
    session: `#${sessions.length - 9 + i}`,
    wpm: s.netWpm || 0,
    accuracy: s.accuracy || 0,
  }));

  const fetchAICoach = async () => {
    if (sessions.length < 1) return;
    setLoadingAI(true);
    try {
      const res = await fetch(`${API_URL}/api/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessions: sessions.slice(-10) }),
      });
      const data = await res.json();
      setAiCoach(data);
    } catch {
      setAiCoach({ analysis: 'AI coach is temporarily unavailable. Keep practicing!', suggestions: [], weakAreas: [], practiceText: '' });
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-6 px-4 sm:px-6">
      <div className="container mx-auto max-w-5xl">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-text">Your Dashboard</h1>
            <p className="text-brand-text-muted text-sm mt-1">Track your progress, earn XP, unlock achievements</p>
          </div>
          <Link to="/tests"
            className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-brand-primary/20">
            <Zap className="w-4 h-4" /> New Test
          </Link>
        </div>

        {/* ── Level + XP Bar ── */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 sm:p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand-primary/30">
                {stats.level}
              </div>
              <div>
                <div className="text-xs text-brand-muted uppercase tracking-widest font-semibold">Level {stats.level}</div>
                <div className="text-xl font-black text-brand-text">{levelTitle}</div>
                <div className="text-xs text-brand-muted">{stats.xp} total XP</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 sm:gap-6 text-center">
              {[
                { label: 'Tests', value: stats.total, icon: Target, color: 'text-brand-text' },
                { label: 'Best WPM', value: stats.bestWpm, icon: Zap, color: 'text-brand-primary' },
                { label: 'Avg Acc', value: `${stats.avgAcc}%`, icon: Award, color: 'text-brand-accent' },
                { label: 'Streak', value: `${stats.streak}d`, icon: Flame, color: 'text-orange-500' },
              ].map(s => (
                <div key={s.label}>
                  <div className={`text-2xl font-black font-mono ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] text-brand-muted uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          {/* XP bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-brand-muted">
              <span>Level {stats.level} — {levelTitle}</span>
              <span>{stats.xpIntoLevel || 0} / {stats.xpNeeded || 200} XP</span>
            </div>
            <div className="h-2.5 bg-brand-surface-2 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <div className="text-xs text-brand-muted text-right">{xpPercent}% to Level {stats.level + 1}</div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-brand-surface-2 rounded-xl p-1 mb-6 w-fit">
          {(['overview', 'history', 'achievements', 'coach'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); if (t === 'coach' && !aiCoach) fetchAICoach(); }}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all capitalize ${
                tab === t ? 'bg-brand-surface shadow text-brand-text' : 'text-brand-muted hover:text-brand-text'
              }`}>
              {t === 'coach' ? '🤖 AI Coach' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <div className="space-y-6">
            {/* WPM Chart */}
            {chartData.length >= 2 ? (
              <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
                <h2 className="font-bold text-brand-text mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-primary" /> WPM Progress
                </h2>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="session" tick={{ fontSize: 11, fill: 'var(--brand-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--brand-muted)' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'var(--brand-surface)', border: '1px solid var(--brand-border)', borderRadius: 12, fontSize: 12 }}
                      labelStyle={{ color: 'var(--brand-text)' }}
                    />
                    <Area type="monotone" dataKey="wpm" stroke="var(--brand-primary)" strokeWidth={2} fill="url(#wpmGrad)" dot={{ fill: 'var(--brand-primary)', r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="bg-brand-surface border border-dashed border-brand-border rounded-2xl p-8 text-center">
                <TrendingUp className="w-8 h-8 text-brand-muted mx-auto mb-3" />
                <p className="text-brand-text-muted text-sm">Complete at least 2 tests to see your WPM progress chart.</p>
                <Link to="/tests" className="mt-3 inline-block text-sm font-semibold text-brand-primary hover:underline">Start a test →</Link>
              </div>
            )}

            {/* Recent unlocks */}
            {stats.unlockedKeys.length > 0 && (
              <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
                <h2 className="font-bold text-brand-text mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" /> Recent Achievements
                </h2>
                <div className="flex flex-wrap gap-3">
                  {stats.unlockedKeys.slice(-4).map(key => {
                    const ach = ACHIEVEMENTS.find(a => a.key === key);
                    if (!ach) return null;
                    return (
                      <motion.div key={key} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-3 py-2 rounded-xl">
                        <span className="text-xl">{ach.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-amber-700 dark:text-amber-400">{ach.name}</div>
                          <div className="text-[10px] text-amber-600 dark:text-amber-500">+{ach.xp} XP</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Available Tests */}
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-brand-text">Available Tests</h2>
                <Link to="/tests" className="text-sm text-brand-primary font-semibold hover:underline">View all →</Link>
              </div>
              <div className="space-y-2">
                {availableTests.length === 0 ? (
                  <p className="text-brand-muted text-sm">Loading tests…</p>
                ) : availableTests.map(t => (
                  <Link key={t.id} to={`/tests/config/${t.slug || t.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-brand-surface-2 transition-colors group">
                    <div>
                      <div className="font-semibold text-sm text-brand-text truncate max-w-[300px]">{t.title}</div>
                      <div className="text-xs text-brand-muted">{t.word_count || 500} words · {t.difficulty_level || 'Medium'}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-brand-primary transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {tab === 'history' && (
          <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-brand-border">
              <h2 className="font-bold text-brand-text">Session History</h2>
              <p className="text-xs text-brand-muted mt-0.5">{sessions.length} sessions recorded locally</p>
            </div>
            {sessions.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-brand-muted text-sm">No sessions yet. <Link to="/tests" className="text-brand-primary font-semibold">Take a test</Link> to start tracking!</p>
              </div>
            ) : (
              <div className="divide-y divide-brand-border">
                {[...sessions].reverse().slice(0, 20).map((s, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <div className="text-sm font-semibold text-brand-text">{s.netWpm || 0} WPM net</div>
                      <div className="text-xs text-brand-muted">{s.accuracy || 0}% accuracy · {s.errors || 0} errors</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono text-brand-muted">{s.mode || 'article'}</div>
                      <div className="text-xs text-brand-muted">{s.date ? new Date(s.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'recent'}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ACHIEVEMENTS TAB ── */}
        {tab === 'achievements' && (
          <div className="grid sm:grid-cols-2 gap-4">
            {ACHIEVEMENTS.map(ach => {
              const unlocked = stats.unlockedKeys.includes(ach.key);
              return (
                <motion.div key={ach.key}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    unlocked
                      ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20'
                      : 'bg-brand-surface border-brand-border opacity-50'
                  }`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${unlocked ? 'bg-amber-100 dark:bg-amber-500/20' : 'bg-brand-surface-2'}`}>
                    {unlocked ? ach.icon : <Lock className="w-5 h-5 text-brand-muted" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-sm ${unlocked ? 'text-amber-700 dark:text-amber-400' : 'text-brand-muted'}`}>{ach.name}</div>
                    <div className="text-xs text-brand-muted mt-0.5">{ach.desc}</div>
                    <div className={`text-[10px] font-bold mt-1 ${unlocked ? 'text-amber-600 dark:text-amber-500' : 'text-brand-muted'}`}>+{ach.xp} XP</div>
                  </div>
                  {unlocked && <span className="text-brand-accent shrink-0"><Award className="w-5 h-5" /></span>}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── AI COACH TAB ── */}
        {tab === 'coach' && (
          <div className="space-y-5">
            {sessions.length === 0 ? (
              <div className="bg-brand-surface border border-dashed border-brand-border rounded-2xl p-10 text-center">
                <Brain className="w-10 h-10 text-brand-muted mx-auto mb-3" />
                <p className="text-brand-text font-semibold mb-2">Complete some tests first</p>
                <p className="text-brand-muted text-sm mb-4">The AI coach needs at least 1 session to analyze your performance.</p>
                <Link to="/tests" className="bg-brand-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm">Take a Test</Link>
              </div>
            ) : loadingAI ? (
              <div className="bg-brand-surface border border-brand-border rounded-2xl p-10 text-center">
                <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-brand-muted text-sm">Analyzing your {sessions.length} sessions…</p>
              </div>
            ) : aiCoach ? (
              <>
                <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🤖</span>
                    <h2 className="font-bold text-brand-text">Your Performance Analysis</h2>
                  </div>
                  <p className="text-brand-text-muted leading-relaxed">{aiCoach.analysis}</p>
                  {aiCoach.encouragement && (
                    <p className="mt-3 text-brand-primary font-semibold text-sm">💪 {aiCoach.encouragement}</p>
                  )}
                </div>

                {aiCoach.weakAreas?.length > 0 && (
                  <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl p-5">
                    <h3 className="font-bold text-rose-700 dark:text-rose-400 mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" /> Weak Areas to Focus On
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {aiCoach.weakAreas.map((w: string) => (
                        <span key={w} className="bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 px-3 py-1 rounded-lg text-sm font-medium">{w}</span>
                      ))}
                    </div>
                  </div>
                )}

                {aiCoach.suggestions?.length > 0 && (
                  <div className="bg-brand-surface border border-brand-border rounded-2xl p-5">
                    <h3 className="font-bold text-brand-text mb-3">💡 Actionable Tips</h3>
                    <ul className="space-y-2">
                      {aiCoach.suggestions.map((s: string, i: number) => (
                        <li key={i} className="flex gap-3 text-sm text-brand-text-muted">
                          <span className="text-brand-accent font-bold shrink-0">0{i + 1}.</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiCoach.practiceText && (
                  <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-2xl p-5">
                    <h3 className="font-bold text-brand-text mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-brand-primary" /> Custom Practice Passage
                    </h3>
                    <p className="font-mono text-sm text-brand-text-muted leading-relaxed bg-brand-surface rounded-xl p-4 border border-brand-border">{aiCoach.practiceText}</p>
                    <Link
                      to={`/tests`}
                      className="mt-3 inline-flex items-center gap-1.5 text-brand-primary text-sm font-semibold hover:underline"
                    >
                      Practice with similar texts <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}

                <button onClick={fetchAICoach}
                  className="w-full bg-brand-surface-2 hover:bg-brand-border border border-brand-border text-brand-text py-3 rounded-xl font-semibold text-sm transition-all">
                  🔄 Refresh Analysis
                </button>
              </>
            ) : (
              <button onClick={fetchAICoach}
                className="w-full bg-brand-primary hover:bg-brand-secondary text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                <Brain className="w-5 h-5" /> Analyze My Performance with AI
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
