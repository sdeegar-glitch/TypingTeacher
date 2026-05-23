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
  return (
    <Link 
      to={`/tests/config/${test.slug || test.id}`}
      className="relative flex flex-col justify-between w-full h-[184px] p-5 rounded-2xl text-white overflow-hidden group transition-transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#5936B4]/30"
      style={{
        background: 'linear-gradient(90deg, #5936B4 0%, #362A84 100%)'
      }}
    >
      {/* Cloud SVG Simulation matching Uiverse style */}
      <div className="absolute right-0 -top-3 text-white/10 group-hover:text-white/20 transition-colors pointer-events-none">
        <svg height="120" viewBox="0 0 120 120" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 40C100 28.9543 91.0457 20 80 20C71.3093 20 63.9056 25.5414 61.1352 33.3082C58.8315 31.2582 55.8055 30 52.5 30C45.5964 30 40 35.5964 40 42.5C40 44.1793 40.3297 45.7818 40.9234 47.2355C34.7212 48.7451 30 54.3413 30 61C30 68.732 36.268 75 44 75H90C101.046 75 110 66.0457 110 55C110 47.4144 105.776 40.817 99.4182 37.6694C99.8003 38.4069 100 39.1882 100 40Z" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          {test.created_at && (
            <div className="text-[rgba(235,235,245,0.80)] text-xs font-semibold mb-2 tracking-wide uppercase">
              {new Date(test.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date(test.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
          {/* Main Text (Title) */}
          <h3 className="text-3xl font-bold line-clamp-2 pr-8 leading-tight tracking-tight">
            {test.title}
          </h3>
        </div>

        {/* Info Block */}
        <div className="flex justify-between items-end text-[rgba(235,235,245,0.60)] text-sm font-medium w-full">
          <div className="flex flex-col gap-1">
            <span className="uppercase tracking-wider text-xs">{test.difficulty_level || 'Medium'}</span>
            <span className="text-white/90">{test.word_count || 1000} words</span>
          </div>
          
          <div className="flex items-center gap-1 self-end bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white group-hover:bg-white/20 transition-colors">
            <span>{test.estimated_read_time || 5}m</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
