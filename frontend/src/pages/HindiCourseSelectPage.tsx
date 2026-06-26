import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Star, Zap, Languages, CheckCircle, ChevronRight, Flame, Award, TrendingUp } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { STAGES, type CourseProgressState } from '../data/hindiCourseData';
import * as UnicodeCourse from '../data/hindiCourseData';
import * as KrutiDevCourse from '../data/krutiDevCourseData';

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner: '#2A9DAE',
  easy: '#5FB89C',
  medium: '#BC6C50',
  hard: '#CC7B5D',
  expert: '#9B4F6B',
};

export default function HindiCourseSelectPage() {
  const { layout } = useParams<{ layout: string }>();
  const isKrutiDev = layout === 'kruti-dev';
  const course = isKrutiDev ? KrutiDevCourse : UnicodeCourse;
  const basePath = `/learn-hindi-typing/${isKrutiDev ? 'kruti-dev' : 'unicode'}`;
  const [progress, setProgress] = useState<CourseProgressState | null>(null);

  useEffect(() => {
    document.title = `हिंदी टाइपिंग कोर्स — ${isKrutiDev ? 'Kruti Dev' : 'Unicode'} | FastTypingLab`;
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    setProgress(course.loadCourseProgress());
    return () => { try { document.head.removeChild(link); } catch {} };
  }, [isKrutiDev, course]);

  const xp = useMemo(() => (progress ? course.totalXp(progress) : 0), [progress, course]);
  const level = useMemo(() => course.levelForXp(xp), [xp, course]);
  const badges = useMemo(() => (progress ? course.earnedBadges(progress) : []), [progress, course]);
  const completedCount = useMemo(
    () => (progress ? Object.values(progress.lessons).filter(l => l.completed).length : 0),
    [progress]
  );
  const pct = Math.round((completedCount / course.TOTAL_LESSONS) * 100);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text pb-24">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 glass-nav border-b border-brand-border">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Link to="/learn-hindi-typing" className="font-black text-brand-text text-base hover:text-brand-primary transition-colors shrink-0">
              FastTypingLab
            </Link>
            <span className="text-brand-muted text-sm shrink-0">/</span>
            <span className="text-sm font-semibold text-brand-cta truncate" style={{ fontFamily: "'Noto Sans Devanagari',sans-serif" }}>
              हिंदी टाइपिंग कोर्स — {isKrutiDev ? 'Kruti Dev' : 'Unicode'}
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-brand-muted">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span className="font-bold text-brand-text">{progress?.currentStreak || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-brand-muted">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-brand-text">{xp} XP</span>
            </div>
            <div className="relative w-9 h-9">
              <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="var(--brand-border)" strokeWidth="3" />
                <circle cx="18" cy="18" r="14" fill="none" strokeWidth="3"
                  stroke="url(#cpg)" strokeLinecap="round" strokeDasharray={`${pct * 0.879} 87.96`} />
                <defs>
                  <linearGradient id="cpg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#BC6C50" /><stop offset="100%" stopColor="#DDAD9C" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-brand-text">{pct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero / Dashboard */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-10 pb-8">
        <PageHeader
          icon={Languages}
          gradient="linear-gradient(135deg,#304C53,#2A9DAE)"
          eyebrow={isKrutiDev ? 'Kruti Dev 010 — Remington Gail Keyboard' : 'INSCRIPT — Unicode / Mangal Keyboard'}
          title={<><span style={{ fontFamily: "'Noto Sans Devanagari',sans-serif" }}>हिंदी टाइपिंग</span>{' '}<span className="gradient-text-cta">मास्टरी कोर्स</span></>}
          subtitle="200 progressive lessons across 12 stages — home row to SSC/UP Police/court exam mastery."
          className="mb-8"
        />

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Level', value: level.current.name, icon: TrendingUp, color: 'text-brand-cta' },
            { label: 'Total XP', value: xp, icon: Zap, color: 'text-amber-500' },
            { label: 'Streak', value: `${progress?.currentStreak || 0} days`, icon: Flame, color: 'text-orange-500' },
            { label: 'Badges', value: `${badges.length}/${course.BADGES.length}`, icon: Award, color: 'text-brand-accent' },
          ].map(s => (
            <div key={s.label} className="bg-brand-surface border border-brand-border rounded-xl p-3 text-center">
              <s.icon className={`w-4 h-4 mx-auto mb-1 ${s.color}`} />
              <div className={`font-black text-sm ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-brand-muted uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Badge row */}
        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-2">
            {badges.map(b => (
              <div key={b.id} title={b.name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(188,108,80,0.08)', border: '1px solid rgba(188,108,80,0.2)', color: 'var(--brand-cta)' }}>
                <span>{b.icon}</span>
                <span style={{ fontFamily: "'Noto Sans Devanagari',sans-serif" }}>{b.nameHindi}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stage sections */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 space-y-10">
        {STAGES.map(stage => {
          const stageLessons = course.LESSONS.filter(l => l.stage === stage.id);
          const stageDone = stageLessons.filter(l => progress?.lessons[l.id]?.completed).length;
          const stageComplete = stageDone === stageLessons.length;

          return (
            <motion.div key={stage.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-30px' }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{stage.icon}</span>
                <div className="flex-1">
                  <h2 className="font-black text-brand-text text-sm sm:text-base">
                    Stage {stage.id}: {stage.name}{' '}
                    <span style={{ fontFamily: "'Noto Sans Devanagari',sans-serif" }} className="text-brand-muted font-semibold">— {stage.nameHindi}</span>
                  </h2>
                  <p className="text-xs text-brand-muted">{stageDone}/{stageLessons.length} completed</p>
                </div>
                {stageComplete && <CheckCircle className="w-5 h-5 text-brand-accent" />}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {stageLessons.map(lesson => {
                  const unlocked = progress ? course.isLessonUnlocked(lesson.id, progress) : lesson.id === 1;
                  const lp = progress?.lessons[lesson.id];
                  const completed = !!lp?.completed;
                  const stars = lp?.stars || 0;
                  const bestWpm = lp?.bestWpm || 0;
                  const isCurrent = unlocked && !completed;

                  return (
                    <Link key={lesson.id}
                      to={unlocked ? `${basePath}/lesson-${lesson.id}` : '#'}
                      onClick={e => !unlocked && e.preventDefault()}
                      className={`group flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 ${
                        !unlocked
                          ? 'opacity-50 cursor-not-allowed border-brand-border bg-brand-surface'
                          : completed
                            ? 'border-brand-accent/30 bg-brand-accent/5 hover:shadow-lg hover:-translate-y-0.5'
                            : isCurrent
                              ? 'border-brand-cta/40 hover:shadow-lg hover:-translate-y-0.5'
                              : 'border-brand-border bg-brand-surface hover:border-brand-cta/30 hover:shadow-md hover:-translate-y-0.5'
                      }`}
                      style={isCurrent ? { background: 'rgba(188,108,80,0.04)' } : {}}>

                      <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white transition-transform group-hover:scale-105"
                        style={!unlocked ? { background: 'var(--brand-surface-2)' }
                          : completed ? { background: 'linear-gradient(135deg,#2A9DAE,#AFE0E7)' }
                          : isCurrent ? { background: 'linear-gradient(135deg,#BC6C50,#CC7B5D)' }
                          : { background: 'var(--brand-surface-2)', color: 'var(--brand-muted)' }}>
                        {!unlocked ? <Lock className="w-4 h-4 text-brand-muted" /> : lesson.id}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[9px] font-bold uppercase tracking-widest"
                            style={{ color: completed ? 'var(--brand-accent)' : isCurrent ? 'var(--brand-cta)' : 'var(--brand-muted)' }}>
                            पाठ {lesson.id}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: DIFFICULTY_COLOR[lesson.difficulty], background: `${DIFFICULTY_COLOR[lesson.difficulty]}1a` }}>
                            {lesson.difficulty}
                          </span>
                        </div>
                        <h3 className="font-bold text-brand-text text-xs truncate">{lesson.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {stars > 0 && (
                            <div className="flex gap-0.5">
                              {Array.from({ length: stars }).map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />)}
                            </div>
                          )}
                          {bestWpm > 0 && (
                            <span className="text-[9px] font-bold text-brand-muted ml-auto flex items-center gap-0.5">
                              <Zap className="w-2.5 h-2.5" />{bestWpm}
                            </span>
                          )}
                        </div>
                      </div>

                      {unlocked && <ChevronRight className="w-3.5 h-3.5 text-brand-muted group-hover:text-brand-cta group-hover:translate-x-0.5 transition-all shrink-0" />}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 mt-16">
        <div className="rounded-2xl p-6 text-center"
          style={{ background: 'linear-gradient(135deg,rgba(188,108,80,0.08),rgba(221,173,156,0.06))', border: '1px solid rgba(188,108,80,0.2)' }}>
          <h3 className="font-black text-brand-text text-lg mb-2" style={{ fontFamily: "'Noto Sans Devanagari',sans-serif" }}>
            परीक्षा की तैयारी करें
          </h3>
          <p className="text-brand-text-muted text-sm mb-4">After completing the course, test yourself against real exam-pattern passages.</p>
          <Link to="/competitive-exam-typing"
            className="inline-flex items-center gap-2 font-bold text-white px-6 py-2.5 rounded-xl transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg,#BC6C50,#CC7B5D)' }}>
            परीक्षा अभ्यास शुरू करें <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
