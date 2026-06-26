import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Star, Zap, Languages, CheckCircle, ChevronRight } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import {
  HINDI_LESSONS,
  HINDI_LESSON_GROUPS,
  loadHindiProgress,
  isHindiLessonUnlocked,
} from '../data/hindiLessons';

export default function HindiLessonCoursePage() {
  const [progress, setProgress] = useState<Record<number, any>>({});

  useEffect(() => {
    document.title = 'हिंदी टाइपिंग सीखें — INSCRIPT | FastTypingLab';
    // Load Devanagari font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    setProgress(loadHindiProgress());
    return () => { try { document.head.removeChild(link); } catch {} };
  }, []);

  const totalDone = Object.values(progress).filter((p: any) => p.completed).length;
  const totalStars = Object.values(progress).reduce((sum: number, p: any) => sum + (p.stars || 0), 0);
  const pct = Math.round((totalDone / 30) * 100);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text pb-24">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-40 glass-nav border-b border-brand-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="font-black text-brand-text text-base hover:text-brand-primary transition-colors">
              FastTypingLab
            </Link>
            <span className="text-brand-muted text-sm">/</span>
            <span className="text-sm font-semibold text-brand-cta" style={{ fontFamily: "'Noto Sans Devanagari',sans-serif" }}>
              हिंदी सीखें
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-brand-muted">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-brand-text">{totalStars}</span>
            </div>
            {/* Progress ring */}
            <div className="relative w-9 h-9">
              <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="var(--brand-border)" strokeWidth="3" />
                <circle cx="18" cy="18" r="14" fill="none" strokeWidth="3"
                  stroke="url(#hpg)" strokeLinecap="round"
                  strokeDasharray={`${pct * 0.879} 87.96`} />
                <defs>
                  <linearGradient id="hpg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#BC6C50" />
                    <stop offset="100%" stopColor="#DDAD9C" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-brand-text">{pct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12">
        <PageHeader
          icon={Languages}
          gradient="linear-gradient(135deg,#BC6C50,#CC7B5D)"
          eyebrow="INSCRIPT Keyboard — Mangal Unicode"
          title={<><span style={{ fontFamily: "'Noto Sans Devanagari',sans-serif" }}>हिंदी टाइपिंग</span>{' '}<span className="gradient-text-cta">सीखें</span></>}
          subtitle="30 progressive lessons — from home row to full Hindi typing mastery. Designed for SSC, CPCT, UP Police, and court exam preparation."
        >
          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-6">
            {[
              { label: 'पूर्ण', value: totalDone, color: 'text-brand-cta' },
              { label: 'शेष', value: 30 - totalDone, color: 'text-brand-muted' },
              { label: 'कुल XP', value: `${totalDone * 30}+`, color: 'text-brand-accent' },
            ].map(s => (
              <div key={s.label} className="text-center" style={{ fontFamily: "'Noto Sans Devanagari',sans-serif" }}>
                <div className={`text-xl font-black font-mono ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-brand-muted uppercase tracking-widest" style={{ fontFamily: 'Inter,sans-serif' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </PageHeader>
      </div>

      {/* ── Lesson groups ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
        {HINDI_LESSON_GROUPS.map(group => {
          const groupLessons = HINDI_LESSONS.filter(l => l.id >= group.range[0] && l.id <= group.range[1]);
          const groupDone = groupLessons.filter(l => progress[l.id]?.completed).length;
          const groupComplete = groupDone === groupLessons.length;

          return (
            <motion.div key={group.name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}>

              {/* Group header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{group.icon}</span>
                <div className="flex-1">
                  <h2 className="font-black text-brand-text text-sm sm:text-base"
                    style={{ fontFamily: "'Noto Sans Devanagari',sans-serif" }}>
                    {group.name}
                  </h2>
                  <p className="text-xs text-brand-muted">{groupDone}/{groupLessons.length} completed</p>
                </div>
                {groupComplete && <CheckCircle className="w-5 h-5 text-brand-accent" />}
              </div>

              {/* Lesson cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {groupLessons.map((lesson, idx) => {
                  const unlocked = isHindiLessonUnlocked(lesson.id);
                  const lessonProgress = progress[lesson.id];
                  const completed = !!lessonProgress?.completed;
                  const stars = lessonProgress?.stars || 0;
                  const bestWpm = lessonProgress?.bestWpm || 0;
                  const isCurrent = unlocked && !completed;

                  return (
                    <motion.div key={lesson.id}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.04 }}>
                      <Link
                        to={unlocked ? `/hindi-lessons/${lesson.id}` : '#'}
                        onClick={e => !unlocked && e.preventDefault()}
                        className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${
                          !unlocked
                            ? 'opacity-50 cursor-not-allowed border-brand-border bg-brand-surface'
                            : completed
                              ? 'border-brand-accent/30 bg-brand-accent/5 hover:shadow-lg hover:-translate-y-0.5'
                              : isCurrent
                                ? 'border-brand-cta/40 hover:shadow-lg hover:-translate-y-0.5'
                                : 'border-brand-border bg-brand-surface hover:border-brand-cta/30 hover:shadow-md hover:-translate-y-0.5'
                        }`}
                        style={isCurrent ? { background: 'rgba(188,108,80,0.04)' } : completed ? {} : { background: 'var(--brand-surface)' }}>

                        {/* Lesson number node */}
                        <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-white transition-transform group-hover:scale-105`}
                          style={!unlocked ? { background: 'var(--brand-surface-2)' }
                            : completed ? { background: 'linear-gradient(135deg,#2A9DAE,#AFE0E7)' }
                            : isCurrent ? { background: 'linear-gradient(135deg,#BC6C50,#CC7B5D)', boxShadow: '0 4px 12px rgba(188,108,80,.3)' }
                            : { background: 'var(--brand-surface-2)', color: 'var(--brand-muted)' }}>
                          {!unlocked
                            ? <Lock className="w-5 h-5 text-brand-muted" />
                            : completed
                              ? <span style={{ fontFamily: 'Inter,sans-serif' }}>{lesson.id}</span>
                              : <span style={{ fontFamily: 'Inter,sans-serif', color: isCurrent ? '#fff' : 'var(--brand-muted)' }}>{lesson.id}</span>
                          }
                        </div>

                        {/* Lesson info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-widest"
                              style={{ color: completed ? 'var(--brand-accent)' : isCurrent ? 'var(--brand-cta)' : 'var(--brand-muted)' }}>
                              पाठ {lesson.id}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full animate-pulse"
                                style={{ background: 'var(--brand-cta)' }}>यहाँ से शुरू</span>
                            )}
                          </div>
                          <h3 className="font-bold text-brand-text text-sm truncate">{lesson.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {/* New keys preview */}
                            {lesson.newKeys.length > 0 && (
                              <div className="flex gap-1 flex-wrap">
                                {lesson.newKeys.slice(0, 4).map(k => (
                                  <span key={k} className="text-xs px-1.5 py-0.5 rounded-md font-bold"
                                    style={{ fontFamily: "'Noto Sans Devanagari',sans-serif", background: 'rgba(188,108,80,0.1)', color: 'var(--brand-cta)', border: '1px solid rgba(188,108,80,0.2)' }}>
                                    {k}
                                  </span>
                                ))}
                              </div>
                            )}
                            {/* Stars */}
                            {stars > 0 && (
                              <div className="flex gap-0.5 ml-auto">
                                {Array.from({ length: stars }).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                ))}
                              </div>
                            )}
                            {/* Best WPM */}
                            {bestWpm > 0 && (
                              <span className="text-[10px] font-bold text-brand-muted ml-auto flex items-center gap-0.5">
                                <Zap className="w-3 h-3" />{bestWpm}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Arrow */}
                        {unlocked && (
                          <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-brand-cta group-hover:translate-x-0.5 transition-all shrink-0" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-16">
        <div className="rounded-2xl p-6 text-center"
          style={{ background: 'linear-gradient(135deg,rgba(188,108,80,0.08),rgba(221,173,156,0.06))', border: '1px solid rgba(188,108,80,0.2)' }}>
          <h3 className="font-black text-brand-text text-lg mb-2"
            style={{ fontFamily: "'Noto Sans Devanagari',sans-serif" }}>
            परीक्षा की तैयारी करें
          </h3>
          <p className="text-brand-text-muted text-sm mb-4">
            After completing the lessons, practice with real exam passages.
          </p>
          <Link to="/competitive-exam-typing"
            className="inline-flex items-center gap-2 font-bold text-white px-6 py-2.5 rounded-xl transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg,#BC6C50,#CC7B5D)', boxShadow: '0 4px 14px rgba(188,108,80,.3)' }}>
            परीक्षा अभ्यास शुरू करें <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
