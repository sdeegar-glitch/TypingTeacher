import express from 'express';
import rateLimit from 'express-rate-limit';
import { supabase } from '../supabaseClient.js';
import { requireBrowserOrigin } from '../middleware/requireBrowserOrigin.js';

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
router.post('/', requireBrowserOrigin, submitLimiter, async (req, res) => {
  const { user_id, test_id, duration, gross_wpm, net_wpm, errors, accuracy } = req.body;

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
