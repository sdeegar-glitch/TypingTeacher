import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import VirtualKeyboard from '../components/VirtualKeyboard';
import HandGuide from '../components/HandGuide';
import { saveProgress } from '../utils/progressManager';
import { getFingerForKey } from '../utils/KeyboardLayout';

// Comprehensive Curriculum
const generateLessons = () => {
  const data: Record<string, { content: string, title: string, minWpm: number }> = {
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
      minWpm: 12 + Math.floor(i / 2)
    };
  }
  return data;
};

const lessonData = generateLessons();

const LearningInterfacePage = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const currentLesson = lessonData[lessonId || '1'] || lessonData['1'];
  
  const [userInput, setUserInput] = useState('');
  const [mistakes, setMistakes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [wpm, setWpm] = useState(0); // Gross WPM
  const [netWpm, setNetWpm] = useState(0); // Net WPM
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lastKeyPressStatus, setLastKeyPressStatus] = useState<'none' | 'correct' | 'error'>('none');
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    let interval: any;
    if (startTime && !isFinished) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, isFinished]);

  const targetContent = currentLesson.content;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isFinished) return;
    if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return;
    if (e.key === ' ') e.preventDefault();

    setPressedKeys(prev => new Set(prev).add(e.key));

    if (!startTime) setStartTime(Date.now());

    if (e.key === 'Backspace') {
      setUserInput(prev => prev.slice(0, -1));
      setMistakes(prev => prev.filter(m => m < userInput.length - 1));
    } else if (e.key.length === 1) {
      if (userInput.length < targetContent.length) {
        const expected = targetContent[userInput.length];
        if (e.key === expected) {
          setLastKeyPressStatus('correct');
        } else {
          setMistakes(prev => [...prev, userInput.length]);
          setLastKeyPressStatus('error');
        }
        setUserInput(prev => prev + e.key);
        setTimeout(() => setLastKeyPressStatus('none'), 150);
      }
    }
  }, [userInput, targetContent, isFinished, startTime]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    setPressedKeys(prev => {
      const next = new Set(prev);
      next.delete(e.key);
      return next;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

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
      const currentGrossWpm = Math.round((userInput.length / 5) / timeElapsed);
      const currentNetWpm = Math.max(0, Math.round(((userInput.length - mistakes.length) / 5) / timeElapsed));
      setWpm(currentGrossWpm);
      setNetWpm(currentNetWpm);
    }
  }, [userInput, targetContent, startTime, isFinished, currentLesson, lessonId, mistakes.length]);

  useEffect(() => {
    const currentChar = document.getElementById('current-char');
    if (currentChar) {
      currentChar.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [userInput]);

  const nextChar = targetContent[userInput.length] || '';
  const activeFinger = useMemo(() => getFingerForKey(nextChar), [nextChar]);
  const accuracy = useMemo(() => {
    if (userInput.length === 0) return 100;
    return Math.round(((userInput.length - mistakes.length) / userInput.length) * 100);
  }, [userInput, mistakes]);

  const canPass = wpm >= currentLesson.minWpm && accuracy >= 90;
  const progress = targetContent.length > 0 ? (userInput.length / targetContent.length) * 100 : 0;
  const formattedTime = `${Math.floor(elapsedSeconds / 60)}:${String(elapsedSeconds % 60).padStart(2, '0')}`;

  return (
    <div className="h-screen text-[#1e293b] flex flex-col overflow-hidden" style={{ fontFamily: "'Inter', sans-serif", background: '#ebebea' }}>
      
      {/* ===== TOP HEADER BAR ===== */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between z-50 shadow-sm">
        {/* Left: Back + Title */}
        <div className="flex items-center gap-4 min-w-0">
          <Link 
            to="/learn" 
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <div className="w-px h-5 bg-white/10"></div>
          <div>
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block">Level {lessonId}</span>
            <h1 className="text-sm font-bold text-slate-800 leading-none">{currentLesson.title}</h1>
          </div>
        </div>

        {/* Center: Finger hint */}
        {nextChar && !isFinished && (
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-4 py-1.5 rounded-full">
            <span className="text-xs text-indigo-600">Type</span>
            <kbd className="bg-indigo-600 text-white text-xs font-black px-2 py-0.5 rounded-md min-w-[24px] text-center">
              {nextChar === ' ' ? '⎵' : nextChar.toUpperCase()}
            </kbd>
            <span className="text-xs text-indigo-600">with <span className="text-indigo-800 font-semibold">{activeFinger.replace('left-', 'L ').replace('right-', 'R ')}</span></span>
          </div>
        )}

        {/* Right: Stats + Restart */}
        <div className="flex items-center gap-5">
          {/* Time */}
          <div className="text-center">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Time</span>
            <span className="text-lg font-black text-slate-800 tabular-nums">{formattedTime}</span>
          </div>
          {/* WPM (Gross) */}
          <div className="text-center">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Gross</span>
            <span className={`text-lg font-black tabular-nums ${wpm >= currentLesson.minWpm ? 'text-indigo-400' : 'text-slate-400'}`}>{wpm}</span>
          </div>
          {/* Net WPM */}
          <div className="text-center">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Net</span>
            <span className={`text-lg font-black tabular-nums ${netWpm >= currentLesson.minWpm ? 'text-indigo-600' : 'text-slate-400'}`}>{netWpm}</span>
          </div>
          {/* Accuracy */}
          <div className="text-center">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Accuracy</span>
            <span className={`text-lg font-black tabular-nums ${accuracy >= 90 ? 'text-emerald-600' : 'text-rose-500'}`}>{accuracy}%</span>
          </div>
          {/* Restart */}
          <button 
            onClick={() => window.location.reload()} 
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all border border-slate-300"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Restart
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="shrink-0 h-1" style={{ background: '#d0d0cc' }}>
        <div 
          className="h-full transition-all duration-300"
          style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }}
        />
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-grow flex flex-col items-center justify-center gap-4 px-4 py-3 overflow-hidden">
        
        {/* ── Typing Area ── */}
        <div className="w-full max-w-4xl">
          {/* Target text scroll area */}
          <div className="bg-white border border-gray-200 rounded-2xl px-8 py-5 relative overflow-hidden shadow-lg">
            {/* Top glow effect */}
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent)' }}></div>
            
            <div className="overflow-x-hidden whitespace-nowrap relative">
              {/* Left fade mask */}
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
              {/* Right fade mask */}
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

              <div className="inline-block text-3xl font-mono tracking-wider pl-16 pr-[60%]">
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
                        relative transition-all duration-75 inline-block
                        ${status === 'correct' ? 'text-emerald-600' : ''}
                        ${status === 'error' ? 'text-red-500 bg-red-50 rounded px-0.5' : ''}
                        ${status === 'upcoming' ? 'text-slate-400' : ''}
                        ${status === 'current' ? 'text-indigo-600 border-b-2 border-indigo-500 animate-pulse' : ''}
                      `}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Start hint */}
            {!startTime && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl">
                <div className="text-center">
                  <div className="text-4xl mb-2">⌨️</div>
                  <p className="text-slate-500 font-semibold">Start typing to begin…</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Keyboard & Hands (Side by Side) ── */}
        <div className="w-full flex justify-center items-end gap-[2px] mt-2 transform scale-[0.45] sm:scale-75 lg:scale-[0.85] origin-bottom transition-transform">
          {/* Left Hand */}
          <div className="hidden md:block pb-2">
            <HandGuide 
              hand="left" 
              activeFinger={activeFinger.startsWith('left') || activeFinger === 'thumb' ? activeFinger : ''} 
              status={activeFinger.startsWith('left') || activeFinger === 'thumb' ? lastKeyPressStatus : 'none'}
            />
          </div>

          {/* Keyboard */}
          <div className="z-10">
            <VirtualKeyboard activeKey={nextChar} pressedKeys={pressedKeys} />
          </div>

          {/* Right Hand */}
          <div className="hidden md:block pb-2">
            <HandGuide 
              hand="right" 
              activeFinger={activeFinger.startsWith('right') || activeFinger === 'thumb' ? activeFinger : ''} 
              status={activeFinger.startsWith('right') || activeFinger === 'thumb' ? lastKeyPressStatus : 'none'}
            />
          </div>
        </div>

        {/* Finish Test Early Button */}
        {!isFinished && startTime && (
          <div className="w-full max-w-4xl flex justify-center mt-2 z-10">
            <button 
              onClick={() => setIsFinished(true)} 
              className="flex items-center gap-2 bg-white/50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 px-6 py-2 rounded-full font-semibold text-sm transition-all duration-300 shadow-sm"
              title="Finish test immediately and view results"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Finish Test Early
            </button>
          </div>
        )}
      </div>

      {/* ===== RESULT MODAL ===== */}
      {isFinished && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
            {canPass ? (
              <>
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-4xl font-black text-slate-800 mb-1">Level Complete!</h2>
                <p className="text-slate-500 mb-6 text-sm">Great job! You've passed this level.</p>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Gross</span>
                    <span className="text-2xl font-black text-slate-700">{wpm} WPM</span>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl">
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Net Speed</span>
                    <span className="text-2xl font-black text-indigo-600">{netWpm} WPM</span>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest block mb-1">Accuracy</span>
                    <span className="text-2xl font-black text-emerald-600">{accuracy}%</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link 
                    to="/learn" 
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm transition-all border border-slate-300"
                  >
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
                <div className="text-6xl mb-4">💪</div>
                <h2 className="text-4xl font-black text-slate-800 mb-1">Keep Practicing!</h2>
                <p className="text-slate-500 mb-2 text-sm">You need at least <span className="text-rose-500 font-bold">{currentLesson.minWpm} WPM</span> to pass.</p>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-slate-100 p-3 rounded-2xl">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Gross</span>
                    <span className="text-xl font-black text-slate-800">{wpm} WPM</span>
                  </div>
                  <div className="bg-slate-100 p-3 rounded-2xl">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Net Speed</span>
                    <span className="text-xl font-black text-slate-800">{netWpm} WPM</span>
                  </div>
                  <div className="bg-slate-100 p-3 rounded-2xl">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Accuracy</span>
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
