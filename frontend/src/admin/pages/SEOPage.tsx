import { useState } from 'react';
import { Search, FileText, Link, BarChart2, CheckCircle } from 'lucide-react';

const SEO_PAGES = [
  { page: 'Homepage', url: '/', title: 'FastTypingLab — Free Online Typing Speed Test', desc: 'Practice typing with AI-generated editorial content. Improve WPM and accuracy.', score: 92 },
  { page: 'Tests Page', url: '/tests', title: 'Typing Tests | FastTypingLab', desc: 'Choose from hundreds of typing tests sorted by difficulty level.', score: 78 },
  { page: 'Leaderboard', url: '/leaderboard', title: 'Top Typists Leaderboard | FastTypingLab', desc: 'See top typists globally ranked by WPM and accuracy.', score: 65 },
];

function ScoreRing({ score }: { score: number }) {
  const color = score >= 85 ? 'text-emerald-400' : score >= 65 ? 'text-amber-400' : 'text-rose-400';
  const bg = score >= 85 ? 'bg-emerald-500/10 border-emerald-500/30' : score >= 65 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-rose-500/10 border-rose-500/30';
  return (
    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-black ${color} ${bg}`}>
      {score}
    </div>
  );
}

export default function SEOPage() {
  const [pages, setPages] = useState(SEO_PAGES);
  const [editing, setEditing] = useState<number | null>(null);
  const [sitemapGenerated, setSitemapGenerated] = useState(false);
  const [robotsTxt, setRobotsTxt] = useState(`User-agent: *\nAllow: /\nSitemap: https://fasttypinglab.com/sitemap.xml`);

  const generateSitemap = () => {
    setSitemapGenerated(true);
    setTimeout(() => setSitemapGenerated(false), 3000);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">SEO Manager</h1>
        <p className="text-slate-400 text-sm mt-1">Optimize every page for search engines</p>
      </div>

      {/* SEO Pages Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-indigo-400" />
            <h3 className="text-white font-bold">Page SEO</h3>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input placeholder="Search pages..." className="pl-8 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500/50" />
          </div>
        </div>
        <div className="divide-y divide-white/5">
          {pages.map((p, idx) => (
            <div key={idx}>
              <div className="px-5 py-4 flex items-center gap-4">
                <ScoreRing score={p.score} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-white font-semibold text-sm">{p.page}</span>
                    <span className="text-xs text-slate-500 font-mono">{p.url}</span>
                  </div>
                  <p className="text-xs text-slate-300 truncate">{p.title}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{p.desc}</p>
                </div>
                <button onClick={() => setEditing(editing === idx ? null : idx)} className="shrink-0 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-3 py-1.5 rounded-lg transition-colors">
                  {editing === idx ? 'Close' : 'Edit'}
                </button>
              </div>
              {editing === idx && (
                <div className="px-5 pb-5 space-y-3 bg-white/3">
                  <div>
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Meta Title ({p.title.length}/60 chars)</label>
                    <input
                      value={p.title}
                      onChange={e => setPages(prev => prev.map((x, i) => i === idx ? { ...x, title: e.target.value } : x))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    />
                    <div className="mt-1 flex gap-1">
                      <div className={`h-1 rounded flex-1 ${p.title.length > 60 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Meta Description ({p.desc.length}/160 chars)</label>
                    <textarea
                      rows={2}
                      value={p.desc}
                      onChange={e => setPages(prev => prev.map((x, i) => i === idx ? { ...x, desc: e.target.value } : x))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none"
                    />
                  </div>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tools Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sitemap */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Link size={16} className="text-indigo-400" />
            <h3 className="text-white font-bold">Sitemap</h3>
          </div>
          <p className="text-xs text-slate-400">Auto-generate sitemap.xml from all published pages and tests.</p>
          {sitemapGenerated && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
              <CheckCircle size={14} /> Sitemap generated at /sitemap.xml
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={generateSitemap} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
              Generate Sitemap
            </button>
            <a href="https://fasttypinglab.com/sitemap.xml" target="_blank" rel="noreferrer" className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
              View Live
            </a>
          </div>
        </div>

        {/* Robots */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart2 size={16} className="text-indigo-400" />
            <h3 className="text-white font-bold">Robots.txt</h3>
          </div>
          <textarea
            rows={4}
            value={robotsTxt}
            onChange={e => setRobotsTxt(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-xs text-emerald-400 font-mono focus:outline-none resize-none"
          />
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            Save Robots.txt
          </button>
        </div>
      </div>
    </div>
  );
}
