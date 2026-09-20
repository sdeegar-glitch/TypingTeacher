import { supabase } from '../supabaseClient.js';

// Ids we've already confirmed have a public.users row (avoids a lookup per request).
const knownProfiles = new Set();

/**
 * test_sessions.user_id has a foreign key to public.users(id), but a valid
 * login (auth.users) does not guarantee a public.users row exists -- signup
 * can fail to create it. Create it on first sight so scores can be attributed
 * to the account instead of being silently stored as anonymous.
 */
async function ensureProfileRow(authUser) {
  if (knownProfiles.has(authUser.id)) return;
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('id', authUser.id)
    .maybeSingle();
  if (!existing) {
    const meta = authUser.user_metadata || {};
    const name = meta.full_name || meta.name || (authUser.email ? authUser.email.split('@')[0] : 'User');
    const { error } = await supabase
      .from('users')
      .insert([{ id: authUser.id, email: authUser.email, name }]);
    if (error) {
      console.error(`[optionalUser] could not create users row for ${authUser.id}:`, error.message);
      return; // not cached: try again next time
    }
    console.log(`[optionalUser] created missing users row for ${authUser.id}`);
  }
  knownProfiles.add(authUser.id);
}

/**
 * Like requireUser but never rejects: if a valid bearer token is present it
 * sets req.userId, otherwise req.userId stays null (anonymous). Use this on
 * public write endpoints so results are attributed to the real caller and a
 * client can never claim someone else's user_id in the request body.
 */
export async function optionalUser(req, _res, next) {
  req.userId = null;
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (token) {
    try {
      const { data } = await supabase.auth.getUser(token);
      if (data?.user) {
        req.userId = data.user.id;
        await ensureProfileRow(data.user);
      }
    } catch {
      // treat as anonymous
    }
  }
  next();
}
