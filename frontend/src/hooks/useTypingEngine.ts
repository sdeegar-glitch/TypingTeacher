/**
 * useTypingEngine — Zero-lag, character-level typing engine hook.
 * Supports: timed mode, article/passage mode, word mode, quote mode.
 * Works on both desktop (keydown events) and mobile (hidden input).
 */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

export type TypingMode = 'timed' | 'passage';

export interface TypingHistoryPoint {
  t: number;        // seconds elapsed at this sample
  wpm: number;       // gross WPM at this point
  accuracy: number;  // accuracy % at this point
}

export interface TypingStats {
  wpm: number;
  netWpm: number;
  accuracy: number;
  errors: number;
  cpm: number;
  progress: number;   // 0–100
  timeLeft: number;
  isFinished: boolean;
  isActive: boolean;
  elapsedSeconds: number;
}

export interface TypingEngineResult {
  stats: TypingStats;
  userInput: string;
  mistakes: Set<number>;       // set of indices with errors
  nextChar: string;
  caretIndex: number;
  processChar: (char: string) => void;
  processBackspace: () => void;
  handleMobileInput: (val: string) => void;
  reset: () => void;
  finish: () => void;           // end the test now, using current progress (e.g. "Finish Early")
  pressedKey: string;          // last pressed key (for virtual keyboard highlight)
  rejectedFlash: number;       // increments each time strict mode rejects a wrong keystroke (for shake/feedback UI)
  history: TypingHistoryPoint[]; // WPM/accuracy sampled every second, for results-screen graphs
}

export function useTypingEngine(
  text: string,
  durationSeconds: number,
  mode: TypingMode = 'timed',
  onFinish?: (stats: TypingStats) => void,
  strictMode: boolean = false
): TypingEngineResult {
  const [userInput, setUserInput] = useState('');
  const [mistakes, setMistakes] = useState<Set<number>>(new Set());
  const [strictErrorCount, setStrictErrorCount] = useState(0); // total wrong attempts in strict mode (mistakes Set stays empty there, since rejected keys never commit)
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isFinished, setIsFinished] = useState(false);
  const [pressedKey, setPressedKey] = useState('');
  const [rejectedFlash, setRejectedFlash] = useState(0);
  const [history, setHistory] = useState<TypingHistoryPoint[]>([]);
  const lastMobileVal = useRef('');
  const finishedRef = useRef(false);  // avoid stale closure issues
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refs mirroring the latest userInput/mistakes so the 1s timer tick (set up
  // once per start/finish transition) can sample fresh values without
  // needing to restart the interval on every keystroke.
  const userInputRef = useRef('');
  const mistakesRef = useRef<Set<number>>(new Set());
  const strictErrorCountRef = useRef(0);
  useEffect(() => { userInputRef.current = userInput; }, [userInput]);
  useEffect(() => { mistakesRef.current = mistakes; }, [mistakes]);
  useEffect(() => { strictErrorCountRef.current = strictErrorCount; }, [strictErrorCount]);

  // Derived stats
  const elapsedSeconds = startTime
    ? Math.max(0, durationSeconds - timeLeft)
    : 0;

  const stats: TypingStats = useMemo(() => {
    const elapsed = elapsedSeconds > 0 ? elapsedSeconds : 1;
    const minutes = elapsed / 60;
    const totalChars = userInput.length;
    const errorsCount = strictMode ? strictErrorCount : mistakes.size;
    const cpm = Math.round(totalChars / minutes);
    const grossWpm = Math.round((totalChars / 5) / minutes);
    const netWpm = Math.max(0, Math.round(grossWpm - errorsCount / minutes));
    const accuracyDenominator = strictMode ? totalChars + strictErrorCount : totalChars;
    const accuracy = accuracyDenominator > 0
      ? Math.round(((accuracyDenominator - errorsCount) / accuracyDenominator) * 100)
      : 100;
    const progress = text.length > 0
      ? Math.min(100, Math.round((userInput.length / text.length) * 100))
      : 0;

    return {
      wpm: grossWpm,
      netWpm,
      accuracy,
      errors: errorsCount,
      cpm,
      progress,
      timeLeft,
      isFinished,
      isActive: !!startTime && !isFinished,
      elapsedSeconds,
    };
  }, [userInput, mistakes, strictErrorCount, strictMode, elapsedSeconds, timeLeft, isFinished, startTime, text]);

  // Countdown timer — also samples a WPM/accuracy history point every tick
  useEffect(() => {
    if (!startTime || isFinished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const nextElapsed = durationSeconds - (prev - 1 >= 0 ? prev - 1 : 0);
        const minutes = Math.max(nextElapsed, 1) / 60;
        const totalChars = userInputRef.current.length;
        const errorsCount = strictMode ? strictErrorCountRef.current : mistakesRef.current.size;
        const grossWpm = Math.round((totalChars / 5) / minutes);
        const accDenom = strictMode ? totalChars + strictErrorCountRef.current : totalChars;
        const acc = accDenom > 0 ? Math.round(((accDenom - errorsCount) / accDenom) * 100) : 100;
        setHistory(h => [...h, { t: nextElapsed, wpm: Math.max(0, grossWpm), accuracy: acc }]);

        if (prev <= 1) {
          clearInterval(timerRef.current!);
          finishedRef.current = true;
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [startTime, isFinished, durationSeconds, strictMode]);

  // Fire onFinish callback
  useEffect(() => {
    if (isFinished && onFinish) {
      onFinish(stats);
    }
  }, [isFinished]); // eslint-disable-line react-hooks/exhaustive-deps

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    clearInterval(timerRef.current!);
    setIsFinished(true);
  }, []);

  const processChar = useCallback((char: string) => {
    if (finishedRef.current) return;
    setStartTime(prev => prev ?? Date.now());

    setUserInput(prev => {
      if (prev.length >= text.length) {
        finish();
        return prev;
      }
      const expected = text[prev.length];
      const isWrong = char !== expected;

      if (isWrong && strictMode) {
        // Reject the keystroke entirely — cursor doesn't advance until the
        // correct character is typed. Still counted for accuracy/error stats.
        setStrictErrorCount(c => c + 1);
        setRejectedFlash(f => f + 1);
        return prev;
      }

      if (isWrong) {
        setMistakes(m => { const s = new Set(m); s.add(prev.length); return s; });
      }
      const next = prev + char;
      if (next.length >= text.length) {
        // Complete passage
        setTimeout(finish, 50);
      }
      return next;
    });

    setPressedKey(char);
    setTimeout(() => setPressedKey(''), 100);
  }, [text, finish, strictMode]);

  const processBackspace = useCallback(() => {
    if (finishedRef.current) return;
    setStartTime(prev => prev ?? Date.now());
    setUserInput(prev => {
      const newLen = prev.length - 1;
      if (newLen < 0) return prev;
      setMistakes(m => { const s = new Set(m); s.delete(newLen); return s; });
      return prev.slice(0, newLen);
    });
    setPressedKey('Backspace');
    setTimeout(() => setPressedKey(''), 100);
  }, []);

  const handleMobileInput = useCallback((newVal: string) => {
    if (finishedRef.current) return;
    const prev = lastMobileVal.current;
    if (newVal.length > prev.length) {
      const added = newVal.slice(prev.length);
      for (const ch of added) processChar(ch);
    } else {
      const removedCount = prev.length - newVal.length;
      for (let i = 0; i < removedCount; i++) processBackspace();
    }
    lastMobileVal.current = newVal;
  }, [processChar, processBackspace]);

  const reset = useCallback(() => {
    setUserInput('');
    setMistakes(new Set());
    setStrictErrorCount(0);
    setStartTime(null);
    setTimeLeft(durationSeconds);
    setIsFinished(false);
    setPressedKey('');
    setHistory([]);
    lastMobileVal.current = '';
    finishedRef.current = false;
    clearInterval(timerRef.current!);
  }, [durationSeconds]);

  const nextChar = text[userInput.length] ?? '';
  const caretIndex = userInput.length;

  return {
    stats,
    userInput,
    mistakes,
    nextChar,
    caretIndex,
    processChar,
    processBackspace,
    handleMobileInput,
    reset,
    finish,
    pressedKey,
    rejectedFlash,
    history,
  };
}
