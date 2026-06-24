import { supabase } from '../supabaseClient.js';

/**
 * Verifies the Supabase access token in the Authorization header and
 * checks that the corresponding users row has role = 'admin'.
 */
export async function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });

  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData?.user) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  const { data: profile, error: profileErr } = await supabase
    .from('users')
    .select('id, email, name, role, totp_enabled')
    .eq('id', userData.user.id)
    .single();

  if (profileErr || !profile || profile.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  req.adminUser = profile;
  next();
}
