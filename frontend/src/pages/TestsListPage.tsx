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
      className="relative flex flex-col justify-between w-full h-[150px] p-5 rounded-2xl text-white overflow-hidden group transition-transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#5936B4]/30"
      style={{
        background: 'linear-gradient(90deg, #5936B4 0%, #362A84 100%)'
      }}
    >
      {/* Typewriter SVG Simulation matching Uiverse style */}
      <div className="absolute right-0 top-0 text-white/10 group-hover:text-white/20 transition-colors pointer-events-none opacity-50">
        <svg height="100" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="transform translate-x-4 -translate-y-2 group-hover:scale-105 transition-transform">
          <path d="M4 18h16a2 2 0 002-2v-4a2 2 0 00-2-2H4a2 2 0 00-2 2v4a2 2 0 002 2zM3 14a1 1 0 011-1h16a1 1 0 011 1v2H3v-2z" />
          <path d="M6 10h12v-4a2 2 0 00-2-2H8a2 2 0 00-2 2v4zm2-4h8v2H8V6z" />
          <path d="M5 15h2v2H5zM9 15h2v2H9zM13 15h2v2h-2zM17 15h2v2h-2z" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          {test.created_at && (
            <div className="text-[rgba(235,235,245,0.80)] text-[10px] font-semibold mb-1 tracking-wide uppercase">
              {new Date(test.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date(test.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
          {/* Main Text (Title) */}
          <h3 className="text-xl font-bold line-clamp-2 pr-8 leading-tight tracking-tight">
            {test.title}
          </h3>
        </div>

        {/* Info Block */}
        <div className="flex justify-between items-end text-[rgba(235,235,245,0.60)] text-xs font-medium w-full">
          <div className="flex flex-col gap-0.5">
            <span className="uppercase tracking-wider">{test.difficulty_level || 'Medium'}</span>
            <span className="text-white/90">{test.word_count || 1000} words</span>
          </div>
          
          <div className="flex items-center gap-1 self-end bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-white font-bold group-hover:bg-white/20 transition-colors">
            <span>Start Test</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
