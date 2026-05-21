import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadProgress } from '../utils/progressManager';

// Match the 50 lessons from the interface
const generateLessons = () => {
  const titles = [
    'f and j Keys', 'Spacebar Power', 'd and k Keys', 'f, j, d, k Review', 's and l Keys', 
    'a and ; Keys', 'Home Row Master', 'e and i Keys', 'r and u Keys', 't and y Keys',
    'w and o Keys', 'The q and p keys', 'Top Row Mastery', 'The v and n keys', 'The c and m keys',
    'The x and , keys', 'The z and . keys', 'Bottom Row Mastery', 'The Shift Keys', 'Capitals Practice'
  ];
  
  const lessons = [];
  for (let i = 1; i <= 50; i++) {
    lessons.push({
      id: i,
      title: titles[i - 1] || `Practice Level ${i}`,
      description: i <= 20 ? 'Standard Drill' : 'Advanced Fluency'
    });
  }
  return lessons;
};

const lessons = generateLessons();

const LearningCoursePage = () => {
  const [progress, setProgress] = useState<Record<string, any>>({});

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const isUnlocked = (id: number) => {
    if (id === 1) return true;
    const prev = progress[(id - 1).toString()];
    return !!(prev && prev.completed);
  };

  const getStars = (id: number) => {
    return progress[id.toString()]?.stars || 0;
  };

  const isCompleted = (id: number) => {
    return !!progress[id.toString()]?.completed;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-['Inter', sans-serif] pb-20">
      
      {/* Dynamic Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-blue-100 p-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-2xl font-black text-blue-600 tracking-tighter">TypingJungle</Link>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Mastery</span>
              <span className="text-lg font-black text-blue-900">{Object.keys(progress).length} / 50</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500 shadow-lg shadow-blue-200 border-2 border-white flex items-center justify-center text-white font-bold">A</div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto pt-10 px-4 relative">
        <h2 className="text-3xl font-black text-blue-900 mb-1 text-center tracking-tight">Main Path</h2>
        <p className="text-center text-blue-400 font-medium mb-12 uppercase tracking-widest text-[10px]">Cloud sync active</p>

        {/* The Path Line */}
        <div className="absolute left-1/2 top-48 bottom-0 w-3 bg-blue-100/50 -translate-x-1/2 rounded-full z-0 hidden md:block"></div>

        <div className="flex flex-col gap-24 relative z-10">
          {lessons.map((lesson, index) => {
            const isLeft = index % 2 === 0;
            const unlocked = isUnlocked(lesson.id);
            const completed = isCompleted(lesson.id);
            const stars = getStars(lesson.id);

            return (
              <div key={lesson.id} className={`flex flex-col md:flex-row items-center gap-4 md:gap-8 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} justify-center group`}>
                
                <div className={`w-full md:w-1/3 text-center md:${isLeft ? 'text-right' : 'text-left'} transition-all duration-300 ${!unlocked ? 'opacity-30' : 'group-hover:translate-y-[-2px]'} order-2 md:order-none`}>
                  <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1 block">Level {lesson.id}</span>
                  <h3 className="text-xl font-black text-blue-900 leading-tight">{lesson.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{lesson.description}</p>
                </div>

                <div className="relative order-1 md:order-none">
                  {unlocked && !completed && (
                    <div className="absolute inset-[-15px] bg-blue-400/20 rounded-full animate-pulse"></div>
                  )}
                  
                  <Link 
                    to={unlocked ? `/learn/${lesson.id}` : '#'}
                    className={`
                      relative w-24 h-24 rounded-[35%] flex flex-col items-center justify-center transition-all duration-300 transform shadow-xl border-b-8
                      ${!unlocked ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300' : 
                        completed ? 'bg-green-500 text-white border-green-700 hover:scale-110 active:translate-y-[4px] active:border-b-0' :
                        'bg-blue-500 text-white border-blue-700 hover:scale-110 active:translate-y-[4px] active:border-b-0'
                      }
                    `}
                  >
                    {!unlocked ? (
                      <svg className="w-8 h-8 opacity-40" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                    ) : (
                      <>
                        <span className="text-3xl font-black">{lesson.id}</span>
                        {stars > 0 && <div className="text-[10px] absolute -bottom-2 bg-white text-yellow-500 px-2 py-0.5 rounded-full shadow-md font-black">{'⭐'.repeat(stars)}</div>}
                        {!completed && unlocked && <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded-full animate-bounce">START</span>}
                      </>
                    )}
                  </Link>
                </div>

                <div className="hidden md:block w-1/3 order-3 md:order-none"></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LearningCoursePage;
