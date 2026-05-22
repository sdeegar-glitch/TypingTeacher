import express from 'express';
import { supabase } from '../supabaseClient.js';
import { fetchAndGenerateTests } from '../cronService.js';

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

// GET /api/tests/latest
router.get('/latest', async (req, res) => {
  const { data, error } = await supabase
    .from('typing_test')
    .select('id, title, slug, excerpt, difficulty_level, word_count, estimated_read_time, category, featured_image, views, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(10);
    
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

// GET /api/tests/category/:category
router.get('/category/:category', async (req, res) => {
  const { category } = req.params;
  const { data, error } = await supabase
    .from('typing_test')
    .select('id, title, slug, excerpt, difficulty_level, word_count, estimated_read_time, category, views')
    .ilike('category', category)
    .eq('is_published', true)
    .order('created_at', { ascending: false });
    
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
  const { page = 1, limit = 10, difficulty, category, sort = 'newest' } = req.query;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('typing_test')
    .select('id, title, slug, excerpt, difficulty_level, word_count, estimated_read_time, category, views, created_at', { count: 'exact' })
    .eq('is_published', true);

  if (difficulty) query = query.eq('difficulty_level', difficulty);
  if (category) query = query.ilike('category', category);

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
router.post('/generate', async (req, res) => {
  // Normally protected by admin middleware
  try {
    // Non-blocking background generation
    fetchAndGenerateTests().catch(err => console.error("Manual generation failed:", err));
    res.status(202).json({ message: 'AI Content Generation started in the background.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
