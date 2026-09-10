import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Warning: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env');
}

// `Connection: close` on every request. In production, requests to Supabase
// from this backend have intermittently returned a clean "no error" response
// for a write that never actually reached PostgREST -- confirmed by issuing
// the identical request (same key, same payload, same moment) from a
// different machine, which succeeded every time. A reused, wedged TCP
// connection is the most likely mechanism (Render's free tier suspends the
// process on idle, and Node's fetch keeps sockets alive across that gap), so
// this closes the connection after every request rather than reusing one --
// one extra TLS handshake per call, which is nothing next to silently losing
// writes. It has not fully eliminated the issue by itself in testing, which
// suggests part of the problem may sit further upstream (e.g. Supabase's own
// connection pooling) -- see services/referrals.js for the verify-what-was-
// actually-written pattern that catches whatever gets through regardless.
export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: { headers: { Connection: 'close' } },
});
