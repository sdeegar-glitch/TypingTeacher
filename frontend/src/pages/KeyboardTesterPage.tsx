import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, RotateCcw, CheckCircle } from 'lucide-react';

// Full QWERTY keyboard layout
const ROWS = [
  ['`','1','2','3','4','5','6','7','8','9','0','-','=','Backspace'],
  ['Tab','q','w','e','r','t','y','u','i','o','p','[',']','\\'],
  ['CapsLock','a','s','d','f','g','h','j','k','l',';',"'",'Enter'],
  ['Shift','z','x','c','v','b','n','m',',','.','/','Shift'],
  ['Ctrl','Win','Alt','Space','Alt','Fn','Ctrl'],
];

const KEY_WIDTHS: Record<string, string> = {
  Backspace: 'min-w-[88px]',
  Tab: 'min-w-[72px]',
  CapsLock: 'min-w-[80px]',
  Enter: 'min-w-[88px]',
  Shift: 'min-w-[112px]',
  Ctrl: 'min-w-[56px]',
  Win: 'min-w-[52px]',
  Alt: 'min-w-[52px]',
  Fn: 'min-w-[44px]',
  Space: 'flex-1 min-w-[280px]',
};

const keyLabel = (k: string) => k === 'Space' ? '' : k;

export default function KeyboardTesterPage() {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [testedKeys, setTestedKeys] = useState<Set<string>>(new Set());
  const [lastKey, setLastKey] = useState<{ key: string; code: string; timestamp: number } | null>(null);

  // Total unique keys to test (excluding modifiers we track together)
  const TOTAL_TESTABLE = 61;
  const testedCount = testedKeys.size;
  const pct = Math.min(100, Math.round((testedCount / TOTAL_TESTABLE) * 100));

  const normalizeKey = (e: KeyboardEvent): string => {
    if (e.code === 'Space') return 'Space';
    if (e.key === 'Control') return 'Ctrl';
    if (e.key === 'Alt') return 'Alt';
    if (e.key === 'Shift') return 'Shift';
    if (e.key === 'Meta') return 'Win';
    if (e.key === 'Tab') return 'Tab';
    if (e.key === 'CapsLock') return 'CapsLock';
    if (e.key === 'Enter') return 'Enter';
    if (e.key === 'Backspace') return 'Backspace';
    if (e.key === '`' || e.code === 'Backquote') return '`';
    return e.key.toLowerCase();
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    const key = normalizeKey(e);
    setPressedKeys(prev => new Set(prev).add(key));
    setTestedKeys(prev => new Set(prev).add(key));
    setLastKey({ key: e.key, code: e.code, timestamp: Date.now() });
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const key = normalizeKey(e);
    setPressedKeys(prev => { const s = new Set(prev); s.delete(key); return s; });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    document.title = 'Keyboard Tester — Test Every Key | FastTypingLab';
  }, []);

  const reset = () => {
    setPressedKeys(new Set());
    setTestedKeys(new Set());
    setLastKey(null);
  };

  const getKeyClass = (k: string) => {
    const isPressed = pressedKeys.has(k.toLowerCase()) || pressedKeys.has(k);
    const isTested = testedKeys.has(k.toLowerCase()) || testedKeys.has(k);
    if (isPressed) return 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/30 scale-95';
    if (isTested) return 'bg-brand-accent/15 text-brand-accent border-brand-accent/40';
    return 'bg-brand-surface text-brand-text border-brand-border hover:border-brand-primary/40 hover:bg-brand-surface-2';
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/tools" className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text transition-colors text-sm group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Tools
          </Link>
          <div className="h-4 w-px bg-brand-border" />
          <h1 className="text-xl font-bold text-brand-text">Keyboard Tester</h1>
        </div>

        {/* Progress + Info */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-sm text-brand-muted mb-1">Keys Tested</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-brand-text font-mono">{testedCount}</span>
                <span className="text-brand-muted">/ {TOTAL_TESTABLE}</span>
              </div>
            </div>

            {lastKey && (
              <motion.div
                key={lastKey.timestamp}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <p className="text-xs text-brand-muted mb-1">Last Key</p>
                <div className="flex items-center gap-3">
                  <kbd className="bg-brand-primary text-white px-3 py-1.5 rounded-lg font-mono font-bold text-lg min-w-[48px] text-center">
                    {lastKey.key === ' ' ? '⎵' : lastKey.key.length === 1 ? lastKey.key.toUpperCase() : lastKey.key}
                  </kbd>
                  <div className="text-left">
                    <div className="text-xs text-brand-muted">Code</div>
                    <div className="text-sm font-mono font-semibold text-brand-text">{lastKey.code}</div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex items-center gap-3">
              {pct >= 100 && (
                <div className="flex items-center gap-2 text-brand-accent text-sm font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  All keys work!
                </div>
              )}
              <button
                onClick={reset}
                className="flex items-center gap-1.5 bg-brand-surface-2 hover:bg-brand-border border border-brand-border text-brand-muted hover:text-brand-text px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-brand-surface-2 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-primary to-brand-accent rounded-full"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-brand-muted mt-2">{pct}% tested — Press keys to light them up</p>
        </div>

        {/* Keyboard */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 sm:p-6 overflow-x-auto">
          <div className="flex flex-col gap-2 min-w-[640px]">
            {ROWS.map((row, ri) => (
              <div key={ri} className="flex gap-2">
                {row.map((k, ki) => (
                  <motion.button
                    key={`${ri}-${ki}`}
                    whileTap={{ scale: 0.92 }}
                    className={`
                      h-11 sm:h-12 rounded-lg border text-xs sm:text-sm font-semibold font-mono
                      transition-all duration-100 cursor-default select-none flex items-center justify-center
                      ${KEY_WIDTHS[k] || 'min-w-[40px] sm:min-w-[44px]'}
                      ${getKeyClass(k)}
                    `}
                  >
                    {keyLabel(k)}
                  </motion.button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 text-xs text-brand-muted">
          <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-brand-primary/20 border border-brand-primary/40 inline-block" />Pressed</span>
          <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-brand-accent/15 border border-brand-accent/40 inline-block" />Tested</span>
          <span className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-brand-surface border border-brand-border inline-block" />Untested</span>
        </div>

        {/* SEO Content */}
        <div className="mt-10 prose max-w-none text-brand-text-muted">
          <h2 className="text-lg font-bold text-brand-text mb-2">What is a Keyboard Tester?</h2>
          <p className="text-sm leading-relaxed">
            A keyboard tester lets you check if every key on your keyboard is working correctly by pressing each key and watching it light up on the virtual keyboard display.
            It's useful for testing a new mechanical keyboard, diagnosing stuck keys, checking key rollover (NKRO), or verifying your keyboard before an important exam.
          </p>
          <p className="text-sm leading-relaxed mt-2">
            Simply press each key and watch it highlight on the display above. Green indicates a key you've tested successfully, and blue shows the key currently being pressed.
          </p>
        </div>
      </div>
    </div>
  );
}
