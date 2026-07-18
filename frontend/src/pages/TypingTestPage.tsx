import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { RotateCcw, ChevronLeft, Zap, Target, Clock, Activity, Award, Volume2, VolumeX, Minus, Plus, Contrast } from 'lucide-react';
import CharSpan from '../components/CharSpan';
import SignupPromptBanner from '../components/SignupPromptBanner';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useTypingA11yPrefs } from '../hooks/useTypingA11yPrefs';

import { API_URL as BASE_URL, saveSession, fetchMistakeHandlingMode } from '../lib/api';
const API_URL = `${BASE_URL}/api/tests`;

// Duration options
const DURATION_OPTIONS = [
  { label: '15s', value: 15 },
  { label: '30s', value: 30 },
  { label: '1 min', value: 60 },
  { label: '2 min', value: 120 },
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
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
  // Optional AI-tutor practice passage, handed off via sessionStorage (?practice=1).
  const practiceText = searchParams.get('practice')
    ? (typeof window !== 'undefined' ? sessionStorage.getItem('ftl_practice_text') : null)
    : null;

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
  const [testContent, setTestContent] = useState<{ title: string; content: string; keyboardLayout?: string | null; displayContent?: string | null }>(
    practiceText
      ? { title: 'AI Practice Passage', content: practiceText }
      : { title: sampleTexts['1'].title, content: sampleTexts['1'].content }
  );
  const [loadingTest, setLoadingTest] = useState(!!id && !sampleTexts[id || ''] && !practiceText);
  const [testMode, setTestMode] = useState<TestMode>('article');
  const [selectedDuration, setSelectedDuration] = useState(() => {
    const qd = queryDuration ? parseInt(queryDuration) : NaN;
    const rd = duration ? parseInt(duration) * 60 : NaN;
    return !isNaN(qd) ? qd : !isNaN(rd) ? rd : 60;
  });

  // Fetch article test from backend
  useEffect(() => {
    if (practiceText) {
      setTestContent({ title: 'AI Practice Passage', content: practiceText });
      setLoadingTest(false);
      return;
    }
    if (id && !sampleTexts[id]) {
      setLoadingTest(true);
      fetch(`${API_URL}/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data?.content) setTestContent({ title: data.title, content: data.content, keyboardLayout: data.keyboard_layout, displayContent: data.display_content });
          else setTestContent(sampleTexts['1']);
        })
        .catch(() => setTestContent(sampleTexts['1']))
        .finally(() => setLoadingTest(false));
    } else {
      setTestContent(sampleTexts[id || '1'] || sampleTexts['1']);
      setLoadingTest(false);
    }
  }, [id, practiceText]);

  // Generate text based on mode
  const activeText = useMemo(() => {
    if (testMode === 'words') return getRandomWords(80);
    if (testMode === 'quote') return QUOTES[Math.floor(Math.random() * QUOTES.length)];
    return testContent.content;
  }, [testMode, testContent]);

  // Accessibility & sound preferences
  const sound = useSoundEffects();
  const prefersReducedMotion = useReducedMotion();
  const a11y = useTypingA11yPrefs();
  const [srAnnouncement, setSrAnnouncement] = useState('');

  // Admin-configurable mistake handling — defaults to lenient (existing
  // behavior) until the setting loads, so there's no behavior flash.
  const [strictMode, setStrictMode] = useState(false);
  useEffect(() => {
    fetchMistakeHandlingMode().then(mode => setStrictMode(mode === 'strict'));
  }, []);

  // Achievement keys that can be unlocked
  const [newUnlocks, setNewUnlocks] = useState<Array<{ icon: string; name: string; xp: number }>>([]);
  // Anti-cheat
  const [cheatWarning, setCheatWarning] = useState<string | null>(null);
  const showCheat = (msg: string) => { setCheatWarning(msg); setTimeout(() => setCheatWarning(null), 4000); };

  // Detect paste
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      showCheat('⚠️ Paste detected! Test invalidated. Type manually to get a fair score.');
      reset();
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, []);

  // Engine
  const engine = useTypingEngine(
    activeText,
    selectedDuration,
    'timed',
    (finalStats) => {
      sound.playComplete();
      setSrAnnouncement(`Test complete. Net speed ${finalStats.netWpm} words per minute, accuracy ${finalStats.accuracy} percent, ${finalStats.errors} errors.`);

      // 1. Save to backend
      saveSession({
        test_id: Number(id) || null,
        duration: finalStats.elapsedSeconds,
        gross_wpm: finalStats.wpm,
        net_wpm: finalStats.netWpm,
        errors: finalStats.errors,
        accuracy: finalStats.accuracy,
      });

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
    },
    strictMode
  );

  const { stats, userInput, mistakes, processChar, processBackspace, handleMobileInput, reset, rejectedFlash, history } = engine;

  // Brief shake on the typing display when strict mode rejects a keystroke
  const [shake, setShake] = useState(false);
  useEffect(() => {
    if (rejectedFlash === 0) return;
    setShake(true);
    const t = setTimeout(() => setShake(false), 250);
    return () => clearTimeout(t);
  }, [rejectedFlash]);

  // Mobile hidden input
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [mobileVal, setMobileVal] = useState('');

  const onMobileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    if (newVal.length > mobileVal.length) {
      const added = newVal.slice(mobileVal.length);
      for (let i = 0; i < added.length; i++) {
        const expected = activeText[userInput.length + i];
        if (added[i] === expected) sound.playKey(); else sound.playError();
      }
    } else {
      sound.playKey();
    }
    handleMobileInput(newVal);
    setMobileVal(newVal);
  }, [handleMobileInput, mobileVal, activeText, userInput.length, sound]);

  // Desktop keyboard listener
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (stats.isFinished) return;
    const ignored = ['Shift','Control','Alt','Meta','CapsLock','Tab','Escape','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12'];
    if (ignored.includes(e.key)) return;
    if (e.key === ' ') e.preventDefault();
    if (e.key === 'Backspace') { sound.playKey(); processBackspace(); }
    else if (e.key.length === 1) {
      if (e.key === activeText[userInput.length]) sound.playKey(); else sound.playError();
      processChar(e.key);
    }
  }, [stats.isFinished, processChar, processBackspace, sound, activeText, userInput.length]);

  useEffect(() => {
    if (!isMobile) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, isMobile]);

  // Announce test start for screen readers (completion is announced via onFinish above)
  useEffect(() => {
    if (stats.isActive) setSrAnnouncement('Test started. Timer is running.');
  }, [stats.isActive]);

  // Auto-focus mobile input
  useEffect(() => {
    if (!loadingTest && isMobile) {
      setTimeout(() => hiddenInputRef.current?.focus(), 300);
    }
  }, [loadingTest, isMobile]);

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
      className={`h-[100dvh] bg-brand-bg text-brand-text flex flex-col overflow-hidden select-none ${a11y.highContrast ? 'typing-high-contrast' : ''}`}
      onClick={() => isMobile && hiddenInputRef.current?.focus()}
    >
      {/* Screen-reader only live region — announces test start/finish without affecting sighted UI */}
      <div role="status" aria-live="polite" className="sr-only">{srAnnouncement}</div>

      {/* Anti-cheat warning */}
      {cheatWarning && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-5 py-2.5 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-2 ${prefersReducedMotion ? '' : 'animate-bounce'}`}>
          {cheatWarning}
        </div>
      )}

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
          {strictMode && (
            <span
              title="Wrong keystrokes are rejected until corrected — set by the site admin"
              className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg shrink-0 bg-rose-500/10 text-rose-500 border border-rose-500/20"
            >
              Strict
            </span>
          )}
        </div>

        {/* Center: live label when active, empty when setup */}
        {stats.isActive && (
          <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg"
            style={{ background: 'rgba(48,76,83,0.12)', color: 'var(--brand-primary)' }}>
            LIVE
          </span>
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
          className="h-full"
          style={{ background: 'linear-gradient(90deg, #304C53, #2A9DAE)' }}
          animate={{ width: `${stats.progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* ── MAIN CONTENT ────────────────────────────── */}
      <div className="flex-grow flex flex-col items-center justify-start gap-4 px-3 sm:px-6 py-4 sm:py-6 overflow-y-auto">

        {/* ── CARD SETUP PANEL (pre-test) ── */}
        <AnimatePresence>
          {!stats.isActive && !stats.isFinished && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Mode row */}
              <div className="mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted mb-2 px-1">Mode</p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: 'article', label: 'Article', icon: '📄', desc: 'Real passages' },
                    { id: 'words',   label: 'Words',   icon: '🔤', desc: 'Random words' },
                    { id: 'quote',   label: 'Quote',   icon: '💬', desc: 'Inspirational' },
                  ] as { id: TestMode; label: string; icon: string; desc: string }[]).map(m => (
                    <button key={m.id}
                      onClick={() => { setTestMode(m.id); reset(); }}
                      className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border font-semibold transition-all duration-200 text-center ${
                        testMode === m.id
                          ? 'text-white border-transparent shadow-lg scale-[1.02]'
                          : 'bg-brand-surface border-brand-border text-brand-muted hover:border-brand-primary/40 hover:text-brand-text'
                      }`}
                      style={testMode === m.id ? { background: 'linear-gradient(135deg,#304C53,#2A9DAE)', boxShadow: '0 4px 14px rgba(48,76,83,.3)' } : {}}>
                      <span className="text-xl">{m.icon}</span>
                      <span className="text-xs font-bold">{m.label}</span>
                      <span className={`text-[10px] ${testMode === m.id ? 'text-white/70' : 'text-brand-muted'}`}>{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration row */}
              <div className="mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted mb-2 px-1">Duration</p>
                <div className="grid grid-cols-6 gap-2">
                  {DURATION_OPTIONS.map(opt => (
                    <button key={opt.value}
                      onClick={() => { setSelectedDuration(opt.value); reset(); }}
                      className={`flex flex-col items-center gap-0.5 py-2.5 rounded-xl border font-bold text-sm transition-all duration-200 ${
                        selectedDuration === opt.value
                          ? 'text-white border-transparent shadow-lg scale-[1.02]'
                          : 'bg-brand-surface border-brand-border text-brand-muted hover:border-brand-primary/40 hover:text-brand-text'
                      }`}
                      style={selectedDuration === opt.value ? { background: 'linear-gradient(135deg,#BC6C50,#CC7B5D)', boxShadow: '0 4px 14px rgba(188,108,80,.3)' } : {}}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accessibility row */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <button
                  onClick={sound.toggle}
                  aria-pressed={sound.enabled}
                  aria-label={sound.enabled ? 'Disable sound effects' : 'Enable sound effects'}
                  title={sound.enabled ? 'Sound on' : 'Sound off'}
                  className="flex items-center gap-1.5 bg-brand-surface border border-brand-border hover:border-brand-primary/40 text-brand-muted hover:text-brand-text px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  {sound.enabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
                <div className="flex items-center bg-brand-surface border border-brand-border rounded-lg overflow-hidden">
                  <button
                    onClick={a11y.decreaseFontSize}
                    disabled={!a11y.canDecreaseFontSize}
                    aria-label="Decrease typing text font size"
                    className="px-2 py-1.5 text-brand-muted hover:text-brand-text disabled:opacity-30 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-bold text-brand-muted px-1 tabular-nums" aria-hidden="true">{a11y.fontSize}px</span>
                  <button
                    onClick={a11y.increaseFontSize}
                    disabled={!a11y.canIncreaseFontSize}
                    aria-label="Increase typing text font size"
                    className="px-2 py-1.5 text-brand-muted hover:text-brand-text disabled:opacity-30 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={a11y.toggleHighContrast}
                  aria-pressed={a11y.highContrast}
                  aria-label={a11y.highContrast ? 'Disable high contrast mode' : 'Enable high contrast mode'}
                  title="High contrast"
                  className={`flex items-center gap-1.5 border px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    a11y.highContrast
                      ? 'bg-brand-primary text-white border-transparent'
                      : 'bg-brand-surface border-brand-border text-brand-muted hover:border-brand-primary/40 hover:text-brand-text'
                  }`}
                >
                  <Contrast className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Start hint */}
              <div className="flex items-center justify-between px-1">
                <p className="text-xs text-brand-muted flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse inline-block" />
                  {isMobile ? 'Tap the text area below to start' : 'Start typing below — timer begins on first keystroke'}
                </p>
                {isMobile && (
                  <button onClick={() => hiddenInputRef.current?.focus()}
                    className="text-xs font-bold text-white px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>
                    Tap to type
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TYPING DISPLAY ── */}
        <div className="w-full max-w-2xl">
          {testMode === 'article' && testContent.keyboardLayout === 'kruti_dev' && testContent.displayContent && (
            <div className="mb-3 bg-brand-surface-2 border border-brand-border rounded-2xl px-4 sm:px-8 py-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted mb-2">Preview (how this looks in Kruti Dev font)</p>
              <p className="text-base sm:text-lg leading-relaxed text-brand-text-muted line-clamp-3" style={{ fontFamily: 'serif' }}>
                {testContent.displayContent}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-muted mt-3 mb-0">Kruti Dev keystrokes (type this)</p>
            </div>
          )}
          <div
            className={`relative bg-brand-surface border border-brand-border rounded-2xl px-4 sm:px-8 py-5 shadow-sm cursor-text overflow-hidden ${shake && !prefersReducedMotion ? 'animate-error-shake' : ''}`}
            onClick={() => isMobile && hiddenInputRef.current?.focus()}
          >
            {/* Subtle top glow when active */}
            {stats.isActive && (
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent" />
            )}

            {/* Text display */}
            <div
              className="font-mono tracking-wide leading-relaxed break-words overflow-y-auto"
              style={{ maxHeight: isMobile ? '120px' : '160px', fontSize: `${a11y.fontSize}px` }}
            >
              {activeText.split('').map((char, index) => (
                <CharSpan
                  key={index}
                  char={char}
                  isCorrect={index < userInput.length && !mistakes.has(index)}
                  isError={index < userInput.length && mistakes.has(index)}
                  isCurrent={index === userInput.length}
                />
              ))}
            </div>

            {/* Caret hint when idle */}
            {!stats.isActive && !stats.isFinished && (
              <div className="absolute bottom-3 right-4 flex items-center gap-1.5 text-[10px] text-brand-muted/60 font-mono pointer-events-none select-none">
                <span className="typing-caret h-3 w-0.5" /> type to begin
              </div>
            )}
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

        {/* Finish early */}
        {!stats.isFinished && stats.isActive && (
          <button
            onClick={(e) => { e.stopPropagation(); engine.finish(); }}
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
              initial={prefersReducedMotion ? { opacity: 0 } : { scale: 0.9, y: 20, opacity: 0 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { scale: 1, y: 0, opacity: 1 }}
              transition={prefersReducedMotion ? { duration: 0.15 } : { type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-brand-surface border border-brand-border rounded-3xl p-7 sm:p-10 max-w-sm sm:max-w-md w-full text-center shadow-2xl max-h-[90vh] overflow-y-auto"
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

              {/* Speed & accuracy over time */}
              {history.length >= 2 && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-brand-surface-2 border border-brand-border rounded-xl p-2">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-brand-muted mb-1 text-left px-1">Speed (WPM)</p>
                    <ResponsiveContainer width="100%" height={70}>
                      <AreaChart data={history}>
                        <defs>
                          <linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2A9DAE" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#2A9DAE" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="t" hide />
                        <YAxis hide domain={[0, 'auto']} />
                        <Tooltip
                          formatter={(v: any) => [`${v} WPM`, '']}
                          labelFormatter={(t: any) => `${t}s`}
                          contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--brand-border)' }}
                        />
                        <Area type="monotone" dataKey="wpm" stroke="#2A9DAE" strokeWidth={2} fill="url(#wpmGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="bg-brand-surface-2 border border-brand-border rounded-xl p-2">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-brand-muted mb-1 text-left px-1">Accuracy (%)</p>
                    <ResponsiveContainer width="100%" height={70}>
                      <AreaChart data={history}>
                        <defs>
                          <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#BC6C50" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#BC6C50" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="t" hide />
                        <YAxis hide domain={[0, 100]} />
                        <Tooltip
                          formatter={(v: any) => [`${v}%`, '']}
                          labelFormatter={(t: any) => `${t}s`}
                          contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid var(--brand-border)' }}
                        />
                        <Area type="monotone" dataKey="accuracy" stroke="#BC6C50" strokeWidth={2} fill="url(#accGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

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
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-white text-center transition-all hover:opacity-90 active:scale-95"
                  style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)', boxShadow: '0 4px 14px rgba(48,76,83,.25)' }}
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
              <div className="mt-4">
                <SignupPromptBanner
                  dismissKey="signupPromptResult"
                  message="Save this result! 🚀 Create a free account to track your progress, keep your streak, and unlock the AI tutor."
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
