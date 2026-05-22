import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'https://typingteacher-2lnd.onrender.com/api/tests';

export default function HomePage() {
  const [latestTests, setLatestTests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/latest`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLatestTests(data);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-40 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-white dark:from-slate-800 dark:to-slate-900 -z-10" />
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-500">
            Master Typing. <br className="hidden md:block"/> Elevate Your Speed.
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
            Practice typing with AI-generated, daily-updated editorial content from Top News Sources. Build speed, accuracy, and vocabulary.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative mb-12">
            <input 
              type="text" 
              placeholder="Search tests, categories, or keywords..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg transition-all"
            />
            <button className="absolute right-2 top-2 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/learn" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-indigo-500/30 text-lg transition-all hover:-translate-y-1">
              Start Learning Path
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Tests Section */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Latest Editorial Tests</h2>
              <p className="text-slate-500 dark:text-slate-400">Fresh content generated daily.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestTests.map(test => (
              <TestCard key={test.id} test={test} />
            ))}
            {latestTests.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">
                Loading latest tests... (or no tests available yet)
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function TestCard({ test }: { test: any }) {
  const diffColors: Record<string, string> = {
    easy: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    hard: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
  };

  return (
    <div className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex justify-between items-start mb-4">
        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${diffColors[test.difficulty_level || 'medium']}`}>
          {test.difficulty_level || 'Medium'}
        </span>
        <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
          {test.category || 'General'}
        </span>
      </div>
      
      <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {test.title}
      </h3>
      
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 line-clamp-3 flex-grow">
        {test.excerpt || 'Practice typing with this new engaging text.'}
      </p>
      
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
        <div className="flex gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            {test.word_count || 1000} words
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {test.estimated_read_time || 5}m
          </span>
        </div>
        
        <Link 
          to={`/tests/config/${test.slug || test.id}`} 
          className="bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-600 text-indigo-600 hover:text-white dark:text-indigo-400 font-bold py-1.5 px-4 rounded-lg transition-colors text-sm"
        >
          Take Test
        </Link>
      </div>
    </div>
  );
}
