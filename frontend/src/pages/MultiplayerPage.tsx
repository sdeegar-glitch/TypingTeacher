import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Zap, Copy, Check, RotateCcw, Play, Trophy, Link as LinkIcon } from 'lucide-react';

// Race texts
const RACE_TEXTS = [
  'the quick brown fox jumps over the lazy dog while the cat sat on the mat watching the birds fly south for the winter season',
  'technology has transformed the way people communicate work and learn making the world a smaller and more connected place than ever before',
  'practice makes perfect and consistent daily effort is the single most reliable path to achieving mastery in any skill you choose to pursue',
  'the sun rises in the east and sets in the west casting golden light across the horizon each morning and evening without fail',
];

type RaceState = 'lobby' | 'countdown' | 'racing' | 'finished';

interface Racer {
  id: string;
  name: string;
  progress: number; // 0-100
  wpm: number;
  finished: boolean;
  finishedAt?: number;
}

function generateRoomId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function getRandomText() {
  return RACE_TEXTS[Math.floor(Math.random() * RACE_TEXTS.length)];
}

export default function MultiplayerPage() {
  const [raceState, setRaceState] = useState<RaceState>('lobby');
  const [roomId] = useState(generateRoomId);
  const [playerName, setPlayerName] = useState('You');
  const [raceText] = useState(getRandomText);
  const [countdown, setCountdown] = useState(3);
  const [typed, setTyped] = useState('');
  const [startTime, setStartTime] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [wpm, setWpm] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Simulate bots for demo experience
  const [racers, setRacers] = useState<Racer[]>([
    { id: 'bot1', name: 'RocketTypist', progress: 0, wpm: 0, finished: false },
    { id: 'bot2', name: 'SpeedDemon', progress: 0, wpm: 0, finished: false },
    { id: 'bot3', name: 'QuickFingers', progress: 0, wpm: 0, finished: false },
  ]);

  const botSpeedsWpm = useRef([68, 82, 55]); // words per minute for each bot

  // Player racer derived
  const playerProgress = raceText.length > 0 ? Math.round((typed.length / raceText.length) * 100) : 0;
  const playerRacer: Racer = { id: 'player', name: playerName || 'You', progress: playerProgress, wpm, finished: playerProgress >= 100 };

  const allRacers = [playerRacer, ...racers].sort((a, b) => b.progress - a.progress);
  const playerRank = allRacers.findIndex(r => r.id === 'player') + 1;

  // Countdown
  useEffect(() => {
    if (raceState !== 'countdown') return;
    if (countdown <= 0) {
      setRaceState('racing');
      setStartTime(Date.now());
      textareaRef.current?.focus();
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [raceState, countdown]);

  // Bot movement
  useEffect(() => {
    if (raceState !== 'racing') return;
    const interval = setInterval(() => {
      setRacers(prev => prev.map((bot, i) => {
        if (bot.finished) return bot;
        const charsPerSec = (botSpeedsWpm.current[i] * 5) / 60; // avg 5 chars/word
        const newProgress = Math.min(100, bot.progress + (charsPerSec / raceText.length) * 100 * 0.25);
        const newWpm = Math.round(botSpeedsWpm.current[i] * (0.9 + Math.random() * 0.2));
        return { ...bot, progress: newProgress, wpm: newWpm, finished: newProgress >= 100, finishedAt: newProgress >= 100 && !bot.finished ? Date.now() : bot.finishedAt };
      }));
    }, 250);
    return () => clearInterval(interval);
  }, [raceState, raceText.length]);

  // Check finish
  useEffect(() => {
    if (raceState === 'racing' && playerProgress >= 100) {
      setRaceState('finished');
    }
  }, [playerProgress, raceState]);

  // Live WPM
  useEffect(() => {
    if (!startTime || raceState !== 'racing') return;
    const elapsed = (Date.now() - startTime) / 60000;
    if (elapsed > 0) {
      const words = typed.trim().split(/\s+/).length;
      setWpm(Math.round(words / elapsed));
    }
  }, [typed, startTime, raceState]);

  const handleType = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (raceState !== 'racing') return;
    const val = e.target.value;
    // Only allow correct progression
    if (val.length <= raceText.length) setTyped(val);
  }, [raceState, raceText]);

  const startRace = () => {
    setRaceState('countdown');
    setCountdown(3);
    setTyped('');
    setWpm(0);
    setRacers(prev => prev.map(b => ({ ...b, progress: 0, wpm: 0, finished: false, finishedAt: undefined })));
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/race?room=${roomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render character coloring
  const renderText = () => raceText.split('').map((char, i) => {
    let cls = 'text-brand-muted';
    if (i < typed.length) {
      cls = typed[i] === char ? 'text-brand-accent' : 'text-rose-500 bg-rose-500/10 rounded';
    } else if (i === typed.length) {
      cls = 'text-brand-text border-b-2 border-brand-primary';
    }
    return <span key={i} className={cls}>{char}</span>;
  });

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-text flex items-center gap-2">
              <Users className="w-7 h-7 text-brand-primary" /> Multiplayer Race
            </h1>
            <p className="text-brand-text-muted text-sm mt-1">Race against others in real-time typing competitions</p>
          </div>
          <div className="flex items-center gap-2 bg-brand-surface border border-brand-border rounded-xl px-3 py-2">
            <span className="text-xs text-brand-muted">Room:</span>
            <span className="font-mono font-bold text-brand-primary">{roomId}</span>
            <button onClick={copyRoomLink} className="text-brand-muted hover:text-brand-primary transition-colors ml-1">
              {copied ? <Check className="w-3.5 h-3.5 text-brand-accent" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Name input (lobby only) */}
        {raceState === 'lobby' && (
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 mb-6">
            <label className="block text-sm font-medium text-brand-text-muted mb-2">Your display name</label>
            <div className="flex gap-3">
              <input type="text" value={playerName} onChange={e => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="flex-1 bg-brand-surface-2 border border-brand-border rounded-xl px-4 py-2.5 text-brand-text text-sm outline-none focus:border-brand-primary transition-all" />
              <button onClick={copyRoomLink}
                className="flex items-center gap-2 bg-brand-surface-2 border border-brand-border hover:border-brand-primary/30 text-brand-muted hover:text-brand-primary px-4 py-2.5 rounded-xl text-sm font-semibold transition-all">
                <LinkIcon className="w-4 h-4" /> Share Room
              </button>
            </div>
            <p className="text-xs text-brand-muted mt-2">Share the room link so friends can join. This demo includes 3 AI bots.</p>
          </div>
        )}

        {/* Race progress bars */}
        <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 mb-5 space-y-4">
          <h2 className="text-sm font-bold text-brand-text flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-primary" /> Race Progress
          </h2>
          {allRacers.map((racer, i) => (
            <div key={racer.id}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-brand-muted">#{i + 1}</span>
                  <span className={`font-bold ${racer.id === 'player' ? 'text-brand-primary' : 'text-brand-text'}`}>
                    {racer.name} {racer.id === 'player' ? '(you)' : ''}
                  </span>
                  {racer.finished && <span className="text-brand-accent font-bold">✓ Done!</span>}
                </div>
                <span className="font-mono text-brand-muted">{racer.wpm > 0 ? `${racer.wpm} WPM` : '—'}</span>
              </div>
              <div className="h-3 bg-brand-surface-2 rounded-full overflow-hidden relative">
                <motion.div
                  className={`h-full rounded-full ${racer.id === 'player' ? 'bg-brand-primary' : 'bg-brand-border'}`}
                  animate={{ width: `${racer.progress}%` }}
                  transition={{ duration: 0.2 }}
                />
                {/* Racer icon */}
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 text-sm"
                  animate={{ left: `${Math.min(racer.progress, 98)}%` }}
                  transition={{ duration: 0.2 }}
                >
                  {racer.id === 'player' ? '🏃' : '🤖'}
                </motion.div>
              </div>
            </div>
          ))}
        </div>

        {/* Countdown overlay */}
        <AnimatePresence>
          {raceState === 'countdown' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
            >
              <div className="text-center">
                <motion.div
                  key={countdown}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-8xl font-black text-white mb-4"
                >
                  {countdown > 0 ? countdown : '🚀 GO!'}
                </motion.div>
                <p className="text-white/60 text-lg">Get ready to type!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Finished banner */}
        <AnimatePresence>
          {raceState === 'finished' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-5 p-5 rounded-2xl border text-center ${playerRank === 1 ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30' : 'bg-brand-surface border-brand-border'}`}
            >
              <div className="text-4xl mb-2">{playerRank === 1 ? '🏆' : playerRank === 2 ? '🥈' : playerRank === 3 ? '🥉' : '🏅'}</div>
              <h2 className="text-2xl font-black text-brand-text mb-1">
                {playerRank === 1 ? 'You Won!' : `Finished #${playerRank}`}
              </h2>
              <p className="text-brand-muted text-sm">Final speed: <span className="font-black text-brand-primary">{wpm} WPM</span></p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Typing area */}
        {(raceState === 'racing' || raceState === 'finished') && (
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 mb-5">
            <div className="font-mono text-base leading-relaxed mb-4 select-none">
              {renderText()}
            </div>
            <textarea
              ref={textareaRef}
              value={typed}
              onChange={handleType}
              disabled={raceState === 'finished'}
              className="w-full bg-brand-surface-2 border border-brand-border rounded-xl px-4 py-3 font-mono text-sm text-brand-text outline-none focus:border-brand-primary transition-all resize-none"
              rows={2}
              placeholder="Type the text above here…"
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          {(raceState === 'lobby' || raceState === 'finished') && (
            <button onClick={startRace}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-brand-primary/20">
              {raceState === 'finished' ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {raceState === 'finished' ? 'Race Again' : 'Start Race'}
            </button>
          )}
          {raceState === 'finished' && (
            <a href={`/certificate?wpm=${wpm}&acc=95&title=Multiplayer+Race`}
              className="flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 py-4 px-5 rounded-xl font-bold transition-all text-sm">
              <Trophy className="w-4 h-4" /> Certificate
            </a>
          )}
        </div>

        {/* SEO content */}
        <div className="mt-10 text-sm text-brand-text-muted leading-relaxed space-y-2">
          <h2 className="text-base font-bold text-brand-text">About Multiplayer Typing Race</h2>
          <p>Challenge your friends or compete against AI bots in real-time typing races. Each race uses a fresh text passage. The first player to type the complete passage correctly wins the race.</p>
          <p>Share the room link with friends to race together. Typing races are one of the most effective ways to improve your speed because the competitive element pushes you to type faster while staying accurate.</p>
        </div>
      </div>
    </div>
  );
}
