import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, RotateCcw, Zap, Target, TrendingUp } from 'lucide-react';

type TestState = 'idle' | 'active' | 'finished';

const TEST_DURATION = 10; // seconds

interface ClickRecord { t: number } // timestamp of each click

export default function CpsTestPage() {
  const [state, setState] = useState<TestState>('idle');
  const [clicks, setClicks] = useState<ClickRecord[]>([]);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [bestCps, setBestCps] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    document.title = 'CPS Test — Click Speed Test | FastTypingLab';
  }, []);

  const start = useCallback(() => {
    if (state !== 'idle') return;
    setState('active');
    setClicks([]);
    setTimeLeft(TEST_DURATION);
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [state]);

  const handleClick = useCallback(() => {
    if (state === 'idle') { start(); return; }
    if (state !== 'active') return;
    const now = Date.now();
    setClicks(prev => {
      const updated = [...prev, { t: now }];
      // Track best CPS (over 1 second sliding window)
      const window1s = updated.filter(c => c.t > now - 1000).length;
      setBestCps(b => Math.max(b, window1s));
      return updated;
    });
  }, [state, start]);

  const reset = () => {
    clearInterval(timerRef.current);
    setState('idle');
    setClicks([]);
    setTimeLeft(TEST_DURATION);
    setBestCps(0);
  };

  const elapsed = TEST_DURATION - timeLeft;
  const cps = elapsed > 0 ? clicks.length / elapsed : 0;
  const totalClicks = clicks.length;

  const getMessage = (c: number) => {
    if (c >= 14) return { text: 'Jitter click god! 🔥', color: 'text-rose-500' };
    if (c >= 10) return { text: 'Butterfly click master! ⚡', color: 'text-brand-primary' };
    if (c >= 7) return { text: 'Great speed! Keep going 🚀', color: 'text-brand-accent' };
    if (c >= 5) return { text: 'Average speed. Practice more!', color: 'text-amber-500' };
    return { text: 'You can do better! Try again.', color: 'text-brand-muted' };
  };

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
          <h1 className="text-xl font-bold text-brand-text">CPS Test</h1>
        </div>

        {/* Live stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'CPS', value: cps.toFixed(1), icon: Zap, color: 'text-brand-primary' },
            { label: 'Clicks', value: totalClicks, icon: Target, color: 'text-brand-text' },
            { label: 'Best CPS', value: bestCps, icon: TrendingUp, color: 'text-brand-accent' },
          ].map(s => (
            <div key={s.label} className="bg-brand-surface border border-brand-border rounded-2xl p-4 text-center">
              <s.icon className={`w-4 h-4 mx-auto mb-2 ${s.color}`} />
              <div className={`text-2xl sm:text-3xl font-black font-mono tabular-nums ${s.color}`}>{s.value}</div>
              <div className="text-xs text-brand-muted mt-1 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Main click area */}
        <motion.div
          className={`
            relative rounded-3xl border-2 cursor-pointer select-none overflow-hidden transition-all duration-200
            ${state === 'idle' ? 'border-brand-border bg-brand-surface hover:border-brand-primary/50' :
              state === 'active' ? 'border-brand-primary bg-brand-primary/5 hover:bg-brand-primary/8' :
              'border-brand-border bg-brand-surface-2'}
          `}
          style={{ height: 260 }}
          onClick={handleClick}
          whileTap={state === 'active' ? { scale: 0.985 } : {}}
        >
          <AnimatePresence mode="wait">
            {state === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              >
                <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
                  <Zap className="w-8 h-8 text-brand-primary" />
                </div>
                <p className="text-xl font-bold text-brand-text">Click to Start!</p>
                <p className="text-brand-muted text-sm">{TEST_DURATION} second test</p>
              </motion.div>
            )}

            {state === 'active' && (
              <motion.div
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-2"
              >
                <motion.div
                  key={timeLeft}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-6xl font-black font-mono tabular-nums ${timeLeft <= 3 ? 'text-rose-500' : 'text-brand-text'}`}
                >
                  {timeLeft}
                </motion.div>
                <p className="text-brand-muted text-sm">seconds left</p>
                <p className="text-brand-primary text-lg font-bold mt-2">CLICK! CLICK! CLICK!</p>
              </motion.div>
            )}

            {state === 'finished' && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-2"
              >
                <div className="text-4xl mb-1">🎯</div>
                <div className={`text-4xl font-black font-mono ${getMessage(parseFloat(cps.toFixed(1))).color}`}>
                  {cps.toFixed(2)} CPS
                </div>
                <p className={`font-semibold ${getMessage(parseFloat(cps.toFixed(1))).color}`}>
                  {getMessage(parseFloat(cps.toFixed(1))).text}
                </p>
                <p className="text-brand-muted text-sm">{totalClicks} total clicks</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Timer bar */}
        {state === 'active' && (
          <div className="mt-3 h-1.5 bg-brand-surface-2 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-brand-primary rounded-full"
              animate={{ width: `${(timeLeft / TEST_DURATION) * 100}%` }}
              transition={{ duration: 0.9, ease: 'linear' }}
            />
          </div>
        )}

        {/* Buttons */}
        <div className="mt-5 flex gap-3">
          {state === 'finished' && (
            <button
              onClick={reset}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white py-3 rounded-xl font-bold transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
          )}
          {state !== 'idle' && state !== 'finished' && (
            <button
              onClick={reset}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-surface-2 hover:bg-brand-border border border-brand-border text-brand-muted py-3 rounded-xl font-semibold text-sm transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          )}
        </div>

        {/* CPS Rating Table */}
        <div className="mt-8 bg-brand-surface border border-brand-border rounded-2xl p-5">
          <h2 className="font-bold text-brand-text mb-4">CPS Rating Chart</h2>
          <div className="space-y-2 text-sm">
            {[
              { range: '14+ CPS', label: 'Jitter Click / Butterfly', color: 'text-rose-500', bg: 'bg-rose-500/10' },
              { range: '10–13 CPS', label: 'Pro / Butterfly Click', color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
              { range: '7–9 CPS', label: 'Advanced', color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
              { range: '5–6 CPS', label: 'Average', color: 'text-amber-500', bg: 'bg-amber-500/10' },
              { range: '1–4 CPS', label: 'Beginner', color: 'text-brand-muted', bg: 'bg-brand-surface-2' },
            ].map(r => (
              <div key={r.range} className={`flex justify-between items-center px-3 py-2 rounded-lg ${r.bg}`}>
                <span className={`font-bold font-mono ${r.color}`}>{r.range}</span>
                <span className="text-brand-text-muted">{r.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SEO content */}
        <div className="mt-8 text-sm text-brand-text-muted leading-relaxed space-y-2">
          <h2 className="text-base font-bold text-brand-text">What is CPS (Clicks Per Second)?</h2>
          <p>CPS stands for Clicks Per Second — a measure of how fast you can click a mouse button. It's widely used in gaming (Minecraft PvP), data entry, and performance benchmarking.</p>
          <p>Average users click at <strong className="text-brand-text">4–6 CPS</strong>. Pro gamers using butterfly or jitter-clicking techniques can reach <strong className="text-brand-text">14+ CPS</strong>.</p>
        </div>
      </div>
    </div>
  );
}
