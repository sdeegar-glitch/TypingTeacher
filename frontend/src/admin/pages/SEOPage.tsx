import { useEffect, useState } from 'react';
import { Search, FileText, Link as LinkIcon, Download } from 'lucide-react';
import type { SeoTest } from '../types';
import { fetchAdminSeo, updateTestSeo, fetchSitemapPreview } from '../api';

function ScoreRing({ score }: { score: number }) {
  const color = score >= 85 ? 'text-emerald-400' : score >= 65 ? 'text-amber-400' : 'text-rose-400';
  const bg = score >= 85 ? 'bg-emerald-500/10 border-emerald-500/30' : score >= 65 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-rose-500/10 border-rose-500/30';
  return (
    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-black shrink-0 ${color} ${bg}`}>
      {score}
    </div>
  );
}

export default function SEOPage() {
  const [tests, setTests] = useState<SeoTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ seo_title: string; seo_description: string }>({ seo_title: '', seo_description: '' });
  const [saving, setSaving] = useState(false);
  const [sitemapXml, setSitemapXml] = useState('');
  const [loadingSitemap, setLoadingSitemap] = useState(false);

  useEffect(() => {
    fetchAdminSeo().then(setTests).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = tests.filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()));

  const startEdit = (t: SeoTest) => {
    setEditing(t.id);
    setDraft({ seo_title: t.seo_title || '', seo_description: t.seo_description || '' });
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    const ok = await updateTestSeo(id, draft);
    if (ok) setTests(prev => prev.map(t => t.id === id ? { ...t, ...draft } : t));
    setSaving(false);
    if (ok) setEditing(null);
  };

  const loadSitemap = async () => {
    setLoadingSitemap(true);
    try {
      setSitemapXml(await fetchSitemapPreview());
    } catch {
      setSitemapXml('Failed to load sitemap preview.');
    }
    setLoadingSitemap(false);
  };

  const downloadSitemap = () => {
    const blob = new Blob([sitemapXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'sitemap.xml'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">SEO Manager</h1>
        <p className="text-slate-400 text-sm mt-1">Real per-test SEO data from {tests.length} typing tests</p>
      </div>

      {/* Test SEO Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-indigo-400" />
            <h3 className="text-white font-bold">Typing Test SEO</h3>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tests..." className="pl-8 pr-4 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500/50" />
          </div>
        </div>
        <div className="divide-y divide-white/5 max-h-[480px] overflow-y-auto">
          {loading && <p className="px-5 py-6 text-sm text-slate-500">Loading…</p>}
          {!loading && filtered.length === 0 && <p className="px-5 py-6 text-sm text-slate-500">No tests found.</p>}
          {filtered.map(t => (
            <div key={t.id}>
              <div className="px-5 py-4 flex items-center gap-4">
                <ScoreRing score={t.score} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-white font-semibold text-sm truncate">{t.title}</span>
                    <span className="text-xs text-slate-500 font-mono shrink-0">/tests/{t.slug}</span>
                  </div>
                  <p className="text-xs text-slate-300 truncate">{t.seo_title || '— no SEO title set —'}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{t.seo_description || '— no SEO description set —'}</p>
                </div>
                <button onClick={() => editing === t.id ? setEditing(null) : startEdit(t)} className="shrink-0 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-3 py-1.5 rounded-lg transition-colors">
                  {editing === t.id ? 'Close' : 'Edit'}
                </button>
              </div>
              {editing === t.id && (
                <div className="px-5 pb-5 space-y-3 bg-white/3">
                  <div>
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Meta Title ({draft.seo_title.length}/60 chars)</label>
                    <input
                      value={draft.seo_title}
                      onChange={e => setDraft(d => ({ ...d, seo_title: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                    />
                    <div className={`mt-1 h-1 rounded ${draft.seo_title.length > 60 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Meta Description ({draft.seo_description.length}/160 chars)</label>
                    <textarea
                      rows={2}
                      value={draft.seo_description}
                      onChange={e => setDraft(d => ({ ...d, seo_description: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none"
                    />
                  </div>
                  <button onClick={() => saveEdit(t.id)} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sitemap */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <LinkIcon size={16} className="text-indigo-400" />
          <h3 className="text-white font-bold">Sitemap Preview</h3>
        </div>
        <p className="text-xs text-slate-400">
          Generates a fresh sitemap from all published tests. This previews what the file should contain — it doesn't auto-publish to the live site, since sitemap.xml ships as a static file with the frontend build.
        </p>
        <div className="flex gap-2">
          <button onClick={loadSitemap} disabled={loadingSitemap} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            {loadingSitemap ? 'Generating…' : 'Generate Preview'}
          </button>
          {sitemapXml && (
            <button onClick={downloadSitemap} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
              <Download size={14} /> Download
            </button>
          )}
          <a href="https://fasttypinglab.com/sitemap.xml" target="_blank" rel="noreferrer" className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            View Live
          </a>
        </div>
        {sitemapXml && (
          <textarea readOnly rows={8} value={sitemapXml} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-xs text-emerald-400 font-mono resize-none" />
        )}
      </div>
    </div>
  );
}
