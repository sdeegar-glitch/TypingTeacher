import express from 'express';
import { supabase } from '../supabaseClient.js';
import { fetchAndGenerateTests, postDailyLeaderboard } from '../cronService.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { logActivity } from '../activityLog.js';
import { postTestToTelegram, postPollToTelegram } from '../services/telegram.js';

const router = express.Router();

// GET /api/tests/featured
router.get('/featured', async (req, res) => {
  const { data, error } = await supabase
    .from('typing_test')
    .select('id, title, slug, excerpt, difficulty_level, word_count, estimated_read_time, category, featured_image, views')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/tests/latest?language=&keyboard_layout=
router.get('/latest', async (req, res) => {
  const { language, keyboard_layout } = req.query;
  let query = supabase
    .from('typing_test')
    .select('id, title, slug, excerpt, difficulty_level, word_count, estimated_read_time, category, featured_image, views, created_at, language, keyboard_layout')
    .eq('is_published', true);

  if (language) query = query.eq('language', language);
  if (keyboard_layout) query = query.eq('keyboard_layout', keyboard_layout);

  const { data, error } = await query.order('created_at', { ascending: false }).limit(100);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/tests/search?q=
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  
  const { data, error } = await supabase
    .from('typing_test')
    .select('id, title, slug, excerpt, difficulty_level, word_count, category, views')
    .textSearch('search_vector', `'${q}'`)
    .eq('is_published', true);
    
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/tests/difficulty/:level
router.get('/difficulty/:level', async (req, res) => {
  const { level } = req.params;
  const { data, error } = await supabase
    .from('typing_test')
    .select('id, title, slug, excerpt, difficulty_level, word_count, estimated_read_time, category, views')
    .eq('difficulty_level', level.toLowerCase())
    .eq('is_published', true)
    .order('created_at', { ascending: false });
    
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/tests/category/:category?language=&keyboard_layout=
router.get('/category/:category', async (req, res) => {
  const { category } = req.params;
  const { language, keyboard_layout } = req.query;
  let query = supabase
    .from('typing_test')
    .select('id, title, slug, excerpt, difficulty_level, word_count, estimated_read_time, category, views, language, keyboard_layout')
    .ilike('category', category)
    .eq('is_published', true);

  if (language) query = query.eq('language', language);
  if (keyboard_layout) query = query.eq('keyboard_layout', keyboard_layout);

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/tests/:slug
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;
  const { data, error } = await supabase
    .from('typing_test')
    .select('*')
    .eq('slug', slug)
    .single();
    
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Test not found' });
  
  // Increment view count in background
  supabase.rpc('increment_view_count', { row_id: data.id }).then();
  
  res.json(data);
});

// GET /api/tests - List available tests with pagination & filters
router.get('/', async (req, res) => {
  const { page = 1, limit = 10, difficulty, category, sort = 'newest', language, keyboard_layout } = req.query;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('typing_test')
    .select('id, title, slug, excerpt, difficulty_level, word_count, estimated_read_time, category, views, created_at, language, keyboard_layout', { count: 'exact' })
    .eq('is_published', true);

  if (difficulty) query = query.eq('difficulty_level', difficulty);
  if (category) query = query.ilike('category', category);
  if (language) query = query.eq('language', language);
  if (keyboard_layout) query = query.eq('keyboard_layout', keyboard_layout);

  if (sort === 'popular') query = query.order('views', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const { data, error, count } = await query.range(offset, offset + limit - 1);
    
  if (error) return res.status(500).json({ error: error.message });
  res.json({
    data,
    meta: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(count / limit)
    }
  });
});

// POST /api/tests/generate - Trigger AI generation manually
// Body (optional): { slot: 'en' | 'hi_mangal' | 'hi_kruti', count: number }
// Omit body to run the full daily 12-test batch.
router.post('/generate', requireAdmin, async (req, res) => {
  try {
    const { slot, count } = req.body || {};
    const options = slot ? { slot, count } : {};
    // Non-blocking background generation
    fetchAndGenerateTests(options).catch(err => console.error("Manual generation failed:", err));
    logActivity({ action: 'ai_generation_triggered', entity: 'typing_test', actor_email: req.adminUser.email, ip: req.ip, meta: { slot: slot || 'full_batch', count: count || null } });
    res.status(202).json({ message: slot ? `Generating slot "${slot}" in the background.` : 'Full daily batch (12 tests) started in the background.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tests/telegram-test - Verify the Telegram bot is wired up correctly.
// Posts a sample "new test" message to the configured group/channel so you can
// confirm TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID + admin rights are all correct.
router.post('/telegram-test', requireAdmin, async (req, res) => {
  try {
    const result = await postTestToTelegram({
      slug: 'wpm-typing-speed-test',
      title: 'Sample Test — Telegram bot is working! ✅',
      category: 'Setup',
      difficulty: 'easy',
      wordCount: 300,
      language: 'en',
    });
    if (result?.skipped) {
      return res.status(400).json({
        error: 'Telegram not configured',
        detail: result.skipped === 'not-configured'
          ? 'Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in the backend environment.'
          : result.skipped,
      });
    }
    if (!result?.ok) return res.status(502).json({ error: result?.error || 'Telegram post failed' });
    res.json({ message: 'Posted a test message to your Telegram group.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tests/leaderboard-post - Manually post the daily leaderboard now
// (also used to preview/verify it without waiting for the scheduled time).
router.post('/leaderboard-post', requireAdmin, async (req, res) => {
  try {
    const result = await postDailyLeaderboard();
    if (result?.skipped === 'no-data') return res.status(400).json({ error: 'No test sessions yesterday to rank yet.' });
    if (result?.skipped === 'not-configured') return res.status(400).json({ error: 'Telegram not configured (set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID).' });
    if (result?.error || result?.ok === false) return res.status(502).json({ error: result.error || 'Post failed' });
    res.json({ message: 'Daily leaderboard posted to Telegram.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tests/poll-post - Manually post an engagement poll now.
router.post('/poll-post', requireAdmin, async (req, res) => {
  try {
    const result = await postPollToTelegram();
    if (result?.skipped === 'not-configured') return res.status(400).json({ error: 'Telegram not configured (set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID).' });
    if (!result?.ok) return res.status(502).json({ error: result?.error || 'Poll post failed' });
    res.json({ message: 'Poll posted to Telegram.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tests - Save a newly generated test
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, slug, content, excerpt, difficulty_level, word_count, estimated_read_time, category, seo_title, seo_description, tags, keywords, typing_duration_options } = req.body;

    const { data, error } = await supabase
      .from('typing_test')
      .insert({
        title, slug, content, excerpt, difficulty_level, word_count, estimated_read_time, category, seo_title, seo_description, tags, keywords, typing_duration_options,
        is_published: true
      })
      .select();

    if (error) return res.status(500).json({ error: error.message });
    logActivity({ action: 'test_created', entity: 'typing_test', actor_email: req.adminUser.email, ip: req.ip, meta: { title: data[0]?.title } });
    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
