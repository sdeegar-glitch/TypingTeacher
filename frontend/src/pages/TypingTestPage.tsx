import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, ChevronLeft, Zap, Target, Clock, Activity, Volume2, VolumeX, Minus, Plus, Contrast, Keyboard as KeyboardIcon, Hand, Maximize, Minimize, RefreshCw, Eye, EyeOff, Download } from 'lucide-react';
import VirtualKeyboard from '../components/VirtualKeyboard';
import HandGuide from '../components/HandGuide';
import { getFingerForKey } from '../utils/KeyboardLayout';
import { INSCRIPT_FULL_MAP } from '../data/hindiCourseData';
import ResultsPopup from '../components/results/ResultsPopup';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useTypingA11yPrefs } from '../hooks/useTypingA11yPrefs';

import { saveSession, fetchMistakeHandlingMode, fetchTestBySlug, fetchTestList } from '../lib/api';
import { markTestCompleted } from '../lib/testProgress';
import { storeTypingResult } from '../lib/typingResult';
import Seo from '../components/Seo';
import RelatedLinks from '../components/RelatedLinks';

// Splits text into space-delimited word ranges for word-level typing feedback.
interface WordRange { start: number; end: number; text: string }
function splitWords(text: string): WordRange[] {
  const words: WordRange[] = [];
  let i = 0;
  while (i < text.length) {
    while (i < text.length && text[i] === ' ') i++;
    const start = i;
    while (i < text.length && text[i] !== ' ') i++;
    if (i > start) words.push({ start, end: i, text: text.slice(start, i) });
  }
  return words;
}
type WordStatus = 'pending' | 'current' | 'correct' | 'wrong';
function getWordStatus(w: WordRange, typedLen: number, mistakes: Set<number>, skipped: Set<number>): WordStatus {
  if (typedLen <= w.start) return 'pending';
  const typedEnd = Math.min(w.end, typedLen);
  let hasError = false;
  for (let idx = w.start; idx < typedEnd; idx++) {
    if (mistakes.has(idx) || skipped.has(idx)) { hasError = true; break; }
  }
  if (typedLen < w.end) return hasError ? 'wrong' : 'current';
  return hasError ? 'wrong' : 'correct';
}

// Devanagari char -> physical QWERTY key, inverted from the INSCRIPT layout map,
// so the on-screen keyboard can highlight the right key during Mangal tests.
// (English and Kruti Dev tests type raw ASCII, which matches key labels directly.)
const INSCRIPT_CHAR_TO_KEY: Record<string, string> = Object.entries(INSCRIPT_FULL_MAP).reduce(
  (acc, [key, ch]) => { if (!(ch in acc)) acc[ch] = key; return acc; },
  {} as Record<string, string>
);

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
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const queryDuration = searchParams.get('duration');
  // Optional AI-tutor practice passage, handed off via sessionStorage (?practice=1).
  const practiceText = searchParams.get('practice')
    ? (typeof window !== 'undefined' ? sessionStorage.getItem('ftl_practice_text') : null)
    : null;

  // ── Challenge link (?cw=52&ca=96&cn=Dev) ──
  // Every value here comes from a URL a stranger may have crafted, so clamp the
  // numbers and hard-limit the name. React escapes on render, so the name is
  // safe as text — we only strip angle brackets and cap the length so it can't
  // be used to smuggle markup-looking noise or blow out the layout.
  const challenge = useMemo(() => {
    const rawWpm = Number(searchParams.get('cw'));
    if (!Number.isFinite(rawWpm) || rawWpm <= 0) return null;
    const rawAcc = Number(searchParams.get('ca'));
    const rawName = (searchParams.get('cn') || '').replace(/[<>]/g, '').trim().slice(0, 20);
    return {
      wpm: Math.min(400, Math.round(rawWpm)),
      accuracy: Number.isFinite(rawAcc) ? Math.min(100, Math.max(0, Math.round(rawAcc))) : null,
      name: rawName || 'A friend',
    };
    // location.search is the real dependency; searchParams is derived from it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

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
  const [testContent, setTestContent] = useState<{ title: string; content: string; keyboardLayout?: string | null; displayContent?: string | null; testId?: number | null; excerpt?: string | null }>(
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
      fetchTestBySlug(id)
        .then(data => {
          if (data?.content) setTestContent({ title: data.title, content: data.content, keyboardLayout: data.keyboard_layout, displayContent: data.display_content, testId: Number(data.id) || null, excerpt: data.excerpt || null });
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
      markTestCompleted(id); // mark this passage "done" for the tests list
      setSrAnnouncement(`Test complete. Net speed ${finalStats.netWpm} words per minute, accuracy ${finalStats.accuracy} percent, ${finalStats.errors} errors.`);

      // 1. Save to backend
      saveSession({
        test_id: testContent.testId ?? null,
        duration: finalStats.elapsedSeconds,
        gross_wpm: finalStats.wpm,
        net_wpm: finalStats.netWpm,
        errors: finalStats.errors,
        accuracy: finalStats.accuracy,
        key_stats: engine.getKeyStats(),
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

  const { stats, userInput, mistakes, skipped, processChar, processBackspace, handleMobileInput, reset, rejectedFlash, history, nextChar } = engine;

  // Word ranges for the current passage, reused by both the passage box and
  // the typed-preview line below it (word-level, not character-level, feedback).
  const wordRanges = useMemo(() => splitWords(activeText), [activeText]);

  // ── On-screen keyboard + hands guide (Phase-1 interface upgrade) ──
  const [showKeyboard, setShowKeyboard] = useState(() => {
    try { return localStorage.getItem('ftl_showKeyboard') !== '0'; } catch { return true; }
  });
  const [showHands, setShowHands] = useState(() => {
    try { return localStorage.getItem('ftl_showHands') === '1'; } catch { return false; }
  });
  const toggleKeyboard = useCallback(() => setShowKeyboard(v => {
    try { localStorage.setItem('ftl_showKeyboard', v ? '0' : '1'); } catch {}
    return !v;
  }), []);
  const toggleHands = useCallback(() => setShowHands(v => {
    try { localStorage.setItem('ftl_showHands', v ? '0' : '1'); } catch {}
    return !v;
  }), []);

  // ── Live engine display prefs (Highlight / Indicator / Backspace mode) ──
  const [showPassage, setShowPassage] = useState(true);
  const [highlightOn, setHighlightOn] = useState(() => {
    try { return localStorage.getItem('ftl_highlight') !== '0'; } catch { return true; }
  });
  const [indicatorOn, setIndicatorOn] = useState(() => {
    try { return localStorage.getItem('ftl_indicator') !== '0'; } catch { return true; }
  });
  const [backspaceMode, setBackspaceMode] = useState<'full' | 'word' | 'off'>(() => {
    try { return (localStorage.getItem('ftl_bsmode') as 'full' | 'word' | 'off') || 'full'; } catch { return 'full'; }
  });
  useEffect(() => { try { localStorage.setItem('ftl_highlight', highlightOn ? '1' : '0'); } catch {} }, [highlightOn]);
  useEffect(() => { try { localStorage.setItem('ftl_indicator', indicatorOn ? '1' : '0'); } catch {} }, [indicatorOn]);
  useEffect(() => { try { localStorage.setItem('ftl_bsmode', backspaceMode); } catch {} }, [backspaceMode]);

  // Delete/Backspace keystroke counters — live-view only, not persisted to the report.
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [deleteCount, setDeleteCount] = useState(0);

  // Whether a backspace/delete is allowed right now, given the current mode
  // and how much has been typed so far.
  const canDeleteNow = useCallback((currentInput: string) => {
    if (backspaceMode === 'off') return false;
    if (backspaceMode === 'word') {
      if (currentInput.length === 0) return false;
      if (currentInput[currentInput.length - 1] === ' ') return false;
    }
    return true;
  }, [backspaceMode]);

  // "Change" — jump to a different passage at the same duration.
  const [testPool, setTestPool] = useState<string[]>([]);
  useEffect(() => {
    fetchTestList().then(list => {
      const slugs = (list || []).map((t: any) => t.slug || t.id).filter(Boolean);
      setTestPool(slugs);
    }).catch(() => {});
  }, []);
  const handleChangePassage = useCallback(() => {
    const others = testPool.filter(slug => String(slug) !== String(id));
    if (others.length === 0) return;
    const next = others[Math.floor(Math.random() * others.length)];
    navigate(`/tests/${next}?duration=${selectedDuration}`);
  }, [testPool, id, selectedDuration, navigate]);

  // "Download" — save the current passage as a plain-text file.
  const handleDownloadPassage = useCallback(() => {
    const blob = new Blob([testContent.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${testContent.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'passage'}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [testContent]);

  const greetingName = useMemo(() => {
    try {
      const raw = (localStorage.getItem('ftl_user_name') || '').trim().split(/\s+/)[0];
      return raw || '';
    } catch { return ''; }
  }, []);

  // Which physical key to highlight: ASCII passes straight through (English +
  // Kruti Dev keystroke text); Devanagari (Mangal) maps via the INSCRIPT table.
  const keyboardActiveKey = useMemo(() => {
    const ch = nextChar || '';
    if (!ch) return '';
    if (/^[\x20-\x7e]$/.test(ch)) return ch;
    return INSCRIPT_CHAR_TO_KEY[ch] || '';
  }, [nextChar]);
  const activeFinger = useMemo(
    () => (keyboardActiveKey ? getFingerForKey(keyboardActiveKey) : '' as const),
    [keyboardActiveKey]
  );

  // ── Fullscreen / focus mode ──
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  }, []);
  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  // ── Results extras ──
  // Consistency = how steady the WPM stayed (100 - coefficient of variation).
  // Kept as a single derived number (not the full `history` array) for the
  // /results handoff — the per-second sparkline charts that also used
  // `history` were cut from this flow, so there's no reason to persist more
  // than the one number they'd have needed.
  const consistency = useMemo(() => {
    if (!stats.isFinished || history.length < 3) return null;
    const samples = history.slice(1).map((h: any) => h.wpm).filter((w: number) => w > 0);
    if (samples.length < 2) return null;
    const mean = samples.reduce((a: number, b: number) => a + b, 0) / samples.length;
    if (mean <= 0) return null;
    const variance = samples.reduce((a: number, b: number) => a + (b - mean) ** 2, 0) / samples.length;
    return Math.max(0, Math.min(100, Math.round(100 - (Math.sqrt(variance) / mean) * 100)));
  }, [stats.isFinished, history]);

  // Build a link that reopens THIS passage at THIS duration, carrying the
  // score to beat. The friend types the identical text, so the comparison is
  // fair — no backend needed, the whole challenge rides in the URL. Used by
  // both the short popup and the /results report's share buttons.
  const buildChallengeUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set('duration', String(selectedDuration));
    params.set('cw', String(stats.netWpm));
    params.set('ca', String(stats.accuracy));
    const myName = (localStorage.getItem('ftl_user_name') || '').replace(/[<>]/g, '').trim().slice(0, 20);
    if (myName) params.set('cn', myName);
    return `https://fasttypinglab.com${window.location.pathname}?${params.toString()}`;
  }, [selectedDuration, stats.netWpm, stats.accuracy]);

  // Hand the full result off to the /results report the moment the test
  // finishes — by the time "View detailed report" is clickable in the popup,
  // this has already run, so that link needs no query params or router state.
  useEffect(() => {
    if (!stats.isFinished) return;
    storeTypingResult({
      passage: activeText,
      typed: userInput,
      mistakes: Array.from(mistakes),
      skipped: Array.from(skipped),
      wpm: stats.wpm,
      netWpm: stats.netWpm,
      accuracy: stats.accuracy,
      errors: stats.errors,
      cpm: stats.cpm,
      elapsedSeconds: stats.elapsedSeconds,
      consistency,
      testTitle: testContent.title,
      challengeUrl: buildChallengeUrl(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats.isFinished]);

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
      handleMobileInput(newVal);
      setMobileVal(newVal);
    } else {
      // Deletion — count the attempt, then honor the current backspace mode.
      const removedCount = mobileVal.length - newVal.length;
      setBackspaceCount(c => c + removedCount);
      sound.playKey();
      if (!canDeleteNow(userInput)) {
        // Blocked: leave the underlying engine state untouched and let the
        // controlled input snap back to its previous value on re-render.
        return;
      }
      handleMobileInput(newVal);
      setMobileVal(newVal);
    }
  }, [handleMobileInput, mobileVal, activeText, userInput, sound, canDeleteNow]);

  // Desktop keyboard listener
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (stats.isFinished) return;
    const ignored = ['Shift','Control','Alt','Meta','CapsLock','Tab','Escape','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12'];
    if (ignored.includes(e.key)) return;
    if (e.key === ' ') e.preventDefault();
    if (e.key === 'Backspace' || e.key === 'Delete') {
      sound.playKey();
      if (e.key === 'Backspace') setBackspaceCount(c => c + 1); else setDeleteCount(c => c + 1);
      if (canDeleteNow(userInput)) processBackspace();
    }
    else if (e.key.length === 1) {
      if (e.key === activeText[userInput.length]) sound.playKey(); else sound.playError();
      processChar(e.key);
    }
  }, [stats.isFinished, processChar, processBackspace, sound, activeText, userInput, canDeleteNow]);

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
    setBackspaceCount(0);
    setDeleteCount(0);
    if (isMobile) setTimeout(() => hiddenInputRef.current?.focus(), 100);
    if (testMode === 'words') {
      // Re-trigger words mode re-generation via key change in parent
      // For now words are stable — user clicks reset to get new set
    }
  }, [reset, isMobile, testMode]);

  // Tab = instant restart (standard on modern typing sites). Skipped once the
  // results screen is up so keyboard users can still tab through its buttons.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !stats.isFinished) {
        e.preventDefault();
        handleReset();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleReset, stats.isFinished]);

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
      {/* Every test now carries a real, AI-written per-passage excerpt (Phase 2a of
          the AdSense roadmap, backend half) — used below for both the meta
          description and the on-page "About this passage" content. Still noindexed
          for now: no individual test slug is in sitemap.xml yet, so indexing every
          AI-generated test page today would still be a duplicate-content risk;
          that's a separate follow-up (curate + add specific slugs to the sitemap). */}
      <Seo
        title={`${testContent.title} — Typing Test | FastTypingLab`}
        description={testContent.excerpt
          ? testContent.excerpt.slice(0, 155)
          : `Take a free online typing test: ${testContent.title}. Get live WPM, accuracy and error tracking.`}
        noindex
      />
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
          <Link to="/tests/" className="flex items-center gap-1.5 text-brand-muted hover:text-brand-text transition-colors text-sm font-medium group shrink-0">
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

        {/* Right: Restart (live numbers now live in the stat-pills row below) */}
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
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

        {/* ── Welcome header: greeting + passage pill + Change/Hide/Download ── */}
        <div className="w-full max-w-2xl flex flex-wrap items-center gap-2">
          <h2 className="text-sm sm:text-base font-black text-brand-text shrink-0">
            {greetingName ? `Welcome, ${greetingName}` : 'Welcome!'}
          </h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-white truncate max-w-[45%] sm:max-w-xs"
            style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>
            <span className="opacity-80 font-semibold">Passage:</span> <span className="truncate">{testContent.title}</span>
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <button
              onClick={handleChangePassage}
              disabled={testPool.length === 0}
              title="Switch to a different passage"
              className="flex items-center gap-1.5 bg-brand-surface border border-brand-border hover:border-brand-primary/40 text-brand-muted hover:text-brand-text px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40"
            >
              <RefreshCw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Change</span>
            </button>
            <button
              onClick={() => setShowPassage(v => !v)}
              title={showPassage ? 'Hide the passage text' : 'Show the passage text'}
              className="flex items-center gap-1.5 bg-brand-surface border border-brand-border hover:border-brand-primary/40 text-brand-muted hover:text-brand-text px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            >
              {showPassage ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} <span className="hidden sm:inline">{showPassage ? 'Hide' : 'Show'}</span>
            </button>
            <button
              onClick={handleDownloadPassage}
              title="Download this passage as a text file"
              className="flex items-center gap-1.5 bg-brand-surface border border-brand-border hover:border-brand-primary/40 text-brand-muted hover:text-brand-text px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Download</span>
            </button>
          </div>
        </div>

        {/* ── STAT PILLS (Gross · Delete · Backspace · Time Left) ── */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 w-full max-w-2xl">
          {[
            { label: 'Gross', value: stats.wpm, icon: Zap, cls: 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary' },
            { label: 'Delete', value: deleteCount, icon: RotateCcw, cls: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400' },
            { label: 'Backspace', value: backspaceCount, icon: RotateCcw, cls: 'bg-rose-500/10 border-rose-500/30 text-rose-500' },
            { label: 'Time Left', value: formattedTime, icon: Clock, cls: stats.timeLeft <= 10 && stats.isActive ? 'bg-rose-500/15 border-rose-500/40 text-rose-500 animate-pulse' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl px-1.5 py-1.5 sm:py-2 text-center border ${s.cls}`}>
              <div className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest opacity-80 flex items-center justify-center gap-0.5">
                <s.icon className="w-2.5 h-2.5" /> {s.label}
              </div>
              <div className="text-sm sm:text-lg font-black font-mono tabular-nums leading-none mt-0.5">{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── Compact meta line: Net WPM · Accuracy · Errors ── */}
        <div className="w-full max-w-2xl flex items-center gap-4 text-xs text-brand-muted font-semibold">
          <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Net: <span className="font-mono font-bold text-brand-text">{stats.netWpm}</span></span>
          <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Accuracy: <span className={`font-mono font-bold ${stats.accuracy >= 90 ? 'text-brand-accent' : 'text-rose-500'}`}>{stats.accuracy}%</span></span>
          <span>Errors: <span className="font-mono font-bold text-rose-500">{stats.errors}</span></span>
        </div>

        {/* ── Challenge banner (someone sent this link) ── */}
        {challenge && !stats.isFinished && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mb-3 flex items-center gap-3 rounded-2xl px-4 py-3 border"
            style={{ background: 'linear-gradient(135deg, rgba(188,108,80,0.12), rgba(188,108,80,0.04))', borderColor: 'rgba(188,108,80,0.3)' }}
          >
            <span className="text-2xl shrink-0">🏁</span>
            <div className="text-left">
              <p className="text-sm font-bold text-brand-text">
                {challenge.name} challenged you to beat {challenge.wpm} WPM
              </p>
              <p className="text-xs text-brand-text-muted">
                {challenge.accuracy !== null && `at ${challenge.accuracy}% accuracy · `}
                Same passage, same duration — good luck!
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Start hint (pre-test only) ── */}
        <AnimatePresence>
          {!stats.isActive && !stats.isFinished && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl flex items-center justify-center gap-3"
            >
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
          {showPassage && (
            <div
              className={`relative bg-brand-surface border border-brand-border rounded-2xl px-4 sm:px-8 py-5 shadow-sm cursor-text overflow-hidden ${shake && !prefersReducedMotion ? 'animate-error-shake' : ''}`}
              onClick={() => isMobile && hiddenInputRef.current?.focus()}
            >
              {/* Subtle top glow when active */}
              {stats.isActive && (
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent" />
              )}

              {/* Text display — word-level color feedback */}
              <div
                className="font-mono tracking-wide leading-relaxed break-words overflow-y-auto"
                style={{ maxHeight: isMobile ? '120px' : '160px', fontSize: `${a11y.fontSize}px` }}
              >
                {wordRanges.map((w, wi) => {
                  const status = getWordStatus(w, userInput.length, mistakes, skipped);
                  const cls =
                    status === 'correct' && highlightOn ? 'text-emerald-600 dark:text-emerald-400' :
                    status === 'wrong' && highlightOn ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10 rounded-sm' :
                    status === 'current' && indicatorOn ? 'text-brand-text bg-amber-300/40 rounded-sm' :
                    'text-brand-text-muted';
                  return (
                    <span key={wi}>
                      <span className={cls}>{w.text}</span>
                      {wi < wordRanges.length - 1 ? ' ' : ''}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Typed-text preview — what you actually typed, misspelled words underlined ── */}
          {userInput.length > 0 && (
            <div className="bg-brand-surface-2 border border-brand-border rounded-2xl px-4 sm:px-8 py-3 mt-2 max-h-[70px] overflow-y-auto font-mono tracking-wide"
              style={{ fontSize: `${a11y.fontSize}px` }}>
              {wordRanges.filter(w => w.start < userInput.length).map((w, wi) => {
                const status = getWordStatus(w, userInput.length, mistakes, skipped);
                const typedSlice = userInput.slice(w.start, Math.min(w.end, userInput.length));
                const wrong = status === 'wrong';
                return (
                  <span key={wi}>
                    <span className={wrong ? 'text-rose-500 underline decoration-wavy decoration-rose-500' : 'text-brand-text'}>{typedSlice}</span>
                    {' '}
                  </span>
                );
              })}
            </div>
          )}

          {/* ── Highlight / Indicator / Backspace-mode controls ── */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 px-1 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none font-semibold text-brand-muted">
              Highlight
              <button
                type="button"
                role="switch"
                aria-checked={highlightOn}
                onClick={() => setHighlightOn(v => !v)}
                className={`relative w-9 h-5 rounded-full transition-colors ${highlightOn ? 'bg-brand-primary' : 'bg-brand-border'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${highlightOn ? 'translate-x-4' : ''}`} />
              </button>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none font-semibold text-brand-muted">
              Indicator
              <button
                type="button"
                role="switch"
                aria-checked={indicatorOn}
                onClick={() => setIndicatorOn(v => !v)}
                className={`relative w-9 h-5 rounded-full transition-colors ${indicatorOn ? 'bg-brand-primary' : 'bg-brand-border'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${indicatorOn ? 'translate-x-4' : ''}`} />
              </button>
            </label>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-brand-muted">Backspace:</span>
              <div className="flex items-center bg-brand-surface-2 border border-brand-border rounded-lg p-0.5">
                {([['full', 'Full'], ['word', 'Word'], ['off', 'Off']] as [typeof backspaceMode, string][]).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setBackspaceMode(val)}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors ${
                      backspaceMode === val ? 'bg-brand-primary text-white' : 'text-brand-muted hover:text-brand-text'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Controls toolbar — below the typing window ── */}
          <div className="flex items-center gap-2 mt-3 px-1">
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
            <button
              onClick={toggleKeyboard}
              aria-pressed={showKeyboard}
              aria-label={showKeyboard ? 'Hide on-screen keyboard' : 'Show on-screen keyboard'}
              title="On-screen keyboard"
              className={`hidden lg:flex items-center gap-1.5 border px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                showKeyboard
                  ? 'bg-brand-primary text-white border-transparent'
                  : 'bg-brand-surface border-brand-border text-brand-muted hover:border-brand-primary/40 hover:text-brand-text'
              }`}
            >
              <KeyboardIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={toggleHands}
              aria-pressed={showHands}
              aria-label={showHands ? 'Hide finger guide' : 'Show finger guide'}
              title="Finger guide"
              className={`hidden lg:flex items-center gap-1.5 border px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                showHands
                  ? 'bg-brand-primary text-white border-transparent'
                  : 'bg-brand-surface border-brand-border text-brand-muted hover:border-brand-primary/40 hover:text-brand-text'
              }`}
            >
              <Hand className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={toggleFullscreen}
              aria-pressed={isFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen focus mode'}
              title="Fullscreen focus mode"
              className="hidden sm:flex items-center gap-1.5 bg-brand-surface border border-brand-border hover:border-brand-primary/40 text-brand-muted hover:text-brand-text px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            >
              {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            </button>
            <span className="hidden md:inline-flex items-center gap-1 ml-auto text-[10px] text-brand-muted">
              <kbd className="px-1.5 py-0.5 rounded bg-brand-surface-2 border border-brand-border font-mono">Tab</kbd> restart
            </span>
          </div>

          {/* Colour legend — helps students read their errors at a glance */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 px-1 text-[11px] text-brand-muted">
            <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: '#E05252' }} /> Wrong letter</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: '#3B82F6' }} /> Skipped (press <kbd className="px-1 rounded bg-brand-surface-2 border border-brand-border">space</kbd> to skip a word)</span>
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

        {/* ── On-screen keyboard + finger guide (desktop) ── */}
        {showKeyboard && !stats.isFinished && (
          <div className="hidden lg:flex items-center justify-center gap-3 mt-4 select-none" aria-hidden="true">
            {showHands && (
              <div style={{ zoom: 0.5 }}>
                <HandGuide
                  hand="left"
                  activeFinger={activeFinger && (activeFinger.startsWith('left') || activeFinger === 'thumb') ? activeFinger : ''}
                />
              </div>
            )}
            <div style={{ zoom: 0.62 }}>
              <VirtualKeyboard activeKey={keyboardActiveKey} />
            </div>
            {showHands && (
              <div style={{ zoom: 0.5 }}>
                <HandGuide
                  hand="right"
                  activeFinger={activeFinger && (activeFinger.startsWith('right') || activeFinger === 'thumb') ? activeFinger : ''}
                />
              </div>
            )}
          </div>
        )}

        {/* Finish early */}
        {!stats.isFinished && stats.isActive && (
          <button
            onClick={(e) => { e.stopPropagation(); engine.finish(); }}
            className="flex items-center gap-2 bg-brand-surface/80 hover:bg-rose-50 dark:hover:bg-rose-900/20 border border-brand-border hover:border-rose-300 text-brand-muted hover:text-rose-500 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all"
          >
            Finish Early
          </button>
        )}

        {/* About this test — hidden while actively typing to stay out of the way */}
        {!stats.isActive && (
          <div className="w-full max-w-2xl" onClick={e => e.stopPropagation()}>
            {testContent.excerpt && (
              <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 text-sm text-brand-text-muted leading-relaxed mb-3">
                <h2 className="text-base font-bold text-brand-text mb-1.5">About this passage</h2>
                <p>{testContent.excerpt}</p>
              </div>
            )}
            <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 text-sm text-brand-text-muted leading-relaxed space-y-2">
              <h2 className="text-base font-bold text-brand-text">How WPM, accuracy and errors are calculated</h2>
              <p><strong className="text-brand-text">Gross WPM</strong> counts every character you typed, divided by 5, over your time in minutes. <strong className="text-brand-text">Net WPM</strong> subtracts your mistakes first, so it's a truer measure of usable speed — this is the number most exams and employers care about.</p>
              <p><strong className="text-brand-text">Accuracy</strong> is the percentage of characters typed correctly. A single typo lowers your Net WPM more than it looks, since one wrong keystroke usually costs a correction too.</p>
              <h3 className="text-sm font-bold text-brand-text pt-1">Tips to improve your speed</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Keep your eyes on the passage, not your hands — glancing down breaks your rhythm more than it helps.</li>
                <li>Slow down slightly if you're making frequent mistakes; a clean 45 WPM beats a sloppy 60 WPM on most tests.</li>
                <li>Practice the same duration as your real exam or job test, not just quick one-minute bursts.</li>
                <li>Retype passages you found hard — repetition on your weak spots improves speed faster than random practice.</li>
              </ul>
            </div>
            <RelatedLinks items={[
              { label: 'All Typing Tests', href: '/tests/' },
              { label: 'Competitive Exam Typing', href: '/competitive-exam-typing/' },
              { label: 'Learn Touch Typing', href: '/learn/' },
            ]} />
          </div>
        )}
      </div>

      {stats.isFinished && (
        <ResultsPopup
          netWpm={stats.netWpm}
          accuracy={stats.accuracy}
          challengeUrl={buildChallengeUrl()}
          newUnlock={newUnlocks[0] || null}
          prefersReducedMotion={prefersReducedMotion}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
