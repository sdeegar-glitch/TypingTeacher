import express from 'express';
import rateLimit from 'express-rate-limit';
import { supabase } from '../supabaseClient.js';
import { requireBrowserOrigin } from '../middleware/requireBrowserOrigin.js';
import { optionalUser } from '../middleware/optionalUser.js';

const router = express.Router();

// Feeds the public leaderboard directly from client-reported numbers, with no
// server-side check that a session of this duration could plausibly produce
// this WPM -- so, same class of risk as /api/visitors/track (see that file's
// comment), guarded the same way. A real player submits at most a handful of
// these per minute even typing back-to-back tests.
const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests.' },
});

// POST /test_sessions - Submit test results
const ENGINE_VERSIONS = new Set(['v1', 'v2']);
const INPUT_METHODS = new Set(['key-events', 'os-layout', 'built-in-inscript', 'ime', 'touch', 'unknown']);

// Every real duration offered anywhere on the site (main test 15s, exams up
// to 900s, the weekly Live Test at one minute, drills, Hindi Jungle, etc.)
// is at least this long -- a shorter "session" was never produced by our own
// UI, so it is rejected outright rather than scored at all.
const MIN_PLAUSIBLE_DURATION = 10;

// Sessions this short are the easiest to fake a headline WPM for (few real
// keystrokes needed to hit a big number) and the hardest to sanity-check any
// other way, so they get a tighter ceiling than the flat 400 applied to
// longer, harder-to-fake sessions. 250 WPM sustained for 10-29s is already
// far beyond any verified human typist (world-record sustained pace is
// ~216 WPM) -- generous on purpose, so a real fast typist is never rejected.
const SHORT_SESSION_MAX_SECONDS = 30;
const SHORT_SESSION_MAX_WPM = 250;

/**
 * Duration-aware plausibility check, on top of the flat 0-400 range already
 * enforced by the caller. Pure and independently testable.
 * Returns a reason string when implausible, or null when the session passes.
 */
export function implausibleSessionReason({ duration, gross_wpm, net_wpm }) {
  if (duration < MIN_PLAUSIBLE_DURATION) {
    return `duration ${duration}s is shorter than any real test on this site.`;
  }
  // Net speed can never exceed gross speed -- net is gross minus a penalty
  // for errors, never a bonus. A submission with net > gross did not come
  // from the site's own scoring formula (lib/typingScoring.ts).
  if (net_wpm > gross_wpm) {
    return `net_wpm (${net_wpm}) exceeds gross_wpm (${gross_wpm}), which the scoring formula cannot produce.`;
  }
  if (duration < SHORT_SESSION_MAX_SECONDS && (gross_wpm > SHORT_SESSION_MAX_WPM || net_wpm > SHORT_SESSION_MAX_WPM)) {
    return `${Math.max(gross_wpm, net_wpm)} WPM in a ${duration}s session exceeds the short-session ceiling (${SHORT_SESSION_MAX_WPM}).`;
  }
  return null;
}

// Validates the optional per-key breakdown sent by the typing engine. Returns
// a cleaned array (max 200 keys) or [] if absent/invalid -- never fails the
// session save because of it.
function cleanKeyStats(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const k of raw.slice(0, 200)) {
    if (
      k && typeof k.key === 'string' && k.key.length >= 1 && k.key.length <= 8 &&
      Number.isInteger(k.hits) && k.hits >= 0 && k.hits <= 100000 &&
      Number.isInteger(k.errors) && k.errors >= 0 && k.errors <= k.hits + 100000 &&
      (k.total_ms === undefined || (Number.isInteger(k.total_ms) && k.total_ms >= 0 && k.total_ms <= 3.6e9))
    ) {
      out.push({ key: k.key, hits: k.hits, errors: k.errors, total_ms: k.total_ms ?? 0 });
    }
  }
  return out;
}

router.post('/', requireBrowserOrigin, submitLimiter, optionalUser, async (req, res) => {
  // user_id in the body is ignored on purpose: attribution comes from the token.
  const { test_id, duration, gross_wpm, net_wpm, errors, accuracy, key_stats } = req.body;
  // Engine telemetry (allow-listed so arbitrary client strings never reach the DB).
  const engine_version = ENGINE_VERSIONS.has(req.body.engine_version) ? req.body.engine_version : null;
  const input_method = INPUT_METHODS.has(req.body.input_method) ? req.body.input_method : null;
  const user_id = req.userId;

  if (
    typeof duration !== 'number' || typeof gross_wpm !== 'number' || typeof net_wpm !== 'number' ||
    duration <= 0 || duration > 3600 ||
    gross_wpm < 0 || gross_wpm > 400 || net_wpm < 0 || net_wpm > 400 ||
    (accuracy !== undefined && (typeof accuracy !== 'number' || accuracy < 0 || accuracy > 100))
  ) {
    return res.status(400).json({ error: 'Missing or implausible metrics' });
  }

  const implausibleReason = implausibleSessionReason({ duration, gross_wpm, net_wpm });
  if (implausibleReason) {
    console.warn(`[test_sessions] rejected implausible session from ${req.ip}: ${implausibleReason}`);
    return res.status(400).json({ error: 'Missing or implausible metrics' });
  }

  let row = {
    user_id: user_id || null, // null = anonymous
    test_id: test_id || null,
    duration,
    gross_wpm,
    net_wpm,
    errors,
    accuracy,
    ...(engine_version ? { engine_version } : {}),
    ...(input_method ? { input_method } : {}),
  };

  const insertSession = (r) =>
    supabase.from('test_sessions').insert([r]).select().single();

  let { data, error } = await insertSession(row);

  // Telemetry columns come from a migration; if it has not been applied yet, never
  // lose the session over them -- retry without the extra fields.
  if (error && (engine_version || input_method) && /engine_version|input_method|column/i.test(error.message || '')) {
    console.error('[test_sessions] telemetry columns unavailable, retrying without them:', error.message);
    const { engine_version: _e, input_method: _m, ...plain } = row;
    row = plain;
    ({ data, error } = await insertSession(row));
  }

  // A foreign-key violation (Postgres 23503, surfaced as HTTP 409) means the
  // user_id has no public.users row or the test_id is not in `tests`. Never
  // lose a completed session over that: retry dropping each reference in turn.
  if (error && (error.code === '23503' || /foreign key/i.test(error.message || ''))) {
    console.error('[test_sessions] FK violation, retrying without references:', error.message);
    if (row.test_id) ({ data, error } = await insertSession({ ...row, test_id: null }));
    if (error && row.user_id) ({ data, error } = await insertSession({ ...row, test_id: null, user_id: null }));
  }

  if (error) {
    console.error('[test_sessions] insert failed:', error.message);
    return res.status(500).json({ error: 'Could not save session.' });
  }

  // Per-key data is best-effort: a failure here must not lose the session.
  const keyRows = cleanKeyStats(key_stats).map(k => ({ ...k, session_id: data.id, user_id }));
  if (keyRows.length) {
    const { error: keyErr } = await supabase.from('session_key_stats').insert(keyRows);
    if (keyErr) console.error('[test_sessions] key stats insert failed:', keyErr.message);
  }

  // Return expected response format
  res.status(201).json({
    session_id: data.id,
    gross_wpm: data.gross_wpm,
    net_wpm: data.net_wpm,
    accuracy: data.accuracy
  });
});

// GET /test_sessions/:id - Get detailed results for a session
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('test_sessions')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Session not found' });
  
  res.json(data);
});

export default router;
