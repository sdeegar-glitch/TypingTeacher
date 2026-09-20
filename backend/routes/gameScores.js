/**
 * Game scores
 * POST /api/game-scores              - save a finished game (anonymous or logged in)
 * GET  /api/game-scores/leaderboard  - top scores for one game (?game=word-rain)
 */
import express from 'express';
import rateLimit from 'express-rate-limit';
import { supabase } from '../supabaseClient.js';
import { requireBrowserOrigin } from '../middleware/requireBrowserOrigin.js';
import { optionalUser } from '../middleware/optionalUser.js';

const router = express.Router();

const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests.' },
});

const GAME_RE = /^[a-z0-9-]{1,40}$/;

router.post('/', requireBrowserOrigin, submitLimiter, optionalUser, async (req, res) => {
  const { game, score, wpm, accuracy, duration } = req.body;

  if (
    typeof game !== 'string' || !GAME_RE.test(game) ||
    !Number.isInteger(score) || score < 0 || score > 10_000_000 ||
    (wpm !== undefined && (!Number.isInteger(wpm) || wpm < 0 || wpm > 400)) ||
    (accuracy !== undefined && (typeof accuracy !== 'number' || accuracy < 0 || accuracy > 100)) ||
    (duration !== undefined && (!Number.isInteger(duration) || duration < 0 || duration > 3600))
  ) {
    return res.status(400).json({ error: 'Invalid game score.' });
  }

  const { data, error } = await supabase
    .from('game_scores')
    .insert({ user_id: req.userId, game, score, wpm: wpm ?? null, accuracy: accuracy ?? null, duration: duration ?? null })
    .select('id')
    .single();

  if (error) {
    console.error('[game-scores] insert failed:', error.message);
    return res.status(500).json({ error: 'Could not save score.' });
  }
  res.status(201).json({ id: data.id });
});

router.get('/leaderboard', async (req, res) => {
  const game = String(req.query.game || '');
  if (!GAME_RE.test(game)) return res.status(400).json({ error: 'game is required.' });

  const { data, error } = await supabase
    .from('game_scores')
    .select('score, wpm, accuracy, created_at, user_id')
    .eq('game', game)
    .order('score', { ascending: false })
    .limit(10);
  if (error) return res.status(500).json({ error: 'Could not load leaderboard.' });

  const ids = [...new Set((data || []).map(r => r.user_id).filter(Boolean))];
  const names = {};
  if (ids.length) {
    const { data: users } = await supabase.from('users').select('id, name').in('id', ids);
    for (const u of users || []) names[u.id] = u.name;
  }

  res.json((data || []).map((r, i) => ({
    rank: i + 1,
    user: (r.user_id && names[r.user_id]) || 'Anonymous',
    score: r.score,
    wpm: r.wpm,
    accuracy: r.accuracy,
    date: r.created_at.split('T')[0],
  })));
});

export default router;
