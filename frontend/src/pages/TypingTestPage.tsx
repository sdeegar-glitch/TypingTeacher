import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import VirtualKeyboard from '../components/VirtualKeyboard';
import HandGuide from '../components/HandGuide';
import { getFingerForKey } from '../utils/KeyboardLayout';
import { useLocation } from 'react-router-dom';

const sampleTexts: Record<string, { title: string; content: string }> = {
  '1': {
    title: 'Easy Paragraph Drill',
    content: 'the quick brown fox jumps over the lazy dog. focus on keeping your hands relaxed and moving smoothly between keys.',
  },
  '2': {
    title: 'Home Row Extended',
    content: 'sad lass fall lads salad all; ask dad for a salad; a sad fall for a young lad; dad asks a lass.',
  },
  '3': {
    title: 'Common Word Flow',
    content: 'with the rapid development of technology and internet, touch typing has become an essential skill for everyday work and life.',
  },
};

const TypingTestPage = () => {
  const { id, duration, profession, language } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryDuration = searchParams.get('duration');

  // Detect mobile/touch device
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  }, []);

  // SEO
  useEffect(() => {
    let title = 'Typing Speed Test | FastTypingLab';
    if (duration || queryDuration) title = `${duration || (Number(queryDuration) / 60) + ' min'} Typing Test | FastTypingLab`;
    if (profession) title = `Typing Test for ${profession.charAt(0).toUpperCase() + profession.slice(1)} | FastTypingLab`;
    if (language) title = `${language.charAt(0).toUpperCase() + language.slice(1)} Typing Test | FastTypingLab`;
    document.title = title;
  }, [duration, profession, language, queryDuration]);

  const [activeTest, setActiveTest] = useState<{ title: string; content: string }>(sampleTexts['1']);
  const [loadingTest, setLoadingTest] = useState(true);

  // Fetch active test
  useEffect(() => {
    if (id && !sampleTexts[id]) {
      fetch(`https://typingteacher-2lnd.onrender.com/api/tests/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.content) setActiveTest(data);
          else setActiveTest(sampleTexts['1']);
          setLoadingTest(false);
        })
        .catch(() => { setActiveTest(sampleTexts['1']); setLoadingTest(false); });
    } else {
      setActiveTest(sampleTexts[id || '1'] || sampleTexts['1']);
      setLoadingTest(false);
    }
  }, [id]);

  const targetContent = activeTest.content;

  const [userInput, setUserInput] = useState('');
  const [mistakes, setMistakes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [netWpm, setNetWpm] = useState(0);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Duration
  const routeDuration = duration ? parseInt(duration) * 60 : NaN;
  const urlDuration = queryDuration ? parseInt(queryDuration) : NaN;
  const TEST_DURATION = !isNaN(urlDuration) ? urlDuration : (!isNaN(routeDuration) ? routeDuration : 60);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  useEffect(() => { setTimeLeft(TEST_DURATION); }, [TEST_DURATION]);

  const [lastKeyPressStatus, setLastKeyPressStatus] = useState<'none' | 'correct' | 'error'>('none');
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  // Countdown
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (startTime && !isFinished && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { setIsFinished(true); clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, isFinished, timeLeft]);

  // Auto-focus hidden input on mount and after test loads
  useEffect(() => {
    if (!loadingTest && isMobile) {
      setTimeout(() => hiddenInputRef.current?.focus(), 300);
    }
  }, [loadingTest, isMobile]);

  // Submit results
  useEffect(() => {
    if (isFinished && startTime) {
      const timeTaken = TEST_DURATION - timeLeft || 1;
      const finalAccuracy = userInput.length > 0
        ? Math.round(((userInput.length - mistakes.length) / userInput.length) * 100)
        : 0;
      fetch('https://typingteacher-2lnd.onrender.com/test_sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_id: Number(id) || null,
          duration: timeTaken,
          gross_wpm: Math.round((userInput.length / 5) / (timeTaken / 60)),
          net_wpm: wpm,
          errors: mistakes.length,
          accuracy: finalAccuracy,
        }),
      }).catch(() => {});
    }
  }, [isFinished]);

  // ── CHARACTER-LEVEL input processing (shared between desktop keydown and mobile input) ──
  const processChar = useCallback((char: string) => {
    if (isFinished) return;
    if (!startTime) setStartTime(Date.now());
    if (userInput.length < targetContent.length) {
      const expected = targetContent[userInput.length];
      if (char === expected) {
        setLastKeyPressStatus('correct');
      } else {
        setMistakes(prev => [...prev, userInput.length]);
        setLastKeyPressStatus('error');
      }
      setUserInput(prev => prev + char);
      setTimeout(() => setLastKeyPressStatus('none'), 150);
    }
  }, [userInput, targetContent, isFinished, startTime]);

  const processBackspace = useCallback(() => {
    if (isFinished) return;
    if (!startTime) setStartTime(Date.now());
    setUserInput(prev => prev.slice(0, -1));
    setMistakes(prev => prev.filter(m => m < userInput.length - 1));
  }, [isFinished, startTime, userInput.length]);

  // ── DESKTOP: keydown events ──
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isFinished) return;
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    if (e.key === ' ') e.preventDefault();
    setPressedKeys(prev => new Set(prev).add(e.key));
    if (e.key === 'Backspace') {
      processBackspace();
    } else if (e.key.length === 1) {
      processChar(e.key);
    }
  }, [isFinished, processChar, processBackspace]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setPressedKeys(prev => { const n = new Set(prev); n.delete(e.key); return n; });
  }, []);

  useEffect(() => {
    if (!isMobile) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
    }
  }, [handleKeyDown, handleKeyUp, isMobile]);

  // ── MOBILE: hidden input events ──
  const lastMobileInputRef = useRef('');
  const handleMobileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;
    const newVal = e.target.value;
    const prev = lastMobileInputRef.current;

    if (newVal.length > prev.length) {
      // Characters added
      const added = newVal.slice(prev.length);
      for (const ch of added) processChar(ch);
    } else if (newVal.length < prev.length) {
      // Backspace(s)
      const removed = prev.length - newVal.length;
      for (let i = 0; i < removed; i++) processBackspace();
    }
    lastMobileInputRef.current = newVal;
  }, [isFinished, processChar, processBackspace]);

  // Keep hidden input value in sync to allow reading back
  const [mobileInputVal, setMobileInputVal] = useState('');
  const handleMobileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleMobileInput(e);
    setMobileInputVal(e.target.value);
  }, [handleMobileInput]);

  // WPM calculation
  useEffect(() => {
    if (userInput.length === targetContent.length && userInput.length > 0) setIsFinished(true);
    if (startTime && userInput.length > 0 && !isFinished) {
      const elapsed = (TEST_DURATION - timeLeft) / 60 || 0.01;
      setWpm(Math.round((userInput.length / 5) / elapsed));
      setNetWpm(Math.max(0, Math.round(((userInput.length - mistakes.length) / 5) / elapsed)));
    }
  }, [userInput, targetContent, startTime, isFinished, timeLeft]);

  // Scroll to current character
  useEffect(() => {
    const el = document.getElementById('current-char');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [userInput]);

  const nextChar = targetContent[userInput.length] || '';
  const activeFinger = useMemo(() => getFingerForKey(nextChar), [nextChar]);
  const accuracy = useMemo(() => {
    if (userInput.length === 0) return 100;
    return Math.round(((userInput.length - mistakes.length) / userInput.length) * 100);
  }, [userInput, mistakes]);
  const progress = targetContent.length > 0 ? (userInput.length / targetContent.length) * 100 : 0;
  const formattedTime = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`;

  if (loadingTest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          <p className="text-slate-500 text-sm font-medium">Loading test...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-[100dvh] bg-[#f5f5f0] text-[#1e293b] flex flex-col overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
      // Tap anywhere to focus input on mobile
      onClick={() => isMobile && hiddenInputRef.current?.focus()}
    >
      {/* Hidden input for mobile keyboard */}
      {isMobile && (
        <input
          ref={hiddenInputRef}
          type="text"
          value={mobileInputVal}
          onChange={handleMobileInputChange}
          className="fixed opacity-0 pointer-events-none w-1 h-1 top-0 left-0 z-[-1]"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
          aria-hidden="true"
          disabled={isFinished}
        />
      )}

      {/* ── TOP HEADER ── */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-2 z-50 shadow-sm">
        {/* Left: Back + Title */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-shrink">
          <Link
            to="/tests"
            className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium group flex-shrink-0"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="w-px h-5 bg-slate-200 hidden sm:block" />
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold text-indigo-500 uppercase tracking-widest block">Test #{id || '1'}</span>
            <h1 className="text-xs sm:text-sm font-bold text-slate-800 leading-none truncate max-w-[120px] sm:max-w-xs">{activeTest.title}</h1>
          </div>
        </div>

        {/* Center: Finger hint — hidden on mobile */}
        {nextChar && !isFinished && !isMobile && (
          <div className="hidden md:flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full flex-shrink-0">
            <span className="text-xs text-indigo-600">Type</span>
            <kbd className="bg-indigo-600 text-white text-xs font-black px-2 py-0.5 rounded-md min-w-[24px] text-center">
              {nextChar === ' ' ? '⎵' : nextChar.toUpperCase()}
            </kbd>
            <span className="text-xs text-indigo-600">with <span className="text-indigo-800 font-semibold">{activeFinger.replace('left-', 'L ').replace('right-', 'R ')}</span></span>
          </div>
        )}

        {/* Right: Stats + Restart */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <div className="text-center">
            <span className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-widest block">Time</span>
            <span className="text-sm sm:text-base font-black text-slate-800 tabular-nums">{formattedTime}</span>
          </div>
          <div className="hidden sm:block text-center">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Gross</span>
            <span className="text-sm sm:text-base font-black text-slate-600 tabular-nums">{wpm}</span>
          </div>
          <div className="text-center">
            <span className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-widest block">WPM</span>
            <span className="text-sm sm:text-base font-black text-indigo-600 tabular-nums">{netWpm}</span>
          </div>
          <div className="text-center">
            <span className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-widest block">Acc</span>
            <span className={`text-sm sm:text-base font-black tabular-nums ${accuracy >= 90 ? 'text-emerald-600' : 'text-rose-500'}`}>{accuracy}%</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 sm:px-3 py-1.5 rounded-lg font-semibold text-xs transition-all border border-slate-300"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">Restart</span>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="shrink-0 h-1 bg-slate-200">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-grow flex flex-col items-center justify-start gap-3 px-3 sm:px-6 py-4 sm:py-6 overflow-hidden">

        {/* Mobile tap-to-start banner */}
        {isMobile && !startTime && !isFinished && (
          <div
            className="w-full max-w-2xl bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer"
            onClick={() => hiddenInputRef.current?.focus()}
          >
            <span className="text-2xl">⌨️</span>
            <div>
              <p className="text-sm font-bold text-indigo-700">Tap here to start typing</p>
              <p className="text-xs text-indigo-500">Your phone keyboard will appear</p>
            </div>
          </div>
        )}

        {/* ── MULTILINE TYPING AREA ── */}
        <div className="w-full max-w-2xl">
          <div
            className="bg-white border border-gray-200 rounded-2xl px-4 sm:px-8 py-5 relative shadow-lg cursor-text"
            onClick={() => isMobile && hiddenInputRef.current?.focus()}
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent rounded-t-2xl" />

            {/* Multiline word-wrap text display */}
            <div
              className="text-lg sm:text-2xl font-mono tracking-wide leading-relaxed break-words overflow-y-auto"
              style={{ maxHeight: isMobile ? '140px' : '180px' }}
            >
              {targetContent.split('').map((char, index) => {
                let status = 'upcoming';
                if (index < userInput.length) {
                  status = mistakes.includes(index) ? 'error' : 'correct';
                } else if (index === userInput.length) {
                  status = 'current';
                }
                return (
                  <span
                    key={index}
                    id={status === 'current' ? 'current-char' : undefined}
                    className={`
                      relative transition-colors duration-75 inline
                      ${status === 'correct' ? 'text-emerald-600' : ''}
                      ${status === 'error' ? 'text-red-500 bg-red-50 rounded' : ''}
                      ${status === 'upcoming' ? 'text-slate-400' : ''}
                      ${status === 'current' ? 'text-indigo-600 border-b-2 border-indigo-500 animate-pulse' : ''}
                    `}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                );
              })}
            </div>

            {/* Start hint overlay */}
            {!startTime && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl">
                <div className="text-center px-4">
                  <div className="text-3xl sm:text-4xl mb-2">{isMobile ? '📱' : '⚡'}</div>
                  <p className="text-slate-500 font-semibold text-sm sm:text-base">
                    {isMobile ? 'Tap anywhere & type to begin' : 'Start typing to begin your test…'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── KEYBOARD & HANDS — desktop only ── */}
        {!isMobile && (
          <div className="w-full flex justify-center items-end gap-[2px] transform scale-[0.55] sm:scale-75 lg:scale-[0.82] origin-top transition-transform">
            <div className="hidden md:block pb-2">
              <HandGuide
                hand="left"
                activeFinger={activeFinger.startsWith('left') || activeFinger === 'thumb' ? activeFinger : ''}
                status={activeFinger.startsWith('left') || activeFinger === 'thumb' ? lastKeyPressStatus : 'none'}
              />
            </div>
            <div className="z-10">
              <VirtualKeyboard activeKey={nextChar} pressedKeys={pressedKeys} />
            </div>
            <div className="hidden md:block pb-2">
              <HandGuide
                hand="right"
                activeFinger={activeFinger.startsWith('right') || activeFinger === 'thumb' ? activeFinger : ''}
                status={activeFinger.startsWith('right') || activeFinger === 'thumb' ? lastKeyPressStatus : 'none'}
              />
            </div>
          </div>
        )}

        {/* Mobile: show next key hint instead of full keyboard */}
        {isMobile && nextChar && !isFinished && startTime && (
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-sm">
            <span className="text-xs text-slate-500">Next:</span>
            <kbd className="bg-indigo-600 text-white font-black px-3 py-1.5 rounded-lg text-lg min-w-[44px] text-center">
              {nextChar === ' ' ? '⎵' : nextChar.toUpperCase()}
            </kbd>
            <span className="text-xs text-slate-400">{activeFinger.replace('left-', 'Left ').replace('right-', 'Right ').replace('-', ' ')}</span>
          </div>
        )}

        {/* Finish Early button */}
        {!isFinished && startTime && (
          <button
            onClick={() => setIsFinished(true)}
            className="flex items-center gap-2 bg-white/80 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 px-5 py-2 rounded-full font-semibold text-xs sm:text-sm transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Finish Early
          </button>
        )}
      </div>

      {/* ── RESULT MODAL ── */}
      {isFinished && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 max-w-md w-full text-center shadow-2xl">
            <div className="text-5xl sm:text-6xl mb-4">🎉</div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-1">Test Complete!</h2>
            <p className="text-slate-500 mb-6 text-sm">Your results have been recorded.</p>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
              <div className="bg-slate-50 border border-slate-200 p-3 sm:p-4 rounded-2xl">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Gross</span>
                <span className="text-xl sm:text-2xl font-black text-slate-700">{wpm} WPM</span>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 p-3 sm:p-4 rounded-2xl">
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Net</span>
                <span className="text-xl sm:text-2xl font-black text-indigo-600">{netWpm} WPM</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-3 sm:p-4 rounded-2xl">
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest block mb-1">Acc</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-600">{accuracy}%</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm transition-all border border-slate-300"
              >
                Try Again
              </button>
              <Link
                to="/tests"
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all text-center flex items-center justify-center"
              >
                More Tests
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypingTestPage;
