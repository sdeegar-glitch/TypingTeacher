import { useEffect, useState } from 'react';
import { Shield, KeyRound, Loader2, CheckCircle2 } from 'lucide-react';
import type { ActivityLog } from '../types';
import { fetchAdminLogs, fetch2faStatus, start2faSetup, verify2faSetup, disable2fa } from '../api';

const LOGIN_ACTIONS = ['login_success', 'login_failed', 'login_blocked_banned', 'login_blocked_bruteforce', 'login_2fa_pending', 'login_2fa_failed'];

function TwoFactorCard({ enabled, onChange }: { enabled: boolean; onChange: (enabled: boolean) => void }) {
  const [setupData, setSetupData] = useState<{ secret: string; qrCode: string } | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [disabling, setDisabling] = useState(false);

  const startSetup = async () => {
    setBusy(true); setError('');
    try { setSetupData(await start2faSetup()); } catch { setError('Failed to start setup.'); }
    setBusy(false);
  };

  const confirmSetup = async () => {
    setBusy(true); setError('');
    try {
      await verify2faSetup(code);
      setSetupData(null); setCode('');
      onChange(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code.');
    }
    setBusy(false);
  };

  const confirmDisable = async () => {
    setBusy(true); setError('');
    try {
      await disable2fa(code);
      setDisabling(false); setCode('');
      onChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code.');
    }
    setBusy(false);
  };

  if (enabled) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <h3 className="text-white font-bold">Two-Factor Authentication</h3>
        </div>
        <p className="text-xs text-emerald-400 mb-4">Enabled for your admin account — required on every login.</p>
        {!disabling ? (
          <button onClick={() => setDisabling(true)} className="text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-3 py-2 rounded-lg transition-colors">
            Disable 2FA
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-slate-400">Enter your current authenticator code to confirm:</p>
            <div className="flex gap-2">
              <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} placeholder="123456"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white text-center tracking-widest focus:outline-none focus:border-rose-500/50" />
              <button onClick={confirmDisable} disabled={busy || code.length < 6} className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                {busy ? <Loader2 size={14} className="animate-spin" /> : 'Confirm'}
              </button>
            </div>
            {error && <p className="text-xs text-rose-400">{error}</p>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <KeyRound size={16} className="text-amber-400" />
        <h3 className="text-white font-bold">Two-Factor Authentication</h3>
      </div>
      <p className="text-xs text-amber-400 mb-4">Not enabled — your account only requires a password to sign in.</p>

      {!setupData ? (
        <button onClick={startSetup} disabled={busy} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          {busy ? <Loader2 size={14} className="animate-spin" /> : 'Enable 2FA'}
        </button>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">Scan this with Google Authenticator, Authy, or any TOTP app:</p>
          <img src={setupData.qrCode} alt="2FA setup QR code" className="rounded-xl border border-white/10 w-40 h-40" />
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Or enter manually</p>
            <code className="text-xs text-indigo-300 bg-black/30 px-2 py-1 rounded font-mono break-all">{setupData.secret}</code>
          </div>
          <div className="flex gap-2">
            <input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} placeholder="Enter 6-digit code"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white text-center tracking-widest focus:outline-none focus:border-indigo-500/50" />
            <button onClick={confirmSetup} disabled={busy || code.length < 6} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
              {busy ? <Loader2 size={14} className="animate-spin" /> : 'Confirm & Enable'}
            </button>
          </div>
          {error && <p className="text-xs text-rose-400">{error}</p>}
        </div>
      )}
    </div>
  );
}

export default function SecurityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [twoFaEnabled, setTwoFaEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    fetchAdminLogs().then(setLogs).catch(() => {}).finally(() => setLoading(false));
    fetch2faStatus().then(s => setTwoFaEnabled(s.enabled)).catch(() => setTwoFaEnabled(false));
  }, []);

  const loginHistory = logs.filter(l => LOGIN_ACTIONS.includes(l.action)).slice(0, 10);
  const otherActivity = logs.filter(l => !LOGIN_ACTIONS.includes(l.action)).slice(0, 10);
  const bruteForceBlocked = logs.some(l => l.action === 'login_blocked_bruteforce');

  // These reflect middleware actually wired in backend/index.js (helmet, cors,
  // express-rate-limit), plus the now-real 2FA and brute-force state.
  const securityChecks = [
    { label: 'HTTPS Enabled', status: 'ok' as const },
    { label: 'Rate Limiting Active', status: 'ok' as const },
    { label: 'CORS Configured', status: 'ok' as const },
    { label: 'Helmet.js Headers', status: 'ok' as const },
    { label: 'Role-Gated Admin Routes', status: 'ok' as const },
    twoFaEnabled === null
      ? { label: 'Two-Factor Auth', status: 'ok' as const, note: 'Checking…' }
      : twoFaEnabled
        ? { label: 'Two-Factor Auth', status: 'ok' as const, note: 'Enabled for your account' }
        : { label: 'Two-Factor Auth', status: 'warning' as const, note: 'Available below — not yet enabled for your account' },
    {
      label: 'Brute Force Protection', status: 'ok' as const,
      note: bruteForceBlocked ? '5-attempt account lockout + IP rate limit — has blocked a real attempt' : '5-attempt account lockout (15min) + IP rate limit, both real',
    },
    { label: 'Audit Logging', status: 'ok' as const },
    { label: 'Session Expiration', status: 'ok' as const, note: 'Supabase JWT, ~1h expiry' },
  ];
  const securityScore = Math.round(securityChecks.filter(c => c.status === 'ok').length / securityChecks.length * 100);

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
            {securityChecks.filter(c => c.status === 'warning').length} issues require attention
          </p>
        </div>
        <div className="ml-auto">
          <Shield size={48} className={securityScore >= 90 ? 'text-emerald-400/30' : 'text-amber-400/30'} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Security Checklist */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4">Security Checklist</h3>
            <div className="space-y-2">
              {securityChecks.map((check, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${check.status === 'ok' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {check.status === 'ok' ? '✓' : '!'}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-slate-200">{check.label}</span>
                    {check.note && <p className={`text-xs mt-0.5 ${check.status === 'ok' ? 'text-slate-500' : 'text-amber-400'}`}>{check.note}</p>}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${check.status === 'ok' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                    {check.status === 'ok' ? 'Enabled' : 'Warning'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {twoFaEnabled !== null && <TwoFactorCard enabled={twoFaEnabled} onChange={setTwoFaEnabled} />}
        </div>

        {/* Login History */}
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4">Login History</h3>
            <div className="space-y-3 max-h-56 overflow-y-auto">
              {loading && <p className="text-sm text-slate-500">Loading…</p>}
              {!loading && loginHistory.length === 0 && <p className="text-sm text-slate-500">No login events yet.</p>}
              {loginHistory.map(log => (
                <div key={log.id} className="flex items-center gap-4 py-2.5 border-b border-white/5 last:border-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${log.status === 'success' ? 'bg-emerald-400' : log.status === 'warning' ? 'bg-amber-400' : 'bg-rose-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-white font-semibold truncate">{log.actor_email}</span>
                      <span className="text-xs text-slate-500 font-mono">{log.ip}</span>
                    </div>
                    <p className="text-xs text-slate-500">{new Date(log.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`text-xs font-bold shrink-0 ${log.status === 'success' ? 'text-emerald-400' : log.status === 'warning' ? 'text-amber-400' : 'text-rose-400'}`}>
                    {log.action.replace(/^login_/, '').replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Logs */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-white font-bold mb-4">Recent Admin Activity</h3>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {otherActivity.length === 0 && <p className="text-sm text-slate-500">No activity yet.</p>}
              {otherActivity.map(log => (
                <div key={log.id} className="flex items-start gap-3 text-sm">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${log.status === 'success' ? 'bg-emerald-400' : log.status === 'warning' ? 'bg-amber-400' : 'bg-rose-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-300 truncate">{log.action.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-slate-500">{log.actor_email} · {log.ip}</p>
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
