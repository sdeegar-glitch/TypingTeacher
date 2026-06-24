import { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, Loader2, Shield, KeyRound } from 'lucide-react';
import { submit2faLogin } from './api';

const API = import.meta.env.VITE_API_URL || 'https://typingteacher-2lnd.onrender.com';

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [code, setCode] = useState('');
  const [pendingToken, setPendingToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const finishLogin = async (accessToken: string) => {
    const meRes = await fetch(`${API}/api/admin/me`, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!meRes.ok) {
      setError(meRes.status === 403 ? 'This account does not have admin access.' : 'Could not verify admin access.');
      return;
    }
    localStorage.setItem('adminToken', accessToken);
    onLogin();
  };

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loginRes = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) {
        setError(loginData.error || 'Invalid email or password.');
        return;
      }
      if (loginData.requires2FA) {
        setPendingToken(loginData.pendingToken);
        setStep('2fa');
        return;
      }
      await finishLogin(loginData.accessToken);
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handle2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { accessToken } = await submit2faLogin(pendingToken, code);
      await finishLogin(accessToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-4">
            {step === '2fa' ? <KeyRound size={28} className="text-indigo-400" /> : <Shield size={28} className="text-indigo-400" />}
          </div>
          <h1 className="text-2xl font-black text-white">{step === '2fa' ? 'Two-Factor Auth' : 'Admin Access'}</h1>
          <p className="text-slate-400 text-sm mt-1">{step === '2fa' ? 'Enter the code from your authenticator app' : 'FastTypingLab Control Panel'}</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          {step === 'credentials' ? (
            <form onSubmit={handleCredentials} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@fasttypinglab.com"
                    required
                    className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && <p className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">{error}</p>}

              <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : 'Sign In →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handle2fa} className="space-y-4">
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••••"
                  maxLength={6}
                  required
                  className="w-full text-center text-2xl font-black tracking-[0.5em] py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/60"
                />
              </div>

              {error && <p className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">{error}</p>}

              <button type="submit" disabled={loading || code.length < 6} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Verify →'}
              </button>

              <button type="button" onClick={() => { setStep('credentials'); setCode(''); setError(''); }} className="w-full text-xs text-slate-500 hover:text-slate-300">
                ← Back to login
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          Authenticated against Supabase · Role-gated · Audit Logged
        </p>
      </div>
    </div>
  );
}
