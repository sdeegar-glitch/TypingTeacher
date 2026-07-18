import React, { useState, useEffect, useRef } from 'react';
import Seo from '../components/Seo';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Keyboard, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const API_BASE = import.meta.env.VITE_API_URL || 'https://typingteacher-2lnd.onrender.com';

const AuthPage = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname !== '/signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const oauthHandled = useRef(false);

  // Handle the return leg of a Google OAuth sign-in. detectSessionInUrl exchanges
  // the ?code=… on load; onAuthStateChange then fires with the session. We make
  // sure the user exists in our `users` table, mirror the token into the key the
  // rest of the app reads, and send them to the dashboard.
  useEffect(() => {
    const finishOAuth = async (accessToken: string) => {
      if (oauthHandled.current) return;
      oauthHandled.current = true;
      try {
        const res = await fetch(`${API_BASE}/auth/oauth-sync`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error || 'Google sign-in could not be completed.');
        }
        localStorage.setItem('accessToken', accessToken);
        setSuccess('Signed in with Google! Redirecting…');
        setTimeout(() => navigate('/dashboard'), 700);
      } catch (err: any) {
        oauthHandled.current = false;
        setGoogleLoading(false);
        setError(err.message);
        await supabase.auth.signOut().catch(() => {});
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.access_token) {
        setGoogleLoading(true);
        finishOAuth(session.access_token);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleGoogle = async () => {
    setError(''); setSuccess(''); setGoogleLoading(true);
    try {
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/login` },
      });
      if (oauthErr) throw oauthErr;
      // On success the browser redirects to Google; nothing else runs here.
    } catch (err: any) {
      setGoogleLoading(false);
      setError(err.message || 'Could not start Google sign-in. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const body = isLogin ? { email, password } : { email, password, name, phone };
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
      <Seo title="Log in | FastTypingLab" description="Sign in to your FastTypingLab account." noindex />

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

          {/* Google sign-in */}
          <button type="button" onClick={handleGoogle} disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl text-sm font-bold text-brand-text bg-brand-surface-2 border border-brand-border hover:bg-brand-border transition-all duration-200 active:scale-[0.98] disabled:opacity-60">
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {googleLoading ? 'Please wait…' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-brand-border" />
            <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-brand-border" />
          </div>

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
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-brand-muted mb-1.5">
                  Mobile Number <span className="font-normal text-brand-muted/70">(optional)</span>
                </label>
                <input type="tel" placeholder="e.g. 98765 43210"
                  className={inputCls} value={phone} onChange={e => setPhone(e.target.value)} />
                <p className="text-[11px] text-brand-muted mt-1.5 leading-relaxed">
                  📲 Add it to get free typing tips, mock-test reminders & exam notifications on WhatsApp.
                </p>
              </div>
            )}
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
