import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Zap, Clock, BarChart2 } from 'lucide-react';

import { API_URL as BASE_URL } from '../lib/api';
const API_URL = `${BASE_URL}/api/tests`;

const DIFF_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  easy:   { label: 'Easy',   color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  medium: { label: 'Medium', color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  hard:   { label: 'Hard',   color: 'text-rose-600 dark:text-rose-400',       bg: 'bg-rose-500/10',    border: 'border-rose-500/20' },
};

export default function TestsListPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Typing Tests Library | FastTypingLab';
    fetch(`${API_URL}/latest`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setTests(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-10 px-4 sm:py-14 sm:px-6">
      <div className="container mx-auto max-w-3xl">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14">
          <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-6 icon-teal shadow-lg">
            <Zap className="w-8 h-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            <span className="gradient-text">Typing Tests</span> Library
          </h1>
          <p className="text-brand-text-muted max-w-xl mx-auto text-base leading-relaxed">
            Curated editorial articles updated daily by AI. Pick any passage and start typing — timer begins with your first keystroke.
          </p>

          {/* Quick duration buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {[
              { label: '1 min test', href: '/typing-test/1' },
              { label: '2 min test', href: '/typing-test/2' },
              { label: '5 min test', href: '/typing-test/5' },
              { label: 'Words mode', href: '/typing-test?mode=words' },
            ].map(b => (
              <Link key={b.href} to={b.href}
                className="px-4 py-1.5 rounded-full text-sm font-semibold border border-brand-border bg-brand-surface hover:border-brand-primary/40 hover:text-brand-primary hover:bg-brand-primary/5 transition-all duration-200 text-brand-muted">
                {b.label}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* ── Content ── */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-10 h-10 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
          </div>
        ) : tests.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center bg-brand-surface border border-brand-border rounded-3xl p-16">
            <BookOpen className="w-12 h-12 text-brand-muted mx-auto mb-4" />
            <h3 className="text-xl font-bold text-brand-text mb-2">No tests found</h3>
            <p className="text-brand-text-muted text-sm">Check back later — new AI-generated content is added daily.</p>
            <Link to="/typing-test"
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white text-sm transition-all"
              style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)', boxShadow: '0 4px 14px rgba(48,76,83,.25)' }}>
              <Zap className="w-4 h-4" /> Quick Test
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3">
            {tests.map((test, i) => (
              <motion.div key={test.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}>
                <TestListItem test={test} />
              </motion.div>
            ))}
          </div>
        )}

        {/* ── SEO footer note ── */}
        {!loading && tests.length > 0 && (
          <p className="text-center text-xs text-brand-muted mt-10">
            {tests.length} articles available · New content added automatically every day
          </p>
        )}
      </div>
    </div>
  );
}

function TestListItem({ test }: { test: any }) {
  const diff = DIFF_CONFIG[(test.difficulty_level || 'medium').toLowerCase()] || DIFF_CONFIG.medium;
  const date = test.created_at
    ? new Date(test.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <Link to={`/tests/config/${test.slug || test.id}`}
      className="group flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-primary/40 hover:shadow-lg hover:shadow-brand-primary/8 hover:-translate-y-0.5 transition-all duration-200">

      {/* Left: icon */}
      <div className="shrink-0 w-11 h-11 rounded-xl icon-teal flex items-center justify-center group-hover:scale-105 transition-transform">
        <BookOpen className="w-5 h-5" />
      </div>

      {/* Center: text */}
      <div className="flex-1 min-w-0">
        {date && (
          <div className="text-[10px] text-brand-muted font-semibold uppercase tracking-wider mb-1">{date}</div>
        )}
        <h3 className="text-sm sm:text-base font-bold text-brand-text truncate mb-2 group-hover:text-brand-primary transition-colors">
          {test.title}
        </h3>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Difficulty badge */}
          <span className={`px-2 py-0.5 rounded-md font-semibold border ${diff.bg} ${diff.color} ${diff.border}`}>
            {diff.label}
          </span>

          {/* Word count */}
          <span className="flex items-center gap-1 text-brand-muted">
            <Clock className="w-3 h-3" />
            {test.word_count ? `~${Math.ceil(test.word_count / 200)} min read` : '~5 min'}
          </span>

          {/* Words */}
          <span className="flex items-center gap-1 text-brand-muted">
            <BarChart2 className="w-3 h-3" />
            {test.word_count || 1000} words
          </span>

          {/* Category */}
          {test.category && (
            <span className="hidden sm:inline text-brand-muted/60 truncate max-w-[140px]">
              · {test.category}
            </span>
          )}
        </div>
      </div>

      {/* Right: arrow */}
      <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-brand-surface-2 border border-brand-border group-hover:border-brand-primary/30 group-hover:text-brand-primary text-brand-muted transition-all duration-200">
        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}
