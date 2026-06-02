import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, Zap, RotateCcw, Play } from 'lucide-react';
import { saveGameScore } from '../lib/api';

const WORDS_EASY = ['cat','dog','sun','run','big','top','map','red','box','cup','pan','win','sit','hop','log','fix','jam','net','pop','zip','fat','hat','bat','rat','sat','can','fan','man','tan','van'];
const WORDS_MED  = ['brave','cloud','dance','eagle','flame','grace','happy','ivory','juice','knack','lemon','magic','night','ocean','piano','queen','river','storm','tiger','ultra'];
const WORDS_HARD = ['abstract','blizzard','champion','diagonal','elephant','festival','geometry','hospital','industry','junction','keyboard','language','mountain','notebook','platform'];

interface FallingWord { id: number; word: string; x: number; y: number; speed: number; active: boolean; }
let _id = 0;

export default function WordRainPage() {
  const [gameState, setGameState] = useState<'idle'|'playing'|'gameover'>('idle');
  const [words, setWords] = useState<FallingWord[]>([]);
  const [typed, setTyped] = useState('');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [wordsTyped, setWordsTyped] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestScore, setBestScore] = useState(() => { try { return Number(localStorage.getItem('wordrain_best') || '0'); } catch { return 0; } });
  const inputRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<number>(0);
  const lastSpawn = useRef(0);
  const stateRef = useRef({ lives: 3, level: 1, wordsTyped: 0, score: 0, combo: 0 });

  useEffect(() => { document.title = 'Word Rain — Typing Game | FastTypingLab'; }, []);

  const getWord = (lv: number) => {
    const list = lv <= 3 ? WORDS_EASY : lv <= 7 ? WORDS_MED : WORDS_HARD;
    return list[Math.floor(Math.random() * list.length)];
  };

  const endGame = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    setGameState('gameover');
    const s = stateRef.current.score;
    if (s > bestScore) { setBestScore(s); localStorage.setItem('wordrain_best', String(s)); }
    try {
      const hist = JSON.parse(localStorage.getItem('typingHistory') || '[]');
      hist.push({ game: 'wordrain', score: s, xp: Math.floor(s / 10), date: new Date().toISOString() });
      localStorage.setItem('typingHistory', JSON.stringify(hist));
    } catch {}
    saveGameScore({ game: 'wordrain', score: s, xp: Math.floor(s / 10) });
  }, [bestScore]);

  const tick = useCallback((ts: number) => {
    const interval = Math.max(2200 - stateRef.current.level * 150, 700);
    if (ts - lastSpawn.current > interval) {
      lastSpawn.current = ts;
      setWords(prev => [...prev, { id: ++_id, word: getWord(stateRef.current.level), x: 5 + Math.random() * 85, y: 0, speed: 0.06 + stateRef.current.level * 0.018, active: false }]);
    }
    setWords(prev => {
      const moved = prev.map(w => ({ ...w, y: w.y + w.speed }));
      const hit = moved.filter(w => w.y >= 91);
      if (hit.length > 0) {
        const newLives = stateRef.current.lives - hit.length;
        stateRef.current.lives = newLives;
        setLives(Math.max(0, newLives));
        if (newLives <= 0) { endGame(); return []; }
      }
      return moved.filter(w => w.y < 91);
    });
    frameRef.current = requestAnimationFrame(tick);
  }, [endGame]);

  const startGame = () => {
    cancelAnimationFrame(frameRef.current);
    stateRef.current = { lives: 3, level: 1, wordsTyped: 0, score: 0, combo: 0 };
    setWords([]); setScore(0); setLives(3); setLevel(1); setWordsTyped(0); setCombo(0); setTyped('');
    lastSpawn.current = 0;
    setGameState('playing');
    setTimeout(() => inputRef.current?.focus(), 80);
    frameRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTyped(val);
    const trimmed = val.replace(/\s+$/, '');
    setWords(prev => {
      const match = prev.find(w => w.word.startsWith(trimmed) && trimmed.length > 0);
      let next = prev.map(w => ({ ...w, active: !!(match && w.id === match.id) }));
      if (val.endsWith(' ') || (match && match.word === trimmed)) {
        const hit = next.find(w => w.word === trimmed);
        if (hit) {
          const pts = 50 + trimmed.length * 5 + stateRef.current.combo * 8;
          stateRef.current.score += pts; setScore(stateRef.current.score);
          stateRef.current.wordsTyped++; setWordsTyped(stateRef.current.wordsTyped);
          stateRef.current.combo++; setCombo(stateRef.current.combo);
          if (stateRef.current.wordsTyped % 5 === 0) { stateRef.current.level++; setLevel(stateRef.current.level); }
          setTyped('');
          return next.filter(w => w.id !== hit.id);
        }
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/games" className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text text-sm group">
            <ChevronLeft className="w-4 h-4" /> Games
          </Link>
          <div className="h-4 w-px bg-brand-border" />
          <h1 className="text-xl font-black">🌧️ Word Rain</h1>
        </div>

        {gameState === 'playing' && (
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[{l:'Score',v:score,c:'text-brand-primary'},{l:'Level',v:level,c:'text-brand-accent'},{l:'Combo',v:`×${combo}`,c:'text-amber-400'},{l:'Lives',v:'❤️'.repeat(lives)+'🖤'.repeat(Math.max(0,3-lives)),c:'text-rose-400'}].map(h=>(
              <div key={h.l} className="bg-brand-surface border border-brand-border rounded-xl p-2.5 text-center">
                <div className={`font-black font-mono ${h.c}`}>{h.v}</div>
                <div className="text-[10px] text-brand-muted uppercase">{h.l}</div>
              </div>
            ))}
          </div>
        )}

        <div className="relative bg-brand-surface border-2 border-brand-border rounded-2xl overflow-hidden select-none" style={{height:480}}>
          {gameState === 'playing' && words.map(w => (
            <div key={w.id} className="absolute px-3 py-1 rounded-full text-sm font-bold pointer-events-none"
              style={{ left:`${w.x}%`, top:`${w.y}%`, transform:'translateX(-50%)', background: w.active?'rgba(99,102,241,0.25)':'rgba(255,255,255,0.06)', border:`1px solid ${w.active?'#6366f1':'rgba(255,255,255,0.12)'}`, color: w.active?'#a5b4fc':'#94a3b8' }}>
              {w.active && typed.trim().length > 0 ? (<><span className="text-brand-accent">{w.word.slice(0,typed.trim().length)}</span>{w.word.slice(typed.trim().length)}</>) : w.word}
            </div>
          ))}
          {gameState === 'playing' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500/40 rounded-full" />}

          {gameState === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div className="text-6xl">🌧️</div>
              <div className="text-center px-6">
                <h2 className="text-2xl font-black text-brand-text mb-2">Word Rain</h2>
                <p className="text-brand-text-muted text-sm">Words fall from the sky. Type them before they hit the ground! 3 lives · Speed increases each level.</p>
              </div>
              {bestScore > 0 && <p className="text-amber-400 text-sm font-bold">⭐ Best Score: {bestScore}</p>}
              <button onClick={startGame} className="flex items-center gap-2 bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/20">
                <Play className="w-4 h-4" /> Start Game
              </button>
            </div>
          )}

          <AnimatePresence>
            {gameState === 'gameover' && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-brand-bg/90 backdrop-blur-sm">
                <div className="text-6xl">💀</div>
                <h2 className="text-3xl font-black text-brand-text">Game Over!</h2>
                <div className="text-center">
                  <p className="text-brand-primary font-black text-2xl font-mono">{score} pts</p>
                  <p className="text-brand-muted text-sm">{wordsTyped} words · Level {level}</p>
                  {score > 0 && score >= bestScore && <p className="text-amber-400 font-bold mt-1">🏆 New High Score!</p>}
                </div>
                <div className="flex gap-3">
                  <button onClick={startGame} className="flex items-center gap-2 bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-secondary transition-all">
                    <RotateCcw className="w-4 h-4" /> Play Again
                  </button>
                  <Link to="/games" className="flex items-center gap-2 bg-brand-surface-2 border border-brand-border text-brand-text px-6 py-2.5 rounded-xl font-bold hover:bg-brand-border transition-all">
                    All Games
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {gameState === 'playing' && (
          <div className="mt-3 relative">
            <input ref={inputRef} value={typed} onChange={handleInput} autoFocus placeholder="Type the falling words…" autoComplete="off" autoCorrect="off" spellCheck={false}
              className="w-full bg-brand-surface border-2 border-brand-primary/50 focus:border-brand-primary rounded-xl px-5 py-3.5 text-brand-text font-mono text-lg outline-none transition-all" />
            <Zap className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
