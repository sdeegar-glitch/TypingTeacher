import { Shield } from 'lucide-react';
import { MOCK_ACTIVITY_LOGS } from '../api';

const SECURITY_CHECKS = [
  { label: 'HTTPS Enabled', status: 'ok' },
  { label: 'Rate Limiting Active', status: 'ok' },
  { label: 'CORS Configured', status: 'ok' },
  { label: 'Helmet.js Headers', status: 'ok' },
  { label: 'SQL Injection Protection', status: 'ok' },
  { label: 'Two-Factor Auth', status: 'warning', note: 'Enable for all admins' },
  { label: 'Brute Force Protection', status: 'ok' },
  { label: 'XSS Protection', status: 'ok' },
  { label: 'Audit Logging', status: 'ok' },
  { label: 'Session Expiration', status: 'warning', note: 'Consider reducing to 24h' },
];

const LOGIN_HISTORY = [
  { ip: '103.1.2.3', country: '🇮🇳 India', device: 'Chrome / Windows', time: '2 mins ago', status: 'success' },
  { ip: '192.168.1.1', country: '🌐 Unknown', device: 'curl/7.68', time: '3 hrs ago', status: 'failed' },
  { ip: '203.0.113.50', country: '🇺🇸 US', device: 'Safari / macOS', time: '1 day ago', status: 'success' },
];

export default function SecurityPage() {
  const securityScore = Math.round(SECURITY_CHECKS.filter(c => c.status === 'ok').length / SECURITY_CHECKS.length * 100);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Security Center</h1>
        <p className="text-slate-400 text-sm mt-1">Monitor and manage platform security</p>
      </div>

      {/* Score Banner */}
      <div className={`border rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 ${securityScore >= 90 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
        <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center text-2xl font-black shrink-0 ${securityScore >= 90 ? 'border-emerald-500 text-emerald-400' : 'border-amber-500 text-amber-400'}`}>
          {securityScore}
        </div>
        <div>
          <h2 className={`text-xl font-black ${securityScore >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
            Security Score: {securityScore >= 90 ? 'Excellent' : 'Good — Room for Improvement'}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {SECURITY_CHECKS.filter(c => c.status === 'warning').length} issues require attention
          </p>
        </div>
        <div className="ml-auto">
          <Shield size={48} className={securityScore >= 90 ? 'text-emerald-400/30' : 'text-amber-400/30'} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Security Checklist */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <h3 className="text-white font-bold mb-4">Security Checklist</h3>
          <div className="space-y-2">
            {SECURITY_CHECKS.map((check, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${check.status === 'ok' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {check.status === 'ok' ? '✓' : '!'}
                </div>
                <div className="flex-1">
                  <span className="text-sm text-slate-200">{check.label}</span>
                  {check.note && <p className="text-xs text-amber-400 mt-0.5">{check.note}</p>}
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${check.status === 'ok' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                  {check.status === 'ok' ? 'Enabled' : 'Warning'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Login History */}
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4">Admin Login History</h3>
            <div className="space-y-3">
              {LOGIN_HISTORY.map((log, i) => (
                <div key={i} className="flex items-center gap-4 py-2.5 border-b border-white/5 last:border-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${log.status === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-white font-semibold">{log.country}</span>
                      <span className="text-xs text-slate-500 font-mono">{log.ip}</span>
                    </div>
                    <p className="text-xs text-slate-500">{log.device} · {log.time}</p>
                  </div>
                  <span className={`text-xs font-bold ${log.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {log.status === 'success' ? 'Success' : 'Failed'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Logs */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4">Recent Activity Logs</h3>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {MOCK_ACTIVITY_LOGS.map(log => (
                <div key={log.id} className="flex items-start gap-3 text-sm">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${log.status === 'success' ? 'bg-emerald-400' : log.status === 'warning' ? 'bg-amber-400' : 'bg-rose-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 truncate">{log.action}</p>
                    <p className="text-xs text-slate-500">{log.user} · {log.ip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
