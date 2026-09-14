import { createClient } from '@supabase/supabase-js';

// The anon key is a public client key (RLS protects data) — safe to ship in the
// bundle. Env vars override the fallbacks so the same build works everywhere.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://api.fasttypinglab.com';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzg5MzYxNDIxLCJleHAiOjIxMDQ3MjE0MjF9.JvSr1C8cDGYwUpzXr2Kb_WhQRrVX0adaTfPhEZHO9EY';

/** Supabase client — used for Google OAuth sign-in only (PKCE web flow). */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});
