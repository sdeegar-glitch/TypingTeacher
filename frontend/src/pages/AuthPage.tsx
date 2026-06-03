import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Keyboard, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const body = isLogin ? { email, password } : { email, password, name };
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://typingteacher-2lnd.onrender.com'}${endpoint}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (isLogin ? 'Login failed. Check your credentials.' : 'Registration failed. Please try again.'));
      if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
      setSuccess(isLogin ? 'Login successful! Redirecting…' : 'Account created! Welcome aboard!');
      setLoading(false);
      setTimeout(() => navigate('/dashboard'), 900);
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
    }
  };

  const inputCls = 'w-full px-4 py-2.5 rounded-xl text-brand-text text-sm placeholder:text-brand-muted outline-none transition-all duration-200 border bg-brand-surface-2 border-brand-border focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/15';

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4 py-8">

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-[0.06] animate-blob"
          style={{ background: 'radial-gradient(circle,#304C53,transparent)' }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-[0.05] animate-blob-r"
          style={{ background: 'radial-gradient(circle,#BC6C50,transparent)' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }} className="w-full max-w-sm relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl"
              style={{ background: 'linear-gradient(135deg,#304C53,#2A9DAE)' }}>
              <Keyboard className="w-7 h-7 text-white" />
            </div>
            <span className="text-xl font-black text-brand-text tracking-tight">FastTypingLab</span>
          </Link>
          <p className="text-sm text-brand-muted mt-1.5">
            {isLogin ? 'Welcome back! Sign in to continue.' : 'Create a free account to get started.'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-brand-surface-2 rounded-xl p-1 mb-6 border border-brand-border">
          {[{ id: true, label: 'Log In' }, { id: false, label: 'Register' }].map(tab => (
            <button key={String(tab.id)} onClick={() => { setIsLogin(tab.id); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
                isLogin === tab.id
                  ? 'text-white shadow-md'
                  : 'text-brand-muted hover:text-brand-text'
              }`}
              style={isLogin === tab.id ? { background: 'linear-gradient(135deg,#304C53,#2A9DAE)', boxShadow: '0 4px 12px rgba(48,76,83,.3)' } : {}}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-6 shadow-xl">

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-start gap-2.5 p-3 rounded-xl border"
              style={{ background: 'rgba(224,82,82,0.08)', borderColor: 'rgba(224,82,82,0.2)' }}>
              <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
              <p className="text-rose-500 text-xs font-medium leading-relaxed">{error}</p>
            </motion.div>
          )}

          {/* Success */}
          {success && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-start gap-2.5 p-3 rounded-xl border"
              style={{ background: 'rgba(42,157,174,0.08)', borderColor: 'rgba(42,157,174,0.2)' }}>
              <CheckCircle className="w-4 h-4 text-brand-accent mt-0.5 shrink-0" />
              <p className="text-brand-accent text-xs font-medium leading-relaxed">{success}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-brand-muted mb-1.5">Your Name</label>
                <input type="text" required placeholder="e.g. Raman Kumar"
                  className={inputCls} value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-brand-muted mb-1.5">Email Address</label>
              <input type="email" required placeholder="you@example.com"
                className={inputCls} value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-brand-muted mb-1.5">Password</label>
              <input type="password" required placeholder="Enter your password"
                className={inputCls} value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white transition-all duration-200 mt-2 active:scale-[0.98]"
              style={loading
                ? { background: 'rgba(48,76,83,0.5)', cursor: 'not-allowed' }
                : { background: 'linear-gradient(135deg,#304C53,#2A9DAE)', boxShadow: '0 4px 16px rgba(48,76,83,.35)' }}>
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Please wait…</>
              ) : (
                isLogin ? 'Log In to My Account' : 'Create Free Account'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-brand-muted mt-5">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
              className="font-bold hover:opacity-80 transition-opacity" style={{ color: 'var(--brand-primary)' }}>
              {isLogin ? 'Register free' : 'Log in here'}
            </button>
          </p>
        </div>

        <p className="text-center text-[11px] text-brand-muted mt-5">
          By continuing you agree to our{' '}
          <Link to="/" className="hover:text-brand-primary transition-colors">Terms of Service</Link>
          {' '}and{' '}
          <Link to="/" className="hover:text-brand-primary transition-colors">Privacy Policy</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
