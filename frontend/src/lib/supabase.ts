import { createClient } from '@supabase/supabase-js';

// The anon key is a public client key (RLS protects data) — safe to ship in the
// bundle. Env vars override the fallbacks so the same build works everywhere.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://grvhzzdvwohsswohnmib.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdydmh6emR2d29oc3N3b2hubWliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1OTk5MDksImV4cCI6MjA5NDE3NTkwOX0.GXyCjt-nk_PXdGUqYxk6rpL-bVY4c0Ta2rmaQXqKtyA';

/** Supabase client — used for Google OAuth sign-in only (PKCE web flow). */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});
