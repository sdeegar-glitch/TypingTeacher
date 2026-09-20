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
  const user_id = req.userId;

  if (
    typeof duration !== 'number' || typeof gross_wpm !== 'number' || typeof net_wpm !== 'number' ||
    duration <= 0 || duration > 3600 ||
    gross_wpm < 0 || gross_wpm > 400 || net_wpm < 0 || net_wpm > 400 ||
    (accuracy !== undefined && (typeof accuracy !== 'number' || accuracy < 0 || accuracy > 100))
  ) {
    return res.status(400).json({ error: 'Missing or implausible metrics' });
  }

  const { data, error } = await supabase
    .from('test_sessions')
    .insert([{ 
      user_id: user_id || null, // Allow anonymous submissions for now
      test_id: test_id || null, 
      duration, 
      gross_wpm, 
      net_wpm, 
      errors, 
      accuracy 
    }])
    .select()
    .single();
    
  if (error) return res.status(500).json({ error: error.message });

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
