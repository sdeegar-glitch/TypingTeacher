import { supabase } from '../supabaseClient.js';

/**
 * Referral programme helpers.
 *
 * A referral "counts" only once the invited person has actually completed a
 * typing test. Signup alone is trivially farmable with throwaway addresses, and
 * an invite that never types is worth nothing to the site anyway. That status is
 * derived at read time (see getReferralStats) rather than stored, so it can
 * never drift out of sync with reality.
 */

// Crockford-ish alphabet: no 0/O/1/I/L, because these codes get read aloud in
// WhatsApp voice notes and copied by hand off phone screens.
const CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const CODE_LENGTH = 6;

function randomCode() {
  let out = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

/** Normalise user input: codes are shared by hand, so be forgiving. */
export function normaliseCode(raw) {
  if (typeof raw !== 'string') return null;
  const cleaned = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
  return cleaned.length >= 4 ? cleaned : null;
}

/**
 * Returns this user's share code, creating one on first use.
 * Retries on the unique-index collision rather than assuming randomness is enough.
 */
export async function ensureReferralCode(userId) {
  const { data: existing } = await supabase
    .from('users')
    .select('referral_code')
    .eq('id', userId)
    .maybeSingle();

  if (existing?.referral_code) return existing.referral_code;

  for (let attempt = 0; attempt < 6; attempt++) {
    const code = randomCode();
    const { error } = await supabase
      .from('users')
      .update({ referral_code: code })
      .eq('id', userId);

    if (!error) return code;
    // 23505 = unique_violation: this code is taken, roll again. Anything else is
    // a real failure (most likely the migration has not been run yet).
    if (error.code !== '23505') throw new Error(error.message);
  }
  throw new Error('Could not allocate a referral code. Please try again.');
}

/** Resolve a share code to the user id that owns it, or null. */
export async function resolveCode(rawCode) {
  const code = normaliseCode(rawCode);
  if (!code) return null;

  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('referral_code', code)
    .maybeSingle();

  return data?.id || null;
}

/**
 * Credit a referral for a newly created account. Best-effort by design: a signup
 * must never fail because the referral bookkeeping did, so every path here
 * returns a reason string instead of throwing.
 */
export async function attachReferral(referredUserId, rawCode) {
  const code = normaliseCode(rawCode);
  if (!code) return { credited: false, reason: 'no_code' };

  try {
    const referrerId = await resolveCode(code);
    if (!referrerId) return { credited: false, reason: 'unknown_code' };
    if (referrerId === referredUserId) return { credited: false, reason: 'self_referral' };

    // The unique index on referred_user_id is the real guard; this check just
    // avoids a noisy error in the normal "already referred" case.
    const { data: already } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_user_id', referredUserId)
      .maybeSingle();
    if (already) return { credited: false, reason: 'already_referred' };

    const { error } = await supabase
      .from('referrals')
      .insert([{ referrer_id: referrerId, referred_user_id: referredUserId, code_used: code }]);
    if (error) return { credited: false, reason: error.code === '23505' ? 'already_referred' : 'insert_failed' };

    await supabase.from('users').update({ referred_by: referrerId }).eq('id', referredUserId);
    return { credited: true, referrerId };
  } catch {
    // Migration not run, table missing, network blip — signup still succeeds.
    return { credited: false, reason: 'error' };
  }
}

/**
 * Show who joined without leaking their email address. Referrers are not
 * entitled to the contact details of people they invited.
 */
function displayName(user) {
  const name = (user?.name || '').trim();
  if (name) return name.split(/\s+/)[0].slice(0, 20);
  const local = (user?.email || '').split('@')[0];
  if (!local) return 'A new typist';
  return local.slice(0, 2) + '•'.repeat(Math.max(3, Math.min(6, local.length - 2)));
}

/**
 * Full stats for one referrer: their code, who joined, and which of those
 * actually completed a test (the ones that count).
 */
export async function getReferralStats(userId) {
  const code = await ensureReferralCode(userId);

  const { data: rows, error } = await supabase
    .from('referrals')
    .select('referred_user_id, created_at')
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  const referrals = rows || [];
  if (referrals.length === 0) return { code, total: 0, qualified: 0, invites: [] };

  const ids = referrals.map(r => r.referred_user_id);

  // Two batched lookups rather than per-invite queries — this endpoint is hit on
  // every dashboard load.
  const [{ data: users }, { data: sessions }] = await Promise.all([
    supabase.from('users').select('id, name, email').in('id', ids),
    supabase.from('test_sessions').select('user_id').in('user_id', ids),
  ]);

  const userById = new Map((users || []).map(u => [u.id, u]));
  const hasTyped = new Set((sessions || []).map(s => s.user_id));

  const invites = referrals.map(r => ({
    name: displayName(userById.get(r.referred_user_id)),
    joined_at: r.created_at,
    qualified: hasTyped.has(r.referred_user_id),
  }));

  return {
    code,
    total: invites.length,
    qualified: invites.filter(i => i.qualified).length,
    invites: invites.slice(0, 50),
  };
}

/**
 * Leaderboard of referrers for the monthly Telegram shout-out. Only counts
 * invites who have actually typed, same rule as the user-facing number.
 */
export async function getTopReferrers(limit = 5) {
  const { data: rows, error } = await supabase
    .from('referrals')
    .select('referrer_id, referred_user_id');
  if (error || !rows?.length) return [];

  const referredIds = [...new Set(rows.map(r => r.referred_user_id))];
  const referrerIds = [...new Set(rows.map(r => r.referrer_id))];

  const [{ data: sessions }, { data: users }] = await Promise.all([
    supabase.from('test_sessions').select('user_id').in('user_id', referredIds),
    supabase.from('users').select('id, name, email').in('id', referrerIds),
  ]);

  const hasTyped = new Set((sessions || []).map(s => s.user_id));
  const userById = new Map((users || []).map(u => [u.id, u]));

  const counts = new Map();
  for (const r of rows) {
    if (!hasTyped.has(r.referred_user_id)) continue;
    counts.set(r.referrer_id, (counts.get(r.referrer_id) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, count]) => ({ name: displayName(userById.get(id)), count }));
}
