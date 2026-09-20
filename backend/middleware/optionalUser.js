import { supabase } from '../supabaseClient.js';

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
      if (data?.user) req.userId = data.user.id;
    } catch {
      // treat as anonymous
    }
  }
  next();
}
