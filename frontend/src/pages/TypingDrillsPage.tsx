import { useState, useCallback, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hash, Quote, Type, FileText, RotateCcw, Zap, ChevronLeft, Target } from 'lucide-react';
import Seo from '../components/Seo';
import CharSpan from '../components/CharSpan';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { useSoundEffects } from '../hooks/useSoundEffects';

// ─── Drill text generators ──────────────────────────────────────────────────

const TOP_WORDS = (
  'the of and to in is you that it he was for on are as with his they at be this have from or one had by word ' +
  'but not what all were we when your can said there use an each which she do how their if will up other about ' +
  'out many then them these so some her would make like him into time has look two more write go see number no ' +
  'way could people my than first water been call who oil its now find long down day did get come made may part ' +
  'over new sound take only little work know place year live me back give most very after thing our just name ' +
  'good sentence man think say great where help through much before line right too mean old any same tell boy ' +
  'follow came want show also around form three small set put end does another well large must big even such'
).split(' ');

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

function genWords(): string {
  return Array.from({ length: 90 }, () => pick(TOP_WORDS)).join(' ');
}

function genNumbers(): string {
  // 10-key style numeric groups: mixed lengths, occasional decimals
  const groups: string[] = [];
  for (let i = 0; i < 70; i++) {
    const len = 2 + Math.floor(Math.random() * 4); // 2-5 digits
    let g = '';
    for (let j = 0; j < len; j++) g += Math.floor(Math.random() * 10);
    if (Math.random() < 0.15) g += '.' + Math.floor(Math.random() * 90 + 10);
    groups.push(g);
  }
  return groups.join(' ');
}

function genPunctuation(): string {
  const patterns: Array<(w: string, w2: string) => string> = [
    (w) => `${w},`,
    (w) => `${w}.`,
    (w) => `"${w}"`,
    (w) => `(${w})`,
    (w) => `${w};`,
    (w) => `${w}'s`,
    (w, w2) => `${w}-${w2}`,
    (w) => `${w}!`,
    (w) => `${w}?`,
    (w) => `${w}:`,
    (w) => w, // plain words too, so it flows
    (w) => w,
  ];
  return Array.from({ length: 70 }, () => pick(patterns)(pick(TOP_WORDS), pick(TOP_WORDS))).join(' ');
}

/**
 * Build a drill that hammers specific weak keys. Picks common words containing
 * those letters so the practice stays natural (real words, real transitions)
 * rather than degenerating into "aaa sss ddd", and salts in short bursts of the
 * raw key where no word contains it (digits, punctuation).
 */
function genWeakKeyDrill(keys: string[]): string {
  const clean = keys.map(k => (k === '␣' ? ' ' : k)).filter(k => k.trim().length === 1);
  if (!clean.length) return genWords();
  const out: string[] = [];
  for (let i = 0; i < 70; i++) {
    const key = clean[i % clean.length];
    const matches = TOP_WORDS.filter(w => w.includes(key.toLowerCase()));
    if (matches.length && Math.random() > 0.25) out.push(pick(matches));
    else out.push(key.repeat(2 + Math.floor(Math.random() * 2)));
  }
  return out.join(' ');
}

type DrillMode = 'numbers' | 'punctuation' | 'words' | 'custom' | 'weak';

const MODES: Array<{ id: DrillMode; label: string; icon: typeof Hash; desc: string }> = [
  { id: 'numbers', label: 'Numbers (10-Key)', icon: Hash, desc: 'Digit groups for data-entry & KDPH practice' },
  { id: 'punctuation', label: 'Punctuation', icon: Quote, desc: 'Commas, quotes, brackets — the keys that slow you down' },
  { id: 'words', label: 'Top Words', icon: Type, desc: 'The 200 most common English words' },
  { id: 'custom', label: 'Custom Text', icon: FileText, desc: 'Paste your own passage and drill it' },
];

const DURATIONS = [30, 60, 120];

// ─── Drill runner (remounted per attempt via key) ──────────────────────────

function DrillCore({ text, duration, onRestart, onNewText }: {
  text: string; duration: number; onRestart: () => void; onNewText: () => void;
}) {
  const sound = useSoundEffects();
  const engine = useTypingEngine(text, duration, 'timed');
  const { stats, userInput, mistakes, skipped, processChar, processBackspace } = engine;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (stats.isFinished) return;
    const ignored = ['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (ignored.includes(e.key)) return;
    if (e.key === 'Tab') { e.preventDefault(); onRestart(); return; }
    if (e.key === ' ') e.preventDefault();
    if (e.key === 'Backspace') { sound.playKey(); processBackspace(); }
    else if (e.key.length === 1) {
      if (e.key === text[userInput.length]) sound.playKey(); else sound.playError();
      processChar(e.key);
    }
  }, [stats.isFinished, processChar, processBackspace, sound, text, userInput.length, onRestart]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const formattedTime = `${Math.floor(stats.timeLeft / 60)}:${String(stats.timeLeft % 60).padStart(2, '0')}`;

  if (stats.isFinished) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-brand-surface border border-brand-border rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">{stats.accuracy >= 95 ? '🏆' : stats.accuracy >= 85 ? '🎉' : '💪'}</div>
        <h2 className="text-xl font-black text-brand-text mb-6">Drill Complete</h2>
        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mb-6">
          <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-xl p-3">
            <div className="text-2xl font-black text-brand-primary font-mono">{stats.netWpm}</div>
            <div className="text-[10px] text-brand-muted uppercase tracking-wider">Net WPM</div>
          </div>
          <div className="bg-brand-accent/10 border border-brand-accent/20 rounded-xl p-3">
            <div className="text-2xl font-black text-brand-accent font-mono">{stats.accuracy}%</div>
            <div className="text-[10px] text-brand-muted uppercase tracking-wider">Accuracy</div>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
            <div className="text-2xl font-black text-rose-500 font-mono">{stats.errors}</div>
            <div className="text-[10px] text-brand-muted uppercase tracking-wider">Errors</div>
          </div>
        </div>
        <div className="flex justify-center gap-3">
          <button onClick={onRestart}
            className="flex items-center gap-2 bg-brand-surface-2 border border-brand-border hover:bg-brand-border text-brand-text px-5 py-2.5 rounded-xl font-bold text-sm transition-all">
            <RotateCcw className="w-4 h-4" /> Same text
          </button>
          <button onClick={onNewText}
            className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>
            <Zap className="w-4 h-4" /> New text
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-4 font-mono text-sm">
          <span className="text-brand-text font-bold">{formattedTime}</span>
          <span className="text-brand-muted">{stats.netWpm} WPM</span>
          <span className="text-brand-muted">{stats.accuracy}%</span>
        </div>
        <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-brand-muted">
          <kbd className="px-1.5 py-0.5 rounded bg-brand-surface-2 border border-brand-border font-mono">Tab</kbd> restart
        </span>
      </div>
      <div className="bg-brand-surface border border-brand-border rounded-2xl px-5 sm:px-8 py-6 cursor-text">
        {/* tabIndex/role: the passage can overflow its 200px box, and a
            scrollable region with no keyboard access strands anyone not using a
            mouse — they cannot reach the rest of the text they are meant to
            type. Focusable + labelled makes it scrollable with the arrow keys. */}
        <div
          tabIndex={0}
          role="region"
          aria-label="Text to type"
          className="font-mono text-lg sm:text-xl tracking-wide leading-relaxed break-words overflow-y-auto"
          style={{ maxHeight: 200 }}
        >
          {text.split('').map((char, index) => (
            <CharSpan
              key={index}
              char={char}
              isCorrect={index < userInput.length && !mistakes.has(index) && !skipped.has(index)}
              isError={index < userInput.length && mistakes.has(index)}
              isSkipped={skipped.has(index)}
              isCurrent={index === userInput.length}
            />
          ))}
        </div>
      </div>
      {!stats.isActive && (
        <p className="text-center text-sm text-brand-muted mt-3">Start typing — the timer begins on your first keystroke.</p>
      )}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function TypingDrillsPage() {
  const [searchParams] = useSearchParams();
  // ?keys=a,e,␣ — arrives from the "keys to practice" chips on a test result
  const weakKeys = useMemo(() => {
    const raw = searchParams.get('keys');
    return raw ? raw.split(',').map(k => k.trim()).filter(Boolean).slice(0, 8) : [];
  }, [searchParams]);

  const [mode, setMode] = useState<DrillMode>(weakKeys.length ? 'weak' : 'numbers');
  const [duration, setDuration] = useState(60);
  const [customText, setCustomText] = useState('');
  const [customStarted, setCustomStarted] = useState(false);
  const [runId, setRunId] = useState(0);

  useEffect(() => { document.title = 'Typing Drills — Numbers, Punctuation & Custom Practice | FastTypingLab'; }, []);

  const text = useMemo(() => {
    if (mode === 'weak') return genWeakKeyDrill(weakKeys);
    if (mode === 'numbers') return genNumbers();
    if (mode === 'punctuation') return genPunctuation();
    if (mode === 'words') return genWords();
    return customText.replace(/\s+/g, ' ').trim();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, runId, customStarted, weakKeys]);

  const restart = useCallback(() => setRunId(r => r + 1), []);
  const changeMode = (m: DrillMode) => { setMode(m); setCustomStarted(false); setRunId(r => r + 1); };

  const showRunner = mode !== 'custom' || (customStarted && text.length >= 20);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text py-8 px-4 sm:px-6">
      <Seo
        title="Typing Drills — Number (10-Key), Punctuation & Custom Text Practice | FastTypingLab"
        description="Free typing drills: number typing test for 10-key & data entry (KDPH), punctuation practice, top-200 common words, and custom text mode. Live WPM and accuracy."
      />
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 text-xs text-brand-muted mb-6">
          <Link to="/tools/" className="flex items-center gap-1 hover:text-brand-primary transition-colors"><ChevronLeft className="w-3.5 h-3.5" /> Tools</Link>
          <span>/</span>
          <span className="text-brand-text">Typing Drills</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black mb-2">Typing Drills</h1>
        <p className="text-brand-text-muted text-sm mb-6">
          Target the keys that slow you down — numbers for 10-key/data-entry (KDPH) practice, punctuation reaches, common-word speed, or paste your own text.
        </p>

        {/* Weak-keys drill, when arriving from a test result */}
        {weakKeys.length > 0 && (
          <button onClick={() => changeMode('weak')}
            className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left mb-3 transition-all ${
              mode === 'weak'
                ? 'bg-rose-500/10 border-rose-500/40'
                : 'bg-brand-surface border-brand-border hover:border-rose-500/30'
            }`}>
            <Target className={`w-5 h-5 shrink-0 mt-0.5 ${mode === 'weak' ? 'text-rose-500' : 'text-brand-muted'}`} />
            <div>
              <p className={`font-bold text-sm ${mode === 'weak' ? 'text-rose-500' : 'text-brand-text'}`}>Drill your weak keys</p>
              <p className="text-xs text-brand-text-muted mt-0.5">
                Built from the keys you missed most:{' '}
                {weakKeys.map(k => (
                  <span key={k} className="inline-block font-mono font-bold bg-brand-surface-2 border border-brand-border rounded px-1.5 mx-0.5">{k}</span>
                ))}
              </p>
            </div>
          </button>
        )}

        {/* Mode tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
          {MODES.map(m => (
            <button key={m.id} onClick={() => changeMode(m.id)}
              className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all ${
                mode === m.id
                  ? 'bg-brand-primary/10 border-brand-primary/40 text-brand-primary'
                  : 'bg-brand-surface border-brand-border text-brand-muted hover:border-brand-primary/30 hover:text-brand-text'
              }`}>
              <span className="flex items-center gap-1.5 font-bold text-sm"><m.icon className="w-3.5 h-3.5" /> {m.label}</span>
              <span className="text-[10px] leading-tight">{m.desc}</span>
            </button>
          ))}
        </div>

        {/* Duration */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-muted">Duration</span>
          {DURATIONS.map(d => (
            <button key={d} onClick={() => { setDuration(d); restart(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                duration === d
                  ? 'bg-brand-primary text-white border-transparent'
                  : 'bg-brand-surface border-brand-border text-brand-muted hover:text-brand-text'
              }`}>
              {d < 60 ? `${d}s` : `${d / 60} min`}
            </button>
          ))}
        </div>

        {/* Custom text input */}
        {mode === 'custom' && !customStarted && (
          <div className="mb-6">
            <textarea
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              placeholder="Paste or type the text you want to practice (at least 20 characters)…"
              rows={5}
              className="w-full bg-brand-surface border border-brand-border rounded-2xl px-4 py-3 text-sm text-brand-text outline-none focus:border-brand-primary transition-all resize-y"
            />
            <button
              onClick={() => { if (customText.trim().length >= 20) { setCustomStarted(true); setRunId(r => r + 1); } }}
              disabled={customText.trim().length < 20}
              className="mt-3 flex items-center gap-2 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#BC6C50,#CC7B5D)' }}>
              <Zap className="w-4 h-4" /> Start Drill
            </button>
          </div>
        )}

        {showRunner && (
          <DrillCore
            key={`${mode}-${duration}-${runId}`}
            text={text}
            duration={duration}
            onRestart={restart}
            onNewText={() => { if (mode === 'custom') setCustomStarted(false); else restart(); }}
          />
        )}

        {/* SEO copy */}
        <div className="mt-10 text-sm text-brand-text-muted space-y-3">
          <h2 className="text-base font-bold text-brand-text">Why drill numbers, punctuation and common words?</h2>
          <p><strong className="text-brand-text">Number typing (10-key practice).</strong> Data entry, banking and government DEO exams measure numeric speed in keystrokes per hour (KDPH). Drilling digit groups builds the number-row and numeric-keypad muscle memory those tests demand.</p>
          <p><strong className="text-brand-text">Punctuation.</strong> Most typists are fast on letters but stall on commas, quotes, brackets and apostrophes — the shift-key reaches. A few minutes of focused punctuation practice removes that hidden bottleneck.</p>
          <p><strong className="text-brand-text">Top words.</strong> A small set of words makes up most of written English. Typing them until they're automatic raises your everyday WPM faster than random text.</p>
          <p><strong className="text-brand-text">Custom text.</strong> Paste exam passages, legal text, or anything you need to master — useful for steno transcription and exam-specific practice. For full-length timed tests, try the <Link to="/tests/" className="text-brand-primary font-semibold hover:underline">typing tests library</Link>.</p>
        </div>
      </div>
    </div>
  );
}
