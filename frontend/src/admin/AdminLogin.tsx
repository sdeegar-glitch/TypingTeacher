import { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, Loader2, Shield, KeyRound } from 'lucide-react';
import { submit2faLogin } from './api';

const API = import.meta.env.VITE_API_URL || 'https://api.fasttypinglab.com';

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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative">
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
            {step === '2fa' ? <KeyRound size={24} className="text-primary-400" /> : <Shield size={24} className="text-primary-400" />}
          </div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">{step === '2fa' ? 'Two-Factor Authentication' : 'FastTypingLab Portal'}</h1>
          <p className="text-slate-400 text-xs mt-1.5">{step === '2fa' ? 'Enter the 6-digit code from your authenticator' : 'Authorized Administrator Console'}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-xl shadow-black/40">
          {step === 'credentials' ? (
            <form onSubmit={handleCredentials} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-medium tracking-wide block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@fasttypinglab.com"
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-md text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium tracking-wide block mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-md text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && <p className="text-rose-400 text-xs bg-rose-950/40 border border-rose-800/40 px-3 py-2 rounded-md">{error}</p>}

              <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 text-sm shadow-sm">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Authenticating...</> : 'Continue to Dashboard →'}
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
                  className="w-full text-center text-2xl font-mono font-bold tracking-[0.5em] py-3 bg-slate-950 border border-slate-800 rounded-md text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition-colors"
                />
              </div>

              {error && <p className="text-rose-400 text-xs bg-rose-950/40 border border-rose-800/40 px-3 py-2 rounded-md">{error}</p>}

              <button type="submit" disabled={loading || code.length < 6} className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 text-sm shadow-sm">
                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Verify & Continue →'}
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
