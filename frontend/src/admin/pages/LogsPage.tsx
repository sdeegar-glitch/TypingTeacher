import { ClipboardList, Download } from 'lucide-react';
import { MOCK_ACTIVITY_LOGS, MOCK_AI_LOGS } from '../api';

function StatusBadge({ status }: { status: string }) {
  const cls = status === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    : status === 'warning' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    : 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  return <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${cls}`}>{status}</span>;
}

export default function LogsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Reports & Logs</h1>
          <p className="text-slate-400 text-sm mt-1">System audit trail and activity history</p>
        </div>
        <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          <Download size={16} /> Export Logs
        </button>
      </div>

      {/* Activity Logs */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
          <ClipboardList size={16} className="text-indigo-400" />
          <h3 className="text-white font-bold">Activity Logs</h3>
          <span className="ml-auto text-xs bg-white/5 border border-white/10 text-slate-400 px-2 py-0.5 rounded-full">{MOCK_ACTIVITY_LOGS.length} entries</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Timestamp', 'Action', 'Entity', 'User', 'IP Address', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MOCK_ACTIVITY_LOGS.map(log => (
                <tr key={log.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 text-xs text-slate-400 font-mono whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{log.action}</td>
                  <td className="px-4 py-3 text-xs text-slate-400 font-mono">{log.entity}</td>
                  <td className="px-4 py-3 text-xs text-slate-300">{log.user}</td>
                  <td className="px-4 py-3 text-xs text-slate-400 font-mono">{log.ip}</td>
                  <td className="px-4 py-3"><StatusBadge status={log.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Generation Logs */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
          <span className="text-indigo-400">🤖</span>
          <h3 className="text-white font-bold">AI Generation Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {['Date', 'Title', 'Source', 'Tokens', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {MOCK_AI_LOGS.map(log => (
                <tr key={log.id} className="hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">{new Date(log.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3 text-sm text-white max-w-xs truncate">{log.title}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{log.source_url || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-300">{log.tokens_used ? `${log.tokens_used} tokens` : '—'}</td>
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
