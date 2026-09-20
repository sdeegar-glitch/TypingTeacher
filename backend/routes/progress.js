/**
 * Per-user learning progress (all routes require a logged-in user)
 * GET /api/progress/lessons?course=unicode|kruti  - saved lesson results
 * PUT /api/progress/lessons                       - record a lesson attempt (keeps best)
 * GET /api/progress/heatmap                       - all-time per-key hits/errors/speed
 */
import express from 'express';
import rateLimit from 'express-rate-limit';
import { supabase } from '../supabaseClient.js';
import { requireUser } from '../middleware/requireUser.js';

const router = express.Router();

const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests.' },
});

const COURSES = ['unicode', 'kruti'];

router.get('/lessons', requireUser, async (req, res) => {
  const course = String(req.query.course || '');
  if (!COURSES.includes(course)) return res.status(400).json({ error: 'course must be unicode or kruti.' });

  const { data, error } = await supabase
    .from('lesson_progress')
    .select('lesson_id, stars, best_wpm, best_accuracy, attempts, completed_at')
    .eq('user_id', req.authUser.id)
    .eq('course', course)
    .order('lesson_id');
  if (error) return res.status(500).json({ error: 'Could not load progress.' });
  res.json(data);
});

router.put('/lessons', requireUser, writeLimiter, async (req, res) => {
  const { course, lesson_id, stars, wpm, accuracy, passed } = req.body;
  if (
    !COURSES.includes(course) ||
    !Number.isInteger(lesson_id) || lesson_id < 1 || lesson_id > 1000 ||
    !Number.isInteger(stars) || stars < 0 || stars > 5 ||
    !Number.isInteger(wpm) || wpm < 0 || wpm > 400 ||
    typeof accuracy !== 'number' || accuracy < 0 || accuracy > 100
  ) {
    return res.status(400).json({ error: 'Invalid lesson result.' });
  }

  const userId = req.authUser.id;
  const { data: prev } = await supabase
    .from('lesson_progress')
    .select('stars, best_wpm, best_accuracy, attempts, completed_at')
    .eq('user_id', userId).eq('course', course).eq('lesson_id', lesson_id)
    .maybeSingle();

  const row = {
    user_id: userId,
    course,
    lesson_id,
    stars: Math.max(prev?.stars ?? 0, stars),
    best_wpm: Math.max(prev?.best_wpm ?? 0, wpm),
    best_accuracy: Math.max(prev?.best_accuracy ?? 0, accuracy),
    attempts: (prev?.attempts ?? 0) + 1,
    completed_at: prev?.completed_at ?? (passed ? new Date().toISOString() : null),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('lesson_progress').upsert(row, { onConflict: 'user_id,course,lesson_id' });
  if (error) {
    console.error('[progress] upsert failed:', error.message);
    return res.status(500).json({ error: 'Could not save progress.' });
  }
  res.json(row);
});

router.get('/heatmap', requireUser, async (req, res) => {
  const { data, error } = await supabase
    .from('user_key_heatmap')
    .select('key, hits, errors, avg_ms')
    .eq('user_id', req.authUser.id);
  if (error) return res.status(500).json({ error: 'Could not load heatmap.' });
  res.json(data);
});

export default router;
