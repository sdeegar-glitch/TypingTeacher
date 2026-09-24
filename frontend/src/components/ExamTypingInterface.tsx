import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ClusterText from './ClusterText';
import { useTextInputEngine, type InputMethod } from '../hooks/useTextInputEngine';
import { canDelete, mistakeIndices, type BackspaceMode as EngineBackspaceMode } from '../lib/typingReducer';
import { scoreExam, type ExamScore, type ScoringProfile } from '../lib/typingScoring';
import { splitClusters } from '../lib/graphemes';

export type BackspaceMode = 'full' | 'word' | 'disabled';

export interface ExamResult {
  grossWpm: number;
  netWpm: number;
  /** word-level accuracy for the exam profile, 0-100 */
  accuracy: number;
  /** full + half mistakes (words) */
  errors: number;
  chars: number;
  backspaces: number;
  deletes: number;
  elapsedSec: number;
  profile: ScoringProfile;
  /** full word-level breakdown (mistake list, KDPH, corrected/uncorrected inputs) */
  score: ExamScore;
  typed: string;
  /** characters still wrong in the final text (uncorrected) and correcting deletions (corrected) */
  wrongChars: number;
  inputMethod: InputMethod;
}

interface Props {
  passage: string;
  durationSec: number;
  isHindi: boolean;
  examTitle: string;
  profile: ScoringProfile;
  onFinish: (r: ExamResult) => void;
  onExit: () => void;
}

const ENGINE_MODE: Record<BackspaceMode, EngineBackspaceMode> = { full: 'full', word: 'word', disabled: 'off' };

// Government-exam-style typing interface: passage shown above with live
// green/red/current feedback + autoscroll, a separate input box below,
// Gross/Delete/Backspace/Time stats and selectable backspace rules. Input goes
// through the shared v2 engine (hidden textarea: OS Hindi keyboards, IMEs and
// phone keyboards all work; English keyboards get built-in INSCRIPT) and the
// final score is word-level for the exam's scoring profile (lib/typingScoring).
export default function ExamTypingInterface({ passage, durationSec, isHindi, examTitle, profile, onFinish, onExit }: Props) {
  const [timeLeft, setTimeLeft] = useState(durationSec);
  const [backspaces, setBackspaces] = useState(0);
  const [deletes, setDeletes] = useState(0);
  const [started, setStarted] = useState(false);
  const [bsMode, setBsMode] = useState<BackspaceMode>('full');
  const [autoScroll, setAutoScroll] = useState(true);
  const [showPassage, setShowPassage] = useState(true);
  const [finished, setFinished] = useState(false);

  const startRef = useRef<number | null>(null);
  const finishedRef = useRef(false);
  const bsRef = useRef(0);
  const delRef = useRef(0);
  const passageBoxRef = useRef<HTMLDivElement>(null);
  const inputBoxRef = useRef<HTMLDivElement>(null);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const engine = useTextInputEngine({
    text: passage,
    options: { skipWordOnSpace: false, strict: false },
    backspaceMode: ENGINE_MODE[bsMode],
    mangal: isHindi,
    disabled: finished,
    onStart: () => { startRef.current = Date.now(); setStarted(true); },
    onPaste: () => { /* pasting is simply refused in the exam */ },
    onRestart: () => { /* Tab does nothing during an exam */ },
  });
  const st = engine.state;
  const stRef = useRef(st);
  stRef.current = st;
  const inputMethodRef = useRef(engine.inputMethod);
  inputMethodRef.current = engine.inputMethod;

  const elapsedSec = () => (startRef.current ? Math.round((Date.now() - startRef.current) / 1000) : 0);

  const computeAndFinish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setFinished(true);
    const cur = stRef.current;
    const elapsed = elapsedSec();
    const score = scoreExam({
      passage,
      typed: cur.typed,
      elapsedSeconds: elapsed,
      profile,
      // KDPH counts every key press, including corrections; speed uses typed length.
      keyDepressions: profile === 'kdph' ? cur.keystrokes + bsRef.current + delRef.current : undefined,
    });
    onFinishRef.current({
      grossWpm: Math.round(score.grossWpm),
      netWpm: Math.round(score.netWpm),
      accuracy: Math.round(score.accuracy),
      errors: score.fullMistakes + score.halfMistakes,
      chars: cur.typed.length,
      backspaces: bsRef.current,
      deletes: delRef.current,
      elapsedSec: elapsed,
      profile,
      score,
      typed: cur.typed,
      wrongChars: mistakeIndices(cur).length,
      inputMethod: inputMethodRef.current,
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

  // Passage completed => finish.
  useEffect(() => {
    if (passage.length > 0 && st.typed.length >= passage.length) setTimeout(computeAndFinish, 0);
  }, [st.typed.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the current position visible + input box scrolled to the latest text.
  useEffect(() => {
    if (autoScroll && showPassage) (passageBoxRef.current?.querySelector('#current-char') as HTMLElement | null)?.scrollIntoView?.({ block: 'nearest' });
    if (inputBoxRef.current) inputBoxRef.current.scrollTop = inputBoxRef.current.scrollHeight;
  }, [st.typed, autoScroll, showPassage]);

  const wrongIdx = useMemo(() => new Set(mistakeIndices(st)), [st]);
  const noSkipped = useMemo(() => new Set<number>(), []);

  // Live speed: the same word-level score used for the result (cheap for exam-length passages).
  const live = useMemo(() => {
    if (!started) return null;
    return scoreExam({
      passage, typed: st.typed, profile,
      elapsedSeconds: startRef.current ? Math.round((Date.now() - startRef.current) / 1000) : 0,
    });
  }, [started, passage, st.typed, profile]);
  const grossWpm = live ? Math.round(live.grossWpm) : 0;

  // Backspace / Delete counters. The engine enforces the mode for Backspace itself;
  // Delete is handled here because the caret is always at the end.
  const onRootKeyDown = (e: React.KeyboardEvent) => {
    if (finishedRef.current || e.nativeEvent.isComposing) return;
    const cur = stRef.current;
    const mode = ENGINE_MODE[bsMode];
    if (e.key === 'Backspace') {
      if (canDelete(cur, mode)) { bsRef.current += 1; setBackspaces(bsRef.current); }
    } else if (e.key === 'Delete') {
      e.preventDefault();
      if (canDelete(cur, mode)) {
        delRef.current += 1; setDeletes(delRef.current);
        engine.setValue(splitClusters(cur.typed).slice(0, -1).join(''));
      }
    }
  };

  const mmss = `${Math.floor(timeLeft / 60)}m :${String(timeLeft % 60).padStart(2, '0')}s`;
  const urgent = timeLeft <= 30 && started;
  const devFont = isHindi ? { fontFamily: "'Noto Sans Devanagari', sans-serif" } : undefined;
  const errors = wrongIdx.size;
  const typedLen = st.typed.length;
  const accuracy = typedLen ? Math.max(0, Math.round(((typedLen - errors) / typedLen) * 100)) : 100;
  const focusInput = () => engine.focus();

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-brand-bg text-brand-text px-4 py-4" onClick={focusInput} onKeyDown={onRootKeyDown}>
      <textarea {...engine.inputProps} />

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={onExit} className="text-sm text-brand-muted hover:text-brand-primary transition-colors">← Exit</button>
          <span className="text-sm font-bold text-brand-text truncate px-2">{examTitle} — Typing Test</span>
          <button onClick={computeAndFinish}
            className="text-sm font-bold text-white px-3.5 py-1.5 rounded-lg transition-all hover:opacity-90 active:scale-95 shadow-lg"
            style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>
            Result
          </button>
        </div>

        {/* Stat bar */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { label: 'Gross', value: grossWpm, cls: 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary' },
            { label: 'Delete', value: deletes, cls: 'bg-amber-500/10 border-amber-500/20 text-amber-600' },
            { label: 'Backspace', value: backspaces, cls: 'bg-rose-500/10 border-rose-500/20 text-rose-500' },
            { label: 'Time Left', value: mmss, cls: urgent ? 'bg-rose-500/20 border-rose-500/40 text-rose-500 animate-pulse' : 'bg-brand-accent/10 border-brand-accent/20 text-brand-accent' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl px-2 py-2.5 text-center border ${s.cls}`}>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-widest opacity-70">{s.label}</div>
              <motion.div key={String(s.value)} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="text-base sm:text-xl font-black font-mono tabular-nums">{s.value}</motion.div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 text-sm mb-2 flex-wrap">
          <button onClick={() => setShowPassage(s => !s)} className="font-semibold text-brand-primary hover:underline transition-colors">
            {showPassage ? 'Hide Passage' : 'Show Passage'}
          </button>
          <span className="text-brand-text-muted">Accuracy: <span className={`font-bold ${accuracy >= 90 ? 'text-emerald-600' : 'text-rose-500'}`}>{accuracy}%</span></span>
          <span className="text-brand-text-muted">Errors: <span className="font-bold text-rose-500">{errors}</span></span>
          <span className="text-brand-text-muted hidden sm:inline">Net: <span className="font-bold text-brand-text">{live ? Math.round(live.netWpm) : 0}</span></span>
        </div>

        {/* Passage box (cluster-aware so Devanagari conjuncts keep their shape) */}
        {showPassage && (
          <div ref={passageBoxRef} className="bg-brand-surface border border-brand-border rounded-xl p-4 mb-3 h-40 sm:h-44 overflow-y-auto leading-[2.5rem] text-lg sm:text-xl select-none" style={devFont}>
            <ClusterText text={passage} typedLength={typedLen} mistakes={wrongIdx} skipped={noSkipped} currentIndex={typedLen} />
          </div>
        )}

        {/* Input box (capped + scrolls) */}
        <div
          ref={inputBoxRef}
          className="bg-brand-surface border-2 border-brand-accent/40 focus-within:border-brand-accent rounded-xl p-4 h-28 overflow-y-auto text-lg sm:text-xl leading-relaxed cursor-text transition-colors"
          style={devFont}>
          {typedLen || engine.composing ? (
            <span className="text-brand-text whitespace-pre-wrap break-words">
              {st.typed}
              {engine.composing && <span className="text-brand-text-muted underline">{engine.composing}</span>}
              <span className="inline-block w-0.5 h-6 align-middle bg-brand-accent animate-pulse ml-px" />
            </span>
          ) : (
            <span className="text-brand-muted">Start typing — the timer begins on your first keystroke…</span>
          )}
        </div>

        {/* Options */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm text-brand-text-muted">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={autoScroll} onChange={e => setAutoScroll(e.target.checked)} className="accent-brand-accent" />
            Highlight &amp; AutoScroll
          </label>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-brand-text">Backspace:</span>
            {([['full', 'Fully Enable'], ['word', 'Within Word'], ['disabled', 'Disable']] as [BackspaceMode, string][]).map(([val, label]) => (
              <label key={val} className="flex items-center gap-1 cursor-pointer select-none">
                <input type="radio" name="bsmode" checked={bsMode === val} onChange={() => setBsMode(val)} className="accent-brand-accent" />
                {label}
              </label>
            ))}
          </div>
        </div>

        <p className="text-xs text-brand-muted mt-2">Type the passage exactly · <span className="text-emerald-600">green</span> = correct · <span className="text-rose-500">red</span> = wrong · <span className="text-amber-600">yellow</span> = current position. Marks are per character; your score is counted per word. Click "Result" any time to finish.</p>
      </div>
    </div>
  );
}
