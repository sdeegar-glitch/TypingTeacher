import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Star, Eye, Globe, GlobeLock, RefreshCw } from 'lucide-react';
import type { TypingTest } from '../types';
import { fetchTypingTests, deleteTypingTest } from '../api';

const DIFF_COLORS: Record<string, string> = {
  easy: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  hard: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
};

export default function TestsPage() {
  const [tests, setTests] = useState<TypingTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDiff, setFilterDiff] = useState('all');
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    setLoading(true);
    const data = await fetchTypingTests();
    setTests(data);
    setLoading(false);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this test?')) return;
    const ok = await deleteTypingTest(id);
    if (ok) {
      setTests(prev => prev.filter(t => t.id !== id));
      showToast('Test deleted.');
    }
  };

  const triggerGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('https://typingteacher-2lnd.onrender.com/api/tests/generate', { method: 'POST' });
      if (res.ok) {
        showToast('AI generation started in background. Refresh in ~30s.');
        setTimeout(() => loadTests(), 35000);
      }
    } finally {
      setGenerating(false);
    }
  };

  const filtered = tests.filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    const matchDiff = filterDiff === 'all' || t.difficulty_level === filterDiff;
    return matchSearch && matchDiff;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-indigo-600 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-2xl border border-indigo-500/50">
          {toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">Typing Tests</h1>
          <p className="text-slate-400 text-sm mt-1">{filtered.length} tests · AI-generated daily</p>
        </div>
        <div className="flex gap-3">
          <button onClick={triggerGenerate} disabled={generating} className="flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
            <RefreshCw size={16} className={generating ? 'animate-spin' : ''} />
            {generating ? 'Generating...' : 'AI Generate'}
          </button>
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
            <Plus size={16} /> New Test
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search tests..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
        {['all', 'easy', 'medium', 'hard'].map(d => (
          <button
            key={d}
            onClick={() => setFilterDiff(d)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors capitalize ${filterDiff === d ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'}`}
          >
            {d === 'all' ? 'All Levels' : d}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-slate-500">
          <div className="text-5xl mb-4">📄</div>
          <p className="font-semibold text-lg text-slate-400">No tests found</p>
          <p className="text-sm mt-1">Try generating via AI or adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(test => (
            <div key={test.id} className="bg-white/5 border border-white/10 hover:border-indigo-500/40 rounded-2xl p-5 flex flex-col gap-3 group transition-all">
              <div className="flex items-start justify-between gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${DIFF_COLORS[test.difficulty_level] || DIFF_COLORS.medium}`}>
                  {test.difficulty_level}
                </span>
                <div className="flex items-center gap-1">
                  {test.is_featured && <Star size={14} className="text-amber-400 fill-amber-400" />}
                  {test.is_published ? <Globe size={14} className="text-emerald-400" /> : <GlobeLock size={14} className="text-slate-500" />}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-white text-sm line-clamp-2 group-hover:text-indigo-300 transition-colors">{test.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{test.excerpt || '—'}</p>
              </div>

              <div className="flex gap-3 text-xs text-slate-400 pt-2 border-t border-white/5">
                <span>{test.word_count} words</span>
                <span>·</span>
                <span>{test.category || 'General'}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Eye size={11} /> {test.views}</span>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <button className="flex-1 text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 py-2 rounded-lg font-semibold transition-colors">
                  Edit
                </button>
                <button onClick={() => handleDelete(test.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
