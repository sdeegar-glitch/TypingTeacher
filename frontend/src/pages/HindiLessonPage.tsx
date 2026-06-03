import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, Star, Keyboard, Zap } from 'lucide-react';
import {
  HINDI_LESSONS,
  saveHindiProgress,
  isHindiLessonUnlocked,
  loadHindiProgress,
} from '../data/hindiLessons';

const DEVA_FONT = "'Noto Sans Devanagari', sans-serif";

export default function HindiLessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const id = Number(lessonId) || 1;

  const lesson = useMemo(() => HINDI_LESSONS.find(l => l.id === id) || HINDI_LESSONS[0], [id]);
  const nextLesson = HINDI_LESSONS.find(l => l.id === id + 1);

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
  const hiddenRef = useRef<HTMLInputElement>(null);
  const [mobileVal, setMobileVal] = useState('');
  const lastMobileRef = useRef('');

  const target = lesson.content;
  const savedProgress = useMemo(() => loadHindiProgress()[id], [id]);
  const unlocked = isHindiLessonUnlocked(id);

  useEffect(() => {
    document.title = `पाठ ${id} — ${lesson.title} | FastTypingLab`;
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch {} };
  }, [id, lesson.title]);

  useEffect(() => {
    if (!unlocked) navigate('/hindi-lessons');
  }, [unlocked, navigate]);

  // Timer
  useEffect(() => {
    let t: ReturnType<typeof setInterval>;
    if (startTime && !isFinished) {
      t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 500);
    }
    return () => clearInterval(t);
  }, [startTime, isFinished]);

  // Auto-focus mobile
  useEffect(() => {
    if (isMobile) setTimeout(() => hiddenRef.current?.focus(), 300);
  }, [isMobile]);

  // Finish detection
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
    if (s > 0) saveHindiProgress({ lessonId: id, stars: s, bestWpm: net, bestAccuracy: acc, completed: true });
  }, [userInput, target, startTime, mistakes.length, id, lesson.minWpm]);

  // Live WPM
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
    const skip = ['Shift','Control','Alt','Meta','CapsLock','Tab','Escape','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
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
    setWpm(0); setNetWpm(0); setElapsed(0); setEarnedStars(0);
    setMobileVal(''); lastMobileRef.current = '';
    if (isMobile) setTimeout(() => hiddenRef.current?.focus(), 100);
  };

  const nextChar = target[userInput.length] || '';
  const accuracy = userInput.length === 0 ? 100 : Math.round(((userInput.length - mistakes.length) / userInput.length) * 100);
  const progress = target.length > 0 ? (userInput.length / target.length) * 100 : 0;
  const formattedTime = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`;
  const canPass = netWpm >= lesson.minWpm && accuracy >= 90;

  // Render text with coloring
  const renderText = () => target.split('').map((ch, i) => {
    const correct = i < userInput.length && !mistakes.includes(i);
    const error   = i < userInput.length && mistakes.includes(i);
    const caret   = i === userInput.length;
    return (
      <span key={i} className="relative">
        {caret && <span className="typing-caret" aria-hidden />}
        <span className={correct ? 'typing-correct' : error ? 'typing-error' : caret ? 'typing-current' : 'typing-upcoming'}>
          {ch}
        </span>
      </span>
    );
  });

  // Keymap hint entries
  const keymapEntries = Object.entries(lesson.keymapHint).slice(0, 8);

  return (
    <div className="h-[100dvh] bg-brand-bg text-brand-text flex flex-col overflow-hidden select-none"
      onClick={() => isMobile && hiddenRef.current?.focus()}
      style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Hidden mobile input */}
      {isMobile && (
        <input ref={hiddenRef} type="text" value={mobileVal} onChange={handleMobileChange}
          className="fixed opacity-0 pointer-events-none w-1 h-1 top-0 left-0 z-[-1]"
          autoCapitalize="none" autoComplete="off" autoCorrect="off"
          spellCheck={false} inputMode="text" aria-hidden disabled={isFinished} />
      )}

      {/* ── TOP BAR ── */}
      <div className="shrink-0 bg-brand-surface border-b border-brand-border px-3 sm:px-6 h-14 flex items-center justify-between gap-3 z-40">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/hindi-lessons"
            className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text text-sm font-medium group shrink-0 transition-colors">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">पाठ सूची</span>
          </Link>
          <div className="h-5 w-px bg-brand-border hidden sm:block" />
          <div className="min-w-0 hidden sm:block">
            <span className="text-[9px] font-bold uppercase tracking-widest block" style={{ color: 'var(--brand-cta)' }}>
              पाठ {id} / 30
            </span>
            <h1 className="text-xs font-bold text-brand-text truncate max-w-[180px]">{lesson.title}</h1>
          </div>
        </div>

        {/* Center: key hint */}
        {nextChar && !isFinished && !isMobile && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-cta/20"
            style={{ background: 'rgba(188,108,80,0.07)' }}>
            <span className="text-xs text-brand-muted">Type</span>
            <span className="font-bold text-lg" style={{ fontFamily: DEVA_FONT, color: 'var(--brand-cta)' }}>{nextChar}</span>
            <Keyboard className="w-3.5 h-3.5 text-brand-muted" />
            <span className="text-xs text-brand-muted">press key</span>
          </div>
        )}

        {/* Right */}
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          <div className="text-center">
            <div className="text-[9px] text-brand-muted uppercase tracking-widest font-semibold">Time</div>
            <div className="text-sm font-black font-mono text-brand-text tabular-nums">{formattedTime}</div>
          </div>
          <div className="text-center">
            <div className="text-[9px] text-brand-muted uppercase tracking-widest font-semibold">WPM</div>
            <div className="text-sm font-black font-mono tabular-nums" style={{ color: netWpm >= lesson.minWpm ? 'var(--brand-cta)' : 'var(--brand-muted)' }}>
              {netWpm}
            </div>
          </div>
          <div className="text-center hidden sm:block">
            <div className="text-[9px] text-brand-muted uppercase tracking-widest font-semibold">Acc</div>
            <div className={`text-sm font-black font-mono tabular-nums ${accuracy >= 90 ? 'text-brand-accent' : 'text-rose-500'}`}>
              {accuracy}%
            </div>
          </div>
          <button onClick={reset}
            className="flex items-center gap-1.5 bg-brand-surface-2 hover:bg-brand-border text-brand-muted hover:text-brand-text px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border border-brand-border">
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restart</span>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="shrink-0 h-1 bg-brand-border">
        <motion.div className="h-full" style={{ background: 'linear-gradient(90deg,#BC6C50,#DDAD9C)' }}
          animate={{ width: `${progress}%` }} transition={{ duration: 0.15 }} />
      </div>

      {/* ── MAIN ── */}
      <div className="flex-grow flex flex-col items-center justify-start gap-4 px-3 sm:px-6 py-5 overflow-y-auto">

        {/* New characters info (when not started) */}
        {!startTime && !isFinished && lesson.newKeys.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl rounded-2xl p-4 border"
            style={{ background: 'rgba(188,108,80,0.05)', borderColor: 'rgba(188,108,80,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--brand-cta)' }}>
              New Characters in This Lesson
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {lesson.newKeys.map(k => (
                <div key={k} className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl border"
                  style={{ background: 'rgba(188,108,80,0.08)', borderColor: 'rgba(188,108,80,0.2)' }}>
                  <span className="text-2xl font-bold" style={{ fontFamily: DEVA_FONT, color: 'var(--brand-cta)' }}>{k}</span>
                  <span className="text-[10px] text-brand-muted">
                    {Object.entries(lesson.keymapHint).find(([, v]) => v === k)?.[0] || '?'} key
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-brand-text-muted leading-relaxed">{lesson.description}</p>
          </motion.div>
        )}

        {/* Typing area */}
        <div className="w-full max-w-2xl">
          <div className="relative bg-brand-surface border border-brand-border rounded-2xl px-5 sm:px-8 py-5 shadow-sm cursor-text"
            onClick={() => isMobile && hiddenRef.current?.focus()}>
            {startTime && !isFinished && (
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: 'linear-gradient(90deg,transparent,rgba(188,108,80,.5),transparent)' }} />
            )}
            <div className="text-xl sm:text-2xl leading-[3.5rem] break-words overflow-y-auto"
              style={{ fontFamily: DEVA_FONT, maxHeight: isMobile ? '160px' : '200px' }}>
              {renderText()}
            </div>
            {!startTime && !isFinished && (
              <div className="absolute bottom-3 right-4 text-[10px] text-brand-muted/50 pointer-events-none select-none flex items-center gap-1" style={{ fontFamily: DEVA_FONT }}>
                <span className="typing-caret h-3 w-0.5" /> टाइप करें
              </div>
            )}
          </div>

          {/* Live sub-stats */}
          {startTime && !isFinished && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-4 mt-2 px-1 text-xs text-brand-muted font-mono">
              <span className="flex items-center gap-1"><Zap className="w-3 h-3" />{wpm} gross</span>
              <span className="text-brand-border">·</span>
              <span>{mistakes.length} errors</span>
              <span className="text-brand-border">·</span>
              <span>{Math.round(progress)}% done</span>
            </motion.div>
          )}
        </div>

        {/* Keymap reference card */}
        {!isFinished && keymapEntries.length > 0 && (
          <div className="w-full max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted mb-2 px-1">
              Key Reference (INSCRIPT)
            </p>
            <div className="flex flex-wrap gap-2">
              {keymapEntries.map(([key, hindi]) => (
                <div key={key} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-brand-border bg-brand-surface">
                  <kbd className="text-[10px] font-black font-mono text-white px-1.5 py-0.5 rounded-md min-w-[22px] text-center"
                    style={{ background: pressedKey === key ? 'var(--brand-cta)' : 'var(--brand-primary)' }}>
                    {key}
                  </kbd>
                  <span className="text-sm font-bold" style={{ fontFamily: DEVA_FONT, color: 'var(--brand-cta)' }}>{hindi}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── RESULT MODAL ── */}
      <AnimatePresence>
        {isFinished && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <motion.div initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-brand-surface border border-brand-border rounded-3xl p-7 sm:p-10 max-w-sm w-full text-center shadow-2xl">

              {/* Stars */}
              <div className="flex justify-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div key={i}
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: i < earnedStars ? 1 : 0.6, rotate: 0 }}
                    transition={{ delay: 0.1 + i * 0.08, type: 'spring' }}>
                    <Star className={`w-8 h-8 ${i < earnedStars ? 'fill-amber-400 text-amber-400' : 'text-brand-border'}`} />
                  </motion.div>
                ))}
              </div>

              <h2 className="text-2xl font-black text-brand-text mb-1" style={{ fontFamily: DEVA_FONT }}>
                {earnedStars >= 3 ? 'शानदार!' : earnedStars >= 1 ? 'अच्छा!' : 'फिर कोशिश करें'}
              </h2>
              <p className="text-brand-muted text-sm mb-6">
                {earnedStars > 0
                  ? `${earnedStars} star${earnedStars > 1 ? 's' : ''} earned! Target was ${lesson.minWpm} WPM.`
                  : `Need ${lesson.minWpm}+ WPM and 90%+ accuracy to pass. Keep practicing!`}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: 'Net WPM', value: netWpm, pass: netWpm >= lesson.minWpm, style: { color: netWpm >= lesson.minWpm ? 'var(--brand-cta)' : 'var(--brand-muted)' } },
                  { label: 'Accuracy', value: `${accuracy}%`, pass: accuracy >= 90, cls: accuracy >= 90 ? 'text-brand-accent' : 'text-rose-500' },
                  { label: 'Errors', value: mistakes.length, pass: true, cls: 'text-brand-muted' },
                ].map(s => (
                  <div key={s.label} className="bg-brand-surface-2 border border-brand-border p-3 rounded-xl">
                    <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">{s.label}</div>
                    <div className={`text-xl font-black font-mono ${s.cls || ''}`} style={s.style}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Best score comparison */}
              {savedProgress?.bestWpm > 0 && (
                <div className="text-xs text-brand-muted mb-4 text-center">
                  Previous best: <span className="font-bold text-brand-text">{savedProgress.bestWpm} WPM</span>
                  {netWpm > savedProgress.bestWpm && <span className="text-brand-accent font-bold"> ▲ New record!</span>}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mb-3">
                <button onClick={reset}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-surface-2 hover:bg-brand-border text-brand-text py-3 rounded-xl font-bold text-sm transition-all border border-brand-border">
                  <RotateCcw className="w-4 h-4" /> फिर करें
                </button>
                {nextLesson && canPass && (
                  <Link to={`/hindi-lessons/${nextLesson.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95"
                    style={{ background: 'linear-gradient(135deg,#BC6C50,#CC7B5D)', boxShadow: '0 4px 14px rgba(188,108,80,.3)' }}>
                    अगला पाठ <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
              {!canPass && (
                <p className="text-xs text-brand-muted">
                  Get {lesson.minWpm}+ WPM with 90%+ accuracy to unlock the next lesson.
                </p>
              )}
              {canPass && !nextLesson && (
                <Link to="/hindi-lessons"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>
                  🎉 Course Complete! View All Lessons
                </Link>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
