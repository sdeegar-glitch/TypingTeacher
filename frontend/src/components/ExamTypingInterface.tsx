import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export type BackspaceMode = 'full' | 'word' | 'disabled';

export interface ExamResult {
  grossWpm: number;
  netWpm: number;
  accuracy: number;
  errors: number;
  chars: number;
  backspaces: number;
  deletes: number;
  elapsedSec: number;
}

interface Props {
  passage: string;
  durationSec: number;
  isHindi: boolean;
  examTitle: string;
  onFinish: (r: ExamResult) => void;
  onExit: () => void;
}

// Government-exam-style typing interface: passage shown above with live
// green/red/current-word feedback + autoscroll, a separate input box below,
// Gross/Delete/Backspace/Time stats and selectable backspace rules — mirroring
// real SSC/CPCT typing software. Dark theme to match the exam flow; works on
// desktop (window keydown) and mobile (hidden input).
export default function ExamTypingInterface({ passage, durationSec, isHindi, examTitle, onFinish, onExit }: Props) {
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }, []);

  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(durationSec);
  const [backspaces, setBackspaces] = useState(0);
  const [deletes, setDeletes] = useState(0);
  const [started, setStarted] = useState(false);
  const [bsMode, setBsMode] = useState<BackspaceMode>('full');
  const [autoScroll, setAutoScroll] = useState(true);
  const [showPassage, setShowPassage] = useState(true);
  const [mobileVal, setMobileVal] = useState('');

  const inputRef = useRef('');
  const bsRef = useRef(0);
  const delRef = useRef(0);
  const startRef = useRef<number | null>(null);
  const finishedRef = useRef(false);
  const caretRef = useRef<HTMLSpanElement>(null);
  const inputBoxRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);
  const lastMobileRef = useRef('');
  const bsModeRef = useRef<BackspaceMode>('full');
  bsModeRef.current = bsMode;

  const errors = useMemo(() => {
    let e = 0;
    for (let i = 0; i < input.length; i++) if (input[i] !== passage[i]) e++;
    return e;
  }, [input, passage]);

  const elapsedMin = () => {
    const s = startRef.current ? (Date.now() - startRef.current) / 60000 : 0;
    return s > 0 ? s : 1 / 60;
  };
  const grossWpm = started ? Math.max(0, Math.round((input.length / 5) / elapsedMin())) : 0;
  const accuracy = input.length ? Math.max(0, Math.round(((input.length - errors) / input.length) * 100)) : 100;

  const computeAndFinish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const inp = inputRef.current;
    let err = 0;
    for (let i = 0; i < inp.length; i++) if (inp[i] !== passage[i]) err++;
    const em = elapsedMin();
    onFinish({
      grossWpm: Math.max(0, Math.round((inp.length / 5) / em)),
      netWpm: Math.max(0, Math.round(((inp.length - err) / 5) / em)),
      accuracy: inp.length ? Math.max(0, Math.round(((inp.length - err) / inp.length) * 100)) : 100,
      errors: err,
      chars: inp.length,
      backspaces: bsRef.current,
      deletes: delRef.current,
      elapsedSec: startRef.current ? Math.round((Date.now() - startRef.current) / 1000) : 0,
    });
  };

  // Timer (starts on first keystroke).
  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(id); computeAndFinish(); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(id);
  }, [started]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep current position visible + input box scrolled to the latest text.
  useEffect(() => {
    if (autoScroll && showPassage) caretRef.current?.scrollIntoView({ block: 'nearest' });
    if (inputBoxRef.current) inputBoxRef.current.scrollTop = inputBoxRef.current.scrollHeight;
  }, [input, autoScroll, showPassage]);

  useEffect(() => { if (isMobile) setTimeout(() => hiddenRef.current?.focus(), 300); }, [isMobile]);

  const setInp = (next: string) => { inputRef.current = next; setInput(next); };

  const applyDelete = (prev: string): string => {
    const mode = bsModeRef.current;
    if (mode === 'disabled' || prev.length === 0) return prev;
    if (mode === 'word' && prev.lastIndexOf(' ') >= prev.length - 1) return prev;
    return prev.slice(0, -1);
  };

  const typeChar = (k: string) => {
    if (finishedRef.current || inputRef.current.length >= passage.length) return;
    if (!startRef.current) { startRef.current = Date.now(); setStarted(true); }
    const next = inputRef.current + k;
    setInp(next);
    if (next.length >= passage.length) setTimeout(computeAndFinish, 0);
  };
  const doBackspace = () => { bsRef.current += 1; setBackspaces(bsRef.current); setInp(applyDelete(inputRef.current)); };
  const doDelete = () => { delRef.current += 1; setDeletes(delRef.current); setInp(applyDelete(inputRef.current)); };

  // Desktop keyboard.
  useEffect(() => {
    if (isMobile) return;
    const onKey = (e: KeyboardEvent) => {
      if (finishedRef.current) return;
      const k = e.key;
      if (k === 'Tab') { e.preventDefault(); return; }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (['Shift','Control','Alt','Meta','CapsLock','Escape','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown','Insert','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12'].includes(k)) return;
      if (k === 'Backspace') { e.preventDefault(); doBackspace(); return; }
      if (k === 'Delete') { e.preventDefault(); doDelete(); return; }
      if (k.length !== 1) return;
      e.preventDefault();
      typeChar(k);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [passage, isMobile]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mobile input.
  const onMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (finishedRef.current) return;
    const nv = e.target.value;
    const prev = lastMobileRef.current;
    if (nv.length > prev.length) { for (const ch of nv.slice(prev.length)) typeChar(ch); }
    else { for (let i = 0; i < prev.length - nv.length; i++) doBackspace(); }
    lastMobileRef.current = nv;
    setMobileVal(nv);
  };

  const mmss = `${Math.floor(timeLeft / 60)}m :${String(timeLeft % 60).padStart(2, '0')}s`;
  const urgent = timeLeft <= 30 && started;
  const caret = input.length;
  const wordStart = passage.lastIndexOf(' ', caret - 1) + 1;
  let wordEnd = passage.indexOf(' ', caret);
  if (wordEnd === -1) wordEnd = passage.length;
  const devFont = isHindi ? { fontFamily: "'Noto Sans Devanagari', sans-serif" } : undefined;

  const focusMobile = () => { if (isMobile) hiddenRef.current?.focus(); };

  return (
    <div className="min-h-[100dvh] bg-[#0d0d14] text-white px-4 py-4" onClick={focusMobile}>
      {isMobile && (
        <input ref={hiddenRef} type="text" value={mobileVal} onChange={onMobileChange}
          className="fixed opacity-0 pointer-events-none w-1 h-1 top-0 left-0 z-[-1]"
          autoCapitalize="none" autoComplete="off" autoCorrect="off" spellCheck={false} inputMode="text" aria-hidden />
      )}

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={onExit} className="text-sm text-white/40 hover:text-white transition-colors">← Exit</button>
          <span className="text-sm font-bold text-white/80 truncate px-2">{examTitle} — Typing Test</span>
          <button onClick={computeAndFinish}
            className="text-sm font-bold text-white px-3.5 py-1.5 rounded-lg transition-all hover:opacity-90 active:scale-95 shadow-lg"
            style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>
            Result
          </button>
        </div>

        {/* Stat bar */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { label: 'Gross', value: started ? grossWpm : 0, cls: 'bg-teal-500/10 border-teal-500/30 text-teal-300' },
            { label: 'Delete', value: deletes, cls: 'bg-amber-500/10 border-amber-500/30 text-amber-300' },
            { label: 'Backspace', value: backspaces, cls: 'bg-rose-500/10 border-rose-500/30 text-rose-300' },
            { label: 'Time Left', value: mmss, cls: urgent ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl px-2 py-2.5 text-center border ${s.cls}`}>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-widest opacity-70">{s.label}</div>
              <motion.div key={String(s.value)} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="text-base sm:text-xl font-black font-mono tabular-nums">{s.value}</motion.div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 text-sm mb-2 flex-wrap">
          <button onClick={() => setShowPassage(s => !s)} className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
            {showPassage ? 'Hide Passage' : 'Show Passage'}
          </button>
          <span className="text-white/40">Accuracy: <span className={`font-bold ${accuracy >= 90 ? 'text-emerald-400' : 'text-rose-400'}`}>{accuracy}%</span></span>
          <span className="text-white/40">Errors: <span className="font-bold text-rose-400">{errors}</span></span>
          <span className="text-white/40 hidden sm:inline">Net: <span className="font-bold text-white">{started ? Math.max(0, Math.round(((input.length - errors) / 5) / elapsedMin())) : 0}</span></span>
        </div>

        {/* Passage box */}
        {showPassage && (
          <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 mb-3 h-40 sm:h-44 overflow-y-auto leading-[2.5rem] text-lg sm:text-xl select-none" style={devFont}>
            {passage.split('').map((ch, i) => {
              const typed = i < input.length;
              const correct = typed && input[i] === passage[i];
              const wrong = typed && input[i] !== passage[i];
              const inWord = i >= wordStart && i < wordEnd && i >= input.length;
              const isCaret = i === caret;
              return (
                <span key={i} ref={isCaret ? caretRef : undefined}
                  className={
                    correct ? 'text-emerald-400' :
                    wrong ? 'text-white bg-rose-500 rounded-sm' :
                    isCaret ? 'text-[#0d0d14] bg-amber-300 rounded-sm' :
                    inWord ? 'text-white bg-amber-400/25 rounded-sm' :
                    'text-white/30'
                  }>
                  {ch}
                </span>
              );
            })}
          </div>
        )}

        {/* Input box (capped + scrolls) */}
        <div
          ref={inputBoxRef}
          onClick={focusMobile}
          className="bg-white/[0.06] border-2 border-cyan-500/40 focus-within:border-cyan-400 rounded-xl p-4 h-28 overflow-y-auto text-lg sm:text-xl leading-relaxed cursor-text transition-colors"
          style={devFont}>
          {input ? (
            <span className="text-white whitespace-pre-wrap break-words">
              {input.split('').map((c, i) => (
                <span key={i} className={input[i] !== passage[i] ? 'text-rose-400' : 'text-white'}>{c}</span>
              ))}
              <span className="inline-block w-0.5 h-6 align-middle bg-cyan-400 animate-pulse ml-px" />
            </span>
          ) : (
            <span className="text-white/30">{isMobile ? 'Tap here & start typing — the timer begins on your first keystroke…' : 'Start typing here — the timer begins on your first keystroke…'}</span>
          )}
        </div>

        {/* Options */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm text-white/60">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={autoScroll} onChange={e => setAutoScroll(e.target.checked)} className="accent-cyan-500" />
            Highlight &amp; AutoScroll
          </label>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white/80">Backspace:</span>
            {([['full', 'Fully Enable'], ['word', 'Within Word'], ['disabled', 'Disable']] as [BackspaceMode, string][]).map(([val, label]) => (
              <label key={val} className="flex items-center gap-1 cursor-pointer select-none">
                <input type="radio" name="bsmode" checked={bsMode === val} onChange={() => setBsMode(val)} className="accent-cyan-500" />
                {label}
              </label>
            ))}
          </div>
        </div>

        <p className="text-xs text-white/25 mt-2">Type the passage exactly · <span className="text-emerald-400">green</span> = correct · <span className="text-rose-400">red</span> = wrong · <span className="text-amber-300">yellow</span> = current position. Click "Result" any time to finish.</p>
      </div>
    </div>
  );
}
