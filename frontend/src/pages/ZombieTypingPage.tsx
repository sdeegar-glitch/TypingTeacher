import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, RotateCcw, Play, Heart } from 'lucide-react';
import { saveGameScore } from '../lib/api';

const ZOMBIE_WORDS = [
  ['run','fly','hop','sit','dog','cat','sun','fun','big','red'],
  ['brave','cloud','happy','night','storm','tiger','magic','grace','flame','lemon'],
  ['keyboard','mountain','festival','platform','language','abstract','champion','elephant','geometry','notebook'],
];

interface Zombie { id: number; word: string; x: number; typed: string; dead: boolean; dying: boolean; }
let zid = 0;

const CANVAS_W = 100; // percent
const ZOMBIE_SPEED_BASE = 0.025;
const SPAWN_INTERVAL_BASE = 3000;

export default function ZombieTypingPage() {
  const [state, setState] = useState<'idle'|'playing'|'gameover'>('idle');
  const [zombies, setZombies] = useState<Zombie[]>([]);
  const [typed, setTyped] = useState('');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [wave, setWave] = useState(1);
  const [killed, setKilled] = useState(0);
  const [bestScore] = useState(() => Number(localStorage.getItem('zombie_best') || '0'));
  const inputRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<number>(0);
  const lastSpawn = useRef(0);
  const ref = useRef({ lives: 5, wave: 1, score: 0, killed: 0 });

  useEffect(() => { document.title = 'Zombie Typing — Typing Game | FastTypingLab'; }, []);

  const endGame = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    setState('gameover');
    const s = ref.current.score;
    if (s > bestScore) localStorage.setItem('zombie_best', String(s));
    try {
      const hist = JSON.parse(localStorage.getItem('typingHistory') || '[]');
      hist.push({ game: 'zombie', score: s, xp: Math.floor(s / 8), date: new Date().toISOString() });
      localStorage.setItem('typingHistory', JSON.stringify(hist));
    } catch {}
    saveGameScore({ game: 'zombie', score: s, xp: Math.floor(s / 8) });
  }, [bestScore]);

  const tick = useCallback((ts: number) => {
    const spawnInterval = Math.max(SPAWN_INTERVAL_BASE - ref.current.wave * 200, 900);
    if (ts - lastSpawn.current > spawnInterval) {
      lastSpawn.current = ts;
      const wList = ZOMBIE_WORDS[Math.min(ref.current.wave - 1, ZOMBIE_WORDS.length - 1)];
      const word = wList[Math.floor(Math.random() * wList.length)];
      setZombies(prev => [...prev, { id: ++zid, word, x: 98, typed: '', dead: false, dying: false }]);
    }

    setZombies(prev => {
      const speed = ZOMBIE_SPEED_BASE + ref.current.wave * 0.005;
      const moved = prev.filter(z => !z.dead).map(z => z.dying ? z : { ...z, x: z.x - speed });
      const breached = moved.filter(z => z.x <= 0 && !z.dying);
      if (breached.length > 0) {
        const newLives = ref.current.lives - breached.length;
        ref.current.lives = newLives;
        setLives(Math.max(0, newLives));
        if (newLives <= 0) { endGame(); return []; }
        return moved.filter(z => z.x > 0);
      }
      return moved;
    });

    frameRef.current = requestAnimationFrame(tick);
  }, [endGame]);

  const startGame = () => {
    cancelAnimationFrame(frameRef.current);
    ref.current = { lives: 5, wave: 1, score: 0, killed: 0 };
    setZombies([]); setScore(0); setLives(5); setWave(1); setKilled(0); setTyped('');
    lastSpawn.current = 0;
    setState('playing');
    setTimeout(() => inputRef.current?.focus(), 80);
    frameRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTyped(val);
    setZombies(prev => {
      const match = prev.find(z => !z.dying && z.word.startsWith(val) && val.length > 0);
      let next = prev.map(z => ({ ...z, typed: match && z.id === match.id ? val : z.typed }));
      if (match && match.word === val) {
        const pts = 100 + match.word.length * 10 + ref.current.wave * 15;
        ref.current.score += pts; setScore(ref.current.score);
        ref.current.killed++; setKilled(ref.current.killed);
        if (ref.current.killed % 8 === 0) { ref.current.wave++; setWave(ref.current.wave); }
        setTyped('');
        // Mark as dying then remove
        next = next.map(z => z.id === match.id ? { ...z, dying: true } : z);
        setTimeout(() => setZombies(p => p.filter(z => z.id !== match.id)), 400);
        return next;
      }
      return next;
    });
  };

  const liveHearts = Array.from({ length: 5 }, (_, i) => i < lives ? '❤️' : '🖤');

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/games" className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text text-sm group">
            <ChevronLeft className="w-4 h-4" /> Games
          </Link>
          <div className="h-4 w-px bg-brand-border" />
          <h1 className="text-xl font-black">🧟 Zombie Typing</h1>
        </div>

        {state === 'playing' && (
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[{l:'Score',v:score,c:'text-emerald-400'},{l:'Wave',v:wave,c:'text-brand-primary'},{l:'Killed',v:killed,c:'text-amber-400'},{l:'Lives',v:liveHearts.join(''),c:'text-rose-400'}].map(h=>(
              <div key={h.l} className="bg-brand-surface border border-brand-border rounded-xl p-2.5 text-center">
                <div className={`font-black font-mono ${h.c} text-sm`}>{h.v}</div>
                <div className="text-[10px] text-brand-muted uppercase">{h.l}</div>
              </div>
            ))}
          </div>
        )}

        {/* Game area */}
        <div className="relative bg-gradient-to-b from-brand-surface to-brand-bg border-2 border-brand-border rounded-2xl overflow-hidden" style={{ height: 400 }}>
          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-brand-surface-2 border-t border-brand-border flex items-center px-4">
            <span className="text-xs text-brand-muted font-bold">⚔️ DEFEND THE BASE</span>
          </div>
          {/* Base */}
          <div className="absolute bottom-10 left-3 w-14 h-14 flex items-center justify-center text-3xl">🏰</div>
          {/* Danger zone line */}
          <div className="absolute bottom-10 left-20 right-0 top-0 border-l-2 border-dashed border-rose-500/20" />

          {/* Zombies */}
          {state === 'playing' && zombies.map(z => (
            <AnimatePresence key={z.id}>
              {!z.dead && (
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={z.dying ? { scale: 1.3, opacity: 0 } : { opacity: 1 }}
                  transition={{ duration: 0.35 }}
                  className="absolute bottom-11 flex flex-col items-center"
                  style={{ left: `${Math.min(z.x, 95)}%`, transform: 'translateX(-50%)' }}>
                  <div className="bg-brand-surface border border-brand-border rounded-lg px-2.5 py-1 mb-1 text-sm font-bold whitespace-nowrap">
                    {z.typed.length > 0 ? (
                      <><span className="text-emerald-400">{z.word.slice(0, z.typed.length)}</span><span className="text-brand-muted">{z.word.slice(z.typed.length)}</span></>
                    ) : <span className="text-brand-muted">{z.word}</span>}
                  </div>
                  <div className="text-2xl">{z.dying ? '💥' : '🧟'}</div>
                </motion.div>
              )}
            </AnimatePresence>
          ))}

          {/* Idle overlay */}
          {state === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="text-6xl">🧟</div>
              <div className="text-center px-6">
                <h2 className="text-2xl font-black text-brand-text mb-2">Zombie Typing</h2>
                <p className="text-brand-text-muted text-sm">Zombies march toward your base. Type the word on each zombie to destroy it before it reaches you! 5 lives.</p>
              </div>
              {bestScore > 0 && <p className="text-amber-400 text-sm font-bold">⭐ Best: {bestScore}</p>}
              <button onClick={startGame} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20">
                <Play className="w-4 h-4" /> Defend!
              </button>
            </div>
          )}

          {/* Game Over */}
          <AnimatePresence>
            {state === 'gameover' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-brand-bg/90 backdrop-blur-sm">
                <div className="text-5xl">🏚️</div>
                <h2 className="text-2xl font-black text-brand-text">Base Destroyed!</h2>
                <div className="text-center">
                  <p className="text-emerald-400 font-black text-2xl">{score} pts</p>
                  <p className="text-brand-muted text-sm">{killed} zombies · Wave {wave}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={startGame} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-500 transition-all">
                    <RotateCcw className="w-4 h-4" /> Try Again
                  </button>
                  <Link to="/games" className="bg-brand-surface-2 border border-brand-border text-brand-text px-6 py-2.5 rounded-xl font-bold hover:bg-brand-border transition-all">All Games</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {state === 'playing' && (
          <div className="mt-3">
            <input ref={inputRef} value={typed} onChange={handleInput} autoFocus placeholder="Type the zombie's word to destroy it…" autoComplete="off" autoCorrect="off" spellCheck={false}
              className="w-full bg-brand-surface border-2 border-emerald-500/40 focus:border-emerald-500 rounded-xl px-5 py-3.5 text-brand-text font-mono text-lg outline-none transition-all" />
          </div>
        )}
      </div>
    </div>
  );
}
