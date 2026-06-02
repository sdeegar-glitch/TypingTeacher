import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, RotateCcw, Play, Zap, Trophy, Flag } from 'lucide-react';
import { saveGameScore } from '../lib/api';

const PASSAGES = [
  'The quick brown fox jumps over the lazy dog near the river bank on a sunny afternoon.',
  'Speed and accuracy together form the foundation of professional typing skills used in every workplace.',
  'Practice every day to build muscle memory and let your fingers find the keys without looking.',
  'Government exam typing tests reward consistency over bursts of speed followed by long hesitations.',
  'Touch typing is a skill that pays dividends throughout your entire professional career and education.',
  'The race to become a faster typist begins with correct finger placement on the home row keys.',
  'Every champion was once a beginner who refused to give up when the going got difficult and slow.',
  'Typing at high speed requires relaxed hands, upright posture, and focused eyes on the text ahead.',
];

const DIFFICULTIES = [
  { label: 'Easy', ghost: 20, color: 'text-emerald-500', bg: 'bg-emerald-500', track: 'bg-emerald-500/20' },
  { label: 'Medium', ghost: 35, color: 'text-amber-500', bg: 'bg-amber-500', track: 'bg-amber-500/20' },
  { label: 'Hard', ghost: 55, color: 'text-rose-500', bg: 'bg-rose-500', track: 'bg-rose-500/20' },
];

export default function SpeedRacerPage() {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [diffIdx, setDiffIdx] = useState(1);
  const [passageIdx] = useState(() => Math.floor(Math.random() * PASSAGES.length));
  const [typed, setTyped] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [ghostPct, setGhostPct] = useState(0);
  const [playerPct, setPlayerPct] = useState(0);
  const [errors, setErrors] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [bestWpm] = useState(() => { try { return Number(localStorage.getItem('speedracer_best') || '0'); } catch { return 0; } });
  const [finalBest, setFinalBest] = useState(bestWpm);
  const inputRef = useRef<HTMLInputElement>(null);
  const ghostRef = useRef<ReturnType<typeof setInterval>>();
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const passage = PASSAGES[passageIdx];
  const diff = DIFFICULTIES[diffIdx];

  useEffect(() => { document.title = 'Speed Racer — Typing Game | FastTypingLab'; }, []);

  const finishGame = useCallback((finalTyped: string, finalStart: number) => {
    clearInterval(ghostRef.current);
    clearInterval(timerRef.current);
    setGameState('finished');
    const mins = (Date.now() - finalStart) / 60000;
    const w = mins > 0 ? Math.round(finalTyped.length / 5 / mins) : 0;
    setWpm(w);
    const errs = finalTyped.split('').filter((c, i) => c !== passage[i]).length;
    const acc = finalTyped.length > 0 ? Math.round(((finalTyped.length - errs) / finalTyped.length) * 100) : 100;
    setAccuracy(acc);
    if (w > bestWpm) {
      setFinalBest(w);
      localStorage.setItem('speedracer_best', String(w));
    }
    try {
      const hist = JSON.parse(localStorage.getItem('typingHistory') || '[]');
      hist.push({ game: 'speedracer', netWpm: w, accuracy: acc, difficulty: diff.label, xp: w * 2, date: new Date().toISOString() });
      localStorage.setItem('typingHistory', JSON.stringify(hist));
    } catch {}
    saveGameScore({ game: 'speedracer', wpm: w, accuracy: acc, difficulty: diff.label, xp: w * 2 });
  }, [passage, bestWpm, diff.label]);

  const startGame = () => {
    setTyped('');
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    setGhostPct(0);
    setPlayerPct(0);
    setElapsed(0);
    const now = Date.now();
    setStartTime(now);
    setGameState('playing');
    setTimeout(() => inputRef.current?.focus(), 50);

    // Ghost car advances based on WPM target
    const ghostWpm = diff.ghost;
    const totalChars = passage.length;
    const totalMins = totalChars / 5 / ghostWpm;
    const totalMs = totalMins * 60000;
    const tickMs = 200;
    ghostRef.current = setInterval(() => {
      setGhostPct(prev => {
        const next = prev + (tickMs / totalMs) * 100;
        if (next >= 100) { clearInterval(ghostRef.current); return 100; }
        return next;
      });
    }, tickMs);

    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - now) / 1000));
    }, 500);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState !== 'playing') return;
    const val = e.target.value;
    if (val.length > passage.length) return;
    setTyped(val);

    const errs = val.split('').filter((c, i) => c !== passage[i]).length;
    setErrors(errs);
    const acc = val.length > 0 ? Math.round(((val.length - errs) / val.length) * 100) : 100;
    setAccuracy(acc);
    const pct = (val.length / passage.length) * 100;
    setPlayerPct(pct);

    const mins = (Date.now() - startTime) / 60000;
    if (mins > 0) setWpm(Math.round(val.length / 5 / mins));

    if (val.length >= passage.length) {
      finishGame(val, startTime);
    }
  };

  const reset = () => {
    clearInterval(ghostRef.current);
    clearInterval(timerRef.current);
    setGameState('idle');
    setTyped('');
    setGhostPct(0);
    setPlayerPct(0);
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    setElapsed(0);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const renderPassage = () => passage.split('').map((ch, i) => {
    let cls = 'text-brand-muted';
    if (i < typed.length) cls = typed[i] === ch ? 'text-brand-accent' : 'text-rose-400 bg-rose-500/20 rounded-sm';
    else if (i === typed.length) cls = 'text-brand-text border-b-2 border-brand-primary animate-pulse';
    return <span key={i} className={cls}>{ch}</span>;
  });

  const playerBeatsGhost = playerPct >= ghostPct;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/games" className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text text-sm group">
            <ChevronLeft className="w-4 h-4" /> Games
          </Link>
          <div className="h-4 w-px bg-brand-border" />
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span>🏎️</span> Speed Racer
          </h1>
          {finalBest > 0 && (
            <span className="ml-auto flex items-center gap-1 text-xs text-amber-500 font-bold">
              <Trophy className="w-3.5 h-3.5" /> Best: {finalBest} WPM
            </span>
          )}
        </div>

        {/* Idle screen */}
        <AnimatePresence>
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-center py-10">
              <div className="text-6xl mb-4">🏎️</div>
              <h2 className="text-3xl font-black text-brand-text mb-2">Speed Racer</h2>
              <p className="text-brand-text-muted mb-8 max-w-md mx-auto">Race against a ghost driver! Type the passage faster than your opponent to win. Every character counts.</p>

              {/* Difficulty */}
              <div className="flex justify-center gap-3 mb-8">
                {DIFFICULTIES.map((d, i) => (
                  <button key={d.label} onClick={() => setDiffIdx(i)}
                    className={`px-5 py-2.5 rounded-xl font-bold border transition-all text-sm ${diffIdx === i
                      ? `${d.bg} text-white border-transparent shadow-lg`
                      : 'bg-brand-surface border-brand-border text-brand-muted hover:text-brand-text'}`}>
                    {d.label}
                    <div className={`text-xs font-normal mt-0.5 ${diffIdx === i ? 'text-white/80' : 'text-brand-muted'}`}>Ghost: {d.ghost} WPM</div>
                  </button>
                ))}
              </div>

              <button onClick={startGame}
                className="flex items-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white px-8 py-3.5 rounded-2xl font-black text-lg transition-all shadow-lg shadow-brand-primary/30 mx-auto">
                <Play className="w-5 h-5" /> Start Race!
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Racing UI */}
        {gameState === 'playing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Live stats */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              {[
                { label: 'WPM', value: wpm, color: 'text-brand-primary' },
                { label: 'Accuracy', value: `${accuracy}%`, color: accuracy >= 90 ? 'text-brand-accent' : 'text-rose-400' },
                { label: 'Errors', value: errors, color: errors > 3 ? 'text-rose-400' : 'text-brand-muted' },
                { label: 'Time', value: formatTime(elapsed), color: 'text-brand-text' },
              ].map(s => (
                <div key={s.label} className="bg-brand-surface border border-brand-border rounded-xl p-3 text-center">
                  <div className={`text-xl font-black font-mono ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] text-brand-muted uppercase">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Race track */}
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 mb-4">
              <div className="mb-3 space-y-3">
                {/* Ghost car */}
                <div>
                  <div className="flex items-center justify-between text-xs text-brand-muted mb-1">
                    <span className="font-semibold">Ghost ({diff.label} — {diff.ghost} WPM)</span>
                    <span className={diff.color}>{Math.round(ghostPct)}%</span>
                  </div>
                  <div className="relative h-8 bg-brand-surface-2 rounded-xl overflow-hidden">
                    <motion.div className={`h-full ${diff.bg} opacity-40 rounded-xl`}
                      animate={{ width: `${ghostPct}%` }} transition={{ duration: 0.2, ease: 'linear' }} />
                    <motion.div className="absolute top-1 h-6 flex items-center text-lg"
                      animate={{ left: `calc(${ghostPct}% - 20px)` }} transition={{ duration: 0.2, ease: 'linear' }}>
                      👻
                    </motion.div>
                  </div>
                </div>

                {/* Player car */}
                <div>
                  <div className="flex items-center justify-between text-xs text-brand-muted mb-1">
                    <span className="font-semibold text-brand-primary">You</span>
                    <span className="text-brand-primary">{Math.round(playerPct)}%</span>
                  </div>
                  <div className="relative h-8 bg-brand-surface-2 rounded-xl overflow-hidden">
                    <motion.div className="h-full bg-brand-primary rounded-xl"
                      animate={{ width: `${playerPct}%` }} transition={{ duration: 0.1, ease: 'linear' }} />
                    <motion.div className="absolute top-1 h-6 flex items-center text-lg"
                      animate={{ left: `calc(${playerPct}% - 20px)` }} transition={{ duration: 0.1, ease: 'linear' }}>
                      🏎️
                    </motion.div>
                  </div>
                </div>
              </div>

              {playerBeatsGhost && playerPct > 5 && (
                <div className="text-center text-xs font-bold text-brand-accent animate-pulse">
                  🔥 You're ahead! Keep going!
                </div>
              )}
            </div>

            {/* Passage */}
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 mb-4">
              <p className="text-lg leading-8 select-none font-mono">{renderPassage()}</p>
            </div>

            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={typed}
              onChange={handleInput}
              autoFocus
              spellCheck={false}
              autoComplete="off"
              placeholder="Type the passage above…"
              className="w-full bg-brand-surface border-2 border-brand-border focus:border-brand-primary rounded-2xl px-5 py-4 text-brand-text text-base outline-none transition-all font-mono"
            />
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="text-center">
              <div className="bg-brand-surface border border-brand-border rounded-3xl p-8 mb-5">
                <div className="text-5xl mb-3">
                  {wpm > diff.ghost ? '🏆' : wpm > diff.ghost * 0.8 ? '🥈' : '💪'}
                </div>
                <h2 className="text-2xl font-black text-brand-text mb-1">
                  {wpm > diff.ghost ? 'You Win! Ghost Defeated!' : wpm > diff.ghost * 0.8 ? 'So Close! Great Run!' : 'Ghost Wins — Try Again!'}
                </h2>
                <p className="text-brand-text-muted text-sm mb-6">
                  {wpm > diff.ghost ? `You typed ${wpm} WPM vs ghost's ${diff.ghost} WPM` : `You typed ${wpm} WPM — ghost set ${diff.ghost} WPM`}
                </p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Your WPM', value: wpm, color: wpm > diff.ghost ? 'text-brand-accent' : 'text-brand-primary', sub: `Ghost: ${diff.ghost}` },
                    { label: 'Accuracy', value: `${accuracy}%`, color: accuracy >= 90 ? 'text-brand-accent' : 'text-rose-400', sub: `${errors} errors` },
                    { label: 'Time', value: formatTime(elapsed), color: 'text-brand-text', sub: wpm > finalBest - 1 && wpm > bestWpm ? 'New Best!' : '' },
                  ].map(s => (
                    <div key={s.label} className="bg-brand-surface-2 border border-brand-border rounded-xl p-4">
                      <div className={`text-2xl font-black font-mono ${s.color}`}>{s.value}</div>
                      <div className="text-xs text-brand-muted mt-1">{s.label}</div>
                      {s.sub && <div className="text-[10px] text-brand-muted mt-0.5">{s.sub}</div>}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 justify-center">
                  <button onClick={reset}
                    className="flex items-center gap-2 bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-secondary transition-all">
                    <RotateCcw className="w-4 h-4" /> Race Again
                  </button>
                  <Link to="/games"
                    className="flex items-center gap-2 bg-brand-surface-2 border border-brand-border text-brand-text px-6 py-2.5 rounded-xl font-bold hover:bg-brand-border transition-all">
                    All Games
                  </Link>
                </div>
              </div>

              {/* XP notice */}
              <div className="bg-brand-surface border border-brand-border rounded-2xl p-4 flex items-center gap-3">
                <Zap className="w-5 h-5 text-brand-primary shrink-0" />
                <p className="text-sm text-brand-text-muted">
                  You earned <span className="font-bold text-brand-primary">{wpm * 2} XP</span> from this race. Keep racing to level up on your Dashboard!
                </p>
                <Flag className="w-5 h-5 text-brand-accent shrink-0" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
