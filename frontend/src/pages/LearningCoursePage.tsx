import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Star, Zap, Keyboard, CheckCircle, ChevronRight } from 'lucide-react';
import { loadProgress } from '../utils/progressManager';

const LESSON_TITLES = [
  'f and j Keys', 'Spacebar Power', 'd and k Keys', 'f j d k Review', 's and l Keys',
  'a and ; Keys', 'Home Row Master', 'e and i Keys', 'r and u Keys', 't and y Keys',
  'w and o Keys', 'q and p Keys', 'Top Row Mastery', 'v and n Keys', 'c and m Keys',
  'x and , Keys', 'z and . Keys', 'Bottom Row Mastery', 'Shift Keys', 'Capitals Practice',
];

const generateLessons = () =>
  Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    title: LESSON_TITLES[i] || `Practice Level ${i + 1}`,
    description: i < 7 ? 'Home Row' : i < 12 ? 'Top Row' : i < 18 ? 'Bottom Row' : i < 20 ? 'Shift & Caps' : 'Advanced',
  }));

const LESSONS = generateLessons();

const LESSON_GROUPS = [
  { name: 'Home Row',           icon: '🏠', range: [1, 7]   as [number, number] },
  { name: 'Top Row',            icon: '⬆️', range: [8, 12]  as [number, number] },
  { name: 'Bottom Row',         icon: '⬇️', range: [13, 18] as [number, number] },
  { name: 'Shift & Capitals',   icon: '⇧',  range: [19, 20] as [number, number] },
  { name: 'Advanced Practice',  icon: '🚀', range: [21, 50] as [number, number] },
];

export default function LearningCoursePage() {
  const [progress, setProgress] = useState<Record<string, any>>({});

  useEffect(() => {
    document.title = 'Learn Typing — Lessons | FastTypingLab';
    setProgress(loadProgress());
  }, []);

  const isUnlocked  = (id: number) => id === 1 || !!progress[(id - 1).toString()]?.completed;
  const isCompleted = (id: number) => !!progress[id.toString()]?.completed;
  const getStars    = (id: number) => progress[id.toString()]?.stars || 0;
  const getBestWpm  = (id: number) => progress[id.toString()]?.bestWpm || 0;

  const totalDone  = LESSONS.filter(l => isCompleted(l.id)).length;
  const totalStars = LESSONS.reduce((sum, l) => sum + getStars(l.id), 0);
  const pct = Math.round((totalDone / 50) * 100);

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
            <span className="text-sm font-semibold text-brand-primary">Learn English</span>
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
                  stroke="url(#pg)" strokeLinecap="round"
                  strokeDasharray={`${pct * 0.879} 87.96`} />
                <defs>
                  <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#304C53" />
                    <stop offset="100%" stopColor="#2A9DAE" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-brand-text">{pct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-10 text-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mx-auto mb-5 shadow-xl"
            style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>
            <Keyboard className="w-8 h-8 text-white" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3 text-brand-accent">
            Structured Course
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-brand-text mb-2">
            Your <span className="gradient-text">Typing Journey</span>
          </h1>
          <p className="text-brand-text-muted text-sm max-w-lg mx-auto leading-relaxed mb-6">
            50 progressive lessons — from home row to full keyboard mastery.
            Complete each lesson to unlock the next.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-4">
            {[
              { label: 'Completed', value: totalDone, color: 'text-brand-primary' },
              { label: 'Remaining', value: 50 - totalDone, color: 'text-brand-muted' },
              { label: 'Total XP', value: `${totalDone * 25}+`, color: 'text-brand-accent' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className={`text-xl font-black font-mono ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-brand-muted uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Lesson groups ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
        {LESSON_GROUPS.map(group => {
          const groupLessons = LESSONS.filter(l => l.id >= group.range[0] && l.id <= group.range[1]);
          const groupDone = groupLessons.filter(l => isCompleted(l.id)).length;
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
                  <h2 className="font-black text-brand-text text-sm sm:text-base">{group.name}</h2>
                  <p className="text-xs text-brand-muted">{groupDone}/{groupLessons.length} completed</p>
                </div>
                {groupComplete && <CheckCircle className="w-5 h-5 text-brand-accent" />}
              </div>

              {/* Lesson cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {groupLessons.map((lesson, idx) => {
                  const unlocked = isUnlocked(lesson.id);
                  const completed = isCompleted(lesson.id);
                  const stars = getStars(lesson.id);
                  const bestWpm = getBestWpm(lesson.id);
                  const isCurrent = unlocked && !completed;

                  return (
                    <motion.div key={lesson.id}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.04 }}>
                      <Link
                        to={unlocked ? `/learn/${lesson.id}` : '#'}
                        onClick={e => !unlocked && e.preventDefault()}
                        className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${
                          !unlocked
                            ? 'opacity-50 cursor-not-allowed border-brand-border bg-brand-surface'
                            : completed
                              ? 'border-brand-accent/30 bg-brand-accent/5 hover:shadow-lg hover:-translate-y-0.5'
                              : isCurrent
                                ? 'border-brand-primary/40 hover:shadow-lg hover:-translate-y-0.5'
                                : 'border-brand-border bg-brand-surface hover:border-brand-primary/30 hover:shadow-md hover:-translate-y-0.5'
                        }`}
                        style={isCurrent ? { background: 'rgba(48,76,83,0.04)' } : completed ? {} : { background: 'var(--brand-surface)' }}>

                        {/* Lesson number node */}
                        <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-white transition-transform group-hover:scale-105"
                          style={!unlocked ? { background: 'var(--brand-surface-2)' }
                            : completed ? { background: 'linear-gradient(135deg,#2A9DAE,#AFE0E7)' }
                            : isCurrent ? { background: 'linear-gradient(135deg,#304C53,#2A9DAE)', boxShadow: '0 4px 12px rgba(42,157,174,.3)' }
                            : { background: 'var(--brand-surface-2)', color: 'var(--brand-muted)' }}>
                          {!unlocked
                            ? <Lock className="w-5 h-5 text-brand-muted" />
                            : <span style={{ color: isCurrent || completed ? '#fff' : 'var(--brand-muted)' }}>{lesson.id}</span>
                          }
                        </div>

                        {/* Lesson info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-bold uppercase tracking-widest"
                              style={{ color: completed ? 'var(--brand-accent)' : isCurrent ? 'var(--brand-primary)' : 'var(--brand-muted)' }}>
                              Level {lesson.id}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full animate-pulse"
                                style={{ background: 'var(--brand-primary)' }}>Start here</span>
                            )}
                          </div>
                          <h3 className="font-bold text-brand-text text-sm truncate">{lesson.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-1.5 py-0.5 rounded-md font-bold"
                              style={{ background: 'rgba(48,76,83,0.1)', color: 'var(--brand-primary)', border: '1px solid rgba(48,76,83,0.2)' }}>
                              {lesson.description}
                            </span>
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
                          <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-brand-primary group-hover:translate-x-0.5 transition-all shrink-0" />
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
          style={{ background: 'linear-gradient(135deg,rgba(48,76,83,0.08),rgba(42,157,174,0.06))', border: '1px solid rgba(48,76,83,0.2)' }}>
          <h3 className="font-black text-brand-text text-lg mb-2">Ready to test your speed?</h3>
          <p className="text-brand-text-muted text-sm mb-4">
            After completing the lessons, put your skills to the test with a real typing test.
          </p>
          <Link to="/typing-test"
            className="inline-flex items-center gap-2 font-bold text-white px-6 py-2.5 rounded-xl transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)', boxShadow: '0 4px 14px rgba(42,157,174,.3)' }}>
            Start a Typing Test <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
