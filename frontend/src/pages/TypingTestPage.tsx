import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import VirtualKeyboard from '../components/VirtualKeyboard';
import HandGuide from '../components/HandGuide';
import { getFingerForKey } from '../utils/KeyboardLayout';

const sampleTexts: Record<string, { title: string; content: string }> = {
  '1': {
    title: 'Easy Paragraph Drill',
    content: 'the quick brown fox jumps over the lazy dog. focus on keeping your hands relaxed and moving smoothly between keys.'
  },
  '2': {
    title: 'Home Row Extended',
    content: 'sad lass fall lads salad all; ask dad for a salad; a sad fall for a young lad; dad asks a lass.'
  },
  '3': {
    title: 'Common Word Flow',
    content: 'with the rapid development of technology and internet, touch typing has become an essential skill for everyday work and life.'
  }
};

import { useLocation } from 'react-router-dom';

const TypingTestPage = () => {
  const { id, duration, profession, language } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryDuration = searchParams.get('duration');
  
  // SEO Meta Titles dynamically generated based on routes
  useEffect(() => {
    let title = 'Typing Speed Test | FastTypingLab';
    if (duration || queryDuration) title = `${duration || (Number(queryDuration)/60) + ' min'} Typing Test | FastTypingLab`;
    if (profession) title = `Typing Test for ${profession.charAt(0).toUpperCase() + profession.slice(1)} | FastTypingLab`;
    if (language) title = `${language.charAt(0).toUpperCase() + language.slice(1)} Typing Test | FastTypingLab`;
    document.title = title;
  }, [duration, profession, language, queryDuration]);

  const [activeTest, setActiveTest] = useState<{title: string, content: string}>(sampleTexts['1']);
  const [loadingTest, setLoadingTest] = useState(true);

  // Fetch active test
  useEffect(() => {
    if (id && !sampleTexts[id]) {
      fetch(`https://typingteacher-2lnd.onrender.com/api/tests/${id}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.content) {
            setActiveTest(data);
          } else {
            setActiveTest(sampleTexts['1']);
          }
          setLoadingTest(false);
        })
        .catch(() => {
          setActiveTest(sampleTexts['1']);
          setLoadingTest(false);
        });
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
  
  // Programmatic duration parsing
  const routeDuration = duration ? parseInt(duration) * 60 : NaN;
  const urlDuration = queryDuration ? parseInt(queryDuration) : NaN;
  const TEST_DURATION = !isNaN(urlDuration) ? urlDuration : (!isNaN(routeDuration) ? routeDuration : 60);
  
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  useEffect(() => {
    setTimeLeft(TEST_DURATION);
  }, [TEST_DURATION]);
  const [lastKeyPressStatus, setLastKeyPressStatus] = useState<'none' | 'correct' | 'error'>('none');
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  // Countdown timer
  useEffect(() => {
    let interval: any;
    if (startTime && !isFinished && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsFinished(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, isFinished, timeLeft]);

  // Submit test results to backend automatically on completion
  useEffect(() => {
    if (isFinished && startTime) {
      const timeTaken = TEST_DURATION - timeLeft || 1;
      const finalAccuracy = Math.round(((userInput.length - mistakes.length) / userInput.length) * 100);
      
      const submitResults = async () => {
        try {
          const response = await fetch('https://typingteacher-2lnd.onrender.com/test_sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              test_id: Number(id) || null,
              duration: timeTaken,
              gross_wpm: Math.round((userInput.length / 5) / (timeTaken / 60)),
              net_wpm: wpm,
              errors: mistakes.length,
              accuracy: finalAccuracy
            })
          });
          if (response.ok) {
            console.log("Test session saved to backend successfully.");
          }
        } catch (err) {
          console.error("Error submitting test results:", err);
        }
      };
      
      submitResults();
    }
  }, [isFinished]);

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

  // Calculate real-time speed and handle text completion
  useEffect(() => {
    if (userInput.length === targetContent.length && userInput.length > 0) {
      setIsFinished(true);
    }
    
    if (startTime && userInput.length > 0 && !isFinished) {
      const timeElapsedMinutes = (TEST_DURATION - timeLeft) / 60 || 0.01;
      const currentWpm = Math.round((userInput.length / 5) / timeElapsedMinutes);
      setWpm(currentWpm);
    }
  }, [userInput, targetContent, startTime, isFinished, timeLeft]);

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

  const progress = targetContent.length > 0 ? (userInput.length / targetContent.length) * 100 : 0;
  
  // Format MM:SS for countdown timer
  const formattedTime = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`;

  if (loadingTest) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="h-screen bg-[#f5f5f0] text-[#1e293b] flex flex-col overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* ===== TOP HEADER BAR (100% Identical to Learning Page) ===== */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0 z-50 shadow-sm">
        {/* Left: Back + Title */}
        <div className="flex items-center gap-4 min-w-0 self-start md:self-auto w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-4">
            <Link 
              to="/tests" 
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="w-px h-5 bg-slate-200"></div>
            <div>
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest block">Practice Test #{id || '1'}</span>
              <h1 className="text-sm font-bold text-slate-800 leading-none truncate max-w-[150px] sm:max-w-xs">{activeTest.title}</h1>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="md:hidden flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all border border-slate-300"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Center: Finger hint */}
        {nextChar && !isFinished && (
          <div className="hidden sm:flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-4 py-1.5 rounded-full">
            <span className="text-xs text-indigo-600">Type</span>
            <kbd className="bg-indigo-600 text-white text-xs font-black px-2 py-0.5 rounded-md min-w-[24px] text-center">
              {nextChar === ' ' ? '⎵' : nextChar.toUpperCase()}
            </kbd>
            <span className="text-xs text-indigo-600">with <span className="text-indigo-800 font-semibold">{activeFinger.replace('left-', 'L ').replace('right-', 'R ')}</span></span>
          </div>
        )}

        {/* Right: Stats + Restart */}
        <div className="flex items-center gap-4 sm:gap-5 w-full md:w-auto justify-around md:justify-end">
          {/* Time */}
          <div className="text-center">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Time</span>
            <span className="text-base sm:text-lg font-black text-slate-800 tabular-nums">{formattedTime}</span>
          </div>
          {/* WPM */}
          <div className="text-center">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Speed</span>
            <span className="text-base sm:text-lg font-black text-indigo-600 tabular-nums">{wpm} WPM</span>
          </div>
          {/* Accuracy */}
          <div className="text-center">
            <span className="text-[9px] text-slate-400 uppercase tracking-widest block">Acc</span>
            <span className={`text-base sm:text-lg font-black tabular-nums ${accuracy >= 90 ? 'text-emerald-600' : 'text-rose-500'}`}>{accuracy}%</span>
          </div>
          {/* Restart (Desktop) */}
          <button 
            onClick={() => window.location.reload()} 
            className="hidden md:flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all border border-slate-300"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Restart
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="shrink-0 h-1 bg-slate-800">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-grow flex flex-col items-center justify-center gap-4 px-4 py-3 overflow-hidden">
        
        {/* ── Typing Area ── */}
        <div className="w-full max-w-4xl">
          <div className="bg-white border border-gray-200 rounded-2xl px-8 py-5 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent"></div>
            
            <div className="overflow-x-hidden whitespace-nowrap relative">
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
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
                        ${status === 'upcoming' ? 'text-gray-300' : ''}
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
                  <div className="text-4xl mb-2">⚡</div>
                  <p className="text-slate-500 font-semibold">Start typing to begin your test…</p>
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
      </div>

      {/* ===== RESULT MODAL ===== */}
      {isFinished && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white border border-gray-200 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-4xl font-black text-slate-800 mb-1">Test Completed!</h2>
            <p className="text-slate-500 mb-6 text-sm">Your typing test results have been registered.</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl">
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Final Speed</span>
                <span className="text-2xl font-black text-indigo-600">{wpm} WPM</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest block mb-1">Accuracy</span>
                <span className="text-2xl font-black text-emerald-600">{accuracy}%</span>
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
                Tests Library
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypingTestPage;
