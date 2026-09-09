import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Warning: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env');
}

// `Connection: close` on every request. Render's free tier suspends the
// process on idle and resumes it on the next request; Node's fetch keeps
// outbound TCP connections alive across that gap, and the confirmed failure
// mode is a wedged socket that a WRITE reuses silently -- PostgREST never
// receives the request, but the client sees a normal-looking response and no
// error, so a signup or an UPDATE (referral code, profile edit, avatar) can
// be lost with nothing in the logs to show for it. Reads and inserts mostly
// got lucky in testing; this closes the gap for every request rather than
// relying on luck. The cost is one extra TLS handshake per call, which is
// nothing next to silently losing writes.
export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: { headers: { Connection: 'close' } },
});
