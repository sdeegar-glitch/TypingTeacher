import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ChevronLeft, Zap, Target, Clock, Activity, Award, TrendingUp } from 'lucide-react';
import VirtualKeyboard from '../components/VirtualKeyboard';
import HandGuide from '../components/HandGuide';
import { getFingerForKey } from '../utils/KeyboardLayout';
import { useTypingEngine } from '../hooks/useTypingEngine';

const API_URL = 'https://typingteacher-2lnd.onrender.com/api/tests';

// Duration options
const DURATION_OPTIONS = [
  { label: '15s', value: 15 },
  { label: '30s', value: 30 },
  { label: '1 min', value: 60 },
  { label: '2 min', value: 120 },
  { label: '5 min', value: 300 },
];

// Random word bank for "words" mode
const WORDS = ['the','be','to','of','and','a','in','that','have','it','for','not','on','with','he','as','you','do','at','this','but','his','by','from','they','we','say','her','she','or','an','will','my','one','all','would','there','their','what','so','up','out','if','about','who','get','which','go','me','when','make','can','like','time','no','just','him','know','take','people','into','year','your','good','some','could','them','see','other','than','then','now','look','only','come','its','over','think','also','back','after','use','two','how','our','work','first','well','way','even','new','want','because','any','these','give','day','most','us'];

function getRandomWords(count: number) {
  return Array.from({ length: count }, () => WORDS[Math.floor(Math.random() * WORDS.length)]).join(' ');
}

// Quote bank
const QUOTES = [
  "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
  "In the middle of every difficulty lies opportunity. The measure of intelligence is the ability to change.",
  "It does not matter how slowly you go as long as you do not stop. Our greatest glory is not in never falling but in rising every time we fall.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "The future belongs to those who believe in the beauty of their dreams. Keep your face always toward the sunshine.",
];

type TestMode = 'article' | 'words' | 'quote';

const sampleTexts: Record<string, { title: string; content: string }> = {
  '1': { title: 'Easy Paragraph Drill', content: 'the quick brown fox jumps over the lazy dog focus on keeping your hands relaxed and moving smoothly between keys with steady rhythm and consistent pressure on each keystroke' },
  '2': { title: 'Home Row Extended', content: 'sad lass fall lads salad all ask dad for a salad a sad fall for a young lad dad asks a lass for a salad and all falls well in the end' },
};

export default function TypingTestPage() {
  const { id, duration, profession, language } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryDuration = searchParams.get('duration');

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  }, []);

  // SEO title
  useEffect(() => {
    let title = 'Typing Speed Test | FastTypingLab';
    if (duration || queryDuration) title = `${duration || (Number(queryDuration) / 60) + ' min'} Typing Test | FastTypingLab`;
    if (profession) title = `Typing Test for ${profession.charAt(0).toUpperCase() + profession.slice(1)} | FastTypingLab`;
    if (language) title = `${language.charAt(0).toUpperCase() + language.slice(1)} Typing Test | FastTypingLab`;
    document.title = title;
  }, [duration, profession, language, queryDuration]);

  // Test content state
  const [testContent, setTestContent] = useState({ title: sampleTexts['1'].title, content: sampleTexts['1'].content });
  const [loadingTest, setLoadingTest] = useState(!!id && !sampleTexts[id || '']);
  const [testMode, setTestMode] = useState<TestMode>('article');
  const [selectedDuration, setSelectedDuration] = useState(() => {
    const qd = queryDuration ? parseInt(queryDuration) : NaN;
    const rd = duration ? parseInt(duration) * 60 : NaN;
    return !isNaN(qd) ? qd : !isNaN(rd) ? rd : 60;
  });

  // Fetch article test from backend
  useEffect(() => {
    if (id && !sampleTexts[id]) {
      setLoadingTest(true);
      fetch(`${API_URL}/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data?.content) setTestContent({ title: data.title, content: data.content });
          else setTestContent(sampleTexts['1']);
        })
        .catch(() => setTestContent(sampleTexts['1']))
        .finally(() => setLoadingTest(false));
    } else {
      setTestContent(sampleTexts[id || '1'] || sampleTexts['1']);
      setLoadingTest(false);
    }
  }, [id]);

  // Generate text based on mode
  const activeText = useMemo(() => {
    if (testMode === 'words') return getRandomWords(80);
    if (testMode === 'quote') return QUOTES[Math.floor(Math.random() * QUOTES.length)];
    return testContent.content;
  }, [testMode, testContent]);

  // Achievement keys that can be unlocked
  const [newUnlocks, setNewUnlocks] = useState<Array<{ icon: string; name: string; xp: number }>>([]);

  // Engine
  const engine = useTypingEngine(
    activeText,
    selectedDuration,
    'timed',
    (finalStats) => {
      // 1. Save to backend
      fetch('https://typingteacher-2lnd.onrender.com/test_sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_id: Number(id) || null,
          duration: finalStats.elapsedSeconds,
          gross_wpm: finalStats.wpm,
          net_wpm: finalStats.netWpm,
          errors: finalStats.errors,
          accuracy: finalStats.accuracy,
        }),
      }).catch(() => {});

      // 2. Save to localStorage for Dashboard
      const session = {
        netWpm: finalStats.netWpm,
        wpm: finalStats.wpm,
        accuracy: finalStats.accuracy,
        errors: finalStats.errors,
        cpm: finalStats.cpm,
        elapsedSeconds: finalStats.elapsedSeconds,
        mode: testMode,
        date: new Date().toISOString(),
      };
      try {
        const prev = JSON.parse(localStorage.getItem('typingHistory') || '[]');
        const updated = [...prev, session].slice(-100); // keep last 100
        localStorage.setItem('typingHistory', JSON.stringify(updated));

        // 3. Check for newly unlocked achievements
        const all = [...updated];
        const total = all.length;
        const bestWpm = Math.max(...all.map(s => s.netWpm || 0));
        const avgAcc = Math.round(all.reduce((a, s) => a + (s.accuracy || 0), 0) / all.length);
        const unlocks: Array<{ icon: string; name: string; xp: number }> = [];
        const prevKeys = JSON.parse(localStorage.getItem('achievementKeys') || '[]') as string[];
        const check = (key: string, cond: boolean, icon: string, name: string, xp: number) => {
          if (cond && !prevKeys.includes(key)) { unlocks.push({ icon, name, xp }); prevKeys.push(key); }
        };
        check('first_test', total >= 1, '🎯', 'First Steps', 25);
        check('wpm_30', bestWpm >= 30, '🔥', 'Warming Up', 50);
        check('wpm_50', bestWpm >= 50, '⚡', '50 WPM Club', 100);
        check('wpm_70', bestWpm >= 70, '🚀', '70 WPM Club', 150);
        check('wpm_100', bestWpm >= 100, '🏆', '100 WPM Legend', 300);
        check('acc_95', avgAcc >= 95, '🎯', 'Sharpshooter', 75);
        check('acc_100', finalStats.accuracy === 100, '💎', 'Perfect Accuracy', 200);
        check('tests_10', total >= 10, '📚', 'Dedicated', 100);
        check('tests_50', total >= 50, '💪', 'Power User', 250);
        check('speed_demon', finalStats.netWpm >= 80 && finalStats.accuracy >= 90, '👹', 'Speed Demon', 200);
        localStorage.setItem('achievementKeys', JSON.stringify(prevKeys));
        if (unlocks.length) setNewUnlocks(unlocks);
      } catch {}
    }
  );

  const { stats, userInput, mistakes, nextChar, pressedKey, processChar, processBackspace, handleMobileInput, reset } = engine;

  // Mobile hidden input
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [mobileVal, setMobileVal] = useState('');

  const onMobileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    handleMobileInput(newVal);
    setMobileVal(newVal);
  }, [handleMobileInput]);

  // Desktop keyboard listener
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (stats.isFinished) return;
    const ignored = ['Shift','Control','Alt','Meta','CapsLock','Tab','Escape','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12'];
    if (ignored.includes(e.key)) return;
    if (e.key === ' ') e.preventDefault();
    if (e.key === 'Backspace') processBackspace();
    else if (e.key.length === 1) processChar(e.key);
  }, [stats.isFinished, processChar, processBackspace]);

  useEffect(() => {
    if (!isMobile) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, isMobile]);

  // Auto-focus mobile input
  useEffect(() => {
    if (!loadingTest && isMobile) {
      setTimeout(() => hiddenInputRef.current?.focus(), 300);
    }
  }, [loadingTest, isMobile]);

  const activeFinger = useMemo(() => getFingerForKey(nextChar), [nextChar]);
  const formattedTime = `${Math.floor(stats.timeLeft / 60)}:${String(stats.timeLeft % 60).padStart(2, '0')}`;

  const handleReset = useCallback(() => {
    reset();
    setMobileVal('');
    if (isMobile) setTimeout(() => hiddenInputRef.current?.focus(), 100);
    if (testMode === 'words') {
      // Re-trigger words mode re-generation via key change in parent
      // For now words are stable — user clicks reset to get new set
    }
  }, [reset, isMobile, testMode]);

  if (loadingTest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-brand-muted text-sm font-medium">Loading test…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-[100dvh] bg-brand-bg text-brand-text flex flex-col overflow-hidden select-none"
      onClick={() => isMobile && hiddenInputRef.current?.focus()}
    >
      {/* Hidden mobile input */}
      {isMobile && (
        <input
          ref={hiddenInputRef}
          type="text"
          value={mobileVal}
          onChange={onMobileChange}
          className="fixed opacity-0 pointer-events-none w-1 h-1 top-0 left-0 z-[-1]"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
          aria-hidden="true"
          disabled={stats.isFinished}
        />
      )}

      {/* ── TOP BAR ─────────────────────────────────── */}
      <div className="shrink-0 bg-brand-surface border-b border-brand-border px-3 sm:px-6 h-14 flex items-center justify-between gap-3 z-40">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/tests" className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text transition-colors text-sm font-medium group shrink-0">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="h-5 w-px bg-brand-border hidden sm:block" />
          <div className="min-w-0 hidden sm:block">
            <h1 className="text-sm font-semibold text-brand-text truncate max-w-[200px]">{testContent.title}</h1>
          </div>
        </div>

        {/* Center: Mode + Duration selectors */}
        {!stats.isActive && !stats.isFinished && (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mode */}
            <div className="flex items-center gap-1 bg-brand-surface-2 rounded-lg p-0.5">
              {(['article', 'words', 'quote'] as TestMode[]).map(m => (
                <button
                  key={m}
                  onClick={(e) => { e.stopPropagation(); setTestMode(m); reset(); }}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all capitalize ${
                    testMode === m
                      ? 'bg-brand-surface shadow text-brand-text'
                      : 'text-brand-muted hover:text-brand-text'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Duration */}
            <div className="flex items-center gap-1 bg-brand-surface-2 rounded-lg p-0.5">
              {DURATION_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={(e) => { e.stopPropagation(); setSelectedDuration(opt.value); reset(); }}
                  className={`px-2 sm:px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    selectedDuration === opt.value
                      ? 'bg-brand-primary text-white shadow'
                      : 'text-brand-muted hover:text-brand-text'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Right: Stats */}
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          <div className="text-center">
            <div className="text-[9px] text-brand-muted uppercase tracking-widest font-semibold flex items-center gap-0.5 justify-center">
              <Clock className="w-2.5 h-2.5" />
              <span className="hidden sm:inline">Time</span>
            </div>
            <div className={`text-sm sm:text-base font-black tabular-nums font-mono ${stats.timeLeft <= 10 && stats.isActive ? 'text-rose-500' : 'text-brand-text'}`}>
              {formattedTime}
            </div>
          </div>

          <div className="text-center">
            <div className="text-[9px] text-brand-muted uppercase tracking-widest font-semibold flex items-center gap-0.5 justify-center">
              <Zap className="w-2.5 h-2.5" />
              WPM
            </div>
            <div className="text-sm sm:text-base font-black tabular-nums text-brand-primary font-mono">{stats.netWpm}</div>
          </div>

          <div className="text-center hidden sm:block">
            <div className="text-[9px] text-brand-muted uppercase tracking-widest font-semibold flex items-center gap-0.5 justify-center">
              <Target className="w-2.5 h-2.5" />
              Acc
            </div>
            <div className={`text-sm sm:text-base font-black tabular-nums font-mono ${stats.accuracy >= 90 ? 'text-brand-accent' : 'text-rose-500'}`}>
              {stats.accuracy}%
            </div>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); handleReset(); }}
            className="flex items-center gap-1.5 bg-brand-surface-2 hover:bg-brand-border text-brand-muted hover:text-brand-text px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border border-brand-border"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restart</span>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="shrink-0 h-0.5 bg-brand-border">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary"
          animate={{ width: `${stats.progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* ── MAIN CONTENT ────────────────────────────── */}
      <div className="flex-grow flex flex-col items-center justify-start gap-4 px-3 sm:px-6 py-4 sm:py-6 overflow-hidden">

        {/* Mobile: tap to start */}
        {isMobile && !stats.isActive && !stats.isFinished && (
          <div
            onClick={() => hiddenInputRef.current?.focus()}
            className="w-full max-w-2xl bg-brand-primary/10 border border-brand-primary/20 rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer"
          >
            <span className="text-2xl">⌨️</span>
            <div>
              <p className="text-sm font-bold text-brand-primary">Tap here to start typing</p>
              <p className="text-xs text-brand-muted">Your keyboard will appear</p>
            </div>
          </div>
        )}

        {/* ── TYPING DISPLAY ── */}
        <div className="w-full max-w-2xl">
          <div
            className="relative bg-brand-surface border border-brand-border rounded-2xl px-4 sm:px-8 py-5 shadow-sm cursor-text overflow-hidden"
            onClick={() => isMobile && hiddenInputRef.current?.focus()}
          >
            {/* Subtle top glow when active */}
            {stats.isActive && (
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent" />
            )}

            {/* Text display */}
            <div
              className="text-lg sm:text-xl font-mono tracking-wide leading-relaxed break-words overflow-y-auto"
              style={{ maxHeight: isMobile ? '120px' : '160px' }}
            >
              {activeText.split('').map((char, index) => {
                const isCorrect = index < userInput.length && !mistakes.has(index);
                const isError = index < userInput.length && mistakes.has(index);
                const isCurrent = index === userInput.length;
                const isUpcoming = index > userInput.length;

                return (
                  <span key={index} className="relative">
                    {/* Blinking caret before current char */}
                    {isCurrent && (
                      <span className="typing-caret" aria-hidden="true" />
                    )}
                    <span
                      id={isCurrent ? 'current-char' : undefined}
                      className={`transition-colors duration-75 ${
                        isCorrect ? 'typing-correct' :
                        isError ? 'typing-error' :
                        isCurrent ? 'typing-current' :
                        'typing-upcoming'
                      }`}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  </span>
                );
              })}
            </div>

            {/* Start overlay */}
            <AnimatePresence>
              {!stats.isActive && !stats.isFinished && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-brand-surface/90 backdrop-blur-sm rounded-2xl"
                >
                  <div className="text-center px-6">
                    <div className="text-4xl mb-3">{isMobile ? '📱' : '⚡'}</div>
                    <p className="text-brand-text-muted font-semibold text-base">
                      {isMobile ? 'Tap anywhere & type to begin' : 'Start typing to begin your test'}
                    </p>
                    <p className="text-brand-muted text-xs mt-1">Timer starts with your first keystroke</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Live CPM stat under the box */}
          {stats.isActive && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mt-2 px-1 text-xs text-brand-muted font-mono"
            >
              <span className="flex items-center gap-1"><Activity className="w-3 h-3" />{stats.cpm} CPM</span>
              <span className="text-brand-border">·</span>
              <span>{stats.errors} errors</span>
              <span className="text-brand-border">·</span>
              <span>{stats.progress}% done</span>
            </motion.div>
          )}
        </div>

        {/* ── KEYBOARD + HANDS (desktop only) ── */}
        {!isMobile && (
          <div className="w-full flex justify-center items-end gap-1 transform scale-[0.55] sm:scale-[0.7] lg:scale-[0.82] origin-top transition-transform">
            <div className="hidden md:block pb-2">
              <HandGuide
                hand="left"
                activeFinger={activeFinger.startsWith('left') || activeFinger === 'thumb' ? activeFinger : ''}
                status={activeFinger.startsWith('left') || activeFinger === 'thumb' ? (mistakes.has(userInput.length - 1) ? 'error' : stats.isActive ? 'correct' : 'none') : 'none'}
              />
            </div>
            <div className="z-10">
              <VirtualKeyboard activeKey={nextChar} pressedKeys={new Set([pressedKey])} />
            </div>
            <div className="hidden md:block pb-2">
              <HandGuide
                hand="right"
                activeFinger={activeFinger.startsWith('right') ? activeFinger : ''}
                status={activeFinger.startsWith('right') ? (mistakes.has(userInput.length - 1) ? 'error' : stats.isActive ? 'correct' : 'none') : 'none'}
              />
            </div>
          </div>
        )}

        {/* Mobile: next key hint */}
        {isMobile && nextChar && stats.isActive && (
          <div className="flex items-center gap-3 bg-brand-surface border border-brand-border rounded-xl px-5 py-2.5 shadow-sm">
            <span className="text-xs text-brand-muted">Next:</span>
            <kbd className="bg-brand-primary text-white font-black px-3 py-1 rounded-lg text-lg min-w-[40px] text-center font-mono">
              {nextChar === ' ' ? '⎵' : nextChar.toUpperCase()}
            </kbd>
            <span className="text-xs text-brand-muted">{activeFinger.replace('left-', 'L ').replace('right-', 'R ').replace('-', ' ')}</span>
          </div>
        )}

        {/* Finish early */}
        {!stats.isFinished && stats.isActive && (
          <button
            onClick={(e) => { e.stopPropagation(); engine.reset(); /* actually finish */ }}
            className="flex items-center gap-2 bg-brand-surface/80 hover:bg-rose-50 dark:hover:bg-rose-900/20 border border-brand-border hover:border-rose-300 text-brand-muted hover:text-rose-500 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all"
          >
            Finish Early
          </button>
        )}
      </div>

      {/* ── RESULT MODAL ── */}
      <AnimatePresence>
        {stats.isFinished && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-brand-surface border border-brand-border rounded-3xl p-7 sm:p-10 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="text-5xl mb-4">
                {stats.accuracy >= 95 ? '🏆' : stats.accuracy >= 80 ? '🎉' : '💪'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-brand-text mb-1">Test Complete!</h2>
              <p className="text-brand-muted text-sm mb-7">
                {stats.netWpm >= 80 ? "Blazing fast! You're in the top tier." :
                 stats.netWpm >= 50 ? "Great speed! Keep practicing to push further." :
                 "Good effort! Consistent practice builds speed."}
              </p>

              <div className="grid grid-cols-3 gap-3 mb-7">
                <div className="bg-brand-surface-2 border border-brand-border p-4 rounded-2xl">
                  <div className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mb-1">Gross</div>
                  <div className="text-2xl font-black text-brand-text font-mono">{stats.wpm}</div>
                  <div className="text-[10px] text-brand-muted">WPM</div>
                </div>
                <div className="bg-brand-primary/10 border border-brand-primary/20 p-4 rounded-2xl">
                  <div className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-1">Net</div>
                  <div className="text-2xl font-black text-brand-primary font-mono">{stats.netWpm}</div>
                  <div className="text-[10px] text-brand-primary/70">WPM</div>
                </div>
                <div className={`p-4 rounded-2xl border ${stats.accuracy >= 90 ? 'bg-brand-accent/10 border-brand-accent/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                  <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${stats.accuracy >= 90 ? 'text-brand-accent' : 'text-rose-500'}`}>Acc</div>
                  <div className={`text-2xl font-black font-mono ${stats.accuracy >= 90 ? 'text-brand-accent' : 'text-rose-500'}`}>{stats.accuracy}%</div>
                  <div className={`text-[10px] ${stats.accuracy >= 90 ? 'text-brand-accent/70' : 'text-rose-400'}`}>{stats.errors} err</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-brand-muted mb-6">
                <div className="bg-brand-surface-2 rounded-xl px-3 py-2 flex justify-between items-center">
                  <span>CPM</span>
                  <span className="font-mono font-semibold text-brand-text">{stats.cpm}</span>
                </div>
                <div className="bg-brand-surface-2 rounded-xl px-3 py-2 flex justify-between items-center">
                  <span>Time</span>
                  <span className="font-mono font-semibold text-brand-text">{stats.elapsedSeconds}s</span>
                </div>
              </div>

                {/* Achievement unlocks */}
                <AnimatePresence>
                  {newUnlocks.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-5 space-y-2"
                    >
                      {newUnlocks.map((u, i) => (
                        <motion.div
                          key={u.name}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.15 }}
                          className="flex items-center gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl px-3 py-2 text-left"
                        >
                          <span className="text-2xl">{u.icon}</span>
                          <div className="flex-1">
                            <div className="text-xs font-bold text-amber-700 dark:text-amber-400">Achievement Unlocked!</div>
                            <div className="text-sm font-semibold text-brand-text">{u.name}</div>
                          </div>
                          <span className="text-xs font-bold text-amber-600 dark:text-amber-500">+{u.xp} XP</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 bg-brand-surface-2 hover:bg-brand-border text-brand-text py-3 rounded-xl font-bold text-sm transition-all border border-brand-border flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" /> Try Again
                </button>
                <Link
                  to="/tests"
                  className="flex-1 bg-brand-primary hover:bg-brand-secondary text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-brand-primary/20 transition-all text-center"
                >
                  More Tests
                </Link>
              </div>
              <Link
                to={`/certificate?wpm=${stats.netWpm}&acc=${stats.accuracy}&title=${encodeURIComponent(testContent.title)}`}
                className="mt-2 w-full flex items-center justify-center gap-2 text-brand-muted hover:text-brand-primary text-sm font-semibold transition-colors"
              >
                <Award className="w-4 h-4" /> Get Certificate
              </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
