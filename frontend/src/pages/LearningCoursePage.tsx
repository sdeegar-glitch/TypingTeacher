import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Star, Zap } from 'lucide-react';
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

export default function LearningCoursePage() {
  const [progress, setProgress] = useState<Record<string, any>>({});

  useEffect(() => {
    document.title = 'Learn Typing — Lessons | FastTypingLab';
    setProgress(loadProgress());
  }, []);

  const isUnlocked  = (id: number) => id === 1 || !!progress[(id - 1).toString()]?.completed;
  const isCompleted = (id: number) => !!progress[id.toString()]?.completed;
  const getStars    = (id: number) => progress[id.toString()]?.stars || 0;

  const totalDone = Object.keys(progress).length;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text pb-24">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-40 glass-nav border-b border-brand-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="font-black text-brand-text text-base hover:text-brand-primary transition-colors">
              FastTypingLab
            </Link>
            <span className="text-brand-muted text-sm">/</span>
            <span className="text-sm font-semibold text-brand-muted">Learn</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold text-brand-muted uppercase tracking-widest">Mastery</span>
              <span className="text-base font-black text-brand-text font-mono">{totalDone} <span className="text-brand-muted font-normal text-sm">/ 50</span></span>
            </div>
            {/* Progress ring */}
            <div className="relative w-9 h-9">
              <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="var(--brand-border)" strokeWidth="3" />
                <circle cx="18" cy="18" r="14" fill="none" strokeWidth="3"
                  stroke="url(#pg)" strokeLinecap="round"
                  strokeDasharray={`${(totalDone / 50) * 87.96} 87.96`} />
                <defs>
                  <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#304C53" />
                    <stop offset="100%" stopColor="#2A9DAE" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-brand-text">{Math.round((totalDone / 50) * 100)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-8 text-center">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-accent mb-3">Structured Course</p>
          <h1 className="text-3xl sm:text-4xl font-black text-brand-text mb-2">
            Your <span className="gradient-text">Typing Journey</span>
          </h1>
          <p className="text-brand-muted text-sm max-w-md mx-auto">
            50 lessons from home row to full keyboard mastery. Complete each lesson to unlock the next.
          </p>
        </motion.div>

        {/* Stats strip */}
        <div className="flex items-center justify-center gap-6 mt-6">
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
      </div>

      {/* ── Lesson path ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
        {/* Center spine */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 hidden md:block"
          style={{ background: 'linear-gradient(180deg,var(--brand-primary),var(--brand-accent),var(--brand-cta))' }} />

        <div className="flex flex-col gap-14 relative z-10">
          {LESSONS.map((lesson, index) => {
            const isLeft = index % 2 === 0;
            const unlocked = isUnlocked(lesson.id);
            const completed = isCompleted(lesson.id);
            const stars = getStars(lesson.id);
            const isCurrent = unlocked && !completed;

            return (
              <motion.div key={lesson.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: Math.min(index * 0.02, 0.3) }}
                className={`flex flex-col md:flex-row items-center gap-4 md:gap-8 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} justify-center group`}>

                {/* Text label */}
                <div className={`w-full md:w-5/12 ${isLeft ? 'md:text-right' : 'md:text-left'} text-center transition-all duration-300 ${!unlocked ? 'opacity-30' : ''} order-2 md:order-none`}>
                  <span className="text-[10px] font-bold uppercase tracking-widest mb-1 block"
                    style={{ color: completed ? 'var(--brand-accent)' : isCurrent ? 'var(--brand-cta)' : 'var(--brand-muted)' }}>
                    Level {lesson.id} · {lesson.description}
                  </span>
                  <h3 className="text-lg font-black text-brand-text leading-tight">{lesson.title}</h3>
                  {completed && stars > 0 && (
                    <div className="flex items-center gap-0.5 mt-1 justify-center md:justify-end">
                      {Array.from({ length: stars }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  )}
                  {isCurrent && !completed && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold mt-1"
                      style={{ color: 'var(--brand-cta)' }}>
                      <Zap className="w-3 h-3" /> Start here
                    </span>
                  )}
                </div>

                {/* Node button */}
                <div className="relative order-1 md:order-none shrink-0">
                  {isCurrent && (
                    <div className="absolute inset-[-12px] rounded-full animate-ping opacity-25"
                      style={{ background: 'radial-gradient(circle,rgba(188,108,80,.4),transparent)' }} />
                  )}

                  <Link to={unlocked ? `/learn/${lesson.id}` : '#'}
                    onClick={e => !unlocked && e.preventDefault()}
                    className={`relative w-20 h-20 rounded-[30%] flex flex-col items-center justify-center transition-all duration-300 shadow-lg border-b-4 ${
                      !unlocked ? 'cursor-not-allowed opacity-40' : 'hover:scale-110 active:translate-y-1 active:border-b-0'
                    }`}
                    style={!unlocked ? {
                      background: 'var(--brand-surface-2)', borderColor: 'var(--brand-border)',
                    } : completed ? {
                      background: 'linear-gradient(135deg,#2A9DAE,#AFE0E7)', borderColor: '#1C7A87',
                      boxShadow: '0 6px 20px rgba(42,157,174,.3)',
                    } : {
                      background: 'linear-gradient(135deg,#BC6C50,#CC7B5D)', borderColor: '#8B4C37',
                      boxShadow: '0 6px 20px rgba(188,108,80,.35)',
                    }}>

                    {!unlocked ? (
                      <Lock className="w-7 h-7 text-brand-muted opacity-50" />
                    ) : (
                      <>
                        <span className="text-2xl font-black text-white">{lesson.id}</span>
                        {completed && (
                          <span className="text-white/90 text-[9px] font-bold mt-0.5">✓ Done</span>
                        )}
                        {isCurrent && (
                          <span className="absolute -top-3 -right-3 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-bounce"
                            style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>GO!</span>
                        )}
                      </>
                    )}
                  </Link>
                </div>

                {/* Right spacer */}
                <div className="hidden md:block w-5/12 order-3 md:order-none" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
