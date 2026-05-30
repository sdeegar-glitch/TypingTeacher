import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = 'https://typingteacher-2lnd.onrender.com/api/tests';

export default function TestConfigPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [customMinutes, setCustomMinutes] = useState(2);

  useEffect(() => {
    fetch(`${API_URL}/${slug}`)
      .then(res => res.json())
      .then(data => {
        setTest(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  const startTest = (minutes: number) => {
    navigate(`/tests/${slug}?duration=${minutes * 60}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  if (!test) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Test not found.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="p-8">
          <div className="mb-8 flex flex-col items-center text-center">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">
              {test.title}
            </h2>
            
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mb-6 bg-slate-100 dark:bg-slate-700/30 px-4 py-2 rounded-full">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                {test.word_count} words
              </span>
              <span className="opacity-40">•</span>
              <span className="capitalize">{test.difficulty_level || 'Medium'}</span>
              <span className="opacity-40">•</span>
              <span>{test.category || 'Typing'}</span>
            </div>

            {test.excerpt && (
              <p className="text-slate-600 dark:text-slate-300 text-sm italic mb-6 max-w-md mx-auto leading-relaxed border-l-2 border-indigo-200 pl-4 py-1 text-left">
                "{test.excerpt}"
              </p>
            )}

            <span className="text-xs sm:text-sm font-bold px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 uppercase tracking-widest shadow-sm mt-2 block w-max mx-auto">
              Select Time Duration
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[1, 3, 5, 10].map(mins => (
              <button
                key={mins}
                onClick={() => startTest(mins)}
                className="bg-slate-100 dark:bg-slate-700 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-200 font-bold py-4 rounded-xl transition-all shadow-sm hover:shadow-indigo-500/30"
              >
                {mins} Min
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            <input 
              type="number" 
              min="1" max="60" 
              value={customMinutes} 
              onChange={(e) => setCustomMinutes(Number(e.target.value))}
              className="w-24 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-center font-bold focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
            />
            <button 
              onClick={() => startTest(customMinutes)}
              className="flex-grow bg-slate-800 dark:bg-slate-600 hover:bg-slate-900 dark:hover:bg-slate-500 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Start Custom Time
            </button>
          </div>
          
          <button onClick={() => navigate('/tests')} className="mt-8 w-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium text-sm text-center">
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
