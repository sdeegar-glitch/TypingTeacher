/**
 * Adapter: engine v2 (hidden textarea + pure reducer) exposed with the SAME
 * shape as the v1 useTypingEngine, so pages can switch engines without
 * rewriting their UI. The page renders `inputProps` on a <textarea> and reads
 * stats / mistakes / skipped / history / getKeyStats exactly as before.
 *
 * Timer, history sampling and finish rules mirror v1 (1 s ticks, finish on time
 * up or when the passage is completed). Stats use lib/typingScoring so there is
 * one formula.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTextInputEngine, type InputMethod } from './useTextInputEngine';
import {
  errorCount, getKeyStats as reducerKeyStats, mistakeIndices,
  type BackspaceMode,
} from '../lib/typingReducer';
import { scorePractice, countErrorWords } from '../lib/typingScoring';
import type { TypingEngineResult, TypingHistoryPoint, TypingStats } from './useTypingEngine';

export interface TypingEngineV2Options {
  /** When false the engine is inert (textarea disabled) so the v1 engine can own the page. */
  enabled: boolean;
  strict?: boolean;
  backspaceMode?: BackspaceMode;
  /** Passage is Devanagari Unicode/INSCRIPT text. */
  mangal?: boolean;
  builtInInscript?: boolean;
  onPaste?: () => void;
  onRestart?: () => void;
  /** Per accepted keystroke (sound effects). */
  onKey?: (info: { correct: boolean }) => void;
}

export type TypingEngineV2 = TypingEngineResult & {
  inputProps: ReturnType<typeof useTextInputEngine>['inputProps'];
  inputMethod: InputMethod;
  /** In-progress IME text, not yet committed. */
  composing: string;
  focus: () => void;
};

export function useTypingEngineV2(
  text: string,
  durationSeconds: number,
  onFinish: ((stats: TypingStats) => void) | undefined,
  opts: TypingEngineV2Options,
): TypingEngineV2 {
  const strict = !!opts.strict;
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isFinished, setIsFinished] = useState(false);
  const [pressedKey, setPressedKey] = useState('');
  const [rejectedFlash, setRejectedFlash] = useState(0);
  const [history, setHistory] = useState<TypingHistoryPoint[]>([]);
  const finishedRef = useRef(false);
  const timeLeftRef = useRef(durationSeconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const input = useTextInputEngine({
    text,
    options: { skipWordOnSpace: !strict, strict },
    backspaceMode: opts.backspaceMode,
    mangal: opts.mangal,
    builtInInscript: opts.builtInInscript,
    disabled: !opts.enabled || isFinished,
    onStart: () => setStartTime(prev => prev ?? Date.now()),
    onPaste: () => optsRef.current.onPaste?.(),
    onRestart: () => optsRef.current.onRestart?.(),
    onRejected: () => setRejectedFlash(f => f + 1),
    onKey: info => optsRef.current.onKey?.(info),
  });
  const st = input.state;

  // Stats (single formula shared with exam mode).
  const elapsedSeconds = startTime ? Math.max(0, durationSeconds - timeLeft) : 0;
  const errors = errorCount(st, strict);
  const score = scorePractice({
    typedChars: st.typed.length,
    errors,
    elapsedSeconds,
    rejectedKeystrokes: strict ? st.rejected : 0,
    errorWords: strict ? undefined : countErrorWords(text, [...mistakeIndices(st), ...st.skipped]),
  });
  const stats: TypingStats = {
    wpm: score.grossWpm,
    netWpm: score.netWpm,
    accuracy: score.accuracy,
    errors,
    cpm: score.cpm,
    progress: text.length > 0 ? Math.min(100, Math.round((st.typed.length / text.length) * 100)) : 0,
    timeLeft,
    isFinished,
    isActive: !!startTime && !isFinished,
    elapsedSeconds,
  };

  const mistakes = useMemo(() => new Set(mistakeIndices(st)), [st]);
  const skipped = useMemo(() => new Set(st.skipped), [st]);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    setIsFinished(true);
  }, []);

  // 1 s countdown + history sample, same cadence as v1.
  const stRef = useRef(st);
  stRef.current = st;
  useEffect(() => {
    if (!startTime || isFinished) return;
    timerRef.current = setInterval(() => {
      const next = timeLeftRef.current - 1;
      timeLeftRef.current = Math.max(0, next);
      setTimeLeft(Math.max(0, next));
      const elapsed = durationSeconds - Math.max(0, next);
      const cur = stRef.current;
      const s = scorePractice({
        typedChars: cur.typed.length,
        errors: errorCount(cur, strict),
        elapsedSeconds: elapsed,
        rejectedKeystrokes: strict ? cur.rejected : 0,
        errorWords: strict ? undefined : countErrorWords(text, [...mistakeIndices(cur), ...cur.skipped]),
      });
      setHistory(h => [...h, { t: elapsed, wpm: Math.max(0, s.grossWpm), accuracy: s.accuracy }]);
      if (next <= 0) finish();
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTime, isFinished, durationSeconds, strict, finish, text]);

  // Passage completed => finish (v1 waited 50 ms; the state is already final here).
  useEffect(() => {
    if (text.length > 0 && st.typed.length >= text.length) finish();
  }, [st.typed.length, text.length, finish]);

  // Fire onFinish once.
  useEffect(() => {
    if (isFinished) onFinishRef.current?.(stats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  // Virtual-keyboard highlight: last typed character (or Backspace) for 100 ms.
  const prevLen = useRef(0);
  useEffect(() => {
    const len = st.typed.length;
    const before = prevLen.current;
    prevLen.current = len;
    if (len === before) return;
    setPressedKey(len > before ? st.typed[len - 1] ?? '' : 'Backspace');
    const t = setTimeout(() => setPressedKey(''), 100);
    return () => clearTimeout(t);
  }, [st.typed]);

  // Idle timer follows the selected duration until the test starts.
  useEffect(() => {
    if (!startTime) { setTimeLeft(durationSeconds); timeLeftRef.current = durationSeconds; }
  }, [durationSeconds, startTime]);

  const reset = useCallback(() => {
    input.reset(text);
    if (timerRef.current) clearInterval(timerRef.current);
    finishedRef.current = false;
    timeLeftRef.current = durationSeconds;
    prevLen.current = 0;
    setStartTime(null);
    setTimeLeft(durationSeconds);
    setIsFinished(false);
    setPressedKey('');
    setHistory([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationSeconds, text, input.reset]);

  // A new passage restarts the run.
  useEffect(() => { reset(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [text]);

  const { insertText, setValue } = input;
  const processChar = useCallback((ch: string) => { if (!finishedRef.current) insertText(ch); }, [insertText]);
  const processBackspace = useCallback(() => {
    if (finishedRef.current) return;
    setValue(Array.from(stRef.current.typed).slice(0, -1).join(''));
  }, [setValue]);
  const handleMobileInput = useCallback((v: string) => { if (!finishedRef.current) setValue(v); }, [setValue]);

  return {
    stats,
    userInput: st.typed,
    mistakes,
    skipped,
    nextChar: text[st.typed.length] ?? '',
    caretIndex: st.typed.length,
    processChar,
    processBackspace,
    handleMobileInput,
    reset,
    finish,
    pressedKey,
    rejectedFlash,
    history,
    getKeyStats: () => reducerKeyStats(stRef.current),
    inputProps: input.inputProps,
    inputMethod: input.inputMethod,
    composing: input.composing,
    focus: input.focus,
  };
}
