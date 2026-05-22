import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, BarChart, ChevronRight, Zap } from 'lucide-react';

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
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#09090b] py-12 px-6">
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map(test => (
              <TestCard key={test.id} test={test} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

function TestCard({ test }: { test: any }) {
  const diffColors: Record<string, string> = {
    easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    hard: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
  };

  return (
    <Link 
      to={`/tests/config/${test.slug || test.id}`}
      className="group bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-3xl p-6 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${diffColors[test.difficulty_level || 'medium']}`}>
          {test.difficulty_level || 'Medium'}
        </span>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
          {test.category || 'General'}
        </span>
      </div>

      <h3 className="text-xl font-bold mb-3 text-[#09090b] dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {test.title}
      </h3>

      <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-3 flex-grow">
        {test.excerpt || 'Practice typing with this new engaging text.'}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5 mt-auto">
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <BarChart className="w-4 h-4" />
            <span>{test.word_count || 1000} words</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{test.estimated_read_time || 5}m</span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}
