import { supabase } from '../supabaseClient.js';

/**
 * Verifies the Supabase access token in the Authorization header and loads the
 * caller's profile row. Unlike requireAdmin, any authenticated (non-banned)
 * user passes — used for self-service endpoints like /api/me.
 */
export async function requireUser(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });

  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData?.user) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  // Make sure a profile row exists (email users always have one; this is a
  // safety net for any edge case where it's missing).
  const { data: profile } = await supabase
    .from('users')
    .select('id, email, name, role, phone, avatar_url, is_banned, created_at')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (profile?.is_banned) return res.status(403).json({ error: 'This account has been banned.' });

  req.authUser = userData.user;
  req.profile = profile || { id: userData.user.id, email: userData.user.email };
  next();
}
