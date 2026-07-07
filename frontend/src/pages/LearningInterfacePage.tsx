import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import VirtualKeyboard from '../components/VirtualKeyboard';
import HandGuide from '../components/HandGuide';
import { saveProgress } from '../utils/progressManager';
import { getFingerForKey } from '../utils/KeyboardLayout';

// Comprehensive Curriculum
const generateLessons = () => {
  const data: Record<string, { content: string; title: string; minWpm: number }> = {
    '1': { title: 'The f and j keys', content: 'fff jjj ff jj fj jf ffjj ffjj fjfj fff jjj fjf jfj f j f j ff jj ff jj fjf jfj', minWpm: 10 },
    '2': { title: 'The d and k keys', content: 'ddd kkk dd kk dk kd ddd kkk dkd kdk d k d k dd kk dd kk ddd kkk dkd kdk d k d k dd kk dd kk', minWpm: 10 },
    '3': { title: 'The s and l keys', content: 'sss lll ss ll sl ls sss lll sls lsl s l s l ss ll ss ll sss lll sls lsl s l s l ss ll ss ll', minWpm: 11 },
    '4': { title: 'The a and ; keys', content: 'aaa ;;; aa ;; a; ;a aaa ;;; a;a ;a; a ; a ; aa ;; aa ;; aaa ;;; a;a ;a; a ; a ; aa ;; aa ;;', minWpm: 11 },
    '5': { title: 'Home Row Basics', content: 'asdf jkl; asdf jkl; asdf jkl; a s d f j k l ; asdf jkl; asdf jkl; asdf jkl; a s d f j k l ;', minWpm: 12 },
  };
  for (let i = 6; i <= 50; i++) {
    data[i.toString()] = {
      title: `Practice Level ${i}`,
      content: `the quick brown fox jumps over the lazy dog. focus on your accuracy and rhythm. speed will come naturally.`.repeat(2),
      minWpm: 12 + Math.floor(i / 2),
    };
  }
  return data;
};

const lessonData = generateLessons();

const LearningInterfacePage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const currentLesson = lessonData[lessonId || '1'] || lessonData['1'];

  // Detect mobile
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  }, []);

  const [userInput, setUserInput] = useState('');
  const [mistakes, setMistakes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [netWpm, setNetWpm] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lastKeyPressStatus, setLastKeyPressStatus] = useState<'none' | 'correct' | 'error'>('none');
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const targetContent = currentLesson.content;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (startTime && !isFinished) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, isFinished]);

  // Auto-focus hidden input on mobile
  useEffect(() => {
    if (isMobile) setTimeout(() => hiddenInputRef.current?.focus(), 300);
  }, [isMobile]);

  // ── Process character input (shared) ──
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

  // ── Desktop keyboard events ──
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isFinished) return;
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    if (e.key === ' ') e.preventDefault();
    setPressedKeys(prev => new Set(prev).add(e.key));
    if (e.key === 'Backspace') processBackspace();
    else if (e.key.length === 1) processChar(e.key);
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

  // ── Mobile hidden input ──
  const lastMobileInputRef = useRef('');
  const [mobileInputVal, setMobileInputVal] = useState('');
  const handleMobileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;
    const newVal = e.target.value;
    const prev = lastMobileInputRef.current;
    if (newVal.length > prev.length) {
      for (const ch of newVal.slice(prev.length)) processChar(ch);
    } else if (newVal.length < prev.length) {
      for (let i = 0; i < prev.length - newVal.length; i++) processBackspace();
    }
    lastMobileInputRef.current = newVal;
    setMobileInputVal(newVal);
  }, [isFinished, processChar, processBackspace]);

  // Results + progress save
  useEffect(() => {
    if (userInput.length === targetContent.length && userInput.length > 0) {
      setIsFinished(true);
      const timeElapsed = (Date.now() - (startTime || Date.now())) / 60000;
      const finalNetWpm = Math.max(0, Math.round(((userInput.length - mistakes.length) / 5) / timeElapsed));
      const finalAccuracy = Math.round(((userInput.length - mistakes.length) / userInput.length) * 100);

      let stars = 0;
      if (finalNetWpm >= currentLesson.minWpm && finalAccuracy >= 90) {
        stars = 1;
        if (finalAccuracy >= 95) stars = 2;
        if (finalAccuracy >= 98) stars = 3;
        if (finalAccuracy >= 99 && finalNetWpm >= currentLesson.minWpm + 5) stars = 4;
        if (finalAccuracy === 100 && finalNetWpm >= currentLesson.minWpm + 10) stars = 5;
      }
      if (stars > 0) {
        saveProgress({ lessonId: lessonId || '1', stars, bestWpm: finalNetWpm, bestAccuracy: finalAccuracy, completed: true });
      }
    }
    if (startTime && userInput.length > 0 && !isFinished) {
      const timeElapsed = (Date.now() - startTime) / 60000;
      setWpm(Math.round((userInput.length / 5) / timeElapsed));
      setNetWpm(Math.max(0, Math.round(((userInput.length - mistakes.length) / 5) / timeElapsed)));
    }
  }, [userInput, targetContent, startTime, isFinished, currentLesson, lessonId, mistakes.length]);

  useEffect(() => {
    const el = document.getElementById('current-char');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [userInput]);

  const nextChar = targetContent[userInput.length] || '';
  const activeFinger = useMemo(() => getFingerForKey(nextChar), [nextChar]);
  // Current-word range for the exam-style yellow highlight.
  const caretPos = userInput.length;
  const wordStart = targetContent.lastIndexOf(' ', caretPos - 1) + 1;
  const wordEndRaw = targetContent.indexOf(' ', caretPos);
  const wordEnd = wordEndRaw === -1 ? targetContent.length : wordEndRaw;
  const accuracy = useMemo(() => {
    if (userInput.length === 0) return 100;
    return Math.round(((userInput.length - mistakes.length) / userInput.length) * 100);
  }, [userInput, mistakes]);
  const canPass = wpm >= currentLesson.minWpm && accuracy >= 90;
  const progress = targetContent.length > 0 ? (userInput.length / targetContent.length) * 100 : 0;
  const formattedTime = `${Math.floor(elapsedSeconds / 60)}:${String(elapsedSeconds % 60).padStart(2, '0')}`;

  return (
    <div
      className="h-[100dvh] text-[#1e293b] flex flex-col overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif", background: '#ebebea' }}
      onClick={() => isMobile && hiddenInputRef.current?.focus()}
    >
      {/* Hidden input for mobile */}
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
      <div className="shrink-0 bg-white border-b border-gray-200 px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between z-50 shadow-sm gap-2">
        {/* Left */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-shrink">
          <Link
            to="/learn"
            className="flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium group flex-shrink-0"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="w-px h-5 bg-slate-200 hidden sm:block" />
          <div className="min-w-0">
            <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest block">Level {lessonId}</span>
            <h1 className="text-xs sm:text-sm font-bold text-slate-800 leading-none truncate max-w-[100px] sm:max-w-xs">{currentLesson.title}</h1>
          </div>
        </div>

        {/* Center: finger hint — desktop only */}
        {nextChar && !isFinished && !isMobile && (
          <div className="hidden md:flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-full">
            <span className="text-xs text-indigo-600">Type</span>
            <kbd className="bg-indigo-600 text-white text-xs font-black px-2 py-0.5 rounded-md min-w-[24px] text-center">
              {nextChar === ' ' ? '⎵' : nextChar.toUpperCase()}
            </kbd>
            <span className="text-xs text-indigo-600">with <span className="text-indigo-800 font-semibold">{activeFinger.replace('left-', 'L ').replace('right-', 'R ')}</span></span>
          </div>
        )}

        {/* Right: Stats */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <div className="text-center">
            <span className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-widest block">Time</span>
            <span className="text-sm sm:text-lg font-black text-slate-800 tabular-nums">{formattedTime}</span>
          </div>
          <div className="hidden sm:block text-center">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Gross</span>
            <span className={`text-sm sm:text-lg font-black tabular-nums ${wpm >= currentLesson.minWpm ? 'text-indigo-400' : 'text-slate-400'}`}>{wpm}</span>
          </div>
          <div className="text-center">
            <span className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-widest block">Net WPM</span>
            <span className={`text-sm sm:text-lg font-black tabular-nums ${netWpm >= currentLesson.minWpm ? 'text-indigo-600' : 'text-slate-400'}`}>{netWpm}</span>
          </div>
          <div className="text-center">
            <span className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-widest block">Acc</span>
            <span className={`text-sm sm:text-lg font-black tabular-nums ${accuracy >= 90 ? 'text-emerald-600' : 'text-rose-500'}`}>{accuracy}%</span>
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
          className="h-full transition-all duration-300"
          style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}
        />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-grow flex flex-col items-center justify-start gap-3 sm:gap-4 px-3 sm:px-4 py-4 sm:py-6 overflow-hidden">

        {/* Mobile tap banner */}
        {isMobile && !startTime && !isFinished && (
          <div
            className="w-full max-w-2xl bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer"
            onClick={() => hiddenInputRef.current?.focus()}
          >
            <span className="text-2xl">⌨️</span>
            <div>
              <p className="text-sm font-bold text-blue-700">Tap here & start typing</p>
              <p className="text-xs text-blue-500">Your phone keyboard will appear</p>
            </div>
          </div>
        )}

        {/* ── MULTILINE TYPING AREA ── */}
        <div className="w-full max-w-2xl">
          <div className="bg-white border border-gray-200 rounded-2xl px-4 sm:px-8 py-4 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent)' }} />

            <div
              className="text-lg sm:text-2xl font-mono tracking-wide leading-relaxed break-words overflow-y-auto select-none"
              style={{ maxHeight: isMobile ? '104px' : '132px' }}
            >
              {targetContent.split('').map((char, index) => {
                let status = 'upcoming';
                if (index < userInput.length) status = mistakes.includes(index) ? 'error' : 'correct';
                else if (index === userInput.length) status = 'current';
                const inWord = index >= wordStart && index < wordEnd && index >= userInput.length;
                return (
                  <span
                    key={index}
                    id={status === 'current' ? 'current-char' : undefined}
                    className={`relative transition-colors duration-75 inline
                      ${status === 'correct' ? 'text-emerald-600' : ''}
                      ${status === 'error' ? 'text-white bg-red-500 rounded' : ''}
                      ${status === 'upcoming' ? (inWord ? 'text-slate-700 bg-amber-200/70 rounded' : 'text-slate-400') : ''}
                      ${status === 'current' ? 'text-indigo-800 bg-amber-300/80 rounded' : ''}`}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                );
              })}
            </div>

          </div>
        </div>

        {/* ── INPUT (type here) ── */}
        <div className="w-full max-w-2xl">
          <div
            className="bg-white border-2 border-indigo-300 rounded-2xl px-4 sm:px-6 py-3.5 min-h-[4.25rem] text-lg sm:text-xl font-mono leading-relaxed shadow-sm cursor-text"
            onClick={() => isMobile && hiddenInputRef.current?.focus()}
          >
            {userInput ? (
              <span className="whitespace-pre-wrap break-words">
                {userInput.split('').map((c, i) => (
                  <span key={i} className={mistakes.includes(i) ? 'text-red-500' : 'text-slate-800'}>{c}</span>
                ))}
                <span className="inline-block w-0.5 h-5 align-middle bg-indigo-500 animate-pulse ml-px" />
              </span>
            ) : (
              <span className="text-slate-400">{isMobile ? 'Tap here & type to begin…' : 'Start typing here to begin…'}</span>
            )}
          </div>
        </div>

        {/* ── Keyboard & Hands — desktop only ── */}
        {!isMobile && (
          <div className="w-full flex justify-center items-end gap-[2px] transform scale-[0.45] sm:scale-75 lg:scale-[0.85] origin-top transition-transform">
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

        {/* Mobile: next-key indicator */}
        {isMobile && nextChar && !isFinished && startTime && (
          <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-sm">
            <span className="text-xs text-slate-500">Next key:</span>
            <kbd className="bg-blue-600 text-white font-black px-3 py-1.5 rounded-lg text-lg min-w-[44px] text-center">
              {nextChar === ' ' ? '⎵' : nextChar.toUpperCase()}
            </kbd>
          </div>
        )}

        {/* Finish Early */}
        {!isFinished && startTime && (
          <button
            onClick={() => setIsFinished(true)}
            className="flex items-center gap-2 bg-white/50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 px-5 py-2 rounded-full font-semibold text-xs sm:text-sm transition-all"
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
            {canPass ? (
              <>
                <div className="text-5xl sm:text-6xl mb-4">🏆</div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-1">Level Complete!</h2>
                <p className="text-slate-500 mb-6 text-sm">You passed this level with flying colors.</p>
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
                  <Link to="/learn" className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm transition-all border border-slate-300 text-center">
                    Course Map
                  </Link>
                  <button
                    onClick={() => navigate(`/learn/${Number(lessonId) + 1}`)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all"
                  >
                    Next Level →
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-5xl sm:text-6xl mb-4">💪</div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-1">Keep Going!</h2>
                <p className="text-slate-500 mb-4 text-sm">Need <span className="text-rose-500 font-bold">{currentLesson.minWpm} WPM</span> to pass.</p>
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
                  <div className="bg-slate-100 p-3 rounded-2xl">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Gross</span>
                    <span className="text-xl font-black text-slate-800">{wpm} WPM</span>
                  </div>
                  <div className="bg-slate-100 p-3 rounded-2xl">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Net</span>
                    <span className="text-xl font-black text-slate-800">{netWpm} WPM</span>
                  </div>
                  <div className="bg-slate-100 p-3 rounded-2xl">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Acc</span>
                    <span className="text-xl font-black text-slate-800">{accuracy}%</span>
                  </div>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningInterfacePage;
