import { useState, useEffect } from 'react';
import Seo from '../components/Seo';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ChevronRight, Zap, Clock, BarChart2, ChevronLeft, Languages, Keyboard, CheckCircle2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { isTestCompleted, getLastTrack, setLastTrack } from '../lib/testProgress';

import { fetchTestList } from '../lib/api';

const DIFF_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  easy:   { label: 'Easy',   color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  medium: { label: 'Medium', color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  hard:   { label: 'Hard',   color: 'text-rose-600 dark:text-rose-400',       bg: 'bg-rose-500/10',    border: 'border-rose-500/20' },
};

// Easy -> Medium -> Hard ordering (simple to difficult), as requested.
const DIFF_ORDER: Record<string, number> = { easy: 0, medium: 1, hard: 2 };
const byDifficulty = (a: any, b: any) =>
  (DIFF_ORDER[(a.difficulty_level || 'medium').toLowerCase()] ?? 1) -
  (DIFF_ORDER[(b.difficulty_level || 'medium').toLowerCase()] ?? 1);

// Contextual guides surfaced on the tests hub so visitors discover our articles
// (more pageviews per session) and internal link equity flows to newer content.
const RELATED_GUIDES: { label: string; href: string }[] = [
  { label: 'What does WPM mean?', href: '/blog/what-does-wpm-mean/' },
  { label: 'How to type faster', href: '/blog/how-to-type-faster/' },
  { label: 'How to pass a typing test', href: '/blog/how-to-pass-a-typing-test/' },
  { label: 'Home row keys', href: '/blog/home-row-keys-finger-placement/' },
  { label: 'Typing test for jobs', href: '/blog/typing-test-for-jobs/' },
  { label: '10-key data entry test', href: '/blog/ten-key-typing-test-data-entry/' },
  { label: 'Typing test for students', href: '/blog/typing-test-for-students/' },
  { label: 'What is a good typing speed?', href: '/blog/how-many-wpm-is-good-typing-speed-benchmarks/' },
  { label: 'Type without looking', href: '/blog/how-to-type-without-looking-touch-typing-guide/' },
  { label: 'Best keyboard for typing', href: '/blog/best-keyboard-for-typing-fast/' },
  { label: 'Why is the keyboard QWERTY?', href: '/blog/why-is-keyboard-qwerty/' },
];

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
  // Remember the last track so students don't re-pick it every visit.
  const [selected, setSelected] = useState<Category | null>(() => {
    const last = getLastTrack();
    return CATEGORIES.find(c => c.id === last) || null;
  });
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const chooseTrack = (cat: Category) => { setSelected(cat); setLastTrack(cat.id); };

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
    fetchTestList(selected.query)
      .then(d => { if (Array.isArray(d)) setTests(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selected]);

  // ── Category selection screen ──
  if (!selected) {
    return (
      <div className="bg-brand-bg text-brand-text py-4 px-4 sm:py-6 sm:px-6">
        <Seo
          title="Typing Tests Library — English, Hindi Mangal & Kruti Dev | FastTypingLab"
          description="Free typing speed tests in English, Hindi Mangal (Unicode) and Kruti Dev. Pick a track, then a passage, and get real-time WPM and accuracy."
        />
        <div className="max-w-6xl mx-auto">
          <PageHeader
            icon={Zap}
            title={<><span className="gradient-text">Typing Tests</span> Library</>}
            subtitle="Choose a track: English, Hindi Mangal or Hindi Kruti Dev."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {CATEGORIES.map((cat, i) => (
              <motion.button key={cat.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => chooseTrack(cat)}
                className="group text-left flex items-start gap-3 p-4 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-primary/40 hover:shadow-md transition-all duration-150">
                <div className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm"
                  style={{ background: cat.gradient }}>
                  <cat.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-brand-text group-hover:text-brand-primary transition-colors leading-snug">
                    {cat.title}
                  </h2>
                  <p className="text-xs text-brand-text-muted mt-0.5 leading-snug">{cat.desc}</p>
                </div>
                <ChevronRight className="shrink-0 w-4 h-4 mt-1 text-brand-muted group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all" />
              </motion.button>
            ))}
          </div>

          {/* ── Helpful guides (discovery + internal linking) ── */}
          <div className="mt-6 pt-4 border-t border-brand-border">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-2.5">Helpful typing guides</h2>
            <div className="flex flex-wrap gap-2">
              {RELATED_GUIDES.map(g => (
                <Link key={g.href} to={g.href}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-text bg-brand-surface border border-brand-border hover:border-brand-primary/40 hover:text-brand-primary px-3 py-1.5 rounded-lg transition-colors duration-150">
                  {g.label}
                  <ChevronRight className="w-3 h-3 opacity-60" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Tests list for the selected category ──
  return (
    <div className="bg-brand-bg text-brand-text py-4 px-4 sm:py-6 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <Seo
          title="Typing Speed Tests — 1, 3, 5 & 10 Minute WPM Tests | FastTypingLab"
          description="Take free typing speed tests in English, Hindi Mangal (Unicode) and Kruti Dev. 1, 3, 5 and 10-minute WPM tests with real-time accuracy and net speed."
        />

        {/* One header row: back link on the left, title centred (no eyebrow repeating the title). */}
        <PageHeader
          icon={selected.icon}
          gradient={selected.gradient}
          devanagari={selected.devanagari}
          title={`${selected.title} Tests`}
          actions={
            <button onClick={() => setSelected(null)}
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-muted hover:text-brand-primary transition-colors">
              <ChevronLeft className="w-4 h-4" /> All tracks
            </button>
          }
        />

        {/* ── Content ── */}
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-8 h-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
          </div>
        ) : tests.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center bg-brand-surface border border-brand-border rounded-2xl p-8">
            <BookOpen className="w-8 h-8 text-brand-muted mx-auto mb-2" />
            <h2 className="text-lg font-bold text-brand-text mb-1">No tests yet</h2>
            <p className="text-brand-text-muted text-sm">No {selected.title} passages are available right now. New content is added automatically.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
            {[...tests].sort(byDifficulty).map((test) => (
              <TestListItem key={test.id} test={test} devanagari={!!selected.devanagari} />
            ))}
          </div>
        )}

        {!loading && tests.length > 0 && (
          <p className="text-center text-xs text-brand-muted mt-4">
            {tests.length} {selected.title} passages · new ones added daily
          </p>
        )}
      </div>
    </div>
  );
}

function TestListItem({ test, devanagari }: { test: any; devanagari: boolean }) {
  const diff = DIFF_CONFIG[(test.difficulty_level || 'medium').toLowerCase()] || DIFF_CONFIG.medium;
  const done = isTestCompleted(test.slug || test.id);
  const date = test.created_at
    ? new Date(test.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : null;
  const words = test.word_count || 1000;

  // One compact row (about 56px): title, then difficulty + date + length as small meta.
  return (
    <Link to={`/tests/config/${test.slug || test.id}`}
      className={`group flex items-center gap-3 px-3 py-2 rounded-xl border hover:border-brand-primary/40 hover:shadow-sm transition-all duration-150 ${
        done ? 'bg-emerald-500/5 border-emerald-500/25' : 'bg-brand-surface border-brand-border'
      }`}>
      <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${done ? 'bg-emerald-500/15 text-emerald-500' : 'icon-teal'}`}>
        {done ? <CheckCircle2 className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
      </div>

      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-semibold text-brand-text truncate group-hover:text-brand-primary transition-colors leading-snug"
          style={devanagari ? { fontFamily: "'Noto Sans Devanagari',sans-serif" } : undefined}>
          {test.title}
        </h2>
        <div className="flex items-center gap-x-2 text-[11px] text-brand-muted leading-tight mt-0.5">
          <span className={`px-1.5 rounded font-semibold border ${diff.bg} ${diff.color} ${diff.border}`}>{diff.label}</span>
          {done && <span className="font-semibold text-emerald-600 dark:text-emerald-400">Done</span>}
          {date && <span>{date}</span>}
          <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{test.word_count ? `~${Math.ceil(test.word_count / 200)} min` : '~5 min'}</span>
          <span className="inline-flex items-center gap-1"><BarChart2 className="w-3 h-3" />{words} words</span>
          {test.category && <span className="hidden md:inline truncate max-w-[140px] text-brand-muted/70">{test.category}</span>}
        </div>
      </div>

      <ChevronRight className="shrink-0 w-4 h-4 text-brand-muted group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}
