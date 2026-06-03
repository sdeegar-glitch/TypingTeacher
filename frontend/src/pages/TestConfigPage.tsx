import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Zap, ChevronLeft } from 'lucide-react';
import { API_URL as BASE_URL } from '../lib/api';

const API_URL = `${BASE_URL}/api/tests`;

const DURATION_OPTIONS = [
  { label: '1 Min',  value: 1,  desc: 'Quick warm-up' },
  { label: '3 Min',  value: 3,  desc: 'Standard test' },
  { label: '5 Min',  value: 5,  desc: 'Exam practice' },
  { label: '10 Min', value: 10, desc: 'Endurance run' },
];

export default function TestConfigPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [customMinutes, setCustomMinutes] = useState(2);

  useEffect(() => {
    fetch(`${API_URL}/${slug}`)
      .then(r => r.json())
      .then(data => { setTest(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  const startTest = (minutes: number) => navigate(`/tests/${slug}?duration=${minutes * 60}`);

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
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg">

        {/* Back */}
        <button onClick={() => navigate('/tests')}
          className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text text-sm font-medium transition-colors mb-6 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Tests
        </button>

        {/* Card */}
        <div className="glass-card rounded-3xl overflow-hidden shadow-2xl">
          {/* Top accent bar */}
          <div className="h-1" style={{ background: 'linear-gradient(90deg,#304C53,#2A9DAE,#BC6C50)' }} />

          <div className="p-8">
            {/* Test info */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-2xl icon-teal flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-brand-text mb-3 tracking-tight leading-snug">
                {test.title}
              </h2>
              <div className="flex flex-wrap justify-center gap-2 mb-5">
                {[
                  { icon: BookOpen, label: `${test.word_count || 1000} words` },
                  { icon: Zap,      label: test.difficulty_level || 'Medium' },
                  { icon: Clock,    label: test.category || 'Typing' },
                ].map(b => (
                  <span key={b.label}
                    className="flex items-center gap-1.5 text-xs font-semibold text-brand-muted bg-brand-surface-2 border border-brand-border px-3 py-1.5 rounded-full">
                    <b.icon className="w-3 h-3" />{b.label}
                  </span>
                ))}
              </div>
              {test.excerpt && (
                <p className="text-brand-text-muted text-sm italic leading-relaxed border-l-2 border-brand-accent pl-4 py-1 text-left max-w-md mx-auto"
                  style={{ borderColor: 'var(--brand-accent)' }}>
                  "{test.excerpt}"
                </p>
              )}
            </div>

            {/* Duration cards */}
            <p className="text-xs font-bold uppercase tracking-widest text-brand-muted mb-3">Select Duration</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {DURATION_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => startTest(opt.value)}
                  className="flex flex-col items-center gap-1 py-4 rounded-2xl border font-bold text-sm transition-all duration-200 hover:shadow-lg active:scale-95 group"
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
                  <span className="text-[10px] opacity-60">{opt.desc}</span>
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
