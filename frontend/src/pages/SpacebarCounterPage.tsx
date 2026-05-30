import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, RotateCcw, Zap } from 'lucide-react';

const TEST_DURATION = 10;
type TestState = 'idle' | 'active' | 'finished';

export default function SpacebarCounterPage() {
  const [state, setState] = useState<TestState>('idle');
  const [presses, setPresses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [bestSps, setBestSps] = useState(0);
  const [history, setHistory] = useState<number[]>([]); // presses per second
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const pressTimestamps = useRef<number[]>([]);

  useEffect(() => {
    document.title = 'Spacebar Counter — Spacebar Speed Test | FastTypingLab';
  }, []);

  const start = useCallback(() => {
    setState('active');
    setPresses(0);
    setTimeLeft(TEST_DURATION);
    setBestSps(0);
    setHistory([]);
    pressTimestamps.current = [];

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setState('finished');
          return 0;
        }
        // Calculate presses in this last second for history
        const now = Date.now();
        const thisSecond = pressTimestamps.current.filter(t => t > now - 1000).length;
        setBestSps(b => Math.max(b, thisSecond));
        setHistory(h => [...h, thisSecond]);
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleSpacebar = useCallback(() => {
    if (state === 'idle') { start(); return; }
    if (state !== 'active') return;
    const now = Date.now();
    pressTimestamps.current.push(now);
    setPresses(p => p + 1);
  }, [state, start]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      handleSpacebar();
    }
  }, [handleSpacebar]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const reset = () => {
    clearInterval(timerRef.current);
    setState('idle');
    setPresses(0);
    setTimeLeft(TEST_DURATION);
    setBestSps(0);
    setHistory([]);
    pressTimestamps.current = [];
  };

  const elapsed = TEST_DURATION - timeLeft;
  const sps = elapsed > 0 ? (presses / elapsed).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/tools" className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text transition-colors text-sm group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Tools
          </Link>
          <div className="h-4 w-px bg-brand-border" />
          <h1 className="text-xl font-bold text-brand-text">Spacebar Counter</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-black font-mono text-brand-primary tabular-nums">{presses}</div>
            <div className="text-xs text-brand-muted mt-1 uppercase tracking-wider">Presses</div>
          </div>
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-black font-mono text-brand-text tabular-nums">{sps}</div>
            <div className="text-xs text-brand-muted mt-1 uppercase tracking-wider">SPS (avg)</div>
          </div>
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 text-center">
            <div className="text-2xl sm:text-3xl font-black font-mono text-brand-accent tabular-nums">{bestSps}</div>
            <div className="text-xs text-brand-muted mt-1 uppercase tracking-wider">Best SPS</div>
          </div>
        </div>

        {/* Main press area */}
        <motion.div
          className={`
            relative rounded-3xl border-2 cursor-pointer select-none overflow-hidden transition-all duration-150
            ${state === 'idle' ? 'border-brand-border bg-brand-surface' :
              state === 'active' ? 'border-brand-primary bg-brand-primary/5' :
              'border-brand-border bg-brand-surface-2'}
          `}
          style={{ height: 240 }}
          onClick={handleSpacebar}
          whileTap={state === 'active' ? { scale: 0.99 } : {}}
        >
          <AnimatePresence mode="wait">
            {state === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-24 h-10 rounded-xl bg-brand-primary/10 border-2 border-brand-primary/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-brand-primary tracking-widest">SPACE</span>
                </div>
                <p className="text-lg font-bold text-brand-text">Press Space to Start!</p>
                <p className="text-brand-muted text-sm">Or click this area · {TEST_DURATION}s test</p>
              </motion.div>
            )}

            {state === 'active' && (
              <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <motion.div
                  key={presses}
                  initial={{ scale: 1.3, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.08 }}
                  className="text-6xl font-black font-mono text-brand-primary tabular-nums"
                >
                  {presses}
                </motion.div>
                <div className={`text-4xl font-black font-mono ${timeLeft <= 3 ? 'text-rose-500' : 'text-brand-muted'}`}>{timeLeft}s</div>
              </motion.div>
            )}

            {state === 'finished' && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="text-4xl mb-1">🚀</div>
                <div className="text-4xl font-black font-mono text-brand-primary">{presses} presses</div>
                <p className="text-brand-muted">{sps} SPS average · Best: {bestSps} SPS</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Progress bar */}
        {state === 'active' && (
          <div className="mt-3 h-1.5 bg-brand-surface-2 rounded-full overflow-hidden">
            <motion.div className="h-full bg-brand-primary rounded-full"
              animate={{ width: `${(timeLeft / TEST_DURATION) * 100}%` }}
              transition={{ duration: 0.9, ease: 'linear' }}
            />
          </div>
        )}

        {/* Per-second sparkline */}
        {history.length > 0 && (
          <div className="mt-4 flex items-end gap-1 h-12">
            {history.map((v, i) => {
              const max = Math.max(...history, 1);
              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${(v / max) * 100}%` }}
                  className="flex-1 bg-brand-primary/40 rounded-sm min-h-[2px]"
                />
              );
            })}
          </div>
        )}

        {state === 'finished' && (
          <button onClick={reset}
            className="mt-5 w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white py-3 rounded-xl font-bold transition-all">
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        )}

        {/* SEO content */}
        <div className="mt-8 text-sm text-brand-text-muted leading-relaxed space-y-2">
          <h2 className="text-base font-bold text-brand-text">Spacebar Counter — Test Your Spacebar Speed</h2>
          <p>The Spacebar Counter test measures how many times you can press the spacebar in 10 seconds. It's popular for checking keyboard responsiveness and for gaming challenges like Minecraft "spacebar clicking" records.</p>
          <p>The world record is over <strong className="text-brand-text">14 spacebar presses per second</strong>. Average users score between 5–8 SPS. Can you beat the record?</p>
        </div>
      </div>
    </div>
  );
}
