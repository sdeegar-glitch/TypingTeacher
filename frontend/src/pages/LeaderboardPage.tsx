import { useState, useEffect } from 'react';
import Seo from '../components/Seo';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp, RefreshCcw } from 'lucide-react';
import PageHeader from '../components/PageHeader';

import { API_URL } from '../lib/api';

interface LeaderboardEntry {
  rank: number;
  user: string;
  net_wpm: number;
  accuracy: number;
  date: string;
}

const MOCK: LeaderboardEntry[] = [
  { rank: 1, user: 'RocketTypist', net_wpm: 142, accuracy: 98.5, date: '2026-05-30' },
  { rank: 2, user: 'KeyboardNinja', net_wpm: 128, accuracy: 99.1, date: '2026-05-29' },
  { rank: 3, user: 'SpeedDemon99', net_wpm: 117, accuracy: 96.0, date: '2026-05-31' },
  { rank: 4, user: 'TypeMaster', net_wpm: 105, accuracy: 97.2, date: '2026-05-28' },
  { rank: 5, user: 'QuickFingers', net_wpm: 98, accuracy: 94.5, date: '2026-05-27' },
  { rank: 6, user: 'AccuracyKing', net_wpm: 91, accuracy: 99.8, date: '2026-05-26' },
  { rank: 7, user: 'HomeDeskTyper', net_wpm: 85, accuracy: 95.2, date: '2026-05-25' },
  { rank: 8, user: 'CodeWriter42', net_wpm: 78, accuracy: 96.0, date: '2026-05-24' },
];

const RANK_COLORS = ['text-amber-400', 'text-slate-400', 'text-orange-500'];
const RANK_BG = ['bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
  'bg-slate-50 dark:bg-slate-500/10 border-slate-200 dark:border-slate-500/20',
  'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20'];

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardEntry[]>(MOCK);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'global' | 'exam'>('global');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    document.title = 'Global Typing Leaderboard | FastTypingLab';
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/leaderboard`);
      const json = await res.json();
      if (Array.isArray(json) && json.length > 0) setData(json);
      else setData(MOCK);
    } catch {
      setData(MOCK);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 sm:px-6">
      <Seo
        title="Global Typing Leaderboard | FastTypingLab"
        description="See the fastest typists on FastTypingLab. Global typing speed leaderboard ranked by net WPM and accuracy."
      />
      <div className="max-w-[1600px] mx-auto">

        {/* Header */}
        <PageHeader
          icon={Trophy}
          title="Global Leaderboard"
          subtitle="The fastest typists on FastTypingLab. Can you make the list?"
        />

        {/* Tabs */}
        <div className="flex gap-1 bg-brand-surface-2 rounded-xl p-1 mb-8 w-fit mx-auto">
          {(['global', 'exam'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${tab === t ? 'bg-brand-surface shadow text-brand-text' : 'text-brand-muted hover:text-brand-text'}`}>
              {t === 'global' ? '🌍 Global' : '📋 Exam (SSC/Court)'}
            </button>
          ))}
          <button onClick={() => { setRefreshing(true); loadData(); }}
            className="px-3 py-2 rounded-lg text-brand-muted hover:text-brand-text transition-all">
            <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[top3[1], top3[0], top3[2]].map((entry, idx) => {
                if (!entry) return <div key={idx} />;
                const actualRank = idx === 1 ? 1 : idx === 0 ? 2 : 3;
                const icons = [Medal, Trophy, Award];
                const Icon = icons[actualRank - 1];
                const height = actualRank === 1 ? 'pt-0' : actualRank === 2 ? 'pt-4' : 'pt-8';
                return (
                  <motion.div key={entry.rank}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (actualRank - 1) * 0.1 }}
                    className={`${height}`}>
                    <div className={`border rounded-2xl p-4 text-center ${RANK_BG[actualRank - 1]}`}>
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${RANK_COLORS[actualRank - 1]}`} />
                      <div className="font-black text-brand-text text-sm truncate">{entry.user}</div>
                      <div className={`text-2xl font-black font-mono mt-1 ${RANK_COLORS[actualRank - 1]}`}>{entry.net_wpm}</div>
                      <div className="text-[10px] text-brand-muted">WPM</div>
                      <div className="text-xs text-brand-muted mt-1">{entry.accuracy}% acc</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Rest of leaderboard */}
            <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden">
              <div className="hidden sm:grid grid-cols-[60px_1fr_120px_100px_100px] px-5 py-3 border-b border-brand-border bg-brand-surface-2">
                <div className="text-[10px] text-brand-muted uppercase tracking-wider">Rank</div>
                <div className="text-[10px] text-brand-muted uppercase tracking-wider">Player</div>
                <div className="text-[10px] text-brand-muted uppercase tracking-wider text-center">Net WPM</div>
                <div className="text-[10px] text-brand-muted uppercase tracking-wider text-center">Accuracy</div>
                <div className="text-[10px] text-brand-muted uppercase tracking-wider text-right">Date</div>
              </div>
              <div className="divide-y divide-brand-border">
                {rest.map((row, i) => (
                  <motion.div key={row.rank}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="grid grid-cols-[50px_1fr_80px] sm:grid-cols-[60px_1fr_120px_100px_100px] px-5 py-4 items-center hover:bg-brand-surface-2 transition-colors">
                    <div className="text-brand-muted font-mono font-bold text-sm">#{row.rank}</div>
                    <div>
                      <div className="font-bold text-brand-text">{row.user}</div>
                    </div>
                    <div className="text-center">
                      <span className="bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-sm font-black font-mono">
                        {row.net_wpm} WPM
                      </span>
                    </div>
                    <div className="hidden sm:block text-center text-sm font-semibold text-brand-text">{row.accuracy}%</div>
                    <div className="hidden sm:block text-right text-xs text-brand-muted">
                      {new Date(row.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 text-center">
              <p className="text-brand-muted text-sm mb-3">Think you can beat the top score? 🔥</p>
              <a href="/tests" className="inline-block bg-brand-primary hover:bg-brand-secondary text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-primary/20">
                Take the Speed Test
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
