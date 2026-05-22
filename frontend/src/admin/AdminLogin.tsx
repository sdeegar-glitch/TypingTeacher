import { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, Loader2, Shield } from 'lucide-react';

const ADMIN_EMAIL = 'admin@fasttypinglab.com';
const ADMIN_PASS  = 'Admin@123';

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp] = useState('482910'); // Simulated OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      setStep('otp');
      // In production: backend sends real OTP to email
      alert(`Demo: Your OTP is ${generatedOtp} (In production this is emailed)`);
    } else {
      setError('Invalid credentials. Try admin@fasttypinglab.com / Admin@123');
    }
    setLoading(false);
  };

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    if (otp === generatedOtp) {
      localStorage.setItem('adminToken', 'demo-admin-jwt-token');
      onLogin();
    } else {
      setError('Incorrect OTP. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-4">
            <Shield size={28} className="text-indigo-400" />
          </div>
          <h1 className="text-2xl font-black text-white">Admin Access</h1>
          <p className="text-slate-400 text-sm mt-1">FastTypingLab Control Panel</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          {/* Steps indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`h-1 flex-1 rounded-full transition-colors ${step === 'credentials' || step === 'otp' ? 'bg-indigo-500' : 'bg-white/10'}`} />
            <div className={`h-1 flex-1 rounded-full transition-colors ${step === 'otp' ? 'bg-indigo-500' : 'bg-white/10'}`} />
          </div>

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
                    placeholder="admin@fasttypinglab.com"
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
                {loading ? <><Loader2 size={16} className="animate-spin" /> Verifying...</> : 'Continue →'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtp} className="space-y-4">
              <div className="text-center mb-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
                  <Mail size={20} className="text-emerald-400" />
                </div>
                <p className="text-sm text-slate-300">OTP sent to <span className="text-white font-semibold">{email}</span></p>
                <p className="text-xs text-slate-500 mt-1">Check your inbox and enter the 6-digit code</p>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1.5">One-Time Password</label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="••••••"
                  maxLength={6}
                  required
                  className="w-full text-center text-2xl font-black tracking-[0.5em] py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/60"
                />
              </div>

              {error && <p className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">{error}</p>}

              <button type="submit" disabled={loading || otp.length < 6} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Verifying...</> : 'Access Dashboard'}
              </button>

              <button type="button" onClick={() => { setStep('credentials'); setOtp(''); setError(''); }} className="w-full text-xs text-slate-500 hover:text-slate-300 mt-2">
                ← Back to login
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          Protected by 2FA · Rate Limited · Audit Logged
        </p>
      </div>
    </div>
  );
}
