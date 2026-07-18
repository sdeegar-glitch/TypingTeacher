import express from 'express';
import rateLimit from 'express-rate-limit';
import { supabase } from '../supabaseClient.js';
import { logActivity } from '../activityLog.js';
import { verifyTotp, createPendingLogin, peekPendingLogin, consumePendingLogin } from '../twofa.js';

const router = express.Router();

const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_THRESHOLD = 5;

// Real per-IP throttling on top of the account-level lockout below — two
// independent layers, since IP-based limits alone miss distributed attempts
// against one account, and account-based limits alone miss credential
// stuffing across many accounts from one IP.
const loginLimiter = rateLimit({
  windowMs: LOCKOUT_WINDOW_MS,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts from this network. Please try again in 15 minutes.' },
});

const twoFaLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many verification attempts. Please try again in a few minutes.' },
});

async function isAccountLockedOut(email) {
  const since = new Date(Date.now() - LOCKOUT_WINDOW_MS).toISOString();
  const { count } = await supabase
    .from('activity_log')
    .select('*', { count: 'exact', head: true })
    .eq('action', 'login_failed')
    .eq('actor_email', email)
    .gte('created_at', since);
  return (count || 0) >= LOCKOUT_THRESHOLD;
}

router.post('/signup', async (req, res) => {
  const { email, password, name, phone } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  // Normalise the optional phone (digits/+/spaces only, keep it lightweight).
  const cleanPhone = typeof phone === 'string' && phone.trim() ? phone.trim().slice(0, 20) : null;

  // Use Supabase auth
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { name, phone: cleanPhone },
    email_confirm: true
  });

  if (error) return res.status(400).json({ error: error.message });

  // Insert into our users table. Try with phone; if the column doesn't exist
  // yet (migration not run), fall back to a row without it so signup never breaks.
  if (data?.user) {
    const baseRow = { id: data.user.id, email: data.user.email, name: name };
    const { error: insErr } = await supabase.from('users').insert([{ ...baseRow, phone: cleanPhone }]);
    if (insErr) {
      await supabase.from('users').insert([baseRow]);
    }
  }

  res.status(201).json({ user_id: data?.user?.id, email });
});

router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  const lockedOut = await isAccountLockedOut(email);
  if (lockedOut) {
    logActivity({ action: 'login_blocked_bruteforce', entity: 'auth', actor_email: email, ip: req.ip, status: 'warning' });
    return res.status(429).json({ error: `Too many failed attempts for this account. Try again in 15 minutes.` });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Awaited deliberately: the brute-force check on the next request counts
    // these rows, so the write must land before this response returns.
    await logActivity({ action: 'login_failed', entity: 'auth', actor_email: email, ip: req.ip, status: 'error' });
    return res.status(401).json({ error: error.message });
  }

  const { data: profile } = await supabase.from('users').select('is_banned, totp_enabled').eq('id', data.user.id).maybeSingle();
  if (profile?.is_banned) {
    await supabase.auth.admin.signOut(data.session.access_token).catch(() => {});
    logActivity({ action: 'login_blocked_banned', entity: 'auth', actor_email: email, ip: req.ip, status: 'warning' });
    return res.status(403).json({ error: 'This account has been banned.' });
  }

  if (profile?.totp_enabled) {
    // Real session token is withheld until the TOTP code is verified below.
    const pendingToken = createPendingLogin({ accessToken: data.session.access_token, user: data.user, email });
    logActivity({ action: 'login_2fa_pending', entity: 'auth', actor_email: email, ip: req.ip });
    return res.json({ requires2FA: true, pendingToken });
  }

  logActivity({ action: 'login_success', entity: 'auth', actor_email: email, ip: req.ip, status: 'success' });
  res.json({ accessToken: data.session?.access_token, user: data.user });
});

router.post('/login/2fa', twoFaLimiter, async (req, res) => {
  const { pendingToken, code } = req.body;
  if (!pendingToken || !code) return res.status(400).json({ error: 'pendingToken and code are required' });

  const entry = peekPendingLogin(pendingToken);
  if (!entry) return res.status(401).json({ error: 'This login attempt expired. Please log in again.' });

  const { data: profile } = await supabase.from('users').select('totp_secret').eq('id', entry.user.id).maybeSingle();
  if (!profile?.totp_secret || !verifyTotp(code, profile.totp_secret)) {
    logActivity({ action: 'login_2fa_failed', entity: 'auth', actor_email: entry.email, ip: req.ip, status: 'error' });
    return res.status(401).json({ error: 'Invalid authentication code.' });
  }

  consumePendingLogin(pendingToken);
  logActivity({ action: 'login_success', entity: 'auth', actor_email: entry.email, ip: req.ip, status: 'success', meta: { via: '2fa' } });
  res.json({ accessToken: entry.accessToken, user: entry.user });
});

export default router;
