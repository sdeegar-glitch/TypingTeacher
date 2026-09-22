import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Zap, ChevronLeft } from 'lucide-react';
import { fetchTestBySlug } from '../lib/api';
import { getLastDuration, setLastDuration } from '../lib/testProgress';
import Seo from '../components/Seo';

const DURATION_OPTIONS = [
  { label: '2 Min',  value: 2,  desc: 'Quick warm-up' },
  { label: '5 Min',  value: 5,  desc: 'Standard test' },
  { label: '10 Min', value: 10, desc: 'Exam practice' },
  { label: '15 Min', value: 15, desc: 'Endurance run' },
];

export default function TestConfigPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const lastDuration = getLastDuration(2);
  const [customMinutes, setCustomMinutes] = useState(lastDuration);

  useEffect(() => {
    fetchTestBySlug(slug!)
      .then(data => { setTest(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  const startTest = (minutes: number) => {
    setLastDuration(minutes); // remember for next time
    navigate(`/tests/${slug}?duration=${minutes * 60}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="text-center">
          <p className="text-brand-muted text-lg mb-4">Test not found.</p>
          <button onClick={() => navigate('/tests')} className="text-brand-primary font-semibold hover:opacity-80 transition-opacity">
            ← Back to Tests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-bg flex justify-center px-4 py-4 sm:py-6">
      <Seo
        title={`Choose Duration — ${test.title} | FastTypingLab`}
        description="Pick a test duration to start your typing test."
        noindex
      />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl">

        {/* Back */}
        <button onClick={() => navigate('/tests')}
          className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text text-sm font-medium transition-colors mb-3 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Tests
        </button>

        {/* Card */}
        <div className="glass-card rounded-2xl overflow-hidden shadow-lg">
          {/* Top accent bar */}
          <div className="h-1" style={{ background: 'linear-gradient(90deg,#304C53,#2A9DAE,#BC6C50)' }} />

          <div className="p-4 sm:p-5">
            {/* Test info */}
            <div className="text-center mb-4">
              <div className="w-9 h-9 rounded-lg icon-teal flex items-center justify-center mx-auto mb-2">
                <BookOpen className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-brand-text mb-2 tracking-tight leading-snug">
                {test.title}
              </h1>
              <div className="flex flex-wrap justify-center gap-2 mb-3">
                {[
                  { icon: BookOpen, label: `${test.word_count || 1000} words` },
                  { icon: Zap,      label: test.difficulty_level || 'Medium' },
                  { icon: Clock,    label: test.category || 'Typing' },
                ].map(b => (
                  <span key={b.label}
                    className="flex items-center gap-1.5 text-xs font-semibold text-brand-muted bg-brand-surface-2 border border-brand-border px-2.5 py-1 rounded-full">
                    <b.icon className="w-3 h-3" />{b.label}
                  </span>
                ))}
              </div>
              {test.excerpt && (
                <p className="text-brand-text-muted text-sm italic leading-snug border-l-2 border-brand-accent pl-3 py-0.5 text-left max-w-xl mx-auto line-clamp-3"
                  style={{ borderColor: 'var(--brand-accent)' }}>
                  "{test.excerpt}"
                </p>
              )}
            </div>

            {/* Duration cards */}
            <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-2">Select Duration</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {DURATION_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => startTest(opt.value)}
                  className="flex flex-col items-center gap-0.5 py-2.5 rounded-xl border font-bold text-sm transition-all duration-200 hover:shadow-lg active:scale-95 group"
                  style={{ background: 'var(--brand-surface-2)', borderColor: 'var(--brand-border)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg,#304C53,#2A9DAE)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(48,76,83,.3)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-surface-2)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--brand-border)';
                    (e.currentTarget as HTMLButtonElement).style.color = '';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '';
                  }}>
                  <span className="text-base font-black">{opt.label}</span>
                  <span className="text-[10px] opacity-60">{opt.value === lastDuration ? '★ Last used' : opt.desc}</span>
                </button>
              ))}
            </div>

            {/* Custom duration */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <input type="number" min="1" max="60" value={customMinutes}
                  onChange={e => setCustomMinutes(Number(e.target.value))}
                  className="w-24 px-3 py-3 rounded-xl border border-brand-border bg-brand-surface-2 text-center font-bold text-brand-text text-sm outline-none focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/15 transition-all" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-brand-muted">min</span>
              </div>
              <button onClick={() => startTest(customMinutes)}
                className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg,#BC6C50,#CC7B5D)', boxShadow: '0 4px 14px rgba(188,108,80,.3)' }}>
                Start Custom Duration
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
