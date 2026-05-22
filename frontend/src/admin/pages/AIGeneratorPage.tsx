import { useState } from 'react';
import { Cpu, Loader2, CheckCircle, XCircle, RefreshCw, Save } from 'lucide-react';
import type { AIGenerationLog } from '../types';
import { MOCK_AI_LOGS, generateAIContent } from '../api';

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export default function AIGeneratorPage() {
  const [topic, setTopic] = useState('');
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [error, setError] = useState('');
  const [logs] = useState<AIGenerationLog[]>(MOCK_AI_LOGS);
  const [saved, setSaved] = useState(false);
  const [savingToDb, setSavingToDb] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setError('');
    setPreview(null);
    setSaved(false);

    // Use backend route for security (proxies Gemini API key server-side)
    try {
      const res = await fetch('https://typingteacher-2lnd.onrender.com/api/tests/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      if (res.ok) {
        // Backend generates async — show placeholder
        setPreview({
          title: `AI-Generated: ${topic}`,
          content: 'Generation started in background. Refresh tests list in ~30 seconds to see the new article.',
          excerpt: 'Background AI generation triggered successfully.',
          difficulty_level: 'medium',
          category: 'Editorial Typing',
          seo_title: `${topic} | FastTypingLab`,
          seo_description: `Practice typing with our article about ${topic}`,
          tags: [topic.toLowerCase(), 'editorial', 'typing'],
          keywords: [topic.toLowerCase(), 'typing practice'],
        });
      } else {
        setError('Backend generation failed. Trying direct API...');
        // Direct Gemini fallback
        const data = await generateAIContent(topic, GEMINI_KEY);
        if (data) {
          setPreview(data);
        } else {
          setError('AI generation failed. Check your Gemini API key or topic.');
        }
      }
    } catch {
      setError('Network error. Make sure backend is running.');
    } finally {
      setGenerating(false);
    }
  };

  const saveToDatabase = async () => {
    if (!preview) return;
    setSavingToDb(true);
    try {
      const wordCount = preview.content.split(/\s+/).length;
      const slug = preview.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
      const res = await fetch('https://typingteacher-2lnd.onrender.com/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...preview, slug, word_count: wordCount, estimated_read_time: Math.ceil(wordCount / 200), typing_duration_options: ['1min', '3min', '5min', '10min'] })
      });
      setSaved(res.ok);
      if (!res.ok) setError('Failed to save. Check API endpoint.');
    } catch {
      setError('Save failed.');
    } finally {
      setSavingToDb(false);
    }
  };

  const TOPICS = ['India economic reform', 'Climate change editorial', 'Technology innovation 2025', 'Global education crisis', 'Artificial intelligence ethics'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
          <Cpu size={20} className="text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">AI Test Generator</h1>
          <p className="text-slate-400 text-sm">Powered by Gemini 1.5 Flash · Auto-generates from The Hindu editorials</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left - Generator */}
        <div className="xl:col-span-3 space-y-5">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-bold">Generate New Typing Test</h3>

            <div>
              <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1.5 block">Topic / Article URL</label>
              <textarea
                rows={3}
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="Enter an article topic, URL, or paste a snippet from The Hindu..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none"
              />
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-2">Quick topics:</p>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map(t => (
                  <button key={t} onClick={() => setTopic(t)} className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-3 py-1 rounded-full transition-colors">
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 text-rose-400 text-sm">
                <XCircle size={16} /> {error}
              </div>
            )}

            <button
              onClick={generate}
              disabled={generating || !topic.trim()}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {generating ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : <><Cpu size={18} /> Generate with Gemini AI</>}
            </button>
          </div>

          {/* Preview */}
          {preview && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <CheckCircle size={16} /> Generated Successfully
                </div>
                <button onClick={() => setPreview(null)} className="text-slate-400 hover:text-white">
                  <RefreshCw size={14} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Title</label>
                  <input
                    value={preview.title}
                    onChange={e => setPreview({ ...preview, title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Content</label>
                  <textarea
                    rows={8}
                    value={preview.content}
                    onChange={e => setPreview({ ...preview, content: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none leading-relaxed"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Difficulty</label>
                    <select
                      value={preview.difficulty_level}
                      onChange={e => setPreview({ ...preview, difficulty_level: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">Category</label>
                    <input
                      value={preview.category}
                      onChange={e => setPreview({ ...preview, category: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">SEO Title</label>
                  <input
                    value={preview.seo_title || ''}
                    onChange={e => setPreview({ ...preview, seo_title: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">SEO Description</label>
                  <textarea
                    rows={2}
                    value={preview.seo_description || ''}
                    onChange={e => setPreview({ ...preview, seo_description: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none"
                  />
                </div>
              </div>

              {saved ? (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-400 text-sm font-semibold">
                  <CheckCircle size={16} /> Saved to database successfully!
                </div>
              ) : (
                <button onClick={saveToDatabase} disabled={savingToDb} className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors">
                  {savingToDb ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {savingToDb ? 'Saving...' : 'Save to Database'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right - History */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4">Generation History</h3>
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                  <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${log.status === 'success' ? 'bg-emerald-400' : log.status === 'failed' ? 'bg-rose-400' : 'bg-amber-400'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-200 font-medium truncate">{log.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${log.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {log.status}
                      </span>
                      {log.tokens_used && (
                        <span className="text-xs text-slate-500">{log.tokens_used} tokens</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{new Date(log.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-indigo-400 font-bold mb-3">
              <Cpu size={16} /> Auto-Generation Schedule
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Daily runs</span>
                <span className="text-white font-semibold">00:00 & 12:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Articles per run</span>
                <span className="text-white font-semibold">2 articles</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Source</span>
                <span className="text-white font-semibold">The Hindu RSS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse" /> Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
