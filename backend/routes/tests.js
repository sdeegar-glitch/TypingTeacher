import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

// GET /tests - List available tests
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('tests')
    .select('id, title, exam_type_id, duration, difficulty');
    
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /tests/:id - Get test details
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('tests')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Test not found' });
  
  res.json(data);
});

// POST /tests - Create a test (Admin only in real app)
router.post('/', async (req, res) => {
  const { title, content, duration, difficulty, exam_type_id } = req.body;
  
  if (!title || !content || !duration) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { data, error } = await supabase
    .from('tests')
    .insert([{ title, content, duration, difficulty, exam_type_id }])
    .select()
    .single();
    
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

export default router;
