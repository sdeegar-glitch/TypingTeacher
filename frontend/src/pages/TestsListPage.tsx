import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Zap, Clock, BarChart2, ChevronLeft, Languages, Keyboard } from 'lucide-react';

import { API_URL as BASE_URL } from '../lib/api';
const API_URL = `${BASE_URL}/api/tests`;

const DIFF_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  easy:   { label: 'Easy',   color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  medium: { label: 'Medium', color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  hard:   { label: 'Hard',   color: 'text-rose-600 dark:text-rose-400',       bg: 'bg-rose-500/10',    border: 'border-rose-500/20' },
};

type Category = {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  icon: typeof Keyboard;
  gradient: string;
  query: Record<string, string>;
  devanagari?: boolean;
};

const CATEGORIES: Category[] = [
  {
    id: 'english',
    title: 'English Typing',
    subtitle: 'QWERTY · English',
    desc: 'Editorial English passages to build everyday typing speed and accuracy.',
    icon: Keyboard,
    gradient: 'linear-gradient(135deg,#304C53,#2A9DAE)',
    query: { language: 'en' },
  },
  {
    id: 'mangal',
    title: 'Hindi — Mangal Inscript',
    subtitle: 'हिंदी · Unicode Inscript',
    desc: 'Hindi Unicode passages on the Mangal / Inscript layout for SSC, CPCT & court exams.',
    icon: Languages,
    gradient: 'linear-gradient(135deg,#BC6C50,#CC7B5D)',
    query: { language: 'hi', keyboard_layout: 'mangal_inscript' },
    devanagari: true,
  },
  {
    id: 'kruti',
    title: 'Hindi — Kruti Dev',
    subtitle: 'हिंदी · Kruti Dev (Remington)',
    desc: 'Hindi passages on the legacy Kruti Dev font used in many government typing tests.',
    icon: Languages,
    gradient: 'linear-gradient(135deg,#7A5C9E,#A97FCB)',
    query: { language: 'hi', keyboard_layout: 'kruti_dev' },
    devanagari: true,
  },
];

export default function TestsListPage() {
  const [selected, setSelected] = useState<Category | null>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Typing Tests Library | FastTypingLab';
    // Load Devanagari font once for the Hindi cards/labels
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch {} };
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    setTests([]);
    const params = new URLSearchParams(selected.query).toString();
    fetch(`${API_URL}/latest?${params}`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setTests(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selected]);

  // ── Category selection screen ──
  if (!selected) {
    return (
      <div className="min-h-screen bg-brand-bg text-brand-text py-10 px-4 sm:py-14 sm:px-6">
        <div className="container mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12">
            <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-6 icon-teal shadow-lg">
              <Zap className="w-8 h-8" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
              <span className="gradient-text">Typing Tests</span> Library
            </h1>
            <p className="text-brand-text-muted max-w-xl mx-auto text-base leading-relaxed">
              Choose a track to begin. Each track keeps English, Hindi Mangal and Hindi Kruti Dev tests separate so you practice exactly what you need.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4">
            {CATEGORIES.map((cat, i) => (
              <motion.button key={cat.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => setSelected(cat)}
                className="group text-left flex items-center gap-5 p-5 sm:p-6 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-primary/40 hover:shadow-lg hover:shadow-brand-primary/8 hover:-translate-y-0.5 transition-all duration-200">
                <div className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform"
                  style={{ background: cat.gradient }}>
                  <cat.icon className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-brand-muted mb-1"
                    style={cat.devanagari ? { fontFamily: "'Noto Sans Devanagari',sans-serif" } : undefined}>
                    {cat.subtitle}
                  </div>
                  <h3 className="text-lg font-black text-brand-text group-hover:text-brand-primary transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-sm text-brand-text-muted mt-1 leading-snug">{cat.desc}</p>
                </div>
                <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-brand-surface-2 border border-brand-border group-hover:border-brand-primary/30 group-hover:text-brand-primary text-brand-muted transition-all duration-200">
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Tests list for the selected category ──
  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-10 px-4 sm:py-14 sm:px-6">
      <div className="container mx-auto max-w-3xl">

        <button onClick={() => setSelected(null)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-muted hover:text-brand-primary transition-colors mb-8">
          <ChevronLeft className="w-4 h-4" /> All tracks
        </button>

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12">
          <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-6 shadow-lg text-white"
            style={{ background: selected.gradient }}>
            <selected.icon className="w-8 h-8" />
          </div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-brand-muted mb-2"
            style={selected.devanagari ? { fontFamily: "'Noto Sans Devanagari',sans-serif" } : undefined}>
            {selected.subtitle}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">{selected.title} Tests</h1>
          <p className="text-brand-text-muted max-w-xl mx-auto text-base leading-relaxed">
            {selected.desc} Pick any passage and start typing — timer begins with your first keystroke.
          </p>
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
            <h3 className="text-xl font-bold text-brand-text mb-2">No tests yet</h3>
            <p className="text-brand-text-muted text-sm">No {selected.title} passages are available right now — check back later, new content is added automatically.</p>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3">
            {tests.map((test, i) => (
              <motion.div key={test.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}>
                <TestListItem test={test} devanagari={!!selected.devanagari} />
              </motion.div>
            ))}
          </div>
        )}

        {/* ── SEO footer note ── */}
        {!loading && tests.length > 0 && (
          <p className="text-center text-xs text-brand-muted mt-10">
            {tests.length} {selected.title} articles available · New content added automatically every day
          </p>
        )}
      </div>
    </div>
  );
}

function TestListItem({ test, devanagari }: { test: any; devanagari: boolean }) {
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
        <h3 className="text-sm sm:text-base font-bold text-brand-text truncate mb-2 group-hover:text-brand-primary transition-colors"
          style={devanagari ? { fontFamily: "'Noto Sans Devanagari',sans-serif" } : undefined}>
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
