import { supabase } from './supabaseClient.js';

/**
 * Records a real event for the admin Security/Logs/Notifications pages.
 * Never throws — a logging failure shouldn't break the request it's logging.
 */
export async function logActivity({ action, entity = null, actor_email = null, ip = null, status = 'success', meta = null }) {
  try {
    await supabase.from('activity_log').insert([{ action, entity, actor_email, ip, status, meta }]);
  } catch (err) {
    console.error('[ActivityLog] insert failed:', err.message);
  }
}
