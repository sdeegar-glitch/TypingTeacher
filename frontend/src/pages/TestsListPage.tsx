import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Zap } from 'lucide-react';

const API_URL = 'https://typingteacher-2lnd.onrender.com/api/tests';

export default function TestsListPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/latest`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTests(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#09090b] py-8 px-4 sm:py-12 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-sky-50 dark:bg-sky-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-500/20">
            <Zap className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#09090b] dark:text-white mb-4 tracking-tight">
            Typing Tests Library
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Choose from our curated collection of editorial typing tests. Articles are automatically fetched daily to keep your practice fresh.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 rounded-3xl p-16">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No tests found</h3>
            <p className="text-slate-500">Check back later for new editorial content.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {tests.map(test => (
              <TestListItem key={test.id} test={test} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

function TestListItem({ test }: { test: any }) {
  return (
    <Link 
      to={`/tests/config/${test.slug || test.id}`}
      className="relative flex items-center justify-between w-full p-4 md:p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 group transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10"
    >
      <div className="flex-1 min-w-0 pr-4">
        {test.created_at && (
          <div className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1 tracking-wide uppercase">
            {new Date(test.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        )}
        <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white truncate mb-2">
          {test.title}
        </h3>
        
        <div className="flex items-center gap-3 sm:gap-4 text-slate-500 dark:text-slate-400 text-xs md:text-sm font-medium">
          <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md uppercase tracking-wider text-[10px] md:text-xs">
            {test.difficulty_level || 'Medium'}
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 opacity-70" />
            {test.word_count || 1000} words
          </span>
          {test.category && (
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <span className="opacity-50">•</span>
              {test.category}
            </span>
          )}
        </div>
      </div>
      
      <div className="shrink-0 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-full text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </div>
    </Link>
  );
}
