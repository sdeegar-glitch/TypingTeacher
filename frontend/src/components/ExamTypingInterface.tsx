import { useEffect, useMemo, useRef, useState } from 'react';

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
// green/red/highlight feedback, a separate input box below, Gross/Delete/
// Backspace/Time stats, and selectable backspace rules — mirroring real
// SSC/CPCT typing test software.
export default function ExamTypingInterface({ passage, durationSec, isHindi, examTitle, onFinish, onExit }: Props) {
  const [input, setInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(durationSec);
  const [backspaces, setBackspaces] = useState(0);
  const [deletes, setDeletes] = useState(0);
  const [started, setStarted] = useState(false);
  const [bsMode, setBsMode] = useState<BackspaceMode>('full');
  const [autoScroll, setAutoScroll] = useState(true);
  const [showPassage, setShowPassage] = useState(true);

  // Refs mirror state so the keydown handler never reads stale values.
  const inputRef = useRef('');
  const bsRef = useRef(0);
  const delRef = useRef(0);
  const startRef = useRef<number | null>(null);
  const finishedRef = useRef(false);
  const caretRef = useRef<HTMLSpanElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
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
    const elapsedSec = startRef.current ? Math.round((Date.now() - startRef.current) / 1000) : 0;
    onFinish({
      grossWpm: Math.max(0, Math.round((inp.length / 5) / em)),
      netWpm: Math.max(0, Math.round(((inp.length - err) / 5) / em)),
      accuracy: inp.length ? Math.max(0, Math.round(((inp.length - err) / inp.length) * 100)) : 100,
      errors: err,
      chars: inp.length,
      backspaces: bsRef.current,
      deletes: delRef.current,
      elapsedSec,
    });
  };

  // Timer starts on first keystroke.
  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(id); computeAndFinish(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [started]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the current position visible.
  useEffect(() => {
    if (autoScroll && showPassage) caretRef.current?.scrollIntoView({ block: 'nearest' });
  }, [input, autoScroll, showPassage]);

  const applyDelete = (prev: string): string => {
    const mode = bsModeRef.current;
    if (mode === 'disabled' || prev.length === 0) return prev;
    if (mode === 'word') {
      const lastSpace = prev.lastIndexOf(' ');
      if (lastSpace >= prev.length - 1) return prev; // at/behind a word boundary
    }
    return prev.slice(0, -1);
  };

  const setInp = (next: string) => { inputRef.current = next; setInput(next); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (finishedRef.current) return;
      const k = e.key;
      if (k === 'Tab') { e.preventDefault(); return; }
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (['Shift','Control','Alt','Meta','CapsLock','Escape','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown','Insert','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12'].includes(k)) return;

      if (k === 'Backspace') {
        e.preventDefault();
        bsRef.current += 1; setBackspaces(bsRef.current);
        setInp(applyDelete(inputRef.current));
        return;
      }
      if (k === 'Delete') {
        e.preventDefault();
        delRef.current += 1; setDeletes(delRef.current);
        setInp(applyDelete(inputRef.current));
        return;
      }
      if (k.length !== 1) return;
      e.preventDefault();
      if (inputRef.current.length >= passage.length) return;
      if (!startRef.current) { startRef.current = Date.now(); setStarted(true); }
      const next = inputRef.current + k;
      setInp(next);
      if (next.length >= passage.length) setTimeout(computeAndFinish, 0);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [passage]); // eslint-disable-line react-hooks/exhaustive-deps

  const mmss = `${Math.floor(timeLeft / 60)}m :${String(timeLeft % 60).padStart(2, '0')}s`;
  const urgent = timeLeft <= 30 && started;

  // Current word range for the yellow highlight.
  const caret = input.length;
  const wordStart = passage.lastIndexOf(' ', caret - 1) + 1;
  let wordEnd = passage.indexOf(' ', caret);
  if (wordEnd === -1) wordEnd = passage.length;

  const devFont = isHindi ? { fontFamily: "'Noto Sans Devanagari', sans-serif" } : undefined;

  const stat = (label: string, value: string | number, cls: string) => (
    <div className={`flex-1 rounded-xl px-4 py-3 text-center ${cls}`}>
      <div className="text-[10px] uppercase tracking-widest opacity-80">{label}</div>
      <div className="text-xl font-black font-mono tabular-nums">{value}</div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-brand-bg text-brand-text px-4 py-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={onExit} className="text-sm text-brand-muted hover:text-brand-text transition-colors">← Exit</button>
          <span className="text-sm font-bold text-brand-text">{examTitle} — Typing Test</span>
          <button onClick={computeAndFinish}
            className="text-sm font-bold text-white px-3 py-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>
            Result
          </button>
        </div>

        {/* Stat bar */}
        <div className="flex gap-2 mb-3">
          {stat('Gross', started ? grossWpm : 0, 'bg-brand-primary/15 text-brand-primary')}
          {stat('Delete', deletes, 'bg-amber-500/15 text-amber-600 dark:text-amber-400')}
          {stat('Backspace', backspaces, 'bg-rose-500/15 text-rose-600 dark:text-rose-400')}
          {stat('Time Left', mmss, `${urgent ? 'bg-rose-500/20 text-rose-500 animate-pulse' : 'bg-brand-accent/15 text-brand-accent'}`)}
        </div>

        {/* Passage controls */}
        <div className="flex items-center gap-4 text-sm mb-2">
          <button onClick={() => setShowPassage(s => !s)} className="font-semibold text-brand-primary hover:underline">
            {showPassage ? 'Hide Passage' : 'Show Passage'}
          </button>
          <span className="text-brand-muted">Accuracy: <span className="font-bold text-brand-text">{accuracy}%</span></span>
          <span className="text-brand-muted">Errors: <span className="font-bold text-rose-500">{errors}</span></span>
        </div>

        {/* Passage box */}
        {showPassage && (
          <div ref={boxRef}
            className="bg-brand-surface-2 border border-brand-border rounded-xl p-4 mb-3 h-44 overflow-y-auto leading-[2.4rem] text-lg select-none"
            style={devFont}>
            {passage.split('').map((ch, i) => {
              const typed = i < input.length;
              const correct = typed && input[i] === passage[i];
              const wrong = typed && input[i] !== passage[i];
              const inWord = i >= wordStart && i < wordEnd;
              const isCaret = i === caret;
              return (
                <span key={i} ref={isCaret ? caretRef : undefined}
                  className={
                    correct ? 'text-emerald-600 dark:text-emerald-400' :
                    wrong ? 'text-white bg-rose-500 rounded-sm' :
                    inWord ? 'bg-amber-300/60 dark:bg-amber-400/30 text-brand-text rounded-sm' :
                    'text-brand-text-muted'
                  }>
                  {ch}
                </span>
              );
            })}
          </div>
        )}

        {/* Input box */}
        <div
          className="bg-brand-surface border-2 border-brand-primary/40 rounded-xl p-4 min-h-[7rem] text-lg leading-relaxed cursor-text"
          style={devFont}
          onClick={() => {/* focus is on window keydown; nothing needed */}}>
          {input ? (
            <span className="text-brand-text whitespace-pre-wrap break-words">{input}<span className="inline-block w-0.5 h-5 align-middle bg-brand-primary animate-pulse ml-px" /></span>
          ) : (
            <span className="text-brand-muted">Start typing here — the timer begins on your first keystroke…</span>
          )}
        </div>

        {/* Options */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm text-brand-text-muted">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={autoScroll} onChange={e => setAutoScroll(e.target.checked)} />
            Highlight &amp; AutoScroll
          </label>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-brand-text">Backspace:</span>
            {([['full', 'Fully Enable'], ['word', 'Within Word'], ['disabled', 'Disable']] as [BackspaceMode, string][]).map(([val, label]) => (
              <label key={val} className="flex items-center gap-1 cursor-pointer">
                <input type="radio" name="bsmode" checked={bsMode === val} onChange={() => setBsMode(val)} />
                {label}
              </label>
            ))}
          </div>
        </div>

        <p className="text-xs text-brand-muted mt-2">Type the passage exactly. Green = correct, red = wrong, yellow = current word. Click "Result" any time to finish.</p>
      </div>
    </div>
  );
}
