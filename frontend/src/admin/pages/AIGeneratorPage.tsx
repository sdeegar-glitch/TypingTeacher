import { useEffect, useState } from 'react';
import { Cpu, Loader2, CheckCircle, XCircle, Languages, Type } from 'lucide-react';
import { triggerGeneration, fetchGenerationLog, type GenerationSlot, type GenerationLogEntry } from '../api';

const SLOTS: { slot: GenerationSlot; label: string; icon: typeof Type }[] = [
  { slot: 'en', label: 'English', icon: Type },
  { slot: 'hi_mangal', label: 'Hindi — Mangal/Inscript', icon: Languages },
  { slot: 'hi_kruti', label: 'Hindi — Kruti Dev', icon: Languages },
];

const STATUS_STYLE: Record<string, string> = {
  success: 'bg-emerald-500/20 text-emerald-400',
  failed: 'bg-rose-500/20 text-rose-400',
  skipped_duplicate: 'bg-amber-500/20 text-amber-400',
  skipped_quality: 'bg-amber-500/20 text-amber-400',
};

export default function AIGeneratorPage() {
  const [logs, setLogs] = useState<GenerationLogEntry[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [triggering, setTriggering] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadLogs = () => {
    fetchGenerationLog().then(({ logs, summary }) => { setLogs(logs); setSummary(summary); }).catch(() => {});
  };

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 15000);
    return () => clearInterval(interval);
  }, []);

  const trigger = async (slot?: GenerationSlot) => {
    setTriggering(slot || 'full');
    setError(''); setMessage('');
    try {
      const res = await triggerGeneration(slot, slot ? 1 : undefined);
      setMessage(res.message);
      setTimeout(loadLogs, 8000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start generation.');
    } finally {
      setTriggering(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
          <Cpu size={20} className="text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">AI Test Generator</h1>
          <p className="text-slate-400 text-sm">Gemini 2.0 Flash · Google Search grounding + Wikipedia fallback · auto dedup &amp; quality gate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 space-y-5">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-bold">Trigger Generation</h3>
            <p className="text-xs text-slate-500">
              Each slot picks a random topic from the category pool, sources factual material, rewrites it into a
              unique 600–1500 word passage, runs it through the quality gate and duplicate check, then publishes it
              automatically — there's no manual topic input or preview/edit step in this pipeline.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SLOTS.map(({ slot, label, icon: Icon }) => (
                <button
                  key={slot}
                  onClick={() => trigger(slot)}
                  disabled={triggering !== null}
                  className="flex flex-col items-center gap-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 border border-white/10 rounded-xl px-4 py-4 transition-colors"
                >
                  {triggering === slot ? <Loader2 size={20} className="animate-spin text-indigo-400" /> : <Icon size={20} className="text-indigo-400" />}
                  <span className="text-sm text-slate-200 font-semibold">{label}</span>
                  <span className="text-[10px] text-slate-500">1 test</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => trigger()}
              disabled={triggering !== null}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {triggering === 'full' ? <><Loader2 size={18} className="animate-spin" /> Starting...</> : <><Cpu size={18} /> Run Full Daily Batch (12 tests)</>}
            </button>

            {message && (
              <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl px-4 py-3 text-indigo-300 text-sm">
                <CheckCircle size={16} /> {message}
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3 text-rose-400 text-sm">
                <XCircle size={16} /> {error}
              </div>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4">Generation Log</h3>
            <div className="space-y-2 max-h-[28rem] overflow-y-auto">
              {logs.length === 0 && <p className="text-sm text-slate-500">No generation runs yet.</p>}
              {logs.map(log => (
                <div key={log.id} className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
                  <span className={`mt-0.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[log.status] || 'bg-white/10 text-slate-300'}`}>
                    {log.status.replace(/_/g, ' ')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-200 truncate">{log.topic || '—'} <span className="text-slate-500">· {log.slot}</span></p>
                    {log.error && <p className="text-xs text-rose-400/80 truncate">{log.error}</p>}
                  </div>
                  <span className="text-xs text-slate-500 shrink-0">{new Date(log.created_at).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right - Stats + Schedule */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4">Last 200 Attempts</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Success</span><span className="text-emerald-400 font-semibold">{summary.success || 0}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Failed</span><span className="text-rose-400 font-semibold">{summary.failed || 0}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Skipped (duplicate)</span><span className="text-amber-400 font-semibold">{summary.skipped_duplicate || 0}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Skipped (quality)</span><span className="text-amber-400 font-semibold">{summary.skipped_quality || 0}</span></div>
            </div>
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-indigo-400 font-bold mb-3">
              <Cpu size={16} /> Auto-Generation Schedule
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Daily run</span>
                <span className="text-white font-semibold">3:00 AM IST</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tests per run</span>
                <span className="text-white font-semibold">12 (4 EN + 4 HI/Mangal + 4 HI/Kruti)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Word count</span>
                <span className="text-white font-semibold">600–1500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Difficulty mix</span>
                <span className="text-white font-semibold">40% easy / 40% med / 20% hard</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dedup</span>
                <span className="text-white font-semibold">SHA256 + cosine similarity &lt;20%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Source</span>
                <span className="text-white font-semibold text-right">Gemini Search + Wikipedia</span>
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
