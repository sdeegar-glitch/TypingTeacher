import { useEffect, useState } from 'react';
import { ClipboardList, Download } from 'lucide-react';
import type { ActivityLog } from '../types';
import { fetchAdminLogs } from '../api';

function StatusBadge({ status }: { status: string }) {
  const cls = status === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    : status === 'warning' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    : 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  return <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${cls}`}>{status}</span>;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminLogs().then(setLogs).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const exportCsv = () => {
    const header = 'Timestamp,Action,Entity,Actor,IP,Status\n';
    const rows = logs.map(l => [l.created_at, l.action, l.entity || '', l.actor_email || '', l.ip || '', l.status].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'activity-logs.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Reports & Logs</h1>
          <p className="text-slate-400 text-sm mt-1">Real system audit trail — logins, bans, deletes, AI generation</p>
        </div>
        <button onClick={exportCsv} disabled={!logs.length} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
          <ClipboardList size={16} className="text-indigo-400" />
          <h3 className="text-white font-bold">Activity Log</h3>
          <span className="ml-auto text-xs bg-white/5 border border-white/10 text-slate-400 px-2 py-0.5 rounded-full">{logs.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Timestamp', 'Action', 'Entity', 'Actor', 'IP Address', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">Loading…</td></tr>}
              {!loading && logs.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">No activity recorded yet.</td></tr>}
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 text-xs text-slate-400 font-mono whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{log.action.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-xs text-slate-400 font-mono">{log.entity || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-300">{log.actor_email || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-400 font-mono">{log.ip || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={log.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
