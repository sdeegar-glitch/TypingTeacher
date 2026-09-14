import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Warning: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env');
}

function createFreshClient() {
  return createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Connection: 'close' } },
  });
}

/**
 * A long-lived, singleton `SupabaseClient` in a Node server process is not
 * reliable: confirmed live (2026-09-14) by running two queries -- identical
 * SQL, identical key, same request -- side by side, one through the shared
 * client and one through a client created fresh right there. The shared one
 * returned zero rows for a row that demonstrably existed; the fresh one found
 * it immediately. A raw `fetch()` to the same URL, bypassing supabase-js
 * entirely, also found it -- so the fault sits inside the client library's
 * internal state as it ages across many requests, not the network, not
 * PostgREST, and not connection keep-alive (Connection: close was already in
 * place and did not prevent this). This most likely also explains an earlier,
 * never-fully-explained pattern of intermittent silent failures against
 * Supabase Cloud in production, previously suspected to be network/connection
 * staleness.
 *
 * The fix: never hold onto one client instance across requests. Every
 * property access below builds a brand-new client and reads that property
 * off it, so `supabase.from(...)` and `supabase.auth.getUser(...)` are always
 * backed by a client that has only ever served this one call. Construction is
 * cheap (no network I/O happens until a request is actually made), so this
 * costs an extra object allocation per access -- negligible next to the
 * alternative of queries silently returning wrong results in production.
 */
export const supabase = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = createFreshClient();
      const value = client[prop];
      return typeof value === 'function' ? value.bind(client) : value;
    },
  }
);
