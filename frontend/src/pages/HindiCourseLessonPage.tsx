import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, Star, Zap, Flame } from 'lucide-react';
import {
  LESSONS,
  STAGES,
  INSCRIPT_FULL_MAP,
  saveCourseProgress,
  isLessonUnlocked,
  loadCourseProgress,
  totalXp,
  levelForXp,
} from '../data/hindiCourseData';

const DEVA_FONT = "'Noto Sans Devanagari', sans-serif";

const KEYBOARD_ROWS: string[][] = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

const SHIFT_OF: Record<string, string> = { q: 'Q', w: 'W', e: 'E', r: 'R', t: 'T', y: 'Y', u: 'U', i: 'I', o: 'O', p: 'P', a: 'A', s: 'S', d: 'D', f: 'F', g: 'G', h: 'H', j: 'J', k: 'K', l: 'L', ';': ':', "'": '"', z: 'Z', x: 'X', c: 'C', v: 'V', b: 'B', n: 'N', m: 'M' };

function VirtualKeyboard({ pressedKey, activeMap }: { pressedKey: string; activeMap: Record<string, string> }) {
  return (
    <div className="w-full max-w-2xl select-none">
      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted mb-2 px-1">INSCRIPT Keyboard Reference</p>
      <div className="flex flex-col gap-1.5 items-center">
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-1.5" style={{ paddingLeft: `${ri * 14}px` }}>
            {row.map(key => {
              const shiftKey = SHIFT_OF[key];
              const base = activeMap[key];
              const shifted = activeMap[shiftKey];
              const isPressed = pressedKey.toLowerCase() === key;
              return (
                <div key={key} className="w-9 h-11 sm:w-10 sm:h-12 rounded-lg border flex flex-col items-center justify-center transition-all"
                  style={{
                    borderColor: isPressed ? 'var(--brand-cta)' : 'var(--brand-border)',
                    background: isPressed ? 'rgba(188,108,80,0.12)' : 'var(--brand-surface)',
                    boxShadow: isPressed ? '0 0 0 2px rgba(188,108,80,0.25)' : 'none',
                  }}>
                  <span className="text-[9px] leading-none text-brand-muted" style={{ fontFamily: DEVA_FONT }}>{shifted || ''}</span>
                  <span className="text-xs font-bold leading-none mt-0.5" style={{ fontFamily: DEVA_FONT, color: base ? 'var(--brand-cta)' : 'var(--brand-muted)' }}>
                    {base || key}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HindiCourseLessonPage() {
  const { layout, lessonId } = useParams<{ layout: string; lessonId: string }>();
  const navigate = useNavigate();
  const id = Number((lessonId || '').replace('lesson-', '')) || 1;

  const lesson = useMemo(() => LESSONS.find(l => l.id === id) || LESSONS[0], [id]);
  const nextLesson = LESSONS.find(l => l.id === id + 1);
  const stageMeta = STAGES.find(s => s.id === lesson.stage);

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  const [userInput, setUserInput] = useState('');
  const [mistakes, setMistakes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [netWpm, setNetWpm] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [pressedKey, setPressedKey] = useState('');
  const [earnedStars, setEarnedStars] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const [mobileVal, setMobileVal] = useState('');
  const lastMobileRef = useRef('');

  const target = lesson.content;
  const progress = useMemo(() => loadCourseProgress(), []);
  const savedProgress = progress.lessons[id];
  const unlocked = isLessonUnlocked(id, progress);
  const basePath = `/learn-hindi-typing/${layout || 'unicode'}`;

  useEffect(() => {
    document.title = `पाठ ${id} — ${lesson.title} | FastTypingLab`;
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch {} };
  }, [id, lesson.title]);

  useEffect(() => {
    if (!unlocked) navigate(basePath);
  }, [unlocked, navigate, basePath]);

  useEffect(() => {
    let t: ReturnType<typeof setInterval>;
    if (startTime && !isFinished) {
      t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 500);
    }
    return () => clearInterval(t);
  }, [startTime, isFinished]);

  useEffect(() => {
    if (isMobile) setTimeout(() => hiddenRef.current?.focus(), 300);
  }, [isMobile]);

  useEffect(() => {
    if (userInput.length !== target.length || userInput.length === 0) return;
    setIsFinished(true);
    const mins = (Date.now() - (startTime || Date.now())) / 60000;
    const gross = Math.round((userInput.length / 5) / Math.max(mins, 0.01));
    const net = Math.max(0, Math.round(((userInput.length - mistakes.length) / 5) / Math.max(mins, 0.01)));
    const acc = Math.round(((userInput.length - mistakes.length) / userInput.length) * 100);
    setWpm(gross); setNetWpm(net);

    let s = 0;
    if (net >= lesson.minWpm && acc >= 90) {
      s = 1;
      if (acc >= 95) s = 2;
      if (acc >= 98) s = 3;
      if (acc >= 99 && net >= lesson.minWpm + 5) s = 4;
      if (acc === 100 && net >= lesson.minWpm + 10) s = 5;
    }
    setEarnedStars(s);
    if (s > 0) {
      saveCourseProgress({ lessonId: id, stars: s, bestWpm: net, bestAccuracy: acc });
      setXpGained(savedProgress?.completed ? 0 : lesson.xp);
    }
  }, [userInput, target, startTime, mistakes.length, id, lesson.minWpm, lesson.xp, savedProgress]);

  useEffect(() => {
    if (!startTime || isFinished || userInput.length === 0) return;
    const mins = (Date.now() - startTime) / 60000;
    setWpm(Math.round((userInput.length / 5) / Math.max(mins, 0.01)));
    setNetWpm(Math.max(0, Math.round(((userInput.length - mistakes.length) / 5) / Math.max(mins, 0.01))));
  }, [userInput, startTime, isFinished, mistakes.length]);

  const processChar = useCallback((ch: string) => {
    if (isFinished) return;
    if (!startTime) setStartTime(Date.now());
    setUserInput(prev => {
      if (prev.length >= target.length) return prev;
      if (ch !== target[prev.length]) setMistakes(m => [...m, prev.length]);
      setPressedKey(ch);
      setTimeout(() => setPressedKey(''), 150);
      return prev + ch;
    });
  }, [isFinished, startTime, target]);

  const processBackspace = useCallback(() => {
    if (isFinished) return;
    setUserInput(prev => {
      const newLen = prev.length - 1;
      setMistakes(m => m.filter(i => i < newLen));
      return prev.slice(0, newLen);
    });
  }, [isFinished]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isFinished) return;
    const skip = ['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (skip.includes(e.key) || e.ctrlKey || e.metaKey) return;
    if (e.key === ' ') e.preventDefault();
    if (e.key === 'Backspace') processBackspace();
    else if (e.key.length === 1) processChar(e.key);
  }, [isFinished, processChar, processBackspace]);

  useEffect(() => {
    if (!isMobile) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, isMobile]);

  const handleMobileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;
    const nv = e.target.value;
    const prev = lastMobileRef.current;
    if (nv.length > prev.length) for (const ch of nv.slice(prev.length)) processChar(ch);
    else for (let i = 0; i < prev.length - nv.length; i++) processBackspace();
    lastMobileRef.current = nv;
    setMobileVal(nv);
  }, [isFinished, processChar, processBackspace]);

  const reset = () => {
    setUserInput(''); setMistakes([]); setStartTime(null); setIsFinished(false);
    setWpm(0); setNetWpm(0); setElapsed(0); setEarnedStars(0); setXpGained(0);
    setMobileVal(''); lastMobileRef.current = '';
    if (isMobile) setTimeout(() => hiddenRef.current?.focus(), 100);
  };

  const nextChar = target[userInput.length] || '';
  const accuracy = userInput.length === 0 ? 100 : Math.round(((userInput.length - mistakes.length) / userInput.length) * 100);
  const progressPct = target.length > 0 ? (userInput.length / target.length) * 100 : 0;
  const formattedTime = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`;
  const canPass = netWpm >= lesson.minWpm && accuracy >= 90;
  const newProgress = isFinished ? loadCourseProgress() : null;
  const newXp = newProgress ? totalXp(newProgress) : 0;
  const newLevel = levelForXp(newXp);

  const renderText = () => target.split('').map((ch, i) => {
    const correct = i < userInput.length && !mistakes.includes(i);
    const error = i < userInput.length && mistakes.includes(i);
    const caret = i === userInput.length;
    return (
      <span key={i} className="relative">
        {caret && <span className="typing-caret" aria-hidden />}
        <span className={correct ? 'typing-correct' : error ? 'typing-error' : caret ? 'typing-current' : 'typing-upcoming'}>
          {ch}
        </span>
      </span>
    );
  });

  return (
    <div className="h-[100dvh] bg-brand-bg text-brand-text flex flex-col overflow-hidden select-none"
      onClick={() => isMobile && hiddenRef.current?.focus()}
      style={{ fontFamily: 'Inter, sans-serif' }}>

      {isMobile && (
        <input ref={hiddenRef} type="text" value={mobileVal} onChange={handleMobileChange}
          className="fixed opacity-0 pointer-events-none w-1 h-1 top-0 left-0 z-[-1]"
          autoCapitalize="none" autoComplete="off" autoCorrect="off"
          spellCheck={false} inputMode="text" aria-hidden disabled={isFinished} />
      )}

      {/* ── TOP BAR ── */}
      <div className="shrink-0 bg-brand-surface border-b border-brand-border px-3 sm:px-6 h-14 flex items-center justify-between gap-3 z-40">
        <div className="flex items-center gap-3 min-w-0">
          <Link to={basePath} className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text text-sm font-medium group shrink-0 transition-colors">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">पाठ सूची</span>
          </Link>
          <div className="h-5 w-px bg-brand-border hidden sm:block" />
          <div className="min-w-0 hidden sm:block">
            <span className="text-[9px] font-bold uppercase tracking-widest block" style={{ color: 'var(--brand-cta)' }}>
              Stage {lesson.stage} · पाठ {id} / 200
            </span>
            <h1 className="text-xs font-bold text-brand-text truncate max-w-[220px]">{lesson.title}</h1>
          </div>
        </div>

        {nextChar && !isFinished && !isMobile && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-cta/20"
            style={{ background: 'rgba(188,108,80,0.07)' }}>
            <span className="text-xs text-brand-muted">Type</span>
            <span className="font-bold text-lg" style={{ fontFamily: DEVA_FONT, color: 'var(--brand-cta)' }}>{nextChar}</span>
          </div>
        )}

        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          <div className="text-center">
            <div className="text-[9px] text-brand-muted uppercase tracking-widest font-semibold">Time</div>
            <div className="text-sm font-black font-mono text-brand-text tabular-nums">{formattedTime}</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] text-brand-muted uppercase tracking-widest font-semibold">WPM</div>
            <div className="text-sm font-black font-mono tabular-nums" style={{ color: netWpm >= lesson.minWpm ? 'var(--brand-cta)' : 'var(--brand-muted)' }}>{netWpm}</div>
          </div>
          <div className="text-center hidden sm:block">
            <div className="text-[9px] text-brand-muted uppercase tracking-widest font-semibold">Acc</div>
            <div className={`text-sm font-black font-mono tabular-nums ${accuracy >= 90 ? 'text-brand-accent' : 'text-rose-500'}`}>{accuracy}%</div>
          </div>
          <button onClick={reset}
            className="flex items-center gap-1.5 bg-brand-surface-2 hover:bg-brand-border text-brand-muted hover:text-brand-text px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border border-brand-border">
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restart</span>
          </button>
        </div>
      </div>

      <div className="shrink-0 h-1 bg-brand-border">
        <motion.div className="h-full" style={{ background: 'linear-gradient(90deg,#BC6C50,#DDAD9C)' }}
          animate={{ width: `${progressPct}%` }} transition={{ duration: 0.15 }} />
      </div>

      {/* ── MAIN ── */}
      <div className="flex-grow flex flex-col items-center justify-start gap-4 px-3 sm:px-6 py-5 overflow-y-auto">

        {!startTime && !isFinished && lesson.newKeys.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl rounded-2xl p-4 border"
            style={{ background: 'rgba(188,108,80,0.05)', borderColor: 'rgba(188,108,80,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--brand-cta)' }}>New Characters in This Lesson</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {lesson.newKeys.map(k => (
                <div key={k} className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl border"
                  style={{ background: 'rgba(188,108,80,0.08)', borderColor: 'rgba(188,108,80,0.2)' }}>
                  <span className="text-2xl font-bold" style={{ fontFamily: DEVA_FONT, color: 'var(--brand-cta)' }}>{k}</span>
                  <span className="text-[10px] text-brand-muted">{Object.entries(lesson.keymapHint).find(([, v]) => v === k)?.[0] || '?'} key</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-brand-text-muted leading-relaxed">{lesson.description}</p>
          </motion.div>
        )}

        <div className="w-full max-w-2xl">
          <div className="relative bg-brand-surface border border-brand-border rounded-2xl px-5 sm:px-8 py-5 shadow-sm cursor-text"
            onClick={() => isMobile && hiddenRef.current?.focus()}>
            {startTime && !isFinished && (
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(188,108,80,.5),transparent)' }} />
            )}
            <div className="text-xl sm:text-2xl leading-[3.5rem] break-words overflow-y-auto" style={{ fontFamily: DEVA_FONT, maxHeight: isMobile ? '160px' : '200px' }}>
              {renderText()}
            </div>
          </div>

          {startTime && !isFinished && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 mt-2 px-1 text-xs text-brand-muted font-mono">
              <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{wpm} gross</span>
              <span className="text-brand-border">·</span>
              <span>{mistakes.length} errors</span>
              <span className="text-brand-border">·</span>
              <span>{Math.round(progressPct)}% done</span>
            </motion.div>
          )}
        </div>

        {!isFinished && <VirtualKeyboard pressedKey={pressedKey} activeMap={Object.keys(lesson.keymapHint).length ? lesson.keymapHint : INSCRIPT_FULL_MAP} />}
      </div>

      {/* ── RESULT MODAL ── */}
      <AnimatePresence>
        {isFinished && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-brand-surface border border-brand-border rounded-3xl p-7 sm:p-10 max-w-sm w-full text-center shadow-2xl">

              <div className="flex justify-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div key={i} initial={{ scale: 0, rotate: -20 }} animate={{ scale: i < earnedStars ? 1 : 0.6, rotate: 0 }} transition={{ delay: 0.1 + i * 0.08, type: 'spring' }}>
                    <Star className={`w-8 h-8 ${i < earnedStars ? 'fill-amber-400 text-amber-400' : 'text-brand-border'}`} />
                  </motion.div>
                ))}
              </div>

              <h2 className="text-2xl font-black text-brand-text mb-1" style={{ fontFamily: DEVA_FONT }}>
                {earnedStars >= 3 ? 'शानदार!' : earnedStars >= 1 ? 'अच्छा!' : 'फिर कोशिश करें'}
              </h2>
              <p className="text-brand-muted text-sm mb-4">
                {earnedStars > 0 ? `${earnedStars} star${earnedStars > 1 ? 's' : ''} earned! Target was ${lesson.minWpm} WPM.` : `Need ${lesson.minWpm}+ WPM and 90%+ accuracy to pass.`}
              </p>

              {xpGained > 0 && (
                <div className="flex items-center justify-center gap-1.5 text-sm font-bold mb-4" style={{ color: 'var(--brand-cta)' }}>
                  <Zap className="w-4 h-4" /> +{xpGained} XP · {newLevel.current.name}
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: 'Net WPM', value: netWpm, style: { color: netWpm >= lesson.minWpm ? 'var(--brand-cta)' : 'var(--brand-muted)' } },
                  { label: 'Accuracy', value: `${accuracy}%`, cls: accuracy >= 90 ? 'text-brand-accent' : 'text-rose-500' },
                  { label: 'Errors', value: mistakes.length, cls: 'text-brand-muted' },
                ].map(s => (
                  <div key={s.label} className="bg-brand-surface-2 border border-brand-border p-3 rounded-xl">
                    <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">{s.label}</div>
                    <div className={`text-xl font-black font-mono ${s.cls || ''}`} style={s.style}>{s.value}</div>
                  </div>
                ))}
              </div>

              {savedProgress?.bestWpm > 0 && (
                <div className="text-xs text-brand-muted mb-4 text-center">
                  Previous best: <span className="font-bold text-brand-text">{savedProgress.bestWpm} WPM</span>
                  {netWpm > savedProgress.bestWpm && <span className="text-brand-accent font-bold"> ▲ New record!</span>}
                </div>
              )}

              <div className="flex gap-3 mb-3">
                <button onClick={reset}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-surface-2 hover:bg-brand-border text-brand-text py-3 rounded-xl font-bold text-sm transition-all border border-brand-border">
                  <RotateCcw className="w-4 h-4" /> फिर करें
                </button>
                {nextLesson && canPass && (
                  <Link to={`${basePath}/lesson-${nextLesson.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95"
                    style={{ background: 'linear-gradient(135deg,#BC6C50,#CC7B5D)' }}>
                    अगला पाठ <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
              {!canPass && <p className="text-xs text-brand-muted">Get {lesson.minWpm}+ WPM with 90%+ accuracy to unlock the next lesson.</p>}
              {canPass && !nextLesson && (
                <Link to={basePath}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>
                  🎉 Course Complete! View All Lessons
                </Link>
              )}
              {stageMeta && (
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-brand-muted mt-4">
                  <Flame className="w-3 h-3 text-orange-500" /> Streak: {newProgress?.currentStreak || 0} days
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
